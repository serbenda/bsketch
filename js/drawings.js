// Several drawings kept in this browser. `sketch.drawings` (localStorage, small) lists them with their names and
// which one is open; their scenes live in a scene store (store.js: IndexedDB, or localStorage as a fallback),
// one entry per drawing id. Whatever is read back from storage is checked: an unknown or broken index starts
// again from the drawing open now.
//
// Older versions kept the open drawing in `sketch.current` (and before that `sketch.actual`) and the others in
// localStorage under `sketch.drawing.<id>`; migrate() moves them into the store the first time.

import { emptyScene, serializeScene } from './scene.js';
import { itemKey } from './store.js';

export const CURRENT_KEY = 'sketch.current';
export const OLD_KEY = 'sketch.actual';
export const INDEX_KEY = 'sketch.drawings';
const ID_RE = /^[a-z0-9]{4,40}$/;
const MAX_NAME = 80;
const MAX_DRAWINGS = 500;

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const cleanName = (n, fallback) => {
  const s = typeof n === 'string' ? n.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME) : '';
  return s || fallback;
};

export function cleanIndex(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.list)) return null;
  const seen = new Set();
  const list = [];
  for (const d of raw.list.slice(0, MAX_DRAWINGS)) {
    if (!d || typeof d.id !== 'string' || !ID_RE.test(d.id) || seen.has(d.id)) continue;
    seen.add(d.id);
    list.push({ id: d.id, name: cleanName(d.name, 'Drawing'), updated: Number.isFinite(d.updated) ? d.updated : 0 });
  }
  if (!list.length) return null;
  // An unknown open drawing (an older version, a broken write) opens the first one instead of losing the list.
  return { active: seen.has(raw.active) ? raw.active : list[0].id, list };
}

// The index from storage, or a new one with the drawing open now as its only entry.
export function loadIndex(storage, firstName = 'Drawing 1') {
  try {
    const idx = cleanIndex(JSON.parse(storage.getItem(INDEX_KEY) || 'null'));
    if (idx) return idx;
  } catch { /* broken or no storage: start again */ }
  const id = newId();
  return { active: id, list: [{ id, name: firstName, updated: Date.now() }] };
}

export function saveIndex(storage, idx) {
  storage.setItem(INDEX_KEY, JSON.stringify(idx));
}

export const activeOf = (idx) => idx.list.find((d) => d.id === idx.active);

// A name not used yet: "Drawing 2", "Drawing 3"…
export function nextName(idx, base = 'Drawing') {
  const used = new Set(idx.list.map((d) => d.name));
  for (let n = idx.list.length + 1; ; n++) if (!used.has(`${base} ${n}`)) return `${base} ${n}`;
}

// Moves what older versions left in localStorage into the store. Each key is removed only once its scene is safely
// in the store, so an error leaves it where it was (and it is tried again next time).
export async function migrate(storage, store, idx) {
  if ((await store.get(idx.active)) === null) {
    const legacy = storage.getItem(CURRENT_KEY) ?? storage.getItem(OLD_KEY);
    if (legacy !== null) await store.set(idx.active, legacy);
  }
  if (store.kind !== 'localstorage') {
    for (const d of idx.list) {
      const raw = storage.getItem(itemKey(d.id));
      if (raw === null) continue;
      if ((await store.get(d.id)) === null) await store.set(d.id, raw);
      storage.removeItem(itemKey(d.id));
    }
  }
  if ((await store.get(idx.active)) !== null) {
    storage.removeItem(CURRENT_KEY);
    storage.removeItem(OLD_KEY);
  }
}

// Scenes in the store that the index doesn't list (a list lost to a broken write, another tab's drawing) come back
// as "Recovered" entries, so a drawing is never kept where nobody can open it.
export async function recover(storage, store, idx, name = 'Recovered') {
  if (!store.keys) return 0;
  const known = new Set(idx.list.map((d) => d.id));
  let n = 0;
  for (const id of await store.keys()) {
    if (known.has(id) || !ID_RE.test(id) || idx.list.length >= MAX_DRAWINGS) continue;
    idx.list.push({ id, name: `${name} ${++n}`, updated: 0 });
  }
  if (n) saveIndex(storage, idx);
  return n;
}

// Another tab changed the index: take its list, keeping this tab's open drawing (and its entry, if that tab
// deleted it while it was open here, so its changes still have a place).
export function refreshIndex(storage, idx) {
  let fresh = null;
  try { fresh = cleanIndex(JSON.parse(storage.getItem(INDEX_KEY) || 'null')); } catch { /* keep ours */ }
  if (!fresh) return false;
  const mine = activeOf(idx);
  if (mine && !fresh.list.some((d) => d.id === mine.id)) fresh.list.unshift(mine);
  idx.list = fresh.list;
  return true;
}

// The open drawing's scene as JSON text, or null if it has none yet.
export const readActive = (store, idx) => store.get(idx.active);

// A new drawing (empty, or with `scene`), put first in the list and opened. Its scene is stored before the index
// points at it, so a failure leaves the list as it was.
export async function createDrawing(storage, store, idx, name, scene = emptyScene()) {
  if (idx.list.length >= MAX_DRAWINGS) throw new Error('too_many');
  const id = newId();
  await store.set(id, serializeScene(scene));
  idx.list.unshift({ id, name: cleanName(name, nextName(idx)), updated: Date.now() });
  idx.active = id;
  saveIndex(storage, idx);
  return id;
}

export function openDrawing(storage, idx, id) {
  if (id === idx.active || !idx.list.some((d) => d.id === id)) return false;
  idx.active = id;
  saveIndex(storage, idx);
  return true;
}

export function renameDrawing(storage, idx, id, name) {
  const d = idx.list.find((x) => x.id === id);
  if (!d) return;
  d.name = cleanName(name, d.name);
  saveIndex(storage, idx);
}

// Deletes a drawing; if it was the open one, the next in the list opens (or a new empty one).
export async function deleteDrawing(storage, store, idx, id, emptyName = 'Drawing 1') {
  const i = idx.list.findIndex((d) => d.id === id);
  if (i < 0) return;
  idx.list.splice(i, 1);
  if (id === idx.active) {
    if (!idx.list.length) {
      const nid = newId();
      await store.set(nid, serializeScene(emptyScene()));
      idx.list.push({ id: nid, name: emptyName, updated: Date.now() });
    }
    idx.active = idx.list[0].id;
  }
  saveIndex(storage, idx);
  await store.remove(id);
}

// The open drawing changed now.
export function touch(storage, idx) {
  const d = activeOf(idx);
  if (d) d.updated = Date.now();
  saveIndex(storage, idx);
}
