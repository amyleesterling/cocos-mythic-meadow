// Magic Meadow. A game designed by Coco, age 4.
// The unicorn and pegasus hide in caves. The wolf tries to eat them.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/* ============================================================
   Levels
============================================================ */
const LEVELS = [
  { name: 'Sunny Meadow',      size: 120, stars: 5,  caves: 3, wolves: 1, wolfSpeed: 6.0, sight: 13, trees: 22, crystals: 6,  night: false, timer: 90, preySpeed: 6.2,
    pal: { skyTop: 0x8f7bee, skyBot: 0xffdff0, grass: 0x9fdd9a, grass2: 0xffd9b0, foliage: [0xff9ff3, 0xffb8de, 0xb983ff], rainbow: true } },
  { name: 'Buttercup Hills',   size: 130, stars: 6,  caves: 3, wolves: 1, wolfSpeed: 6.6, sight: 14, trees: 26, crystals: 6,  night: false, timer: 90, preySpeed: 6.6,
    pal: { skyTop: 0x9b86f5, skyBot: 0xfff3c9, grass: 0xc8e08e, grass2: 0xffe58a, foliage: [0xffd166, 0xff9ff3, 0xffe58a], rainbow: false } },
  { name: 'Rose Valley',       size: 140, stars: 7,  caves: 4, wolves: 1, wolfSpeed: 7.1, sight: 15, trees: 30, crystals: 8,  night: false, timer: 88, preySpeed: 6.9,
    pal: { skyTop: 0xb583ff, skyBot: 0xffc9e5, grass: 0xaad898, grass2: 0xffb8de, foliage: [0xff9ff3, 0xff7fc9, 0xffc9e5], rainbow: false } },
  { name: 'Lavender Woods',    size: 140, stars: 8,  caves: 4, wolves: 1, wolfSpeed: 7.5, sight: 15, trees: 48, crystals: 8,  night: false, timer: 85, preySpeed: 7.2,
    pal: { skyTop: 0x7f5fd6, skyBot: 0xe6d4ff, grass: 0xb7a5e8, grass2: 0xd7c4ff, foliage: [0xb983ff, 0x9b6bf0, 0xd3b6ff], rainbow: false } },
  { name: 'Crystal Springs',   size: 160, stars: 8,  caves: 4, wolves: 2, wolfSpeed: 7.2, sight: 15, trees: 30, crystals: 22, night: false, timer: 85, preySpeed: 7.4,
    pal: { skyTop: 0x86a0f0, skyBot: 0xd8f3ea, grass: 0x9fd8c0, grass2: 0xcdf0e2, foliage: [0xb983ff, 0x8ce0d2, 0xff9ff3], rainbow: false } },
  { name: 'Golden Cliffs',     size: 160, stars: 9,  caves: 5, wolves: 2, wolfSpeed: 7.7, sight: 16, trees: 26, crystals: 10, night: false, timer: 82, preySpeed: 7.6,
    pal: { skyTop: 0xb583ff, skyBot: 0xffe6a8, grass: 0xead992, grass2: 0xffcf7d, foliage: [0xffd166, 0xffb35c, 0xffe58a], rainbow: false } },
  { name: 'Twilight Meadow',   size: 170, stars: 9,  caves: 5, wolves: 2, wolfSpeed: 8.1, sight: 16, trees: 34, crystals: 12, night: 'dusk', timer: 80, preySpeed: 7.8,
    pal: { skyTop: 0x4a3b7a, skyBot: 0xff9fb0, grass: 0x7fae8f, grass2: 0xc98ab8, foliage: [0xb983ff, 0xff9ff3, 0x8a6fd0], rainbow: false } },
  { name: 'Cotton Candy Peaks',size: 180, stars: 10, caves: 5, wolves: 2, wolfSpeed: 8.5, sight: 17, trees: 40, crystals: 10, night: false, timer: 78, preySpeed: 8.0,
    pal: { skyTop: 0xff9ff3, skyBot: 0xfff0f8, grass: 0xf2bfe0, grass2: 0xffe0f0, foliage: [0xffffff, 0xffc9e5, 0xffe58a], rainbow: false } },
  { name: 'Starlight Forest',  size: 180, stars: 10, caves: 6, wolves: 3, wolfSpeed: 8.5, sight: 15, trees: 56, crystals: 16, night: true,  timer: 76, preySpeed: 8.2,
    pal: { skyTop: 0x241b45, skyBot: 0x6a4a8a, grass: 0x6b7fa0, grass2: 0x8a77b5, foliage: [0x7c5fc0, 0x9b6bf0, 0x5d4a9a], rainbow: false } },
  { name: 'Rainbow Summit',    size: 200, stars: 12, caves: 6, wolves: 3, wolfSpeed: 8.9, sight: 17, trees: 44, crystals: 18, night: false, timer: 75, preySpeed: 8.5,
    pal: { skyTop: 0x9d7bff, skyBot: 0xffd9ec, grass: 0xa8e6a3, grass2: 0xffe58a, foliage: [0xff9ff3, 0xffd166, 0xb983ff], rainbow: true } },
];

// ambient magic per level: which celestial creatures visit, ponds, auroras
const SCENERY = [
  { creatures: ['butterflies', 'stag'], ponds: 1, aurora: false },
  { creatures: ['butterflies', 'phoenix'], ponds: 1, aurora: false },
  { creatures: ['butterflies', 'fairies', 'stag'], ponds: 1, aurora: false },
  { creatures: ['fairies', 'stag', 'butterflies'], ponds: 1, aurora: false },
  { creatures: ['butterflies', 'fairies'], ponds: 3, aurora: false },
  { creatures: ['phoenix', 'dragon'], ponds: 1, aurora: false },
  { creatures: ['fireflies', 'fairies', 'whale'], ponds: 1, aurora: false },
  { creatures: ['dragon', 'butterflies', 'whale'], ponds: 1, aurora: false },
  { creatures: ['fireflies', 'fairies', 'whale', 'stag'], ponds: 1, aurora: true },
  { creatures: ['phoenix', 'dragon', 'butterflies', 'fairies'], ponds: 2, aurora: false },
];

const RAINBOW = [0xff6f91, 0xffa25c, 0xffd166, 0xa8e6a3, 0x8ccfff, 0xb983ff];

const HEART = '💛';
const CAVE_BODY_R = 2.8;
const CAVE_PAD_R = 2.4;
const CATCH_R = 1.7;

/* ============================================================
   Sound (tiny synth, no assets)
============================================================ */
const Sfx = {
  ctx: null, master: null, muted: false, musicTimer: null,
  ensure() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    this.startMusic();
  },
  tone(f0, f1, dur, type = 'sine', vol = 0.2, delay = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  },
  chime()   { this.tone(880, 1318, 0.3, 'sine', 0.22); this.tone(1318, 1760, 0.28, 'sine', 0.13, 0.07); },
  howl()    { this.tone(430, 250, 0.9, 'sawtooth', 0.05); this.tone(434, 252, 0.9, 'sawtooth', 0.04); },
  pounce()  { this.tone(180, 420, 0.16, 'square', 0.1); },
  hurt()    { this.tone(320, 140, 0.4, 'triangle', 0.22); },
  poof()    { this.tone(700, 180, 0.3, 'sine', 0.18); },
  jump()    { this.tone(330, 520, 0.14, 'sine', 0.12); },
  fanfare() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, f, 0.32, 'triangle', 0.2, i * 0.13)); },
  sad()     { [392, 330, 262].forEach((f, i) => this.tone(f, f, 0.42, 'triangle', 0.16, i * 0.22)); },
  startMusic() {
    const notes = [523, 587, 659, 784, 880, 1047, 1175];
    this.musicTimer = setInterval(() => {
      if (this.muted || document.hidden) return;
      if (Math.random() < 0.5) {
        const f = notes[(Math.random() * notes.length) | 0];
        this.tone(f, f, 1.4, 'sine', 0.035);
      }
    }, 620);
  },
};

/* ============================================================
   Renderer, camera, shared resources
============================================================ */
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.05;

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 900);

// post-processing: bloom makes every emissive thing in the realm truly glow
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(new THREE.Scene(), camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.45, 0.5, 0.9);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());
function renderFrame() {
  if (world) renderPass.scene = world.scene;
  composer.render();
}

const rendererSize = new THREE.Vector2();
function fitRenderer() {
  const w = window.innerWidth, h = window.innerHeight;
  if (w === 0 || h === 0) return;
  renderer.getSize(rendererSize);
  if (rendererSize.x !== w || rendererSize.y !== h) {
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  }
}
window.addEventListener('resize', fitRenderer);

// three-step toon gradient shared by every material
const gradientMap = (() => {
  const data = new Uint8Array([110, 180, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
})();

function toon(color, opts = {}) {
  const m = new THREE.MeshToonMaterial({ color, gradientMap });
  if (opts.emissive) { m.emissive = new THREE.Color(opts.emissive); m.emissiveIntensity = opts.emissiveIntensity ?? 0.6; }
  if (opts.transparent) { m.transparent = true; m.opacity = opts.opacity ?? 0.6; }
  return m;
}

function softCircleTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}
const particleTex = softCircleTexture();

function emojiSprite(emoji, size = 1.2) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.font = '100px serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(emoji, 64, 70);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const s = new THREE.Sprite(mat);
  s.scale.set(size, size, 1);
  return s;
}

/* ============================================================
   Particles
============================================================ */
class Particles {
  constructor(scene, max = 600) {
    this.max = max;
    this.pos = new Float32Array(max * 3);
    this.vel = new Float32Array(max * 3);
    this.col = new Float32Array(max * 3);
    this.life = new Float32Array(max);
    this.grav = new Float32Array(max);
    this.cursor = 0;
    for (let i = 0; i < max; i++) this.pos[i * 3 + 1] = -999;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
    const m = new THREE.PointsMaterial({
      size: 0.5, map: particleTex, transparent: true, opacity: 0.95,
      depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, sizeAttenuation: true,
    });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }
  emit(p, n, { colors = [0xffffff], spread = 2.5, up = 3, life = 0.9, grav = 4 } = {}) {
    const c = new THREE.Color();
    for (let k = 0; k < n; k++) {
      const i = this.cursor = (this.cursor + 1) % this.max;
      this.pos[i * 3] = p.x + (Math.random() - 0.5) * 0.5;
      this.pos[i * 3 + 1] = p.y + Math.random() * 0.5;
      this.pos[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.5;
      this.vel[i * 3] = (Math.random() - 0.5) * spread;
      this.vel[i * 3 + 1] = Math.random() * up;
      this.vel[i * 3 + 2] = (Math.random() - 0.5) * spread;
      c.set(colors[(Math.random() * colors.length) | 0]);
      this.col[i * 3] = c.r; this.col[i * 3 + 1] = c.g; this.col[i * 3 + 2] = c.b;
      this.life[i] = life * (0.5 + Math.random() * 0.7);
      this.grav[i] = grav;
    }
  }
  update(dt) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= dt;
      if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -999; continue; }
      this.vel[i * 3 + 1] -= this.grav[i] * dt;
      this.pos[i * 3] += this.vel[i * 3] * dt;
      this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt;
      this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
}

const SPARKLE = [0xffd166, 0xff9ff3, 0xb983ff, 0xffffff];

/* ============================================================
   Character models (built from primitives, toon shaded)
============================================================ */
function addShadows(group) {
  group.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
}

function makeEye(irisColor, glow = false) {
  const eye = new THREE.Group();
  const white = new THREE.Mesh(new THREE.SphereGeometry(0.115, 28, 20), toon(0xffffff));
  const iris = new THREE.Mesh(
    new THREE.SphereGeometry(0.072, 24, 18),
    glow ? toon(irisColor, { emissive: irisColor, emissiveIntensity: 1.2 }) : toon(irisColor)
  );
  iris.position.z = 0.055;
  const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.038, 20, 16), toon(0x2a1a3a));
  pupil.position.z = 0.1;
  if (glow) pupil.scale.set(0.6, 1.4, 1);
  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), toon(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1 }));
  glint.position.set(0.03, 0.035, 0.125);
  eye.add(white, iris, pupil, glint);
  return eye;
}

function makeLeg(color, hoofColor) {
  const leg = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.1, 0.09, 0.85, 18);
  geo.translate(0, -0.425, 0);
  leg.add(new THREE.Mesh(geo, toon(color)));
  const hoof = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 16), toon(hoofColor));
  hoof.position.y = -0.85;
  hoof.scale.set(1, 0.75, 1);
  leg.add(hoof);
  return leg;
}

