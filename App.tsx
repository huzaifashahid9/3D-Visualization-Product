import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, Easing, Image, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
// Import only the four weights the app uses, so the other font files are not bundled.
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';

import { FloatingNav } from './src/components/FloatingNav';
import { Toast } from './src/components/Toast';
import { DemoProvider } from './src/demo/DemoContext';
import { BackOverrideContext, nextStack, type NavigateOptions, type Route, type ScreenProps } from './src/navigation';
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
import { logos } from './src/config';
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
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  // The history of screens, so Back returns to where the user came from.
  const [stack, setStack] = useState<Route[]>(['intro']);
  const stackRef = useRef(stack);
  stackRef.current = stack;
  const route = stack[stack.length - 1];
  const fade = useRef(new Animated.Value(1)).current;
  // While one screen is fading into the next, further taps are ignored, so a double tap or a
  // tap at the same moment as a time-out cannot start two moves at once.
  const moving = useRef(false);
  const backOverride = useRef<(() => void) | null>(null);

  const go = useCallback(
    (next: Route[]) => {
      const current = stackRef.current;
      if (moving.current) return;
      if (next[next.length - 1] === current[current.length - 1]) {
        setStack(next);
        return;
      }
      moving.current = true;
      Animated.timing(fade, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        stackRef.current = next;
        setStack(next);
        moving.current = false;
        Animated.timing(fade, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    },
    [fade],
  );

  const navigate = useCallback(
    (next: Route, options?: NavigateOptions) => go(nextStack(stackRef.current, next, options)),
    [go],
  );

  /** Steps back one screen. Returns false on the first screen, so Android can close the app. */
  const back = useCallback(() => {
    if (moving.current) return true;
    if (backOverride.current) {
      backOverride.current();
      return true;
    }
    const current = stackRef.current;
    if (current.length <= 1) return false;
    go(current.slice(0, -1));
    return true;
  }, [go]);

  // Android back button steps back through the app instead of closing it.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', back);
    return () => sub.remove();
  }, [back]);

  const onBack = useCallback(() => {
    back();
  }, [back]);
  const screenProps = useMemo<ScreenProps>(() => ({ onNavigate: navigate, onBack }), [navigate, onBack]);

  const Current = screens[route];
  // If the fonts cannot be loaded, carry on with the system font rather than a blank screen.
  const ready = fontsLoaded || !!fontError;

  return (
    <SafeAreaProvider>
      <DemoProvider>
        <BackOverrideContext.Provider value={backOverride}>
          <StatusBar style="light" />
          <View style={styles.root}>
            {ready && (
              <Animated.View
                style={[
                  styles.root,
                  {
                    opacity: fade,
                    transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) }],
                  },
                ]}
              >
                <Current {...screenProps} />
                {withNav.includes(route) && <FloatingNav current={route} onNavigate={navigate} />}
              </Animated.View>
            )}
            {!ready && (
              <View style={styles.loading}>
                <Image source={logos.mark} style={styles.loadingMark} accessibilityLabel="IRADA" />
              </View>
            )}
            {ready && <Toast />}
          </View>
        </BackOverrideContext.Provider>
      </DemoProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  loading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  loadingMark: { width: 96, height: 96 },
});
