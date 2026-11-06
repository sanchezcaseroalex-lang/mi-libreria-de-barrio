// Muebles y personajes dibujados por código, en vista 3/4, con contorno, degradados y detalles acogedores.
import { BOOK, GENRES, GENRE_ORDER } from './books.js';
import { spineInner, coverSVG } from './art.js';
import { T, FURN, dims } from './layout.js';

const OUT = '#38211a';
const ol = (w = 1.1) => `stroke="${OUT}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// Cuánto sobresale cada mueble por encima de su casilla, visto de frente (px)
export const EXTRA = { shelf: 66, counter: 34, table: 22, armchair: 22, lamp: 58, plant: 38, side: 14, cat: 4, sofa: 22, coffee: 30, rug: 0 };
// Altura del cuerpo de los muebles largos cuando se ven de lado
const BODY = { shelf: 84, counter: 40, table: 34, sofa: 44 };

export function spriteSize(type, rot = 0) {
  const d = dims(type, rot);
  if (rot % 2 && BODY[type]) return { w: T, h: d.h * T + BODY[type] };
  return { w: d.w * T, h: d.h * T + EXTRA[type] };
}

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
};
const spineH = (id) => 40 + Math.floor(hash(id + 'h') * 7);
const coverInner = (book) => coverSVG(book, 120, 180).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

const wrap = (w, h, inner, cls = '') => `<svg class="spr ${cls}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${inner}</svg>`;
const shadow = (w, h, rx = w / 2 - 2) => `<ellipse cx="${w / 2}" cy="${h - 3}" rx="${rx}" ry="4.5" fill="#1a0f08" opacity=".32"/>`;
const grain = (x, y, w, h, seed, n = 4, op = 0.16) => Array.from({ length: n }, (_, i) => {
  const yy = y + ((i + 0.5) * h) / n;
  return `<path d="M${x + 2 + hash(seed + i) * 6} ${yy} h${w * (0.4 + hash(seed + 'g' + i) * 0.5)}" stroke="#4a2a18" stroke-opacity="${op}" stroke-width=".8" fill="none"/>`;
}).join('');

/* ---------- Pieza larga vista de lado ---------- */

function slab({ L, H, thick, top = '', front = '', wood = 'url(#gWoodTop)', face = 'url(#gWoodV)' }) {
  const w = T;
  const h = L * T + H;
  const x0 = (w - thick) / 2;
  let o = `<ellipse cx="${w / 2}" cy="${h - 2}" rx="${thick / 2 + 7}" ry="3.6" fill="#1a0f08" opacity=".3"/>`;
  o += `<rect x="${x0}" y="${L * T}" width="${thick}" height="${H}" rx="2" fill="${face}" ${ol()}/>`;
  o += `<rect x="${x0}" y="1" width="${thick}" height="${L * T}" rx="3" fill="${wood}" ${ol()}/>`;
  o += `<rect x="${x0 + 1.6}" y="2.6" width="${thick - 3.2}" height="2" rx="1" fill="#fff" opacity=".4"/>`;
  o += typeof top === 'function' ? top(x0, thick) : top;
  o += typeof front === 'function' ? front(x0, thick, L * T, H) : front;
  return wrap(w, h, o);
}

/* ---------- Estantería ---------- */

function shelfFront(f) {
  const w = 72;
  const h = 102;
  const k = hash(f.uid);
  let o = shadow(w, h, 36);
  o += `<rect x="0" y="14" width="${w}" height="84" rx="3" fill="url(#gWoodD)" ${ol()}/>`;
  o += `<rect x="4.5" y="20" width="${w - 9}" height="72" fill="#3a271d"/><rect x="4.5" y="20" width="${w - 9}" height="9" fill="url(#gInnerShade)"/>`;
  f.rows.forEach((row, ri) => {
    const y0 = 21 + ri * 23.5;
    const base = y0 + 20.5;
    let cx = 6.5;
    row.forEach((id, i) => {
      const b = BOOK[id];
      const sh = spineH(id);
      const sw = b.w * 0.62;
      const hh = sh * 0.45;
      const lean = i === row.length - 1 && row.length < 8 && hash(id + f.uid + ri) < 0.35;
      o += `<svg x="${cx}" y="${base - hh}" width="${sw}" height="${hh}" viewBox="0 0 ${b.w} ${sh}" preserveAspectRatio="none" overflow="visible"${lean ? ` transform="rotate(-10 ${cx} ${base})"` : ''}>${spineInner(b, sh)}</svg>`;
      cx += sw + 0.5;
    });
    if (row.length && row.length < 8) o += `<path d="M${cx + 1} ${base} v-7 h2 v7z" fill="#c9a24a"/>`;
    o += `<rect x="4.5" y="${base}" width="${w - 9}" height="3.4" fill="url(#gWoodTop)" ${ol(0.7)}/><rect x="${w - 17}" y="${base + 0.9}" width="9" height="1.8" rx="0.9" fill="${GENRES[GENRE_ORDER[ri]].color}"/>`;
  });
  o += `<rect x="-2" y="8" width="${w + 4}" height="9" rx="2.5" fill="url(#gWoodTop)" ${ol()}/><rect x="-1" y="9" width="${w + 2}" height="2" rx="1" fill="#f0c9a0" opacity=".8"/>`;
  o += `<rect x="1" y="91" width="${w - 2}" height="7" fill="#4a3022" ${ol(0.8)}/><rect x="0.6" y="14" width="3" height="84" fill="#000" opacity=".16"/><rect x="${w - 2.4}" y="14" width="2" height="84" fill="#fff" opacity=".14"/>`;
  // detalle encima: una planta, una vela o unos libros apilados
  if (k < 0.34) o += `<path d="M10 8 l1.6 -6 l1.6 6z" fill="#c8693f"/><path d="M11.6 3 c-4 -2 -5 -5 -3 -7 c3 1 4 4 3 7z M11.6 3 c4 -2 5 -5 3 -7 c-3 1 -4 4 -3 7z" fill="#5fa062" transform="translate(0 4)"/>`;
  else if (k < 0.67) o += `<rect x="12" y="2" width="5" height="6.4" rx="1" fill="#f4efe0" ${ol(0.7)}/><path d="M14.5 2 q-1.4 -3 0 -4.4 q1.4 1.4 0 4.4" fill="#ffb347"/>`;
  else o += `<rect x="8" y="3.4" width="14" height="4.6" rx="1" fill="#2f5d73" ${ol(0.7)}/><rect x="9" y="-0.6" width="12" height="4" rx="1" fill="#e0a93b" ${ol(0.7)}/>`;
  return wrap(w, h, o);
}

