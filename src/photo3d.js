// Fotos de objetos sueltos (un libro, una figurita…) sobre una mesa de madera, con luz de día. Se usa en la app Cámara.
import { THREE, M, mOak } from './kit3d.js';
import { itemMesh } from './furniture3d.js';

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
  const it = itemMesh(key);
  const box0 = new THREE.Box3().setFromObject(it), size = box0.getSize(new THREE.Vector3());
  const k = .42 / Math.max(size.y, size.x * .8, .05);   // se escala para que llene bien la foto
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
