import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDemo } from '../demo/DemoContext';
import { colors, fonts } from '../theme';

const SHOW_MS = 4000;

/**
 * A short message at the top of the screen, such as "Cancelled. Nothing was sent." It sits at
 * the top so it never covers the big buttons at the bottom, fades after a few seconds, can be
 * tapped away, and is read out by VoiceOver and TalkBack.
 */
export function Toast() {
  const { toast, setToast } = useDemo();
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(toast);
    const t = setTimeout(() => setToast(null), SHOW_MS);
    return () => clearTimeout(t);
  }, [toast, setToast, opacity]);

  if (!toast) return null;
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + 8, opacity }]}
      accessibilityLiveRegion="polite"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${toast}. Tap to close.`}
        onPress={() => setToast(null)}
        style={styles.toast}
      >
        <Text style={styles.text}>{toast}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 50, elevation: 50 },
  toast: {
    maxWidth: 520,
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    shadowColor: '#080418',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  text: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 19, color: colors.black, textAlign: 'center' },
});
