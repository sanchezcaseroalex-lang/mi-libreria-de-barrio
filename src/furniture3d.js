// Constructores 3D de cada mueble. Origen = centro de su huella, suelo en y=0, mirando a +z con giro 0.
import {
  THREE, M, MT, MG, mWalnut, mOak, mDark, mPage, mTerra, mSoil, mBrass, canvasTex, mulberry32, hashStr,
  box, boxAt, cyl, cylAt, sph, shade, spineBook, displayBook, lyingBook,
} from './kit3d.js';
import { BOOK, GENRES, GENRE_ORDER } from './books.js';
const mWalnutBase = mWalnut;

const mCream = M('#f3e7c9', .9);

const rugTexA = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#a2453a'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8cf9a'; g.fillRect(14, 14, w - 28, h - 28); g.fillStyle = '#35605c'; g.fillRect(26, 26, w - 52, h - 52);
  g.strokeStyle = '#e8cf9a'; g.lineWidth = 3;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { g.save(); g.translate(w / 2 + (i - 2) * 38, h / 2 + (j - 2) * 38); g.rotate(Math.PI / 4); g.strokeRect(-11, -11, 22, 22); g.restore(); }
});
const rugMake = (bg, mid, ring, pat) => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = mid; g.fillRect(14, 14, w - 28, h - 28); g.fillStyle = ring; g.fillRect(26, 26, w - 52, h - 52);
  g.strokeStyle = pat; g.lineWidth = 3;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { g.beginPath(); g.arc(w / 2 + (i - 2) * 38, h / 2 + (j - 2) * 38, 11, 0, 7); g.stroke(); g.beginPath(); g.arc(w / 2 + (i - 2) * 38, h / 2 + (j - 2) * 38, 3, 0, 7); g.stroke(); }
});
const RUG_SKIN = { azul: rugMake('#d4af37', '#f3e7c9', '#1d2f5a', '#d4af37'), burdeos: rugMake('#2b1a14', '#e8cf9a', '#7a1f33', '#e8cf9a') };
const rugTexB = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#d9a441'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3e7c9'; g.fillRect(12, 12, w - 24, h - 24); g.fillStyle = '#c06a52'; g.fillRect(24, 24, w - 48, h - 48);
  g.fillStyle = '#f3e7c9'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w / 2, h / 2, 90 - i * 14, 0, 7); g.lineWidth = 4; g.strokeStyle = i % 2 ? '#f3e7c9' : '#7c3f33'; g.stroke(); }
});

const ang = (th) => Math.PI / 2 - th;

/* ---------- Estantería: solo los libros que tienes ---------- */

function shelf(f, ctx) {
  const root = new THREE.Group(); const g = new THREE.Group(); g.position.z = -.25; root.add(g);
  const W = 1.92, D = .5, H = 2.0, rnd = mulberry32(hashStr(f.uid));
  const mWalnut = f.skin === 'blanca' ? M('#efe8da', .6) : f.skin === 'verde' ? M('#2f5a4a', .6) : mWalnutBase;
  boxAt(g, .08, H, D, mWalnut, -W / 2 + .04, 0, 0, .02); boxAt(g, .08, H, D, mWalnut, W / 2 - .04, 0, 0, .02);
  boxAt(g, W - .1, H - .1, .03, M('#5a3827', .9), 0, .06, -D / 2 + .015, 0);
  boxAt(g, W + .08, .08, D + .05, mWalnut, 0, H - .02, .01, .02);
  boxAt(g, W + .02, .035, D + .08, mDark, 0, H + .05, .02, .01);
  boxAt(g, W - .08, .14, D - .02, mDark, 0, 0, 0, .01);
  const rows = f.rows ?? [[], [], []];
  rows.forEach((arr, ri) => {
    const yb = .14 + ri * .6;
    boxAt(g, W - .08, .04, D - .04, mWalnut, 0, yb, 0, .005);
    const col = GENRES[GENRE_ORDER[ri]]?.color ?? '#c8693f';
    boxAt(g, .5, .03, .012, M(col, .7), -W / 2 + .45, yb + .005, D / 2 - .016, .004);   // etiqueta del género
    let x = -W / 2 + .1; const yTop = yb + .04;
    arr.forEach((id, i) => {
      const b = BOOK[id]; if (!b) return;
      const t = .075 + (b.w - 10) * .014, h = .38 + ((hashStr(id) % 100) / 100) * .12, d = .3;
      const m = spineBook(b, t, h, d); m.position.set(x + t / 2, yTop + h / 2, D / 2 - d / 2 - .03); g.add(m); x += t + .006;
    });
    if (arr.length) boxAt(g, .02, .2, .15, mWalnut, x + .02, yTop, D / 2 - .1, .005); // sujetalibros
    if (arr.length <= 5) {
      const k = hashStr(f.uid + ri) % 3, px = W / 2 - .28;
      if (k === 0) { cylAt(g, .07, .05, .1, mTerra, px, yTop, .0, 14); const l = sph(.12, M('#5c9457'), 1, 1.1, 1); l.position.set(px, yTop + .22, 0); g.add(l); }
      else if (k === 1) { cylAt(g, .05, .05, .09, M('#e8d9bd', .6), px, yTop, 0, 14); const fl = sph(.022, MG('#ffcf70', 2.5), 1, 1.7, 1); fl.position.set(px, yTop + .13, 0); fl.castShadow = false; g.add(fl); }
      else { for (let s = 0; s < 2; s++) boxAt(g, .3 - s * .04, .045, .22, M(['#9a5a3a', '#4f6a7a'][s], .8), px, yTop + s * .045, 0, .008).rotation.y = s * .25; }
    }
  });
  if (rnd() < .5) { cylAt(g, .09, .07, .14, mTerra, -.5, H + .07, 0, 14); const l = sph(.15, M('#5c9457'), 1, 1.1, 1); l.position.set(-.5, H + .3, 0); g.add(l); }
  else { cylAt(g, .05, .05, .1, M('#e8d9bd', .6), .5, H + .08, 0, 14); }
  return root;
}