// Quadruped facing +Z
function buildPony(kind) {
  const isUni = kind === 'unicorn';
  const bodyColor = isUni ? 0xfff5fa : 0xf1e9ff;
  const hoofColor = isUni ? 0xffd166 : 0xb983ff;
  const maneColors = isUni ? [0xff9ff3, 0xb983ff, 0xff9ff3, 0xb983ff, 0xff9ff3] : [0xffd166, 0xffe58a, 0xffd166, 0xffe58a, 0xffd166];
  const irisColor = isUni ? 0x8a5cff : 0xff6fb5;

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.56, 36, 26), toon(bodyColor));
  torso.position.y = 1.0;
  torso.scale.set(0.95, 0.9, 1.45);
  body.add(torso);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), toon(bodyColor));
  chest.position.set(0, 1.1, 0.5);
  body.add(chest);

  const head = new THREE.Group();
  head.position.set(0, 1.72, 0.8);
  body.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 36, 26), toon(bodyColor));
  head.add(skull);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.17, 28, 20), toon(0xfff0f6));
  snout.position.set(0, -0.11, 0.32);
  snout.scale.set(1, 0.78, 0.95);
  head.add(snout);

  const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), toon(0xcc6fa8));
  nostril.position.set(0.055, -0.13, 0.46);
  head.add(nostril);
  const nostril2 = nostril.clone(); nostril2.position.x = -0.055;
  head.add(nostril2);

  // ears
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.26, 20), toon(bodyColor));
    ear.position.set(0.2 * s, 0.37, -0.05);
    ear.rotation.z = -0.25 * s;
    head.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 16), toon(0xffb8de));
    inner.position.set(0.2 * s, 0.36, -0.02);
    inner.rotation.z = -0.25 * s;
    head.add(inner);
  }

  // big friendly eyes and blush
  const eyeL = makeEye(irisColor); eyeL.position.set(0.165, 0.09, 0.3); eyeL.rotation.y = 0.3; eyeL.scale.setScalar(1.18); head.add(eyeL);
  const eyeR = makeEye(irisColor); eyeR.position.set(-0.165, 0.09, 0.3); eyeR.rotation.y = -0.3; eyeR.scale.setScalar(1.18); head.add(eyeR);
  for (const s of [-1, 1]) {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 16), toon(0xffb0d8));
    blush.position.set(0.28 * s, -0.08, 0.24);
    blush.scale.set(1, 0.55, 0.5);
    head.add(blush);
  }

  // spiral horn: smooth cone wrapped in tapering golden ridges
  let horn = null;
  if (isUni) {
    horn = new THREE.Group();
    const hornMat = toon(0xffd166, { emissive: 0xffb347, emissiveIntensity: 1.2 });
    horn.add(new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 24), hornMat));
    for (let k = 0; k < 3; k++) {
      const ridge = new THREE.Mesh(new THREE.TorusGeometry(0.072 - k * 0.019, 0.017, 10, 26), hornMat);
      ridge.position.y = -0.13 + k * 0.13;
      ridge.rotation.x = Math.PI / 2;
      horn.add(ridge);
    }
    horn.position.set(0, 0.48, 0.1);
    horn.rotation.x = -0.22;
    head.add(horn);
  }

  // full flowing mane along the neck
  for (let i = 0; i < 8; i++) {
    const mc = maneColors[i % maneColors.length];
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.135 - i * 0.006, 24, 18), toon(mc));
    puff.position.set(Math.sin(i * 2.1) * 0.045, 2.08 - i * 0.11, 0.58 - i * 0.15);
    body.add(puff);
  }
  // two small forelock puffs framing the forehead
  for (const s of [-1, 1]) {
    const forelock = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 18), toon(maneColors[(s + 1) / 2]));
    forelock.position.set(0.1 * s, 0.34, 0.19);
    head.add(forelock);
  }

  // tail
  const tail = new THREE.Group();
  tail.position.set(0, 1.22, -0.86);
  const tailColors = isUni ? [0xff9ff3, 0xb983ff, 0xffb8de, 0xff9ff3] : [0xffd166, 0xffe58a, 0xfff3c9, 0xffd166];
  tailColors.forEach((tc, i) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.145 - i * 0.022, 24, 18), toon(tc));
    puff.position.set(Math.sin(i * 2.4) * 0.03, -0.1 - i * 0.17, -0.08 - i * 0.11);
    tail.add(puff);
  });
  body.add(tail);

  // legs
  const legs = [];
  const legPos = [[0.32, 0.45], [-0.32, 0.45], [0.32, -0.48], [-0.32, -0.48]];
  for (const [x, z] of legPos) {
    const leg = makeLeg(bodyColor, hoofColor);
    leg.position.set(x, 0.98, z);
    body.add(leg);
    legs.push(leg);
  }

  // wings: overlapping feathers swept up and back
  let wings = null;
  if (kind === 'pegasus') {
    wings = [];
    for (const s of [-1, 1]) {
      const wing = new THREE.Group();
      wing.position.set(0.34 * s, 1.44, 0.05);
      for (let f = 0; f < 3; f++) {
        const feather = new THREE.Mesh(new THREE.SphereGeometry(0.3 - f * 0.045, 24, 18), toon(f === 2 ? 0xffb8de : 0xffffff));
        feather.position.set((0.24 + f * 0.3) * s, 0.06 + f * 0.1, -0.08 - f * 0.16);
        feather.scale.set(1.3, 0.24, 0.72);
        feather.rotation.y = 0.3 * f * s;
        feather.rotation.z = 0.12 * s;
        wing.add(feather);
      }
      wing.rotation.z = 0.3 * s;
      body.add(wing);
      wings.push(wing);
    }
  }

  addShadows(root);
  return { group: root, body, head, legs, tail, wings, horn, eyes: [eyeL, eyeR] };
}

function buildWolf() {
  const fur = 0x7d6fa8;
  const furDark = 0x655787;
  const furLight = 0xcfc4e8;

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.66, 36, 26), toon(fur));
  torso.position.y = 0.95;
  torso.scale.set(1, 0.95, 1.5);
  body.add(torso);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.5, 30, 22), toon(furLight));
  belly.position.set(0, 0.72, 0.15);
  belly.scale.set(0.85, 0.7, 1.2);
  body.add(belly);

  const ruff = new THREE.Mesh(new THREE.SphereGeometry(0.52, 30, 22), toon(furLight));
  ruff.position.set(0, 1.1, 0.5);
  ruff.scale.set(1, 0.9, 0.8);
  body.add(ruff);

  const head = new THREE.Group();
  head.position.set(0, 1.66, 0.9);
  body.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.46, 36, 26), toon(fur));
  head.add(skull);

  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.22, 28, 20), toon(furLight));
  snout.position.set(0, -0.14, 0.38);
  snout.scale.set(1, 0.8, 1.15);
  head.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 16), toon(0x3a2f56));
  nose.position.set(0, -0.08, 0.6);
  head.add(nose);

  // grin: little white fangs peeking out
  for (const s of [-1, 1]) {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 12), toon(0xffffff));
    fang.position.set(0.1 * s, -0.27, 0.44);
    fang.rotation.x = Math.PI;
    head.add(fang);
  }

  // big pointy ears with pink inside
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 20), toon(fur));
    ear.position.set(0.25 * s, 0.42, -0.05);
    ear.rotation.z = -0.3 * s;
    head.add(ear);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 16), toon(0xffb8de));
    inner.position.set(0.25 * s, 0.4, 0);
    inner.rotation.z = -0.3 * s;
    head.add(inner);
  }

  // fluffy cheek tufts for a wilder silhouette
  for (const s of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      const fluff = new THREE.Mesh(new THREE.ConeGeometry(0.1 - k * 0.03, 0.28, 12), toon(k ? furLight : fur));
      fluff.position.set(0.42 * s, -0.08 - k * 0.1, 0.08);
      fluff.rotation.z = s * 1.75;
      fluff.rotation.x = 0.2;
      head.add(fluff);
    }
  }

  // glowing amber eyes + mischievous eyebrows
  const eyeL = makeEye(0xffcc55, true); eyeL.position.set(0.19, 0.06, 0.34); eyeL.rotation.y = 0.35; head.add(eyeL);
  const eyeR = makeEye(0xffcc55, true); eyeR.position.set(-0.19, 0.06, 0.34); eyeR.rotation.y = -0.35; head.add(eyeR);
  for (const s of [-1, 1]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.045, 0.05), toon(furDark));
    brow.position.set(0.18 * s, 0.24, 0.36);
    brow.rotation.z = -0.45 * s;
    head.add(brow);
  }

  // big fluffy tail, tip lighter
  const tail = new THREE.Group();
  tail.position.set(0, 1.25, -0.9);
  const tailBits = [[0.24, fur, 0], [0.2, fur, 1], [0.17, fur, 2], [0.13, furLight, 3]];
  for (const [r, c, i] of tailBits) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 18), toon(c));
    puff.position.set(Math.sin(i * 2.2) * 0.03, 0.1 + i * 0.15, -0.12 - i * 0.14);
    tail.add(puff);
  }
  body.add(tail);

  const legs = [];
  const legPos = [[0.32, 0.45], [-0.32, 0.45], [0.32, -0.5], [-0.32, -0.5]];
  for (const [x, z] of legPos) {
    const leg = makeLeg(furDark, furLight);
    leg.position.set(x, 0.9, z);
    body.add(leg);
    legs.push(leg);
  }

  addShadows(root);
  const g = { group: root, body, head, legs, tail, wings: null, horn: null, eyes: [eyeL, eyeR] };
  root.scale.setScalar(1.12);
  return g;
}

function buildModel(kind) {
  return kind === 'wolf' ? buildWolf() : buildPony(kind);
}

/* ============================================================
   Mythical ambient creatures and scenery
============================================================ */
function buildMountains(scene, cfg) {
  const base = new THREE.Color(cfg.pal.skyTop).lerp(new THREE.Color(cfg.pal.skyBot), 0.35);
  const n = 14;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.35;
    const r = cfg.size * (1.05 + Math.random() * 0.35);
    const h = 13 + Math.random() * 18;
    const w = 11 + Math.random() * 9;
    const c = base.clone().offsetHSL((Math.random() - 0.5) * 0.02, 0, (Math.random() - 0.5) * 0.06);
    const peak = new THREE.Mesh(new THREE.ConeGeometry(w, h, 5 + (i % 3)), toon(c));
    peak.position.set(Math.cos(a) * r, h * 0.5 - 5, Math.sin(a) * r);
    peak.rotation.y = Math.random() * Math.PI;
    scene.add(peak);
    const hc = h * 0.3;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(w * 0.31, hc, 5 + (i % 3)), toon(0xfff5fb));
    cap.position.set(peak.position.x, h - 5 - hc * 0.5 + 0.15, peak.position.z);
    cap.rotation.y = peak.rotation.y;
    scene.add(cap);
  }
}

