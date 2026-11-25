import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FullLogo } from '../../components/Brand';
import { Icon, type IconName } from '../../components/Icon';
import { RoundButton } from '../../components/RoundButton';
import { Disc, Eyebrow, InfoCard, Screen, TopBar, WhiteCard, ui } from '../../components/ui';
import { WEBSITE_LABEL } from '../../config';
import { CONFIRM_SECONDS, contacts, outcomeStyle, type LogEntry } from '../../demo/data';
import { useDemo } from '../../demo/DemoContext';
import { logAsText, shareText } from '../../demo/share';
import { openWebsite } from '../../demo/website';
import type { ScreenProps } from '../../navigation';
import { colors, fonts, radius } from '../../theme';

/* ---------- A10 · Activity log (document 12.3 #10) ---------- */

const filters = ['All', 'Done', 'Not done', 'Emergency'] as const;
type Filter = (typeof filters)[number];

function matches(e: LogEntry, f: Filter) {
  if (f === 'All') return true;
  if (f === 'Done') return e.outcome === 'Done';
  // Cancelled, timed out, stopped by the button, asked again or failed.
  if (f === 'Not done') return e.outcome !== 'Done';
  return e.icon === 'alert';
}

/** Shares the activity log through the phone's share sheet. */
export function useExportLog() {
  const { log, person, setToast } = useDemo();
  return () =>
    shareText('IRADA activity log', logAsText(person.name, log), () =>
      setToast('Sharing is not available here. On a phone, this opens the share sheet.'),
    );
}

