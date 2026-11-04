import { addPts, initPass, TIERS, tierOf, EDITIONS, applyEditions } from './pass.js';
import { BOOKS, BOOK, GENRES, GENRE_ORDER, TAGS, wholesale, sectionOf } from './books.js';
import { newCustomer, newUnfillable, pickChar, bookWeights, thanksLine, nopeLine, pickupCustomer, parcelCustomer } from './cast.js';
import { FURN, placed, placementError, cellsOf, dims, EXPANSIONS, setBounds } from './layout.js';

export const ROW_CAP = 8;
export const TABLE_CAP = 10;
export const XP_LEVELS = [0, 90, 225, 420, 675, 990, 1380, 1850, 2400, 3080];
export const MAX_LEVEL = XP_LEVELS.length;

// Mejoras que no son muebles
export const ITEMS = [
  { id: 'lights', name: 'Guirnalda de luces', level: 6, price: 120, desc: 'Luz cálida a lo largo de la pared del fondo.' },
];

export const NETWORKS = {
  pluma: { name: 'Plumas', level: 5, desc: 'Tu cuenta en Plumas: los clientes cuentan qué tal les ha ido.' },
  foto: { name: 'Bookgram', level: 6, desc: 'Publica fotos de tu librería y haz crecer la comunidad.' },
  lectok: { name: 'Reels', level: 8, desc: 'Recomienda libros en un reel de Bookgram. Si uno se hace viral, todo el mundo lo pide.' },
};

const HANDLES = ['lectora_de_madrugada', 'tinta_y_te', 'dragonesdepapel', 'marcapaginas_', 'nochedenovelas', 'devoralibros', 'la_biblioteca_de_ana', 'entreparrafos', 'novelasconcafe', 'rincon_de_hadas', 'pagina_cuarenta', 'lecturasdelluvia', 'sinopsis_y_mas', 'cuervo_lector', 'mariposa_literaria', 'librosenlaalmohada'];
const NAMES = ['Lucía', 'Mateo', 'Carmen', 'Daniel', 'Irene', 'Pablo', 'Marta', 'Hugo', 'Sofía', 'Álvaro', 'Elena', 'Javier', 'Noa', 'Iván', 'Paula', 'Sergio', 'Clara', 'Adrián', 'Julia', 'Rubén'];

const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
let nextUid = 1;
export const BOX_SIZE = 6;
export const WEB_LEVEL = 7;
const uid = () => `f${Date.now().toString(36)}${nextUid++}`;

export const levelFor = (xp) => {
  let l = 1;
  for (let i = 1; i < XP_LEVELS.length; i++) if (xp >= XP_LEVELS[i]) l = i + 1;
  return l;
};
export const availableBooks = (s) => BOOKS.filter((b) => b.unlock <= s.level);

/* ---------- Estado inicial ---------- */

export function newGame() {
  const s = {
    v: 3, settings: { hard: false }, day: 1, money: 300, xp: 0, level: 1, followers: 0, rep: 0,
    owned: {}, storage: {}, orders: [], trend: [], boxes: [], expansions: [],
    deco: { floor: 'roble', wall: 'crema', posters: [
      { uid: uid(), side: 'E', u: 4.2, v: 1.65, w: 1.2, h: 0.8, kind: 'pizarra', text: 'Hoy recomendamos|★ Alas de Brasa|¡Pregunta por las novedades!' },
      { uid: uid(), side: 'W', u: 5.3, v: 1.6, w: 0.62, h: 0.82, kind: 'arte', art: 'sol' },
      { uid: uid(), side: 'W', u: 6.6, v: 1.6, w: 0.62, h: 0.82, kind: 'arte', art: 'libro' },
    ] },
    furniture: [
      { uid: uid(), type: 'shelf', x: 1, y: 0, rows: [[], [], []] },
      { uid: uid(), type: 'counter', x: 6, y: 2 },
      { uid: uid(), type: 'rug', x: 3, y: 4 },
      { uid: uid(), type: 'plant', x: 0, y: 0 },
    ],
    phase: 'morning', queue: [], idx: 0, current: null, today: null, weather: 'sol', nook: null,
    feed: [], social: { pluma: { on: false, handle: '' }, foto: { on: false }, lectok: { on: false } }, posted: { foto: 0, lectok: 0 },
    levelUps: [], summary: null, history: [], shopName: 'La Tinta y el Té',
  };
  setBounds([]);
  for (const b of BOOKS.filter((x) => x.unlock === 1)) s.storage[b.id] = 3;
  autoPlace(s);
  startDay(s);
  return s;
}

/* ---------- Muebles ---------- */

export const countOf = (s, type) => s.furniture.filter((f) => f.type === type && !f.pass).length;
export const inventory = (s) => s.furniture.filter((f) => f.x == null);
export const furnById = (s, id) => s.furniture.find((f) => f.uid === id);

