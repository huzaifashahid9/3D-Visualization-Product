import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icon } from '../../components/Icon';
import { RoundButton } from '../../components/RoundButton';
import {
  Avatar,
  BigButton,
  Body,
  Disc,
  Disclaimer,
  Dot,
  Eyebrow,
  GlassCard,
  Heading,
  InfoCard,
  Pill,
  PillRow,
  Screen,
  SuccessMark,
  TopBar,
  WhiteCard,
  ui,
} from '../../components/ui';
import {
  CONFIRM_SECONDS,
  actions,
  channels,
  contactColor,
  contacts,
  presetMessages,
  type ActionId,
} from '../../demo/data';
import { now, useDemo } from '../../demo/DemoContext';
import type { ScreenProps } from '../../navigation';
import { colors, fonts } from '../../theme';

/* ---------- Shared: the countdown that cancels by itself ---------- */

const RING = 2 * Math.PI * 41;

function CountdownRing({ left, total }: { left: number; total: number }) {
  return (
    <View style={styles.ring}>
      <Svg width={96} height={96} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={48} cy={48} r={41} stroke="rgba(255,255,255,0.16)" strokeWidth={9} fill="none" />
        <Circle
          cx={48}
          cy={48}
          r={41}
          stroke={colors.lime}
          strokeWidth={9}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={RING}
          strokeDashoffset={RING * (1 - left / total)}
        />
      </Svg>
      <Text style={styles.ringNum}>{left}</Text>
    </View>
  );
}

/** Counts down once a second and calls onTimeout at zero. Silence never counts as yes. */
function useCountdown(seconds: number, onTimeout: () => void, resetKey: unknown = 0) {
  const [left, setLeft] = useState(seconds);
  const timeout = useRef(onTimeout);
  timeout.current = onTimeout;
  useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [seconds, resetKey]);
  useEffect(() => {
    if (left <= 0) timeout.current();
  }, [left]);
  return Math.max(left, 0);
}

/* ---------- A4 · Home menu (document 12.3 #4, 12.2) ---------- */

