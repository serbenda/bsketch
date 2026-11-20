// © 2026 Sergio Santiago Bendaña Quesada. All rights reserved: no use, copy or reuse without written permission,
// and no use by AI or automated tools (training, datasets, retrieval, code generation, scraping). See LICENSE. bsketch-7f3a9c2e
// The sketch site: the editor full screen, with opening, saving and exporting files on the computer.
// The drawings are kept in this browser (IndexedDB, see store.js) so they are not lost when the tab closes.

import { createEditor } from './editor.js';
import { emptyScene, parseScene, serializeScene, toExcalidraw } from './scene.js';
import { toSvgString, toPngBlob } from './render.js';
import { loadPrefs, savePrefs, BACKGROUNDS } from './prefs.js';
import { pickLang, translator, fill } from './i18n.js';
import { loadIndex, saveIndex, activeOf, createDrawing, openDrawing, renameDrawing, deleteDrawing, touch, nextName, migrate, readActive, recover, refreshIndex, INDEX_KEY } from './drawings.js';
import { openSceneStore } from './store.js';
import { parseText } from './textdiagram.js';
import { TEMPLATES, template } from './templates.js';

const $ = (id) => document.getElementById(id);
const statusLine = $('status');

// The interface's language: the one chosen in the menu, or the browser's (English if it isn't one we have).
const earlyPrefs = (() => { try { return loadPrefs(localStorage); } catch { return loadPrefs(null); } })();
const lang = pickLang(earlyPrefs.lang, navigator.languages || [navigator.language]);
const t = translator(lang);
document.documentElement.lang = lang;
// The page's own text (menu, buttons, labels, titles) in that language; the editor gets t() and does its own.
for (const n of document.querySelectorAll('body *:not(script):not(style)')) {
  if (n.closest('#canvas')) continue;
  for (const a of ['title', 'aria-label']) if (n.hasAttribute(a)) n.setAttribute(a, t(n.getAttribute(a)));
  for (const c of n.childNodes) {
    if (c.nodeType !== 3 || !c.textContent.trim()) continue;
    const s = c.textContent.trim();
    if (t(s) !== s) c.textContent = c.textContent.replace(s, t(s));
  }
}

function notify(text) {
  statusLine.textContent = text;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => { statusLine.textContent = ''; }, 3500);
}

// The drawings kept in this browser (see drawings.js and store.js). Storage that can't be read (blocked site data)
// leaves just the one drawing open, until the tab closes.
const ls = (() => { try { return localStorage; } catch { return null; } })();
const memory = new Map();
const storage = ls || { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: (k) => memory.delete(k) };
const drawings = loadIndex(storage, `${t('Drawing')} 1`);
try { saveIndex(storage, drawings); } catch { /* full storage: the open drawing still works */ }
let scenes = null; // the scene store, once open
const LIBRARY_ID = '_library';

// The open drawing as stored, or null.
async function saved() {
  try {
    const raw = await readActive(scenes, drawings);
    return raw ? parseScene(raw) : null;
  } catch {
    return null;
  }
}

