// Cajas de cartón en 3D para los minijuegos de abrir pedidos y empaquetar: cúter, cinta, libros dentro, papel de relleno y etiqueta.
import { THREE, canvasTex, woodTex, displayBook } from './kit3d.js';
import { BOOK } from './books.js';
import { sfx } from './audio.js';
import { coverSVG } from './art.js';
import { rodeosCanvas } from './rodeos.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < .5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
const easeOutBack = (t) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * ((t - 1) ** 3) + c1 * ((t - 1) ** 2); };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Materiales ---------- */

function cardboardTex(inner = false) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = inner ? '#a97d4c' : '#c9a06a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(90,55,20,${.05 + (y % 8 ? 0 : .05)})`; g.fillRect(0, y, w, 2); }
    for (let i = 0; i < 2200; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(255,240,200,.07)' : 'rgba(70,40,15,.08)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1); }
  }, [1.5, 1.5]);
}
const matOuter = () => new THREE.MeshStandardMaterial({ map: cardboardTex(false), roughness: .92 });
const matInner = () => new THREE.MeshStandardMaterial({ map: cardboardTex(true), roughness: .95 });
const matEdge = () => new THREE.MeshStandardMaterial({ color: '#8c6338', roughness: .9 });

function printedTex(L, D) {
  // tinta de la caja: flechas "este lado hacia arriba" y rótulo de libros frágiles
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#c9a06a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(90,55,20,${.05 + (y % 8 ? 0 : .05)})`; g.fillRect(0, y, w, 2); }
    for (let i = 0; i < 3200; i++) { g.fillStyle = Math.random() < .5 ? 'rgba(255,240,200,.07)' : 'rgba(70,40,15,.08)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1); }
    g.fillStyle = 'rgba(60,35,15,.75)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '800 34px Nunito, sans-serif'; g.fillText('LIBROS · FRÁGIL', w / 2, h / 2 - 12);
    g.font = '700 18px Nunito, sans-serif'; g.fillText('Manipular con cuidado', w / 2, h / 2 + 22);
    const arrow = (x) => { g.beginPath(); g.moveTo(x, 40); g.lineTo(x + 22, 74); g.lineTo(x + 9, 74); g.lineTo(x + 9, 110); g.lineTo(x - 9, 110); g.lineTo(x - 9, 74); g.lineTo(x - 22, 74); g.closePath(); g.fill(); };
    arrow(70); arrow(w - 70);
    g.fillRect(w / 2 - 70, h - 54, 140, 4); g.fillRect(w / 2 - 54, h - 44, 108, 3);
  });
}

/* ---------- Escena base: mesa, luces, cámara y caja ---------- */