function shelfBack() {
  const w = 72;
  const h = 102;
  let o = shadow(w, h, 36);
  o += `<rect x="0" y="14" width="${w}" height="84" rx="3" fill="url(#gWoodV)" ${ol()}/>`;
  o += grain(2, 16, w - 4, 80, 'sb', 9) + `<path d="M0 44 H${w} M0 72 H${w}" stroke="#4a2a18" stroke-opacity=".35" stroke-width="1.4"/>`;
  o += `<rect x="-2" y="8" width="${w + 4}" height="9" rx="2.5" fill="url(#gWoodTop)" ${ol()}/><rect x="1" y="91" width="${w - 2}" height="7" fill="#4a3022" ${ol(0.8)}/>`;
  return wrap(w, h, o);
}

function shelfSide() {
  return slab({
    L: 2, H: BODY.shelf, thick: 24,
    top: (x0, t) => `<rect x="${x0 + 4}" y="12" width="${t - 8}" height="9" rx="1.4" fill="#2f5d73" ${ol(0.7)}/><rect x="${x0 + 5}" y="22" width="${t - 10}" height="7" rx="1.4" fill="#e0a93b" ${ol(0.7)}/><path d="M${x0 + t / 2 - 5} 54 l1.6 -7 h6.8 l1.6 7z" fill="#c8693f" ${ol(0.7)}/><path d="M${x0 + t / 2} 47 c-6 -2 -7 -7 -4 -9 c4 1 5 5 4 9z M${x0 + t / 2} 47 c6 -2 7 -7 4 -9 c-4 1 -5 5 -4 9z" fill="#5fa062" ${ol(0.6)}/>`,
    front: (x0, t, ly, H) => `<rect x="${x0 + 2.4}" y="${ly + 6}" width="${t - 4.8}" height="${H - 14}" rx="1.4" fill="none" stroke="#4a2a18" stroke-opacity=".45" stroke-width="1.2"/>${grain(x0, ly + 6, t, H - 14, 'ss', 7)}`,
  });
}

/* ---------- Mostrador ---------- */

function counterFront() {
  const w = 108;
  const h = 70;
  let o = shadow(w, h, 52);
  o += `<rect x="0" y="34" width="${w}" height="${h - 38}" rx="3" fill="url(#gWoodV)" ${ol()}/>`;
  o += grain(2, 36, w - 4, 28, 'cf', 5);
  o += `<rect x="7" y="42" width="${(w - 20) / 2}" height="${h - 54}" rx="2" fill="none" stroke="#4a2a18" stroke-opacity=".5" stroke-width="1.4"/><rect x="${7 + (w - 20) / 2 + 6}" y="42" width="${(w - 20) / 2}" height="${h - 54}" rx="2" fill="none" stroke="#4a2a18" stroke-opacity=".5" stroke-width="1.4"/>`;
  o += `<rect x="-3" y="24" width="${w + 6}" height="9" rx="2.5" fill="url(#gWoodTop)" ${ol()}/><rect x="-1" y="25" width="${w + 2}" height="2" fill="#f0c9a0" opacity=".85"/>`;
  o += `<rect x="12" y="8" width="26" height="17" rx="2" fill="url(#gMetal)" ${ol(0.9)}/><rect x="15" y="10.5" width="14" height="7" rx="1" fill="#37574d"/><rect x="15" y="19" width="20" height="3.4" rx="1" fill="#b89a5a"/>`;
  o += `<path d="M47 25 q6 -12 12 0z" fill="#e8c36a" ${ol(0.8)}/><circle cx="53" cy="14" r="1.6" fill="#c99a3a"/>`;
  o += `<rect x="73" y="14" width="2.4" height="11" fill="#2f5d50"/><path d="M65 15 q10 -14 22 -3 l-3 5z" fill="#2f5d50" ${ol(0.8)}/><circle cx="83" cy="17" r="2.6" fill="#fff3c4"/>`;
  o += `<rect x="91" y="19" width="16" height="5.4" rx="1" fill="#b0453a" ${ol(0.7)}/><rect x="92" y="14" width="14" height="5.4" rx="1" fill="#2f5d73" ${ol(0.7)}/><rect x="93" y="9.5" width="12" height="4.8" rx="1" fill="#e0a93b" ${ol(0.7)}/>`;
  o += `<path d="M44 34 v14 q4 4 8 0 v-14" fill="#e8d9b8" ${ol(0.7)}/>`; // paño colgando
  return wrap(w, h, o);
}

