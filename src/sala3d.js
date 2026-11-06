// Prototipo 3D de la librería: sala con cámara en 4 esquinas, estanterías con libros, mesa redonda de novedades,
// mostrador, rincón de lectura, puerta al almacén y barra inferior. Todo generado por código (sin modelos externos).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BOOKS } from './books.js';

try { await Promise.race([Promise.all(['700 20px Fraunces','600 20px Caveat','700 20px Nunito','400 20px Nunito'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}

const COLS = 10, ROWS = 8, WALL_H = 2.7;
const HX = COLS / 2, HZ = ROWS / 2;

function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry32(11);
const R = (a, b) => a + (b - a) * rnd();
const pick = arr => arr[Math.floor(rnd() * arr.length)];

// ───────────────────────── renderer / escena ─────────────────────────
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 120);

// ───────────────────────── texturas por código ─────────────────────────
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
function woodTex(base, grain, repeat, w = 256, h = 256) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 50; i++) {
      const y = R(0, h); g.strokeStyle = grain; g.globalAlpha = R(.05, .2); g.lineWidth = R(.6, 2.4);
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * .05 + i) * R(1, 3));
      g.stroke();
    }
    g.globalAlpha = .12; g.fillStyle = grain;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(R(20, w - 20), R(20, h - 20), R(4, 9), R(2, 4), 0, 0, 7); g.fill(); }
  }, repeat);
}
const floorTex = canvasTex(512, 512, (g, w, h) => {
  const rows = 8, ph = h / rows;
  for (let r = 0; r < rows; r++) {
    let x = -R(0, 200);
    while (x < w) {
      const len = R(150, 330);
      const l = 62 + R(-6, 6);
      g.fillStyle = `hsl(${R(28, 34)} ${R(40, 52)}% ${l}%)`;
      g.fillRect(x, r * ph, len, ph);
      g.strokeStyle = 'rgba(70,40,20,.22)'; g.lineWidth = 2; g.strokeRect(x, r * ph, len, ph);
      g.globalAlpha = .12; g.strokeStyle = '#6b4020';
      for (let k = 0; k < 4; k++) { const yy = r * ph + R(4, ph - 4); g.beginPath(); g.moveTo(x, yy); g.lineTo(x + len, yy + R(-2, 2)); g.stroke(); }
      g.globalAlpha = 1;
      x += len;
    }
  }
}, [HX * 2 / 2, HZ * 2 / 2]);
const paperTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#efe0c0'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(160,110,70,.10)';
  for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 12, h);
  g.fillStyle = 'rgba(140,90,60,.16)';
  for (let y = 16; y < h; y += 64) for (let x = 16; x < w; x += 64) { g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); g.beginPath(); g.arc(x + 32, y + 32, 2.6, 0, 7); g.fill(); }
}, [1, 1]);
const rugTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#a2453a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8cf9a'; g.fillRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#35605c'; g.fillRect(26, 26, w - 52, h - 52);
  g.strokeStyle = '#e8cf9a'; g.lineWidth = 3;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { g.save(); g.translate(w / 2 + (i - 2) * 38, h / 2 + (j - 2) * 38); g.rotate(Math.PI / 4); g.strokeRect(-11, -11, 22, 22); g.restore(); }
  g.fillStyle = '#e8cf9a'; g.globalAlpha = .6; for (let x = 0; x < w; x += 8) { g.fillRect(x, 0, 3, 8); g.fillRect(x, h - 8, 3, 8); }
});
const roundRugTex = canvasTex(256, 256, (g, w, h) => {
  const c = w / 2;
  [[128, '#4d6b5a'], [112, '#f0dfb8'], [98, '#c06a52'], [80, '#f0dfb8'], [70, '#4d6b5a']].forEach(([r, col]) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill(); });
  g.strokeStyle = '#f0dfb8'; g.lineWidth = 2;
  for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(i * Math.PI / 6) * 68, c + Math.sin(i * Math.PI / 6) * 68); g.stroke(); }
});

const M = (color, rough = .8, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
const MT = (map, rough = .8) => new THREE.MeshStandardMaterial({ map, roughness: rough });
const MB = (color) => new THREE.MeshBasicMaterial({ color });
const MG = (color, intensity = 1.2) => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: .6 });

const woodWalnut = woodTex('#7b4d33', '#3a2015', [1, 1]);
const woodOak = woodTex('#c79a63', '#6b4423', [1, 1]);
const woodPine = woodTex('#e0b784', '#8a5a2e', [1, 1]);
const mWalnut = MT(woodWalnut, .72), mOak = MT(woodOak, .7), mPine = MT(woodPine, .7);
const mDarkWood = M('#4a2f24', .7);
const mCream = M('#f3e7c9', .9), mPage = M('#f0e4c4', 1);
const mTerra = M('#c4704a', .85), mSoil = M('#3a2a1e', 1);

// ───────────────────────── helpers de geometría ─────────────────────────
function box(w, h, d, mat, r = 0.025) {
  const rr = Math.min(r, w / 2 - 0.0005, h / 2 - 0.0005, d / 2 - 0.0005);
  const g = rr > 0.002 ? new RoundedBoxGeometry(w, h, d, 3, rr) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m;
}
function boxAt(parent, w, h, d, mat, x, yb, z, r) { const m = box(w, h, d, mat, r); m.position.set(x, yb + h / 2, z); parent.add(m); return m; }
function cyl(rt, rb, h, mat, seg = 28) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.castShadow = m.receiveShadow = true; return m; }
function cylAt(parent, rt, rb, h, mat, x, yb, z, seg) { const m = cyl(rt, rb, h, mat, seg); m.position.set(x, yb + h / 2, z); parent.add(m); return m; }
function sph(r, mat, sx = 1, sy = 1, sz = 1) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat); m.scale.set(sx, sy, sz); m.castShadow = m.receiveShadow = true; return m; }
function shade(g) { g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; }

// ───────────────────────── libros ─────────────────────────
const spineMats = new Map();
function spineMat(b) {
  if (spineMats.has(b.id)) return spineMats.get(b.id);
  const tex = canvasTex(40, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, b.pal[0]); gr.addColorStop(1, b.pal[1]);
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = b.pal[2]; g.fillRect(0, 14, w, 6); g.fillRect(0, h - 34, w, 4); g.fillRect(0, h - 24, w, 10);
    g.save(); g.translate(w / 2 + 4, h / 2 + 4); g.rotate(-Math.PI / 2);
    g.fillStyle = b.pal[3]; g.font = '700 21px Fraunces, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(b.title.length > 17 ? b.title.slice(0, 16) + '…' : b.title, 0, 0); g.restore();
  });
  const sides = M(b.pal[1], .9);
  const arr = [sides, sides, M(b.pal[0], .9), sides, new THREE.MeshStandardMaterial({ map: tex, roughness: .75 }), sides];
  spineMats.set(b.id, arr);
  return arr;
}
const geoCache = new Map();
function spineBook(b, t, h, d) {
  const k = `${t.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`;
  if (!geoCache.has(k)) geoCache.set(k, new THREE.BoxGeometry(t, h, d));
  const m = new THREE.Mesh(geoCache.get(k), spineMat(b));
  m.castShadow = true; m.receiveShadow = true; return m;
}