export function cozy(s) {
  let c = s.owned.lights ? 2 : 0;
  for (const f of placed(s.furniture)) c += FURN[f.type].cozy ?? 0;
  return Math.round(c);
}

export function buyFurniture(s, type) {
  const d = FURN[type];
  if (!d || d.fixed) return 'Ese mueble no existe.';
  const n = countOf(s, type);
  if (n >= d.max) return 'Ya tienes todos los que caben.';
  if (s.level < d.level(n)) return `Se desbloquea en el nivel ${d.level(n)}.`;
  const price = d.price(n);
  if (s.money < price) return 'No te llega el dinero.';
  s.money -= price;
  const f = { uid: uid(), type, x: null, y: null };
  if (type === 'shelf') f.rows = [[], [], []];
  if (type === 'table') f.books = [];
  s.furniture.push(f);
  return null;
}

export function buyItem(s, id) {
  const it = ITEMS.find((i) => i.id === id);
  if (!it) return 'Ese objeto no existe.';
  if (s.owned[id]) return 'Ya lo tienes.';
  if (s.level < it.level) return `Se desbloquea en el nivel ${it.level}.`;
  if (s.money < it.price) return 'No te llega el dinero.';
  s.money -= it.price;
  s.owned[id] = true;
  return null;
}

export function placeFurniture(s, uidv, x, y) {
  const f = furnById(s, uidv);
  if (!f) return 'Mueble no encontrado.';
  const err = placementError(s.furniture, f, x, y, f.rot ?? 0);
  if (err) return err;
  f.x = x;
  f.y = y;
  if (f.type === 'shelf' && !f.rows) f.rows = [[], [], []];
  if (f.type === 'table' && !f.books) f.books = [];
  return null;
}

// Gira el mueble 90° a la derecha, ajustando su sitio si hace falta para que quepa.
export function rotateFurniture(s, uidv) {
  const f = furnById(s, uidv);
  if (!f || f.x == null) return 'Colócalo primero.';
  if (FURN[f.type].norot) return 'Este mueble se ve igual desde todos los lados.';
  const rot = ((f.rot ?? 0) + 1) % 4;
  const od = dims(f.type, f.rot ?? 0);
  const nd = dims(f.type, rot);
  const dw = nd.w - od.w;
  const dh = nd.h - od.h;
  let lastErr = null;
  for (const [x, y] of [[f.x, f.y], [f.x - dw, f.y], [f.x, f.y - dh], [f.x - dw, f.y - dh], [f.x - 1, f.y], [f.x, f.y - 1]]) {
    const err = placementError(s.furniture, f, x, y, rot);
    if (!err) {
      f.x = x;
      f.y = y;
      f.rot = rot;
      return null;
    }
    lastErr = err;
  }
  return lastErr;
}

// Guarda el mueble en el inventario y devuelve sus libros al almacén.
export function storeFurniture(s, uidv) {
  const f = furnById(s, uidv);
  if (!f || FURN[f.type].fixed) return 'Ese mueble no se puede guardar.';
  const list = f.type === 'shelf' ? f.rows.flat() : f.type === 'table' ? f.books : [];
  for (const id of list) s.storage[id] = (s.storage[id] ?? 0) + 1;
  if (f.rows) f.rows = [[], [], []];
  if (f.books) f.books = [];
  f.x = null;
  f.y = null;
  f.rot = 0;
  return null;
}

/* ---------- Estanterías, mesas y almacén ---------- */

// Todos los sitios donde puede haber libros a la venta
export function containers(s) {
  const out = [];
  let si = 0;
  for (const f of placed(s.furniture)) {
    if (f.type === 'shelf') {
      si++;
      f.rows.forEach((arr, ri) => out.push({ id: `${f.uid}:${ri}`, arr, cap: ROW_CAP, kind: 'row', genre: GENRE_ORDER[ri], section: GENRE_ORDER[ri], furn: f, n: si, row: ri }));
    } else if (f.type === 'table') {
      out.push({ id: `${f.uid}:t`, arr: f.books, cap: TABLE_CAP, kind: 'table', furn: f });
    }
  }
  return out;
}

export const shelfSlots = (s) => containers(s).filter((c) => c.kind === 'row').length * ROW_CAP;
export const storageCount = (s) => Object.values(s.storage).reduce((a, b) => a + b, 0);
export const shelfFree = (s) => containers(s).reduce((a, c) => a + (c.cap - c.arr.length), 0);

