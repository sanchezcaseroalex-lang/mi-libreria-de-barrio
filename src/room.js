// La sala vista en 3/4: fondo (pared y suelo), luz y capa de muebles.
import { T, COLS, ROWS, WALL_H, ROOM_W, ROOM_H, FURN, placed, dims } from './layout.js';
import { BOOK } from './books.js';
import { furnSprite, spriteSize } from './sprites.js';

export const cellX = (c) => c * T;
export const cellY = (r) => WALL_H + r * T;

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

export const nightness = (t) => Math.max(0, Math.min(1, (t - 0.55) / 0.4));

/* ---------- Pared y suelo ---------- */

function wallAndFloor(v) {
  const [s0, s1] = sky(v.t);
  const night = nightness(v.t);
  const [wx, wy, ww] = [96, 14, 76];
  let o = '';
  // pared
  o += `<rect width="${ROOM_W}" height="${WALL_H}" fill="url(#gWall)"/><rect width="${ROOM_W}" height="${WALL_H}" fill="url(#wp)"/>`;
  o += `<rect y="52" width="${ROOM_W}" height="${WALL_H - 52}" fill="#2b564e"/><rect y="50" width="${ROOM_W}" height="3.4" fill="#8f5d3a"/><rect y="50" width="${ROOM_W}" height="1.2" fill="#c8956a"/>`;
  for (let i = 0; i < 9; i++) o += `<rect x="${5 + i * 40}" y="58" width="32" height="18" rx="1.6" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="1.2"/><rect x="${5 + i * 40}" y="58" width="32" height="1.2" fill="#fff" opacity=".07"/>`;
  o += `<rect y="${WALL_H - 5}" width="${ROOM_W}" height="5" fill="#7a4e32"/><rect y="${WALL_H - 5}" width="${ROOM_W}" height="1.4" fill="#b98657"/>`;
  // ventana con arco
  const buildings = [[0, 30, 14], [13, 22, 16], [30, 34, 12], [43, 26, 15], [57, 32, 12]]
    .map(([bx, by, bw]) => `<rect x="${wx + 4 + bx}" y="${wy + by + 14}" width="${bw}" height="${56 - by}" fill="${mix('#3b4a68', '#10152e', night)}"/>${Array.from({ length: 3 }, (_, i) => `<rect x="${wx + 6 + bx + (i % 2) * 6}" y="${wy + by + 18 + Math.floor(i / 2) * 7}" width="3" height="3.4" fill="${night > 0.4 ? '#ffd78a' : mix('#8aa0c0', '#5a6a8a', v.t)}" opacity="${night > 0.4 ? 0.95 : 0.5}"/>`).join('')}`).join('');
  o += `<defs><linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s0}"/><stop offset="1" stop-color="${s1}"/></linearGradient><clipPath id="winClip"><path d="M${wx} ${wy + 56} V${wy + 24} A${ww / 2} ${ww / 2} 0 0 1 ${wx + ww} ${wy + 24} V${wy + 56}Z"/></clipPath></defs>`;
  o += `<path d="M${wx - 4} ${wy + 60} V${wy + 24} A${ww / 2 + 4} ${ww / 2 + 4} 0 0 1 ${wx + ww + 4} ${wy + 24} V${wy + 60}Z" fill="#6e4630"/>`;
  o += `<g clip-path="url(#winClip)"><rect x="${wx}" y="${wy - 10}" width="${ww}" height="80" fill="url(#skyG)"/>${night > 0.3 ? Array.from({ length: 6 }, (_, i) => `<circle cx="${wx + 8 + hash('s' + i) * 60}" cy="${wy + 4 + hash('t' + i) * 26}" r="0.8" fill="#fff" opacity="${night * 0.9}" class="twinkle" style="animation-delay:${i * 0.4}s"/>`).join('') : ''}${buildings}${v.rain ? Array.from({ length: 10 }, (_, i) => `<line class="drop" x1="${wx + i * 8}" y1="${wy - 10}" x2="${wx + i * 8 - 3}" y2="${wy - 3}" stroke="#dbe9ff" stroke-width=".9" opacity=".6" style="animation-delay:${(i % 5) * 0.17}s"/>`).join('') : ''}</g>`;
  o += `<path d="M${wx + ww / 2} ${wy} V${wy + 56} M${wx} ${wy + 34} H${wx + ww}" stroke="#6e4630" stroke-width="2.4"/><path d="M${wx} ${wy + 56} V${wy + 24} A${ww / 2} ${ww / 2} 0 0 1 ${wx + ww} ${wy + 24} V${wy + 56}Z" fill="none" stroke="#8a5a3a" stroke-width="3"/><rect x="${wx - 6}" y="${wy + 56}" width="${ww + 12}" height="5" rx="2" fill="#9a6a44"/>`;
  o += `<path class="sway" d="M${wx - 8} ${wy + 8} C${wx} ${wy + 26} ${wx} ${wy + 44} ${wx - 4} ${wy + 56} L${wx - 12} ${wy + 56} C${wx - 8} ${wy + 40} ${wx - 8} ${wy + 24} ${wx - 14} ${wy + 8}Z" fill="#c8693f" style="transform-origin:${wx - 8}px ${wy + 8}px"/>`;
  o += `<path class="sway" d="M${wx + ww + 8} ${wy + 8} C${wx + ww} ${wy + 26} ${wx + ww} ${wy + 44} ${wx + ww + 4} ${wy + 56} L${wx + ww + 12} ${wy + 56} C${wx + ww + 8} ${wy + 40} ${wx + ww + 8} ${wy + 24} ${wx + ww + 14} ${wy + 8}Z" fill="#c8693f" style="transform-origin:${wx + ww + 8}px ${wy + 8}px"/>`;
  // pizarra de tendencias
  const lines = (v.trend ?? []).slice(0, 2).map((id, i) => `<text x="236" y="${38 + i * 10.5}" text-anchor="middle" font-family="Caveat, cursive" font-size="${BOOK[id].title.length > 18 ? 8 : 9.5}" fill="#f6f1de">★ ${BOOK[id].title}</text>`).join('');
  o += `<rect x="198" y="14" width="76" height="46" rx="3" fill="#8f5d3a"/><rect x="202" y="18" width="68" height="38" rx="1.6" fill="#1f2d29"/><text x="236" y="29" text-anchor="middle" font-family="Caveat, cursive" font-size="12" fill="#f6f1de">Tendencias</text>${lines || `<text x="236" y="42" text-anchor="middle" font-family="Caveat, cursive" font-size="9" fill="#f6f1de" opacity=".7">Hoy, de todo un poco</text>`}`;
  // cuadro
  if (v.level >= 3) o += `<rect x="176" y="20" width="16" height="22" rx="1.6" fill="#c9a24a"/><rect x="178.4" y="22.4" width="11.2" height="17.2" fill="#e8d9b8"/><path d="M178.4 36 l4 -5 l3 3 l3 -4 v10.6 h-10z" fill="#5b8a8f" opacity=".7"/>`;
  // puerta del almacén
  o += `<path d="M288 ${WALL_H - 5} V32 A27 27 0 0 1 342 32 V${WALL_H - 5}Z" fill="#5a3a26"/><path d="M293 ${WALL_H - 5} V33 A22 22 0 0 1 337 33 V${WALL_H - 5}Z" fill="#7a4e32"/><path d="M293 ${WALL_H - 5} V33 A22 22 0 0 1 337 33" fill="none" stroke="#9a6a44" stroke-width="1.2"/><circle cx="330" cy="50" r="1.8" fill="#e8c36a"/><rect x="300" y="12" width="30" height="9" rx="2" fill="#e8d9b8"/><text x="315" y="19" text-anchor="middle" font-family="Caveat, cursive" font-size="8.4" fill="#5a3a26">Almacén</text>`;
  // guirnalda
  if (v.owned.lights) {
    const pts = Array.from({ length: 10 }, (_, i) => [i * 40 + 4, 5 + Math.sin(i * 1.4) * 2.4 + (i % 2) * 6]);
    const cols = ['#ffd78a', '#ffb870', '#fff0c0'];
    o += `<path d="M0 3 ${pts.map(([x, y]) => `T${x} ${y - 2}`).join(' ')}" fill="none" stroke="#3a2a20" stroke-width="1" opacity=".8"/>${pts.map(([x, y], i) => `<circle class="twinkle" cx="${x}" cy="${y + 2}" r="2.4" fill="${cols[i % 3]}" style="animation-delay:${(i % 7) * 0.35}s"/>`).join('')}`;
  }
  // suelo
  o += `<rect y="${WALL_H}" width="${ROOM_W}" height="${ROWS * T}" fill="url(#gFloor)"/>`;
  const planks = ['#b98657', '#c28f5f', '#b07f52', '#c79565'];
  for (let r = 0; r < ROWS * 3; r++) {
    const y = WALL_H + r * 12;
    const off = (r * 53) % 90;
    for (let x = -off; x < ROOM_W; x += 90) {
      const col = planks[Math.floor(hash(`${r}-${x}`) * planks.length)];
      o += `<rect x="${x}" y="${y}" width="89" height="11.4" fill="${col}" opacity=".55"/>`;
      o += `<path d="M${x + 8} ${y + 4} h${30 + hash(`g${r}${x}`) * 30}" stroke="#6e4630" stroke-opacity=".12" stroke-width=".8"/>`;
    }
    o += `<path d="M0 ${y} H${ROOM_W}" stroke="#5e3b26" stroke-opacity=".22"/>`;
  }
  o += `<rect y="${WALL_H}" width="${ROOM_W}" height="22" fill="url(#gAO)"/>`;
  // felpudo de la entrada
  o += `<rect x="${4 * T + 3}" y="${WALL_H + ROWS * T - 14}" width="${2 * T - 6}" height="12" rx="3" fill="#a24c2c" opacity=".9"/><path d="M${4 * T + 9} ${WALL_H + ROWS * T - 8} h${2 * T - 18}" stroke="#f1e6cc" stroke-width="1.4" opacity=".7"/>`;
  return `<svg class="room-bg" width="${ROOM_W}" height="${ROOM_H}" viewBox="0 0 ${ROOM_W} ${ROOM_H}" aria-hidden="true">${o}</svg>`;
}