const coverCanvases = new Map();
function coverCanvas(b, w = 160, h = 240) {
  const key = b.id + w;
  if (coverCanvases.has(key)) return coverCanvases.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, b.pal[0]); gr.addColorStop(1, b.pal[1]);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = b.pal[2]; g.globalAlpha = .9;
  g.beginPath(); g.arc(w / 2, h * .42, w * .26, 0, 7); g.fill();
  g.globalAlpha = .35; g.beginPath(); g.arc(w / 2, h * .42, w * .38, 0, 7); g.lineWidth = 3; g.strokeStyle = b.pal[2]; g.stroke();
  g.globalAlpha = 1;
  g.strokeStyle = b.pal[2]; g.lineWidth = 2; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = b.pal[3]; g.textAlign = 'center'; g.font = `700 ${w * .115}px Fraunces, serif`;
  const words = b.title.split(' '); const lines = []; let cur = '';
  words.forEach(wd => { if ((cur + ' ' + wd).trim().length > 12) { lines.push(cur); cur = wd; } else cur = (cur + ' ' + wd).trim(); });
  lines.push(cur);
  lines.forEach((ln, i) => g.fillText(ln, w / 2, h * .72 + i * w * .13));
  g.font = `600 ${w * .07}px Nunito, sans-serif`; g.globalAlpha = .85; g.fillText(b.author.toUpperCase(), w / 2, h - 16);
  coverCanvases.set(key, c);
  return c;
}
// Libro con cubierta visible. De pie mira a +z. Origen en el centro de la base.
function displayBook(b, W = .3, H = .44, T = .055) {
  const g = new THREE.Group();
  const ct = new THREE.CanvasTexture(coverCanvas(b)); ct.colorSpace = THREE.SRGBColorSpace; ct.anisotropy = 8;
  const front = box(W, H, .014, new THREE.MeshStandardMaterial({ map: ct, roughness: .6 }), .004); front.position.set(0, H / 2, T / 2 - .007);
  const back = box(W, H, .014, M(b.pal[1], .8), .004); back.position.set(0, H / 2, -T / 2 + .007);
  const spine = box(.016, H, T, M(b.pal[0], .8), .004); spine.position.set(-W / 2 + .008, H / 2, 0);
  const pages = box(W - .026, H - .02, T - .028, mPage, .002); pages.position.set(.006, H / 2, 0);
  g.add(front, back, spine, pages);
  return g;
}

// ───────────────────────── paredes ─────────────────────────
function wallSegments(L, H, openings, matFn, T = .22) {
  const g = new THREE.Group();
  const add = (x0, x1, y0, y1) => {
    if (x1 - x0 < .001 || y1 - y0 < .001) return;
    const geo = new THREE.BoxGeometry(x1 - x0, y1 - y0, T);
    const uv = geo.attributes.uv, pos = geo.attributes.position, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + cx) / 2.0, (pos.getY(i) + cy) / 2.0);
    const m = new THREE.Mesh(geo, matFn()); m.position.set(cx, cy, -T / 2); g.add(m);
    return m;
  };
  const sorted = [...openings].sort((a, b) => a.x0 - b.x0);
  let cur = -L / 2;
  sorted.forEach(o => {
    add(cur, o.x0, 0, H); add(o.x0, o.x1, 0, o.y0); add(o.x0, o.x1, o.y1, H); cur = o.x1;
  });
  add(cur, L / 2, 0, H);
  return g;
}
const mWall = new THREE.MeshStandardMaterial({ map: paperTex, roughness: .95 });
const mShadowOnly = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });

const wallGroups = [];
const skyTex = canvasTex(8, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fd3f2'); gr.addColorStop(1, '#f7ecd2'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
const glassMat = new THREE.MeshStandardMaterial({ color: '#cfe9f5', transparent: true, opacity: .28, roughness: .1, emissive: '#bfe3f7', emissiveIntensity: .25, depthWrite: false });
const doorGlow = new THREE.MeshBasicMaterial({ color: '#2b1c14' });

function makeWall(name, L, rotY, pos, openings, extras) {
  const g = new THREE.Group(); g.position.copy(pos); g.rotation.y = rotY;
  g.add(wallSegments(L, WALL_H, openings, () => mWall));
  const shadowW = wallSegments(L, WALL_H, openings, () => mShadowOnly);
  shadowW.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  const sg = new THREE.Group(); sg.position.copy(pos); sg.rotation.y = rotY; sg.add(shadowW); scene.add(sg);

  // zócalo verde con moldura y rodapié, saltando las puertas
  const doors = openings.filter(o => o.y0 < .5);
  const spans = []; let cur = -L / 2;
  [...doors].sort((a, b) => a.x0 - b.x0).forEach(o => { spans.push([cur, o.x0]); cur = o.x1; }); spans.push([cur, L / 2]);
  spans.forEach(([a, b]) => {
    if (b - a < .01) return;
    boxAt(g, b - a, .96, .05, M('#3f6b66', .85), (a + b) / 2, 0, .025, 0);
    boxAt(g, b - a, .06, .09, mOak, (a + b) / 2, .96, .045, .01);
    boxAt(g, b - a, .13, .07, mDarkWood, (a + b) / 2, 0, .035, .01);
  });
  const decor = new THREE.Group(); g.add(decor);
  extras?.(g, decor);
  g.userData = { name, decor, scaleY: 1 };
  scene.add(g); wallGroups.push(g);
  return g;
}

function windowFrame(parent, x0, x1, y0, y1) {
  const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, f = .07;
  boxAt(parent, w + .16, f, .16, mOak, cx, y0 - f, .0);       // alféizar
  boxAt(parent, w + .16, .08, .12, mOak, cx, y1, .0);
  boxAt(parent, .08, h, .12, mOak, x0 - .01, y0, .0); boxAt(parent, .08, h, .12, mOak, x1 + .01, y0, .0);
  boxAt(parent, .05, h, .06, mOak, cx, y0, -.04); boxAt(parent, w, .05, .06, mOak, cx, cy - .025, -.04);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat); gl.position.set(cx, cy, -.08); parent.add(gl);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(w + .3, h + .3), skyMat); sky.position.set(cx, cy, -.2); parent.add(sky);
  // cortinas
  const cm = M('#d98f7a', .95);
  boxAt(parent, .26, h + .25, .1, cm, x0 - .1, y0 - .1, .09, .05); boxAt(parent, .26, h + .25, .1, cm, x1 + .1, y0 - .1, .09, .05);
  const rod = cyl(.02, .02, w + .7, mDarkWood, 8); rod.rotation.z = Math.PI / 2; rod.position.set(cx, y1 + .2, .09); parent.add(rod);
  // macetas en el alféizar
  const p = cyl(.07, .05, .12, mTerra, 14); p.position.set(cx - w * .25, y0 + .06, .02); parent.add(p);
  const leaf = sph(.12, M('#5c9457'), 1, 1.1, 1); leaf.position.set(cx - w * .25, y0 + .22, .02); parent.add(leaf);
}