export function placeBook(s, bookId, containerId) {
  if (!(s.storage[bookId] > 0)) return 'No te quedan copias en el almacén.';
  if (onDisplay(s).has(bookId)) return 'Ya hay un ejemplar de ese libro en la tienda.';
  const c = containers(s).find((x) => x.id === containerId);
  if (!c) return 'Ese sitio no existe.';
  if (c.arr.length >= c.cap) return c.kind === 'table' ? 'La mesa está llena.' : 'Esa balda está llena.';
  c.arr.push(bookId);
  s.storage[bookId]--;
  if (s.storage[bookId] <= 0) delete s.storage[bookId];
  return null;
}

// Pone un título en la mesa de novedades y más vendidos (lo saca de la estantería si estaba allí)
export function setOnTable(s, bookId) {
  const table = containers(s).find((c) => c.kind === 'table');
  if (!table) return 'Necesitas una mesa de novedades colocada en la tienda.';
  if (table.arr.includes(bookId)) return 'Ese libro ya está en la mesa.';
  if (table.arr.length >= table.cap) return 'La mesa está llena: quita algún libro tocándola.';
  if (onDisplay(s).has(bookId)) { removeFromDisplay(s, bookId); table.arr.push(bookId); return null; }
  if (!(s.storage[bookId] > 0)) return 'No te quedan copias de ese libro.';
  return placeBook(s, bookId, table.id);
}
export const topSellers = (s, n = 3) => Object.entries(s.soldBy ?? {}).sort((a, b) => b[1] - a[1]).slice(0, n);

export function takeBack(s, containerId, i) {
  const c = containers(s).find((x) => x.id === containerId);
  if (!c) return;
  const [id] = c.arr.splice(i, 1);
  if (id) s.storage[id] = (s.storage[id] ?? 0) + 1;
}

// Coloca el almacén por géneros: cada libro en la balda de su género si cabe y, si no, donde haya hueco.
export function autoPlace(s) {
  let placedN = 0;
  const ids = Object.keys(s.storage).sort((a, b) => GENRE_ORDER.indexOf(sectionOf(BOOK[a])) - GENRE_ORDER.indexOf(sectionOf(BOOK[b])) || a.localeCompare(b));
  for (const id of ids) {
    if (onDisplay(s).has(id)) continue;
    while (s.storage[id] > 0) {
      const cs = containers(s).filter((c) => c.kind === 'row');
      const target = cs.find((c) => c.section === sectionOf(BOOK[id]) && c.arr.length < c.cap) ?? cs.find((c) => c.arr.length < c.cap);
      if (!target) break;
      placeBook(s, id, target.id);
      placedN++;
      break; // un solo ejemplar por título
    }
  }
  return placedN;
}

export function onDisplay(s) {
  const map = new Map();
  for (const c of containers(s)) for (const id of c.arr) map.set(id, (map.get(id) ?? 0) + 1);
  return map;
}

/* ---------- Cajas del almacén ---------- */

export const boxBooks = (b) => b.items.reduce((a, i) => a + i.qty, 0);
export const unopenedBooks = (s) => s.boxes.reduce((a, b) => a + boxBooks(b), 0);
export function openBox(s, boxId) {
  const i = s.boxes.findIndex((b) => b.id === boxId);
  if (i < 0) return null;
  const [b] = s.boxes.splice(i, 1);
  for (const it of b.items) s.storage[it.id] = (s.storage[it.id] ?? 0) + it.qty;
  return b;
}

/* ---------- Ampliar la tienda ---------- */

export const ownsExpansion = (s, id) => s.expansions.includes(id);
export function buyExpansion(s, id) {
  const e = EXPANSIONS.find((x) => x.id === id);
  if (!e) return 'Ese local no existe.';
  if (ownsExpansion(s, id)) return 'Ya es tuyo.';
  if (s.level < e.level) return `Se desbloquea en el nivel ${e.level}.`;
  if (s.money < e.price) return 'No te llega el dinero.';
  s.money -= e.price;
  s.expansions.push(id);
  setBounds(s.expansions);
  return null;
}

/* ---------- Estilo: suelo, paredes y carteles ---------- */

export function setDeco(s, key, value) { s.deco[key] = value; }
export const MAX_POSTERS = 14;
export function addPoster(s, p) {
  if (s.deco.posters.length >= MAX_POSTERS) return 'Ya tienes demasiados carteles.';
  s.deco.posters.push({ uid: uid(), ...p });
  return null;
}
export function removePoster(s, id) { s.deco.posters = s.deco.posters.filter((p) => p.uid !== id); }
export const posterById = (s, id) => s.deco.posters.find((p) => p.uid === id);

/* ---------- Pedidos ---------- */

export function orderBooks(s, bookId, qty) {
  const b = BOOK[bookId];
  if (!b || b.unlock > s.level) return 'Ese libro aún no está en el catálogo.';
  const cost = wholesale(b) * qty;
  if (s.money < cost) return 'No te llega el dinero.';
  s.money -= cost;
  s.orders.push({ id: bookId, qty, arrive: s.day + 1 });
  return null;
}
export const pendingOrders = (s) => s.orders.reduce((a, o) => a + o.qty, 0);

