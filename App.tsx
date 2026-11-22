import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
// Import only the four weights the app uses, so the other font files are not bundled.
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';

import type { Route } from './src/components/FloatingNav';
import { HowItWorksScreen } from './src/screens/HowItWorksScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { ViewerScreen } from './src/screens/ViewerScreen';
import { colors } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [route, setRoute] = useState<Route>('intro');
  const fade = useRef(new Animated.Value(1)).current;

  // Cross-fade between screens.
  const navigate = useCallback(
    (next: Route) => {
      if (next === route) return;
      Animated.timing(fade, { toValue: 0, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(
        () => {
          setRoute(next);
          Animated.timing(fade, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
        },
      );
    },
    [fade, route],
  );

  // Android back button returns to the intro instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route === 'intro') return false;
      navigate('intro');
      return true;
    });
    return () => sub.remove();
  }, [route, navigate]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        {fontsLoaded && (
          <Animated.View
            style={[
              styles.root,
              {
                opacity: fade,
                transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) }],
              },
            ]}
          >
            {route === 'intro' && <IntroScreen onNavigate={navigate} />}
            {route === 'viewer' && <ViewerScreen onNavigate={navigate} />}
            {route === 'how' && <HowItWorksScreen onNavigate={navigate} />}
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
});
