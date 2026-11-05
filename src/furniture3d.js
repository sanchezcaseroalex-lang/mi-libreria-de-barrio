// Constructores 3D de cada mueble. Origen = centro de su huella, suelo en y=0, mirando a +z con giro 0.
import {
  THREE, M, MT, MG, mWalnut, mOak, mDark, mPage, mTerra, mSoil, mBrass, canvasTex, mulberry32, hashStr,
  box, boxAt, cyl, cylAt, sph, shade, spineBook, displayBook, lyingBook,
} from './kit3d.js';
import { BOOK, SECTIONS } from './books.js';
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
    const col = SECTIONS[ri]?.color ?? '#c8693f';
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
  const nStand = Math.min(ids.length, 5), stand = ids.slice(0, nStand), lying = ids.slice(nStand);
  // al centro, hasta 5 de pie sobre un soporte redondo y con la cubierta hacia fuera
  if (stand.length) {
    cylAt(g, .4, .43, .07, mOak, 0, y0, 0, 32);
    const rr = stand.length === 1 ? 0 : stand.length <= 3 ? .24 : .3;
    stand.forEach((id, i) => {
      const th = i / stand.length * Math.PI * 2 + Math.PI / 2;
      const w = new THREE.Group(); w.position.set(Math.cos(th) * rr, y0 + .07, Math.sin(th) * rr); w.rotation.y = ang(th);
      const bk = displayBook(BOOK[id], .25, .38, .05); bk.rotation.x = -.14; w.add(bk); g.add(w);
    });
    cylAt(g, .006, .006, .55, mBrass, 0, y0 + .07, 0, 6);
    const flag = canvasTex(160, 60, (c, w2, h2) => { c.fillStyle = '#c8566b'; c.fillRect(0, 0, w2, h2); c.fillStyle = '#fff3d8'; c.font = '700 26px Fraunces, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Novedades', w2 / 2, h2 / 2); });
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(.26, .1), new THREE.MeshStandardMaterial({ map: flag, side: THREE.DoubleSide })); fm.position.set(.13, y0 + .58, 0); g.add(fm);
  }
  // alrededor, los tumbados (cubierta hacia arriba, título legible desde fuera); los del mismo título se apilan
  const stacks = [], at = new Map();
  lying.forEach((id) => { if (at.has(id)) stacks[at.get(id)].n++; else { at.set(id, stacks.length); stacks.push({ id, n: 1 }); } });
  const rad = stacks.length > 12 ? .7 : .66;
  stacks.forEach((s2, i) => {
    const th = i / stacks.length * Math.PI * 2 + Math.PI / 2;
    for (let k = 0; k < s2.n; k++) {
      const o = lyingBook(BOOK[s2.id], .27, .4, .05);
      o.position.set(Math.cos(th) * rad, y0 + k * .05, Math.sin(th) * rad);
      o.rotation.y = ang(th) + (k ? (((hashStr(s2.id) + k * 5) % 7) - 3) * .025 : 0);   // las pilas quedan un poco desordenadas
      g.add(o);
    }
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
  // cama
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.34, .1, 12, 32), M('#b56a57', .95)); rim.rotation.x = Math.PI / 2; rim.position.y = .09; rim.castShadow = true; g.add(rim);
  cylAt(g, .34, .34, .06, M('#e8d6b0', .95), 0, .02, 0, 28);
  cylAt(g, .27, .27, .05, M('#d9b98a', 1), 0, .06, 0, 24);
  // pelaje atigrado naranja con rayas pintadas
  const furTex = canvasTex(256, 128, (c, w, h) => {
    c.fillStyle = '#d98a45'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { c.fillStyle = Math.random() < .5 ? 'rgba(255,210,150,.18)' : 'rgba(150,70,20,.16)'; c.fillRect(Math.random() * w, Math.random() * h, 2, 5 + Math.random() * 5); }
    c.fillStyle = 'rgba(150,66,20,.5)';
    for (let x = 4; x < w; x += 16) { c.beginPath(); c.moveTo(x, h * .28); c.quadraticCurveTo(x + 3, h * .5, x - 1, h * .74); c.lineTo(x + 5, h * .72); c.quadraticCurveTo(x + 8, h * .5, x + 4, h * .3); c.fill(); }
  });
  const fur = MT(furTex, .96), furPlain = M('#dc8d48', .96), cream = M('#f4e2c4', .95), pink = M('#e79aa0', .8), dark = M('#2a1a12', .5), green = M('#9bc65a', .35);
  const cat = new THREE.Group(); cat.position.y = .06; g.add(cat);
  const body = sph(.2, fur, 1.35, .62, .9); body.position.set(-.02, .15, 0); cat.add(body);
  const haunch = sph(.15, furPlain, 1, .85, .95); haunch.position.set(-.13, .13, .03); cat.add(haunch);
  const chest = sph(.1, cream, 1, .9, .95); chest.position.set(.14, .12, 0); cat.add(chest);
  const paws = [[.25, .035, .07], [.25, .035, -.07]].map(([x, y, z]) => { const p = sph(.04, cream, 1.4, .7, .9); p.position.set(x, y, z); cat.add(p); return p; });
  // cabeza
  const head = new THREE.Group(); head.position.set(.22, .2, 0); cat.add(head);
  const skull = sph(.105, furPlain, 1, .92, 1.05); head.add(skull);
  const muzzle = sph(.045, cream, 1.1, .75, 1.15); muzzle.position.set(.085, -.03, 0); head.add(muzzle);
  const nose = sph(.015, pink, 1, .8, 1.2); nose.position.set(.125, -.015, 0); head.add(nose);
  const earMat = furPlain;
  const ears = [-1, 1].map((s) => {
    const e = new THREE.Group(); e.position.set(.0, .09, s * .07);
    const o = new THREE.Mesh(new THREE.ConeGeometry(.04, .09, 4), earMat); o.rotation.x = s * .22; o.castShadow = true; e.add(o);
    const i = new THREE.Mesh(new THREE.ConeGeometry(.022, .06, 4), pink); i.position.set(.012, -.005, 0); i.rotation.x = s * .22; e.add(i);
    head.add(e); return e;
  });
  const eyes = [-1, 1].map((s) => {
    const e = new THREE.Group(); e.position.set(.088, .028, s * .045);
    const white = sph(.02, green, .6, 1, 1); e.add(white);
    const pupil = sph(.011, dark, .5, 1.5, .6); pupil.position.x = .008; e.add(pupil);
    const lid = sph(.024, furPlain, .8, 1, 1.1); lid.position.x = -.002; lid.userData.lid = true; e.add(lid);
    head.add(e); return { g: e, lid };
  });
  const wmat = new THREE.MeshBasicMaterial({ color: '#f7f2e8' });
  [-1, 1].forEach((s) => [-.02, 0, .02].forEach((dy, k) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(.0025, .0025, .11, 4), wmat); w.rotation.set(0, 0, 0); w.rotation.x = Math.PI / 2 + s * .12; w.rotation.z = (k - 1) * .22; w.position.set(.11, -.025 + dy, s * .065); head.add(w);
  }));
  // cola: cadena de segmentos que ondula
  const tail = []; const segs = 7;
  for (let i = 0; i < segs; i++) { const sg = sph(.036 - i * .0025, i > segs - 3 ? cream : furPlain, 1.25, 1, 1); cat.add(sg); tail.push(sg); }
  const state = { sleepy: 1 };
  g.userData.anim = (t) => {
    const T = t % 30;
    // 0-15 duerme; 15-17 despierta; 17-24 alerta; 24-27 bosteza y se relaja; 27-30 vuelve a dormir
    let awake = 0;
    if (T >= 15 && T < 17) awake = (T - 15) / 2; else if (T >= 17 && T < 24) awake = 1; else if (T >= 24 && T < 27) awake = 1 - (T - 24) / 3 * .6; else if (T >= 27) awake = .4 * (1 - (T - 27) / 3);
    const breathe = Math.sin(t * (1.5 + awake * .8));
    body.scale.set(1.35, .62 + breathe * (.022 - awake * .008), .9 + breathe * .01);
    // postura: dormida = cabeza apoyada baja y girada hacia el cuerpo; alerta = cabeza alta
    head.position.set(.22 - (1 - awake) * .05, .2 + awake * .08 - (1 - awake) * .035, (1 - awake) * .06);
    head.rotation.set(0, (1 - awake) * -.55 + Math.sin(t * .9) * .5 * Math.max(0, awake - .2), -(1 - awake) * .3 + Math.sin(t * 1.3) * .05 * awake);
    chest.position.y = .12 + awake * .03;
    paws.forEach((p, i) => { p.position.x = .25 - (1 - awake) * .03; p.position.z = (i ? -1 : 1) * (.07 - (1 - awake) * .015); });
    // ojos: cerrados al dormir, abiertos al despertar, parpadeo ocasional
    const blink = (Math.sin(t * 2.1) > .985 || (t % 5 > 4.85)) ? 0 : 1;
    const open = Math.max(0, Math.min(1, (awake - .25) * 2.2)) * blink;
    eyes.forEach((e) => { e.lid.scale.set(.8, 1.15 - open * 1.1, 1.1); e.lid.position.y = open * .02; });
    ears.forEach((e, i) => { e.rotation.z = Math.sin(t * 4 + i * 2.3) * (T > 8 && T < 9 || awake > .8 ? .22 : .03) * (awake > .3 ? 1 : (T % 7 < .4 ? 1 : .2)); });
    // cola: rodea el cuerpo por el lado visible y ondula (más viva al despertar)
    const sw = .3 + awake * 1;
    tail.forEach((sg, i) => {
      const u = i / (segs - 1);
      const wave = Math.sin(t * (1.1 + awake * 1.8) - i * .7) * .03 * sw * u * 2;
      sg.position.set(-.2 + u * .36, .045 + Math.sin(u * 3) * .02 + awake * .03 * u, .13 + Math.sin(u * Math.PI) * .1 + wave);
    });
  };
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

