// Sonido: efectos sintetizados con Web Audio (sin archivos) y música desde archivos libres de derechos.
let ctx = null, master = null, sfxBus = null;
const vol = { music: 0.7, sfx: 0.8 };
let musicOn = false;

const NOTE = (n) => 440 * 2 ** ((n - 69) / 12);

export function initAudio() {
  if (ctx) { if (ctx.state !== 'running') ctx.resume?.(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.gain.value = vol.sfx;
  sfxBus.connect(master);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { pauseMusic(); ctx?.suspend(); } else { resumeMusic(); ctx?.resume(); } });
}

// iPhone/iPad: el sonido solo se desbloquea dentro de un toque COMPLETO (touchend/click, no pointerdown) y el interruptor de silencio
// apaga el audio web; 'playback' le dice a iOS que esto es contenido que debe sonar aunque esté en silencio.
let unlocked = false;
export function unlockAudio() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* no disponible */ }
  initAudio();
  if (!ctx) return;
  if (ctx.state !== 'running') ctx.resume?.();
  if (!unlocked) {
    try { const s = ctx.createBufferSource(); s.buffer = ctx.createBuffer(1, 1, 22050); s.connect(ctx.destination); s.start(0); unlocked = true; } catch { /* nada */ }
  }
}

export function setVolumes(m, s) {
  vol.music = m / 100; vol.sfx = s / 100;
  apply(cur); apply(nxt);
  if (!ctx) return;
  sfxBus.gain.setTargetAtTime(vol.sfx, ctx.currentTime, 0.05);
}

// nota con envolvente: tipo de onda, frecuencia, inicio, duración, volumen, destino
function tone(type, f, t, dur, v, dest = sfxBus, attack = 0.008) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest);
  o.start(t); o.stop(t + dur + 0.05);
  return { o, g };
}
function noise(t, dur, v, freq = 2000, q = 0.8, type = 'bandpass') {
  const len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = ctx.createBufferSource(); s.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); g.gain.value = v;
  s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t);
}

const FX = {
  click: (t) => { tone('triangle', 520, t, 0.05, 0.022); tone('sine', 780, t + 0.01, 0.04, 0.012); },
  pop: (t) => { const { o } = tone('sine', 380, t, 0.12, 0.22); o.frequency.exponentialRampToValueAtTime(760, t + 0.09); },
  coin: (t) => { tone('square', NOTE(83), t, 0.09, 0.07); tone('square', NOTE(88), t + 0.08, 0.28, 0.07); tone('sine', NOTE(95), t + 0.08, 0.3, 0.06); },
  bell: (t) => { [0, 7].forEach((k, i) => { tone('sine', NOTE(88 + k), t + i * 0.01, 1.1, 0.12); tone('sine', NOTE(100 + k), t, 0.5, 0.04); }); },
  error: (t) => { tone('sawtooth', 190, t, 0.2, 0.09); tone('sawtooth', 150, t + 0.12, 0.26, 0.09); },
  win: (t) => { [72, 76, 79, 84].forEach((n, i) => tone('triangle', NOTE(n), t + i * 0.11, 0.5, 0.14)); tone('sine', NOTE(91), t + 0.45, 0.9, 0.08); },
  levelup: (t) => { [67, 72, 76, 79, 84, 88].forEach((n, i) => { tone('triangle', NOTE(n), t + i * 0.09, 0.55, 0.13); tone('sine', NOTE(n + 12), t + i * 0.09, 0.4, 0.04); }); },
  book: (t) => { noise(t, 0.12, 0.5, 260, 0.7, 'lowpass'); tone('sine', 120, t, 0.14, 0.25); },
  page: (t) => { noise(t, 0.22, 0.35, 5200, 0.5, 'highpass'); },
  place: (t) => { tone('sine', 300, t, 0.09, 0.2); noise(t, 0.05, 0.25, 900, 1); },
  whoosh: (t) => { noise(t, 0.4, 0.25, 800, 0.6, 'bandpass'); },
};

export function sfx(name) {
  if (!ctx || vol.sfx <= 0 || ctx.state !== 'running') return;
  try { FX[name]?.(ctx.currentTime + 0.005); } catch { /* sin sonido */ }
}

