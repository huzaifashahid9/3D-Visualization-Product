import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

/**
 * Counts down once a second and calls onTimeout once, at zero. Silence never counts as yes.
 * Changing resetKey starts the count again from the top; running = false holds it at the top.
 */
export function useCountdown(
  seconds: number,
  onTimeout: () => void,
  { resetKey = 0, running = true }: { resetKey?: unknown; running?: boolean } = {},
) {
  const [left, setLeft] = useState(seconds);
  const timeout = useRef(onTimeout);
  timeout.current = onTimeout;
  useEffect(() => {
    setLeft(seconds);
    if (!running) return;
    let n = seconds;
    const t = setInterval(() => {
      n -= 1;
      setLeft(Math.max(n, 0));
      if (n <= 0) {
        clearInterval(t);
        timeout.current();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [seconds, resetKey, running]);
  return left;
}

/**
 * Returns a function that runs what it is given only the first time it is called. A screen
 * that ends an action (yes, cancel, time-out, back) uses it, so a tap that lands at the same
 * moment as the time-out cannot record the action twice or send the user to two places.
 */
export function useSettleOnce() {
  const done = useRef(false);
  return useCallback((fn: () => void) => {
    if (done.current) return;
    done.current = true;
    fn();
  }, []);
}

/** Calls fn when the app goes to the background (home button, app switcher, phone call). */
export function useOnBackground(fn: () => void) {
  const latest = useRef(fn);
  latest.current = fn;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') latest.current();
    });
    return () => sub.remove();
  }, []);
}

/** True when the phone's Reduce Motion setting is on, so things stop moving on their own. */
export function useReduceMotion() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setOn(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setOn);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return on;
}

/**
 * False for a moment after the screen opens (or after resetKey changes), then true. Yes buttons
 * wait for it, so a double tap on the button before cannot also count as a yes here, and the
 * two yeses an emergency needs cannot come from one accidental double tap.
 */
export function useArmed(delayMs = 700, resetKey: unknown = 0) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    setArmed(false);
    const t = setTimeout(() => setArmed(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs, resetKey]);
  return armed;
}
