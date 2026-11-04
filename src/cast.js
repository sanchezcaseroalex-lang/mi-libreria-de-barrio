// Reparto de clientes habituales, su manera de hablar y el motor de conversación.
// Cada personaje tiene el mismo aspecto en 3D y en la guía de retratos (libreria/arte/guia-retratos.md).
import { BOOK, BOOKS, TAGS, GENRES } from './books.js';

const WHO = ['mi sobrina', 'mi madre', 'mi mejor amigo', 'mi pareja', 'un compañero de trabajo', 'mi abuelo', 'mi hermana pequeña', 'una vecina', 'mi jefa', 'mi primo'];
const TRIP = ['Me voy de viaje y necesito algo que me enganche.', 'Tengo un tren larguísimo por delante.', 'Son mis vacaciones y quiero devorar algo.', 'Me voy a la playa esta semana.'];
const MOOD = ['Llevo una semana horrible y necesito evadirme.', 'Hoy estoy de bajón. Quiero algo que me levante el ánimo.', 'Quiero desconectar del trabajo un rato.', 'Me apetece perderme en otro mundo.'];

const pick = (arr, r = Math.random) => arr[Math.floor(r() * arr.length)];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

/* ---------- Libros que los clientes mencionan como referencia ---------- */

// Libro del propio universo que se parece al objetivo (así nunca se nombran libros reales)
const refCache = {};
export function refTitle(id) {
  if (refCache[id]) return refCache[id];
  const b = BOOK[id];
  const score = (x) => x.tags.filter((t) => b.tags.includes(t)).length + (x.genre === b.genre ? 2 : 0);
  const cand = BOOKS.filter((x) => x.id !== id && !(x.saga && b.saga && x.saga.id === b.saga.id)).sort((p, q) => score(q) - score(p) || p.id.localeCompare(q.id));
  return (refCache[id] = (cand[0] ?? BOOKS.find((x) => x.id !== id)).title);
}

/* ---------- Reparto ---------- */

