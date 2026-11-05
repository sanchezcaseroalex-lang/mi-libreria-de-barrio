// La historia de la librería: Don Anselmo te traspasa "La Tinta y el Té" y esconde un libro que nunca vendió.
// Cada capítulo es una meta; al cumplirla, Anselmo te deja una pista (y un regalo).
import { cozy } from './game.js';
import { addPts } from './pass.js';

export const CHAPTERS = [
  {
    title: 'Abre la persiana', goal: 'Vende 3 libros', target: 3, value: (s) => s.stats.sold, reward: 40,
    lines: ['¡Tres libros vendidos! Esto ya huele a librería de verdad.', 'Te lo prometí: la primera pista. «Un libro empieza en la portada, pero el mío empieza donde terminan todos: en la última página.»', 'Toma, 40 € de mi caja pequeña. Para el té.'],
    clue: 'Empieza donde terminan todos los libros: en la última página.',
  },
  {
    title: 'Una tienda con alma', goal: 'Llega a 4 de acogedor (decora la tienda)', target: 4, value: (s) => cozy(s), reward: 60,
    lines: ['Cuánto has cambiado esto… ya parece un salón donde dan ganas de quedarse.', 'Segunda pista: «No está en ningún estante, pero siempre ha estado muy cerca de uno.»', 'Te dejo 60 € para flores.'],
    clue: 'No está en ningún estante, pero siempre ha estado cerca de uno.',
  },
  {
    title: 'Caras conocidas', goal: 'Atiende a 5 vecinos distintos', target: 5, value: (s) => Object.keys(s.stats.regulars).length, reward: 75,
    lines: ['Ya te conoce el barrio. Hasta Pilar ha preguntado por ti.', 'Tercera pista: «Lo que escribí tiene letra de librero, no de escritor. Quien lo lea, lo reconocerá.»', '75 € de mi parte.'],
    clue: 'Tiene letra de librero, no de escritor.',
  },
  {
    title: 'Más lectores', goal: 'Llega al nivel 5', target: 5, value: (s) => s.level, reward: 90,
    lines: ['Nivel 5. Y ya tienes hasta cuenta en Plumas, qué cosas…', 'Cuarta pista: «El barrio habla. Si escuchas con atención, alguien mencionará el título sin saberlo.»', '90 €, que no se diga que no te cuido.'],
    clue: 'El barrio habla: alguien dirá el título sin saberlo.',
  },
  {
    title: 'Más sitio', goal: 'Amplía la tienda (Mejoras → Ampliar la tienda)', target: 1, value: (s) => s.expansions.length, reward: 150,
    lines: ['¡Has tirado un tabique! Mi difunto socio se estaría revolviendo… de gusto.', 'Quinta pista: «Lo escondí cuando la tienda era pequeña. Hace falta espacio para entenderlo.»', '150 € para la obra.'],
    clue: 'Lo escondí cuando la tienda era pequeña.',
  },
  {
    title: 'Una librería querida', goal: 'Llega a 40 seguidores', target: 40, value: (s) => s.followers, reward: 120,
    lines: ['Cuarenta seguidores… yo no sé qué es eso, pero suena a mucho cariño.', 'Sexta pista: «Tiene tinta, tiene té y mucha paciencia. Está muy cerca de quien se queda a leer.»', '120 € de la caja pequeña.'],
    clue: 'Tiene tinta, té y paciencia.',
  },
  {
    title: 'Buenos ahorros', goal: 'Reúne 600 € en la caja', target: 600, value: (s) => Math.floor(s.money), reward: 200,
    lines: ['Ahorros, ¿eh? Mi padre decía que la librería es el único negocio donde ahorrar significa regalar historias.', 'Séptima pista: «Lo que más vale se regala. Y ya casi sabes a quién.»', '200 € por la buena gestión.'],
    clue: 'Lo que más vale se regala.',
  },
  {
    title: 'El libro sin título', goal: 'Llega al nivel 10', target: 10, value: (s) => s.level, reward: 500, final: true,
    lines: [
      'Lo has conseguido. Nivel 10. Ven, siéntate un momento.',
      'Verás… el libro que escondí no está en ningún estante. Estaba en mis manos desde el primer día: es este cuaderno.',
      'Lo llamo «El libro sin título». Dentro apunté, año tras año, a todos los que cruzaron esa puerta: quiénes eran, qué leyeron, qué les cambió.',
      'Las últimas páginas están en blanco. Son tuyas. Las historias de la librería no acaban conmigo: las seguís escribiendo vosotros.',
      'Gracias por quedarte, {n}. {shop} es tuya… y del barrio. Ah, y la primera línea de tu página ya la he escrito yo: «{n} abrió la persiana».',
    ],
    clue: 'El libro sin título: un cuaderno con la memoria del barrio, y páginas en blanco para ti.',
  },
];

