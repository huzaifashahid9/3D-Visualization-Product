import type { ImageSourcePropType } from 'react-native';
import { images } from '../config';

export interface Step {
  title: string;
  body: string;
  image: ImageSourcePropType;
}

export const steps: Step[] = [
  { title: 'Intend', body: 'The person thinks of a move.', image: images.stepBrain },
  { title: 'Sense', body: 'Sensors pick up brain pulses.', image: images.stepSense },
  { title: 'Decode', body: 'The chip reads the intent.', image: images.stepChip },
  { title: 'Act', body: 'The chair moves forward.', image: images.stepWheelchair },
];