/* ---------- Día de tienda ---------- */

function randomRequest(s, bag) {
  const avail = availableBooks(s);
  const trendIds = new Set(s.trend.filter((t) => t.until >= s.day).map((t) => t.id));
  const char = pickChar(bag);
  const target = pick(bookWeights(char, avail, trendIds)).id;
  const r = Math.random();
  if (r < 0.16) return newUnfillable(char, target);   // pide algo que no existe en tu librería
  const type = r < 0.38 ? 'title' : r < 0.66 ? 'tags' : 'genre';
  const c = newCustomer(char, target, type);
  if (BOOK[target].ed && Math.random() < 0.45) { c.collector = true; c.line += ' Y si tenéis la edición especial, mejor.'; }
  if (type === 'title' && trendIds.has(target) && s.social.lectok.on) c.line = `He visto «${BOOK[target].title}» por todas partes y me muero por leerlo.`;
  return c;
}

export function startDay(s) {
  const arrived = [];
  s.orders = s.orders.filter((o) => {
    if (o.arrive <= s.day) {
      arrived.push(o);
      return false;
    }
    return true;
  });
  s.arrived = arrived;
  if (arrived.length) {
    const flat = [];
    for (const o of arrived) for (let i = 0; i < o.qty; i++) flat.push(o.id);
    for (let k = 0; k < flat.length; k += BOX_SIZE) {
      const items = {};
      flat.slice(k, k + BOX_SIZE).forEach((id) => { items[id] = (items[id] ?? 0) + 1; });
      s.boxes.push({ id: `b${s.day}-${nextUid++}`, day: s.day, items: Object.entries(items).map(([id, qty]) => ({ id, qty })) });
    }
  }
  s.trend = s.trend.filter((t) => t.until >= s.day);
  if (s.trend.length === 0 && Math.random() < 0.5) s.trend.push({ id: pick(availableBooks(s)).id, until: s.day + 2 });
  s.weather = Math.random() < 0.28 ? 'lluvia' : Math.random() < 0.2 ? 'nublado' : 'sol';
  const n = clamp(3 + s.level + Math.floor(s.followers / 60) + Math.floor(s.rep / 60) - (s.weather === 'lluvia' ? 1 : 0), 3, 13);
  const bag = [];
  s.queue = Array.from({ length: n }, () => randomRequest(s, bag));
  if (s.settings?.hard) s.queue.forEach((c) => { c.tries = 1; });
  // Eventos (club de lectura, firma de autor): hace falta una sala donde recibir a la gente (hoy la Sala de lectura; luego la cafetería)
  s.event = null; s.eventLast ??= -9;
  if (eventsOn(s) && s.day - s.eventLast >= 4 && Math.random() < 0.5) {
    const b = pick(availableBooks(s)), autor = Math.random() < 0.4, extra = autor ? 4 : 3;
    s.event = autor ? { type: 'autor', bookId: b.id, who: b.author } : { type: 'club', bookId: b.id };
    s.eventLast = s.day;
    for (let i = 0; i < extra; i++) {
      const c = newCustomer(pickChar(bag), b.id, 'title');
      c.sequel = null; c.event = true;
      c.line = autor ? `Vengo a la firma de ${b.author}. ¿Me vendéis «${b.title}» para que me lo dedique?` : `Somos del club de lectura de hoy. Nos toca «${b.title}». ¿Os queda algún ejemplar?`;
      s.queue.push(c);
    }
  }
  // clientes que vuelven a recoger lo que encargaron o lo que pidieron por internet
  s.encargos ??= []; s.web ??= { orders: [], n: 1 };
  const back = [];
  s.encargos.filter((e) => e.day < s.day && !e.called).forEach((e) => { e.called = true; back.push(pickupCustomer(e)); });
  s.web.orders.filter((o) => o.status === 'listo' && o.mode === 'recoger' && o.packedDay < s.day && !o.called).forEach((o) => { o.called = true; back.push(parcelCustomer(o)); });
  s.queue.unshift(...back);
  s.web.orders = s.web.orders.filter((o) => {
    if (o.status === 'nuevo' && o.day < s.day - 1) return false;
    if (o.status === 'aceptado' && o.day < s.day - 1) { s.rep = Math.max(0, s.rep - 2); return false; }
    return o.status !== 'entregado' && o.status !== 'rechazado';
  });
  genWebOrders(s);
  s.idx = 0;
  s.served = 0;
  s.current = null;
  s.nook = null;
  s.phase = 'morning';
  s.today = { sales: 0, revenue: 0, tips: 0, xp: 0, left: 0, level0: s.level, money0: s.money };
}

/* ---------- Pedidos online ---------- */

