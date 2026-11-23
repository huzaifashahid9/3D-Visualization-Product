import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '../../components/Icon';
import { RoundButton } from '../../components/RoundButton';
import { Disc, Eyebrow, InfoCard, Screen, TopBar, WhiteCard, ui } from '../../components/ui';
import { outcomeStyle, type LogEntry } from '../../demo/data';
import { useDemo } from '../../demo/DemoContext';
import type { ScreenProps } from '../../navigation';
import { colors, fonts, radius } from '../../theme';

/* ---------- A10 · Activity log (document 12.3 #10) ---------- */

const filters = ['All', 'Done', 'Cancelled', 'Emergency'] as const;
type Filter = (typeof filters)[number];

function matches(e: LogEntry, f: Filter) {
  if (f === 'All') return true;
  if (f === 'Done') return e.outcome === 'Done';
  if (f === 'Cancelled') return e.outcome !== 'Done';
  return e.icon === 'alert';
}

export function LogScreen({ onNavigate }: ScreenProps) {
  const { log } = useDemo();
  const [filter, setFilter] = useState<Filter>('All');
  const shown = log.filter((e) => matches(e, filter));
  return (
    <Screen
      header={
        <TopBar
          title="Activity log"
          onBack={() => onNavigate('home')}
          right={<RoundButton icon="export" label="Export the log" variant="white" />}
        />
      }
    >
      <View style={[ui.row, { gap: 6 }]}>
        {filters.map((f) => {
          const on = f === filter;
          return (
            <Pressable
              key={f}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setFilter(f)}
              style={[styles.filter, { backgroundColor: on ? colors.lime : colors.glass }]}
            >
              <Text style={[styles.filterText, { color: on ? colors.black : colors.white }]}>{f}</Text>
            </Pressable>
          );
        })}
      </View>
      <Eyebrow color={colors.muted}>Today · Sara</Eyebrow>
      <WhiteCard style={{ paddingVertical: 6, paddingHorizontal: 14 }}>
        {shown.length === 0 && <Text style={[ui.cardText, { paddingVertical: 14 }]}>Nothing here yet.</Text>}
        {shown.map((e, i) => (
          <View key={`${e.time}-${e.title}-${i}`} style={[styles.event, i > 0 && ui.divider]}>
            <Disc icon={e.icon} bg={colors.cardMuted} fg={colors.violet} size={38} />
            <View style={ui.flex}>
              <Text style={ui.rowTitle}>{e.title}</Text>
              <Text style={ui.cardText}>
                {e.time} · Confidence {e.confidence}
              </Text>
            </View>
            <View style={[styles.outcome, { backgroundColor: outcomeStyle[e.outcome].bg }]}>
              <Text style={[styles.outcomeText, { color: outcomeStyle[e.outcome].fg }]}>{e.outcome}</Text>
            </View>
          </View>
        ))}
      </WhiteCard>
      <InfoCard
        icon="shield"
        text="Every action, its time, confidence and outcome is kept. Caregivers can review and export it. Earlier entries are samples."
      />
    </Screen>
  );
}

/* ---------- A11 · Settings and safety (document 12.3 #11, 12.2, 12.6) ---------- */

interface SettingRow {
  icon: IconName;
  title: string;
  value?: string;
  locked?: boolean;
  danger?: boolean;
}

const sections: { title: string; rows: SettingRow[] }[] = [
  {
    title: 'Safety',
    rows: [
      { icon: 'clock', title: 'Confirmation countdown', value: '10 s', locked: true },
      { icon: 'target', title: 'Ask again below', value: '[confidence]', locked: true },
      { icon: 'headset', title: 'Headset button cancels', value: 'Always on', locked: true },
      { icon: 'user', title: 'Caregiver can cancel', value: 'On', locked: true },
      { icon: 'alert', title: 'Emergency contacts', value: '3', locked: true },
    ],
  },
  {
    title: 'Display and language',
    rows: [
      { icon: 'note', title: 'Text size', value: 'Large' },
      { icon: 'globe', title: 'Language', value: 'English · اردو' },
      { icon: 'volume', title: 'Voice prompts', value: 'On' },
    ],
  },
  {
    title: 'Your data',
    rows: [
      { icon: 'shield', title: 'Raw brain signals', value: 'On this phone' },
      { icon: 'export', title: 'Export my data' },
      { icon: 'trash', title: 'Delete my data', value: 'Delete', danger: true },
    ],
  },
];

export function SettingsScreen({ onNavigate }: ScreenProps) {
  return (
    <Screen header={<TopBar title="Settings and safety" onBack={() => onNavigate('home')} />}>
      <InfoCard icon="lock" text="Items with a lock can only be changed by a caregiver." />
      {sections.map((sec) => (
        <View key={sec.title} style={{ gap: 8 }}>
          <Eyebrow>{sec.title}</Eyebrow>
          <WhiteCard style={{ paddingVertical: 4, paddingHorizontal: 14 }}>
            {sec.rows.map((r, i) => (
              <View key={r.title} style={[styles.setting, i > 0 && ui.divider]}>
                <Disc icon={r.icon} bg={colors.cardMuted} fg={r.danger ? colors.poor : colors.violet} size={34} />
                <View style={[ui.row, ui.flex, { gap: 6 }]}>
                  <Text style={[styles.settingTitle, r.danger && { color: colors.poor }]}>{r.title}</Text>
                  {r.locked && <Icon name="lock" size={14} color={colors.labelOnWhite} />}
                </View>
                {r.value ? (
                  <View style={[styles.value, r.danger && { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.valueText, r.danger && { color: colors.poor }]}>{r.value}</Text>
                  </View>
                ) : (
                  <Icon name="chevron" size={18} color={colors.labelOnWhite} />
                )}
              </View>
            ))}
          </WhiteCard>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filter: { height: 36, paddingHorizontal: 14, borderRadius: radius.pill, justifyContent: 'center' },
  filterText: { fontFamily: fonts.bold, fontSize: 12.5 },
  event: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  outcome: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill, maxWidth: 120 },
  outcomeText: { fontFamily: fonts.bold, fontSize: 11 },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  settingTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.black, flexShrink: 1 },
  value: { backgroundColor: colors.cardMuted, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  valueText: { fontFamily: fonts.bold, fontSize: 13, color: '#3B3654' },
});
