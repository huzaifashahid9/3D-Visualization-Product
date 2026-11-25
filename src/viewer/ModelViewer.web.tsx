import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

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
  focus(index: number): void;
}

const LOAD_TIMEOUT_MS = 30000;
const LOAD_ERROR = 'The 3D model could not be shown.';

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
  focus(i: number): void;
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
  const [attempt, setAttempt] = useState(0);
  const reload = () => {
    setLoaded(false);
    setError(null);
    setAttempt((n) => n + 1);
  };
  useEffect(() => {
    if (loaded || error) return;
    const t = setTimeout(() => setError(LOAD_ERROR), LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [loaded, error, attempt]);
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
    focus: (i: number) => api()?.focus(i),
  }));

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || typeof event.data?.irada !== 'string') return;
      let msg: { type: string; index?: number; message?: string };
      try {
        msg = JSON.parse(event.data.irada);
      } catch {
        return;
      }
      if (msg.type === 'loaded') setLoaded(true);
      if (msg.type === 'select' && typeof msg.index === 'number') onSelectRef.current(msg.index);
      if (msg.type === 'error') setError(LOAD_ERROR);
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
        key={attempt}
        ref={frame}
        srcDoc={html}
        title="3D model of the headset"
        style={{ border: 0, width: '100%', height: '100%', background: 'transparent', display: 'block' }}
        allow="xr-spatial-tracking"
      />
      {(!loaded || error) && (
        <View pointerEvents={error ? 'box-none' : 'none'} style={[StyleSheet.absoluteFill, styles.poster]}>
          <Image source={images.viewerPoster} style={styles.posterImage} resizeMode="contain" />
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={reload} style={styles.retry}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.status}>Loading 3D model…</Text>
          )}
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
