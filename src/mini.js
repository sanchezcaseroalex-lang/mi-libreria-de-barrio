// Minijuegos de ordenar estantes: por género, por sagas y encajar huecos. Sin cronómetro: solo importa hacerlo con cuidado.
import { BOOKS, BOOK, GENRE_ORDER, SECTIONS, SAGAS, sectionOf } from './books.js';
import { spineSVG, spineInner, coverSVG } from './art.js';
import { sfx } from './audio.js';

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ROMAN = ['', 'I', 'II', 'III', 'IV'];

export const MODES = {
  genero: { name: 'Ordenar por género', help: 'Arrastra cada libro a su estantería: cada género tiene su color.', level: 1 },
  sagas: { name: 'Ordenar las sagas', help: 'Junta los tomos de cada saga y ponlos en orden (I, II, III…). Arrastra un libro sobre otro para cambiarlos de sitio.', level: 3 },
  huecos: { name: 'Encajar huecos', help: 'Rellena los huecos con libros que quepan justo. Toca un libro colocado para devolverlo al montón.', level: 5 },
};
export const chooseMode = (level, prev) => {
  const ok = Object.keys(MODES).filter((m) => MODES[m].level <= level && m !== prev);
  return pick(ok.length ? ok : ['genero']);
};

export function runMini({ mode, hard = false, level = 1, buzz = null }) {
  return new Promise((resolve) => {
    const root = document.createElement('div');
    root.id = 'mini';
    root.innerHTML = `<div class="mini-wrap"><header><div><p class="kick">Minijuego</p><h2>${esc(MODES[mode].name)}</h2><p class="muted">${esc(MODES[mode].help)}${hard ? ' <b>Modo difícil:</b> más libros.' : ''}</p></div><button type="button" class="x" data-quit aria-label="Salir">×</button></header><div class="mini-board"></div><footer><span class="mini-prog"></span></footer></div>`;
    document.body.append(root);
    const board = root.querySelector('.mini-board'), prog = root.querySelector('.mini-prog');
    let mistakes = 0, moves = 0, done = false;
    const finish = (extra = {}) => {
      if (done) return;
      done = true; sfx('win');
      const stars = Math.max(1, 3 - Math.min(2, Math.floor(mistakes / (hard ? 1 : 2))));
      board.innerHTML = `<div class="mini-done"><h3>¡Estantes en orden!</h3><div class="stars big">${'★'.repeat(stars)}<i>${'★'.repeat(3 - stars)}</i></div><p class="muted">${mistakes ? `${mistakes} ${mistakes === 1 ? 'fallo' : 'fallos'}` : 'Sin ningún fallo'}. Los clientes agradecerán lo bien ordenado que está todo.</p><button type="button" class="btn primary wide" data-ok>Listo</button></div>`;
      prog.textContent = '';
      root.querySelector('[data-ok]').onclick = () => { root.remove(); resolve({ stars, mistakes, mode, ...extra }); };
    };
    root.querySelector('[data-quit]').onclick = () => { if (done) return; done = true; root.remove(); resolve(null); };

    // utilidades de arrastre: el libro sigue al dedo y, al soltarlo, se decide dónde cae
    const drag = (el, onDrop, onHover) => {
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', (e) => {
        if (done) return;
        e.preventDefault();
        const r = el.getBoundingClientRect();
        const ghost = el.cloneNode(true);
        ghost.classList.add('ghost');
        Object.assign(ghost.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, zIndex: 80, pointerEvents: 'none' });
        document.body.append(ghost);
        el.classList.add('lifted');
        const ox = e.clientX - r.left, oy = e.clientY - r.top;
        const move = (ev) => { ghost.style.left = `${ev.clientX - ox}px`; ghost.style.top = `${ev.clientY - oy}px`; onHover?.(ev); };
        const up = (ev) => {
          window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
          ghost.remove(); el.classList.remove('lifted');
          onHover?.(null);
          const under = document.elementFromPoint(ev.clientX, ev.clientY);
          onDrop(under, ev);
        };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      });
    };
    const shake = (el) => { el?.classList.remove('shake'); void el?.offsetWidth; el?.classList.add('shake'); };

    const avail = BOOKS.filter((b) => b.unlock <= level);

    /* ---------- Por género ---------- */
    if (mode === 'genero') {
      const n = hard ? 12 : 8;
      let pool = shuffle(avail).slice(0, n);
      GENRE_ORDER.forEach((g) => { if (!pool.some((b) => sectionOf(b) === g)) { const extra = avail.find((b) => sectionOf(b) === g && !pool.includes(b)); if (extra) pool[pool.length - 1] = extra; } });
      board.innerHTML = `<div class="mshelf">${GENRE_ORDER.map((g) => `<div class="mrow" data-g="${g}"><span class="mtag" style="background:${SECTIONS.find((s) => s.id === g).color}">${esc(SECTIONS.find((s) => s.id === g).label)}</span><div class="slots"></div></div>`).join('')}</div>
        <p class="mhint">Libros por ordenar</p><div class="pile">${shuffle(pool).map((b) => `<div class="mb" data-id="${b.id}" title="${esc(b.title)}">${spineSVG(b, 46, 1.55)}</div>`).join('')}</div>`;
      let left = pool.length;
      const upd = () => { prog.textContent = `${pool.length - left} de ${pool.length} colocados`; }; upd();
      board.querySelectorAll('.mb').forEach((el) => drag(el, (under) => {
        const row = under?.closest?.('.mrow');
        if (!row) return;
        if (row.dataset.g === sectionOf(BOOK[el.dataset.id])) { row.querySelector('.slots').append(el); el.classList.add('placed'); sfx('place'); left--; upd(); if (!left) setTimeout(() => finish(), 350); }
        else { mistakes++; buzz?.(60); sfx('error'); shake(row); }
      }, (ev) => board.querySelectorAll('.mrow').forEach((r) => r.classList.toggle('hot', !!ev && !!document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.mrow') && document.elementFromPoint(ev.clientX, ev.clientY).closest('.mrow') === r))));
    }

    /* ---------- Sagas ---------- */
    if (mode === 'sagas') {
      const usable = SAGAS.filter((s) => s.ids.every((id) => BOOK[id].unlock <= level));
      const sagas = shuffle(usable.length >= 2 ? usable : SAGAS).slice(0, hard ? 3 : 2);
      let order = sagas.flatMap((s) => s.ids);
      const solved = (arr) => {
        let i = 0;
        const groups = [];
        while (i < arr.length) { const sid = BOOK[arr[i]].saga.id; let j = i; while (j < arr.length && BOOK[arr[j]].saga.id === sid) j++; groups.push(arr.slice(i, j)); i = j; }
        return groups.length === sagas.length && groups.every((g) => g.every((id, k) => BOOK[id].saga.n === k + 1));
      };
      do order = shuffle(order); while (solved(order));
      const render = () => {
        board.innerHTML = `<p class="mhint">Sagas: ${sagas.map((s) => `<b>${esc(s.name)}</b> (${s.ids.length} tomos)`).join(' · ')}</p>
          <div class="mshelf one"><div class="mrow flat"><div class="slots lined">${order.map((id, i) => `<div class="msl" data-i="${i}"><div class="mb" data-i="${i}" data-id="${id}" title="${esc(BOOK[id].title)}">${spineSVG(BOOK[id], 46, 1.7)}<span class="rom">${ROMAN[BOOK[id].saga.n]}</span></div></div>`).join('')}</div></div></div>`;
        prog.textContent = `${moves} ${moves === 1 ? 'movimiento' : 'movimientos'}`;
        board.querySelectorAll('.mb').forEach((el) => drag(el, (under) => {
          const sl = under?.closest?.('.msl');
          if (!sl) return;
          const i = Number(el.dataset.i), j = Number(sl.dataset.i);
          if (i === j) return;
          [order[i], order[j]] = [order[j], order[i]]; moves++; sfx('place');
          render();
          if (solved(order)) { mistakes = moves > order.length * 2 ? 3 : moves > order.length ? 2 : 0; setTimeout(() => finish({ moves }), 450); }
        }));
      };
      render();
    }

    /* ---------- Encajar huecos ---------- */
    if (mode === 'huecos') {
      const U = 22;                                                      // píxeles por unidad de ancho
      const nGaps = hard ? 4 : 3, decoys = hard ? 3 : 2;
      const chosen = shuffle(avail);
      let k = 0;
      const mk = (u) => ({ b: chosen[k++ % chosen.length], u, uid: `m${k}` });
      const gaps = [], pile = [];
      for (let g = 0; g < nGaps; g++) {
        const cap = 3 + Math.floor(Math.random() * 3);
        let rest = cap; const parts = [];
        while (rest > 0) { const u = Math.min(rest, 1 + Math.floor(Math.random() * 3)); parts.push(u); rest -= u; }
        gaps.push({ cap, placed: [] });
        parts.forEach((u) => pile.push(mk(u)));
      }
      for (let d = 0; d < decoys; d++) pile.push(mk(pick([2, 3])));
      const fill = (n) => Array.from({ length: n }, () => `<div class="fixed">${spineSVG(chosen[k++ % chosen.length], 46, 1.45)}</div>`).join('');
      const bookEl = (it) => `<div class="mb u" data-uid="${it.uid}" style="width:${it.u * U}px" title="${esc(it.b.title)}"><svg width="${it.u * U}" height="66" viewBox="0 0 ${it.b.w} 46" preserveAspectRatio="none">${spineInner(it.b, 46)}</svg></div>`;
      const byUid = (uid) => pile.find((p) => p.uid === uid);
      const rem = (g) => g.cap - g.placed.reduce((t, p) => t + p.u, 0);
      const render = () => {
        const placedUids = new Set(gaps.flatMap((g) => g.placed.map((p) => p.uid)));
        board.innerHTML = `<div class="mshelf one"><div class="mrow flat"><div class="slots lined gapsrow">${gaps.map((g, i) => `${fill(1)}<div class="gap" data-i="${i}" style="min-width:${g.cap * U}px"><div class="gin">${g.placed.map(bookEl).join('')}</div><em>${rem(g) ? `faltan ${rem(g)}` : '✓'}</em></div>`).join('')}${fill(1)}</div></div></div>
          <p class="mhint">Montón de libros (el número de huecos que ocupan se ve por su anchura)</p><div class="pile">${pile.filter((p) => !placedUids.has(p.uid)).map(bookEl).join('')}</div>`;
        const total = gaps.reduce((t, g) => t + g.cap, 0), filled = gaps.reduce((t, g) => t + g.cap - rem(g), 0);
        prog.textContent = `${filled} de ${total} huecos rellenos`;
        board.querySelectorAll('.pile .mb').forEach((el) => drag(el, (under) => {
          const gp = under?.closest?.('.gap');
          if (!gp) return;
          const g = gaps[Number(gp.dataset.i)], it = byUid(el.dataset.uid);
          if (it.u > rem(g)) { mistakes++; buzz?.(60); sfx('error'); shake(gp); return; }
          g.placed.push(it); sfx('place'); render();
          if (gaps.every((x) => rem(x) === 0)) setTimeout(() => finish(), 400);
        }));
        board.querySelectorAll('.gap .mb').forEach((el) => el.addEventListener('click', () => { gaps.forEach((g) => { g.placed = g.placed.filter((p) => p.uid !== el.dataset.uid); }); render(); }));
      };
      render();
    }
  });
}