// Historias de temporada: una por mes. Cada capítulo es una meta y cierra con un diálogo del personaje de la temporada.
export const SEASON_STORIES = {
  lia: {
    who: 'lia', whoName: 'Lía', title: 'Luces, cámara, libros',
    chapters: [
      { title: 'Una cara nueva', goal: 'Atiende a Lía 2 veces', target: 2, value: (s) => s.stats?.visits?.lia ?? 0, reward: 60,
        lines: ['¡Hola otra vez! Perdona que te mire tanto: es que esta librería tiene un encanto…', 'Me llamo Lía y hago vídeos de libros en internet. Siempre busco sitios con alma.', 'Si sigue gustándome, igual os menciono. Toma, esto es de mi parte.'] },
      { title: 'Se corre la voz', goal: 'Llega a 120 seguidores', target: 120, value: (s) => s.followers, reward: 100,
        lines: ['¡Te he nombrado en mi canal y mis seguidores no paran de preguntar por ti!', 'Sé que has crecido mucho en las redes. Eso me hace pensar en algo más grande…', 'Pero antes, un detallito para la caja.'] },
      { title: 'La propuesta', goal: 'Llega al nivel 6', target: 6, value: (s) => s.level, reward: 150, studio: 'tripod',
        lines: ['Nivel 6, ¿eh? Pues ya estás lista para lo que te voy a proponer.', '¿Y si hacemos una colaboración? Un vídeo en tu librería, con tu historia, tus libros y tu gato.', 'Te dejo un trípode en el almacén: cuando cierres la tienda, grabas tus propios vídeos.', 'Y yo te enseño el truco: la luz lo es todo. ¡Ya verás!'] },
      { title: 'Tu propio canal', goal: 'Publica 3 vídeos desde el almacén', target: 3, value: (s) => s.stats?.videos ?? 0, reward: 300, final: true,
        lines: ['Tres vídeos y ya se nota que tienes ojo. ¡Mi comunidad te adora!', 'Hacer vídeos no va de números, va de contar por qué quieres a tu librería.', 'Gracias por dejarme ser parte de esto, {n}. Seguimos en contacto: siempre habrá un hueco para ti en mi canal.'] },
    ],
  },
};
export const seasonStory = (id) => SEASON_STORIES[id] ?? null;
export const seasonChapterIdx = (s, id) => (s.seasonStory?.[id]?.chapter ?? 0);
export const currentSeasonChapter = (s, id) => seasonStory(id)?.chapters[seasonChapterIdx(s, id)] ?? null;
export function completeSeasonChapter(s, id) {
  const st = seasonStory(id), c = currentSeasonChapter(s, id);
  if (!st || !c || c.value(s) < c.target) return null;
  s.seasonStory ??= {}; (s.seasonStory[id] ??= { chapter: 0 }).chapter++;
  if (c.studio) { s.studio ??= {}; s.studio[c.studio] = true; }   // este capítulo te deja el trípode
  addPts(s, 40);
  s.money = Math.round((s.money + c.reward) * 100) / 100;
  return { ...c, who: st.who, whoName: st.whoName, index: seasonChapterIdx(s, id) };
}

export const initStory = (s) => { s.story ??= { chapter: 0, clues: [] }; s.stats ??= { sold: 0, regulars: {} }; };
export const currentChapter = (s) => CHAPTERS[s.story.chapter] ?? null;
export const chapterProgress = (s) => { const c = currentChapter(s); return c ? { value: Math.min(c.target, c.value(s)), target: c.target } : null; };

// Si se ha cumplido la meta actual, devuelve el capítulo que se cierra (y lo avanza con su recompensa)
export function completeChapter(s) {
  const c = currentChapter(s);
  if (!c || c.value(s) < c.target) return null;
  s.story.chapter++;
  addPts(s, 40);
  s.story.clues.push(c.clue);
  s.money = Math.round((s.money + c.reward) * 100) / 100;
  return c;
}

export const ANSELMO_WELCOME = [
  ['Buenos días… ¿{n}? Pasa, pasa, no te quedes en la puerta.', 'neutra'],
  ['Llevo cuarenta años levantando esa persiana. Hoy, por fin, la levantas tú.', 'contenta'],
  ['Esta es {shop}. No es la librería más grande del barrio, pero sí la más querida: aquí cada libro espera a su lector.', 'neutra'],
  ['Ha llegado mi hora de retirarme y de dedicarme a pasear, leer sin prisa y cotillear un poco. Así que te traspaso el local. No me debes nada. Solo prométeme que recomendarás libros con el corazón.', 'neutra'],
  ['Una cosa más… Hace años escondí en esta librería un libro que nunca vendí. No te diré cuál ni dónde, pero cada vez que la tienda crezca, te dejaré una pista.', 'dudosa'],
  ['Rodeos Express te traerá los pedidos y se llevará tus envíos. Los vecinos irán pasando por aquí. Y yo vendré de vez en cuando… a cotillear.', 'contenta'],
  ['Abre la tienda cuando quieras. Ah, y el té de la trastienda es para ti.', 'contenta'],
];