/* ---------- Mesa redonda de novedades ---------- */

function roundTable(f, ctx) {
  const g = new THREE.Group(); const topY = .82, R0 = .98;
  cylAt(g, .42, .46, .06, mDark, 0, 0, 0, 32); cylAt(g, .1, .2, topY - .1, mWalnut, 0, .06, 0, 24);
  const topM = f.skin === 'marmol' ? M('#ece8e2', .25, .1) : f.skin === 'negra' ? M('#222226', .35, .15) : mOak, rimM = f.skin === 'negra' || f.skin === 'marmol' ? mBrass : mDark;
  cylAt(g, R0, R0, .07, topM, 0, topY - .07, 0, 56); cylAt(g, R0 + .015, R0 + .015, .03, rimM, 0, topY - .06, 0, 56);
  cylAt(g, .86, .86, .008, M('#f3e7c9', 1), 0, topY, 0, 48);
  const y0 = topY + .004, ids = f.books ?? [];
  const nStand = Math.min(ids.length, 4), stand = ids.slice(0, nStand), lying = ids.slice(nStand);
  // al centro, los de pie sobre un soporte redondo y con la cubierta hacia fuera
  if (stand.length) {
    cylAt(g, .4, .43, .07, mOak, 0, y0, 0, 32);
    const rr = stand.length === 1 ? 0 : .27;
    stand.forEach((id, i) => {
      const th = i / stand.length * Math.PI * 2 + Math.PI / 2;
      const w = new THREE.Group(); w.position.set(Math.cos(th) * rr, y0 + .07, Math.sin(th) * rr); w.rotation.y = ang(th);
      const bk = displayBook(BOOK[id], .25, .38, .05); bk.rotation.x = -.14; w.add(bk); g.add(w);
    });
    cylAt(g, .006, .006, .55, mBrass, 0, y0 + .07, 0, 6);
    const flag = canvasTex(160, 60, (c, w2, h2) => { c.fillStyle = '#c8566b'; c.fillRect(0, 0, w2, h2); c.fillStyle = '#fff3d8'; c.font = '700 26px Fraunces, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Novedades', w2 / 2, h2 / 2 + 1); });
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(.26, .1), new THREE.MeshStandardMaterial({ map: flag, side: THREE.DoubleSide })); fm.position.set(.13, y0 + .58, 0); g.add(fm);
  }
  // alrededor, los tumbados: cubierta hacia arriba, título legible desde fuera
  lying.forEach((id, i) => {
    const th = i / lying.length * Math.PI * 2 + Math.PI / 2;
    const o = lyingBook(BOOK[id], .27, .4, .05); o.position.set(Math.cos(th) * .62, y0, Math.sin(th) * .62); o.rotation.y = ang(th);
    g.add(o);
  });
  if (!ids.length) { const c = cyl(.1, .1, .02, M('#e8d9bd', .6), 20); c.position.set(0, y0 + .01, 0); g.add(c); }
  return shade(g);
}

