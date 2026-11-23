import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { FloatingTag } from '../components/FloatingTag';
import { Icon } from '../components/Icon';
import { RoundButton } from '../components/RoundButton';
import type { Route } from '../navigation';
import { INTRO_VIDEO, PRODUCT_NAME, images } from '../config';
import { colors, fonts, gradients } from '../theme';

/** Fades and slides a block up into place, one after another. */
function useEntrance(count: number) {
  const values = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(
      110,
      values.map((v) =>
        Animated.timing(v, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ),
    ).start();
  }, [values]);
  return values.map((v) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
  }));
}

function IntroVideo({ source, muted }: { source: number; muted: boolean }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  useEffect(() => {
    player.muted = muted;
  }, [player, muted]);
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

export function IntroScreen({ onNavigate }: { onNavigate(route: Route): void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [muted, setMuted] = useState(true);
  const [heroLayout, setHeroLayout] = useState({ width: 0, height: 0 });
  const entrance = useEntrance(5);

  // Hero product: grows in, then floats and sways gently.
  const appear = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(appear, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [appear, float]);

  const heroSize = Math.min(width + 10, 460);
  const glowSize = heroSize * 0.82;

  return (
    <LinearGradient colors={gradients.intro} locations={gradients.introStops} style={styles.root}>
      {INTRO_VIDEO != null && <IntroVideo source={INTRO_VIDEO} muted={muted} />}

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Icon name="logo" size={22} color={colors.black} strokeWidth={2.4} />
          </View>
          <Text style={styles.brandText}>{PRODUCT_NAME}</Text>
        </View>
        {INTRO_VIDEO != null && (
          <RoundButton
            icon={muted ? 'soundOff' : 'soundOn'}
            label={muted ? 'Turn sound on' : 'Turn sound off'}
            size={44}
            onPress={() => setMuted((m) => !m)}
          />
        )}
      </View>

      <View style={styles.hero} onLayout={(e) => setHeroLayout(e.nativeEvent.layout)}>
        {INTRO_VIDEO == null && (
          <>
            <Svg width={glowSize} height={glowSize} style={styles.glow}>
              <Defs>
                <RadialGradient id="glow" cx="50%" cy="45%" r="50%">
                  <Stop offset="0" stopColor="#B9A6FF" stopOpacity={0.55} />
                  <Stop offset="0.6" stopColor="#7B5CFF" stopOpacity={0.22} />
                  <Stop offset="1" stopColor="#5B3DF5" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={glowSize / 2} cy={glowSize / 2} r={glowSize / 2} fill="url(#glow)" />
            </Svg>
            <Animated.Image
              source={images.hero}
              accessibilityLabel="The IRADA headset: a white band with an ear-to-ear arc of motor sensors, ear clips and a cancel button"
              resizeMode="contain"
              style={{
                width: heroSize,
                height: heroSize * (720 / 760),
                opacity: appear,
                transform: [
                  { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [6, -10] }) },
                  { rotate: float.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] }) },
                  { scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
                ],
              }}
            />
            {heroLayout.height > 0 && (
              <>
                <FloatingTag label="Non-invasive" rotate="-8deg" style={{ left: 22, top: heroLayout.height * 0.18 }} />
                <FloatingTag
                  label="You confirm every action"
                  tone="white"
                  rotate="5deg"
                  delay={400}
                  style={{ right: 18, top: heroLayout.height * 0.8 }}
                />
              </>
            )}
          </>
        )}
      </View>

      <View style={[styles.copy, { paddingBottom: insets.bottom + 14 }]}>
        <Animated.Text style={[styles.eyebrow, entrance[0]]}>Irada · ارادہ · means intention</Animated.Text>
        <Animated.Text style={[styles.title, entrance[1]]} accessibilityRole="header">
          Turn intention{'\n'}into action.
        </Animated.Text>
        <Animated.Text style={[styles.body, entrance[2]]}>
          A brain-signal headset and phone app that lets people living with paralysis call family, send a message or
          ask for help, using commands they have practised.
        </Animated.Text>
        <Animated.View style={[styles.actions, entrance[3]]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigate('viewer')}
            style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
          >
            <Text style={[styles.buttonText, { color: colors.black }]}>Explore in 3D</Text>
            <Icon name="arrow" size={18} color={colors.black} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigate('how')}
            style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.pressed]}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>How it works</Text>
          </Pressable>
        </Animated.View>
        <Animated.View style={[styles.footerRow, entrance[4]]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onNavigate('welcome')}
            hitSlop={8}
            style={({ pressed }) => [styles.tryLink, pressed && { opacity: 0.7 }]}
          >
            <Icon name="tablet" size={18} color={colors.lavender} />
            <Text style={styles.tryText}>Try the app</Text>
          </Pressable>
          <Text style={styles.disclaimer}>Assistive prototype, not a medical device</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    zIndex: 2,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontFamily: fonts.extrabold, fontSize: 20, letterSpacing: -0.4, color: colors.white },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute' },
  copy: { paddingHorizontal: 24, gap: 12 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.lime },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: -1.4,
    color: colors.white,
  },
  body: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, color: colors.lavender },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tryLink: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tryText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.lavender },
  disclaimer: { flexShrink: 1, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 11, color: colors.muted },
  button: {
    flex: 1,
    height: 58,
    borderRadius: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: { backgroundColor: colors.lime },
  secondary: { backgroundColor: colors.black },
  buttonText: { fontFamily: fonts.bold, fontSize: 16 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