function buildPond() {
  // pick the flattest of a few candidate spots so the water sits in a dip
  let best = null, bestVar = Infinity;
  for (let tries = 0; tries < 14; tries++) {
    const { x, z } = randomInWorld(world.size, 12, world.bound - 8);
    if (world.caves.some(c => dist2D(x, z, c.x, c.z) < 10)) continue;
    const hs = [world.H(x, z), world.H(x + 4, z), world.H(x - 4, z), world.H(x, z + 4), world.H(x, z - 4)];
    const v = Math.max(...hs) - Math.min(...hs);
    if (v < bestVar) { bestVar = v; best = { x, z, y: Math.min(...hs) }; }
  }
  if (!best) return;
  const r = 4 + Math.random() * 2.5;
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      t: { value: Math.random() * 10 },
      deep: { value: new THREE.Color(0x7fa8e8) },
      shallow: { value: new THREE.Color(0xc5ecf5) },
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec2 vUv; uniform float t; uniform vec3 deep; uniform vec3 shallow;
      void main(){
        float d = length(vUv - 0.5) * 2.0;
        float ripple = 0.5 + 0.5 * sin(d * 24.0 - t * 2.4);
        vec3 col = mix(shallow, deep, d) + ripple * 0.06;
        float sparkle = pow(max(0.0, sin(vUv.x * 43.0 + t * 1.3) * sin(vUv.y * 39.0 - t * 1.7)), 16.0);
        col += sparkle * 0.85;
        float alpha = 0.85 * smoothstep(1.0, 0.88, d);
        gl_FragColor = vec4(col, alpha);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(r, 36), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(best.x, best.y + 0.22, best.z);
  world.scene.add(mesh);
  world.ponds.push(mat);
}

function buildAurora(scene) {
  for (let i = 0; i < 3; i++) {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: { t: { value: i * 2.1 } },
      vertexShader: `varying vec2 vUv; uniform float t;
        void main(){ vUv = uv; vec3 p = position; p.y += sin(uv.x * 6.283 + t * 0.5) * 6.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `varying vec2 vUv; uniform float t;
        void main(){
          float band = 0.5 + 0.5 * sin(vUv.x * 12.0 + t * 0.7);
          float fadeY = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
          float fadeX = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
          vec3 col = mix(vec3(0.35, 0.95, 0.75), vec3(0.75, 0.45, 0.98), 0.5 + 0.5 * sin(vUv.x * 4.0 + t * 0.4));
          gl_FragColor = vec4(col, band * fadeY * fadeX * 0.42);
        }`,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(240, 60, 32, 1), mat);
    const a = i * 2.1 + 0.6;
    mesh.position.set(Math.cos(a) * 160, 60 + i * 11, Math.sin(a) * 160);
    mesh.lookAt(0, 30, 0);
    scene.add(mesh);
    world.auroras.push(mat);
  }
}

function buildGroundDetail(scene, cfg) {
  const isNight = cfg.night === true;
  const dummy = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const sc = new THREE.Vector3();
  const pv = new THREE.Vector3();
  const cc = new THREE.Color();

  // swaying-look grass tufts (three merged blades, instanced once)
  {
    const blades = [];
    for (let b = 0; b < 3; b++) {
      const g = new THREE.ConeGeometry(0.05, 0.42, 5);
      g.translate(0, 0.21, 0);
      g.rotateZ((b - 1) * 0.22);
      g.translate((b - 1) * 0.07, 0, (b % 2) * 0.06);
      blades.push(g);
    }
    const tuftGeo = mergeGeometries(blades);
    const n = Math.floor(cfg.size * 8);
    const tufts = new THREE.InstancedMesh(tuftGeo, new THREE.MeshToonMaterial({ gradientMap }), n);
    const gc = new THREE.Color(cfg.pal.grass), gc2 = new THREE.Color(cfg.pal.grass2);
    for (let i = 0; i < n; i++) {
      const { x, z } = randomInWorld(cfg.size, 2, cfg.size / 2 - 4);
      e.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.12);
      q.setFromEuler(e);
      const s = 0.7 + Math.random() * 1.0;
      sc.set(s, s * (0.8 + Math.random() * 0.7), s);
      pv.set(x, world.H(x, z), z);
      dummy.compose(pv, q, sc);
      tufts.setMatrixAt(i, dummy);
      cc.lerpColors(gc, gc2, Math.random() * 0.6).offsetHSL(0, 0.04, -0.05 + Math.random() * 0.1);
      tufts.setColorAt(i, cc);
    }
    scene.add(tufts);
  }

  // five-petal daisies: petals, golden centers, and stems share matrices
  {
    const petals = [];
    for (let p = 0; p < 5; p++) {
      const g = new THREE.SphereGeometry(0.085, 8, 6);
      g.scale(1.4, 0.35, 0.7);
      const a = (p / 5) * Math.PI * 2;
      g.rotateY(-a);
      g.translate(Math.cos(a) * 0.12, 0.3, Math.sin(a) * 0.12);
      petals.push(g);
    }
    const petalGeo = mergeGeometries(petals);
    const centerGeo = new THREE.SphereGeometry(0.065, 8, 6); centerGeo.translate(0, 0.32, 0);
    const stemGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.3, 5); stemGeo.translate(0, 0.15, 0);
    const n = Math.floor(cfg.size * 1.4);
    const petalsIM = new THREE.InstancedMesh(petalGeo, new THREE.MeshToonMaterial({ gradientMap }), n);
    const centersIM = new THREE.InstancedMesh(centerGeo, toon(0xffd166, { emissive: 0xffc233, emissiveIntensity: 0.35 }), n);
    const stemsIM = new THREE.InstancedMesh(stemGeo, toon(0x7fbf7a), n);
    const petalCols = [0xffffff, 0xffc9e5, 0xffe58a, 0xd3b6ff, 0xff9ff3];
    for (let i = 0; i < n; i++) {
      const { x, z } = randomInWorld(cfg.size, 3, cfg.size / 2 - 4);
      e.set(0, Math.random() * Math.PI * 2, 0);
      q.setFromEuler(e);
      const s = 0.8 + Math.random() * 0.8;
      sc.set(s, s, s);
      pv.set(x, world.H(x, z), z);
      dummy.compose(pv, q, sc);
      petalsIM.setMatrixAt(i, dummy);
      centersIM.setMatrixAt(i, dummy);
      stemsIM.setMatrixAt(i, dummy);
      cc.set(petalCols[(Math.random() * petalCols.length) | 0]);
      petalsIM.setColorAt(i, cc);
    }
    scene.add(petalsIM, centersIM, stemsIM);
  }

  // scattered rocks
  {
    const n = 26;
    const rocks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.5, 0), new THREE.MeshToonMaterial({ gradientMap }), n);
    for (let i = 0; i < n; i++) {
      const { x, z } = randomInWorld(cfg.size, 6, cfg.size / 2 - 5);
      e.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
      q.setFromEuler(e);
      const s = 0.4 + Math.random() * 1.1;
      sc.set(s, s * 0.72, s);
      pv.set(x, world.H(x, z) + 0.08, z);
      dummy.compose(pv, q, sc);
      rocks.setMatrixAt(i, dummy);
      cc.set(0x9d8fc0).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
      rocks.setColorAt(i, cc);
    }
    rocks.castShadow = true;
    scene.add(rocks);
  }

  // glowing mushrooms
  {
    const capCols = [0xff6f91, 0x8ce0d2, 0xb983ff];
    for (let i = 0; i < 14; i++) {
      const { x, z } = randomInWorld(cfg.size, 6, cfg.size / 2 - 5);
      const shroom = new THREE.Group();
      const s = 0.7 + Math.random() * 0.9;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.3, 14), toon(0xfff3e6));
      stem.position.y = 0.15;
      const col = capCols[(Math.random() * 3) | 0];
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        toon(col, { emissive: col, emissiveIntensity: isNight ? 1.2 : 0.35 })
      );
      cap.position.y = 0.28;
      cap.scale.set(1, 0.8, 1);
      shroom.add(stem, cap);
      for (let d = 0; d < 2; d++) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), toon(0xffffff));
        const da = Math.random() * Math.PI * 2;
        dot.position.set(Math.cos(da) * 0.12, 0.36, Math.sin(da) * 0.12);
        shroom.add(dot);
      }
      shroom.scale.setScalar(s);
      shroom.position.set(x, world.H(x, z), z);
      addShadows(shroom);
      scene.add(shroom);
    }
  }
}

/* ---------- Celestial creatures ---------- */
function critterWings(color, w = 0.16, h = 0.12) {
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false });
  const l = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  const r = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  l.position.x = -w / 2 - 0.01; r.position.x = w / 2 + 0.01;
  return [l, r];
}

function makeButterfly(cfg) {
  const g = new THREE.Group();
  const col = [0xff9ff3, 0xffd166, 0xb983ff, 0x8ccfff][(Math.random() * 4) | 0];
  const [wl, wr] = critterWings(col, 0.2, 0.15);
  const bodyM = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 5), toon(0x5d4a7a));
  bodyM.rotation.x = Math.PI / 2;
  g.add(wl, wr, bodyM);
  world.scene.add(g);
  const anchor = randomInWorld(cfg.size, 5, world.bound - 5);
  const p1 = Math.random() * 9, f1 = 0.14 + Math.random() * 0.1;
  return {
    update(dt) {
      const t = world.t;
      const x = anchor.x + Math.sin(t * f1 + p1) * 9;
      const z = anchor.z + Math.cos(t * f1 * 1.3 + p1 * 2) * 9;
      const y = world.H(x, z) + 1.0 + Math.sin(t * 1.7 + p1) * 0.45;
      const dx = x - g.position.x, dz = z - g.position.z;
      if (Math.abs(dx) + Math.abs(dz) > 0.001) g.rotation.y = Math.atan2(dx, dz);
      g.position.set(x, y, z);
      const flap = Math.sin(t * 16 + p1) * 0.9;
      wl.rotation.y = flap; wr.rotation.y = -flap;
    },
  };
}

function makeFairy(cfg) {
  const g = new THREE.Group();
  const col = [0xffb8de, 0xffe58a, 0xd3b6ff][(Math.random() * 3) | 0];
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), toon(col, { emissive: col, emissiveIntensity: 2.4 }));
  const [wl, wr] = critterWings(0xffffff, 0.13, 0.16);
  wl.position.y = wr.position.y = 0.06;
  g.add(core, wl, wr);
  world.scene.add(g);
  const tree = world.trees.length ? world.trees[(Math.random() * world.trees.length) | 0] : { x: 0, z: 0 };
  const ay = world.H(tree.x, tree.z) + 2.4;
  const p = Math.random() * 9;
  return {
    update(dt) {
      const t = world.t;
      g.position.set(
        tree.x + Math.sin(t * 0.7 + p) * 1.6,
        ay + Math.sin(t * 1.3 + p * 2) * 0.8,
        tree.z + Math.cos(t * 0.9 + p) * 1.6
      );
      const flap = Math.sin(t * 20 + p) * 0.8;
      wl.rotation.y = flap; wr.rotation.y = -flap;
      if (Math.random() < dt * 1.2) world.particles.emit(g.position, 1, { colors: [col], spread: 0.4, up: 0.3, life: 0.8, grav: 0.4 });
    },
  };
}

function makeFireflies(cfg) {
  const n = 36;
  const base = new Float32Array(n * 3);
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const { x, z } = randomInWorld(cfg.size, 4, world.bound - 4);
    base[i * 3] = x;
    base[i * 3 + 1] = world.H(x, z) + 0.6 + Math.random() * 1.8;
    base[i * 3 + 2] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffe58a, size: 0.55, map: particleTex, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  world.scene.add(points);
  return {
    update(dt) {
      const t = world.t;
      for (let i = 0; i < n; i++) {
        pos[i * 3] = base[i * 3] + Math.sin(t * 0.6 + i * 1.7) * 1.4;
        pos[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * 0.9 + i * 2.3) * 0.5;
        pos[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.7 + i * 1.1) * 1.4;
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 0.65 + Math.sin(t * 2.2) * 0.3;
    },
  };
}

function makeStag(cfg) {
  const c = 0xf5eefc;
  const root = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.42, 30, 22), toon(c));
  torso.position.y = 1.2;
  torso.scale.set(0.75, 0.8, 1.5);
  root.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.15, 0.85, 16), toon(c));
  neck.position.set(0, 1.65, 0.5);
  neck.rotation.x = -0.35;
  root.add(neck);
  const head = new THREE.Group();
  head.position.set(0, 2.05, 0.68);
  root.add(head);
  head.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 26, 18), toon(c)));
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), toon(0xfff8ff));
  snout.position.set(0, -0.05, 0.18);
  snout.scale.set(0.8, 0.7, 1.2);
  head.add(snout);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 14), toon(c));
    ear.position.set(0.11 * s, 0.18, -0.05);
    ear.rotation.z = -0.5 * s;
    head.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), toon(0x3a2f56));
    eye.position.set(0.1 * s, 0.04, 0.15);
    head.add(eye);
    // glowing antlers: a main beam and two tines each
    const antler = new THREE.Group();
    antler.position.set(0.09 * s, 0.16, 0);
    const amat = toon(0xffd166, { emissive: 0xffc233, emissiveIntensity: 1.7 });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.52, 12), amat);
    beam.position.y = 0.26;
    beam.rotation.z = -0.4 * s;
    antler.add(beam);
    for (let k = 0; k < 2; k++) {
      const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.22, 12), amat);
      tine.position.set((0.07 + k * 0.05) * -s, 0.24 + k * 0.16, 0.03);
      tine.rotation.z = 0.7 * s;
      tine.rotation.x = -0.2;
      antler.add(tine);
    }
    head.add(antler);
  }
  const legs = [];
  for (const [x, z] of [[0.2, 0.42], [-0.2, 0.42], [0.2, -0.42], [-0.2, -0.42]]) {
    const leg = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.045, 0.04, 1.1, 14);
    geo.translate(0, -0.55, 0);
    leg.add(new THREE.Mesh(geo, toon(0xe8ddf5)));
    leg.position.set(x, 1.15, z);
    root.add(leg);
    legs.push(leg);
  }
  const tailPuff = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), toon(0xffffff));
  tailPuff.position.set(0, 1.4, -0.65);
  root.add(tailPuff);
  addShadows(root);
  root.scale.setScalar(1.1);
  world.scene.add(root);

  let waypoint = randomInWorld(cfg.size, 6, world.bound - 6);
  const p = Math.random() * 9;
  return {
    update(dt) {
      const t = world.t;
      const dx = waypoint.x - root.position.x, dz = waypoint.z - root.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 2) { waypoint = randomInWorld(cfg.size, 6, world.bound - 6); return; }
      const spd = 2.2;
      root.position.x += dx / d * spd * dt;
      root.position.z += dz / d * spd * dt;
      root.position.y = world.H(root.position.x, root.position.z);
      const target = Math.atan2(dx, dz);
      let dr = target - root.rotation.y;
      while (dr > Math.PI) dr -= Math.PI * 2;
      while (dr < -Math.PI) dr += Math.PI * 2;
      root.rotation.y += dr * Math.min(1, 4 * dt);
      for (let i = 0; i < 4; i++) legs[i].rotation.x = Math.sin(t * 5 + p + (i % 2) * Math.PI) * 0.4;
      if (Math.random() < dt * 2.5) {
        world.particles.emit(root.position, 1, { colors: [0xffe58a, 0xffd166], spread: 0.5, up: 0.6, life: 0.9, grav: 0.3 });
      }
    },
  };
}

function makeWhale(cfg) {
  const root = new THREE.Group();
  const ghost = (c, op) => {
    const m = toon(c, { emissive: 0x8a77d5, emissiveIntensity: 0.35 });
    m.transparent = true; m.opacity = op; m.depthWrite = false;
    return m;
  };
  const body = new THREE.Mesh(new THREE.SphereGeometry(2.4, 36, 26), ghost(0xb9a8f0, 0.82));
  body.scale.set(1, 0.8, 2.1);
  root.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1.9, 30, 22), ghost(0xe8ddff, 0.7));
  belly.position.set(0, -0.8, 0.6);
  belly.scale.set(0.9, 0.6, 1.7);
  root.add(belly);
  const tail = new THREE.Group();
  tail.position.set(0, 0.3, -5.2);
  for (const s of [-1, 1]) {
    const fluke = new THREE.Mesh(new THREE.SphereGeometry(1.1, 24, 16), ghost(0xb9a8f0, 0.82));
    fluke.scale.set(1.4, 0.22, 0.8);
    fluke.position.set(1.15 * s, 0, -0.3);
    fluke.rotation.y = 0.5 * s;
    tail.add(fluke);
  }
  root.add(tail);
  for (const s of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.9, 24, 16), ghost(0xcbbcf5, 0.75));
    fin.scale.set(1.3, 0.18, 0.55);
    fin.position.set(2.1 * s, -0.5, 1.2);
    fin.rotation.z = -0.35 * s;
    root.add(fin);
  }
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), toon(0x2a1a45));
    eye.position.set(1.55 * s, 0.15, 3.2);
    root.add(eye);
  }
  // a constellation glitters along its back
  for (let i = 0; i < 7; i++) {
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 5),
      toon(0xffffff, { emissive: 0xfff6d8, emissiveIntensity: 2.6 })
    );
    star.position.set((Math.random() - 0.5) * 1.6, 1.7 + Math.random() * 0.3, (Math.random() - 0.5) * 6);
    root.add(star);
  }
  root.scale.setScalar(1.6);
  world.scene.add(root);

  let theta = Math.random() * Math.PI * 2;
  const R = cfg.size * 0.5;
  const look = new THREE.Vector3();
  return {
    update(dt) {
      const t = world.t;
      theta += dt * 0.05;
      const y = 34 + Math.sin(t * 0.3) * 3;
      root.position.set(Math.cos(theta) * R, y, Math.sin(theta) * R);
      look.set(Math.cos(theta + 0.08) * R, y + Math.cos(t * 0.3) * 1.2, Math.sin(theta + 0.08) * R);
      root.lookAt(look);
      tail.rotation.x = Math.sin(t * 1.3) * 0.3;
      root.rotation.z += Math.sin(t * 0.4) * 0.04;
      if (Math.random() < dt * 4) {
        world.particles.emit(root.position.clone().add(new THREE.Vector3(0, -1, 0)), 1,
          { colors: [0xd3b6ff, 0xfff6d8], spread: 1, up: -0.5, life: 2.2, grav: 0.15 });
      }
    },
  };
}

function makePhoenix(cfg) {
  const root = new THREE.Group();
  const fire = (c, i = 0.9) => toon(c, { emissive: c, emissiveIntensity: i });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 26, 18), fire(0xffc233));
  body.scale.set(0.9, 0.9, 1.3);
  root.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), fire(0xffd166));
  head.position.set(0, 0.3, 0.5);
  root.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 14), toon(0xff8c42));
  beak.position.set(0, 0.28, 0.74);
  beak.rotation.x = Math.PI / 2;
  root.add(beak);
  for (let k = 0; k < 3; k++) {
    const crest = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), fire([0xff6f91, 0xffa25c, 0xffd166][k]));
    crest.position.set(0, 0.52 + k * 0.08, 0.42 - k * 0.08);
    root.add(crest);
  }
  const wings = [];
  const wingCols = [0xffd166, 0xffa25c, 0xff6f91];
  for (const s of [-1, 1]) {
    const wing = new THREE.Group();
    wing.position.set(0.3 * s, 0.15, 0);
    for (let f = 0; f < 3; f++) {
      const feather = new THREE.Mesh(new THREE.SphereGeometry(0.3 - f * 0.05, 20, 16), fire(wingCols[f], 0.8));
      feather.position.set((0.28 + f * 0.32) * s, f * 0.06, -0.05 - f * 0.12);
      feather.scale.set(1.4, 0.18, 0.6);
      feather.rotation.y = 0.25 * f * s;
      wing.add(feather);
    }
    root.add(wing);
    wings.push(wing);
  }
  // long tail streamers
  const streamers = [];
  const strCols = [0xff6f91, 0xffd166, 0xffa25c];
  for (let k = 0; k < 3; k++) {
    const st = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), fire(strCols[k], 0.9));
    st.scale.set(0.6, 0.5, 9);
    st.position.set((k - 1) * 0.16, -0.05 - Math.abs(k - 1) * 0.06, -1.3);
    root.add(st);
    streamers.push(st);
  }
  world.scene.add(root);

  let theta = Math.random() * Math.PI * 2;
  const R = cfg.size * 0.32;
  const look = new THREE.Vector3();
  return {
    update(dt) {
      const t = world.t;
      theta += dt * 0.16;
      const y = 14 + Math.sin(t * 0.6) * 2.5;
      root.position.set(Math.cos(theta) * R, y, Math.sin(theta) * R);
      look.set(Math.cos(theta + 0.1) * R, y, Math.sin(theta + 0.1) * R);
      root.lookAt(look);
      const flap = Math.sin(t * 9) * 0.6;
      wings[0].rotation.z = -0.3 - flap;
      wings[1].rotation.z = 0.3 + flap;
      for (let k = 0; k < 3; k++) streamers[k].rotation.x = Math.sin(t * 2.2 + k) * 0.08;
      if (Math.random() < dt * 22) {
        world.particles.emit(root.position.clone().add(new THREE.Vector3(0, -0.2, 0)), 1,
          { colors: [0xffd166, 0xff8c42, 0xff6f91], spread: 0.6, up: -0.3, life: 1.4, grav: 0.4 });
      }
    },
  };
}

function makeDragon(cfg) {
  const root = new THREE.Group();
  const bodyC = 0x9fe6c8, bellyC = 0xfff3e6, wingC = 0xcbb3f5;
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 30, 22), toon(bodyC));
  body.scale.set(0.9, 0.9, 1.4);
  root.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), toon(bellyC));
  belly.position.set(0, -0.18, 0.15);
  belly.scale.set(0.8, 0.7, 1.2);
  root.add(belly);
  const head = new THREE.Group();
  head.position.set(0, 0.5, 0.85);
  root.add(head);
  head.add(new THREE.Mesh(new THREE.SphereGeometry(0.32, 26, 18), toon(bodyC)));
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), toon(bellyC));
  snout.position.set(0, -0.08, 0.26);
  snout.scale.set(1, 0.7, 1);
  head.add(snout);
  for (const s of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 14), toon(0xffd166, { emissive: 0xffc233, emissiveIntensity: 0.8 }));
    horn.position.set(0.13 * s, 0.3, -0.05);
    horn.rotation.z = -0.35 * s;
    head.add(horn);
    const eye = makeEye(0x8a5cff);
    eye.position.set(0.15 * s, 0.08, 0.24);
    eye.rotation.y = 0.3 * s;
    eye.scale.setScalar(0.9);
    head.add(eye);
  }
  const wings = [];
  for (const s of [-1, 1]) {
    const wing = new THREE.Group();
    wing.position.set(0.35 * s, 0.35, -0.1);
    for (let f = 0; f < 2; f++) {
      const mem = new THREE.Mesh(new THREE.SphereGeometry(0.45 - f * 0.1, 20, 16), toon(wingC));
      mem.position.set((0.4 + f * 0.5) * s, f * 0.14, -0.1 * f);
      mem.scale.set(1.5, 0.12, 0.9);
      wing.add(mem);
    }
    root.add(wing);
    wings.push(wing);
  }
  const tailBits = [];
  for (let k = 0; k < 3; k++) {
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.24 - k * 0.06, 20, 16), toon(bodyC));
    seg.position.set(0, 0.05 - k * 0.04, -0.85 - k * 0.4);
    root.add(seg);
    tailBits.push(seg);
  }
  const tailFin = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 12), toon(0xffb8de));
  tailFin.position.set(0, 0, -2.1);
  tailFin.rotation.x = -Math.PI / 2;
  root.add(tailFin);
  for (let k = 0; k < 4; k++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 12), toon(bellyC));
    spike.position.set(0, 0.55 - k * 0.06, 0.2 - k * 0.35);
    root.add(spike);
  }
  root.scale.setScalar(1.3);
  world.scene.add(root);

  let theta = Math.random() * Math.PI * 2;
  const R = cfg.size * 0.4;
  const look = new THREE.Vector3();
  let puffT = 3;
  return {
    update(dt) {
      const t = world.t;
      theta -= dt * 0.11; // opposite direction from the phoenix
      const y = 20 + Math.sin(t * 0.5 + 2) * 3;
      root.position.set(Math.cos(theta) * R, y, Math.sin(theta) * R);
      look.set(Math.cos(theta - 0.1) * R, y, Math.sin(theta - 0.1) * R);
      root.lookAt(look);
      const flap = Math.sin(t * 6) * 0.7;
      wings[0].rotation.z = -0.25 - flap;
      wings[1].rotation.z = 0.25 + flap;
      for (let k = 0; k < 3; k++) tailBits[k].position.x = Math.sin(t * 3 - k * 0.8) * 0.1 * (k + 1);
      puffT -= dt;
      if (puffT <= 0) {
        puffT = 3 + Math.random() * 3;
        const mouth = root.localToWorld(new THREE.Vector3(0, 0.4, 1.5));
        world.particles.emit(mouth, 14, { colors: [0xff9ff3, 0xffd166, 0xffffff], spread: 1.6, up: 0.5, life: 1.1, grav: 0.3 });
      }
    },
  };
}

function spawnCreatures(cfg, list) {
  for (const kind of list) {
    if (kind === 'stag') world.critters.push(makeStag(cfg));
    else if (kind === 'whale') world.critters.push(makeWhale(cfg));
    else if (kind === 'phoenix') world.critters.push(makePhoenix(cfg));
    else if (kind === 'dragon') world.critters.push(makeDragon(cfg));
    else if (kind === 'fireflies') world.critters.push(makeFireflies(cfg));
    else if (kind === 'fairies') for (let i = 0; i < 6; i++) world.critters.push(makeFairy(cfg));
    else if (kind === 'butterflies') for (let i = 0; i < 8; i++) world.critters.push(makeButterfly(cfg));
  }
}

/* ============================================================
   Character wrapper (movement + animation state)
============================================================ */
class Character {
  constructor(kind, scene) {
    this.kind = kind;
    const m = buildModel(kind);
    this.mesh = m.group;
    this.parts = m;
    this.pos = this.mesh.position;
    this.heading = 0;
    this.speedMag = 0;
    this.animT = Math.random() * 10;
    this.blinkT = 2 + Math.random() * 3;
    this.blinking = 0;
    this.jumpY = 0;
    this.vy = 0;
    this.flying = false;
    this.safe = false;
    this.alive = true;
    scene.add(this.mesh);
  }
  get flyingHigh() { return this.jumpY > 2.2; }
  face(dx, dz, dt, turnRate = 10) {
    if (Math.abs(dx) < 1e-5 && Math.abs(dz) < 1e-5) return;
    const target = Math.atan2(dx, dz);
    let d = target - this.heading;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    this.heading += d * Math.min(1, turnRate * dt);
    this.mesh.rotation.y = this.heading;
  }
  animate(dt) {
    const p = this.parts;
    this.animT += dt * (1 + this.speedMag * 0.55);
    const run = Math.min(1, this.speedMag / 6);
    const t = this.animT;

    if (this.flying) {
      for (let i = 0; i < p.legs.length; i++) p.legs[i].rotation.x += (0.7 - p.legs[i].rotation.x) * Math.min(1, dt * 8);
    } else {
      for (let i = 0; i < p.legs.length; i++) {
        p.legs[i].rotation.x = Math.sin(t * 2.2 + (i % 2) * Math.PI + (i > 1 ? 0.6 : 0)) * 0.75 * run;
      }
    }
    p.body.position.y = Math.abs(Math.sin(t * 2.2)) * 0.09 * run + Math.sin(t * 0.9) * 0.02;
    p.tail.rotation.x = Math.sin(t * 1.6) * 0.25 + 0.15;
    p.tail.rotation.z = Math.sin(t * 2.3) * 0.2;
    p.head.rotation.x = Math.sin(t * 1.1) * 0.05 - run * 0.08;

    if (p.wings) {
      const flap = this.flying ? Math.sin(t * 14) * 0.85 : Math.sin(t * 3) * 0.18 + run * Math.sin(t * 8) * 0.25;
      p.wings[0].rotation.z = -0.35 - flap;
      p.wings[1].rotation.z = 0.35 + flap;
    }

    // blink
    this.blinkT -= dt;
    if (this.blinkT <= 0) { this.blinking = 0.13; this.blinkT = 2 + Math.random() * 3.5; }
    if (this.blinking > 0) {
      this.blinking -= dt;
      const s = this.blinking > 0 ? 0.12 : 1;
      for (const e of p.eyes) e.scale.y = s;
    } else {
      for (const e of p.eyes) e.scale.y = 1;
    }
  }
}

/* ============================================================
   World build
============================================================ */
let world = null;

function disposeWorld() {
  if (!world) return;
  world.scene.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) { if (m.map && m.map !== particleTex) m.map.dispose(); m.dispose(); }
    }
  });
  world = null;
}

function terrainHeightFn() {
  return (x, z) =>
    2.0 * Math.sin(x * 0.045) * Math.cos(z * 0.05) +
    1.1 * Math.sin(x * 0.11 + 1.7) * Math.sin(z * 0.09 + 0.4) +
    0.5 * Math.sin(x * 0.21 + 4.0) * Math.cos(z * 0.18 + 2.0);
}

function buildSky(scene, cfg) {
  const skyExtras = { nightStarMat: null };
  const geo = new THREE.SphereGeometry(420, 24, 12);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: { value: new THREE.Color(cfg.pal.skyTop) },
      bottom: { value: new THREE.Color(cfg.pal.skyBot) },
    },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vP; uniform vec3 top; uniform vec3 bottom; void main(){ float h = clamp(normalize(vP).y * 0.5 + 0.5, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, pow(h, 0.75)), 1.0); }',
  });
  const sky = new THREE.Mesh(geo, mat);
  scene.add(sky);

  if (cfg.night === true) {
    const n = 350;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const e = Math.random() * Math.PI * 0.45 + 0.08;
      const r = 400;
      pos[i * 3] = Math.cos(a) * Math.cos(e) * r;
      pos[i * 3 + 1] = Math.sin(e) * r;
      pos[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xfff6d8, size: 2.2, map: particleTex, transparent: true, depthWrite: false, fog: false });
    const stars = new THREE.Points(g, starMat);
    scene.add(stars);
    skyExtras.nightStarMat = starMat;
    const moon = new THREE.Mesh(new THREE.SphereGeometry(14, 36, 26), new THREE.MeshBasicMaterial({ color: 0xfff2c9, fog: false }));
    moon.position.set(-140, 190, -260);
    scene.add(moon);
  } else {
    const sun = emojiSprite('', 1);
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g2 = c.getContext('2d');
    const grad = g2.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, 'rgba(255,246,190,1)');
    grad.addColorStop(0.35, 'rgba(255,225,130,0.9)');
    grad.addColorStop(1, 'rgba(255,210,120,0)');
    g2.fillStyle = grad; g2.fillRect(0, 0, 128, 128);
    sun.material.map = new THREE.CanvasTexture(c);
    sun.material.fog = false;
    sun.scale.set(120, 120, 1);
    sun.position.set(150, 170, -240);
    scene.add(sun);
  }
  return skyExtras;
}

function buildRainbow(scene) {
  const group = new THREE.Group();
  const cols = [0xff6f91, 0xffa25c, 0xffd166, 0xa8e6a3, 0x8ccfff, 0xb983ff, 0xff9ff3];
  cols.forEach((c, i) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(58 - i * 2.2, 1.1, 12, 90, Math.PI),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55, fog: false })
    );
    group.add(arc);
  });
  group.position.set(0, 6, -170);
  scene.add(group);
}

function randomInWorld(size, minR, maxR) {
  const a = Math.random() * Math.PI * 2;
  const r = minR + Math.random() * (maxR - minR);
  return { x: Math.cos(a) * r, z: Math.sin(a) * r };
}

function buildLevel(levelIdx, mode, playerKind) {
  disposeWorld();
  const cfg = LEVELS[levelIdx];
  const scene = new THREE.Scene();
  const H = terrainHeightFn();
  const size = cfg.size;
  const bound = size / 2 - 5;

  const fogColor = new THREE.Color(cfg.pal.skyBot);
  scene.fog = new THREE.Fog(fogColor, size * 0.5, size * 1.6);

  const skyExtras = buildSky(scene, cfg);
  if (cfg.pal.rainbow) buildRainbow(scene);

  // lights
  const isNight = cfg.night === true;
  const isDusk = cfg.night === 'dusk';
  const hemi = new THREE.HemisphereLight(
    isNight ? 0x8a77c5 : isDusk ? 0xd9a0c8 : 0xfff2e0,
    new THREE.Color(cfg.pal.grass).multiplyScalar(0.7),
    isNight ? 0.9 : 1.4
  );
  scene.add(hemi);
  const sunLight = new THREE.DirectionalLight(
    isNight ? 0xa9c0ff : isDusk ? 0xffc0a0 : 0xfff3d6,
    isNight ? 1.0 : 2.2
  );
  sunLight.position.set(40, 70, 20);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.left = -50;
  sunLight.shadow.camera.right = 50;
  sunLight.shadow.camera.top = 50;
  sunLight.shadow.camera.bottom = -50;
  sunLight.shadow.camera.far = 220;
  sunLight.shadow.bias = -0.0015;
  sunLight.shadow.radius = 4;
  scene.add(sunLight);
  scene.add(sunLight.target);

  // terrain
  const seg = 150;
  const tg = new THREE.PlaneGeometry(size + 30, size + 30, seg, seg);
  tg.rotateX(-Math.PI / 2);
  const tp = tg.attributes.position;
  const colors = new Float32Array(tp.count * 3);
  const cGrass = new THREE.Color(cfg.pal.grass);
  const cGrass2 = new THREE.Color(cfg.pal.grass2);
  const cc = new THREE.Color();
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), z = tp.getZ(i);
    tp.setY(i, H(x, z));
    const n = Math.sin(x * 0.09 + z * 0.075) + Math.sin(x * 0.031 - z * 0.052 + 2);
    const mixv = THREE.MathUtils.clamp(n * 0.35 + 0.35 + (Math.random() - 0.5) * 0.12, 0, 1);
    cc.lerpColors(cGrass, cGrass2, mixv);
    colors[i * 3] = cc.r; colors[i * 3 + 1] = cc.g; colors[i * 3 + 2] = cc.b;
  }
  tg.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  tg.computeVertexNormals();
  const terrain = new THREE.Mesh(tg, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap }));
  terrain.receiveShadow = true;
  scene.add(terrain);

  const particles = new Particles(scene);

  world = {
    scene, cfg, H, size, bound, particles, sunLight,
    caves: [], stars: [], trees: [], clouds: [], collectRing: null,
    wolves: [], preys: [], t: 0,
    critters: [], ponds: [], auroras: [],
    nightStarMat: skyExtras.nightStarMat,
  };

  // trees
  const foliage = cfg.pal.foliage;
  for (let i = 0; i < cfg.trees; i++) {
    const { x, z } = randomInWorld(size, 10, bound - 2);
    const tree = new THREE.Group();
    const h = 1.6 + Math.random() * 1.6;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, h, 16), toon(0xc69c7b));
    trunk.position.y = h / 2;
    tree.add(trunk);
    const fc = foliage[(Math.random() * foliage.length) | 0];
    for (let k = 0; k < 3; k++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.9 + Math.random() * 0.5, 24, 18), toon(fc));
      puff.position.set((Math.random() - 0.5) * 0.9, h + 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 0.9);
      tree.add(puff);
    }
    tree.position.set(x, H(x, z), z);
    addShadows(tree);
    scene.add(tree);
    world.trees.push({ x, z, r: 0.75 });
  }

  // crystals
  for (let i = 0; i < cfg.crystals; i++) {
    const { x, z } = randomInWorld(size, 8, bound - 2);
    const col = [0xb983ff, 0xff9ff3, 0xffd166][(Math.random() * 3) | 0];
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.5 + Math.random() * 0.5),
      toon(col, { emissive: col, emissiveIntensity: isNight ? 1.4 : 0.5 })
    );
    crystal.scale.y = 1.8;
    crystal.position.set(x, H(x, z) + 0.5, z);
    crystal.rotation.y = Math.random() * Math.PI;
    crystal.castShadow = true;
    scene.add(crystal);
  }

  // flowers (instanced)
  {
    const n = 380;
    const fgeo = new THREE.SphereGeometry(0.11, 8, 6);
    const fmat = new THREE.MeshToonMaterial({ gradientMap });
    const inst = new THREE.InstancedMesh(fgeo, fmat, n);
    const mtx = new THREE.Matrix4();
    const fcol = new THREE.Color();
    const petalCols = [0xffd166, 0xff9ff3, 0xb983ff, 0xffffff, 0xffb8de];
    for (let i = 0; i < n; i++) {
      const { x, z } = randomInWorld(size, 3, bound);
      mtx.makeTranslation(x, H(x, z) + 0.06, z);
      inst.setMatrixAt(i, mtx);
      fcol.set(petalCols[(Math.random() * petalCols.length) | 0]);
      inst.setColorAt(i, fcol);
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    scene.add(inst);
  }

  // clouds
  for (let i = 0; i < 9; i++) {
    const cl = new THREE.Group();
    for (let k = 0; k < 4; k++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(2.4 + Math.random() * 2, 20, 16),
        toon(isNight ? 0x6a5a9a : 0xffffff, { transparent: true, opacity: isNight ? 0.5 : 0.9 })
      );
      puff.position.set(k * 2.6 - 4 + Math.random(), (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 2.5);
      puff.scale.y = 0.55;
      cl.add(puff);
    }
    cl.position.set((Math.random() - 0.5) * size * 1.4, 26 + Math.random() * 16, (Math.random() - 0.5) * size * 1.4);
    cl.userData.speed = 0.4 + Math.random() * 0.6;
    scene.add(cl);
    world.clouds.push(cl);
  }

  // caves, on a ring, entrance facing the middle
  for (let i = 0; i < cfg.caves; i++) {
    const a = (i / cfg.caves) * Math.PI * 2 + Math.random() * 0.5;
    const r = size * 0.28 + Math.random() * size * 0.1;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const y = H(x, z);
    const cave = new THREE.Group();

    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(CAVE_BODY_R, 2), toon(0x8d7bb0));
    rock.scale.set(1, 0.75, 1);
    rock.position.y = 0.3;
    cave.add(rock);
    const rock2 = new THREE.Mesh(new THREE.IcosahedronGeometry(CAVE_BODY_R * 0.6, 2), toon(0x7a689e));
    rock2.position.set(1.6, 0.2, -1.2);
    cave.add(rock2);

    // entrance: dark arch facing the world center
    const doorway = new THREE.Mesh(new THREE.CircleGeometry(1.25, 20), new THREE.MeshBasicMaterial({ color: 0x2a1a45 }));
    doorway.position.set(0, 1.0, CAVE_BODY_R * 0.92);
    cave.add(doorway);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.22, 12, 32, Math.PI), toon(0xa48fd0));
    arch.position.set(0, 1.0, CAVE_BODY_R * 0.92);
    cave.add(arch);

    // glowing safety pad in front of the entrance
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(CAVE_PAD_R, CAVE_PAD_R, 0.1, 28),
      toon(0xffe58a, { emissive: 0xffd166, emissiveIntensity: isNight ? 1.0 : 0.55, transparent: true, opacity: 0.75 })
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(CAVE_PAD_R, 0.09, 10, 48),
      toon(0xffd166, { emissive: 0xffd166, emissiveIntensity: 1.2 })
    );
    ring.rotation.x = Math.PI / 2;

    cave.position.set(x, y, z);
    cave.lookAt(0, y, 0); // entrance faces middle
    addShadows(cave);
    scene.add(cave);

    // pad sits in world space in front of the entrance
    const dir = new THREE.Vector3(-x, 0, -z).normalize();
    const padPos = new THREE.Vector3(x + dir.x * (CAVE_BODY_R + 1.4), 0, z + dir.z * (CAVE_BODY_R + 1.4));
    padPos.y = H(padPos.x, padPos.z);
    pad.position.copy(padPos).add(new THREE.Vector3(0, 0.05, 0));
    ring.position.copy(padPos).add(new THREE.Vector3(0, 0.12, 0));
    scene.add(pad, ring);

    world.caves.push({ x, z, padPos, pad, ring, bodyR: CAVE_BODY_R + 0.4 });
  }

  // the mythic realm: mountains on the horizon, detailed ground, ponds,
  // auroras, and the celestial creatures that visit this level
  buildMountains(scene, cfg);
  buildGroundDetail(scene, cfg);
  const scn = SCENERY[levelIdx];
  for (let i = 0; i < scn.ponds; i++) buildPond();
  if (scn.aurora) buildAurora(scene);
  spawnCreatures(cfg, scn.creatures);

  return { scene, cfg };
}

/* ============================================================
   Collectible stars
============================================================ */
function makeGuideArrow() {
  const g = new THREE.Group();
  const mat = toon(0xffd166, { emissive: 0xffd166, emissiveIntensity: 1 });
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.34, 20), mat);
  head.rotation.x = Math.PI / 2;
  head.position.z = 0.28;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16), mat);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = -0.06;
  g.add(head, shaft);
  return g;
}

function makeStarMesh() {
  const shape = new THREE.Shape();
  const outer = 0.55, inner = 0.24;
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? outer : inner;
    const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r, py = Math.sin(a) * r;
    if (k === 0) shape.moveTo(px, py); else shape.lineTo(px, py);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 5 });
  geo.center();
  const mesh = new THREE.Mesh(geo, toon(0xffd166, { emissive: 0xffc233, emissiveIntensity: 1.4 }));
  mesh.castShadow = true;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: particleTex, color: 0xffd166, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  glow.scale.set(2.6, 2.6, 1);
  mesh.add(glow);
  return mesh;
}

function placeStars(count) {
  const placed = [];
  let guard = 0;
  while (placed.length < count && guard++ < 800) {
    const { x, z } = randomInWorld(world.size, 8, world.bound - 3);
    if (placed.some(p => (p.x - x) ** 2 + (p.z - z) ** 2 < 64)) continue;
    if (world.caves.some(c => (c.x - x) ** 2 + (c.z - z) ** 2 < 36)) continue;
    placed.push({ x, z });
  }
  for (const p of placed) {
    const mesh = makeStarMesh();
    mesh.position.set(p.x, world.H(p.x, p.z) + 1.25, p.z);
    world.scene.add(mesh);
    world.stars.push({ mesh, taken: false, baseY: mesh.position.y, phase: Math.random() * 6 });
  }
}

/* ============================================================
   Movement helpers
============================================================ */
function dist2D(ax, az, bx, bz) { return Math.hypot(ax - bx, az - bz); }

function applyCollisions(pos, radius = 0.6) {
  // cave rocks push you out (the pad is in front, you never need to go in)
  for (const c of world.caves) {
    const d = dist2D(pos.x, pos.z, c.x, c.z);
    const R = c.bodyR + radius;
    if (d < R && d > 0.001) {
      pos.x = c.x + (pos.x - c.x) / d * R;
      pos.z = c.z + (pos.z - c.z) / d * R;
    }
  }
  for (const t of world.trees) {
    const d = dist2D(pos.x, pos.z, t.x, t.z);
    const R = t.r + radius;
    if (d < R && d > 0.001) {
      pos.x = t.x + (pos.x - t.x) / d * R;
      pos.z = t.z + (pos.z - t.z) / d * R;
    }
  }
  const d0 = Math.hypot(pos.x, pos.z);
  if (d0 > world.bound) {
    pos.x = pos.x / d0 * world.bound;
    pos.z = pos.z / d0 * world.bound;
  }
}

function nearestCavePad(x, z) {
  let best = null, bd = Infinity;
  for (const c of world.caves) {
    const d = dist2D(x, z, c.padPos.x, c.padPos.z);
    if (d < bd) { bd = d; best = c; }
  }
  return { cave: best, dist: bd };
}

function isSafeAt(x, z) {
  return nearestCavePad(x, z).dist < CAVE_PAD_R;
}

/* ============================================================
   AI: wolf hunts, ponies hide
============================================================ */
class WolfAI {
  constructor(scene, speed, sight) {
    this.ch = new Character('wolf', scene);
    this.speed = speed;
    this.sight = sight;
    this.state = 'patrol';
    this.waypoint = null;
    this.waitT = 0;
    this.circleA = 0;
    this.target = null;
    this.alert = emojiSprite('❗', 1.4);
    this.alert.position.y = 3.2;
    this.alert.visible = false;
    this.ch.mesh.add(this.alert);
    this.alertT = 0;
  }
  pickWaypoint() {
    const { x, z } = randomInWorld(world.size, 6, world.bound - 4);
    this.waypoint = { x, z };
  }
  visibleTargets(targets) {
    return targets.filter(t => t.alive && !t.safe && !t.flyingHigh &&
      dist2D(this.ch.pos.x, this.ch.pos.z, t.pos.x, t.pos.z) < this.sight);
  }
  update(dt, targets, onCatch) {
    const ch = this.ch;
    const pos = ch.pos;
    let mvx = 0, mvz = 0, spd = 0;

    if (this.alertT > 0) { this.alertT -= dt; this.alert.visible = this.alertT > 0; }

    if (this.state === 'patrol') {
      if (!this.waypoint || dist2D(pos.x, pos.z, this.waypoint.x, this.waypoint.z) < 2) this.pickWaypoint();
      mvx = this.waypoint.x - pos.x; mvz = this.waypoint.z - pos.z;
      spd = this.speed * 0.45;
      const vis = this.visibleTargets(targets);
      if (vis.length) {
        vis.sort((a, b) => dist2D(pos.x, pos.z, a.pos.x, a.pos.z) - dist2D(pos.x, pos.z, b.pos.x, b.pos.z));
        this.target = vis[0];
        this.state = 'chase';
        this.alertT = 1.4;
        Sfx.howl();
      }
    } else if (this.state === 'chase') {
      const t = this.target;
      if (!t || !t.alive) { this.state = 'patrol'; this.target = null; }
      else if (t.safe) { this.state = 'wait'; this.waitT = 3.2; this.circleA = Math.atan2(pos.z - t.pos.z, pos.x - t.pos.x); }
      else if (t.flyingHigh || dist2D(pos.x, pos.z, t.pos.x, t.pos.z) > this.sight * 1.7) { this.state = 'patrol'; this.target = null; }
      else {
        mvx = t.pos.x - pos.x; mvz = t.pos.z - pos.z;
        spd = this.speed;
        if (dist2D(pos.x, pos.z, t.pos.x, t.pos.z) < CATCH_R) onCatch(t, this);
      }
    } else if (this.state === 'wait') {
      const t = this.target;
      if (!t || !t.alive) { this.state = 'patrol'; this.target = null; }
      else if (!t.safe && !t.flyingHigh) { this.state = 'chase'; }
      else {
        this.waitT -= dt;
        this.circleA += dt * 0.9;
        const cx = t.pos.x + Math.cos(this.circleA) * 5.2;
        const cz = t.pos.z + Math.sin(this.circleA) * 5.2;
        mvx = cx - pos.x; mvz = cz - pos.z;
        spd = this.speed * 0.55;
        if (this.waitT <= 0) { this.state = 'patrol'; this.target = null; this.pickWaypoint(); }
      }
    }

    const len = Math.hypot(mvx, mvz);
    if (len > 0.01 && spd > 0) {
      mvx /= len; mvz /= len;
      pos.x += mvx * spd * dt;
      pos.z += mvz * spd * dt;
      ch.face(mvx, mvz, dt, 6);
      ch.speedMag = spd;
    } else ch.speedMag = 0;

    applyCollisions(pos, 0.7);
    pos.y = world.H(pos.x, pos.z);
    ch.safe = false;
    ch.animate(dt);
  }
}

class PreyAI {
  constructor(kind, scene, speed) {
    this.ch = new Character(kind, scene);
    this.speed = speed;
    this.state = 'wander';
    this.waypoint = null;
    this.hideT = 0;
    this.burstT = 0;
    this.hopT = Math.random() * 2;
  }
  pickWaypoint(awayFrom) {
    for (let tries = 0; tries < 6; tries++) {
      const { x, z } = randomInWorld(world.size, 6, world.bound - 4);
      if (!awayFrom || dist2D(x, z, awayFrom.x, awayFrom.z) > 22) { this.waypoint = { x, z }; return; }
    }
    this.waypoint = randomInWorld(world.size, 6, world.bound - 4);
  }
  bestCave(threat) {
    let best = null, bs = -Infinity;
    for (const c of world.caves) {
      const dSelf = dist2D(this.ch.pos.x, this.ch.pos.z, c.padPos.x, c.padPos.z);
      const dThreat = threat ? dist2D(threat.x, threat.z, c.padPos.x, c.padPos.z) : 50;
      const score = dThreat - dSelf * 1.15;
      if (score > bs) { bs = score; best = c; }
    }
    return best;
  }
  update(dt, threats, onCaught) {
    const ch = this.ch;
    if (!ch.alive) return;
    const pos = ch.pos;

    // nearest threat
    let threat = null, td = Infinity;
    for (const th of threats) {
      const d = dist2D(pos.x, pos.z, th.x, th.z);
      if (d < td) { td = d; threat = th; }
    }

    let mvx = 0, mvz = 0, spd = 0;
    if (this.burstT > 0) this.burstT -= dt;

    if (this.state === 'wander') {
      if (!this.waypoint || dist2D(pos.x, pos.z, this.waypoint.x, this.waypoint.z) < 2) this.pickWaypoint(threat);
      mvx = this.waypoint.x - pos.x; mvz = this.waypoint.z - pos.z;
      spd = this.speed * 0.5;
      if (threat && td < 16) { this.state = 'flee'; }
    } else if (this.state === 'flee') {
      const cave = this.bestCave(threat);
      if (cave) {
        mvx = cave.padPos.x - pos.x; mvz = cave.padPos.z - pos.z;
        spd = this.speed * (this.burstT > 0 ? 1.55 : 1);
        if (dist2D(pos.x, pos.z, cave.padPos.x, cave.padPos.z) < CAVE_PAD_R * 0.6) {
          this.state = 'hide'; this.hideT = 4;
        }
      } else {
        mvx = pos.x - (threat ? threat.x : 0); mvz = pos.z - (threat ? threat.z : 0);
        spd = this.speed;
      }
      if (!threat || td > 24) { this.state = 'wander'; this.pickWaypoint(threat); }
    } else if (this.state === 'hide') {
      this.hideT -= dt;
      spd = 0;
      if ((!threat || td > 20)) { this.state = 'wander'; this.pickWaypoint(threat); }
      else if (this.hideT <= 0) {
        this.state = 'flee';
        this.burstT = 2.2; // sparkle speed to break away
        world.particles.emit(pos, 18, { colors: SPARKLE, up: 4 });
        Sfx.poof();
        this.pickWaypoint(threat);
      }
    }

    const len = Math.hypot(mvx, mvz);
    if (len > 0.01 && spd > 0) {
      mvx /= len; mvz /= len;
      pos.x += mvx * spd * dt;
      pos.z += mvz * spd * dt;
      ch.face(mvx, mvz, dt, 8);
      ch.speedMag = spd;
    } else ch.speedMag = 0;

    applyCollisions(pos, 0.6);
    pos.y = world.H(pos.x, pos.z);
    ch.safe = isSafeAt(pos.x, pos.z);

    // caught check (hunt mode: player wolf is the threat)
    if (onCaught && threat && !ch.safe && td < (game.pounceT > 0 ? 2.3 : CATCH_R)) onCaught(this);

    ch.animate(dt);
  }
}

/* ============================================================
   Game state
============================================================ */
const game = {
  state: 'title',        // title | select | levels | playing | paused | complete | gameover | victory
  character: localStorage.getItem('mm_char') || 'unicorn',
  level: 0,
  mode: 'evade',         // evade | hunt
  hearts: 3,
  starsGot: 0,
  caught: 0,
  timer: 0,
  invulnT: 0,
  dashT: 0, dashCd: 0,
  pounceT: 0, pounceCd: 0,
  stamina: 1,
  jumpY: 0,
  jumpsUsed: 0,
  toastT: 0,
};
let player = null;
let companion = null;
let guideArrow = null;

const keys = new Set();
const camCtl = { yaw: 0, pitch: 0.42, dist: 10, dragging: false, lastX: 0, lastY: 0 };

function unlockedLevels() { return parseInt(localStorage.getItem('mm_unlocked') || '1', 10); }
function completedSet() { try { return new Set(JSON.parse(localStorage.getItem('mm_done') || '[]')); } catch { return new Set(); } }
function markComplete(i) {
  const s = completedSet(); s.add(i);
  localStorage.setItem('mm_done', JSON.stringify([...s]));
  localStorage.setItem('mm_unlocked', String(Math.max(unlockedLevels(), i + 2)));
}

/* ---------- UI helpers ---------- */
const $ = id => document.getElementById(id);
const screens = ['screen-title', 'screen-select', 'screen-levels', 'screen-pause', 'screen-complete', 'screen-gameover', 'screen-victory'];
function showScreen(id) {
  for (const s of screens) $(s).classList.toggle('hidden', s !== id);
  $('hud').classList.toggle('hidden', !(id === null && (game.state === 'playing')));
  if (id !== null) { $('toast').classList.add('hidden'); game.toastT = 0; }
}
function showToast(text, ms = 2600) {
  const t = $('toast');
  t.textContent = text;
  t.classList.remove('hidden');
  game.toastT = ms / 1000;
}
function flash() {
  const f = $('flash');
  f.classList.add('on');
  setTimeout(() => f.classList.remove('on'), 120);
}
function worldPopup(text, pos3) {
  const v = pos3.clone().project(camera);
  if (v.z > 1) return;
  const d = document.createElement('div');
  d.className = 'popup';
  d.textContent = text;
  d.style.left = `${(v.x * 0.5 + 0.5) * window.innerWidth}px`;
  d.style.top = `${(-v.y * 0.5 + 0.5) * window.innerHeight}px`;
  $('popups').appendChild(d);
  setTimeout(() => d.remove(), 1350);
}

function refreshLevelGrid() {
  const grid = $('level-grid');
  grid.innerHTML = '';
  const unlocked = unlockedLevels();
  const done = completedSet();
  LEVELS.forEach((lv, i) => {
    const b = document.createElement('button');
    b.className = 'level-btn' + (lv.night ? ' night' : '');
    b.disabled = i + 1 > unlocked;
    b.innerHTML = `<div class="lv-num">${b.disabled ? '🔒' : i + 1}</div>
      <div class="lv-name">${lv.name}</div>
      <div class="lv-done">${done.has(i) ? '⭐' : ''}</div>`;
    b.addEventListener('click', () => { if (!b.disabled) startLevel(i); });
    grid.appendChild(b);
  });
}

function updateHud() {
  $('hud-hearts').textContent = game.mode === 'evade' ? HEART.repeat(Math.max(0, game.hearts)) : '🐺';
  $('hud-level').textContent = `Level ${game.level + 1}: ${LEVELS[game.level].name}`;
  if (game.mode === 'evade') {
    $('hud-objective').textContent = `⭐ ${game.starsGot} / ${LEVELS[game.level].stars}`;
    $('hud-timer').classList.add('hidden');
  } else {
    $('hud-objective').textContent = `Caught ${game.caught} / 2`;
    const m = Math.floor(Math.max(0, game.timer) / 60), s = Math.floor(Math.max(0, game.timer) % 60);
    $('hud-timer').textContent = `${m}:${String(s).padStart(2, '0')}`;
    $('hud-timer').classList.remove('hidden');
  }
  $('stamina-wrap').classList.toggle('hidden', game.character !== 'pegasus');
  if (game.character === 'pegasus') $('stamina-bar').style.width = `${game.stamina * 100}%`;
}

/* ---------- Level lifecycle ---------- */
function startLevel(levelIdx) {
  Sfx.ensure();
  game.level = levelIdx;
  game.mode = game.character === 'wolf' ? 'hunt' : 'evade';
  game.hearts = 3;
  game.starsGot = 0;
  game.caught = 0;
  game.invulnT = 0;
  game.dashT = 0; game.dashCd = 0;
  game.pounceT = 0; game.pounceCd = 0;
  game.stamina = 1;
  game.jumpY = 0;
  game.jumpsUsed = 0;

  const cfg = LEVELS[levelIdx];
  game.timer = cfg.timer;

  buildLevel(levelIdx, game.mode, game.character);
  menuCast = [];

  // player
  player = new Character(game.character, world.scene);
  player.pos.set(0, world.H(0, 0), 4);

  // guide arrow floating above the player
  guideArrow = makeGuideArrow();
  world.scene.add(guideArrow);

  companion = null;
  if (game.mode === 'evade') {
    // the other pony roams the meadow too, just like in Coco's story
    const other = game.character === 'unicorn' ? 'pegasus' : 'unicorn';
    companion = new PreyAI(other, world.scene, cfg.preySpeed * 0.92);
    companion.ch.pos.set(6, world.H(6, 2), 2);
    world.preys.push(companion);

    placeStars(cfg.stars);
    for (let i = 0; i < cfg.wolves; i++) {
      const wolf = new WolfAI(world.scene, cfg.wolfSpeed, cfg.sight);
      const a = Math.PI + (i - (cfg.wolves - 1) / 2) * 0.9;
      const r = world.size * 0.36;
      wolf.ch.pos.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      wolf.ch.pos.y = world.H(wolf.ch.pos.x, wolf.ch.pos.z);
      world.wolves.push(wolf);
    }
  } else {
    // hunt mode: you are the wolf, the ponies hide
    const uni = new PreyAI('unicorn', world.scene, cfg.preySpeed);
    uni.ch.pos.set(-world.size * 0.2, 0, world.size * 0.15);
    const peg = new PreyAI('pegasus', world.scene, cfg.preySpeed * 1.05);
    peg.ch.pos.set(world.size * 0.2, 0, -world.size * 0.15);
    for (const p of [uni, peg]) {
      p.ch.pos.y = world.H(p.ch.pos.x, p.ch.pos.z);
      world.preys.push(p);
    }
    player.pos.set(0, world.H(0, 0), world.size * -0.3);
  }

  camCtl.yaw = Math.PI;
  camCtl.pitch = 0.42;

  game.state = 'playing';
  showScreen(null);
  updateHud();

  $('hud-help').textContent =
    game.character === 'pegasus' ? 'Move: WASD or arrows · Hold Space: fly · Shift: zoom!' :
    game.character === 'wolf' ? 'Move: WASD or arrows · Space: pounce · Shift: zoom!' :
    'Move: WASD or arrows · Space: jump (twice!) · Shift: zoom!';

  showToast(game.mode === 'evade'
    ? `Collect ${cfg.stars} stars! Hide on the glowing cave pads when the wolf comes!`
    : 'You are the wolf! Catch the unicorn and the pegasus before time runs out!', 4200);
}

function completeLevel() {
  game.state = 'complete';
  markComplete(game.level);
  Sfx.fanfare();
  const rating = game.mode === 'evade' ? Math.max(1, game.hearts) : (game.timer > LEVELS[game.level].timer * 0.4 ? 3 : game.timer > 10 ? 2 : 1);
  $('complete-rating').textContent = '⭐'.repeat(rating);
  $('complete-title').textContent = `Level ${game.level + 1} Complete!`;
  $('complete-text').textContent = game.mode === 'evade'
    ? 'You found every star and the wolf never ate you!'
    : 'What a sneaky wolf! You caught them both!';
  $('btn-next').classList.toggle('hidden', game.level >= LEVELS.length - 1);
  // celebrate
  for (let i = 0; i < 6; i++) {
    world.particles.emit(player.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 6, 2, (Math.random() - 0.5) * 6)), 30,
      { colors: SPARKLE, up: 7, spread: 5, life: 1.6, grav: 3 });
  }
  if (game.level >= LEVELS.length - 1) {
    setTimeout(() => { game.state = 'victory'; showScreen('screen-victory'); Sfx.fanfare(); }, 1600);
    return;
  }
  showScreen('screen-complete');
}

function gameOver(text) {
  game.state = 'gameover';
  Sfx.sad();
  $('gameover-text').textContent = text;
  showScreen('screen-gameover');
}

/* ---------- Catching ---------- */
function playerCaught(wolf) {
  if (game.invulnT > 0) return;
  game.hearts--;
  game.invulnT = 2.5;
  flash();
  Sfx.hurt();
  const hh = $('hud-hearts');
  hh.classList.remove('hit');
  void hh.offsetWidth;
  hh.classList.add('hit');
  setTimeout(() => hh.classList.remove('hit'), 700);
  world.particles.emit(player.pos, 24, { colors: [0xff9ff3, 0xffffff], up: 5 });
  updateHud();
  if (game.hearts <= 0) {
    gameOver('The wolf was too sneaky this time. Try hiding in the caves sooner!');
    return;
  }
  // whisked away to the farthest cave in a puff of sparkles
  let best = null, bd = -1;
  for (const c of world.caves) {
    let dmin = Infinity;
    for (const w of world.wolves) dmin = Math.min(dmin, dist2D(c.padPos.x, c.padPos.z, w.ch.pos.x, w.ch.pos.z));
    if (dmin > bd) { bd = dmin; best = c; }
  }
  if (best) {
    player.pos.set(best.padPos.x, best.padPos.y, best.padPos.z);
    world.particles.emit(player.pos, 26, { colors: SPARKLE, up: 5 });
  }
  for (const w of world.wolves) { w.state = 'patrol'; w.target = null; w.pickWaypoint(); }
  showToast('Whoosh! Magic saved you. Be careful!', 2200);
}

function companionCaught(prey) {
  // gentle: the friend escapes to a cave in a puff of sparkles
  world.particles.emit(prey.ch.pos, 24, { colors: SPARKLE, up: 5 });
  Sfx.poof();
  const c = world.caves[(Math.random() * world.caves.length) | 0];
  prey.ch.pos.set(c.padPos.x, c.padPos.y, c.padPos.z);
  prey.state = 'hide'; prey.hideT = 3;
  showToast(`The ${prey.ch.kind} got away just in time!`, 2000);
}

function preyCaughtByPlayer(prey) {
  if (!prey.ch.alive) return;
  prey.ch.alive = false;
  game.caught++;
  Sfx.pounce();
  world.particles.emit(prey.ch.pos, 34, { colors: SPARKLE, up: 6, spread: 4 });
  worldPopup('Got you! 🐺', prey.ch.pos);
  prey.ch.mesh.visible = false;
  showToast(`You caught the ${prey.ch.kind}! ${game.caught === 1 ? 'One more to go!' : ''}`, 2200);
  updateHud();
  if (game.caught >= world.preys.length) completeLevel();
}

/* ============================================================
   Player control + camera
============================================================ */
function updatePlayer(dt) {
  const cfg = LEVELS[game.level];
  const isPeg = game.character === 'pegasus';
  const isWolfP = game.character === 'wolf';

  // input direction relative to camera yaw
  let ix = 0, iz = 0;
  if (keys.has('KeyW') || keys.has('ArrowUp')) iz -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) iz += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
  const moving = ix !== 0 || iz !== 0;

  let base = isWolfP ? 9.5 : game.character === 'unicorn' ? 8.6 : 8.0;
  const boosting = (keys.has('ShiftLeft') || keys.has('ShiftRight')) && game.stamina > 0.05;
  if (boosting && moving) {
    base *= 1.5;
    game.stamina = Math.max(0, game.stamina - dt * (isPeg && player.flying ? 0 : 0.4));
    if (Math.random() < dt * 22) world.particles.emit(player.pos, 2, { colors: SPARKLE, up: 1.5, spread: 1, life: 0.5, grav: 1 });
  }

  // pounce (wolf player)
  if (game.pounceT > 0) { game.pounceT -= dt; base *= 2.6; }
  if (game.pounceCd > 0) game.pounceCd -= dt;

  let mvx = 0, mvz = 0;
  if (moving) {
    // camera looks from yaw offset toward the player, so forward = -(sin yaw, cos yaw)
    const a = camCtl.yaw;
    mvx = Math.sin(a) * iz + Math.cos(a) * ix;
    mvz = Math.cos(a) * iz - Math.sin(a) * ix;
    const l = Math.hypot(mvx, mvz);
    mvx /= l; mvz /= l;
    player.pos.x += mvx * base * dt;
    player.pos.z += mvz * base * dt;
    player.face(mvx, mvz, dt, 12);
    player.speedMag = base;
  } else if (game.pounceT > 0) {
    // keep sailing forward during a pounce
    player.pos.x += Math.sin(player.heading) * base * dt;
    player.pos.z += Math.cos(player.heading) * base * dt;
    player.speedMag = base;
  } else {
    player.speedMag = 0;
  }

  // vertical: jump / fly
  const ground = world.H(player.pos.x, player.pos.z);
  if (isPeg) {
    if (keys.has('Space') && game.stamina > 0.02) {
      player.vy += 26 * dt;
      game.stamina = Math.max(0, game.stamina - dt * 0.22);
      player.flying = true;
    }
    player.vy -= 16 * dt;
    player.vy = THREE.MathUtils.clamp(player.vy, -14, 7.5);
    game.jumpY = Math.max(0, game.jumpY + player.vy * dt);
    if (game.jumpY === 0) { player.vy = 0; player.flying = false; game.stamina = Math.min(1, game.stamina + dt * 0.3); }
    game.jumpY = Math.min(game.jumpY, 11);
  } else {
    player.vy -= 26 * dt;
    game.jumpY = Math.max(0, game.jumpY + player.vy * dt);
    if (game.jumpY === 0) { player.vy = 0; game.jumpsUsed = 0; }
    if (!isPeg) game.stamina = Math.min(1, game.stamina + dt * 0.25);
  }
  player.jumpY = game.jumpY;
  player.pos.y = ground + game.jumpY;

  applyCollisions(player.pos, 0.65);
  player.pos.y = world.H(player.pos.x, player.pos.z) + game.jumpY;

  player.safe = game.mode === 'evade' && isSafeAt(player.pos.x, player.pos.z) && game.jumpY < 1;

  if (game.invulnT > 0) {
    game.invulnT -= dt;
    player.mesh.visible = Math.floor(game.invulnT * 10) % 2 === 0;
  } else player.mesh.visible = true;

  player.animate(dt);

  // magic trails
  if (game.character === 'pegasus' && player.flying) {
    if (Math.random() < dt * 30) {
      world.particles.emit(player.pos.clone().add(new THREE.Vector3(0, 0.9, 0)), 2,
        { colors: RAINBOW, spread: 0.9, up: 0.3, life: 1.2, grav: 0.25 });
    }
  } else if (game.character === 'unicorn' && player.speedMag > 9) {
    if (Math.random() < dt * 24) {
      world.particles.emit(player.pos, 2, { colors: SPARKLE, spread: 1, up: 1.2, life: 0.6, grav: 1.5 });
    }
  } else if (game.character === 'wolf' && game.pounceT > 0) {
    world.particles.emit(player.pos, 2, { colors: [0x8a6fd0, 0x5d4a9a], spread: 1.4, up: 1, life: 0.5, grav: 1 });
  }

  // stars (evade)
  if (game.mode === 'evade') {
    for (const s of world.stars) {
      if (s.taken) continue;
      if (player.pos.distanceTo(s.mesh.position) < 1.7) {
        s.taken = true;
        s.mesh.visible = false;
        game.starsGot++;
        Sfx.chime();
        world.particles.emit(s.mesh.position, 22, { colors: [0xffd166, 0xffe58a, 0xffffff], up: 4, spread: 3 });
        worldPopup(`⭐ ${game.starsGot} / ${cfg.stars}`, s.mesh.position);
        updateHud();
        if (game.starsGot >= cfg.stars) completeLevel();
      }
    }
  }
}

function onSpecialKey() {
  if (game.state !== 'playing') return;
  if (game.character === 'wolf') {
    if (game.pounceCd <= 0) {
      game.pounceT = 0.35;
      game.pounceCd = 2.2;
      Sfx.pounce();
      world.particles.emit(player.pos, 8, { colors: [0xb983ff, 0xffffff], up: 2, spread: 2, life: 0.5 });
    }
  } else if (game.character === 'unicorn') {
    if (game.jumpY === 0 || game.jumpsUsed < 2) {
      if (game.jumpY > 0 && game.jumpsUsed === 0) game.jumpsUsed = 1; // safety
      player.vy = 10.5;
      game.jumpY = Math.max(game.jumpY, 0.01);
      game.jumpsUsed++;
      Sfx.jump();
      world.particles.emit(player.pos, 10, { colors: SPARKLE, up: 1, spread: 2.5, life: 0.6, grav: 1 });
    }
  }
  // pegasus flight is held Space, handled in updatePlayer
}

function updateCamera(dt) {
  const pivot = player.pos.clone().add(new THREE.Vector3(0, 1.6, 0));
  const cx = Math.sin(camCtl.yaw) * Math.cos(camCtl.pitch);
  const cy = Math.sin(camCtl.pitch);
  const cz = Math.cos(camCtl.yaw) * Math.cos(camCtl.pitch);
  const desired = pivot.clone().add(new THREE.Vector3(cx, cy, cz).multiplyScalar(camCtl.dist));
  const minY = world.H(desired.x, desired.z) + 1.2;
  if (desired.y < minY) desired.y = minY;
  // keep the camera out of cave rocks
  for (const c of world.caves) {
    const d = dist2D(desired.x, desired.z, c.x, c.z);
    const R = c.bodyR + 1.2;
    if (d < R && d > 0.001) {
      desired.x = c.x + (desired.x - c.x) / d * R;
      desired.z = c.z + (desired.z - c.z) / d * R;
      desired.y = Math.max(desired.y, world.H(c.x, c.z) + 3.2);
    }
  }
  camera.position.lerp(desired, Math.min(1, dt * 6));
  camera.lookAt(pivot);

  // shadow camera follows the player
  world.sunLight.position.set(player.pos.x + 40, 70, player.pos.z + 20);
  world.sunLight.target.position.set(player.pos.x, 0, player.pos.z);
}

function updateGuideArrow() {
  let target = null;
  if (game.mode === 'evade') {
    let bd = Infinity;
    for (const s of world.stars) {
      if (s.taken) continue;
      const d = player.pos.distanceTo(s.mesh.position);
      if (d < bd) { bd = d; target = s.mesh.position; }
    }
  } else {
    let bd = Infinity;
    for (const p of world.preys) {
      if (!p.ch.alive) continue;
      const d = player.pos.distanceTo(p.ch.pos);
      if (d < bd) { bd = d; target = p.ch.pos; }
    }
  }
  if (!target) { guideArrow.visible = false; return; }
  guideArrow.visible = true;
  const bob = Math.sin(world.t * 3.2) * 0.12;
  guideArrow.position.copy(player.pos).add(new THREE.Vector3(0, 2.75 + bob, 0));
  guideArrow.lookAt(target.x, guideArrow.position.y - 0.5, target.z);
}

/* ============================================================
   Main loop
============================================================ */
let lastT = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  fitRenderer();
  if (!world || !player) return;

  world.t += dt;

  // ambient life runs in every state so menus and result screens stay alive
  for (const s of world.stars) {
    if (s.taken) continue;
    s.mesh.rotation.y += dt * 1.8;
    s.mesh.position.y = s.baseY + Math.sin(world.t * 2 + s.phase) * 0.18;
  }
  for (const c of world.caves) {
    const p = 1 + Math.sin(world.t * 2.4) * 0.06;
    c.ring.scale.setScalar(p);
  }
  for (const cl of world.clouds) {
    cl.position.x += cl.userData.speed * dt;
    if (cl.position.x > world.size) cl.position.x = -world.size;
  }
  for (const cr of world.critters) cr.update(dt);
  for (const pm of world.ponds) pm.uniforms.t.value = world.t;
  for (const am of world.auroras) am.uniforms.t.value += dt;
  if (world.nightStarMat) world.nightStarMat.opacity = 0.7 + Math.sin(world.t * 1.7) * 0.3;
  world.particles.update(dt);

  const inMenu = game.state === 'title' || game.state === 'select' || game.state === 'levels';
  if (inMenu) {
    // slow scenic orbit behind the menus
    const a = world.t * 0.06;
    camera.position.set(Math.sin(a) * 26, 9 + Math.sin(world.t * 0.15) * 2, Math.cos(a) * 26);
    camera.lookAt(0, 2.5, 0);
    player.animate(dt);
    for (const c of menuCast) c.animate(dt);
  }

  if (game.state !== 'playing') { renderFrame(); return; }

  updatePlayer(dt);

  // AI
  if (game.mode === 'evade') {
    const targets = [player, ...world.preys.map(p => p.ch)];
    for (const w of world.wolves) {
      w.update(dt, targets, (t) => {
        if (t === player) playerCaught(w);
        else companionCaught(world.preys.find(p => p.ch === t));
      });
    }
    const threats = world.wolves.map(w => ({ x: w.ch.pos.x, z: w.ch.pos.z }));
    for (const p of world.preys) p.update(dt, threats, null);
  } else {
    game.timer -= dt;
    if (game.timer <= 0) {
      gameOver('The ponies were too quick! Time ran out.');
      renderFrame();
      return;
    }
    const threats = [{ x: player.pos.x, z: player.pos.z }];
    for (const p of world.preys) p.update(dt, threats, preyCaughtByPlayer);
    updateHud();
  }

  // player safe shimmer
  if (player.safe && Math.random() < dt * 10) {
    world.particles.emit(player.pos.clone().add(new THREE.Vector3(0, 1, 0)), 2, { colors: [0xffe58a], up: 1.5, spread: 1.5, life: 0.6, grav: 0.5 });
  }
  // pegasus stamina HUD
  if (game.character === 'pegasus') $('stamina-bar').style.width = `${game.stamina * 100}%`;

  updateGuideArrow();
  updateCamera(dt);

  // toast timeout
  if (game.toastT > 0) {
    game.toastT -= dt;
    if (game.toastT <= 0) $('toast').classList.add('hidden');
  }

  renderFrame();
}
requestAnimationFrame(tick);

/* ============================================================
   Input wiring
============================================================ */
window.addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (e.code === 'Escape') {
    if (game.state === 'playing') { game.state = 'paused'; showScreen('screen-pause'); }
    else if (game.state === 'paused') { game.state = 'playing'; showScreen(null); $('hud').classList.remove('hidden'); }
    return;
  }
  if (!keys.has(e.code) && e.code === 'Space') onSpecialKey();
  keys.add(e.code);
});
window.addEventListener('keyup', (e) => keys.delete(e.code));

canvas.addEventListener('pointerdown', (e) => {
  camCtl.dragging = true;
  camCtl.lastX = e.clientX; camCtl.lastY = e.clientY;
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!camCtl.dragging) return;
  camCtl.yaw -= (e.clientX - camCtl.lastX) * 0.005;
  camCtl.pitch = THREE.MathUtils.clamp(camCtl.pitch + (e.clientY - camCtl.lastY) * 0.004, 0.08, 1.1);
  camCtl.lastX = e.clientX; camCtl.lastY = e.clientY;
});
canvas.addEventListener('pointerup', () => camCtl.dragging = false);
canvas.addEventListener('wheel', (e) => {
  camCtl.dist = THREE.MathUtils.clamp(camCtl.dist + e.deltaY * 0.01, 6, 18);
}, { passive: true });

/* ---------- Buttons ---------- */
$('btn-play').addEventListener('click', () => { Sfx.ensure(); game.state = 'select'; showScreen('screen-select'); });
$('btn-back-title').addEventListener('click', () => { game.state = 'title'; showScreen('screen-title'); });
$('btn-back-select').addEventListener('click', () => { game.state = 'select'; showScreen('screen-select'); });

for (const card of document.querySelectorAll('.char-card')) {
  card.addEventListener('click', () => {
    game.character = card.dataset.char;
    localStorage.setItem('mm_char', game.character);
    game.state = 'levels';
    refreshLevelGrid();
    showScreen('screen-levels');
  });
}

$('btn-resume').addEventListener('click', () => { game.state = 'playing'; showScreen(null); $('hud').classList.remove('hidden'); });
$('btn-restart').addEventListener('click', () => startLevel(game.level));
$('btn-quit').addEventListener('click', () => { game.state = 'levels'; refreshLevelGrid(); showScreen('screen-levels'); });

$('btn-next').addEventListener('click', () => startLevel(game.level + 1));
$('btn-again').addEventListener('click', () => startLevel(game.level));
$('btn-complete-levels').addEventListener('click', () => { game.state = 'levels'; refreshLevelGrid(); showScreen('screen-levels'); });

$('btn-retry').addEventListener('click', () => startLevel(game.level));
$('btn-gameover-levels').addEventListener('click', () => { game.state = 'levels'; refreshLevelGrid(); showScreen('screen-levels'); });

$('btn-victory-title').addEventListener('click', () => { game.state = 'title'; showScreen('screen-title'); });

$('btn-mute').addEventListener('click', () => {
  Sfx.ensure();
  Sfx.muted = !Sfx.muted;
  $('btn-mute').textContent = Sfx.muted ? '🔇' : '🔊';
});
$('btn-pause').addEventListener('click', () => {
  if (game.state === 'playing') { game.state = 'paused'; showScreen('screen-pause'); }
});

/* ---------- Debug handle (used by automated tests) ---------- */
window.MM = {
  get world() { return world; },
  get player() { return player; },
  game, camera, renderer, startLevel, Sfx, keys, camCtl, tick,
};

/* ---------- Boot: pretty background world behind the title ---------- */
let menuCast = [];
buildLevel(0, 'evade', 'unicorn');
player = new Character('unicorn', world.scene);
player.pos.set(0, world.H(0, 0), 4);
player.face(1, 0.4, 1, 100);
{
  const peg = new Character('pegasus', world.scene);
  peg.pos.set(-3.2, world.H(-3.2, 2), 2);
  peg.face(0.6, 1, 1, 100);
  const wolf = new Character('wolf', world.scene);
  wolf.pos.set(9, world.H(9, -6), -6);
  wolf.face(-1, 0.7, 1, 100);
  menuCast = [peg, wolf];
}
guideArrow = makeGuideArrow();
guideArrow.visible = false;
world.scene.add(guideArrow);
camera.position.set(8, 7, 16);
camera.lookAt(0, 2, 0);
renderFrame();
showScreen('screen-title');
