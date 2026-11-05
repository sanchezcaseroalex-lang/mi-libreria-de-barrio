// Datos de la sala (cuadrícula), catálogo de muebles y búsqueda de caminos. Sin DOM: se puede probar desde Node.

export const T = 36; // tamaño de casilla en px
export const COLS = 10;
export const ROWS = 8;
export const WALL_H = 80; // alto de la pared del fondo
export const ROOM_W = COLS * T;
export const ROOM_H = WALL_H + ROWS * T;
export const ENTRY = [[4, ROWS - 1], [5, ROWS - 1]]; // casillas de la puerta de entrada (abajo)
export const DOOR_ROW = 2; // fila de la puerta del almacén (pared izquierda)

// Límites de la tienda en casillas (inclusive). Crecen al comprar locales contiguos.
export const B = { x0: 0, y0: 0, x1: COLS - 1, y1: ROWS - 1 };
export const EXPANSIONS = [
  { id: 'este', name: 'Local de al lado', desc: 'Tiras la pared y ganas 5 columnas hacia la derecha.', level: 4, price: 700, add: { x1: 5 } },
  { id: 'fondo', name: 'Trastienda ampliada', desc: 'Abres el fondo: 4 filas más hacia la pared del fondo.', level: 7, price: 1400, add: { y0: -4 } },
  { id: 'oeste', name: 'Sala de lectura', desc: 'Una sala nueva a la izquierda: 4 columnas más.', level: 9, price: 2200, add: { x0: -4 } },
];
export function setBounds(owned = []) {
  Object.assign(B, { x0: 0, y0: 0, x1: COLS - 1, y1: ROWS - 1 });
  for (const e of EXPANSIONS) {
    if (!owned.includes(e.id)) continue;
    if (e.add.x1) B.x1 += e.add.x1;
    if (e.add.y0) B.y0 += e.add.y0;
    if (e.add.x0) B.x0 += e.add.x0;
  }
  return B;
}
export const inBounds = (c, r) => c >= B.x0 && c <= B.x1 && r >= B.y0 && r <= B.y1;
export const doorCell = () => [B.x0, DOOR_ROW];

const lv = (arr) => (n) => arr[n] ?? 99;

// w × h en casillas con el mueble mirando al frente (rot 0).
// rot: 0 = mira abajo, 1 = mira a la izquierda, 2 = mira arriba, 3 = mira a la derecha.
// norot: no tiene sentido girarlo (se ve igual).
export const FURN = {
  counter: { name: 'Mostrador', w: 3, h: 1, fixed: true, cozy: 0, desc: 'Donde atiendes a los clientes.' },
  shelf: { name: 'Estantería', w: 2, h: 1, price: (n) => 180 + 40 * n, level: lv([1, 3, 5, 7, 9]), max: 5, cozy: 1, desc: 'Cabe en 3 baldas, una por género.' },
  table: { name: 'Mesa de novedades', w: 2, h: 2, norot: true, price: (n) => 150 + 60 * n, level: lv([3, 6]), max: 2, cozy: 1, desc: 'Redonda, con novedades: se venden un 10 % más caros.' },
  plant: { name: 'Planta', w: 1, h: 1, norot: true, price: () => 35, level: lv([2, 2, 3, 4, 5, 6]), max: 6, cozy: 1, desc: 'Lengua de suegra: alta, fina y verde.' },
  cat: { name: 'Cama del gato', w: 1, h: 1, norot: true, price: () => 90, level: lv([2]), max: 1, cozy: 2, desc: 'Tinta duerme aquí y los clientes la adoran.' },
  rug: { name: 'Alfombra', w: 2, h: 2, floor: true, norot: true, price: (n) => 60 + 30 * n, level: lv([3, 5]), max: 2, cozy: 1, desc: 'Se pisa: puedes poner muebles encima.' },
  armchair: { name: 'Sillón', w: 1, h: 1, price: (n) => 140 + 30 * n, level: lv([4, 5, 8]), max: 3, cozy: 2, desc: 'Un cliente puede sentarse a leer.' },
  lamp: { name: 'Lámpara de pie', w: 1, h: 1, norot: true, price: () => 70, level: lv([4, 4, 6]), max: 3, cozy: 1, desc: 'Luz cálida para las tardes.' },
  side: { name: 'Mesita', w: 1, h: 1, norot: true, price: () => 45, level: lv([4, 5, 6]), max: 3, cozy: 0.5, desc: 'Con su taza de té.' },
  sofa: { name: 'Sofá de lectura', w: 2, h: 1, price: (n) => 260 + 60 * n, level: lv([6, 8]), max: 2, cozy: 2, desc: 'Dos clientes pueden leer a la vez.' },
  ereader: { name: 'Expositor de e-readers', w: 1, h: 1, price: () => 220, level: lv([7]), max: 1, cozy: 0.5, desc: 'Con 4 lectores electrónicos de varias marcas: se venden caros y dan mucho margen.' },
  coffee: { name: 'Rincón de café', w: 1, h: 1, norot: true, price: () => 350, level: lv([9]), max: 1, cozy: 3, desc: 'Más propinas y más calidez.' },
};
export const FURN_ORDER = ['shelf', 'table', 'plant', 'cat', 'rug', 'armchair', 'lamp', 'side', 'sofa', 'ereader', 'coffee'];