function counterBack() {
  const w = 108;
  const h = 70;
  let o = shadow(w, h, 52);
  o += `<rect x="0" y="34" width="${w}" height="${h - 38}" rx="3" fill="url(#gWoodD)" ${ol()}/>${grain(2, 36, w - 4, 28, 'cb', 7)}<path d="M0 50 H${w}" stroke="#2a1a10" stroke-opacity=".3"/>`;
  o += `<rect x="-3" y="24" width="${w + 6}" height="9" rx="2.5" fill="url(#gWoodTop)" ${ol()}/>`;
  o += `<rect x="12" y="10" width="26" height="15" rx="2" fill="#b0a890" ${ol(0.9)}/><rect x="91" y="19" width="16" height="5.4" rx="1" fill="#b0453a" ${ol(0.7)}/><rect x="92" y="14" width="14" height="5.4" rx="1" fill="#2f5d73" ${ol(0.7)}/>`;
  return wrap(w, h, o);
}

function counterSide() {
  return slab({
    L: 3, H: BODY.counter, thick: 28,
    top: (x0, t) => `<rect x="${x0 + 4}" y="12" width="20" height="26" rx="2" fill="url(#gMetal)" ${ol(0.9)}/><rect x="${x0 + 7}" y="15" width="14" height="9" rx="1" fill="#37574d"/><circle cx="${x0 + 14}" cy="50" r="3.6" fill="#e8c36a" ${ol(0.7)}/><circle cx="${x0 + 14}" cy="76" r="6" fill="#2f5d50" ${ol(0.8)}/><circle cx="${x0 + 14}" cy="76" r="2" fill="#fff3c4"/><rect x="${x0 + 5}" y="88" width="18" height="9" rx="1.4" fill="#b0453a" ${ol(0.7)}/><rect x="${x0 + 6}" y="97" width="16" height="7" rx="1.4" fill="#2f5d73" ${ol(0.7)}/>`,
    front: (x0, t, ly, H) => `<rect x="${x0 + 3}" y="${ly + 6}" width="${t - 6}" height="${H - 12}" rx="2" fill="none" stroke="#4a2a18" stroke-opacity=".5" stroke-width="1.3"/>${grain(x0, ly + 6, t, H - 12, 'cs', 4)}`,
  });
}

/* ---------- Mesa de novedades ---------- */

function tableFront(f) {
  const w = 72;
  const h = 58;
  let o = shadow(w, h, 32);
  o += `<rect x="6" y="${h - 22}" width="5" height="19" fill="#5e3b26" ${ol(0.8)}/><rect x="${w - 11}" y="${h - 22}" width="5" height="19" fill="#5e3b26" ${ol(0.8)}/>`;
  o += `<rect x="1" y="26" width="${w - 2}" height="${h - 38}" rx="3" fill="url(#gWoodV)" ${ol()}/><rect x="-1" y="18" width="${w + 2}" height="11" rx="3" fill="url(#gWoodTop)" ${ol()}/><rect x="0" y="19" width="${w}" height="2.4" rx="1" fill="#f0c9a0" opacity=".85"/>`;
  o += `<path d="M10 29 h52 v5 h-52z" fill="#c8566b" opacity=".85"/>`; // camino de mesa
  (f.books ?? []).slice(0, 4).forEach((id, i) => {
    o += `<g transform="translate(${6 + i * 15} 1) rotate(${(i - 1.5) * 3} 7 14)"><svg width="14" height="21" viewBox="0 0 120 180">${coverInner(BOOK[id])}</svg></g><rect x="${6 + i * 15}" y="19" width="14" height="2.4" fill="#000" opacity=".2"/>`;
  });
  if (!(f.books ?? []).length) o += `<rect x="22" y="9" width="28" height="9" rx="2" fill="#f4e7c8" ${ol(0.7)}/><path d="M26 13.5 h20" stroke="#a46c44" stroke-width="1.2"/>`;
  return wrap(w, h, o);
}