/* ---------- Luz ---------- */

function lighting(v) {
  const night = nightness(v.t);
  const day = 1 - night;
  const sun = v.rain ? 0.4 : 1;
  let o = '';
  // rayos de luz de la ventana sobre el suelo
  if (day > 0.15) {
    const a = 0.2 * day * sun;
    o += `<polygon points="100,${WALL_H} 168,${WALL_H} 238,${WALL_H + 130} 150,${WALL_H + 130}" fill="url(#gShaft)" opacity="${a}" style="mix-blend-mode:screen"/>`;
    o += `<polygon points="118,${WALL_H} 140,${WALL_H} 178,${WALL_H + 150} 140,${WALL_H + 150}" fill="url(#gShaft)" opacity="${a * 0.7}" style="mix-blend-mode:screen"/>`;
  }
  // brillo de lámparas
  const glows = [];
  for (const f of placed(v.furniture)) {
    if (f.type === 'lamp') glows.push([f.x * T + 18, cellY(f.y) + T - 54 + 2, 62]);
    if (f.type === 'counter') glows.push((f.rot ?? 0) === 0 ? [f.x * T + 82, cellY(f.y) + T - 24, 52] : [f.x * T + dims('counter', f.rot).w * T / 2, cellY(f.y) + dims('counter', f.rot).h * T / 2, 52]);
    if (f.type === 'coffee') glows.push([f.x * T + 18, cellY(f.y) + T - 20, 34]);
  }
  for (const [x, y, r] of glows) o += `<circle class="flick" cx="${x}" cy="${y}" r="${r}" fill="url(#gGlow)" opacity="${0.38 + night * 0.5}" style="mix-blend-mode:screen"/>`;
  if (v.owned.lights) o += `<rect x="0" y="0" width="${ROOM_W}" height="${WALL_H + 20}" fill="url(#gGarland)" opacity="${0.18 + night * 0.4}" style="mix-blend-mode:screen"/>`;
  // ambiente según la hora
  o += `<rect width="${ROOM_W}" height="${ROOM_H}" fill="${mix('#ff9a4a', '#16225e', night)}" opacity="${0.03 + night * 0.34}" style="mix-blend-mode:multiply"/>`;
  o += `<rect width="${ROOM_W}" height="${ROOM_H}" fill="url(#gVig)"/>`;
  // motas de polvo a contraluz
  if (day > 0.2) o += Array.from({ length: 9 }, (_, i) => `<circle class="mote" cx="${120 + hash('m' + i) * 110}" cy="${WALL_H + 20 + hash('n' + i) * 120}" r="${0.7 + hash('o' + i) * 1}" fill="#fff6d8" opacity=".5" style="animation-delay:${i * 0.9}s"/>`).join('');
  return `<svg class="room-light" width="${ROOM_W}" height="${ROOM_H}" viewBox="0 0 ${ROOM_W} ${ROOM_H}" aria-hidden="true">${o}</svg>`;
}

/* ---------- Muebles ---------- */

export function entHTML(f) {
  const rot = f.rot ?? 0;
  const d = dims(f.type, rot);
  const { w, h } = spriteSize(f.type, rot);
  const left = f.x * T;
  const top = cellY(f.y) + d.h * T - h;
  const z = FURN[f.type].floor ? 1 : 10 + (f.y + d.h) * 10;
  return `<div class="ent f-${f.type}" data-uid="${f.uid}" data-type="${f.type}" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px;z-index:${z}">${furnSprite(f)}</div>`;
}

export function roomHTML(v) {
  return `<div class="room" id="room" style="width:${ROOM_W}px;height:${ROOM_H}px">
    ${wallAndFloor(v)}
    <div class="ents" id="ents">${placed(v.furniture).map(entHTML).join('')}</div>
    <div class="people" id="people"></div>
    <div class="lightwrap" id="lightwrap">${lighting(v)}</div>
    <div class="editgrid" id="editgrid" hidden></div>
  </div>`;
}

export function lightHTML(v) {
  return lighting(v);
}
export function bgHTML(v) {
  return wallAndFloor(v);
}
