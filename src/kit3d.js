// Herramientas 3D comunes: texturas por código, materiales, cajas redondeadas y libros.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { coverSVG } from './art.js';

export { THREE };

export function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const hashStr = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

const trnd = mulberry32(21);
const TR = (a, b) => a + (b - a) * trnd();

/* ---------- Texturas ---------- */

export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

export function woodTex(base, grain, repeat, w = 256, h = 256) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) {
      const y = TR(0, h); g.strokeStyle = grain; g.globalAlpha = TR(.05, .2); g.lineWidth = TR(.6, 2.4);
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * .05 + i) * TR(1, 3));
      g.stroke();
    }
    g.globalAlpha = .12; g.fillStyle = grain;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(TR(20, w - 20), TR(20, h - 20), TR(4, 9), TR(2, 4), 0, 0, 7); g.fill(); }
  }, repeat);
}

function planks(hue, sat, light, vary) {
  return canvasTex(512, 512, (g, w, h) => {
    const rows = 8, ph = h / rows;
    for (let r = 0; r < rows; r++) {
      let x = -TR(0, 200);
      while (x < w) {
        const len = TR(150, 330);
        g.fillStyle = `hsl(${hue + TR(-3, 3)} ${sat + TR(-6, 6)}% ${light + TR(-vary, vary)}%)`;
        g.fillRect(x, r * ph, len, ph);
        g.strokeStyle = 'rgba(40,20,10,.25)'; g.lineWidth = 2; g.strokeRect(x, r * ph, len, ph);
        g.globalAlpha = .13; g.strokeStyle = '#3a2010';
        for (let k = 0; k < 4; k++) { const yy = r * ph + TR(4, ph - 4); g.beginPath(); g.moveTo(x, yy); g.lineTo(x + len, yy + TR(-2, 2)); g.stroke(); }
        g.globalAlpha = 1; x += len;
      }
    }
  });
}
function tiles(a, b, line) {
  return canvasTex(512, 512, (g, w, h) => {
    const n = 4, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s);
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(i * s, j * s, s, 6);
      g.globalAlpha = .06; for (let k = 0; k < 30; k++) { g.fillStyle = '#000'; g.fillRect(i * s + TR(0, s), j * s + TR(0, s), 2, 2); } g.globalAlpha = 1;
    }
    g.strokeStyle = line; g.lineWidth = 3;
    for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, h); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(w, i * s); g.stroke(); }
  });
}
function herringbone(base, dark) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const s = 64;
    for (let i = 0; i < w / s; i++) for (let j = 0; j < h / s; j++) {
      g.save(); g.translate(i * s, j * s); g.fillStyle = (i + j) % 2 ? dark : base; g.fillRect(2, 2, s - 4, s / 2 - 3); g.fillRect(2, s / 2 + 1, s / 2 - 3, s / 2 - 3); g.restore();
    }
  });
}
export const FLOORS = {
  roble: { name: 'Roble claro', make: () => planks(31, 46, 62, 6), sw: '#cf9e66' },
  nogal: { name: 'Nogal oscuro', make: () => planks(24, 40, 36, 5), sw: '#7a4d33' },
  pino: { name: 'Pino pálido', make: () => planks(36, 52, 76, 5), sw: '#e6c796' },
  damero: { name: 'Damero crema y verde', make: () => tiles('#f1e6cc', '#6a9a84', 'rgba(60,50,40,.35)'), sw: '#8fb59f' },
  terracota: { name: 'Baldosa terracota', make: () => tiles('#c9794f', '#b86b44', 'rgba(70,35,20,.4)'), sw: '#c26f47' },
  espiga: { name: 'Espiga', make: () => herringbone('#b98a5c', '#9a6f46'), sw: '#a87b50' },
};
const floorCache = {};
export const floorTex = (id) => (floorCache[id] ??= (FLOORS[id] ?? FLOORS.roble).make());

