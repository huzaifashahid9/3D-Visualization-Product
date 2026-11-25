import { Share } from 'react-native';

import { WEBSITE_LABEL } from '../config';
import type { LogEntry } from './data';

/** Opens the phone's share sheet. Calls onFail where sharing is not available (some browsers). */
export async function shareText(title: string, message: string, onFail: () => void) {
  try {
    await Share.share({ title, message });
  } catch {
    onFail();
  }
}

/** The activity log as plain text, one action per line. */
export function logAsText(person: string, log: LogEntry[]) {
  const lines = log.map((e) => `${e.time}  ${e.title} · ${e.outcome} · confidence ${e.confidence}`);
  return [`IRADA activity log · ${person}`, '', ...(lines.length ? lines : ['No actions yet.']), '', 'Sample data from the IRADA demo.', WEBSITE_LABEL].join('\n');
}
