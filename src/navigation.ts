/** Every screen in the app. The patient-app screens follow section 12.3 of the IRADA build document. */
export type Route =
  // Pitch screens
  | 'intro'
  | 'viewer'
  | 'how'
  // Patient app (simulated)
  | 'welcome'
  | 'headset'
  | 'calibration'
  | 'calResult'
  | 'home'
  | 'intent'
  | 'recipient'
  | 'confirm'
  | 'result'
  | 'emergency'
  | 'log'
  | 'settings'
  // Caregiver and therapist views
  | 'caregiver'
  | 'clinician';

export interface ScreenProps {
  onNavigate(route: Route): void;
}

/** The screens that belong to the simulated IRADA app (the "Try it" tab). */
export const demoRoutes: Route[] = [
  'welcome',
  'headset',
  'calibration',
  'calResult',
  'home',
  'intent',
  'recipient',
  'confirm',
  'result',
  'emergency',
  'log',
  'settings',
  'caregiver',
  'clinician',
];

/** Where the Android back button goes from each screen. */
export const backRoute: Partial<Record<Route, Route>> = {
  viewer: 'intro',
  how: 'intro',
  welcome: 'intro',
  headset: 'welcome',
  calibration: 'headset',
  calResult: 'calibration',
  home: 'welcome',
  intent: 'home',
  recipient: 'intent',
  confirm: 'home',
  result: 'home',
  emergency: 'home',
  log: 'home',
  settings: 'home',
  caregiver: 'welcome',
  clinician: 'welcome',
};
