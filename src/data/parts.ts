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
 * Specs come from the IRADA build document. Values in [brackets] are still to be decided.
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
    id: 'motor',
    title: 'Motor sensors',
    body: 'Three electrodes on an ear-to-ear arc sit over the motor area. They pick up the signal when the user imagines a movement they have practised.',
    specs: [
      { label: 'Positions', value: 'C3 · Cz · C4' },
      { label: 'Layout', value: '10-20 system' },
    ],
    position: [0, 1.15, 0],
    normal: [0, 1, 0],
    explodedOffset: [0, 0.5, 0],
  },
  {
    id: 'helper',
    title: 'Helper sensors',
    body: 'Oz at the back of the head tracks the alpha rhythm, and Fp1 on the forehead catches blinks so they can be cleaned out of the signal.',
    specs: [
      { label: 'Oz', value: 'Alpha rhythm' },
      { label: 'Fp1', value: 'Blinks' },
    ],
    position: [0, 0, -1.32],
    normal: [0, 0, -1],
    explodedOffset: [0, 0, 0],
  },
  {
    id: 'ear-clips',
    title: 'Ear clips',
    body: 'Ground and reference electrodes rest on the bone behind each ear and give every other sensor a steady zero to measure against.',
    specs: [
      { label: 'Placement', value: 'Behind each ear' },
      { label: 'Role', value: 'Ground + reference' },
    ],
    position: [1.078, -0.48, -0.506],
    normal: [0.948, 0, -0.319],
    explodedOffset: [0, 0, 0],
  },
  {
    id: 'core',
    title: 'Signal core',
    body: 'An amplifier and converter turn microvolt brain signals into data, and an ESP32 sends it to the phone over Bluetooth Low Energy.',
    specs: [
      { label: 'Sampling', value: '~250 per second' },
      { label: 'Link', value: 'Bluetooth LE' },
    ],
    position: [0.658, 0, -1.288],
    normal: [0.569, 0, -0.822],
    explodedOffset: [0.353, 0, -0.51],
  },
  {
    id: 'battery',
    title: 'Battery',
    body: 'A rechargeable cell with a protection and charging circuit. The headset only ever runs on battery, never on mains power.',
    specs: [
      { label: 'Cell', value: '3.7 V LiPo' },
      { label: 'Capacity', value: '1,000–2,000 mAh' },
    ],
    position: [-0.658, 0, -1.288],
    normal: [-0.569, 0, -0.822],
    explodedOffset: [-0.353, 0, -0.51],
  },
  {
    id: 'cancel',
    title: 'Cancel button',
    body: 'A physical button and status light. Pressing the button always cancels, whatever the app is doing.',
    specs: [
      { label: 'Button', value: 'Always cancels' },
      { label: 'Light', value: '[states]' },
    ],
    position: [-1.082, 0, 0.664],
    normal: [-0.914, 0, 0.405],
    explodedOffset: [-0.366, 0, 0.162],
  },
];