function tableSide(f) {
  const covers = (f.books ?? []).slice(0, 4);
  return slab({
    L: 2, H: BODY.table, thick: 28,
    top: (x0, t) => covers.map((id, i) => `<rect x="${x0 + 4 + (i % 2) * 11}" y="${8 + Math.floor(i / 2) * 30}" width="9.5" height="14" rx="1" fill="${BOOK[id].pal[0]}" ${ol(0.7)} transform="rotate(${(i - 1.5) * 5} ${x0 + 9} ${15 + Math.floor(i / 2) * 30})"/>`).join('') + `<rect x="${x0 + 3}" y="52" width="${t - 6}" height="8" rx="2" fill="#c8566b" opacity=".85"/>`,
    front: (x0, t, ly, H) => `<rect x="${x0 + 3}" y="${ly + 4}" width="${t - 6}" height="${H - 10}" rx="2" fill="none" stroke="#4a2a18" stroke-opacity=".5" stroke-width="1.2"/>`,
  });
}

/* ---------- Sillón y sofá ---------- */

function armchairFront() {
  const w = 36;
  const h = 58;
  let o = shadow(w, h, 17);
  o += `<rect x="4" y="${h - 9}" width="4" height="7" rx="1.5" fill="#4a2e20" ${ol(0.8)}/><rect x="${w - 8}" y="${h - 9}" width="4" height="7" rx="1.5" fill="#4a2e20" ${ol(0.8)}/>`;
  o += `<path d="M3 30 V13 C3 -1 ${w - 3} -1 ${w - 3} 13 V30Z" fill="url(#gTerra)" ${ol()}/><path d="M8 7 C14 3 22 3 28 7" stroke="#f0a47c" stroke-width="1.6" fill="none" opacity=".8"/>`;
  o += `<circle cx="18" cy="14" r="1" fill="#7a3a22"/><circle cx="12" cy="17" r="1" fill="#7a3a22"/><circle cx="24" cy="17" r="1" fill="#7a3a22"/>`; // capitoné
  o += `<rect x="0" y="22" width="9" height="${h - 28}" rx="4.4" fill="url(#gTerraD)" ${ol()}/><rect x="${w - 9}" y="22" width="9" height="${h - 28}" rx="4.4" fill="url(#gTerraD)" ${ol()}/>`;
  o += `<rect x="6" y="${h - 26}" width="${w - 12}" height="17" rx="5" fill="url(#gTerra)" ${ol()}/><path d="M9 ${h - 17} q9 3.4 18 0" stroke="#f0a47c" stroke-width="1.2" fill="none" opacity=".7"/>`;
  o += `<rect x="19" y="${h - 32}" width="12" height="9" rx="3" fill="#e8c36a" ${ol(0.8)} transform="rotate(-10 25 ${h - 27})"/><path d="M21 ${h - 28} h8" stroke="#c99a3a" stroke-width="1" transform="rotate(-10 25 ${h - 27})"/>`;
  return wrap(w, h, o);
}

function armchairBack() {
  const w = 36;
  const h = 58;
  let o = shadow(w, h, 17);
  o += `<rect x="4" y="${h - 9}" width="4" height="7" rx="1.5" fill="#4a2e20" ${ol(0.8)}/><rect x="${w - 8}" y="${h - 9}" width="4" height="7" rx="1.5" fill="#4a2e20" ${ol(0.8)}/>`;
  o += `<path d="M2 ${h - 8} V13 C2 -1 ${w - 2} -1 ${w - 2} 13 V${h - 8}Z" fill="url(#gTerraD)" ${ol()}/><path d="M18 4 V${h - 10}" stroke="#7a3a22" stroke-width="1.2" opacity=".6"/><path d="M8 14 q10 -4 20 0" stroke="#e59570" stroke-width="1.4" fill="none" opacity=".6"/>`;
  return wrap(w, h, o);
}

// Sillón visto de perfil, mirando a la derecha (rot 3); se refleja para la izquierda
function armchairProfile(facingLeft) {
  const w = 36;
  const h = 58;
  let o = shadow(w, h, 17);
  o += `<rect x="6" y="${h - 9}" width="4" height="7" rx="1.5" fill="#4a2e20" ${ol(0.8)}/><rect x="${w - 10}" y="${h - 9}" width="4" height="7" rx="1.5" fill="#4a2e20" ${ol(0.8)}/>`;
  o += `<rect x="3" y="1" width="12" height="${h - 10}" rx="6" fill="url(#gTerra)" ${ol()}/>`;
  o += `<rect x="9" y="${h - 31}" width="23" height="8" rx="4" fill="#e07e52" ${ol(0.9)}/>`;
  o += `<rect x="6" y="${h - 27}" width="27" height="19" rx="7" fill="url(#gTerraD)" ${ol()}/><path d="M12 ${h - 19} q9 3 18 0" stroke="#f0a47c" stroke-width="1.1" fill="none" opacity=".6"/>`;
  o += `<rect x="12" y="${h - 36}" width="10" height="9" rx="3" fill="#e8c36a" ${ol(0.8)} transform="rotate(8 17 ${h - 31})"/>`;
  return wrap(w, h, facingLeft ? `<g transform="translate(${w} 0) scale(-1 1)">${o}</g>` : o);
}

