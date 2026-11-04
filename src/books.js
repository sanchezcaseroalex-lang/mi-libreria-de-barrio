// Catálogo: 20 libros "de homenaje". Se reconocen por el color, el motivo y el estilo de la portada,
// pero ningún título ni autor es real. Todo es editable.

// Cada género pertenece a una sección de la estantería (3 baldas por mueble)
export const SECTIONS = [
  { id: 'novela', label: 'Romance y novela', short: 'Romance y novela', color: '#c8566b' },
  { id: 'aventura', label: 'Aventura y futuro', short: 'Aventura y futuro', color: '#5b8a5f' },
  { id: 'misterio', label: 'Misterio y no ficción', short: 'Misterio y no ficción', color: '#4f6fa0' },
];
export const GENRES = {
  romantasia: { label: 'Romantasy', short: 'Romantasy', color: '#c8566b', sec: 'novela' },
  romance: { label: 'Romance', short: 'Romance', color: '#e08a9a', sec: 'novela' },
  historica: { label: 'Novela histórica', short: 'Histórica', color: '#a5753b', sec: 'novela' },
  literaria: { label: 'Literatura', short: 'Literatura', color: '#7a6a8a', sec: 'novela' },
  humor: { label: 'Humor', short: 'Humor', color: '#e0a93b', sec: 'novela' },
  epica: { label: 'Fantasía épica', short: 'Épica', color: '#5b8a5f', sec: 'aventura' },
  scifi: { label: 'Ciencia ficción', short: 'Ciencia ficción', color: '#3f8aa5', sec: 'aventura' },
  infantil: { label: 'Infantil y juvenil', short: 'Infantil', color: '#e0764a', sec: 'aventura' },
  viajes: { label: 'Viajes', short: 'Viajes', color: '#4aa58a', sec: 'aventura', fic: false },
  thriller: { label: 'Thriller', short: 'Thriller', color: '#4f6fa0', sec: 'misterio' },
  negra: { label: 'Novela negra', short: 'Negra', color: '#5a5f78', sec: 'misterio' },
  terror: { label: 'Terror', short: 'Terror', color: '#8a3a4a', sec: 'misterio' },
  ensayo: { label: 'Ensayo y autoayuda', short: 'Ensayo', color: '#6a8a3f', sec: 'misterio', fic: false },
  cocina: { label: 'Cocina', short: 'Cocina', color: '#c8693f', sec: 'misterio', fic: false },
};
export const GENRE_ORDER = SECTIONS.map((s) => s.id);   // una balda por sección
export const sectionOf = (book) => GENRES[book.genre].sec;

// Etiqueta con la que un cliente pide cada tema ("Busco algo con ...")
export const TAGS = {
  romance: 'romance',
  dragones: 'dragones',
  magia: 'magia',
  academia: 'academia',
  reinos: 'reinos en guerra',
  intriga: 'intriga',
  crimen: 'crímenes por resolver',
  psico: 'giros psicológicos',
  aventura: 'aventuras',
  epica: 'batallas épicas',
  oscuro: 'un tono oscuro',
  hadas: 'hadas',
  asesinos: 'asesinos',
  politica: 'juegos de poder',
  enemigos: 'enemigos a amantes',
  espacio: 'viajes por el espacio',
  futuro: 'mundos del futuro',
  supervivencia: 'supervivencia',
  miedo: 'miedo del bueno',
  fantasmas: 'casas encantadas y fantasmas',
  detectives: 'detectives y calles oscuras',
  verano: 'amores de verano',
  epoca: 'otras épocas',
  historia: 'historia de verdad',
  humor: 'mucho humor',
  ternura: 'ternura',
  emociones: 'emociones y sentimientos',
  reflexion: 'reflexiones para pensar',
  habitos: 'mejorar tus hábitos',
  recetas: 'recetas con historia',
  viajes: 'viajes y países lejanos',
  superacion: 'superación personal',
};