function paperPattern(base, accent, kind) {
  return () => canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    g.fillStyle = accent;
    if (kind === 'rayas') for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 12, h);
    else if (kind === 'puntos') for (let y = 16; y < h; y += 48) for (let x = 16; x < w; x += 48) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); g.beginPath(); g.arc(x + 24, y + 24, 3, 0, 7); g.fill(); }
    else if (kind === 'rombos') for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.save(); g.translate(x + 32, y + 32); g.rotate(Math.PI / 4); g.globalAlpha = .5; g.fillRect(-7, -7, 14, 14); g.restore(); }
    else if (kind === 'ladrillo') { for (let r = 0; r < 8; r++) for (let c = -1; c < 4; c++) { g.fillStyle = `hsl(${TR(8, 14)} ${TR(40, 52)}% ${TR(38, 46)}%)`; g.fillRect(c * 64 + (r % 2) * 32 + 2, r * 32 + 2, 60, 28); } }
    else g.fillRect(0, 0, 0, 0);
    if (kind === 'liso') { g.globalAlpha = .05; for (let i = 0; i < 300; i++) { g.fillStyle = '#000'; g.fillRect(TR(0, w), TR(0, h), 2, 2); } g.globalAlpha = 1; }
  });
}
export const WALLS = {
  crema: { name: 'Crema a rayas', make: paperPattern('#efe0c0', 'rgba(160,110,70,.12)', 'rayas'), wain: '#3f6b66', sw: '#efe0c0' },
  salvia: { name: 'Verde salvia', make: paperPattern('#aebf9b', 'rgba(255,255,255,.12)', 'puntos'), wain: '#f0e6cf', sw: '#aebf9b' },
  azul: { name: 'Azul empolvado', make: paperPattern('#9db7c8', 'rgba(255,255,255,.16)', 'rombos'), wain: '#f0e6cf', sw: '#9db7c8' },
  terracota: { name: 'Terracota', make: paperPattern('#cf8b6a', 'rgba(90,40,20,.12)', 'rayas'), wain: '#5a3a2a', sw: '#cf8b6a' },
  mostaza: { name: 'Mostaza', make: paperPattern('#e0b552', 'rgba(120,70,10,.12)', 'puntos'), wain: '#4a3a2e', sw: '#e0b552' },
  lila: { name: 'Lila suave', make: paperPattern('#b9a6cf', 'rgba(255,255,255,.14)', 'rombos'), wain: '#4a3a64', sw: '#b9a6cf' },
  ladrillo: { name: 'Ladrillo visto', make: paperPattern('#a85a3e', '', 'ladrillo'), wain: null, sw: '#a85a3e' },
  noche: { name: 'Azul noche', make: paperPattern('#34455f', 'rgba(255,230,160,.18)', 'puntos'), wain: '#e8d8b0', sw: '#34455f' },
};
const wallCache = {};
export const wallTex = (id) => (wallCache[id] ??= (WALLS[id] ?? WALLS.crema).make());

/* ---------- Materiales ---------- */

export const M = (color, rough = .8, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
export const MT = (map, rough = .8) => new THREE.MeshStandardMaterial({ map, roughness: rough });
export const MG = (color, intensity = 1.2) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: .6 });
export const mWalnut = MT(woodTex('#7b4d33', '#3a2015', [1, 1]), .72);
export const mOak = MT(woodTex('#c79a63', '#6b4423', [1, 1]), .7);
export const mPine = MT(woodTex('#e0b784', '#8a5a2e', [1, 1]), .7);
export const mDark = M('#4a2f24', .7);
export const mPage = M('#f0e4c4', 1);
export const mTerra = M('#c4704a', .85);
export const mSoil = M('#3a2a1e', 1);
export const mBrass = M('#c9a24d', .4, .7);

/* ---------- Geometría ---------- */

const keepGeo = (g) => { g.userData.keep = true; return g; };
export function box(w, h, d, mat, r = 0.025) {
  const rr = Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005);
  const g = rr > 0.002 ? new RoundedBoxGeometry(w, h, d, 3, rr) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
}
export function boxAt(parent, w, h, d, mat, x, yb, z, r) { const m = box(w, h, d, mat, r); m.position.set(x, yb + h / 2, z); parent.add(m); return m; }
export function cyl(rt, rb, h, mat, seg = 28) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.castShadow = m.receiveShadow = true; return m; }
export function cylAt(parent, rt, rb, h, mat, x, yb, z, seg) { const m = cyl(rt, rb, h, mat, seg); m.position.set(x, yb + h / 2, z); parent.add(m); return m; }
export function sph(r, mat, sx = 1, sy = 1, sz = 1) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), mat); m.scale.set(sx, sy, sz); m.castShadow = m.receiveShadow = true; return m; }
export function shade(g) { g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }
export function disposeTree(root) {
  root.traverse((o) => { if (o.geometry && !o.geometry.userData.keep) o.geometry.dispose(); if (o.userData.ownMat) o.material.dispose?.(); });
}