function sofaFront() {
  const w = 72;
  const h = 58;
  let o = shadow(w, h, 34);
  o += `<rect x="6" y="${h - 8}" width="4" height="6" rx="1.5" fill="#3a271d" ${ol(0.8)}/><rect x="${w - 10}" y="${h - 8}" width="4" height="6" rx="1.5" fill="#3a271d" ${ol(0.8)}/>`;
  o += `<rect x="3" y="8" width="${w - 6}" height="26" rx="9" fill="url(#gTeal)" ${ol()}/><path d="M12 14 q24 -4 48 0" stroke="#a8d8cc" stroke-width="1.6" fill="none" opacity=".7"/>`;
  o += [24, 36, 48].map((x) => `<circle cx="${x}" cy="20" r="1" fill="#2c5850"/>`).join('');
  o += `<rect x="0" y="22" width="10" height="${h - 30}" rx="5" fill="url(#gTealD)" ${ol()}/><rect x="${w - 10}" y="22" width="10" height="${h - 30}" rx="5" fill="url(#gTealD)" ${ol()}/>`;
  o += `<rect x="8" y="${h - 26}" width="${(w - 16) / 2 - 1}" height="18" rx="5" fill="url(#gTeal)" ${ol()}/><rect x="${w / 2 + 1}" y="${h - 26}" width="${(w - 16) / 2 - 1}" height="18" rx="5" fill="url(#gTeal)" ${ol()}/>`;
  o += `<rect x="12" y="${h - 33}" width="13" height="10" rx="3" fill="#e0a93b" ${ol(0.8)} transform="rotate(-8 18 ${h - 28})"/><rect x="${w - 25}" y="${h - 32}" width="12" height="9" rx="3" fill="#d9a5a0" ${ol(0.8)} transform="rotate(10 ${w - 19} ${h - 28})"/>`;
  o += `<path d="M30 ${h - 28} q6 -3 12 0 v8 h-12z" fill="#e8d9b8" opacity=".9" ${ol(0.7)}/>`; // manta
  return wrap(w, h, o);
}

function sofaBack() {
  const w = 72;
  const h = 58;
  let o = shadow(w, h, 34);
  o += `<rect x="6" y="${h - 8}" width="4" height="6" rx="1.5" fill="#3a271d" ${ol(0.8)}/><rect x="${w - 10}" y="${h - 8}" width="4" height="6" rx="1.5" fill="#3a271d" ${ol(0.8)}/>`;
  o += `<rect x="1" y="8" width="${w - 2}" height="${h - 14}" rx="9" fill="url(#gTealD)" ${ol()}/><path d="M${w / 2} 12 V${h - 10}" stroke="#1f4a42" stroke-width="1.2" opacity=".6"/><path d="M10 14 q26 -5 52 0" stroke="#7fbfb2" stroke-width="1.4" fill="none" opacity=".6"/>`;
  return wrap(w, h, o);
}

function sofaSide(facingLeft) {
  const L = 2;
  const H = BODY.sofa;
  const w = T;
  const h = L * T + H;
  const x0 = 3;
  const ww = 30;
  let o = `<ellipse cx="${w / 2}" cy="${h - 2}" rx="21" ry="3.8" fill="#1a0f08" opacity=".3"/>`;
  // lado cercano (brazo y perfil)
  o += `<rect x="${x0}" y="${L * T + 2}" width="${ww}" height="${H - 8}" rx="6" fill="url(#gTealD)" ${ol()}/>`;
  o += `<rect x="${x0}" y="${L * T - 8}" width="10" height="${H + 2}" rx="5" fill="url(#gTeal)" ${ol()}/>`;
  o += `<rect x="${x0 + 12}" y="${L * T + 12}" width="${ww - 14}" height="12" rx="4" fill="#e07e52" opacity="0"/>`;
  // vista superior: respaldo y cojines
  o += `<rect x="${x0}" y="1" width="10" height="${L * T}" rx="5" fill="url(#gTeal)" ${ol()}/>`;
  o += `<rect x="${x0 + 10}" y="4" width="${ww - 10}" height="${L * T / 2 - 4}" rx="6" fill="#6aa59a" ${ol()}/><rect x="${x0 + 10}" y="${L * T / 2 + 2}" width="${ww - 10}" height="${L * T / 2 - 6}" rx="6" fill="#6aa59a" ${ol()}/>`;
  o += `<rect x="${x0 + 12}" y="10" width="11" height="14" rx="3" fill="#e0a93b" ${ol(0.8)} transform="rotate(-10 ${x0 + 17} 17)"/>`;
  return wrap(w, h, facingLeft ? `<g transform="translate(${w} 0) scale(-1 1)">${o}</g>` : o);
}

/* ---------- Muebles pequeños ---------- */

