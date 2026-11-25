import { Linking } from 'react-native';

import { WEBSITE_LABEL, WEBSITE_URL } from '../config';

/**
 * Opens the IRADA landing page in the phone's browser (a new tab on web). Calls onFail if the
 * phone cannot open it, so the app can say so instead of doing nothing.
 */
export async function openWebsite(onFail: (message: string) => void) {
  try {
    await Linking.openURL(WEBSITE_URL);
  } catch {
    onFail(`Could not open ${WEBSITE_LABEL}. Check the internet connection and try again.`);
  }
}
