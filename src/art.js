// Ilustraciones por código: motivos de portada, lomos, portadas y clientes.
import { BOOK, romano } from './books.js';

let uid = 0;
const nid = (p) => `${p}${uid++}`;

/* ---------- Motivos (caja 100 × 100) ---------- */

function mixHex(a, b, k) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const x = h(a);
  const y = h(b);
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join('')}`;
}

const mirror = (inner) => `<g transform="translate(100 0) scale(-1 1)">${inner}</g>`;

const MOTIFS = {
  alas: ([, , a, t]) => {
    const wing = `<path d="M50 72 C40 46 22 32 4 24 C12 34 14 44 20 50 C14 50 10 56 6 62 C20 64 30 62 37 66 C33 70 31 76 29 84 C42 82 48 78 50 72Z" fill="${a}"/><path d="M50 72 C42 56 30 46 14 42" stroke="${t}" stroke-width="1" fill="none" opacity=".5"/>`;
    return `${wing}${mirror(wing)}<circle cx="50" cy="30" r="2.4" fill="${t}"/><circle cx="42" cy="20" r="1.4" fill="${t}"/><circle cx="58" cy="16" r="1.6" fill="${t}"/>`;
  },
  luna: ([c0, c1, a, t]) => `<circle cx="46" cy="44" r="34" fill="${t}"/><circle cx="60" cy="38" r="30" fill="${mixHex(c0, c1, 0.3)}"/><path d="M6 90 Q28 70 48 84 T94 76" stroke="${a}" stroke-width="2.4" fill="none"/>${[[18, 80], [36, 78], [58, 86], [78, 80]].map(([x, y]) => `<path d="M${x} ${y} l4 -9 l3 9z" fill="${a}"/>`).join('')}<circle cx="82" cy="30" r="2" fill="${t}"/>`,
  escarcha: ([, , a, t]) => `<polygon points="50,4 62,40 50,80 38,40" fill="${a}"/><polygon points="22,22 34,48 24,76 14,46" fill="${a}" opacity=".7"/><polygon points="78,22 86,46 76,76 66,48" fill="${a}" opacity=".7"/><path d="M50 4 L50 80" stroke="${t}" stroke-width="1" opacity=".6"/><path d="M50 98 L46 82 L50 70 L54 82Z" fill="${t}"/>`,
  hiedra: ([, , a, t]) => `<path d="M16 72 L16 40 L33 56 L50 28 L67 56 L84 40 L84 72Z" fill="${a}"/><rect x="16" y="72" width="68" height="7" fill="${a}"/>${[[10, 80], [26, 86], [44, 88], [62, 86], [78, 82], [90, 76]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="${t}" opacity=".85" transform="rotate(${i % 2 ? 25 : -25} ${x} ${y})"/>`).join('')}<circle cx="50" cy="24" r="3" fill="${t}"/>`,
  cuervo: ([, , a, t]) => `<path d="M14 66 C24 42 46 30 66 34 L90 26 L76 42 C80 58 68 76 46 78 L40 94 L35 78 C24 76 16 72 14 66Z" fill="${t}"/><path d="M26 60 C38 52 52 54 62 60" stroke="${a}" stroke-width="3" fill="none"/><circle cx="68" cy="38" r="2.4" fill="${a}"/>`,
  serpiente: ([, , a, t]) => `<path d="M30 20 C74 18 74 46 42 50 C10 54 28 82 70 80" stroke="${a}" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="72" cy="80" r="5" fill="${a}"/><path d="M80 18 q10 -12 18 -2 q-8 2 -10 10 q-6 2 -8 -8z" fill="${t}"/>`,
  llama: ([, , a, t]) => `<path d="M50 6 C60 28 80 38 74 62 C72 78 60 92 50 92 C38 92 26 80 26 62 C26 48 38 44 40 30 C46 40 48 26 50 6Z" fill="${a}"/><path d="M50 40 C56 54 64 60 60 72 C58 80 54 84 50 84 C44 84 40 78 40 70 C40 62 46 58 46 52 C48 56 50 50 50 40Z" fill="${t}" opacity=".85"/>`,
  anillo: ([, , a, t]) => `<circle cx="50" cy="50" r="30" fill="none" stroke="${a}" stroke-width="10"/><circle cx="50" cy="50" r="24" fill="none" stroke="${t}" stroke-width="1" opacity=".6"/>${Array.from({ length: 12 }, (_, i) => `<rect x="48.5" y="14" width="3" height="6" fill="${t}" transform="rotate(${i * 30} 50 50)" opacity=".8"/>`).join('')}`,
  espadas: ([, , a, t]) => [-48, -24, 0, 24, 48].map((d) => `<g transform="rotate(${d} 50 96)"><path d="M50 96 L46.5 26 L50 6 L53.5 26Z" fill="${d === 0 ? a : t}"/><rect x="43" y="74" width="14" height="3" fill="${a}"/></g>`).join(''),
  // dos torres con almenas, unidas por un muro, y una luna roja entre ellas
  atalayas: ([, , a, t]) => {
    const tower = (x, top, w) => {
      const cren = Array.from({ length: 4 }, (_, i) => '<rect x="' + (x - 3 + i * ((w + 6 - 4.2) / 3)) + '" y="' + (top - 7) + '" width="4.2" height="7" fill="' + t + '"/>').join('');
      return '<rect x="' + x + '" y="' + top + '" width="' + w + '" height="' + (92 - top) + '" fill="' + t + '"/><rect x="' + (x - 3) + '" y="' + (top - 1) + '" width="' + (w + 6) + '" height="5" fill="' + t + '"/>' + cren
        + '<path d="M' + (x + w / 2 - 3) + ' ' + (top + 24) + ' v10 a3 3 0 0 1 6 0 v-10 a3 3 0 0 0 -6 0z" fill="' + a + '"/>'
        + '<rect x="' + (x + w / 2 - 1) + '" y="' + (top + 46) + '" width="2" height="7" fill="' + a + '"/>';
    };
    return '<circle cx="50" cy="26" r="11" fill="' + a + '" opacity=".9"/><circle cx="54" cy="23" r="10" fill="#17181b" opacity=".35"/>'
      + '<rect x="30" y="64" width="40" height="28" fill="' + t + '" opacity=".75"/>'
      + tower(14, 34, 18) + tower(68, 28, 18)
      + '<path d="M44 92 v-12 a6 6 0 0 1 12 0 v12z" fill="' + a + '"/>';
  },
  gafas: ([, , a, t]) => `<circle cx="32" cy="58" r="19" fill="none" stroke="${a}" stroke-width="5"/><circle cx="68" cy="58" r="19" fill="none" stroke="${a}" stroke-width="5"/><path d="M50 56 q0 -6 0 0" stroke="${a}" stroke-width="5"/><path d="M51 53 L49 53" stroke="${a}" stroke-width="5"/><path d="M62 4 L48 28 L57 28 L50 46 L70 22 L60 22Z" fill="${t}"/>`,
  viento: ([, , a, t]) => `<path d="M50 50 a4 4 0 0 1 8 0 a10 10 0 0 1 -20 0 a18 18 0 0 1 36 0 a26 26 0 0 1 -52 0 a34 34 0 0 1 68 0 a42 42 0 0 1 -84 0" stroke="${a}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="50" cy="50" r="3" fill="${t}"/>`,
  niebla: ([, , a, t]) => `<circle cx="50" cy="26" r="11" fill="${t}"/>${[46, 58, 70, 82].map((y, i) => `<path d="M0 ${y} Q16 ${y - 8} 32 ${y} T64 ${y} T100 ${y} V${y + 8} H0Z" fill="${i % 2 ? a : t}" opacity="${0.75 - i * 0.12}"/>`).join('')}`,
  ojo: ([bg, , a, t]) => `<path d="M4 50 Q50 6 96 50 Q50 94 4 50Z" fill="${a}"/><ellipse cx="50" cy="50" rx="7" ry="30" fill="${bg}"/><circle cx="62" cy="38" r="4" fill="${t}" opacity=".8"/>`,
  gema: ([, , a, t]) => `<polygon points="50,6 86,34 72,92 28,92 14,34" fill="${a}"/><polygon points="50,6 86,34 50,46 14,34" fill="${t}" opacity=".45"/><path d="M14 34 L50 46 L86 34 M50 46 L28 92 M50 46 L72 92" stroke="${t}" stroke-width="1.2" fill="none" opacity=".7"/>`,
  silueta: ([, , a, t]) => `<path d="M10 96 C10 70 28 62 40 60 L40 56 C30 52 28 40 32 28 C36 14 50 10 62 14 L62 96Z" fill="${t}"/><path d="M62 12 L66 30 L60 44 L68 60 L62 76 L70 96" stroke="${a}" stroke-width="3" fill="none"/><path d="M62 14 L98 14 L98 96 L70 96 L62 76 L68 60 L60 44 L66 30Z" fill="${t}" opacity=".1"/>`,
  tatuaje: ([, , a, t]) => `<path d="M26 94 C4 62 62 62 40 38 C30 26 50 12 70 20" stroke="${a}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M70 20 l16 -6 l-4 14 q-6 0 -12 -8z" fill="${a}"/><path d="M40 62 q22 -14 32 -2 q-14 -2 -18 10z" fill="${a}" opacity=".7"/><circle cx="79" cy="19" r="1.6" fill="${t}"/>`,
  vitruvio: ([, , a, t]) => `<circle cx="50" cy="50" r="38" fill="none" stroke="${a}" stroke-width="3"/><rect x="18" y="18" width="64" height="64" fill="none" stroke="${a}" stroke-width="3"/><path d="M50 14 L50 86 M14 50 L86 50" stroke="${t}" stroke-width="1.4" opacity=".7"/><circle cx="50" cy="50" r="6" fill="${t}"/>`,
  rostro: ([, , a, t]) => `<ellipse cx="50" cy="50" rx="30" ry="38" fill="none" stroke="${t}" stroke-width="3"/><circle cx="38" cy="42" r="3.4" fill="${t}"/><circle cx="62" cy="42" r="3.4" fill="${t}"/><path d="M36 68 L64 68" stroke="${t}" stroke-width="3"/><path d="M42 64 L42 72 M50 64 L50 72 M58 64 L58 72" stroke="${a}" stroke-width="1.6"/>`,
  isla: ([, , a, t]) => `<path d="M16 72 Q50 34 84 72Z" fill="${a}"/>${Array.from({ length: 10 }, (_, i) => `<circle cx="${22 + i * 6.2}" cy="${64 - Math.sin((i / 9) * Math.PI) * 18}" r="2.3" fill="${t}"/>`).join('')}<path d="M6 80 q11 -7 22 0 t22 0 t22 0 t22 0" stroke="${t}" stroke-width="2" fill="none"/><path d="M6 90 q11 -7 22 0 t22 0 t22 0 t22 0" stroke="${t}" stroke-width="2" fill="none" opacity=".6"/>`,
  tren: ([, , a, t]) => `<rect x="12" y="14" width="76" height="52" rx="10" fill="none" stroke="${t}" stroke-width="4"/><path d="M24 40 Q50 22 76 40 Q50 58 24 40Z" fill="${t}" opacity=".9"/><circle cx="50" cy="40" r="6" fill="${a}"/><path d="M34 96 L44 70 M66 96 L56 70" stroke="${t}" stroke-width="3"/><path d="M38 86 L62 86 M42 78 L58 78" stroke="${t}" stroke-width="2.4"/>`,

  dunas: ([, , a, t]) => `<circle cx="68" cy="26" r="13" fill="${t}"/><path d="M0 66 Q26 40 52 62 T100 56 V100 H0Z" fill="${a}"/><path d="M0 80 Q30 60 60 78 T100 74 V100 H0Z" fill="${t}" opacity=".35"/><path d="M0 90 Q34 76 64 90 T100 88 V100 H0Z" fill="${a}" opacity=".6"/>`,
  soles: ([, , a, t]) => `<circle cx="26" cy="34" r="14" fill="${a}"/><circle cx="62" cy="22" r="10" fill="${t}"/><circle cx="64" cy="64" r="17" fill="${a}" opacity=".85"/><path d="M8 84 Q50 70 92 84" stroke="${t}" stroke-width="1.6" fill="none" opacity=".6"/><circle cx="22" cy="78" r="2" fill="${t}"/>`,
  cohete: ([, , a, t]) => `<path d="M50 6 C66 22 68 48 62 66 H38 C32 48 34 22 50 6Z" fill="${t}"/><circle cx="50" cy="38" r="8" fill="${a}"/><path d="M38 56 L24 74 L38 70Z M62 56 L76 74 L62 70Z" fill="${a}"/><path d="M42 70 Q50 96 58 70Z" fill="${a}" opacity=".9"/>`,
  lapida: ([, , a, t]) => `<path d="M26 90 V42 Q26 16 50 16 Q74 16 74 42 V90Z" fill="${t}" opacity=".92"/><path d="M50 32 V62 M38 44 H62" stroke="${a}" stroke-width="5" stroke-linecap="round"/><path d="M0 92 H100" stroke="${a}" stroke-width="3"/><ellipse cx="82" cy="84" rx="9" ry="6" fill="${a}" opacity=".7"/>`,
  globo: ([, , a, t]) => `<ellipse cx="50" cy="36" rx="22" ry="27" fill="${a}"/><path d="M50 63 L45 70 H55Z" fill="${a}"/><path d="M50 70 C42 80 58 86 50 98" stroke="${t}" stroke-width="2" fill="none"/><path d="M38 24 Q42 16 50 14" stroke="${t}" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`,
  buho: ([, , a, t]) => `<path d="M22 24 L34 36 L66 36 L78 24 L80 62 C80 82 66 92 50 92 C34 92 20 82 20 62Z" fill="${a}"/><circle cx="38" cy="50" r="11" fill="${t}"/><circle cx="62" cy="50" r="11" fill="${t}"/><circle cx="38" cy="50" r="4.5" fill="#111"/><circle cx="62" cy="50" r="4.5" fill="#111"/><path d="M46 60 L50 68 L54 60Z" fill="${t}"/>`,
  farola: ([, , a, t]) => `<path d="M50 94 V30 Q50 16 64 16 H72" stroke="${t}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M66 18 H80 L77 32 H69Z" fill="${a}"/><path d="M69 32 L58 94 H92Z" fill="${a}" opacity=".25"/><rect x="42" y="90" width="16" height="4" fill="${t}"/>`,
  sombrilla: ([, , a, t]) => `<path d="M8 50 Q50 -6 92 50Z" fill="${a}"/><path d="M8 50 Q22 40 34 50 Q42 40 50 50 Q58 40 66 50 Q78 40 92 50" fill="${t}" opacity=".35"/><path d="M50 50 V82 Q50 92 40 90" stroke="${t}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M22 14 q3 -8 8 0 q5 -8 8 0 q-8 10 -16 0Z" fill="${a}" opacity=".7" transform="translate(40 -4)"/>`,
  abanico: ([, , a, t]) => `${[-60, -40, -20, 0, 20, 40, 60].map((d, i) => `<path d="M50 92 L44 20 Q50 12 56 20Z" fill="${i % 2 ? t : a}" transform="rotate(${d} 50 92)"/>`).join('')}<circle cx="50" cy="92" r="5" fill="${t}"/>`,
  sol: ([, , a, t]) => `<circle cx="50" cy="46" r="18" fill="${a}"/>${Array.from({ length: 12 }, (_, i) => `<path d="M50 14 V22" stroke="${a}" stroke-width="4" stroke-linecap="round" transform="rotate(${i * 30} 50 46)"/>`).join('')}<path d="M0 78 Q25 70 50 78 T100 78 V100 H0Z" fill="${t}" opacity=".35"/><path d="M0 88 Q25 80 50 88 T100 88 V100 H0Z" fill="${a}" opacity=".5"/>`,
  catedral: ([, , a, t]) => `<path d="M14 92 V40 L24 22 L34 40 V92Z M66 92 V40 L76 22 L86 40 V92Z" fill="${a}"/><path d="M34 92 V54 Q50 34 66 54 V92Z" fill="${t}" opacity=".85"/><path d="M50 40 V16 M44 24 H56" stroke="${t}" stroke-width="3"/><circle cx="50" cy="64" r="5" fill="${a}"/>`,
  piramide: ([, , a, t]) => `<circle cx="74" cy="20" r="9" fill="${t}"/><path d="M6 90 L44 26 L82 90Z" fill="${a}"/><path d="M44 26 L82 90 H56Z" fill="#000" opacity=".25"/><path d="M52 90 L74 56 L96 90Z" fill="${t}" opacity=".7"/>`,
  cipres: ([, , a, t]) => `<path d="M50 6 C66 26 70 56 62 90 H38 C30 56 34 26 50 6Z" fill="${a}"/><path d="M50 18 V90" stroke="${t}" stroke-width="1.4" opacity=".5"/><path d="M0 92 Q50 84 100 92" stroke="${t}" stroke-width="2" fill="none"/><circle cx="20" cy="22" r="7" fill="${t}" opacity=".85"/>`,
  toalla: ([, , a, t]) => `<rect x="22" y="12" width="56" height="72" rx="4" fill="${a}"/><path d="M22 28 H78 M22 44 H78 M22 60 H78" stroke="${t}" stroke-width="5" opacity=".9"/><path d="M26 84 v8 M38 84 v8 M50 84 v8 M62 84 v8 M74 84 v8" stroke="${a}" stroke-width="2.5"/><circle cx="82" cy="18" r="3" fill="${t}"/>`,
  asteroide: ([, , a, t]) => `<circle cx="50" cy="70" r="22" fill="${t}" opacity=".9"/><circle cx="42" cy="66" r="4" fill="${a}" opacity=".6"/><circle cx="58" cy="76" r="3" fill="${a}" opacity=".6"/><circle cx="50" cy="30" r="8" fill="${a}"/><path d="M42 40 Q50 36 58 40 L56 52 H44Z" fill="${a}"/><path d="M60 38 q14 4 18 -10" stroke="${a}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M18 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="${t}"/>`,
  monstruo: ([, , a, t]) => `<path d="M20 90 C14 54 28 20 50 20 C72 20 86 54 80 90 Q70 82 62 90 Q50 80 38 90 Q28 82 20 90Z" fill="${a}"/><circle cx="40" cy="48" r="8" fill="#fff"/><circle cx="60" cy="48" r="8" fill="#fff"/><circle cx="42" cy="50" r="4" fill="${t}"/><circle cx="58" cy="50" r="4" fill="${t}"/><path d="M40 66 Q50 74 60 66" stroke="${t}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="26" cy="30" r="5" fill="#f2c94c"/><circle cx="76" cy="26" r="5" fill="#e8553a"/><circle cx="84" cy="50" r="4" fill="#5b8ad0"/>`,
  atomo: ([, , a, t]) => `<circle cx="50" cy="50" r="7" fill="${a}"/>${[0, 60, 120].map((d) => `<ellipse cx="50" cy="50" rx="38" ry="14" fill="none" stroke="${a}" stroke-width="2.6" transform="rotate(${d} 50 50)"/>`).join('')}<circle cx="88" cy="50" r="3.6" fill="${t}"/><circle cx="31" cy="83" r="3.6" fill="${t}"/><circle cx="31" cy="17" r="3.6" fill="${t}"/>`,
  mano: ([, , a, t]) => `<circle cx="50" cy="50" r="40" fill="${a}" opacity=".35"/><path d="M34 82 C26 66 28 56 30 46 L26 30 Q28 26 31 30 L35 40 L36 18 Q40 14 42 18 L44 38 L46 12 Q50 8 52 12 L52 38 L56 18 Q60 16 61 20 L58 42 L66 34 Q70 34 68 40 L62 58 C66 70 58 82 50 84Z" fill="${t}"/>`,
  olla: ([, , a, t]) => `<path d="M20 42 H80 V70 Q80 88 62 88 H38 Q20 88 20 70Z" fill="${a}"/><rect x="14" y="36" width="72" height="8" rx="4" fill="${a}"/><path d="M14 52 H4 M86 52 H96" stroke="${a}" stroke-width="5" stroke-linecap="round"/><path d="M36 28 q-6 -8 0 -14 M50 28 q-6 -8 0 -14 M64 28 q-6 -8 0 -14" stroke="${t}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/><path d="M30 60 H70" stroke="${t}" stroke-width="3" opacity=".5"/>`,
  brujula: ([, , a, t]) => `<circle cx="50" cy="50" r="36" fill="none" stroke="${a}" stroke-width="5"/><circle cx="50" cy="50" r="28" fill="${t}" opacity=".5"/><path d="M50 22 L58 50 L50 78 L42 50Z" fill="${a}"/><path d="M50 22 L58 50 H42Z" fill="#c8452a"/><circle cx="50" cy="50" r="4" fill="${t}"/><rect x="45" y="8" width="10" height="6" rx="2" fill="${a}"/>`,
};

export const motifSVG = (book, size = 90) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${MOTIFS[book.motif](book.pal)}</svg>`;

/* ---------- Lomos ---------- */

const FONTS = {
  fraunces: { family: "Fraunces, Georgia, serif", weight: 700, upper: false },
  cinzel: { family: "Cinzel, Georgia, serif", weight: 700, upper: true },
  oswald: { family: "Oswald, 'Arial Narrow', sans-serif", weight: 500, upper: true },
};

export function spineInner(book, h = 46) {
  const w = book.w;
  const [c0, c1, ca, ct] = book.pal;
  const light = book.pal[3] === '#1a1a1a';
  const ms = w * 0.78;
  const f = FONTS[book.font];
  const y0 = 6 + ms + 3;
  const len = Math.max(10, h - y0 - 6);
  const fs = Math.min(w * 0.5, 7.2);
  const title = f.upper ? book.title.toUpperCase() : book.title;
  return `
    <rect width="${w}" height="${h}" rx="1.2" fill="${c0}"/>
    <rect y="${h * 0.46}" width="${w}" height="${h * 0.54}" fill="${c1}" opacity=".92"/>
    <rect width="${w}" height="3" fill="${ca}"/><rect y="${h - 3}" width="${w}" height="3" fill="${ca}"/>
    <g transform="translate(${(w - ms) / 2} 5.5) scale(${ms / 100})">${MOTIFS[book.motif](book.pal)}</g>
    <text transform="translate(${w / 2 + fs * 0.34} ${y0}) rotate(90)" font-family="${f.family}" font-weight="${f.weight}" font-size="${fs}" fill="${light ? '#1a1a1a' : ct}" textLength="${Math.min(len, title.length * fs * 0.62)}" lengthAdjust="spacingAndGlyphs">${title}</text>
    <rect width="1.3" height="${h}" fill="#fff" opacity=".2"/><rect x="${w - 1.6}" width="1.6" height="${h}" fill="#000" opacity=".22"/>`;
}

export const spineSVG = (book, h = 46, scale = 1) => `<svg class="spine" width="${book.w * scale}" height="${h * scale}" viewBox="0 0 ${book.w} ${h}" aria-hidden="true">${spineInner(book, h)}</svg>`;

/* ---------- Portadas ---------- */

function wrap(text, max) {
  const out = [];
  let line = '';
  for (const w of text.split(' ')) {
    if ((line + ' ' + w).trim().length > max && line) {
      out.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  return out;
}

export function coverSVG(book, dw = 120, dh = 180) {
  const w = 120;
  const h = 180;
  const [c0, c1, ca, ct] = book.pal;
  const light = ct === '#1a1a1a';
  const f = FONTS[book.font];
  const g = nid('cg');
  const title = f.upper ? book.title.toUpperCase() : book.title;
  const lines = wrap(title, f.upper ? 10 : 12);
  const fs = lines.length > 3 ? 11.5 : lines.length === 3 ? 13 : 15;
  const ty = h * 0.64;
  const avail = w - 22;
  const text = lines.map((l, i) => {
    const natural = l.length * fs * (f.upper ? 0.74 : 0.56);
    const fit = natural > avail ? ` textLength="${avail}" lengthAdjust="spacingAndGlyphs"` : '';
    return `<text x="${w / 2}" y="${ty + i * (fs + 3)}" text-anchor="middle" font-family="${f.family}" font-weight="${f.weight}" font-size="${fs}" fill="${light ? '#1a1a1a' : ct}"${fit}>${l}</text>`;
  }).join('');
  return `<svg class="cover" width="${dw}" height="${dh}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient></defs>
    <rect width="${w}" height="${h}" rx="3" fill="url(#${g})"/>
    <rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="2" fill="none" stroke="${ca}" stroke-width="${book.ed ? 1.6 : .8}" opacity="${book.ed ? 1 : .65}"/>${book.ed ? `<rect x="9" y="9" width="${w - 18}" height="${h - 18}" rx="1" fill="none" stroke="${ca}" stroke-width=".6"/>${[[9, 9, 1, 1], [w - 9, 9, -1, 1], [9, h - 9, 1, -1], [w - 9, h - 9, -1, -1]].map(([x, y, sx, sy]) => `<path d="M${x} ${y + sy * 12} Q${x} ${y} ${x + sx * 12} ${y}" fill="none" stroke="${ca}" stroke-width="1.2"/><circle cx="${x + sx * 3.5}" cy="${y + sy * 3.5}" r="1.3" fill="${ca}"/>`).join('')}<text x="${w / 2}" y="15" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="5" letter-spacing="1.6" fill="${ca}">★ EDICIÓN ESPECIAL ★</text>` : ''}
    <g transform="translate(${w / 2 - 38} ${h * 0.09}) scale(.76)">${MOTIFS[book.motif](book.pal)}</g>
    ${text}
    <path d="M${w * 0.3} ${h - 25} H${w * 0.7}" stroke="${ca}" stroke-width=".8" opacity=".8"/>
    <text x="${w / 2}" y="${h - 13}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="700" font-size="6.2" letter-spacing="1.2" fill="${light ? '#333' : ct}" opacity=".85">${book.author.toUpperCase()}</text>
    ${book.saga ? `<g><rect x="${w - 30}" y="5" width="25" height="19" rx="2" fill="#000" opacity=".5"/><text x="${w - 17.5}" y="18" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="11" fill="#fff">${romano(book.saga.n)}</text></g>` : ''}
    <rect width="3" height="${h}" fill="#000" opacity=".18"/><rect x="3" width="1" height="${h}" fill="#fff" opacity=".18"/>
  </svg>`;
}

/* ---------- Clientes ---------- */

const SKINS = ['#f1c9a5', '#e0a97c', '#c98b5e', '#a8693f', '#7a4a2c', '#f6d9c0'];
const HAIRS = ['#2a1b14', '#5a3a22', '#b5651d', '#d8a657', '#1a1a1a', '#8a8a8a', '#b8442e', '#3a2a4a'];
const COATS = ['#c8693f', '#e0a93b', '#5b8a8f', '#8a5a7a', '#6a8a4f', '#d9a5a0', '#4a6fa5', '#b0453a', '#e8d9b8'];
const PANTS = ['#35435a', '#4a3a2e', '#2a2a30', '#6a5a46', '#3a4a3a'];

export function randomPerson(rand = Math.random) {
  const pick = (a) => a[Math.floor(rand() * a.length)];
  return {
    skin: pick(SKINS), hair: pick(HAIRS), coat: pick(COATS), pants: pick(PANTS),
    style: pick(['corto', 'largo', 'moño', 'rizado', 'gorro']), acc: pick(['gafas', 'bufanda', 'bolso', 'nada', 'nada']),
  };
}

export function personSVG(p, size = 1) {
  const hair = {
    corto: `<path d="M12 15 C12 5 28 5 28 15 C24 11 16 11 12 15Z" fill="${p.hair}"/>`,
    largo: `<path d="M11 16 C10 3 30 3 29 16 L30 30 L26 28 L26 16 C22 12 18 12 14 16 L14 28 L10 30Z" fill="${p.hair}"/>`,
    moño: `<circle cx="20" cy="4.5" r="4.4" fill="${p.hair}"/><path d="M12 15 C12 6 28 6 28 15 C24 11 16 11 12 15Z" fill="${p.hair}"/>`,
    rizado: `<circle cx="13" cy="10" r="4.4" fill="${p.hair}"/><circle cx="20" cy="6.6" r="4.8" fill="${p.hair}"/><circle cx="27" cy="10" r="4.4" fill="${p.hair}"/>`,
    gorro: `<path d="M11 15 C11 3 29 3 29 15Z" fill="${p.coat}"/><rect x="10" y="13.5" width="20" height="3.2" rx="1.6" fill="${p.hair}"/><circle cx="20" cy="2.6" r="2.4" fill="${p.hair}"/>`,
  }[p.style];
  const acc = {
    gafas: '<circle cx="16.2" cy="19.6" r="3" fill="none" stroke="#2a2a2a" stroke-width="1"/><circle cx="23.8" cy="19.6" r="3" fill="none" stroke="#2a2a2a" stroke-width="1"/><path d="M19.2 19.6 h1.6" stroke="#2a2a2a" stroke-width="1"/>',
    bufanda: `<rect x="11" y="29" width="18" height="5" rx="2.4" fill="#c8566b"/><rect x="24" y="30" width="4" height="10" rx="1.6" fill="#c8566b"/>`,
    bolso: `<rect x="29" y="44" width="9" height="11" rx="2" fill="#e8d9b8" stroke="#8a6a4a" stroke-width=".8"/><path d="M31 44 C31 39 36 39 36 44" fill="none" stroke="#8a6a4a" stroke-width="1"/>`,
    nada: '',
  }[p.acc];
  return `<svg class="person" width="${40 * size}" height="${92 * size}" viewBox="0 0 40 92" aria-hidden="true">
    <ellipse cx="20" cy="89" rx="14" ry="3" fill="#000" opacity=".22"/>
    <g class="legs"><rect x="13" y="62" width="6" height="25" rx="2.6" fill="${p.pants}"/><rect x="21" y="62" width="6" height="25" rx="2.6" fill="${p.pants}"/>
      <rect x="12" y="84" width="8" height="4.4" rx="2" fill="#2a1f1a"/><rect x="20" y="84" width="8" height="4.4" rx="2" fill="#2a1f1a"/></g>
    <rect x="9" y="30" width="22" height="36" rx="8" fill="${p.coat}"/>
    <rect x="9" y="58" width="22" height="4" fill="#000" opacity=".12"/>
    <rect x="5.4" y="32" width="6" height="26" rx="3" fill="${p.coat}"/><rect x="28.6" y="32" width="6" height="26" rx="3" fill="${p.coat}"/>
    <circle cx="8.4" cy="59" r="3" fill="${p.skin}"/><circle cx="31.6" cy="59" r="3" fill="${p.skin}"/>
    <rect x="17" y="26" width="6" height="6" fill="${p.skin}"/>
    <ellipse cx="20" cy="18" rx="9.4" ry="10" fill="${p.skin}"/>
    ${hair}
    <circle cx="16.4" cy="19.6" r="1.1" fill="#2a1b14"/><circle cx="23.6" cy="19.6" r="1.1" fill="#2a1b14"/>
    <path d="M17.6 23.8 q2.4 1.8 4.8 0" stroke="#8a4a3a" stroke-width="1" fill="none" stroke-linecap="round"/>
    <circle cx="14" cy="22.4" r="1.7" fill="#e8806a" opacity=".35"/><circle cx="26" cy="22.4" r="1.7" fill="#e8806a" opacity=".35"/>
    ${acc}
  </svg>`;
}

export const book = (id) => BOOK[id];
