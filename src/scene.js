import { BOOK, GENRES, GENRE_ORDER } from './books.js';
import { spineInner, coverSVG } from './art.js';

export const SCENE_W = 840;
export const SCENE_H = 330;
export const FLOOR_Y = 262;
export const SHELF_X = [262, 396, 530];
export const SHELF_W = 124;
export const ROW_CAP = 8;
export const POS = { door: 38, nook: 175, counter: 690, table: 470, shelf: SHELF_X.map((x) => x + 62) };

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967296;
};

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => {
  const x = hex(a);
  const y = hex(b);
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, '0')).join('')}`;
};

// Cielo según la hora del día (0 = mañana, 1 = noche)
function sky(t) {
  const stops = [
    [0, '#f6dfae', '#9fd0e0'],
    [0.35, '#8fd0f0', '#d4ecf6'],
    [0.7, '#f2a05e', '#7a5a96'],
    [1, '#141f4a', '#2c3274'],
  ];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const k = (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      return [mix(stops[i - 1][1], stops[i][1], k), mix(stops[i - 1][2], stops[i][2], k)];
    }
  }
  return [stops[3][1], stops[3][2]];
}

const spineH = (id) => 40 + Math.floor(hash(id + 'h') * 7);

function shelfUnit(idx, rows, x, unlocked, labelLevel) {
  const y = 40;
  const w = SHELF_W;
  const h = 212;
  if (!unlocked) {
    return `<g class="locked" opacity=".32">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="#f3e6c8" stroke-width="1.6" stroke-dasharray="6 5"/>
      <text x="${x + w / 2}" y="${y + h / 2 - 4}" text-anchor="middle" font-family="Caveat, cursive" font-size="22" fill="#f3e6c8">Estantería</text>
      <text x="${x + w / 2}" y="${y + h / 2 + 20}" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="700" font-size="12" fill="#f3e6c8">Nivel ${labelLevel}</text></g>`;
  }
  let out = `<g class="hot" data-shelf="${idx}">
    <rect x="${x + 4}" y="${y + 6}" width="${w}" height="${h}" rx="4" fill="#000" opacity=".18"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#7a4e32"/>
    <rect x="${x + 6}" y="${y + 14}" width="${w - 12}" height="${h - 24}" fill="#3e2a20"/>
    <rect x="${x - 4}" y="${y - 5}" width="${w + 8}" height="13" rx="3" fill="#8f5d3a"/>
    <rect x="${x - 4}" y="${y - 5}" width="${w + 8}" height="3" rx="1.5" fill="#b07a50"/>
    <rect x="${x + 2}" y="${y + h - 8}" width="${w - 4}" height="8" fill="#5e3b26"/>`;
  rows.forEach((row, ri) => {
    const top = y + 15 + ri * 63;
    const base = top + 55;
    // sombra interior suave
    out += `<rect x="${x + 6}" y="${top}" width="${w - 12}" height="55" fill="url(#shelfShade)"/>`;
    let cx = x + 9;
    row.forEach((id, i) => {
      const b = BOOK[id];
      const sh = spineH(id);
      const lean = i === row.length - 1 && row.length < ROW_CAP && hash(id + idx + ri) < 0.35;
      const tr = lean ? ` transform="rotate(-11 ${cx} ${base})"` : '';
      out += `<svg x="${cx}" y="${base - sh}" width="${b.w}" height="${sh}" viewBox="0 0 ${b.w} ${sh}"${tr} overflow="visible">${spineInner(b, sh)}</svg>`;
      cx += b.w + 0.8;
    });
    // sujetalibros y plaqueta de género
    if (row.length && row.length < ROW_CAP) out += `<path d="M${cx + 1} ${base} v-12 h3 v12z" fill="#c9a24a"/>`;
    out += `<rect x="${x + 6}" y="${base}" width="${w - 12}" height="8" fill="#9a6a44"/><rect x="${x + 6}" y="${base}" width="${w - 12}" height="2" fill="#bd8a5c"/>`;
    out += `<rect x="${x + w - 24}" y="${base + 2.4}" width="14" height="4" rx="2" fill="${GENRES[GENRE_ORDER[ri]].color}"/>`;
  });
  return `${out}</g>`;
}

function plant(x, y, s = 1) {
  return `<g class="sway" transform="translate(${x} ${y}) scale(${s})" style="transform-origin:${x}px ${y}px">
    <path d="M-14 0 L14 0 L10 26 L-10 26Z" fill="#c8693f"/><rect x="-15" y="-3" width="30" height="5" rx="2" fill="#d9794f"/>
    <path d="M0 -3 C-6 -26 -26 -34 -30 -52 C-14 -46 -4 -34 0 -3Z" fill="#4e8a56"/>
    <path d="M0 -3 C6 -30 24 -38 30 -56 C14 -48 4 -32 0 -3Z" fill="#3f7a49"/>
    <path d="M0 -3 C-2 -34 -2 -48 4 -66 C10 -46 6 -30 0 -3Z" fill="#5fa062"/></g>`;
}

function cat(x, y) {
  return `<g class="breathe" transform="translate(${x} ${y})" style="transform-origin:${x}px ${y}px">
    <ellipse cx="0" cy="0" rx="21" ry="11" fill="#d9a05e"/>
    <path d="M-18 -2 C-30 -2 -32 10 -22 11" fill="none" stroke="#d9a05e" stroke-width="6" stroke-linecap="round"/>
    <circle cx="16" cy="-4" r="9.4" fill="#d9a05e"/>
    <path d="M9 -11 l-1 -9 l8 5z M20 -13 l4 -8 l3 9z" fill="#d9a05e"/>
    <path d="M12 -5 q2 1.6 4 0 M18 -5 q2 1.6 4 0" stroke="#5a3a22" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M-6 -6 q4 -4 8 0 M-12 0 q5 -3 9 1" stroke="#b9803e" stroke-width="2" fill="none" opacity=".7"/></g>`;
}