export const CAST = [
  {
    id: 'lucia', name: 'Lucía', age: 'adolescente', pref: { romantasia: 5, epica: 1, thriller: 0.3 },
    look: { skin: '#f1bf9c', hair: '#8b4a2f', brow: '#4a2a1c', eyes: '#4a2a1c', style: 'largo', earrings: true, lashes: true, outfit: 'shirt', shirt: '#efd6ae', coat: '#efd6ae', pants: '#3b4a6a', acc: 'nada', scale: 0.98 },
    voice: {
      intro: ['¡Hola!', '¡Holaa!', 'Ay, hola…', '¡Buenas!'],
      yes: ['¡Sí, justo!', '¡Eso, eso!', '¡Exacto!'], hmm: ['Mmm, no sé…', 'Pues…', 'Uy, a ver…'],
      like: ['Me obsesioné con', 'Lo leí del tirón:', 'Todavía lloro con'],
      thanks: ['¡Lo voy a devorar esta noche!', '¡Ay, qué ganas, gracias!', '¡Me encanta! Ya tengo planes para la noche.'],
      nope: ['Mmm… no era eso, la verdad.', 'Uy, no, ese no me da buen rollo.'],
    },
  },
  {
    id: 'anselmo', story: true, name: 'Don Anselmo', age: 'mayor', pref: { epica: 4, thriller: 2, romantasia: 0.3 },
    look: { skin: '#d4a07a', hair: '#cfcfd6', brow: '#b9b9c2', eyes: '#8a5a2a', style: 'canoso', beard: 'bigote', glasses: '#c9a24d', outfit: 'vest', vest: '#7a5a3a', shirt: '#efe3c8', coat: '#efe3c8', pants: '#5a4a3a', acc: 'libro', scale: 0.96 },
    voice: {
      intro: ['Buenos días.', 'Muy buenas.', 'Perdone, joven.', 'Vaya, qué sitio tan agradable.'],
      yes: ['Efectivamente.', 'Así es, así es.', 'Justamente.'], hmm: ['Hmm, veamos…', 'Quizá no tanto…', 'Bueno, lo cierto es que…'],
      like: ['En su día me apasionó', 'Releí varias veces', 'Recuerdo con cariño'],
      thanks: ['Excelente elección. Muchas gracias.', 'Ah, esto sí que es una buena recomendación.', 'Me lo llevo con mucho gusto.'],
      nope: ['Me temo que no es lo que buscaba.', 'Hmm, no, creo que no es para mí.'],
    },
  },
  {
    id: 'marta', name: 'Marta', age: 'adulta', pref: { thriller: 5, epica: 0.5, romantasia: 0.5 },
    look: { skin: '#cfa07a', hair: '#14110f', eyes: '#5a3a24', style: 'bob', lashes: true, outfit: 'trench', coat: '#cdb391', scarf: '#3a2c4a', pants: '#2a2a30', acc: 'cafe', scale: 1 },
    voice: {
      intro: ['Hola.', 'Buenas… vengo de guardia.', 'Hola, necesito evadirme.', 'Hola, ¿qué tal?'],
      yes: ['Eso.', 'Sí, más o menos.', 'Bingo.'], hmm: ['No sé, no…', 'Mmm, cansada para eso.', 'Pues no tanto.'],
      like: ['Me lo leí en dos noches:', 'Adiviné el final de', 'Me enganchó'],
      thanks: ['Perfecto, ya tengo plan para el turno de noche.', 'Gracias, ya veremos si adivino al culpable.', 'Me lo llevo. Y que no me espoilee nadie.'],
      nope: ['Ese ya me lo huelo, no.', 'No es lo que busco, gracias.'],
    },
  },
  {
    id: 'hugo', name: 'Hugo', age: 'joven', pref: { epica: 5, romantasia: 0.8, thriller: 0.3 },
    look: { skin: '#f2c9ae', hair: '#b8602e', beardColor: '#c0743a', brow: '#a0552a', eyes: '#5a3418', freckles: true, style: 'corto', beard: 'barba', hat: 'beanie', hatColor: '#566e3a', outfit: 'hoodie', coat: '#5c5a62', pants: '#2f3548', pattern: 'dados', acc: 'mochila', bag: '#d9822b', scale: 1.03 },
    voice: {
      intro: ['¡Ey!', '¡Buenas! Vengo con una misión.', '¡Hola! Mi grupo de rol me ha mandado.', 'Hola, hola.'],
      yes: ['¡Eso, eso!', '¡Tal cual!', '¡Siii!'], hmm: ['Mmm, no tanto…', 'Pues no, la verdad.', 'Hmm, eso no.'],
      like: ['Me flipó', 'Lo tengo subrayado entero:', 'Mi campaña de rol se inspira en'],
      thanks: ['¡Bien! Lo añado a la pila de pendientes (que ya es una torre).', '¡Genial! Esto lo comento en la partida del sábado.', '¡Épico! Me lo llevo.'],
      nope: ['Mmm, no, ese no cuadra con mi grupo.', 'No es lo que buscaba, ¡pero gracias!'],
    },
  },
  {
    id: 'carmen', name: 'Carmen', age: 'adulta', pref: { romantasia: 2, epica: 2, thriller: 2 },
    look: { skin: '#d9a07a', hair: '#4a3430', brow: '#4a3430', eyes: '#4a2a1c', style: 'bob', lashes: true, outfit: 'coat', coat: '#d98a98', pattern: 'lunares', scarf: '#efe0c8', pants: '#3a3a44', acc: 'tote', scale: 0.98 },
    voice: {
      intro: ['Hola, hija.', 'Buenas tardes, cariño.', 'Hola, mira, es para un regalo…', 'Ay, qué bonita tienda.'],
      yes: ['Sí, sí, eso.', 'Eso mismo, cielo.', 'Justo lo que pensaba.'], hmm: ['Ay, no sé…', 'A ver, que no me aclaro…', 'No lo tengo claro, cielo.'],
      like: ['A mi sobrina le encantó', 'Mi hijo no soltaba', 'Vi que gustó mucho'],
      thanks: ['Ay, qué bien, ¡a mi niña le va a encantar!', 'Perfecto, cielo, envuélvemelo bonito.', 'Gracias, hija, qué buen ojo tienes.'],
      nope: ['Ay, no sé, no creo que le guste.', 'Mmm, mejor otro, cariño.'],
    },
  },
  {
    id: 'nico', name: 'Nico', age: 'adolescente', pref: { epica: 2, thriller: 2, romantasia: 1 },
    look: { skin: '#7c4e34', hair: '#14110f', eyes: '#2a1a14', style: 'corto', hat: 'cap', hatColor: '#1b1b1b', capBack: true, outfit: 'hoodie', coat: '#3a3a40', pants: '#2a2a30', acc: 'nada', scale: 1 },
    voice: {
      intro: ['…hola.', 'Eh… hola.', 'Mm, hola. Es que mi profe…', 'Hola. Busco… algo.'],
      yes: ['Ajá.', 'Sí… eso.', 'Supongo.'], hmm: ['No sé…', 'Mmm… ni idea.', 'Puede.'],
      like: ['Una vez leí', 'Solo me gustó', 'Mi primo me dejó'],
      thanks: ['Vale… gracias, creo que mola.', 'Eh, pues… vale, me lo llevo.', 'Gracias. No sabía que leer podía no dar rollo.'],
      nope: ['Mmm, no sé, no.', 'Ese… no.'],
    },
  },
  {
    id: 'irene', name: 'Irene', age: 'adulta', pref: { romantasia: 3, epica: 3, thriller: 1 },
    look: { skin: '#c98a64', hair: '#2a1a14', eyes: '#4a2a1c', style: 'rizado', lashes: true, earrings: true, outfit: 'shirt', shirt: '#ecdcd8', coat: '#ecdcd8', pants: '#3a3a44', acc: 'cámara', scale: 1 },
    voice: {
      intro: ['¡Holaaa!', '¡Hola, hola! Uy, qué luz tan bonita para grabar.', '¡Buenas! Busco algo viral.', 'Hola, ¿tenéis algo que quede bien en cámara?'],
      yes: ['¡Eso! Qué fino tienes el ojo.', '¡Justo!', '¡Exacto, exacto!'], hmm: ['Mmm, no sé, no me encaja con mi línea…', 'Uy, no tanto.', 'Hmm, quizá no.'],
      like: ['Mi comunidad adoró', 'Hice un vídeo sobre', 'Está petando'],
      thanks: ['¡Perfecto, esto va directo a mi próximo vídeo!', '¡Me lo llevo! Te etiqueto, ¿vale?', '¡Qué portada! Va a quedar divino.'],
      nope: ['Mmm, no pega con mi estética.', 'Uy, no, ese no.'],
    },
  },
  {
    id: 'ruben', name: 'Rubén', age: 'adulto', pref: { thriller: 3, epica: 2, romantasia: 0.5 },
    look: { skin: '#d9a37c', hair: '#2a1b14', eyes: '#5a3a24', style: 'corto', beard: 'sombra', outfit: 'shirt', shirt: '#7a9fd0', coat: '#7a9fd0', tie: '#7a2a3a', rolled: true, pants: '#3a3f55', acc: 'cafe', scale: 1.02 },
    voice: {
      intro: ['Hola, perdona, voy con prisa.', 'Buenas… tengo diez minutos.', 'Hola, dime que tienes algo bueno rápido.', 'Hola. Café en mano, cerebro a medias.'],
      yes: ['Sí, eso, rápido.', 'Eso mismo.', 'Vale, vale, eso.'], hmm: ['Uf, no sé…', 'Mmm, eso no.', 'No tengo tiempo para dudar… no.'],
      like: ['Lo único que leí este año fue', 'Me acuerdo de', 'Me gustó'],
      thanks: ['Perfecto, gracias, ¡me has salvado!', 'Va, me lo llevo. Y me voy corriendo.', 'Gracias, ¡no sabes cuánto lo necesitaba!'],
      nope: ['No, ese no… lo siento.', 'Mmm, no me convence, perdona.'],
    },
  },
  {
    id: 'sofia', name: 'Sofía', age: 'joven', pref: { romantasia: 3, thriller: 3, epica: 1 },
    look: { skin: '#f0d0ba', hair: '#14110f', eyes: '#3a2a20', style: 'largo', lashes: true, outfit: 'coat', coat: '#2a2a33', scarf: '#7a2a3a', pants: '#2a2a30', acc: 'bolso', bag: '#6b4a2a', scale: 1 },
    voice: {
      intro: ['Buenas tardes.', 'Hola. Disculpa, ¿podrías ayudarme?', 'Hola… vengo buscando un cierto tipo de atmósfera.', 'Buenas. Estoy escribiendo un trabajo sobre narrativa.'],
      yes: ['Precisamente.', 'Sí, esa es la idea.', 'Justo eso.'], hmm: ['Hmm, no es del todo eso.', 'Quizá no, no sé…', 'Diría que no.'],
      like: ['Me marcó', 'Estudié', 'Sigo dándole vueltas a'],
      thanks: ['Una elección muy acertada. Gracias.', 'Perfecto. Hay algo de elegancia en esa recomendación.', 'Me lo llevo, gracias. Lo subrayaré entero.'],
      nope: ['Hmm, no, no es lo que busco.', 'No acaba de convencerme, lo siento.'],
    },
  },
  {
    id: 'pilar', name: 'Abuela Pilar', age: 'mayor', pref: { thriller: 5, epica: 0.5, romantasia: 0.3 },
    look: { skin: '#f0d0bc', hair: '#ececf0', style: 'moño', band: '#d9c7e8', glasses: '#e8a0b8', lashes: true, outfit: 'dress', coat: '#b9a0d8', scarf: '#a58ad0', pants: '#4a3a5a', acc: 'bastón', scale: 0.88 },
    voice: {
      intro: ['Hola, mi vida.', 'Buenas, guapa.', 'Ay, qué amables sois siempre.', 'Hola, hola. Vengo a por mi dosis de misterio.'],
      yes: ['¡Eso, eso!', 'Justo, justo.', 'Anda, cómo lo sabes.'], hmm: ['Ay, no, no…', 'Mmm, ese rollo no.', 'Eso ya lo adiviné antes de empezar.'],
      like: ['Me leí hace años', 'Vi la película y luego leí', 'Mi vecina me prestó'],
      thanks: ['Ay, qué ganas, ¡esta noche no duermo!', 'Gracias, hija, ¡a ver quién es el asesino!', 'Anda, qué bien, me lo llevo.'],
      nope: ['Ay, no, ese no, mi vida.', 'No me convence, cariño.'],
    },
  },
  {
    id: 'elena', name: 'Elena', age: 'adulta', pref: { romantasia: 3, epica: 3, thriller: 1.5 },
    look: { skin: '#d9a07a', hair: '#9a5a38', eyes: '#5a3a24', style: 'largo', lashes: true, outfit: 'shirt', shirt: '#f2e8d2', coat: '#f2e8d2', pants: '#c9b08a', acc: 'cámara', scale: 1 },
    voice: {
      intro: ['Buenas, qué rincón tan especial.', 'Hola. Me encanta la luz de esta tienda.', 'Hola, busco algo para la próxima reseña.', 'Buenas tardes, ¿qué tal?'],
      yes: ['Sí, justo eso.', 'Exacto, qué bien lo has captado.', 'Eso es.'], hmm: ['Hmm, no del todo…', 'Quizá no.', 'Más bien no.'],
      like: ['Reseñé hace poco', 'Me quedé pensando en', 'Mis lectores amaron'],
      thanks: ['Gracias, con esta portada voy a hacer unas fotos preciosas.', 'Qué acierto. Me lo llevo.', 'Perfecto. Este me lo voy a saborear.'],
      nope: ['Hmm, no encaja del todo.', 'No es lo que imaginaba, gracias igualmente.'],
    },
  },
  {
    id: 'teo', name: 'Teo', age: 'niño', pref: { epica: 5, romantasia: 0, thriller: 0 },
    look: { skin: '#7a4a30', hair: '#111111', eyes: '#2a1a14', style: 'rizado', outfit: 'shirt', shirt: '#c84a3a', coat: '#c84a3a', pattern: 'rayas', pants: '#3a4a6a', acc: 'peluche', kid: true, scale: 0.78, headScale: 1.2 },
    voice: {
      intro: ['¡Hola!', '¡Hola, hola, hola!', '¡Mi mamá dice que puedo elegir uno!', '¿Tenéis libros con dragones?'],
      yes: ['¡Sí, sí, sí!', '¡Eso!', '¡Ese!'], hmm: ['Mmm, no…', 'Eso no mola.', 'Nooo.'],
      like: ['¡Me encantó', 'Mi libro favorito es', 'Mi papá me lee'],
      thanks: ['¡Gracias! ¡Voy a enseñárselo a mi dragón de peluche!', '¡Bieeen! ¡Es el mejor!', '¡Siii, me lo llevo!'],
      nope: ['Nooo, ese no.', 'Mmm, ese no tiene dragones.'],
    },
  },
];
/* ---------- Samir, el repartidor: aparece cuando llegan los pedidos ---------- */