const WEB_NAMES = ['Aitana M.', 'Bruno P.', 'Cristina L.', 'David R.', 'Esther G.', 'Fabián T.', 'Gloria S.', 'Héctor V.', 'Inés C.', 'Jorge A.', 'Karla N.', 'Leo B.'];
function genWebOrders(s) {
  if (s.level < WEB_LEVEL) return;
  const open = s.web.orders.filter((o) => o.status === 'nuevo' || o.status === 'aceptado').length;
  const n = Math.random() < 0.6 ? 1 : Math.random() < 0.4 ? 2 : 0;
  for (let i = 0; i < n && open + i < 5; i++) {
    const avail = availableBooks(s);
    const items = [pick(avail).id];
    if (Math.random() < 0.55) { const b2 = pick(avail).id; if (b2 !== items[0]) items.push(b2); }
    s.web.orders.push({ id: `w${s.web.n++}`, who: pick(WEB_NAMES), items, total: items.reduce((t, id) => t + BOOK[id].price, 0), mode: Math.random() < 0.5 ? 'recoger' : 'envio', status: 'nuevo', day: s.day });
  }
}
export const webTodo = (s) => (s.level >= WEB_LEVEL ? (s.web?.orders ?? []).filter((o) => o.status === 'nuevo' || o.status === 'aceptado').length : 0);
export const webOrder = (s, id) => s.web.orders.find((o) => o.id === id);
export function webAccept(s, id) { const o = webOrder(s, id); if (o?.status === 'nuevo') { o.status = 'aceptado'; o.day = s.day; } }
export function webReject(s, id) { const o = webOrder(s, id); if (o?.status === 'nuevo') o.status = 'rechazado'; }

// ¿Hay ejemplares (en almacén o expuestos) para todos los libros del pedido?
export function canFill(s, items) {
  const need = {};
  items.forEach((id) => { need[id] = (need[id] ?? 0) + 1; });
  const have = sellable(s);
  const missing = Object.entries(need).filter(([id, n]) => ((have.get(id)?.shop ?? 0) + (have.get(id)?.store ?? 0)) < n).map(([id]) => id);
  return missing;
}
// Saca los ejemplares del almacén/estantes y deja el paquete listo para mañana
export function packOrder(s, id) {
  const o = webOrder(s, id);
  if (!o || o.status !== 'aceptado') return 'Ese pedido no está para preparar.';
  if (canFill(s, o.items).length) return 'Te faltan libros.';
  o.items.forEach((b) => takeCopy(s, b));
  o.status = 'listo'; o.packedDay = s.day;
  return null;
}
// Paquetes de envío que Samir recoge hoy
export const samirParcels = (s) => (s.web?.orders ?? []).filter((o) => o.status === 'listo' && o.mode === 'envio' && o.packedDay < s.day);
export function deliverOrder(s, o, tipAdd = 0) {
  o.status = 'entregado';
  const total = o.total + tipAdd;
  s.money = Math.round((s.money + total) * 100) / 100;
  if (s.today) { s.today.sales += o.items.length; s.today.revenue += o.total; s.today.tips += tipAdd; }
  s.rep += 2; s.followers += 1;
  s.stats ??= { sold: 0, regulars: {} };
  s.stats.sold += o.items.length;
  gainXp(s, 12 + 4 * o.items.length);
  addPts(s, 12 * o.items.length);
  return total;
}

/* ---------- Encargos de clientes ---------- */

export function addEncargo(s, c) {
  s.encargos ??= [];
  if (s.encargos.some((e) => e.charId === c.charId && e.bookId === c.target)) return;
  s.encargos.push({ uid: uid(), charId: c.charId, name: c.name, person: c.person, bookId: c.target, day: s.day });
}

export function openShop(s) {
  s.phase = 'serving';
  s.idx = 0;
  s.served = 0;
  s.current = null;
  if (!s.queue.length) endDay(s);
}

// Los clientes llegan solos y se atienden en el orden en que llegan al mostrador
export function attend(s, c) { s.current = c; }
export function release(s) {
  s.current = null;
  s.served = (s.served ?? 0) + 1;
  s.idx = s.served;
  if (s.served >= s.queue.length) endDay(s);
}
export const ambientCount = (s) => s.day === 0 ? 0 : Math.max(2, Math.round(1.2 + s.level * 0.9));
export const crowdCap = (s) => Math.min(8, 2 + Math.ceil(s.level * 0.6));

/* ---------- Atender ---------- */

