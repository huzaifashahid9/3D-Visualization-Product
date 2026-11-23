import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

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

interface ViewerApi {
  select(i: number): void;
  setExploded(on: boolean): void;
  setAutoRotate(on: boolean): void;
  zoom(factor: number): void;
  reset(): void;
}

/**
 * Web version of the 3D viewer (used by `npx expo start --web`). react-native-webview has no
 * browser support, so the same model-viewer page runs in an <iframe> instead.
 */
export const ModelViewer = forwardRef<ModelViewerHandle, Props>(function ModelViewer(
  { selected, exploded, autoRotate, onSelect, style },
  ref,
) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const html = useMemo(
    () => buildViewerHtml({ modelUri: MODEL_URL ?? HEADSET_MODEL_URI, modelViewerScript: MODEL_VIEWER_SCRIPT, parts }),
    [],
  );

  // The iframe uses srcdoc, so it shares this page's origin and its window.irada can be called directly.
  const api = () => (frame.current?.contentWindow as (Window & { irada?: ViewerApi }) | null)?.irada;

  useImperativeHandle(ref, () => ({
    zoomIn: () => api()?.zoom(0.8),
    zoomOut: () => api()?.zoom(1.25),
    reset: () => api()?.reset(),
  }));

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || typeof event.data?.irada !== 'string') return;
      const msg = JSON.parse(event.data.irada) as { type: string; index?: number; message?: string };
      if (msg.type === 'loaded') setLoaded(true);
      if (msg.type === 'select' && typeof msg.index === 'number') onSelectRef.current(msg.index);
      if (msg.type === 'error') setError(msg.message ?? 'Could not load the 3D model');
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (loaded) api()?.select(selected);
  }, [loaded, selected]);
  useEffect(() => {
    if (loaded) api()?.setExploded(exploded);
  }, [loaded, exploded]);
  useEffect(() => {
    if (loaded) api()?.setAutoRotate(autoRotate);
  }, [loaded, autoRotate]);

  return (
    <View style={[styles.root, style]}>
      <iframe
        ref={frame}
        srcDoc={html}
        title="3D model of the headset"
        style={{ border: 0, width: '100%', height: '100%', background: 'transparent', display: 'block' }}
        allow="xr-spatial-tracking"
      />
      {!loaded && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.poster]}>
          <Image source={images.viewerPoster} style={styles.posterImage} resizeMode="contain" />
          <Text style={styles.status}>{error ?? 'Loading 3D model…'}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: { overflow: 'hidden' },
  poster: { alignItems: 'center', justifyContent: 'center' },
  posterImage: { width: '100%', height: '100%' },
  status: { position: 'absolute', bottom: 64, color: colors.white, fontFamily: fonts.semibold, fontSize: 13 },
});
