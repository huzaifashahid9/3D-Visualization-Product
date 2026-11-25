import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type ComponentType, type Ref } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
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
  /** Turns the model so part `index` faces the camera. */
  focus(index: number): void;
}

/** How long to wait for the model before offering to try again. */
const LOAD_TIMEOUT_MS = 30000;
const LOAD_ERROR = 'The 3D model could not be shown.';

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
  // Changing the key reloads the WebView from scratch (Try again, or after the phone stopped it).
  const [attempt, setAttempt] = useState(0);
  const posterOpacity = useRef(new Animated.Value(1)).current;

  const reload = () => {
    setLoaded(false);
    setError(null);
    posterOpacity.setValue(1);
    setAttempt((n) => n + 1);
  };

  // If the model never reports that it loaded, say so instead of showing "Loading" forever.
  useEffect(() => {
    if (loaded || error) return;
    const t = setTimeout(() => setError(LOAD_ERROR), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [loaded, error, attempt]);

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
    focus: (i: number) => run(`window.irada.focus(${Number(i) | 0})`),
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
    // The poster comes back to show an error if the page stops after loading.
    if (error) posterOpacity.setValue(1);
  }, [loaded, error, posterOpacity]);

  const onMessage = (event: WebViewMessageEvent) => {
    let msg: { type: string; index?: number; message?: string };
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === 'loaded') setLoaded(true);
    if (msg.type === 'select' && typeof msg.index === 'number') onSelect(msg.index);
    // model-viewer reports codes such as "loadfailure"; show plain words instead.
    if (msg.type === 'error') setError(LOAD_ERROR);
  };

  return (
    <View style={[styles.root, style]}>
      <WebView
        key={attempt}
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
        // Stay on the viewer page: nothing inside it may open another page.
        onShouldStartLoadWithRequest={(req) => req.url === 'about:blank' || req.url.startsWith('data:') || !req.url.startsWith('http')}
        // The phone can stop a WebView to free memory; load it again rather than leave it blank.
        onContentProcessDidTerminate={reload}
        onRenderProcessGone={reload}
        androidLayerType="hardware"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
      {/* A still render of the same model covers the WebView until the 3D model is ready. */}
      <Animated.View
        pointerEvents={error ? 'box-none' : 'none'}
        style={[StyleSheet.absoluteFill, styles.poster, { opacity: posterOpacity }]}
      >
        <Image source={images.viewerPoster} style={styles.posterImage} resizeMode="contain" />
        {!loaded && !error && (
          <Text style={styles.status} accessibilityLiveRegion="polite">
            Loading 3D model…
          </Text>
        )}
        {error && (
          <View style={styles.errorBox} accessibilityLiveRegion="polite">
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={reload}
              style={({ pressed }) => [styles.retry, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}
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
  errorBox: { position: 'absolute', bottom: 56, alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  errorText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 13, textAlign: 'center' },
  retry: {
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { color: colors.black, fontFamily: fonts.bold, fontSize: 14 },
});
