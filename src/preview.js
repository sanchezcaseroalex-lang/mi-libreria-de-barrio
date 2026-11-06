import { roomHTML } from './room.js';
import { personSprite } from './sprites.js';
import { randomPerson } from './art.js';
import { newGame, placeFurniture, buyFurniture, autoPlace } from './game.js';
import { T, WALL_H } from './layout.js';

const idx = await fetch('./index.html').then((r) => r.text());
document.body.insertAdjacentHTML('afterbegin', idx.match(/<svg width="0"[\s\S]*?<\/svg>/)[0]);

const s = newGame();
s.level = 9; s.money = 5000; s.owned.lights = true;
for (const [type, x, y] of [['shelf', 3, 0], ['shelf', 5, 0], ['table', 2, 4], ['plant', 0, 0], ['cat', 9, 6], ['rug', 1, 5], ['armchair', 0, 2], ['lamp', 0, 3], ['side', 0, 4], ['sofa', 7, 5], ['coffee', 9, 3], ['plant', 9, 0]]) {
  if (type === 'shelf' && s.furniture.filter((f) => f.type === 'shelf').length >= 3) continue;
  buyFurniture(s, type);
  const f = s.furniture.filter((q) => q.type === type && q.x == null)[0];
  if (f) placeFurniture(s, f.uid, x, y);
}
for (const id of ['alas', 'sellos', 'cicatriz', 'desaparecida']) s.storage[id] = 3;
autoPlace(s);
const t = new URLSearchParams(location.search).get('t');
const view = { furniture: s.furniture, owned: s.owned, trend: ['alas'], t: Number(t ?? 0.3), rain: false, level: s.level };
document.getElementById('app').innerHTML = `<div style="width:360px;margin:0 auto">${roomHTML(view)}</div>`;
const people = document.getElementById('people');
[[4, 5, 'down'], [6, 4, 'up'], [2, 6, 'left'], [8, 7, 'right']].forEach(([c, r, d], i) => {
  const el = document.createElement('div');
  el.className = 'ent';
  el.style.cssText = `left:${c * T + 4}px;top:${WALL_H + r * T + T - 52}px;width:28px;height:54px;z-index:${10 + (r + 1) * 10}`;
  el.innerHTML = personSprite(randomPerson(), d);
  document.getElementById('ents').append(el);
});
