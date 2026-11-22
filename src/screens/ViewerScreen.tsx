import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingNav, type Route } from '../components/FloatingNav';
import { Icon } from '../components/Icon';
import { RoundButton } from '../components/RoundButton';
import { parts } from '../data/parts';
import { colors, fonts, gradients, radius } from '../theme';
import { ModelViewer, type ModelViewerHandle } from '../viewer/ModelViewer';

export function ViewerScreen({ onNavigate }: { onNavigate(route: Route): void }) {
  const insets = useSafeAreaInsets();
  const viewer = useRef<ModelViewerHandle>(null);
  const [selected, setSelected] = useState(0);
  const [exploded, setExploded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const part = parts[selected];

  return (
    <LinearGradient colors={gradients.viewer} locations={gradients.viewerStops} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <RoundButton icon="back" label="Back to intro" onPress={() => onNavigate('intro')} />
        <View style={styles.segment} accessibilityRole="tablist">
          {(['3D view', 'Exploded'] as const).map((label, i) => {
            const on = (i === 1) === exploded;
            return (
              <Pressable
                key={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setExploded(i === 1)}
                style={[styles.segmentItem, on && styles.segmentItemOn]}
              >
                <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <RoundButton
          icon="spin"
          label="Auto-spin"
          variant={autoRotate ? 'lime' : 'glass'}
          selected={autoRotate}
          onPress={() => setAutoRotate((v) => !v)}
        />
      </View>

      <LinearGradient
        colors={gradients.stage}
        locations={[0, 0.55, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.stage}
      >
        <ModelViewer
          ref={viewer}
          selected={selected}
          exploded={exploded}
          autoRotate={autoRotate}
          onSelect={setSelected}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.dragTag}>
          <Text style={styles.dragTagText}>Drag to rotate</Text>
        </View>
        <View pointerEvents="none" style={styles.degrees}>
          <Icon name="rotate" size={16} />
          <Text style={styles.degreesText}>360°</Text>
        </View>
        <View style={styles.zoom}>
          <RoundButton icon="minus" label="Zoom out" variant="white" size={44} onPress={() => viewer.current?.zoomOut()} />
          <RoundButton icon="plus" label="Zoom in" variant="white" size={44} onPress={() => viewer.current?.zoomIn()} />
        </View>
      </LinearGradient>

      <View style={[styles.card, { marginBottom: Math.max(insets.bottom, 12) + 92 }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipScroller}
        >
          {parts.map((p, i) => {
            const on = i === selected;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => setSelected(i)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{p.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.titleRow}>
          <Text style={styles.partNum}>0{selected + 1}</Text>
          <Text style={styles.partTitle}>{part.title}</Text>
        </View>
        <Text style={styles.partBody}>{part.body}</Text>
        <View style={styles.specs}>
          {part.specs.map((s) => (
            <View key={s.label} style={styles.spec}>
              <Text style={styles.specLabel}>{s.label}</Text>
              <Text style={styles.specValue}>{s.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <FloatingNav current="viewer" onNavigate={onNavigate} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segment: { flexDirection: 'row', padding: 4, gap: 4, borderRadius: radius.pill, backgroundColor: colors.glass },
  segmentItem: { height: 44, paddingHorizontal: 18, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  segmentItemOn: { backgroundColor: colors.white },
  segmentText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  segmentTextOn: { color: colors.black },
  stage: { flex: 1, marginHorizontal: 16, borderRadius: radius.card, overflow: 'hidden', minHeight: 260 },
  dragTag: {
    position: 'absolute',
    left: 16,
    top: 18,
    backgroundColor: colors.lime,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    transform: [{ rotate: '-6deg' }],
  },
  dragTagText: { fontFamily: fonts.bold, fontSize: 12, color: colors.black },
  degrees: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(14,11,26,0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  degreesText: { fontFamily: fonts.bold, fontSize: 12, color: colors.white },
  zoom: { position: 'absolute', right: 12, bottom: 10, flexDirection: 'row', gap: 8 },
  card: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 10,
  },
  chipScroller: { marginHorizontal: -18, flexGrow: 0 },
  chips: { paddingHorizontal: 18, gap: 6 },
  chip: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.black },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: '#3B3654' },
  chipTextOn: { color: colors.white },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 4 },
  partNum: { fontFamily: fonts.extrabold, fontSize: 13, color: colors.accentOnWhite },
  partTitle: { fontFamily: fonts.extrabold, fontSize: 26, letterSpacing: -0.8, color: colors.black },
  partBody: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.textOnWhite },
  specs: { flexDirection: 'row', gap: 8, marginTop: 2 },
  spec: { flex: 1, backgroundColor: colors.cardMuted, borderRadius: 16, paddingVertical: 9, paddingHorizontal: 14 },
  specLabel: { fontFamily: fonts.semibold, fontSize: 11, color: colors.labelOnWhite },
  specValue: { fontFamily: fonts.bold, fontSize: 14, color: colors.black },
});
