import { ASSEMBLE_ANIMATION, EXPLODE_ANIMATION } from '../config';
import type { Part } from '../data/parts';
import { colors } from '../theme';

/**
 * The first camera angle: a three-quarter view from slightly above, pulled back
 * (125% of the fitted distance) so the exploded parts stay in frame.
 */
export const DEFAULT_ORBIT = '40deg 72deg 125%';

interface Options {
  modelUri: string;
  modelViewerScript: string;
  parts: Part[];
}

/**
 * The page that runs inside the WebView. It hosts Google's <model-viewer>,
 * draws the numbered hotspots, and talks to React Native through postMessage
 * (taps on hotspots, load progress) and window.halo (commands from the app).
 */
export function buildViewerHtml({ modelUri, modelViewerScript, parts }: Options): string {
  const hotspots = parts
    .map(
      (p, i) => `
    <button class="hs" slot="hotspot-${i}" data-index="${i}" data-visibility-attribute="visible"
      data-position="${p.position.join(' ')}" data-normal="${p.normal.join(' ')}"
      aria-label="${p.title}">
      <span class="label">${p.title}</span>
      <span class="dot">${i + 1}</span>
    </button>`,
    )
    .join('');

  const config = JSON.stringify({
    parts: parts.map((p) => ({ position: p.position, offset: p.explodedOffset })),
    explode: EXPLODE_ANIMATION,
    assemble: ASSEMBLE_ANIMATION,
    orbit: DEFAULT_ORBIT,
  });

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: transparent;
    -webkit-tap-highlight-color: transparent; -webkit-user-select: none; user-select: none;
    font-family: -apple-system, system-ui, 'Segoe UI', Roboto, sans-serif; }
  model-viewer { width: 100%; height: 100%; background: transparent; outline: none;
    --poster-color: transparent; --progress-bar-height: 0px; }
  .hs { width: 44px; height: 44px; border: 0; padding: 0; background: transparent; cursor: pointer;
    display: flex; align-items: center; justify-content: center; position: relative;
    transition: opacity .3s; }
  .hs:not([data-visible]) { opacity: 0; pointer-events: none; }
  body.moving .hs { opacity: 0; pointer-events: none; }
  .dot { width: 28px; height: 28px; border-radius: 14px; background: ${colors.white}; color: ${colors.black};
    font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 14px rgba(14,11,26,.3); transition: all .25s; }
  .hs.on .dot { width: 32px; height: 32px; border-radius: 16px; background: ${colors.lime}; font-size: 14px;
    box-shadow: 0 0 0 6px rgba(212,255,58,.35), 0 8px 18px rgba(14,11,26,.35); }
  .label { position: absolute; bottom: 46px; left: 50%; transform: translateX(-50%); white-space: nowrap;
    background: ${colors.black}; color: ${colors.white}; font-weight: 700; font-size: 12px;
    padding: 7px 12px; border-radius: 999px; opacity: 0; transition: opacity .25s; pointer-events: none; }
  .hs.on .label { opacity: 1; }
</style>
</head>
<body>
<model-viewer id="mv" camera-controls touch-action="none" disable-pan
  auto-rotate auto-rotate-delay="1500" rotation-per-second="18deg" interaction-prompt="none"
  camera-orbit="${DEFAULT_ORBIT}" min-camera-orbit="auto 25deg auto" max-camera-orbit="auto 105deg auto"
  shadow-intensity="1.1" shadow-softness="0.9" exposure="1.05"
  environment-image="neutral" animation-crossfade-duration="0" loading="eager">
  ${hotspots}
</model-viewer>
<script>${modelViewerScript}</script>
<script>
(function () {
  var CONFIG = ${config};
  var mv = document.getElementById('mv');
  var exploded = false;
  var selected = 0;

  function post(msg) {
    var data = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(data);
    // On web the page runs in an <iframe>; tell the app through the parent window.
    else if (window.parent && window.parent !== window) window.parent.postMessage({ halo: data }, '*');
  }
  function hotspotPosition(i) {
    var p = CONFIG.parts[i].position, o = CONFIG.parts[i].offset, k = exploded ? 1 : 0;
    return (p[0] + o[0] * k) + 'm ' + (p[1] + o[1] * k) + 'm ' + (p[2] + o[2] * k) + 'm';
  }
  function paintSelection() {
    var buttons = document.querySelectorAll('.hs');
    for (var i = 0; i < buttons.length; i++) buttons[i].classList.toggle('on', i === selected);
  }

  document.querySelectorAll('.hs').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      selected = Number(b.getAttribute('data-index'));
      paintSelection();
      post({ type: 'select', index: selected });
    });
  });

  mv.addEventListener('progress', function (e) { post({ type: 'progress', value: e.detail.totalProgress }); });
  mv.addEventListener('load', function () { post({ type: 'loaded' }); });
  mv.addEventListener('error', function (e) {
    post({ type: 'error', message: String((e.detail && e.detail.type) || 'Could not load the 3D model') });
  });
  mv.addEventListener('finished', function () {
    for (var i = 0; i < CONFIG.parts.length; i++) mv.updateHotspot({ name: 'hotspot-' + i, position: hotspotPosition(i) });
    document.body.classList.remove('moving');
  });

  window.halo = {
    select: function (i) { selected = i; paintSelection(); },
    setAutoRotate: function (on) { mv.autoRotate = !!on; },
    setExploded: function (on) {
      on = !!on;
      if (on === exploded) return;
      exploded = on;
      if (mv.availableAnimations.indexOf(CONFIG.explode) === -1) return;
      document.body.classList.add('moving');
      mv.animationName = on ? CONFIG.explode : CONFIG.assemble;
      mv.play({ repetitions: 1 });
    },
    zoom: function (factor) {
      var o = mv.getCameraOrbit();
      mv.cameraOrbit = o.theta + 'rad ' + o.phi + 'rad ' + (o.radius * factor) + 'm';
    },
    reset: function () { mv.cameraOrbit = CONFIG.orbit; mv.fieldOfView = 'auto'; }
  };

  paintSelection();
  mv.src = ${JSON.stringify(modelUri)};
})();
</script>
</body>
</html>`;
}