function ereaderStand(f, ctx) {
  const g = new THREE.Group();
  boxAt(g, .86, .72, .5, mWalnut, 0, 0, 0, .03); boxAt(g, .92, .05, .56, mOak, 0, .72, 0, .02);
  const cols = ['#f2efe6', '#d9566b', '#2a2a2e', '#3a6aa5'];
  cols.forEach((c, i) => {
    const d = new THREE.Group();
    boxAt(d, .15, .24, .018, M(c, .5), 0, 0, 0, .006);
    boxAt(d, .12, .19, .004, M('#c9d3d0', .3), 0, .025, .011, .002);   // pantalla de tinta
    d.position.set(-.3 + i * .2, .77, .02); d.rotation.x = -.28; g.add(d);
    boxAt(g, .1, .02, .05, mDark, -.3 + i * .2, .745, -.02, .004);
  });
  boxAt(g, .78, .035, .13, M('#e8d9b8', .8), 0, .68, .26, .008);   // cartel
  return shade(g);
}

/* ---------- Escaparate y sus artículos ---------- */

function itemMesh(key) {
  const g = new THREE.Group(), [kind, id] = key.split(':');
  if (kind === 'b') { const bk = displayBook(BOOK[id], .2, .3, .04); bk.rotation.x = -.12; g.add(bk); return g; }
  const colors = ['#d9566b', '#e0a93b', '#3a8a7a'];
  switch (id) {
    case 'marcapaginas': colors.forEach((c, i) => boxAt(g, .035, .16, .004, M(c, .6), (i - 1) * .05, 0, 0, .001)); break;
    case 'libreta': boxAt(g, .14, .19, .022, M('#c8566b', .7), 0, 0, 0, .004); boxAt(g, .012, .19, .024, M('#2a2a2a', .6), .045, 0, 0, .001); break;
    case 'vela': cylAt(g, .045, .045, .1, M('#f3e7c9', .8), 0, 0, 0, 16); cylAt(g, .004, .004, .02, M('#2a2a2a', .6), 0, .1, 0, 6); { const fl = sph(.011, MG('#ffcf6b', 1.6), 1, 1.6, 1); fl.position.set(0, .13, 0); g.add(fl); } break;
    case 'tote': boxAt(g, .16, .18, .02, M('#efe3c8', .9), 0, 0, 0, .004); { const h = new THREE.Mesh(new THREE.TorusGeometry(.04, .005, 6, 14, Math.PI), M('#c9b08a', .9)); h.position.set(0, .18, 0); g.add(h); } break;
    case 'poster': boxAt(g, .2, .28, .014, mDark, 0, 0, 0, .004); boxAt(g, .17, .25, .004, M('#e0a64a', .8), 0, .015, .008, .001); boxAt(g, .08, .08, .005, M('#3a6a82', .8), 0, .1, .011, .001); break;
    case 'fig_dragon': { const b = sph(.05, M('#3f8a5a', .7), 1.1, .9, 1); b.position.y = .05; g.add(b); const h = sph(.03, M('#3f8a5a', .7)); h.position.set(.06, .1, 0); g.add(h); [-1, 1].forEach((s2) => { boxAt(g, .06, .05, .004, M('#2a6a46', .7), -.01, .07, s2 * .05, .001); }); const t = new THREE.Mesh(new THREE.ConeGeometry(.015, .08, 6), M('#3f8a5a', .7)); t.rotation.z = Math.PI / 2; t.position.set(-.09, .04, 0); g.add(t); } break;
    case 'fig_gato': { const b = sph(.05, M('#d98a45', .8), 1, 1.1, 1); b.position.y = .05; g.add(b); const h = sph(.035, M('#d98a45', .8)); h.position.set(.01, .115, 0); g.add(h); [-1, 1].forEach((s2) => { const e = new THREE.Mesh(new THREE.ConeGeometry(.012, .025, 4), M('#d98a45', .8)); e.position.set(.01, .15, s2 * .02); g.add(e); }); } break;
    case 'fig_buho': { const b = sph(.045, M('#8a5a3a', .8), 1, 1.3, 1); b.position.y = .06; g.add(b); [-1, 1].forEach((s2) => { const e = sph(.014, M('#fff6dc', .5)); e.position.set(.035, .09, s2 * .017); g.add(e); const p = sph(.006, M('#111', .5)); p.position.set(.047, .09, s2 * .017); g.add(p); }); } break;
    case 'fig_mago': { const b = new THREE.Mesh(new THREE.ConeGeometry(.045, .1, 10), M('#3a4a8a', .8)); b.position.y = .05; g.add(b); const h = sph(.025, M('#f1c9a5', .8)); h.position.y = .115; g.add(h); const hat = new THREE.Mesh(new THREE.ConeGeometry(.03, .07, 8), M('#3a4a8a', .8)); hat.position.y = .17; g.add(hat); } break;
    default: boxAt(g, .1, .1, .05, M('#c9b08a', .8), 0, 0, 0, .004);
  }
  return g;
}