const northWall = makeWall('norte', COLS, 0, new THREE.Vector3(0, 0, -HZ), [{ x0: 1.5, x1: 3.1, y0: 1.05, y1: 2.15 }], (g, decor) => {
  windowFrame(g, 1.5, 3.1, 1.05, 2.15);
  // guirnalda de luces
  const pts = []; for (let i = 0; i <= 24; i++) { const x = -4.7 + i * (9.4 / 24); pts.push(new THREE.Vector3(x, 2.5 - .16 * Math.sin(i / 24 * Math.PI * 3) * (i % 2 ? 1 : 1), .06)); }
  const curve = new THREE.CatmullRomCurve3(pts);
  const wire = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, .008, 5), M('#2a1f1a'));
  decor.add(wire);
  for (let i = 0; i < 24; i++) {
    const p = curve.getPoint((i + .5) / 24);
    const bulb = sph(.04, MG(i % 3 === 0 ? '#ffb15c' : '#ffdc8a', 2.2)); bulb.castShadow = false; bulb.position.set(p.x, p.y - .04, p.z); decor.add(bulb);
  }
});
const westWall = makeWall('oeste', ROWS, Math.PI / 2, new THREE.Vector3(-HX, 0, 0), [{ x0: -1.95, x1: -.85, y0: 0, y1: 2.05 }], (g, decor) => {
  // puerta del almacén (entreabierta) y rótulo
  const x0 = -1.95, x1 = -.85, cx = (x0 + x1) / 2;
  const dark = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 2.05), doorGlow); dark.position.set(cx, 1.025, -.5); g.add(dark);
  const warm = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.4), new THREE.MeshBasicMaterial({ color: '#7a4b2a', transparent: true, opacity: .55 })); warm.position.set(cx, .9, -.45); g.add(warm);
  boxAt(g, .09, 2.15, .14, mOak, x0 - .02, 0, 0, .01); boxAt(g, .09, 2.15, .14, mOak, x1 + .02, 0, 0, .01); boxAt(g, x1 - x0 + .2, .1, .14, mOak, cx, 2.05, 0, .01);
  const leaf = new THREE.Group(); leaf.position.set(x1, 0, 0);
  const lm = box(1.05, 2.0, .06, mPine, .015); lm.position.set(-.525, 1.0, 0); leaf.add(lm);
  const knob = sph(.035, M('#d9b24a', .3, .8)); knob.position.set(-.95, 1.0, .05); leaf.add(knob);
  leaf.rotation.y = 1.15; g.add(leaf);
  const sign = canvasTex(256, 96, (c, w, h) => {
    c.fillStyle = '#4a2f24'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e3b04b'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = '#f3e7c9'; c.font = '700 44px Fraunces, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Almacén', w / 2, h / 2 + 2);
  });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(.95, .36), new THREE.MeshStandardMaterial({ map: sign, roughness: .7 })); sp.position.set(cx, 2.38, .02); decor.add(sp);
  // carteles
  const art = (w, h, cols) => canvasTex(128, 160, (c) => { cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, i * 160 / cols.length, 128, 160 / cols.length + 1); }); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(64, 60, 26, 0, 7); c.fill(); });
  [[2.5, ['#e9c27e', '#c06a52', '#3f6b66']], [3.2, ['#a4c9d6', '#e9d9a8', '#7da37a']]].forEach(([lx, cols]) => {
    boxAt(decor, .5, .64, .04, mDarkWood, lx - 4 + 3.6 - 0.0, 1.5, .02, .01);
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(.42, .56), new THREE.MeshStandardMaterial({ map: art(1, 1, cols), roughness: .8 })); pic.position.set(lx - 4 + 3.6, 1.78, .045); decor.add(pic);
  });
});
const eastWall = makeWall('este', ROWS, -Math.PI / 2, new THREE.Vector3(HX, 0, 0), [], (g, decor) => {
  // pizarra de recomendaciones
  const board = canvasTex(256, 168, (c, w, h) => {
    c.fillStyle = '#2f3b36'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 40; i++) c.fillRect(R(0, w), R(0, h), R(10, 40), 2);
    c.fillStyle = '#f3e7c9'; c.textAlign = 'center'; c.font = '600 34px Caveat, cursive'; c.fillText('Hoy recomendamos', w / 2, 44);
    c.font = '600 28px Caveat, cursive'; c.fillStyle = '#f2c14e'; c.fillText('★ Alas de Brasa', w / 2, 84); c.fillStyle = '#9ad1ff'; c.fillText('★ La Isla del Faro', w / 2, 118);
    c.fillStyle = '#f3e7c9'; c.font = '600 22px Caveat, cursive'; c.fillText('¡pregunta por las novedades!', w / 2, 150);
  });
  boxAt(decor, 1.4, 1.0, .06, mOak, .4, 1.25, .03, .02);
  const bp = new THREE.Mesh(new THREE.PlaneGeometry(1.28, .86), new THREE.MeshStandardMaterial({ map: board, roughness: .9 })); bp.position.set(.4, 1.75, .065); decor.add(bp);
  // balda con libros y plantita
  boxAt(decor, 1.7, .05, .26, mOak, -1.3, 1.9, .13, .01);
  let x = -2.05; for (let i = 0; i < 9; i++) { const b = BOOKS[(i * 3) % BOOKS.length]; const t = .06 + (b.w - 10) * .012; const h = R(.26, .34); const m = spineBook(b, t, h, .2); m.position.set(x + t / 2, 1.95 + h / 2, .13); decor.add(m); x += t + .005; }
  const pot = cyl(.07, .05, .1, mTerra, 12); pot.position.set(-.7, 2.0, .13); decor.add(pot); const lf = sph(.1, M('#5c9457')); lf.position.set(-.7, 2.17, .13); decor.add(lf);
});
const southWall = makeWall('sur', COLS, Math.PI, new THREE.Vector3(0, 0, HZ), [{ x0: -.7, x1: .7, y0: 0, y1: 2.15 }], (g, decor) => {
  const x0 = -.7, x1 = .7;
  boxAt(g, .1, 2.25, .15, mOak, x0 - .03, 0, 0, .01); boxAt(g, .1, 2.25, .15, mOak, x1 + .03, 0, 0, .01); boxAt(g, 1.6, .1, .15, mOak, 0, 2.15, 0, .01);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.15), new THREE.MeshBasicMaterial({ color: '#f7e4b8' })); street.position.set(0, 1.075, -.35); g.add(street);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.15), glassMat); gl.position.set(0, 1.075, -.1); g.add(gl);
  boxAt(g, .05, 2.15, .05, mOak, 0, 0, -.1, 0); boxAt(g, 1.4, .05, .05, mOak, 0, 1.35, -.1, 0);
  const sign = canvasTex(256, 100, (c, w, h) => {
    c.fillStyle = '#3f6b66'; c.fillRect(0, 0, w, h); c.strokeStyle = '#f3e7c9'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = '#f3e7c9'; c.font = '700 34px Fraunces, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Librería', w / 2, 38); c.font = '600 24px Caveat, cursive'; c.fillText('abierto · open', w / 2, 72);
  });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(.95, .37), new THREE.MeshStandardMaterial({ map: sign })); sp.position.set(0, 2.45, .02); decor.add(sp);
});

