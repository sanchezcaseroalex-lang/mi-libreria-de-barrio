// Personajes 3D en estilo "muñeco de videojuego acogedor": cabeza grande, cuerpo pequeño, rasgos pintados en la cara,
// sombreado de dibujo animado y ropa con tejido. Cada aspecto se define con un objeto `look` (el mismo que usa cast.js).
import { THREE, canvasTex, shade } from './kit3d.js';

export const HERO_LOOK = { skin: '#f0c6a0', hair: '#5a3422', style: 'moño', band: '#c8566b', outfit: 'apron', coat: '#4d8f86', shirt: '#4d8f86', apron: '#f3e7c9', pants: '#35435a', acc: 'nada', lashes: true };

/* ---------- Materiales de dibujo animado ---------- */

const gradient = (() => {
  const t = new THREE.DataTexture(new Uint8Array([122, 172, 222, 255]), 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const matCache = new Map();
const toon = (color, map = null, key = '') => {
  const k = `${color}|${key}`;
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshToonMaterial({ color, map, gradientMap: gradient }));
  return matCache.get(k);
};

const clothCache = new Map();
function clothTex(kind, c1, c2) {
  const k = `${kind}|${c1}|${c2}`;
  if (clothCache.has(k)) return clothCache.get(k);
  const t = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = c1; g.fillRect(0, 0, w, h);
    g.fillStyle = c2;
    if (kind === 'rayas') for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 14);
    else if (kind === 'cuadros') { g.globalAlpha = .45; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 10); for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 10, h); g.globalAlpha = 1; }
    else if (kind === 'lunares') for (let y = 10; y < h; y += 32) for (let x = 10 + ((y / 32) % 2) * 16; x < w; x += 32) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
    else if (kind === 'espiga') { g.globalAlpha = .3; for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { g.fillRect(x + ((y / 8) % 2 ? 0 : 4), y, 3, 7); } g.globalAlpha = 1; }
    else if (kind === 'dados') for (let y = 12; y < h; y += 40) for (let x = 12 + ((y / 40) % 2) * 20; x < w; x += 40) { g.globalAlpha = .7; g.fillRect(x, y, 11, 11); g.globalAlpha = 1; }
    else { g.globalAlpha = .06; for (let i = 0; i < 260; i++) g.fillRect(Math.random() * w, Math.random() * h, 2, 2); g.globalAlpha = 1; }
  }, [1, 1]);
  clothCache.set(k, t);
  return t;
}
const cloth = (color, kind = 'liso', color2 = '#ffffff') => toon('#ffffff', clothTex(kind, color, color2), `${kind}|${color}|${color2}`);

/* ---------- Cara pintada (ojos, cejas, boca y colorete en una textura) ---------- */

const faceCache = new Map();
function faceTexture(a, blink) {
  const key = `${a.skin}|${a.eyes ?? ''}|${a.brow ?? a.hair}|${!!a.lashes}|${!!a.freckles}|${blink}`;
  if (faceCache.has(key)) return faceCache.get(key);
  const W = 1024, H = 512, cx = W * 0.25;
  const t = canvasTex(W, H, (g) => {
    g.fillStyle = a.skin; g.fillRect(0, 0, W, H);
    const eyeY = H * 0.53, ex = 50;
    const col = a.eyes ?? '#2b1c16';
    [-1, 1].forEach((s) => {
      const x = cx + s * ex;
      if (blink) { g.strokeStyle = col; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(x, eyeY - 4, 20, .15 * Math.PI, .85 * Math.PI); g.stroke(); }
      else {
        g.fillStyle = col; g.beginPath(); g.ellipse(x, eyeY, 19, 25, 0, 0, 7); g.fill();
        g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x - s * 5 - 3, eyeY - 9, 7.5, 9, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + s * 5 + 2, eyeY + 10, 3.6, 4.2, 0, 0, 7); g.fill();
      }
      if (a.lashes) { g.strokeStyle = col; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + s * 15, eyeY - 14); g.lineTo(x + s * 29, eyeY - 22); g.moveTo(x + s * 18, eyeY - 4); g.lineTo(x + s * 33, eyeY - 8); g.stroke(); }
      g.strokeStyle = a.brow ?? a.hair; g.lineWidth = 9; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x - 20, eyeY - 52 + s * 2); g.quadraticCurveTo(x, eyeY - 66, x + 20, eyeY - 52 - s * 2); g.stroke();
      const gr = g.createRadialGradient(cx + s * 92, eyeY + 44, 2, cx + s * 92, eyeY + 44, 34);
      gr.addColorStop(0, 'rgba(240,120,110,.55)'); gr.addColorStop(1, 'rgba(240,120,110,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(cx + s * 92, eyeY + 44, 36, 24, 0, 0, 7); g.fill();
    });
    if (a.freckles) { g.fillStyle = 'rgba(150,85,50,.5)'; let sd = 7; const rn = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; }; for (let i = 0; i < 26; i++) { const s = i % 2 ? 1 : -1; g.beginPath(); g.arc(cx + s * (30 + rn() * 78), eyeY + 22 + rn() * 38, 3.2 + rn() * 2.4, 0, 7); g.fill(); } for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(cx + (rn() - .5) * 40, eyeY + 26 + rn() * 14, 3, 0, 7); g.fill(); } }
    g.strokeStyle = '#8a3a3a'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(cx, eyeY + 70, 24, .15 * Math.PI, .85 * Math.PI); g.stroke();
  }, null);
  faceCache.set(key, t);
  return t;
}

