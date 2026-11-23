import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { actions, contacts, presetMessages, sampleLog, type ActionId, type LogEntry, type Outcome } from './data';

/**
 * State for the simulated IRADA app: what the user picked, and the activity log.
 * Every action ends in the log, as the document requires.
 */
interface DemoState {
  action: ActionId;
  contact: number;
  message: number;
  log: LogEntry[];
  toast: string | null;
  /** True once the headset check has been run again and every sensor reads good. */
  sensorsFixed: boolean;
  setSensorsFixed(v: boolean): void;
  start(action: ActionId): void;
  setContact(i: number): void;
  setMessage(i: number): void;
  /** Records how the current action ended. */
  finish(outcome: Outcome): void;
  setToast(text: string | null): void;
  /** Short description of the current action, such as Send “I need help” to Ahmed. */
  summary(): string;
}

const DemoContext = createContext<DemoState | null>(null);

export function now() {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? '0' : '') + n;
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<ActionId>('message');
  const [contact, setContact] = useState(0);
  const [message, setMessage] = useState(0);
  const [log, setLog] = useState<LogEntry[]>(sampleLog);
  const [toast, setToast] = useState<string | null>(null);
  const [sensorsFixed, setSensorsFixed] = useState(false);

  const summary = useCallback(() => {
    const c = contacts[contact];
    if (action === 'call') return `Call ${c.name}`;
    if (action === 'message') return `Send “${presetMessages[message]}” to ${c.name}`;
    return 'Emergency alert';
  }, [action, contact, message]);

  const finish = useCallback(
    (outcome: Outcome) => {
      const icon = actions.find((a) => a.id === action)?.icon ?? 'message';
      const title = outcome === 'Done' && action === 'message' ? summary().replace('Send', 'Sent') : summary();
      setLog((l) => [{ time: now(), icon, title, confidence: 'High', outcome }, ...l]);
    },
    [action, summary],
  );

  const start = useCallback((next: ActionId) => {
    setAction(next);
    setContact(0);
    setMessage(0);
    setToast(null);
  }, []);

  const value = useMemo(
    () => ({
      action,
      contact,
      message,
      log,
      toast,
      sensorsFixed,
      setSensorsFixed,
      start,
      setContact,
      setMessage,
      finish,
      setToast,
      summary,
    }),
    [action, contact, message, log, toast, sensorsFixed, start, finish, summary],
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider');
  return ctx;
}
