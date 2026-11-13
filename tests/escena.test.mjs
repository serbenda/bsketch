import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/escena.js';
import { toSvgString } from '../js/pintar.js';
import { polylinePath, ellipsePath, toSvgD } from '../js/trazo.js';

test('el trazo a mano sale siempre igual para la misma semilla', () => {
  const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }];
  assert.equal(toSvgD(polylinePath(pts, { seed: 42 })), toSvgD(polylinePath(pts, { seed: 42 })));
  assert.notEqual(toSvgD(polylinePath(pts, { seed: 42 })), toSvgD(polylinePath(pts, { seed: 43 })));
  assert.equal(toSvgD(polylinePath(pts, { seed: 1, roughness: 0 })), 'M0 0 L100 0 M100 0 L100 50');
  assert.ok(ellipsePath(0, 0, 100, 60, { seed: 3 }).length > 20);
});

test('cajas, toques y selección por recuadro', () => {
  const r = { ...E.createElement('rectangle', 10, 10), w: 100, h: 50 };
  assert.deepEqual(E.bounds(r), { x: 10, y: 10, w: 100, h: 50 });
  assert.ok(E.hitTest(r, 10, 30), 'en el borde');
  assert.ok(!E.hitTest(r, 60, 35), 'sin relleno, el centro no se toca');
  assert.ok(E.hitTest({ ...r, fill: '#ffc9c9' }, 60, 35), 'con relleno, sí');
  const back = { ...E.createElement('rectangle', 10, 10), w: -40, h: -20 };
  assert.deepEqual(E.bounds(back), { x: -30, y: -10, w: 40, h: 20 });
  const arrow = { ...E.createElement('arrow', 0, 0), points: [{ x: 0, y: 0 }, { x: 100, y: 100 }] };
  assert.ok(E.hitTest(arrow, 50, 51));
  assert.ok(!E.hitTest(arrow, 80, 20));
  const e = { ...E.createElement('ellipse', 0, 0), w: 100, h: 100 };
  assert.ok(E.hitTest(e, 50, 1));
  assert.ok(!E.hitTest(e, 50, 50));
  assert.equal(E.elementAt([r, { ...r, id: 'arriba', fill: '#000' }], 60, 35).id, 'arriba');
  assert.deepEqual(E.elementsInBox([r, arrow], { x: 0, y: 0, w: 120, h: 70 }).map((x) => x.type), ['rectangle']);
});

test('mover y redimensionar formas, líneas y texto', () => {
  const r = { ...E.createElement('rectangle', 0, 0), w: 100, h: 50 };
  assert.deepEqual(E.bounds(E.moveElement(r, 5, 6)), { x: 5, y: 6, w: 100, h: 50 });
  assert.deepEqual(E.bounds(E.resizeElement(r, E.bounds(r), { x: 0, y: 0, w: 200, h: 25 })), { x: 0, y: 0, w: 200, h: 25 });
  const l = { ...E.createElement('line', 10, 10), points: [{ x: 0, y: 0 }, { x: 10, y: 20 }] };
  const l2 = E.resizeElement(l, E.bounds(l), { x: 10, y: 10, w: 20, h: 40 });
  assert.deepEqual(l2.points, [{ x: 0, y: 0 }, { x: 20, y: 40 }]);
  const t = { ...E.createElement('text', 0, 0), text: 'hola', fontSize: 20 };
  assert.equal(E.resizeElement(t, E.bounds(t), { ...E.bounds(t), h: E.bounds(t).h * 2 }).fontSize, 40);
});