function createStage(host, { L = 1.6, D = .62, H = .8, minDist = 5.4, look = .45 } = {}) {
  const T = .035;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none';
  host.append(canvas);
  const W0 = host.clientWidth || 360, H0 = host.clientHeight || 380;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(W0, H0, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#6a4a32');
  const camera = new THREE.PerspectiveCamera(36, W0 / H0, .1, 60);
  const fitCam = () => {
    const w = host.clientWidth || W0, h = host.clientHeight || H0;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const dist = Math.max(minDist, (L + .9) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect) * 1.08);
    camera.position.set(0, dist * .88, dist * .48); camera.lookAt(0, .35, look); camera.updateProjectionMatrix();
  };
  fitCam();
  scene.add(new THREE.HemisphereLight('#fff3dc', '#5a3a22', 1.25));
  const sun = new THREE.DirectionalLight('#fff0d4', 2.6); sun.position.set(3, 7, 4); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 20 }); sun.shadow.bias = -.0006; scene.add(sun);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshStandardMaterial({ map: woodTex('#8a5e3a', '#4a2f1c', [3, 3]), roughness: .75 }));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);

  // caja
  const root = new THREE.Group(); scene.add(root);
  const outer = matOuter(), inner = matInner(), edge = matEdge();
  const front = new THREE.MeshStandardMaterial({ map: printedTex(L, D), roughness: .92 });
  const mk = (w, h, d, mats, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; root.add(m); return m; };
  const Lo = L + 2 * T, Do = D + 2 * T;
  mk(Lo, T, Do, [edge, edge, inner, outer, outer, outer], 0, T / 2, 0);                                    // fondo
  mk(Lo, H, T, [edge, edge, edge, edge, front, inner], 0, H / 2, Do / 2 - T / 2);                          // frente
  mk(Lo, H, T, [edge, edge, edge, edge, inner, outer], 0, H / 2, -Do / 2 + T / 2);                          // trasera
  mk(T, H, Do - 2 * T, [outer, inner, edge, edge, edge, edge], Lo / 2 - T / 2, H / 2, 0);                  // lado derecho
  mk(T, H, Do - 2 * T, [inner, outer, edge, edge, edge, edge], -Lo / 2 + T / 2, H / 2, 0);                 // lado izquierdo
  // solapas: pivotan en el borde superior de cada pared
  const flapMats = [edge, edge, outer, inner, edge, edge];
  const mkFlap = (len, wid, pivotPos, axis) => {
    const pv = new THREE.Group(); pv.position.copy(pivotPos); root.add(pv);
    const m = new THREE.Mesh(new THREE.BoxGeometry(axis === 'x' ? wid : len, .02, axis === 'x' ? len : wid), flapMats);
    m.castShadow = m.receiveShadow = true; pv.add(m); return { pv, m };
  };
  const mainLen = Do / 2 - .004, minorLen = Do / 2 - .03;
  const fF = mkFlap(mainLen, Lo, new THREE.Vector3(0, H, Do / 2 - .002), 'x'); fF.m.position.z = -mainLen / 2; fF.pv.position.y = H + .022;
  const fB = mkFlap(mainLen, Lo, new THREE.Vector3(0, H, -Do / 2 + .002), 'x'); fB.m.position.z = mainLen / 2; fB.pv.position.y = H + .022;
  const fR = mkFlap(minorLen, Do - .02, new THREE.Vector3(Lo / 2 - .002, H, 0), 'z'); fR.m.position.x = -minorLen / 2;
  const fL = mkFlap(minorLen, Do - .02, new THREE.Vector3(-Lo / 2 + .002, H, 0), 'z'); fL.m.position.x = minorLen / 2;
  fR.m.geometry.dispose(); fL.m.geometry.dispose();
  fR.m.geometry = new THREE.BoxGeometry(minorLen, .02, Do - .02); fL.m.geometry = new THREE.BoxGeometry(minorLen, .02, Do - .02);
  const OPEN_MAJOR = 1.72, OPEN_MINOR = 1.5;
  let closeP = 0;
  const setClose = (p) => {
    closeP = p;
    const minor = lerp(OPEN_MINOR, 0, easeInOut(clamp(p / .55, 0, 1)));
    const major = lerp(OPEN_MAJOR, 0, easeInOut(clamp((p - .35) / .65, 0, 1)));
    fF.pv.rotation.x = major; fB.pv.rotation.x = -major;
    fR.pv.rotation.z = -minor; fL.pv.rotation.z = minor;
  };
  setClose(0);

  const tweens = [];
  const tween = (dur, fn, done) => tweens.push({ t0: performance.now(), dur, fn, done });
  let raf = 0, ticks = [];
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i], p = clamp((now - tw.t0) / tw.dur, 0, 1);
      tw.fn(p);
      if (p >= 1) { tweens.splice(i, 1); tw.done?.(); }
    }
    ticks.forEach((f) => f(now));
    renderer.render(scene, camera);
  };
  loop();

  const ray = new THREE.Raycaster();
  const ndc = (e) => { const r = canvas.getBoundingClientRect(); return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
  const rayPlane = (e, y) => { ray.setFromCamera(ndc(e), camera); const d = ray.ray.direction; if (Math.abs(d.y) < 1e-4) return null; const t = (y - ray.ray.origin.y) / d.y; return t > 0 ? ray.ray.origin.clone().addScaledVector(d, t) : null; };
  const pick = (e, objs) => { ray.setFromCamera(ndc(e), camera); const hits = ray.intersectObjects(objs, true); return hits[0] ?? null; };
  const ro = new ResizeObserver(fitCam); ro.observe(host);

  return {
    THREE, renderer, scene, camera, canvas, root, dims: { L, D, H, T, Lo, Do }, setClose, get closeP() { return closeP; }, tween, tweens, rayPlane, pick, ray, ndc,
    near(e, objs, px = 60) {
      const r = canvas.getBoundingClientRect(); let best = null, bd = px;
      for (const o of objs) { const v = o.position.clone().project(camera); const d = Math.hypot(e.clientX - (r.left + (v.x + 1) / 2 * r.width), e.clientY - (r.top + (1 - v.y) / 2 * r.height)); if (d < bd) { bd = d; best = o; } }
      return best;
    },
    addTick: (f) => ticks.push(f),
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); canvas.remove(); },
  };
}

/* ---------- Objetos ---------- */

const thick = (id) => .1 + (BOOK[id].w - 9) * .03;               // grosor del libro en la escena
const BK = { W: .5, H: .7 };