function lamp() {
  const w = 36;
  const h = 94;
  let o = shadow(w, h, 9);
  o += `<ellipse cx="18" cy="${h - 5}" rx="9" ry="3.2" fill="#3a271d" ${ol(0.8)}/><rect x="16.8" y="22" width="2.4" height="${h - 28}" fill="#5a3a26" ${ol(0.6)}/>`;
  o += `<path d="M5 22 L10 3 L26 3 L31 22Z" fill="url(#gShade)" ${ol()}/><path d="M12 5 L10 21 M24 5 L26 21" stroke="#d8a850" stroke-opacity=".5" stroke-width=".8"/><ellipse cx="18" cy="3" rx="8" ry="1.6" fill="#fff3c4" ${ol(0.7)}/>`;
  return wrap(w, h, o);
}

function plant(f) {
  const w = 36;
  const h = 74;
  const k = hash(f.uid);
  let o = shadow(w, h, 12);
  o += `<g class="sway" style="transform-origin:18px ${h - 20}px">`;
  o += `<path d="M18 ${h - 18} C10 ${h - 34} 1 ${h - 40} 3 ${h - 58} C13 ${h - 52} 17 ${h - 38} 18 ${h - 18}Z" fill="url(#gLeaf)" ${ol(0.9)}/>`;
  o += `<path d="M18 ${h - 18} C26 ${h - 36} 35 ${h - 42} 33 ${h - 62} C23 ${h - 54} 19 ${h - 40} 18 ${h - 18}Z" fill="url(#gLeafD)" ${ol(0.9)}/>`;
  o += `<path d="M18 ${h - 18} C14 ${h - 40} 15 ${h - 54} ${20 + k * 4} ${h - 70} C25 ${h - 54} 21 ${h - 38} 18 ${h - 18}Z" fill="url(#gLeaf)" ${ol(0.9)}/><path d="M18 ${h - 20} C16 ${h - 40} 17 ${h - 52} ${20 + k * 3} ${h - 66}" stroke="#2f6a3e" stroke-width=".8" fill="none" opacity=".6"/></g>`;
  o += `<path d="M7 ${h - 20} L29 ${h - 20} L26 ${h - 3} L10 ${h - 3}Z" fill="url(#gPot)" ${ol()}/><rect x="6" y="${h - 23}" width="24" height="5" rx="2" fill="#e08a60" ${ol()}/><rect x="6" y="${h - 23}" width="24" height="1.4" rx=".7" fill="#fff" opacity=".4"/>`;
  o += `<path d="M12 ${h - 12} q6 3 12 0" stroke="#f1e6cc" stroke-width="1.2" fill="none" opacity=".8"/>`;
  return wrap(w, h, o);
}

function side() {
  const w = 36;
  const h = 50;
  let o = shadow(w, h, 12);
  o += `<rect x="16.6" y="${h - 22}" width="2.8" height="19" fill="#5e3b26" ${ol(0.7)}/><ellipse cx="18" cy="${h - 3}" rx="9" ry="2.6" fill="#5e3b26" ${ol(0.7)}/>`;
  o += `<ellipse cx="18" cy="${h - 24}" rx="15" ry="6.4" fill="url(#gWoodTop)" ${ol()}/><ellipse cx="18" cy="${h - 25.4}" rx="12" ry="4" fill="#e0aa7a" opacity=".6"/>`;
  o += `<rect x="8" y="${h - 34}" width="11" height="9" rx="2" fill="#f4efe0" ${ol(0.8)}/><path d="M19 ${h - 31} q4 0 4 3 q0 3 -4 3" stroke="#f4efe0" stroke-width="1.6" fill="none"/><rect x="7" y="${h - 26}" width="13" height="2" rx="1" fill="#e0d6b8"/>`;
  o += `<path d="M11 ${h - 36} q-1.4 -3 0 -5 M15 ${h - 36} q-1.4 -3 0 -5" stroke="#fff" stroke-width="1" fill="none" opacity=".5" class="steam"/>`;
  o += `<rect x="21" y="${h - 31}" width="10" height="4.6" rx="1" fill="#2f5d73" ${ol(0.7)}/>`;
  return wrap(w, h, o);
}

function cat() {
  const w = 36;
  const h = 40;
  let o = `<ellipse cx="18" cy="${h - 4}" rx="16" ry="5" fill="#1a0f08" opacity=".3"/>`;
  o += `<ellipse cx="18" cy="${h - 9}" rx="16" ry="8" fill="#8a5a7a" ${ol()}/><ellipse cx="18" cy="${h - 11}" rx="13" ry="5.6" fill="#a8738f"/>`;
  o += `<g class="breathe" style="transform-origin:18px ${h - 12}px"><ellipse cx="17" cy="${h - 14}" rx="10" ry="6.4" fill="#e0a860" ${ol(0.9)}/><circle cx="26" cy="${h - 17}" r="5.2" fill="#e0a860" ${ol(0.9)}/><path d="M22.5 ${h - 21} l-.6 -5 l4 2.4z M28.5 ${h - 22} l2.2 -4.2 l1.4 4.6z" fill="#e0a860" ${ol(0.8)}/><path d="M24 ${h - 17.5} q1.4 1 2.8 0 M27.6 ${h - 17.5} q1.4 1 2.8 0" stroke="#5a3a22" stroke-width=".9" fill="none" stroke-linecap="round"/><path d="M8 ${h - 13} C2 ${h - 14} 3 ${h - 7} 9 ${h - 8}" fill="none" stroke="#e0a860" stroke-width="3.4" stroke-linecap="round"/><path d="M11 ${h - 17} q4 -2 8 0" stroke="#c98f48" stroke-width="1.4" fill="none" opacity=".7"/></g>`;
  return wrap(w, h, o);
}

