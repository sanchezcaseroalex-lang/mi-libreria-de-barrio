// Furgoneta de Rodeos Express (mira hacia +x). Origen en el suelo, centrada.
import { THREE, M, box, cyl, canvasTex } from './kit3d.js';
import { rodeosCanvas } from './rodeos.js';

export function makeVan() {
  const g = new THREE.Group();
  const yellow = M('#ffd21f', .45, .05), navy = M('#0b2a6b', .5, .1), dark = M('#1d1d22', .8), glass = new THREE.MeshStandardMaterial({ color: '#9fd3ee', roughness: .1, metalness: .3, transparent: true, opacity: .85 });
  const add = (m, x, y, z) => { m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); return m; };

  add(box(3.1, .22, 1.34, navy, .06), 0, .42, 0);                                // bajos
  add(box(1.95, 1.3, 1.42, yellow, .1), -.5, 1.18, 0);                           // caja de carga
  add(box(1.0, 1.0, 1.42, yellow, .12), .98, .93, 0);                            // cabina
  add(box(.62, .52, 1.38, yellow, .1), 1.45, .73, 0);                            // capó
  add(box(.18, .2, 1.46, navy, .05), 1.72, .52, 0);                              // parachoques
  add(box(.08, .2, 1.46, navy, .04), -1.52, .52, 0);                             // parachoques trasero
  add(box(1.96, .1, 1.44, navy, .02), -.5, .56, 0);                              // franja inferior
  // parabrisas y ventanas
  const ws = box(.05, .62, 1.2, glass, .02); add(ws, 1.46, 1.2, 0); ws.rotation.z = -.5;
  [-1, 1].forEach((s) => { add(box(.62, .5, .02, glass, .01), .98, 1.1, s * .72); });
  // techo de cabina
  add(box(1.0, .06, 1.38, navy, .03), .95, 1.47, 0);
  // faros
  [-1, 1].forEach((s) => {
    const hl = add(box(.06, .16, .3, new THREE.MeshStandardMaterial({ color: '#fff7d0', emissive: '#fff0a0', emissiveIntensity: 1.2 }), .02), 1.78, .74, s * .45); hl.castShadow = false;
    const tl = add(box(.05, .2, .16, new THREE.MeshStandardMaterial({ color: '#c0262d', emissive: '#c0262d', emissiveIntensity: .6 }), .02), -1.5, .95, s * .64); tl.castShadow = false;
  });
  // puertas traseras y rótulos laterales
  add(box(.03, 1.0, .02, dark, .005), -1.46, 1.18, 0).rotation.y = Math.PI / 2;
  const logoTex = new THREE.CanvasTexture(rodeosCanvas(512, 200)); logoTex.colorSpace = THREE.SRGBColorSpace; logoTex.anisotropy = 8;
  const logoMat = new THREE.MeshStandardMaterial({ map: logoTex, roughness: .5 });
  [-1, 1].forEach((s) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .586), logoMat);
    p.position.set(-.5, 1.28, s * .712); p.rotation.y = s > 0 ? 0 : Math.PI; g.add(p);
    // franja azul a lo largo
    const st = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .09), new THREE.MeshStandardMaterial({ color: '#0b2a6b', roughness: .5 }));
    st.position.set(-.5, .78, s * .712); st.rotation.y = s > 0 ? 0 : Math.PI; g.add(st);
  });
  // ruedas
  const wheels = [];
  [[1.0, 1], [1.0, -1], [-1.0, 1], [-1.0, -1]].forEach(([x, s]) => {
    const w = new THREE.Group();
    const tire = cyl(.34, .34, .24, dark, 20); tire.rotation.x = Math.PI / 2; w.add(tire);
    const hub = cyl(.17, .17, .26, M('#cfd3da', .4, .6), 14); hub.rotation.x = Math.PI / 2; w.add(hub);
    const nut = cyl(.05, .05, .28, M('#6b7078', .5, .5), 8); nut.rotation.x = Math.PI / 2; w.add(nut);
    w.position.set(x, .34, s * .64); g.add(w); wheels.push(w);
  });
  g.userData.wheels = wheels;
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  return g;
}
void canvasTex;
