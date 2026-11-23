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

import { FloatingNav } from './src/components/FloatingNav';
import { DemoProvider } from './src/demo/DemoContext';
import { backRoute, type Route, type ScreenProps } from './src/navigation';
import { HowItWorksScreen } from './src/screens/HowItWorksScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { ViewerScreen } from './src/screens/ViewerScreen';
import { CaregiverScreen, ClinicianScreen } from './src/screens/app/CareScreens';
import {
  ConfirmScreen,
  EmergencyScreen,
  HomeScreen,
  IntentScreen,
  RecipientScreen,
  ResultScreen,
} from './src/screens/app/FlowScreens';
import { LogScreen, SettingsScreen } from './src/screens/app/RecordScreens';
import { CalibrationScreen, CalResultScreen, HeadsetScreen, WelcomeScreen } from './src/screens/app/SetupScreens';
import { colors } from './src/theme';

const screens: Record<Route, (props: ScreenProps) => React.JSX.Element> = {
  intro: IntroScreen,
  viewer: ViewerScreen,
  how: HowItWorksScreen,
  welcome: WelcomeScreen,
  headset: HeadsetScreen,
  calibration: CalibrationScreen,
  calResult: CalResultScreen,
  home: HomeScreen,
  intent: IntentScreen,
  recipient: RecipientScreen,
  confirm: ConfirmScreen,
  result: ResultScreen,
  emergency: EmergencyScreen,
  log: LogScreen,
  settings: SettingsScreen,
  caregiver: CaregiverScreen,
  clinician: ClinicianScreen,
};

/** Screens of the simulated app that show the floating menu (the viewer and How it works draw their own). */
const withNav: Route[] = ['welcome', 'home', 'caregiver', 'clinician'];

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
      Animated.timing(fade, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setRoute(next);
        Animated.timing(fade, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    },
    [fade, route],
  );

  // Android back button steps back through the app instead of closing it.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const back = backRoute[route];
      if (!back) return false;
      navigate(back);
      return true;
    });
    return () => sub.remove();
  }, [route, navigate]);

  const Current = screens[route];

  return (
    <SafeAreaProvider>
      <DemoProvider>
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
              <Current onNavigate={navigate} />
              {withNav.includes(route) && <FloatingNav current={route} onNavigate={navigate} />}
            </Animated.View>
          )}
        </View>
      </DemoProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
});