// pal: [fondo arriba, fondo abajo, acento, texto]
export const BOOKS = [
  { id: 'alas', title: 'Alas de Brasa', author: 'Marta Vallory', genre: 'romantasia', tags: ['dragones', 'academia', 'romance', 'enemigos'], unlock: 1, price: 22, motif: 'alas', font: 'fraunces', w: 12, pal: ['#1a0d10', '#4a0f12', '#e8742a', '#f6e9d6'] },
  { id: 'espinas', title: 'Corte de Espinas y Luna', author: 'Selene Thorne', genre: 'romantasia', tags: ['hadas', 'romance', 'magia', 'reinos'], unlock: 1, price: 21, motif: 'luna', font: 'fraunces', w: 12, pal: ['#1a2a52', '#3a6a82', '#d9e7f0', '#f2f6fa'] },
  { id: 'escarcha', title: 'Corte de Plumas y Ceniza', author: 'Lara Nevares', genre: 'romantasia', tags: ['asesinos', 'magia', 'reinos', 'aventura'], unlock: 2, price: 20, motif: 'escarcha', font: 'fraunces', w: 11, pal: ['#0f1a2c', '#2a4a6a', '#9fdcf2', '#eef7fb'] },
  { id: 'hiedra', title: 'Corte de Bruma y Rabia', author: 'Julia Zarzal', genre: 'romantasia', tags: ['hadas', 'politica', 'enemigos', 'romance'], unlock: 2, price: 20, motif: 'hiedra', font: 'fraunces', w: 11, pal: ['#0c1a12', '#1f4a34', '#d5b04a', '#f4efd8'] },
  { id: 'cuervos', title: 'Los Siete Cuervos', author: 'Bruno Casal', genre: 'epica', tags: ['aventura', 'intriga', 'magia', 'crimen'], unlock: 3, price: 19, motif: 'cuervo', font: 'cinzel', w: 12, pal: ['#0b0b0e', '#252028', '#d9a93f', '#f3e7c5'] },
  { id: 'vibora', title: 'Tormenta de Ónice', author: 'Irene Montalbán', genre: 'romantasia', tags: ['romance', 'magia', 'enemigos', 'oscuro'], unlock: 3, price: 21, motif: 'serpiente', font: 'fraunces', w: 11, pal: ['#2a1038', '#5a1f54', '#e3b95a', '#f6e8f0'] },
  { id: 'brasas', title: 'Llama de Hierro', author: 'Nuria Ardiel', genre: 'romantasia', tags: ['romance', 'oscuro', 'reinos', 'magia'], unlock: 4, price: 22, motif: 'llama', font: 'fraunces', w: 13, pal: ['#141010', '#3a1515', '#c3322b', '#f2e2dc'] },
  { id: 'sellos', title: 'El Señor de los Sellos', author: 'Edmund Hallam', genre: 'epica', tags: ['aventura', 'epica', 'magia', 'reinos'], unlock: 1, price: 25, motif: 'anillo', font: 'cinzel', w: 14, pal: ['#10160f', '#2a3a22', '#d9b24a', '#f1ecd2'] },
  { id: 'coronas', title: 'Las Dos Atalayas', author: 'Gael Marlow', genre: 'epica', tags: ['politica', 'reinos', 'epica', 'oscuro'], unlock: 1, price: 24, motif: 'espadas', font: 'cinzel', w: 14, pal: ['#17181b', '#3b3d44', '#b3261e', '#e8e4dc'] },
  { id: 'cicatriz', title: 'Aldric Vane y la Piedra Lunar', author: 'Jenny Rowley', genre: 'epica', tags: ['magia', 'academia', 'aventura'], unlock: 1, price: 19, motif: 'gafas', font: 'fraunces', w: 13, pal: ['#2a1858', '#5a2d96', '#f2c14e', '#fbf3da'] },
  { id: 'brisa', title: 'Aldric Vane y la Cámara del Viento', author: 'Patricio Rojas', genre: 'epica', tags: ['magia', 'academia', 'aventura'], unlock: 2, price: 23, motif: 'viento', font: 'fraunces', w: 14, pal: ['#1b2a33', '#4b6a74', '#e9d9a8', '#eef0e8'] },
  { id: 'niebla', title: 'El Retorno del Heredero', author: 'Bea Sandoval', genre: 'epica', tags: ['magia', 'intriga', 'politica', 'aventura'], unlock: 3, price: 22, motif: 'niebla', font: 'cinzel', w: 13, pal: ['#25282c', '#5b6168', '#d7dde2', '#f3f5f6'] },
  { id: 'cazador', title: 'El Cazador de Monstruos', author: 'Andrés Szapa', genre: 'epica', tags: ['aventura', 'oscuro', 'magia'], unlock: 4, price: 21, motif: 'ojo', font: 'oswald', w: 11, pal: ['#0d0d0a', '#2a2a14', '#d9c12e', '#f7f0c8'] },
  { id: 'zafiro', title: 'Aldric Vane y el Cáliz de Zafiro', author: 'Cristian Palo', genre: 'epica', tags: ['dragones', 'aventura', 'magia', 'reinos'], unlock: 5, price: 20, motif: 'gema', font: 'fraunces', w: 12, pal: ['#0b2a5a', '#1f5ea8', '#9ad1ff', '#eaf4ff'] },
  { id: 'desaparecida', title: 'Desaparecida', author: 'Gema Fuentes', genre: 'thriller', tags: ['psico', 'crimen', 'intriga'], unlock: 1, price: 18, motif: 'silueta', font: 'oswald', w: 10, pal: ['#f2efe9', '#d9d3c8', '#c3322b', '#1a1a1a'] },
  { id: 'tatuaje', title: 'La Chica del Dragón Tatuado', author: 'Sven Almroth', genre: 'thriller', tags: ['crimen', 'intriga', 'oscuro'], unlock: 2, price: 20, motif: 'tatuaje', font: 'oswald', w: 12, pal: ['#0a0a0a', '#2a0d0d', '#e2552b', '#f3e6dc'] },
  { id: 'leonardo', title: 'El Código Leonardo', author: 'Dario Braun', genre: 'thriller', tags: ['intriga', 'aventura', 'crimen'], unlock: 2, price: 19, motif: 'vitruvio', font: 'fraunces', w: 12, pal: ['#2a0d12', '#6a1e26', '#e0b552', '#f7ecd0'] },
  { id: 'paciente', title: 'La Paciente Callada', author: 'Alicia Mikel', genre: 'thriller', tags: ['psico', 'crimen', 'intriga'], unlock: 3, price: 18, motif: 'rostro', font: 'oswald', w: 10, pal: ['#0e4a52', '#13848c', '#f2f2f2', '#ffffff'] },
  { id: 'isla', title: 'Diez en la Isla', author: 'Ágata Cristal', genre: 'thriller', tags: ['crimen', 'intriga', 'psico'], unlock: 4, price: 17, motif: 'isla', font: 'fraunces', w: 10, pal: ['#1a2a4a', '#b3261e', '#f4efe3', '#f9f6ee'] },
  { id: 'tranvia', title: 'La Mujer del Tranvía', author: 'Paula Halcón', genre: 'thriller', tags: ['psico', 'intriga', 'crimen'], unlock: 5, price: 18, motif: 'tren', font: 'oswald', w: 10, pal: ['#1a2150', '#4a5aa8', '#e8eaff', '#ffffff'] },
  { id: 'dunas', title: 'El Planeta de Arena', author: 'Franco Heredia', genre: 'scifi', tags: ['espacio','politica','supervivencia','epica'], unlock: 2, price: 23, motif: 'dunas', font: 'cinzel', w: 14, pal: ['#3a1f0e','#c9822e','#f2c36b','#fbefd2'] },
  { id: 'soles', title: 'El Problema de los Tres Soles', author: 'Liu Wen-Yu', genre: 'scifi', tags: ['espacio','futuro','intriga','reflexion'], unlock: 5, price: 22, motif: 'soles', font: 'oswald', w: 13, pal: ['#05070f','#14233f','#f2a93b','#e8f0ff'] },
  { id: 'marte', title: 'Náufrago en Marte', author: 'Andrew Weston', genre: 'scifi', tags: ['espacio','supervivencia','humor','aventura'], unlock: 3, price: 19, motif: 'cohete', font: 'oswald', w: 11, pal: ['#2a0f0a','#a8381f','#f4a27a','#fff1e6'] },
  { id: 'cementerio', title: 'El Cementerio de los Gatos', author: 'Esteban Rey', genre: 'terror', tags: ['miedo','oscuro','fantasmas','psico'], unlock: 3, price: 19, motif: 'lapida', font: 'oswald', w: 11, pal: ['#0a0a0a','#2a1f2a','#c23a2a','#e8e0d4'] },
  { id: 'globo', title: 'Aquello que Ríe en la Alcantarilla', author: 'Esteban Rey', genre: 'terror', tags: ['miedo','oscuro','aventura','psico'], unlock: 6, price: 22, motif: 'globo', font: 'oswald', w: 14, pal: ['#14070a','#4a0f14','#e03a3a','#f6e8d8'] },
  { id: 'buho', title: 'El Búho de Marsella', author: 'Dashiell Haymes', genre: 'negra', tags: ['detectives','crimen','oscuro','intriga'], unlock: 2, price: 18, motif: 'buho', font: 'oswald', w: 10, pal: ['#0f1114','#2c3138','#c9a24d','#efe6d2'] },
  { id: 'farola', title: 'Sombra en la Calle Mayor', author: 'Petra Lamas', genre: 'negra', tags: ['detectives','crimen','psico','intriga'], unlock: 4, price: 18, motif: 'farola', font: 'oswald', w: 10, pal: ['#101820','#3a4a5a','#f2c35a','#f4efe4'] },
  { id: 'antes', title: 'Tú Antes que Yo', author: 'Josefa Moreno', genre: 'romance', tags: ['romance','emociones','ternura','superacion'], unlock: 1, price: 18, motif: 'sombrilla', font: 'fraunces', w: 11, pal: ['#f6d9d3','#e89fa6','#c64a5a','#1a1a1a'] },
  { id: 'marques', title: 'El Marqués que Me Rechazó', author: 'Julia Quill', genre: 'romance', tags: ['romance','epoca','enemigos','humor'], unlock: 4, price: 20, motif: 'abanico', font: 'fraunces', w: 12, pal: ['#f3dfe8','#c89ad0','#7a3a8a','#1a1a1a'] },
  { id: 'veranos', title: 'Me Gustas Desde Hace Dos Veranos', author: 'Mara Ibáñez', genre: 'romance', tags: ['romance','verano','ternura','emociones'], unlock: 2, price: 17, motif: 'sol', font: 'fraunces', w: 12, pal: ['#fff0c9','#f7a35c','#e8553a','#1a1a1a'] },
  { id: 'columnas', title: 'Las Columnas del Cielo', author: 'Kenneth Fallow', genre: 'historica', tags: ['epoca','historia','politica','aventura'], unlock: 3, price: 26, motif: 'catedral', font: 'cinzel', w: 15, pal: ['#2a2a2e','#6a655a','#d4b06a','#f3ead4'] },
  { id: 'medico', title: 'El Médico de Menfis', author: 'Milo Walter', genre: 'historica', tags: ['epoca','historia','aventura','intriga'], unlock: 6, price: 21, motif: 'piramide', font: 'cinzel', w: 12, pal: ['#3a2410','#b8812e','#f2d27a','#fff6dc'] },
  { id: 'cipres', title: 'La Sombra del Ciprés', author: 'Carlos Ruiz Saldaña', genre: 'literaria', tags: ['intriga','reflexion','emociones','epoca'], unlock: 5, price: 22, motif: 'cipres', font: 'fraunces', w: 13, pal: ['#0f1a1a','#2a4a46','#d9b266','#f1ead6'] },
  { id: 'guia', title: 'Guía del Mochilero Intergaláctico', author: 'Douglas Adler', genre: 'humor', tags: ['humor','espacio','aventura','futuro'], unlock: 1, price: 18, motif: 'toalla', font: 'oswald', w: 12, pal: ['#0e2a55','#2a62b8','#ffd23f','#f6fbff'] },
  { id: 'princesita', title: 'El Niño del Asteroide', author: 'Antonia de Sant-Lys', genre: 'infantil', tags: ['ternura','emociones','aventura','reflexion'], unlock: 1, price: 14, motif: 'asteroide', font: 'fraunces', w: 9, pal: ['#16204a','#3a4f9a','#f2c94c','#fffbe6'] },
  { id: 'gigante', title: 'El Gigante de las Emociones', author: 'Aina Llenar', genre: 'infantil', tags: ['ternura','emociones','humor'], unlock: 3, price: 15, motif: 'monstruo', font: 'fraunces', w: 10, pal: ['#fff4d6','#f6b3a0','#4aa58a','#1a1a1a'] },
  { id: 'habitos', title: 'Hábitos Moleculares', author: 'James Cleary', genre: 'ensayo', tags: ['habitos','superacion','reflexion'], unlock: 2, price: 19, motif: 'atomo', font: 'oswald', w: 11, pal: ['#fbf7ee','#e8e0cc','#e0a93b','#1a1a1a'] },
  { id: 'sapiens', title: 'Sapiens Soñadores', author: 'Yoel Harel', genre: 'ensayo', tags: ['historia','reflexion','aventura'], unlock: 4, price: 23, motif: 'mano', font: 'fraunces', w: 13, pal: ['#3a2a1a','#8a5a2e','#e0a64a','#f6ead2'] },
  { id: 'sal', title: 'Sal, Aceite, Fuego, Tiempo', author: 'Samira Noor', genre: 'cocina', tags: ['recetas','ternura','viajes'], unlock: 2, price: 25, motif: 'olla', font: 'fraunces', w: 13, pal: ['#fff2d6','#f0b88a','#c8452a','#1a1a1a'] },
  { id: 'camina', title: 'Camina, Respira, Perdona', author: 'Elisa Gilmore', genre: 'viajes', tags: ['viajes','superacion','emociones','romance'], unlock: 5, price: 18, motif: 'brujula', font: 'fraunces', w: 11, pal: ['#e9f2ee','#8fc2b4','#2a6a5a','#1a1a1a'] },
];