export function evaluate(book, c) {
  if (c.target) {
    if (book.id === c.target) return 3;
    if (c.type === 'title') return 0;
    const overlap = book.tags.filter((t) => (c.revealed ?? []).includes(t)).length;
    if (book.genre === c.genre) return overlap >= 1 ? 2 : 1;
    return overlap >= 2 ? 1 : 0;
  }
  if (c.type === 'title') {
    if (book.id === c.bookId) return 3;
    const overlap = book.tags.filter((t) => c.tags.includes(t)).length;
    return book.genre === c.genre && overlap >= 1 ? 1 : 0;
  }
  if (c.type === 'tags') {
    const overlap = book.tags.filter((t) => c.tags.includes(t)).length;
    return overlap >= c.tags.length && overlap >= 2 ? 3 : overlap >= 1 ? (c.tags.length === 1 ? 3 : 2) : 0;
  }
  return book.genre === c.genre ? 2 : 0;
}

// Cuenta de cada título: ejemplar expuesto y copias en el almacén
export function sellable(s) {
  const map = new Map();
  for (const [id, n] of onDisplay(s)) map.set(id, { shop: n, store: 0 });
  for (const [id, n] of Object.entries(s.storage)) {
    const e = map.get(id) ?? { shop: 0, store: 0 };
    e.store = n;
    map.set(id, e);
  }
  return map;
}

// Al vender se usa primero una copia del almacén (el ejemplar de la estantería se queda); si no hay, el expuesto.
function takeCopy(s, id) {
  if ((s.storage[id] ?? 0) > 0) {
    s.storage[id]--;
    if (s.storage[id] <= 0) delete s.storage[id];
    return { onTable: onTableNow(s, id), fetched: true };
  }
  const r = removeFromDisplay(s, id);
  return r ? { ...r, fetched: false } : null;
}
function onTableNow(s, id) {
  return containers(s).some((c) => c.kind === 'table' && c.arr.includes(id));
}

function removeFromDisplay(s, id) {
  for (const c of containers(s)) {
    const i = c.arr.indexOf(id);
    if (i >= 0) {
      c.arr.splice(i, 1);
      return { onTable: c.kind === 'table' };
    }
  }
  return null;
}

const REVIEWS = {
  1: [
    'Mala experiencia. Me hicieron esperar y al final me dieron un libro que no tenía nada que ver con lo que pedí.',
    'Muy bonito el local, pero no me escucharon. Salí sin nada y de mal humor.',
    'No vuelvo. Pedí algo concreto y me ofrecieron cualquier cosa.',
    'Una pena: tanto cojín y tanta vela para esto. Me fui con las manos vacías.',
  ],
  5: [
    '¡Qué joya de librería! Me recomendaron «{t}» y no pude soltarlo.',
    'Entré a mirar y salí con «{t}». Justo lo que buscaba. Volveré.',
    '«{t}» me ha dejado sin palabras. Gracias por la recomendación.',
    'Un rincón mágico. Me llevé «{t}» y tengo la noche planeada.',
  ],
  4: ['Me ha gustado «{t}», aunque esperaba un poco más. Sitio muy acogedor.', 'Buen trato y buen ojo. «{t}» promete bastante.'],
  3: ['«{t}» está bien, no era justo lo que buscaba, pero el trato fue encantador.', 'Preciosa tienda. El libro, correcto sin más.'],
  2: ['No tenían lo que buscaba, aunque el sitio es muy bonito.', 'Me fui con las manos vacías, pero con ganas de volver.'],
};

function maybeReview(s, book, stars) {
  if (stars <= 2) { const loss = stars === 1 ? 2 : 1; s.rep = Math.max(0, s.rep - loss); s.followers = Math.max(0, s.followers - (stars === 1 ? 2 : 1)); }
  if (!s.social.pluma.on) return null;
  const chance = { 5: 0.6, 4: 0.4, 3: 0.3, 2: 0.55, 1: 0.8 }[stars] ?? 0.3;
  if (Math.random() > chance) return null;
  const text = pick(REVIEWS[stars]).replace('{t}', book ? book.title : '');
  const likes = Math.round((2 + Math.random() * 10) * (1 + s.followers / 80) * (stars >= 4 ? 1.3 : 0.7));
  const post = { kind: 'review', day: s.day, user: `@${pick(HANDLES)}`, stars, text, likes, bookId: book?.id ?? null };
  s.feed.unshift(post);
  s.feed = s.feed.slice(0, 40);
  s.followers += stars >= 4 ? 1 + Math.floor(likes / 12) : 0;
  s.today.reviews = (s.today.reviews ?? 0) + 1;
  return post;
}

// Minijuego de ordenar estantes: una vez por día; premia con dinero, experiencia y mejores propinas hoy
export function tidyReward(s, stars) {
  const money = 8 + 5 * stars + 2 * s.level;
  s.money = Math.round((s.money + money) * 100) / 100;
  s.tidyDay = s.day;
  addPts(s, 15);
  gainXp(s, 6 + 3 * stars);
  return { money, xp: 6 + 3 * stars };
}

function gainXp(s, amount) {
  s.xp += amount;
  s.today.xp += amount;
  const lv = levelFor(s.xp);
  while (s.level < lv) {
    s.level++;
    s.levelUps.push(s.level);
  }
}

