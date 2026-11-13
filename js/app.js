// Web de sketch: el editor a pantalla completa, con abrir, guardar y exportar ficheros del ordenador.
// El dibujo en curso se guarda en este navegador para no perderlo al cerrar la pestaña.

import { createEditor } from './editor.js';
import { emptyScene, parseScene, serializeScene } from './escena.js';
import { toSvgString, toPngBlob } from './pintar.js';

const KEY = 'sketch.actual';
const $ = (id) => document.getElementById(id);
const estado = $('estado');
let nombre = 'dibujo';

function avisar(texto) {
  estado.textContent = texto;
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => { estado.textContent = ''; }, 3500);
}

function guardado() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? parseScene(raw) : null;
  } catch {
    return null;
  }
}

let temporizador = 0;
const editor = createEditor($('lienzo'), {
  scene: guardado() || emptyScene(),
  onChange: (scene) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      try {
        localStorage.setItem(KEY, serializeScene(scene));
      } catch {
        avisar('No se ha podido guardar en este navegador. Usa «Guardar» para no perder el dibujo.');
      }
    }, 400);
  },
});
editor.focus();

function descargar(datos, fichero, tipo) {
  const url = URL.createObjectURL(datos instanceof Blob ? datos : new Blob([datos], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fichero;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function abrir(file) {
  try {
    const scene = parseScene(await file.text());
    editor.setScene(scene);
    localStorage.setItem(KEY, serializeScene(scene));
    nombre = file.name.replace(/\.(sketch|excalidraw|json)$/i, '') || 'dibujo';
    avisar(`Abierto «${file.name}»: ${scene.elements.length} elementos.`);
  } catch {
    avisar('Ese fichero no es un dibujo de sketch ni de Excalidraw.');
  }
}

$('nuevo').addEventListener('click', () => {
  if (editor.getScene().elements.length && !window.confirm('¿Empezar un dibujo nuevo? El actual se borrará de este navegador (guárdalo antes si lo quieres).')) return;
  editor.setScene(emptyScene());
  nombre = 'dibujo';
  try { localStorage.removeItem(KEY); } catch { /* sin almacenamiento */ }
  editor.focus();
});
$('abrir').addEventListener('click', () => $('fichero').click());
$('fichero').addEventListener('change', (ev) => {
  const [file] = ev.target.files;
  ev.target.value = '';
  if (file) abrir(file);
});
$('guardar').addEventListener('click', () => {
  descargar(serializeScene(editor.getScene()), `${nombre}.sketch`, 'application/json');
  avisar('Descargado. Puedes volver a abrirlo con «Abrir…».');
});
$('png').addEventListener('click', async () => {
  const scene = editor.getScene();
  if (!scene.elements.length) return avisar('El dibujo está vacío.');
  descargar(await toPngBlob(document, scene), `${nombre}.png`, 'image/png');
});
$('svg').addEventListener('click', () => {
  const scene = editor.getScene();
  if (!scene.elements.length) return avisar('El dibujo está vacío.');
  descargar(toSvgString(scene), `${nombre}.svg`, 'image/svg+xml');
});

// Arrastrar un fichero encima de la página lo abre.
window.addEventListener('dragover', (ev) => {
  if (ev.dataTransfer?.types.includes('Files')) ev.preventDefault();
});
window.addEventListener('drop', (ev) => {
  const [file] = ev.dataTransfer?.files || [];
  if (!file) return;
  ev.preventDefault();
  abrir(file);
});