function armchair(x, y) {
  return `<g>
    <ellipse cx="${x + 36}" cy="${y + 84}" rx="44" ry="7" fill="#000" opacity=".2"/>
    <rect x="${x + 6}" y="${y + 74}" width="6" height="12" rx="2" fill="#5a3a26"/><rect x="${x + 60}" y="${y + 74}" width="6" height="12" rx="2" fill="#5a3a26"/>
    <path d="M${x} ${y + 76} V${y + 28} C${x} ${y + 2} ${x + 72} ${y + 2} ${x + 72} ${y + 28} V${y + 76}Z" fill="#b95a36"/>
    <path d="M${x + 12} ${y + 14} C${x + 28} ${y + 8} ${x + 44} ${y + 8} ${x + 60} ${y + 14}" stroke="#d27a52" stroke-width="3" fill="none" opacity=".7"/>
    <rect x="${x - 10}" y="${y + 40}" width="20" height="38" rx="9" fill="#a24c2c"/><rect x="${x + 62}" y="${y + 40}" width="20" height="38" rx="9" fill="#a24c2c"/>
    <rect x="${x + 8}" y="${y + 46}" width="56" height="26" rx="8" fill="#d0693e"/>
    <path d="M${x + 14} ${y + 60} q22 6 44 0" stroke="#e08a60" stroke-width="2" fill="none" opacity=".7"/>
    <rect x="${x + 40}" y="${y + 36}" width="26" height="17" rx="5" fill="#e8c36a" transform="rotate(-10 ${x + 52} ${y + 44})"/></g>`;
}

function floorLamp(x, y) {
  return `<g><rect x="${x - 1.6}" y="${y + 30}" width="3.2" height="${FLOOR_Y - y - 28}" fill="#4a3226"/>
    <ellipse cx="${x}" cy="${FLOOR_Y + 3}" rx="12" ry="3.4" fill="#4a3226"/>
    <path d="M${x - 20} ${y + 32} L${x - 12} ${y} L${x + 12} ${y} L${x + 20} ${y + 32}Z" fill="#f2d28a"/><path d="M${x - 20} ${y + 32} L${x + 20} ${y + 32}" stroke="#d8b062" stroke-width="3"/></g>`;
}

