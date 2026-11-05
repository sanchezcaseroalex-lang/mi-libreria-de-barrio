// Mundo 3D de la librería: sala, paredes y suelo personalizables, muebles, almacén, gente, cámara y entrada táctil.
import {
  THREE, M, MT, MG, mWalnut, mOak, mPine, mDark, mBrass, mPage, canvasTex, floorTex, wallTex, FLOORS, WALLS,
  box, boxAt, cyl, cylAt, sph, shade, disposeTree, hashStr, mulberry32, displayBook, lyingBook, coverTexture, spineBook,
} from './kit3d.js';
import { buildFurniture, itemMesh } from './furniture3d.js';
import { buildTown } from './town3d.js';
import { makeVan } from './van3d.js';
import { makePerson, animatePerson, sitPerson, HERO_LOOK } from './people3d.js';
import { B, ENTRY, DOOR_ROW, FURN, dims, placed, seatCell, doorCell, placementError } from './layout.js';
import { BOOK, BOOKS, GENRES } from './books.js';

export const ROT_Y = [0, -Math.PI / 2, Math.PI, Math.PI / 2];
const WALL_H = 2.7;
const SHELF_X = [1.2, 3.3, 5.4];
export const STORE_INFO = { w: 7, d: 6, door: [6, 3], shelfFront: [[1, 1], [3, 1], [5, 1]], boxSlots: [[2.0, 3.9], [3.5, 3.9], [5.0, 3.9], [2.0, 5.1], [3.5, 5.1], [5.0, 5.1], [6.2, 5.2], [1.5, 2.4]] };
const STORE = { w: 7, d: 6, off: new THREE.Vector3(60, 0, 0) };

/* ---------- Carteles ---------- */