function escaparate(f) {
  const g = new THREE.Group(), W = 2.9, D = .5, H = 1.95;
  boxAt(g, W, .08, D, mDark, 0, 0, 0, .02);                                  // zócalo
  boxAt(g, W, H, .04, M('#5a3827', .9), 0, 0, -D / 2 + .02, .005);           // fondo
  [-1, 1].forEach((s) => boxAt(g, .06, H, D, mWalnut, s * (W / 2 - .03), 0, 0, .01));  // laterales
  boxAt(g, W, .12, D + .04, mWalnut, 0, H, 0, .02);                           // cornisa
  const sign = canvasTex(256, 64, (c, w2, h2) => { c.fillStyle = '#3f6b66'; c.fillRect(0, 0, w2, h2); c.fillStyle = '#f3e7c9'; c.font = '700 34px Fraunces, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Escaparate', w2 / 2, h2 / 2 + 2); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(.9, .22), new THREE.MeshStandardMaterial({ map: sign })); sg.position.set(0, H + .14, D / 2 + .03); g.add(sg);
  const tiers = [.08, .7, 1.32];
  tiers.forEach((y) => boxAt(g, W - .1, .035, D - .04, mOak, 0, y, 0, .005));
  const slots = f.slots ?? [];
  slots.forEach((key, i) => {
    if (!key) return;
    const tier = Math.floor(i / 4), col = i % 4;
    const m = itemMesh(key); if (!key.startsWith('b:')) m.scale.setScalar(1.7); m.position.set(-1.05 + col * .7, tiers[tier] + .035, .02); g.add(m);
  });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(W - .12, H - .1), new THREE.MeshStandardMaterial({ color: '#cfe8f0', transparent: true, opacity: .12, roughness: .1 }));
  glass.position.set(0, H / 2 + .02, D / 2 + .005); g.add(glass);
  const lp = new THREE.Object3D(); lp.position.set(0, 1.6, .2); g.add(lp);
  return shade(g);
}

// Cada constructor devuelve un grupo con origen en el centro de la huella.
export const BUILD = {
  shelf, table: roundTable, counter, armchair, sofa, side: sideTable, lamp: floorLamp, plant, cat: catBed, rug, escaparate, ereader: ereaderStand, coffee: coffeeCorner,
};

export function buildFurniture(f, ctx) {
  const g = BUILD[f.type]?.(f, ctx) ?? new THREE.Group();
  const root = new THREE.Group(); root.add(g);
  root.userData.anim = g.userData.anim;
  return root;
}