function rug(f) {
  const w = 72;
  const h = 72;
  const hue = hash(f.uid) < 0.5 ? ['#8a5a7a', '#c690ac'] : ['#3f7a8a', '#8cc2cc'];
  return wrap(w, h, `<rect x="2" y="3" width="${w - 4}" height="${h - 6}" rx="9" fill="${hue[0]}" ${ol(0.9)}/><rect x="2" y="3" width="${w - 4}" height="${h - 6}" rx="9" fill="url(#gRugShade)"/><rect x="8" y="9" width="${w - 16}" height="${h - 18}" rx="6" fill="none" stroke="#f1e6cc" stroke-width="2" opacity=".85"/><rect x="14" y="15" width="${w - 28}" height="${h - 30}" rx="4" fill="${hue[1]}" opacity=".5"/><path d="M${w / 2} 20 l7 ${(h - 40) / 2} l-7 ${(h - 40) / 2} l-7 -${(h - 40) / 2}z" fill="#f1e6cc" opacity=".75"/><circle cx="${w / 2}" cy="${h / 2}" r="3" fill="${hue[0]}"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${6 + i * 7.5} 3 v-3 M${6 + i * 7.5} ${h - 3} v3" stroke="#f1e6cc" stroke-width="1.2" opacity=".85"/>`).join('')}`, 'rug');
}

function coffee() {
  const w = 36;
  const h = 66;
  let o = shadow(w, h, 14);
  o += `<rect x="3" y="${h - 22}" width="${w - 6}" height="19" rx="2" fill="url(#gWoodV)" ${ol()}/><rect x="1" y="${h - 25}" width="${w - 2}" height="5" rx="2" fill="url(#gWoodTop)" ${ol()}/>`;
  o += `<rect x="7" y="8" width="22" height="${h - 33}" rx="3" fill="#2d2d33" ${ol()}/><rect x="10" y="12" width="16" height="9" rx="1.5" fill="#c9a24a"/><rect x="12" y="${h - 38}" width="12" height="9" fill="#14141a"/><rect x="14" y="${h - 30}" width="8" height="5" rx="1" fill="#f4efe0" ${ol(0.7)}/>`;
  o += `<g class="steam"><path d="M14 6 q-3 -5 0 -9 M22 6 q-3 -5 0 -9" stroke="#fff" stroke-width="1.6" fill="none" opacity=".5"/></g>`;
  return wrap(w, h, o);
}

/* ---------- Selección según giro ---------- */

export function furnSprite(f) {
  const rot = f.rot ?? 0;
  switch (f.type) {
    case 'shelf': return rot % 2 ? shelfSide() : rot === 2 ? shelfBack() : shelfFront(f);
    case 'counter': return rot % 2 ? counterSide() : rot === 2 ? counterBack() : counterFront();
    case 'table': return rot % 2 ? tableSide(f) : tableFront(f);
    case 'armchair': return rot % 2 ? armchairProfile(rot === 1) : rot === 2 ? armchairBack() : armchairFront();
    case 'sofa': return rot % 2 ? sofaSide(rot === 1) : rot === 2 ? sofaBack() : sofaFront();
    case 'lamp': return lamp();
    case 'plant': return plant(f);
    case 'side': return side();
    case 'cat': return cat();
    case 'rug': return rug(f);
    case 'coffee': return coffee();
    default: return '';
  }
}

/* ---------- Personajes (vista 3/4) ---------- */

// p: { skin, hair, coat, pants, style, acc }   dir: 'down' | 'up' | 'left' | 'right'
export function personSprite(p, dir = 'down', opts = {}) {
  const w = 28;
  const h = 54;
  const side = dir === 'left' || dir === 'right';
  const flip = dir === 'left' ? ' transform="translate(28 0) scale(-1 1)"' : '';
  const hairBack = {
    corto: '',
    largo: `<path d="M5 14 C4 1 24 1 23 14 L24 27 Q14 31 4 27Z" fill="${p.hair}"/>`,
    moño: `<circle cx="14" cy="3" r="4.4" fill="${p.hair}"/>`,
    rizado: '',
    gorro: '',
  }[p.style];
  const hairTop = {
    corto: `<path d="M4.6 14 C4 3 24 3 23.4 14 C20 9 8 9 4.6 14Z" fill="${p.hair}"/>`,
    largo: `<path d="M4.6 14 C4 3 24 3 23.4 14 C20 9 8 9 4.6 14Z" fill="${p.hair}"/>`,
    moño: `<path d="M4.6 14 C4 4 24 4 23.4 14 C20 9 8 9 4.6 14Z" fill="${p.hair}"/>`,
    rizado: `<circle cx="7" cy="8" r="4.4" fill="${p.hair}"/><circle cx="14" cy="5" r="5" fill="${p.hair}"/><circle cx="21" cy="8" r="4.4" fill="${p.hair}"/>`,
    gorro: `<path d="M4 13 C4 0 24 0 24 13Z" fill="${p.coat}"/><rect x="3" y="11.4" width="22" height="3.6" rx="1.8" fill="${p.hair}"/><circle cx="14" cy="1.2" r="2.4" fill="${p.hair}"/>`,
  }[p.style];
  const face = dir === 'up' ? ''
    : side ? `<circle cx="19.6" cy="15.6" r="1.2" fill="#2a1b14"/><path d="M22.4 17.4 q1.4 1 0 2.2" stroke="#b9755a" stroke-width=".9" fill="none"/><circle cx="17" cy="18.4" r="1.6" fill="#e8806a" opacity=".35"/>`
      : `<circle cx="10.4" cy="16" r="1.25" fill="#2a1b14"/><circle cx="17.6" cy="16" r="1.25" fill="#2a1b14"/><circle cx="10.8" cy="15.5" r=".4" fill="#fff"/><circle cx="18" cy="15.5" r=".4" fill="#fff"/><path d="M12.4 19.8 q1.6 1.6 3.2 0" stroke="#8a4a3a" stroke-width="1" fill="none" stroke-linecap="round"/><circle cx="8.4" cy="18.6" r="1.7" fill="#e8806a" opacity=".38"/><circle cx="19.6" cy="18.6" r="1.7" fill="#e8806a" opacity=".38"/>`;
  const glasses = p.acc === 'gafas' && dir !== 'up' ? (side ? '<circle cx="19.4" cy="15.8" r="2.8" fill="none" stroke="#2a2a2a" stroke-width=".9"/>' : '<circle cx="10.4" cy="16" r="2.9" fill="none" stroke="#2a2a2a" stroke-width=".9"/><circle cx="17.6" cy="16" r="2.9" fill="none" stroke="#2a2a2a" stroke-width=".9"/><path d="M13.3 16 h1.4" stroke="#2a2a2a" stroke-width=".9"/>') : '';
  const scarf = p.acc === 'bufanda' ? '<rect x="7" y="23" width="14" height="4" rx="2" fill="#c8566b"/>' : '';
  const bag = p.acc === 'bolso' ? `<rect x="${side ? 3 : 19}" y="33" width="9" height="10" rx="2" fill="#e8d9b8" stroke="#8a6a4a" stroke-width=".7"/>` : '';
  const arms = side
    ? `<rect x="11" y="26" width="6" height="15" rx="3" fill="${p.coat}"/><circle cx="14" cy="41.4" r="2.6" fill="${p.skin}"/>`
    : `<rect x="1.6" y="26" width="6" height="15" rx="3" fill="${p.coat}"/><rect x="20.4" y="26" width="6" height="15" rx="3" fill="${p.coat}"/><circle cx="4.6" cy="41.4" r="2.6" fill="${p.skin}"/><circle cx="23.4" cy="41.4" r="2.6" fill="${p.skin}"/>`;
  const body = `<rect x="5" y="23" width="18" height="20" rx="7.4" fill="${p.coat}"/><rect x="5" y="23" width="18" height="20" rx="7.4" fill="url(#gBodyShade)"/><rect x="5" y="37" width="18" height="2.6" fill="#000" opacity=".12"/>`;
  const legs = `<g class="legs"><rect x="7.4" y="41" width="5.4" height="9" rx="2.4" fill="${p.pants}"/><rect x="15.2" y="41" width="5.4" height="9" rx="2.4" fill="${p.pants}"/><ellipse cx="10" cy="51" rx="4" ry="2.3" fill="#2a1f1a"/><ellipse cx="18" cy="51" rx="4" ry="2.3" fill="#2a1f1a"/></g>`;
  const head = `<ellipse cx="14" cy="14.4" rx="9.4" ry="9.8" fill="${p.skin}"/><ellipse cx="11" cy="10" rx="4" ry="2.4" fill="#fff" opacity=".18"/>`;
  const inner = `<ellipse cx="14" cy="52" rx="11" ry="3" fill="#1a0f08" opacity=".3"/>
    <g${flip}><g class="person-body">${legs}${bag}${arms}${body}${scarf}
      ${dir === 'up' ? `${hairBack}<ellipse cx="14" cy="14.4" rx="9.4" ry="9.8" fill="${p.hair}"/>${p.style === 'gorro' ? hairTop : ''}` : `${hairBack}${head}${hairTop}${face}${glasses}`}</g></g>`;
  return wrap(w, h, inner, `person ${opts.seated ? 'seated' : ''}`);
}
