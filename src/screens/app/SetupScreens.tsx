import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

import { Brand } from '../../components/Brand';
import { Icon } from '../../components/Icon';
import {
  Avatar,
  BigButton,
  Body,
  Disc,
  Disclaimer,
  Dot,
  GlassCard,
  Heading,
  InfoCard,
  Pill,
  Screen,
  SuccessMark,
  TextLink,
  TopBar,
  WhiteCard,
  ui,
} from '../../components/ui';
import { images } from '../../config';
import { commands, contactColor, contactLabel, currentChannels, people, type Channel } from '../../demo/data';
import { useDemo } from '../../demo/DemoContext';
import { useOnBackground } from '../../demo/hooks';
import type { ScreenProps } from '../../navigation';
import { colors, fonts, gradients, radius } from '../../theme';

/* ---------- A1 · Welcome and profile (document 12.3 #1, 12.6) ---------- */

function Toggle({ on, onPress, label }: { on: boolean; onPress(): void; label: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: on }}
      onPress={onPress}
      hitSlop={8}
      style={[styles.toggle, { backgroundColor: on ? colors.lime : 'rgba(255,255,255,0.2)' }]}
    >
      <View
        style={[
          styles.toggleKnob,
          on ? { right: 3, backgroundColor: colors.black } : { left: 3, backgroundColor: colors.white },
        ]}
      />
    </Pressable>
  );
}