async function store(scene) {
  try {
    await scenes.set(drawings.active, serializeScene(scene));
  } catch {
    notify(t('Could not save in this browser. Use "Save" so you do not lose the drawing.'));
  }
}
// The file name for Save and exports: the open drawing's name.
const fileName = () => (activeOf(drawings)?.name || 'drawing').replace(/[\\/:*?"<>|]+/g, '-');

let timer = 0;
let pending = null; // the scene waiting to be saved
// The canvas ignores input until the stored drawing is in place (a few milliseconds), so nothing drawn is lost.
$('canvas').inert = true;
const editor = createEditor($('canvas'), {
  scene: emptyScene(),
  onChange: (scene) => {
    clearTimeout(timer);
    pending = scene;
    timer = setTimeout(flush, 400);
  },
  // The G key: remembered like the menu's switch.
  onGridChange: (on) => setGridPref(on),
  // The library lives with the drawings (in IndexedDB), under an id no drawing can have.
  library: {
    load: async () => (scenes ? scenes.get(LIBRARY_ID) : null),
    save: async (text) => { if (scenes) await scenes.set(LIBRARY_ID, text); },
  },
  onNotice: (text) => notify(text),
  t,
});
editor.focus();

function download(data, name, type) {
  const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Saves the open drawing now (not 400 ms later), before another one takes its place.
async function flush() {
  clearTimeout(timer);
  if (!pending || !scenes) return;
  const scene = pending;
  pending = null;
  await store(scene);
  try { touch(storage, drawings); } catch { /* see store() */ }
}
// Shows the drawing that is open now (after creating, opening or deleting one).
// While the next drawing loads (a few milliseconds) the canvas ignores input, so nothing drawn then is lost.
async function showActive() {
  $('canvas').inert = true;
  try {
    editor.setScene((await saved()) || emptyScene());
  } finally {
    $('canvas').inert = false;
  }
  renderDrawings();
  editor.focus();
}

// Opens the scene store, moves what older versions kept in localStorage into it, and shows the open drawing.
(async () => {
  scenes = await openSceneStore((() => { try { return globalThis.indexedDB; } catch { return null; } })(), ls);
  try { await migrate(storage, scenes, drawings); } catch { /* left for next time; the old copy stays */ }
  try { await recover(storage, scenes, drawings, t('Recovered')); } catch { /* nothing to add */ }
  await showActive();
})();
// Another tab added, renamed or deleted drawings: this tab's list follows, so its next save doesn't undo them.
addEventListener('storage', (ev) => {
  if (ev.key !== INDEX_KEY) return;
  refreshIndex(storage, drawings);
  renderDrawings();
});
// Leaving the page (or hiding it) saves at once.
addEventListener('pagehide', () => { flush(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

// Opening a file makes a new drawing with it: the one open stays in the list.
async function openFile(file) {
  let scene;
  try {
    scene = parseScene(await file.text());
  } catch {
    return notify(t('That file is not a sketch or Excalidraw drawing.'));
  }
  try {
    $('canvas').inert = true;
    await flush();
    await createDrawing(storage, scenes, drawings, file.name.replace(/\.(sketch|excalidraw|json)$/i, ''), scene);
    await showActive();
    notify(fill(t('Opened "{name}": {n} elements.'), { name: file.name, n: scene.elements.length }));
  } catch {
    $('canvas').inert = false;
    notify(t('Could not keep another drawing in this browser (its storage is full): delete some first.'));
  }
}

$('new').addEventListener('click', async () => {
  try {
    $('canvas').inert = true;
    await flush();
    await createDrawing(storage, scenes, drawings, nextName(drawings, t('Drawing')));
    await showActive();
  } catch {
    $('canvas').inert = false;
    notify(t('Could not keep another drawing in this browser (its storage is full): delete some first.'));
  }
});

// --- The list of drawings in the menu ---
const drawingList = $('drawings');
function renderDrawings() {
  drawingList.replaceChildren(...drawings.list.map((d) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'drawer-item drawing-item';
    b.textContent = d.name;
    if (d.id === drawings.active) b.setAttribute('aria-current', 'true');
    b.addEventListener('click', async () => {
      if (d.id === drawings.active) return closeMenu();
      $('canvas').inert = true;
      await flush();
      try {
        openDrawing(storage, drawings, d.id);
      } catch {
        notify(t('Could not save in this browser. Use "Save" so you do not lose the drawing.'));
      }
      await showActive();
      closeMenu();
    });
    const li = document.createElement('li');
    li.append(b);
    return li;
  }));
}
$('rename').addEventListener('click', () => {
  const d = activeOf(drawings);
  const name = window.prompt(t('Name of this drawing:'), d?.name || '');
  if (name === null || !d) return;
  renameDrawing(storage, drawings, d.id, name);
  renderDrawings();
});
$('delete').addEventListener('click', async () => {
  const d = activeOf(drawings);
  if (!d || !window.confirm(fill(t('Delete "{name}" from this browser? It can\'t be undone (Save it first if you want to keep a copy).'), { name: d.name }))) return;
  clearTimeout(timer);
  pending = null;
  try {
    $('canvas').inert = true;
    await deleteDrawing(storage, scenes, drawings, d.id, `${t('Drawing')} 1`);
  } catch { /* the index already moved on; a scene left behind is harmless */ }
  await showActive();
});
$('open').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', (ev) => {
  const [file] = ev.target.files;
  ev.target.value = '';
  if (file) openFile(file);
});
$('save').addEventListener('click', () => {
  download(serializeScene(editor.getScene()), `${fileName()}.sketch`, 'application/json');
  notify(t('Downloaded. You can open it again with "Open…".'));
});
// What PNG and SVG export: the whole drawing, or only the selection when that box is ticked. A selected frame
// exports what is inside it, cut to the frame (without its border and title).
function exportScene() {
  const scene = editor.getScene();
  if (!$('only-selection').checked) return { scene };
  const sel = editor.getSelectionWithFrames();
  const frames = sel.filter((e) => e.type === 'frame');
  const elements = sel.filter((e) => e.type !== 'frame');
  if (frames.length === 1) {
    const f = frames[0];
    return { scene: { ...scene, elements }, box: { x: f.x, y: f.y, w: f.w, h: f.h }, padding: 0 };
  }
  return { scene: { ...scene, elements: frames.length ? elements : sel } };
}
$('png').addEventListener('click', async () => {
  const { scene, box, padding } = exportScene();
  if (!scene.elements.length && !box) return notify(t($('only-selection').checked ? 'Nothing is selected.' : 'The drawing is empty.'));
  const png = await toPngBlob(document, scene, { background: !$('transparent').checked, box, padding });
  if (!png) return notify(t('This browser could not make the PNG. Try SVG instead.'));
  download(png, `${fileName()}.png`, 'image/png');
});
// Copy as PNG: the selection if there is one, otherwise the whole drawing, ready to paste in a chat or a document.
async function copyPng() {
  const sel = editor.getSelection();
  const scene = { ...editor.getScene(), ...(sel.length ? { elements: sel } : {}) };
  if (!scene.elements.length) return notify(t('The drawing is empty.'));
  const transparent = $('transparent').checked;
  if (!navigator.clipboard?.write || !globalThis.ClipboardItem) return notify(t('This browser cannot copy images. Use "PNG" instead.'));
  try {
    // The PNG goes in as a promise so the copy still counts as part of the click (Safari asks for that).
    const blob = toPngBlob(document, scene, { background: !transparent }).then((b) => b || Promise.reject(new Error('png')));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    notify(t(sel.length ? 'Selection copied as PNG.' : 'Drawing copied as PNG.'));
  } catch {
    notify(t('Could not copy the image. Use "PNG" instead.'));
  }
}
$('copy-png').addEventListener('click', copyPng);

$('excalidraw').addEventListener('click', () => {
  const { scene } = exportScene();
  if (!scene.elements.length) return notify(t($('only-selection').checked ? 'Nothing is selected.' : 'The drawing is empty.'));
  download(`${JSON.stringify(toExcalidraw(scene))}\n`, `${fileName()}.excalidraw`, 'application/json');
  notify(t('Downloaded. You can open it in Excalidraw, or again here with "Open…".'));
});

$('svg').addEventListener('click', () => {
  const { scene, box, padding } = exportScene();
  if (!scene.elements.length && !box) return notify(t($('only-selection').checked ? 'Nothing is selected.' : 'The drawing is empty.'));
  download(toSvgString(scene, { background: !$('transparent').checked, box, padding }), `${fileName()}.svg`, 'image/svg+xml');
});

// --- Text to diagram: a dialog to write or paste the text, with examples and a live count ---
const EXAMPLES = {
  list: 'Product\n  Web\n    Editor\n    Side menu\n  Desktop\n    Windows\n    macOS\n  Portable file',
  mermaid: 'graph LR\n  A[Idea] --> B{Worth it?}\n  B -->|Yes| C[Sketch it]\n  B -- No --> D([Drop it])\n  C --> E[Build it]\n  subgraph Work\n    C\n    E\n  end',
  arrows: 'Browser -> DNS: lookup\nDNS -> Browser: address\nBrowser -> Server: request\nServer -> Browser: page',
};
const tdDialog = $('td-dialog');
const tdText = $('td-text');
function tdCount() {
  const g = tdText.value.trim() ? parseText(tdText.value) : null;
  $('td-insert').disabled = !g;
  $('td-count').textContent = g ? fill(t('{n} boxes, {e} arrows'), { n: g.nodes.length, e: g.edges.length }) : tdText.value.trim() ? t('Not a diagram yet: write two lines or more.') : '';
}
tdText.addEventListener('input', tdCount);
for (const b of document.querySelectorAll('.td-example')) {
  b.addEventListener('click', () => {
    tdText.value = EXAMPLES[b.dataset.example] || '';
    tdCount();
    tdText.focus();
  });
}
$('text-diagram').addEventListener('click', () => {
  closeMenu();
  tdCount();
  tdDialog.showModal();
  tdText.focus();
});
tdDialog.addEventListener('close', () => {
  if (tdDialog.returnValue !== 'insert') return editor.focus();
  const r = editor.insertText(tdText.value, { direction: $('td-direction').value || undefined });
  if (r) {
    notify(fill(t('Drawn: {n} boxes, {e} arrows.'), { n: r.nodes, e: r.edges }));
    tdText.value = '';
  }
  editor.focus();
});

// --- Templates: each opens as a new drawing, drawn from its text ---
for (const id of Object.keys(TEMPLATES)) {
  const tpl = template(id, lang);
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'drawer-item';
  b.dataset.template = id;
  b.textContent = tpl.name;
  b.addEventListener('click', async () => {
    closeMenu();
    try {
      $('canvas').inert = true;
      await flush();
      await createDrawing(storage, scenes, drawings, tpl.name);
      await showActive();
      editor.insertText(tpl.text, { direction: tpl.direction, keepSelected: false });
      editor.zoomToFit();
    } catch {
      $('canvas').inert = false;
      notify(t('Could not keep another drawing in this browser (its storage is full): delete some first.'));
    }
  });
  $('templates').append(b);
}

// --- The side menu: file actions and options ---
const menu = $('menu');
const menuButton = $('menu-button');
function openMenu() {
  syncMenu();
  menu.showModal();
  menuButton.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  if (menu.open) menu.close();
}
menu.addEventListener('close', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  editor.focus();
});
menuButton.addEventListener('click', openMenu);
$('menu-close').addEventListener('click', closeMenu);
// A click on the backdrop (outside the panel) closes it.
menu.addEventListener('click', (ev) => {
  if (ev.target !== menu) return;
  const r = menu.getBoundingClientRect();
  if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) closeMenu();
});
// The file actions close the menu once done.
for (const id of ['new', 'save', 'png', 'svg', 'excalidraw', 'copy-png']) $(id).addEventListener('click', () => setTimeout(closeMenu, 0));
$('file').addEventListener('change', closeMenu);

// Appearance: system, light or dark, remembered in this browser.
// Reading localStorage itself can throw (blocked site data): the preferences then last until the tab closes.
const prefsStorage = (() => { try { return localStorage; } catch { return null; } })();
let prefs = loadPrefs(prefsStorage);
const darkQuery = matchMedia('(prefers-color-scheme: dark)');
function applyAppearance() {
  const a = prefs.appearance;
  if (a === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = a;
  editor.setTheme(a);
  const dark = a === 'dark' || (a === 'system' && darkQuery.matches);
  $('background-note').hidden = !dark;
}
for (const input of document.querySelectorAll('input[name="appearance"]')) {
  input.addEventListener('change', () => {
    prefs = { ...prefs, appearance: input.value };
    savePrefs(prefsStorage, prefs);
    applyAppearance();
  });
}
darkQuery.addEventListener('change', applyAppearance);

// Language: the interface is built once in it, so a change reloads the page (the drawing is already saved).
for (const input of document.querySelectorAll('input[name="lang"]')) {
  input.addEventListener('change', () => {
    prefs = { ...prefs, lang: input.value };
    savePrefs(prefsStorage, prefs);
    flush().then(() => location.reload());
  });
}

// Grid: shown on screen only, remembered in this browser.
function setGridPref(on) {
  prefs = { ...prefs, grid: on };
  savePrefs(prefsStorage, prefs);
  $('grid').checked = on;
}
$('grid').addEventListener('change', () => {
  editor.setGrid($('grid').checked);
  setGridPref($('grid').checked);
});
editor.setGrid(prefs.grid);

// Canvas background: saved with the drawing and undoable.
const swatches = $('backgrounds');
for (const [color, label] of BACKGROUNDS) {
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'background';
  input.value = color;
  const chip = document.createElement('span');
  chip.className = 'drawer-swatch';
  chip.style.backgroundColor = color;
  const name = document.createElement('span');
  name.className = 'visually-hidden';
  name.textContent = t(label);
  const wrap = document.createElement('label');
  wrap.title = t(label);
  wrap.append(input, chip, name);
  input.addEventListener('change', () => editor.setBackground(color));
  swatches.append(wrap);
}

// The menu shows the current choices each time it opens.
function syncMenu() {
  renderDrawings();
  for (const input of document.querySelectorAll('input[name="lang"]')) input.checked = input.value === prefs.lang;
  for (const input of document.querySelectorAll('input[name="appearance"]')) input.checked = input.value === prefs.appearance;
  $('grid').checked = prefs.grid;
  const bg = editor.getScene().background;
  for (const input of swatches.querySelectorAll('input')) input.checked = input.value === bg;
}
applyAppearance();

// Shortcuts for the file actions: Ctrl+S saves, Ctrl+O opens (Cmd on a Mac), Alt+Shift+C copies as PNG
// (Ctrl/Cmd+Shift+C belongs to the browser's inspector). By key position, so other layouts work too.
document.addEventListener('keydown', (ev) => {
  const mod = ev.ctrlKey || ev.metaKey;
  if (mod && !ev.altKey && !ev.shiftKey && ev.code === 'KeyS') {
    ev.preventDefault();
    $('save').click();
  } else if (mod && !ev.altKey && !ev.shiftKey && ev.code === 'KeyO') {
    ev.preventDefault();
    $('file').click();
  } else if (!mod && ev.altKey && ev.shiftKey && ev.code === 'KeyC') {
    ev.preventDefault();
    copyPng();
  }
});

// Dropping a file on the page opens it.
window.addEventListener('dragover', (ev) => {
  if (ev.dataTransfer?.types.includes('Files')) ev.preventDefault();
});
window.addEventListener('drop', (ev) => {
  const [file] = ev.dataTransfer?.files || [];
  if (!file) return;
  ev.preventDefault();
  // A picture goes into the drawing; anything else is opened as a drawing.
  if (file.type.startsWith('image/')) editor.insertImage(file);
  else openFile(file);
});

// Offline: the site is kept in the browser (service worker). Trusted Types: only sw.js is allowed.
const TT = globalThis.trustedTypes?.createPolicy('sketch', {
  createScriptURL: (u) => {
    if (u !== 'sw.js') throw new Error('script_not_allowed');
    return u;
  },
});
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register(TT ? TT.createScriptURL('sw.js') : 'sw.js').catch(() => {});
}