export const ARTS = {
  sol: { name: 'Sol', draw: (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6c9a0'); gr.addColorStop(1, '#e58f6f'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff1c4'; g.beginPath(); g.arc(w / 2, h * .55, w * .28, 0, 7); g.fill(); g.fillStyle = '#4b6a67'; g.fillRect(0, h * .72, w, h * .28); g.fillStyle = '#35504d'; g.beginPath(); g.moveTo(0, h * .8); g.lineTo(w * .3, h * .62); g.lineTo(w * .6, h * .82); g.lineTo(w, h * .66); g.lineTo(w, h); g.lineTo(0, h); g.fill(); } },
  luna: { name: 'Luna', draw: (g, w, h) => { g.fillStyle = '#24335a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; for (let i = 0; i < 26; i++) g.fillRect((i * 53) % w, (i * 97) % h, 2, 2); g.fillStyle = '#f7e7a9'; g.beginPath(); g.arc(w / 2, h * .42, w * .26, 0, 7); g.fill(); g.fillStyle = '#24335a'; g.beginPath(); g.arc(w / 2 + w * .1, h * .38, w * .24, 0, 7); g.fill(); } },
  montes: { name: 'Montañas', draw: (g, w, h) => { g.fillStyle = '#bfd8de'; g.fillRect(0, 0, w, h); g.fillStyle = '#7da3ad'; g.beginPath(); g.moveTo(0, h * .75); g.lineTo(w * .35, h * .3); g.lineTo(w * .7, h * .75); g.fill(); g.fillStyle = '#4d7480'; g.beginPath(); g.moveTo(w * .3, h); g.lineTo(w * .7, h * .42); g.lineTo(w, h); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(w * .62, h * .5); g.lineTo(w * .7, h * .42); g.lineTo(w * .78, h * .52); g.fill(); } },
  libro: { name: 'Libro abierto', draw: (g, w, h) => { g.fillStyle = '#efdcb8'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8566b'; g.beginPath(); g.moveTo(w * .12, h * .35); g.quadraticCurveTo(w * .3, h * .28, w * .5, h * .38); g.lineTo(w * .5, h * .72); g.quadraticCurveTo(w * .3, h * .62, w * .12, h * .7); g.fill(); g.fillStyle = '#e0a93b'; g.beginPath(); g.moveTo(w * .88, h * .35); g.quadraticCurveTo(w * .7, h * .28, w * .5, h * .38); g.lineTo(w * .5, h * .72); g.quadraticCurveTo(w * .7, h * .62, w * .88, h * .7); g.fill(); g.fillStyle = '#3a2a20'; g.font = `700 ${w * .13}px Fraunces, serif`; g.textAlign = 'center'; g.fillText('Lee', w / 2, h * .16); g.fillText('más', w / 2, h * .9); } },
  taza: { name: 'Taza de té', draw: (g, w, h) => { g.fillStyle = '#dce8d4'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.fillRect(w * .22, h * .45, w * .5, h * .3); g.beginPath(); g.arc(w * .72, h * .58, w * .1, -1.5, 1.5); g.lineWidth = 8; g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#c06a52'; g.fillRect(w * .22, h * .5, w * .5, h * .05); g.strokeStyle = '#8aa88a'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(w * (.35 + i * .12), h * .4); g.quadraticCurveTo(w * (.3 + i * .12), h * .3, w * (.37 + i * .12), h * .2); g.stroke(); } } },
  flor: { name: 'Flores', draw: (g, w, h) => { g.fillStyle = '#f1e6cc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5c9457'; g.lineWidth = 4; [[.3, .55], [.5, .4], [.7, .6]].forEach(([x, y], i) => { g.beginPath(); g.moveTo(w * x, h * .9); g.lineTo(w * x, h * y); g.stroke(); g.fillStyle = ['#c8566b', '#e0a93b', '#8a6aa8'][i]; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(w * x + Math.cos(k) * w * .07, h * y + Math.sin(k) * w * .07, w * .05, 0, 7); g.fill(); } g.fillStyle = '#fff3c4'; g.beginPath(); g.arc(w * x, h * y, w * .04, 0, 7); g.fill(); }); } },
  mar: { name: 'Mar y faro', draw: (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6e3b8'); gr.addColorStop(.6, '#9ec7d3'); gr.addColorStop(1, '#4f86a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#f3ede0'; g.fillRect(w * .44, h * .32, w * .12, h * .36); g.fillStyle = '#c8566b'; g.fillRect(w * .44, h * .42, w * .12, h * .06); g.fillRect(w * .44, h * .56, w * .12, h * .06); g.fillStyle = '#6b4a3a'; g.fillRect(w * .4, h * .28, w * .2, h * .05); g.fillStyle = '#35607a'; g.fillRect(0, h * .68, w, h * .32); } },
  gato: { name: 'Gato', draw: (g, w, h) => { g.fillStyle = '#e8c89b'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a2a20'; g.beginPath(); g.arc(w / 2, h * .55, w * .27, 0, 7); g.fill(); g.beginPath(); g.moveTo(w * .26, h * .42); g.lineTo(w * .3, h * .22); g.lineTo(w * .42, h * .34); g.fill(); g.beginPath(); g.moveTo(w * .74, h * .42); g.lineTo(w * .7, h * .22); g.lineTo(w * .58, h * .34); g.fill(); g.fillStyle = '#f2d66b'; g.beginPath(); g.arc(w * .4, h * .52, w * .05, 0, 7); g.arc(w * .6, h * .52, w * .05, 0, 7); g.fill(); } },
};
export const POSTER_SIZES = { s: { w: 0.55, h: 0.72, name: 'Pequeño' }, m: { w: 0.8, h: 1.0, name: 'Mediano' }, l: { w: 1.3, h: 0.85, name: 'Apaisado' }, xl: { w: 1.1, h: 1.4, name: 'Grande' } };

function posterTexture(p) {
  if (p.kind === 'img' && p.img) {
    const t = new THREE.Texture(); const im = new Image();
    im.onload = () => { t.image = im; t.needsUpdate = true; };
    im.src = p.img; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }
  if (p.kind === 'pizarra' || p.kind === 'papel') {
    const w = 300, h = Math.round(300 * (p.h / p.w));
    const lines = String(p.text ?? '').split(/[|\n]/);
    return canvasTex(w, h, (g) => {
      const dark = p.kind === 'pizarra';
      g.fillStyle = dark ? (p.color ?? '#2f3b36') : (p.color ?? '#f6edd5'); g.fillRect(0, 0, w, h);
      if (dark) { g.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * w, Math.random() * h, 12 + Math.random() * 40, 2); }
      else { g.fillStyle = 'rgba(120,80,40,.08)'; for (let i = 0; i < 60; i++) g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      g.fillStyle = dark ? '#f3e7c9' : '#3a2a20'; g.textAlign = 'center'; g.textBaseline = 'middle';
      const fs = Math.min(46, Math.max(20, Math.floor(h / (lines.length + 1.2)))), step = fs * 1.18, y0 = h / 2 - ((lines.length - 1) * step) / 2;
      lines.forEach((ln, i) => {
        g.font = `600 ${fs}px Caveat, cursive`;
        let size = fs; while (g.measureText(ln).width > w - 30 && size > 12) { size -= 2; g.font = `600 ${size}px Caveat, cursive`; }
        g.fillStyle = dark ? (i === 0 ? '#f6d98a' : '#f3e7c9') : '#3a2a20'; g.fillText(ln, w / 2, y0 + i * step);
      });
      if (!dark) { g.fillStyle = 'rgba(224,169,59,.8)'; g.fillRect(w / 2 - 30, -6, 60, 20); }
    });
  }
  const art = ARTS[p.art] ?? ARTS.sol;
  return canvasTex(220, Math.round(220 * (p.h / p.w)), (g, w, h) => art.draw(g, w, h));
}

function makePoster(p) {
  const g = new THREE.Group();
  const fw = p.kind === 'papel' ? 0 : .045;
  if (fw) boxAt(g, p.w + fw * 2, p.h + fw * 2, .04, p.kind === 'pizarra' ? mOak : mDark, 0, -p.h / 2 - fw, 0, .01);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), new THREE.MeshStandardMaterial({ map: posterTexture(p), roughness: .85 }));
  pl.position.z = fw ? .025 : .008; g.add(pl);
  g.userData = { posterUid: p.uid, p };
  g.traverse((o) => { if (o.isMesh) { o.userData.posterUid = p.uid; o.castShadow = false; } });
  return g;
}

/* ---------- Mundo ---------- */

export function createWorld(canvas, bubblesEl, hooks = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 160);
  const shopRoot = new THREE.Group(); scene.add(shopRoot);
  const storeRoot = new THREE.Group(); storeRoot.position.copy(STORE.off); storeRoot.visible = false; scene.add(storeRoot);

  /* luces */
  const hemi = new THREE.HemisphereLight('#fff1d6', '#7a5640', 1.15); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffe2b0', 2.2);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0005; sun.shadow.normalBias = .03; sun.shadow.radius = 4;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#ffd0a0', .35); fill.position.set(-6, 6, 8); scene.add(fill);
  const lampPool = Array.from({ length: 6 }, () => { const l = new THREE.PointLight('#ffbd70', 0, 6, 2); l.userData.base = 0; scene.add(l); return l; });
  const bulb = new THREE.PointLight('#ffd79a', 0, 9, 2); storeRoot.add(bulb); bulb.position.set(3.5, 2.5, 3);

  /* estado interno */
  let S = null;
  let view = 'shop';
  let editOn = false;
  let selUid = null, selPoster = null;
  let shell = null, furnRoot = null, nookP = null, stockRoot = null, boxRoot = null, gridLines = null, selMark = null;
  const keys = { shell: '', furn: '', nook: '', store: '' };
  const walls = [];                  // paredes de la vista actual
  let shopWalls = [];
  let vanObj = null;
  let townRoot = null, townInfo = null, flight = null, townName = 'La Tinta y el Té';
  const TOWN_X = -100;
  const townPeds = [];
  const doorLeaves = {};
  let doorAng = 0, doorTarget = 0;
  const anims = [];
  const people = new Set();
  const tasks = [];
  const lampSources = [];
  let timeState = { t: .06, weather: 'sol' };

  const skyTex = canvasTex(8, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fd3f2'); gr.addColorStop(1, '#f7ecd2'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTex });
  const glassMat = new THREE.MeshStandardMaterial({ color: '#cfe9f5', transparent: true, opacity: .28, roughness: .1, emissive: '#bfe3f7', emissiveIntensity: .25, depthWrite: false });
  const mShadowOnly = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });

  /* ---------- Cámara ---------- */
  const rig = { az: Math.PI / 4, azT: Math.PI / 4, zoom: 1, shift: 0, shiftT: 0, target: new THREE.Vector3(5, .9, 4), center: new THREE.Vector3(5, 0, 4), ext: 9 };
  const ELEV = THREE.MathUtils.degToRad(36);
  let W = 1, H = 1;
  const baseHalf = () => { const aspect = W / H; let hw = 7.5, hh = hw / aspect; if (hh < 6.6) { hh = 6.6; hw = hh * aspect; } return [hw, hh]; };
  function fit() {
    W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    renderer.setSize(W, H, false);
    const [hw, hh] = baseHalf(); const z = rig.zoom * rig.base;
    Object.assign(camera, { left: -hw / z, right: hw / z, top: hh / z, bottom: -hh / z }); camera.updateProjectionMatrix();
  }
  rig.base = 1;
  function placeCamera() {
    const d = 50;
    camera.position.set(rig.target.x + Math.sin(rig.az) * Math.cos(ELEV) * d, rig.target.y + Math.sin(ELEV) * d, rig.target.z + Math.cos(rig.az) * Math.cos(ELEV) * d);
    camera.lookAt(rig.target);
    camera.setViewOffset(W, H, 0, rig.shift, W, H);
  }
  addEventListener('resize', fit);

  function clampTarget() {
    rig.target.x = THREE.MathUtils.clamp(rig.target.x, rig.center.x - rig.ext, rig.center.x + rig.ext);
    rig.target.z = THREE.MathUtils.clamp(rig.target.z, rig.center.z - rig.ext, rig.center.z + rig.ext);
  }
  function frameRoom(cx, cz, w, d) {
    rig.center.set(cx, 0, cz); rig.target.set(cx, .9, cz);
    const need = Math.max(w, d) * .5 + Math.min(w, d) * .5;      // medio diagonal aproximado
    rig.base = THREE.MathUtils.clamp(9.2 / Math.max(need, 6), .5, 1.25);
    rig.zoom = 1; rig.ext = Math.max(w, d) * .5 + 1.5; fit();
    sun.target.position.set(cx, 0, cz);
    sun.position.set(cx + 4, 11, cz - 11);
    const e = Math.max(w, d) * .75 + 2; Object.assign(sun.shadow.camera, { left: -e, right: e, top: e, bottom: -e, near: 1, far: 40 }); sun.shadow.camera.updateProjectionMatrix();
  }

  /* ---------- Suelo y paredes ---------- */
  const lxOf = (side, u, c) => (side === 'N' ? u - c.x : side === 'S' ? -(u - c.x) : side === 'W' ? -(u - c.z) : u - c.z);
  const uOf = (side, lx, c) => (side === 'N' ? lx + c.x : side === 'S' ? c.x - lx : side === 'W' ? c.z - lx : lx + c.z);

  function wallSegments(L, openings, matFn, T = .22) {
    const g = new THREE.Group();
    const add = (x0, x1, y0, y1) => {
      if (x1 - x0 < .001 || y1 - y0 < .001) return;
      const geo = new THREE.BoxGeometry(x1 - x0, y1 - y0, T);
      const uv = geo.attributes.uv, pos = geo.attributes.position, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + cx) / 2, (pos.getY(i) + cy) / 2);
      const m = new THREE.Mesh(geo, matFn()); m.position.set(cx, cy, -T / 2); g.add(m);
    };
    let cur = -L / 2;
    [...openings].sort((a, b) => a.x0 - b.x0).forEach((o) => { add(cur, o.x0, 0, WALL_H); add(o.x0, o.x1, 0, o.y0); add(o.x0, o.x1, o.y1, WALL_H); cur = o.x1; });
    add(cur, L / 2, 0, WALL_H);
    return g;
  }

  function windowFrame(slabs, decor, x0, x1, y0, y1, curtains) {
    const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    boxAt(slabs, w + .16, .07, .16, mOak, cx, y0 - .07, 0, .01); boxAt(slabs, w + .16, .08, .12, mOak, cx, y1, 0, .01);
    boxAt(slabs, .08, h, .12, mOak, x0 - .01, y0, 0, .01); boxAt(slabs, .08, h, .12, mOak, x1 + .01, y0, 0, .01);
    boxAt(slabs, .05, h, .06, mOak, cx, y0, -.04, 0); boxAt(slabs, w, .05, .06, mOak, cx, cy - .025, -.04, 0);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat); gl.position.set(cx, cy, -.08); slabs.add(gl);
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(w + .3, h + .3), skyMat); sky.position.set(cx, cy, -.2); slabs.add(sky);
    if (curtains) {
      const cm = M('#d98f7a', .95);
      boxAt(decor, .26, h + .25, .1, cm, x0 - .1, y0 - .1, .09, .05); boxAt(decor, .26, h + .25, .1, cm, x1 + .1, y0 - .1, .09, .05);
      const rod = cyl(.02, .02, w + .7, mDark, 8); rod.rotation.z = Math.PI / 2; rod.position.set(cx, y1 + .2, .09); decor.add(rod);
      const p = cyl(.07, .05, .12, M('#c4704a', .85), 14); p.position.set(cx - w * .25, y0 + .06, .02); decor.add(p);
      const lf = sph(.12, M('#5c9457'), 1, 1.1, 1); lf.position.set(cx - w * .25, y0 + .22, .02); decor.add(lf);
    }
  }

  const doormatTex = (txt) => canvasTex(256, 140, (g, w, h) => {
    g.fillStyle = '#b79562'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5a34'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16);
    const fs = txt.length > 20 ? 20 : txt.length > 14 ? 28 : txt.length > 10 ? 34 : 40;
    g.fillStyle = '#4a3220'; g.font = `700 ${fs}px Fraunces, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 2, w - 36);
  });
  const nameSign = (txt, bg, fg) => canvasTex(256, 96, (c, w, h) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = fg; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = fg; c.font = '700 40px Fraunces, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 2);
  });

  // Hoja de puerta abierta: ang > 0 la abre hacia el lado "interior" de la pared, ang < 0 hacia el otro lado
  function doorLeaf(hingeX, ang) {
    const lf = new THREE.Group(); lf.position.set(hingeX, 0, 0);
    const lm = box(1.05, 2.0, .06, mPine, .015); lm.position.set(-.525, 1.0, 0); lf.add(lm);
    const pnl = box(.78, .72, .02, mOak, .01); pnl.position.set(-.525, 1.45, .035); lf.add(pnl);
    const pnl2 = box(.78, .72, .02, mOak, .01); pnl2.position.set(-.525, 1.45, -.035); lf.add(pnl2);
    const kn = sph(.035, M('#d9b24a', .3, .8)); kn.position.set(-.94, 1.0, .06); lf.add(kn);
    lf.rotation.y = ang;
    return lf;
  }
  function buildWall(parent, shadowParent, side, L, rotY, pos, openings, info) {
    const matFn = () => info.wallMat;
    const slabs = new THREE.Group(); slabs.position.copy(pos); slabs.rotation.y = rotY;
    const fixed = new THREE.Group(); fixed.position.copy(pos); fixed.rotation.y = rotY;
    slabs.add(wallSegments(L, openings, matFn));
    const sh = wallSegments(L, openings, () => mShadowOnly); sh.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const sg = new THREE.Group(); sg.position.copy(pos); sg.rotation.y = rotY; sg.add(sh); shadowParent.add(sg);
    // zócalo, moldura y rodapié (saltando las puertas)
    const doors = openings.filter((o) => o.y0 < .5).sort((a, b) => a.x0 - b.x0), spans = []; let cur = -L / 2;
    doors.forEach((o) => { spans.push([cur, o.x0]); cur = o.x1; }); spans.push([cur, L / 2]);
    spans.forEach(([a, b]) => {
      if (b - a < .01) return;
      if (info.wain) { boxAt(slabs, b - a, .96, .05, info.wainMat, (a + b) / 2, 0, .025, 0); boxAt(slabs, b - a, .06, .09, mOak, (a + b) / 2, .96, .045, .01); }
      boxAt(slabs, b - a, .13, .07, mDark, (a + b) / 2, 0, .035, .01);
    });
    const decor = new THREE.Group(); slabs.add(decor);
    parent.add(slabs, fixed);
    return { side, L, slabs, fixed, decor, scale: 1, rotY, pos: pos.clone() };
  }

  const wallNormals = { N: [0, 1], S: [0, -1], W: [1, 0], E: [-1, 0] };

  function buildShell() {
    if (shell) { shopRoot.remove(shell); disposeTree(shell); }
    shell = new THREE.Group(); shopRoot.add(shell);
    const wl = [];
    const X0 = B.x0, X1 = B.x1 + 1, Z0 = B.y0, Z1 = B.y1 + 1, Wd = X1 - X0, Dp = Z1 - Z0, c = new THREE.Vector3((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
    const deco = S.deco;
    const wt = wallTex(deco.wall), wdef = WALLS[deco.wall] ?? WALLS.crema;
    const info = { wallMat: new THREE.MeshStandardMaterial({ map: wt, roughness: .95 }), wain: !!wdef.wain, wainMat: M(wdef.wain ?? '#3f6b66', .85) };
    // suelo
    const ft = floorTex(deco.floor); ft.repeat.set((Wd + .4) / 2, (Dp + .4) / 2);
    const floor = new THREE.Mesh(new THREE.BoxGeometry(Wd + .4, .3, Dp + .4), [M('#4a2f24'), M('#4a2f24'), MT(ft, .75), M('#3a2318'), M('#4a2f24'), M('#4a2f24')]);
    floor.position.set(c.x, -.15, c.z); floor.receiveShadow = true; floor.userData.floor = true; shell.add(floor);
    const shadowG = new THREE.Group(); shell.add(shadowG);
    // aberturas
    const winN = [5, 8.6, 12.4, -1.8].filter((x) => x - 1 > X0 && x + 1 < X1);
    const winS = [1.8, 8.2, 12.2, -1.8].filter((x) => x - 1 > X0 && x + 1 < X1);
    const opN = winN.map((x) => ({ x0: lxOf('N', x, c) - .8, x1: lxOf('N', x, c) + .8, y0: 1.05, y1: 2.15, wx: x }));
    const doorX = 5.0, opS = [{ x0: lxOf('S', doorX, c) - 1.0, x1: lxOf('S', doorX, c) + 1.0, y0: 0, y1: 2.15 }, ...winS.map((x) => ({ x0: lxOf('S', x, c) - .8, x1: lxOf('S', x, c) + .8, y0: .55, y1: 2.1, wx: x }))];
    const dz = DOOR_ROW + .5, opW = [{ x0: lxOf('W', dz, c) - .55, x1: lxOf('W', dz, c) + .55, y0: 0, y1: 2.05 }];
    const Wn = buildWall(shell, shadowG, 'N', Wd, 0, new THREE.Vector3(c.x, 0, Z0), opN, info);
    const Ws = buildWall(shell, shadowG, 'S', Wd, Math.PI, new THREE.Vector3(c.x, 0, Z1), opS, info);
    const Ww = buildWall(shell, shadowG, 'W', Dp, Math.PI / 2, new THREE.Vector3(X0, 0, c.z), opW, info);
    const We = buildWall(shell, shadowG, 'E', Dp, -Math.PI / 2, new THREE.Vector3(X1, 0, c.z), [], info);
    wl.push(Wn, Ws, Ww, We);
    shopWalls = wl;
    if (view === 'shop') { walls.length = 0; walls.push(...wl); }
    opN.forEach((o) => windowFrame(Wn.slabs, Wn.decor, o.x0, o.x1, o.y0, o.y1, true));
    opS.slice(1).forEach((o) => windowFrame(Ws.slabs, Ws.decor, o.x0, o.x1, o.y0, o.y1, false));
    // puerta de entrada doble (siempre visible aunque la pared baje): abierta con la tienda abierta, cerrada si no
    {
      const o = opS[0], cx = (o.x0 + o.x1) / 2, f = Ws.fixed, wdt = o.x1 - o.x0;
      boxAt(f, .1, 2.25, .15, mOak, o.x0 - .04, 0, 0, .01); boxAt(f, .1, 2.25, .15, mOak, o.x1 + .04, 0, 0, .01); boxAt(f, wdt + .22, .12, .15, mOak, cx, 2.15, 0, .01);
      const mkLeaf = (side) => {
        const lf = new THREE.Group(); lf.position.set(side < 0 ? o.x0 : o.x1, 0, -.02);
        const w1 = wdt / 2 - .015, dir = side < 0 ? 1 : -1;
        const fr = box(w1, 2.05, .05, mPine, .015); fr.position.set(dir * w1 / 2, 1.025, 0); lf.add(fr);
        const inner = box(w1 - .22, 1.2, .02, M('#bfe0ea', .15), .01); inner.position.set(dir * w1 / 2, 1.3, .03); lf.add(inner);
        const inner2 = box(w1 - .22, 1.2, .02, M('#bfe0ea', .15), .01); inner2.position.set(dir * w1 / 2, 1.3, -.03); lf.add(inner2);
        const bar2 = box(w1 - .22, .035, .03, mOak, .005); bar2.position.set(dir * w1 / 2, 1.3, -.045); lf.add(bar2);
        const bar = box(w1 - .22, .035, .03, mOak, .005); bar.position.set(dir * w1 / 2, 1.3, .045); lf.add(bar);
        const kn = sph(.03, M('#d9b24a', .3, .8)); kn.position.set(dir * (w1 - .11), 1.0, .05); lf.add(kn);
        f.add(lf); return lf;
      };
      doorLeaves.L = mkLeaf(-1); doorLeaves.R = mkLeaf(1);
      doorLeaves.L.rotation.y = doorAng; doorLeaves.R.rotation.y = -doorAng;
      const street = new THREE.Mesh(new THREE.PlaneGeometry(wdt, 2.15), new THREE.MeshBasicMaterial({ color: '#f7e4b8' })); street.position.set(cx, 1.075, -.4); f.add(street);
      const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .41), new THREE.MeshStandardMaterial({ map: nameSign(S.shopName ?? 'Librería', '#3f6b66', '#f3e7c9') })); sp.position.set(cx, 2.55, .04); f.add(sp);
      const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .7), MT(doormatTex(S.doormat || 'Bienvenid@s'), 1)); mat.rotation.set(-Math.PI / 2, 0, Math.PI); mat.position.set(cx, .012, .55); mat.receiveShadow = true; f.add(mat);
      boxAt(f, wdt + .3, .08, .8, M('#9a9088', .9), cx, 0, -.5, .02);
    }
    // puerta del almacén: solo el hueco con su marco, sin hoja
    {
      const o = opW[0], cx = (o.x0 + o.x1) / 2, f = Ww.fixed;
      const dark = new THREE.Mesh(new THREE.PlaneGeometry(o.x1 - o.x0, 2.05), new THREE.MeshBasicMaterial({ color: '#2b1c14' })); dark.position.set(cx, 1.025, -.45); f.add(dark);
      const warm = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.4), new THREE.MeshBasicMaterial({ color: '#8a5a32', transparent: true, opacity: .55 })); warm.position.set(cx, .9, -.4); f.add(warm);
      boxAt(f, .09, 2.15, .14, mOak, o.x0 - .03, 0, 0, .01); boxAt(f, .09, 2.15, .14, mOak, o.x1 + .03, 0, 0, .01); boxAt(f, o.x1 - o.x0 + .2, .1, .14, mOak, cx, 2.05, 0, .01);
      const sp = new THREE.Mesh(new THREE.PlaneGeometry(.95, .36), new THREE.MeshStandardMaterial({ map: nameSign('Almacén', '#4a2f24', '#f3e7c9') })); sp.position.set(cx, 2.38, .04); f.add(sp);
      f.add(doorLeaf(o.x1, -1.75));
    }
    Ww.fixed.traverse((o) => { if (o.isMesh) o.userData.door = 'store'; });
    // carteles
    for (const p of deco.posters) {
      const w = { N: Wn, S: Ws, W: Ww, E: We }[p.side]; if (!w) continue;
      const lx = lxOf(p.side, p.u, c);
      if (Math.abs(lx) > w.L / 2 - p.w / 2) continue;
      const m = makePoster(p); m.position.set(lx, p.v, .03); w.decor.add(m);
    }
    // guirnalda de luces
    if (S.owned?.lights) {
      const pts = []; for (let i = 0; i <= 24; i++) pts.push(new THREE.Vector3(-Wd / 2 + .3 + i * ((Wd - .6) / 24), 2.5 - .16 * Math.sin(i / 24 * Math.PI * Math.max(3, Math.round(Wd / 3))), .06));
      const curve = new THREE.CatmullRomCurve3(pts);
      Wn.decor.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 90, .008, 5), M('#2a1f1a')));
      for (let i = 0; i < 28; i++) { const p = curve.getPoint((i + .5) / 28); const b = sph(.04, MG(i % 3 === 0 ? '#ffb15c' : '#ffdc8a', 2.2)); b.castShadow = false; b.position.set(p.x, p.y - .04, p.z); Wn.decor.add(b); }
    }
    // cuadrícula de edición y marcas
    const pts = [];
    for (let x = X0; x <= X1; x++) pts.push(x, .02, Z0, x, .02, Z1);
    for (let z = Z0; z <= Z1; z++) pts.push(X0, .02, z, X1, .02, z);
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    gridLines = new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: .32 }));
    gridLines.visible = editOn; shell.add(gridLines);
    // la zona de entrada (casillas 4 y 5 de la fila de abajo)
    rig.shopFrame = { x: c.x, z: c.z, w: Wd, d: Dp };
    if (view === 'shop') frameRoom(c.x, c.z, Wd, Dp);
    applyTime();
  }

  /* ---------- Muebles ---------- */
  const lightCtx = { lights: [] };
  function buildFurn() {
    if (furnRoot) { shopRoot.remove(furnRoot); disposeTree(furnRoot); }
    furnRoot = new THREE.Group(); shopRoot.add(furnRoot);
    anims.length = 0; lightCtx.lights = [];
    for (const f of placed(S.furniture)) {
      const d = dims(f.type, f.rot ?? 0);
      const root = buildFurniture(f, lightCtx);
      root.position.set(f.x + d.w / 2, 0, f.y + d.h / 2); root.rotation.y = ROT_Y[f.rot ?? 0];
      root.userData.uid = f.uid; root.userData.type = f.type;
      root.traverse((o) => { if (o.isMesh) o.userData.furnUid = f.uid; });
      if (root.userData.anim) anims.push(root.userData.anim);
      furnRoot.add(root);
    }
    furnRoot.updateMatrixWorld(true);
    lampSources.length = 0;
    lightCtx.lights.forEach((l, i) => {
      if (i >= lampPool.length) return;
      const p = new THREE.Vector3(); l.obj.getWorldPosition(p);
      const L = lampPool[i]; L.position.copy(p); L.color.set(l.color); L.userData.base = 9 * l.k; lampSources.push(L);
    });
    for (let i = lightCtx.lights.length; i < lampPool.length; i++) { lampPool[i].userData.base = 0; }
    applyTime();
    if (selUid) markSelection(selUid);
  }

  /* ---------- Gente ---------- */
  function spawn(look, cell, rot = 0, withBubble = true, room = 'shop') {
    const p = makePerson(look); p.userData.seed = Math.random() * 10;
    const root = room === 'store' ? storeRoot : room === 'town' ? (townRoot ?? shopRoot) : shopRoot;
    root.add(p); p.position.set(cell[0] + .5, 0, cell[1] + .5); p.rotation.y = rot; p.userData.look = look;
    if (withBubble) { const el = document.createElement('div'); el.className = 'bubble3d'; el.hidden = true; bubblesEl.append(el); p.userData.bubble = el; }
    p.traverse((o) => { if (o.isMesh) o.userData.personRef = p; });
    people.add(p); return p;
  }
  function removePerson(p) {
    people.delete(p); p.parent?.remove(p); p.userData.bubble?.remove(); disposeTree(p);
    for (let i = tasks.length - 1; i >= 0; i--) if (tasks[i].p === p) { tasks[i].res(); tasks.splice(i, 1); }
  }
  function say(p, text, cls = '') {
    const el = p?.userData.bubble; if (!el) return;
    el.className = `bubble3d ${cls}`; el.textContent = text; el.hidden = !text;
  }
  function walk(p, cells, speed = 2.5) {
    return new Promise((res) => {
      const pts = cells.map(([c, r]) => new THREE.Vector2(c + .5, r + .5));
      if (!pts.length) { res(); return; }
      tasks.push({ p, pts, i: 0, speed, res });
    });
  }
  // Recorre una ruta (puntos del mundo, el primero es la posición actual) siguiendo una curva suave
  // Una persona solo sigue una ruta a la vez: la nueva anula la anterior (antes se peleaban y se quedaba pillada)
  function cancelWalks(p) { for (let i = tasks.length - 1; i >= 0; i--) if (tasks[i].p === p) { const t = tasks[i]; tasks.splice(i, 1); t.res(); } }
  function walkRoute(p, pts, speed = 2.5, valid = null) {
    return new Promise((res) => {
      cancelWalks(p);
      if (!pts || pts.length < 2) { res(); return; }
      const v3 = pts.map((q) => new THREE.Vector3(q.x, 0, q.z));
      let poly = v3;
      if (v3.length > 2) {
        const curve = new THREE.CatmullRomCurve3(v3, false, 'centripetal');
        poly = curve.getSpacedPoints(Math.max(8, Math.ceil(curve.getLength() / 0.18)));
        if (valid && poly.some((v) => !valid(v.x, v.z))) {
          poly = [v3[0]];
          for (let i = 1; i < v3.length; i++) { const a = v3[i - 1], b = v3[i], n = Math.max(1, Math.ceil(a.distanceTo(b) / 0.25)); for (let k = 1; k <= n; k++) poly.push(a.clone().lerp(b, k / n)); }
        }
      } else {
        const len = v3[0].distanceTo(v3[1]), n = Math.max(2, Math.ceil(len / 0.3)); poly = Array.from({ length: n }, (_, i) => v3[0].clone().lerp(v3[1], i / (n - 1)));
      }
      tasks.push({ p, pts: poly.slice(1).map((v) => new THREE.Vector2(v.x, v.z)), i: 0, speed, res, age: 0 });
    });
  }
  function walkTo(p, x, z, speed = 2.5) { return new Promise((res) => { cancelWalks(p); tasks.push({ p, pts: [new THREE.Vector2(x, z)], i: 0, speed, res, age: 0 }); }); }
  function face(p, dx, dz) { p.userData.faceT = Math.atan2(dx, dz); }
  function stepPeople(dt, t) {
    const moving = new Set();
    for (let k = tasks.length - 1; k >= 0; k--) {
      const tk = tasks[k], p = tk.p, tg = tk.pts[tk.i];
      tk.age = (tk.age ?? 0) + dt;
      if (tk.age > 70) { const last = tk.pts[tk.pts.length - 1]; p.position.x = last.x; p.position.z = last.y; tasks.splice(k, 1); tk.res(); continue; }   // seguro: nadie camina eternamente
      const dx = tg.x - p.position.x, dz = tg.y - p.position.z, dist = Math.hypot(dx, dz), step = tk.speed * dt;
      // si alguien está justo delante, se rodea o se espera un momento (no se traspasan)
      if (dist > .05) {
        let blocker = null;
        for (const q of people) {
          if (q === p || !q.visible || q.parent !== p.parent) continue;
          const ox = q.position.x - p.position.x, oz = q.position.z - p.position.z, od = Math.hypot(ox, oz);
          if (od < .5 && (ox * dx + oz * dz) / (od * dist || 1) > .35) { blocker = q; break; }
        }
        if (blocker && (tk.wait ?? 0) < 1.1) {
          tk.wait = (tk.wait ?? 0) + dt;
          const side = (p.id % 2 ? 1 : -1);
          p.position.x += (-dz / dist) * side * step * .6; p.position.z += (dx / dist) * side * step * .6;
          moving.add(p);
          continue;
        }
        if (!blocker) tk.wait = Math.max(0, (tk.wait ?? 0) - dt * 2);
      }
      if (dist <= step) { p.position.x = tg.x; p.position.z = tg.y; tk.i++; if (tk.i >= tk.pts.length) { tasks.splice(k, 1); tk.res(); continue; } }
      else { p.position.x += dx / dist * step; p.position.z += dz / dist * step; p.userData.faceT = Math.atan2(dx, dz); }
      moving.add(p);
    }
    for (const p of people) {
      const ft = p.userData.faceT;
      if (ft != null) { let d = ft - p.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; p.rotation.y += d * Math.min(1, dt * 12); }
      animatePerson(p, moving.has(p), dt, t);
    }
  }
  const projV = new THREE.Vector3();
  function updateBubbles() {
    for (const p of people) {
      const el = p.userData.bubble; if (!el || el.hidden) continue;
      if (!p.parent?.visible || !p.visible) { el.style.transform = 'translate(-999px,-999px)'; continue; }
      projV.set(p.position.x, p.position.y + 1.45, p.position.z); p.parent?.localToWorld?.(projV.set(p.position.x, p.position.y + 1.45, p.position.z));
      projV.project(camera);
      const x = (projV.x * .5 + .5) * W, y = (-projV.y * .5 + .5) * H - 0;
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -100%)`;
    }
  }

  const heroSized = (l) => ({ ...l, scale: (l.scale ?? 1) * 1.1 });
  let hero = makePerson(heroSized(HERO_LOOK)); hero.userData.seed = 3; shopRoot.add(hero);
  hero.userData.bubble = (() => { const el = document.createElement('div'); el.className = 'bubble3d hero'; el.hidden = true; bubblesEl.append(el); return el; })();
  people.add(hero);
  function heroSetView(v) { (v === 'shop' ? shopRoot : storeRoot).add(hero); }

  // Dibujar las personas de la nook (lectora sentada)
  function syncNook() {
    if (nookP) { removePerson(nookP); nookP = null; }
    if (!S.nook) return;
    const chair = placed(S.furniture).find((f) => (f.type === 'armchair' || f.type === 'sofa') && seatCell(f, S.furniture));
    if (!chair) return;
    const d = dims(chair.type, chair.rot ?? 0);
    const p = spawn(S.nook.person, [0, 0], ROT_Y[chair.rot ?? 0], false);
    const off = chair.type === 'sofa' ? .45 : 0, r = chair.rot ?? 0;
    const ox = r === 0 ? off : r === 2 ? -off : 0, oz = r === 1 ? off : r === 3 ? -off : 0;
    p.position.set(chair.x + d.w / 2 + ox, .08, chair.y + d.h / 2 + oz);
    p.userData.faceT = null; sitPerson(p, true); nookP = p;
    const book = displayBook(BOOK[S.nook.bookId ?? 'alas'] ?? BOOKS[0], .2, .28, .04); book.rotation.x = -.5; book.position.set(0, .6, .22); p.userData.hold.add(book); p.userData.hold.position.set(0, .15, .1);
  }

  /* ---------- Almacén (otra estancia) ---------- */
  let storeBuilt = false;
  const storeWalls = [];
  const storeShelves = [];
  function buildStoreShell() {
    storeBuilt = true;
    const W7 = STORE.w, D6 = STORE.d, cx = W7 / 2, cz = D6 / 2;
    const ft = floorTex('nogal').clone(); ft.needsUpdate = true; ft.repeat.set(W7 / 2, D6 / 2);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(W7 + .4, .3, D6 + .4), [M('#4a2f24'), M('#4a2f24'), MT(ft, .8), M('#3a2318'), M('#4a2f24'), M('#4a2f24')]);
    fl.position.set(cx, -.15, cz); fl.receiveShadow = true; storeRoot.add(fl);
    const info = { wallMat: M('#d8c6a2', .95), wain: true, wainMat: M('#7a5a44', .9) };
    const sg = new THREE.Group(); storeRoot.add(sg);
    const wN = buildWall(storeRoot, sg, 'N', W7, 0, new THREE.Vector3(cx, 0, 0), [], info);
    const wS = buildWall(storeRoot, sg, 'S', W7, Math.PI, new THREE.Vector3(cx, 0, D6), [], info);
    const wW = buildWall(storeRoot, sg, 'W', D6, Math.PI / 2, new THREE.Vector3(0, 0, cz), [], info);
    const doorLx = lxOf('E', 3.5, { x: cx, z: cz }); // puerta en el este, a z=3
    const wE = buildWall(storeRoot, sg, 'E', D6, -Math.PI / 2, new THREE.Vector3(W7, 0, cz), [{ x0: doorLx - .55, x1: doorLx + .55, y0: 0, y1: 2.05 }], info);
    storeWalls.push(wN, wS, wW, wE);
    {
      const f = wE.fixed, cxd = doorLx;
      boxAt(f, .09, 2.15, .14, mOak, cxd - .57, 0, 0, .01); boxAt(f, .09, 2.15, .14, mOak, cxd + .57, 0, 0, .01); boxAt(f, 1.3, .1, .14, mOak, cxd, 2.05, 0, .01);
      const lit = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.05), new THREE.MeshBasicMaterial({ color: '#f1d9a8' })); lit.position.set(cxd, 1.02, -.45); f.add(lit);
      const sp = new THREE.Mesh(new THREE.PlaneGeometry(.95, .36), new THREE.MeshStandardMaterial({ map: nameSign('Tienda', '#3f6b66', '#f3e7c9') })); sp.position.set(cxd, 2.38, .04); f.add(sp);
      f.add(doorLeaf(cxd + .55, 1.75));
      f.traverse((o) => { if (o.isMesh) o.userData.door = 'shop'; });
    }
    // estanterías metálicas contra la pared norte
    const mMetal = M('#6f7b80', .5, .5), mSheet = M('#8a949a', .6, .3);
    for (let u = 0; u < 3; u++) {
      const g = new THREE.Group(); g.position.set(SHELF_X[u], 0, .3); storeRoot.add(g);
      g.userData.shelfIdx = u; storeShelves.push(g);
      [-.8, .8].forEach((dx) => boxAt(g, .06, 1.7, .5, mMetal, dx, 0, 0, .01));
      for (let b = 0; b < 3; b++) boxAt(g, 1.66, .04, .5, mSheet, 0, .16 + b * .55, 0, .005);
      boxAt(g, 1.66, 1.7, .02, M('#58626a', .8), 0, 0, -.24, 0);
    }
    // mesa de trabajo con cinta y tijeras, cajas vacías apiladas y bombilla
    const bench = new THREE.Group(); bench.position.set(.45, 0, 4.5); bench.rotation.y = Math.PI / 2; storeRoot.add(bench);
    boxAt(bench, 1.6, .78, .7, mWalnut, 0, 0, 0, .03); boxAt(bench, 1.7, .06, .8, mOak, 0, .78, 0, .02);
    cylAt(bench, .09, .09, .05, M('#c8693f', .6), -.4, .84, .1, 16);
    const sc = box(.04, .01, .22, M('#cfd3d6', .3, .8), .003); sc.position.set(.2, .87, 0); sc.rotation.y = .6; bench.add(sc);
    const emp = box(.5, .4, .4, M('#c9a06a', .95), .02); emp.position.set(.4, 1.0, 4.6 - 4.5 + .0); emp.position.set(0, .86, -.1); bench.add(emp);
    const bm = sph(.07, MG('#ffe6a8', 3)); bm.position.set(3.5, 2.5, 3); bm.castShadow = false; storeRoot.add(bm);
    const cord = cyl(.006, .006, .6, M('#222'), 4); cord.position.set(3.5, 2.85, 3); storeRoot.add(cord);
    const pal = new THREE.Group(); pal.position.set(4.3, 0, 4.5); storeRoot.add(pal);
    for (let i = 0; i < 3; i++) boxAt(pal, 1.8, .06, .12, mPine, 0, .06, -.4 + i * .4, .005);
    for (let i = 0; i < 3; i++) boxAt(pal, 1.8, .06, .12, mPine, 0, 0, -.4 + i * .4, .005);
    storeShelves.forEach((g) => g.traverse((o) => { if (o.isMesh) o.userData.stockShelf = g.userData.shelfIdx; }));
    storeRoot.updateMatrixWorld(true);
  }
  const BOX_SLOTS = STORE_INFO.boxSlots;
  function cardboard(label) {
    const g = new THREE.Group(); const m = M('#c9a06a', .95), d = M('#a9814f', .95);
    boxAt(g, .9, .55, .66, m, 0, 0, 0, .02);
    boxAt(g, .94, .05, .7, d, 0, .55, 0, .01);
    boxAt(g, .1, .006, .7, M('#e3d2a8', .6), 0, .6, 0, 0);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(.32, .2), new THREE.MeshStandardMaterial({ map: nameSign(label, '#f3e7c9', '#4a2f24'), roughness: .9 })); lb.position.set(0, .3, .335); g.add(lb);
    return g;
  }
  // caja ya abierta, con algún libro asomando (decoración del almacén)
  function openCardboard(small = false) {
    const g = new THREE.Group(); const m = M('#c9a06a', .95), d = M('#a9814f', .95), dk = M('#5a3f26', .95);
    boxAt(g, .9, .55, .66, m, 0, 0, 0, .02);
    boxAt(g, .78, .01, .54, dk, 0, .545, 0, 0);
    [[0, -.36, -1], [0, .36, 1]].forEach(([x, z, s]) => { const f = box(.9, .02, .32, d, .005); f.position.set(x, .62, z + s * .1); f.rotation.x = s * .9; g.add(f); });
    [[-.47, -1], [.47, 1]].forEach(([x, s]) => { const f = box(.02, .32, .62, d, .005); f.position.set(x + s * .1, .62, 0); f.rotation.z = -s * .9; g.add(f); });
    [['alas', -.2], ['antes', .02], ['sal', .22]].forEach(([id, x], k) => { const b = displayBook(BOOK[id], .2, .32, .045); b.position.set(x, .54, .05); b.rotation.set(-.15 + k * .05, .3 - k * .25, 0); g.add(b); });
    if (small) g.scale.setScalar(.78);
    return g;
  }
  function storeDecor() {
    const place = (g, x, y, z, ry) => { g.position.set(x, y, z); g.rotation.y = ry; stockRoot.add(g); };
    place(cardboard('Libros'), .7, 0, 5.35, .08);
    place(cardboard('Frágil'), .72, .56, 5.33, -.12);
    place(openCardboard(), 1.6, 0, 5.4, -.1);
    place(openCardboard(true), .75, 0, 4.45, .35);
  }
  function syncStore() {
    if (!storeBuilt) buildStoreShell();
    if (stockRoot) { storeRoot.remove(stockRoot); disposeTree(stockRoot); }
    if (boxRoot) { storeRoot.remove(boxRoot); disposeTree(boxRoot); }
    stockRoot = new THREE.Group(); boxRoot = new THREE.Group(); storeRoot.add(stockRoot, boxRoot);
    const ids = Object.keys(S.storage).sort((a, b) => BOOKS.findIndex((x) => x.id === a) - BOOKS.findIndex((x) => x.id === b));
    ids.forEach((id, i) => {
      const u = Math.floor(i / 9), r = i % 9, board = Math.floor(r / 3), slot = r % 3;
      if (u > 2) return;
      const x = SHELF_X[u] + (slot - 1) * .52, y = .2 + board * .55, z = .3;
      const n = Math.min(S.storage[id], 6);
      for (let k = 0; k < n; k++) { const o = lyingBook(BOOK[id], .24, .34, .045); o.position.set(x, y + k * .046, z + .02); o.rotation.y = Math.PI + (k % 2 ? .08 : -.05); stockRoot.add(o); }
    });
    storeDecor();   // cajas de adorno apiladas, unas cerradas y otras abiertas
    S.boxes.slice(0, BOX_SLOTS.length).forEach((b, i) => {
      const [x, z] = BOX_SLOTS[i]; const g = cardboard(`${b.items.reduce((a, it) => a + it.qty, 0)} libros`);
      g.position.set(x, 0, z); g.rotation.y = (i % 2 ? .12 : -.1); g.userData.boxId = b.id;
      g.traverse((o) => { if (o.isMesh) o.userData.boxId = b.id; });
      boxRoot.add(g);
    });
    storeRoot.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  }

  /* ---------- Retrato en 3D de un personaje (busto) ---------- */
  const pScene = new THREE.Scene();
  pScene.add(new THREE.HemisphereLight('#fff1d6', '#9a7a62', 1.5));
  const pKey = new THREE.DirectionalLight('#ffe8c0', 2.2); pKey.position.set(1.5, 2.5, 3.5); pScene.add(pKey);
  const pRim = new THREE.DirectionalLight('#ffb878', 1.0); pRim.position.set(-2, 1.5, -2); pScene.add(pRim);
  function portrait(look, w = 560, h = 700, full = false) {
    const p = makePerson(look); p.rotation.y = -.18; pScene.add(p);
    const sc = look.scale ?? 1, u = p.userData, headY = u.headY * sc * (look.headScale ?? (look.kid ? 1.12 : 1) > 1 ? 1 : 1);
    const cam = new THREE.PerspectiveCamera(24, w / h, .1, 20);
    if (full) { cam.position.set(.05, headY - .05 * sc, 2.7 * sc); cam.lookAt(0, headY - .2 * sc, 0); } else { cam.position.set(.04, headY - .06 * sc, 1.7 * sc); cam.lookAt(0, headY - .13 * sc, 0); }
    const rt = new THREE.WebGLRenderTarget(w, h, { samples: 0 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    renderer.setRenderTarget(rt); renderer.setClearColor('#efdcc0', 0); renderer.clear(); renderer.render(pScene, cam);
    const buf = new Uint8Array(w * h * 4); renderer.readRenderTargetPixels(rt, 0, 0, w, h, buf);
    renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 0);
    pScene.remove(p); disposeTree(p); rt.dispose();
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) img.data.set(buf.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
    g.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  /* ---------- Hora del día y tiempo ---------- */
  const cDay = { hemi: new THREE.Color('#fff1d6'), hemiG: new THREE.Color('#7a5640'), sun: new THREE.Color('#ffe2b0') };
  const cDusk = { sun: new THREE.Color('#ffb070') };
  const cNight = { hemi: new THREE.Color('#8696cc'), hemiG: new THREE.Color('#2b2438'), sun: new THREE.Color('#8fa4d8') };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let nightForce = null, nightCur = 0;
  function applyTime() {
    const { t, weather } = timeState;
    const k = nightForce ?? smooth(.82, .97, t), dusk = smooth(.55, .82, t) * (1 - k);
    nightCur = k;
    const grey = weather === 'lluvia' ? .55 : weather === 'nublado' ? .8 : 1;
    hemi.color.copy(cDay.hemi).lerp(cNight.hemi, k); hemi.groundColor.copy(cDay.hemiG).lerp(cNight.hemiG, k);
    hemi.intensity = (1.15 - .3 * k) * (weather === 'lluvia' ? 1.0 : 1);
    sun.color.copy(cDay.sun).lerp(cDusk.sun, dusk).lerp(cNight.sun, k);
    sun.intensity = (2.2 * grey - 1.7 * k) ;
    const e = .35 + Math.sin(Math.min(1, t / .9) * Math.PI) * .5;
    const cx = rig.center.x, cz = rig.center.z;
    sun.position.set(cx + (.5 - t) * 18, 9 * e + 4, cz - 11);
    fill.intensity = .35 * (1 - k);
    lampPool.forEach((l) => { l.intensity = l.userData.base * (1 + 1.1 * k) * (weather === 'lluvia' ? 1.25 : 1); });
    bulb.intensity = 6 + 3 * k;
    const g = weather === 'lluvia' ? [.55, .62, .7] : weather === 'nublado' ? [.82, .86, .9] : [1, 1, 1];
    skyMat.color.setRGB(g[0] * (1 - .78 * k), g[1] * (1 - .72 * k), g[2] * (1 - .55 * k));
    renderer.toneMappingExposure = 1.05 - .1 * k;
  }

  /* ---------- Selección y edición ---------- */
  function markSelection(uid) {
    selUid = uid;
    if (selMark) { selMark.parent?.remove(selMark); selMark = null; }
    const f = uid && S?.furniture.find((x) => x.uid === uid);
    if (!f || f.x == null || view !== 'shop') return;
    const d = dims(f.type, f.rot ?? 0);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(d.w - .06, d.h - .06), new THREE.MeshBasicMaterial({ color: '#ffd24a', transparent: true, opacity: .4, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(f.x + d.w / 2, .03, f.y + d.h / 2); shopRoot.add(m); selMark = m;
  }
  let drag = null;       // { f, d, ghost, fromTray, moved }
  function ghostModel(f) {
    const root = buildFurniture({ ...f, rows: f.rows ?? [[], [], []], books: f.books ?? [] }, { lights: [] });
    root.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = .78; o.castShadow = false; } });
    return root;
  }
  function startFurnitureDrag(f, fromTray, e) {
    const d = dims(f.type, f.rot ?? 0);
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(d.w - .06, d.h - .06), new THREE.MeshBasicMaterial({ color: '#7cd68a', transparent: true, opacity: .55, depthWrite: false }));
    mark.rotation.x = -Math.PI / 2; mark.position.y = .04;
    const ghost = new THREE.Group(); ghost.add(ghostModel(f)); ghost.add(mark); ghost.visible = false; shopRoot.add(ghost);
    ghost.children[0].rotation.y = ROT_Y[f.rot ?? 0];
    drag = { kind: 'furn', f, d, ghost, mark, fromTray, moved: fromTray, sx: e.clientX, sy: e.clientY, tc: 0, tr: 0 };
    if (!fromTray) { const r = furnRoot.children.find((c) => c.userData.uid === f.uid); if (r) r.visible = false; drag.hidden = r; }
    moveFurnDrag(e);
  }
  function groundAt(x, y, yPlane = 0) {
    ray.setFromCamera(new THREE.Vector2(x / W * 2 - 1, -(y / H) * 2 + 1), camera);
    const p = new THREE.Vector3(); return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -yPlane), p) ? p : null;
  }
  function moveFurnDrag(e) {
    const dr = drag; if (!dr) return;
    if (Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) > 6) dr.moved = true;
    if (!dr.moved) return;
    const p = groundAt(e.clientX, e.clientY); if (!p) return;
    dr.tc = Math.round(p.x - dr.d.w / 2); dr.tr = Math.round(p.z - dr.d.h / 2);
    dr.ghost.visible = true; dr.ghost.position.set(dr.tc + dr.d.w / 2, 0, dr.tr + dr.d.h / 2);
    dr.ghost.children[0].position.set(0, 0, 0); dr.mark.position.set(0, .04, 0);
    const err = placementError(S.furniture, dr.f, dr.tc, dr.tr, dr.f.rot ?? 0);
    dr.err = err; dr.mark.material.color.set(err ? '#ef7a66' : '#7cd68a');
  }
  function endFurnDrag(e) {
    const dr = drag; drag = null; if (!dr) return;
    shopRoot.remove(dr.ghost); disposeTree(dr.ghost);
    if (dr.hidden) dr.hidden.visible = true;
    if (!dr.moved) { hooks.onSelect?.(dr.f.uid); return; }
    const over = document.elementFromPoint(e.clientX, e.clientY);
    if (over && over !== canvas && !canvas.contains(over) && over.closest?.('#dock')) { hooks.onDropOutside?.(dr.f.uid); return; }
    hooks.onDrop?.(dr.f.uid, dr.tc, dr.tr);
  }
  function startPosterDrag(uid, e) { drag = { kind: 'poster', uid, moved: false, sx: e.clientX, sy: e.clientY }; hooks.onPosterSelect?.(uid); }
  function movePosterDrag(e) {
    const dr = drag; if (Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) > 6) dr.moved = true;
    if (!dr.moved) return;
    const hit = pickWall(e.clientX, e.clientY); if (!hit) return;
    const mesh = findPoster(dr.uid); if (!mesh) return;
    const w = walls.find((x) => x.side === hit.side); const c = rig.center;
    const lx = lxOf(hit.side, hit.u, c), p = mesh.userData.p;
    const clamped = THREE.MathUtils.clamp(lx, -w.L / 2 + p.w / 2, w.L / 2 - p.w / 2);
    w.decor.add(mesh); mesh.position.set(clamped, THREE.MathUtils.clamp(hit.v, p.h / 2 + .2, WALL_H - p.h / 2 - .05), .03);
    dr.last = { side: hit.side, u: uOf(hit.side, clamped, c), v: mesh.position.y };
  }
  function endPosterDrag() { const dr = drag; drag = null; if (dr?.last) hooks.onPosterDrop?.(dr.uid, dr.last.side, dr.last.u, dr.last.v); }
  const findPoster = (uid) => { let r = null; walls.forEach((w) => w.decor.children.forEach((c) => { if (c.userData.posterUid === uid) r = c; })); return r; };

  /* ---------- Picking ---------- */
  const ray = new THREE.Raycaster();
  function ndc(x, y) { return new THREE.Vector2(x / W * 2 - 1, -(y / H) * 2 + 1); }
  function pick(x, y) {
    ray.setFromCamera(ndc(x, y), camera);
    const targets = [];
    if (view === 'shop') { furnRoot && targets.push(furnRoot); walls.forEach((w) => { w.decor.visible && targets.push(w.decor); targets.push(w.fixed); }); }
    else { boxRoot && targets.push(boxRoot); storeShelves.forEach((g) => targets.push(g)); walls.forEach((w) => targets.push(w.fixed)); }
    people.forEach((p) => { if (p !== hero && p.visible && p.parent) targets.push(p); });
    const hits = ray.intersectObjects(targets, true);
    const fh = hits.find((h) => h.object.userData.furnUid);
    if (fh && (hits[0] === fh || fh.distance < hits[0].distance + 1.2)) return { kind: 'furn', uid: fh.object.userData.furnUid };
    for (const h of hits) {
      if (h.object.userData.furnUid) return { kind: 'furn', uid: h.object.userData.furnUid };
      if (h.object.userData.posterUid) return { kind: 'poster', uid: h.object.userData.posterUid };
      if (h.object.userData.boxId) return { kind: 'box', id: h.object.userData.boxId };
      if (h.object.userData.personRef) return { kind: 'person', p: h.object.userData.personRef };
      if (h.object.userData.door) return { kind: 'door', to: h.object.userData.door };
      if (h.object.userData.stockShelf != null) return { kind: 'stockShelf', idx: h.object.userData.stockShelf };
    }
    const g = groundAt(x, y);
    if (g && view === 'shop') return { kind: 'floor', cell: [Math.floor(g.x), Math.floor(g.z)], at: g };
    if (g) return { kind: 'floor', cell: [Math.floor(g.x - STORE.off.x), Math.floor(g.z)], at: g };
    return null;
  }
  function pickWall(x, y) {
    ray.setFromCamera(ndc(x, y), camera);
    let best = null;
    for (const w of walls) {
      if (w.scale < .6) continue;
      const pos = w.pos, n = new THREE.Vector3(wallNormals[w.side][0], 0, wallNormals[w.side][1]);
      const plane = new THREE.Plane(n, -n.dot(pos)); const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(plane, p)) continue;
      if (p.y < 0 || p.y > WALL_H) continue;
      const u = w.side === 'N' || w.side === 'S' ? p.x : p.z, c = rig.center, lx = lxOf(w.side, u, c);
      if (Math.abs(lx) > w.L / 2) continue;
      const dist = p.distanceTo(camera.position);
      if (!best || dist < best.dist) best = { side: w.side, u, v: p.y, dist };
    }
    return best;
  }

  /* ---------- Entrada táctil ---------- */
  const pointers = new Map();
  let st = null, pinch = null;
  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture?.(e.pointerId); } catch { /* sin captura */ }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: rig.zoom }; st = null; return; }
    st = { x: e.clientX, y: e.clientY, moved: false, t: performance.now(), mode: 'pan', anchor: groundAt(e.clientX, e.clientY, 0) };
    if (editOn && view === 'shop') {
      const h = pick(e.clientX, e.clientY);
      if (h?.kind === 'furn') { const f = S.furniture.find((x) => x.uid === h.uid); if (f && !FURN[f.type].fixed || (f && FURN[f.type].fixed)) { st.mode = 'drag'; startFurnitureDrag(f, false, e); } }
      else if (h?.kind === 'poster') { st.mode = 'poster'; startPosterDrag(h.uid, e); }
    }
  });
  addEventListener('pointermove', (e) => {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (drag?.kind === 'furn') { moveFurnDrag(e); return; }
    if (drag?.kind === 'poster') { movePosterDrag(e); return; }
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      rig.zoom = THREE.MathUtils.clamp(pinch.z * d / pinch.d, .6, 2.6); fit(); return;
    }
    if (!st || st.mode !== 'pan') return;
    if (!st.moved && Math.hypot(e.clientX - st.x, e.clientY - st.y) > 7) st.moved = true;
    if (st.moved) {
      // arrastrar = mover la cámara: el punto bajo el dedo sigue bajo el dedo
      const now = groundAt(e.clientX, e.clientY, 0);
      if (st.anchor && now) { rig.target.x += st.anchor.x - now.x; rig.target.z += st.anchor.z - now.z; clampTarget(); placeCamera(); st.anchor = groundAt(e.clientX, e.clientY, 0); }
    }
  });
  const up = (e) => {
    pointers.delete(e.pointerId);
    if (drag?.kind === 'furn') { endFurnDrag(e); st = null; return; }
    if (drag?.kind === 'poster') { const was = drag; endPosterDrag(); if (!was.moved) { /* sólo seleccionar */ } st = null; return; }
    if (pointers.size < 2) pinch = null;
    if (st && st.mode === 'pan' && !st.moved && performance.now() - st.t < 600 && e.target === canvas) {
      const h = pick(e.clientX, e.clientY);
      if (h) hooks.onTap?.(h, e);
    }
    if (!pointers.size) st = null;
  };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); rig.zoom = THREE.MathUtils.clamp(rig.zoom * (e.deltaY < 0 ? 1.1 : .9), .6, 2.6); fit(); }, { passive: false });

  /* ---------- API pública ---------- */
  const api = {
    scene, camera, get hero() { return hero; }, get view() { return view; }, rig,
    sync(state, time) {
      S = state;
      if (time) { timeState = time; applyTime(); }
      const sk = JSON.stringify([B, S.deco, !!S.owned?.lights, S.shopName, S.doormat]);
      if (sk !== keys.shell) { keys.shell = sk; buildShell(); keys.furn = ''; }
      const fk = JSON.stringify([S.furniture, S.pass?.editions]);
      if (fk !== keys.furn) { keys.furn = fk; buildFurn(); keys.nook = ''; }
      const nk = JSON.stringify([S.nook, fk]);
      if (nk !== keys.nook) { keys.nook = nk; syncNook(); }
      const stk = JSON.stringify([S.storage, S.boxes.map((b) => b.id)]);
      if (stk !== keys.store) { keys.store = stk; syncStore(); }
      if (selUid) markSelection(selUid);
    },
    setTime(time) { timeState = time; applyTime(); },
    toggleNight() { nightForce = nightForce == null ? (nightCur > .5 ? 0 : 1) : (nightForce > .5 ? 0 : 1); applyTime(); return nightForce; },
    autoNight() { nightForce = null; applyTime(); },
    rotate(dir) { rig.azT += dir * Math.PI / 2; },
    zoom(k) { rig.zoom = THREE.MathUtils.clamp(rig.zoom * k, .6, 2.6); fit(); },
    recenter() { rig.target.set(rig.center.x, .9, rig.center.z); rig.zoom = 1; fit(); },
    setShift(px) { rig.shiftT = px; },
    setHeroLook(look) {
      const old = hero, nh = makePerson(heroSized(look));
      nh.userData.seed = 3; nh.userData.bubble = old.userData.bubble;
      nh.position.copy(old.position); nh.rotation.copy(old.rotation); nh.visible = old.visible;
      (old.parent ?? shopRoot).add(nh); old.parent?.remove(old); people.delete(old); people.add(nh); disposeTree(old);
      hero = nh;
    },
    // Vuelo de cámara sobre el barrio hasta la puerta de la librería
    playFlyover(ms = 12000) {
      return new Promise((res) => {
        const tx = TOWN_X + townInfo.doorX, tz = townInfo.doorZ;
        flight = { t0: performance.now(), dur: ms, res, last: 0,
          A: { x: TOWN_X - 26, z: 4, zoom: .42, az: Math.PI / 4 - .75 }, B: { x: tx + 1.2, z: tz - 0.6, zoom: 1.12, az: Math.PI / 4 } };
      });
    },
    // La furgoneta de reparto aparca delante de la librería (mode 'arrive') o se marcha (mode 'leave')
    async playVan(mode, look) {
      if (!townRoot) return;
      const van = vanObj ??= (() => { const v = makeVan(); townRoot.add(v); return v; })();
      const PARK = 3.9, LANE = -1.0, wheels = van.userData.wheels;
      rig.center.set(TOWN_X + 2.4, 0, -2.4); rig.target.set(TOWN_X + 3.0, 1.0, -2.2); rig.zoom = .95; rig.az = rig.azT = Math.PI / 4; rig.ext = 60; fit();
      timeState = { t: .08, weather: 'sol' }; applyTime();
      const run = (dur, fn) => new Promise((res) => { const t0 = performance.now(); const step = () => { const p = Math.min(1, (performance.now() - t0) / (dur / Math.max(1, window.__speed ?? 1))); fn(p); if (p < 1) requestAnimationFrame(step); else res(); }; step(); });
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms / Math.max(1, window.__speed ?? 1)));
      const drive = (x0, x1, dur, ease) => { let last = x0; return run(dur, (p) => { const x = x0 + (x1 - x0) * ease(p); van.position.set(x, 0, LANE); const d = (last - x); wheels.forEach((wh) => { wh.rotation.z -= d / .34; }); last = x; van.rotation.z = Math.sin(p * Math.PI) * -.012 * (x1 < x0 ? 1 : -1); }); };
      van.visible = true; van.rotation.set(0, Math.PI, 0);
      const mkDriver = () => { const p = makePerson(look); p.userData.seed = 6; townRoot.add(p); people.add(p); return p; };
      if (mode === 'arrive') {
        van.position.set(PARK + 24, 0, LANE);
        await sleep(500);
        await drive(PARK + 24, PARK, 3600, (p) => 1 - Math.pow(1 - p, 3));
        van.rotation.z = 0; await sleep(500);
        const p = mkDriver(); p.position.set(PARK - .1, 0, LANE - .95); p.rotation.y = -Math.PI / 2;
        await sleep(300);
        await walkTo(p, townInfo.doorX + .2, townInfo.doorZ + 1.1, 1.7);
        removePerson(p);
      } else {
        van.position.set(PARK, 0, LANE);
        const p = mkDriver(); p.position.set(townInfo.doorX + .2, 0, townInfo.doorZ + 1.1);
        await walkTo(p, PARK - .1, LANE - .95, 1.7);
        removePerson(p); await sleep(400);
        await drive(PARK, PARK - 32, 3200, (q) => q * q * q);
        van.visible = false;
      }
    },
    skipFlyover() { if (flight) { const r = flight.res; flight = null; r(); } },
    startPedestrians(looks) {
      if (!townInfo) return;
      townInfo.walks.forEach((wk, i) => {
        const p = makePerson(looks[i % looks.length]); p.userData.seed = i * 1.7; p.position.set(wk[0], 0, wk[1]); townRoot.add(p); people.add(p); townPeds.push(p);
        const go = async () => { await new Promise((r) => setTimeout(r, i * 900)); while (townPeds.includes(p)) { await walkTo(p, wk[2], wk[3], 1.0 + (i % 3) * .25); if (!townPeds.includes(p)) break; await walkTo(p, wk[0], wk[1], 1.0 + (i % 3) * .25); } };
        go();
      });
    },
    // artículos del escaparate vistos desde la calle (keys: ['b:alas', 'g:vela', null, …], 12 huecos: 3 baldas × 4)
    setTownDisplay(slots = []) {
      if (!townInfo?.shop) return;
      const d = townInfo.shop.userData.display;
      while (d.children.length) { const c = d.children.pop(); disposeTree(c); }
      const front = 6 / 2 + .02, cx = -2.3, ys = [1.075, 1.525, 1.975];
      slots.forEach((key, i) => {
        if (!key) return;
        const m = itemMesh(key), tier = Math.floor(i / 4), col = i % 4;
        m.scale.multiplyScalar(key.startsWith('b:') ? 1.5 : 2.4);
        m.position.set(cx - .72 + col * .48, ys[tier], front + .26);
        d.add(m);
      });
    },
    // cámara frente al escaparate (vista desde la calle)
    focusFacade() {
      if (!townInfo) return;
      const sx = TOWN_X + 2.2 - 1.4, sz = -4 - 3 - 1.2 + 3;
      if (townInfo.shop.userData.awning) townInfo.shop.userData.awning.visible = false;   // el toldo taparía la balda de arriba
      rig.center.set(sx, 0, sz); rig.target.set(sx, 1.55, sz); rig.az = rig.azT = .5; rig.zoom = 2.3; rig.shift = rig.shiftT = 0;
      fit();
    },
    setTownName(n) { if (n && n !== townName) { townName = n; if (townRoot) { scene.remove(townRoot); townRoot = null; townInfo = null; } } },
    stopPedestrians() { while (townPeds.length) removePerson(townPeds.pop()); },
    setDoorsOpen(open) { doorTarget = open ? 1.45 : 0; },
    setView(v) {
      view = v;
      if (townRoot) townRoot.visible = v === 'town';
      if (v === 'town') {
        if (!townRoot) { const town = buildTown(townName); townInfo = town; townRoot = town.group; townRoot.position.set(TOWN_X, 0, 0); scene.add(townRoot); }
        townRoot.visible = true; shopRoot.visible = false; storeRoot.visible = false;
        if (townInfo?.shop?.userData?.awning) townInfo.shop.userData.awning.visible = true;
        walls.length = 0;
        rig.center.set(TOWN_X, 0, 0); rig.target.set(TOWN_X, .9, 0); rig.base = 1; rig.zoom = .45; rig.ext = 60;
        sun.target.position.set(TOWN_X, 0, 0); sun.position.set(TOWN_X + 14, 26, -22);
        Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 32, bottom: -32, near: 1, far: 90 }); sun.shadow.camera.updateProjectionMatrix();
        fit(); applyTime();
        return;
      }
      heroSetView(v);
      shopRoot.visible = v === 'shop'; storeRoot.visible = v === 'store';
      walls.length = 0;
      if (v === 'shop') {
        shopWalls.forEach((w) => walls.push(w));
        const f = rig.shopFrame; if (f) frameRoom(f.x, f.z, f.w, f.d);
        if (S) api.sync(S);
      } else {
        if (!storeBuilt) syncStore();
        storeWalls.forEach((w) => walls.push(w));
        frameRoom(STORE.off.x + STORE.w / 2, STORE.d / 2, STORE.w, STORE.d);
        hero.position.set(STORE.w - 1.2, 0, 3); hero.rotation.y = -Math.PI / 2;
      }
      applyTime();
    },
    setEdit(on) { editOn = on; if (gridLines) gridLines.visible = on; if (!on) api.select(null); },
    select(uid) { markSelection(uid); },
    selectPoster(uid) { selPoster = uid; },
    startTrayDrag(f, e) { startFurnitureDrag(f, true, e); },
    cellPos(c, r) { return [c + .5, r + .5]; },
    isWalking: (p) => tasks.some((t) => t.p === p),
    spawn, removePerson, say, walk, walkTo, walkRoute, face, portrait,
    carry(p, id) {
      const hold = p.userData.hold; [...hold.children].forEach((c) => { hold.remove(c); disposeTree(c); });
      p.userData.carrying = !!id;
      if (id) { const b = displayBook(BOOK[id], .3, .42, .055); b.rotation.x = -1.0; b.position.set(0, .02, .06); hold.add(b); }
    },
    heroPlace(cell, rot = 0) { hero.position.set(cell[0] + .5, 0, cell[1] + .5); hero.rotation.y = rot; hero.userData.faceT = null; },
    snapshot(w = 480, h = 320, day = true) { return new Promise((res) => { shotReq = { w, h, day, res }; setTimeout(() => { if (shotReq && shotReq.res === res) { shotReq = null; res(null); } }, 2500); }); },
    fit,
    pick,
    debug: () => ({ st: st && { moved: st.moved, mode: st.mode, anchor: !!st.anchor }, pinch: !!pinch, pointers: pointers.size, drag: drag?.kind }),
  };

  /* ---------- Bucle ---------- */
  let shotReq = null;
  function takeShot(q) {
    const { w, h, day } = q, prevT = timeState, prevN = nightForce;
    if (day) { nightForce = 0; timeState = { ...timeState, t: .4 }; applyTime(); }
    renderer.render(scene, camera);
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = '#34261f'; g.fillRect(0, 0, w, h);
    const sw = canvas.width, sh = canvas.height, ar = w / h; let cw = sw, ch = sw / ar; if (ch > sh) { ch = sh; cw = sh * ar; }
    cw *= .78; ch *= .78;   // un poco más cerca, para que la tienda llene la foto
    g.drawImage(canvas, (sw - cw) / 2, (sh - ch) / 2, cw, ch, 0, 0, w, h);
    if (day) { nightForce = prevN; timeState = prevT; applyTime(); }
    return c.toDataURL('image/jpeg', .78);
  }
  const clock = new THREE.Clock();
  function frame() {
    const dt = Math.min(clock.getDelta(), .05 * (window.__dtCap ?? 1)), t = clock.elapsedTime;
    if (flight) {
      const f = Math.min(1, (performance.now() - flight.t0) / flight.dur), e = f < .5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2, A = flight.A, B = flight.B;
      rig.target.x = A.x + (B.x - A.x) * e; rig.target.z = A.z + (B.z - A.z) * e; rig.target.y = .9 + .9 * e;
      rig.zoom = A.zoom + (B.zoom - A.zoom) * Math.pow(e, 1.4); rig.az = rig.azT = A.az + (B.az - A.az) * e;
      fit();
      if (performance.now() - flight.last > 150) { flight.last = performance.now(); timeState = { t: .01 + .08 * f, weather: 'sol' }; applyTime(); }
      if (f >= 1) { const r = flight.res; flight = null; r(); }
    }
    rig.az += (rig.azT - rig.az) * Math.min(1, dt * 7);
    rig.shift += (rig.shiftT - rig.shift) * Math.min(1, dt * 8);
    const dx = Math.sin(rig.az), dz = Math.cos(rig.az);
    walls.forEach((w) => {
      const n = wallNormals[w.side], dot = dx * n[0] + dz * n[1], goal = dot > 0 ? 1 : .06;
      w.scale += (goal - w.scale) * Math.min(1, dt * 9);
      w.slabs.scale.y = w.scale; w.decor.visible = w.scale > .7;
    });
    if (Math.abs(doorTarget - doorAng) > .001) { doorAng += (doorTarget - doorAng) * Math.min(1, dt * 3); if (doorLeaves.L) { doorLeaves.L.rotation.y = doorAng; doorLeaves.R.rotation.y = -doorAng; } }
    anims.forEach((a) => a(t));
    stepPeople(dt, t);
    placeCamera();
    updateBubbles();
    if (shotReq) { const q = shotReq; shotReq = null; let url = null; try { url = takeShot(q); } catch { /* sin foto */ } q.res(url); }
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  fit();
  requestAnimationFrame(frame);
  api.isNight = () => nightCur;
  return api;
}