function bookObj(id, scene, THREE) {
  const g = displayBook(BOOK[id], BK.W, BK.H, thick(id));
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  const o = new THREE.Group(); o.add(g); o.userData.item = { kind: 'book', id }; scene.add(o);
  return o;
}
// tumbado: cubierta hacia arriba
const layBook = (o, x, y, z, rot = 0) => { o.rotation.set(-Math.PI / 2, 0, rot); o.position.set(x, y, z); };
// de pie: lomo hacia el frente, cubiertas mirando a los lados
const standBook = (o, x, y, z) => { o.rotation.set(0, Math.PI / 2, 0); o.position.set(x, y, z); };

// Papel de embalaje arrugado: una pieza grande y con bultos que luego se ajusta al hueco de la caja
function crumpledPaper(THREE, scene) {
  let geo = new THREE.IcosahedronGeometry(.34, 2);
  const pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const k = .78 + Math.random() * .44; pos.setXYZ(i, v.x * k, v.y * k, v.z * k); }
  geo = geo.toNonIndexed();
  geo.computeBoundingBox();
  { const bb = geo.boundingBox, c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3()), P = geo.attributes.position;
    for (let i = 0; i < P.count; i++) P.setXYZ(i, (P.getX(i) - c.x) / sz.x, (P.getY(i) - c.y) / sz.y, (P.getZ(i) - c.z) / sz.z); }
  geo.computeVertexNormals();
  const col = new Float32Array(geo.attributes.position.count * 3);
  for (let f = 0; f < col.length / 9; f++) { const t = .8 + Math.random() * .3; for (let k = 0; k < 3; k++) { col[f * 9 + k * 3] = .78 * t; col[f * 9 + k * 3 + 1] = .58 * t; col[f * 9 + k * 3 + 2] = .36 * t; } }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
  m.castShadow = m.receiveShadow = true;
  const o = new THREE.Group(); o.add(m); o.userData.item = { kind: 'paper' }; o.userData.mesh = m; scene.add(o);
  return o;
}

function tapeTexture(prog = 0) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 64;
  const g = c.getContext('2d');
  const draw = (p) => {
    g.clearRect(0, 0, 512, 64);
    const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#caa05a'); gr.addColorStop(.35, '#e6c487'); gr.addColorStop(.6, '#d5ad67'); gr.addColorStop(1, '#b98f4c');
    g.fillStyle = gr; g.fillRect(0, 4, 512, 56);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 12, 512, 4);
    for (let x = 0; x < 512; x += 3) { g.fillStyle = `rgba(120,80,30,${Math.random() * .08})`; g.fillRect(x, 4, 1, 56); }
    g.fillStyle = 'rgba(11,42,107,.55)'; g.font = '800 20px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let x = 64; x < 512; x += 170) g.fillText('RODEOS EXPRESS', x, 33);
    if (p > 0) {
      const w = Math.floor(p * 512);
      g.fillStyle = '#2a1a0d'; g.fillRect(0, 29, w, 6);                                   // corte
      g.fillStyle = '#f3e3bf'; g.fillRect(0, 26, w, 3); g.fillRect(0, 35, w, 3);          // bordes de cinta levantados
      g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 38, w, 4);
    }
  };
  draw(prog);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return { tex: t, draw: (p) => { draw(p); t.needsUpdate = true; } };
}

function cutterObj() {
  const g = new THREE.Group();
  const hm = new THREE.MeshStandardMaterial({ color: '#f2b705', roughness: .5 }), dk = new THREE.MeshStandardMaterial({ color: '#2b2b2e', roughness: .6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(.9, .13, .22), hm); body.position.set(.2, 0, 0); g.add(body);
  const band = new THREE.Mesh(new THREE.BoxGeometry(.5, .135, .225), dk); band.position.set(.28, 0, 0); g.add(band);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(.34, .015, .12), new THREE.MeshStandardMaterial({ color: '#e8e8ee', metalness: .9, roughness: .25 }));
  blade.position.set(-.42, -.07, 0); blade.rotation.z = -.25; g.add(blade);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(.05, .1, 3), blade.material); tip.rotation.z = Math.PI / 2 + .25; tip.position.set(-.6, -.12, 0); g.add(tip);
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g;
}