// susurro de diálogo (estilo Animal Crossing): una sílaba breve con tono según quien habla
export function blip(seed = 0) {
  if (!ctx || vol.sfx <= 0) return;
  if (ctx.state !== 'running') { ctx.resume?.(); return; }
  const base = 330 + (seed % 7) * 42, f = base * (0.92 + Math.random() * 0.3), t = ctx.currentTime + 0.001;
  tone('triangle', f, t, 0.11, 0.42, sfxBus, 0.004);
  tone('sine', f * 2, t, 0.08, 0.16, sfxBus, 0.004);
}

/* ---------- Música: archivos libres de derechos en audio/musica/ (lista.json la genera herramientas/actualizar-musica.ps1) ----------
   Las canciones se mezclan y cada una se funde con la siguiente (fundido cruzado), así no se nota dónde acaba ni empieza
   y, aunque solo haya una, se repite fundiéndose consigo misma. */
let tracks = null, loading = false, idx = 0, cur = null, nxt = null, timer = 0;
const FADE = 4;                       // segundos de fundido
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const base = () => Math.min(1, vol.music * 0.85);
const apply = (a) => { if (a) a.volume = Math.max(0, Math.min(1, base() * (a._g ?? 1))); };

async function loadTracks() {
  loading = true;
  try { const r = await fetch('audio/musica/lista.json', { cache: 'no-store' }); tracks = shuffle((await r.json()).filter(Boolean)); } catch { tracks = []; }
  loading = false;
}
function nextSrc() {
  let t = tracks[idx++ % tracks.length];
  if (tracks.length > 1 && cur && cur._name === t) t = tracks[idx++ % tracks.length];
  return t;
}
function make(name) {
  const a = Object.assign(new Audio(), { preload: 'auto' });
  a._name = name; a._g = 0; a.src = 'audio/musica/' + encodeURIComponent(name);
  a.onerror = () => { if (a === cur || a === nxt) setTimeout(() => { if (a === cur) { cur = null; begin(); } if (a === nxt) nxt = null; }, 1500); };
  return a;
}
function begin() {
  if (!tracks?.length || !musicOn || cur) return;
  cur = make(nextSrc()); cur._g = 0; cur._fade = 1;           // entra con fundido
  apply(cur); cur.play().catch(() => { /* hasta que el usuario toque la pantalla */ });
}
function tick() {
  const step = 0.1 / FADE;
  for (const a of [cur, nxt]) {
    if (!a) continue;
    if (a._fade && !a.paused) { a._g = Math.max(0, Math.min(1, a._g + a._fade * step)); if (a._g >= 1 || a._g <= 0) a._fade = 0; }
    apply(a);
  }
  if (!cur) return;
  const left = cur.duration - cur.currentTime;
  const fade = Math.min(FADE, (cur.duration || 0) / 3);
  if (!nxt && cur.duration > 0 && left <= fade + 0.1 && tracks?.length) {
    nxt = make(nextSrc()); nxt._g = 0; nxt._fade = 1; cur._fade = -1; apply(nxt);
    nxt.play().catch(() => {});
  }
  if (cur && (cur.ended || (cur.duration > 0 && left <= 0.05) || (cur._g <= 0 && nxt))) {
    cur.pause(); cur.src = ''; cur = nxt; nxt = null;
    if (!cur) begin();
  }
}
export async function startMusic() {
  musicOn = true;
  if (cur) { if (cur.paused) cur.play().catch(() => {}); if (nxt?.paused) nxt.play().catch(() => {}); return; }
  if (loading) return;
  if (tracks == null) await loadTracks();
  begin();
  if (!timer) timer = setInterval(tick, 100);
}
export const isMusicPlaying = () => !!cur && !cur.paused && cur.currentTime > 0.05;
export function stopMusic() { musicOn = false; clearInterval(timer); timer = 0; [cur, nxt].forEach((a) => a?.pause()); }
function pauseMusic() { [cur, nxt].forEach((a) => a?.pause()); }
function resumeMusic() { if (musicOn) [cur, nxt].forEach((a) => a?.play().catch(() => {})); }
if (typeof window !== 'undefined') window.__music = () => ({ cur: cur && [cur._name, +cur.currentTime.toFixed(1), +cur.duration.toFixed(1), +(cur._g ?? 0).toFixed(2), cur.paused], nxt: nxt && [nxt._name, +nxt.currentTime.toFixed(1), +(nxt._g ?? 0).toFixed(2)], tracks });
