// El barrio de la librería en 3D: calles, casas, árboles, farolas, plaza con fuente y la fachada de "La Tinta y el Té".
import { THREE, M, MT, MG, box, boxAt, cyl, cylAt, sph, canvasTex, mulberry32, mOak, mDark, mPine } from './kit3d.js';

const rnd = mulberry32(77);

// Texturas pintadas: asfalto con grano, adoquín de acera, tejas y hierba
const texAsphalt = (w, d) => { const tx = canvasTex(128, 128, (c, W, H) => { c.fillStyle = '#4d4c55'; c.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { c.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.09)'; c.fillRect(Math.random() * W, Math.random() * H, 2, 2); } }); tx.repeat.set(Math.max(1, w / 3), Math.max(1, d / 3)); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; return tx; };
const texPave = (w, d) => { const tx = canvasTex(128, 128, (c, W, H) => { c.fillStyle = '#d8cbb3'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(120,100,70,.35)'; c.lineWidth = 2; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(0, i * 32); c.lineTo(W, i * 32); c.stroke(); c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, H); c.stroke(); } for (let i = 0; i < 300; i++) { c.fillStyle = 'rgba(90,70,40,.06)'; c.fillRect(Math.random() * W, Math.random() * H, 3, 3); } }); tx.repeat.set(Math.max(1, w / 2), Math.max(1, d / 2)); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; return tx; };
const texTiles = (w) => { const tx = canvasTex(128, 64, (c, W, H) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 3; for (let y = 0; y < 4; y++) { c.beginPath(); c.moveTo(0, y * 16 + 15); c.lineTo(W, y * 16 + 15); c.stroke(); for (let x = (y % 2) * 16; x < W; x += 32) { c.beginPath(); c.moveTo(x, y * 16); c.lineTo(x, y * 16 + 15); c.stroke(); } } }); tx.repeat.set(Math.max(2, w * 1.2), 1.2); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; return tx; };
const pick = (a) => a[Math.floor(rnd() * a.length)];

const FACADES = ['#e8c9a0', '#d9a5a0', '#c9d8c0', '#b9cfd9', '#e8d9a0', '#d9b9a0', '#cfc0dd', '#f0d4b8', '#c0cfa8'];
const ROOFS = ['#9a4a3a', '#7a4a3a', '#5a5a66', '#8a5a3a', '#6a3a3a'];

function house(x, z, w, d, h, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const wall = M(o.color ?? pick(FACADES), .95), roofCol = pick(ROOFS), shutterCol = pick(['#3f6b66', '#7a3a3a', '#4a5a7a', '#5a7a4a', '#8a5a3a']);
  boxAt(g, w, h, d, wall, 0, 0, 0, 0.04);
  boxAt(g, w + .12, .16, d + .12, M('#e8e0d0', .9), 0, h - .06, 0, .02);           // cornisa
  // tejado a dos aguas con la cumbrera a lo largo de x
  const rh = d * .34, slant = Math.hypot(d / 2 + .25, rh), ang = Math.atan2(rh, d / 2 + .25), roofM = M(o.roof ?? roofCol, .85);
  const tileM = new THREE.MeshStandardMaterial({ color: o.roof ?? roofCol, roughness: .85, map: texTiles(w) });
  [-1, 1].forEach((s) => { const r = box(w + .3, .14, slant, tileM, .02); r.position.set(0, h + rh / 2 - .02, s * (d / 4 + .06)); r.rotation.x = s * ang; g.add(r); });
  boxAt(g, w + .34, .1, .16, M('#4a3028', .8), 0, h + rh - .04, 0, .02);   // cumbrera
  boxAt(g, w + .1, rh * .9, .08, wall, 0, h, d / 2 - .04, 0);                         // frontón delantero
  boxAt(g, w + .1, rh * .9, .08, wall, 0, h, -d / 2 + .04, 0);
  if (o.chimney !== false) { boxAt(g, .45, 1.1, .45, M('#8a6a5a', .95), w * .28, h + rh * .3, -d * .15, 0.02); }
  // ventanas en la cara +z y puerta
  const floors = Math.max(1, Math.round(h / 2));
  const cols = Math.max(1, Math.floor(w / 1.7));
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const wx = -w / 2 + (c + .5) * (w / cols), wy = .6 + f * (h / floors) + (f === 0 ? .1 : 0);
    if (f === 0 && c === Math.floor(cols / 2) && !o.noDoor) continue;
    boxAt(g, .76, .94, .06, M('#f1ece0', .8), wx, wy - .02, d / 2 + .02, 0.01);   // marco blanco
    [-1, 1].forEach((s) => boxAt(g, .2, .9, .05, M(shutterCol, .85), wx + s * .5, wy, d / 2 + .03, .005));   // contraventanas
    const lit = rnd() < (o.lit ?? .45);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(.58, .76), lit ? new THREE.MeshBasicMaterial({ color: '#ffd98a' }) : M('#a9c8d6', .2));
    gl.position.set(wx, wy + .45, d / 2 + .06); g.add(gl);
    boxAt(g, .9, .08, .14, M('#d8d0c0', .9), wx, wy - .05, d / 2 + .08, 0);
    boxAt(g, .58, .03, .02, M('#f1ece0', .8), wx, wy + .43, d / 2 + .08, 0); boxAt(g, .03, .76, .02, M('#f1ece0', .8), wx, wy + .07, d / 2 + .08, 0);   // cruz de la ventana
    if (rnd() < .35) { boxAt(g, .8, .12, .16, M('#7a4a32', .9), wx, wy - .16, d / 2 + .14, .01); for (let k = 0; k < 4; k++) { const fl = sph(.07, M(pick(['#e8556b', '#f2b84a', '#fff2d6', '#c070c8']), .8)); fl.position.set(wx - .27 + k * .18, wy - .02, d / 2 + .15); g.add(fl); } }   // jardinera con flores
  }
  boxAt(g, w + .06, .38, d + .06, M('#b8a890', .95), 0, 0, 0, .02);   // zócalo de piedra
  if (!o.noDoor) {
    boxAt(g, .96, 1.6, .08, M('#f1ece0', .8), 0, 0, d / 2 + .02, 0.02); boxAt(g, .8, 1.5, .08, M(pick(['#7a3a3a', '#3f6b66', '#4a5a7a', '#8a5a3a']), .8), 0, 0, d / 2 + .05, 0.02);
    const kn = sph(.04, M('#d9b24a', .3, .8)); kn.position.set(.28, .8, d / 2 + .1); g.add(kn);
    boxAt(g, 1.5, .12, .5, M('#c9c2b4', .9), 0, 0, d / 2 + .3, .02); boxAt(g, 1.3, .1, .3, M('#d8d0c0', .9), 0, 1.66, d / 2 + .12, 0.02);   // escalón y marquesina
    if (rnd() < .6) { const ap = box(w * .36, .1, .7, M(pick(['#c8566b', '#3f6b66', '#e0a93b']), .9), .01); ap.position.set(0, 2.05, d / 2 + .38); ap.rotation.x = .3; g.add(ap); }
  }
  if (h > 4 && w > 4.5) { boxAt(g, 1.3, .08, .6, M('#2a2a2e', .6, .3), 0, h * .5 + .35, d / 2 + .32, .01); for (let k = 0; k < 7; k++) boxAt(g, .03, .5, .03, M('#2a2a2e', .6, .3), -.62 + k * .2, h * .5 + .35, d / 2 + .6, 0); }   // balcón con barandilla
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

const tint = (c, k) => '#' + new THREE.Color(c).lerp(new THREE.Color(k > 0 ? '#ffffff' : '#10200c'), Math.abs(k)).getHexString();
function lobe(r, col, x, y, z, sy = .88) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), M(col, .93)); m.scale.set(1, sy, 1); m.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; }
function trunk(g, s, h) {
  cylAt(g, .1 * s, .19 * s, h * s, M('#6a4a32', .95), 0, 0, 0, 9);
  for (let i = 0; i < 4; i++) { const a2 = i * 1.57 + rnd(); const root = new THREE.Mesh(new THREE.SphereGeometry(.09 * s, 6, 5), M('#6a4a32', .95)); root.scale.set(1.5, .55, .8); root.position.set(Math.cos(a2) * .17 * s, .03, Math.sin(a2) * .17 * s); root.rotation.y = -a2; g.add(root); }
}
function tree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rnd() * 6;
  const kind = rnd();
  if (kind < .22) {
    // pino: cuatro pisos de cono
    trunk(g, s * .8, 1.1);
    const c = pick(['#3d7a52', '#336b4a', '#44855a']);
    [[1.0, 1.15, .9], [.82, 1.0, 1.7], [.62, .9, 2.4], [.4, .8, 3.0]].forEach(([r0, h0, y0], i) => { const co = new THREE.Mesh(new THREE.ConeGeometry(r0 * s, h0 * s, 9), M(tint(c, i * .04), .92)); co.position.y = y0 * s + h0 * s / 2 - .2 * s; co.castShadow = true; co.receiveShadow = true; g.add(co); });
  } else if (kind < .36) {
    // cipré estilizado
    trunk(g, s * .6, .6);
    const c = pick(['#3a6f4a', '#477c52']);
    const co = new THREE.Mesh(new THREE.CapsuleGeometry(.5 * s, 2.4 * s, 5, 10), M(c, .92)); co.position.y = 1.9 * s; co.scale.set(1, 1, 1); co.castShadow = true; co.receiveShadow = true; g.add(co);
  } else {
    // árbol de copa redonda hecha de varias masas, más claras arriba
    trunk(g, s, 1.35);
    const base = pick(['#5c9457', '#6aa55d', '#4f8a52', '#7fb869', '#c98f4a', '#d9a04a', '#b8683a']);
    for (let k = 0; k < 2; k++) { const a2 = rnd() * 6, br = new THREE.Mesh(new THREE.CylinderGeometry(.04 * s, .07 * s, .8 * s, 6), M('#6a4a32', .95)); br.position.set(Math.cos(a2) * .22 * s, 1.35 * s, Math.sin(a2) * .22 * s); br.rotation.set(Math.sin(a2) * .6, 0, -Math.cos(a2) * .6); g.add(br); }
    const lobes = [[0, 2.0, 0, 1.0], [.7, 1.75, .2, .8], [-.65, 1.8, -.25, .82], [.15, 1.7, .75, .78], [-.2, 1.85, -.7, .78], [.1, 2.65, 0, .72], [.55, 2.4, -.35, .6], [-.5, 2.35, .4, .62]];
    lobes.forEach(([lx, ly, lz, lr], i) => g.add(lobe(lr * s, tint(base, ly > 2.3 ? .1 : ly < 1.8 ? -.1 : 0), lx * s, ly * s, lz * s)));
  }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

// arbusto / seto redondeado
function bush(x, z, s = 1, col = '#5a9a58') {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  [[0, .38, 0, .42], [.32, .3, .1, .3], [-.3, .3, -.08, .32], [.05, .3, .3, .28]].forEach(([bx, by, bz, br]) => g.add(lobe(br * s, tint(col, bz > .1 ? .08 : 0), bx * s, by * s, bz * s, .85)));
  return g;
}
function flowerBed(cx, cz, rad, n, y = .08) {
  const g = new THREE.Group(); g.position.set(cx, 0, cz);
  const cols = ['#e8556b', '#f2b84a', '#fff2d6', '#c070c8', '#f08a5a'];
  for (let i = 0; i < n; i++) { const a2 = i / n * Math.PI * 2, rr = rad + (rnd() - .5) * .35; const f = new THREE.Mesh(new THREE.SphereGeometry(.09 + rnd() * .05, 6, 5), M(cols[i % cols.length], .8)); f.position.set(Math.cos(a2) * rr, y, Math.sin(a2) * rr); g.add(f); const st = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .12, 4), M('#4f8a3a', .9)); st.position.set(f.position.x, .03, f.position.z); g.add(st); }
  return g;
}
function hydrant(x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); cylAt(g, .1, .12, .5, M('#c8302a', .5), 0, 0, 0, 10); const c = sph(.11, M('#c8302a', .5)); c.position.y = .55; g.add(c); [-1, 1].forEach((s) => { const n = cyl(.04, .04, .14, M('#c8302a', .5), 6); n.rotation.z = Math.PI / 2; n.position.set(s * .12, .32, 0); g.add(n); }); g.traverse((m) => { if (m.isMesh) m.castShadow = true; }); return g; }
function busStop(x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  [-1, 1].forEach((s) => cylAt(g, .05, .05, 2.3, M('#3a4a52', .5, .5), s * 1.1, 0, -.4, 8));
  boxAt(g, 2.5, .08, 1.1, M('#3a4a52', .5, .4), 0, 2.3, -.15, .02);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.7), new THREE.MeshStandardMaterial({ color: '#bfe0ea', transparent: true, opacity: .35, roughness: .1 })); gl.position.set(0, 1.25, -.55); g.add(gl);
  boxAt(g, 1.6, .06, .4, mOak, 0, .5, -.35, .02); [-.6, .6].forEach((sx) => boxAt(g, .06, .5, .3, mDark, sx, 0, -.35, .01));
  const sign = canvasTex(64, 160, (c, W2, H2) => { c.fillStyle = '#e0a93b'; c.fillRect(0, 0, W2, H2); c.fillStyle = '#26302f'; c.font = '700 40px sans-serif'; c.textAlign = 'center'; c.fillText('BUS', W2 / 2, 60); c.beginPath(); c.arc(W2 / 2, 110, 18, 0, 7); c.fill(); });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(.4, 1.0), new THREE.MeshStandardMaterial({ map: sign })); sp.position.set(1.4, 1.9, -.4); g.add(sp); cylAt(g, .03, .03, 1.5, M('#3a4a52', .5, .5), 1.4, 0, -.4, 6);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

