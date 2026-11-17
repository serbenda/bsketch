// The sketch site: the editor full screen, with opening, saving and exporting files on the computer.
// The drawing in progress is kept in this browser so it is not lost when the tab closes.

import { createEditor } from './editor.js';
import { emptyScene, parseScene, serializeScene } from './scene.js';
import { toSvgString, toPngBlob } from './render.js';

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
  download(await toPngBlob(document, scene), `${fileName}.png`, 'image/png');
});
$('svg').addEventListener('click', () => {
  const scene = editor.getScene();
  if (!scene.elements.length) return notify('The drawing is empty.');
  download(toSvgString(scene), `${fileName}.svg`, 'image/svg+xml');
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