// Tamaño en casillas según el giro
export const dims = (type, rot = 0) => {
  const d = FURN[type];
  return rot % 2 ? { w: d.h, h: d.w } : { w: d.w, h: d.h };
};

export const cellsOf = (f, x = f.x, y = f.y, rot = f.rot ?? 0) => {
  const d = dims(f.type, rot);
  const out = [];
  for (let dx = 0; dx < d.w; dx++) for (let dy = 0; dy < d.h; dy++) out.push([x + dx, y + dy]);
  return out;
};

export const placed = (list) => list.filter((f) => f.x != null);

// Casillas por las que no se puede caminar
export function blockedSet(list, ignoreUid = null) {
  const set = new Set();
  for (const f of placed(list)) {
    if (f.uid === ignoreUid || FURN[f.type].floor) continue;
    for (const [c, r] of cellsOf(f)) set.add(`${c},${r}`);
  }
  return set;
}

export function findPath(blocked, from, to) {
  const key = (c, r) => `${c},${r}`;
  const q = [[from[0], from[1]]];
  const prev = new Map([[key(from[0], from[1]), null]]);
  while (q.length) {
    const [c, r] = q.shift();
    if (c === to[0] && r === to[1]) {
      const path = [];
      let cur = [c, r];
      while (cur) {
        path.unshift(cur);
        cur = prev.get(key(cur[0], cur[1]));
      }
      return path;
    }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc;
      const nr = r + dr;
      const outside = nr === ROWS && ENTRY.some(([ec]) => ec === nc);
      const door = nc === B.x0 - 1 && nr === DOOR_ROW;
      if (!door && ((nc < B.x0 || nc > B.x1 || nr < B.y0 || nr > B.y1) && !outside)) continue;
      const k = key(nc, nr);
      if (prev.has(k) || (blocked.has(k) && !(nc === to[0] && nr === to[1]))) continue;
      prev.set(k, [c, r]);
      q.push([nc, nr]);
    }
  }
  return null;
}

// Casillas justo delante del mueble (según hacia dónde mire)
export function frontCells(f, list = null, x = f.x, y = f.y, rot = f.rot ?? 0) {
  const d = dims(f.type, rot);
  const out = [];
  if (rot === 0) for (let i = 0; i < d.w; i++) out.push([x + i, y + d.h]);
  else if (rot === 1) for (let i = 0; i < d.h; i++) out.push([x - 1, y + i]);
  else if (rot === 2) for (let i = 0; i < d.w; i++) out.push([x + i, y - 1]);
  else for (let i = 0; i < d.h; i++) out.push([x + d.w, y + i]);
  return out.filter(([c, r]) => inBounds(c, r));
}

// Casilla donde se pone el cliente frente al mostrador
export function serviceCell(list) {
  const counter = placed(list).find((f) => f.type === 'counter');
  if (!counter) return null;
  const blocked = blockedSet(list);
  const cands = frontCells(counter).filter(([c, r]) => !blocked.has(`${c},${r}`));
  const mid = cellsOf(counter).reduce((a, [c, r]) => [a[0] + c, a[1] + r], [0, 0]).map((v) => v / cellsOf(counter).length);
  cands.sort((a, b) => Math.hypot(a[0] - mid[0], a[1] - mid[1]) - Math.hypot(b[0] - mid[0], b[1] - mid[1]));
  return cands[0] ?? null;
}

