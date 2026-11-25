import type { ImageSourcePropType } from 'react-native';

/**
 * One place for the things you are likely to change before a pitch.
 */

/** Product name shown in the app. IRADA is Urdu for intention or will. */
export const PRODUCT_NAME = 'irada';

/** The IRADA landing page. Opened from the intro screen and Settings, and added to exports. */
export const WEBSITE_URL = 'https://irada.live';
/** The same address as people read it, without https://. */
export const WEBSITE_LABEL = 'irada.live';

/**
 * Intro film. Leave as null to show the floating 3D headset render instead.
 * To use a video: put it at assets/video/intro.mp4 and change this line to
 *   export const INTRO_VIDEO: number | null = require('../assets/video/intro.mp4');
 * Keep it short (10 to 20 seconds), muted-friendly, and under ~20 MB.
 */
export const INTRO_VIDEO: number | null = null;

/**
 * Where the 3D viewer loads the model from.
 * - null (default): the model embedded by `npm run model` from assets/models/headset.glb.
 *   Works offline, which is safest for a live pitch.
 * - A https URL to a .glb file: loaded over the internet instead. Handy for very
 *   large models; the phone needs a connection.
 */
export const MODEL_URL: string | null = null;

/** Names of the two animations inside the .glb that pull the parts apart and back. */
export const EXPLODE_ANIMATION = 'Explode';
export const ASSEMBLE_ANIMATION = 'Assemble';

/** Images used while the 3D model loads and on the intro screen. */
export const images: Record<string, ImageSourcePropType> = {
  hero: require('../assets/images/hero.png'),
  viewerPoster: require('../assets/images/viewer-poster.png'),
  stepRecord: require('../assets/images/step-record.png'),
  stepClean: require('../assets/images/step-clean.png'),
  stepDecode: require('../assets/images/step-decode.png'),
  stepConfirm: require('../assets/images/step-confirm.png'),
  stepAct: require('../assets/images/step-act.png'),
};

/**
 * The IRADA logo (white and lime, for dark backgrounds). irada-logo-transparent.* is the original
 * artwork; the three below are cut from it at app sizes: the round mark, the IRADA wordmark, and
 * the full logo with "by Hexabytes".
 */
export const logos = {
  mark: require('./assets/logos/irada-mark.png') as ImageSourcePropType,
  wordmark: require('./assets/logos/irada-wordmark.png') as ImageSourcePropType,
  full: require('./assets/logos/irada-logo.png') as ImageSourcePropType,
};
/** Width divided by height of each logo image, so they are never stretched. */
export const logoRatio = { wordmark: 720 / 167, full: 900 / 672 };