export const SAMIR = {
  id: 'samir', name: 'Rodeos Express',
  look: { skin: '#c99a70', hair: '#1a1a1a', eyes: '#3a2418', style: 'rizado', hat: 'cap', hatColor: '#3a7a7a', outfit: 'vest', vest: '#e0a93b', shirt: '#6a6a72', coat: '#6a6a72', pants: '#2f3548', acc: 'caja', scale: 1.02 },
};

// Lo que cuenta Samir al llegar con los pedidos; cambia cada día
export function deliveryLines(ctx) {
  const n = ctx.name || 'jefe';
  const greet = {
    sol: [`¡Buenos días, ${n}! Menudo solazo para repartir.`, `¡Hola, ${n}! Con este sol da gusto trabajar.`, `Buenas, ${n}. Qué día más bueno para llevar cajas.`],
    lluvia: [`¡Buenas, ${n}! Llego empapado, pero los libros vienen secos, te lo juro.`, `Hola, ${n}. Llueve a mares, ¡menos mal que el furgón es cubierto!`, 'Buenos días… ¡brrr! Qué manera de llover.'],
    nublado: [`Buenos días, ${n}. Día gris, de los de quedarse leyendo.`, `Hola, ${n}. Con este cielo nublado la gente querrá libros, ya verás.`],
  }[ctx.weather] ?? [`¡Buenos días, ${n}!`];
  const lines = [];
  lines.push(ctx.first ? `${pick(greet)} Soy el repartidor de Rodeos Express. ¡Encantado!` : pick(greet));
  const cajas = ctx.boxes === 1 ? 'una caja' : `${ctx.boxes} cajas`;
  let count;
  if (ctx.books === 1) count = pick(['Hoy solo te traigo un libro, en su cajita. Pequeña entrega, pero entrega.', 'Un solo libro hoy. Lo he traído en brazos, con cariño.']);
  else if (ctx.books <= 4) count = pick([`Hoy te traigo ${ctx.books} libros en ${cajas}.`, `Entrega ligera: ${ctx.books} libros en ${cajas}.`]);
  else if (ctx.books <= 9) count = pick([`Hoy vienen ${ctx.books} libros en ${cajas}. ¡Buen pedido!`, `Te dejo ${ctx.books} libros en ${cajas}; el furgón va bien cargado.`]);
  else count = pick([`¡Madre mía! ${ctx.books} libros en ${cajas}, me duelen hasta las pestañas.`, `Hoy el reparto es gordo: ${ctx.books} libros en ${cajas}. ¡Prepara estantes!`]);
  if (ctx.title && Math.random() < 0.6) count += ` Entre ellos viene «${ctx.title}».`;
  lines.push(count);
  const perf = {
    first: [`Cuando acabes el día te quedas con el albarán, que el IVA no se paga solo.`, 'Es el principio, pero se nota que la librería va a ir muy bien.'],
    up: ['Y por lo que oigo, la cosa va muy bien: ayer vendiste más que el día anterior. ¡Sigue así!', 'Parece que va viento en popa: las ventas de ayer subieron.', 'Se nota que vas a más; ayer te fue mejor que anteayer.'],
    down: ['Ojo, parece que ayer cayó un poco la cosa. Nada grave: un buen escaparate y a remontar.', 'Ayer vendiste algo menos que el día anterior… Hay días y días.', 'Hmm, parece que ha caído un poco. ¡Un par de novedades en la mesa y arreglado!'],
    flat: ['Ayer fue un día parecido al anterior: estable, que también está bien.', 'Todo tranquilo, ventas parecidas a las de ayer. Constancia, ${n}.'.replace('${n}', n)],
  }[ctx.perf] ?? [];
  if (perf.length) lines.push(pick(perf));
  lines.push(pick(['¡Hasta mañana, que me quedan seis entregas más!', 'Me voy, que la furgoneta no se carga sola. ¡Ánimo!', 'Mañana más, ¡a vender!', 'Os dejo, que el reloj no perdona. ¡Que vaya bien el día!']));
  return lines;
}

