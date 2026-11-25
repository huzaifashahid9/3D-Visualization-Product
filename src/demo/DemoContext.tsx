import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  actions,
  contacts,
  people,
  presetMessages,
  sampleLog,
  type ActionId,
  type LogEntry,
  type Outcome,
  type Person,
} from './data';

/**
 * State for the simulated IRADA app: who is using it, what they picked, the safety settings,
 * and the activity log. Every action ends in the log, as the document requires.
 */
interface DemoState {
  /** The profile chosen on the welcome screen. */
  person: Person;
  personIndex: number;
  setPersonIndex(i: number): void;
  urdu: boolean;
  setUrdu(v: boolean): void;
  /** Whether a caregiver is with the user. Only then can the caregiver confirm an emergency. */
  caregiverHere: boolean;
  setCaregiverHere(v: boolean): void;
  voicePrompts: boolean;
  setVoicePrompts(v: boolean): void;
  /** Paused by the caregiver: nothing can be started until they resume. */
  paused: boolean;
  setPaused(v: boolean): void;

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
  /**
   * Records how the current action ended. Pass a title when the action ended before it was
   * complete, such as a message cancelled before anyone was chosen.
   */
  finish(outcome: Outcome, title?: string): void;
  addLog(entry: Omit<LogEntry, 'time'>): void;
  /** Deletes the activity log and resets the headset check, like "Delete my data". */
  clearData(): void;
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
  const [personIndex, setPersonIndex] = useState(0);
  const [urdu, setUrdu] = useState(false);
  const [caregiverHere, setCaregiverHere] = useState(true);
  const [voicePrompts, setVoicePrompts] = useState(true);
  const [paused, setPaused] = useState(false);
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

  const addLog = useCallback((entry: Omit<LogEntry, 'time'>) => {
    setLog((l) => [{ ...entry, time: now() }, ...l]);
  }, []);

  const finish = useCallback(
    (outcome: Outcome, title?: string) => {
      const icon = actions.find((a) => a.id === action)?.icon ?? 'message';
      const text =
        title ?? (outcome === 'Done' && action === 'message' ? summary().replace(/^Send/, 'Sent') : summary());
      addLog({ icon, title: text, confidence: 'High', outcome });
    },
    [action, summary, addLog],
  );

  const start = useCallback((next: ActionId) => {
    setAction(next);
    setContact(0);
    setMessage(0);
    setToast(null);
  }, []);

  const clearData = useCallback(() => {
    setLog([]);
    setSensorsFixed(false);
  }, []);

  const value = useMemo(
    () => ({
      person: people[personIndex],
      personIndex,
      setPersonIndex,
      urdu,
      setUrdu,
      caregiverHere,
      setCaregiverHere,
      voicePrompts,
      setVoicePrompts,
      paused,
      setPaused,
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
      addLog,
      clearData,
      setToast,
      summary,
    }),
    [
      personIndex,
      urdu,
      caregiverHere,
      voicePrompts,
      paused,
      action,
      contact,
      message,
      log,
      toast,
      sensorsFixed,
      start,
      finish,
      addLog,
      clearData,
      summary,
    ],
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used inside DemoProvider');
  return ctx;
}
