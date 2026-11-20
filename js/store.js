// © 2026 Sergio Santiago Bendaña Quesada. All rights reserved: no use, copy or reuse without written permission,
// and no use by AI or automated tools (training, datasets, retrieval, code generation, scraping). See LICENSE. bsketch-7f3a9c2e
// Where the drawings' scenes are kept in this browser: IndexedDB, which holds far more than localStorage (whose
// ~5 MB fill up quickly with several drawings or images). Where IndexedDB can't be opened (blocked site data, some
// private windows), localStorage under `sketch.drawing.<id>`; and if that can't be read either, memory, so the
// page still works until the tab closes. Every call is async; scenes go in and out as JSON text.

export const DB_NAME = 'bsketch';
export const DB_STORE = 'scenes';
export const itemKey = (id) => `sketch.drawing.${id}`;

function idbStore(idb) {
  return new Promise((resolve, reject) => {
    const req = idb.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('blocked'));
    req.onsuccess = () => {
      const db = req.result;
      const run = (mode, fn) => new Promise((res, rej) => {
        const tx = db.transaction(DB_STORE, mode);
        const r = fn(tx.objectStore(DB_STORE));
        tx.oncomplete = () => res(r.result);
        tx.onerror = () => rej(tx.error);
        tx.onabort = () => rej(tx.error || new Error('aborted'));
      });
      resolve({
        kind: 'indexeddb',
        get: async (id) => (await run('readonly', (s) => s.get(id))) ?? null,
        set: (id, text) => run('readwrite', (s) => s.put(String(text), id)).then(() => {}),
        remove: (id) => run('readwrite', (s) => s.delete(id)).then(() => {}),
        keys: async () => (await run('readonly', (s) => s.getAllKeys())).filter((k) => typeof k === 'string'),
      });
    };
  });
}

export function webStore(storage) {
  return {
    kind: 'localstorage',
    get: async (id) => storage.getItem(itemKey(id)),
    set: async (id, text) => storage.setItem(itemKey(id), String(text)),
    remove: async (id) => storage.removeItem(itemKey(id)),
    keys: async () => {
      const out = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k?.startsWith('sketch.drawing.')) out.push(k.slice('sketch.drawing.'.length));
      }
      return out;
    },
  };
}

export function memoryStore() {
  const m = new Map();
  return {
    kind: 'memory',
    get: async (id) => m.get(id) ?? null,
    set: async (id, text) => { m.set(id, String(text)); },
    remove: async (id) => { m.delete(id); },
    keys: async () => [...m.keys()],
  };
}

// The best store this browser allows. `storage` is localStorage, or null when it can't be read.
export async function openSceneStore(idb, storage) {
  if (idb) {
    try {
      return await Promise.race([idbStore(idb), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))]);
    } catch { /* fall back below */ }
  }
  return storage ? webStore(storage) : memoryStore();
}