// Samir se lleva los paquetes de los pedidos online
export function parcelLines({ n, total, name, combined = false }) {
  const paq = n === 1 ? 'un paquete' : `${n} paquetes`;
  return [
    combined
      ? pick([`Y de paso me llevo ${paq} de los pedidos online que preparaste.`, `Por cierto, también tengo que recoger ${paq} de tus pedidos online.`, `Ah, y hoy además me llevo ${paq} de los pedidos online.`])
      : pick([`Vengo a por ${paq} de los pedidos online, ${name || 'jefe'}.`, `Hoy me llevo ${paq} de los que preparaste.`]),
    pick([`Todo bien empaquetado, da gusto. Los clientes lo van a recibir hoy mismo.`, 'Qué buen trabajo con las cajas: ni una esquina doblada.']),
    `Te dejo ${total} € del pago de los clientes.`,
  ];
}

const PREF_NEW = {
  lucia: { romance: 4, humor: 1.5, infantil: 0.8, scifi: 0.6, literaria: 0.6, viajes: 1.2 },
  anselmo: { historica: 4, literaria: 3, ensayo: 2.5, viajes: 1.6, negra: 2, scifi: 1.6, romance: 0.3, humor: 1, terror: 0.4, cocina: 0.8, infantil: 0.3 },
  marta: { negra: 4, terror: 2.5, scifi: 1, ensayo: 1, humor: 0.8, romance: 0.3, cocina: 0.5, infantil: 0.2 },
  hugo: { scifi: 4, terror: 1.8, humor: 2, infantil: 0.3, historica: 0.8, ensayo: 1, cocina: 0.4, viajes: 0.6 },
  carmen: { romance: 3, cocina: 3, historica: 2, viajes: 2, ensayo: 1.2, humor: 1.5, literaria: 1.5, infantil: 1.5 },
  nico: { terror: 3, humor: 2.5, scifi: 2, romance: 0.8, ensayo: 0.4, cocina: 0.3 },
  irene: { romance: 2.5, ensayo: 2.5, viajes: 2.5, humor: 1.5, cocina: 1.5, literaria: 1 },
  ruben: { ensayo: 3, negra: 2.5, scifi: 1.5, humor: 1.5, cocina: 0.8, romance: 0.4, infantil: 0.2 },
  sofia: { literaria: 4, historica: 2, romance: 2, ensayo: 2, terror: 1.5, viajes: 1.5, humor: 0.6 },
  pilar: { negra: 3, historica: 2.5, cocina: 2.5, viajes: 1, romance: 1, humor: 1, terror: 0.3, scifi: 0.2 },
  elena: { romance: 3, viajes: 3, cocina: 2, literaria: 2, ensayo: 2, humor: 1.2, historica: 1.5 },
  teo: { infantil: 6, humor: 1.5, scifi: 1, terror: 0, negra: 0, romance: 0, historica: 0.1, ensayo: 0, cocina: 0.2, viajes: 0.2, literaria: 0 },
};
CAST.forEach((c) => { Object.assign(c.pref, PREF_NEW[c.id] ?? {}); });

export const CAST_BY_ID = Object.fromEntries(CAST.map((c) => [c.id, c]));
export const CAST_LOOKS = CAST.map((c) => c.look);

/* ---------- Gente de relleno (sin conversación) ---------- */

const SKINS = ['#f6d9c0', '#f1c9a5', '#ecbf96', '#e0a97c', '#d29a6c', '#c98b5e', '#b57a50', '#a8693f', '#8f5636', '#7a4a2c', '#684026', '#f3d2bb'];
const HAIRS = ['#16110e', '#2a1b14', '#3b2417', '#5a3a22', '#7a4a28', '#a15f2a', '#b5651d', '#d8a657', '#e8d28a', '#8a8a8a', '#c9c9c9', '#b8442e', '#3a2a4a', '#2a3a5a', '#5a2a3a', '#2f5a4a'];
const COATS = ['#c8693f', '#e0a93b', '#5b8a8f', '#8a5a7a', '#6a8a4f', '#d9a5a0', '#4a6fa5', '#b0453a', '#e8d9b8', '#7a6aa6', '#3f6b66', '#a2453a', '#c9b08a', '#5a6a8a', '#d98f7a', '#7aa08a', '#c0a0d0', '#e8c26a', '#2f3a4a', '#8a6a4a'];
const PANTS = ['#35435a', '#4a3a2e', '#2a2a30', '#6a5a46', '#3a4a3a', '#5a4a6a', '#6a3a3a', '#8a7a5a', '#2f4a5a', '#7a6a5a'];
const SHOES = ['#4a2f24', '#2a2a30', '#8a4a2a', '#f0e4d0', '#3a4a5a', '#7a2a2a'];
const PATTERNS = ['liso', 'liso', 'liso', 'rayas', 'cuadros', 'lunares'];
const HAT_COLS = ['#4a7a4a', '#c8566b', '#3a5a8a', '#e0a93b', '#2a2a2a', '#8a5a3a', '#7a6aa6'];
const STYLES = ['corto', 'largo', 'moño', 'rizado', 'bob', 'canoso', 'trenza', 'corto', 'largo', 'bob'];