// ───────────────────────── suelo ─────────────────────────
const floor = new THREE.Mesh(new THREE.BoxGeometry(COLS + .4, .3, ROWS + .4), [M('#4a2f24'), M('#4a2f24'), MT(floorTex, .75), M('#3a2318'), M('#4a2f24'), M('#4a2f24')]);
floor.position.y = -.15; floor.receiveShadow = true; scene.add(floor);
// BoxGeometry UV: cara superior de ancho COLS+.4; ajustamos repetición
floorTex.repeat.set((COLS + .4) / 2, (ROWS + .4) / 2);

// ───────────────────────── muebles ─────────────────────────
function bookshelf(genre) {
  const W = 2, D = .5, H = 2.06, g = new THREE.Group();
  const side = (x) => boxAt(g, .08, H, D, mWalnut, x, 0, 0, .02);
  side(-W / 2 + .04); side(W / 2 - .04);
  boxAt(g, W - .1, H - .1, .03, M('#5a3827', .9), 0, .06, -D / 2 + .015, 0);
  boxAt(g, W + .08, .08, D + .05, mWalnut, 0, H - .02, .01, .02);
  boxAt(g, W + .02, .035, D + .08, mDarkWood, 0, H + .05, .02, .01);
  boxAt(g, W - .08, .12, D - .02, mDarkWood, 0, 0, 0, .01);
  const pool = BOOKS.filter(b => !genre || b.genre === genre);
  const rows = 4, step = .47;
  for (let r = 0; r < rows; r++) {
    const yTop = .12 + r * step + .04;
    boxAt(g, W - .08, .04, D - .04, mWalnut, 0, .12 + r * step, 0, .005);
    let x = -W / 2 + .1; const xEnd = W / 2 - .1;
    while (x < xEnd - .2) {
      const u = rnd();
      if (u < .07) { x += R(.12, .2); continue; }
      if (u < .13 && xEnd - x > .5) { // pila tumbada
        const n = 2 + Math.floor(rnd() * 3), bw = R(.3, .38);
        for (let k = 0; k < n; k++) { const b = pick(pool); const m = box(bw, .05, R(.24, .3), M(b.pal[1], .8), .01); m.position.set(x + bw / 2 + R(-.01, .01), yTop + .025 + k * .052, 0); m.rotation.y = R(-.08, .08); g.add(m); const edge = box(bw - .02, .018, .02, mPage, .004); edge.position.set(m.position.x, m.position.y, .14); g.add(edge); }
        x += bw + .05; continue;
      }
      const b = pick(pool); const t = .06 + (b.w - 10) * .012, h = R(.28, .38), d = R(.28, .34);
      const m = spineBook(b, t, h, d); m.position.set(x + t / 2, yTop + h / 2, D / 2 - d / 2 - .03 + R(-.01, .015)); g.add(m);
      x += t + .004;
      if (xEnd - x < .3 && rnd() < .6) { // último libro inclinado
        const b2 = pick(pool), t2 = .08, h2 = R(.3, .36); const m2 = spineBook(b2, t2, h2, .3); m2.position.set(x + .12, yTop + h2 / 2 - .008, 0); m2.rotation.z = -.28; g.add(m2); x = xEnd;
      }
    }
    if (r === 3 && rnd() < .7) { /* adorno en el último estante lo gestiona quien llama */ }
  }
  // adorno en la cima
  const t = rnd();
  if (t < .5) { const p = cyl(.09, .07, .14, mTerra, 14); p.position.set(R(-.6, .6), H + .1, 0); g.add(p); const l = sph(.15, M('#5c9457'), 1, 1.1, 1); l.position.set(p.position.x, H + .3, 0); g.add(l); }
  else { const c = cyl(.05, .05, .1, M('#e8d9bd', .6), 14); c.position.set(R(-.6, .6), H + .15, 0); g.add(c); const fl = sph(.025, MG('#ffcf70', 2.5)); fl.position.set(c.position.x, H + .23, 0); fl.scale.y = 1.6; g.add(fl); }
  return g;
}

function roundTable() {
  const g = new THREE.Group();
  const topY = .82, R0 = .98;
  cylAt(g, .42, .46, .06, mDarkWood, 0, 0, 0, 32);
  cylAt(g, .1, .2, topY - .1, mWalnut, 0, .06, 0, 24);
  cylAt(g, R0, R0, .07, mOak, 0, topY - .07, 0, 56);
  cylAt(g, R0 + .015, R0 + .015, .03, mDarkWood, 0, topY - .06, 0, 56);
  cylAt(g, .78, .78, .008, M('#f3e7c9', 1), 0, topY, 0, 48);
  const y0 = topY + .004;
  // anillo exterior: libros de pie, con la cubierta hacia fuera
  const N = 9;
  for (let i = 0; i < N; i++) {
    const th = i / N * Math.PI * 2 + .2, b = BOOKS[(i * 2 + 1) % BOOKS.length];
    const wrap = new THREE.Group(); wrap.position.set(Math.cos(th) * .8, y0, Math.sin(th) * .8); wrap.rotation.y = Math.PI / 2 - th;
    const bk = displayBook(b, .29, .43, .05); bk.rotation.x = -.2; bk.position.z = -.02; wrap.add(bk); g.add(wrap);
  }
  // anillo interior: libros tumbados con la cubierta hacia arriba
  const M2 = 5;
  for (let i = 0; i < M2; i++) {
    const th = i / M2 * Math.PI * 2 + .6, b = BOOKS[(i * 3 + 4) % BOOKS.length];
    const outer = new THREE.Group(); outer.position.set(Math.cos(th) * .47, y0 + (i % 2) * .052, Math.sin(th) * .47); outer.rotation.y = Math.PI / 2 - th;
    const bk = displayBook(b, .27, .4, .05); bk.rotation.x = -Math.PI / 2; bk.position.y = .025; bk.position.z = -.2; outer.add(bk); g.add(outer);
  }
  // pila central con vela y planta
  for (let k = 0; k < 3; k++) {
    const outer = new THREE.Group(); outer.position.set(0, y0 + .1 + k * .05, 0); outer.rotation.y = k * 1.2 + .3;
    const b = BOOKS[(k * 5 + 2) % BOOKS.length]; const bk = displayBook(b, .3 - k * .03, .42 - k * .03, .05); bk.rotation.x = -Math.PI / 2; bk.position.y = .025; bk.position.z = -.2; outer.add(bk); g.add(outer);
  }
  const pot = cyl(.06, .045, .09, mTerra, 14); pot.position.set(0, y0 + .3, 0); g.add(pot);
  for (let i = 0; i < 6; i++) { const l = sph(.06, M(i % 2 ? '#5c9457' : '#78ad62'), .5, 1, 1); const a = i / 6 * Math.PI * 2; l.position.set(Math.cos(a) * .06, y0 + .4, Math.sin(a) * .06); l.rotation.set(0, -a, 0.9); g.add(l); }
  // cartel
  const sign = canvasTex(256, 110, (c, w, h) => {
    c.fillStyle = '#f3e7c9'; c.fillRect(0, 0, w, h); c.strokeStyle = '#4a2f24'; c.lineWidth = 5; c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = '#4a2f24'; c.font = '700 40px Fraunces, serif'; c.textAlign = 'center'; c.fillText('Novedades', w / 2, 56); c.font = '600 26px Caveat, cursive'; c.fillText('¡recién llegados!', w / 2, 90);
  });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(.5, .215), new THREE.MeshStandardMaterial({ map: sign })); const sw = new THREE.Group(); sw.position.set(0, y0 + .12, .62); sp.position.y = .1; sp.castShadow = true; sw.add(sp); boxAt(sw, .02, .1, .02, mDarkWood, 0, 0, 0, 0); sw.rotation.x = -.15; g.add(sw);
  return shade(g);
}

