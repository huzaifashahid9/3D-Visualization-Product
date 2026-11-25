import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { Icon, type IconName } from '../../components/Icon';
import { RoundButton } from '../../components/RoundButton';
import { Avatar, Dot, Eyebrow, GlassCard, InfoCard, Pill, Screen, WhiteCard, ui } from '../../components/ui';
import { WEBSITE_LABEL } from '../../config';
import { CONFIRM_SECONDS, contacts, currentChannels, presetMessages } from '../../demo/data';
import { useDemo } from '../../demo/DemoContext';
import { useCountdown } from '../../demo/hooks';
import { shareText } from '../../demo/share';
import type { ScreenProps } from '../../navigation';
import { colors, fonts } from '../../theme';

function RoleHeader({
  role,
  title,
  right,
  onBack,
}: {
  role: string;
  title: string;
  right: ReactNode;
  onBack(): void;
}) {
  return (
    <View style={styles.header}>
      <RoundButton icon="back" label="Back" onPress={onBack} />
      <View style={ui.flex}>
        <Text style={styles.role}>{role}</Text>
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

/* ---------- C1 · Caregiver view (document 12.1, 12.4) ---------- */

type Pending = 'waiting' | 'cancelled' | 'timedout';

export function CaregiverScreen({ onNavigate, onBack }: ScreenProps) {
  const demo = useDemo();
  const { person, paused } = demo;
  const caregiver = contacts[0];
  const pendingText = `Send “${presetMessages[0]}” to ${caregiver.name}`;
  const [pending, setPending] = useState<Pending>('waiting');
  const [round, setRound] = useState(0);
  // A live countdown on the pending action, held while IRADA is paused.
  const left = useCountdown(
    CONFIRM_SECONDS,
    () => {
      setPending('timedout');
      demo.addLog({ icon: 'message', title: pendingText, confidence: 'High', outcome: 'Timed out' });
    },
    { resetKey: round, running: pending === 'waiting' && !paused },
  );

  const sensors = currentChannels(demo.sensorsFixed);
  const problems = sensors.filter((c) => c.state !== 'good');
  const done = demo.log.filter((e) => e.outcome === 'Done').length;
  const notDone = demo.log.length - done;
  const alerts = demo.log.filter((e) => e.icon === 'alert' && e.outcome === 'Done').length;

  const cancelPending = () => {
    setPending('cancelled');
    demo.addLog({ icon: 'message', title: pendingText, confidence: 'High', outcome: 'Cancelled' });
  };
  const showAgain = () => {
    setPending('waiting');
    setRound((r) => r + 1);
  };

  const tiles: { icon: IconName; title: string; onPress(): void }[] = [
    {
      icon: 'contacts',
      title: 'Contacts',
      onPress: () =>
        demo.setToast(`${contacts.map((c) => `${c.name} (${c.role.toLowerCase()})`).join(', ')}. Editing comes later.`),
    },
    {
      icon: 'message',
      title: 'Preset messages',
      onPress: () => demo.setToast(`${presetMessages.length} messages are set up. Editing comes later.`),
    },
    { icon: 'target', title: 'Calibration help', onPress: () => onNavigate('calibration') },
    { icon: 'log', title: 'Activity log', onPress: () => onNavigate('log') },
  ];

  return (
    <Screen
      bottomInset={96}
      header={
        <RoleHeader
          role="Caregiver view"
          title={`Hi ${caregiver.name}`}
          onBack={onBack}
          right={
            <RoundButton
              icon="bell"
              label="Alerts"
              onPress={() =>
                demo.setToast(
                  problems.length
                    ? `${problems.length} sensors need a look: ${problems.map((c) => c.name).join(', ')}.`
                    : 'No new alerts.',
                )
              }
            />
          }
        />
      }
    >
      <WhiteCard style={{ gap: 12 }}>
        <View style={ui.row}>
          <Avatar initials={person.initials} />
          <View style={ui.flex}>
            <Text style={ui.cardTitle}>{person.name}</Text>
            <Text style={ui.cardText}>{paused ? 'IRADA is paused' : 'Headset on · Listening'}</Text>
          </View>
          <Pill label={paused ? 'Paused' : 'Live'} tone={paused ? 'soft' : 'lime'} />
        </View>
        <View style={[ui.row, { gap: 6 }]}>
          {(
            [
              ['battery', '[level]', 'Battery level to be decided'],
              ['bluetooth', 'Strong', 'Bluetooth strong'],
              [
                'headset',
                problems.length ? `${problems.length} to check` : 'All good',
                problems.length ? `${problems.length} sensors to check` : 'All sensors good',
              ],
            ] as [IconName, string, string][]
          ).map(([ic, v, a11y]) => (
            <View key={ic} style={styles.status} accessible accessibilityLabel={a11y}>
              <Icon name={ic} size={14} color={colors.violet} />
              <Text style={styles.statusText} numberOfLines={1}>
                {v}
              </Text>
            </View>
          ))}
        </View>
      </WhiteCard>

      {paused ? (
        <GlassCard style={[ui.row, { justifyContent: 'space-between' }]}>
          <Text style={styles.doneText}>IRADA is paused. Nothing will run on {person.name}'s phone.</Text>
          <Pressable accessibilityRole="button" onPress={() => demo.setPaused(false)} hitSlop={10}>
            <Text style={styles.undo}>Resume</Text>
          </Pressable>
        </GlassCard>
      ) : pending === 'waiting' ? (
        <View style={styles.pending}>
          <View style={[ui.row, { justifyContent: 'space-between' }]}>
            <Text style={styles.pendingLabel}>Waiting for {person.name}'s yes</Text>
            <Text
              style={[styles.pendingLabel, { textTransform: 'none' }]}
              accessibilityLabel={`${left} seconds left`}
            >
              {left} s
            </Text>
          </View>
          <Text style={styles.pendingTitle}>Send “{presetMessages[0]}” to you</Text>
          <View style={[ui.row, { gap: 8 }]}>
            <Pressable
              accessibilityRole="button"
              onPress={cancelPending}
              style={({ pressed }) => [styles.pendingBtn, { backgroundColor: colors.black }, pressed && { opacity: 0.8 }]}
            >
              <Text style={[styles.pendingBtnText, { color: colors.white }]}>Cancel it</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => demo.setPaused(true)}
              style={({ pressed }) => [
                styles.pendingBtn,
                { backgroundColor: 'rgba(14,11,26,0.1)' },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Icon name="pause" size={16} color={colors.black} />
              <Text style={styles.pendingBtnText}>Pause IRADA</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <GlassCard style={[ui.row, { justifyContent: 'space-between' }]}>
          <Text style={styles.doneText}>
            {pending === 'timedout' ? 'No yes came, so it timed out. Nothing was sent.' : 'Cancelled. Nothing was sent.'}
          </Text>
          <Pressable accessibilityRole="button" onPress={showAgain} hitSlop={10}>
            <Text style={styles.undo}>Show again</Text>
          </Pressable>
        </GlassCard>
      )}

      <GlassCard style={[ui.row, { gap: 10 }]}>
        <Dot color={problems.length ? colors.weak : colors.good} size={12} />
        <Text style={styles.alertText}>
          {problems.length ? (
            <>
              <Text style={{ color: colors.white, fontFamily: fonts.bold }}>09:20 </Text>
              Forehead sensor is weak and the ear clips are loose. Press them gently onto the skin.
            </>
          ) : (
            'Every sensor has good contact.'
          )}
        </Text>
      </GlassCard>

      <Eyebrow color={colors.muted}>Today, from the activity log</Eyebrow>
      <View style={[ui.row, { gap: 8 }]}>
        {(
          [
            [done, 'Done'],
            [notDone, 'Not done'],
            [alerts, alerts === 1 ? 'Alert sent' : 'Alerts sent'],
          ] as const
        ).map(([n, t]) => (
          <View key={t} style={styles.stat} accessible accessibilityLabel={`${n} ${t}`}>
            <Text style={styles.statNum}>{n}</Text>
            <Text style={styles.statLabel}>{t}</Text>
          </View>
        ))}
      </View>
      <View style={styles.tiles}>
        {tiles.map((t) => (
          <Pressable
            key={t.title}
            accessibilityRole="button"
            onPress={t.onPress}
            style={({ pressed }) => [styles.tile, pressed && { opacity: 0.8 }]}
          >
            <Icon name={t.icon} size={22} color={colors.lime} />
            <Text style={styles.tileText}>{t.title}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

/* ---------- C2 · Therapist view, later (document 12.1, 12.8) ---------- */

/** Sample accuracy for eight sessions, only to show the chart. Not measured data. */
const sampleTrend = [52, 58, 57, 64, 66, 71, 70, 75];
const W = 300;
const H = 110;
const pt = (i: number, v: number) => [
  10 + (i * (W - 20)) / (sampleTrend.length - 1),
  H - 10 - ((v - 40) / 45) * (H - 20),
];

const perCommand = [
  { cmd: 'Left hand', confirmed: 70, cancelled: 12 },
  { cmd: 'Right hand', confirmed: 62, cancelled: 18 },
  { cmd: 'Rest', confirmed: 74, cancelled: 8 },
];

export function ClinicianScreen({ onBack }: ScreenProps) {
  const { person, setToast } = useDemo();
  const exportReport = () =>
    shareText(
      `IRADA progress · ${person.name}`,
      [
        `IRADA progress report · ${person.name}`,
        '',
        `Accuracy over ${sampleTrend.length} sessions: ${sampleTrend.join(', ')} %`,
        ...perCommand.map((c) => `${c.cmd}: ${c.confirmed}% confirmed, ${c.cancelled}% cancelled`),
        '',
        'Sample data from the IRADA demo, not measured results.',
        WEBSITE_LABEL,
      ].join('\n'),
      () => setToast('Sharing is not available here. On a phone, this opens the share sheet.'),
    );
  const points = sampleTrend.map((v, i) => pt(i, v).join(',')).join(' ');
  const last = pt(sampleTrend.length - 1, sampleTrend[sampleTrend.length - 1]);
  return (
    <Screen
      bottomInset={96}
      header={
        <RoleHeader
          role="Therapist view · later"
          title={`${person.name}'s progress`}
          onBack={onBack}
          right={<RoundButton icon="export" label="Export report" variant="white" onPress={exportReport} />}
        />
      }
    >
      <WhiteCard>
        <View style={[ui.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
          <Text style={ui.cardTitle}>Accuracy over sessions</Text>
          <Pill label="Sample data" tone="soft" />
        </View>
        <Svg
          width="100%"
          height={H}
          accessible
          accessibilityLabel={`Sample accuracy rising from ${sampleTrend[0]}% to ${sampleTrend[sampleTrend.length - 1]}% over ${sampleTrend.length} sessions`}           viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
        >
          <Line x1={10} y1={H - 10} x2={W - 10} y2={H - 10} stroke={colors.cardMuted} strokeWidth={2} />
          <Line
            x1={10}
            y1={H / 2}
            x2={W - 10}
            y2={H / 2}
            stroke={colors.cardMuted}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Polyline
            points={points}
            fill="none"
            stroke={colors.violet}
            strokeWidth={3.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {sampleTrend.slice(0, -1).map((v, i) => {
            const [x, y] = pt(i, v);
            return <Circle key={i} cx={x} cy={y} r={3.5} fill={colors.violet} />;
          })}
          <Circle cx={last[0]} cy={last[1]} r={5.5} fill={colors.lime} stroke={colors.violet} strokeWidth={2} />
        </Svg>
        <View style={[ui.row, { justifyContent: 'space-between', marginTop: 4 }]}>
          <Text style={ui.cardText}>Session 1</Text>
          <Text style={ui.cardText}>Session 8</Text>
        </View>
      </WhiteCard>
      <WhiteCard style={{ gap: 10 }}>
        <Text style={ui.cardTitle}>This week</Text>
        <View style={[ui.row, { gap: 6 }]}>
          {[
            ['Sessions', '8'],
            ['Avg length', '[min]'],
            ['Calibration', '8 min'],
          ].map(([k, v]) => (
            <View key={k} style={styles.weekStat}>
              <Text style={ui.cardText}>{k}</Text>
              <Text style={ui.rowTitle}>{v}</Text>
            </View>
          ))}
        </View>
      </WhiteCard>
      <WhiteCard style={{ gap: 10 }}>
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <Text style={ui.cardTitle}>Per command</Text>
          <View style={[ui.row, { gap: 8 }]}>
            <Dot color={colors.violet} size={8} />
            <Text style={ui.cardText}>Confirmed</Text>
            <Dot color={colors.weak} size={8} />
            <Text style={ui.cardText}>Cancelled</Text>
          </View>
        </View>
        {perCommand.map((c) => (
          <View
            key={c.cmd}
            style={[ui.row, { gap: 8 }]}
            accessible
            accessibilityLabel={`${c.cmd}: ${c.confirmed}% confirmed, ${c.cancelled}% cancelled`}
          >
            <Text style={styles.cmd}>{c.cmd}</Text>
            <View style={styles.stack}>
              <View style={{ width: `${c.confirmed}%`, backgroundColor: colors.violet }} />
              <View style={{ width: `${c.cancelled}%`, backgroundColor: colors.weak }} />
            </View>
          </View>
        ))}
      </WhiteCard>
      <InfoCard
        icon="note"
        title="Notes for the rehab team"
        text="come with the therapist view in a later release."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  role: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.lime },
  title: { fontFamily: fonts.extrabold, fontSize: 24, letterSpacing: -0.5, color: colors.white },
  status: {
    flex: 1,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.cardMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  statusText: { fontFamily: fonts.bold, fontSize: 12, color: colors.black },
  pending: { borderRadius: 28, backgroundColor: colors.lime, padding: 16, gap: 10 },
  pendingLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.black,
  },
  pendingTitle: { fontFamily: fonts.extrabold, fontSize: 20, letterSpacing: -0.4, color: colors.black },
  pendingBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pendingBtnText: { fontFamily: fonts.extrabold, fontSize: 14, color: colors.black },
  doneText: { flex: 1, fontFamily: fonts.semibold, fontSize: 13, color: colors.white },
  undo: { fontFamily: fonts.bold, fontSize: 13, color: colors.lime },
  alertText: { flex: 1, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.lavender },
  stat: { flex: 1, borderRadius: 20, backgroundColor: colors.glassSoft, paddingVertical: 10, paddingHorizontal: 12 },
  statNum: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.white },
  statLabel: { fontFamily: fonts.semibold, fontSize: 11.5, color: colors.lavender },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  tile: {
    width: '48.8%',
    minHeight: 84,
    borderRadius: 22,
    backgroundColor: colors.glassSoft,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 14,
    justifyContent: 'space-between',
  },
  tileText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  weekStat: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.cardMuted,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cmd: { width: 84, fontFamily: fonts.bold, fontSize: 13, color: colors.black },
  stack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cardMuted,
    overflow: 'hidden',
    flexDirection: 'row',
  },
});