function tapeRollObj() {
  const g = new THREE.Group();
  const tape = new THREE.Mesh(new THREE.CylinderGeometry(.26, .26, .2, 28, 1, true), new THREE.MeshStandardMaterial({ color: '#d9b36b', roughness: .35, metalness: .1, side: THREE.DoubleSide }));
  const core = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, .21, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#8c6338', roughness: .9, side: THREE.DoubleSide }));
  const capm = new THREE.MeshStandardMaterial({ color: '#cfa660', roughness: .5 });
  [-.1, .1].forEach((y) => { const ring = new THREE.Mesh(new THREE.RingGeometry(.17, .26, 28), capm); ring.rotation.x = -Math.PI / 2 * (y < 0 ? -1 : 1); ring.position.y = y; g.add(ring); });
  g.add(tape, core); g.rotation.z = Math.PI / 2; g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  const o = new THREE.Group(); o.add(g); o.userData.roll = g;
  return o;
}

function labelTexture(who, shop) {
  return canvasTex(320, 200, (g, w, h) => {
    g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#222'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#222'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.font = '800 17px Nunito, sans-serif'; g.fillText(String(shop).toUpperCase().slice(0, 20), 18, 36);
    g.drawImage(rodeosCanvas(220, 62), w - 118, 10, 106, 30);
    g.font = '700 16px Nunito, sans-serif'; g.fillStyle = '#666'; g.fillText('PARA:', 18, 66);
    g.fillStyle = '#111'; g.font = '800 34px Fraunces, serif'; g.fillText(String(who).slice(0, 14), 18, 108);
    g.fillStyle = '#999'; g.fillRect(18, 122, 200, 6); g.fillRect(18, 136, 150, 6);
    for (let x = 18, i = 0; x < w - 24; i++) { const bw = 2 + (i * 7 % 4); g.fillStyle = '#111'; g.fillRect(x, 154, bw, 30); x += bw + 2 + (i * 5 % 3); }
  });
}

/* ---------- Estructura común del minijuego ---------- */

function overlay(title, help, okLabel, withAll = false) {
  const root = document.createElement('div');
  root.id = 'mini'; root.className = 'bx-ov';
  root.innerHTML = `<div class="mini-wrap bx-wrap"><header><div><p class="kick">Minijuego</p><h2>${esc(title)}</h2><p class="muted bx-help">${esc(help)}</p></div><button type="button" class="x" data-quit aria-label="Salir">×</button></header>
    <div class="bx-stage"></div><footer class="bx-foot">${withAll ? '<button type="button" class="btn small ghost bx-all" data-all>Abrir todas las cajas de golpe</button>' : ''}<span class="bx-hint"></span><button type="button" class="btn primary" data-ok disabled>${esc(okLabel)}</button></footer></div>`;
  document.body.append(root);
  return { root, stage: root.querySelector('.bx-stage'), help: root.querySelector('.bx-help'), hint: root.querySelector('.bx-hint'), ok: root.querySelector('[data-ok]'), quit: root.querySelector('[data-quit]'), all: root.querySelector('[data-all]') };
}
const flash = (el) => { el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); };

/* ---------- Abrir la caja recibida ---------- */