// huella visual de un aspecto: sirve para no repetir muñecos que estén a la vez en la tienda
export const lookSignature = (l) => [l.skin, l.hair, l.style, l.outfit, l.coat, l.hat ?? ''].join('|');
const close = (a, b) => a.skin === b.skin || a.hair === b.hair || a.coat === b.coat;

export function ambientLook(avoid = []) {
  const make = () => {
    const outfit = pick(['coat', 'hoodie', 'vest', 'dress', 'shirt', 'trench', 'shirt', 'hoodie']);
    const col = pick(COATS), second = pick(COATS);
    const l = {
      skin: pick(SKINS), hair: pick(HAIRS), style: pick(STYLES), outfit, coat: col, shirt: outfit === 'vest' || outfit === 'apron' ? '#efe3c8' : col, vest: second,
      pants: pick(PANTS), shoe: pick(SHOES), pattern: pick(PATTERNS), scarf: Math.random() < 0.2 ? pick(COATS) : undefined,
      glasses: Math.random() < 0.24 ? pick([true, '#c9a24d', '#a2453a', '#3f6b66']) : undefined,
      hat: Math.random() < 0.2 ? pick(['beanie', 'cap']) : undefined, hatColor: pick(HAT_COLS),
      beard: Math.random() < 0.14 ? pick(['barba', 'bigote', 'sombra']) : undefined,
      earrings: Math.random() < 0.2 ? true : undefined, freckles: Math.random() < 0.15,
      acc: pick(['nada', 'nada', 'bolso', 'tote', 'mochila', 'cafe', 'auriculares', 'libro', 'cámara']), bag: pick(['#7a4a3a', '#3a5a7a', '#c8693f', '#4a6a4a']),
      lashes: Math.random() < 0.5, scale: 0.86 + Math.random() * 0.24, headScale: 0.96 + Math.random() * 0.1, band: pick(['#c8566b', '#e0a93b', '#3f6b66', '#7a6aa6']),
    };
    if (l.beard && l.style === 'trenza') l.style = 'corto';
    if (l.hat) l.style = l.style === 'moño' ? 'corto' : l.style;
    return l;
  };
  let l = make();
  for (let i = 0; i < 40; i++) {
    if (!avoid.some((o) => close(l, o))) break;     // que no se parezca a nadie de los que hay dentro ni a un habitual
    l = make();
  }
  return l;
}

/* ---------- Peticiones que no se pueden atender ---------- */

export const UNKNOWN_TITLES = ['El jardín de los cuervos mansos', 'La casa de las mil lunas', 'Crónicas del faro olvidado', 'El último mapa de Valdermar', 'Cuentos del bosque ceniza', 'La torre que respiraba', 'Memorias de un dragón jubilado', 'El invierno de las campanas', 'Las hijas del río negro', 'El cartógrafo de sueños'];
export const UNKNOWN_GENRES = ['poesía', 'cómic', 'manga', 'libros de jardinería', 'teatro', 'libros de bricolaje', 'guías de senderismo', 'libros de astrología'];
export const isUnknown = (c) => c.type === 'unknownTitle' || c.type === 'unknownGenre';

/* ---------- Conversación ---------- */

const tagText = (ids) => {
  const t = ids.map((i) => TAGS[i]).filter(Boolean);
  return t.length > 1 ? `${t.slice(0, -1).join(', ')} y ${t[t.length - 1]}` : (t[0] ?? '');
};

export const PROBES = [
  { id: 'espacio', q: '¿Te apetece espacio, naves y planetas?', tags: ['espacio', 'futuro'] },
  { id: 'miedo', q: '¿Te gusta pasar un poco de miedo?', tags: ['miedo', 'fantasmas'] },
  { id: 'detective', q: '¿Con un detective y calles oscuras?', tags: ['detectives', 'crimen'] },
  { id: 'epoca', q: '¿Ambientado en otra época?', tags: ['epoca', 'historia'] },
  { id: 'risa', q: '¿Algo para reírte un rato?', tags: ['humor'] },
  { id: 'ternura', q: '¿Algo tierno, para leer con calma?', tags: ['ternura', 'emociones'] },
  { id: 'aprender', q: '¿Quieres aprender algo nuevo?', tags: ['reflexion', 'habitos', 'historia'] },
  { id: 'cocinar', q: '¿Es para ponerte el delantal?', tags: ['recetas'] },
  { id: 'viajar', q: '¿Para viajar, aunque sea desde el sofá?', tags: ['viajes', 'superacion'] },
  { id: 'verano', q: '¿Una historia de amor de hoy en día?', tags: ['verano', 'romance'] },
  { id: 'supervivir', q: '¿Alguien que tiene que sobrevivir a como dé lugar?', tags: ['supervivencia'] },
  { id: 'ligero', q: '¿Algo ligero y entretenido?', tags: ['aventura', 'academia', 'romance'] },
  { id: 'intenso', q: '¿Algo intenso que te deje pensando?', tags: ['oscuro', 'psico', 'crimen', 'politica'] },
  { id: 'dragones', q: '¿Te van los dragones?', tags: ['dragones'] },
  { id: 'hadas', q: '¿Con hadas y cortes feéricas?', tags: ['hadas', 'reinos'] },
  { id: 'secretos', q: '¿Con asesinos y secretos?', tags: ['asesinos', 'intriga'] },
  { id: 'medieval', q: '¿Algo medieval, con reinos y batallas?', tags: ['reinos', 'epica', 'politica'] },
  { id: 'magia', q: '¿Con magia, hadas o dragones?', tags: ['magia', 'hadas', 'dragones'] },
  { id: 'intriga', q: '¿Más bien intriga y misterio?', tags: ['intriga', 'crimen', 'psico', 'asesinos'] },
  { id: 'amor', q: '¿Con una historia de amor?', tags: ['romance', 'enemigos'] },
  { id: 'oscuro', q: '¿Te apetece un tono oscuro?', tags: ['oscuro'] },
  { id: 'aventura', q: '¿Aventuras, o una academia de magia?', tags: ['aventura', 'academia'] },
  { id: 'poder', q: '¿Juegos de poder y traiciones?', tags: ['politica', 'asesinos'] },
];