function counter() {
  const g = new THREE.Group(); const W = 2.4, D = .8, H = 1.0;
  boxAt(g, W, H - .06, D - .06, mWalnut, 0, 0, 0, .03);
  for (let i = 0; i < 4; i++) { boxAt(g, W / 4 - .14, H - .34, .03, M('#5a3827', .8), -W / 2 + W / 8 + i * W / 4, .16, D / 2 - .02, .01); boxAt(g, W / 4 - .22, H - .46, .015, mWalnut, -W / 2 + W / 8 + i * W / 4, .22, D / 2, .005); }
  boxAt(g, W + .1, .07, D + .12, mOak, 0, H - .07, .02, .02);
  boxAt(g, W, .1, .06, mDarkWood, 0, 0, D / 2 - .04, .01);
  const y = H;
  // caja registradora
  boxAt(g, .42, .16, .34, M('#3d4a47', .5, .3), -.7, y, -.1, .03);
  const scr = box(.3, .2, .03, M('#26302f', .4, .3), .01); scr.position.set(-.7, y + .26, -.14); scr.rotation.x = -.3; g.add(scr);
  const sc2 = new THREE.Mesh(new THREE.PlaneGeometry(.24, .13), MG('#8ee0b0', .9)); sc2.position.set(-.7, y + .27, -.12); sc2.rotation.x = -.3; g.add(sc2);
  // campanilla, libros, bolsas de papel, taza con lápices
  const bell = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#d9b24a', .3, .8)); bell.position.set(.05, y + .02, .22); bell.castShadow = true; g.add(bell);
  for (let k = 0; k < 3; k++) { const o = new THREE.Group(); o.position.set(.55, y + .1 + k * .05, .0); o.rotation.y = k * .5 + .2; const bk = displayBook(BOOKS[(k * 4 + 5) % BOOKS.length], .3, .42, .05); bk.rotation.x = -Math.PI / 2; bk.position.y = .025; bk.position.z = -.2; o.add(bk); g.add(o); }
  boxAt(g, .26, .34, .16, M('#cda978', .95), .98, y, -.1, .01); boxAt(g, .22, .28, .12, M('#c19b68', .95), .98, y, .12, .01);
  const mug = cyl(.05, .045, .1, M('#e7d6b4', .6), 16); mug.position.set(-1.05, y + .05, .18); g.add(mug);
  for (let i = 0; i < 3; i++) { const p = cyl(.006, .006, .16, M(['#c1443a', '#3f6b66', '#e3b04b'][i], .6), 6); p.position.set(-1.05 + (i - 1) * .02, y + .15, .18); p.rotation.z = (i - 1) * .2; g.add(p); }
  // lámpara de mesa
  cylAt(g, .08, .09, .03, mDarkWood, 1.0, y, .3, 16); cylAt(g, .012, .012, .3, M('#c9a24d', .4, .7), 1.0, y, .3, 8);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(.1, .16, .16, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#ffd9a0', emissive: '#ffb860', emissiveIntensity: 1.2, side: THREE.DoubleSide, roughness: .9 })); sh.position.set(1.0, y + .38, .3); g.add(sh);
  const pl = new THREE.PointLight('#ffbd70', 5, 4.5, 2); pl.position.set(1.0, y + .35, .3); g.add(pl); lampLights.push(pl);
  return shade(g);
}

function armchair() {
  const g = new THREE.Group(); const c = M('#c98f2f', .95), c2 = M('#dba743', .95);
  boxAt(g, .98, .32, .84, c, 0, .16, 0, .09);
  boxAt(g, .84, .16, .66, c2, 0, .46, .06, .07);          // cojín del asiento
  boxAt(g, 1.0, .78, .24, c, 0, .22, -.32, .1);            // respaldo
  boxAt(g, .22, .5, .8, c, -.43, .2, 0, .09); boxAt(g, .22, .5, .8, c, .43, .2, 0, .09); // brazos
  [[-.4, -.34], [.4, -.34], [-.4, .34], [.4, .34]].forEach(([x, z]) => cylAt(g, .04, .03, .16, mDarkWood, x, 0, z, 10));
  const pillow = box(.34, .3, .1, M('#a2453a', .95), .06); pillow.position.set(-.22, .75, -.15); pillow.rotation.set(-.3, .3, .2); g.add(pillow);
  const bl = box(.7, .05, .5, M('#e8d6b0', .95), .02); bl.position.set(.2, .93, .0); bl.rotation.z = .05; g.add(bl);
  for (let i = 0; i < 4; i++) boxAt(g, .7, .05, .03, M('#a2453a', .95), .2, .915 + 0, -.16 + i * .1, .005).rotation.z = .05;
  return shade(g);
}
function sideTable() {
  const g = new THREE.Group();
  cylAt(g, .3, .3, .05, mOak, 0, .55, 0, 28); cylAt(g, .04, .06, .55, mWalnut, 0, 0, 0, 12); cylAt(g, .2, .22, .04, mDarkWood, 0, 0, 0, 20);
  const mug = cyl(.06, .05, .11, M('#e7d6b4', .6), 16); mug.position.set(.1, .66, .05); g.add(mug);
  const steam = sph(.03, new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: .35 }), 1, 1.6, 1); steam.position.set(.1, .78, .05); steam.castShadow = false; g.add(steam); steamMesh = steam;
  for (let k = 0; k < 3; k++) { const o = new THREE.Group(); o.position.set(-.1, .6 + k * .05, -.05); o.rotation.y = k * .7; const bk = displayBook(BOOKS[(k * 6 + 3) % BOOKS.length], .22, .3, .05); bk.rotation.x = -Math.PI / 2; bk.position.y = .025; bk.position.z = -.15; o.add(bk); g.add(o); }
  return shade(g);
}
let steamMesh = null;
const lampLights = [];
function floorLamp() {
  const g = new THREE.Group();
  cylAt(g, .16, .18, .04, mDarkWood, 0, 0, 0, 20); cylAt(g, .014, .014, 1.55, M('#c9a24d', .4, .7), 0, .04, 0, 8);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(.16, .26, .3, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#ffe0b0', emissive: '#ffb860', emissiveIntensity: 1.5, side: THREE.DoubleSide, roughness: .9 })); sh.position.y = 1.7; g.add(sh);
  const pl = new THREE.PointLight('#ffb865', 9, 6.5, 2); pl.position.y = 1.65; g.add(pl); lampLights.push(pl);
  return g;
}
function plant(big = false) {
  const g = new THREE.Group(); const s = big ? 1.4 : 1;
  cylAt(g, .24 * s, .17 * s, .36 * s, mTerra, 0, 0, 0, 20); cylAt(g, .255 * s, .255 * s, .05, M('#b05f3b', .8), 0, .33 * s, 0, 20); cylAt(g, .22 * s, .22 * s, .02, mSoil, 0, .37 * s, 0, 18);
  const n = big ? 20 : 12;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + R(-.2, .2), tilt = R(.5, 1.1), len = R(.32, .5) * s * (big ? 1.3 : 1);
    const l = sph(1, M(i % 3 === 0 ? '#4f8a52' : i % 3 === 1 ? '#6aa55d' : '#7fb869', .75), .17 * s, .028, .5 * s);
    l.scale.set(.19 * s, .03, len); const pivot = new THREE.Group(); pivot.position.y = .37 * s; pivot.rotation.set(0, -a + Math.PI / 2, 0);
    l.position.z = len * .85; l.rotation.x = -tilt * .6; pivot.add(l); l.position.y = Math.sin(tilt) * len * .5; g.add(pivot);
  }
  return shade(g);
}
function cat() {
  const g = new THREE.Group(); const fur = M('#d98a45', .95), fur2 = M('#f1d9b0', .95);
  const body = sph(.26, fur, 1.2, .62, .85); body.position.y = .16; g.add(body); catBody = body;
  const head = sph(.15, fur, 1, .95, .95); head.position.set(.28, .2, .08); g.add(head);
  const e1 = new THREE.Mesh(new THREE.ConeGeometry(.045, .09, 4), fur), e2 = e1.clone(); e1.position.set(.28, .35, .0); e2.position.set(.28, .35, .16); g.add(e1, e2);
  const muz = sph(.06, fur2, 1, .8, 1); muz.position.set(.4, .17, .08); g.add(muz);
  const tail = new THREE.Mesh(new THREE.TorusGeometry(.2, .04, 8, 20, Math.PI * 1.2), fur); tail.rotation.x = Math.PI / 2; tail.position.set(-.1, .07, .1); tail.rotation.z = 2.2; g.add(tail);
  const stripe = sph(.22, M('#b86e30', .95), 1.1, .5, .3); stripe.position.set(0, .22, 0); g.add(stripe);
  return shade(g);
}
let catBody = null;

