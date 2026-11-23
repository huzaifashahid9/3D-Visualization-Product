import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type ComponentType, type Ref } from 'react';
import { Animated, Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView as RNWebView, type WebViewMessageEvent, type WebViewProps } from 'react-native-webview';

// react-native-webview's class type resolves its props to `never` under strict TypeScript,
// so re-type it with the props and the one ref method this file uses.
type WebViewHandle = { injectJavaScript(script: string): void };
const WebView = RNWebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

import { MODEL_URL, images } from '../config';
import { parts } from '../data/parts';
import { colors, fonts } from '../theme';
import { buildViewerHtml } from './buildViewerHtml';
import { HEADSET_MODEL_URI } from './generated/headsetModel';
import { MODEL_VIEWER_SCRIPT } from './generated/modelViewerLib';

export interface ModelViewerHandle {
  zoomIn(): void;
  zoomOut(): void;
  reset(): void;
}

interface Props {
  selected: number;
  exploded: boolean;
  autoRotate: boolean;
  onSelect(index: number): void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Interactive 3D model: drag to rotate, pinch to zoom, tap hotspots.
 * Rendered by <model-viewer> inside a WebView, which runs in Expo Go with no native build.
 */
export const ModelViewer = forwardRef<ModelViewerHandle, Props>(function ModelViewer(
  { selected, exploded, autoRotate, onSelect, style },
  ref,
) {
  const webview = useRef<WebViewHandle>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const posterOpacity = useRef(new Animated.Value(1)).current;

  const html = useMemo(
    () =>
      buildViewerHtml({
        modelUri: MODEL_URL ?? HEADSET_MODEL_URI,
        modelViewerScript: MODEL_VIEWER_SCRIPT,
        parts,
      }),
    [],
  );

  const run = (js: string) => webview.current?.injectJavaScript(`window.irada && (${js}); true;`);

  useImperativeHandle(ref, () => ({
    zoomIn: () => run('window.irada.zoom(0.8)'),
    zoomOut: () => run('window.irada.zoom(1.25)'),
    reset: () => run('window.irada.reset()'),
  }));

  // Keep the page in sync with the app's state once the model is ready.
  useEffect(() => {
    if (loaded) run(`window.irada.select(${selected})`);
  }, [loaded, selected]);
  useEffect(() => {
    if (loaded) run(`window.irada.setExploded(${exploded})`);
  }, [loaded, exploded]);
  useEffect(() => {
    if (loaded) run(`window.irada.setAutoRotate(${autoRotate})`);
  }, [loaded, autoRotate]);

  useEffect(() => {
    if (loaded) {
      Animated.timing(posterOpacity, { toValue: 0, duration: 450, useNativeDriver: true }).start();
    }
  }, [loaded, posterOpacity]);

  const onMessage = (event: WebViewMessageEvent) => {
    let msg: { type: string; index?: number; message?: string };
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === 'loaded') setLoaded(true);
    if (msg.type === 'select' && typeof msg.index === 'number') onSelect(msg.index);
    if (msg.type === 'error') setError(msg.message ?? 'Could not load the 3D model');
  };

  return (
    <View style={[styles.root, style]}>
      <WebView
        ref={webview}
        source={{ html, baseUrl: '' }}
        originWhitelist={['*']}
        onMessage={onMessage}
        style={styles.webview}
        containerStyle={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        setSupportMultipleWindows={false}
        allowFileAccess
        androidLayerType="hardware"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
      {/* A still render of the same model covers the WebView until the 3D model is ready. */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.poster, { opacity: posterOpacity }]}>
        <Image source={images.viewerPoster} style={styles.posterImage} resizeMode="contain" />
        {!loaded && !error && <Text style={styles.status}>Loading 3D model…</Text>}
        {error && <Text style={styles.status}>{error}</Text>}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: { overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  poster: { alignItems: 'center', justifyContent: 'center' },
  posterImage: { width: '100%', height: '100%' },
  status: {
    position: 'absolute',
    bottom: 64,
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
});