export function runOpenBox({ items, hard = false, buzz = null, others = 0 }) {
  return new Promise((resolve) => {
    const ui = overlay('Abre la caja', hard ? 'Pasa el cúter por la cinta, de lado a lado, sin salirte de la línea.' : 'Pasa el dedo por la cinta: el cúter la corta.', 'Guardar todo en el almacén', others > 0);
    const n = items.length;
    const sumT = items.reduce((t, id) => t + thick(id), 0);
    const L = Math.max(1.2, sumT + .3);
    const st = createStage(ui.stage, { L, D: .62, H: .8, minDist: 3.5, look: .08 });
    const { THREE: TH, scene, dims } = st;
    st.setClose(1);
    const Ytape = dims.H + .05;
    const tape = tapeTexture(0);
    const tapeMat = new TH.MeshStandardMaterial({ map: tape.tex, transparent: true, roughness: .3, metalness: .1 });
    const tapeMesh = new TH.Mesh(new TH.PlaneGeometry(dims.Lo, .22), tapeMat);
    tapeMesh.rotation.x = -Math.PI / 2; tapeMesh.position.y = Ytape - .012; tapeMesh.receiveShadow = true; scene.add(tapeMesh);
    // la cinta también baja por los dos lados
    [-1, 1].forEach((s) => { const w = new TH.Mesh(new TH.PlaneGeometry(.22, .3), tapeMat); w.position.set(s * (dims.Lo / 2 + .003), dims.H - .114, 0); w.rotation.y = s * Math.PI / 2; scene.add(w); });
    const cutter = cutterObj(); cutter.scale.setScalar(.62); cutter.position.set(-dims.L / 2 - .6, Ytape + .25, .35); cutter.rotation.set(0, 0, .12); scene.add(cutter);

    // libros ya dentro (se ven al abrir)
    const slots = []; let x = -dims.L / 2 + .02;
    const books = items.map((id) => {
      const t = thick(id), o = bookObj(id, scene, TH);
      standBook(o, x + t / 2, dims.T, 0); x += t + .01; o.visible = false; slots.push(o); return o;
    });
    let stage = 'cut', prog = 0, lastX = null, down = false, tx = -dims.L / 2 - .6, taken = 0, finished = false;
    const target = new TH.Vector3(tx, Ytape + .25, .35);
    st.addTick(() => { cutter.position.lerp(target, .35); });

    const onDown = (e) => {
      if (stage === 'cut') { down = true; lastX = null; st.canvas.setPointerCapture(e.pointerId); onMove(e); return; }
      if (stage === 'take') {
        const hit = st.pick(e, books.filter((b) => b.visible && !b.userData.gone));
        if (!hit) return;
        let o = hit.object; while (o && !o.userData.item) o = o.parent;
        if (!o || o.userData.gone) return;
        o.userData.gone = true; sfx('place'); buzz?.(15);
        const y0 = o.position.y, z0 = o.position.z;
        st.tween(520, (p) => { o.position.y = y0 + easeInOut(p) * 2.2; o.position.z = z0 + p * 1.2; o.scale.setScalar(1 - p * .35); }, () => { o.visible = false; });
        taken++;
        stage = 'reveal';
        const bk = BOOK[o.userData.item.id];
        const rv = document.createElement('div'); rv.className = 'bx-reveal';
        rv.innerHTML = `<div class="card">${coverSVG(bk, 120, 180)}<b>${esc(bk.title)}</b><small>${esc(bk.author)}</small><button type="button" class="btn primary small">${taken >= n ? '¡Perfecto!' : 'Siguiente'}</button></div>`;
        setTimeout(() => {
          ui.stage.append(rv);
          const close = () => { rv.remove(); stage = 'take'; ui.hint.textContent = n - taken ? `Faltan ${n - taken}` : '¡Todos fuera!'; if (taken >= n) { ui.ok.disabled = false; ui.help.textContent = 'Todo fuera. Guarda los libros en el almacén.'; } };
          rv.addEventListener('click', close);
        }, 450);
      }
    };
    const onMove = (e) => {
      if (stage !== 'cut' || !down) return;
      const p = st.rayPlane(e, Ytape); if (!p) return;
      const cx = clamp(p.x, -dims.Lo / 2 - .5, dims.Lo / 2 + .5);
      target.set(cx - 0.0, Ytape + .12, clamp(p.z, -.4, .4) + .05);
      if (hard && Math.abs(p.z) > .2 && cx > -dims.Lo / 2 && cx < dims.Lo / 2) { prog = 0; lastX = null; tape.draw(0); flash(ui.hint); ui.hint.textContent = '¡Sigue la línea!'; buzz?.(40); sfx('error'); return; }
      const f = (cx + dims.Lo / 2) / dims.Lo;
      if (lastX != null && Math.abs(f - lastX) < .35 && f > prog) { prog = f; tape.draw(clamp(prog, 0, 1)); if (Math.random() < .25) sfx('page'); }
      lastX = f;
      ui.hint.textContent = `${Math.round(clamp(prog, 0, 1) * 100)} %`;
      if (prog >= .97) { down = false; stage = 'opening'; tape.draw(1); sfx('page'); buzz?.(50); open(); }
    };
    const open = () => {
      target.set(dims.Lo / 2 + .9, Ytape + .5, .6);
      st.tween(500, (p) => { tapeMat.opacity = 1 - p; });
      st.tween(900, (p) => { st.setClose(1 - clamp(easeOutBack(p), 0, 1.05)); }, () => {
        scene.children.filter((c) => c.geometry && c.geometry.type === 'PlaneGeometry' && c !== tapeMesh && c.material === tapeMat).forEach((c) => { c.visible = false; });
        tapeMesh.visible = false; books.forEach((b) => { b.visible = true; });
        stage = 'take'; ui.help.textContent = 'Toca cada libro para sacarlo de la caja.'; ui.hint.textContent = `Faltan ${n}`;
        st.tween(300, (p) => { cutter.position.x += p * .08; });
      });
    };
    st.canvas.addEventListener('pointerdown', onDown);
    st.canvas.addEventListener('pointermove', onMove);
    st.canvas.addEventListener('pointerup', () => { down = false; });
    st.canvas.addEventListener('pointercancel', () => { down = false; });
    const end = (v) => { if (finished) return; finished = true; st.dispose(); ui.root.remove(); resolve(v); };
    ui.quit.onclick = () => end(false);
    ui.ok.onclick = () => end(true);
    if (ui.all) ui.all.onclick = () => end('all');   // abrir todas las cajas de golpe, sin jugar
    ui.hint.textContent = '0 %';
  });
}