// ───────────────────────── colocación ─────────────────────────
function place(obj, x, z, ry = 0, y = 0) { obj.position.set(x, y, z); obj.rotation.y = ry; scene.add(obj); return obj; }
// Estanterías: dos contra la pared norte, una contra la oeste, una exenta que hace de separador
place(bookshelf('romantasia'), -3.9, -HZ + .27);
place(bookshelf('epica'), -1.8, -HZ + .27);
place(bookshelf('thriller'), -HX + .27, -2.1, Math.PI / 2);
place(bookshelf(null), -1.6, 1.0, 0);
place(counter(), HX - .95, .5, -Math.PI / 2);
place(roundTable(), 1.2, -.6);
// rincón de lectura (suroeste)
const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), MT(rugTex, 1)); rug.rotation.x = -Math.PI / 2; rug.position.set(-3.1, .012, 2.55); rug.receiveShadow = true; scene.add(rug);
const rug2 = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), MT(roundRugTex, 1)); rug2.rotation.x = -Math.PI / 2; rug2.position.set(1.2, .012, -.6); rug2.receiveShadow = true; scene.add(rug2);
place(armchair(), -3.9, 2.55, Math.PI / 2);
place(sideTable(), -3.9, 3.45);
place(floorLamp(), -4.55, 3.5);
place(cat(), -2.4, 2.6, .5, .012);
place(plant(true), HX - .5, -HZ + .5);
place(plant(false), HX - .45, HZ - .45);
place(plant(false), -HX + .5, -HZ + .5 + 2.2);
place(plant(false), 1.1, HZ - .4);

// ───────────────────────── personajes ─────────────────────────
function person(o) {
  const g = new THREE.Group(); const skin = M(o.skin || '#f0c6a0', .8), hair = M(o.hair, .85), shirt = M(o.shirt, .9), pants = M(o.pants || '#3b3f55', .9);
  const legL = new THREE.Group(), legR = new THREE.Group();
  [legL, legR].forEach((l, i) => { l.position.set((i ? 1 : -1) * .07, .3, 0); const lg = cyl(.055, .05, .3, pants, 10); lg.position.y = -.15; l.add(lg); const sh = box(.1, .06, .16, M('#2d1d17'), .02); sh.position.set(0, -.3, .03); l.add(sh); g.add(l); });
  const body = new THREE.Group(); body.position.y = .3; g.add(body);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.15, .2, 6, 14), shirt); torso.position.y = .2; torso.castShadow = true; body.add(torso);
  if (o.apron) { const ap = box(.24, .26, .05, M(o.apron, .9), .03); ap.position.set(0, .16, .13); body.add(ap); }
  const armL = new THREE.Group(), armR = new THREE.Group();
  [armL, armR].forEach((a, i) => { a.position.set((i ? 1 : -1) * .19, .36, 0); const ar = new THREE.Mesh(new THREE.CapsuleGeometry(.05, .14, 4, 8), shirt); ar.position.y = -.1; ar.castShadow = true; a.add(ar); const hand = sph(.045, skin); hand.position.y = -.24; a.add(hand); body.add(a); });
  const head = new THREE.Group(); head.position.y = .58; body.add(head);
  const hd = sph(.19, skin, 1, 1.02, 1); head.add(hd);
  const hr = sph(.205, hair, 1, 1, 1); hr.position.set(0, .03, -.03); hr.scale.set(1, .95, .98); head.add(hr);
  const fringe = sph(.2, hair, 1, .5, .6); fringe.position.set(0, .12, .06); head.add(fringe);
  if (o.bun) { const bun = sph(.09, hair); bun.position.set(0, .24, -.1); head.add(bun); }
  if (o.long) { const lh = sph(.19, hair, 1.0, 1.4, .6); lh.position.set(0, -.08, -.1); head.add(lh); }
  [-1, 1].forEach(s => { const e = sph(.025, M('#2a1a14', .3), 1, 1.3, .7); e.position.set(s * .075, 0, .175); head.add(e); const ch = sph(.032, M('#f2a090', 1), 1, .7, .3); ch.position.set(s * .12, -.05, .16); head.add(ch); });
  g.userData = { legL, legR, armL, armR, body, head, phase: 0 };
  return shade(g);
}
function setFacing(p, ry) { let d = ry - p.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; p.rotation.y += d * .25; }

