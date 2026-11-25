import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, gradients, radius } from '../theme';
import { Icon, type IconName } from './Icon';
import { RoundButton } from './RoundButton';

/**
 * Small building blocks shared by the IRADA app screens, so every screen keeps the same
 * violet and lime look: gradient backgrounds, pills, big pill buttons and rounded cards.
 */

type Background = 'deep' | 'bright' | 'emergency';

const backgrounds = {
  deep: { colors: gradients.viewer, locations: gradients.viewerStops },
  bright: { colors: gradients.bright, locations: gradients.brightStops },
  emergency: { colors: gradients.emergency, locations: gradients.emergencyStops },
};

interface ScreenProps {
  background?: Background;
  /** Shown above the content, outside the scroll area. */
  header?: ReactNode;
  /** Pinned to the bottom, outside the scroll area (big buttons). */
  footer?: ReactNode;
  /** Extra space at the bottom of the scroll area, for the floating nav. */
  bottomInset?: number;
  children: ReactNode;
}

/** A full screen with a gradient background, a scrolling body and an optional pinned footer. */
export function Screen({ background = 'deep', header, footer, bottomInset = 0, children }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bg = backgrounds[background];
  return (
    <LinearGradient colors={bg.colors} locations={bg.locations} style={styles.root}>
      <View style={[styles.column, { paddingTop: insets.top + 6 }]}>{header}</View>
      <ScrollView
        style={styles.root}
        contentContainerStyle={[
          styles.body,
          styles.column,
          { paddingBottom: (footer ? 16 : insets.bottom + 24) + bottomInset },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer && (
        <View style={[styles.footer, styles.column, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>{footer}</View>
      )}
    </LinearGradient>
  );
}

/** Back button, a centred title and an optional item on the right. */
export function TopBar({ title, onBack, right }: { title: string; onBack(): void; right?: ReactNode }) {
  return (
    <View style={styles.topBar}>
      <RoundButton icon="back" label="Back" onPress={onBack} />
      <Text style={styles.topTitle} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      {right ?? <View style={{ width: 48 }} />}
    </View>
  );
}

/** A row of pills at the top of a screen. */
export function PillRow({ children, spread }: { children: ReactNode; spread?: boolean }) {
  return <View style={[styles.pillRow, spread && { justifyContent: 'space-between' }]}>{children}</View>;
}

type PillTone = 'lime' | 'glass' | 'black' | 'soft';

export function Pill({ label, tone = 'lime', icon }: { label: string; tone?: PillTone; icon?: IconName }) {
  const bg = { lime: colors.lime, glass: colors.glass, black: colors.black, soft: colors.cardMuted }[tone];
  const fg = tone === 'lime' ? colors.black : tone === 'soft' ? '#3B3654' : colors.white;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      {icon && <Icon name={icon} size={13} color={fg} strokeWidth={2.6} />}
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

type ButtonTone = 'lime' | 'black' | 'white' | 'glass';

interface BigButtonProps {
  label: string;
  onPress?(): void;
  tone?: ButtonTone;
  icon?: IconName;
  disabled?: boolean;
  compact?: boolean;
}

/** The large pill button used for the main actions. At least 52 points tall, easy to hit. */
export function BigButton({ label, onPress, tone = 'lime', icon, disabled, compact }: BigButtonProps) {
  const bg = { lime: colors.lime, black: colors.black, white: colors.white, glass: 'rgba(255,255,255,0.12)' }[tone];
  const fg = tone === 'lime' || tone === 'white' ? colors.black : colors.white;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.bigButton,
        { backgroundColor: bg, minHeight: compact ? 52 : 62 },
        tone === 'glass' && styles.glassBorder,
        disabled && { opacity: 0.45 },
        pressed && styles.pressed,
      ]}
    >
      {icon && <Icon name={icon} size={20} color={fg} strokeWidth={2.5} />}
      <Text
        style={[styles.bigButtonText, { color: fg, fontSize: compact ? 15 : 18 }]}
        numberOfLines={2}
        maxFontSizeMultiplier={1.5}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** An underlined text button, at least 44 points tall. */
export function TextLink({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
    >
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

export function WhiteCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.whiteCard, style]}>{children}</View>;
}

export function GlassCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

/** A glass card with an icon and one or two lines of text. */
export function InfoCard({
  icon,
  title,
  text,
  iconColor = colors.lime,
}: {
  icon: IconName;
  title?: string;
  text: string;
  iconColor?: string;
}) {
  return (
    <GlassCard style={styles.infoCard}>
      <Icon name={icon} size={18} color={iconColor} />
      <Text style={styles.infoText}>
        {title ? <Text style={styles.infoTitle}>{title} </Text> : null}
        {text}
      </Text>
    </GlassCard>
  );
}

export function Heading({
  children,
  size = 34,
  style,
}: {
  children: ReactNode;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      accessibilityRole="header"
      maxFontSizeMultiplier={1.4}
      style={[styles.heading, { fontSize: size, lineHeight: size * 1.08 }, style]}
    >
      {children}
    </Text>
  );
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.bodyText, style]}>{children}</Text>;
}