/* ---------- Construcción ---------- */

const ell = (rx, ry, rz, mat, seg = 18) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, seg, Math.round(seg * .7)), mat); m.scale.set(rx, ry, rz); m.castShadow = m.receiveShadow = true; return m; };
const tube = (r0, r1, len, mat, seg = 14) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, seg), mat); m.castShadow = m.receiveShadow = true; return m; };
const lathe = (pts, mat, seg = 28) => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat); m.castShadow = m.receiveShadow = true; return m; };

export function makePerson(a) {
  const sc = a.scale ?? 1;
  const root = new THREE.Group();
  const g = new THREE.Group(); g.scale.setScalar(sc); root.add(g);
  const skinM = toon(a.skin), hairM = toon(a.hair), beardM = toon(a.beardColor ?? a.hair), outfit = a.outfit ?? 'coat';
  const pat = a.pattern ?? (outfit === 'vest' ? 'espiga' : 'liso');
  const shirtCol = a.shirt ?? a.coat, coatCol = a.coat;
  const topM = cloth(outfit === 'vest' ? (a.vest ?? '#7a6a4a') : (outfit === 'shirt' || outfit === 'apron') ? shirtCol : coatCol, pat);
  const sleeveM = cloth(outfit === 'vest' || outfit === 'shirt' || outfit === 'apron' ? shirtCol : coatCol, outfit === 'shirt' ? pat : 'liso');
  const pantsM = cloth(a.pants ?? '#3b3f55');
  const shoeM = toon(a.shoe ?? '#4a2f24');
  const hipY = .22, th = .3;

  // piernas cortas y zapatos grandes y redondos
  const legs = [0, 1].map((i) => {
    const l = new THREE.Group(); l.position.set((i ? 1 : -1) * .075, hipY, 0);
    const up = tube(.065, .055, hipY - .02, pantsM); up.position.y = -(hipY - .02) / 2; l.add(up);
    const shoe = ell(.075, .05, .105, shoeM); shoe.position.set(0, -hipY + .035, .03); l.add(shoe);
    g.add(l); return l;
  });

  const body = new THREE.Group(); body.position.y = hipY; g.add(body);
  const torso = lathe([[0, -.03], [.125, -.03], [.16, .03], [.162, .13], [.145, .23], [.115, .295], [.06, .335], [0, .345]], topM);
  body.add(torso);
  if (outfit === 'coat' || outfit === 'trench') {
    const sk = lathe([[0, -.2], [.215, -.2], [.2, -.14], [.165, -.02], [.14, .06], [0, .06]], topM); body.add(sk);
    const hem = new THREE.Mesh(new THREE.TorusGeometry(.212, .012, 8, 28), toon(outfit === 'trench' ? '#8a7048' : '#2a2a33')); hem.rotation.x = Math.PI / 2; hem.position.y = -.195; body.add(hem);
    [.18, .1].forEach((y) => { const bt = ell(.016, .016, .01, toon('#3a2a20')); bt.position.set(0, y, .158); body.add(bt); });
    if (outfit === 'trench') { const belt = new THREE.Mesh(new THREE.TorusGeometry(.157, .013, 8, 24), toon('#6b5535')); belt.rotation.x = Math.PI / 2; belt.position.y = .045; body.add(belt); }
  }
  if (outfit === 'dress') { const sk = lathe([[0, -.19], [.22, -.19], [.19, -.1], [.15, .0], [.14, .06], [0, .06]], topM); body.add(sk); const hem = new THREE.Mesh(new THREE.TorusGeometry(.218, .012, 8, 28), toon('#ffffff')); hem.rotation.x = Math.PI / 2; hem.position.y = -.185; body.add(hem); }
  if (outfit === 'hoodie') {
    const hd = new THREE.Mesh(new THREE.TorusGeometry(.12, .05, 10, 22, Math.PI * 1.15), topM); hd.rotation.set(Math.PI / 2 - .6, 0, Math.PI * .92); hd.position.set(0, th + .01, -.05); body.add(hd);
    const pk = ell(.085, .05, .02, topM); pk.position.set(0, .09, .16); body.add(pk);
    [-1, 1].forEach((s) => { const lace = tube(.006, .006, .12, toon('#f3e7c9'), 6); lace.position.set(s * .03, .22, .155); body.add(lace); });
  }
  if (outfit === 'vest') {
    const col = ell(.07, .02, .05, toon('#f6efe0')); col.position.set(0, th + .03, .1); body.add(col);
    [-1, 1].forEach((s) => { const lap = ell(.05, .045, .02, toon('#f6efe0')); lap.position.set(s * .055, th, .15); lap.rotation.z = -s * .6; body.add(lap); });
  }
  if (outfit === 'shirt') {
    const col = new THREE.Mesh(new THREE.TorusGeometry(.085, .018, 8, 18), toon(shirtCol === '#efe3c8' ? '#f6efe0' : shirtCol)); col.rotation.x = Math.PI / 2; col.position.set(0, th + .02, .02); body.add(col);
    [.2, .13, .06].forEach((y) => { const bt = ell(.012, .012, .008, toon('#f6efe0')); bt.position.set(0, y, .16); body.add(bt); });
  }
  if (outfit === 'apron') {
    const ap = ell(.125, .17, .035, toon(a.apron ?? '#f3e7c9')); ap.position.set(0, .08, .15); body.add(ap);
    [-1, 1].forEach((s) => { const st = tube(.01, .01, .3, toon(a.apron ?? '#f3e7c9'), 6); st.position.set(s * .08, .27, .13); st.rotation.z = -s * .12; st.rotation.x = -.1; body.add(st); });
    const pkt = ell(.05, .035, .012, toon('#e0d4b8')); pkt.position.set(0, .06, .185); body.add(pkt);
  }
  if (a.acc === 'bufanda' || a.scarf) {
    const col = a.scarf ?? '#c8566b';
    const sc2 = new THREE.Mesh(new THREE.TorusGeometry(.105, .04, 10, 22), cloth(col, 'rayas', '#ffffff')); sc2.rotation.x = Math.PI / 2; sc2.position.y = th + .015; body.add(sc2);
    const tail = ell(.05, .13, .03, cloth(col)); tail.position.set(.07, th - .12, .13); tail.rotation.z = .12; body.add(tail);
  }
  if (a.tie) { const t = ell(.025, .1, .015, toon(a.tie)); t.position.set(0, th - .1, .165); body.add(t); const kn = ell(.03, .025, .02, toon(a.tie)); kn.position.set(0, th - .01, .16); body.add(kn); }

  // brazos cortos con manoplas
  const arms = [0, 1].map((i) => {
    const ar = new THREE.Group(); ar.position.set((i ? 1 : -1) * .17, th - .03, 0);
    const sl = tube(.05, .042, .21, sleeveM); sl.position.y = -.1; ar.add(sl);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(.044, .012, 8, 14), a.rolled ? skinM : toon('#ffffff', null, 'cuff')); cuff.rotation.x = Math.PI / 2; cuff.position.y = -.2; ar.add(cuff);
    const hand = ell(.052, .052, .052, skinM); hand.position.y = -.24; ar.add(hand);
    body.add(ar); return ar;
  });

  // cabeza grande
  const head = new THREE.Group(); head.position.y = th + .27; body.add(head);
  const hs = a.headScale ?? (a.kid ? 1.12 : 1); head.scale.setScalar(hs);
  const Rr = .25;
  const faceMat = new THREE.MeshToonMaterial({ map: faceTexture(a, false), gradientMap: gradient });
  const skull = new THREE.Mesh(new THREE.SphereGeometry(Rr, 48, 32), faceMat); skull.scale.set(1.06, .95, 1); skull.castShadow = skull.receiveShadow = true; head.add(skull);
  const nose = ell(.028, .024, .026, skinM); nose.position.set(0, -.045, .243); head.add(nose);
  [-1, 1].forEach((s) => { const ear = ell(.04, .06, .03, skinM); ear.position.set(s * .262, -.02, -.01); head.add(ear); });
  if (a.earrings) [-1, 1].forEach((s) => { const er = new THREE.Mesh(new THREE.TorusGeometry(.03, .007, 6, 16), toon(a.earrings === true ? '#d9b24a' : a.earrings)); er.rotation.y = Math.PI / 2; er.position.set(s * .272, -.085, .0); head.add(er); });

  const hairCap = (r, tl, sx = 1.07, sy = .99, sz = 1.03) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 30, 20, 0, Math.PI * 2, 0, Math.PI * tl), hairM); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };
  const st = a.style ?? 'corto';
  if (st !== 'calvo' && !a.hat) {
    const base = hairCap(Rr * 1.045, .58); base.rotation.x = -.45; base.position.set(0, .02, -.015); head.add(base);
  }
  const bangs = (n = 4, spread = .11, y = .105, lift = 0) => { for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * spread; const b = ell(.085, .06, .075, hairM); b.position.set(x, y - Math.abs(x) * .22 + lift, .205 - Math.abs(x) * .35); b.rotation.set(.45, 0, -x * 2.2); head.add(b); } };
  if (st === 'corto' && !a.hat) { bangs(4, .105, .115); const q = ell(.1, .06, .08, hairM); q.position.set(.06, .205, .12); q.rotation.z = -.4; head.add(q); }
  if (st === 'largo') {
    bangs(3, .13, .125, 0);
    const back = ell(.275, .3, .16, hairM, 20); back.position.set(0, -.15, -.1); head.add(back);
    [-1, 1].forEach((s) => { const lock = ell(.06, .2, .07, hairM); lock.position.set(s * .245, -.13, .06); lock.rotation.z = s * .08; head.add(lock); });
  }
  if (st === 'bob') {
    bangs(4, .11, .115);
    const back = ell(.28, .2, .17, hairM, 20); back.position.set(0, -.07, -.09); head.add(back);
    [-1, 1].forEach((s) => { const lock = ell(.07, .13, .1, hairM); lock.position.set(s * .245, -.07, .03); head.add(lock); });
  }
  if (st === 'moño') {
    bangs(4, .105, .115);
    const bun = ell(.11, .11, .11, hairM); bun.position.set(0, .27, -.07); head.add(bun);
    const band = new THREE.Mesh(new THREE.TorusGeometry(.075, .012, 8, 18), toon(a.band ?? '#c8566b')); band.rotation.x = Math.PI / 2 - .3; band.position.set(0, .22, -.07); head.add(band);
  }
  if (st === 'rizado') {
    for (let i = 0; i < 20; i++) { const ang = i / 20 * Math.PI * 2, rr = .22; const cl = ell(.085, .085, .085, hairM, 14); cl.position.set(Math.cos(ang) * rr, .12 + (i % 3) * .035, Math.sin(ang) * rr * .95 - .03); if (Math.sin(ang) > .6) cl.position.y += .06; head.add(cl); }
    for (let i = 0; i < 6; i++) { const ang = i / 6 * Math.PI * 2; const cl = ell(.095, .09, .095, hairM, 14); cl.position.set(Math.cos(ang) * .1, .26, Math.sin(ang) * .1 - .02); head.add(cl); }
  }
  if (st === 'canoso') { [-1, 1].forEach((s) => { const sd = ell(.07, .11, .1, hairM); sd.position.set(s * .235, .04, -.03); head.add(sd); }); const sw = ell(.2, .09, .17, hairM); sw.position.set(.02, .17, -.04); sw.rotation.z = -.15; head.add(sw); const tf = ell(.14, .06, .08, hairM); tf.position.set(.04, .22, .06); tf.rotation.z = -.25; head.add(tf); }
  if (st === 'trenza') {
    bangs(4, .105, .115);
    const back = ell(.26, .16, .15, hairM, 18); back.position.set(0, -.04, -.1); head.add(back);
    for (let i = 0; i < 5; i++) { const b = ell(.06 - i * .004, .06, .06, hairM, 10); b.position.set(.1 - i * .01, -.16 - i * .09, -.1 + i * .02); head.add(b); }
  }
  if (a.beard === 'barba') { const b = ell(.17, .09, .12, beardM, 20); b.position.set(0, -.205, .1); head.add(b); [-1, 1].forEach((s) => { const sb = ell(.05, .11, .08, beardM, 12); sb.position.set(s * .17, -.12, .1); head.add(sb); }); const mo = ell(.07, .022, .04, beardM); mo.position.set(0, -.12, .235); head.add(mo); }
  if (a.beard === 'bigote') { [-1, 1].forEach((s) => { const mo = ell(.065, .028, .04, beardM); mo.position.set(s * .05, -.095, .235); mo.rotation.z = -s * .25; head.add(mo); }); }
  if (a.beard === 'sombra') { const bm = new THREE.MeshToonMaterial({ color: a.hair, gradientMap: gradient, transparent: true, opacity: .45 }); const b = ell(.21, .14, .15, bm, 18); b.position.set(0, -.14, .06); head.add(b); }
  if (a.glasses) {
    const gm = toon(a.glasses === true ? '#2b2b2b' : a.glasses, null, 'gl');
    [-1, 1].forEach((s) => { const r = new THREE.Mesh(new THREE.TorusGeometry(.068, .009, 8, 24), gm); r.position.set(s * .082, -.012, .238); head.add(r); });
    const br = ell(.02, .006, .006, gm); br.position.set(0, -.005, .245); head.add(br);
  }
  const hatCol = toon(a.hatColor ?? '#4a7a4a');
  if (a.hat === 'beanie') {
    const hat = new THREE.Mesh(new THREE.SphereGeometry(Rr * 1.09, 30, 20, 0, Math.PI * 2, 0, Math.PI * .56), cloth(a.hatColor ?? '#4a7a4a', 'rayas', '#00000030')); hat.scale.set(1.07, 1.05, 1.04); hat.rotation.x = -.35; hat.position.set(0, .03, -.01); head.add(hat);
    const fold = new THREE.Mesh(new THREE.TorusGeometry(.245, .035, 10, 32), hatCol); fold.rotation.x = Math.PI / 2 - .35; fold.scale.set(1.07, 1, 1); fold.position.set(0, .075, .025); head.add(fold);
    const pom = ell(.055, .055, .055, hatCol); pom.position.set(0, .3, -.1); head.add(pom);
    bangs(3, .12, .09, -.02);
  }
  if (a.hat === 'cap') {
    const hat = new THREE.Mesh(new THREE.SphereGeometry(Rr * 1.08, 30, 20, 0, Math.PI * 2, 0, Math.PI * .5), hatCol); hat.scale.set(1.06, 1.02, 1.03); hat.rotation.x = -.3; hat.position.set(0, .05, -.01); head.add(hat);
    const vis = ell(.15, .018, .13, hatCol); vis.position.set(0, .1, a.capBack ? -.3 : .27); vis.rotation.x = a.capBack ? -.15 : .15; head.add(vis);
    if (!a.capBack) bangs(2, .1, .105, -.03);
  }
  if (a.acc === 'auriculares') {
    const hp = new THREE.Mesh(new THREE.TorusGeometry(.265, .016, 8, 28, Math.PI), toon('#2a2a2a')); hp.position.set(0, .05, 0); hp.scale.set(1.0, 1.05, 1); head.add(hp);
    [-1, 1].forEach((s) => { const cup = ell(.045, .06, .06, toon('#2a2a2a')); cup.position.set(s * .27, 0, 0); head.add(cup); });
  }

  // objetos
  if (a.acc === 'bolso') { const bg = ell(.07, .08, .03, toon(a.bag ?? '#e8d9b8')); bg.position.set(.22, -.12, 0); body.add(bg); const hd = new THREE.Mesh(new THREE.TorusGeometry(.04, .006, 6, 12, Math.PI), toon('#8a6a4a')); hd.position.set(.22, -.05, 0); body.add(hd); }
  if (a.acc === 'mochila') { const bp = ell(.11, .14, .06, toon(a.bag ?? '#7a4a3a')); bp.position.set(0, .17, -.17); body.add(bp); }
  if (a.acc === 'cafe') { const cup = tube(.03, .024, .07, toon('#e8d9bd'), 12); cup.position.set(0, -.27, .06); arms[1].add(cup); }
  if (a.acc === 'bastón') { const cn = tube(.011, .011, .6, toon('#6b4a2a'), 6); cn.position.set(0, -.3, .04); arms[1].add(cn); }
  if (a.acc === 'libro') { const bk = new THREE.Mesh(new THREE.BoxGeometry(.14, .2, .045), toon('#6b4a2a')); bk.position.set(0, -.26, .08); bk.rotation.x = -.25; bk.castShadow = true; arms[1].add(bk); const pg = new THREE.Mesh(new THREE.BoxGeometry(.125, .185, .03), toon('#f0e4c4')); pg.position.set(.008, -.26, .085); pg.rotation.x = -.25; arms[1].add(pg); }
  if (a.acc === 'tote') { const tb = ell(.1, .11, .035, toon('#efe3c8')); tb.position.set(0, -.34, .05); arms[1].add(tb); }
  if (a.acc === 'peluche') { const pl = ell(.075, .075, .07, toon('#5aa05a')); pl.position.set(0, -.3, .07); arms[1].add(pl); }
  if (a.acc === 'caja') { const bx = new THREE.Mesh(new THREE.BoxGeometry(.3, .2, .22), toon('#c9a06a')); bx.position.set(0, .12, .26); bx.castShadow = true; body.add(bx); }
  if (a.acc === 'cámara') { const cm = ell(.055, .04, .03, toon('#2a2a2a')); cm.position.set(0, th - .06, .17); body.add(cm); const ln = tube(.016, .016, .02, toon('#8a8a8a'), 10); ln.rotation.x = Math.PI / 2; ln.position.set(0, th - .06, .2); body.add(ln); }

  const hold = new THREE.Group(); hold.position.set(0, .12, .2); body.add(hold);   // sitio para llevar un libro
  shade(root);
  root.userData = { legs, arms, body, head, hold, hipY, th, headY: hipY + th + .27, headR: Rr, faceMat, look: a, phase: 0, seated: false, blink: 2 + Math.random() * 3 };
  return root;
}

