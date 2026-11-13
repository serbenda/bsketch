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

test('girar: la caja en pantalla, los toques y las vueltas completas', () => {
  const r = { ...E.createElement('rectangle', 0, 0), w: 100, h: 20 };
  const g = E.rotateElement(r, E.center(r), Math.PI / 2);
  assert.ok(Math.abs(g.angle - Math.PI / 2) < 1e-9);
  const box = E.aabb(g);
  assert.ok(Math.abs(box.w - 20) < 1e-6 && Math.abs(box.h - 100) < 1e-6, JSON.stringify(box));
  assert.ok(E.hitTest(g, 50, -40), 'el lado corto, ahora arriba');
  assert.ok(!E.hitTest(g, 0, 10), 'donde estaba la esquina ya no hay nada');
  assert.equal(E.rotateElement(g, E.center(g), -Math.PI / 2).angle, undefined, 'de vuelta a 0 no guarda giro');
  // Las líneas giran sus puntos.
  const l = { ...E.createElement('line', 0, 0), points: [{ x: 0, y: 0 }, { x: 10, y: 0 }] };
  const lg = E.rotateElement(l, { x: 0, y: 0 }, Math.PI / 2);
  assert.ok(Math.abs(lg.points[1].x) < 1e-9 && Math.abs(lg.points[1].y - 10) < 1e-9);
  assert.equal(lg.angle, undefined);
});

test('redimensionar un elemento girado por su tirador', () => {
  const r = { ...E.createElement('rectangle', 0, 0), w: 100, h: 50, angle: Math.PI / 2 };
  // Girado 90°, el tirador "e" (derecha) queda abajo: tirar hacia abajo lo alarga.
  const c = E.center(r);
  const e = E.rotatePoint({ x: 100, y: 25 }, c, Math.PI / 2);
  const out = E.resizeByHandle(r, 'e', { x: e.x, y: e.y + 40 });
  assert.ok(Math.abs(out.w - 140) < 1e-6 && Math.abs(out.h - 50) < 1e-6, JSON.stringify(out));
  assert.equal(out.angle, Math.PI / 2);
  const t = { ...E.createElement('text', 0, 0), text: 'hola', fontSize: 20 };
  assert.equal(E.resizeByHandle(t, 'se', { x: E.bounds(t).w * 2, y: E.bounds(t).h * 2 }).fontSize, 40);
});

test('texto dentro de una forma: centrado, partido y la sigue', () => {
  const box = { ...E.createElement('rectangle', 0, 0), id: 'caja', w: 120, h: 80 };
  const t = { ...E.createElement('text', 0, 0), id: 't', text: 'una frase bastante larga', fontSize: 20, containerId: 'caja' };
  let els = E.syncBindings([box, t]);
  const bt = els[1];
  assert.equal(bt.align, 'center');
  assert.ok(E.textLines(bt).length > 1, 'se parte en varias líneas');
  const tb = E.bounds(bt);
  assert.ok(Math.abs(tb.x + tb.w / 2 - 60) < 1e-6 && Math.abs(tb.y + tb.h / 2 - 40) < 1e-6, 'centrado');
  els = E.syncBindings([E.moveElement(els[0], 100, 0), els[1]]);
  assert.ok(Math.abs(E.center(els[1]).x - 160) < 1e-6, 'se mueve con la caja');
  els = E.syncBindings([els[1]]);
  assert.equal(els[0].containerId, undefined, 'sin caja queda como texto suelto');
  assert.equal(E.isBoundText(els[0]), false);
  assert.deepEqual(E.textLines({ ...t, w: 1, containerId: 'x' }).join(''), t.text.replace(/\s/g, ''), 'palabra a palabra, sin perder letras');
});

test('flechas pegadas: van de borde a borde y siguen a las formas', () => {
  const a = { ...E.createElement('rectangle', 0, 0), id: 'a', w: 100, h: 100 };
  const b = { ...E.createElement('ellipse', 300, 0), id: 'b', w: 100, h: 100 };
  const f = { ...E.createElement('arrow', 50, 50), id: 'f', points: [{ x: 0, y: 0 }, { x: 300, y: 0 }], startId: 'a', endId: 'b' };
  let [, , arrow] = E.syncBindings([a, b, f]);
  const end = (x) => ({ x: x.x + x.points[1].x, y: x.y + x.points[1].y });
  assert.ok(Math.abs(arrow.x - 106) < 1e-6 && Math.abs(arrow.y - 50) < 1e-6, `sale del borde derecho de a: ${arrow.x},${arrow.y}`);
  assert.ok(Math.abs(end(arrow).x - 294) < 1e-6, `llega al borde izquierdo de b: ${end(arrow).x}`);
  [, , arrow] = E.syncBindings([a, E.moveElement(b, 0, 300), arrow]);
  assert.ok(end(arrow).y > 250, 'al mover b, la punta lo sigue');
  // Sin la forma, la flecha se queda donde está y deja de estar pegada.
  const [alone] = E.syncBindings([arrow]);
  assert.equal(alone.startId, undefined);
  assert.equal(alone.endId, undefined);
  assert.equal(alone.x, arrow.x);
  // Girada, el borde también cuenta: un cuadrado a 45° tiene la esquina a 50·√2 del centro.
  const rot = { ...a, angle: Math.PI / 4 };
  const p = E.outlinePoint(rot, { x: 500, y: 50 }, 0);
  assert.ok(Math.abs(p.x - (50 + 50 * Math.SQRT2)) < 1e-6, String(p.x));
});

