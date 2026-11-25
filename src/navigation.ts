import { createContext, useContext, useEffect, useRef } from 'react';

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

export interface NavigateOptions {
  /** Replace the current screen instead of adding to the history, so Back skips it. */
  replace?: boolean;
}

export interface ScreenProps {
  onNavigate(route: Route, options?: NavigateOptions): void;
  /** Goes to the previous screen in the history (the on-screen and Android back buttons). */
  onBack(): void;
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

/**
 * Screens that start a fresh history, with what sits behind them. Going to the menu after a
 * result, for example, makes Back lead to Welcome rather than into the finished action again.
 */
const roots: Partial<Record<Route, Route[]>> = {
  intro: [],
  welcome: ['intro'],
  home: ['intro', 'welcome'],
  result: ['intro', 'welcome', 'home'],
};

/** Works out the history after moving to `next`. */
export function nextStack(stack: Route[], next: Route, options?: NavigateOptions): Route[] {
  const existing = stack.indexOf(next);
  if (existing >= 0) return stack.slice(0, existing + 1);
  const root = roots[next];
  if (root) return [...root, next];
  const base = options?.replace ? stack.slice(0, -1) : stack;
  return [...base, next];
}

/**
 * Lets a screen take over the back button while it is open. Confirmation screens use it so
 * that going back counts as cancelling, and is written to the activity log like any cancel.
 */
export const BackOverrideContext = createContext<{ current: (() => void) | null }>({ current: null });

export function useBackOverride(handler: () => void) {
  const slot = useContext(BackOverrideContext);
  const latest = useRef(handler);
  latest.current = handler;
  useEffect(() => {
    const fn = () => latest.current();
    slot.current = fn;
    return () => {
      if (slot.current === fn) slot.current = null;
    };
  }, [slot]);
}
