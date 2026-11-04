// Rodeos Express: la empresa de mensajería del juego. Un solo dibujo para la furgoneta, la etiqueta y los iconos.
const Y = '#ffd21f', N = '#0b2a6b';

// Corneta de correos (símbolo postal genérico) dibujada con trazos propios
function horn(g, cx, cy, r) {
  g.save(); g.translate(cx, cy); g.scale(r / 40, r / 40);
  g.strokeStyle = N; g.fillStyle = N; g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = 7; g.beginPath(); g.arc(0, 0, 24, 0, Math.PI * 2); g.stroke();                 // aro exterior
  g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 13, 0.3, Math.PI * 2 - 0.3); g.stroke();          // espiral
  g.beginPath(); g.moveTo(24, -2); g.lineTo(40, -6); g.lineTo(58, -22); g.lineTo(58, 22); g.lineTo(40, 6); g.lineTo(24, 2); g.closePath(); g.fill();   // pabellón
  g.fillStyle = Y; g.beginPath(); g.ellipse(58, 0, 3.2, 17, 0, 0, Math.PI * 2); g.fill();      // boca
  g.fillStyle = N; g.beginPath(); g.arc(-26, -3, 6.5, 0, Math.PI * 2); g.fill();                // boquilla
  g.restore();
}

// Dibuja el logotipo en el lienzo g de tamaño w×h. icon = solo la corneta (para iconos cuadrados).
export function drawRodeosLogo(g, w, h, { icon = false, transparent = false } = {}) {
  if (!transparent) { g.fillStyle = Y; g.fillRect(0, 0, w, h); }
  if (icon) { horn(g, w * .38, h / 2, Math.min(w, h) * .3); return; }
  horn(g, h * .46, h * .5, h * .31);
  const x0 = h * 1.12, avail = w - x0 - h * .1;
  g.fillStyle = N; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  let fs = h * .42;
  g.font = `800 ${fs}px Nunito, Arial, sans-serif`;
  while (g.measureText('Rodeos').width > avail && fs > 8) { fs -= 1; g.font = `800 ${fs}px Nunito, Arial, sans-serif`; }
  g.fillText('Rodeos', x0, h * .56);
  g.font = `800 ${fs * .42}px Nunito, Arial, sans-serif`;
  const word = 'EXPRESS'; let x = x0 + fs * .04; const gap = Math.max(1, (g.measureText('Rodeos').width * 0 + avail * 0) + fs * .2);
  const tw = [...word].reduce((t, c) => t + g.measureText(c).width + gap, -gap);
  const k = Math.min(1, (avail - 4) / tw);
  for (const c of word) { g.fillText(c, x, h * .78); x += (g.measureText(c).width + gap) * k; }
  g.strokeStyle = N; g.lineWidth = Math.max(2, h * .03); g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0, h * .85); g.quadraticCurveTo(x0 + avail * .5, h * .92, x0 + avail, h * .82); g.stroke();
}

export function rodeosCanvas(w, h, opt) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  drawRodeosLogo(c.getContext('2d'), w, h, opt);
  return c;
}
let cache = {};
export const rodeosDataURL = (w = 256, h = 96, opt = {}) => (cache[`${w}x${h}${opt.icon ? 'i' : ''}`] ??= rodeosCanvas(w, h, opt).toDataURL('image/png'));