const hero = person({ hair: '#5a3422', shirt: '#4d8f86', apron: '#f3e7c9', bun: true });
hero.position.set(HX - .5, 0, .5); scene.add(hero);
const cust1 = person({ hair: '#d9b25e', shirt: '#b94f5b', long: true, pants: '#555a6a' }); place(cust1, 0.1, -1.7, 0); // junto a la mesa, mira a la mesa
const cust2 = person({ hair: '#8c8c8c', shirt: '#7c6aa6', skin: '#e2b48c', pants: '#4a4036' }); place(cust2, -3.9, -.9, -Math.PI / 2);
const cust3 = person({ hair: '#2a1a14', shirt: '#d9a33d', skin: '#9c6a48', pants: '#35424a' }); place(cust3, HX - 1.9, .3, Math.PI / 2);
cust1.rotation.y = Math.PI * .1;

const patrol = [{ x: HX - .5, z: .5, w: 2.2 }, { x: 2.6, z: -.7, w: 2.5 }, { x: -.5, z: -2.6, w: 2.5 }, { x: HX - .5, z: .5, w: 1.5 }];
let hp = 0, hwait = 1, hTarget = null, userControl = false;
function stepHero(dt) {
  const u = hero.userData;
  let tgt = hTarget || (!userControl ? patrol[hp] : null);
  let moving = false;
  if (tgt) {
    const dx = tgt.x - hero.position.x, dz = tgt.z - hero.position.z, dist = Math.hypot(dx, dz);
    if (dist < .06) {
      if (hTarget) hTarget = null;
      else { hwait -= dt; if (hwait <= 0) { hp = (hp + 1) % patrol.length; hwait = patrol[hp].w; } }
    } else { const sp = 1.9 * dt; hero.position.x += dx / dist * Math.min(sp, dist); hero.position.z += dz / dist * Math.min(sp, dist); setFacing(hero, Math.atan2(dx, dz)); moving = true; }
  }
  u.phase += dt * (moving ? 9 : 0);
  const s = moving ? Math.sin(u.phase) : 0;
  u.legL.rotation.x = s * .7; u.legR.rotation.x = -s * .7; u.armL.rotation.x = -s * .6; u.armR.rotation.x = s * .6;
  u.body.position.y = .3 + (moving ? Math.abs(Math.sin(u.phase)) * .03 : Math.sin(clock.elapsedTime * 2) * .006);
}
function idle(p, t, off) { const u = p.userData; u.body.position.y = .3 + Math.sin(t * 2 + off) * .006; u.head.rotation.y = Math.sin(t * .7 + off) * .25; }

// ───────────────────────── luces ─────────────────────────
const hemi = new THREE.HemisphereLight('#fff1d6', '#7a5640', 1.15); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffe2b0', 2.2);
sun.position.set(3, 9, -10); sun.target.position.set(0, 0, 0);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 }); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03; sun.shadow.radius = 4;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight('#ffd0a0', .35); fill.position.set(-6, 6, 8); scene.add(fill);

let night = 0, nightTarget = 0;
const cDay = { hemi: new THREE.Color('#fff1d6'), hemiG: new THREE.Color('#7a5640'), sun: new THREE.Color('#ffe2b0'), sky0: new THREE.Color('#9fd3f2') };
const cNight = { hemi: new THREE.Color('#8696cc'), hemiG: new THREE.Color('#2b2438'), sun: new THREE.Color('#8fa4d8') };
function applyNight(k) {
  hemi.color.copy(cDay.hemi).lerp(cNight.hemi, k); hemi.groundColor.copy(cDay.hemiG).lerp(cNight.hemiG, k); hemi.intensity = 1.15 - .3 * k;
  sun.color.copy(cDay.sun).lerp(cNight.sun, k); sun.intensity = 2.2 - 1.6 * k; fill.intensity = .35 * (1 - k);
  lampLights.forEach(l => l.intensity = (l.userData.base ??= l.intensity) * (1 + 1.1 * k));
  skyMat.color.setRGB(1 - .78 * k, 1 - .72 * k, 1 - .55 * k);
  renderer.toneMappingExposure = 1.05 - .1 * k;
  document.body.style.setProperty('--night', k);
}

// ───────────────────────── cámara ─────────────────────────
const ELEV = THREE.MathUtils.degToRad(36);
let az = Math.PI / 4, azTarget = az, zoom = 1, shift = 0, shiftTarget = 0, W = 1, H = 1;
const target = new THREE.Vector3(0, .9, .1);
function fitCamera() {
  W = innerWidth; H = innerHeight; renderer.setSize(W, H, false);
  const aspect = W / H;
  let hw = 7.5, hh = hw / aspect;
  if (hh < 6.6) { hh = 6.6; hw = hh * aspect; }
  hw /= zoom; hh /= zoom;
  Object.assign(camera, { left: -hw, right: hw, top: hh, bottom: -hh }); camera.updateProjectionMatrix();
}
function placeCamera() {
  const d = 40;
  camera.position.set(target.x + Math.sin(az) * Math.cos(ELEV) * d, target.y + Math.sin(ELEV) * d, target.z + Math.cos(az) * Math.cos(ELEV) * d);
  camera.lookAt(target);
  camera.setViewOffset(W, H, 0, shift, W, H);
}
addEventListener('resize', fitCamera);
fitCamera();

const snap = () => { const q = Math.round((az - Math.PI / 4) / (Math.PI / 2)); azTarget = Math.PI / 4 + q * Math.PI / 2; };
const corner = () => { const q = ((Math.round((azTarget - Math.PI / 4) / (Math.PI / 2)) % 4) + 4) % 4; document.getElementById('corner').textContent = q + 1; };
document.getElementById('rotL').onclick = () => { azTarget -= Math.PI / 2; corner(); };
document.getElementById('rotR').onclick = () => { azTarget += Math.PI / 2; corner(); };
document.getElementById('sun').onclick = () => { nightTarget = nightTarget ? 0 : 1; };
addEventListener('keydown', e => { if (e.key === 'q' || e.key === 'ArrowLeft') document.getElementById('rotL').click(); if (e.key === 'e' || e.key === 'ArrowRight') document.getElementById('rotR').click(); });
canvas.addEventListener('wheel', e => { e.preventDefault(); zoom = THREE.MathUtils.clamp(zoom * (e.deltaY < 0 ? 1.08 : .92), .7, 2.2); fitCamera(); }, { passive: false });

