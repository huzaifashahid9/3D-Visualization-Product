import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { demoRoutes, type Route } from '../navigation';
import { colors } from '../theme';
import { Icon, type IconName } from './Icon';

export type { Route };

const items: { route: Route; icon: IconName; label: string }[] = [
  { route: 'intro', icon: 'home', label: 'Intro' },
  { route: 'viewer', icon: 'cube', label: 'Explore in 3D' },
  { route: 'how', icon: 'pulse', label: 'How it works' },
  { route: 'welcome', icon: 'tablet', label: 'Try the IRADA app' },
];

/** The floating black menu bar. The last item opens the simulated IRADA app. */
export function FloatingNav({ current, onNavigate }: { current: Route; onNavigate(route: Route): void }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 10 }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {items.map((item) => {
          const active = item.route === current || (item.route === 'welcome' && demoRoutes.includes(current));
          return (
            <Pressable
              key={item.route}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: active }}
              onPress={() => onNavigate(item.route)}
              style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.pressed]}
            >
              <Icon name={item.icon} color={active ? colors.black : colors.muted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    width: 268,
    height: 68,
    padding: 8,
    borderRadius: 34,
    backgroundColor: colors.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#080418',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
  },
  item: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  itemActive: { backgroundColor: colors.lime },
  pressed: { opacity: 0.7 },
});