/* ---------- Mostrador ---------- */

function counter(f, ctx) {
  const g = new THREE.Group(); const W = 2.9, D = .85, H = .84;
  boxAt(g, W, H - .06, D - .06, mWalnut, 0, 0, 0, .03);
  for (let i = 0; i < 5; i++) { const x = -W / 2 + W / 10 + i * W / 5; boxAt(g, W / 5 - .14, H - .34, .03, M('#5a3827', .8), x, .16, D / 2 - .02, .01); boxAt(g, W / 5 - .22, H - .46, .015, mWalnut, x, .22, D / 2, .005); }
  boxAt(g, W + .1, .07, D + .12, mOak, 0, H - .07, .02, .02);
  boxAt(g, W, .1, .06, mDark, 0, 0, D / 2 - .04, .01);
  const y = H;
  boxAt(g, .42, .16, .34, M('#3d4a47', .5, .3), -.9, y, -.1, .03);
  const scr = box(.3, .2, .03, M('#26302f', .4, .3), .01); scr.position.set(-.9, y + .26, -.14); scr.rotation.x = -.3; g.add(scr);
  const sc2 = new THREE.Mesh(new THREE.PlaneGeometry(.24, .13), MG('#8ee0b0', .9)); sc2.position.set(-.9, y + .27, -.12); sc2.rotation.x = -.3; g.add(sc2);
  const bell = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#d9b24a', .3, .8)); bell.position.set(-.2, y + .02, .24); g.add(bell);
  for (let k = 0; k < 3; k++) { const o = lyingBook(BOOK[['alas', 'sellos', 'cuervos'][k]], .26, .38, .05); o.position.set(.35, y + k * .05, 0); o.rotation.y = .3 + k * .45; g.add(o); }
  boxAt(g, .26, .34, .16, M('#cda978', .95), 1.15, y, -.1, .01); boxAt(g, .22, .28, .12, M('#c19b68', .95), 1.15, y, .12, .01);
  cylAt(g, .05, .045, .1, M('#e7d6b4', .6), -1.2, y, .22, 16);
  for (let i = 0; i < 3; i++) { const p = cyl(.006, .006, .16, M(['#c1443a', '#3f6b66', '#e3b04b'][i], .6), 6); p.position.set(-1.2 + (i - 1) * .02, y + .15, .22); p.rotation.z = (i - 1) * .2; g.add(p); }
  cylAt(g, .08, .09, .03, mDark, .75, y, .3, 16); cylAt(g, .012, .012, .3, mBrass, .75, y, .3, 8);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(.1, .16, .16, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#ffd9a0', emissive: '#ffb860', emissiveIntensity: 1.2, side: THREE.DoubleSide, roughness: .9 })); sh.position.set(.75, y + .38, .3); g.add(sh);
  const lp = new THREE.Object3D(); lp.position.set(.75, y + .35, .3); g.add(lp); ctx.lights.push({ obj: lp, color: '#ffbd70', k: .55 });
  return shade(g);
}

/* ---------- Asientos ---------- */

function armchair(f) {
  const g = new THREE.Group(); const sk = { azul: ['#3f6a9a', '#5a88b8'], burdeos: ['#8a2f45', '#a8475e'] }[f.skin] ?? ['#c98f2f', '#dba743']; const c = M(sk[0], .95), c2 = M(sk[1], .95);
  boxAt(g, .86, .3, .8, c, 0, .16, 0, .09); boxAt(g, .72, .15, .62, c2, 0, .44, .06, .07);
  boxAt(g, .88, .74, .22, c, 0, .22, -.3, .1); boxAt(g, .2, .48, .76, c, -.37, .2, 0, .09); boxAt(g, .2, .48, .76, c, .37, .2, 0, .09);
  [[-.34, -.32], [.34, -.32], [-.34, .32], [.34, .32]].forEach(([x, z]) => cylAt(g, .04, .03, .16, mDark, x, 0, z, 10));
  const pil = box(.3, .28, .1, M('#a2453a', .95), .06); pil.position.set(-.2, .74, -.14); pil.rotation.set(-.3, .3, .2); g.add(pil);
  const bl = box(.6, .05, .45, M('#e8d6b0', .95), .02); bl.position.set(.15, .92, -.02); bl.rotation.z = .05; g.add(bl);
  for (let i = 0; i < 4; i++) boxAt(g, .6, .05, .03, M('#a2453a', .95), .15, .905, -.17 + i * .1, .005).rotation.z = .05;
  return shade(g);
}
function sofa() {
  const g = new THREE.Group(); const c = M('#4f8a80', .95), c2 = M('#6aa59a', .95);
  boxAt(g, 1.9, .3, .85, c, 0, .16, 0, .09);
  boxAt(g, .9, .15, .66, c2, -.46, .44, .07, .07); boxAt(g, .9, .15, .66, c2, .46, .44, .07, .07);
  boxAt(g, 1.92, .72, .22, c, 0, .22, -.32, .1); boxAt(g, .2, .5, .82, c, -.86, .2, 0, .09); boxAt(g, .2, .5, .82, c, .86, .2, 0, .09);
  [[-.85, -.34], [.85, -.34], [-.85, .34], [.85, .34]].forEach(([x, z]) => cylAt(g, .04, .03, .16, mDark, x, 0, z, 10));
  const p1 = box(.3, .28, .1, M('#e0a93b', .95), .06); p1.position.set(-.6, .74, -.12); p1.rotation.set(-.3, .2, .15); g.add(p1);
  const p2 = box(.3, .28, .1, M('#c8566b', .95), .06); p2.position.set(.5, .74, -.12); p2.rotation.set(-.3, -.25, -.1); g.add(p2);
  const bl = box(.7, .05, .5, M('#f1dfb9', .95), .02); bl.position.set(.5, .6, .12); bl.rotation.set(.05, .3, .05); g.add(bl);
  return shade(g);
}

/* ---------- Pequeños ---------- */

function sideTable() {
  const g = new THREE.Group();
  cylAt(g, .3, .3, .05, mOak, 0, .55, 0, 28); cylAt(g, .04, .06, .55, mWalnut, 0, 0, 0, 12); cylAt(g, .2, .22, .04, mDark, 0, 0, 0, 20);
  cylAt(g, .06, .05, .11, M('#e7d6b4', .6), .12, .6, .06, 16);
  const steam = sph(.03, new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: .35 }), 1, 1.6, 1); steam.castShadow = false; g.add(steam);
  g.userData.anim = (t) => { steam.position.set(.12, .78 + ((t * .08) % .1), .06); steam.material.opacity = .35 - ((t * .8) % 1) * .3; };
  for (let k = 0; k < 3; k++) { const o = lyingBook(BOOK[['hiedra', 'niebla', 'zafiro'][k]], .2, .28, .045); o.position.set(-.1, .6 + k * .045, -.05); o.rotation.y = k * .7; g.add(o); }
  return shade(g);
}
function floorLamp(f, ctx) {
  const g = new THREE.Group();
  cylAt(g, .16, .18, .04, mDark, 0, 0, 0, 20); cylAt(g, .014, .014, 1.55, mBrass, 0, .04, 0, 8);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(.16, .26, .3, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#ffe0b0', emissive: '#ffb860', emissiveIntensity: 1.5, side: THREE.DoubleSide, roughness: .9 })); sh.position.y = 1.7; g.add(sh);
  const lp = new THREE.Object3D(); lp.position.y = 1.65; g.add(lp); ctx.lights.push({ obj: lp, color: '#ffb865', k: 1 });
  return g;
}
// Lengua de suegra: alta y fina, cabe en una sola casilla sin rozar las paredes ni los muebles de al lado
function plant(f) {
  const g = new THREE.Group(); const tall = hashStr(f.uid) % 2 === 0, s = tall ? 1.15 : .9;
  const pot = { blanca: M('#f4efe4', .5), dorada: M('#d4af37', .3, .7), rosa: M('#e8a0b0', .6) }[f.skin] ?? mTerra, potRim = { blanca: M('#ddd5c4', .5), dorada: M('#b8922a', .3, .7), rosa: M('#c97d90', .6) }[f.skin] ?? M('#b05f3b', .8);
  const leafC = f.skin === 'rosa' ? ['#3f7a4a', '#c9566b', '#5f9a5c'] : f.skin === 'blanca' ? ['#4f8a52', '#d9e8c4', '#6aa55d'] : ['#3f7a4a', '#4f8a52', '#5f9a5c'];
  cylAt(g, .15, .115, .28, pot, 0, 0, 0, 20); cylAt(g, .165, .165, .04, potRim, 0, .26, 0, 20); cylAt(g, .14, .14, .02, mSoil, 0, .29, 0, 18);
  const rnd = mulberry32(hashStr(f.uid) + 3), n = tall ? 11 : 8, top = .29;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + rnd() * .6, h = (.55 + rnd() * .6) * s * (i === 0 ? 1.25 : 1), lean = .04 + rnd() * .1;
    const bl = sph(1, M(leafC[i % 3], .7)); bl.scale.set(.05, h / 2, .016);
    const rim = sph(1, M('#d6c25a', .7)); rim.scale.set(.054, h / 2 * .985, .008); rim.position.z = -.004;
    const pv = new THREE.Group(); pv.rotation.y = a; pv.position.set(0, top, 0);
    const tilt = new THREE.Group(); tilt.position.set(.06 * rnd(), 0, 0); tilt.rotation.z = -lean;
    bl.position.y = h / 2; rim.position.y = h / 2; rim.rotation.y = 0; tilt.add(bl); if (i % 2 === 0) tilt.add(rim); pv.add(tilt); g.add(pv);
  }
  return shade(g);
}
function catBed(f, ctx) {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.33, .09, 12, 28), M('#b56a57', .95)); rim.rotation.x = Math.PI / 2; rim.position.y = .09; rim.castShadow = true; g.add(rim);
  cylAt(g, .33, .33, .06, M('#e8d6b0', .95), 0, .02, 0, 28);
  const fur = M('#d98a45', .95), fur2 = M('#f1d9b0', .95);
  const body = sph(.2, fur, 1.15, .62, .85); body.position.set(0, .2, 0); g.add(body);
  const head = sph(.12, fur, 1, .95, .95); head.position.set(.2, .22, .05); g.add(head);
  const e1 = new THREE.Mesh(new THREE.ConeGeometry(.035, .07, 4), fur), e2 = e1.clone(); e1.position.set(.2, .33, -.01); e2.position.set(.2, .33, .11); g.add(e1, e2);
  const mz = sph(.045, fur2, 1, .8, 1); mz.position.set(.3, .2, .05); g.add(mz);
  const tail = new THREE.Mesh(new THREE.TorusGeometry(.17, .035, 8, 20, Math.PI * 1.2), fur); tail.rotation.set(Math.PI / 2, 0, 2.2); tail.position.set(-.08, .12, .09); g.add(tail);
  g.userData.anim = (t) => { body.scale.y = .62 + Math.sin(t * 1.6) * .025; };
  return shade(g);
}
function rug(f) {
  const g = new THREE.Group();
  const tex = RUG_SKIN[f.skin] ?? (hashStr(f.uid) % 2 ? rugTexB : rugTexA);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.86), MT(tex, 1)); m.rotation.x = -Math.PI / 2; m.position.y = .014; m.receiveShadow = true; g.add(m);
  const e = box(1.9, .012, 1.9, M('#5a3a2a', 1), .004); e.position.y = .006; g.add(e);
  return g;
}
function coffeeCorner(f, ctx) {
  const g = new THREE.Group();
  boxAt(g, .86, .86, .6, mWalnut, 0, 0, 0, .03); boxAt(g, .92, .06, .66, mOak, 0, .86, 0, .02);
  boxAt(g, .42, .34, .34, M('#b9b0a0', .35, .6), -.18, .92, -.06, .04); boxAt(g, .36, .05, .28, M('#2b2b2b', .5), -.18, 1.24, -.06, .02);
  cylAt(g, .025, .025, .12, M('#2b2b2b', .5), -.28, .95, .12, 8);
  [[.22, .1], [.3, -.05]].forEach(([x, z]) => cylAt(g, .05, .04, .08, M('#f3e7c9', .6), x, .92, z, 14));
  const steam = sph(.03, new THREE.MeshBasicMaterial({ color: '#fff', transparent: true, opacity: .35 }), 1, 1.6, 1); steam.castShadow = false; g.add(steam);
  g.userData.anim = (t) => { steam.position.set(.22, 1.12 + ((t * .08) % .1), .1); steam.material.opacity = .35 - ((t * .8) % 1) * .3; };
  const lp = new THREE.Object3D(); lp.position.set(0, 1.3, .1); g.add(lp); ctx.lights.push({ obj: lp, color: '#ffc890', k: .35 });
  return shade(g);
}

// Cada constructor devuelve un grupo con origen en el centro de la huella.
export const BUILD = {
  shelf, table: roundTable, counter, armchair, sofa, side: sideTable, lamp: floorLamp, plant, cat: catBed, rug, coffee: coffeeCorner,
};

export function buildFurniture(f, ctx) {
  const g = BUILD[f.type]?.(f, ctx) ?? new THREE.Group();
  const root = new THREE.Group(); root.add(g);
  root.userData.anim = g.userData.anim;
  return root;
}
