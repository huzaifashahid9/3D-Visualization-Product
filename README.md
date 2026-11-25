# IRADA pitch app

IRADA (Urdu for intention) is a brain-signal headset, a phone app and an AI agent that lets people living
with paralysis call family, send a message or ask for help, using commands they have practised, with a
confirmation step before anything happens. There is no physical product yet, so this app shows the headset
as an interactive 3D model, the way product ads do, and lets people try a simulated version of the IRADA app.

Everything in the app follows the IRADA Master Build Document. IRADA is an assistive prototype, not a
medical device, and the app says so.

Built with React Native and Expo (SDK 58). It runs in the **Expo Go** app, so you don't need Xcode or
Android Studio.

> The 3D headset is a placeholder built from the document's design until the real model is ready. Values in
> `[brackets]` are still to be decided, and names, times and charts in the demo are samples.

## The screens

**Pitch screens**

| Screen | What it does |
| --- | --- |
| **Intro** | Violet hero with the headset floating, two floating tags and the headline. Buttons go to the 3D viewer, How it works and the app demo. Can play a looping product film instead (see below). |
| **Explore in 3D** | Real-time 3D headset. Drag to rotate, pinch or use + and − to zoom, and it spins on its own when idle. Six hotspots: motor sensors (C3, Cz, C4), helper sensors (Oz, Fp1), ear clips, signal core, battery and cancel button. **Exploded** lifts the motor arc and opens the core and battery. |
| **How it works** | The five steps from the document (Record, Clean, Decode, Confirm, Act) light up one after another. Tap a card to pause on it. |

**The IRADA app, simulated** (the phone tab in the bottom menu; document section 12.3)

| Screen | What it does |
| --- | --- |
| Welcome and profile | Choose the person, English or Urdu, whether a caregiver is here, and the privacy promise. Links to the caregiver and therapist views. |
| Headset check | Contact for each sensor in green, yellow or red with a fix tip. **Check again** fixes them. |
| Calibration | Get ready, imagine, rest, with a countdown and trial counter. Ends on the accuracy per command. |
| Home menu | Big tiles for Call caregiver, Send message and Emergency alert, with a highlight that moves on its own. |
| Intent detected | The command and its confidence, with Confirm and Cancel. |
| Recipient and message | Pick a contact and a preset message. |
| Confirmation | Full-screen question with a 10 second countdown that cancels by itself. |
| Result | What happened and when, and what a failure looks like. |
| Emergency | Needs two yeses in a row (or a caregiver tap) and shares the location. |
| Activity log | Every action with time, confidence and outcome. Actions from the demo are added at the top. |
| Settings and safety | Timeouts, caregiver-only locks, the cancel button, language, and delete or export my data. |

**Caregiver and therapist views** (document section 12.1): the caregiver can see the headset, cancel a
pending action or pause IRADA; the therapist view (marked "later" in the document) shows progress over
sessions with sample data.

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

**If it won't open on your phone:**

- Update **Expo Go** from the App Store or Play Store. This project uses Expo SDK 58, and an older Expo Go
  shows a "project is incompatible" message.
- If the phone can't reach your computer (it spins, or shows "Could not connect to the server"), stop the
  server and run `npx expo start --tunnel`. Say yes if it offers to install `@expo/ngrok`.
- After pulling new changes, run `npm install` again before `npx expo start`.

The first load takes a little longer because the 3D model is bundled into the app. After that the 3D
viewer works without internet, which is safer for a live pitch.

## Run it in a simulator or a browser

Start the server with `npx expo start`, then press a key in the terminal:

| Key | Opens | What you need |
| --- | --- | --- |
| `i` | iOS Simulator | A Mac with [Xcode](https://apps.apple.com/app/xcode/id497799835) installed (open Xcode once to finish setup). |
| `a` | Android emulator | [Android Studio](https://developer.android.com/studio) with a virtual device created in **Device Manager**. Start the emulator first, then press `a`. |
| `w` | Web browser | Nothing extra. The quickest way to click through the app on any computer. |

Expo installs Expo Go in the simulator or emulator for you the first time. In the simulator, drag with the
mouse to rotate the 3D model; to pinch-zoom, hold Option (iOS) or Ctrl (Android) while dragging, or use
the + and − buttons.

On web, the 3D viewer runs in an `<iframe>` instead of a WebView (see `src/viewer/ModelViewer.web.tsx`),
so everything works the same in the browser.

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
- Demo contacts, messages, sensors and sample log: `src/demo/data.ts`
- Colors, gradients and fonts: `src/theme.ts`
- Intro headline and buttons: `src/screens/IntroScreen.tsx`
- The IRADA app screens: `src/screens/app/`

## How it's built

- **3D viewer:** Google's [`<model-viewer>`](https://modelviewer.dev) running inside a
  `react-native-webview`, which works in Expo Go with no native build. The page is built in
  `src/viewer/buildViewerHtml.ts`; the app and the page talk through `postMessage` (hotspot taps) and
  `injectJavaScript` (explode, spin, zoom). The model-viewer script is bundled in
  `src/viewer/generated/modelViewerLib.ts` by `npm run vendor`.
- **Fonts:** Plus Jakarta Sans via `@expo-google-fonts`.
- **Screens:** `src/screens/` (pitch) and `src/screens/app/` (the simulated IRADA app), with a cross-fade
  between them in `App.tsx`. The list of screens and where the Android back button goes is in
  `src/navigation.ts`. The demo's state (chosen action, contact, message, activity log) lives in
  `src/demo/DemoContext.tsx`.

| Command | What it does |
| --- | --- |
| `npx expo start` | Start the dev server and show the QR code |
| `npm run typecheck` | Check the TypeScript |
| `npm run model` | Embed `assets/models/headset.glb` (or a path you pass) into the app |
| `npm run vendor` | Re-bundle model-viewer after upgrading `@google/model-viewer` |
| `python3 scripts/make-icons.py` | Rebuild the app icons and favicon from `src/assets/logos/irada-logo-transparent.png` (needs `pip install pillow numpy`) |