test('abrir: valida lo que llega del fichero', () => {
  const evil = JSON.stringify({
    type: 'sketch',
    elements: [
      { type: 'rectangle', x: '10', y: 5, w: 50, h: 20, stroke: 'red" onload="alert(1)', width: 9999 },
      { type: 'script', x: 0 },
      { type: 'text', x: 0, y: 0, text: '<img src=x onerror=alert(1)>' },
      { type: 'line', x: 0, y: 0, points: [] },
      null,
    ],
  });
  const s = E.parseScene(evil);
  assert.equal(s.elements.length, 2);
  assert.equal(s.elements[0].x, 10);
  assert.equal(s.elements[0].stroke, E.DEFAULT_STYLE.stroke, 'color raro → por defecto');
  assert.equal(s.elements[0].width, 40, 'grosor acotado');
  const svg = toSvgString(s);
  assert.ok(!svg.includes('<img') && !svg.includes('onload='), svg);
  assert.ok(svg.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.throws(() => E.parseScene('no es json'), /bad_file/);
  assert.throws(() => E.parseScene('{"type":"otra cosa"}'), /bad_file/);
});

test('guardar y volver a abrir deja el mismo dibujo', () => {
  const scene = E.emptyScene();
  scene.elements.push({ ...E.createElement('diamond', 0, 0, { fill: '#a5d8ff', fillStyle: 'solid' }), w: 80, h: 60 });
  scene.elements.push({ ...E.createElement('text', 10, 100), text: 'Hola\nmundo' });
  assert.deepEqual(E.parseScene(E.serializeScene(scene)), scene);
});

test('abrir un .excalidraw', () => {
  const ex = {
    type: 'excalidraw',
    version: 2,
    appState: { viewBackgroundColor: '#fffce8' },
    elements: [
      { id: 'a', type: 'rectangle', x: 0, y: 0, width: 100, height: 40, strokeColor: '#1971c2', backgroundColor: '#a5d8ff', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'dashed', roughness: 1, opacity: 80, seed: 5 },
      { id: 'b', type: 'arrow', x: 100, y: 20, width: 80, height: 0, points: [[0, 0], [80, 0]], strokeColor: '#000', backgroundColor: 'transparent', strokeWidth: 1, roughness: 0, opacity: 100 },
      { id: 'c', type: 'text', x: 10, y: 10, width: 50, height: 20, text: 'Caja', fontSize: 20, strokeColor: '#000', opacity: 100 },
      { id: 'd', type: 'freedraw', x: 0, y: 60, points: [[0, 0], [5, 5], [10, 2]], strokeColor: '#e03131', opacity: 100 },
      { id: 'e', type: 'image', x: 0, y: 0 },
      { id: 'f', type: 'rectangle', isDeleted: true, x: 0, y: 0 },
    ],
  };
  const s = E.parseScene(JSON.stringify(ex));
  assert.equal(s.background, '#fffce8');
  assert.deepEqual(s.elements.map((e) => e.type), ['rectangle', 'arrow', 'text', 'draw']);
  assert.equal(s.elements[0].dashed, true);
  assert.equal(s.elements[0].opacity, 0.8);
  assert.equal(s.elements[0].fillStyle, 'solid');
  assert.deepEqual(s.elements[1].points, [{ x: 0, y: 0 }, { x: 80, y: 0 }]);
  assert.equal(s.elements[2].text, 'Caja');
});

test('SVG de una escena completa', () => {
  const scene = E.emptyScene();
  scene.elements.push({ ...E.createElement('ellipse', 0, 0, { fill: '#ffec99' }), w: 120, h: 80 });
  scene.elements.push({ ...E.createElement('arrow', 130, 40), points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] });
  const svg = toSvgString(scene);
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /clipPath/, 'el rayado va recortado a la forma');
  assert.ok((svg.match(/<path /g) || []).length >= 4);
});

test('el rayado cubre toda la caja', async () => {
  const { hachurePath } = await import('../js/trazo.js');
  const p = hachurePath(0, 0, 160, 140, { gap: 8, roughness: 0 });
  const starts = p.filter((c) => c.op === 'M');
  assert.ok(starts.length >= 25, `${starts.length} líneas`);
  for (const s of starts) assert.ok(s.x >= -1 && s.x <= 161 && s.y >= -1 && s.y <= 141);
});