export const BOOK = Object.fromEntries(BOOKS.map((b) => [b.id, b]));
export const wholesale = (b) => Math.round(b.price * 0.6);

// Sagas (para el minijuego de ordenar estantes): cada libro sabe a qué saga pertenece y qué tomo es
export const SAGAS = [
  { id: 'corte', name: 'Cortes de Hadas', ids: ['espinas', 'hiedra', 'escarcha'] },
  { id: 'brasa', name: 'Alas de Brasa', ids: ['alas', 'brasas', 'vibora'] },
  { id: 'reinos', name: 'El Señor de los Sellos', ids: ['sellos', 'coronas', 'niebla'] },
  { id: 'aprendices', name: 'Aldric Vane', ids: ['cicatriz', 'brisa', 'zafiro'] },
  { id: 'crimen', name: 'Casos sin Resolver', ids: ['desaparecida', 'paciente', 'tranvia'] },
];
SAGAS.forEach((s) => s.ids.forEach((id, i) => { BOOK[id].saga = { id: s.id, n: i + 1 }; BOOK[id].author = BOOK[s.ids[0]].author; }));   // una saga la escribe una sola persona

const ROMAN = ['', 'I', 'II', 'III', 'IV'];
export const romano = (n) => ROMAN[n] ?? String(n);
// «Saga Aldric Vane · tomo 2 de 3» (vacío si el libro es independiente)
export function sagaLabel(b) {
  if (!b?.saga) return '';
  const sg = SAGAS.find((x) => x.id === b.saga.id);
  return `Saga ${sg.name} · tomo ${b.saga.n} de ${sg.ids.length}`;
}