function counter() {
  const x = 664;
  return `<g class="hot" data-counter="1">
    <rect x="${x}" y="214" width="176" height="48" fill="#7a4e32"/><rect x="${x}" y="214" width="176" height="3" fill="#a06a43"/>
    <rect x="${x + 8}" y="224" width="76" height="30" rx="2" fill="none" stroke="#9a6a44" stroke-width="1.6"/><rect x="${x + 92}" y="224" width="76" height="30" rx="2" fill="none" stroke="#9a6a44" stroke-width="1.6"/>
    <rect x="${x - 6}" y="204" width="188" height="12" rx="3" fill="#a46c44"/><rect x="${x - 6}" y="204" width="188" height="3" rx="1.5" fill="#c58a5a"/>
    <rect x="${x + 14}" y="178" width="38" height="26" rx="3" fill="#d9c9a0"/><rect x="${x + 18}" y="182" width="22" height="10" rx="1.5" fill="#37574d"/><rect x="${x + 18}" y="195" width="30" height="5" rx="1" fill="#b89a5a"/>
    <path d="M${x + 64} 204 q8 -16 16 0Z" fill="#e8c36a"/><rect x="${x + 71}" y="188" width="2" height="4" fill="#e8c36a"/>
    <rect x="${x + 96}" y="196" width="34" height="8" rx="1.4" fill="#b0453a"/><rect x="${x + 98}" y="188" width="30" height="8" rx="1.4" fill="#2f5d73"/><rect x="${x + 100}" y="181" width="26" height="7" rx="1.4" fill="#e0a93b"/>
    <rect x="${x + 146}" y="196" width="3" height="8" fill="#2f5d50"/><path d="M${x + 138} 196 q12 -22 28 -4 l-4 4z" fill="#2f5d50"/><circle cx="${x + 154}" cy="186" r="4" fill="#fff3c4"/></g>`;
}

function chalkboard(trend) {
  const lines = trend.slice(0, 2).map((id, i) => `<text x="745" y="${92 + i * 20}" text-anchor="middle" font-family="Caveat, cursive" font-size="${BOOK[id].title.length > 18 ? 14 : 17}" fill="#f6f1de">★ ${BOOK[id].title}</text>`).join('');
  return `<g><rect x="688" y="44" width="116" height="104" rx="4" fill="#8f5d3a"/><rect x="694" y="50" width="104" height="92" rx="2" fill="#1f2d29"/>
    <text x="745" y="72" text-anchor="middle" font-family="Caveat, cursive" font-size="22" font-weight="600" fill="#f6f1de">Tendencias</text>
    <path d="M708 78 H782" stroke="#f6f1de" stroke-width="1" opacity=".6" stroke-dasharray="3 3"/>${lines || `<text x="745" y="98" text-anchor="middle" font-family="Caveat, cursive" font-size="16" fill="#f6f1de" opacity=".7">Hoy, de todo un poco</text>`}</g>`;
}

function windowArch(t, rain) {
  const [s0, s1] = sky(t);
  const night = Math.max(0, (t - 0.6) / 0.4);
  const buildings = [[0, 118, 24], [22, 104, 28], [52, 126, 22], [76, 110, 26], [100, 122, 20]]
    .map(([bx, by, bw]) => `<rect x="${118 + bx}" y="${by + 34}" width="${bw}" height="${176 - by - 34 + 4}" fill="${mix('#3b4a68', '#10152e', night)}"/>${Array.from({ length: 5 }, (_, i) => `<rect x="${118 + bx + 4 + (i % 2) * 11}" y="${by + 42 + Math.floor(i / 2) * 12}" width="5" height="6" fill="${night > 0.4 ? '#ffd78a' : mix('#8aa0c0', '#5a6a8a', t)}" opacity="${night > 0.4 ? 0.95 : 0.5}"/>`).join('')}`).join('');
  return `<g>
    <defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s0}"/><stop offset="1" stop-color="${s1}"/></linearGradient>
    <clipPath id="winClip"><path d="M112 176 V84 A60 60 0 0 1 232 84 V176Z"/></clipPath></defs>
    <path d="M104 182 V84 A68 68 0 0 1 240 84 V182Z" fill="#6e4630"/>
    <g clip-path="url(#winClip)"><rect x="100" y="10" width="150" height="180" fill="url(#skyG)"/>
      ${night > 0.3 ? Array.from({ length: 9 }, (_, i) => `<circle cx="${124 + hash('s' + i) * 100}" cy="${30 + hash('t' + i) * 60}" r="${0.8 + hash('u' + i)}" fill="#fff" opacity="${night * 0.9}" class="twinkle" style="animation-delay:${i * 0.4}s"/>`).join('') : ''}
      ${buildings}
      ${rain ? Array.from({ length: 16 }, (_, i) => `<line class="drop" x1="${116 + i * 7.4}" y1="-10" x2="${111 + i * 7.4}" y2="6" stroke="#dbe9ff" stroke-width="1.1" opacity=".55" style="animation-delay:${(i % 6) * 0.17}s"/>`).join('') : ''}
    </g>
    <path d="M172 24 V176 M112 112 H232" stroke="#6e4630" stroke-width="4"/>
    <path d="M112 176 V84 A60 60 0 0 1 232 84 V176Z" fill="none" stroke="#835538" stroke-width="5"/>
    <rect x="100" y="176" width="144" height="9" rx="3" fill="#8f5d3a"/>
    <path class="sway" d="M96 30 C112 60 112 120 100 170 L84 170 C90 120 90 60 82 28Z" fill="#c8693f" opacity=".92" style="transform-origin:96px 30px"/>
    <path class="sway" d="M248 30 C232 60 232 120 244 170 L260 170 C254 120 254 60 262 28Z" fill="#c8693f" opacity=".92" style="transform-origin:248px 30px"/>
    <path d="M96 30 H104 M240 30 H248" stroke="#e8c36a" stroke-width="3"/></g>`;
}