export const voiceOf = (c) => CAST_BY_ID[c.charId]?.voice ?? {
  intro: [''], yes: ['Sí.'], hmm: ['Mmm.'], like: ['Me gustó'], thanks: ['Gracias, me lo llevo.'], nope: ['No es lo que busco.'],
};

// Cómo pide cada tipo de libro quien lo busca por género
const GENRE_ASKS = {
  scifi: ['Quiero viajar a otro planeta sin salir del sofá.', 'Me apetece ciencia ficción de la buena, de las que hacen pensar.', '¿Qué tenéis de naves, futuros raros y cosas así?'],
  terror: ['Quiero pasar miedo, pero con la luz encendida.', '¿Tenéis algo de terror? Que no me deje dormir.', 'Busco una historia que me ponga los pelos de punta.'],
  negra: ['Busco novela negra, de las de gabardina y calles mojadas.', '¿Tenéis algo con un detective con pocas ganas de vivir?', 'Me apetece una historia de crímenes y ciudades sucias.'],
  romance: ['Quiero un romance de los que te dejan sonriendo a la nada.', 'Busco una historia de amor para el sofá y una manta.', '¿Tenéis algo que me derrita el corazón?'],
  historica: ['Me gustan las novelas históricas bien documentadas.', '¿Tenéis algo ambientado en otra época, con sus intrigas y todo?', 'Busco una historia que me transporte al pasado.'],
  literaria: ['Busco algo de literatura, de las que se subrayan.', 'Quiero una novela que merezca la pena releer.', '¿Tenéis algo bien escrito, con atmósfera?'],
  humor: ['Necesito reírme, ¿qué tenéis de humor?', 'Busco algo divertido que me saque carcajadas en el metro.', '¿Hay algo gracioso por aquí? Lo necesito.'],
  infantil: ['Busco un libro para un peque, de los que se leen por la noche.', '¿Qué tenéis infantil, con dibujos o con corazón?', 'Es para leer en voz alta, ¿qué me recomiendas?'],
  ensayo: ['Quiero algo para aprender y salir con la cabeza más ordenada.', 'Busco un ensayo que explique el mundo sin aburrir.', '¿Tenéis algo de autoayuda que no sea una chorrada?'],
  cocina: ['Busco un libro de cocina que me inspire.', '¿Tenéis algo de recetas? Pero que se lea como una historia.', 'Quiero cocinar algo rico este fin de semana, ¿qué libro me aconsejas?'],
  viajes: ['Me apetece un libro de viajes, de esos que dan ganas de hacer la maleta.', '¿Tenéis algo para soñar con países lejanos?', 'Busco un libro que me haga caminar con la mente.'],
};

export function openingLine(c) {
  const v = voiceOf(c), b = BOOK[c.target];
  const intro = pick(v.intro);
  const gen = GENRES[b.genre].label.toLowerCase();
  if (c.type === 'unknownTitle') return `${intro} ${pick([`¿Tenéis «${c.unknown}»?`, `Vengo buscando «${c.unknown}».`, `Me lo recomendó una amiga: «${c.unknown}». ¿Lo tenéis?`, `¿Os queda «${c.unknown}»?`])}`.trim();
  if (c.type === 'unknownGenre') return `${intro} ${pick([`Busco algo de ${c.unknown}.`, `¿Tenéis libros de ${c.unknown}?`, `¿Tenéis una sección de ${c.unknown}?`])}`.trim();
  if (c.type === 'title') {
    if (c.sequel) return `${intro} ${pick([`Acabo de terminar «${c.sequel}». ¿Tenéis la siguiente parte?`, `Me quedé con ganas después de «${c.sequel}». ¿Hay continuación?`, `¿Tenéis la continuación de «${c.sequel}»? No puedo esperar.`])}`.trim();
    return `${intro} ${pick([`¿Tenéis «${b.title}»?`, `Vengo buscando «${b.title}».`, `Me han hablado maravillas de «${b.title}».`, `Busco «${b.title}», de ${b.author}.`, `Un amigo no deja de hablarme de «${b.title}».`])}`.trim();
  }
  const info = c.type === 'tags' ? tagText(c.revealed) : '';
  const sc = c.scenario;
  let pre = '', clause, suf = '';
  if (sc === 'gift') {
    pre = `Busco un regalo para ${c.who}. `;
    clause = c.type === 'tags' ? `Le encantan los libros con ${info}.` : `Le gustan ${GENRES[b.genre].fic === false ? 'los libros' : 'las historias'} de ${gen}.`;
  } else if (sc === 'trip') {
    pre = `${pick(TRIP)} `;
    clause = c.type === 'tags' ? `Algo con ${info}.` : `Algo de ${gen}.`;
  } else if (sc === 'mood') {
    pre = `${pick(MOOD)} `;
    clause = c.type === 'tags' ? `Me iría bien algo con ${info}.` : `¿Qué tienes de ${gen}?`;
  } else if (sc === 'similar') {
    pre = `Me encantó «${c.simRef}». `;
    clause = pick(['¿Tenéis algo parecido?', '¿Qué me recomiendas que se le parezca?', 'Busco algo en esa línea.']);
  } else if (c.type === 'tags') clause = pick([`Busco algo con ${info}.`, `Hoy me apetece una historia con ${info}.`, `¿Qué tenéis con ${info}?`, `Quiero perderme en algo con ${info}.`]);
  else if (GENRE_ASKS[b.genre] && Math.random() < 0.55) clause = pick(GENRE_ASKS[b.genre]);
  else clause = pick([`Quiero algo de ${gen}.`, `Estoy en racha de ${gen}, ¿qué tienes?`, `Sorpréndeme con algo de ${gen}.`, `¿Qué es lo mejor que tenéis de ${gen}?`]);
  if (c.budget) suf = ` No quiero gastarme más de ${c.budget} €.`;
  return `${intro} ${pre}${clause}${suf}`.trim();
}

