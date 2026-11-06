// Librería cozy en 3D: la tienda ocupa toda la pantalla y los menús son una barra inferior que se despliega.
import { BOOKS, BOOK, GENRES, GENRE_ORDER, TAGS, wholesale, sagaLabel, SECTIONS, sectionOf } from './books.js';
import { coverSVG, spineSVG } from './art.js';
import {
  makePassable, routePoints, frontCells, T, ROWS, FURN, FURN_ORDER, EXPANSIONS, seatSpotsFn, B, ENTRY, DOOR_ROW, setBounds, placed, blockedSet, findPath, serviceCell, seatCell, doorCell, cellsOf, dims,
} from './layout.js';
import {
  newGame, ITEMS, NETWORKS, XP_LEVELS, availableBooks, cozy, storageCount, shelfFree, shelfSlots, containers, furnById,
  inventory, countOf, buyFurniture, placeFurniture, storeFurniture, rotateFurniture, placeBook, takeBack, autoPlace, onDisplay, sellable, buyItem,
  orderBooks, pendingOrders, openShop, offer, dismiss, nextCustomer, nextDay, createAccount, canPost, postPhoto, postVideo,
  setOnTable, topSellers, claimPass, webTodo, webOrder, webAccept, webReject, canFill, packOrder, samirParcels, deliverOrder, addEncargo, WEB_LEVEL, replyMessage, unreadCount, rentFor, canVideo, makeVideo, canGift, giveGift, giftStock, discardFurniture, nudgeFurniture, pruneWindow, setWindow, windowFilled, windowBoost, WIN_SLOTS, windowOwned, directSale, LOANS, LOAN_LEVEL, loanInfo, takeLoan, repayLoan, sellBundle, openAllBoxes, evaluate, GOODS, EREADERS, GOOD, buyGood, sellGood, upsellFor, goodStock, goodUnlocked, hasStand, FORMAT_DURA, attend as attendC, release as releaseC, ambientCount, crowdCap, openBox, boxBooks, unopenedBooks, buyExpansion, ownsExpansion, setDeco, addPoster, removePoster, posterById, MAX_POSTERS,
} from './game.js';
import { genderize, setHeroGender, newCustomer, ENCARGO_YES, ENCARGO_NO, parcelLines, thanksLine, playerOptions, answer, ambientLook, CAST_LOOKS, CAST_BY_ID, sorryLine, nopeLine, isUnknown, HERO_BASES, HERO_BY_ID, SAMIR, deliveryLines } from './cast.js';
import { HERO_LOOK } from './people3d.js';
import { runOpenBox, runPackBox } from './boxscene.js';
import { initAudio, setVolumes, sfx, blip, startMusic, isMusicPlaying } from './audio.js';
import { CHAPTERS, ANSELMO_WELCOME, initStory, currentChapter, chapterProgress, completeChapter, SEASON_STORIES, currentSeasonChapter, completeSeasonChapter, seasonChapterIdx } from './story.js';
import { createWorld, ARTS, POSTER_SIZES, ROT_Y, STORE_INFO } from './world.js';
import { FLOORS, WALLS, clearBookCaches } from './kit3d.js';
import { SEASON, SEASONS, TIERS, EDITIONS, SKINS, skinName, initPass, tierOf, claimable, applyEditions, activateSeason, seasonDaysLeft, seasonEnd, STUDIO } from './pass.js';
import { showBook3D } from './viewer.js';
import { shootItem } from './photo3d.js';
import { rodeosDataURL } from './rodeos.js';
import { load, save, wipe } from './store.js';

const BUILD = '0.33.0';   // beta: 0.N.0 (sube N en cada actualización)
console.info('Mi librería · versión', BUILD);
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const layer = $('#layer');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => `${Math.round(n).toLocaleString('es-ES')} €`;
const money2 = (n) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const fmtK = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',')} mil` : String(n));

// Ajustes del dispositivo (no dependen de la partida)
const PKEY = 'libreria.prefs';
const P = { music: 70, sfx: 80, vibrate: true, hard: false };
try { Object.assign(P, JSON.parse(localStorage.getItem(PKEY) || '{}')); } catch { /* sin ajustes guardados */ }
const applyVolumes = () => setVolumes(P.music, P.sfx);
const savePrefs = () => { try { localStorage.setItem(PKEY, JSON.stringify(P)); } catch { /* ignorado */ } };
const buzz = (ms = 30) => { if (P.vibrate && navigator.vibrate) navigator.vibrate(ms); };

function prepare(s) {
  setBounds(s.expansions);
  s.settings ??= { hard: false };
  activateSeason(new Date(), s.testSeason); initStory(s); initPass(s); s.doormat ??= 'Bienvenid@s'; s.encargos ??= []; s.web ??= { orders: [], n: 1 }; if (s.phase === 'morning') s.nooks = [];
  s.msgs ??= []; s.nooks ??= (s.nook ? [{ person: s.nook.person, bookId: s.nook.bookId }] : []); s.goods ??= {}; s.missedGoods ??= {}; s.ratings ??= {}; s.album ??= []; s.notes ??= '';
  clearBookCaches(applyEditions(s));
  if (s.introSeen == null) s.introSeen = !!s.hero;
  if (s.tut == null && s.hero) s.tut = { i: 999 };
  if (s.phase === 'serving') { s.phase = 'morning'; s.current = null; s.served = 0; s.idx = 0; s.queue.forEach((c) => { c.tries = 2; c.talk = { asked: [] }; }); }
  return s;
}
const stored = () => { const s = load(); return s && s.v === 3 && s.hero ? s : null; };
window.Loading?.set(0.3);
// La música empieza ya, durante la pantalla de carga. Si el navegador no deja sonar sin un toque, se avisa y arranca al primer toque.
initAudio(); applyVolumes(); startMusic();
{
  let n = 0;
  const iv = setInterval(() => {
    n++;
    if (isMusicPlaying()) { window.Loading?.hint(''); clearInterval(iv); }
    else if (n === 4) window.Loading?.hint('Toca la pantalla para activar la música');
    else if (n > 60) clearInterval(iv);
  }, 300);
}
let S = prepare(stored() ?? newGame());
let tab = 'shop';
let panelOpen = false;
let busy = false;
let editing = false;
let editTab = 'muebles';
let selUid = null;
let selPoster = null;
const TEST_MONEY = 1000000;
const persist = () => { if (S.hero) { if (S.test) S.money = Math.max(S.money, TEST_MONEY); save(S); } };

/* ---------- Iconos ---------- */

const ICONS = {
  cog: '<path d="M19.23 9.66L21.81 10.07L21.81 13.93L19.23 14.34L18.77 15.46L20.3 17.58L17.58 20.3L15.46 18.77L14.34 19.23L13.93 21.81L10.07 21.81L9.66 19.23L8.54 18.77L6.42 20.3L3.7 17.58L5.23 15.46L4.77 14.34L2.19 13.93L2.19 10.07L4.77 9.66L5.23 8.54L3.7 6.42L6.42 3.7L8.54 5.23L9.66 4.77L10.07 2.19L13.93 2.19L14.34 4.77L15.46 5.23L17.58 3.7L20.3 6.42L18.77 8.54Z"/><circle cx="12" cy="12" r="3"/>',
  shop: '<path d="M4 9 5.5 4h13L20 9v2a3 3 0 0 1-5 2 3 3 0 0 1-6 0 3 3 0 0 1-5-2zM5 14v6h14v-6"/>',
  box: '<path d="M3 8 12 4l9 4v9l-9 4-9-4zM3 8l9 4 9-4M12 12v9"/>',
  order: '<path d="M5 4h14v16l-2.5-1.6-2.5 1.6-2-1.6-2 1.6-2.5-1.6L5 20zM9 9h6M9 13h6"/>',
  spark: '<path d="M12 20V5M6 11l6-6 6 6M5 20h14"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  plant: '<path d="M12 21v-8M12 13c-4 0-6-3-6-7 4 0 6 3 6 7zm0 0c4 0 6-3 6-7-4 0-6 3-6 7zM8 21h8"/>',
  cat: '<path d="M5 20V9l3 2 4-1 4 1 3-2v11zM9 15h.01M15 15h.01"/>',
  table: '<circle cx="12" cy="9" r="6"/><path d="M12 15v6M8 21h8"/>',
  armchair: '<path d="M5 18v-7a3 3 0 0 1 6 0v3h2v-3a3 3 0 0 1 6 0v7M3 18h18M7 18v3M17 18v3"/>',
  shelf: '<path d="M5 3v18M19 3v18M5 9h14M5 15h14M8 4v4M11 5v3M14 4v4M8 10v4M12 11v3M15 10v4"/>',
  lights: '<path d="M3 6c4 4 14 4 18 0M6 9v3M12 11v3M18 9v3"/>',
  escaparate: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18M3 15h18M8 10V8M12 15v-2M16 10V7"/>',
  ereader: '<rect x="7" y="3" width="10" height="15" rx="1.5"/><path d="M10 8h4M10 11h4M9 21h6"/>',
  coffee: '<path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM16 10h2a2 2 0 0 1 0 4h-2M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4"/>',
  lamp: '<path d="M8 3h8l2 8H6zM12 11v9M8 20h8"/>',
  rug: '<path d="M4 6h16v12H4zM7 9h10v6H7z"/>',
  side: '<path d="M5 8h14M7 8v12M17 8v12M9 5h6"/>',
  sofa: '<path d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3M3 18v-6a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v6zM6 18v2M18 18v2"/>',
  decor: '<path d="M4 20 20 4M14 4h6v6M4 10v10h10"/>',
  door: '<path d="M6 21V4h9l3 2v15M3 21h18M12 12h.01"/>',
  poster: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 15l3-4 3 3 2-2 2 3"/>',
  floor: '<path d="M3 17 12 12l9 5-9 5zM3 12l9-5 9 5M3 7l9-5 9 5"/>',
  wall: '<path d="M4 4h16v16H4zM4 10h16M4 16h16M10 4v6M16 10v6M8 16v4"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] ?? ICONS.spark}</svg>`;

/* ---------- Avisos y hojas ---------- */

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; sfx('pop');
  el.textContent = msg;
  const bar = document.getElementById('bar');
  if (bar && !bar.hidden) { const top = bar.getBoundingClientRect().top; if (top > 120) el.style.bottom = `${Math.round(innerHeight - top + 12)}px`; }   // encima del menú, sin tapar los libros
  el.style.zIndex = '3000';
  document.body.append(el);
  setTimeout(() => el.classList.add('out'), 2300);
  setTimeout(() => el.remove(), 2800);
}
function openSheet(html, cls = '') {
  layer.innerHTML = `<div class="sheet-bg" data-act="close"></div><div class="sheet ${cls}" role="dialog">${html}</div>`;
  layer.hidden = false;
}
function closeSheet() { layer.innerHTML = ''; layer.hidden = true; }
const sheetHead = (t) => `<div class="sheet-h"><h2>${t}</h2><button type="button" class="x" data-act="close" aria-label="Cerrar">×</button></div>`;
const waitSheet = (html, cls) => new Promise((res) => { openSheet(html, cls); layer._res = res; });
function dismissSheet() { const r = layer._res; layer._res = null; closeSheet(); r?.(); }

/* ---------- El mundo ---------- */

const world = createWorld($('#c'), $('#bubbles'), {
  onTap: (h) => {
    if (editing) return;
    if (h.kind === 'furn') {
      const f = furnById(S, h.uid);
      if (f && (f.type === 'shelf' || f.type === 'table')) furnSheet(h.uid);
      else if (f && f.type === 'escaparate') windowSheet(h.uid);
    } else if (h.kind === 'box') boxTap(h.id);
    else if (h.kind === 'door') doorTap(h.to);
    else if (h.kind === 'stockShelf') shelfTap(h.idx);
    else if (h.kind === 'person') { if (line[0] && h.p === line[0].p) attend(); }
    else if (h.kind === 'floor') walkHeroTo(h.cell);
  },
  onSelect: (uid) => { selUid = uid; selPoster = null; world.select(uid); renderEditPanel(); },
  onDrop: (uid, c, r) => {
    const err = placeFurniture(S, uid, c, r);
    if (err) { toast(err); return; }
    selUid = uid; persist(); syncWorld(); renderEditPanel(); renderTop();
  },
  onDropOutside: (uid) => { /* soltar sobre el panel: se queda donde estaba */ void uid; },
  onPosterSelect: (uid) => { selPoster = uid; selUid = null; world.select(null); renderEditPanel(); },
  onPosterDrop: (uid, side, u, v) => {
    const p = posterById(S, uid);
    if (!p) return;
    Object.assign(p, { side, u, v });
    persist();
  },
});

function timeState() {
  const total = S.queue.length || 1;
  let t = 0.06;
  if (S.phase === 'serving') t = 0.06 + 0.8 * (S.idx / total);
  if (S.phase === 'evening') t = 0.95;
  return { t, weather: S.weather };
}
let crowdReady = false;
function syncWorld() { pruneWindow(S); world.sync(S, timeState()); world.setDoorsOpen(S.phase === 'serving' || (crowdReady && crowd.size > 0)); }
syncWorld();

const dockEl = $('#dock');
const panelEl = $('#panel');
const barEl = $('#bar');

function updateShift() {
  const open = panelOpen || editing;
  const serve = $('#serve').hidden ? 0 : $('#serve').offsetHeight;
  const h = open ? barEl.offsetHeight : serve;
  world.setShift(h * 0.5);
}

/* ---------- Cabecera y barra inferior ---------- */

function renderTop() {
  if (S.test && S.money < TEST_MONEY) S.money = TEST_MONEY;   // modo pruebas: dinero que nunca se acaba
  const next = XP_LEVELS[S.level] ?? null;
  const prev = XP_LEVELS[S.level - 1];
  const pct = next ? Math.round(((S.xp - prev) / (next - prev)) * 100) : 100;
  $('#hud').innerHTML = `
    <div class="hud-l"><b>${esc(S.shopName)}</b><span>${S.day === 0 ? 'Tutorial · día 0' : `Día ${S.day}`} · ${S.weather === 'lluvia' ? 'lluvia' : S.weather === 'nublado' ? 'nublado' : 'soleado'}</span></div>
    <div class="hud-r"><b class="coin">${money(S.money)}</b><span class="lvl">Nivel ${S.level}</span><div class="xp"><i style="width:${pct}%"></i></div></div>`;
  const items = [['shop', 'Tienda'], ['stock', 'Almacén', 'box'], ['orders', 'Pedidos', 'order'], ['upgrades', 'Mejoras', 'spark'], ['social', 'Redes', 'chat'], ['settings', 'Ajustes', 'cog']];
  $('#icons').innerHTML = items.map(([id, label, ic]) => {
    const badge = id === 'social' ? webTodo(S) : id === 'stock' ? S.boxes.length : id === 'upgrades' ? unseenUpg() : 0;
    const on = (id === 'stock' && world.view === 'store') || (id === 'shop' && world.view === 'shop' && !panelOpen && !editing && false) || ((panelOpen || editing) && ((editing && id === 'shop') || (!editing && tab === id)));
    return `<button type="button" class="${on ? 'on' : ''}" data-act="${id === 'settings' ? 'openSettings' : 'tab'}" data-id="${id}" title="${label}" aria-label="${label}">${icon(ic ?? id)}${badge ? `<em>${badge}</em>` : ''}</button>`;
  }).join('');
  $('#backshop').hidden = world.view !== 'store';
  renderPassBtn();
}

// Ilustración de la temporada (otoño): se estira hasta cubrir todo el recuadro
function passArt(pre) {
  return `<svg viewBox="0 0 64 96" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="${pre}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4a24a"/><stop offset=".5" stop-color="#c0442f"/><stop offset="1" stop-color="#4a1d2a"/></linearGradient>
      <radialGradient id="${pre}gl" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>
    <rect width="64" height="96" fill="url(#${pre}bg)"/><circle cx="32" cy="42" r="34" fill="url(#${pre}gl)"/>
    <path d="M0 96c4-16 10-26 17-28-2 10 0 20 7 28zM44 96c-2-12 0-20 7-25 3 7 7 16 13 25z" fill="#3a1520" opacity=".5"/>
    <g transform="translate(32 44)"><path d="M-17 8V-12q8-4 17 0 9-4 17 0V8q-9-4-17 0-8-4-17 0z" fill="#fbf0d6" stroke="#4a2f24" stroke-width="1.6" stroke-linejoin="round"/><path d="M0-12V8" stroke="#4a2f24" stroke-width="1.4"/><path d="M-12-5h8M-12 0h8M5-5h8M5 0h8" stroke="#b8402f" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></g>
    <path d="M46 16c-8 0-14 6-14 14 8 0 14-6 14-14z" fill="#e3b04b" stroke="#7a3a20" stroke-width="1.2"/><path d="M46 16c-4 4-9 9-13 14" stroke="#7a3a20" stroke-width="1" fill="none"/>
    <path d="M13 22c-4 0-7 3-7 7 4 0 7-3 7-7z" fill="#f3c97a" stroke="#7a3a20" stroke-width="1"/><path d="M55 54c-3 0-5 2-5 5 3 0 5-2 5-5z" fill="#d9792f" stroke="#7a3a20" stroke-width=".8"/>
    <path class="spk" d="M53 46l1.6 3.8 3.8 1.6-3.8 1.6L53 56.8l-1.6-3.8-3.8-1.6 3.8-1.6z" fill="#fff3b0"/><path class="spk s2" d="M9 56l1.1 2.6 2.6 1.1-2.6 1.1L9 63.4 7.9 60.8 5.3 59.7l2.6-1.1z" fill="#fff3b0"/>
  </svg>`;
}

