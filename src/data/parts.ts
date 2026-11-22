/**
 * The hotspots on the 3D model and the text in the part card.
 *
 * position / normal are in the model's own coordinates (the same units as the
 * .glb). When you swap in the real model, find new positions with the hotspot
 * tool at https://modelviewer.dev/editor/ : load your .glb, click "Add hotspot",
 * click on the part, and copy the data-position and data-normal values here.
 *
 * explodedOffset is how far that part moves in the "Explode" animation, so the
 * hotspot can follow it. Use [0, 0, 0] for parts that do not move.
 *
 * Values in [brackets] are placeholders for the real specs.
 */
export type Vec3 = [number, number, number];

export interface Part {
  id: string;
  title: string;
  body: string;
  specs: { label: string; value: string }[];
  position: Vec3;
  normal: Vec3;
  explodedOffset: Vec3;
}

export const parts: Part[] = [
  {
    id: 'eeg',
    title: 'EEG sensors',
    body: 'Electrodes rest on the scalp and pick up the brain’s tiny electrical signals.',
    specs: [
      { label: 'Channels', value: '[number]' },
      { label: 'Contact', value: '[dry or gel]' },
    ],
    position: [0.835, 0.75, 0],
    normal: [0.766, 0.643, 0],
    explodedOffset: [0, 0.45, 0],
  },
  {
    id: 'battery',
    title: 'Battery',
    body: 'Sits at the back of the head to balance the weight through long sessions.',
    specs: [
      { label: 'Battery life', value: '[hours]' },
      { label: 'Charging', value: '[type]' },
    ],
    position: [0, 0.02, -1.395],
    normal: [0, 0, -1],
    explodedOffset: [0, 0, -0.45],
  },
  {
    id: 'processor',
    title: 'Processor',
    body: 'Turns raw signals into a command and sends it to the chair, phone or home.',
    specs: [
      { label: 'Chip', value: '[model]' },
      { label: 'Response time', value: '[ms]' },
    ],
    position: [1.22, 0, 0.2],
    normal: [1, 0, 0],
    explodedOffset: [0.4, 0, 0],
  },
  {
    id: 'status',
    title: 'Status light',
    body: 'Shows the wearer and carer when the band is connected, reading or sending.',
    specs: [
      { label: 'Connection', value: '[Bluetooth]' },
      { label: 'States', value: '[list]' },
    ],
    position: [0, 0, 1.3],
    normal: [0, 0, 1],
    explodedOffset: [0, 0, 0],
  },
];