function door(open) {
  return `<g><rect x="6" y="56" width="66" height="206" rx="3" fill="#5a3a26"/><rect x="12" y="62" width="54" height="196" fill="#7a4e32"/>
    <rect x="18" y="70" width="42" height="108" rx="2" fill="#b9d9e0" opacity=".85"/><path d="M39 70 V178 M18 124 H60" stroke="#5a3a26" stroke-width="2.4"/>
    <circle cx="58" cy="196" r="3" fill="#e8c36a"/><path d="M26 22 q12 -10 24 0 l-4 12 h-16z" fill="#e8c36a"/><circle cx="38" cy="36" r="3" fill="#a67c2a"/>
    <rect x="20" y="132" width="36" height="22" rx="3" fill="${open ? '#4e8a56' : '#b0453a'}" transform="rotate(-4 38 143)"/><text x="38" y="147" text-anchor="middle" font-family="Caveat, cursive" font-size="13" fill="#fff" transform="rotate(-4 38 143)">${open ? 'Abierto' : 'Cerrado'}</text>
    <rect x="14" y="258" width="50" height="6" rx="3" fill="#a24c2c"/></g>`;
}

function stringLights() {
  const pts = Array.from({ length: 22 }, (_, i) => [i * 40 + 10, 8 + Math.sin(i * 1.3) * 3 + (i % 2) * 10]);
  const cols = ['#ffd78a', '#ffb870', '#fff0c0'];
  return `<path d="M0 6 ${pts.map(([x, y]) => `T${x} ${y - 4}`).join(' ')}" fill="none" stroke="#3a2a20" stroke-width="1.4" opacity=".8"/>${pts.map(([x, y], i) => `<circle class="twinkle" cx="${x}" cy="${y + 3}" r="3.4" fill="${cols[i % 3]}" style="animation-delay:${(i % 7) * 0.35}s"/><circle cx="${x}" cy="${y + 3}" r="9" fill="${cols[i % 3]}" opacity=".16"/>`).join('')}`;
}

function table(items) {
  const covers = items.slice(0, 4).map((id, i) => {
    const b = BOOK[id];
    return `<g transform="translate(${430 + i * 22} 286) rotate(${(i - 1.5) * 4})"><svg x="0" y="0" width="22" height="33" viewBox="0 0 120 180">${coverSVG(b, 120, 180).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg></g>`;
  }).join('');
  return `<g class="hot" data-table="1"><ellipse cx="474" cy="326" rx="52" ry="6" fill="#000" opacity=".2"/>
    <rect x="432" y="306" width="5" height="20" fill="#5e3b26"/><rect x="512" y="306" width="5" height="20" fill="#5e3b26"/>
    <rect x="422" y="296" width="104" height="12" rx="3" fill="#a46c44"/><rect x="422" y="296" width="104" height="3" rx="1.5" fill="#c58a5a"/>${covers}
    ${items.length ? '' : '<text x="474" y="290" text-anchor="middle" font-family="Caveat, cursive" font-size="14" fill="#f3e6c8" opacity=".7">Novedades</text>'}</g>`;
}

/*
 * view: { shelves: [rows[][]], owned: Set-like object, table: [], trend: [], t: 0..1, rain: bool, open: bool }
 */