// Casilla desde la que alguien se sienta en el mueble
export function seatCell(f, list) {
  const blocked = blockedSet(list);
  return frontCells(f).find(([c, r]) => !blocked.has(`${c},${r}`)) ?? null;
}

// ¿Se puede poner el mueble f en (x, y) con ese giro? Devuelve el motivo si no.
export function placementError(list, f, x, y, rot = f.rot ?? 0) {
  const d = dims(f.type, rot);
  const def = FURN[f.type];
  if (x < B.x0 || y < B.y0 || x + d.w - 1 > B.x1 || y + d.h - 1 > B.y1) return 'Se sale de la tienda.';
  const mine = cellsOf(f, x, y, rot);
  for (const o of placed(list)) {
    if (o.uid === f.uid) continue;
    if (!!FURN[o.type].floor !== !!def.floor) continue; // una alfombra no estorba a un mueble
    const theirs = cellsOf(o);
    if (mine.some(([a, b]) => theirs.some(([c, e]) => a === c && b === e))) return 'Ya hay algo ahí.';
  }
  if (!def.floor && mine.some(([c, r]) => ENTRY.some(([ec, er]) => ec === c && er === r))) return 'Deja libre la puerta.';
  if (!def.floor && mine.some(([c, r]) => c === B.x0 && r === DOOR_ROW)) return 'Deja libre la puerta del almacén.';
  if (!def.floor) {
    const moved = list.map((o) => (o.uid === f.uid ? { ...o, x, y, rot } : o));
    const sc = serviceCell(moved);
    if (!sc) return 'El mostrador debe tener hueco delante.';
    if (!findPath(blockedSet(moved), [ENTRY[0][0], ROWS], sc)) return 'Los clientes no podrían llegar al mostrador.';
    if (!findPath(blockedSet(moved), sc, doorCell())) return 'No podrías llegar a la puerta del almacén.';
  }
  return null;
}

/* ---------- Rutas suaves: diagonales y curvas ---------- */

// ¿Se puede pisar esta casilla? (la zona exterior solo existe delante de las puertas)
export function makePassable(blocked) {
  return (c, r) => {
    const outside = r === ROWS && ENTRY.some(([ec]) => ec === c);
    const door = c === B.x0 - 1 && r === DOOR_ROW;
    if (!door && !outside && (c < B.x0 || c > B.x1 || r < B.y0 || r > B.y1)) return false;
    return !blocked.has(`${c},${r}`);
  };
}

function bfsCells(passable, from, to) {
  const key = (c, r) => `${c},${r}`;
  const q = [from];
  const prev = new Map([[key(...from), null]]);
  while (q.length) {
    const [c, r] = q.shift();
    if (c === to[0] && r === to[1]) {
      const out = [];
      for (let cur = [c, r]; cur; cur = prev.get(key(...cur))) out.unshift(cur);
      return out;
    }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = key(nc, nr);
      if (prev.has(k)) continue;
      if (!passable(nc, nr) && !(nc === to[0] && nr === to[1])) continue;
      prev.set(k, [c, r]);
      q.push([nc, nr]);
    }
  }
  return null;
}

// ¿Hay línea de vista libre entre dos puntos, con un poco de margen a los lados?
function clearLine(passable, a, b, margin = 0.26) {
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
  if (len < 1e-6) return true;
  const nx = -dz / len, nz = dx / len;
  const steps = Math.ceil(len / 0.1);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, x = a.x + dx * t, z = a.z + dz * t;
    for (const o of [0, margin, -margin]) {
      if (!passable(Math.floor(x + nx * o), Math.floor(z + nz * o))) return false;
    }
  }
  return true;
}

// Ruta desde una posición (x, z) hasta una casilla: puntos del mundo ya simplificados (se unen con una curva suave).
export function routePoints(passable, fromPos, toCell) {
  const fromCell = [Math.floor(fromPos.x), Math.floor(fromPos.z)];
  const cells = bfsCells(passable, fromCell, toCell);
  if (!cells) return null;
  const pts = cells.map(([c, r]) => ({ x: c + 0.5, z: r + 0.5 }));
  pts[0] = { x: fromPos.x, z: fromPos.z };
  const out = [pts[0]];
  let i = 0;
  while (i < pts.length - 1) {
    let j = pts.length - 1;
    while (j > i + 1 && !clearLine(passable, pts[i], pts[j])) j--;
    out.push(pts[j]);
    i = j;
  }
  return out;
}
