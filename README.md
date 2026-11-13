# sketch

> Pizarra para dibujar a mano alzada: esquemas, diagramas y bocetos. Sin cuentas, sin instalar nada y sin enviar
> nada a ningún servidor.

🔗 **Web:** https://serbenda.github.io/sketch/

## Qué hace
- Rectángulos, rombos, elipses, flechas, líneas, lápiz y texto, con trazo y letra «a mano».
- **Texto dentro de las formas:** doble clic en una caja para escribir; va centrado, se parte al ancho y se mueve,
  se redimensiona y gira con ella.
- **Flechas pegadas:** una flecha que empieza o acaba en una forma se queda unida a su borde al moverla.
- Relleno rayado o sólido, colores, grosor, línea discontinua y nivel de «trazo a mano».
- Seleccionar, mover, redimensionar, **girar**, **agrupar**, **alinear y repartir**, duplicar, ordenar, borrar,
  deshacer y rehacer; zoom y desplazamiento, también con dos dedos en el móvil.
- Funciona **sin conexión** una vez abierta y se puede instalar como aplicación.
- Guarda y abre ficheros `.sketch`, abre los `.excalidraw` y exporta a **PNG** y **SVG**.
- El dibujo en curso se queda en el navegador para no perderlo.
- Se integra en [Snowlog](https://github.com/serbenda/snowlog): allí los dibujos se guardan cifrados y se ven
  dentro de las notas.

## Atajos

| Tecla | Acción |
| --- | --- |
| V · H | Seleccionar · mover el lienzo (o mantener Espacio) |
| R · D · O | Rectángulo · rombo · elipse |
| A · L · P · T · E | Flecha · línea · lápiz · texto · borrar |
| Mayús | Proporción fija al dibujar o redimensionar; ángulos de 15° en líneas y al girar |
| Ctrl+Z · Ctrl+Y | Deshacer · rehacer |
| Ctrl+D · Ctrl+C · Ctrl+V | Duplicar · copiar · pegar |
| Ctrl+G · Ctrl+Mayús+G | Agrupar · desagrupar |
| Supr · Flechas | Borrar · mover lo seleccionado (Mayús: de 10 en 10) |
| Ctrl+rueda · Ctrl+0 | Zoom · volver al 100 % |
| Doble clic · Intro | Escribir texto: dentro de la forma si se hace sobre ella (o editar el que ya hay) |

Para girar, arrastra el círculo que aparece encima de lo seleccionado.

## Fuentes de datos
Ninguna: no hay llamadas de red. El formato `.excalidraw` se lee como JSON público; no se usa código de Excalidraw.

La letra a mano es [Caveat](https://github.com/googlefonts/caveat), con licencia SIL Open Font License
([fonts/OFL.txt](fonts/OFL.txt)), recortada a los caracteres latinos y servida desde el propio sitio.

## Uso en local
```bash
git clone https://github.com/serbenda/sketch.git
cd sketch
git switch development
python3 -m http.server 8000   # abre http://localhost:8000
npm test                      # tests del motor (Node 20+, sin dependencias)
npm run test:e2e              # recorridos en Chrome (Node 22+; CHROME_BIN si no está en /usr/bin)
```

## Estructura
```
.
├── index.html
├── icon.svg · manifest.webmanifest
├── sw.js             # service worker: la web sin conexión
├── fonts/            # letra a mano (Caveat, OFL)
├── css/estilos.css   # la página
├── css/sketch.css    # el editor (prefijo sk-, se puede incrustar)
├── js/trazo.js       # trazo «a mano» con semilla → caminos para canvas y SVG
├── js/escena.js      # elementos: crear, medir, tocar, mover, girar, enlazar, abrir/guardar, .excalidraw
├── js/pintar.js      # escena → canvas, SVG (texto o DOM) y PNG
├── js/editor.js      # el editor interactivo, montable en cualquier contenedor
├── js/app.js         # la web: abrir, guardar y exportar
├── tests/            # node --test; tests/e2e: recorridos en Chrome por DevTools, sin dependencias
├── docs/             # Definition of Done, guía de seguridad
└── .claude/ · .githooks/ · AGENTS.md · CLAUDE.md
```

## Cómo contribuir
Lee [CONTRIBUTING.md](CONTRIBUTING.md) y la [Definition of Done](docs/DEFINITION_OF_DONE.md).

## Licencia
[MIT](LICENSE) © Sergio Santiago Bendaña Quesada