export function sceneSVG(view) {
  const { owned } = view;
  const [, s1] = sky(view.t);
  const night = Math.max(0, (view.t - 0.55) / 0.45);
  const shelfLevels = [1, 4, 7];
  const units = SHELF_X.map((x, i) => shelfUnit(i, view.shelves[i] ?? [[], [], []], x, i === 0 || owned[`shelf${i}`], shelfLevels[i])).join('');
  return `<svg class="scene-svg" viewBox="0 0 ${SCENE_W} ${SCENE_H}" width="${SCENE_W}" height="${SCENE_H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tu librería">
    <defs>
      <pattern id="wp" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M14 4 L24 14 L14 24 L4 14Z" fill="#fff" opacity=".055"/></pattern>
      <linearGradient id="shelfShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".5" stop-color="#000" stop-opacity="0"/></linearGradient>
      <radialGradient id="glow"><stop offset="0" stop-color="#ffd78a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd78a" stop-opacity="0"/></radialGradient>
      <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0f08" stop-opacity=".45"/></radialGradient>
      <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8774c"/><stop offset="1" stop-color="#c79565"/></linearGradient>
    </defs>
    <rect width="${SCENE_W}" height="${FLOOR_Y}" fill="#3a6f66"/><rect width="${SCENE_W}" height="${FLOOR_Y}" fill="url(#wp)"/>
    <rect y="196" width="${SCENE_W}" height="66" fill="#2f5d54"/><rect y="194" width="${SCENE_W}" height="4" fill="#8f5d3a"/><rect y="198" width="${SCENE_W}" height="2" fill="#000" opacity=".18"/>
    ${Array.from({ length: 14 }, (_, i) => `<rect x="${12 + i * 60}" y="206" width="48" height="46" rx="2" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="1.4"/>`).join('')}
    <rect y="${FLOOR_Y}" width="${SCENE_W}" height="${SCENE_H - FLOOR_Y}" fill="url(#floorG)"/><rect y="${FLOOR_Y}" width="${SCENE_W}" height="6" fill="#6e4630"/>
    ${[274, 289, 306].map((y) => `<path d="M0 ${y} H${SCENE_W}" stroke="#6e4630" stroke-opacity=".28"/>`).join('')}
    ${Array.from({ length: 36 }, (_, i) => `<path d="M${(i * 83 + (i % 3) * 20) % SCENE_W} ${i % 3 === 0 ? 268 : i % 3 === 1 ? 280 : 297} v${i % 3 === 0 ? 7 : 10}" stroke="#6e4630" stroke-opacity=".22"/>`).join('')}
    ${windowArch(view.t, view.rain)}
    ${door(view.open)}
    ${owned.lights ? stringLights() : ''}
    ${chalkboard(view.trend)}
    <g opacity=".95"><rect x="684" y="164" width="30" height="22" rx="2" fill="#e8d9b8"/><rect x="688" y="168" width="22" height="14" fill="#c8693f"/></g>
    ${owned.nook ? `<ellipse cx="170" cy="304" rx="78" ry="15" fill="#8a5a7a" opacity=".85"/><ellipse cx="170" cy="304" rx="62" ry="11" fill="none" stroke="#e8d9b8" stroke-width="2" opacity=".6"/>${armchair(136, 196)}${floorLamp(244, 150)}<rect x="226" y="236" width="22" height="26" rx="3" fill="#6e4630"/><rect x="230" y="230" width="14" height="8" rx="2" fill="#f4efe0"/>`
    : `<g class="locked" opacity=".32"><path d="M108 280 V214 C108 190 190 190 190 214 V280Z" fill="none" stroke="#f3e6c8" stroke-width="1.6" stroke-dasharray="6 5"/><text x="148" y="246" text-anchor="middle" font-family="Caveat, cursive" font-size="20" fill="#f3e6c8">Rincón de lectura</text><text x="148" y="266" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="700" font-size="11" fill="#f3e6c8">Nivel 4</text></g>`}
    ${units}
    ${owned.plant ? `${plant(90, 232, 1.05)}${plant(668, 292, 0.7).replace('translate(668 292)', 'translate(826 190)')}` : ''}
    ${counter()}
    ${owned.cat ? (owned.nook ? cat(172, 252) : cat(776, 198)) : ''}
    ${owned.cafe ? '<g><rect x="722" y="168" width="28" height="36" rx="3" fill="#2a2a30"/><rect x="727" y="176" width="18" height="12" fill="#c9a24a"/><path class="steam" d="M730 164 q-4 -8 0 -14 M738 164 q-4 -8 0 -14" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/></g>' : ''}
    ${table(view.table)}
    <ellipse cx="770" cy="170" rx="120" ry="90" fill="url(#glow)" class="flick" opacity=".55"/>
    ${owned.nook ? '<ellipse cx="244" cy="150" rx="120" ry="110" fill="url(#glow)" class="flick" opacity=".5"/>' : ''}
    <rect width="${SCENE_W}" height="${SCENE_H}" fill="${mix('#ff9a4a', '#1a2660', night)}" opacity="${0.04 + night * 0.28}"/>
    <rect width="${SCENE_W}" height="${SCENE_H}" fill="url(#vig)"/>
  </svg>`;
}
