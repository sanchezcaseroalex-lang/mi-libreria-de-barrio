// Fotos de objetos sueltos (un libro, una figurita…) sobre una mesa de madera, con luz de día. Se usa en la app Cámara.
import { THREE, M, mOak } from './kit3d.js';
import { itemMesh } from './furniture3d.js';

// Ilustraciones propias de los complementos (arte/objetos/recortes): en la foto sale la ilustración, de pie sobre la mesa
const ART = { marcapaginas: 'marcapaginas', libreta: 'libreta', vela: 'vela', tote: 'totebag', poster: 'poster', fig_dragon: 'dragon', fig_gato: 'gato', fig_buho: 'buho', fig_mago: 'maho', er_luma: 'e-reader', er_tinta: 'e-reader', er_pagina: 'e-reader', er_aurora: 'e-reader' };
const artImgs = {};
export function preloadItemArt() {
  for (const f of new Set(Object.values(ART))) { if (artImgs[f]) continue; const im = new Image(); im.src = 'arte/objetos/recortes/' + f + '.png'; artImgs[f] = im; }
}
preloadItemArt();
function artStandee(key) {
  const id = String(key).split(':')[1], f = ART[id], im = f && artImgs[f];
  if (!im || !im.complete || !im.naturalWidth) return null;
  const tex = new THREE.Texture(im); tex.needsUpdate = true; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const ph = .4, pw = ph * im.naturalWidth / im.naturalHeight;
  const g = new THREE.Group();
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: .08, side: THREE.DoubleSide }));
  plane.position.y = ph / 2; g.add(plane);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(pw * .5, 24), new THREE.MeshBasicMaterial({ color: '#2a1608', transparent: true, opacity: .28, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = .003; shadow.scale.set(1, .32, 1); g.add(shadow);
  return g;
}

export function shootItem(key, w = 480, h = 320) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setSize(w, h, false); r.shadowMap.enabled = true;
  const sc = new THREE.Scene();
  sc.background = new THREE.Color('#e9d8b4');
  sc.add(new THREE.HemisphereLight('#fff4de', '#9a7a58', 1.35));
  const sun = new THREE.DirectionalLight('#fff0d0', 2.2); sun.position.set(1.4, 2.6, 2); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: .1, far: 8 }); sc.add(sun);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(6, 4), mOak); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; sc.add(table);
  const art = artStandee(key), it = art ?? itemMesh(key);
  const box0 = new THREE.Box3().setFromObject(it), size = box0.getSize(new THREE.Vector3());
  const k = (art ? .46 : .42) / Math.max(size.y, size.x * .8, .05);   // se escala para que llene bien la foto
  it.scale.multiplyScalar(k); it.rotation.y = -.35; sc.add(it);
  it.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // un marcapáginas y una taza de adorno
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(.07, .055, .1, 20), M('#f3e7c9', .6)); cup.position.set(.42, .05, -.12); cup.castShadow = true; sc.add(cup);
  const tea = new THREE.Mesh(new THREE.CylinderGeometry(.062, .062, .01, 20), M('#7a4a2a', .4)); tea.position.set(.42, .1, -.12); sc.add(tea);
  const cam = new THREE.PerspectiveCamera(32, w / h, .05, 20);
  const hgt = size.y * k;
  cam.position.set(.18, .32 + hgt * .55, .95); cam.lookAt(0, hgt * .45, 0);
  r.render(sc, cam);
  const url = canvas.toDataURL('image/jpeg', .8);
  sc.traverse((o) => { o.geometry?.dispose?.(); });
  r.dispose();
  return url;
}
