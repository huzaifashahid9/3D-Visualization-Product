# Halo pitch app

A mobile app for pitching a head-worn device that reads brain and body pulses and turns what a person
intends into real actions, for people living with paralysis. It shows the device the way product ads do:
a cinematic intro, a 3D model you can spin, zoom and take apart, and a short animated story of how a
thought becomes a movement.

Built with React Native and Expo (SDK 58). It runs in the **Expo Go** app, so you don't need Xcode or
Android Studio.

> "Halo" is a working name. The 3D headset is a placeholder until the real model is ready, and values in
> `[brackets]` are slots for the real specs.

## The three screens

| Screen | What it does |
| --- | --- |
| **Intro** | Violet hero with the headset floating and swaying, two floating tags and big headline. Buttons go to the 3D viewer and the "how it works" story. Can play a looping product film instead (see below). |
| **Explore in 3D** | Real-time 3D model. Drag to rotate, pinch or use the + and − buttons to zoom, and it spins on its own when idle (toggle with the spin button). Numbered hotspots stay pinned to the parts as the model turns. Tap a hotspot or a chip in the white card to read about that part. **Exploded** pulls the crown, battery and processor apart. |
| **How it works** | Four glossy 3D cards (Intend, Sense, Decode, Act) light up one after another on a loop. Tap a card to pause on it, or use the play and pause button. |

## Run it on your phone with Expo Go

You need [Node.js](https://nodejs.org) 20 or newer on your computer, and the **Expo Go** app on your phone
([iOS](https://apps.apple.com/app/expo-go/id982107779) or
[Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).

```bash
git clone https://github.com/huzaifashahid9/3d-visualization-product.git
cd 3d-visualization-product
npm install
npx expo start
```

A QR code appears in the terminal.

- **iPhone:** open the Camera app and point it at the QR code, then tap the banner.
- **Android:** open Expo Go and tap **Scan QR code**.

Your phone and computer must be on the same Wi-Fi. If the network blocks that (common on office and
venue Wi-Fi), run `npx expo start --tunnel` instead.

The first load takes a little longer because the 3D model is bundled into the app. After that the 3D
viewer works without internet, which is safer for a live pitch.

## Add the intro film

1. Put your video at `assets/video/intro.mp4` (10 to 20 seconds, looping well, under about 20 MB).
2. In `src/config.ts`, change the `INTRO_VIDEO` line to:

   ```ts
   export const INTRO_VIDEO: number | null = require('../assets/video/intro.mp4');
   ```

The film then plays muted behind the intro text, and a sound button appears in the top right.

## Swap in the real 3D model

The app shows a placeholder headset built from simple shapes. When you have the real `.glb` file:

1. **Replace the file.** Save it as `assets/models/headset.glb`. Keep it under about 15 MB; if it's bigger,
   shrink it with `npx @gltf-transform/cli optimize in.glb out.glb --compress quantize`.
2. **Embed it.** Run `npm run model`. This writes the model into `src/viewer/generated/headsetModel.ts` so
   it loads offline. (To load it from the internet instead, set `MODEL_URL` in `src/config.ts` to a https
   link to the `.glb`.)
3. **Move the hotspots.** Open the [model-viewer editor](https://modelviewer.dev/editor/), drop in your
   `.glb`, click **Add hotspot**, and click each part. Copy each hotspot's `data-position` and `data-normal`
   into `position` and `normal` in `src/data/parts.ts`, and write the part's title, text and specs there.
4. **Exploded view (optional).** The button plays two animations from the `.glb`: one that pulls the parts
   apart and one that puts them back. Name them `Explode` and `Assemble` in Blender (or change the names
   in `src/config.ts`), and set each part's `explodedOffset` in `src/data/parts.ts` to how far it moves, so
   its hotspot follows it. If the model has no such animations, the button simply does nothing.
5. **Update the still images.** `assets/images/viewer-poster.png` shows while the 3D model loads, and
   `assets/images/hero.png` is the intro picture. Replace them with renders of the real device.

## Change the words and colors

- Product name, film and model settings: `src/config.ts`
- Hotspot text and specs: `src/data/parts.ts`
- "How it works" steps and their images: `src/data/steps.ts`
- Colors, gradients and fonts: `src/theme.ts`
- Intro headline and buttons: `src/screens/IntroScreen.tsx`

## How it's built

- **3D viewer:** Google's [`<model-viewer>`](https://modelviewer.dev) running inside a
  `react-native-webview`, which works in Expo Go with no native build. The page is built in
  `src/viewer/buildViewerHtml.ts`; the app and the page talk through `postMessage` (hotspot taps) and
  `injectJavaScript` (explode, spin, zoom). The model-viewer script is bundled in
  `src/viewer/generated/modelViewerLib.ts` by `npm run vendor`.
- **Fonts:** Plus Jakarta Sans via `@expo-google-fonts`.
- **Screens:** `src/screens/`, with a simple cross-fade between them in `App.tsx`. The Android back button
  returns to the intro.

| Command | What it does |
| --- | --- |
| `npx expo start` | Start the dev server and show the QR code |
| `npm run typecheck` | Check the TypeScript |
| `npm run model` | Embed `assets/models/headset.glb` (or a path you pass) into the app |
| `npm run vendor` | Re-bundle model-viewer after upgrading `@google/model-viewer` |