export function LogScreen({ onBack }: ScreenProps) {
  const { log, person } = useDemo();
  const exportLog = useExportLog();
  const [filter, setFilter] = useState<Filter>('All');
  const shown = log.filter((e) => matches(e, filter));
  return (
    <Screen
      header={
        <TopBar
          title="Activity log"
          onBack={onBack}
          right={<RoundButton icon="export" label="Export the log" variant="white" onPress={exportLog} />}
        />
      }
    >
      <View style={[ui.row, { gap: 6, flexWrap: 'wrap' }]} accessibilityRole="tablist">
        {filters.map((f) => {
          const on = f === filter;
          return (
            <Pressable
              key={f}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setFilter(f)}
              hitSlop={4}
              style={[styles.filter, { backgroundColor: on ? colors.lime : colors.glass }]}
            >
              <Text style={[styles.filterText, { color: on ? colors.black : colors.white }]}>{f}</Text>
            </Pressable>
          );
        })}
      </View>
      <Eyebrow color={colors.muted}>Today · {person.name}</Eyebrow>
      <WhiteCard style={{ paddingVertical: 6, paddingHorizontal: 14 }}>
        {shown.length === 0 && (
          <Text style={[ui.cardText, { paddingVertical: 14 }]}>
            {log.length === 0 ? 'No actions yet. Everything IRADA does will appear here.' : 'Nothing matches this filter.'}
          </Text>
        )}
        {shown.map((e, i) => (
          <View
            key={`${e.time}-${e.title}-${i}`}
            style={[styles.event, i > 0 && ui.divider]}
            accessible
            accessibilityLabel={`${e.time}, ${e.title}, ${e.outcome}, confidence ${e.confidence}`}
          >
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
  onPress(): void;
}

export function SettingsScreen({ onBack }: ScreenProps) {
  const demo = useDemo();
  const exportLog = useExportLog();
  // Delete takes two taps: the first asks, the second deletes. The question goes away by itself.
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
  }, []);

  const locked = () => demo.setToast('Only a caregiver can change this, to keep the safety settings safe.');
  const onDelete = () => {
    if (deleteTimer.current) clearTimeout(deleteTimer.current);
    if (!confirmDelete) {
      setConfirmDelete(true);
      deleteTimer.current = setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }
    setConfirmDelete(false);
    demo.clearData();
    demo.setToast('Your data was deleted. The activity log is empty.');
  };

  const sections: { title: string; rows: SettingRow[] }[] = [
    {
      title: 'Safety',
      rows: [
        { icon: 'clock', title: 'Confirmation countdown', value: `${CONFIRM_SECONDS} s`, locked: true, onPress: locked },
        { icon: 'target', title: 'Ask again below', value: '[confidence]', locked: true, onPress: locked },
        { icon: 'headset', title: 'Headset button cancels', value: 'Always on', locked: true, onPress: locked },
        { icon: 'user', title: 'Caregiver can cancel', value: 'On', locked: true, onPress: locked },
        { icon: 'alert', title: 'Emergency contacts', value: String(contacts.length), locked: true, onPress: locked },
      ],
    },
    {
      title: 'Display and language',
      rows: [
        {
          icon: 'note',
          title: 'Text size',
          value: 'Phone setting',
          onPress: () => demo.setToast("IRADA follows your phone's text size. Change it in the phone's settings."),
        },
        {
          icon: 'globe',
          title: 'Language',
          value: demo.urdu ? 'اردو' : 'English',
          onPress: () => {
            demo.setUrdu(!demo.urdu);
            if (!demo.urdu) demo.setToast('Urdu screens come with the first release. The demo stays in English.');
          },
        },
        {
          icon: 'volume',
          title: 'Voice prompts',
          value: demo.voicePrompts ? 'On' : 'Off',
          onPress: () => demo.setVoicePrompts(!demo.voicePrompts),
        },
      ],
    },
    {
      title: 'Your data',
      rows: [
        {
          icon: 'shield',
          title: 'Raw brain signals',
          value: 'On this phone',
          onPress: () => demo.setToast('Raw EEG never leaves this phone. Only the log can be exported.'),
        },
        { icon: 'export', title: 'Export my data', onPress: exportLog },
        {
          icon: 'trash',
          title: 'Delete my data',
          value: confirmDelete ? 'Tap again to delete' : 'Delete',
          danger: true,
          onPress: onDelete,
        },
      ],
    },
    {
      title: 'About',
      rows: [
        { icon: 'globe', title: 'Website', value: WEBSITE_LABEL, onPress: () => openWebsite(demo.setToast) },
      ],
    },
  ];

  return (
    <Screen header={<TopBar title="Settings and safety" onBack={onBack} />}>
      <InfoCard icon="lock" text="Items with a lock can only be changed by a caregiver." />
      {sections.map((sec) => (
        <View key={sec.title} style={{ gap: 8 }}>
          <Eyebrow>{sec.title}</Eyebrow>
          <WhiteCard style={{ paddingVertical: 4, paddingHorizontal: 14 }}>
            {sec.rows.map((r, i) => {
              const asking = r.danger && confirmDelete;
              return (
                <Pressable
                  key={r.title}
                  accessibilityRole="button"
                  accessibilityLabel={`${r.title}${r.value ? `, ${r.value}` : ''}${r.locked ? ', caregiver only' : ''}`}
                  onPress={r.onPress}
                  style={({ pressed }) => [styles.setting, i > 0 && ui.divider, pressed && { opacity: 0.6 }]}
                >
                  <Disc icon={r.icon} bg={colors.cardMuted} fg={r.danger ? colors.poor : colors.violet} size={34} />
                  <View style={[ui.row, ui.flex, { gap: 6 }]}>
                    <Text style={[styles.settingTitle, r.danger && { color: colors.poor }]}>{r.title}</Text>
                    {r.locked && <Icon name="lock" size={14} color={colors.labelOnWhite} />}
                  </View>
                  {r.value ? (
                    <View
                      style={[
                        styles.value,
                        r.danger && { backgroundColor: asking ? colors.poor : 'transparent' },
                      ]}
                    >
                      <Text style={[styles.valueText, r.danger && { color: asking ? colors.white : colors.poor }]}>
                        {r.value}
                      </Text>
                    </View>
                  ) : (
                    <Icon name="chevron" size={18} color={colors.labelOnWhite} />
                  )}
                </Pressable>
              );
            })}
          </WhiteCard>
        </View>
      ))}
      <FullLogo width={150} style={styles.aboutLogo} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filter: { height: 36, paddingHorizontal: 14, borderRadius: radius.pill, justifyContent: 'center' },
  filterText: { fontFamily: fonts.bold, fontSize: 12.5 },
  event: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  outcome: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill, maxWidth: 120 },
  outcomeText: { fontFamily: fonts.bold, fontSize: 11 },
  aboutLogo: { alignSelf: 'center', marginTop: 12, opacity: 0.9 },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, minHeight: 52 },
  settingTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.black, flexShrink: 1 },
  value: { backgroundColor: colors.cardMuted, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  valueText: { fontFamily: fonts.bold, fontSize: 13, color: '#3B3654' },
});