test('copiar rehace los enlaces y grupos entre las copias', () => {
  const a = { ...E.createElement('rectangle', 0, 0), id: 'a', w: 50, h: 50, group: 'g' };
  const t = { ...E.createElement('text', 0, 0), id: 't', text: 'A', containerId: 'a', group: 'g' };
  const f = { ...E.createElement('arrow', 0, 0), id: 'f', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }], startId: 'a', endId: 'zz' };
  const [ca, ct, cf] = E.cloneElements([a, t, f], 10, 0);
  assert.notEqual(ca.id, 'a');
  assert.equal(ct.containerId, ca.id);
  assert.equal(cf.startId, ca.id);
  assert.equal(cf.endId, undefined, 'la otra forma no se copió');
  assert.equal(ca.group, ct.group);
  assert.notEqual(ca.group, 'g');
  assert.equal(ca.x, 10);
});

test('abrir: giro, grupos y enlaces se validan y se conservan', () => {
  const scene = E.emptyScene();
  scene.elements.push({ ...E.createElement('rectangle', 0, 0), id: 'a', w: 80, h: 40, angle: 0.5, group: 'g1' });
  scene.elements.push({ ...E.createElement('text', 0, 0), id: 't', text: 'Hola', containerId: 'a', align: 'center' });
  scene.elements.push({ ...E.createElement('arrow', 200, 0), id: 'f', points: [{ x: 0, y: 0 }, { x: 50, y: 0 }], startId: 'a' });
  const s = E.parseScene(E.serializeScene({ ...scene, elements: E.syncBindings(scene.elements) }));
  assert.deepEqual(E.parseScene(E.serializeScene(s)), s, 'guardar y abrir no cambia nada');
  assert.equal(s.elements[0].angle, 0.5);
  assert.equal(s.elements[0].group, 'g1');
  assert.equal(s.elements[1].containerId, 'a');
  assert.equal(s.elements[2].startId, 'a');
  const evil = E.parseScene(JSON.stringify({ type: 'sketch', elements: [
    { type: 'rectangle', x: 0, y: 0, w: 10, h: 10, angle: 'x', group: { a: 1 } },
    { type: 'arrow', x: 0, y: 0, points: [{ x: 0, y: 0 }, { x: 5, y: 5 }], startId: 'x'.repeat(500) },
  ] }));
  assert.equal(evil.elements[0].angle, undefined);
  assert.equal(evil.elements[0].group, undefined);
  assert.equal(evil.elements[1].startId, undefined);
});

test('abrir un .excalidraw con texto dentro, flechas pegadas, grupos y giro', () => {
  const s = E.parseScene(JSON.stringify({
    type: 'excalidraw',
    elements: [
      { id: 'r', type: 'rectangle', x: 0, y: 0, width: 100, height: 60, angle: 0.3, groupIds: ['in', 'out'], strokeColor: '#000', opacity: 100 },
      { id: 'tx', type: 'text', x: 0, y: 0, width: 40, height: 20, text: 'Ca\nja', originalText: 'Caja', containerId: 'r', fontSize: 20, opacity: 100 },
      { id: 'o', type: 'ellipse', x: 300, y: 0, width: 80, height: 60, opacity: 100 },
      { id: 'ar', type: 'arrow', x: 100, y: 30, points: [[0, 0], [200, 0]], startBinding: { elementId: 'r' }, endBinding: { elementId: 'o' }, opacity: 100 },
    ],
  }));
  const [r, t, , ar] = s.elements;
  assert.equal(r.angle, 0.3);
  assert.equal(r.group, 'out');
  assert.equal(t.containerId, 'r');
  assert.equal(t.text, 'Caja', 'el texto original, sin los saltos del ajuste');
  assert.equal(ar.startId, 'r');
  assert.equal(ar.endId, 'o');
});