// Opciones de la persona que atiende (hasta 3 preguntas distintas; la conversación va acotando el libro).
// ctx.have(id): ¿hay ejemplares de ese libro en el almacén?  ctx.limit: máximo de preguntas.
export function playerOptions(c, ctx = {}) {
  c.talk ??= { asked: [] };
  const limit = ctx.limit ?? 3;
  if (isUnknown(c)) {
    return [
      { id: 'sorry', text: 'Lo siento, eso no lo tengo.' },
      ...(c.talk.asked.includes('alt') ? [] : [{ id: 'alt', text: 'Eso no lo tengo, pero puedo recomendarte algo parecido.' }]),
    ];
  }
  if (c.parcel) return [{ id: 'give', text: 'Aquí tienes tu pedido, bien empaquetado.' }];
  if (c.type === 'title') {
    if (ctx.have && !ctx.have(c.target)) {
      if (c.pickup) return [{ id: 'sorry', text: 'Lo siento… se me ha olvidado pedirlo.' }];
      return [
        { id: 'sorry', text: 'Ahora mismo no me queda, lo siento.' },
        { id: 'alt', text: 'No me queda ese, pero tengo algo parecido.' },
        ...(c.talk.asked.includes('order') ? [] : [{ id: 'order', text: 'No me queda ahora, pero puedo pedírtelo y mañana lo tienes.' }]),
      ];
    }
    return [{ id: 'go', text: c.pickup ? '¡Claro, aquí lo tengo! Te lo traigo.' : '¡Claro! Ahora te lo traigo.' }];
  }
  const book = BOOK[c.target];
  if (!c.talk.menu) {
    const hit = shuffle(PROBES.filter((p) => p.tags.some((t) => book.tags.includes(t))))[0];
    const miss = shuffle(PROBES.filter((p) => !p.tags.some((t) => book.tags.includes(t))))[0];
    c.talk.menu = shuffle([
      { id: 'open', text: '¿Qué estás pensando exactamente?' },
      { id: 'ref', text: '¿Qué has leído últimamente que te haya gustado?' },
      c.who && { id: 'who', text: '¿Qué le suele gustar a esa persona?' },
      c.budget && { id: 'budget', text: '¿Tienes un presupuesto en mente?' },
      hit && { id: hit.id, text: hit.q },
      miss && { id: miss.id, text: miss.q },
    ].filter(Boolean));
  }
  const asked = c.talk.asked.filter((x) => x !== 'alt').length;
  const out = asked >= limit ? [] : c.talk.menu.filter((o) => !c.talk.asked.includes(o.id)).slice(0, 3);
  if (asked >= 1 || c.type === 'tags') out.push({ id: 'go', text: 'Creo que ya sé qué te vendría bien. Voy a buscarlo.' });
  return out;
}

export function answer(c, optId) {
  c.talk ??= { asked: [] };
  c.talk.asked.push(optId);
  const v = voiceOf(c), b = BOOK[c.target];
  c.revealed ??= [];
  const reveal = (ids) => { ids.forEach((i) => { if (!c.revealed.includes(i)) c.revealed.push(i); }); };
  if (optId === 'sorry') return sorryLine(c);
  if (optId === 'alt') {
    // el cliente se deja aconsejar: pasa a ser una petición de género con el libro oculto de siempre
    c.type = 'genre'; c.unknown = null; c.talk.mood = 'neutra';
    return `${pick(v.hmm)} Bueno… ¿qué tienes de ${GENRES[b.genre].label.toLowerCase()}, entonces?`;
  }
  if (optId === 'ref') {
    c.refSaid = refTitle(c.target); c.talk.mood = 'contenta';
    return `${pick(v.like)} «${refTitle(c.target)}».`;
  }
  if (optId === 'open') {
    const ids = b.tags.slice().sort(() => Math.random() - 0.5).slice(0, 2);
    reveal(ids); c.talk.mood = 'neutra';
    return `${pick(v.hmm)} Pues algo con ${tagText(ids)}.`;
  }
  if (optId === 'who') {
    const ids = b.tags.slice().sort(() => Math.random() - 0.5).slice(0, 2);
    reveal(ids); c.talk.mood = 'contenta';
    return `${pick(v.yes)} Le encantan las historias con ${tagText(ids)}.`;
  }
  if (optId === 'budget') { c.talk.mood = 'neutra'; return `${pick(v.hmm)} No más de ${c.budget} €, si puede ser.`; }
  const probe = PROBES.find((p) => p.id === optId);
  const hits = b.tags.filter((t) => probe.tags.includes(t));
  if (hits.length) { reveal(hits.slice(0, 2)); c.talk.mood = 'contenta'; return `${pick(v.yes)} Con ${tagText(hits.slice(0, 2))}.`; }
  const other = b.tags.filter((t) => !c.revealed.includes(t)).slice(0, 2);
  reveal(other); c.talk.mood = 'dudosa';
  return `${pick(v.hmm)} Más bien algo con ${tagText(other.length ? other : b.tags.slice(0, 2))}.`;
}

export const sorryLine = (c) => pick(['Vaya, qué pena. Gracias igualmente.', 'Ay, qué lástima. Otro día será.', 'No pasa nada, gracias por decírmelo.']);
export const thanksLine = (c) => pick(voiceOf(c).thanks);
export const nopeLine = (c) => pick(voiceOf(c).nope);

export function newCustomer(char, target, type) {
  const b = BOOK[target];
  const c = {
    charId: char.id, name: char.name, person: char.look, type, target, genre: b.genre, tries: 2, talk: { asked: [] },
    revealed: type === 'tags' ? b.tags.slice().sort(() => Math.random() - 0.5).slice(0, 2) : [], bookId: target, tags: [],
  };
  if (type === 'title') {
    if (b.saga && b.saga.n > 1 && Math.random() < 0.6) c.sequel = BOOKS.find((x) => x.saga?.id === b.saga.id && x.saga.n === b.saga.n - 1)?.title;
  } else if (Math.random() < 0.72) {
    c.scenario = pick(char.age === 'niño' ? ['similar', 'similar', 'trip'] : ['gift', 'trip', 'similar', 'budget', 'mood', 'gift']);
    if (c.scenario === 'gift') c.who = pick(WHO);
    if (c.scenario === 'similar') { c.simRef = refTitle(target); c.refSaid = refTitle(target); if (!c.revealed.length) c.revealed = [b.tags[0]]; }
    if (c.scenario === 'budget') { c.budget = b.price + Math.floor(Math.random() * 4); c.scenario = null; }
  }
  c.line = openingLine(c);
  return c;
}

