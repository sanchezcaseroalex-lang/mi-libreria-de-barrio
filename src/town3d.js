// El barrio de la librería en 3D: calles, casas, árboles, farolas, plaza con fuente y la fachada de "La Tinta y el Té".
import { THREE, M, MT, MG, box, boxAt, cyl, cylAt, sph, canvasTex, mulberry32, mOak, mDark, mPine } from './kit3d.js';

const rnd = mulberry32(77);
const pick = (a) => a[Math.floor(rnd() * a.length)];

const FACADES = ['#e8c9a0', '#d9a5a0', '#c9d8c0', '#b9cfd9', '#e8d9a0', '#d9b9a0', '#cfc0dd', '#f0d4b8', '#c0cfa8'];
const ROOFS = ['#9a4a3a', '#7a4a3a', '#5a5a66', '#8a5a3a', '#6a3a3a'];

function house(x, z, w, d, h, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  const wall = M(o.color ?? pick(FACADES), .95);
  boxAt(g, w, h, d, wall, 0, 0, 0, 0.04);
  boxAt(g, w + .12, .16, d + .12, M('#e8e0d0', .9), 0, h - .06, 0, .02);           // cornisa
  // tejado a dos aguas con la cumbrera a lo largo de x
  const rh = d * .34, slant = Math.hypot(d / 2 + .25, rh), ang = Math.atan2(rh, d / 2 + .25), roofM = M(o.roof ?? pick(ROOFS), .85);
  [-1, 1].forEach((s) => { const r = box(w + .3, .14, slant, roofM, .02); r.position.set(0, h + rh / 2 - .02, s * (d / 4 + .06)); r.rotation.x = s * ang; g.add(r); });
  boxAt(g, w + .1, rh * .9, .08, wall, 0, h, d / 2 - .04, 0);                         // frontón delantero
  boxAt(g, w + .1, rh * .9, .08, wall, 0, h, -d / 2 + .04, 0);
  if (o.chimney !== false) { boxAt(g, .45, 1.1, .45, M('#8a6a5a', .95), w * .28, h + rh * .3, -d * .15, 0.02); }
  // ventanas en la cara +z y puerta
  const floors = Math.max(1, Math.round(h / 2));
  const cols = Math.max(1, Math.floor(w / 1.7));
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const wx = -w / 2 + (c + .5) * (w / cols), wy = .6 + f * (h / floors) + (f === 0 ? .1 : 0);
    if (f === 0 && c === Math.floor(cols / 2) && !o.noDoor) continue;
    boxAt(g, .72, .9, .06, mOak, wx, wy, d / 2 + .02, 0.01);
    const lit = rnd() < (o.lit ?? .45);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(.58, .76), lit ? new THREE.MeshBasicMaterial({ color: '#ffd98a' }) : M('#a9c8d6', .2));
    gl.position.set(wx, wy + .45, d / 2 + .06); g.add(gl);
    boxAt(g, .9, .08, .14, M('#d8d0c0', .9), wx, wy - .05, d / 2 + .08, 0);
  }
  if (!o.noDoor) { boxAt(g, .9, 1.55, .08, mPine, 0, 0, d / 2 + .02, 0.02); boxAt(g, 1.3, .1, .3, M('#d8d0c0', .9), 0, 1.6, d / 2 + .12, 0.02); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

function tree(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  cylAt(g, .12 * s, .17 * s, 1.2 * s, M('#6a4a32', .95), 0, 0, 0, 8);
  const cols = ['#5c9457', '#6aa55d', '#4f8a52', '#7fb869', '#c98f4a'];
  const c = pick(cols);
  for (let i = 0; i < 3; i++) { const cr = sph((.9 - i * .15) * s, M(c, .9), 1, .9, 1); cr.position.set((rnd() - .5) * .3 * s, (1.5 + i * .6) * s, (rnd() - .5) * .3 * s); g.add(cr); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

function lamp(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  cylAt(g, .05, .07, 2.6, M('#2f3a3a', .6, .4), 0, 0, 0, 8);
  const b = sph(.17, MG('#ffe3a0', 2.4)); b.position.y = 2.7; b.castShadow = false; g.add(b);
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
  const win = (cx) => {
    boxAt(g, 2.2, 1.9, .1, mOak, cx, .75, front, .02);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.7), new THREE.MeshBasicMaterial({ color: '#ffe3a8' })); glass.position.set(cx, 1.6, front + .07); g.add(glass);
    for (let i = 0; i < 9; i++) { const bk = box(.16, .5 + (i % 3) * .1, .1, M(pick(['#c8566b', '#3a5a8a', '#e0a93b', '#5c9457', '#7a4aa6', '#a2453a']), .8), .01); bk.position.set(cx - .85 + i * .21, 1.0 + .3 + (i % 3) * .05, front + .1); g.add(bk); }
    boxAt(g, 2.2, .08, .3, mOak, cx, .7, front + .12, 0.01);
  };
  win(-2.3); win(2.3);
  // puerta doble
  boxAt(g, 1.9, 2.5, .1, mDark, 0, 0, front, .02);
  [-1, 1].forEach((s) => { boxAt(g, .86, 2.3, .08, mPine, s * .47, .05, front + .06, .02); const gl = new THREE.Mesh(new THREE.PlaneGeometry(.55, 1.1), M('#bfe0ea', .15)); gl.position.set(s * .47, 1.45, front + .12); g.add(gl); });
  // toldo a rayas
  const aw = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f3e7c9' : '#c8566b'; c.fillRect(i * w / 8, 0, w / 8, h); } });
  const awning = new THREE.Mesh(new THREE.BoxGeometry(W - .2, .12, 1.4), new THREE.MeshStandardMaterial({ map: aw, roughness: .9 })); awning.position.set(0, 3.0, front + .65); awning.rotation.x = .28; awning.castShadow = true; g.add(awning);
  // rótulo
  const sign = canvasTex(512, 128, (c, w, h) => {
    c.fillStyle = '#4a2f24'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e3b04b'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#f6e3b0'; c.font = `700 ${name.length > 24 ? 30 : name.length > 16 ? 40 : 52}px Fraunces, serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(name, w / 2, h / 2 - 8); c.font = '600 28px Caveat, cursive'; c.fillText('librería · desde 1982', w / 2, h - 24);
  });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(3.6, .9), new THREE.MeshStandardMaterial({ map: sign, roughness: .8 })); sp.position.set(0, 3.55, front + .1); g.add(sp);
  // macetas y cartel de pizarra
  [-1, 1].forEach((s) => { cylAt(g, .22, .17, .4, M('#c4704a', .85), s * 3.1, 0, front + .6, 12); const l = sph(.32, M('#5c9457', .9), 1, 1.1, 1); l.position.set(s * 3.1, .75, front + .6); g.add(l); });
  g.traverse((m) => { if (m.isMesh) { m.castShadow = m.castShadow ?? true; m.receiveShadow = true; } });
  return g;
}

export function buildTown(shopName) {
  const group = new THREE.Group();
  const W = 150, D = 100;
  // suelo: adoquín/hierba
  const ground = new THREE.Mesh(new THREE.BoxGeometry(W, .4, D), [M('#3a2a20'), M('#3a2a20'), M('#8fb56f', 1), M('#2f2118'), M('#3a2a20'), M('#3a2a20')]);
  ground.position.y = -.2; ground.receiveShadow = true; group.add(ground);
  const road = M('#4b4a52', .95), side = M('#d8cbb3', .95), strip = M('#f3e7c9', .9);
  const flat = (w, d, mat, x, z, y = .015) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; group.add(m); return m; };
  // calles
  flat(W, 3.2, road, 0, 0); flat(3.2, D, road, -13, 0); flat(3.2, D, road, 13, 0);
  flat(W, 1.5, side, 0, -2.4, .02); flat(W, 1.5, side, 0, 2.4, .02); flat(1.5, D, side, -10.6, 0, .02); flat(1.5, D, side, 10.6, 0, .02); flat(1.5, D, side, -15.4, 0, .02); flat(1.5, D, side, 15.4, 0, .02);
  flat(W, 2.2, side, 0, -4.2, .02);
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
  for (let i = 0; i < 18; i++) { const x = -32 + rnd() * 64, z = 8 + rnd() * 14; if (Math.abs(x) < 8 && z < 17) continue; if (Math.abs(x - 13) < 2.4 || Math.abs(x + 13) < 2.4) continue; group.add(tree(x, z, .8 + rnd() * .5)); }
  for (let x = -30; x <= 30; x += 6) { if (Math.abs(Math.abs(x) - 13) < 2) continue; group.add(tree(x, 4.4, .75)); }
  // farolas y árboles de la acera
  for (let x = -33; x <= 33; x += 8) { if (Math.abs(Math.abs(x) - 13) < 2.5) continue; group.add(lamp(x, -2.9)); }
  [[-15, 22], [15, 22], [-34, 6], [34, 6]].forEach(([x, z]) => group.add(tree(x, z, 1.1)));
  // árboles lejanos para que no se vea el borde del mundo
  for (let i = 0; i < 90; i++) { const x = -72 + rnd() * 144, z = -48 + rnd() * 96; if (Math.abs(x) < 38 && z > -26 && z < 26) continue; group.add(tree(x, z, .9 + rnd() * .8)); }
  // luz cálida del escaparate
  const glow = new THREE.PointLight('#ffc27a', 14, 12, 2); glow.position.set(2.2, 2, -4 - 1.2 + .4); group.add(glow);
  // rutas para los paseantes (aceras): de punta a punta
  const walks = [[-30, 2.4, 30, 2.4], [30, -2.5, -30, -2.5], [-10.6, -18, -10.6, 20], [10.6, 20, 10.6, -18], [-28, 3, -8, 3], [28, -2, 8, -2]];
  return { group, doorX: 2.2, doorZ: -4 - 1.2 + .4, size: { w: W, d: D }, walks, glow };
}