export function HomeScreen({ onNavigate }: ScreenProps) {
  const demo = useDemo();
  const [highlight, setHighlight] = useState(0);
  const sensors = demo.sensorsFixed ? channels.map((c) => ({ ...c, state: 'good' as const })) : channels;
  const weak = sensors.filter((c) => c.state !== 'good').length;

  // The highlight moves on its own, as if the user is choosing by imagined movement.
  useEffect(() => {
    const t = setInterval(() => setHighlight((h) => (h + 1) % actions.length), 1600);
    return () => clearInterval(t);
  }, []);

  // Messages such as "Cancelled. Nothing was sent." fade after a few seconds.
  const { toast, setToast } = demo;
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  const pick = (id: ActionId) => {
    demo.start(id);
    onNavigate(id === 'emergency' ? 'emergency' : 'intent');
  };

  return (
    <Screen
      bottomInset={96}
      header={
        <View style={styles.homeBar}>
          <Pill label="Try it" />
          <View style={[ui.row, { gap: 8 }]}>
            <RoundButton icon="log" label="Activity log" size={44} onPress={() => onNavigate('log')} />
            <RoundButton icon="gear" label="Settings and safety" size={44} onPress={() => onNavigate('settings')} />
          </View>
        </View>
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open the headset check"
        onPress={() => onNavigate('headset')}
      >
        <WhiteCard style={{ gap: 12 }}>
          <View style={ui.row}>
            <Disc icon="headset" bg={colors.violet} fg={colors.lime} size={42} />
            <View style={ui.flex}>
              <Text style={ui.cardTitle}>Headset connected</Text>
              <Text style={ui.cardText}>Bluetooth LE · Battery [level]</Text>
            </View>
            <Pill label={weak ? `${weak} to check` : 'Ready'} tone={weak ? 'soft' : 'lime'} />
          </View>
          <View style={[ui.row, { gap: 6 }]}>
            {sensors.map((c) => (
              <View key={c.name} style={styles.chan}>
                <Dot color={contactColor[c.state]} size={7} />
                <Text style={styles.chanText}>{c.name === 'Ear clips' ? 'Ref' : c.name}</Text>
              </View>
            ))}
          </View>
        </WhiteCard>
      </Pressable>

      <Heading size={32} style={{ marginTop: 4 }}>
        What do you need?
      </Heading>
      <View style={[ui.row, { gap: 6 }]}>
        <Dot color={colors.lime} size={8} />
        <Text style={styles.method}>Choosing by imagined movement. Tap a tile to try it.</Text>
      </View>

      <View style={styles.tiles}>
        {actions.map((a, i) => {
          const on = i === highlight;
          const sos = a.id === 'emergency';
          const bg = on ? colors.lime : sos ? colors.black : colors.white;
          const fg = on || !sos ? colors.black : colors.white;
          return (
            <Pressable
              key={a.id}
              accessibilityRole="button"
              accessibilityLabel={`${a.title}. ${a.note}`}
              onPress={() => pick(a.id)}
              style={({ pressed }) => [
                sos ? styles.tileWide : styles.tile,
                { backgroundColor: bg },
                on && styles.tileOn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Disc
                icon={a.icon}
                size={48}
                bg={on ? colors.black : sos ? colors.lime : colors.violet}
                fg={on ? colors.lime : sos ? colors.black : colors.white}
              />
              <View style={sos ? ui.flex : undefined}>
                <Text style={[styles.tileTitle, { color: fg }]}>{a.title}</Text>
                <Text
                  style={[
                    styles.tileNote,
                    { color: on ? colors.textOnLime : sos ? colors.muted : colors.labelOnWhite },
                  ]}
                >
                  {a.note}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[ui.row, { gap: 8 }]}>
        {['Yes', 'No', 'Cancel'].map((q) => (
          <View key={q} style={styles.quick}>
            <Text style={styles.quickText}>{q}</Text>
          </View>
        ))}
      </View>

      {demo.toast ? (
        <View accessibilityLiveRegion="polite" style={styles.toast}>
          <Text style={styles.toastText}>{demo.toast}</Text>
        </View>
      ) : (
        <Disclaimer text="Simulated for the pitch. IRADA is an assistive prototype, not a medical device." />
      )}
    </Screen>
  );
}

/* ---------- A5 · Intent detected (document 12.3 #5, 12.4) ---------- */

export function IntentScreen({ onNavigate }: ScreenProps) {
  const demo = useDemo();
  const action = actions.find((a) => a.id === demo.action) ?? actions[1];
  const cancel = () => {
    demo.finish('Cancelled');
    demo.setToast('Cancelled. Nothing was sent.');
    onNavigate('home');
  };
  return (
    <Screen
      background="bright"
      header={
        <PillRow>
          <Pill label="Intent detected" />
          <Pill label="Listening by imagined movement" tone="glass" />
        </PillRow>
      }
      footer={
        <>
          <BigButton
            label="Confirm"
            icon="check"
            onPress={() => onNavigate(demo.action === 'message' ? 'recipient' : 'confirm')}
          />
          <BigButton label="Cancel" tone="black" onPress={cancel} />
        </>
      }
    >
      <View style={styles.intentIcon}>
        <View style={styles.intentHalo} />
        <Disc icon={action.icon} bg={colors.white} fg={colors.violet} size={110} />
      </View>
      <Eyebrow>You chose</Eyebrow>
      <Heading size={40}>{action.title}</Heading>
      <GlassCard>
        <View style={[ui.row, { justifyContent: 'space-between', marginBottom: 10 }]}>
          <Text style={styles.confLabel}>Confidence</Text>
          <Text style={[styles.confLabel, { color: colors.lime }]}>High</Text>
        </View>
        <View style={[ui.row, { gap: 6 }]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[styles.confSeg, { backgroundColor: i < 4 ? colors.lime : 'rgba(255,255,255,0.18)' }]}
            />
          ))}
        </View>
      </GlassCard>
      <WhiteCard style={[ui.row, { paddingVertical: 12 }]}>
        <Disc icon="refresh" bg={colors.cardMuted} fg={colors.violet} size={40} />
        <View style={ui.flex}>
          <Text style={ui.rowTitle}>When IRADA is not sure</Text>
          <Text style={ui.cardText}>It says “Please try again” and never guesses.</Text>
        </View>
      </WhiteCard>
    </Screen>
  );
}

/* ---------- A6 · Recipient and message (document 12.3 #6) ---------- */

export function RecipientScreen({ onNavigate }: ScreenProps) {
  const demo = useDemo();
  return (
    <Screen
      header={<TopBar title="Send message" onBack={() => onNavigate('intent')} />}
      footer={
        <>
          <BigButton label="Next" icon="check" onPress={() => onNavigate('confirm')} />
          <Disclaimer text="Contacts and messages are set up by the caregiver" />
        </>
      }
    >
      <Eyebrow>1 · Who to</Eyebrow>
      {contacts.map((c, i) => {
        const on = i === demo.contact;
        return (
          <Pressable
            key={c.name}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => demo.setContact(i)}
            style={[styles.contact, { backgroundColor: on ? colors.lime : colors.white }, on && styles.glowRing]}
          >
            <Avatar initials={c.initials} on={on} />
            <View style={ui.flex}>
              <Text style={styles.contactName}>{c.name}</Text>
              <Text style={[styles.contactRole, { color: on ? colors.limeLabel : colors.labelOnWhite }]}>{c.role}</Text>
            </View>
          </Pressable>
        );
      })}
      <View style={{ height: 6 }} />
      <Eyebrow>2 · Which message</Eyebrow>
      <View style={styles.msgWrap}>
        {presetMessages.map((m, i) => {
          const on = i === demo.message;
          return (
            <Pressable
              key={m}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => demo.setMessage(i)}
              style={[styles.msg, on ? [{ backgroundColor: colors.lime }, styles.glowRing] : styles.msgOff]}
            >
              <Text style={[styles.msgText, { color: on ? colors.black : colors.white }]}>“{m}”</Text>
            </Pressable>
          );
        })}
      </View>
      <InfoCard
        icon="target"
        text="With the headset, the highlight moves on its own. Imagine the movement when it reaches the one you want."
      />
    </Screen>
  );
}

/* ---------- A7 · Confirmation (document 12.3 #7, 12.4) ---------- */

export function ConfirmScreen({ onNavigate }: ScreenProps) {
  const demo = useDemo();
  const c = contacts[demo.contact];
  const isCall = demo.action === 'call';
  const left = useCountdown(CONFIRM_SECONDS, () => {
    demo.finish('Timed out');
    demo.setToast('Timed out. Nothing was sent.');
    onNavigate('home');
  });
  const yes = () => {
    demo.finish('Done');
    onNavigate('result');
  };
  const cancel = () => {
    demo.finish('Cancelled');
    demo.setToast('Cancelled. Nothing was sent.');
    onNavigate('home');
  };
  return (
    <Screen
      background="bright"
      header={
        <PillRow spread>
          <Pill label="Awaiting confirmation" />
          <Pill label="Voice on" tone="glass" icon="volume" />
        </PillRow>
      }
      footer={
        <>
          <BigButton label={isCall ? 'Yes, call' : 'Yes, send'} icon="check" onPress={yes} />
          <BigButton label="Cancel" tone="black" onPress={cancel} />
        </>
      }
    >
      <View style={{ height: 24 }} />
      <Eyebrow>{isCall ? 'Call' : 'Message'}</Eyebrow>
      <Heading size={38}>{isCall ? `Call ${c.name}?` : `Send “${presetMessages[demo.message]}” to ${c.name}?`}</Heading>
      <Body>
        {c.name} is your {c.role.toLowerCase()}. {isCall ? 'IRADA opens a phone call.' : 'The message goes by text.'}
      </Body>
      <View style={[ui.row, { gap: 16, marginTop: 28 }]}>
        <CountdownRing left={left} total={CONFIRM_SECONDS} />
        <View style={ui.flex}>
          <Text style={styles.cdTitle}>Cancels by itself</Text>
          <Text style={styles.cdText}>Silence never counts as yes. The headset button cancels too.</Text>
        </View>
      </View>
    </Screen>
  );
}

/* ---------- A8 · Execution and result (document 12.3 #8) ---------- */

export function ResultScreen({ onNavigate }: ScreenProps) {
  const demo = useDemo();
  const c = contacts[demo.contact];
  const time = useRef(now()).current;
  const copy: Record<ActionId, { title: string; text: string }> = {
    call: { title: `Calling ${c.name}`, text: 'The call is starting on this phone.' },
    message: { title: 'Message sent', text: `“${presetMessages[demo.message]}” was sent to ${c.name} at ${time}.` },
    emergency: { title: 'Alert sent', text: 'Your emergency contacts have the alert and your location.' },
  };
  return (
    <Screen
      background="bright"
      footer={<BigButton label="Back to menu" tone="white" onPress={() => onNavigate('home')} />}
    >
      <View style={{ height: 24 }} />
      <SuccessMark />
      <Heading size={34} style={{ textAlign: 'center' }}>
        {copy[demo.action].title}
      </Heading>
      <Body style={{ textAlign: 'center' }}>{copy[demo.action].text}</Body>
      <Pressable accessibilityRole="button" onPress={() => onNavigate('log')}>
        <GlassCard style={[ui.row, { justifyContent: 'space-between' }]}>
          <Text style={styles.cdText}>Saved to the activity log</Text>
          <Text style={styles.logTime}>{time}</Text>
        </GlassCard>
      </Pressable>
      <Eyebrow color={colors.muted}>If something goes wrong</Eyebrow>
      <WhiteCard style={{ gap: 12 }}>
        <View style={ui.row}>
          <Disc icon="close" bg={colors.poor} fg={colors.white} size={40} />
          <View style={ui.flex}>
            <Text style={ui.rowTitle}>The message did not send</Text>
            <Text style={ui.cardText}>No mobile signal. Nothing else was done.</Text>
          </View>
        </View>
        <View style={[ui.row, { gap: 8 }]}>
          <View style={[styles.smallBtn, { backgroundColor: colors.black }]}>
            <Text style={[styles.smallBtnText, { color: colors.white }]}>Try again</Text>
          </View>
          <View style={[styles.smallBtn, { backgroundColor: colors.cardMuted }]}>
            <Text style={styles.smallBtnText}>Do something else</Text>
          </View>
        </View>
      </WhiteCard>
    </Screen>
  );
}

/* ---------- A9 · Emergency (document 12.3 #9, 5.3) ---------- */

export function EmergencyScreen({ onNavigate }: ScreenProps) {
  const demo = useDemo();
  const [yeses, setYeses] = useState(0);
  const cancel = (outcome: 'Cancelled' | 'Timed out') => {
    demo.finish(outcome);
    demo.setToast(outcome === 'Timed out' ? 'Timed out. No alert was sent.' : 'Cancelled. No alert was sent.');
    onNavigate('home');
  };
  const left = useCountdown(CONFIRM_SECONDS, () => cancel('Timed out'), yeses);
  const send = () => {
    demo.finish('Done');
    onNavigate('result');
  };
  const yes = () => (yeses === 0 ? setYeses(1) : send());
  return (
    <Screen
      background="emergency"
      header={
        <PillRow spread>
          <Pill label="Emergency" icon="alert" />
          <View style={[ui.row, { gap: 6 }]}>
            <Dot color={colors.lime} size={10} />
            <Dot color={yeses > 0 ? colors.lime : 'rgba(255,255,255,0.25)'} size={10} />
            <Text style={styles.stepText}>{yeses > 0 ? 'Second yes' : 'First yes'}</Text>
          </View>
        </PillRow>
      }
      footer={
        <>
          <BigButton label={yeses === 0 ? 'Yes' : 'Yes, send alert'} icon="alert" onPress={yes} />
          <BigButton label="Cancel" tone="glass" onPress={() => cancel('Cancelled')} />
        </>
      }
    >
      <View style={{ height: 16 }} />
      <Heading size={38}>Send an emergency alert?</Heading>
      <Body>
        {yeses === 0
          ? 'Emergency always needs two yeses in a row, or a tap from your caregiver.'
          : 'This is your second yes. Say yes once more to send it.'}
      </Body>
      <WhiteCard style={{ gap: 12 }}>
        <View style={ui.row}>
          <Disc icon="pin" bg={colors.violet} fg={colors.white} size={40} />
          <View style={ui.flex}>
            <Text style={ui.rowTitle}>Your location is shared</Text>
            <Text style={ui.cardText}>With the alert, one time only</Text>
          </View>
        </View>
        <View style={ui.row}>
          <Disc icon="contacts" bg={colors.violet} fg={colors.white} size={40} />
          <View style={ui.flex}>
            <Text style={ui.rowTitle}>Goes to {contacts.length} emergency contacts</Text>
            <Text style={ui.cardText}>{contacts.map((c) => c.name).join(', ')}</Text>
          </View>
        </View>
      </WhiteCard>
      <View style={[ui.row, { gap: 16, marginTop: 8 }]}>
        <CountdownRing left={left} total={CONFIRM_SECONDS} />
        <View style={ui.flex}>
          <Text style={styles.cdTitle}>Cancels by itself</Text>
          <Text style={styles.cdText}>If you do nothing, no alert is sent.</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" onPress={send} hitSlop={6} style={styles.caregiverTap}>
        <Icon name="user" size={16} color={colors.lavender} />
        <Text style={styles.caregiverText}>Caregiver confirms instead</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  ring: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  ringNum: { position: 'absolute', fontFamily: fonts.extrabold, fontSize: 30, color: colors.white },
  homeBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chan: {
    flex: 1,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cardMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  chanText: { fontFamily: fonts.bold, fontSize: 11, color: '#3B3654' },
  method: { flex: 1, fontFamily: fonts.semibold, fontSize: 12.5, color: colors.lavender },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  tile: { width: '48.4%', minHeight: 140, borderRadius: 28, padding: 16, justifyContent: 'space-between', gap: 10 },
  tileWide: {
    width: '100%',
    minHeight: 100,
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tileOn: {
    transform: [{ translateY: -3 }],
    shadowColor: colors.lime,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  tileTitle: { fontFamily: fonts.extrabold, fontSize: 18, letterSpacing: -0.3 },
  tileNote: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, marginTop: 2 },
  quick: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.glassSoft,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: { fontFamily: fonts.bold, fontSize: 15, color: colors.white },
  toast: {
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: { fontFamily: fonts.bold, fontSize: 13, color: colors.black },
  intentIcon: { height: 180, alignItems: 'center', justifyContent: 'center' },
  intentHalo: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(212,255,58,0.16)',
  },
  confLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  confSeg: { flex: 1, height: 12, borderRadius: 6 },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 22,
  },
  glowRing: { borderWidth: 3, borderColor: 'rgba(212,255,58,0.45)' },
  contactName: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.black },
  contactRole: { fontFamily: fonts.semibold, fontSize: 12 },
  msgWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  msg: { minHeight: 50, paddingHorizontal: 16, borderRadius: 25, justifyContent: 'center' },
  msgOff: { backgroundColor: colors.glassSoft, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  msgText: { fontFamily: fonts.bold, fontSize: 15 },
  cdTitle: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.white },
  cdText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.lavender },
  logTime: { fontFamily: fonts.bold, fontSize: 13, color: colors.white },
  smallBtn: { flex: 1, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  smallBtnText: { fontFamily: fonts.bold, fontSize: 14, color: colors.black },
  stepText: { fontFamily: fonts.bold, fontSize: 12, color: colors.lavender },
  caregiverTap: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, alignSelf: 'flex-start' },
  caregiverText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.lavender, textDecorationLine: 'underline' },
});
