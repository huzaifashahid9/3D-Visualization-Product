import type { ImageSourcePropType } from 'react-native';
import { images } from '../config';

export interface Step {
  title: string;
  body: string;
  image: ImageSourcePropType;
}

/** The five steps from the IRADA build document. */
export const steps: Step[] = [
  { title: 'Record', body: 'Scalp sensors pick up brain signals.', image: images.stepRecord },
  { title: 'Clean', body: 'Blinks, muscle and mains noise come out.', image: images.stepClean },
  { title: 'Decode', body: 'Your own model names the command.', image: images.stepDecode },
  { title: 'Confirm', body: 'You say yes, or it cancels itself.', image: images.stepConfirm },
  { title: 'Act', body: 'IRADA calls family, sends a message or asks for help.', image: images.stepAct },
];
