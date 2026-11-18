// The sketch site: the editor full screen, with opening, saving and exporting files on the computer.
// The drawing in progress is kept in this browser so it is not lost when the tab closes.

import { createEditor } from './editor.js';
import { emptyScene, parseScene, serializeScene } from './scene.js';
import { toSvgString, toPngBlob } from './render.js';
import { loadPrefs, savePrefs, BACKGROUNDS } from './prefs.js';

const KEY = 'sketch.current';
const OLD_KEY = 'sketch.actual'; // before 0.4.0: read once and moved to KEY
const $ = (id) => document.getElementById(id);
const statusLine = $('status');
let fileName = 'drawing';

function notify(text) {
  statusLine.textContent = text;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => { statusLine.textContent = ''; }, 3500);
}

function saved() {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY);
    return raw ? parseScene(raw) : null;
  } catch {
    return null;
  }
}

function store(scene) {
  try {
    localStorage.setItem(KEY, serializeScene(scene));
    localStorage.removeItem(OLD_KEY);
  } catch {
    notify('Could not save in this browser. Use "Save" so you do not lose the drawing.');
  }
}

let timer = 0;
const editor = createEditor($('canvas'), {
  scene: saved() || emptyScene(),
  onChange: (scene) => {
    clearTimeout(timer);
    timer = setTimeout(() => store(scene), 400);
  },
  // The G key: remembered like the menu's switch.
  onGridChange: (on) => setGridPref(on),
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

async function openFile(file) {
  // Opening replaces the drawing in this browser: ask first, as "New" does.
  if (editor.getScene().elements.length && !window.confirm(`Open "${file.name}"? It replaces the current drawing (save it first if you want to keep it).`)) return;
  try {
    const scene = parseScene(await file.text());
    editor.setScene(scene);
    store(scene);
    fileName = file.name.replace(/\.(sketch|excalidraw|json)$/i, '') || 'drawing';
    notify(`Opened "${file.name}": ${scene.elements.length} elements.`);
  } catch {
    notify('That file is not a sketch or Excalidraw drawing.');
  }
}

$('new').addEventListener('click', () => {
  if (editor.getScene().elements.length && !window.confirm('Start a new drawing? The current one will be removed from this browser (save it first if you want to keep it).')) return;
  editor.setScene(emptyScene());
  fileName = 'drawing';
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(OLD_KEY);
  } catch { /* no storage */ }
  editor.focus();
});
$('open').addEventListener('click', () => $('file').click());
$('file').addEventListener('change', (ev) => {
  const [file] = ev.target.files;
  ev.target.value = '';
  if (file) openFile(file);
});
$('save').addEventListener('click', () => {
  download(serializeScene(editor.getScene()), `${fileName}.sketch`, 'application/json');
  notify('Downloaded. You can open it again with "Open…".');
});
$('png').addEventListener('click', async () => {
  const scene = editor.getScene();
  if (!scene.elements.length) return notify('The drawing is empty.');
  const png = await toPngBlob(document, scene, { background: !$('transparent').checked });
  if (!png) return notify('This browser could not make the PNG. Try SVG instead.');
  download(png, `${fileName}.png`, 'image/png');
});
// Copy as PNG: the selection if there is one, otherwise the whole drawing, ready to paste in a chat or a document.
async function copyPng() {
  const sel = editor.getSelection();
  const scene = { ...editor.getScene(), ...(sel.length ? { elements: sel } : {}) };
  if (!scene.elements.length) return notify('The drawing is empty.');
  const transparent = $('transparent').checked;
  if (!navigator.clipboard?.write || !globalThis.ClipboardItem) return notify('This browser cannot copy images. Use "PNG" instead.');
  try {
    // The PNG goes in as a promise so the copy still counts as part of the click (Safari asks for that).
    const blob = toPngBlob(document, scene, { background: !transparent }).then((b) => b || Promise.reject(new Error('png')));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    notify(sel.length ? 'Selection copied as PNG.' : 'Drawing copied as PNG.');
  } catch {
    notify('Could not copy the image. Use "PNG" instead.');
  }
}
$('copy-png').addEventListener('click', copyPng);

$('svg').addEventListener('click', () => {
  const scene = editor.getScene();
  if (!scene.elements.length) return notify('The drawing is empty.');
  download(toSvgString(scene, { background: !$('transparent').checked }), `${fileName}.svg`, 'image/svg+xml');
});

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
for (const id of ['new', 'save', 'png', 'svg', 'copy-png']) $(id).addEventListener('click', () => setTimeout(closeMenu, 0));
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
  name.textContent = label;
  const wrap = document.createElement('label');
  wrap.title = label;
  wrap.append(input, chip, name);
  input.addEventListener('change', () => editor.setBackground(color));
  swatches.append(wrap);
}

// The menu shows the current choices each time it opens.
function syncMenu() {
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
  openFile(file);
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
