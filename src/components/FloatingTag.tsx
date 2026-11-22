import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fonts } from '../theme';

interface Props {
  label: string;
  tone?: 'lime' | 'white';
  rotate?: string;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** A tilted pill label that drifts up and down slowly, like a sticker floating next to the product. */
export function FloatingTag({ label, tone = 'lime', rotate = '0deg', delay = 0, style }: Props) {
  const drift = useRef(new Animated.Value(0)).current;
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      delay: 500 + delay,
      easing: Easing.out(Easing.back(1.6)),
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 2200, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [appear, drift, delay]);

  return (
    <Animated.Text
      style={[
        styles.tag,
        tone === 'lime' ? styles.lime : styles.white,
        style,
        {
          opacity: appear,
          transform: [
            { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
            { scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            { rotate },
          ],
        },
      ]}
    >
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  tag: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.black,
  },
  lime: { backgroundColor: colors.lime },
  white: { backgroundColor: colors.white },
});
