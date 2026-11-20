// © 2026 Sergio Santiago Bendaña Quesada. All rights reserved: no use, copy or reuse without written permission,
// and no use by AI or automated tools (training, datasets, retrieval, code generation, scraping). See LICENSE. bsketch-7f3a9c2e
// The interface's languages. The text is written in English in the code; other languages translate it here,
// string by string. A string with no translation is shown in English. {name}-style holes are filled by fill().

export const LANGS = ['en', 'es'];

const ES = {
  // Editor: tools
  Select: 'Seleccionar', 'Pan the canvas': 'Mover el lienzo', Rectangle: 'Rectángulo', Diamond: 'Rombo',
  Ellipse: 'Elipse', Arrow: 'Flecha', Line: 'Línea', Pencil: 'Lápiz', Text: 'Texto', Eraser: 'Goma',
  Tools: 'Herramientas', Whiteboard: 'Pizarra', Drawing: 'Dibujo', 'Drawing canvas': 'Lienzo de dibujo',
  'Tools: V select, R rectangle, D diamond, O ellipse, A arrow, L line, P pencil, T text, F frame, E eraser; I inserts an image; G shows the grid. Ctrl+arrow keys add the next shape, joined by an arrow. Enter creates the chosen shape in the center, or writes inside the selected one. Tab and Shift+Tab go through the elements; arrow keys move them; Alt+arrow keys resize them; [ and ] rotate them; Delete removes them; Escape clears the selection.':
    'Herramientas: V seleccionar, R rectángulo, D rombo, O elipse, A flecha, L línea, P lápiz, T texto, F marco, E goma; I inserta una imagen; G muestra la rejilla. Ctrl+flechas añade la siguiente forma, unida con una flecha. Intro crea la forma elegida en el centro, o escribe dentro de la seleccionada. Tab y Mayús+Tab recorren los elementos; las flechas los mueven; Alt+flechas cambian su tamaño; [ y ] los giran; Supr los borra; Escape quita la selección.',
  // Editor: frames, images and the library
  Frame: 'Marco', 'Name of this frame:': 'Nombre de este marco:', 'Insert an image': 'Insertar una imagen',
  'That file is not a picture bsketch can use (PNG, JPEG, GIF or WebP).': 'Ese archivo no es una imagen que bsketch pueda usar (PNG, JPEG, GIF o WebP).',
  Library: 'Biblioteca', 'Close the library': 'Cerrar la biblioteca', 'Import a library': 'Importar una biblioteca',
  'Export the library': 'Exportar la biblioteca', Add: 'Añadir', 'Library items': 'Elementos de la biblioteca',
  'Select something and press "Add" to keep it here.': 'Selecciona algo y pulsa «Añadir» para guardarlo aquí.',
  Item: 'Elemento', Insert: 'Insertar', 'Remove from the library': 'Quitar de la biblioteca',
  'Could not keep the library in this browser.': 'No se ha podido guardar la biblioteca en este navegador.',
  'Select what you want to keep in the library first.': 'Selecciona antes lo que quieras guardar en la biblioteca.',
  'The library is full: remove something first.': 'La biblioteca está llena: quita algo antes.',
  'The library is empty.': 'La biblioteca está vacía.', 'That file is not a library.': 'Ese archivo no es una biblioteca.',
  'Added to the library: {n}.': 'Añadido a la biblioteca: {n}.', image: 'imagen', frame: 'marco',
  // Editor: style panel
  Style: 'Estilo', Stroke: 'Trazo', Fill: 'Relleno', 'No fill': 'Sin relleno', 'Other stroke color': 'Otro color de trazo',
  'Other fill color': 'Otro color de relleno', 'Fill style': 'Tipo de relleno', Hachure: 'Rayado', Solid: 'Sólido',
  Width: 'Grosor', 'Stroke width': 'Grosor del trazo', Thin: 'Fino', Medium: 'Medio', Bold: 'Grueso',
  'Line style': 'Tipo de línea', Dashed: 'Discontinua', Arrowheads: 'Puntas de flecha', End: 'Final', Start: 'Inicio',
  Both: 'Ambas', None: 'Ninguna', Route: 'Recorrido', Flow: 'Flujo', Still: 'Quieto', Animated: 'Animado', Straight: 'Recto', Elbow: 'Con codo', Curve: 'Curva',
  Sloppiness: 'Trazo a mano', 'Hand-drawn': 'A mano', Sketchy: 'Boceto', Font: 'Letra', Hand: 'A mano',
  Normal: 'Normal', Code: 'Código', 'Text size': 'Tamaño del texto', Align: 'Alinear', 'Align left': 'Alinear a la izquierda',
  'Center horizontally': 'Centrar en horizontal', 'Align right': 'Alinear a la derecha', 'Align top': 'Alinear arriba',
  'Center vertically': 'Centrar en vertical', 'Align bottom': 'Alinear abajo', 'Distribute horizontally': 'Repartir en horizontal',
  'Distribute vertically': 'Repartir en vertical', 'Layers and actions': 'Capas y acciones', 'Bring to front': 'Traer al frente',
  'Send to back': 'Enviar al fondo', 'Duplicate (Ctrl+D)': 'Duplicar (Ctrl+D)', 'Group (Ctrl+G)': 'Agrupar (Ctrl+G)',
  'Ungroup (Ctrl+Shift+G)': 'Desagrupar (Ctrl+Mayús+G)', 'Delete (Del)': 'Borrar (Supr)',
  // Editor: bottom bar and status
  'Zoom out': 'Alejar', 'Zoom in': 'Acercar', 'Reset to 100%': 'Volver al 100 %', 'Fit the whole drawing': 'Ajustar todo el dibujo',
  'Undo (Ctrl+Z)': 'Deshacer (Ctrl+Z)', 'Redo (Ctrl+Y)': 'Rehacer (Ctrl+Y)', 'Selected:': 'Seleccionado:',
  'Selected: {n} elements': 'Seleccionados: {n} elementos', 'Grid on': 'Rejilla activada', 'Grid off': 'Rejilla desactivada',
  rectangle: 'rectángulo', ellipse: 'elipse', diamond: 'rombo', line: 'línea', arrow: 'flecha', drawing: 'dibujo', text: 'texto',
  // Site: menu
  Menu: 'Menú', 'Close the menu': 'Cerrar el menú', 'Skip to the canvas': 'Saltar al lienzo',
  'Drawings in this browser': 'Dibujos en este navegador', 'Rename…': 'Renombrar…', 'Delete…': 'Borrar…', File: 'Archivo',
  'New drawing': 'Dibujo nuevo', 'Open…': 'Abrir…', Save: 'Guardar', Export: 'Exportar', 'Copy as PNG': 'Copiar como PNG',
  'Transparent background': 'Fondo transparente', 'Only the selection': 'Solo la selección', 'Portable version': 'Versión portátil',
  'A single file that opens with a double click, offline': 'Un solo archivo que se abre con doble clic, sin conexión',
  'All rights reserved.': 'Todos los derechos reservados.',
  'Start from a template': 'Empezar con una plantilla', 'Text to diagram…': 'Texto a diagrama…', 'Text to diagram': 'Texto a diagrama',
  'Write or paste an indented list, a Mermaid flowchart or lines like': 'Escribe o pega una lista con sangría, un diagrama de flujo de Mermaid o líneas como',
  '. It is drawn here, in your browser: the text is not sent anywhere.': '. Se dibuja aquí, en tu navegador: el texto no se envía a ningún sitio.',
  'Examples:': 'Ejemplos:', Examples: 'Ejemplos', List: 'Lista', Arrows: 'Flechas', Direction: 'Dirección',
  'As written': 'Como esté escrito', Down: 'Hacia abajo', 'To the right': 'Hacia la derecha', Cancel: 'Cancelar',
  '{n} boxes, {e} arrows': '{n} cajas, {e} flechas', 'Drawn: {n} boxes, {e} arrows.': 'Dibujado: {n} cajas, {e} flechas.',
  'Not a diagram yet: write two lines or more.': 'Aún no es un diagrama: escribe dos líneas o más.', License: 'Licencia', Appearance: 'Apariencia', System: 'Sistema', Light: 'Claro', Dark: 'Oscuro', Language: 'Idioma', Automatic: 'Automático',
  'Canvas background': 'Fondo del lienzo', 'Show grid': 'Mostrar rejilla', White: 'Blanco', Paper: 'Papel',
  'Light grey': 'Gris claro', 'Light blue': 'Azul claro', 'Light yellow': 'Amarillo claro', 'Light green': 'Verde claro',
  'In the dark appearance the canvas is shown inverted. Files and exports keep the real colour.':
    'Con la apariencia oscura el lienzo se ve invertido. Los archivos y las exportaciones conservan el color real.',
  // Site: messages
  'Could not save in this browser. Use "Save" so you do not lose the drawing.': 'No se ha podido guardar en este navegador. Usa «Guardar» para no perder el dibujo.',
  'That file is not a sketch or Excalidraw drawing.': 'Ese archivo no es un dibujo de bsketch ni de Excalidraw.',
  'Opened "{name}": {n} elements.': 'Abierto «{name}»: {n} elementos.',
  'Could not keep another drawing in this browser (its storage is full): delete some first.': 'No caben más dibujos en este navegador (su almacenamiento está lleno): borra alguno antes.',
  'Name of this drawing:': 'Nombre de este dibujo:', Recovered: 'Recuperado',
  'Delete "{name}" from this browser? It can\'t be undone (Save it first if you want to keep a copy).': '¿Borrar «{name}» de este navegador? No se puede deshacer (guárdalo antes si quieres una copia).',
  'Downloaded. You can open it again with "Open…".': 'Descargado. Puedes volver a abrirlo con «Abrir…».',
  'Nothing is selected.': 'No hay nada seleccionado.', 'The drawing is empty.': 'El dibujo está vacío.',
  'This browser could not make the PNG. Try SVG instead.': 'Este navegador no ha podido hacer el PNG. Prueba con SVG.',
  'This browser cannot copy images. Use "PNG" instead.': 'Este navegador no puede copiar imágenes. Usa «PNG».',
  'Selection copied as PNG.': 'Selección copiada como PNG.', 'Drawing copied as PNG.': 'Dibujo copiado como PNG.',
  'Could not copy the image. Use "PNG" instead.': 'No se ha podido copiar la imagen. Usa «PNG».',
};

const DICTS = { en: {}, es: ES };

// The language to use: the one chosen, or the browser's when it is "auto" (English if it isn't one we have).
export function pickLang(choice, navigatorLangs = []) {
  if (LANGS.includes(choice)) return choice;
  for (const l of navigatorLangs) {
    const base = String(l || '').toLowerCase().split('-')[0];
    if (LANGS.includes(base)) return base;
  }
  return 'en';
}

// A translator for one language: t('English text') → its translation, or the English text itself.
export function translator(lang) {
  const dict = DICTS[lang] || {};
  return (s) => (Object.hasOwn(dict, s) ? dict[s] : s);
}

// Fills {name}-style holes after translating: fill(t('Opened "{name}"'), { name }).
export const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => (Object.hasOwn(vars, k) ? String(vars[k]) : m));