// Versión apaisada de la misma ilustración para la cabecera del pase
function xmasBanner() {
  const flake = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#fff" stroke-width="1.2" stroke-linecap="round"><path d="M0-6V6M-5.2-3 5.2 3M-5.2 3 5.2-3"/></g>`;
  return `<svg viewBox="0 0 160 44" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="pbx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f3a2a"/><stop offset=".6" stop-color="#1f6a45"/><stop offset="1" stop-color="#b3262e"/></linearGradient></defs>
    <rect width="160" height="44" fill="url(#pbx)"/>
    ${flake(60, 10)}${flake(84, 30, .8)}${flake(102, 12, .7)}${flake(48, 34, .7)}${flake(150, 8, .6)}
    <g transform="translate(130 26)"><path d="M0-17 12 4H-12z" fill="#2f8a4f" stroke="#0b2a1c" stroke-width="1.4" stroke-linejoin="round"/><path d="M0-9 9 8H-9z" fill="#3aa05f" stroke="#0b2a1c" stroke-width="1.4" stroke-linejoin="round"/><rect x="-2.5" y="8" width="5" height="5" fill="#6a3d22"/><path class="spk" d="M0-21l1.6 3.4 3.4 1.6-3.4 1.6L0-11l-1.6-3.4-3.4-1.6 3.4-1.6z" fill="#ffe27a"/></g>
    <circle cx="125" cy="22" r="2" fill="#ffd86b"/><circle cx="133" cy="14" r="2" fill="#ff6b6b"/><circle cx="130" cy="31" r="2" fill="#ffd86b"/>
  </svg>`;
}
const nextSeasonId = () => SEASONS[(SEASONS.findIndex((x) => x.id === SEASON.id) + 1) % SEASONS.length].id;
function passBanner() {
  if (SEASON.banner === 'NAVIDAD') return xmasBanner();
  const leaf = (x, y, r, c, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0-9c7 3 9 11 0 18-9-7-7-15 0-18z" fill="${c}" stroke="#7a3a20" stroke-width=".9"/><path d="M0-9V9" stroke="#7a3a20" stroke-width=".7"/></g>`;
  return `<svg viewBox="0 0 160 44" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="pbn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a1d2a"/><stop offset=".55" stop-color="#c0442f"/><stop offset="1" stop-color="#f4a24a"/></linearGradient>
      <radialGradient id="pbg2" cx=".82" cy=".5" r=".4"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>
    <rect width="160" height="44" fill="url(#pbn)"/><rect width="160" height="44" fill="url(#pbg2)"/>
    ${leaf(70, 12, 30, '#e3b04b')}${leaf(92, 32, -40, '#d9792f', .9)}${leaf(108, 10, 70, '#f3c97a', .8)}${leaf(56, 34, 15, '#c0442f', .8)}${leaf(148, 8, -25, '#e3b04b', .7)}
    <g transform="translate(130 24)"><path d="M-17 8V-12q8-4 17 0 9-4 17 0V8q-9-4-17 0-8-4-17 0z" fill="#fbf0d6" stroke="#4a2f24" stroke-width="1.6" stroke-linejoin="round"/><path d="M0-12V8" stroke="#4a2f24" stroke-width="1.4"/><path d="M-12-5h8M-12 0h8M5-5h8M5 0h8" stroke="#b8402f" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></g>
    <path class="spk" d="M104 24l1.6 3.8 3.8 1.6-3.8 1.6L104 34.8l-1.6-3.8-3.8-1.6 3.8-1.6z" fill="#fff3b0"/><path class="spk s2" d="M154 36l1.1 2.6 2.6 1.1-2.6 1.1L154 43.4l-1.1-2.6-2.6-1.1 2.6-1.1z" fill="#fff3b0"/>
  </svg>`;
}

// Botón del pase en la pantalla del juego: ilustración de la temporada, nivel y aviso de premios
function renderPassBtn() {
  const b = $('#passBtn'); if (!b) return;
  const t = tierOf(S), c = claimable(S), pct = t >= SEASON.tiers ? 100 : Math.round(((S.pass.pts % SEASON.per) / SEASON.per) * 100);
  b.classList.toggle('hot', c > 0);
  b.innerHTML = `${passArt('pb')}
  <span class="pb-t"><b>${SEASON.banner}</b>${SEASON.name}</span><span class="pb-n">Nivel ${t}</span><i class="pb-bar"><b style="width:${pct}%"></b></i>${c ? `<em>${c}</em>` : ''}`;
}

// Novedades de Mejoras que aún no has visto: al entrar en la pestaña se dan por vistas (las pongas o no)
function unseenUpg() {
  const seen = new Set(S.seenFurn ?? []);
  return inventory(S).filter((f) => !seen.has(f.uid)).length + Math.max(0, claimable(S) - (S.seenClaim ?? 0));
}
function markUpgSeen() { S.seenFurn = inventory(S).map((f) => f.uid); S.seenClaim = claimable(S); }

function renderPanel() {
  if (panelOpen && tab === 'upgrades' && !editing) markUpgSeen();
  barEl.classList.toggle('open', panelOpen || editing);
  barEl.classList.toggle('edit', editing);
  if (editing) renderEditPanel();
  else if (panelOpen) ({ shop: panelShop, stock: panelStock, orders: panelOrders, upgrades: panelUpgrades }[tab])();
  renderTop();
  renderServe();
  requestAnimationFrame(updateShift);
}

function goShop() { world.setView('shop'); syncWorld(); placeHero(); renderTop(); }
function showTab(id) {
  if (editing) toggleEdit();
  if (id === 'social') { panelOpen = false; renderPanel(); openPhone(); return; }
  if (id === 'stock' && world.view === 'shop') { doorTap('store'); return; }
  if (id === 'shop' && world.view === 'store') { doorTap('shop'); return; }
  if (panelOpen && tab === id) panelOpen = false; else { tab = id; panelOpen = true; }
  renderPanel();
  panelEl.scrollTop = 0;
}

/* ---------- Personas: moverte, clientes que pasean y conversaciones ---------- */

const STO = STORE_INFO;
const wipeEl = $('#wipe');
const entryCell = () => [ENTRY[0][0], ROWS];
const heroCell = () => [Math.floor(world.hero.position.x), Math.floor(world.hero.position.z)];
const seatChair = (i) => { const sp = seatSpotsFn(S.furniture)[i]; return sp && seatCell(sp.f, S.furniture) ? sp.f : null; };
const sitCell = () => seatChair((S.nooks ?? []).length);   // el siguiente asiento libre (sofá grande: 2 plazas; sillón: 1)
const spd = () => window.__speed ?? 1;
const sleep = (ms) => wait(ms / spd());
const rnd = (a, b) => a + Math.random() * (b - a);

// Dónde se pone la dueña detrás del mostrador (enfrente del cliente)
function heroStation() {
  const counter = placed(S.furniture).find((f) => f.type === 'counter');
  const sc = serviceCell(S.furniture);
  if (!counter || !sc) return null;
  const d = dims('counter', counter.rot ?? 0);
  const cx = counter.x + d.w / 2, cz = counter.y + d.h / 2;
  return [2 * cx - (sc[0] + .5), 2 * cz - (sc[1] + .5)];
}
function placeHero() {
  const st = heroStation();
  if (!st) return;
  world.hero.visible = true;
  world.hero.position.set(st[0], 0, st[1]);
  const sc = serviceCell(S.furniture);
  world.hero.rotation.y = Math.atan2(sc[0] + .5 - st[0], sc[1] + .5 - st[1]);
}

/* almacén: cuadrícula pequeña con obstáculos fijos */
const storeCell = () => [Math.floor(world.hero.position.x), Math.floor(world.hero.position.z)];
function storeBlocked() {
  const b = new Set();
  for (let x = 0; x < STO.w; x++) b.add(`${x},0`);
  [[0, 3], [0, 4], [0, 5], [6, 4]].forEach(([x, y]) => b.add(`${x},${y}`));   // (6,4): la hoja de la puerta abierta hacia dentro
  S.boxes.slice(0, STO.boxSlots.length).forEach((_, i) => { const [x, z] = STO.boxSlots[i]; b.add(`${Math.floor(x)},${Math.floor(z)}`); });
  return b;
}
const storePassable = () => { const b = storeBlocked(); return (c, r) => c >= 0 && c < STO.w && r >= 0 && r < STO.d && !b.has(`${c},${r}`); };
const storeNear = (cell) => {
  const pass = storePassable();
  return [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([a, b]) => [cell[0] + a, cell[1] + b]).filter(([c, r]) => pass(c, r))
    .map((n) => ({ n, d: Math.hypot(n[0] - storeCell()[0], n[1] - storeCell()[1]) })).sort((a, b) => a.d - b.d)[0]?.n ?? null;
};

// Camina hasta una casilla siguiendo una ruta suave (diagonales y curvas)
async function routeTo(p, cell, speed = 2.5, view = world.view) {
  const pass = view === 'shop' ? makePassable(blockedSet(S.furniture)) : storePassable();
  const pts = routePoints(pass, { x: p.position.x, z: p.position.z }, cell);
  if (pts) await world.walkRoute(p, pts, speed, (x, z) => pass(Math.floor(x), Math.floor(z)));
}

async function switchView(v) {
  wipeEl.classList.add('on');
  await wait(300);
  world.setView(v);
  syncWorld();
  if (v === 'shop') {
    world.hero.position.set(B.x0 + .5, 0, DOOR_ROW + .5);
    world.hero.rotation.y = Math.PI / 2;
  }
  world.hero.visible = true;
  renderPanel();
  await wait(80);
  wipeEl.classList.remove('on');
  await wait(300);
}

let heroBusy = false;
let talking = false;
const canMove = () => !busy && !heroBusy && !talking && !editing;

async function heroToStore() {
  await routeTo(world.hero, doorCell(), 3.4);
  await world.walkTo(world.hero, B.x0 - .5, DOOR_ROW + .5, 3);
  world.hero.visible = false;
  await switchView('store');
  await world.walkTo(world.hero, STO.door[0] - .4, STO.door[1] + .5, 2.5);
}
async function heroToShop() {
  await routeTo(world.hero, STO.door, 3.4, 'store');
  await world.walkTo(world.hero, STO.door[0] + 1.1, STO.door[1] + .5, 3);
  world.hero.visible = false;
  await switchView('shop');
  await world.walkTo(world.hero, B.x0 + 1.5, DOOR_ROW + .5, 2.5);
}

async function walkHeroTo(cell) {
  if (!canMove()) return;
  heroBusy = true;
  await routeTo(world.hero, cell, 3.2);
  heroBusy = false;
}
async function doorTap(to) {
  if (!canMove()) return;
  heroBusy = true;
  panelOpen = false; renderPanel();
  if (to === 'store' && world.view === 'shop') await heroToStore();
  else if (to === 'shop' && world.view === 'store') await heroToShop();
  heroBusy = false;
}
async function boxTap(id) {
  if (!canMove()) return;
  const i = S.boxes.findIndex((b) => b.id === id);
  if (i < 0) return;
  const [bx, bz] = STO.boxSlots[i];
  const near = storeNear([Math.floor(bx), Math.floor(bz)]);
  heroBusy = true;
  if (near) { await routeTo(world.hero, near, 3.2); world.face(world.hero, bx - world.hero.position.x, bz - world.hero.position.z); }
  heroBusy = false;
  openBoxGame(id);
}
async function shelfTap(idx) {
  if (!canMove()) return;
  const front = STO.shelfFront[idx] ?? STO.shelfFront[0];
  heroBusy = true;
  await routeTo(world.hero, front, 3.2);
  world.face(world.hero, 0, -1);
  heroBusy = false;
  tab = 'stock'; panelOpen = true; renderPanel();
}

/* ---------- Clientes: entran, pasean por las estanterías, hacen cola y se van ---------- */

const crowd = new Set();       // todos los que hay ahora dentro de la tienda
crowdReady = true;
const line = [];               // cola del mostrador (solo clientes con conversación)
const spotsTaken = new Set();
let dayTok = 0;
let attending = null;          // cliente al que estás atendiendo

const frontDir = (f) => [[0, 1], [-1, 0], [0, -1], [1, 0]][f.rot ?? 0];
function lineCells() {
  const counter = placed(S.furniture).find((f) => f.type === 'counter');
  const sc = serviceCell(S.furniture);
  if (!counter || !sc) return [];
  const [dx, dz] = frontDir(counter), pass = makePassable(blockedSet(S.furniture));
  const out = [];
  for (let i = 0; i < 4; i++) { const c = [sc[0] + dx * i, sc[1] + dz * i]; if (pass(c[0], c[1]) && c[1] < ROWS) out.push(c); else break; }
  return out;
}

function browseSpots() {
  const pass = makePassable(blockedSet(S.furniture));
  const lc = new Set(lineCells().map(([c, r]) => `${c},${r}`));
  const seen = new Set(), spots = [];
  const add = (cell, face) => {
    const k = `${cell[0]},${cell[1]}`;
    if (seen.has(k) || lc.has(k) || !pass(cell[0], cell[1]) || cell[1] >= ROWS || (cell[0] === ENTRY[0][0] || cell[0] === ENTRY[1][0]) && cell[1] >= ROWS - 2) return;
    seen.add(k); spots.push({ cell, face, key: k });
  };
  for (const f of placed(S.furniture)) {
    if (f.type === 'shelf') { const [dx, dz] = frontDir(f); frontCells(f).forEach((c) => add(c, [-dx, -dz])); }
    else if (['table', 'cat', 'coffee', 'ereader', 'escaparate'].includes(f.type)) {
      for (const [c, r] of cellsOf(f)) for (const [dc, dr] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) add([c + dc, r + dr], [-dc, -dr]);
    }
  }
  return spots;
}
function takeSpot() {
  const free = browseSpots().filter((s) => !spotsTaken.has(s.key));
  if (!free.length) return null;
  const s = free[Math.floor(Math.random() * free.length)];
  spotsTaken.add(s.key);
  return s;
}

async function exitShop(e) {
  if (e.p.parent) {
    e.p.userData.ghost = true;   // al irse no choca con nadie
    // primero se aparta hacia un lado de la cola y luego va a la puerta (no vuelve hacia atrás entre los que esperan)
    try {
      const pass = makePassable(blockedSet(S.furniture)), here = [Math.floor(e.p.position.x), Math.floor(e.p.position.z)], lc = lineCells();
      const side = [[1, 0], [-1, 0], [2, 0], [-2, 0]].map(([dx, dz]) => [here[0] + dx, here[1] + dz]).find((c) => pass(c[0], c[1]) && !lc.some((l) => l[0] === c[0] && l[1] === c[1]));
      if (side && world.view === 'shop' && lc.length) await routeTo(e.p, side, rnd(2.2, 2.6), 'shop');
    } catch { /* sigue por el camino normal */ }
    await routeTo(e.p, entryCell(), rnd(2, 2.5), 'shop');
    const ec = entryCell();
    // si no había camino libre, cruza en línea recta hasta la puerta en vez de desaparecer a mitad de la tienda
    if (e.p.parent && Math.hypot(e.p.position.x - (ec[0] + .5), e.p.position.z - (ec[1] + .5)) > 1.5) await world.walk(e.p, [[ec[0], ec[1]]], 2.2);
  }
  world.removePerson(e.p);
}

async function updateLine() {
  const cells = lineCells();
  line.forEach((e, i) => {
    const cell = cells[Math.min(i, cells.length - 1)];
    if (!cell || e.slotKey === `${cell[0]},${cell[1]}`) return;
    e.slotKey = `${cell[0]},${cell[1]}`;
    const tok = (e.moveTok = (e.moveTok ?? 0) + 1);
    e.atCounter = false;
    routeTo(e.p, cell, 2.1).then(() => {
      if (e.moveTok !== tok || !line.includes(e)) return;
      const sc = serviceCell(S.furniture), st = heroStation();
      if (i === 0 && st && sc && line[0] === e) {
        world.face(e.p, st[0] - e.p.position.x, st[1] - e.p.position.z);
        e.atCounter = true;
        renderServe();
      }
    });
  });
}

// Al cerrar la tienda, los que leen se levantan, dejan el libro en una estantería y se van por la puerta
async function readersLeave() {
  const list = [...(S.nooks ?? [])];
  if (!list.length) return;
  const spots = seatSpotsFn(S.furniture);
  S.nooks = []; persist(); syncWorld();
  await Promise.all(list.map(async (n, k) => {
    await wait(k * 600);
    const sp = spots[k]; if (!sp) return;
    const d = dims(sp.f.type, sp.f.rot ?? 0);
    const p = world.spawn(n.person, seatCell(sp.f, S.furniture) ?? [sp.f.x, sp.f.y], ROT_Y_LEAVE(sp.f), false);
    p.position.set(sp.f.x + d.w / 2 + sp.dx, 0, sp.f.y + d.h / 2 + sp.dz);
    world.carry(p, n.bookId ?? 'alas');
    const e = { p };
    const spot = takeSpot();
    if (spot) { await routeTo(p, spot.cell, 2); world.face(p, spot.face[0], spot.face[1]); await wait(900); spotsTaken.delete(spot.key); }
    world.carry(p, null);   // deja el libro en su sitio
    await exitShop(e);
  }));
}
const ROT_Y_LEAVE = (f) => [0, Math.PI / 2, Math.PI, -Math.PI / 2][f.rot ?? 0];

// Un curioso se sienta en un sillón o sofá a leer un rato (se queda sentado hasta cerrar)
async function goRead(e, tok) {
  const chair = sitCell();
  if (!chair) return false;
  const pass = makePassable(blockedSet(S.furniture));
  const seat = seatCell(chair, S.furniture);
  const pts = routePoints(pass, { x: e.p.position.x, z: e.p.position.z }, seat);
  if (!pts) return false;
  await world.walkRoute(e.p, pts, 2.2, (x, z) => pass(Math.floor(x), Math.floor(z)));
  if (tok !== dayTok || !sitCell()) return false;
  (S.nooks ??= []).push({ person: e.p.userData.look, bookId: null });
  world.removePerson(e.p);
  syncWorld();
  return true;
}

// Un curioso coge un libro de una estantería y va a la caja: hace cola y lo atiendes tú (sin conversación: solo cobrar)
async function directBuy(e, tok) {
  const shown = [...onDisplay(S).keys()];
  if (!shown.length || S.phase !== 'serving') return;
  const id = pickOne(shown);
  const spot = takeSpot();
  if (spot) {
    await routeTo(e.p, spot.cell, rnd(1.8, 2.3));
    world.face(e.p, spot.face[0], spot.face[1]);
    await sleep(rnd(900, 1600));
    spotsTaken.delete(spot.key);
  }
  if (tok !== dayTok) return;
  world.carry(e.p, id);
  // se convierte en un cliente más de la cola (marcado como «directo»)
  e.c = { direct: true, charId: 'cliente', name: 'Cliente', type: 'direct', bookId: id, person: e.p.userData.look, talk: { asked: [] }, line: `Me llevo «${BOOK[id].title}».` };
  e.bust = world.portrait(e.p.userData.look);
  e.ambient = false;
  while (line.length >= Math.max(1, lineCells().length) && tok === dayTok && S.phase === 'serving') await sleep(1000);
  if (tok !== dayTok || S.phase !== 'serving') { world.carry(e.p, null); return; }
  e.done = new Promise((r) => { e.finish = r; });
  line.push(e);
  updateLine();
  await Promise.race([e.done, (async () => { while (tok === dayTok && S.phase === 'serving' && line.includes(e)) await sleep(700); })()]);
  const i = line.indexOf(e); if (i >= 0) line.splice(i, 1);
  world.carry(e.p, null);
}

// Quien coge un libro de la estantería ya sabe cuál quiere: llega a la caja y tú solo lo cobras
function directTalk(e) {
  const c = e.c, b = BOOK[c.bookId];
  dlgOpen();
  clientSays(e, pickOne([`Me llevo este: «${b.title}». ¿Me lo cobras?`, `Ya lo tengo elegido: «${b.title}». ¿Me cobras?`, `Vengo a pagar este libro, «${b.title}».`]), 'contenta', () => {
    clearInterval(dlgTimer); dlgNext = null; dlgTyping = false;
    setImg(dlgR, heroImg('neutra'), heroBust());
    dlg.classList.add('right-on'); dlg.classList.remove('left-on');
    $('.dlg-name').textContent = heroName();
    $('.dlg-text').textContent = '¿Se lo cobras?';
    $('.dlg-hint').hidden = true;
    $('.dlg-opts').innerHTML = `<button type="button" class="opt go" data-act="directCharge">Cobrar ${money(b.price)}</button>`;
  });
}

async function runShopper(e, tok) {
  crowd.add(e);
  let held = null;                                   // sitio de paseo que ocupa ahora (nadie más se pone encima)
  const free = () => { if (held) { spotsTaken.delete(held.key); held = null; } };
  try {
    await routeTo(e.p, [ENTRY[0][0], ROWS - 1], 2.2);
    const visits = e.fast ? 0 : (e.c ? 1 : 2) + Math.floor(Math.random() * 2);
    for (let i = 0; i < visits && tok === dayTok; i++) {
      free();
      const spot = takeSpot();
      if (!spot) break;
      held = spot;
      await routeTo(e.p, spot.cell, rnd(1.7, 2.3));
      world.face(e.p, spot.face[0], spot.face[1]);
      await sleep(rnd(4500, 9500));
    }
    if (tok !== dayTok) { free(); await exitShop(e); return; }
    if (e.c) {
      // si la cola está llena, espera en su sitio en vez de apilarse con los demás
      while (line.length >= Math.max(1, lineCells().length) && tok === dayTok) await sleep(1200);
      free();
      if (tok !== dayTok) { await exitShop(e); return; }
      e.done = new Promise((r) => { e.finish = r; });
      line.push(e);
      updateLine();
      await e.done;
    } else {
      free();
      if (e.ambient && tok === dayTok && sitCell() && Math.random() < 0.3 && (await goRead(e, tok))) return;
      if (e.ambient && tok === dayTok && S.level >= 2 && Math.random() < 0.55) await directBuy(e, tok);
      await exitShop(e);
    }
  } finally {
    free();
    crowd.delete(e);
    if (e.c) { const i = line.indexOf(e); if (i >= 0) line.splice(i, 1); }
  }
}

function spawnShopper(item, tok) {
  const look = item.c ? item.c.person : ambientLook([...CAST_LOOKS, ...[...crowd].map((e) => e.p.userData.look)]);
  const p = world.spawn(look, entryCell(), Math.PI, !!item.c);
  const e = { p, c: item.c, ambient: !item.c, bust: null, charId: item.c?.charId, fast: !!item.fast };
  if (item.c) e.bust = world.portrait(look);
  runShopper(e, tok);
}

function startCrowd() {
  dayTok++;
  const tok = dayTok;
  const plan = S.queue.map((c) => ({ c, fast: S.day === 0 }));
  for (let i = 0; i < ambientCount(S); i++) plan.splice(Math.floor(Math.random() * (plan.length + 1)), 0, { c: null });
  (async () => {
    await sleep(1200);
    for (let i = 0; i < plan.length && tok === dayTok; i++) {
      while ((crowd.size >= crowdCap(S) || (plan[i].c && [...crowd].some((e) => e.charId === plan[i].c.charId))) && tok === dayTok) await sleep(900);
      if (tok !== dayTok) return;
      spawnShopper(plan[i], tok);
      await sleep(Math.max(2500, 9000 - S.level * 600) + rnd(0, 3500));
    }
  })();
}

// Vigilante: si el primero de la cola no avanza (o ya no existe), se vuelve a mandar al mostrador
setInterval(() => {
  if (S.phase !== 'serving' || !line.length) return;
  for (let i = line.length - 1; i >= 0; i--) if (!line[i].p?.parent) line.splice(i, 1);
  const e = line[0];
  if (e && !e.atCounter && !attending) {
    e.waitT = (e.waitT ?? 0) + 1.8;
    if (!world.isWalking(e.p)) { e.slotKey = null; updateLine(); }
    if (e.waitT > 7) {   // atascado: se le coloca en el mostrador
      const sc = serviceCell(S.furniture), st = heroStation();
      world.walkRoute(e.p, null);
      if (sc) { e.p.position.set(sc[0] + .5, 0, sc[1] + .5); if (st) world.face(e.p, st[0] - e.p.position.x, st[1] - e.p.position.z); }
      e.atCounter = true; e.waitT = 0; renderServe();
    }
  } else if (e) e.waitT = 0;
}, 1800);

function dispersal() {
  dayTok++;               // los que pasean salen por la puerta
  for (const e of [...crowd]) { if (!e.c) { e.p.userData.bubble && world.say(e.p, ''); } }
}

/* ---------- Intro: vuelo sobre el barrio, creador y Don Anselmo ---------- */

const introEl = $('#intro');
let introPending = false, introSkip = null, introTimers = [];
const introLooks = () => Array.from({ length: 6 }, () => ambientLook(CAST_LOOKS));

function introCaption(small, big) {
  const cap = $('.in-cap', introEl);
  cap.classList.remove('on');
  setTimeout(() => { $('small', cap).textContent = small; $('b', cap).textContent = big; cap.classList.add('on'); }, 450);
}

async function runIntro(withCreator) {
  introPending = withCreator;
  document.body.classList.add('intro');
  panelOpen = false; closeSheet(); renderPanel();
  world.setView('town');
  world.startPedestrians(introLooks());
  introEl.hidden = false;
  introTimers = [
    setTimeout(() => introCaption('Una mañana cualquiera', 'Barrio de las Letras'), 700),
    setTimeout(() => introCaption('', 'Donde las historias pasan de mano en mano'), 4800),
    setTimeout(() => introCaption('Librería · desde 1982', S.shopName), 9200),
  ];
  await Promise.race([world.playFlyover(14000), new Promise((r) => { introSkip = r; })]);
  introTimers.forEach(clearTimeout);
  world.skipFlyover();
  introCaption('Librería · desde 1982', S.shopName);
  $('#introSkip').hidden = true;
  await wait(1400);
  await finishIntro();
}
$('#introSkip').addEventListener('click', () => introSkip?.());

async function finishIntro() {
  introPending = false;
  wipeEl.classList.add('on');
  await wait(380);
  world.stopPedestrians();
  introEl.hidden = true; $('#introSkip').hidden = false;
  document.body.classList.remove('intro');
  world.setView('shop'); syncWorld(); placeHero(); world.hero.visible = true;
  await wait(120);
  wipeEl.classList.remove('on');
  await wait(350);
  await anselmoWelcome();
  const first = !S.introSeen;
  S.introSeen = true; persist(); renderPanel();
  S.welcomed = true; persist();
  if (first) { await wait(700); tutStart(); }
}

// Don Anselmo, de pie junto al mostrador, te cuenta la historia
async function anselmoWelcome() {
  const look = CAST_BY_ID.anselmo.look;
  const p = world.spawn(look, entryCell(), Math.PI, false);
  const e = { c: { charId: 'anselmo', name: 'Don Anselmo' }, bust: world.portrait(look), p };
  world.setDoorsOpen(true);
  const sc = serviceCell(S.furniture);
  const near = sc ? [sc[0], sc[1] + 1] : [5, 4];
  await routeTo(p, [ENTRY[0][0], ROWS - 1], 2.4);
  await routeTo(p, near, 2.2);
  world.face(p, world.hero.position.x - p.position.x, world.hero.position.z - p.position.z);
  const n = heroName();
  await new Promise((done) => {
    dlgOpen();
    const step = (i) => clientSays(e, ANSELMO_WELCOME[i][0].replaceAll('{n}', n).replaceAll('{shop}', S.shopName), ANSELMO_WELCOME[i][1], () => (i + 1 < ANSELMO_WELCOME.length ? step(i + 1) : done()));
    step(0);
  });
  closeDialog();
  await exitShop(e);
}

/* ---------- Tutorial guiado ---------- */

// Cada paso: texto, elemento a resaltar (selector o función) y, o bien botón "Siguiente", o bien una condición que lo da por hecho
const TUT = [
  { text: 'Te enseño lo básico con una jornada de práctica, el día 0: no cuenta para tu partida. Puedes saltarlo cuando quieras y repetirlo desde el engranaje → Ajustes.', next: true },
  { text: 'Con estos botones mueves la cámara: gira la tienda, acerca y aleja. También puedes arrastrar para desplazarte y pellizcar para hacer zoom. Y si tocas el suelo, tu personaje camina hasta allí.', target: '#camtools', next: true },
  { text: 'Esta barra es tu menú: Tienda, Almacén, Pedidos, Mejoras y Redes. Al pulsar un icono, se abre aquí mismo.', target: '#bar', next: true },
  { text: 'Vamos a abrir. Pulsa el icono de la Tienda.', target: '#icons [data-id=shop]', wait: () => panelOpen && tab === 'shop' && !editing },
  { text: 'Pulsa «Abrir la tienda» para empezar la jornada.', target: '[data-act=open]', wait: () => S.phase === 'serving' },
  { text: 'Aquí entrará un solo cliente, directo al mostrador. En un día normal vienen muchos: miran las estanterías y hacen cola. Cuando uno llegue te aparecerá el botón «Atender».', wait: () => !!(line[0]?.atCounter) || talking, pos: 'top' },
  { text: 'Pulsa «Atender» para hablar con él.', target: '#serve', wait: () => talking || !!S.current },
  { text: 'Te pide un libro concreto: pulsa «Claro, ahora te lo traigo». (Con otros clientes tendrás que hacerles preguntas para descubrir qué buscan; cada respuesta es una pista.)', wait: () => fetching, pos: 'top' },
  { text: 'Esta es la estantería del almacén. Coge el libro que encaje con lo que pide. Si te equivocas, el cliente te lo dirá y podrás probar otra vez.', target: '.picker .shelfgrid', wait: () => !fetching && ((S.stats?.sold ?? 0) >= 1 || (S.served ?? 0) >= 1), pos: 'top' },
  { text: '¡Primera venta! En un día normal, cuando atiendes a todos acaba la jornada y ves un resumen: ventas, IVA de los libros y alquiler.', next: true, wait: null, pos: 'top' },
  { text: 'Para tener libros, entra en Pedidos.', target: '#icons [data-id=orders]', wait: () => panelOpen && tab === 'orders', when: () => S.phase === 'morning' },
  { text: 'Elige libros y cantidades. Llegan a la mañana siguiente en una caja al almacén; Rodeos Express te los trae. Ábrela allí y expón un ejemplar de cada título en las estanterías.', target: '#panel', next: true },
  { text: 'Con la tienda cerrada puedes decorar: Tienda → Decorar. Arrastra muebles, cambia el suelo y las paredes, y cuelga carteles tuyos.', target: '#icons [data-id=shop]', next: true },
  { text: 'En Mejoras compras muebles, amplías la tienda y sigues la historia de Don Anselmo. Y desde el nivel 5, en Redes tendrás tu móvil. ¡Mucha suerte!', target: '#icons [data-id=upgrades]', next: true },
];
const coach = $('#coach');
let tutTimer = null;

function tutActive() { return S.tut && S.tut.i < TUT.length && !S.tut.off; }
// El tutorial es una jornada de práctica (día 0) con un solo cliente. Al terminar, se restaura la partida tal como estaba.
function tutDayZero() {
  line.length = 0; spotsTaken.clear(); dayTok++;
  S.day = 0; S.phase = 'morning'; S.current = null; S.idx = 0; S.served = 0; S.arrived = [];
  const target = (BOOKS.find((b) => b.unlock <= S.level) ?? BOOKS[0]).id;
  S.storage[target] = Math.max(1, S.storage[target] ?? 0);
  const c = newCustomer(CAST_BY_ID.lucia, target, 'title'); c.tries = 3;
  S.queue = [c];
}
function tutStart() {
  if (!S.tutSnap) { const copy = JSON.parse(JSON.stringify(S)); delete copy.tutSnap; delete copy.tut; S.tutSnap = JSON.stringify(copy); }
  tutDayZero();
  S.tut = { i: 0 }; persist(); renderTop(); renderPanel(); tutRender(); clearInterval(tutTimer); tutTimer = setInterval(tutTick, 350);
}
function tutRestore() {
  const snap = JSON.parse(S.tutSnap);
  Object.assign(snap, { tut: { i: TUT.length }, hero: S.hero, shopName: S.shopName, doormat: S.doormat, settings: S.settings, welcomed: true, introSeen: true });
  for (const e of [...crowd]) { world.removePerson(e.p); e.finish?.(); }
  line.length = 0; spotsTaken.clear(); dayTok++; attending = null;
  closeDialog(); closeSheet(); talking = false; busy = false; fetching = false; panelOpen = false; world.carry(world.hero, null);
  S = prepare(snap);
  persist(); syncWorld(); renderTop(); renderPanel(); renderServe();
}
function tutEnd() {
  S.tut = { i: TUT.length }; coach.hidden = true; clearInterval(tutTimer);
  if (S.tutSnap) { tutRestore(); toast('Empieza tu primer día. ¡Mucha suerte!'); }
  persist();
}
function tutGo(i) { S.tut.i = i; persist(); if (i >= TUT.length) { tutEnd(); toast('¡Tutorial terminado!'); return; } tutRender(); }

function tutRender() {
  if (!tutActive()) { coach.hidden = true; return; }
  const st = TUT[S.tut.i];
  coach.hidden = false;
  $('.co-card p', coach).textContent = st.text;
  $('.co-n', coach).textContent = `${S.tut.i + 1}/${TUT.length}`;
  $('.co-next', coach).hidden = !st.next;
  tutPlace();
}
function tutPlace() {
  if (!tutActive()) return;
  const st = TUT[S.tut.i], spot = $('.co-spot', coach), card = $('.co-card', coach);
  const el = typeof st.target === 'string' ? $(st.target) : null;
  const r = el ? el.getBoundingClientRect() : null;
  if (r && r.width > 0) {
    const pad = 6;
    Object.assign(spot.style, { opacity: 1, left: `${r.left - pad}px`, top: `${r.top - pad}px`, width: `${r.width + pad * 2}px`, height: `${r.height + pad * 2}px` });
  } else spot.style.opacity = 0;
  const targetLow = r && r.top + r.height / 2 > innerHeight * 0.5;
  const top = st.pos === 'top' || targetLow || (!r && st.pos !== 'bottom' && false);
  card.style.top = top ? 'calc(max(12px, env(safe-area-inset-top)) + 70px)' : '';
  card.style.bottom = top ? '' : 'calc(96px + env(safe-area-inset-bottom))';
}
function tutTick() {
  if (!tutActive()) return;
  const st = TUT[S.tut.i];
  if (st.when && !st.when()) { coach.hidden = true; return; }
  if (coach.hidden) tutRender();
  tutPlace();
  if (st.wait && st.wait()) tutGo(S.tut.i + 1);
}
$('.co-next', coach).addEventListener('click', () => tutGo(S.tut.i + 1));
$('.co-skip', coach).addEventListener('click', () => { tutEnd(); toast('Tutorial saltado. Puedes repetirlo desde Mejoras → Ajustes.'); });
addEventListener('resize', tutPlace);

/* ---------- Historia: capítulos y pistas de Don Anselmo ---------- */

let storyBusy = false;
function checkSeason() {
  const was = SEASON.id;
  activateSeason(new Date(), S.testSeason);
  if (SEASON.id === was) return;
  initPass(S); persist(); renderPassBtn(); renderPanel();
  toast(`¡Empieza la ${SEASON.name}: «${SEASON.title}»!`);
}

// Recompensa por entrar cada día: ciclo de 7 días (si te saltas un día, vuelve al día 1)
const DAILY = [{ money: 30 }, { xp: 40 }, { money: 50 }, { xp: 60 }, { money: 80 }, { xp: 100 }, { money: 200, xp: 100 }];
const todayKey = (back = 0) => { const d = new Date(); d.setDate(d.getDate() - back); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const dailyTxt = (r) => [r.money ? `${r.money} €` : '', r.xp ? `${r.xp} XP` : ''].filter(Boolean).join(' + ');
async function maybeDaily() {
  S.daily ??= { last: '', day: 0 };
  const today = todayKey();
  if (S.daily.last === today) return;
  const streak = S.daily.last === todayKey(1);   // entraste ayer: sigue la racha; si no, vuelve al día 1
  S.daily.last = today; S.daily.day = streak ? (S.daily.day % 7) + 1 : 1;
  const day = S.daily.day, rw = DAILY[day - 1];
  storyBusy = true; busy = true;
  if (rw.money) S.money = Math.round((S.money + rw.money) * 100) / 100;
  if (rw.xp) gainXp(S, rw.xp);
  persist(); renderTop(); sfx('coin');
  const tiles = DAILY.map((d, i) => `<div class="dy ${i + 1 < day ? 'done' : i + 1 === day ? 'now' : ''}"><small>Día ${i + 1}</small><b>${d.money && d.xp ? '🎁' : d.money ? '🪙' : '⭐'}</b><span>${dailyTxt(d)}</span></div>`).join('');
  await waitSheet(`${sheetHead('Recompensa de hoy')}<div class="daily"><p>Día ${day} de 7: <b>${dailyTxt(rw)}</b></p><div class="daily-grid">${tiles}</div><p class="muted small">${day === 7 ? 'Has completado la semana. Mañana el ciclo vuelve a empezar.' : 'Vuelve mañana para el siguiente premio.'}</p><button type="button" class="btn primary wide" data-act="close">¡Recoger!</button></div>`);
  await showLevelUps();
  storyBusy = false; busy = false; renderPanel();
}

async function maybeStory() {
  checkSeason();
  if (tutActive() || storyBusy || busy || talking || samirIn || editing || introPending || S.phase !== 'morning' || !layer.hidden || !phoneEl.hidden || !dlg.hidden) return;
  if (!S.tut || S.tut.i >= TUT.length) { S.daily ??= { last: '', day: 0 }; if (S.daily.last !== todayKey()) { maybeDaily(); return; } }
  let ch = completeChapter(S), who = 'anselmo';
  if (!ch && SEASON.story) { const sc = completeSeasonChapter(S, SEASON.story); if (sc) { ch = sc; who = sc.who; } }
  if (!ch) return;
  storyBusy = true; busy = true;
  persist(); renderTop();
  panelOpen = false; renderPanel();
  const look = CAST_BY_ID[who].look;
  const e = { c: { charId: who, name: who === 'anselmo' ? 'Don Anselmo' : CAST_BY_ID[who].name }, bust: world.portrait(look) };
  const n = heroName();
  await new Promise((done) => {
    dlgOpen();
    const step = (i) => clientSays(e, ch.lines[i].replaceAll('{n}', n).replaceAll('{shop}', S.shopName), i === 0 ? 'contenta' : ch.final && i === ch.lines.length - 1 ? 'contenta' : 'neutra', () => (i + 1 < ch.lines.length ? step(i + 1) : done()));
    step(0);
  });
  closeDialog();
  toast(`Capítulo ${who === 'anselmo' ? S.story.chapter : ch.index}: «${ch.title}» completado · +${ch.reward} €${ch.studio ? ' · Trípode instalado en el almacén' : ''}`);
  if (ch.studio) syncWorld();
  storyBusy = false; busy = false;
  renderPanel();
  setTimeout(maybeStory, 600);
}

function seasonStoryCard() {
  const st = SEASON.story && SEASON_STORIES[SEASON.story];
  if (!st) return '';
  const ch = currentSeasonChapter(S, SEASON.story), idx = seasonChapterIdx(S, SEASON.story);
  if (!ch) return `<div class="story-card"><p class="kick">${esc(SEASON.name)} · historia completada</p><h4>${esc(st.title)}</h4><p>Has terminado la historia con ${esc(st.whoName)}. ¡Hasta la próxima temporada!</p></div>`;
  const v = Math.min(ch.target, ch.value(S));
  return `<div class="story-card"><p class="kick">${esc(SEASON.name)} · capítulo ${idx + 1} de ${st.chapters.length}</p><h4>${esc(ch.title)}</h4><p>${esc(ch.goal)} · ${v} de ${ch.target}</p><div class="bar"><i style="width:${Math.round(v / ch.target * 100)}%"></i></div></div>`;
}

function storyCard() {
  const ch = currentChapter(S), pr = chapterProgress(S);
  const clues = S.story.clues.length ? `<ul class="clues">${S.story.clues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : '';
  if (!ch) return `<div class="story-card"><p class="kick">Historia completada</p><h4>El libro sin título</h4><p>Ya conoces el secreto de Don Anselmo. Las páginas en blanco son tuyas.</p>${clues}</div>`;
  return `<div class="story-card"><p class="kick">Capítulo ${S.story.chapter + 1} de ${CHAPTERS.length}</p><h4>${esc(ch.title)}</h4><p>${esc(ch.goal)} · ${pr.value} de ${pr.target}</p><div class="bar"><i style="width:${Math.round(pr.value / pr.target * 100)}%"></i></div>${clues ? `<p class="muted small">Pistas del cuaderno de Anselmo:</p>${clues}` : ''}</div>`;
}

/* ---------- Samir trae los pedidos y cuenta cómo va el negocio ---------- */

let samirIn = false;

// Escena de fuera: la furgoneta llega o se va; fundido para entrar y salir de la tienda
async function vanScene(mode) {
  document.body.classList.add('intro');
  wipeEl.classList.add('on'); await wait(380);
  world.setView('town'); world.stopPedestrians(); world.startPedestrians(introLooks().slice(0, 3));
  introEl.hidden = true;
  await wait(150); wipeEl.classList.remove('on'); await wait(300);
  await world.playVan(mode, SAMIR.look);
  if (mode === 'arrive') sfx('bell');
  wipeEl.classList.add('on'); await wait(380);
  world.stopPedestrians(); world.setView('shop'); syncWorld(); placeHero(); world.hero.visible = true;
  document.body.classList.remove('intro');
  await wait(150); wipeEl.classList.remove('on'); await wait(300);
}
function deliveryContext() {
  const arrived = S.arrived ?? [];
  const books = arrived.reduce((t, o) => t + o.qty, 0);
  const h = S.history ?? [];
  let perf = 'first';
  if (h.length >= 2) { const r = h[h.length - 1].profit / Math.max(1, h[h.length - 2].profit); perf = r > 1.15 ? 'up' : r < 0.85 ? 'down' : 'flat'; }
  else if (h.length === 1) perf = 'flat';
  const pool = arrived.map((o) => BOOK[o.id]?.title).filter(Boolean);
  return { name: S.hero?.name, weather: S.weather, books, boxes: Math.max(1, S.boxes.length), perf, first: S.samirDay == null, title: pool.length ? pool[Math.floor(Math.random() * pool.length)] : null };
}

async function maybeDelivery() {
  const parcels = samirParcels(S);
  if (tutActive() || samirIn || busy || editing || S.phase !== 'morning' || !(S.arrived?.length || parcels.length) || S.samirDay === S.day) return;
  samirIn = true; busy = true;
  S.samirDay = S.day; persist();
  panelOpen = false; renderPanel();
  if (world.view !== 'shop') { world.setView('shop'); syncWorld(); placeHero(); }
  world.setDoorsOpen(true);
  await vanScene('arrive');
  const p = world.spawn(SAMIR.look, entryCell(), Math.PI, false);
  const e = { c: { charId: 'samir', name: SAMIR.name }, bust: world.portrait(SAMIR.look), p };
  await routeTo(p, [ENTRY[0][0], ROWS - 1], 2.4);
  const sc = serviceCell(S.furniture);
  if (sc) await routeTo(p, sc, 2.2);
  const st = heroStation();
  if (st) world.face(p, st[0] - p.position.x, st[1] - p.position.z);
  let lines;
  if (S.arrived?.length) lines = deliveryLines(deliveryContext());
  else lines = [`¡Buenos días, ${heroName()}!`, '¡Hasta mañana, que me quedan más recogidas!'];
  if (parcels.length) {
    const total = parcels.reduce((t, o) => t + o.total, 0);
    lines.splice(Math.max(1, lines.length - 1), 0, ...parcelLines({ n: parcels.length, total, name: heroName(), combined: !!S.arrived?.length }));
  }
  await new Promise((done) => {
    dlgOpen();
    const step = (i) => clientSays(e, lines[i], 'repartidor', () => (i + 1 < lines.length ? step(i + 1) : done()));
    step(0);
  });
  closeDialog();
  if (parcels.length) { const total = parcels.reduce((t, o) => t + deliverOrder(S, o), 0); persist(); renderTop(); toast(`Rodeos Express se lleva ${parcels.length === 1 ? 'el paquete' : 'los paquetes'}: +${total} €`); }
  await exitShop(e);   // el repartidor sale por la puerta y se acabó: sin escena de la furgoneta yéndose
  samirIn = false; busy = false;
  renderPanel();
}

/* ---------- Atender al cliente del mostrador ---------- */

async function attend() {
  const e = line[0];
  if (busy || talking || S.current || !e?.atCounter) return;
  busy = true;
  attendC(S, e.c);
  attending = e;
  world.say(e.p, '');
  renderServe();
  panelOpen = false; renderPanel();
  if (world.view !== 'shop') { await heroToShop(); }
  const st = heroStation();
  if (st) {
    await routeTo(world.hero, [Math.floor(st[0]), Math.floor(st[1])], 3.2);
    await world.walkTo(world.hero, st[0], st[1], 3);
    const sc = serviceCell(S.furniture);
    if (sc) world.face(world.hero, sc[0] + .5 - st[0], sc[1] + .5 - st[1]);
  }
  busy = false;
  talking = true;
  if (e.c.direct) { directTalk(e); return; }
  startTalk(e);
}

/* ---------- Pase de temporada ---------- */

function passCard() {
  const t = tierOf(S), pct = Math.round(((S.pass.pts % SEASON.per) / SEASON.per) * 100), c = claimable(S);
  return `<div class="story-card pass-card"><p class="kick">${SEASON.name} · pase de temporada</p><h4>${SEASON.title}</h4>
    <p>Nivel ${t} de ${SEASON.tiers}${c ? ` · <b>${c} ${c === 1 ? 'premio' : 'premios'} por reclamar</b>` : ''}</p>
    <div class="bar"><i style="width:${t >= SEASON.tiers ? 100 : pct}%"></i></div>
    <button type="button" class="btn small primary" data-act="openPass">Abrir el pase</button></div>`;
}

function rewardCell(r, track, i, locked) {
  const done = S.pass[track].includes(i), reached = i < tierOf(S);
  let ic = '', label = '';
  if (r.kind === 'money') { ic = '<span class="rw-ic coin">€</span>'; label = `${r.n} €`; }
  else if (r.kind === 'xp') { ic = '<span class="rw-ic xp">★</span>'; label = `${r.n} XP`; }
  else if (r.kind === 'furn') { ic = icon(r.type, 'rw-svg'); label = `${FURN[r.type].name}${r.skin ? '\n' + skinName(r.type, r.skin) : ''}`; }
  else if (r.kind === 'studio') { ic = `<span class="rw-ic">${STUDIO[r.item].emoji}</span>`; label = `${STUDIO[r.item].name}\nAlmacén`; }
  else { ic = `<span class="rw-cover">${coverSVG(BOOK[r.book], 34, 51)}</span>`; label = `${BOOK[r.book].title}\n${EDITIONS[r.book].name}`; }
  const state = done ? (r.kind === 'edition' ? 'view' : 'done') : locked ? 'lock' : reached ? 'claim' : 'wait';
  const btn = state === 'claim' ? `<button type="button" class="btn small primary" data-act="passClaim" data-track="${track}" data-i="${i}">Reclamar</button>`
    : state === 'view' ? `<button type="button" class="btn small" data-act="passView" data-book="${r.book}">Ver en 3D</button>`
    : state === 'done' ? '<span class="tag ok">✓</span>' : state === 'lock' ? '<span class="tag">🔒</span>' : '<span class="tag">…</span>';
  return `<div class="rw ${track} ${state}">${ic}<small>${esc(label).replace('\n', '<br>')}</small>${btn}</div>`;
}

let passScroll = 0;
function openPass() {
  const prev = $('.pass-sheet');
  if (prev) passScroll = prev.scrollTop;
  const t = tierOf(S), pct = Math.round(((S.pass.pts % SEASON.per) / SEASON.per) * 100);
  const rows = TIERS.map((tr, i) => `<div class="tier ${i < t ? 'reached' : ''}"><b class="tn">${i + 1}</b>${rewardCell(tr.free, 'free', i, false)}${rewardCell(tr.prem, 'prem', i, !S.pass.premium)}</div>`).join('');
  openSheet(`<div class="pass-hero">${passBanner()}<div class="ph-t"><small>${SEASON.name}</small><b>${SEASON.banner}</b><span>${SEASON.title}</span></div><button type="button" class="x" data-act="close" aria-label="Cerrar">×</button></div>
    <p class="muted">Ganas puntos vendiendo libros, cerrando el día y completando capítulos. Cada ${SEASON.per} puntos subes un nivel.</p>
    <p class="note">Termina el ${seasonEnd().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} · quedan <b>${seasonDaysLeft()}</b> ${seasonDaysLeft() === 1 ? 'día' : 'días'}. Cada mes hay una temporada nueva con su historia.</p>
    ${S.test ? `<button type="button" class="btn wide" data-act="testSeason">🔄 Cambiar de temporada (ahora: ${SEASON.name})</button>` : '<p class="muted small">¿Quieres ver ya otra temporada? Activa el «Modo pruebas» en Ajustes (Partida) y aquí aparecerá un botón.</p>'}
    ${S.pass.premium ? '' : `<div class="story-card"><p class="kick">Pase premium ✨</p><p>Desbloquea la pista de la derecha de esta temporada por <b>${SEASON.premiumPrice}</b>. Si entras a mitad de temporada, puedes jugar solo la pista gratis.</p><button type="button" class="btn small primary" data-act="buyPremium">Conseguir el premium</button></div>`}
    <div class="bar"><i style="width:${t >= SEASON.tiers ? 100 : pct}%"></i></div>
    <p class="muted small">Nivel ${t} de ${SEASON.tiers} · ${S.pass.pts} puntos</p>
    ${claimable(S) ? '<button type="button" class="btn primary wide" data-act="passAll">Reclamar todo (' + claimable(S) + ')</button>' : ''}
    <div class="tier head"><b class="tn"></b><span>Gratis</span><span>Premium ✨</span></div>
    <div class="tiers">${rows}</div>
    <div class="pass-test" ${S.test ? '' : 'hidden'}><b>Modo pruebas</b><small>Todo es gratis para que lo pruebes. Esto desaparecerá en la versión final.</small>
      <div class="row3"><button type="button" class="btn small" data-act="passTest" data-k="p100">+100 puntos</button><button type="button" class="btn small" data-act="passTest" data-k="p500">+500</button><button type="button" class="btn small" data-act="passTest" data-k="season">Ver temporada ${SEASON.id === '2026-11' ? '2' : '1'}</button><button type="button" class="btn small" data-act="passTest" data-k="prem">Premium: ${S.pass.premium ? 'sí' : 'no'}</button><button type="button" class="btn small danger" data-act="passTest" data-k="reset">Reiniciar pase</button></div></div>`, 'pass-sheet');
  const sh = $('.pass-sheet');
  if (sh) sh.scrollTop = passScroll;
}

/* ---------- Ajustes dentro del juego (engranaje de arriba) ---------- */

function openSettings() {
  openSheet(`<div class="set-sheet">${sheetHead('Ajustes')}
    ${installRow()}
    <div class="mn-row"><div><b>Música</b><small>${P.music}\u00a0%</small></div><input type="range" min="0" max="100" value="${P.music}" data-pref="music"></div>
    <div class="mn-row"><div><b>Efectos de sonido</b><small>${P.sfx}\u00a0%</small></div><input type="range" min="0" max="100" value="${P.sfx}" data-pref="sfx"></div>
    <div class="mn-row"><div><b>Vibración</b><small>Al vender, al fallar en un minijuego…</small></div>${toggle('vibrate', P.vibrate)}</div>
    <div class="mn-row"><div><b>Modo difícil</b><small>Sin etiquetas en la estantería, solo 2 preguntas por cliente, un fallo y se van, y las cajas piden más pulso.</small></div>${toggle('hard', S.settings.hard)}</div>
    <label class="fld">Nombre de la librería<input id="shopname" class="input" maxlength="28" value="${esc(S.shopName)}"></label>
    <label class="fld">Mensaje del felpudo<input id="doormatIn" class="input" maxlength="24" value="${esc(S.doormat)}" placeholder="Bienvenid@s"></label>
    <h3>Partida</h3>
    <button type="button" class="btn wide ${S.test ? 'primary' : ''}" data-act="testMode" style="flex-direction:column;gap:2px">Modo pruebas: ${S.test ? 'ACTIVADO' : 'desactivado'}<small style="display:block;font-weight:600">Dinero ilimitado y nivel máximo (para probar todo)</small></button>
    ${S.test ? `<button type="button" class="btn wide" data-act="testSeason">🔄 Temporada de prueba: ${SEASON.name} (pulsa para cambiar)</button>` : ''}
    <button type="button" class="btn wide" data-act="replayTut">Repetir el tutorial</button>
    <button type="button" class="btn wide" data-act="replayIntro">Ver la intro y la historia otra vez</button>
    <button type="button" class="btn wide" data-act="changeHero">Cambiar de personaje y de nombre</button>
    <button type="button" class="btn wide primary" data-act="menuBack">Salir al menú principal</button>
    <button type="button" class="btn wide danger" data-act="reset">Empezar una librería nueva</button>
    <p class="muted small" style="text-align:center">Versión ${BUILD}</p></div>`, 'set-sheet-wrap');
}

// Confirmación propia (los confirm() del navegador a veces están bloqueados y no hacen nada)
function askConfirm(msg, ok = 'Continuar', danger = false) {
  return new Promise((res) => {
    const el = document.createElement('div');
    el.id = 'confirmBox';
    el.innerHTML = `<div class="cf-card"><p>${esc(msg)}</p><div class="cf-btns"><button type="button" class="btn" data-no>Cancelar</button><button type="button" class="btn ${danger ? 'danger' : 'primary'}" data-yes>${esc(ok)}</button></div></div>`;
    document.body.append(el);
    const done = (v) => { el.remove(); res(v); };
    el.querySelector('[data-yes]').onclick = () => done(true);
    el.querySelector('[data-no]').onclick = () => done(false);
    el.addEventListener('click', (e) => { if (e.target === el) done(false); });
  });
}

/* ---------- Diario del librero: la página que se pasa al cambiar de día ---------- */

function diaryFor(s, ago) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const weather = { sol: ['Amanece con sol y la tienda huele a madera y a café.', 'Entra la luz por el escaparate. Hoy da gusto abrir.'], lluvia: ['Llueve a mares. Tarde perfecta para leer.', 'La lluvia repiquetea en el cristal. Pondré otra lámpara.'], nublado: ['Cielo gris, de los de manta y novela.', 'Día nublado: la gente querrá historias.'] }[s.weather] ?? ['Otro día en la librería.'];
  const lines = [pick(weather)];
  if (ago) {
    const v = ago.sales;
    lines.push(v === 0 ? 'Ayer no vendí ni un libro… Mañana será otro día.'
      : v === 1 ? `Ayer vendí un libro y me quedé con ${money2(ago.net)}.`
        : `Ayer vendí ${v} libros y me quedé con ${money2(ago.net)}.`);
    if (ago.net < 0) lines.push('Los gastos pesaron más que las ventas. Ojo con las cuentas.');
    else if (ago.left) lines.push(`Se fueron ${ago.left} ${ago.left === 1 ? 'cliente' : 'clientes'} sin comprar. Tengo que afinar.`);
    else if (v >= 4) lines.push('Un buen día. Las estanterías van cogiendo carácter.');
  }
  const todo = [];
  if (s.boxes.length) todo.push(`Abrir ${s.boxes.length === 1 ? 'la caja' : s.boxes.length + ' cajas'} de Rodeos Express.`);
  const back = s.queue.filter((c) => c.pickup || c.parcel).length;
  if (back) todo.push(`Recoger encargos: ${back} ${back === 1 ? 'cliente viene' : 'clientes vienen'} hoy.`);
  const web = webTodo(s);
  if (web) todo.push(`Pedidos online por atender: ${web}.`);
  const ch = currentChapter(s);
  if (ch) todo.push(`Capítulo ${s.story.chapter + 1}: ${ch.goal.toLowerCase()}.`);
  if (!todo.length) todo.push('Abrir la tienda y recomendar con el corazón.');
  return { day: `Día ${s.day}`, lines, todo: todo.slice(0, 3), sign: `— ${s.hero?.name ?? ''}` };
}

let menuGo = false;
document.title = window.APP.name;

/* ---------- Instalar la aplicación (pantalla de inicio) ---------- */
let deferredInstall = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; });
addEventListener('appinstalled', () => { deferredInstall = null; toast('¡Aplicación instalada!'); });
const isInstalled = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const installRow = () => (isInstalled() ? '' : '<div class="mn-row"><div><b>Instalar la aplicación</b><small>Icono propio, pantalla completa y funciona sin conexión.</small></div><button type="button" class="btn small primary" data-act="installApp">Instalar</button></div>');

/* ---------- Menú principal ---------- */

const menuEl = $('#menu');
let menuPage = 'main';
function showMenu(page = 'main') {
  menuPage = page;
  document.body.classList.add('inmenu');
  panelOpen = false; closeSheet();
  menuEl.hidden = false;
  renderMenu();
}
function hideMenu() { menuEl.hidden = true; document.body.classList.remove('inmenu'); }
const toggle = (key, on) => `<button type="button" class="switch ${on ? 'on' : ''}" data-act="pref" data-key="${key}" role="switch" aria-checked="${on}"></button>`;

function renderMenu() {
  const sv = S.hero ? S : stored();
  if (menuPage === 'main') {
    menuEl.innerHTML = `<div class="mn"><div class="mn-logo">📚</div><h1>${esc(window.APP.name)}</h1><p class="sub">${esc(window.APP.tagline)}</p>
      <div class="mn-btns">
        ${sv ? `<button type="button" class="mn-btn primary" data-act="menuContinue">Continuar partida<small>${esc(sv.shopName)} · día ${sv.day} · nivel ${sv.level}</small></button>
        <button type="button" class="mn-btn" data-act="menuNew">Nueva partida</button>` : '<button type="button" class="mn-btn primary" data-act="menuNew">Nueva partida</button>'}
        <button type="button" class="mn-btn" data-act="menuPage" data-p="settings">Ajustes</button>
        <button type="button" class="mn-btn" data-act="menuPage" data-p="account">Tu cuenta</button>
      </div><p class="mn-foot">Versión ${BUILD}</p></div>`;
  } else if (menuPage === 'settings') {
    menuEl.innerHTML = `<div class="mn"><div class="mn-card"><button type="button" class="mn-back" data-act="menuPage" data-p="main">‹ Menú</button><h2>Ajustes</h2>
      ${installRow()}
      <div class="mn-row"><div><b>Música</b><small>${P.music}\u00a0%</small></div><input type="range" min="0" max="100" value="${P.music}" data-pref="music"></div>
      <div class="mn-row"><div><b>Efectos de sonido</b><small>${P.sfx}\u00a0%</small></div><input type="range" min="0" max="100" value="${P.sfx}" data-pref="sfx"></div>
      <p class="muted">La música y los efectos están sintetizados dentro del juego, así que no pesan nada.</p>
      <div class="mn-row"><div><b>Vibración</b><small>Al vender, al fallar en un minijuego…</small></div>${toggle('vibrate', P.vibrate)}</div>
      <div class="mn-row"><div><b>Modo difícil</b><small>Sin etiquetas en la estantería y menos oportunidades con cada cliente.</small></div>${toggle('hard', P.hard)}</div>
    </div></div>`;
  } else {
    const s = sv, hb = s ? HERO_BY_ID[s.hero.base] : null;
    menuEl.innerHTML = `<div class="mn"><div class="mn-card"><button type="button" class="mn-back" data-act="menuPage" data-p="main">‹ Menú</button><h2>Tu cuenta</h2>
      ${s ? `<div class="mn-prof"><img src="arte/retratos/${hb.id}-neutra.webp" data-fb="${world.portrait(hb.look, 200, 250)}" alt=""><div><b>${esc(s.hero.name)}</b><span class="muted">Dueño de ${esc(s.shopName)}</span></div></div>
      <div class="mn-stats"><div>Nivel<b>${s.level}</b></div><div>Día<b>${s.day}</b></div><div>Dinero<b>${money(s.money)}</b></div><div>Seguidores<b>${s.followers}</b></div><div>Libros vendidos<b>${s.stats?.sold ?? 0}</b></div><div>Capítulo<b>${Math.min(s.story?.chapter ?? 0, CHAPTERS.length)} de ${CHAPTERS.length}</b></div></div>` : '<p class="muted">Aún no tienes ninguna partida. Empieza una nueva y aquí verás tu perfil.</p>'}
      <h3 style="margin:6px 0 0;font:700 16px var(--serif)">Copia de seguridad</h3>
      <p class="muted">Tu partida vive solo en este dispositivo. Guarda una copia en un archivo para no perderla o llevártela a otro móvil.</p>
      <button type="button" class="btn wide" data-act="exportSave" ${s ? '' : 'disabled'}>Guardar copia en un archivo</button>
      <button type="button" class="btn wide" data-act="importSave">Cargar copia desde un archivo</button>
      <h3 style="margin:6px 0 0;font:700 16px var(--serif)">Cuenta en línea</h3>
      <p class="muted">Iniciar sesión y guardar en la nube necesita un servidor, y todavía no lo hay. Lo dejaremos listo antes de publicar el juego.</p>
      ${s ? '<button type="button" class="btn wide danger" data-act="deleteSave">Borrar la partida guardada</button>' : ''}
    </div></div>`;
  }
}

function startNew() {
  S = prepare(newGame());
  S.settings.hard = !!P.hard;
  tab = 'shop'; panelOpen = false; busy = false; editing = false; boxGame = null;
  clearInterval(tutTimer); coach.hidden = true;
  hideMenu();
  introPending = true; newFlow = true;
  document.body.classList.add('intro');
  goShop(); world.recenter(); renderPanel();
  world.hero.visible = false;
  world.setTownName(S.shopName);
  world.setView('town'); world.stopPedestrians(); world.startPedestrians(introLooks());
  openCreator();
}

/* ---------- Creador de personaje: elegir protagonista y poner tu nombre ---------- */

let crSel = null, crName = '', crShop = '', newFlow = false;
function openCreator() {
  crSel = S.hero?.base ?? HERO_BASES[0].id;
  crName = S.hero?.name ?? HERO_BY_ID[crSel].name;
  crShop = S.shopName;
  renderCreator();
}
function renderCreator() {
  const cards = HERO_BASES.map((h) => `<button type="button" class="hcard ${crSel === h.id ? 'on' : ''}" data-act="pickHero" data-id="${h.id}">
      <img src="arte/retratos/${h.id}-neutra.webp" data-fb="${world.portrait(h.look, 280, 350)}" alt="">
      <b>${esc(h.label)}</b></button>`).join('');
  openSheet(`<div class="creator"><p class="kick">Tu librería</p><h2>¿Quién eres?</h2>
    <p class="muted">Elige tu personaje y ponle nombre. Así saldrás en la tienda y en las conversaciones.</p>
    <div class="hgrid">${cards}</div>
    <label class="fld">Tu nombre<input id="heroName" class="input" maxlength="16" value="${esc(crName)}" placeholder="Tu nombre"></label>
    <label class="fld">Nombre de tu librería<input id="shopIn" class="input" maxlength="28" value="${esc(crShop)}" placeholder="Nombre de la librería"></label>
    <button type="button" class="btn primary wide" data-act="startGame">${newFlow ? 'Empezar' : 'Guardar'}</button>
    ${newFlow ? '<button type="button" class="creator-back" data-act="creatorBack">‹ Volver al menú</button>' : ''}</div>`, 'creator-sheet');
  $('.sheet-bg')?.removeAttribute('data-act');
}

/* ---------- Diálogo: ilustración grande, texto abajo y turnos ---------- */

const SEC = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));
const dlg = $('#dlg');
const dlgL = $('#dlgL'), dlgR = $('#dlgR');
let blipSeed = 0;
let dlgTimer = null, dlgNext = null, dlgTyping = false, dlgFull = '';
let heroBustCache = null;
const heroBase = () => HERO_BY_ID[S.hero?.base] ?? HERO_BASES[0];
const heroName = () => S.hero?.name || 'Tú';
const heroImg = (expr = 'neutra') => `arte/retratos/${heroBase().id}-${expr}.webp`;
const heroBust = () => (heroBustCache ??= world.portrait(heroBase().look));
function applyHero() { setHeroGender(heroBase().gender); heroBustCache = null; world.setHeroLook(heroBase().look); }

function dlgOpen() { dlg.hidden = false; requestAnimationFrame(() => dlg.classList.add('on')); }
function closeDialog() {
  clearInterval(dlgTimer); dlgNext = null; dlgTyping = false;
  dlg.classList.remove('on', 'left-on', 'right-on');
  setTimeout(() => { if (!dlg.classList.contains('on')) dlg.hidden = true; }, 320);
}
function setImg(el, src, fb) { el.dataset.done = ''; el.dataset.fb = fb || ''; el.classList.remove('bust'); if (el.getAttribute('src') !== src) el.src = src; else if (el.dataset.failed) { el.dataset.done = '1'; el.classList.add('bust'); } }

function dlgText(name, text, next) {
  blipSeed = [...name].reduce((t, c) => t + c.charCodeAt(0), 0);
  clearInterval(dlgTimer);
  $('.dlg-name').textContent = name;
  $('.dlg-opts').innerHTML = '';
  const el = $('.dlg-text');
  dlgFull = text; dlgNext = next; dlgTyping = true;
  $('.dlg-hint').hidden = true;
  let i = 0;
  el.textContent = '';
  dlgTimer = setInterval(() => {
    i += 2;
    el.textContent = text.slice(0, i);
    if (i % 4 === 0) blip(blipSeed);
    if (i >= text.length) dlgDone();
  }, 24);
}
function dlgDone() {
  clearInterval(dlgTimer);
  $('.dlg-text').textContent = dlgFull;
  dlgTyping = false;
  $('.dlg-hint').hidden = !dlgNext;
}
new ResizeObserver(() => dlg.style.setProperty('--boxh', `${$('.dlg-box').offsetHeight}px`)).observe($('.dlg-box'));
dlg.addEventListener('click', (e) => {
  if (e.target.closest('.dlg-opts')) return;
  if (dlgTyping) { dlgDone(); return; }
  const n = dlgNext;
  if (n) { dlgNext = null; n(); }
});

// Habla el cliente (ilustración a la izquierda)
function clientSays(e, text, expr, next) {
  const c = e.c;
  text = genderize(text);
  setImg(dlgL, `arte/retratos/${c.charId}-${expr ?? 'neutra'}.webp`, e.bust);
  dlg.classList.add('left-on'); dlg.classList.remove('right-on');
  dlgText(c.name, text, next);
}
// Hablas tú (tu personaje a la derecha, el del cliente se aparta)
function playerSays(e, text, next, expr = 'neutra') {
  setImg(dlgR, heroImg(expr), heroBust());
  dlg.classList.add('right-on'); dlg.classList.remove('left-on');
  dlgText(heroName(), text, next);
}
// Tu turno: eliges qué decir
function hub(e) {
  const c = e.c;
  const opts = playerOptions(c, { have: hasStock, pc: true, limit: S.settings.hard ? 2 : 3 });
  clearInterval(dlgTimer); dlgNext = null; dlgTyping = false;
  setImg(dlgR, heroImg('neutra'), heroBust());
  dlg.classList.add('right-on'); dlg.classList.remove('left-on');
  $('.dlg-name').textContent = heroName();
  $('.dlg-text').textContent = '¿Qué le dices?';
  $('.dlg-hint').hidden = true;
  $('.dlg-opts').innerHTML = opts.map((o) => `<button type="button" class="opt ${o.id === 'go' ? 'go' : ''}" data-act="talkOpt" data-id="${o.id}">${esc(o.text)}</button>`).join('')
    + '<button type="button" class="link" data-act="dismissCust">Lo siento, no puedo ayudarte</button>';
}
function startTalk(e) { dlgOpen(); clientSays(e, e.c.line, 'neutra', () => hub(e)); }
/* ---------- Ordenador del mostrador: inventario sin ir al almacén ---------- */

function pcRows(q) {
  const have = sellable(S), route = {};
  (S.orders ?? []).forEach((o) => { route[o.id] = (route[o.id] ?? 0) + o.qty; });
  const ids = BOOKS.filter((b) => b.unlock <= S.level && (!q || norm(`${b.title} ${b.author}`).includes(norm(q)))).map((b) => b.id);
  if (!ids.length) return '<p class="empty">No hay ningún libro con ese nombre.</p>';
  return ids.map((id) => {
    const e = have.get(id) ?? { shop: 0, store: 0 }, k = route[id] ?? 0, total = e.shop + e.store;
    return `<div class="pc-row ${total ? '' : 'none'}"><span class="cv">${coverSVG(BOOK[id], 30, 45)}</span><div class="t"><b>${esc(BOOK[id].title)}</b><small>${esc(BOOK[id].author)} · ${BOOK[id].price} €</small></div>
      <div class="n">${total ? `<span>Tienda ${e.shop}</span><span>Almacén ${e.store}</span>` : '<span class="out">Agotado</span>'}${k ? `<span class="en">En camino ${k}</span>` : ''}</div></div>`;
  }).join('');
}
function openInventory(e) {
  const c = e.c, q0 = c.type === 'title' && BOOK[c.target] ? BOOK[c.target].title : c.type === 'unknownTitle' ? (c.unknown ?? '') : '';
  openSheet(`<div class="sheet-h"><h2>🖥 Ordenador del mostrador</h2></div>
    <div class="pc"><p class="muted">Inventario de la librería. ${q0 ? `Buscando «${esc(q0)}».` : ''}</p>
    <input type="search" data-pcq placeholder="Buscar por título o autor" value="${esc(q0)}">
    <div id="pcList">${pcRows(q0)}</div>
    <button type="button" class="btn primary wide" data-act="pcClose">Cerrar el ordenador</button></div>`);
  $('.sheet-bg')?.removeAttribute('data-act');
}

// Vuelve a la conversación en el punto en que estaba (sin repetir lo que dijo el cliente)
function resumeTalk(e) {
  const c = e.c;
  dlgOpen();
  setImg(dlgL, `arte/retratos/${c.charId}-dudosa.webp`, e.bust);
  dlg.classList.add('left-on');
  hub(e);
}
function talkAgain(e, text, expr) { dlgOpen(); clientSays(e, text, expr, () => hub(e)); }

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
const hasStock = (id) => (S.storage[id] ?? 0) + (onDisplay(S).get(id) ?? 0) > 0;   // almacén o expuesto: lo último que se usa es el de la estantería
const isUnfillable = (c) => !c.pickup && !c.parcel && (isUnknown(c) || (c.type === 'title' && !hasStock(c.target)));

function talkOpt(id) {
  const e = attending;
  if (!e) return;
  const c = e.c;
  const opt = playerOptions(c, { have: hasStock, pc: true, limit: S.settings.hard ? 2 : 3 }).find((o) => o.id === id);
  const said = opt?.text ?? '';
  if (id === 'go') { playerSays(e, said, () => { closeDialog(); talking = false; fetchBook(); }, 'contenta'); return; }
  if (id === 'give') {
    playerSays(e, said, async () => {
      closeDialog(); talking = false; busy = true;
      const o = webOrder(S, c.parcel);
      const total = o ? deliverOrder(S, o) : 0;
      persist();
      await finishCustomer(e, { sold: true, price: total, tip: 0, message: thanksLine(c) }, null);
    }, 'contenta');
    return;
  }
  if (id === 'pc') {
    playerSays(e, said, () => { closeDialog(); setTimeout(() => openInventory(e), 350); }, 'neutra');
    return;
  }
  if (id === 'bundle') {
    playerSays(e, said, () => clientSays(e, pickOne(['¡Ooh, los dos! ¡Me los llevo!', '¡Trato hecho! Empiezo la saga con todo.', '¿Todos juntos? ¡Sí, por favor!']), 'contenta', async () => {
      closeDialog(); talking = false; busy = true;
      const r = sellBundle(S);
      if (r.error) { toast(r.error); busy = false; talking = true; talkAgain(e, c.line, 'neutra'); return; }
      persist(); renderTop();
      await finishCustomer(e, r, null);
    }), 'contenta');
    return;
  }
  if (id === 'order') {
    playerSays(e, said, () => {
      c.talk.asked.push('order');
      const yes = Math.random() < 0.7;
      if (yes) { addEncargo(S, c); persist(); }
      const reply = pickOne(yes ? ENCARGO_YES : ENCARGO_NO);
      clientSays(e, reply, yes ? 'contenta' : 'neutra', () => { closeDialog(); if (yes) toast(`Encargo anotado: «${BOOK[c.target].title}». Acuérdate de pedirlo hoy: mañana vendrá a por él.`); doDismiss(false); });
    });
    return;
  }
  if (id === 'sorry') {
    playerSays(e, said, () => clientSays(e, c.pickup ? 'Vaya… me habías dicho que lo tendrías. Qué decepción.' : sorryLine(c), c.pickup ? 'decepcionada' : 'neutra', () => { closeDialog(); doDismiss(!!c.pickup); }));
    return;
  }
  playerSays(e, said, () => {
    const reply = answer(c, id);
    clientSays(e, reply, c.talk.mood ?? 'neutra', () => hub(e));
  });
}

// "No puedo ayudarte": sin castigo si pedía algo que de verdad no tienes; con castigo si sí podías
function dismissFlow() {
  const e = attending;
  if (!e) return;
  const neutral = isUnfillable(e.c);
  playerSays(e, neutral ? 'Lo siento, hoy no puedo ayudarte con eso.' : 'Lo siento, ahora mismo no tengo nada que ofrecerte.', () => {
    clientSays(e, neutral ? sorryLine(e.c) : nopeLine(e.c), neutral ? 'neutra' : 'decepcionada', () => { closeDialog(); doDismiss(!neutral); });
  });
}

/* ---------- Ir al almacén y elegir el libro en la estantería ---------- */

const stockIds = () => Object.keys(S.storage).sort((a, b) => BOOKS.findIndex((x) => x.id === a) - BOOKS.findIndex((x) => x.id === b));
let fetching = false;

async function fetchBook() {
  if (busy || !S.current) return;
  busy = true;
  await heroToStore();
  fetching = true;
  showPicker();
}

// Tapa blanda o tapa dura: si el cliente ya lo dijo al llegar no se pregunta; si no, lo hablas con él en el mostrador
function formatTalk(e, id) {
  const b = BOOK[id], c = e.c;
  if (c.format) return Promise.resolve(c.format);
  const dura = Math.round(b.price * FORMAT_DURA);
  return new Promise((res) => {
    dlgOpen();
    playerSays(e, `Lo tengo en tapa blanda (${money(b.price)}) y en tapa dura (${money(dura)}). ¿Cuál prefieres?`, () => {
      const tooPricey = c.budget && dura > c.budget;
      const wantsDura = !tooPricey && Math.random() < 0.38;
      const line = wantsDura ? pickOne(['La tapa dura, que se ve más bonita.', 'Tapa dura, que me hace ilusión.', 'Me quedo con la tapa dura.'])
        : tooPricey ? 'La dura se me va de presupuesto: tapa blanda.' : pickOne(['La tapa blanda está bien.', 'Tapa blanda, que es más ligera.', 'Con la blanda me sobra.']);
      c.format = wantsDura ? 'dura' : 'blanda';
      clientSays(e, line, wantsDura ? 'contenta' : 'neutra', () => { closeDialog(); setTimeout(() => res(c.format), 350); });
    }, 'neutra');
  });
}

// Regalo a un cliente habitual (ya ha venido varias veces): eliges algo de tu inventario
let giftRes = null;
function giftTalk(e) {
  return new Promise((res) => {
    const c = e.c;
    dlgOpen();
    playerSays(e, pickOne([`Oye, como ya eres de la casa, te regalo algo.`, `Por ser tan buen cliente, toma un detallito de parte de la librería.`]), () => {
      clearInterval(dlgTimer); dlgNext = null; dlgTyping = false;
      $('.dlg-text').textContent = '¿Qué le regalas?';
      $('.dlg-opts').innerHTML = giftStock(S).slice(0, 6).map((g) => `<button type="button" class="opt" data-act="gift" data-id="${g.id}">${g.emoji} ${esc(g.name)} (tienes ${S.goods[g.id]})</button>`).join('') + '<button type="button" class="link" data-act="gift" data-id="">Mejor no</button>';
      giftRes = (id) => {
        giftRes = null;
        if (!id) { closeDialog(); setTimeout(() => res(false), 300); return; }
        const r2 = giveGift(S, c.charId, id);
        if (!r2) { closeDialog(); setTimeout(() => res(false), 300); return; }
        persist(); renderTop();
        const line = r2.liked ? pickOne(['¡Qué detalle! Justo lo que me gusta.', 'Ay, ¡me encanta! Gracias de corazón.', '¡No me lo puedo creer, qué bonito!']) : pickOne(['Qué amable, muchas gracias.', 'Ay, no hacía falta, ¡gracias!', 'Pues qué detalle, gracias.']);
        clientSays(e, line, 'contenta', () => { closeDialog(); toast(r2.liked ? `Le ha encantado «${r2.good.name}». ¡+4 de reputación!` : `Le has regalado «${r2.good.name}». +1 de reputación.`); setTimeout(() => res(true), 350); });
      };
    }, 'contenta');
  });
}

// Tras comprar un libro, el cliente puede pedir un complemento (o un lector electrónico si tienes el expositor)
let upRes = null;
function upsellTalk(e, it, missing) {
  return new Promise((res) => {
    dlgOpen();
    const line = missing
      ? pickOne([`¿Tenéis ${it.one}? Me lo llevaría también.`, `Y ya que estoy… ¿os queda ${it.one}?`])
      : it.color ? pickOne([`Oye, ¿ese ${it.name} del expositor funciona bien? Me lo estoy pensando…`, `Veo ahí ${it.one}. ¿Cuánto cuesta?`])
        : pickOne([`¿Me pones también ${it.one}?`, `Ya que estoy, ¿me llevo ${it.one}?`, `Uy, qué bonito. ¿Me das ${it.one}?`]);
    clientSays(e, line, 'contenta', () => {
      if (missing) {
        playerSays(e, 'Ahora mismo no me queda, lo siento. ¡Lo pediré!', () => { closeDialog(); setTimeout(() => res(false), 350); }, 'neutra');
        return;
      }
      clearInterval(dlgTimer); dlgNext = null; dlgTyping = false;
      setImg(dlgR, heroImg('neutra'), heroBust());
      dlg.classList.add('right-on'); dlg.classList.remove('left-on');
      $('.dlg-name').textContent = heroName();
      $('.dlg-text').textContent = `${it.emoji} ${it.name}: ${money(it.price)}.`;
      $('.dlg-hint').hidden = true;
      $('.dlg-opts').innerHTML = `<button type="button" class="opt go" data-act="upsell" data-v="y">Añadírselo (${money(it.price)})</button><button type="button" class="link" data-act="upsell" data-v="n">Mejor no</button>`;
      upRes = (v) => { closeDialog(); setTimeout(() => res(v), 350); };
    });
  });
}

// Ya en el mostrador, con el libro en la mano: el cliente elige entre la edición normal y la especial
function editionTalk(e, id) {
  const b = BOOK[id], c = e.c;
  const special = Math.round(b.price * b.ed.mult);
  return new Promise((res) => {
    dlgOpen();
    playerSays(e, `Lo tengo en dos ediciones: la normal (${money(b.price)}) y la especial, con los cantos ${b.ed.edgeName} (${money(special)}). ¿Cuál prefieres?`, () => {
      const tooPricey = c.budget && special > c.budget;
      const wants = !tooPricey && (c.collector || Math.random() < 0.45);
      const line = wants ? pickOne(['¡Ooh, la especial, por favor!', 'La especial, sin dudarlo.', 'Ya que está, me llevo la especial.', '¿Cantos de colores? ¡Esa, esa!'])
        : tooPricey ? 'Uf, la especial se me va de presupuesto. Me quedo con la normal.' : pickOne(['Con la normal me basta, gracias.', 'La normal, que es la que quería.', 'Mmm, mejor la normal.']);
      clientSays(e, line, wants ? 'contenta' : 'neutra', () => { closeDialog(); setTimeout(() => res(wants), 350); });
    }, 'neutra');
  });
}

// (antiguo selector de edición, sin uso)
let edResolve = null;
function askEdition(id) {
  const b = BOOK[id], base = { ...b, pal: b.palBase ?? b.pal, ed: null }, c = attending?.c;
  return new Promise((res) => {
    edResolve = res;
    openSheet(`<div class="ed-pick"><h2 style="margin:0 0 6px;font:700 22px var(--serif)">¿Qué edición le ofreces?</h2>
      <p class="muted">«${esc(b.title)}» tiene dos ediciones.${c?.collector ? ' <b>Parece coleccionista…</b>' : ''}</p>
      <div class="ed-row">
        <button type="button" class="ed-card" data-act="edPick" data-v="n"><span>${coverSVG(base, 84, 126)}</span><b>Edición normal</b><small>${money(b.price)}</small></button>
        <button type="button" class="ed-card sp" data-act="edPick" data-v="s"><span>${coverSVG(b, 84, 126)}</span><b>Edición especial</b><small>${money(Math.round(b.price * b.ed.mult))} · cantos ${b.ed.edgeName}</small></button>
      </div></div>`, 'ed-sheet');
    $('.sheet-bg')?.removeAttribute('data-act');
  });
}

async function pickBook(id) {
  if (!fetching) return;
  fetching = false;
  closeSheet();
  const ids = stockIds();
  const idx = Math.min(2, Math.floor(Math.max(0, ids.indexOf(id)) / 9));
  await routeTo(world.hero, STO.shelfFront[idx], 3.2, 'store');
  world.face(world.hero, 0, -1);
  await wait(350);
  world.carry(world.hero, id);
  await wait(450);
  await heroToShop();
  const st = heroStation();
  if (st) {
    await routeTo(world.hero, [Math.floor(st[0]), Math.floor(st[1])], 3.2);
    await world.walkTo(world.hero, st[0], st[1], 3);
    const sc = serviceCell(S.furniture);
    if (sc) world.face(world.hero, sc[0] + .5 - st[0], sc[1] + .5 - st[1]);
  }
  const e = attending;
  const bk = BOOK[id], cc = e.c;
  const sc0 = evaluate(bk, cc), hesitate = sc0 === 1 && Math.random() < 0.5;
  const interested = sc0 >= 1 && !hesitate && !(cc.budget && bk.price > cc.budget);   // lo que va a decidir offer(): si no lo quiere, no se habla de ediciones ni de tapas
  const special = bk.ed && interested ? await editionTalk(e, id) : false;
  const format = bk.ed || !interested ? null : await formatTalk(e, id);
  const r = offer(S, id, { special, format, hesitate });
  if (r.error) { world.carry(world.hero, null); toast(r.error); busy = false; talking = true; talkAgain(e, e.c.line, 'dudosa'); return; }
  persist();
  renderTop();
  if (!r.sold && !r.left) {
    await wait(500);
    world.carry(world.hero, null);
    busy = false;
    talking = true;
    talkAgain(e, r.message, 'decepcionada');
    return;
  }
  await finishCustomer(e, r, id);
}

async function cancelPick() {
  if (!fetching) return;
  fetching = false;
  closeSheet();
  try {
    // si la animación del paseo se atasca, a los 6 s volvemos igualmente al mostrador
    await Promise.race([(async () => {
      await heroToShop();
      const st = heroStation();
      if (st) { await routeTo(world.hero, [Math.floor(st[0]), Math.floor(st[1])], 3.2); await world.walkTo(world.hero, st[0], st[1], 3); }
    })(), wait(6000)]);
  } catch { /* seguimos */ }
  if (world.view !== 'shop') { world.setView('shop'); syncWorld(); placeHero(); world.hero.visible = true; }
  busy = false;
  talking = true;
  if (attending) { attending.c.talk.pcChecked = true; resumeTalk(attending); }
}

async function doDismiss(penalty = true) {
  const e = attending;
  if (!e) return;
  talking = false;
  busy = true;
  const rev = dismiss(S, penalty, e.c);
  await finishCustomer(e, { sold: false, neutral: !penalty, review: rev, message: penalty ? 'Vaya… otro día será.' : '¡Gracias de todas formas!' }, null);
}

// Reacción del cliente, salida y paso al siguiente
async function finishCustomer(e, r, id) {
  const p = e.p;
  if (r.sold) {
    let extra = 0;
    if (!e.c.pickup && !e.c.parcel) {
      const u = upsellFor(S);
      if (u) { const ok = await upsellTalk(e, u.item, u.missing); if (ok && !u.missing) { extra = sellGood(S, u.item.id); persist(); renderTop(); } }
    }
    if (canGift(S, e.c)) await giftTalk(e);
    world.say(p, `${r.message}  +${r.price + r.tip + extra} €`, 'happy'); buzz(25); sfx('coin');
    toast(r.bundle ? `Vendidos ${r.bundle} libros · +${r.price + r.tip + extra} €` : `Vendido${id && BOOK[id] ? ` «${BOOK[id].title}»` : ''} · +${r.price + r.tip + extra} €${extra ? ` (con extra: ${extra} €)` : ''}`);
    await wait(1800);
    world.carry(world.hero, null);
    await wait(600);
  } else {
    world.carry(world.hero, null);
    await wait(900);
  }
  world.say(p, '');
  if (r.review) toastReview(r.review);
  const chair = r.reads ? seatChair((S.nooks ?? []).length - 1) : sitCell();
  const cell = [Math.floor(p.position.x), Math.floor(p.position.z)];
  // el siguiente de la cola ya puede avanzar mientras este se marcha
  const i = line.indexOf(e); if (i >= 0) line.splice(i, 1);
  attending = null;
  releaseC(S);
  updateLine();
  persist();
  renderTop();
  if (r.reads && chair && id) {
    { const nk = (S.nooks ?? [])[(S.nooks ?? []).length - 1]; if (nk) { nk.person = p.userData.look; nk.bookId = id; } }
    const pass = makePassable(blockedSet(S.furniture));
    const pts = routePoints(pass, { x: p.position.x, z: p.position.z }, seatCell(chair, S.furniture));
    if (pts) await world.walkRoute(p, pts, 2.2, (x, z) => pass(Math.floor(x), Math.floor(z)));
    world.removePerson(p);
    syncWorld();
  } else {
    await exitShop(e);
  }
  e.finish?.();
  busy = false;
  await showLevelUps();
  if (S.phase === 'evening' && S.day === 0) { S.phase = 'morning'; S.queue = []; dispersal(); syncWorld(); renderPanel(); return; }
  if (S.phase === 'evening') { dispersal(); syncWorld(); renderPanel(); toast('Ya no quedan clientes. Cierra la tienda cuando termines.'); return; }
  renderPanel();
}

async function startDayService() {
  if (busy) return;
  openShop(S);
  persist();
  if (world.view !== 'shop') { world.setView('shop'); syncWorld(); placeHero(); }
  panelOpen = false;
  if (S.phase === 'evening') { renderPanel(); showSummary(); return; }
  line.length = 0; spotsTaken.clear();
  renderPanel();
  startCrowd();
}

function toastReview(p) { toast(`${p.stars <= 2 ? 'Reseña negativa · ' : ''}${p.user}: ${'★'.repeat(p.stars)} “${p.text.slice(0, 48)}…”`); }

async function showLevelUps() {
  while (S.levelUps.length) {
    const lv = S.levelUps.shift(); sfx('levelup');
    const furn = FURN_ORDER.filter((t) => { const d = FURN[t]; for (let n = 0; n < d.max; n++) if (d.level(n) === lv) return true; return false; })
      .map((t) => `<li>${icon(t)}<span><b>${FURN[t].name}</b><small>${FURN[t].desc}</small></span></li>`);
    const items = ITEMS.filter((i) => i.level === lv).map((i) => `<li>${icon(i.id)}<span><b>${i.name}</b><small>${i.desc}</small></span></li>`);
    const exps = EXPANSIONS.filter((e) => e.level === lv).map((e) => `<li>${icon('expand')}<span><b>${e.name}</b><small>${e.desc}</small></span></li>`);
    const books = BOOKS.filter((b) => b.unlock === lv);
    const nets = Object.entries(NETWORKS).filter(([, n]) => n.level === lv).map(([, n]) => `<li>${icon('chat')}<span><b>Red social: ${n.name}</b><small>${n.desc}</small></span></li>`);
    await waitSheet(`
      <div class="levelup"><p class="kick">¡Has subido de nivel!</p><h2>Nivel ${lv}</h2>
      ${books.length ? `<p class="muted">Nuevos libros en el catálogo</p><div class="mini-covers">${books.map((b) => coverSVG(b, 54, 81)).join('')}</div>` : ''}
      ${furn.length + items.length + nets.length + exps.length ? `<p class="muted">Ya puedes comprar</p><ul class="unlocks">${exps.join('')}${furn.join('')}${items.join('')}${nets.join('')}</ul>` : ''}
      <button type="button" class="btn primary wide" data-act="dismiss">¡Genial!</button></div>`, 'center');
  }
}

/* ---------- Tarjeta del cliente (flota sobre la barra) ---------- */

function renderServe() {
  const el = $('#serve');
  const waiting = line[0]?.atCounter && !S.current;
  if (S.phase === 'serving' && !editing && !talking && !busy && waiting) {
    const c = line[0].c;
    el.hidden = false;
    el.className = '';
    el.innerHTML = `<p class="kick">En el mostrador</p><div class="asks"><div><b>${esc(c.name)}</b></div></div>
      <button type="button" class="btn primary wide" data-act="attend">Atender a ${esc(c.name)}</button>`;
  } else if (S.phase === 'serving' && !editing && !talking && !busy && !S.current) {
    el.hidden = false;
    el.className = 'mini';
    el.innerHTML = `Tienda abierta · ${S.served ?? 0} de ${S.queue.length} clientes atendidos`;
  } else if (S.phase === 'evening' && !editing && !talking) {
    el.hidden = false;
    el.className = '';
    el.hidden = true;
  } else { el.hidden = true; el.innerHTML = ''; }
}

/* ---------- Panel: Tienda ---------- */

function panelShop() {
  const trend = S.trend.filter((t) => t.until >= S.day);
  const free = shelfFree(S);
  const inStock = storageCount(S);
  const notShown = [...sellable(S)].filter(([, e]) => e.shop === 0).length;
  const total = shelfSlots(S);
  const used = total - free;
  panelEl.innerHTML = `
    <div class="pn-h"><h2>Buenos días</h2><button type="button" class="x" data-act="tab" data-id="shop" aria-label="Cerrar">×</button></div>
    <p class="muted">${S.weather === 'lluvia' ? 'Llueve fuera: tarde perfecta para leer.' : S.weather === 'nublado' ? 'Cielo gris y ganas de novelas.' : 'Sol de mañana en el escaparate.'}${S.boxes.length ? ` Tienes <b>${S.boxes.length}</b> ${S.boxes.length === 1 ? 'caja' : 'cajas'} sin abrir en el almacén.` : ''}</p>
    ${S.boxes.length > 1 ? `<button type="button" class="btn primary wide" data-act="openAllBoxes">Abrir las ${S.boxes.length} cajas de golpe</button>` : ''}
    ${trend.length ? `<p class="trend">Tendencia: ${trend.map((t) => `<b>${esc(BOOK[t.id].title)}</b>`).join(', ')}</p>` : ''}
    ${S.event ? `<p class="trend">${S.event.type === 'autor' ? `Hoy firma <b>${esc(S.event.who)}</b> en la tienda: viene gente a por «${esc(BOOK[S.event.bookId].title)}».` : `Hoy es el club de lectura: leen «${esc(BOOK[S.event.bookId].title)}».`} Ten ejemplares.</p>` : ''}
    ${notShown ? `<p class="note">Hay <b>${notShown}</b> títulos que aún no tienes expuestos en la tienda.</p>` : ''}
    <div class="row3">
      <button type="button" class="btn primary" data-act="open" ${S.phase !== 'morning' ? 'disabled' : ''}>Abrir la tienda</button>
      <button type="button" class="btn" data-act="arrange" ${notShown && free ? '' : 'disabled'}>Exponer libros</button>
      <button type="button" class="btn" data-act="decor" ${S.phase === 'serving' ? 'disabled' : ''}>Decorar</button>
    </div>
    <div class="bar"><i style="width:${total ? Math.round((used / total) * 100) : 0}%"></i></div>
    <p class="muted small">${used} de ${total} huecos de estantería ocupados · toca una estantería o la mesa para ver sus libros.</p>
    ${S.day === 1 && !S.welcomed ? '<button type="button" class="link" data-act="welcome">¿Cómo se juega?</button>' : ''}`;
}

/* ---------- Modo decorar ---------- */

function toggleEdit() {
  if (S.phase === 'serving') return;
  editing = !editing;
  selUid = null; selPoster = null;
  if (editing) { panelOpen = false; if (world.view !== 'shop') goShop(); }
  world.setEdit(editing); document.body.classList.toggle('editing', editing);
  renderPanel();
  if (!editing) persist();
}

const subTabs = [['muebles', 'Muebles', 'armchair'], ['suelo', 'Suelo', 'floor'], ['paredes', 'Paredes', 'wall'], ['carteles', 'Carteles', 'poster']];

function renderEditPanel() {
  const sel = selUid ? furnById(S, selUid) : null;
  const placedSel = sel && sel.x != null;
  let body = '';
  if (editTab === 'muebles') {
    const inv = inventory(S);
    body = `
      <p class="kick sub">En la tienda (toca uno para elegirlo)</p><div class="chips-f">${placed(S.furniture).map((f) => `<button type="button" class="chip-f ${selUid === f.uid ? 'on' : ''}" data-act="selFurn" data-uid="${f.uid}">${icon(f.type, 'tile-ic')}${FURN[f.type].name}</button>`).join('')}</div>
      <p class="hint">${placedSel ? `<b>${FURN[sel.type].name}</b> seleccionado: arrástralo para moverlo.` : 'Arrastra un mueble a la tienda o toca uno ya colocado.'}</p>
      ${placedSel ? `<div class="selbar">${FURN[sel.type].norot ? '' : '<button type="button" class="btn small" data-act="rotate">Girar</button>'}${FURN[sel.type].fixed ? '' : '<button type="button" class="btn small" data-act="storeSel">Guardar</button>'}</div><div class="selbar"><span class="muted small">Mover:</span><button type="button" class="btn small" data-act="nudge" data-dx="-1" data-dy="0" aria-label="Izquierda">←</button><button type="button" class="btn small" data-act="nudge" data-dx="0" data-dy="-1" aria-label="Arriba">↑</button><button type="button" class="btn small" data-act="nudge" data-dx="0" data-dy="1" aria-label="Abajo">↓</button><button type="button" class="btn small" data-act="nudge" data-dx="1" data-dy="0" aria-label="Derecha">→</button></div>` : ''}
      <p class="kick sub">Inventario</p>
      <div class="tray">${inv.length ? inv.map((f) => `<div class="tile" data-tray="${f.uid}">${icon(f.type, 'tile-ic')}<small>${FURN[f.type].name}${f.skin ? ` · ${skinName(f.type, f.skin)}` : ''}</small></div>`).join('') : '<p class="empty">Vacío. Compra muebles en Mejoras.</p>'}</div>`;
  } else if (editTab === 'suelo') {
    body = `<p class="hint">Elige el suelo de toda la tienda.</p><div class="swatches">${Object.entries(FLOORS).map(([id, f]) => `<button type="button" class="sw ${S.deco.floor === id ? 'on' : ''}" data-act="setFloor" data-id="${id}"><i style="background:${f.sw}"></i><span>${f.name}</span></button>`).join('')}</div>`;
  } else if (editTab === 'paredes') {
    body = `<p class="hint">Elige el papel de las paredes.</p><div class="swatches">${Object.entries(WALLS).map(([id, w]) => `<button type="button" class="sw ${S.deco.wall === id ? 'on' : ''}" data-act="setWall" data-id="${id}"><i style="background:${w.sw}"></i><span>${w.name}</span></button>`).join('')}</div>`;
  } else {
    const list = S.deco.posters;
    const cur = selPoster ? posterById(S, selPoster) : null;
    body = `
      <p class="hint">${cur ? 'Cartel seleccionado: arrástralo por la pared para moverlo.' : 'Toca un cartel de la pared para moverlo, o crea uno nuevo.'}</p>
      <div class="selbar">
        <button type="button" class="btn small primary" data-act="newPoster" ${list.length >= MAX_POSTERS ? 'disabled' : ''}>Nuevo cartel</button>
        ${cur ? '<button type="button" class="btn small" data-act="posterBig">Cambiar tamaño</button><button type="button" class="btn small" data-act="posterDel">Quitar</button>' : ''}
      </div>
      <p class="muted small">${list.length} de ${MAX_POSTERS} carteles. Las paredes que ves de frente son las que admiten carteles.</p>`;
  }
  panelEl.innerHTML = `
    <div class="pn-h"><h2>Decorar</h2><button type="button" class="btn small primary" data-act="decor">Listo</button></div>
    <div class="subtabs">${subTabs.map(([id, label, ic]) => `<button type="button" class="${editTab === id ? 'on' : ''}" data-act="editTab" data-id="${id}">${icon(ic)}${label}</button>`).join('')}</div>
    ${body}`;
  requestAnimationFrame(updateShift);
}

document.addEventListener('pointerdown', (e) => {
  if (!editing) return;
  const tile = e.target.closest('[data-tray]');
  if (tile) { e.preventDefault(); const f = furnById(S, tile.dataset.tray); if (f) world.startTrayDrag(f, e); }
});

function posterSheet() {
  const arts = Object.entries(ARTS).map(([id, a]) => `<button type="button" class="art" data-act="pickArt" data-id="${id}" title="${a.name}"><canvas width="66" height="88" data-art="${id}"></canvas><small>${a.name}</small></button>`).join('');
  openSheet(`${sheetHead('Nuevo cartel')}
    <div class="subtabs"><button type="button" class="on" data-act="posterKind" data-k="arte">Ilustración</button><button type="button" data-act="posterKind" data-k="pizarra">Pizarra</button><button type="button" data-act="posterKind" data-k="papel">Nota</button><button type="button" data-act="posterKind" data-k="img">Mi imagen</button></div>
    <div id="pk"><p class="muted">Elige una ilustración:</p><div class="arts">${arts}</div></div>`);
  $$('canvas[data-art]').forEach((c) => { const g = c.getContext('2d'); ARTS[c.dataset.art].draw(g, c.width, c.height); });
}

function posterKindUI(k) {
  const pk = $('#pk');
  $$('.sheet .subtabs button').forEach((b) => b.classList.toggle('on', b.dataset.k === k));
  if (k === 'arte') { posterSheet(); return; }
  const sizes = Object.entries(POSTER_SIZES).map(([id, s], i) => `<label class="sz"><input type="radio" name="psz" value="${id}" ${i === 1 ? 'checked' : ''}><span>${s.name}</span></label>`).join('');
  if (k === 'img') {
    pk.innerHTML = `<p class="muted">Sube una imagen tuya (portada, ilustración, foto…). Se guarda en tu móvil.</p>
      <label class="fld">Imagen<input id="pimg" type="file" accept="image/*" class="input"></label>
      <div class="sizes">${sizes}</div>
      <button type="button" class="btn primary wide" data-act="makePoster" data-k="img">Colgar cartel</button>`;
  } else {
    pk.innerHTML = `<p class="muted">${k === 'pizarra' ? 'Una pizarra de tiza.' : 'Una nota de papel.'} Cada línea nueva es una línea del cartel.</p>
      <label class="fld">Texto<textarea id="ptext" class="input" rows="4" maxlength="140" placeholder="Hoy recomendamos&#10;…"></textarea></label>
      <div class="sizes">${sizes}</div>
      <button type="button" class="btn primary wide" data-act="makePoster" data-k="${k}">Colgar cartel</button>`;
  }
}

function visibleSide() {
  const az = world.rig.az, dx = Math.sin(az), dz = Math.cos(az);
  const cands = { N: dz, S: -dz, W: dx, E: -dx };       // pared de fondo = la que queda detrás de la cámara
  return Object.entries(cands).filter(([, v]) => v > .3).sort((a, b) => b[1] - a[1])[0][0];
}

async function readImage(file) {
  const url = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
  const max = 420, k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return { data: c.toDataURL('image/jpeg', .8), ratio: img.width / img.height };
}

function newPosterAt(p) {
  const side = visibleSide();
  const c = world.rig.center;
  const L = side === 'N' || side === 'S' ? B.x1 + 1 - B.x0 : B.y1 + 1 - B.y0;
  const mid = side === 'N' || side === 'S' ? (B.x0 + B.x1 + 1) / 2 : (B.y0 + B.y1 + 1) / 2;
  void c; void L;
  const err = addPoster(S, { side, u: mid + (Math.random() - .5) * 2, v: 1.55, ...p });
  if (err) { toast(err); return null; }
  persist(); syncWorld();
  const np = S.deco.posters[S.deco.posters.length - 1];
  selPoster = np.uid; selUid = null; renderEditPanel();
  toast('Cartel colgado. Arrástralo por la pared para colocarlo donde quieras.');
  return np;
}

/* ---------- Hojas de la tienda ---------- */

const tagChips = (tags) => tags.map((t) => `<span class="chip">${esc(TAGS[t])}</span>`).join('');

function showPicker() {
  const c = S.current;
  const map = sellable(S);
  const allIds = [...map.keys()].sort((a, b) => BOOKS.findIndex((x) => x.id === a) - BOOKS.findIndex((x) => x.id === b));
  const slotsFor = () => stkApply(allIds).map((id) => {
    const b = BOOK[id], e = map.get(id), out = e.store + e.shop <= 0;
    return `<button type="button" class="slot ${out ? 'out' : ''}" ${out ? 'disabled' : `data-act="pickBook" data-id="${id}"`}>${coverSVG(b, 78, 117)}<b>${esc(b.title)}</b><small class="pr">${b.price} € · dura ${Math.round(b.price * FORMAT_DURA)} €</small>${b.saga ? `<small class="saga">${esc(sagaLabel(b))}</small>` : ''}${S.settings.hard ? '' : `<span class="tags">${tagChips(b.tags.slice(0, 2))}</span>`}${out ? '<small style="color:#f6ecd9">agotado</small>' : e.store > 0 ? `<em>${e.store}</em>` : '<small style="color:#f0c987">solo el expuesto</small>'}</button>`;
  }).join('') || '<p class="empty">Ningún libro coincide con ese filtro.</p>';
  const slots = slotsFor();
  stkRender = () => { const g = $('.shelfgrid'); if (g) g.innerHTML = slotsFor(); };
  openSheet(`<div class="sheet-h"><h2>Estantería del almacén</h2></div>
    <div class="picker"><button type="button" class="btn wide ghost" data-act="cancelPick">‹ Volver sin libro</button>
    ${c.type === 'title' && !c.pickup && !hasStock(c.target) ? `<p class="warn">⚠ No te quedan ejemplares de «${esc(BOOK[c.target].title)}».</p>` : ''}
    <p class="quote small">${esc(c.name)}: “${esc(c.line)}”</p>
    <p class="muted sub">Coge el libro que pide. Si te equivocas, el cliente te lo dirá.</p>
    ${stkToolsHTML()}
    <div class="shelfgrid">${slots}</div>
    <button type="button" class="btn wide ghost" data-act="cancelPick">Volver sin libro</button></div>`);
  $('.sheet-bg')?.removeAttribute('data-act');
}

/* ---------- Escaparate: huecos libres ---------- */

// Sale a la calle y mira el escaparate con lo que has colocado
async function viewWindowOutside(uidv) {
  const f = furnById(S, uidv);
  if (!f || busy) return;
  closeSheet(); busy = true; panelOpen = false; renderPanel();
  document.body.classList.add('intro');
  wipeEl.classList.add('on'); await wait(380);
  world.setView('town'); world.stopPedestrians();
  world.setTownDisplay((f.slots ?? []).map((k) => (k && windowOwned(S, k) ? k : null)));
  world.focusFacade();
  await wait(150); wipeEl.classList.remove('on'); await wait(250);
  const btn = document.createElement('button');
  btn.type = 'button'; btn.id = 'outBack'; btn.className = 'btn primary'; btn.textContent = '‹ Volver a la tienda';
  document.body.append(btn);
  await new Promise((res) => { btn.onclick = res; });
  btn.remove();
  wipeEl.classList.add('on'); await wait(380);
  world.setView('shop'); syncWorld(); placeHero(); world.hero.visible = true;
  document.body.classList.remove('intro'); busy = false;
  await wait(150); wipeEl.classList.remove('on'); await wait(250);
  renderPanel();
}

function winCell(key) {
  if (!key) return '<span class="wplus">+</span>';
  const [k, id] = key.split(':');
  return k === 'b' ? coverSVG(BOOK[id], 38, 57) : `<span class="wi">${gicon(GOOD[id])}</span>`;
}
function windowSheet(uidv) {
  const f = furnById(S, uidv);
  if (!f) return;
  pruneWindow(S);
  const slots = f.slots ?? Array(WIN_SLOTS).fill(null);
  const rows = [2, 1, 0].map((r2) => `<div class="wrow">${[0, 1, 2, 3].map((c) => { const i = r2 * 4 + c; return `<button type="button" class="wslot ${slots[i] ? 'on' : ''}" data-act="winSlot" data-uid="${uidv}" data-i="${i}" aria-label="Hueco ${i + 1}">${winCell(slots[i])}</button>`; }).join('')}</div>`).join('');
  openSheet(`${sheetHead('Escaparate')}
    <p class="muted">Toca un hueco para poner lo que quieras: libros, complementos y figuritas. Lo que expones <b>no se gasta</b>, pero tienes que tenerlo en la tienda o en el almacén.</p>
    <p class="note">Ahora luces <b>${windowFilled(S)}</b> artículos: atraes <b>+${windowBoost(S)}</b> ${windowBoost(S) === 1 ? 'cliente' : 'clientes'} al día. Cada 4 artículos, un cliente más (máximo 3).</p>
    <div class="wgrid">${rows}</div>
    <button type="button" class="btn wide primary" data-act="viewWindow" data-uid="${uidv}">👀 Ver el escaparate desde la calle</button>`);
}
function winItemsHTML(uidv, i) {
  const q = norm(STK.q);
  const goods = GOODS.filter((g) => (S.goods?.[g.id] ?? 0) > 0 && (!q || norm(g.name).includes(q))).map((g) => `<button type="button" class="wi-it" data-act="winPut" data-uid="${uidv}" data-i="${i}" data-key="g:${g.id}"><span class="wi">${gicon(g)}</span><b>${esc(g.name)}</b><small>tienes ${S.goods[g.id]}</small></button>`).join('');
  const have = sellable(S);
  const ids = stkApply(BOOKS.filter((b) => ((have.get(b.id)?.shop ?? 0) + (have.get(b.id)?.store ?? 0)) > 0).map((b) => b.id));
  const books = ids.map((id) => `<button type="button" class="wi-it" data-act="winPut" data-uid="${uidv}" data-i="${i}" data-key="b:${id}">${coverSVG(BOOK[id], 40, 60)}<b>${esc(BOOK[id].title)}</b><small>${esc(BOOK[id].author)}</small></button>`).join('');
  return (goods || books) ? `${goods}${books}` : '<p class="empty">No hay nada que coincida. Compra complementos o libros en Pedidos.</p>';
}
function windowPick(uidv, i) {
  stkRender = () => { const l = $('#winList'); if (l) l.innerHTML = winItemsHTML(uidv, i); };
  openSheet(`${sheetHead(`Hueco ${i + 1}`)}
    <button type="button" class="btn wide ghost" data-act="winPut" data-uid="${uidv}" data-i="${i}" data-key="">Dejar el hueco vacío</button>
    ${stkToolsHTML()}
    <div id="winList" class="wlist">${winItemsHTML(uidv, i)}</div>
    <button type="button" class="btn wide" data-act="winBack" data-uid="${uidv}">‹ Volver al escaparate</button>`);
}

function furnSheet(uidv) {
  const f = furnById(S, uidv);
  if (!f) return;
  const cs = containers(S).filter((c) => c.furn.uid === uidv);
  if (!cs.length) return;
  openSheet(`${sheetHead(f.type === 'shelf' ? 'Estantería' : 'Mesa de novedades')}
    <p class="muted">Aquí se ve un ejemplar de cada título; el resto está en el almacén. Toca un libro para guardarlo.</p>
    ${cs.map((c) => `<div class="rowlab"><i style="background:${c.kind === 'row' ? SEC[c.section].color : '#e0a93b'}"></i>${c.kind === 'row' ? SEC[c.section].label : 'Novedades'} <small>${c.arr.length}/${c.cap}</small></div>
      <div class="shelfrow">${c.arr.map((id, i) => `<button type="button" class="sp" data-act="takeback" data-cid="${c.id}" data-i="${i}" data-uid="${uidv}" title="${esc(BOOK[id].title)}">${spineSVG(BOOK[id], 46, 1.35)}</button>`).join('') || '<span class="empty">Vacía</span>'}</div>`).join('')}
    <button type="button" class="btn wide" data-act="autoall">Exponer los libros que faltan</button>`);
}

function placeSheet(id) {
  const b = BOOK[id];
  const n = S.storage[id] ?? 0;
  const dests = containers(S).map((c) => {
    const label = c.kind === 'row' ? `Estantería ${c.n} · ${SEC[c.section].short}` : 'Mesa de novedades';
    const note = c.kind === 'row' ? `${c.arr.length}/${c.cap}${c.section === sectionOf(b) ? ' · su sección' : ''}` : `${c.arr.length}/${c.cap}`;
    return `<button type="button" class="dest" data-act="placeAt" data-id="${id}" data-cid="${c.id}" ${c.arr.length >= c.cap ? 'disabled' : ''}><i style="background:${c.kind === 'row' ? SEC[c.section].color : '#e0a93b'}"></i><span>${label}</span><small>${note}</small></button>`;
  });
  openSheet(`${sheetHead(esc(b.title))}<p class="muted">Se expone un ejemplar y el resto se queda en el almacén (${n} ahora).</p><div class="dests">${dests.join('') || '<p class="empty">No tienes estanterías colocadas. Pulsa Decorar.</p>'}</div>`);
}

/* ---------- Panel: Almacén ---------- */

function topHTML() {
  const top = topSellers(S, 6);
  if (!top.length) return '';
  const onTable = new Map();
  placed(S.furniture).filter((f) => f.type === 'table').flatMap((f) => f.books).forEach((id) => onTable.set(id, (onTable.get(id) ?? 0) + 1));
  return `<div class="story-card"><p class="kick">Más vendidos</p>${top.map(([id, n], i) => `<div class="up"><div><b>${i + 1}. ${esc(BOOK[id].title)}</b><small>${n} ${n === 1 ? 'venta' : 'ventas'}</small></div>${onTable.has(id) ? `<span class="tag ok">En la mesa ×${onTable.get(id)}</span>` : ''}<button type="button" class="btn small primary" data-act="toTable" data-id="${id}">${onTable.has(id) ? '+1' : 'A la mesa'}</button></div>`).join('')}<p class="muted small">La mesa de novedades y más vendidos luce hasta 24 libros, con varios del mismo título apilados. El precio no cambia: un libro vale lo mismo esté donde esté.</p></div>`;
}

/* ---------- Filtrar y ordenar libros (Almacén y elegir libro para un cliente) ---------- */

const STK = { q: '', g: '', sort: 'cat' };
let stkRender = null;
const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const SORTS = { cat: 'Orden del catálogo', az: 'Título A → Z', za: 'Título Z → A', au: 'Autor A → Z', ua: 'Autor Z → A' };
function stkApply(ids) {
  let out = ids.filter((id) => { const b = BOOK[id]; return (!STK.g || b.genre === STK.g) && (!STK.q || norm(`${b.title} ${b.author}`).includes(norm(STK.q))); });
  const by = (f, dir) => (a, b) => dir * norm(f(BOOK[a])).localeCompare(norm(f(BOOK[b])), 'es');
  const noArt = (s) => s.replace(/^(el|la|los|las|un|una)\s+/i, '');   // como en una librería: «El Código Leonardo» va por la C
  if (STK.sort === 'az') out = out.sort(by((b) => noArt(b.title), 1));
  else if (STK.sort === 'za') out = out.sort(by((b) => noArt(b.title), -1));
  else if (STK.sort === 'au') out = out.sort(by((b) => b.author, 1));
  else if (STK.sort === 'ua') out = out.sort(by((b) => b.author, -1));
  return out;
}
const stkToolsHTML = () => `<div class="stk-tools">
  <input type="search" data-stkq placeholder="Buscar por título o autor" value="${esc(STK.q)}" aria-label="Buscar">
  <div class="stk-sel"><select data-stkg aria-label="Filtrar por género"><option value="">Todos los géneros</option>${Object.entries(GENRES).map(([k, g]) => `<option value="${k}" ${STK.g === k ? 'selected' : ''}>${g.label}</option>`).join('')}</select>
  <select data-stks aria-label="Ordenar">${Object.entries(SORTS).map(([k, l]) => `<option value="${k}" ${STK.sort === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>`;

function stockRowsHTML(rowsAll, hasTable, onTbl) {
  const order = stkApply(rowsAll.map(([id]) => id));
  const byId = new Map(rowsAll);
  const rows = order.map((id) => [id, byId.get(id)]);
  if (!rowsAll.length) return '<p class="empty">El almacén está vacío. Haz un pedido en Pedidos.</p>';
  if (!rows.length) return '<p class="empty">Ningún libro coincide con ese filtro.</p>';
  return rows.length ? rows.map(([id, e]) => `<div class="stk"><span class="cv">${coverSVG(BOOK[id], 40, 60)}</span><div class="t"><b>${esc(BOOK[id].title)}</b><small>${esc(BOOK[id].author)}</small><div class="stk-act"><span class="pill pr">${BOOK[id].price} €</span><span class="pill">Tienda ${e.shop}</span><span class="pill">Almacén ${e.store}</span>${e.shop || !e.store ? '' : `<button type="button" class="btn small" data-act="place" data-id="${id}">Exponer</button>`}${hasTable ? `<button type="button" class="btn small ghost" data-act="toTable" data-id="${id}" title="Poner una copia en la mesa de novedades">${onTbl.has(id) ? `+1 a la mesa (×${onTbl.get(id)})` : 'A la mesa'}</button>` : ''}</div></div></div>`).join('') : '<p class="empty">El almacén está vacío. Haz un pedido en Pedidos.</p>';
}

function panelStock() {
  stkRender = () => { const el = $('#stkList'); if (!el) return; const m = sellable(S); const all = [...m.entries()]; const hs = placed(S.furniture).filter((f) => f.type === 'shelf' || f.type === 'table'); const ot = new Map(); hs.filter((f) => f.type === 'table').flatMap((f) => f.books).forEach((id) => ot.set(id, (ot.get(id) ?? 0) + 1)); el.innerHTML = stockRowsHTML(all, hs.some((f) => f.type === 'table'), ot); };
  const map = sellable(S);
  const rows = [...map.entries()].sort((a, b) => BOOKS.findIndex((x) => x.id === a[0]) - BOOKS.findIndex((x) => x.id === b[0]));
  const holders = placed(S.furniture).filter((f) => f.type === 'shelf' || f.type === 'table');
  const hasTable = holders.some((f) => f.type === 'table'), onTbl = new Map();
  holders.filter((f) => f.type === 'table').flatMap((f) => f.books).forEach((id) => onTbl.set(id, (onTbl.get(id) ?? 0) + 1));
  panelEl.innerHTML = `
    <div class="pn-h"><h2>Almacén</h2><button type="button" class="x" data-act="tab" data-id="stock" aria-label="Cerrar">×</button></div>
    <p class="muted">${S.boxes.length ? `Recién llegado: <b>${S.boxes.length}</b> ${S.boxes.length === 1 ? 'caja' : 'cajas'} por abrir (toca una caja en la sala o pulsa Abrir).` : 'No hay cajas nuevas.'} Tienes ${storageCount(S)} libros guardados.</p>
    ${S.boxes.length ? `<h3>Recién llegado</h3>${S.boxes.length > 1 ? `<button type="button" class="btn primary wide" data-act="openAllBoxes">Abrir las ${S.boxes.length} cajas de golpe</button>` : ''}${S.boxes.map((b) => `<div class="boxcard"><svg viewBox="0 0 48 48" fill="none" stroke="#38211a" stroke-width="2.4" stroke-linejoin="round"><path d="M24 6 6 14v20l18 8 18-8V14z" fill="#d9a766"/><path d="M6 14l18 8 18-8M24 22v20"/></svg><div class="t"><b>Pedido del día ${b.day}</b><br>${boxBooks(b)} libros · ${b.items.length} ${b.items.length === 1 ? 'título' : 'títulos'}</div><button type="button" class="btn small primary" data-act="openBox" data-id="${b.id}">Abrir</button></div>`).join('')}` : ''}
    ${topHTML()}
    <h3>Existencias</h3>
    ${stkToolsHTML()}
    <div id="stkList">${stockRowsHTML(rows, hasTable, onTbl)}</div>
    <button type="button" class="btn wide" data-act="autoall" ${rows.some(([, e]) => !e.shop) && shelfFree(S) ? '' : 'disabled'}>Exponer un ejemplar de cada título</button>
    ${holders.map((f) => `<button type="button" class="btn wide ghost" data-act="furn" data-uid="${f.uid}">${f.type === 'shelf' ? 'Estantería' : 'Mesa de novedades'} (${f.type === 'shelf' ? f.rows.flat().length : f.books.length} libros)</button>`).join('')}`;
}

/* ---------- Minijuego: abrir cajas ---------- */

let boxGame = null;
async function openBoxGame(id) {
  const box = S.boxes.find((b) => b.id === id);
  if (!box || busy) return;
  panelOpen = false; renderPanel(); busy = true;
  const items = box.items.flatMap((it) => Array.from({ length: it.qty }, () => it.id));
  const ok = await runOpenBox({ items, hard: S.settings.hard, buzz, others: S.boxes.length - 1 });
  busy = false;
  if (!ok) { renderPanel(); return; }
  if (ok === 'all') { const n = openAllBoxes(S); persist(); syncWorld(); renderPanel(); renderTop(); toast(`${n} libros guardados en el almacén. Puedes exponer uno de cada título.`); return; }
  const b = openBox(S, id);
  persist(); syncWorld(); renderPanel(); renderTop();
  if (b) toast(`${boxBooks(b)} libros guardados en el almacén. Puedes exponer uno de cada título.`);
}
function renderBoxGame() {
  const g = boxGame, el = $('#bg');
  if (!g || !el) return;
  if (g.stage === 1) {
    el.innerHTML = `<p class="kick">Pedido recibido</p><h2>Abre la caja</h2><p class="muted">Pasa el cúter por la cinta, de lado a lado.${S.settings.hard ? ' <b>Sin salirte de la cinta</b> o empiezas de nuevo.' : ''}</p>
      <div class="boxart" id="boxart"><svg viewBox="0 0 220 180"><path d="M20 60 110 20l90 40v80l-90 28-90-28z" fill="#cfa46c" stroke="#38211a" stroke-width="3" stroke-linejoin="round"/><path d="M20 60l90 36 90-36M110 96v72" stroke="#38211a" stroke-width="3" fill="none"/><path d="M20 60 110 20l90 40-90 36z" fill="#e2bd86" stroke="#38211a" stroke-width="3" stroke-linejoin="round"/></svg><div class="tape" id="tape"><i id="tapefill"></i></div></div>
      <div class="bar"><i id="cutbar" style="width:0%"></i></div>
      <button type="button" class="link" data-act="boxAll">Abrir sin jugar</button>`;
    const tape = $('#tape');
    let down = false, last = null;
    const move = (e) => {
      if (!down) return;
      const r = tape.getBoundingClientRect();
      if (S.settings.hard && (e.clientY < r.top - 6 || e.clientY > r.bottom + 6)) { g.cut = 0; last = null; $('#tapefill').style.width = '0%'; $('#cutbar').style.width = '0%'; tape.classList.add('miss'); setTimeout(() => tape.classList.remove('miss'), 250); return; }
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      if (last != null && Math.abs(x - last) < .5) g.cut = Math.max(g.cut, x);
      last = x;
      $('#tapefill').style.width = `${g.cut * 100}%`; $('#cutbar').style.width = `${g.cut * 100}%`;
      if (g.cut > .96) { down = false; g.stage = 2; setTimeout(renderBoxGame, 150); }
    };
    tape.addEventListener('pointerdown', (e) => { down = true; last = null; tape.setPointerCapture(e.pointerId); move(e); });
    tape.addEventListener('pointermove', move);
    tape.addEventListener('pointerup', () => { down = false; });
  } else {
    const all = g.items;
    const left = all.filter((it) => !g.taken.has(it.id));
    el.innerHTML = `<p class="kick">¡Abierta!</p><h2>Saca los libros</h2><p class="muted">Toca cada libro para guardarlo en el almacén. ${left.length ? `Faltan ${left.length}.` : ''}</p>
      <div class="pile">${all.map((it) => `<button type="button" class="pb ${g.taken.has(it.id) ? 'gone' : ''}" data-act="takeFromBox" data-id="${it.id}">${coverSVG(BOOK[it.id], 64, 96)}<em>×${it.qty}</em></button>`).join('')}</div>
      <button type="button" class="btn primary wide" data-act="finishBox" ${left.length ? 'disabled' : ''}>${left.length ? 'Faltan libros por sacar' : 'Guardar todo en el almacén'}</button>`;
  }
}
function finishBox() {
  const g = boxGame;
  if (!g) return;
  const b = openBox(S, g.id);
  boxGame = null;
  closeSheet();
  persist();
  syncWorld();
  renderPanel();
  if (b) toast(`${boxBooks(b)} libros guardados en el almacén. Puedes exponer uno de cada título.`);
}

/* ---------- Panel: Pedidos ---------- */

function webOrdersHTML() {
  if (S.level < WEB_LEVEL) return '';
  const todo = S.web.orders.filter((o) => o.status === 'nuevo' || o.status === 'aceptado');
  const ready = S.web.orders.filter((o) => o.status === 'listo').length;
  if (!todo.length && !ready) return '';
  return `<div class="story-card"><p class="kick">Pedidos online</p>
    <p>${todo.length ? `Tienes <b>${todo.length}</b> ${todo.length === 1 ? 'pedido' : 'pedidos'} por atender.` : ''} ${ready ? `<b>${ready}</b> ${ready === 1 ? 'paquete listo' : 'paquetes listos'} para mañana.` : ''}</p>
    <button type="button" class="btn small primary" data-act="openTienda">Abrir en el móvil</button></div>`;
}

function encargosHTML() {
  if (!S.encargos?.length) return '';
  const rows = S.encargos.map((e) => {
    const stock = (S.storage[e.bookId] ?? 0) > 0, route = S.orders.some((o) => o.id === e.bookId);
    const st = stock ? '<span class="tag ok">En el almacén</span>' : route ? '<span class="tag ok">Pedido en camino</span>' : `<button type="button" class="btn small primary" data-act="order" data-id="${e.bookId}" data-n="1">Pedir ahora · ${wholesale(BOOK[e.bookId])} €</button>`;
    return `<div class="up"><div><b>${esc(e.name)}</b><small>Vendrá mañana a por «${esc(BOOK[e.bookId].title)}»</small></div>${st}</div>`;
  }).join('');
  return `<div class="story-card"><p class="kick">Encargos de clientes</p>${rows}<p class="muted small">Si mañana no tienes el libro, el cliente se irá enfadado y te dejará una mala reseña.</p></div>`;
}

function goodRow(g) {
  const lock = !goodUnlocked(S, g), n = goodStock(S, g.id);
  if (lock) return `<div class="up lock"><span class="gi">${gicon(g)}</span><div><b>${g.name}</b><small>Nivel ${g.level}</small></div></div>`;
  return `<div class="up"><span class="gi" style="${g.color && !GOOD_IMG[g.id] ? `background:${g.color}` : ''}">${gicon(g)}</span><div><b>${g.name}</b><small>Coste ${g.cost} € · venta ${g.price} € · tienes ${n}</small></div>
    <button type="button" class="btn small" data-act="buyGood" data-id="${g.id}" data-n="1">+1</button><button type="button" class="btn small primary" data-act="buyGood" data-id="${g.id}" data-n="${g.color ? 2 : 5}">+${g.color ? 2 : 5}</button></div>`;
}
function goodsHTML() {
  const lock = S.level < GOODS[0].level;
  const ers = hasStand(S)
    ? `<h3>Lectores electrónicos</h3><div class="ups">${EREADERS.map(goodRow).join('')}</div>`
    : `<p class="note">Con el <b>Expositor de e-readers</b> (nivel 7, en Mejoras) podrás vender lectores electrónicos.</p>`;
  return lock ? '' : `<h3>Complementos</h3><p class="muted small">Llegan al momento a tu almacén. Los clientes los piden al pagar un libro.</p><div class="ups">${GOODS.map(goodRow).join('')}</div>${ers}`;
}

function panelOrders() {
  const pending = pendingOrders(S);
  const own = sellable(S);
  const grid = BOOKS.map((b) => {
    if (b.unlock > S.level) return `<div class="bk locked"><div class="lock">${coverSVG(b, 84, 126)}<span>Nivel ${b.unlock}</span></div><b>???</b></div>`;
    const have = (own.get(b.id)?.shop ?? 0) + (own.get(b.id)?.store ?? 0);
    return `<div class="bk ord"><div class="cvw">${coverSVG(b, 84, 126)}<span class="own ${have ? '' : 'zero'}" title="Copias que tienes">${have}</span></div><b>${esc(b.title)}</b><small>${esc(b.author)}</small>${b.saga ? `<small class="saga">${esc(sagaLabel(b))}</small>` : ''}<span class="tags">${tagChips(b.tags.slice(0, 2))}</span>
      <div class="buy"><span>Coste ${wholesale(b)} € · venta ${b.price} €</span><div><button type="button" class="btn small" data-act="order" data-id="${b.id}" data-n="1">+1</button><button type="button" class="btn small primary" data-act="order" data-id="${b.id}" data-n="3">+3</button></div></div></div>`;
  }).join('');
  panelEl.innerHTML = `
    <div class="pn-h"><h2>Pedidos</h2><button type="button" class="x" data-act="tab" data-id="orders" aria-label="Cerrar">×</button></div>
    <p class="muted">Llegan a la mañana siguiente, en cajas de hasta 6 libros al almacén. ${pending ? `Tienes <b>${pending}</b> libros en camino.` : 'No tienes pedidos pendientes.'}</p>
    ${webOrdersHTML()}
    ${encargosHTML()}
    ${goodsHTML()}
    <h3>Libros</h3><div class="grid pad">${grid}</div>`;
}

/* ---------- Panel: Mejoras ---------- */

function panelUpgrades() {
  const next = XP_LEVELS[S.level];
  const inv = inventory(S);
  const exps = EXPANSIONS.map((e) => {
    const own = ownsExpansion(S, e.id), locked = S.level < e.level;
    return `<div class="up ${locked ? 'lock' : ''} ${own ? 'own' : ''}">${icon('expand')}<div><b>${e.name}</b><small>${e.desc}</small></div>
      ${own ? '<span class="tag ok">Tuyo</span>' : locked ? `<span class="tag">Nivel ${e.level}</span>` : `<button type="button" class="btn small ${S.money >= e.price ? 'primary' : ''}" data-act="buyExp" data-id="${e.id}">${money(e.price)}</button>`}</div>`;
  }).join('');
  const cards = FURN_ORDER.map((type) => {
    const d = FURN[type];
    const n = countOf(S, type);
    if (n >= d.max) return `<div class="up own">${icon(type)}<div><b>${d.name}</b><small>${n} de ${d.max} · ya los tienes todos</small></div><span class="tag ok">Completo</span></div>`;
    const need = d.level(n);
    const locked = S.level < need;
    const price = d.price(n);
    return `<div class="up ${locked ? 'lock' : ''}">${icon(type)}<div><b>${d.name}</b><small>${d.desc}${n ? ` · tienes ${n}` : ''}</small></div>
      ${locked ? `<span class="tag">Nivel ${need}</span>` : `<button type="button" class="btn small ${S.money >= price ? 'primary' : ''}" data-act="buyFurn" data-t="${type}">${money(price)}</button>`}</div>`;
  }).join('');
  const items = ITEMS.map((it) => `<div class="up ${S.level < it.level ? 'lock' : ''} ${S.owned[it.id] ? 'own' : ''}">${icon(it.id)}<div><b>${it.name}</b><small>${it.desc}</small></div>
    ${S.owned[it.id] ? '<span class="tag ok">Tuyo</span>' : S.level < it.level ? `<span class="tag">Nivel ${it.level}</span>` : `<button type="button" class="btn small ${S.money >= it.price ? 'primary' : ''}" data-act="buyItem" data-id="${it.id}">${money(it.price)}</button>`}</div>`).join('');
  panelEl.innerHTML = `
    <div class="pn-h"><h2>Nivel ${S.level}</h2><button type="button" class="x" data-act="tab" data-id="upgrades" aria-label="Cerrar">×</button></div>
    <p class="muted">${next ? `Te faltan ${next - S.xp} puntos para el nivel ${S.level + 1}.` : 'Has llegado al nivel máximo.'} Acogedor: ${'♥'.repeat(Math.min(10, Math.round(cozy(S) / 2))) || '–'}</p>
    ${inv.length ? `<p class="note">Tienes <b>${inv.length}</b> ${inv.length === 1 ? 'mueble' : 'muebles'} sin colocar.</p><div class="ups">${inv.map((f) => `<div class="up">${icon(f.type)}<div><b>${FURN[f.type].name}</b><small>Sin colocar</small></div><button type="button" class="btn small ghost2" data-act="discard" data-uid="${f.uid}">Tirar</button></div>`).join('')}</div><button type="button" class="btn primary wide" data-act="decor">Ir a decorar</button>` : ''}
    ${passCard()}
    ${storyCard()}
    ${seasonStoryCard()}
    <h3>Ampliar la tienda</h3><div class="ups">${exps}</div>
    <h3>Muebles</h3><div class="ups">${cards}${items}</div>`;
}

const stars = (n) => `<span class="stars">${'★'.repeat(n)}<i>${'★'.repeat(5 - n)}</i></span>`;
const ago = (day) => (S.day - day === 0 ? 'hoy' : S.day - day === 1 ? 'ayer' : `hace ${S.day - day} días`);

/* ---------- El móvil: Plumas (estilo Twitter) y Bookgram (estilo Instagram) ---------- */

const PH = { app: null, tab: 'inicio', picking: false, place: null };
const phoneEl = $('#phone');
const svgi = (p, fill = 'none', sw = 1.9) => `<svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const G = {
  heart: '<path d="M12 20.5s-8-5-8-10.7A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8 2.6c0 5.7-8 10.7-8 10.7z"/>',
  comment: '<path d="M4 5h16v11H9l-5 4z"/>',
  send: '<path d="M21 3 3 10l7 3 3 7zM10 13l11-10"/>',
  home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
  bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',
  mail: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m3 8 9 6 9-6"/>',
  plus: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',
  reel: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M4 9h16M9 4l3 5M14 4l3 5"/><path d="m10 13 4 2.5-4 2.5z" fill="currentColor"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  rt: '<path d="M4 9a4 4 0 0 1 4-4h9l-2-2M20 15a4 4 0 0 1-4 4H7l2 2"/>',
  share: '<path d="M12 4v11M7 9l5-5 5 5M5 14v5h14v-5"/>',
  feather: '<path d="M20 4c-8 0-13 5-13 12v4M20 4c0 8-5 13-12 13M7 20 15 12M9 13h6"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  note: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="16" r="2"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  phone: '<path d="M6 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-3z"/>',
  box: '<path d="M3 8 12 4l9 4v9l-9 4-9-4zM3 8l9 4 9-4M12 12v9"/>',
  bank: '<path d="M3 10 12 4l9 6zM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/>',
  web: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
};
const heroAvatarImg = () => { const hb = heroBase(); return `<img src="arte/retratos/${hb.id}-neutra.webp" data-fb="${heroBust()}" alt="">`; };
const hue = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
const phoneTime = () => {
  if (S.phase === 'evening') return '20:30';
  const m = 9 * 60 + Math.round(((S.phase === 'serving' ? S.idx : 0) / (S.queue.length || 1)) * 480);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};
const statusBar = (light) => `<div class="ph-status" style="color:${light ? '#fff' : '#111'}"><span>${PH.app ? '<button type="button" class="ph-back" data-act="phoneHome" aria-label="Volver a las aplicaciones">‹ Atrás</button>' : phoneTime()}</span><span>5G<i></i></span></div>`;
const niceName = (u) => { const t = String(u).replace(/^@/, '').replace(/[_\d]+/g, ' ').trim(); return t.charAt(0).toUpperCase() + t.slice(1); };

function openPhone() {
  PH.app = null; PH.picking = false;
  phoneEl.hidden = false;
  renderPhone();
}
function closePhone() { phoneEl.hidden = true; }

function renderPhone() {
  const dev = $('.ph-device', phoneEl);
  dev.classList.toggle('home', !PH.app);
  const sc = $('#phScreen');
  if (!PH.app) { sc.innerHTML = phoneHome(); return; }
  const APPS = { plumas: appPlumas, tienda: appTienda, mensajes: appMensajes, agenda: appAgenda, banco: appBanco, resenas: appResenas, camara: appCamara, mapa: appMapa, notas: appNotas };
  if (PH.app === 'mensajes') { (S.msgs ?? []).forEach((m) => { if (!m.options?.length) m.read = true; }); }
  sc.innerHTML = (APPS[PH.app] ?? appBookgram)();
}

function phoneHome() {
  const app = (id, label, cls, glyph, lvl, badge = 0) => {
    const lock = lvl && S.level < lvl;
    return `<button type="button" class="app ${lock ? 'lock' : ''}" data-act="${id ? 'openApp' : 'noApp'}" ${id ? `data-app="${id}"` : ''}><span class="sq ${cls}">${id === 'tienda' ? `<img class="rx" src="${rodeosDataURL(128, 128, { icon: true })}" alt="">` : svgi(glyph)}${lock ? `<span class="lv">Nivel ${lvl}</span>` : ''}${badge ? `<i class="bdg">${badge}</i>` : ''}</span>${label}</button>`;
  };
  return `<div class="ph-wall">${statusBar(true)}<div class="ph-apps">
    ${app('plumas', 'Plumas', 'plumas', G.feather, NETWORKS.pluma.level)}${app('bookgram', 'Bookgram', 'bookgram', G.camera, NETWORKS.foto.level)}
    ${app('tienda', 'Pedidos', 'tienda', G.box, WEB_LEVEL)}${app('mensajes', 'Mensajes', 'g1', G.comment, 0, unreadCount(S))}
    ${app('agenda', 'Agenda', 'g5', G.clock)}${app('banco', 'Banco', 'g2', G.bank)}${app('resenas', 'Reseñas', 'g3', G.star)}${app('camara', 'Cámara', 'g4', G.camera)}${app('mapa', 'Mapas', 'g1', G.map)}${app('notas', 'Notas', 'g2', G.note)}${app(null, 'Música', 'g3', G.music)}${app(null, 'Ajustes', 'g4', G.gear)}
  </div><div class="ph-dock">${app(null, '', 'g1', G.phone)}${app(null, '', 'g5', G.web)}${app(null, '', 'g1', G.comment)}${app(null, '', 'g3', G.music)}</div></div>`;
}

function appTienda() {
  const orders = S.web.orders;
  const label = { nuevo: 'Nuevo', aceptado: 'Por preparar', listo: 'Listo' };
  const body = orders.length ? orders.map((o) => {
    const missing = canFill(S, o.items);
    const books = o.items.map((id) => `<div class="ts-b">${spineSVG(BOOK[id], 46, 1)}<span>${esc(BOOK[id].title)}</span></div>`).join('');
    let actions = '';
    if (o.status === 'nuevo') actions = '<button type="button" class="ts-btn no" data-act="webReject" data-id="' + o.id + '">Rechazar</button><button type="button" class="ts-btn" data-act="webAccept" data-id="' + o.id + '">Aceptar pedido</button>';
    else if (o.status === 'aceptado') actions = missing.length ? `<small class="ts-miss">Te faltan: ${missing.map((i) => esc(BOOK[i].title)).join(', ')}</small>` : '<button type="button" class="ts-btn" data-act="webPack" data-id="' + o.id + '">Preparar y empaquetar</button>';
    else actions = o.mode === 'envio' ? '<small>Mañana pasa Rodeos Express a recogerlo</small>' : '<small>Mañana viene a recogerlo</small>';
    return `<div class="ts-card ${o.status}"><div class="ts-h"><b>${esc(o.who)}</b><span class="ts-st">${label[o.status] ?? ''}</span></div><div class="ts-books">${books}</div>
      <div class="ts-f"><span>${o.mode === 'envio' ? '🚚 Envío con Rodeos Express' : '🏪 Recogida en tienda'} · <b>${o.total} €</b></span></div><div class="ts-a">${actions}</div></div>`;
  }).join('') : '<div class="signup"><p>Aún no hay pedidos. Cada mañana pueden llegar nuevos encargos por internet: acéptalos, prepáralos y empaquétalos para mañana.</p></div>';
  return `<div class="pl ts">${statusBar(false)}<div class="app-top ts-top"><img class="rxl" src="${rodeosDataURL(320, 90)}" alt="Rodeos Express"><span>${esc(S.shopName)}</span></div><div class="app-body">${body}</div></div>`;
}

function appPlumas() {
  const on = S.social.pluma.on;
  const feed = S.feed.filter((p) => p.kind === 'review' || p.kind === 'system');
  const body = !on
    ? `<div class="signup">${svgi(G.feather)}<h3>Bienvenida a Plumas</h3><p>Aquí los lectores cuentan qué les parece tu librería.</p>
        <input id="phHandle" maxlength="22" placeholder="tu_usuario" value="${esc(S.shopName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''))}"><button type="button" class="go" style="background:#2e8fc0" data-act="phSignup" data-app="pluma">Crear cuenta</button></div>`
    : feed.length ? feed.map((p) => {
      if (p.kind === 'system') return `<div class="tw sys"><div class="pic" style="background:#2e8fc0">${svgi(G.feather)}</div><div><span class="nm">Plumas</span> <span class="hd">@plumas · ${ago(p.day)}</span><p>${esc(p.text)}</p></div></div>`;
      return `<div class="tw"><div class="pic" style="background:hsl(${hue(p.user)} 45% 48%)">${esc(p.user[1]?.toUpperCase() ?? '?')}</div><div><span class="nm">${esc(niceName(p.user))}</span> <span class="hd">${esc(p.user)} · ${ago(p.day)}</span><p>${stars(p.stars)} ${esc(p.text)}</p>
        <div class="acts"><span>${svgi(G.comment)}${Math.max(0, Math.floor(p.likes / 6))}</span><span>${svgi(G.rt)}${Math.floor(p.likes / 3)}</span><span class="lk">${svgi(G.heart, 'currentColor')}${p.likes}</span><span>${svgi(G.share)}</span></div></div></div>`;
    }).join('') : '<div class="signup"><p>Aún no hay plumas. Cuando los clientes se lleven un libro, algunos dejarán su reseña aquí.</p></div>';
  return `<div class="pl">${statusBar(false)}<div class="app-top"><span class="avt avp">${heroAvatarImg()}</span>${svgi(G.feather)}</div>
    <div class="app-body">${body}</div>
    <div class="app-nav">${[G.home, G.search, G.bell, G.mail].map((g, i) => `<button type="button" class="${i === 0 ? 'on' : ''}">${svgi(g, 'none', 2.1)}</button>`).join('')}</div></div>`;
}

function reelHTML(p) {
  const b = BOOK[p.bookId];
  return `<article class="bp"><div class="hd"><i><b>${heroAvatarImg()}</b></i>${esc(S.shopName)}</div>
    <div class="media reel" style="background:linear-gradient(160deg, ${b.pal[0]}, ${b.pal[1]})"><span class="tag">Reel</span>${coverSVG(b, 110, 165)}<span class="play"></span><span class="views">▶ ${fmtK(p.views)}</span></div>
    <div class="ac">${svgi(G.heart)}${svgi(G.comment)}${svgi(G.send)}</div><div class="lk">${fmtK(p.likes)} Me gusta ${p.viral ? '· ¡viral!' : ''}</div>
    <div class="cp"><b>${esc(S.shopName)}</b>Hoy os recomiendo «${esc(p.title)}».</div><div class="ag">${ago(p.day)} · +${p.gained} seguidores</div></article>`;
}
function photoHTML(p) {
  return `<article class="bp"><div class="hd"><i><b>${heroAvatarImg()}</b></i>${esc(S.shopName)}</div>
    <div class="media">${p.shot ? `<img src="${p.shot}" alt="">` : ''}</div>
    <div class="ac">${svgi(G.heart)}${svgi(G.comment)}${svgi(G.send)}</div><div class="lk">${fmtK(p.likes)} Me gusta</div>
    <div class="cp"><b>${esc(S.shopName)}</b>${esc(p.caption)}</div><div class="ag">${ago(p.day)} · +${p.gained} seguidores</div></article>`;
}

function appBookgram() {
  const on = S.social.foto.on;
  const photos = S.feed.filter((p) => p.kind === 'photo'), reels = S.feed.filter((p) => p.kind === 'video');
  let body = '';
  if (!on) {
    body = `<div class="signup">${svgi(G.camera)}<h3>Bienvenida a Bookgram</h3><p>Publica fotos de tu librería y haz crecer tu comunidad lectora.</p><button type="button" class="go" style="background:linear-gradient(90deg,#ee2a7b,#6228d7)" data-act="phSignup" data-app="foto">Crear cuenta</button></div>`;
  } else if (PH.tab === 'reels') {
    if (PH.picking) {
      body = `<p style="padding:12px 14px 0;font-weight:700">¿Qué libro recomiendas?</p><div class="pickreel">${availableBooks(S).map((b) => `<button type="button" data-act="phReel" data-id="${b.id}">${coverSVG(b, 80, 120)}${esc(b.title)}</button>`).join('')}</div>`;
    } else if (!S.social.lectok.on) {
      body = S.level >= NETWORKS.lectok.level
        ? `<div class="signup"><h3>Activa los Reels</h3><p>Recomienda libros en un reel. Si uno se hace viral, todo el mundo lo pedirá.</p><button type="button" class="go" style="background:linear-gradient(90deg,#ee2a7b,#6228d7)" data-act="phSignup" data-app="lectok">Activar Reels</button></div>`
        : `<div class="empty-note">Los Reels se desbloquean en el <b>nivel ${NETWORKS.lectok.level}</b>.</div>`;
    } else {
      body = `<button type="button" class="reelbtn" data-act="phPickReel" ${canPost(S, 'lectok') ? '' : 'disabled'}>${canPost(S, 'lectok') ? 'Grabar un reel' : 'Ya grabaste uno hoy'}</button>${reels.map(reelHTML).join('') || '<div class="empty-note">Tus reels aparecerán aquí.</div>'}`;
    }
  } else if (PH.tab === 'perfil') {
    body = `<div class="prof"><div class="big">${heroAvatarImg()}</div><div class="st"><div><b>${photos.length + reels.length}</b>publicaciones</div><div><b>${fmtK(S.followers)}</b>seguidores</div></div></div>
      <p style="padding:0 14px 10px"><b>${esc(S.shopName)}</b><br>Librería cozy · novelas, té y gato.</p><div class="pgrid">${photos.filter((p) => p.shot).map((p) => `<div><img src="${p.shot}" alt=""></div>`).join('')}</div>`;
  } else {
    const posts = [...photos, ...reels].sort((a, b) => b.day - a.day);
    body = `<div class="stories"><div class="story"><i><b>${heroAvatarImg()}</b></i>Tu tienda</div>${['Lucía', 'Mateo', 'Carmen', 'Hugo', 'Noa'].map((n) => `<div class="story"><i><b style="background:hsl(${hue(n)} 50% 70%)">${n[0]}</b></i>${n}</div>`).join('')}</div>
      ${posts.map((p) => (p.kind === 'video' ? reelHTML(p) : photoHTML(p))).join('') || '<div class="empty-note">Pulsa el botón + para publicar tu primera foto de la librería.</div>'}`;
  }
  const nav = on ? `<div class="app-nav">
    <button type="button" class="${PH.tab === 'inicio' ? 'on' : ''}" data-act="bgTab" data-id="inicio">${svgi(G.home, 'none', 2.1)}</button>
    <button type="button" class="${PH.tab === 'reels' ? 'on' : ''}" data-act="bgTab" data-id="reels">${svgi(G.reel, 'none', 2.1)}</button>
    <button type="button" data-act="phPhoto" class="on">${svgi(G.plus, 'none', 2.3)}</button>
    <button type="button" data-act="noApp">${svgi(G.heart, 'none', 2.1)}</button>
    <button type="button" class="${PH.tab === 'perfil' ? 'on' : ''}" data-act="bgTab" data-id="perfil">${svgi(G.user, 'none', 2.1)}</button></div>` : '<div class="app-nav"></div>';
  return `<div class="bg" style="display:flex;flex-direction:column;height:100%">${statusBar(false)}<div class="app-top"><span class="logo">Bookgram</span><span class="ico">${svgi(G.heart)}${svgi(G.send)}</span></div><div class="app-body">${body}</div>${nav}</div>`;
}

/* ---------- Más aplicaciones del teléfono: Mensajes, Agenda, Banco, Reseñas, Cámara, Mapas y Notas ---------- */

const stars5 = (v) => `<span class="st5">${'★'.repeat(Math.round(v))}<i>${'★'.repeat(5 - Math.round(v))}</i></span>`;
const gen = (cls, title, body, sub = '') => `<div class="pl gen ${cls}">${statusBar(false)}<div class="gn-top"><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</div><div class="app-body">${body}</div></div>`;
const unread = () => (S.msgs ?? []).filter((m) => !m.read).length;

function appMensajes() {
  const msgs = S.msgs ?? [];
  const body = msgs.length ? msgs.map((m) => {
    const ch = CAST_BY_ID[m.charId];
    const opts = !m.done && m.options?.length ? `<div class="mg-opts">${m.options.map((o) => `<button type="button" data-act="msgReply" data-id="${m.id}" data-opt="${o.id}">${esc(o.label)}</button>`).join('')}</div>` : '';
    const mine = m.done && m.chosen ? `<div class="mg-me">${esc(m.chosen)}</div>` : '';
    const reply = m.done && m.reply ? `<div class="mg-in"><span>${esc(m.reply)}</span></div>` : '';
    return `<div class="mg ${m.read ? '' : 'new'}"><div class="mg-h"><span class="pic" style="background:hsl(${hue(m.name)} 45% 55%)">${esc(m.name[0])}</span><b>${esc(m.name)}</b><small>${ago(m.day)}</small></div>
      <div class="mg-in"><span>${esc(m.text)}</span></div>${opts}${mine}${reply}</div>`;
  }).join('') : '<div class="signup"><p>Todavía no te ha escrito nadie. Según avance la librería, los clientes habituales te mandarán mensajes: reservas, recomendaciones y alguna sorpresa.</p></div>';
  return gen('mensajes', 'Mensajes', body, unread() ? `${unread()} sin leer` : '');
}

function appAgenda() {
  const have = sellable(S);
  const stock = (id) => (have.get(id)?.shop ?? 0) + (have.get(id)?.store ?? 0);
  const sec = (t, items, empty) => `<div class="ag-sec"><h4>${t}</h4>${items.length ? items.join('') : `<p class="ag-empty">${empty}</p>`}</div>`;
  const today = [];
  if (S.event) today.push(`<div class="ag-it ev">${S.event.type === 'autor' ? `Firma de <b>${esc(S.event.who)}</b>: viene gente a por «${esc(BOOK[S.event.bookId].title)}»` : `Club de lectura con «${esc(BOOK[S.event.bookId].title)}»`}${stock(S.event.bookId) ? '' : ' <em>(¡no te quedan!)</em>'}</div>`);
  S.trend.filter((t) => t.until >= S.day).forEach((t) => today.push(`<div class="ag-it">Tendencia: <b>${esc(BOOK[t.id].title)}</b>${stock(t.id) ? '' : ' <em>(agotado)</em>'}</div>`));
  const pick = (S.encargos ?? []).map((e) => `<div class="ag-it"><b>${esc(e.name)}</b> vendrá a por «${esc(BOOK[e.bookId].title)}» ${e.day < S.day ? 'hoy' : 'mañana'}${stock(e.bookId) ? '' : ' <em>(no tienes copias)</em>'}</div>`);
  const route = (S.orders ?? []).map((o) => `<div class="ag-it">${o.qty}× «${esc(BOOK[o.id].title)}» · ${o.arrive <= S.day ? 'llega hoy' : o.arrive === S.day + 1 ? 'llega mañana' : `llega el día ${o.arrive}`}</div>`);
  const web = (S.web?.orders ?? []).filter((o) => o.status !== 'entregado' && o.status !== 'rechazado').map((o) => `<div class="ag-it">${esc(o.who)}: ${{ nuevo: 'pendiente de aceptar', aceptado: 'por preparar', listo: o.mode === 'envio' ? 'listo para Rodeos Express' : 'listo para recoger' }[o.status] ?? ''}</div>`);
  const sold = Object.keys(S.soldBy ?? {}).filter((id) => stock(id) === 0 && !(S.orders ?? []).some((o) => o.id === id)).slice(0, 6).map((id) => `<div class="ag-it">Agotado y sin pedir: <b>${esc(BOOK[id].title)}</b></div>`);
  const msgs = unread() + (S.msgs ?? []).filter((m) => !m.done && m.options?.length && m.read).length;
  return gen('agenda', 'Agenda', `<div class="ag-day">Día ${S.day} · ${S.weather === 'lluvia' ? 'lluvia' : S.weather === 'nublado' ? 'nublado' : 'sol'}</div>
    ${sec('Hoy', today, 'Nada especial hoy.')}${sec('Clientes que vienen a recoger', pick, 'Nadie ha encargado nada.')}${sec('Pedidos en camino', route, 'No esperas cajas.')}
    ${sec('Pedidos online', web, 'Sin pedidos online.')}${sec('Por reponer', sold, 'Todo lo que vendes está en stock.')}${sec('Mensajes', msgs ? [`<div class="ag-it">Tienes <b>${msgs}</b> ${msgs === 1 ? 'mensaje' : 'mensajes'} por responder.</div>`] : [], 'Todo respondido.')}`);
}

function loanCard() {
  const l = S.loan;
  if (l) {
    const days = Math.ceil(l.owed / l.daily);
    return `<div class="bk-goal bk-loan"><b>Préstamo activo</b><small>Debes ${money2(l.owed)} · cuota de ${money(l.daily)} al día · te quedan unos ${days} ${days === 1 ? 'día' : 'días'}</small>
      <button type="button" class="ts-btn" data-act="loanRepay" ${S.money >= l.owed ? '' : 'disabled'}>Devolver todo (${money2(l.owed)})</button></div>`;
  }
  if (S.level < LOAN_LEVEL) return `<div class="bk-goal bk-loan"><b>Préstamos</b><small>El banco te los ofrecerá a partir del nivel ${LOAN_LEVEL}.</small></div>`;
  return `<div class="bk-goal bk-loan"><b>Pide un préstamo</b><small>Te ingresan el dinero ya y te descuentan una cuota al cerrar cada día (con un 10 % de interés). Solo uno a la vez.</small>
    ${LOANS.map((L, i) => { const x = loanInfo(L); return `<button type="button" class="ts-btn" data-act="loanTake" data-i="${i}">${money(L.amount)} · ${money(x.daily)}/día durante ${L.days} días</button>`; }).join('')}</div>`;
}

function appBanco() {
  const h = (S.history ?? []).slice(-10);
  const max = Math.max(1, ...h.map((x) => Math.abs(x.profit)));
  const bars = h.length ? `<div class="bk-chart">${h.map((x) => `<div class="bkb ${x.profit < 0 ? 'neg' : ''}" title="Día ${x.day}"><i style="height:${Math.max(4, Math.round(Math.abs(x.profit) / max * 100))}%"></i><span>${x.day}</span></div>`).join('')}</div>` : '<p class="ag-empty">Cuando cierres tu primer día verás aquí cómo te va.</p>';
  const next = EXPANSIONS.find((e) => !ownsExpansion(S, e.id));
  const goal = next ? `<div class="bk-goal"><b>Ahorro para «${esc(next.name)}»</b><div class="bk-prog"><i style="width:${Math.min(100, Math.round(S.money / next.price * 100))}%"></i></div><small>${money(S.money)} de ${money(next.price)}${S.level < next.level ? ` · se desbloquea en el nivel ${next.level}` : S.money >= next.price ? ' · ¡ya puedes comprarla!' : ` · te faltan ${money(next.price - S.money)}`}</small></div>` : '<div class="bk-goal"><b>Has comprado todas las ampliaciones</b></div>';
  const rows = [...h].reverse().slice(0, 5).map((x) => `<tr><td>Día ${x.day}</td><td>${x.sales} ventas</td><td class="${x.profit < 0 ? 'neg' : ''}">${x.profit >= 0 ? '+' : ''}${money2(x.profit)}</td></tr>`).join('');
  const t = S.today;
  return gen('banco', 'Banco', `<div class="bk-bal"><small>Saldo</small><b>${money2(S.money)}</b></div>
    ${t ? `<div class="bk-today"><div><b>${t.sales}</b><small>ventas hoy</small></div><div><b>${money(t.revenue + (t.tips ?? 0))}</b><small>ingresado</small></div><div><b>${money(rentFor(S))}</b><small>alquiler diario</small></div></div>` : ''}
    ${goal}${loanCard()}<h4 class="bk-h">Beneficio por día</h4>${bars}${rows ? `<table class="bk-tab">${rows}</table>` : ''}
    <p class="ag-empty">El IVA de los libros (4 %) y el alquiler se descuentan al cerrar cada día.</p>`);
}

function appResenas() {
  const rt = S.ratings ?? {};
  const list = Object.entries(rt).filter(([id]) => BOOK[id]).map(([id, r]) => ({ id, n: r.n, avg: r.sum / r.n })).sort((a, b) => b.avg - a.avg || b.n - a.n);
  const tn = list.reduce((a, x) => a + x.n, 0), ta = tn ? list.reduce((a, x) => a + x.avg * x.n, 0) / tn : 0;
  const rev = (S.feed ?? []).filter((p) => p.kind === 'review' && p.bookId).slice(0, 4);
  const head = tn ? `<div class="rv-head"><b>${ta.toFixed(1).replace('.', ',')}</b>${stars5(ta)}<small>${tn} valoraciones de tus clientes</small></div>` : '';
  const items = list.map((x) => `<div class="rv-it"><span class="cv">${coverSVG(BOOK[x.id], 34, 51)}</span><div><b>${esc(BOOK[x.id].title)}</b><small>${esc(BOOK[x.id].author)}</small></div><div class="rv-st">${stars5(x.avg)}<small>${x.avg.toFixed(1).replace('.', ',')} · ${x.n}</small></div></div>`).join('');
  const quotes = rev.length ? `<h4 class="bk-h">Lo que dicen</h4>${rev.map((p) => `<div class="rv-q"><b>${esc(niceName(p.user))}</b> ${stars5(p.stars)}<p>${esc(p.text)}</p></div>`).join('')}` : '';
  return gen('resenas', 'Reseñas', tn ? `${head}<h4 class="bk-h">Tus libros mejor valorados</h4>${items}${quotes}` : '<div class="signup"><p>Aún no hay valoraciones. Cada venta deja una nota en tus libros: según lo bien que acierte la recomendación, subirá o bajará.</p></div>');
}

const camItemsHTML = () => {
  const have = sellable(S);
  const goods = ALL_GOODS_LIST().filter((g) => (S.goods?.[g.id] ?? 0) > 0).map((g) => `<button type="button" class="wi-it ${PH.camKey === 'g:' + g.id ? 'sel' : ''}" data-act="camPick" data-key="g:${g.id}"><span class="wi">${gicon(g)}</span><b>${esc(g.name)}</b></button>`).join('');
  const ids = stkApply(BOOKS.filter((b) => ((have.get(b.id)?.shop ?? 0) + (have.get(b.id)?.store ?? 0)) > 0).map((b) => b.id));
  const books = ids.map((id) => `<button type="button" class="wi-it ${PH.camKey === 'b:' + id ? 'sel' : ''}" data-act="camPick" data-key="b:${id}">${coverSVG(BOOK[id], 36, 54)}<b>${esc(BOOK[id].title)}</b></button>`).join('');
  return goods + books || '<p class="empty">No tienes nada que fotografiar todavía.</p>';
};
// Icono de un complemento: su ilustración si la tiene (arte/objetos/recortes), si no el emoji
const GOOD_IMG = { marcapaginas: 'marcapaginas', libreta: 'libreta', vela: 'vela', tote: 'totebag', poster: 'poster', fig_dragon: 'dragon', fig_gato: 'gato', fig_buho: 'buho', fig_mago: 'maho', er_luma: 'e-reader', er_tinta: 'e-reader', er_pagina: 'e-reader', er_aurora: 'e-reader' };
const gicon = (g) => (g && GOOD_IMG[g.id] ? `<img class="gimg" src="arte/objetos/recortes/${GOOD_IMG[g.id]}.png" alt="" loading="lazy" draggable="false">` : (g?.emoji ?? '📦'));
const ALL_GOODS_LIST = () => [...GOODS, ...EREADERS];

function appCamara() {
  const album = S.album ?? [];
  const shop = world.view === 'shop';
  const mode = PH.cam ?? 'tienda';
  const what = mode === 'objeto' && PH.camKey ? (PH.camKey.startsWith('b:') ? BOOK[PH.camKey.slice(2)]?.title : GOOD[PH.camKey.slice(2)]?.name) : '';
  stkRender = () => { const l = $('#camList'); if (l) l.innerHTML = camItemsHTML(); };
  return gen('camara', 'Cámara', `<div class="cm-modes"><button type="button" class="${mode === 'tienda' ? 'on' : ''}" data-act="camMode" data-m="tienda">La tienda</button><button type="button" class="${mode === 'objeto' ? 'on' : ''}" data-act="camMode" data-m="objeto">Un libro u objeto</button></div>
    ${mode === 'objeto' ? `<p class="ag-empty">${what ? `Foto de: <b>${esc(what)}</b>` : 'Elige qué quieres fotografiar'}</p>${stkToolsHTML()}<div id="camList" class="wlist cm-list">${camItemsHTML()}</div>` : ''}
    <div class="cm-view">${album[0]?.shot ? `<img src="${album[0].shot}" alt="">` : '<div class="cm-none">Aún no has hecho fotos</div>'}</div>
    <div class="cm-bar"><button type="button" class="cm-shutter" data-act="camShot" ${shop || mode === 'objeto' ? '' : 'disabled'} aria-label="Hacer foto"></button></div>
    ${shop || mode === 'objeto' ? '' : '<p class="ag-empty">Vuelve a la tienda para hacer una foto de la tienda.</p>'}
    ${album.length > 1 ? `<h4 class="bk-h">Álbum</h4><div class="cm-grid">${album.map((p) => `<div><img src="${p.shot}" alt=""><small>${p.label ? esc(p.label.slice(0, 14)) : `Día ${p.day}`}</small></div>`).join('')}</div>` : ''}`, album.length ? `${album.length} fotos` : '');
}

const MAP_PLACES = {
  tienda: { x: 52, y: 58, name: () => S.shopName, emoji: '📖', text: () => `Tu librería. ${S.expansions.length ? `Has ampliado ${S.expansions.length} ${S.expansions.length === 1 ? 'vez' : 'veces'}.` : 'Con ganas de crecer.'} Nivel ${S.level}.` },
  cafe: { x: 76, y: 52, name: () => 'Café del Sol', emoji: '☕', text: () => 'El local de al lado huele a café recién hecho. Dicen que algún día podríais abrir una puerta entre los dos.' },
  panaderia: { x: 28, y: 44, name: () => 'Panadería La Espiga', emoji: '🥖', text: () => 'Abren a las seis. Doña Lola siempre pregunta si ha llegado la novela nueva.' },
  biblio: { x: 40, y: 22, name: () => 'Biblioteca municipal', emoji: '🏛️', text: () => 'La biblioteca del barrio. Competencia amable: casi todos sus socios acaban comprándose los libros que más les gustan.' },
  papeleria: { x: 78, y: 28, name: () => 'Papelería Clip', emoji: '✏️', text: () => 'Marcapáginas, libretas y bolígrafos. Quizá un día os podáis recomendar mutuamente.' },
  rodeos: { x: 16, y: 74, name: () => 'Rodeos Express', emoji: '🚚', text: () => (S.orders?.length ? `La base de Samir. Tiene ${S.orders.reduce((t, o) => t + o.qty, 0)} libros tuyos en camino.` : 'La base de Samir. No tiene nada tuyo pendiente.') },
  parque: { x: 60, y: 82, name: () => 'Parque del Plátano', emoji: '🌳', text: () => (S.weather === 'sol' ? 'Hoy hace sol: hay gente leyendo en los bancos.' : 'Hoy no hay quien lea en los bancos del parque.') },
};
function appMapa() {
  const sel = MAP_PLACES[PH.place] ?? MAP_PLACES.tienda;
  const pins = Object.entries(MAP_PLACES).map(([id, p]) => `<button type="button" class="mp-pin ${PH.place === id || (!PH.place && id === 'tienda') ? 'on' : ''}" style="left:${p.x}%;top:${p.y}%" data-act="mapPin" data-id="${id}" aria-label="${esc(p.name())}">${p.emoji}</button>`).join('');
  return gen('mapa', 'Mapas', `<div class="mp-map"><i class="r1"></i><i class="r2"></i><i class="r3"></i>${pins}</div><div class="mp-card"><b>${esc(sel.name())}</b><p>${esc(sel.text())}</p></div>`);
}

function appNotas() {
  return gen('notas', 'Notas', `<textarea class="nt-area" data-notes placeholder="Apunta aquí lo que no quieras olvidar: libros que pedir, ideas para el escaparate…" maxlength="2000">${esc(S.notes ?? '')}</textarea>`, 'Se guarda solo');
}

/* ---------- Resumen del día ---------- */

function showSummary() {
  const s = S.summary;
  if (!s) return;
  const perks = [
    ...(s.event ? [`<li>${s.event.type === 'autor' ? `Firma de ${esc(s.event.who)}` : 'Club de lectura'}: +${s.event.bonus} de reputación</li>`] : []),
    ...s.newBooks.map((id) => `<li>Libro nuevo: <b>${esc(BOOK[id].title)}</b></li>`),
    ...s.newItems.map((n) => `<li>Ya puedes comprar: <b>${esc(n)}</b></li>`),
    ...s.newNetworks.map((k) => `<li>Red social: <b>${NETWORKS[k].name}</b></li>`),
    ...(s.newWeb ? ['<li>En el móvil: <b>Pedidos online</b> (los clientes te encargan libros por internet)</li>'] : []),
  ].join('');
  waitSheet(`${sheetHead(`Resumen del día ${s.day}`)}
    <div class="stats"><div><b>${s.sales}</b><span>ventas</span></div><div><b>${money2(s.net)}</b><span>te quedas</span></div><div><b>${s.xp}</b><span>puntos</span></div></div>
    <table class="books"><tr><td>Ventas (IVA incluido)</td><td>${money2(s.gross)}</td></tr>
      ${s.goods ? `<tr><td>Incluye ${s.goods} ${s.goods === 1 ? 'complemento' : 'complementos'}</td><td></td></tr>` : ''}
      ${s.tips ? `<tr><td>Propinas</td><td>+${money2(s.tips)}</td></tr>` : ''}
      <tr class="neg"><td>IVA de los libros (4 %)</td><td>−${money2(s.iva)}</td></tr>
      <tr class="neg"><td>Alquiler y suministros</td><td>−${money2(s.rent)}</td></tr>
      ${s.loan ? `<tr class="neg"><td>Cuota del préstamo</td><td>−${money2(s.loan)}</td></tr>` : ''}
      <tr class="tot"><td>Te quedas</td><td>${money2(s.net)}</td></tr></table>
    <p class="muted small">Los libros llevan IVA superreducido: el precio que ves ya lo incluye. Los pedidos del día siguiente se pagan al encargarlos.</p>
    <p class="muted">${s.left ? `${s.left} ${s.left === 1 ? 'cliente se fue' : 'clientes se fueron'} sin comprar.` : 'Nadie se fue con las manos vacías.'}${s.reviews ? ` ${s.reviews} ${s.reviews === 1 ? 'reseña nueva' : 'reseñas nuevas'}.` : ''}</p>
    ${perks ? `<ul class="bul">${perks}</ul>` : ''}
    <button type="button" class="btn primary wide" data-act="nextday">Cerrar y pasar al día siguiente</button>`, '').then(async () => {
    if (S.phase !== 'evening') return;
    busy = true;
    const dayN = S.day + 1, ago = S.summary;
    await window.Loading.show({ kind: 'day', title: `Día ${dayN}`, minMs: 1200, diary: true });
    nextDay(S);
    persist();
    window.Loading.set(0.5);
    world.autoNight();
    syncWorld();
    renderPanel();
    window.Loading.set(0.85);
    await window.Loading.diary(diaryFor(S, ago));
    await window.Loading.hide();
    busy = false;
    renderPanel();
    if (S.boxes.length) toast(`Han llegado ${S.boxes.length === 1 ? 'una caja' : `${S.boxes.length} cajas`} al almacén. Ábrelas desde el almacén.`);
    const back = S.queue.filter((c) => c.pickup || c.parcel).length;
    if (back) setTimeout(() => toast(`Hoy vienen ${back} ${back === 1 ? 'cliente' : 'clientes'} a recoger un encargo o pedido.`), 1800);
    maybeDelivery();
  });
}

/* ---------- Acciones ---------- */

const act = {
  tab: ({ id }) => { closeSheet(); showTab(id); },
  close: () => { if (boxGame) { boxGame = null; } dismissSheet(); },
  dismiss: () => dismissSheet(),
  nextday: () => dismissSheet(),
  open: () => { startDayService(); setTimeout(updateOpenBtn, 50); },
  summary: async () => { if (busy) return; busy = true; await readersLeave(); busy = false; showSummary(); },
  attend: () => attend(),
  talkOpt: ({ id }) => talkOpt(id),
  pickBook: ({ id }) => pickBook(id),
  cancelPick: () => cancelPick(),
  dismissCust: () => dismissFlow(),
  toggleHard: () => { S.settings.hard = !S.settings.hard; P.hard = S.settings.hard; savePrefs(); persist(); toast(S.settings.hard ? 'Modo difícil activado: sin etiquetas, menos preguntas y menos oportunidades.' : 'Modo difícil desactivado.'); renderPanel(); },
  decor: () => { closeSheet(); toggleEdit(); },
  editTab: ({ id }) => { editTab = id; renderEditPanel(); },
  rotate: () => { const err = rotateFurniture(S, selUid); if (err) { toast(err); return; } persist(); syncWorld(); renderEditPanel(); },
  selFurn: ({ uid }) => { selUid = uid; world.select(uid); renderEditPanel(); },
  nudge: ({ dx, dy }) => { const err = nudgeFurniture(S, selUid, Number(dx), Number(dy)); if (err) { toast(err); return; } persist(); syncWorld(); world.select(selUid); renderEditPanel(); },
  discard: async ({ uid }) => {
    const f = furnById(S, uid);
    if (!f || !(await askConfirm(`¿Tirar «${FURN[f.type].name}»? No recuperarás el dinero.`, 'Tirar', true))) return;
    const err = discardFurniture(S, uid); if (err) { toast(err); return; }
    persist(); renderPanel(); toast('Mueble tirado.');
  },
  storeSel: () => { const err = storeFurniture(S, selUid); if (err) { toast(err); return; } selUid = null; world.select(null); persist(); syncWorld(); renderEditPanel(); renderTop(); },
  setFloor: ({ id }) => { setDeco(S, 'floor', id); persist(); syncWorld(); renderEditPanel(); },
  setWall: ({ id }) => { setDeco(S, 'wall', id); persist(); syncWorld(); renderEditPanel(); },
  newPoster: () => posterSheet(),
  pickArt: ({ id }) => {
    const sz = POSTER_SIZES.m;
    closeSheet();
    newPosterAt({ kind: 'arte', art: id, w: sz.w * 0.82, h: sz.h * 0.82 });
  },
  posterKind: ({ k }) => posterKindUI(k),
  makePoster: async ({ k }) => {
    const sid = ($('input[name=psz]:checked')?.value) ?? 'm';
    const sz = POSTER_SIZES[sid];
    if (k === 'img') {
      const f = $('#pimg')?.files?.[0];
      if (!f) { toast('Elige primero una imagen.'); return; }
      try {
        const { data, ratio } = await readImage(f);
        const h = sz.h, w = Math.min(1.6, Math.max(.45, h * ratio));
        closeSheet(); newPosterAt({ kind: 'img', img: data, w, h });
      } catch { toast('No se pudo leer esa imagen.'); }
      return;
    }
    const text = ($('#ptext')?.value ?? '').trim();
    if (!text) { toast('Escribe algo en el cartel.'); return; }
    closeSheet(); newPosterAt({ kind: k, text, w: sz.w < .7 ? .8 : sz.w, h: sz.h < .8 ? .6 : sz.h * .8 });
  },
  posterBig: () => {
    const p = posterById(S, selPoster); if (!p) return;
    const k = p.w > 1.1 ? .6 : 1.3; p.w = Math.round(p.w * k * 100) / 100; p.h = Math.round(p.h * k * 100) / 100;
    persist(); syncWorld();
  },
  posterDel: () => { if (selPoster) { removePoster(S, selPoster); selPoster = null; persist(); syncWorld(); renderEditPanel(); } },
  arrange: () => { const n = autoPlace(S); persist(); syncWorld(); renderPanel(); toast(n ? `Has expuesto ${n} títulos.` : 'No había hueco libre.'); },
  autoall: () => { const n = autoPlace(S); persist(); closeSheet(); syncWorld(); toast(n ? `Has expuesto ${n} títulos.` : 'No había hueco libre.'); renderPanel(); },
  place: ({ id }) => placeSheet(id),
  toTable: ({ id }) => { const err = setOnTable(S, id); if (err) { toast(err); return; } persist(); syncWorld(); renderPanel(); toast(`«${BOOK[id].title}» en la mesa de novedades.`); },
  placeAt: ({ id, cid }) => {
    const err = placeBook(S, id, cid);
    if (err) { toast(err); return; }
    persist(); closeSheet(); syncWorld(); renderPanel();
  },
  furn: ({ uid }) => furnSheet(uid),
  takeback: ({ cid, i, uid }) => { takeBack(S, cid, Number(i)); persist(); syncWorld(); furnSheet(uid); renderPanel(); },
  openBox: ({ id }) => openBoxGame(id),
  openAllBoxes: () => { if (busy || !S.boxes.length) return; const n = openAllBoxes(S); persist(); syncWorld(); renderPanel(); renderTop(); toast(`${n} libros guardados en el almacén. Puedes exponer uno de cada título.`); },
  boxAll: () => { if (boxGame) { boxGame.stage = 2; renderBoxGame(); } },
  takeFromBox: ({ id }) => { if (boxGame) { boxGame.taken.add(id); renderBoxGame(); } },
  finishBox: () => finishBox(),
  order: ({ id, n }) => {
    const err = orderBooks(S, id, Number(n));
    if (err) { toast(err); return; }
    persist();
    toast(`Pedido de ${n} × «${BOOK[id].title}» en camino. Llega mañana.`);
    renderPanel();
  },
  buyFurn: ({ t }) => {
    const err = buyFurniture(S, t);
    if (err) { toast(err); return; }
    persist();
    toast(`${FURN[t].name}: ya está en tu inventario. Ve a decorar.`);
    renderPanel();
  },
  buyItem: ({ id }) => {
    const err = buyItem(S, id);
    if (err) { toast(err); return; }
    persist(); syncWorld();
    toast('¡Tu librería es un poco más bonita!');
    renderPanel();
  },
  buyExp: ({ id }) => {
    const err = buyExpansion(S, id);
    if (err) { toast(err); return; }
    persist(); syncWorld(); world.recenter();
    toast('¡Tienes más sitio! Mira cómo ha crecido la tienda.');
    renderPanel();
  },
  openApp: ({ app }) => {
    const lv = app === 'plumas' ? NETWORKS.pluma.level : app === 'tienda' ? WEB_LEVEL : app === 'bookgram' ? NETWORKS.foto.level : 0;
    if (S.level < lv) { toast(`Se desbloquea en el nivel ${lv}.`); return; }
    PH.app = app; PH.tab = 'inicio'; PH.picking = false; renderPhone();
  },
  openTienda: () => { panelOpen = false; renderPanel(); openPhone(); PH.app = 'tienda'; renderPhone(); },
  noApp: () => toast('Sin novedades por ahora.'),
  msgReply: ({ id, opt }) => {
    const m = replyMessage(S, id, opt);
    if (!m) return;
    persist(); renderTop(); renderPhone();
    toast(m.reply ? `${m.name}: «${m.reply}»` : 'Respondido.');
  },
  camMode: ({ m }) => { PH.cam = m; renderPhone(); },
  camPick: ({ key }) => { PH.camKey = key; renderPhone(); },
  camShot: async () => {
    const mode = PH.cam ?? 'tienda';
    let shot, label = '';
    if (mode === 'objeto') {
      if (!PH.camKey) { toast('Elige primero qué quieres fotografiar.'); return; }
      try { shot = shootItem(PH.camKey); } catch { toast('No he podido hacer esa foto.'); return; }
      label = PH.camKey.startsWith('b:') ? BOOK[PH.camKey.slice(2)]?.title : GOOD[PH.camKey.slice(2)]?.name;
    } else {
      if (world.view !== 'shop') { toast('Vuelve a la tienda para hacer la foto.'); return; }
      shot = await world.snapshot(480, 320, true);
      if (!shot) { toast('No he podido hacer la foto.'); return; }
    }
    S.album ??= [];
    S.album.unshift({ shot, day: S.day, label });
    S.album = S.album.slice(0, 8);
    persist();
    $('#phScreen').insertAdjacentHTML('beforeend', '<div class="flash"></div>');
    setTimeout(renderPhone, 380);
  },
  mapPin: ({ id }) => { PH.place = id; renderPhone(); },
  webAccept: ({ id }) => { webAccept(S, id); persist(); renderTop(); renderPhone(); },
  webReject: ({ id }) => { webReject(S, id); persist(); renderTop(); renderPhone(); },
  webPack: async ({ id }) => {
    const o = webOrder(S, id);
    if (!o || busy) return;
    if (S.phase !== 'morning') { toast('Prepara los pedidos por la mañana, antes de abrir.'); return; }
    const miss = canFill(S, o.items);
    if (miss.length) { toast('Te faltan libros: pídelos en Pedidos.'); return; }
    closePhone(); busy = true;
    const r = await runPackBox({ items: o.items, who: o.who, shop: S.shopName, hard: S.settings.hard, buzz });
    busy = false;
    if (r) {
      const err = packOrder(S, id);
      if (err) toast(err);
      else { persist(); syncWorld(); renderTop(); renderPanel(); toast(`Paquete listo para ${o.who}. ${o.mode === 'envio' ? 'Mañana pasará Rodeos Express a recogerlo.' : 'Mañana vendrá a recogerlo.'}`); }
    }
    openPhone(); PH.app = 'tienda'; renderPhone();
  },
  closePhone: () => closePhone(),
  phoneHome: () => { if (PH.app) { PH.app = null; renderPhone(); } else closePhone(); },
  bgTab: ({ id }) => { PH.tab = id; PH.picking = false; renderPhone(); },
  phSignup: ({ app }) => {
    const err = app === 'pluma' ? createAccount(S, 'pluma', ($('#phHandle')?.value ?? '').trim().replace(/^@/, '') || 'latintayelte') : createAccount(S, app);
    if (err) toast(err); else persist();
    renderPhone();
    renderTop();
  },
  phPhoto: async () => {
    if (!canPost(S, 'foto')) { toast('Ya has publicado hoy. Vuelve mañana.'); return; }
    if (world.view !== 'shop') { toast('Vuelve a la tienda para hacer la foto.'); return; }
    const shot = await world.snapshot(480, 320, true);
    const p = postPhoto(S);
    if (!p) return;
    p.shot = shot;
    S.feed.filter((x) => x.kind === 'photo' && x.shot).slice(4).forEach((x) => { delete x.shot; });
    persist();
    $('#phScreen').insertAdjacentHTML('beforeend', '<div class="flash"></div>');
    toast(`Tu foto ha gustado a ${fmtK(p.likes)} personas.`);
    setTimeout(() => { PH.tab = 'inicio'; renderPhone(); }, 380);
  },
  phPickReel: () => { PH.picking = true; renderPhone(); },
  phReel: ({ id }) => {
    const p = postVideo(S, id);
    PH.picking = false;
    if (p) { persist(); toast(p.viral ? `¡Tu reel sobre «${p.title}» se ha hecho viral! ${fmtK(p.views)} reproducciones.` : `Tu reel ha tenido ${fmtK(p.views)} reproducciones.`); }
    renderPhone();
  },
  menuContinue: async () => {
    if (menuGo) return;
    if (!S.hero && !stored()) return;
    menuGo = true;
    await window.Loading.show({ kind: 'logo', title: window.APP.name, minMs: 1900 });
    if (!S.hero) S = prepare(stored());
    hideMenu(); introEl.hidden = true; document.body.classList.remove('intro');
    world.setTownName(S.shopName);
    goShop(); world.recenter(); applyHero(); world.hero.visible = true; syncWorld(); renderPanel(); renderTop();
    if (tutActive()) { tutRender(); clearInterval(tutTimer); tutTimer = setInterval(tutTick, 350); }
    window.Loading.set(0.9);
    await window.Loading.hide();
    menuGo = false;
  },
  menuNew: async () => {
    if (menuGo) return;
    if (stored() && !(await askConfirm('Ya tienes una partida guardada. Se sustituirá cuando termines de crear tu nuevo personaje.', 'Empezar de nuevo'))) return;
    menuGo = true;
    await window.Loading.show({ kind: 'logo', title: window.APP.name, minMs: 1900 });
    startNew();
    window.Loading.set(0.9);
    await window.Loading.hide();
    menuGo = false;
  },
  installApp: async () => {
    if (deferredInstall) { deferredInstall.prompt(); try { await deferredInstall.userChoice; } catch { /* ignorado */ } deferredInstall = null; return; }
    toast(/iphone|ipad|ipod/i.test(navigator.userAgent) ? 'En Safari: botón Compartir → «Añadir a pantalla de inicio».' : 'En el menú del navegador (⋮) elige «Instalar aplicación» o «Añadir a pantalla de inicio».');
  },
  menuPage: ({ p }) => { menuPage = p; renderMenu(); },
  pref: ({ key }) => {
    if (key === 'hard' && S.hero && menuEl.hidden) P.hard = !S.settings.hard; else P[key] = !P[key];
    savePrefs();
    if (key === 'hard' && S.hero) { S.settings.hard = P.hard; persist(); }
    if (key === 'vibrate' && P.vibrate) buzz(40);
    if (menuEl.hidden) openSettings(); else renderMenu();
  },
  exportSave: () => {
    const s = S.hero ? S : stored(); if (!s) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(s)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `mi-libreria-dia-${s.day}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },
  importSave: () => $('#importFile').click(),
  deleteSave: async () => { if (!(await askConfirm('Se borrará tu partida guardada. No se puede deshacer.', 'Borrar', true))) return; wipe(); S = prepare(newGame()); renderMenu(); },
  welcome: () => {
    S.welcomed = true;
    persist();
    openSheet(`${sheetHead('Bienvenida a tu librería')}<ol class="bul num"><li><b>Pide libros</b> en Pedidos; llegan al día siguiente en una caja al almacén.</li><li><b>Abre la caja</b> en el almacén y expón un ejemplar de cada título en las estanterías.</li><li><b>Abre la tienda</b>: cada cliente busca algo. Ofrécele el libro que mejor encaje; tu personaje irá al almacén a por la copia.</li><li>Sube de nivel para desbloquear libros, muebles y <b>locales contiguos</b>. En Decorar cambia suelo, paredes y carteles.</li></ol><button type="button" class="btn primary wide" data-act="close">A trabajar</button>`);
    renderPanel();
  },
  pickHero: ({ id }) => { crShop = $('#shopIn')?.value ?? crShop; crName = $('#heroName')?.value ?? crName; const prevDefault = HERO_BY_ID[crSel]?.name; if (!crName || crName === prevDefault) crName = HERO_BY_ID[id].name; crSel = id; renderCreator(); },
  startGame: () => {
    const name = ($('#heroName')?.value ?? '').trim() || HERO_BY_ID[crSel].name;
    S.hero = { base: crSel, name };
    S.shopName = ($('#shopIn')?.value ?? '').trim() || 'Mi librería';
    persist(); applyHero(); closeSheet(); renderTop(); syncWorld();
    if (newFlow) { newFlow = false; world.stopPedestrians(); world.setTownName(S.shopName); world.setView('town'); runIntro(false); }
    else toast(`Ahora eres ${name}.`);
  },
  testMode: () => {
    if (!S.hero) return;
    S.test = !S.test;
    if (S.test) {
      const max = XP_LEVELS.length;
      S.level = max; S.xp = Math.max(S.xp, XP_LEVELS[max - 1]); S.money = Math.max(S.money, TEST_MONEY); S.levelUps = [];
      toast('Modo pruebas activado: nivel máximo y dinero ilimitado.');
    } else toast('Modo pruebas desactivado. Conservas el nivel y el dinero que tengas.');
    persist(); syncWorld(); renderTop(); renderPanel(); openSettings();
  },
  replayTut: () => { if (S.phase !== 'morning' || busy) { toast('Termina antes la jornada.'); return; } closeSheet(); panelOpen = false; renderPanel(); tutStart(); },
  replayIntro: () => { if (busy || S.phase === 'serving') { toast('Termina antes la jornada.'); return; } closeSheet(); runIntro(false); },
  creatorBack: () => { newFlow = false; introPending = false; world.stopPedestrians(); closeSheet(); document.body.classList.remove('intro'); S = prepare(stored() ?? newGame()); goShop(); showMenu(); },
  testSeason: () => { S.testSeason = nextSeasonId(); checkSeason(); persist(); toast(`Ahora ves la ${SEASON.name}: «${SEASON.title}».`); renderTop(); if ($('.pass-sheet')) openPass(); else if ($('.set-sheet')) openSettings(); },
  makeVideo: async () => {
    if (busy || !canVideo(S)) return;
    busy = true; vidBtn.hidden = true; panelOpen = false; renderPanel();
    const ov = document.createElement('div'); ov.id = 'recOv'; ov.innerHTML = '<span class="rec-dot"></span><b>REC</b><i id="recN">3</i>'; document.body.append(ov);
    world.setRec(true); sfx('whoosh');
    for (let n = 3; n >= 1; n--) { const el = $('#recN'); if (el) el.textContent = n; await wait(900); }
    ov.innerHTML = '<b>¡Corten!</b>'; await wait(700); ov.remove(); world.setRec(false);
    const p = makeVideo(S);
    persist(); renderTop();
    if (p) await waitSheet(`${sheetHead('Vídeo subido')}<div class="vid-card"><b>«${esc(p.title)}»</b><p>${p.viral ? '🔥 ¡Se ha hecho viral!' : 'Tu vídeo ya está en tu canal.'}</p>
      <div class="stats"><div><b>${fmtK(p.views)}</b><span>visualizaciones</span></div><div><b>${fmtK(p.likes)}</b><span>me gusta</span></div><div><b>+${p.gained}</b><span>seguidores</span></div></div>
      ${p.viral ? `<p class="muted">Todo el mundo pregunta por «${esc(BOOK[p.bookId].title)}».</p>` : ''}<button type="button" class="btn primary wide" data-act="close">Genial</button></div>`);
    await showLevelUps();
    busy = false; renderPanel();
  },
  openPass: () => { openPass(); },
  buyPremium: () => toast(`El pase premium (${SEASON.premiumPrice}) se podrá comprar cuando publiquemos la app. Mientras tanto, puedes probarlo en el modo pruebas.`),
  pcClose: () => { const e = attending; closeSheet(); if (!e) return; e.c.talk.pcChecked = true; dlgOpen(); clientSays(e, pickOne(['¿Qué tal? ¿Hay suerte?', 'Vale… ¿lo tienes?', 'Te espero, sin prisa.']), 'neutra', () => hub(e)); },
  loanTake: ({ i }) => { const err = takeLoan(S, Number(i)); if (err) { toast(err); return; } sfx('coin'); persist(); renderTop(); renderPhone(); toast('Préstamo concedido: el dinero ya está en tu cuenta.'); },
  loanRepay: () => { const err = repayLoan(S); if (err) { toast(err); return; } sfx('coin'); persist(); renderTop(); renderPhone(); toast('Has devuelto el préstamo.'); },
  viewWindow: ({ uid }) => viewWindowOutside(uid),
  winSlot: ({ uid, i }) => windowPick(uid, Number(i)),
  winPut: ({ uid, i, key }) => { const err = setWindow(S, uid, Number(i), key); if (err) { toast(err); return; } persist(); syncWorld(); windowSheet(uid); },
  winBack: ({ uid }) => windowSheet(uid),
  gift: ({ id }) => giftRes?.(id),
  directCharge: () => {
    const e = attending;
    if (!e?.c?.direct) return;
    const b = BOOK[e.c.bookId];
    playerSays(e, `Son ${money(b.price)}. ¡Gracias por tu compra!`, async () => {
      closeDialog(); talking = false; busy = true;
      const price = directSale(S, e.c.bookId);
      persist(); renderTop(); syncWorld();
      if (price) await finishCustomer(e, { sold: true, price, tip: 0, message: pickOne(['¡Gracias, hasta pronto!', 'Perfecto, ¡que tengas buen día!', '¡Muchas gracias!']) }, e.c.bookId);
      else await finishCustomer(e, { sold: false, neutral: true, message: 'Vaya… se acaba de agotar.' }, null);
    }, 'contenta');
  },
  upsell: ({ v }) => { const f = upRes; upRes = null; f?.(v === 'y'); },
  buyGood: ({ id, n }) => { const err = buyGood(S, id, Number(n) || 1); if (err) { toast(err); return; } sfx('coin'); persist(); renderTop(); renderPanel(); toast(`${GOOD[id].name} ×${Number(n) || 1} en el almacén.`); },
  edPick: ({ v }) => { closeSheet(); const r = edResolve; edResolve = null; r?.(v === 's'); },
  passAll: async () => {
    const prev = $('.pass-sheet'); if (prev) passScroll = prev.scrollTop;
    const eds = [], studio = []; let money = 0, xp = 0, furn = 0;
    for (let i = 0; i < TIERS.length; i++) for (const track of ['free', 'prem']) {
      const r = claimPass(S, track, i);
      if (typeof r === 'string') continue;
      if (r.kind === 'money') money += r.n; else if (r.kind === 'xp') xp += r.n; else if (r.kind === 'furn') furn++; else if (r.kind === 'studio') studio.push(STUDIO[r.item].name); else if (r.kind === 'edition') eds.push(r.book);
    }
    persist(); sfx('win'); buzz(30); renderTop();
    const parts = [studio.length && `Almacén: ${studio.join(', ')}`, money && `+${money} €`, xp && `+${xp} XP`, furn && `${furn} ${furn === 1 ? 'mueble' : 'muebles'} en el inventario`, eds.length && `${eds.length} ${eds.length === 1 ? 'edición especial' : 'ediciones especiales'}`].filter(Boolean);
    toast(parts.join(' · ') || 'Nada que reclamar');
    clearBookCaches(eds); if (eds.length) syncWorld();
    if (eds.length) { closeSheet(); for (const id of eds) await showBook3D(BOOK[id], { heading: '¡Nueva edición especial!', note: `Cantos tintados en ${EDITIONS[id].edgeName}. Se vende un 35 % más cara.` }); }
    if (xp) await showLevelUps();
    openPass(); renderPanel();
  },
  passClaim: async ({ track, i }) => {
    const prev = $('.pass-sheet'); if (prev) passScroll = prev.scrollTop;
    const r = claimPass(S, track, Number(i));
    if (typeof r === 'string') { toast(r); return; }
    persist(); sfx('win'); buzz(30); renderTop();
    if (r.kind === 'edition') { clearBookCaches([r.book]); syncWorld(); closeSheet(); await showBook3D(BOOK[r.book], { heading: '¡Nueva edición especial!', note: `Cantos tintados en ${EDITIONS[r.book].edgeName}. Se vende un 35 % más cara.` }); openPass(); return; }
    toast(r.kind === 'money' ? `+${r.n} €` : r.kind === 'xp' ? `+${r.n} XP` : r.kind === 'studio' ? `${STUDIO[r.item].name} instalado en el almacén` : `${FURN[r.type].name}${r.skin ? ' (' + skinName(r.type, r.skin) + ')' : ''} añadido al inventario`);
    if (r.kind === 'xp') await showLevelUps();
    openPass(); renderPanel();
  },
  passView: async ({ book }) => { closeSheet(); await showBook3D(BOOK[book], { heading: 'Tu edición especial', note: `Cantos tintados en ${EDITIONS[book].edgeName}.` }); openPass(); },
  passTest: async ({ k }) => {
    if (k === 'p100' || k === 'p500') S.pass.pts = Math.min(SEASON.tiers * SEASON.per, S.pass.pts + (k === 'p100' ? 100 : 500));
    else if (k === 'prem') S.pass.premium = !S.pass.premium;
    else if (k === 'season') { S.testSeason = nextSeasonId(); checkSeason(); }
    else if (k === 'reset' && await askConfirm('Se reinicia el pase (puntos y premios reclamados). Lo que ya tengas en el inventario se queda.', 'Reiniciar pase', true)) { S.pass = S.passes[SEASON.id] = { pts: 0, free: [], prem: [], premium: SEASON.id === '2026-11', editions: {} }; clearBookCaches(applyEditions(S)); syncWorld(); }
    persist(); renderTop(); openPass(); renderPanel();
  },
  openSettings: () => { if (!menuEl.hidden || !dlg.hidden || !introEl.hidden) return; panelOpen = false; renderPanel(); openSettings(); },
  menuBack: () => { if (busy || S.phase === 'serving') { toast('Termina antes la jornada.'); return; } closeSheet(); persist(); panelOpen = false; renderPanel(); showMenu(); },
  changeHero: () => { panelOpen = false; renderPanel(); openCreator(); },
  reset: async () => { if (await askConfirm('Se sustituirá tu librería actual y empezarás de cero con un personaje nuevo.', 'Empezar de cero', true)) { closeSheet(); startNew(); } },
};

document.addEventListener('pointerdown', () => { initAudio(); applyVolumes(); startMusic(); }, { once: false, capture: true });
document.addEventListener('click', (e) => {
  if (e.target.closest('button, [data-act]')) sfx('click');
  const el = e.target.closest('[data-act]');
  if (el && !el.disabled) act[el.dataset.act]?.(el.dataset, el, e);
});
document.addEventListener('error', (e) => {
  const t = e.target;
  if (t?.tagName === 'IMG' && t.dataset.fb && !t.dataset.done) { t.dataset.done = '1'; t.classList.add('bust'); t.src = t.dataset.fb; }
}, true);
document.addEventListener('change', (e) => {
  if (e.target.dataset?.stkg != null) { STK.g = e.target.value; stkRender?.(); return; }
  if (e.target.dataset?.stks != null) { STK.sort = e.target.value; stkRender?.(); return; }
  if (e.target.id === 'doormatIn') { S.doormat = e.target.value.trim() || 'Bienvenid@s'; persist(); syncWorld(); toast('Felpudo actualizado.'); }
});
$('#importFile').addEventListener('change', async (e) => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try {
    const s = JSON.parse(await f.text());
    if (s?.v !== 3 || !s.hero) throw new Error('formato');
    if (stored() && !(await askConfirm('Ya tienes una partida guardada: se sustituirá por la del archivo.', 'Cargar copia', true))) return;
    save(s); S = prepare(s); renderMenu(); toast('Copia cargada. Ya puedes continuar la partida.');
  } catch { toast('Ese archivo no es una copia válida de la partida.'); }
});
document.addEventListener('input', (e) => {
  if (e.target.dataset?.pref) {
    P[e.target.dataset.pref] = Number(e.target.value); savePrefs(); applyVolumes();
    const sm = e.target.closest('.mn-row')?.querySelector('small'); if (sm) sm.textContent = `${e.target.value}\u00a0%`;
    return;
  }
  if (e.target.dataset?.pcq != null) { const l = $('#pcList'); if (l) l.innerHTML = pcRows(e.target.value); return; }
  if (e.target.dataset?.stkq != null) { STK.q = e.target.value; stkRender?.(); return; }
  if (e.target.dataset?.notes != null) { S.notes = e.target.value; clearTimeout(window.__notesT); window.__notesT = setTimeout(persist, 400); return; }
  if (e.target.id === 'shopname') {
    S.shopName = e.target.value || 'Mi librería';
    persist();
    renderTop();
  }
});
$('#rotL').onclick = () => world.rotate(-1);
$('#rotR').onclick = () => world.rotate(1);
$('#zoomIn').onclick = () => world.zoom(1.25);
$('#zoomOut').onclick = () => world.zoom(0.8);
$('#recenter').onclick = () => world.recenter();
$('#sun').onclick = () => world.toggleNight();
$('#backshop').onclick = () => doorTap('shop');
addEventListener('keydown', (e) => {
  if (e.target.matches?.('input, textarea')) return;
  if (e.key === 'q' || e.key === 'ArrowLeft') world.rotate(-1);
  if (e.key === 'e' || e.key === 'ArrowRight') world.rotate(1);
  if (editing && selUid && (e.key === 'r' || e.key === 'R')) act.rotate();
});
new ResizeObserver(() => updateShift()).observe(barEl);

placeHero();
renderPanel();
const openBtn = $('#openShopBtn');
const vidBtn = document.createElement('button');
vidBtn.type = 'button'; vidBtn.id = 'videoBtn'; vidBtn.className = 'btn primary'; vidBtn.dataset.act = 'makeVideo'; vidBtn.hidden = true; vidBtn.textContent = '🎬 Hacer un vídeo';
document.body.append(vidBtn);
function updateOpenBtn() {
  if (!openBtn) return;
  const calm = S.hero && !busy && !editing && !introPending && menuEl.hidden && layer.hidden && phoneEl.hidden && dlg.hidden && !panelOpen && !samirIn && !talking && !document.body.classList.contains('intro');
  const evening = calm && S.phase === 'evening' && S.day > 0 && !!S.summary;
  const boxesHere = calm && world.view === 'store' && S.boxes.length > 1;
  openBtn.textContent = boxesHere ? `Abrir las ${S.boxes.length} cajas de golpe` : evening ? 'Cerrar tienda' : 'Abrir tienda'; openBtn.dataset.act = boxesHere ? 'openAllBoxes' : evening ? 'summary' : 'open';
  const show = boxesHere || evening || S.hero && S.phase === 'morning' && !busy && !editing && !introPending && menuEl.hidden && layer.hidden && phoneEl.hidden && dlg.hidden && !panelOpen && !samirIn && !talking && !document.body.classList.contains('intro') && !(S.day === 0 && S.served >= 1);
  openBtn.hidden = !show;
  vidBtn.hidden = !(calm && world.view === 'store' && canVideo(S));
}
setInterval(updateOpenBtn, 350);
let doorWas = false;
setInterval(() => { const o = S.phase === 'serving' || crowd.size > 0 || samirIn; world.setDoorsOpen(o); if (o && !doorWas) sfx('bell'); doorWas = o; }, 800);
setTimeout(maybeDelivery, 1500);
setInterval(maybeStory, 2500);
if (S.hero) applyHero();
window.Loading?.set(0.9);
showMenu();
window.Loading?.hide();
if (S.phase === 'serving') { S.phase = 'morning'; S.current = null; S.served = 0; persist(); }
window.__lib = { get S() { return S; }, askEdition, act, world, walkHeroTo, maybeDelivery, showLevelUps, renderPanel, syncWorld, openPhone, renderPhone, PH };
void T; void cellsOf; void ROT_Y;