// arrastrar = girar; tocar = ir ahí
const ray = new THREE.Raycaster(), floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let down = null;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, lx: e.clientX, moved: false }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (!down) return;
  if (Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 8) down.moved = true;
  if (down.moved) { az -= (e.clientX - down.lx) * .008; azTarget = az; }
  down.lx = e.clientX;
});
canvas.addEventListener('pointerup', e => {
  if (!down) return;
  if (down.moved) { snap(); corner(); }
  else {
    const nx = e.clientX / W * 2 - 1, ny = -(e.clientY / H) * 2 + 1;
    ray.setFromCamera(new THREE.Vector2(nx, ny), camera);
    const p = new THREE.Vector3();
    if (ray.ray.intersectPlane(floorPlane, p)) { hTarget = { x: THREE.MathUtils.clamp(p.x, -HX + .5, HX - .5), z: THREE.MathUtils.clamp(p.z, -HZ + .5, HZ - .5) }; userControl = true; hintOff(); }
  }
  down = null;
});

// ───────────────────────── interfaz (barra inferior + panel) ─────────────────────────
const panel = document.getElementById('panel');
const bar = document.getElementById('bar');
const thumb = (b) => coverCanvas(b, 80, 120).toDataURL();
const stockRows = (n) => BOOKS.slice(0, n).map((b, i) => `<div class="row"><img src="${thumb(b)}" alt=""><div class="t"><b>${b.title}</b><small>${b.author}</small></div><span class="pill">Tienda ${i < 4 ? 1 : 0}</span><span class="pill">Almacén ${[3, 5, 2, 4, 0, 6][i]}</span></div>`).join('');
const boxSvg = '<svg viewBox="0 0 48 48" fill="none" stroke="#38211a" stroke-width="2.4" stroke-linejoin="round"><path d="M24 6 6 14v20l18 8 18-8V14z" fill="#d9a766"/><path d="M6 14l18 8 18-8M24 22v20" /><path d="M15 10l18 8v7l-6 2.5V21" fill="#f3e7c9"/></svg>';
const TABS = {
  tienda: () => `<h2>Tienda</h2><p class="sub">Mañana de lluvia. Las novedades están en la mesa redonda.</p>
    <div class="btns"><button class="btn">Abrir la tienda</button><button class="btn alt">Decorar</button></div>
    <p class="note">Aquí irán el resumen del día, el botón de abrir y el modo decorar con el inventario de muebles.</p>`,
  almacen: () => `<h2>Almacén</h2><p class="sub">Recién llegado · 3 cajas esperándote</p>
    <h3>Cajas nuevas</h3>
    <div class="boxcard">${boxSvg}<div class="t"><b>Pedido de ayer</b><br>6 libros · Romantasía</div><button class="btn">Abrir</button></div>
    <div class="boxcard">${boxSvg}<div class="t"><b>Caja de la editorial</b><br>4 libros · Épica</div><button class="btn">Abrir</button></div>
    <div class="boxcard">${boxSvg}<div class="t"><b>Reposición</b><br>5 libros · Thriller</div><button class="btn">Abrir</button></div>
    <h3>Existencias</h3>${stockRows(6)}
    <p class="note">Un ejemplar de cada título queda expuesto en la tienda y el resto aquí. Cuando alguien lo pide, tu personaje va a la trastienda a por él.</p>`,
  pedidos: () => `<h2>Pedidos</h2><p class="sub">Facturas pendientes de llegar</p>
    <div class="row"><div class="t"><b>Alas de Brasa ×4</b><small>Llega mañana</small></div><span class="pill">62 €</span></div>
    <div class="row"><div class="t"><b>El Señor de los Sellos ×2</b><small>Llega en 2 días</small></div><span class="pill">38 €</span></div>`,
  mejoras: () => `<h2>Mejoras</h2><p class="sub">Muebles y ampliaciones desbloqueados por nivel</p><p class="note">Pendiente de conectar con el catálogo.</p>`,
  redes: () => `<h2>Redes</h2><p class="sub">Reseñas, fotos y vídeos</p><p class="note">Pendiente de conectar.</p>`,
};
let openTab = null;
function showTab(name) {
  bar.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.tab === (name || 'tienda') && !!name));
  if (!name || name === openTab) { openTab = null; panel.classList.remove('open'); shiftTarget = 0; bar.querySelectorAll('button').forEach(b => b.classList.remove('on')); return; }
  openTab = name; panel.innerHTML = TABS[name](); panel.classList.add('open'); panel.scrollTop = 0;
  shiftTarget = Math.min(innerHeight * .46, 360) * .55;
}
bar.addEventListener('click', e => { const b = e.target.closest('button[data-tab]'); if (b) showTab(b.dataset.tab); });
bar.querySelector('[data-tab=tienda]').classList.remove('on');

const hint = document.getElementById('hint');
function hintOff() { hint.classList.remove('show'); }
setTimeout(() => hint.classList.add('show'), 600); setTimeout(hintOff, 7000);

// ───────────────────────── bucle ─────────────────────────
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  az += (azTarget - az) * Math.min(1, dt * 7) * (down?.moved ? 0 : 1);
  shift += (shiftTarget - shift) * Math.min(1, dt * 8);
  night += (nightTarget - night) * Math.min(1, dt * 2.5);
  applyNight(night);
  // paredes: las que quedan delante de la cámara se bajan
  const dx = Math.sin(az), dz = Math.cos(az);
  const normals = { norte: [0, 1], sur: [0, -1], oeste: [1, 0], este: [-1, 0] };
  wallGroups.forEach(w => {
    const n = normals[w.userData.name], dot = dx * n[0] + dz * n[1];
    const goal = dot > 0 ? 1 : .06;
    w.userData.scaleY += (goal - w.userData.scaleY) * Math.min(1, dt * 9);
    w.scale.y = w.userData.scaleY; w.userData.decor.visible = w.userData.scaleY > .7;
  });
  stepHero(dt);
  idle(cust1, t, 0); idle(cust2, t, 2); idle(cust3, t, 4);
  if (catBody) catBody.scale.y = .62 + Math.sin(t * 1.6) * .02;
  if (steamMesh) { steamMesh.position.y = .78 + ((t * .08) % .1); steamMesh.material.opacity = .35 - ((t * .8) % 1) * .3; }
  placeCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__sala = { get az() { return az; }, setAz: v => { az = azTarget = v; }, showTab, scene, camera };