export function offer(s, bookId, opts = {}) {
  const c = s.current;
  const book = BOOK[bookId];
  if (!c || !book) return { error: 'No hay cliente.' };
  let score = evaluate(book, c);
  const special = !!book.ed && !!opts.special;
  if (c.budget && score > 0 && book.price * (special ? book.ed.mult : 1) > c.budget) {
    c.tries--;
    return { sold: false, score: 0, left: c.tries <= 0, message: 'Uy, eso se me va de presupuesto… ¿Tienes algo más barato?' };
  }
  if (c.collector && book.ed && !special && score >= 3) score = 2;
  if (score === 0) {
    c.tries--;
    const left = c.tries <= 0;
    if (left) {
      s.today.left++;
      const post = maybeReview(s, null, Math.random() < 0.6 ? 1 : 2);
      return { sold: false, score, left, review: post, message: nopeLine(c) };
    }
    return { sold: false, score, left: false, message: `${nopeLine(c)} ¿Tienes otra cosa?` };
  }
  if (score === 1 && Math.random() < 0.5) {
    c.tries--;
    return { sold: false, score, left: c.tries <= 0, message: 'Parece interesante… pero no me acaba de convencer.' };
  }
  const place = takeCopy(s, bookId);
  if (!place) return { error: 'Ya no te quedan ejemplares de ese libro.' };
  const trending = s.trend.some((t) => t.id === bookId && t.until >= s.day);
  const price = Math.round(book.price * (special ? book.ed.mult : 1) * (place.onTable ? 1.1 : 1) * (trending ? 1.2 : 1));
  addPts(s, 10);
  s.soldBy ??= {}; s.soldBy[bookId] = (s.soldBy[bookId] ?? 0) + 1;
  const tip = score >= 2 ? Math.round(price * 0.1 * Math.min(1, cozy(s) / 8) * (countOf(s, 'coffee') && placed(s.furniture).some((f) => f.type === 'coffee') ? 1.5 : 1) * (s.tidyDay === s.day ? 1.3 : 1) * (c.collector && special ? 2 : 1) * 10) / 10 : 0;
  s.money += price + tip;
  s.today.sales++;
  s.today.revenue += price;
  s.today.tips += tip;
  s.rep += score;
  s.stats ??= { sold: 0, regulars: {} };
  s.stats.sold++;
  if (c.charId) s.stats.regulars[c.charId] = true;
  gainXp(s, 10 + (score === 3 ? 8 : score === 2 ? 3 : 0));
  const stars = score === 3 ? 5 : score === 2 ? 4 : 3;
  const post = maybeReview(s, book, stars);
  const reads = placed(s.furniture).some((f) => f.type === 'armchair' || f.type === 'sofa') && score >= 2 && Math.random() < 0.45;
  if (reads) {
    s.nook = { person: c.person };
    s.rep += 1;
  }
  if (c.pickup) { s.encargos = (s.encargos ?? []).filter((e) => e.uid !== c.encargoUid); s.rep += 1; s.followers += 1; }
  return { sold: true, special, score, price, tip, stars, review: post, reads, fetched: place.fetched, message: thanksLine(c) };
}

// penalty = false cuando el cliente pedía algo que de verdad no tenías: se va sin enfado
export function dismiss(s, penalty = true, c = null) {
  if (c?.pickup || c?.parcel) {
    if (c.pickup) s.encargos = (s.encargos ?? []).filter((e) => e.uid !== c.encargoUid);
    if (c.parcel) { const o = webOrder(s, c.parcel); if (o) o.status = 'rechazado'; }
    s.rep = Math.max(0, s.rep - 2);
    s.today.left++;
    return maybeReview(s, null, 1);
  }
  if (!penalty) { s.today.declined = (s.today.declined ?? 0) + 1; return null; }
  s.today.left++;
  return maybeReview(s, null, Math.random() < 0.4 ? 1 : 2);
}

export function nextCustomer(s) {
  s.idx++;
  s.current = s.queue[s.idx] ?? null;
  if (!s.current) endDay(s);
}

/* ---------- Cuentas del día: IVA y gastos fijos ---------- */

export const IVA_LIBROS = 0.04;   // IVA superreducido de los libros en España; el precio de venta ya lo incluye
const round2 = (n) => Math.round(n * 100) / 100;
export const rentFor = (s) => Math.round(6 + 2 * s.level + 6 * s.expansions.length);   // alquiler y suministros por día

function closeBooks(s) {
  const gross = s.today.revenue;
  const iva = round2(gross - gross / (1 + IVA_LIBROS));
  const rent = rentFor(s);
  s.money = round2(s.money - iva - rent);
  Object.assign(s.today, { gross, iva, rent, net: round2(gross + s.today.tips - iva - rent) });
}