/* ---------- Libros ---------- */

const spineMats = new Map();
export function spineMat(b) {
  if (spineMats.has(b.id)) return spineMats.get(b.id);
  const tex = canvasTex(48, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, b.pal[0]); gr.addColorStop(1, b.pal[1]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = b.pal[2]; g.fillRect(0, 14, w, 6); g.fillRect(0, h - 34, w, 4); g.fillRect(0, h - 24, w, 10);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(3, 0, 3, h);
    g.save(); g.translate(w / 2 + 3, h / 2 + 2); g.rotate(-Math.PI / 2);
    g.fillStyle = b.pal[3]; g.font = '700 24px Fraunces, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(b.title.length > 16 ? b.title.slice(0, 15) + '…' : b.title, 0, 0); g.restore();
  });
  const sides = M(b.pal[1], .9);
  const arr = [sides, sides, M(b.pal[0], .9), sides, new THREE.MeshStandardMaterial({ map: tex, roughness: .75 }), sides];
  spineMats.set(b.id, arr);
  return arr;
}
export const clearBookCaches = (ids) => ids.forEach((id) => { spineMats.delete(id); coverTex.delete(id); });
const geoCache = new Map();
export function spineBook(b, t, h, d) {
  const k = `${t.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`;
  if (!geoCache.has(k)) geoCache.set(k, keepGeo(new THREE.BoxGeometry(t, h, d)));
  const m = new THREE.Mesh(geoCache.get(k), spineMat(b));
  m.castShadow = true; m.receiveShadow = true; return m;
}

// Portada: se dibuja con el mismo SVG del resto del juego (motivos y colores) sobre un lienzo.
const coverTex = new Map();
export function coverTexture(b) {
  if (coverTex.has(b.id)) return coverTex.get(b.id);
  const c = document.createElement('canvas'); c.width = 240; c.height = 360;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, b.pal[0]); gr.addColorStop(1, b.pal[1]);
  g.fillStyle = gr; g.fillRect(0, 0, 240, 360);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const img = new Image();
  img.onload = () => { g.drawImage(img, 0, 0, 240, 360); t.needsUpdate = true; };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(coverSVG(b, 120, 180).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))}`;
  coverTex.set(b.id, t);
  return t;
}

// Libro con la cubierta a la vista. De pie mira a +z; origen en el centro de la base.
export function displayBook(b, W = .3, H = .44, T = .055) {
  const g = new THREE.Group();
  const front = box(W, H, .014, new THREE.MeshStandardMaterial({ map: coverTexture(b), roughness: .6 }), .004); front.position.set(0, H / 2, T / 2 - .007);
  const back = box(W, H, .014, M(b.pal[1], .8), .004); back.position.set(0, H / 2, -T / 2 + .007);
  const spine = box(.016, H, T, M(b.pal[0], .8), .004); spine.position.set(-W / 2 + .008, H / 2, 0);
  const pages = box(W - .026, H - .02, T - .028, b.ed ? M(b.ed.edge, .3, .55) : mPage, .002); pages.position.set(.006, H / 2, 0);
  [front, back, spine, pages].forEach((m) => { m.userData.ownMat = m !== pages || !!b.ed; g.add(m); });
  return g;
}
// Libro tumbado con la cubierta hacia arriba; el "arriba" del título apunta a -z local.
export function lyingBook(b, W = .27, L = .4, T = .05) {
  const o = new THREE.Group();
  const bk = displayBook(b, W, L, T);
  bk.rotation.x = -Math.PI / 2; bk.position.set(0, T / 2, L / 2);
  o.add(bk);
  return o;
}
