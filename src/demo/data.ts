import type { IconName } from '../components/Icon';
import { colors } from '../theme';

/**
 * Sample content for the simulated IRADA app. Names, times and results here are
 * examples for the pitch, not real users or measured data.
 */

export type ActionId = 'call' | 'message' | 'emergency';

export interface Action {
  id: ActionId;
  title: string;
  note: string;
  icon: IconName;
}

/** The command menu from the document: Call caregiver, Send preset message, Emergency alert. */
export const actions: Action[] = [
  { id: 'call', title: 'Call caregiver', note: 'Calls your saved contact', icon: 'phone' },
  { id: 'message', title: 'Send message', note: 'Sends a preset message', icon: 'message' },
  {
    id: 'emergency',
    title: 'Emergency alert',
    note: 'Sends an alert and your location. Needs two yeses.',
    icon: 'alert',
  },
];

export interface Contact {
  initials: string;
  name: string;
  role: string;
}

export const contacts: Contact[] = [
  { initials: 'AH', name: 'Ahmed', role: 'Caregiver' },
  { initials: 'AM', name: 'Ammi', role: 'Mother' },
  { initials: 'RC', name: 'Clinic', role: 'Rehab centre' },
];

export const presetMessages = ['I need help', 'Please come to my room', 'I am okay', 'Please call me'];

export type SensorContact = 'good' | 'weak' | 'poor';

export interface Channel {
  name: string;
  where: string;
  state: SensorContact;
  tip?: string;
}

/** Electrode contact as the headset check first finds it: one weak, one poor. */
export const channels: Channel[] = [
  { name: 'C3', where: 'Left motor area', state: 'good' },
  { name: 'Cz', where: 'Top of head', state: 'good' },
  { name: 'C4', where: 'Right motor area', state: 'good' },
  { name: 'Fp1', where: 'Forehead', state: 'weak', tip: 'Press the forehead sensor gently onto the skin.' },
  { name: 'Oz', where: 'Back of head', state: 'good' },
  { name: 'Ear clips', where: 'Ground and reference', state: 'poor', tip: 'Move hair away from behind the ears.' },
];

export const contactColor: Record<SensorContact, string> = { good: colors.good, weak: colors.weak, poor: colors.poor };
export const contactLabel: Record<SensorContact, string> = { good: 'Good', weak: 'Weak', poor: 'Poor' };

/** Motor-imagery commands practised in calibration. */
export const commands = ['Left hand', 'Right hand', 'Feet', 'Rest'];

export type Outcome = 'Done' | 'Cancelled' | 'Timed out' | 'Stopped by button' | 'Asked again' | 'Failed: no signal';

export interface LogEntry {
  time: string;
  icon: IconName;
  title: string;
  confidence: 'High' | 'Medium' | 'Low';
  outcome: Outcome;
}

export const outcomeStyle: Record<Outcome, { bg: string; fg: string }> = {
  Done: { bg: colors.lime, fg: colors.black },
  Cancelled: { bg: '#E4E0F2', fg: '#3B3654' },
  'Stopped by button': { bg: '#E4E0F2', fg: '#3B3654' },
  'Timed out': { bg: colors.weak, fg: colors.black },
  'Asked again': { bg: colors.weak, fg: colors.black },
  'Failed: no signal': { bg: colors.poor, fg: colors.white },
};

/** Sample history shown under anything done during the demo. */
export const sampleLog: LogEntry[] = [
  { time: '10:31', icon: 'phone', title: 'Call Ahmed', confidence: 'Medium', outcome: 'Cancelled' },
  { time: '09:58', icon: 'alert', title: 'Emergency alert', confidence: 'High', outcome: 'Stopped by button' },
  { time: '09:20', icon: 'refresh', title: 'Not sure what was meant', confidence: 'Low', outcome: 'Asked again' },
  { time: '09:05', icon: 'message', title: 'Sent “I am okay” to Ammi', confidence: 'High', outcome: 'Timed out' },
  { time: '08:47', icon: 'phone', title: 'Call Clinic', confidence: 'High', outcome: 'Failed: no signal' },
];

/** How long the confirmation screen waits before cancelling by itself. */
export const CONFIRM_SECONDS = 10;