export function animatePerson(p, moving, dt, t) {
  const u = p.userData;
  if (u.seated) return;
  u.phase += dt * (moving ? 10 : 0);
  const s = moving ? Math.sin(u.phase) : 0;
  u.legs[0].rotation.x = s * .75; u.legs[1].rotation.x = -s * .75;
  u.arms[0].rotation.x = u.carrying ? -1.15 : -s * .7; u.arms[1].rotation.x = u.carrying ? -1.15 : s * .7;
  u.body.position.y = u.hipY + (moving ? Math.abs(Math.sin(u.phase)) * .03 : Math.sin(t * 2 + (u.seed ?? 0)) * .006);
  u.body.rotation.z = moving ? Math.sin(u.phase) * .05 : 0;
  if (!moving) u.head.rotation.y = u.lookAt != null ? u.lookAt : Math.sin(t * .7 + (u.seed ?? 0)) * .3; else u.head.rotation.y = 0;
  u.blink -= dt;
  if (u.blink < 0) { u.blinkOn = !u.blinkOn; u.faceMat.map = faceTexture(u.look, u.blinkOn); u.faceMat.needsUpdate = true; u.blink = u.blinkOn ? .13 : 2 + Math.random() * 3.5; }
}

export function sitPerson(p, on) {
  const u = p.userData;
  u.seated = on;
  if (on) {
    u.body.position.y = u.hipY - .12; u.legs.forEach((l) => { l.rotation.x = -1.5; l.position.y = u.hipY - .12; l.position.z = .08; });
    u.arms.forEach((a) => { a.rotation.x = -.9; }); u.head.rotation.y = 0;
  } else {
    u.legs.forEach((l) => { l.position.y = u.hipY; l.position.z = 0; });
  }
}
