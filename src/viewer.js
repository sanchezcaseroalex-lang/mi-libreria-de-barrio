// Visor 3D de un libro: se gira con el dedo, con atajos para ver la portada, el lomo y los cantos tintados.
import { THREE, canvasTex, coverTexture } from './kit3d.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function showBook3D(book, { heading = 'Edición especial', note = '' } = {}) {
  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.id = 'viewer';
    root.innerHTML = `<div class="vw-card"><p class="kick">${esc(heading)}</p><h2>${esc(book.title)}</h2><p class="muted">${esc(book.ed?.name ?? '')}</p>
      <canvas></canvas>
      <div class="vw-btns"><button type="button" data-v="0">Portada</button><button type="button" data-v="1">Lomo</button><button type="button" data-v="2">Cantos</button><button type="button" data-v="3">Contraportada</button></div>
      <p class="muted vw-note">${esc(note || 'Arrastra para girarlo.')}</p>
      <button type="button" class="btn primary wide" data-close>Cerrar</button></div>`;
    document.body.append(root);
    const canvas = root.querySelector('canvas');
    const W = Math.min(340, innerWidth - 60), H = Math.round(W * 1.15);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(W, H, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, W / H, .1, 50); cam.position.set(0, .05, 4.7);
    scene.add(new THREE.HemisphereLight('#fff4de', '#6a4a30', 1.1));
    const key = new THREE.DirectionalLight('#fff0d0', 2.4); key.position.set(2.5, 3, 4); scene.add(key);
    const glint = new THREE.PointLight('#ffe9b0', 14, 9); scene.add(glint);

    const Wd = 1.2, Hd = 1.8, T = .34, bd = .035, pal = book.pal, edge = book.ed?.edge ?? '#efe3c4';
    const grp = new THREE.Group(); scene.add(grp);
    const std = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: .55, clearcoat: .5, clearcoatRoughness: .35, ...extra });
    const cover = std('#ffffff', { map: coverTexture(book), roughness: .42, metalness: .15 });
    const boardCol = std(pal[1]);
    const back = canvasTex(240, 360, (g, w, h) => {
      g.fillStyle = pal[1]; g.fillRect(0, 0, w, h);
      g.strokeStyle = pal[2]; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 1; g.strokeRect(22, 22, w - 44, h - 44);
      g.fillStyle = pal[3]; g.globalAlpha = .85; g.font = '700 22px Fraunces, serif'; g.textAlign = 'center'; g.fillText(book.author, w / 2, h / 2); g.globalAlpha = 1;
    });
    const spineTex = canvasTex(64, 512, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, pal[0]); gr.addColorStop(1, pal[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = pal[2]; g.fillRect(0, 26, w, 8); g.fillRect(0, h - 40, w, 5); g.fillRect(0, h - 26, w, 12);
      g.save(); g.translate(w / 2, h / 2); g.rotate(Math.PI / 2); g.fillStyle = pal[3]; g.font = '700 34px Fraunces, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(book.title.length > 20 ? book.title.slice(0, 19) + '…' : book.title, 0, 0); g.restore();
    });
    const stripes = canvasTex(64, 256, (g, w, h) => {
      g.fillStyle = edge; g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(0,0,0,${.1 + (y % 9) * .012})`; g.fillRect(0, y, w, 1); }
    });
    const edgeM = std(edge, { map: stripes, roughness: book.ed ? .3 : .8, metalness: book.ed ? .55 : 0, clearcoat: 0 });
    const mk = (w, h, d, mats, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats); m.position.set(x, y, z); grp.add(m); return m; };
    mk(Wd, Hd, bd, [boardCol, boardCol, boardCol, boardCol, cover, boardCol], 0, 0, T / 2 - bd / 2);
    mk(Wd, Hd, bd, [boardCol, boardCol, boardCol, boardCol, boardCol, std('#ffffff', { map: back })], 0, 0, -T / 2 + bd / 2);
    mk(.06, Hd, T, [boardCol, std('#ffffff', { map: spineTex, roughness: .4 }), boardCol, boardCol, boardCol, boardCol], -Wd / 2 + .03, 0, 0);
    mk(Wd - .1, Hd - .07, T - bd * 2 - .004, [edgeM, edgeM, edgeM, edgeM, edgeM, edgeM], .02, 0, 0);

    // vistas: giros objetivo (y, x)
    const VIEWS = [[-.35, .1], [Math.PI / 2 - .15, 0], [-Math.PI / 2 - .35, .25], [Math.PI - .35, .1]];
    let ry = -.5, rx = .12, ty = null, tx = 0, vy = .006, down = false, lx = 0, ly = 0, auto = true, raf = 0, t0 = performance.now();
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', (e) => { down = true; auto = false; ty = null; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (!down) return; vy = (e.clientX - lx) * .01; ry += vy; rx = Math.max(-.7, Math.min(.7, rx + (e.clientY - ly) * .006)); lx = e.clientX; ly = e.clientY; });
    const up = () => { down = false; };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    root.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
      auto = false; const [y, x] = VIEWS[Number(b.dataset.v)];
      ty = ry + (((y - ry) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI; tx = x;
    }));
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = (performance.now() - t0) / 1000;
      if (auto) ry += .008;
      else if (ty != null) { ry += (ty - ry) * .1; rx += (tx - rx) * .1; }
      else if (!down) { ry += vy; vy *= .94; }
      grp.rotation.set(rx, ry, 0);
      glint.position.set(Math.sin(t * .9) * 3, 1.5 + Math.cos(t * .6), 3.2);
      renderer.render(scene, cam);
    };
    tick();
    const close = () => {
      cancelAnimationFrame(raf); renderer.dispose(); root.remove(); resolve();
    };
    root.querySelector('[data-close]').onclick = close;
  });
}