export function WelcomeScreen({ onNavigate }: ScreenProps) {
  const demo = useDemo();
  const { personIndex: person, urdu, caregiverHere: caregiver } = demo;
  return (
    <Screen
      background="bright"
      bottomInset={96}
      header={
        <View style={styles.brandBar}>
          <Brand height={18} />
          <View style={styles.segment} accessibilityRole="tablist">
            {['English', 'اردو'].map((l, i) => {
              const on = (i === 1) === urdu;
              return (
                <Pressable
                  key={l}
                  accessibilityRole="tab"
                  accessibilityLabel={i === 1 ? 'Urdu' : 'English'}
                  accessibilityState={{ selected: on }}
                  onPress={() => demo.setUrdu(i === 1)}
                  style={[styles.segItem, on && { backgroundColor: colors.white }]}
                >
                  <Text
                    style={[styles.segText, { color: on ? colors.black : colors.white, fontSize: i === 1 ? 15 : 13 }]}
                  >
                    {l}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      }
    >
      {urdu && (
        <InfoCard
          icon="globe"
          title="اردو"
          text="Urdu screens come with the first release. This demo stays in English for now."
        />
      )}
      <Heading style={{ marginTop: 8 }}>{'Who is using\nIRADA today?'}</Heading>
      <Body>Pick a profile. Each person has their own trained model.</Body>
      <WhiteCard style={{ padding: 10, gap: 8 }}>
        {people.map((p, i) => {
          const on = i === person;
          return (
            <Pressable
              key={p.name}
              accessibilityRole="radio"
              accessibilityLabel={`${p.name}, ${p.sub}`}
              accessibilityState={{ checked: on }}
              onPress={() => demo.setPersonIndex(i)}
              style={[styles.person, { backgroundColor: on ? colors.lime : colors.cardMuted }]}
            >
              <Avatar initials={p.initials} on={on} />
              <View style={ui.flex}>
                <Text style={styles.personName}>{p.name}</Text>
                <Text style={[styles.personSub, { color: on ? colors.limeLabel : colors.labelOnWhite }]}>{p.sub}</Text>
              </View>
              {on && <Icon name="check" size={22} color={colors.black} strokeWidth={2.6} />}
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          onPress={() => demo.setToast('A new person is added with a caregiver, then calibrated. Not part of this demo.')}
          style={({ pressed }) => [styles.addPerson, pressed && { opacity: 0.6 }]}
        >
          <Icon name="plus" size={18} color={colors.violet} />
          <Text style={styles.addText}>Add a person</Text>
        </Pressable>
      </WhiteCard>
      <GlassCard style={styles.optionRow}>
        <Disc icon="user" bg={colors.glass} fg={colors.white} size={40} />
        <View style={ui.flex}>
          <Text style={styles.optionTitle}>A caregiver is here</Text>
          <Text style={styles.optionSub}>They can help set up and cancel at any time</Text>
        </View>
        <Toggle on={caregiver} onPress={() => demo.setCaregiverHere(!caregiver)} label="A caregiver is here" />
      </GlassCard>
      <GlassCard style={styles.optionRow}>
        <Disc icon="shield" bg={colors.glass} fg={colors.lime} size={40} />
        <View style={ui.flex}>
          <Text style={styles.optionTitle}>Your brain signals stay on this phone</Text>
          <Text style={styles.optionSub}>Raw EEG is never uploaded. You agree before anything is stored.</Text>
        </View>
      </GlassCard>
      <BigButton label="Continue" icon="check" onPress={() => onNavigate('headset')} />
      <View style={styles.links}>
        <TextLink label="Skip to the menu" onPress={() => onNavigate('home')} />
        <TextLink label="Caregiver view" onPress={() => onNavigate('caregiver')} />
        <TextLink label="Therapist view" onPress={() => onNavigate('clinician')} />
      </View>
      <Disclaimer />
    </Screen>
  );
}

/* ---------- A2 · Headset check (document 12.3 #2) ---------- */

function ChannelRow({ channel, first }: { channel: Channel; first: boolean }) {
  return (
    <View style={[styles.channel, !first && ui.divider]}>
      <View style={{ marginTop: 4 }}>
        <Dot color={contactColor[channel.state]} size={12} />
      </View>
      <View style={ui.flex}>
        <Text style={styles.channelName}>
          {channel.name} <Text style={styles.channelWhere}>· {channel.where}</Text>
        </Text>
        {channel.tip && channel.state !== 'good' ? <Text style={ui.cardText}>{channel.tip}</Text> : null}
      </View>
      <View style={[styles.statePill, { backgroundColor: contactColor[channel.state] + '33' }]}>
        <Text style={styles.stateText}>{contactLabel[channel.state]}</Text>
      </View>
    </View>
  );
}

export function HeadsetScreen({ onNavigate, onBack }: ScreenProps) {
  const { sensorsFixed, setSensorsFixed } = useDemo();
  const list = currentChannels(sensorsFixed);
  const [checking, setChecking] = useState(false);
  const problems = list.filter((c) => c.state !== 'good').length;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // "Check again" simulates the wearer fixing the contact: everything turns good.
  const checkAgain = () => {
    if (checking) return;
    setChecking(true);
    timer.current = setTimeout(() => {
      setSensorsFixed(true);
      setChecking(false);
    }, 1200);
  };

  return (
    <Screen
      header={<TopBar title="Headset check" onBack={onBack} />}
      footer={
        problems > 0 ? (
          <>
            <BigButton
              label={checking ? 'Checking…' : 'Check again'}
              tone="white"
              icon="refresh"
              onPress={checkAgain}
              disabled={checking}
            />
            {/* Calibrating with poor contact would train a poor model, so it waits for good contact. */}
            <BigButton
              label={`Fix ${problems} sensor${problems > 1 ? 's' : ''} to start calibration`}
              tone="glass"
              compact
              disabled
            />
          </>
        ) : (
          <BigButton label="Start calibration" icon="check" onPress={() => onNavigate('calibration')} />
        )
      }
    >
      <View style={styles.headsetHero}>
        <View style={styles.headsetGlow} />
        <Image
          source={images.hero}
          resizeMode="contain"
          style={styles.headsetImage}
          accessibilityLabel="The IRADA headset"
        />
        <View style={styles.headsetPills}>
          <Pill label="Connected" icon="bluetooth" />
          <Pill label="Battery [level]" tone="glass" />
        </View>
      </View>
      <WhiteCard style={{ paddingTop: 14, paddingBottom: 8 }}>
        <View style={[ui.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
          <Text style={ui.cardTitle}>Sensor contact</Text>
          <View style={[ui.row, { gap: 6 }]}>
            {(['good', 'weak', 'poor'] as const).map((k) => (
              <View key={k} style={[ui.row, { gap: 4 }]}>
                <Dot color={contactColor[k]} size={8} />
                <Text style={styles.legend}>{contactLabel[k]}</Text>
              </View>
            ))}
          </View>
        </View>
        {list.map((c, i) => (
          <ChannelRow key={c.name} channel={c} first={i === 0} />
        ))}
      </WhiteCard>
    </Screen>
  );
}

/* ---------- A3 · Calibration (document 12.3 #3, 5.1) ---------- */

const PHASES = [
  {
    label: 'Get ready',
    seconds: 3,
    instruction: 'Get ready to imagine squeezing your right hand',
    hint: 'Keep your eyes on the screen',
  },
  {
    label: 'Imagine now',
    seconds: 4,
    instruction: 'Imagine squeezing your right hand',
    hint: 'Do not actually move. Just imagine it.',
  },
  { label: 'Rest', seconds: 3, instruction: 'Relax and rest', hint: 'Blink and breathe if you need to' },
];
const TRIALS = 25;
const RING = 2 * Math.PI * 64;

export function CalibrationScreen({ onNavigate, onBack }: ScreenProps) {
  const { sensorsFixed } = useDemo();
  const [cal, setCal] = useState({ phase: 0, left: PHASES[0].seconds, trial: 21 });
  const [paused, setPaused] = useState(false);
  const { phase, left, trial } = cal;
  // Calibration needs the user's attention, so it pauses if they leave the app.
  useOnBackground(() => setPaused(true));

  // Count down each phase (ready, imagine, rest); after rest the next trial starts.
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setCal((c) => {
        if (c.left > 1) return { ...c, left: c.left - 1 };
        const next = (c.phase + 1) % PHASES.length;
        return { phase: next, left: PHASES[next].seconds, trial: next === 0 ? c.trial + 1 : c.trial };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [paused]);

  // The last trial of this command finishes calibration.
  const finished = trial > TRIALS;
  useEffect(() => {
    if (finished) onNavigate('calResult', { replace: true });
  }, [finished, onNavigate]);

  const p = PHASES[phase];
  const shown = left;
  const imagine = phase === 1;

  return (
    <Screen
      header={
        <TopBar title="Calibration" onBack={onBack} right={<Pill label="2 of 4" tone="glass" />} />
      }
      footer={
        <>
          <BigButton
            label={paused ? 'Resume' : 'Pause'}
            tone="black"
            icon={paused ? 'play' : 'pause'}
            onPress={() => setPaused((v) => !v)}
          />
          <TextLink label="Skip to the result" onPress={() => onNavigate('calResult', { replace: true })} />
        </>
      }
    >
      {!sensorsFixed && (
        <InfoCard
          icon="alert"
          iconColor={colors.weak}
          text="Two sensors had weak contact at the last check. Results may be less accurate."
        />
      )}
      <View style={[ui.row, { gap: 6 }]}>
        {commands.map((c, i) => {
          const done = i === 0;
          const now = i === 1;
          return (
            <View
              key={c}
              accessible
              accessibilityLabel={`${c}, ${done ? 'done' : now ? 'practising now' : 'next'}`}
              style={[
                styles.cmdChip,
                { backgroundColor: now ? colors.lime : done ? 'rgba(212,255,58,0.18)' : colors.glassSoft },
              ]}
            >
              {done && <Icon name="check" size={13} color={colors.lime} strokeWidth={3} />}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.cmdText, { color: now ? colors.black : done ? colors.lime : colors.lavender }]}
              >
                {c}
              </Text>
            </View>
          );
        })}
      </View>
      <LinearGradient colors={gradients.stage} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.calCard}>
        <View style={[styles.phaseTag, { backgroundColor: imagine ? colors.lime : 'rgba(14,11,26,0.35)' }]}>
          <Text style={[styles.phaseText, { color: imagine ? colors.black : colors.white }]}>{p.label}</Text>
        </View>
        <View
          style={styles.ring}
          accessible
          accessibilityRole="timer"
          accessibilityLabel={`${p.label}, ${shown} seconds`}
        >
          <Svg width={150} height={150} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={75} cy={75} r={64} stroke="rgba(255,255,255,0.2)" strokeWidth={12} fill="none" />
            <Circle
              cx={75}
              cy={75}
              r={64}
              stroke={colors.lime}
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={RING}
              strokeDashoffset={RING * (1 - shown / p.seconds)}
            />
          </Svg>
          <Text style={styles.ringNum} maxFontSizeMultiplier={1.2}>
            {shown}
          </Text>
        </View>
        <Text style={styles.instruction}>{p.instruction}</Text>
        <Text style={styles.hint}>{paused ? 'Paused' : p.hint}</Text>
      </LinearGradient>
      <GlassCard>
        <View style={[ui.row, { justifyContent: 'space-between', marginBottom: 10 }]}>
          <Text style={styles.trialText}>
            Trial {Math.min(trial, TRIALS)} of {TRIALS}
          </Text>
          <Text style={[styles.trialText, { color: colors.lavender }]}>Right hand</Text>
        </View>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${Math.round((Math.min(trial, TRIALS) / TRIALS) * 100)}%` }]} />
        </View>
      </GlassCard>
      <InfoCard
        icon="clock"
        text="Each command is practised 20 to 30 times, with rest in between. Aim: under 10 minutes in total."
      />
    </Screen>
  );
}

/* ---------- A3b · Calibration result (document 12.3 #3, 5.1) ---------- */

const sampleBars = [
  { cmd: 'Left hand', width: 78 },
  { cmd: 'Right hand', width: 72 },
  { cmd: 'Feet', width: 58 },
  { cmd: 'Rest', width: 81 },
];

export function CalResultScreen({ onNavigate, onBack }: ScreenProps) {
  const { person } = useDemo();
  const grow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(grow, {
      toValue: 1,
      duration: 900,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [grow]);
  return (
    <Screen
      background="bright"
      header={<TopBar title="Calibration done" onBack={onBack} />}
      footer={<BigButton label="Go to the menu" icon="check" onPress={() => onNavigate('home')} />}
    >
      <SuccessMark />
      <Heading size={30} style={{ textAlign: 'center' }}>
        {person.name}'s model is ready
      </Heading>
      <Body style={{ textAlign: 'center' }}>
        Accuracy is measured for {person.name}, for each command. It is a result, not a promise.
      </Body>
      <WhiteCard style={{ gap: 14 }}>
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <Text style={ui.cardTitle}>Accuracy per command</Text>
          <Pill label="Sample bars" tone="soft" />
        </View>
        {sampleBars.map((b) => (
          <View key={b.cmd} style={{ gap: 6 }}>
            <View style={[ui.row, { justifyContent: 'space-between' }]}>
              <Text style={styles.barLabel}>{b.cmd}</Text>
              <Text style={[styles.barLabel, { color: colors.labelOnWhite }]}>[measured]</Text>
            </View>
            <View style={[styles.bar, { backgroundColor: colors.cardMuted, height: 12 }]}>
              <Animated.View
                style={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: b.width >= 65 ? colors.violet : colors.weak,
                  width: grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${b.width}%`] }),
                }}
              />
            </View>
          </View>
        ))}
      </WhiteCard>
      <GlassCard style={[ui.row, { gap: 10 }]}>
        <Dot color={colors.weak} size={12} />
        <Text style={styles.optionSub}>
          Feet is weak for {person.name}, so it is left off the menu for now. Calibration took 8 minutes.
        </Text>
      </GlassCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandBar: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segment: { flexDirection: 'row', padding: 4, gap: 4, borderRadius: radius.pill, backgroundColor: colors.glass },
  segItem: { height: 36, paddingHorizontal: 14, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  segText: { fontFamily: fonts.bold },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 22 },
  personName: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.black },
  personSub: { fontFamily: fonts.semibold, fontSize: 12 },
  addPerson: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  addText: { fontFamily: fonts.bold, fontSize: 14, color: colors.violet },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
  optionSub: { flex: 1, fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 17, color: colors.lavender },
  toggle: { width: 50, height: 30, borderRadius: 15 },
  toggleKnob: { position: 'absolute', top: 3, width: 24, height: 24, borderRadius: 12 },
  links: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', columnGap: 18 },
  headsetHero: { height: 220, alignItems: 'center', justifyContent: 'center' },
  headsetGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(185,166,255,0.14)',
  },
  headsetImage: { width: 240, height: 227 },
  headsetPills: { position: 'absolute', left: 0, top: 8, gap: 6 },
  legend: { fontFamily: fonts.bold, fontSize: 11, color: colors.labelOnWhite },
  channel: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 9 },
  channelName: { fontFamily: fonts.extrabold, fontSize: 14, color: colors.black },
  channelWhere: { fontFamily: fonts.semibold, color: colors.labelOnWhite },
  statePill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  stateText: { fontFamily: fonts.bold, fontSize: 12, color: colors.black },
  cmdChip: {
    flex: 1,
    height: 40,
    paddingHorizontal: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cmdText: { fontFamily: fonts.bold, fontSize: 12 },
  calCard: { borderRadius: radius.card, padding: 20, alignItems: 'center', gap: 12 },
  phaseTag: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999 },
  phaseText: { fontFamily: fonts.extrabold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  ring: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  ringNum: { position: 'absolute', fontFamily: fonts.extrabold, fontSize: 56, letterSpacing: -2, color: colors.white },
  instruction: {
    textAlign: 'center',
    fontFamily: fonts.extrabold,
    fontSize: 25,
    lineHeight: 28,
    letterSpacing: -0.7,
    color: colors.white,
  },
  hint: { textAlign: 'center', fontFamily: fonts.medium, fontSize: 14, color: colors.lavender },
  trialText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  bar: { height: 10, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6, backgroundColor: colors.lime },
  barLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.black },
});
