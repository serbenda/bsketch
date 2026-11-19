// Several drawings kept in this browser. The one open lives in `sketch.current` (as it always did); the rest live
// each under `sketch.drawing.<id>`, and `sketch.drawings` lists them all with their names. Whatever is read back
// from storage is checked: an unknown or broken index starts again from the drawing open now.

import { emptyScene, serializeScene } from './scene.js';

export const CURRENT_KEY = 'sketch.current';
export const INDEX_KEY = 'sketch.drawings';
export const itemKey = (id) => `sketch.drawing.${id}`;
const ID_RE = /^[a-z0-9]{4,40}$/;
const MAX_NAME = 80;

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const cleanName = (n, fallback) => {
  const s = typeof n === 'string' ? n.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME) : '';
  return s || fallback;
};

export function cleanIndex(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.list)) return null;
  const seen = new Set();
  const list = [];
  for (const d of raw.list.slice(0, 500)) {
    if (!d || typeof d.id !== 'string' || !ID_RE.test(d.id) || seen.has(d.id)) continue;
    seen.add(d.id);
    list.push({ id: d.id, name: cleanName(d.name, 'Drawing'), updated: Number.isFinite(d.updated) ? d.updated : 0 });
  }
  if (!list.length || !seen.has(raw.active)) return null;
  return { active: raw.active, list };
}

// The index from storage, or a new one with the drawing open now as its only entry.
export function loadIndex(storage) {
  try {
    const idx = cleanIndex(JSON.parse(storage.getItem(INDEX_KEY) || 'null'));
    if (idx) return idx;
  } catch { /* broken or no storage: start again */ }
  const id = newId();
  return { active: id, list: [{ id, name: 'Drawing 1', updated: Date.now() }] };
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

// Keeps the drawing open now under its own key and makes `id` the open one (its scene moves to CURRENT_KEY).
function switchTo(storage, idx, id) {
  const now = storage.getItem(CURRENT_KEY);
  if (now !== null) storage.setItem(itemKey(idx.active), now);
  const next = storage.getItem(itemKey(id));
  storage.setItem(CURRENT_KEY, next ?? serializeScene(emptyScene()));
  storage.removeItem(itemKey(id));
  idx.active = id;
}

// A new empty drawing (or with `scene`), put first in the list and opened.
export function createDrawing(storage, idx, name, scene = emptyScene()) {
  const id = newId();
  idx.list.unshift({ id, name: cleanName(name, nextName(idx)), updated: Date.now() });
  storage.setItem(itemKey(id), serializeScene(scene));
  switchTo(storage, idx, id);
  saveIndex(storage, idx);
  return id;
}

export function openDrawing(storage, idx, id) {
  if (id === idx.active || !idx.list.some((d) => d.id === id)) return false;
  switchTo(storage, idx, id);
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
export function deleteDrawing(storage, idx, id) {
  const i = idx.list.findIndex((d) => d.id === id);
  if (i < 0) return;
  idx.list.splice(i, 1);
  if (id !== idx.active) {
    storage.removeItem(itemKey(id));
  } else {
    storage.removeItem(CURRENT_KEY);
    if (idx.list.length) {
      idx.active = idx.list[0].id;
      const next = storage.getItem(itemKey(idx.active));
      storage.setItem(CURRENT_KEY, next ?? serializeScene(emptyScene()));
      storage.removeItem(itemKey(idx.active));
    } else {
      const nid = newId();
      idx.list.push({ id: nid, name: 'Drawing 1', updated: Date.now() });
      idx.active = nid;
      storage.setItem(CURRENT_KEY, serializeScene(emptyScene()));
    }
  }
  saveIndex(storage, idx);
}

// The open drawing changed now.
export function touch(storage, idx) {
  const d = activeOf(idx);
  if (d) d.updated = Date.now();
  saveIndex(storage, idx);
}
