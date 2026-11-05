// Pase de temporada: pista gratuita y pista premium. En esta versión de prueba todo es gratis.
import { BOOK } from './books.js';

// La temporada activa (se rellena con activateSeason según el mes real; todo el código usa este objeto y TIERS)
export const SEASON = { id: '2026-11', name: 'Temporada 1', title: 'Otoño de tinta', banner: 'OTOÑO', tiers: 20, per: 100, story: null };

// Variantes de muebles (la pista premium las entrega como muebles nuevos en el inventario)
export const SKINS = {
  plant: { blanca: 'Maceta blanca', dorada: 'Maceta dorada', rosa: 'Maceta rosa' },
  rug: { azul: 'Azul noche', burdeos: 'Burdeos' },
  table: { marmol: 'De mármol', negra: 'Negra y dorada' },
  shelf: { blanca: 'Blanca', verde: 'Verde botella' },
  armchair: { azul: 'Azul', burdeos: 'Burdeos' },
};
export const skinName = (type, skin) => SKINS[type]?.[skin] ?? '';

// Ediciones especiales: otra paleta, cantos tintados y un precio mayor
export const EDITIONS = {
  espinas: { name: 'Edición Noche Dorada', pal: ['#0b0b0e', '#1b1b22', '#d4af37', '#f3e3a8'], edge: '#d4af37', edgeName: 'dorados', mult: 1.35 },
  alas: { name: 'Edición Brasa Viva', pal: ['#2a0610', '#6a0f22', '#f0b84a', '#fff0c8'], edge: '#b3162f', edgeName: 'rojo carmesí', mult: 1.35 },
  dunas: { name: 'Edición Arena Dorada', pal: ['#2a1608', '#8a5a1c', '#ffd27a', '#fff3d2'], edge: '#e0a93b', edgeName: 'ámbar', mult: 1.35 },
  marques: { name: 'Edición Salón de Baile', pal: ['#2a1030', '#6a2a7a', '#f2c9ea', '#ffffff'], edge: '#c070c8', edgeName: 'violeta', mult: 1.35 },
  cipres: { name: 'Edición Jardín Secreto', pal: ['#0a1a14', '#1f4a3a', '#e8d9a0', '#fff6dc'], edge: '#3f8a6a', edgeName: 'verde bosque', mult: 1.35 },
  escarcha: { name: 'Edición Aurora Helada', pal: ['#0d1a2c', '#27506f', '#cfe9f5', '#ffffff'], edge: '#8fd3f0', edgeName: 'azul hielo', mult: 1.35 },
};

const F = (type, skin) => ({ kind: 'furn', type, skin });
const MONEY = (n) => ({ kind: 'money', n });
const XP = (n) => ({ kind: 'xp', n });
const ED = (book) => ({ kind: 'edition', book });
export const STUDIO = { tripod: { name: 'Trípode de estudio', emoji: '🎥' }, phone: { name: 'Trípode para el móvil', emoji: '📱' }, rings: { name: '2 aros de luz', emoji: '💡' } };
const ST = (item) => ({ kind: 'studio', item });

const TIERS_1 = [
  { free: MONEY(40), prem: F('plant', 'blanca') },
  { free: XP(30), prem: MONEY(150) },
  { free: MONEY(50), prem: F('rug', 'azul') },
  { free: XP(40), prem: XP(60) },
  { free: F('plant'), prem: F('table', 'marmol') },
  { free: MONEY(60), prem: ED('espinas') },
  { free: XP(50), prem: F('shelf', 'blanca') },
  { free: MONEY(70), prem: MONEY(200) },
  { free: XP(50), prem: F('armchair', 'azul') },
  { free: F('rug'), prem: F('rug', 'burdeos') },
  { free: MONEY(80), prem: F('plant', 'dorada') },
  { free: XP(60), prem: F('shelf', 'verde') },
  { free: MONEY(90), prem: F('table', 'negra') },
  { free: XP(60), prem: ED('alas') },
  { free: F('side'), prem: F('armchair', 'burdeos') },
  { free: MONEY(100), prem: MONEY(300) },
  { free: XP(70), prem: F('plant', 'rosa') },
  { free: MONEY(120), prem: XP(120) },
  { free: XP(100), prem: MONEY(250) },
  { free: MONEY(200), prem: ED('escarcha') },
];