// coche aparcado (estilo de juguete)
function car(x, z, ry, col) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  const body = M(col, .5, .2), glass = M('#a9c8d6', .15), dark = M('#2a2a2e', .7);
  boxAt(g, 2.1, .5, 1.0, body, 0, .22, 0, .12);
  boxAt(g, 1.1, .42, .9, body, -.1, .7, 0, .14);
  [[-.2, 0], [.18, 0]].forEach(([dx]) => { const w = box(.04, .32, .8, glass, .01); w.position.set(dx - .1, .78, 0); g.add(w); });
  [[-.7, -.5], [-.7, .5], [.7, -.5], [.7, .5]].forEach(([wx, wz]) => { const w = cyl(.2, .2, .16, dark, 14); w.rotation.x = Math.PI / 2; w.position.set(wx, .2, wz); g.add(w); const hub = cyl(.09, .09, .18, M('#c9c9c9', .4, .6), 10); hub.rotation.x = Math.PI / 2; hub.position.set(wx, .2, wz); g.add(hub); });
  [[1.05, -.32], [1.05, .32]].forEach(([hx, hz]) => { const h = sph(.07, MG('#fff2c0', 1.2)); h.position.set(hx, .34, hz); g.add(h); });
  [[-1.05, -.32], [-1.05, .32]].forEach(([hx, hz]) => { const h = sph(.06, M('#c8302a', .5)); h.position.set(hx, .34, hz); g.add(h); });
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