export const ENCARGO_YES = ['¡Perfecto! Mañana paso a recogerlo.', 'Genial, vengo mañana a por él. ¡Gracias!', 'Sí, sí, encárgamelo. Mañana me tienes aquí.', 'Pues claro, me parece una idea estupenda. Hasta mañana.'];
export const ENCARGO_NO = ['Uf, lo necesitaba hoy… Gracias igualmente.', 'No, mejor lo busco en otro sitio. ¡Gracias!', 'Mmm, no puedo esperar. Otro día será.'];

// Cliente que vuelve a recoger un libro encargado
export function pickupCustomer(e) {
  const b = BOOK[e.bookId];
  const v = CAST_BY_ID[e.charId]?.voice ?? { intro: [''] };
  const c = {
    charId: e.charId, name: e.name, person: e.person, type: 'title', target: e.bookId, bookId: e.bookId, genre: b.genre, tries: 2, talk: { asked: [] },
    revealed: [], tags: [], pickup: 'encargo', encargoUid: e.uid,
  };
  c.line = `${pick(v.intro)} ${pick([`Vengo a recoger el libro que encargué: «${b.title}».`, `Me habías reservado «${b.title}». ¿Ya ha llegado?`, `Pasaba a por «${b.title}», el que me encargaste ayer.`])}`.trim();
  return c;
}
export function parcelCustomer(o) {
  const names = o.items.map((id) => `«${BOOK[id].title}»`);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}` : names[0];
  const look = o.person ?? ambientLook([]);
  return {
    charId: null, name: o.who, person: look, type: 'parcel', target: null, genre: null, tries: 2, talk: { asked: [] }, revealed: [], tags: [], parcel: o.id,
    line: pick([`Hola, vengo a recoger el pedido que hice por internet: ${list}.`, `Buenas. Me dijeron que mi pedido online estaría listo hoy: ${list}.`, `¡Hola! Hice un pedido en la web ayer: ${list}. ¿Está listo?`]),
  };
}

export function newUnfillable(char, target) {
  const c = newCustomer(char, target, 'title');
  if (Math.random() < 0.55) { c.type = 'unknownTitle'; c.unknown = pick(UNKNOWN_TITLES); }
  else { c.type = 'unknownGenre'; c.unknown = pick(UNKNOWN_GENRES); }
  c.revealed = [];
  c.line = openingLine(c);
  return c;
}

export function pickChar(bag) {
  if (!bag.length) bag.push(...shuffle(CAST.filter((x) => !x.story)));
  return bag.pop();
}
export const bookWeights = (char, avail, trendIds) => {
  const out = [];
  for (const b of avail) {
    const w = (char.pref[b.genre] ?? 1) * (trendIds.has(b.id) ? 3 : 1);
    for (let i = 0; i < Math.max(1, Math.round(w * 2)); i++) out.push(b);
  }
  return out;
};
void BOOKS;

/* ---------- Protagonistas para elegir (cada uno tendrá su ilustración: protagonista1…protagonista8) ---------- */

const apr = (o) => ({ outfit: 'apron', acc: 'nada', ...o });
export const HERO_BASES = [
  { id: 'protagonista1', name: 'Ana', label: 'Joven · pelo largo', look: apr({ skin: '#f1c09c', hair: '#6a3a24', style: 'largo', apron: '#f3e7c9', coat: '#4d8f86', shirt: '#4d8f86', pants: '#35435a', lashes: true, earrings: true, eyes: '#4a2a1c' }) },
  { id: 'protagonista2', name: 'Mara', label: 'Joven · pelirroja con gafas', look: apr({ skin: '#f6d9c0', hair: '#b8442e', style: 'bob', glasses: true, freckles: true, apron: '#e0a93b', coat: '#7aa08a', shirt: '#7aa08a', pants: '#4a3a2e', lashes: true }) },
  { id: 'protagonista3', name: 'Nia', label: 'Joven · rizos', look: apr({ skin: '#7a4a2c', hair: '#16110e', style: 'rizado', earrings: true, apron: '#dbe8f0', coat: '#3f6b8a', shirt: '#3f6b8a', pants: '#2a2a30', lashes: true }) },
  { id: 'protagonista4', name: 'Pilar', label: 'Mayor · moño canoso', look: apr({ skin: '#f0d6c4', hair: '#d8d8dc', style: 'moño', glasses: '#e8a0b8', band: '#d9c7e8', apron: '#efe3f4', coat: '#a28ac8', shirt: '#a28ac8', pants: '#4a3a5a', lashes: true, scale: 0.94 }) },
  { id: 'protagonista5', name: 'Álex', label: 'Joven · barba corta', look: apr({ skin: '#e0a97c', hair: '#4a2f20', style: 'corto', beard: 'sombra', apron: '#d9b88a', coat: '#8a5a3a', shirt: '#8a5a3a', pants: '#2f3548' }) },
  { id: 'protagonista6', name: 'Leo', label: 'Joven · rubio con gafas', look: apr({ skin: '#f2cfb2', hair: '#d8a657', style: 'corto', glasses: '#2b2b2b', apron: '#f3e7c9', coat: '#6a8a4f', shirt: '#6a8a4f', pants: '#35435a' }) },
  { id: 'protagonista7', name: 'Ernesto', label: 'Mayor · calvo con barba', look: apr({ skin: '#d4a07a', hair: '#f0f0f2', style: 'calvo', beard: 'barba', apron: '#f3e7c9', coat: '#3f6b4f', shirt: '#3f6b4f', pants: '#5a4a3a', scale: 0.96 }) },
  { id: 'protagonista8', name: 'Kofi', label: 'Joven · rizos cortos', look: apr({ skin: '#6a4228', hair: '#16110e', style: 'rizado', apron: '#e8e0d0', coat: '#2f3a5a', shirt: '#2f3a5a', pants: '#3a3a44' }) },
];
export const HERO_BY_ID = Object.fromEntries(HERO_BASES.map((h) => [h.id, h]));