export function Eyebrow({ children, color = colors.lime }: { children: ReactNode; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{children}</Text>;
}

export function Dot({ color, size = 10 }: { color: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

/** A round icon badge. */
export function Disc({
  icon,
  bg = colors.lime,
  fg = colors.black,
  size = 48,
}: {
  icon: IconName;
  bg?: string;
  fg?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.48)} color={fg} strokeWidth={2.2} />
    </View>
  );
}

/** Two-letter initials in a circle, for people. */
export function Avatar({ initials, on }: { initials: string; on?: boolean }) {
  return (
    <View style={[styles.avatar, { backgroundColor: on ? colors.black : colors.violet }]}>
      <Text style={[styles.avatarText, { color: on ? colors.lime : colors.white }]}>{initials}</Text>
    </View>
  );
}

/** A lime check in a glowing circle, used on success screens. */
export function SuccessMark() {
  return (
    <View style={styles.successWrap}>
      <View style={styles.successHalo} />
      <View style={styles.success}>
        <Icon name="check" size={56} color={colors.black} strokeWidth={2.6} />
      </View>
    </View>
  );
}

/** The wording the build document asks every screen set to carry. */
export function Disclaimer({ text = 'Assistive prototype, not a medical device' }: { text?: string }) {
  return <Text style={styles.disclaimer}>{text}</Text>;
}

export const ui = StyleSheet.create({
  rowGap: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  cardTitle: { fontFamily: fonts.extrabold, fontSize: 17, color: colors.black, letterSpacing: -0.2 },
  cardText: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 17, color: colors.labelOnWhite },
  rowTitle: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.black },
  divider: { borderTopWidth: 1, borderTopColor: colors.cardMuted },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  /** Keeps content a comfortable width on tablets. */
  column: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  body: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 8, gap: 10 },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.extrabold, fontSize: 16, color: colors.white },
  pillRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  pillText: { fontFamily: fonts.bold, fontSize: 12 },
  bigButton: { borderRadius: 31, paddingHorizontal: 18, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bigButtonText: { fontFamily: fonts.extrabold, flexShrink: 1, textAlign: 'center' },
  glassBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  whiteCard: { backgroundColor: colors.white, borderRadius: 28, padding: 16 },
  glassCard: {
    backgroundColor: colors.glassSoft,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { flex: 1, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.lavender },
  infoTitle: { fontFamily: fonts.bold, color: colors.white },
  heading: { fontFamily: fonts.extrabold, letterSpacing: -1.1, color: colors.white },
  bodyText: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.lavender },
  eyebrow: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.9, textTransform: 'uppercase' },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.extrabold, fontSize: 15 },
  successWrap: { alignSelf: 'center', width: 200, height: 160, alignItems: 'center', justifyContent: 'center' },
  successHalo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(212,255,58,0.16)',
  },
  success: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { minHeight: 44, justifyContent: 'center', alignSelf: 'center' },
  linkText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.lavender, textDecorationLine: 'underline' },
  disclaimer: { textAlign: 'center', fontFamily: fonts.semibold, fontSize: 11, color: colors.muted },
});
