// Pase de temporada: pista gratuita y pista premium. En esta versión de prueba todo es gratis.
import { BOOK } from './books.js';

export const SEASON = { name: 'Temporada 1', title: 'Otoño de tinta', tiers: 20, per: 100 };

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
  escarcha: { name: 'Edición Aurora Helada', pal: ['#0d1a2c', '#27506f', '#cfe9f5', '#ffffff'], edge: '#8fd3f0', edgeName: 'azul hielo', mult: 1.35 },
};

const F = (type, skin) => ({ kind: 'furn', type, skin });
const MONEY = (n) => ({ kind: 'money', n });
const XP = (n) => ({ kind: 'xp', n });
const ED = (book) => ({ kind: 'edition', book });

export const TIERS = [
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

export function initPass(s) {
  s.pass ??= { pts: 0, free: [], prem: [], premium: true, editions: {} };
  s.pass.editions ??= {};
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
  const eds = s.pass?.editions ?? {};
  const changed = [];
  for (const id of Object.keys(BOOK)) {
    const b = BOOK[id], want = eds[id] ? EDITIONS[id] : null;
    if (want && !b.ed) { b.palBase = b.pal; b.pal = want.pal; b.ed = want; changed.push(id); }
    else if (!want && b.ed) { b.pal = b.palBase; b.ed = null; changed.push(id); }
  }
  return changed;
}