const TIERS_2 = [
  { free: MONEY(50), prem: MONEY(120) },
  { free: XP(30), prem: F('plant', 'blanca') },
  { free: ST('tripod'), prem: ST('phone') },
  { free: XP(40), prem: XP(80) },
  { free: MONEY(60), prem: F('armchair', 'azul') },
  { free: MONEY(70), prem: ED('dunas') },
  { free: XP(50), prem: MONEY(200) },
  { free: MONEY(80), prem: ST('rings') },
  { free: XP(50), prem: F('rug', 'burdeos') },
  { free: F('plant'), prem: XP(100) },
  { free: MONEY(90), prem: F('table', 'marmol') },
  { free: XP(60), prem: MONEY(250) },
  { free: MONEY(100), prem: ED('marques') },
  { free: XP(60), prem: F('shelf', 'verde') },
  { free: F('side'), prem: MONEY(300) },
  { free: MONEY(110), prem: F('armchair', 'burdeos') },
  { free: XP(80), prem: XP(150) },
  { free: MONEY(130), prem: ED('cipres') },
  { free: XP(100), prem: MONEY(350) },
  { free: MONEY(250), prem: F('table', 'negra') },
];

// Una temporada por mes del calendario real (como en los juegos con pase): su historia, su pista de premios y su pase premium (de pago)
export const SEASONS = [
  { id: '2026-11', ym: '2026-11', name: 'Temporada 1', title: 'Otoño de tinta', banner: 'OTOÑO', story: null, tiers: TIERS_1, premiumPrice: '4,99 €' },
  { id: '2026-12', ym: '2026-12', name: 'Temporada 2', title: 'Luces, cámara, libros', banner: 'LUCES', story: 'lia', tiers: TIERS_2, premiumPrice: '4,99 €' },
];
export const TIERS = [...TIERS_1];

// Elige la temporada según el mes real (o la forzada en el modo pruebas) y rellena SEASON y TIERS
export function activateSeason(date = new Date(), force = null) {
  const key = force ?? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const cur = SEASONS.find((x) => x.ym === key) ?? (key < SEASONS[0].ym ? SEASONS[0] : SEASONS[SEASONS.length - 1]);
  Object.assign(SEASON, { id: cur.id, name: cur.name, title: cur.title, banner: cur.banner, story: cur.story, premiumPrice: cur.premiumPrice, ym: cur.ym, tiers: cur.tiers.length, per: 100 });
  TIERS.length = 0; TIERS.push(...cur.tiers);
  return cur;
}
// Fin de la temporada: el primer día del mes siguiente
export function seasonEnd(ym = SEASON.ym) { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 1); }
export const seasonDaysLeft = (now = new Date()) => Math.max(0, Math.ceil((seasonEnd() - now) / 86400000));

export function initPass(s) {
  // un pase por temporada; el de la temporada activa es s.pass
  if (!s.passes) { s.passes = {}; if (s.pass) s.passes['2026-11'] = s.pass; }
  s.passes[SEASON.id] ??= { pts: 0, free: [], prem: [], premium: SEASON.id === '2026-11', editions: {} };
  s.pass = s.passes[SEASON.id];
  s.pass.editions ??= {};
  // las ediciones especiales de todas las temporadas siguen siendo tuyas
  s.editionsAll ??= {};
  Object.values(s.passes).forEach((p) => Object.assign(s.editionsAll, p.editions ?? {}));
}
export const tierOf = (s) => Math.min(SEASON.tiers, Math.floor(s.pass.pts / SEASON.per));
export function addPts(s, n) { initPass(s); s.pass.pts = Math.min(SEASON.tiers * SEASON.per, s.pass.pts + n); }
export function claimable(s) {
  initPass(s);
  const t = tierOf(s); let c = 0;
  for (let i = 0; i < t; i++) { if (!s.pass.free.includes(i)) c++; if (s.pass.premium && !s.pass.prem.includes(i)) c++; }
  return c;
}

// Pone la paleta de edición especial en los libros que la tengan (y restaura el resto)
export function applyEditions(s) {
  const eds = s.editionsAll ?? s.pass?.editions ?? {};
  const changed = [];
  for (const id of Object.keys(BOOK)) {
    const b = BOOK[id], want = eds[id] ? EDITIONS[id] : null;
    if (want && !b.ed) { b.palBase = b.pal; b.pal = want.pal; b.ed = want; changed.push(id); }
    else if (!want && b.ed) { b.pal = b.palBase; b.ed = null; changed.push(id); }
  }
  return changed;
}
