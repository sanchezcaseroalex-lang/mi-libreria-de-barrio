const KEY = 'libreria.v2';

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // sin almacenamiento: la partida sigue en memoria
  }
}

export function wipe() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignorado
  }
}
