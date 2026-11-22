import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme';
import { Icon, type IconName } from './Icon';

type Variant = 'glass' | 'lime' | 'white';

interface Props {
  icon: IconName;
  label: string;
  onPress?(): void;
  variant?: Variant;
  size?: number;
  selected?: boolean;
}

/** A circular icon button. Always at least 44 points so it is easy to tap. */
export function RoundButton({ icon, label, onPress, variant = 'glass', size = 48, selected }: Props) {
  const bg = variant === 'lime' ? colors.lime : variant === 'white' ? colors.white : colors.glass;
  const fg = variant === 'glass' ? colors.white : colors.black;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        pressed && styles.pressed,
      ]}
    >
      <Icon name={icon} size={size > 44 ? 20 : 18} color={fg} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
});