/* ---------- Empaquetar un pedido ---------- */

export function runPackBox({ items, who = 'Cliente', shop = 'Librería', hard = false, buzz = null }) {
  return new Promise((resolve) => {
    const ui = overlay('Empaqueta el pedido', 'Arrastra cada libro a la caja.', 'Listo');
    const ts = items.map((id) => thick(id)), sumT = ts.reduce((a, b) => a + b, 0);
    const L = Math.max(1.0, sumT + .62);
    const st = createStage(ui.stage, { L, D: .62, H: .8, minDist: 4.9, look: .38 });
    const { THREE: TH, scene, dims } = st;
    const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
    const Ytop = dims.H + .05;
    let stage = 'books', mistakes = 0, finished = false, drag = null;
    const left = -dims.L / 2 + .02;

    // libros sobre la mesa, delante de la caja
    const pile = items.map((id, i) => {
      const o = bookObj(id, scene, TH), px = (i - (items.length - 1) / 2) * Math.min(.9, 2.6 / Math.max(1, items.length));
      layBook(o, px, thick(id) / 2, dims.Do / 2 + .85, (rnd() - .5) * .3); o.userData.home = o.position.clone(); o.userData.homeRot = o.rotation.clone(); return o;
    });
    let used = 0, usedX = left;
    // relleno: una sola hoja de papel arrugado
    let paper = null, filled = false;
    const tape = tapeTexture(0);
    let tapeMesh = null, roll = null, tapeProg = 0, label = null;

    const setHelp = (t, h = '') => { ui.help.textContent = t; ui.hint.textContent = h; };
    const hintBad = (t) => { ui.hint.textContent = t; flash(ui.hint); };

    const onDown = (e) => {
      if (stage === 'books') {
        const cand = pile.filter((o) => !o.userData.placed), hit = st.pick(e, cand);
        let o = null; if (hit) { o = hit.object; while (o && !cand.includes(o)) o = o.parent; }
        o = o ?? st.near(e, cand); if (!o) return; startDrag(e, o, { upright: true });
      } else if (stage === 'paper') {
        if (!paper || filled) return;
        if (!st.pick(e, [paper]) && !st.near(e, [paper], 90)) return; startDrag(e, paper, {});
      } else if (stage === 'close') {
        drag = { kind: 'close', y0: e.clientY, p0: st.closeP }; st.canvas.setPointerCapture(e.pointerId);
      } else if (stage === 'tape') {
        drag = { kind: 'tape' }; st.canvas.setPointerCapture(e.pointerId); onMove(e);
      } else if (stage === 'label') {
        if (!st.pick(e, [label]) && !st.near(e, [label], 90)) return; startDrag(e, label, {});
      }
    };
    const startDrag = (e, o, opt) => {
      drag = { kind: 'item', o, opt }; st.canvas.setPointerCapture(e.pointerId);
      o.userData.lift = 0;
      if (opt.upright) { const r0 = o.rotation.clone(); st.tween(220, (p) => { o.rotation.set(lerp(r0.x, 0, p), lerp(r0.y, Math.PI / 2, p), lerp(r0.z, 0, p)); }); }
      onMove(e);
    };
    const onMove = (e) => {
      if (!drag) return;
      if (drag.kind === 'item') {
        const hy = stage === 'label' ? Ytop + .3 : dims.H + .35, p = st.rayPlane(e, hy); if (!p) return;
        drag.o.position.set(p.x, hy, p.z);
      } else if (drag.kind === 'close') {
        const p = clamp(drag.p0 + (e.clientY - drag.y0) / 150, 0, 1); st.setClose(p);
        if (p >= .98) { drag = null; st.setClose(1); sfx('page'); buzz?.(30); toTape(); }
      } else if (drag.kind === 'tape') {
        const p = st.rayPlane(e, Ytop); if (!p) return;
        const f = clamp((p.x + dims.Lo / 2) / dims.Lo, 0, 1);
        if (hard && Math.abs(p.z) > .22) { tapeProg = 0; tapeMesh.scale.x = .001; flash(ui.hint); ui.hint.textContent = '¡Pégala recta!'; buzz?.(30); sfx('error'); mistakes++; return; }
        if (f > tapeProg && f - tapeProg < .4) tapeProg = f;
        tapeMesh.scale.x = Math.max(.001, tapeProg);
        roll.position.set(-dims.Lo / 2 + tapeProg * dims.Lo, Ytop + .2, p.z * .5);
        roll.userData.roll.rotation.x = tapeProg * 16; ui.hint.textContent = Math.round(tapeProg * 100) + ' %';
        if (tapeProg >= .97) { drag = null; finishTape(); }
      }
    };
    const onUp = (e) => {
      if (!drag) return;
      const d = drag; drag = null;
      if (d.kind === 'close') { if (st.closeP < .98) { const p0 = st.closeP; st.tween(250, (p) => st.setClose(lerp(p0, st.closeP < .5 ? 0 : p0, p))); } return; }
      if (d.kind !== 'item') return;
      const o = d.o;
      if (stage === 'books') {
        const p = st.rayPlane(e, dims.H); const inside = p && Math.abs(p.x) < dims.Lo / 2 + .05 && Math.abs(p.z) < dims.Do / 2 + .05;
        if (inside) dropBook(o); else returnHome(o, true);
      } else if (stage === 'paper') {
        const p = st.rayPlane(e, dims.H); const inside = p && Math.abs(p.x) < dims.Lo / 2 + .1 && Math.abs(p.z) < dims.Do / 2 + .1;
        if (inside) dropPaper(o); else returnHome(o, false);
      } else if (stage === 'label') dropLabel(e, o);
    };
    const returnHome = (o, upright) => {
      const p0 = o.position.clone(), q0 = o.rotation.clone();
      st.tween(260, (p) => { o.position.lerpVectors(p0, o.userData.home, p); if (upright) o.rotation.set(lerp(q0.x, o.userData.homeRot.x, p), lerp(q0.y, o.userData.homeRot.y, p), lerp(q0.z, o.userData.homeRot.z, p)); });
    };
    const dropBook = (o) => {
      o.userData.placed = true;
      const i = pile.indexOf(o), t = ts[i], x = usedX + t / 2; usedX += t + .006;
      const p0 = o.position.clone();
      st.tween(300, (p) => { o.position.set(lerp(p0.x, x, p), lerp(p0.y, dims.T, easeInOut(p)), lerp(p0.z, 0, p)); }, () => { sfx('place'); buzz?.(12); });
      used++;
      ui.hint.textContent = `${used} / ${items.length}`;
      if (used === items.length) setTimeout(toPaper, 500);
    };
    const toPaper = () => {
      stage = 'paper';
      setHelp('Arrastra el papel de embalaje a la caja: se ajustará al hueco.', '');
      paper = crumpledPaper(TH, scene);
      paper.position.set(0, .3, dims.Do / 2 + .85); paper.scale.set(.7, .5, .7); paper.userData.home = paper.position.clone();
    };
    const dropPaper = (o) => {
      filled = true; o.userData.placed = true; o.userData.item = null;
      const gx0 = usedX + .02, gx1 = dims.L / 2 - .03, len = Math.max(.2, gx1 - gx0), inD = dims.D - .1, high = .5;
      const p0 = o.position.clone(), s0 = o.scale.clone(), target = new TH.Vector3((gx0 + gx1) / 2, dims.T + high / 2, 0);
      st.tween(380, (p) => { const e = easeInOut(p); o.position.lerpVectors(p0, target, e); o.position.y += Math.sin(p * Math.PI) * .25; o.scale.set(lerp(s0.x, len, e), lerp(s0.y, high, e), lerp(s0.z, inD, e)); },
        () => { sfx('place'); buzz?.(15); setHelp('¡Relleno ajustado!', ''); setTimeout(toClose, 600); });
    };
    const toClose = () => {
      stage = 'close'; setHelp('Desliza el dedo hacia abajo para cerrar las solapas.', '');
    };
    const toTape = () => {
      stage = 'tape'; setHelp(hard ? 'Desliza por la unión para pegar la cinta, sin salirte.' : 'Desliza el dedo por la unión: el rollo pega la cinta.', '0 %');
      const mat = new TH.MeshStandardMaterial({ map: tape.tex, transparent: true, roughness: .25, metalness: .15 });
      const g = new TH.PlaneGeometry(dims.Lo, .2); g.translate(dims.Lo / 2, 0, 0);
      tapeMesh = new TH.Mesh(g, mat); tapeMesh.rotation.x = -Math.PI / 2; tapeMesh.position.set(-dims.Lo / 2, Ytop - .004, 0); tapeMesh.scale.x = .001; tapeMesh.receiveShadow = true; scene.add(tapeMesh);
      roll = tapeRollObj(); roll.scale.setScalar(.7); roll.position.set(-dims.Lo / 2, Ytop + .2, 0); scene.add(roll);
    };
    const finishTape = () => {
      tapeMesh.scale.x = 1; tapeMesh.position.x = -dims.Lo / 2; sfx('page');
      st.tween(300, (p) => { roll.position.y = Ytop + .2 + p * .8; });
      [-1, 1].forEach((s) => { const w = new TH.Mesh(new TH.PlaneGeometry(.2, .26), new TH.MeshStandardMaterial({ map: tape.tex, roughness: .3 })); w.position.set(s * (dims.Lo / 2 + .003), dims.H - .09, 0); w.rotation.y = s * Math.PI / 2; scene.add(w); });
      setTimeout(toLabel, 450);
    };
    const toLabel = () => {
      roll.visible = false; stage = 'label';
      setHelp('Pega la etiqueta en la tapa o en un lateral, bien centrada, lejos de las esquinas.', '');
      const lt = labelTexture(who, shop);
      label = new TH.Mesh(new TH.PlaneGeometry(.5, .3), new TH.MeshStandardMaterial({ map: lt, roughness: .6, side: TH.DoubleSide }));
      label.castShadow = true; label.rotation.x = -Math.PI / 2; label.position.set(0, .02, dims.Do / 2 + .95); label.userData.item = { kind: 'label' }; label.userData.home = label.position.clone();
      scene.add(label);
    };
    const dropLabel = (e, o) => {
      // se acepta en la tapa o en el lateral frontal, nunca en esquinas ni bordes; se ajusta sola para que quepa entera
      const lw = .5, lh = .3, vx = dims.Lo / 2, vz = dims.Do / 2;
      let place = null;
      const top = st.rayPlane(e, Ytop);
      if (top && Math.abs(top.x) <= vx && Math.abs(top.z) <= vz && Math.abs(top.x) <= vx - .2 && Math.abs(top.z) <= vz - .05) {
        const mx = vx - lw / 2 - .04, mz = vz - lh / 2 - .02;
        place = { pos: new TH.Vector3(clamp(top.x, -mx, mx), Ytop + .004, clamp(top.z, -mz, mz)), rot: [-Math.PI / 2, 0, 0] };
      }
      if (!place) {
        st.ray.setFromCamera(st.ndc(e), st.camera);
        const d = st.ray.ray.direction, orr = st.ray.ray.origin, zf = vz + .004, t = (zf - orr.z) / d.z;
        if (t > 0) {
          const q = orr.clone().addScaledVector(d, t);
          if (Math.abs(q.x) <= vx - .2 && q.y > .12 && q.y < dims.H - .06) {
            const mx = vx - lw / 2 - .04;
            place = { pos: new TH.Vector3(clamp(q.x, -mx, mx), clamp(q.y, lh / 2 + .08, dims.H - lh / 2 - .08), zf + .003), rot: [0, 0, 0] };
          }
        }
      }
      if (!place) { mistakes++; buzz?.(40); sfx('error'); hintBad('Así no: en la tapa o en un lateral, bien centrada, lejos de las esquinas.'); const p0 = o.position.clone(), q0 = o.rotation.clone(); st.tween(260, (p) => { o.position.lerpVectors(p0, o.userData.home, p); o.rotation.set(lerp(q0.x, -Math.PI / 2, p), lerp(q0.y, 0, p), lerp(q0.z, 0, p)); }); return; }
      const p0 = o.position.clone(), q0 = o.rotation.clone();
      st.tween(280, (p) => { o.position.lerpVectors(p0, place.pos, easeInOut(p)); o.rotation.set(lerp(q0.x, place.rot[0], p), lerp(q0.y, place.rot[1], p), lerp(q0.z, place.rot[2], p)); }, () => {
        o.userData.item = null; sfx('place'); buzz?.(20); stage = 'done';
        setHelp('¡Caja lista! Ya solo queda mandarla.', ''); ui.ok.disabled = false;
      });
    };

    st.canvas.addEventListener('pointerdown', onDown);
    st.canvas.addEventListener('pointermove', onMove);
    st.canvas.addEventListener('pointerup', onUp);
    st.canvas.addEventListener('pointercancel', () => { drag = null; });
    const end = (v) => { if (finished) return; finished = true; st.dispose(); ui.root.remove(); resolve(v); };
    ui.quit.onclick = () => end(null);
    ui.ok.onclick = () => end({ stars: Math.max(1, 3 - Math.min(2, mistakes)) });
    ui.hint.textContent = `0 / ${items.length}`;
    window.__boxdbg = { at(x, y, z) { const v = new TH.Vector3(x, y, z).project(st.camera), r = st.canvas.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, screenOf(o) { const v = o.position.clone().project(st.camera), r = st.canvas.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, pile, get paper() { return paper; }, get label() { return label; }, dims };
  });
}