function mailbox(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  cylAt(g, .05, .05, .9, M('#3a3a42', .6, .3), 0, 0, 0, 8);
  boxAt(g, .34, .42, .26, M('#e0a93b', .5), 0, .85, 0, .06);
  boxAt(g, .2, .04, .01, M('#2a2a2e', .6), 0, 1.12, .135, 0);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  return g;
}

function bin(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  cylAt(g, .22, .18, .7, M('#4a6a5a', .7), 0, 0, 0, 12); cylAt(g, .24, .24, .05, M('#3a5a4a', .7), 0, .7, 0, 12);
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  return g;
}

// pizarra con el menú del día y mesa con libros a la puerta de la librería
function chalkboard(x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  const tx = canvasTex(128, 192, (c, W, H) => { c.fillStyle = '#26302f'; c.fillRect(0, 0, W, H); c.strokeStyle = '#e8d9b0'; c.lineWidth = 4; c.strokeRect(6, 6, W - 12, H - 12); c.fillStyle = '#f3e7c9'; c.font = '700 22px Caveat, cursive'; c.textAlign = 'center'; c.fillText('Hoy leemos', W / 2, 44); c.font = '600 18px Caveat, cursive'; c.fillText('novedades', W / 2, 74); c.fillText('té y cafés', W / 2, 100); c.strokeStyle = '#e8a0a8'; c.beginPath(); c.arc(W / 2, 140, 16, 0, 7); c.stroke(); c.beginPath(); c.moveTo(W / 2 - 10, 140); c.lineTo(W / 2, 148); c.lineTo(W / 2 + 12, 130); c.stroke(); });
  [-1, 1].forEach((s) => { const p = box(.7, .86, .04, new THREE.MeshStandardMaterial({ map: s > 0 ? tx : null, color: s > 0 ? '#ffffff' : '#26302f', roughness: .85 }), .01); p.position.set(0, .55, s * .22); p.rotation.x = -s * .22; g.add(p); const fr = box(.76, .92, .03, mOak, .01); fr.position.set(0, .55, s * .235); fr.rotation.x = -s * .22; fr.scale.set(1, 1, 1); g.add(fr); p.position.z += s * .02; });
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  return g;
}
function bookStand(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  boxAt(g, 1.5, .06, .7, mOak, 0, .72, 0, .02);
  [[-.65, -.28], [.65, -.28], [-.65, .28], [.65, .28]].forEach(([lx, lz]) => boxAt(g, .06, .72, .06, mDark, lx, 0, lz, .01));
  const cols = ['#c8566b', '#3a5a8a', '#e0a93b', '#5c9457', '#7a4aa6', '#a2453a', '#2f6a5a', '#e8d9b0'];
  for (let i = 0; i < 12; i++) { const b = box(.2, .03 + (i % 3) * .005, .28, M(cols[i % cols.length], .8), .005); b.position.set(-.55 + (i % 6) * .21, .78 + Math.floor(i / 6) * .033, -.1 + Math.floor(i / 6) * .22); b.rotation.y = (i % 3 - 1) * .08; g.add(b); }
  for (let i = 0; i < 5; i++) { const b = box(.045, .34, .24, M(cols[(i * 3) % cols.length], .8), .005); b.position.set(-.35 + i * .06, .93, .2); b.rotation.z = .1 * (i % 2 ? 1 : -1); g.add(b); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

function lamp(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  cylAt(g, .05, .07, 2.6, M('#2f3a3a', .6, .4), 0, 0, 0, 8);
  boxAt(g, .3, .06, .3, M('#2f3a3a', .6, .4), 0, 2.62, 0, .01); cylAt(g, .16, .16, .04, M('#2f3a3a', .6, .4), 0, 2.97, 0, 8);
  const b = sph(.17, MG('#ffe3a0', 2.4)); b.position.y = 2.82; b.castShadow = false; g.add(b);
  return g;
}

function bench(x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  boxAt(g, 1.5, .08, .45, mOak, 0, .45, 0, .02); boxAt(g, 1.5, .5, .06, mOak, 0, .55, -.22, .02);
  [-.6, .6].forEach((dx) => boxAt(g, .08, .45, .4, mDark, dx, 0, 0, .01));
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

function shopFront(x, z, name = 'La Tinta y el Té') {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const W = 7.4, D = 6, H = 4.3;
  boxAt(g, W, H, D, M('#3f6b66', .9), 0, 0, 0, .04);
  boxAt(g, W + .3, .2, D + .3, M('#f0e6d2', .9), 0, H - .08, 0, .02);
  const rh = D * .3, slant = Math.hypot(D / 2 + .3, rh), ang = Math.atan2(rh, D / 2 + .3), rm = M('#5a3a2a', .85);
  [-1, 1].forEach((s) => { const r = box(W + .4, .16, slant, rm, .02); r.position.set(0, H + rh / 2 - .02, s * (D / 4 + .08)); r.rotation.x = s * ang; g.add(r); });
  boxAt(g, W + .1, rh * .9, .08, M('#3f6b66', .9), 0, H, D / 2 - .04, 0); boxAt(g, W + .1, rh * .9, .08, M('#3f6b66', .9), 0, H, -D / 2 + .04, 0);
  boxAt(g, .6, 1.3, .6, M('#8a6a5a', .95), -W * .3, H + rh * .35, -.5, .02);
  // escaparate grande con libros
  const front = D / 2 + .02;
  const win = (cx, own = false) => {
    boxAt(g, 2.2, 1.9, .1, mOak, cx, .75, front, .02);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.7), new THREE.MeshBasicMaterial(own ? { color: '#ffe3a8', transparent: true, opacity: .14 } : { color: '#ffe3a8' })); glass.position.set(cx, 1.6, front + (own ? .42 : .07)); g.add(glass);
    if (own) { const bp = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.7), M('#6a4a34', .9)); bp.position.set(cx, 1.6, front + .06); g.add(bp); [1.05, 1.5, 1.95].forEach((y) => boxAt(g, 1.96, .05, .4, mOak, cx, y, front + .08, .005)); }
    if (!own) for (let i = 0; i < 9; i++) { const bk = box(.16, .5 + (i % 3) * .1, .1, M(pick(['#c8566b', '#3a5a8a', '#e0a93b', '#5c9457', '#7a4aa6', '#a2453a']), .8), .01); bk.position.set(cx - .85 + i * .21, 1.0 + .3 + (i % 3) * .05, front + .1); g.add(bk); }
    boxAt(g, 2.2, .08, .3, mOak, cx, .7, front + .12, 0.01);
  };
  win(-2.3, true); win(2.3);
  g.userData.display = new THREE.Group(); g.add(g.userData.display);   // aquí se colocan los artículos del escaparate del jugador
  // puerta doble
  boxAt(g, 1.9, 2.5, .1, mDark, 0, 0, front, .02);
  [-1, 1].forEach((s) => { boxAt(g, .86, 2.3, .08, mPine, s * .47, .05, front + .06, .02); const gl = new THREE.Mesh(new THREE.PlaneGeometry(.55, 1.1), M('#bfe0ea', .15)); gl.position.set(s * .47, 1.45, front + .12); g.add(gl); });
  // toldo a rayas
  const aw = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f3e7c9' : '#c8566b'; c.fillRect(i * w / 8, 0, w / 8, h); } });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(W - .2, .12, 1.4), new THREE.MeshStandardMaterial({ map: aw, roughness: .9 })); awning.position.set(0, 3.0, front + .65); awning.rotation.x = .28; awning.castShadow = true; g.userData.awning = awning; g.add(awning);
  // rótulo
  const sign = canvasTex(512, 128, (c, w, h) => {
    c.fillStyle = '#4a2f24'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e3b04b'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#f6e3b0'; c.font = `700 ${name.length > 24 ? 30 : name.length > 16 ? 40 : 52}px Fraunces, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, w / 2, h / 2 - 8); c.font = '600 28px Caveat, cursive'; c.fillText('librería · desde 1982', w / 2, h - 24);
  });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(3.6, .9), new THREE.MeshStandardMaterial({ map: sign, roughness: .8 })); sp.position.set(0, 3.55, front + .1); g.add(sp);
  // mesa de libros y pizarra a la puerta, faroles de pared y jardineras bajo los escaparates
  g.add(bookStand(-2.3, front + 1.25)); g.add(chalkboard(1.6, front + 1.15, -.3));
  [-1, 1].forEach((s) => { const br = boxAt(g, .06, .06, .3, M('#2a2a2e', .6, .3), s * 1.15, 2.7, front + .15, .01); const ln = sph(.13, MG('#ffe3a0', 2.2)); ln.position.set(s * 1.15, 2.55, front + .32); g.add(ln); });
  [-2.3, 2.3].forEach((cx) => { boxAt(g, 2.0, .22, .3, M('#7a4a32', .9), cx, .45, front + .32, .02); for (let k = 0; k < 7; k++) { const fl = sph(.1, M(['#e8556b', '#f2b84a', '#fff2d6', '#c070c8', '#6aa55d'][k % 5], .8)); fl.position.set(cx - .85 + k * .28, .72, front + .36); g.add(fl); } });
  // macetas y cartel de pizarra
  [-1, 1].forEach((s) => { cylAt(g, .22, .17, .4, M('#c4704a', .85), s * 3.1, 0, front + .6, 12); const l = sph(.32, M('#5c9457', .9), 1, 1.1, 1); l.position.set(s * 3.1, .75, front + .6); g.add(l); });
  g.traverse((m) => { if (m.isMesh) { m.castShadow = m.castShadow ?? true; m.receiveShadow = true; } });
  return g;
}

export function buildTown(shopName) {
  const group = new THREE.Group();
  const W = 150, D = 100;
  // suelo: adoquín/hierba
  const grassTex = canvasTex(256, 256, (c, W2, H2) => { c.fillStyle = '#8fb56f'; c.fillRect(0, 0, W2, H2); for (let i = 0; i < 70; i++) { c.fillStyle = Math.random() < .5 ? 'rgba(110,160,80,.28)' : 'rgba(170,205,120,.25)'; c.beginPath(); c.ellipse(Math.random() * W2, Math.random() * H2, 8 + Math.random() * 22, 5 + Math.random() * 14, Math.random() * 3, 0, 7); c.fill(); } for (let i = 0; i < 1400; i++) { c.strokeStyle = Math.random() < .5 ? 'rgba(70,120,50,.35)' : 'rgba(200,225,150,.3)'; c.lineWidth = 1; const x0 = Math.random() * W2, y0 = Math.random() * H2; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + (Math.random() - .5) * 3, y0 - 3 - Math.random() * 3); c.stroke(); } });
  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping; grassTex.repeat.set(W / 7, D / 7);
  const ground = new THREE.Mesh(new THREE.BoxGeometry(W, .4, D), [M('#3a2a20'), M('#3a2a20'), new THREE.MeshStandardMaterial({ map: grassTex, roughness: 1 }), M('#2f2118'), M('#3a2a20'), M('#3a2a20')]);
  ground.position.y = -.2; ground.receiveShadow = true; group.add(ground);
  const strip = M('#f3e7c9', .9);
  const roadMat = (w, d) => new THREE.MeshStandardMaterial({ map: texAsphalt(w, d), roughness: .95 });
  const sideMat = (w, d) => new THREE.MeshStandardMaterial({ map: texPave(w, d), roughness: .95 });
  const flat = (w, d, mat, x, z, y = .015) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; group.add(m); return m; };
  // calles
  flat(W, 3.2, roadMat(W, 3.2), 0, 0); flat(3.2, D, roadMat(3.2, D), -13, 0); flat(3.2, D, roadMat(3.2, D), 13, 0);
  flat(W, 1.5, sideMat(W, 1.5), 0, -2.4, .02); flat(W, 1.5, sideMat(W, 1.5), 0, 2.4, .02); flat(1.5, D, sideMat(1.5, D), -10.6, 0, .02); flat(1.5, D, sideMat(1.5, D), 10.6, 0, .02); flat(1.5, D, sideMat(1.5, D), -15.4, 0, .02); flat(1.5, D, sideMat(1.5, D), 15.4, 0, .02);
  flat(W, 2.2, sideMat(W, 2.2), 0, -4.2, .02);
  // bordillos a lo largo de la calle principal
  [-1.65, 1.65].forEach((cz) => { const cb = box(W, .08, .12, M('#b5b0a6', .9), .01); cb.position.set(0, .04, cz); cb.receiveShadow = true; group.add(cb); });
  // líneas continuas en los bordes de la calzada
  [-1.5, 1.5].forEach((lz) => flat(W, .09, strip, 0, lz, .032));
  // alcantarillas
  [[-18, .7], [9, -.7], [27, .7]].forEach(([mx, mz]) => { const mh = cyl(.28, .28, .02, M('#3a3a42', .6, .4), 16); mh.position.set(mx, .035, mz); mh.receiveShadow = true; group.add(mh); const ring = cyl(.3, .3, .015, M('#55555e', .6, .4), 16); ring.position.set(mx, .03, mz); group.add(ring); });
  // pasos de cebra delante de la librería
  for (let k = -3; k <= 3; k++) flat(.5, 3.0, strip, 2.2 + k * .85, 0, .031);
  for (let x = -34; x < 34; x += 3) flat(1.3, .12, strip, x, 0, .03);
  // casas del lado norte, con la fachada hacia la calle; el hueco central es la librería
  const xs = [-33, -27.5, -22, -17.5, 0, 0];
  [[-33, 5.4, 4.6, 5], [-27.8, 4.8, 4.4, 3.8], [-21.2, 5.2, 4.8, 4.6], [17.6, 5.6, 4.6, 4.2], [23.4, 5, 4.4, 5.2], [29.2, 5.6, 4.8, 3.8], [34, 3, 4, 4]].forEach(([x, w, d, h]) => { if (x + w / 2 < W / 2) group.add(house(x, -4 - d / 2 - 1.2, w, d, h, { lit: .5 })); });
  group.add(house(-6.6, -4 - 2.2 - 1.2, 5.2, 4.4, 4.6, { lit: .55 }));
  group.add(house(10.3 + 0, -4 - 2.4 - 1.2 - .2, 3.6, 4.8, 3.6, { lit: .4 }));
  const shop = shopFront(2.2, -4 - 3 - 1.2, shopName); group.add(shop);
  // segunda fila de casas detrás
  [[-30, 6, 5, 5.5], [-20.5, 6, 5, 4.6], [-6, 6.4, 5, 6], [2, 6, 5, 5], [10, 5, 5, 6.2], [22, 6, 5, 5], [30, 5.4, 5, 5.5]].forEach(([x, w, d, h]) => group.add(house(x, -4 - 10.5 - d / 2, w, d, h, { lit: .35, noDoor: true })));
  // lado sur: parque, plaza y algún edificio visto de espaldas
  const plaza = cyl(5.2, 5.4, .1, M('#d6c9b0', .95), 36); plaza.position.set(0, .05, 11); plaza.receiveShadow = true; group.add(plaza);
  const ring = cyl(1.9, 2, .45, M('#b8b0a0', .9), 28); ring.position.set(0, .22, 11); ring.castShadow = true; group.add(ring);
  const water = cyl(1.65, 1.65, .12, M('#7cc7e0', .15), 28); water.position.set(0, .46, 11); water.material.transparent = true; water.material.opacity = .9; group.add(water);
  cylAt(group, .22, .3, 1.5, M('#b8b0a0', .9), 0, .3, 11, 12); const top = sph(.38, M('#b8b0a0', .9), 1, .7, 1); top.position.set(0, 1.9, 11); group.add(top);
  [[-4.2, 11, Math.PI / 2], [4.2, 11, -Math.PI / 2], [0, 15, Math.PI], [0, 7.2, 0]].forEach(([x, z, r]) => group.add(bench(x, z, r)));
  group.add(flowerBed(0, 11, 6.3, 34)); group.add(flowerBed(0, 11, 6.7, 40, .07));
  [[-6.6, 8.6], [6.6, 8.6], [-6.8, 13.6], [6.8, 13.6]].forEach(([bx, bz]) => group.add(bush(bx, bz, 1.5, '#4f8a52')));
  for (let k = 0; k < 30; k++) { const ang = rnd() * 6.28, rr = 8 + rnd() * 9; const px = Math.cos(ang) * rr, pz = 11 + Math.sin(ang) * rr; if (pz < 6.3 || Math.abs(px) > 28) continue; group.add(flowerBed(px, pz, .3 + rnd() * .3, 5)); }
  [[-13.8, 4.5], [13.8, 4.5], [-8, 5.2], [8.5, 5.2]].forEach(([bx, bz]) => group.add(bush(bx, bz, 1.2)));
  group.add(hydrant(5.4, -3.3)); group.add(hydrant(-9, -3.3)); group.add(busStop(-9.4, -3.9, 0)); group.add(busStop(16.4, 3.4, Math.PI));
  for (let i = 0; i < 18; i++) { const x = -32 + rnd() * 64, z = 8 + rnd() * 14; if (Math.abs(x) < 8 && z < 17) continue; if (Math.abs(x - 13) < 2.4 || Math.abs(x + 13) < 2.4) continue; group.add(tree(x, z, .8 + rnd() * .5)); }
  for (let x = -30; x <= 30; x += 6) { if (Math.abs(Math.abs(x) - 13) < 2) continue; group.add(tree(x, 4.4, .75)); }
  // farolas y árboles de la acera
  for (let x = -33; x <= 33; x += 8) { if (Math.abs(Math.abs(x) - 13) < 2.5) continue; group.add(lamp(x, -2.9)); }
  [[-15, 22], [15, 22], [-34, 6], [34, 6]].forEach(([x, z]) => group.add(tree(x, z, 1.1)));
  // árboles lejanos para que no se vea el borde del mundo
  for (let i = 0; i < 90; i++) { const x = -72 + rnd() * 144, z = -48 + rnd() * 96; if (Math.abs(x) < 38 && z > -26 && z < 26) continue; group.add(tree(x, z, .9 + rnd() * .8)); }
  // coches aparcados (solo en el carril de arriba: el camión de Rodeos usa el de abajo), buzones y papeleras
  [[-21, 1.1, 0, '#c8566b'], [-5, 1.1, 0, '#3a5a8a'], [24, 1.1, 0, '#e0a93b']].forEach(([x, z, ry, col]) => group.add(car(x, z, ry, col)));
  [[-3.4, -3.2], [7.5, -3.2], [-18, -3.2]].forEach(([x, z]) => group.add(mailbox(x, z)));
  [[11.5, -3.3], [-12.2, -3.3], [-24, -3.3]].forEach(([x, z]) => group.add(bin(x, z)));
  // luz cálida del escaparate
  const glow = new THREE.PointLight('#ffc27a', 14, 12, 2); glow.position.set(2.2, 2, -4 - 1.2 + .4); group.add(glow);
  // rutas para los paseantes (aceras): de punta a punta
  const walks = [[-30, 2.4, 30, 2.4], [30, -2.5, -30, -2.5], [-10.6, -18, -10.6, 20], [10.6, 20, 10.6, -18], [-28, 3, -8, 3], [28, -2, 8, -2]];
  return { shop, group, doorX: 2.2, doorZ: -4 - 1.2 + .4, size: { w: W, d: D }, walks, glow };
}
