import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingNav } from '../components/FloatingNav';
import type { Route } from '../navigation';
import { RoundButton } from '../components/RoundButton';
import { steps, type Step } from '../data/steps';
import { colors, fonts, gradients, radius } from '../theme';

const STEP_MS = 1700;

function StepCard({
  step,
  index,
  active,
  wide,
  onPress,
}: {
  step: Step;
  index: number;
  active: boolean;
  wide: boolean;
  onPress(): void;
}) {
  const lift = useRef(new Animated.Value(active ? 1 : 0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(lift, { toValue: active ? 1 : 0, friction: 7, tension: 80, useNativeDriver: true }).start();
  }, [active, lift]);

  // Each 3D icon bobs gently, out of phase with its neighbours.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1800, delay: index * 220, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob, index]);

  return (
    <Animated.View
      style={[
        wide ? styles.cardWrapWide : styles.cardWrap,
        {
          transform: [
            { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) },
            { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`Step ${index + 1}, ${step.title}. ${step.body}`}
        onPress={onPress}
        style={[styles.card, wide && styles.cardWide, active ? styles.cardOn : styles.cardOff]}
      >
        <View style={[styles.disc, wide && styles.discWide, active ? styles.discOn : styles.discOff]}>
          <Animated.Image
            source={step.image}
            resizeMode="contain"
            style={[
              wide ? styles.iconWide : styles.icon,
              {
                transform: [
                  { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [3, -5] }) },
                  { rotate: bob.interpolate({ inputRange: [0, 1], outputRange: ['-3deg', '3deg'] }) },
                ],
              },
            ]}
          />
        </View>
        <View style={wide ? styles.textWide : styles.text}>
          <Text style={[styles.num, { color: active ? colors.limeLabel : colors.lime }]}>0{index + 1}</Text>
          <Text style={[styles.title, { color: active ? colors.black : colors.white }]}>{step.title}</Text>
          <Text style={[styles.body, { color: active ? colors.textOnLime : colors.lavender }]}>{step.body}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function HowItWorksScreen({ onNavigate }: { onNavigate(route: Route): void }) {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % steps.length), STEP_MS);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <LinearGradient colors={gradients.intro} locations={[0, 0.3, 0.7, 1]} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.eyebrow}>How it works</Text>
          <RoundButton
            icon={paused ? 'play' : 'pause'}
            label={paused ? 'Play animation' : 'Pause animation'}
            onPress={() => setPaused((p) => !p)}
          />
        </View>
        <Text style={styles.heading} accessibilityRole="header">
          From intention{'\n'}to action
        </Text>
        <Text style={styles.sub}>Five steps, and nothing runs until you say yes.</Text>

        <View style={styles.grid}>
          {steps.map((step, i) => (
            <StepCard
              key={step.title}
              step={step}
              index={i}
              active={i === active}
              wide={i === steps.length - 1 && steps.length % 2 === 1}
              onPress={() => {
                setActive(i);
                setPaused(true);
              }}
            />
          ))}
        </View>
      </ScrollView>
      <FloatingNav current="how" onNavigate={onNavigate} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  eyebrow: {
    overflow: 'hidden',
    backgroundColor: colors.lime,
    color: colors.black,
    fontFamily: fonts.bold,
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  heading: {
    marginTop: 14,
    paddingHorizontal: 4,
    fontFamily: fonts.extrabold,
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -1.3,
    color: colors.white,
  },
  sub: { marginTop: 14, paddingHorizontal: 4, fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.lavender },
  grid: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  cardWrap: { width: '48.4%' },
  cardWrapWide: { width: '100%' },
  card: {
    minHeight: 172,
    borderRadius: radius.step,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 2,
    borderWidth: 1,
  },
  cardWide: { minHeight: 128, flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 12, paddingRight: 18 },
  cardOn: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
    shadowColor: '#080418',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  cardOff: { backgroundColor: colors.glassSoft, borderColor: colors.glassBorder },
  disc: {
    alignSelf: 'center',
    width: 78,
    height: 78,
    borderRadius: 39,
    marginBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discWide: { width: 104, height: 104, borderRadius: 52, marginBottom: 0 },
  text: { gap: 2 },
  textWide: { flex: 1, gap: 2 },
  discOn: { backgroundColor: 'rgba(14,11,26,0.07)' },
  discOff: { backgroundColor: colors.glassSoft },
  icon: { width: 76, height: 76 },
  iconWide: { width: 100, height: 100 },
  num: { fontFamily: fonts.extrabold, fontSize: 12 },
  title: { fontFamily: fonts.extrabold, fontSize: 19, letterSpacing: -0.4 },
  body: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 17 },
});