export const eventsOn = (s) => s.expansions.includes('oeste') || s.expansions.includes('cafe');

function endDay(s) {
  s.phase = 'evening';
  s.current = null;
  closeBooks(s);
  const newFurn = Object.entries(FURN).filter(([, d]) => !d.fixed).filter(([, d]) => {
    for (let n = 0; n < d.max; n++) { const L = d.level(n); if (L > s.today.level0 && L <= s.level) return true; }
    return false;
  }).map(([, d]) => d.name);
  s.summary = {
    day: s.day, ...s.today, profit: round2(s.money - s.today.money0), levelUps: [...s.levelUps],
    newItems: [...newFurn, ...ITEMS.filter((i) => i.level > s.today.level0 && i.level <= s.level).map((i) => i.name)],
    newBooks: BOOKS.filter((b) => b.unlock > s.today.level0 && b.unlock <= s.level).map((b) => b.id),
    newNetworks: Object.entries(NETWORKS).filter(([, n]) => n.level > s.today.level0 && n.level <= s.level).map(([k]) => k),
    newWeb: WEB_LEVEL > s.today.level0 && WEB_LEVEL <= s.level,
  };
  if (s.event) { const bonus = s.event.type === 'autor' ? 5 : 3; s.rep += bonus; s.summary.event = { ...s.event, bonus }; }
  s.history.push({ day: s.day, profit: s.summary.profit, sales: s.today.sales });
  s.levelUps = [];
}

export function nextDay(s) {
  addPts(s, 20);
  s.day++;
  startDay(s);
}

/* ---------- Redes sociales ---------- */

export function createAccount(s, kind, handle) {
  const n = NETWORKS[kind];
  if (!n || s.level < n.level) return 'Todavía no está disponible.';
  if (s.social[kind].on) return 'Ya tienes esta cuenta.';
  s.social[kind].on = true;
  if (kind === 'pluma') s.social.pluma.handle = handle || 'latintayelte';
  s.followers += 5;
  s.feed.unshift({ kind: 'system', day: s.day, text: `Has abierto tu cuenta de ${n.name.toLowerCase()}. ¡Bienvenida a la comunidad lectora!` });
  return null;
}

export const canPost = (s, kind) => s.social[kind].on && s.posted[kind] !== s.day;

export function postPhoto(s) {
  if (!canPost(s, 'foto')) return null;
  s.posted.foto = s.day;
  const likes = Math.round((8 + cozy(s) * 6 + Math.random() * 12) * (1 + s.followers / 120));
  const gained = Math.max(1, Math.round(likes / 9));
  s.followers += gained;
  const post = { kind: 'photo', day: s.day, likes, gained, caption: pick(['Tarde de lluvia y libros.', 'Rincón favorito de la tienda.', 'Novedades de hoy en las estanterías.', 'Cafecito y lectura.']) };
  s.feed.unshift(post);
  return post;
}

export function postVideo(s, bookId) {
  if (!canPost(s, 'lectok')) return null;
  s.posted.lectok = s.day;
  const book = BOOK[bookId];
  const viral = Math.random() < 0.12 + Math.min(0.25, s.followers / 600);
  const views = Math.round((600 + Math.random() * 1800) * (1 + s.followers / 200) * (viral ? 8 : 1));
  const likes = Math.round(views * (0.06 + Math.random() * 0.05));
  const gained = Math.round(likes / (viral ? 40 : 60));
  s.followers += gained;
  if (viral) s.trend.push({ id: bookId, until: s.day + 3 });
  const post = { kind: 'video', day: s.day, bookId, views, likes, gained, viral, title: book.title };
  s.feed.unshift(post);
  return post;
}

export { cellsOf };

/* ---------- Pase de temporada ---------- */

// Reclama la recompensa de un nivel y pista. Devuelve la recompensa o un texto de error.
export function claimPass(s, track, i) {
  initPass(s);
  if (i >= tierOf(s)) return 'Aún no has llegado a ese nivel.';
  if (track === 'prem' && !s.pass.premium) return 'Es de la pista premium.';
  if (s.pass[track].includes(i)) return 'Ya la tienes.';
  const r = TIERS[i][track];
  s.pass[track].push(i);
  if (r.kind === 'money') s.money = Math.round((s.money + r.n) * 100) / 100;
  else if (r.kind === 'xp') gainXp(s, r.n);
  else if (r.kind === 'furn') { const f = { uid: uid(), type: r.type, x: null, y: null, pass: true }; if (r.skin) f.skin = r.skin; if (r.type === 'shelf') f.rows = [[], [], []]; if (r.type === 'table') f.books = []; s.furniture.push(f); }
  else if (r.kind === 'edition' && EDITIONS[r.book]) { s.pass.editions[r.book] = true; applyEditions(s); }
  return r;
}
