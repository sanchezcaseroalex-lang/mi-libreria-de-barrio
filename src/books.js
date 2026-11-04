// Catálogo: 20 libros "de homenaje". Se reconocen por el color, el motivo y el estilo de la portada,
// pero ningún título ni autor es real. Todo es editable.

export const GENRES = {
  romantasia: { label: 'Romantasy', short: 'Romantasy', color: '#c8566b' },
  epica: { label: 'Fantasía épica', short: 'Épica', color: '#5b8a5f' },
  thriller: { label: 'Thriller', short: 'Thriller', color: '#4f6fa0' },
};
export const GENRE_ORDER = ['romantasia', 'epica', 'thriller'];

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
};

// pal: [fondo arriba, fondo abajo, acento, texto]
export const BOOKS = [
  { id: 'alas', title: 'Alas de Brasa', author: 'Marta Vallory', genre: 'romantasia', tags: ['dragones', 'academia', 'romance', 'enemigos'], unlock: 1, price: 22, motif: 'alas', font: 'fraunces', w: 12, pal: ['#1a0d10', '#4a0f12', '#e8742a', '#f6e9d6'] },
  { id: 'espinas', title: 'Corte de Espinas y Luna', author: 'Selene Thorne', genre: 'romantasia', tags: ['hadas', 'romance', 'magia', 'reinos'], unlock: 1, price: 21, motif: 'luna', font: 'fraunces', w: 12, pal: ['#1a2a52', '#3a6a82', '#d9e7f0', '#f2f6fa'] },
  { id: 'escarcha', title: 'Trono de Escarcha', author: 'Lara Nevares', genre: 'romantasia', tags: ['asesinos', 'magia', 'reinos', 'aventura'], unlock: 2, price: 20, motif: 'escarcha', font: 'fraunces', w: 11, pal: ['#0f1a2c', '#2a4a6a', '#9fdcf2', '#eef7fb'] },
  { id: 'hiedra', title: 'Corona de Hiedra', author: 'Julia Zarzal', genre: 'romantasia', tags: ['hadas', 'politica', 'enemigos', 'romance'], unlock: 2, price: 20, motif: 'hiedra', font: 'fraunces', w: 11, pal: ['#0c1a12', '#1f4a34', '#d5b04a', '#f4efd8'] },
  { id: 'cuervos', title: 'Los Siete Cuervos', author: 'Bruno Casal', genre: 'epica', tags: ['aventura', 'intriga', 'magia', 'crimen'], unlock: 3, price: 19, motif: 'cuervo', font: 'cinzel', w: 12, pal: ['#0b0b0e', '#252028', '#d9a93f', '#f3e7c5'] },
  { id: 'vibora', title: 'Víbora y Gorrión', author: 'Irene Montalbán', genre: 'romantasia', tags: ['romance', 'magia', 'enemigos', 'oscuro'], unlock: 3, price: 21, motif: 'serpiente', font: 'fraunces', w: 11, pal: ['#2a1038', '#5a1f54', '#e3b95a', '#f6e8f0'] },
  { id: 'brasas', title: 'De Brasas y Sombras', author: 'Nuria Ardiel', genre: 'romantasia', tags: ['romance', 'oscuro', 'reinos', 'magia'], unlock: 4, price: 22, motif: 'llama', font: 'fraunces', w: 13, pal: ['#141010', '#3a1515', '#c3322b', '#f2e2dc'] },
  { id: 'sellos', title: 'El Señor de los Sellos', author: 'Edmund Hallam', genre: 'epica', tags: ['aventura', 'epica', 'magia', 'reinos'], unlock: 1, price: 25, motif: 'anillo', font: 'cinzel', w: 14, pal: ['#10160f', '#2a3a22', '#d9b24a', '#f1ecd2'] },
  { id: 'coronas', title: 'Juego de Coronas', author: 'Gael Marlow', genre: 'epica', tags: ['politica', 'reinos', 'epica', 'oscuro'], unlock: 1, price: 24, motif: 'espadas', font: 'cinzel', w: 14, pal: ['#17181b', '#3b3d44', '#b3261e', '#e8e4dc'] },
  { id: 'cicatriz', title: 'El Aprendiz de la Cicatriz', author: 'Jenny Rowley', genre: 'epica', tags: ['magia', 'academia', 'aventura'], unlock: 1, price: 19, motif: 'gafas', font: 'fraunces', w: 13, pal: ['#2a1858', '#5a2d96', '#f2c14e', '#fbf3da'] },
  { id: 'brisa', title: 'El Nombre de la Brisa', author: 'Patricio Rojas', genre: 'epica', tags: ['magia', 'academia', 'aventura'], unlock: 2, price: 23, motif: 'viento', font: 'fraunces', w: 14, pal: ['#1b2a33', '#4b6a74', '#e9d9a8', '#eef0e8'] },
  { id: 'niebla', title: 'El Imperio de la Niebla', author: 'Bea Sandoval', genre: 'epica', tags: ['magia', 'intriga', 'politica', 'aventura'], unlock: 3, price: 22, motif: 'niebla', font: 'cinzel', w: 13, pal: ['#25282c', '#5b6168', '#d7dde2', '#f3f5f6'] },
  { id: 'cazador', title: 'El Cazador de Monstruos', author: 'Andrés Szapa', genre: 'epica', tags: ['aventura', 'oscuro', 'magia'], unlock: 4, price: 21, motif: 'ojo', font: 'oswald', w: 11, pal: ['#0d0d0a', '#2a2a14', '#d9c12e', '#f7f0c8'] },
  { id: 'zafiro', title: 'El Jinete del Zafiro', author: 'Cristian Palo', genre: 'epica', tags: ['dragones', 'aventura', 'magia', 'reinos'], unlock: 5, price: 20, motif: 'gema', font: 'fraunces', w: 12, pal: ['#0b2a5a', '#1f5ea8', '#9ad1ff', '#eaf4ff'] },
  { id: 'desaparecida', title: 'Desaparecida', author: 'Gema Fuentes', genre: 'thriller', tags: ['psico', 'crimen', 'intriga'], unlock: 1, price: 18, motif: 'silueta', font: 'oswald', w: 10, pal: ['#f2efe9', '#d9d3c8', '#c3322b', '#1a1a1a'] },
  { id: 'tatuaje', title: 'La Chica del Dragón Tatuado', author: 'Sven Almroth', genre: 'thriller', tags: ['crimen', 'intriga', 'oscuro'], unlock: 2, price: 20, motif: 'tatuaje', font: 'oswald', w: 12, pal: ['#0a0a0a', '#2a0d0d', '#e2552b', '#f3e6dc'] },
  { id: 'leonardo', title: 'El Código Leonardo', author: 'Dario Braun', genre: 'thriller', tags: ['intriga', 'aventura', 'crimen'], unlock: 2, price: 19, motif: 'vitruvio', font: 'fraunces', w: 12, pal: ['#2a0d12', '#6a1e26', '#e0b552', '#f7ecd0'] },
  { id: 'paciente', title: 'La Paciente Callada', author: 'Alicia Mikel', genre: 'thriller', tags: ['psico', 'crimen', 'intriga'], unlock: 3, price: 18, motif: 'rostro', font: 'oswald', w: 10, pal: ['#0e4a52', '#13848c', '#f2f2f2', '#ffffff'] },
  { id: 'isla', title: 'Diez en la Isla', author: 'Ágata Cristal', genre: 'thriller', tags: ['crimen', 'intriga', 'psico'], unlock: 4, price: 17, motif: 'isla', font: 'fraunces', w: 10, pal: ['#1a2a4a', '#b3261e', '#f4efe3', '#f9f6ee'] },
  { id: 'tranvia', title: 'La Mujer del Tranvía', author: 'Paula Halcón', genre: 'thriller', tags: ['psico', 'intriga', 'crimen'], unlock: 5, price: 18, motif: 'tren', font: 'oswald', w: 10, pal: ['#1a2150', '#4a5aa8', '#e8eaff', '#ffffff'] },
];

export const BOOK = Object.fromEntries(BOOKS.map((b) => [b.id, b]));
export const wholesale = (b) => Math.round(b.price * 0.6);

// Sagas (para el minijuego de ordenar estantes): cada libro sabe a qué saga pertenece y qué tomo es
export const SAGAS = [
  { id: 'corte', name: 'Corte de Espinas', ids: ['espinas', 'hiedra', 'escarcha'] },
  { id: 'brasa', name: 'Alas y Brasas', ids: ['alas', 'brasas', 'vibora'] },
  { id: 'reinos', name: 'Reinos y Anillos', ids: ['sellos', 'coronas', 'niebla'] },
  { id: 'aprendices', name: 'Los Aprendices', ids: ['cicatriz', 'brisa', 'zafiro'] },
  { id: 'crimen', name: 'Casos sin Resolver', ids: ['desaparecida', 'paciente', 'tranvia'] },
];
SAGAS.forEach((s) => s.ids.forEach((id, i) => { BOOK[id].saga = { id: s.id, n: i + 1 }; }));
