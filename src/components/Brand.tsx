import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import { logoRatio, logos } from '../config';

/** The IRADA mark next to the wordmark, used in the screen headers. `height` is the wordmark's height. */
export function Brand({ height = 20, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  const mark = Math.round(height * 1.9);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="IRADA"
      style={[{ flexDirection: 'row', alignItems: 'center', gap: Math.round(height * 0.45) }, style]}
    >
      <Image source={logos.mark} style={{ width: mark, height: mark }} resizeMode="contain" />
      <Image
        source={logos.wordmark}
        style={{ width: Math.round(height * logoRatio.wordmark), height }}
        resizeMode="contain"
      />
    </View>
  );
}

/** The full logo with "by Hexabytes", sized by width. */
export function FullLogo({ width = 180, style }: { width?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style} accessible accessibilityRole="image" accessibilityLabel="IRADA by Hexabytes">
      <Image
        source={logos.full}
        style={{ width, height: Math.round(width / logoRatio.full) }}
        resizeMode="contain"
      />
    </View>
  );
}
