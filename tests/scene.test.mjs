import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/scene.js';
import { toSvgString, pngScale, PNG_MAX_SIDE, PNG_MAX_AREA } from '../js/render.js';
import { polylinePath, ellipsePath, toSvgD } from '../js/stroke.js';

test('the hand-drawn stroke is always the same for the same seed', () => {
  const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }];
  assert.equal(toSvgD(polylinePath(pts, { seed: 42 })), toSvgD(polylinePath(pts, { seed: 42 })));
  assert.notEqual(toSvgD(polylinePath(pts, { seed: 42 })), toSvgD(polylinePath(pts, { seed: 43 })));
  assert.equal(toSvgD(polylinePath(pts, { seed: 1, roughness: 0 })), 'M0 0 L100 0 M100 0 L100 50');
  assert.ok(ellipsePath(0, 0, 100, 60, { seed: 3 }).length > 20);
});

test('boxes, hit-testing and box selection', () => {
  const r = { ...E.createElement('rectangle', 10, 10), w: 100, h: 50 };
  assert.deepEqual(E.bounds(r), { x: 10, y: 10, w: 100, h: 50 });
  assert.ok(E.hitTest(r, 10, 30), 'on the outline');
  assert.ok(!E.hitTest(r, 60, 35), 'without fill, the center is not hit');
  assert.ok(E.hitTest({ ...r, fill: '#ffc9c9' }, 60, 35), 'with fill, it is');
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

test('moving and resizing shapes, lines and text', () => {
  const r = { ...E.createElement('rectangle', 0, 0), w: 100, h: 50 };
  assert.deepEqual(E.bounds(E.moveElement(r, 5, 6)), { x: 5, y: 6, w: 100, h: 50 });
  assert.deepEqual(E.bounds(E.resizeElement(r, E.bounds(r), { x: 0, y: 0, w: 200, h: 25 })), { x: 0, y: 0, w: 200, h: 25 });
  const l = { ...E.createElement('line', 10, 10), points: [{ x: 0, y: 0 }, { x: 10, y: 20 }] };
  const l2 = E.resizeElement(l, E.bounds(l), { x: 10, y: 10, w: 20, h: 40 });
  assert.deepEqual(l2.points, [{ x: 0, y: 0 }, { x: 20, y: 40 }]);
  const t = { ...E.createElement('text', 0, 0), text: 'hello', fontSize: 20 };
  assert.equal(E.resizeElement(t, E.bounds(t), { ...E.bounds(t), h: E.bounds(t).h * 2 }).fontSize, 40);
});

test('opening: validates whatever comes from the file', () => {
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
  assert.equal(s.elements[0].stroke, E.DEFAULT_STYLE.stroke, 'odd color → default');
  assert.equal(s.elements[0].width, 40, 'width clamped');
  const svg = toSvgString(s);
  assert.ok(!svg.includes('<img') && !svg.includes('onload='), svg);
  assert.ok(svg.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.throws(() => E.parseScene('not json'), /bad_file/);
  assert.throws(() => E.parseScene('{"type":"something else"}'), /bad_file/);
});

test('saving and opening again gives the same drawing', () => {
  const scene = E.emptyScene();
  scene.elements.push({ ...E.createElement('diamond', 0, 0, { fill: '#a5d8ff', fillStyle: 'solid' }), w: 80, h: 60 });
  scene.elements.push({ ...E.createElement('text', 10, 100), text: 'Hello\nworld' });
  assert.deepEqual(E.parseScene(E.serializeScene(scene)), scene);
});

test('opening an .excalidraw file', () => {
  const ex = {
    type: 'excalidraw',
    version: 2,
    appState: { viewBackgroundColor: '#fffce8' },
    elements: [
      { id: 'a', type: 'rectangle', x: 0, y: 0, width: 100, height: 40, strokeColor: '#1971c2', backgroundColor: '#a5d8ff', fillStyle: 'solid', strokeWidth: 2, strokeStyle: 'dashed', roughness: 1, opacity: 80, seed: 5 },
      { id: 'b', type: 'arrow', x: 100, y: 20, width: 80, height: 0, points: [[0, 0], [80, 0]], strokeColor: '#000', backgroundColor: 'transparent', strokeWidth: 1, roughness: 0, opacity: 100 },
      { id: 'c', type: 'text', x: 10, y: 10, width: 50, height: 20, text: 'Box', fontSize: 20, strokeColor: '#000', opacity: 100 },
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
  assert.equal(s.elements[2].text, 'Box');
});

test('SVG of a whole scene', () => {
  const scene = E.emptyScene();
  scene.elements.push({ ...E.createElement('ellipse', 0, 0, { fill: '#ffec99' }), w: 120, h: 80 });
  scene.elements.push({ ...E.createElement('arrow', 130, 40), points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] });
  const svg = toSvgString(scene);
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /clipPath/, 'the hachure is clipped to the shape');
  assert.ok((svg.match(/<path /g) || []).length >= 4);
});

test('the hachure covers the whole box', async () => {
  const { hachurePath } = await import('../js/stroke.js');
  const p = hachurePath(0, 0, 160, 140, { gap: 8, roughness: 0 });
  const starts = p.filter((c) => c.op === 'M');
  assert.ok(starts.length >= 25, `${starts.length} lines`);
  for (const s of starts) assert.ok(s.x >= -1 && s.x <= 161 && s.y >= -1 && s.y <= 141);
});

test('rotating: the on-screen box, hit-testing and full turns', () => {
  const r = { ...E.createElement('rectangle', 0, 0), w: 100, h: 20 };
  const g = E.rotateElement(r, E.center(r), Math.PI / 2);
  assert.ok(Math.abs(g.angle - Math.PI / 2) < 1e-9);
  const box = E.aabb(g);
  assert.ok(Math.abs(box.w - 20) < 1e-6 && Math.abs(box.h - 100) < 1e-6, JSON.stringify(box));
  assert.ok(E.hitTest(g, 50, -40), 'the short side, now at the top');
  assert.ok(!E.hitTest(g, 0, 10), 'nothing left where the corner was');
  assert.equal(E.rotateElement(g, E.center(g), -Math.PI / 2).angle, undefined, 'back to 0 stores no angle');
  // Lines rotate their points.
  const l = { ...E.createElement('line', 0, 0), points: [{ x: 0, y: 0 }, { x: 10, y: 0 }] };
  const lg = E.rotateElement(l, { x: 0, y: 0 }, Math.PI / 2);
  assert.ok(Math.abs(lg.points[1].x) < 1e-9 && Math.abs(lg.points[1].y - 10) < 1e-9);
  assert.equal(lg.angle, undefined);
});

test('resizing a rotated element by its handle', () => {
  const r = { ...E.createElement('rectangle', 0, 0), w: 100, h: 50, angle: Math.PI / 2 };
  // Rotated 90°, the "e" (right) handle is at the bottom: dragging it down makes it longer.
  const c = E.center(r);
  const e = E.rotatePoint({ x: 100, y: 25 }, c, Math.PI / 2);
  const out = E.resizeByHandle(r, 'e', { x: e.x, y: e.y + 40 });
  assert.ok(Math.abs(out.w - 140) < 1e-6 && Math.abs(out.h - 50) < 1e-6, JSON.stringify(out));
  assert.equal(out.angle, Math.PI / 2);
  const t = { ...E.createElement('text', 0, 0), text: 'hello', fontSize: 20 };
  assert.equal(E.resizeByHandle(t, 'se', { x: E.bounds(t).w * 2, y: E.bounds(t).h * 2 }).fontSize, 40);
});

test('text inside a shape: centered, wrapped, and follows it', () => {
  const box = { ...E.createElement('rectangle', 0, 0), id: 'box', w: 120, h: 80 };
  const t = { ...E.createElement('text', 0, 0), id: 't', text: 'quite a long sentence here', fontSize: 20, containerId: 'box' };
  let els = E.syncBindings([box, t]);
  const bt = els[1];
  assert.equal(bt.align, 'center');
  assert.ok(E.textLines(bt).length > 1, 'wraps into several lines');
  const tb = E.bounds(bt);
  assert.ok(Math.abs(tb.x + tb.w / 2 - 60) < 1e-6 && Math.abs(tb.y + tb.h / 2 - 40) < 1e-6, 'centrado');
  els = E.syncBindings([E.moveElement(els[0], 100, 0), els[1]]);
  assert.ok(Math.abs(E.center(els[1]).x - 160) < 1e-6, 'moves with the box');
  els = E.syncBindings([els[1]]);
  assert.equal(els[0].containerId, undefined, 'without its box it becomes free text');
  assert.equal(E.isBoundText(els[0]), false);
  assert.deepEqual(E.textLines({ ...t, w: 1, containerId: 'x' }).join(''), t.text.replace(/\s/g, ''), 'word by word, without losing letters');
});

test('attached arrows: go from outline to outline and follow the shapes', () => {
  const a = { ...E.createElement('rectangle', 0, 0), id: 'a', w: 100, h: 100 };
  const b = { ...E.createElement('ellipse', 300, 0), id: 'b', w: 100, h: 100 };
  const f = { ...E.createElement('arrow', 50, 50), id: 'f', points: [{ x: 0, y: 0 }, { x: 300, y: 0 }], startId: 'a', endId: 'b' };
  let [, , arrow] = E.syncBindings([a, b, f]);
  const end = (x) => ({ x: x.x + x.points[1].x, y: x.y + x.points[1].y });
  assert.ok(Math.abs(arrow.x - 106) < 1e-6 && Math.abs(arrow.y - 50) < 1e-6, `leaves from a's right edge: ${arrow.x},${arrow.y}`);
  assert.ok(Math.abs(end(arrow).x - 294) < 1e-6, `reaches b's left edge: ${end(arrow).x}`);
  [, , arrow] = E.syncBindings([a, E.moveElement(b, 0, 300), arrow]);
  assert.ok(end(arrow).y > 250, 'moving b, the end follows it');
  // Without the shape, the arrow stays where it is and is no longer attached.
  const [alone] = E.syncBindings([arrow]);
  assert.equal(alone.startId, undefined);
  assert.equal(alone.endId, undefined);
  assert.equal(alone.x, arrow.x);
  // Rotated, the outline still counts: a square at 45° has its corner 50·√2 from the center.
  const rot = { ...a, angle: Math.PI / 4 };
  const p = E.outlinePoint(rot, { x: 500, y: 50 }, 0);
  assert.ok(Math.abs(p.x - (50 + 50 * Math.SQRT2)) < 1e-6, String(p.x));
});

test('copying remaps bindings and groups between the copies', () => {
  const a = { ...E.createElement('rectangle', 0, 0), id: 'a', w: 50, h: 50, group: 'g' };
  const t = { ...E.createElement('text', 0, 0), id: 't', text: 'A', containerId: 'a', group: 'g' };
  const f = { ...E.createElement('arrow', 0, 0), id: 'f', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }], startId: 'a', endId: 'zz' };
  const [ca, ct, cf] = E.cloneElements([a, t, f], 10, 0);
  assert.notEqual(ca.id, 'a');
  assert.equal(ct.containerId, ca.id);
  assert.equal(cf.startId, ca.id);
  assert.equal(cf.endId, undefined, 'the other shape was not copied');
  assert.equal(ca.group, ct.group);
  assert.notEqual(ca.group, 'g');
  assert.equal(ca.x, 10);
});

test('opening: angle, groups and bindings are validated and kept', () => {
  const scene = E.emptyScene();
  scene.elements.push({ ...E.createElement('rectangle', 0, 0), id: 'a', w: 80, h: 40, angle: 0.5, group: 'g1' });
  scene.elements.push({ ...E.createElement('text', 0, 0), id: 't', text: 'Hello', containerId: 'a', align: 'center' });
  scene.elements.push({ ...E.createElement('arrow', 200, 0), id: 'f', points: [{ x: 0, y: 0 }, { x: 50, y: 0 }], startId: 'a' });
  const s = E.parseScene(E.serializeScene({ ...scene, elements: E.syncBindings(scene.elements) }));
  assert.deepEqual(E.parseScene(E.serializeScene(s)), s, 'saving and opening changes nothing');
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

test('opening an .excalidraw file with bound text, attached arrows, groups and angle', () => {
  const s = E.parseScene(JSON.stringify({
    type: 'excalidraw',
    elements: [
      { id: 'r', type: 'rectangle', x: 0, y: 0, width: 100, height: 60, angle: 0.3, groupIds: ['in', 'out'], strokeColor: '#000', opacity: 100 },
      { id: 'tx', type: 'text', x: 0, y: 0, width: 40, height: 20, text: 'Bo\nx', originalText: 'Box', containerId: 'r', fontSize: 20, opacity: 100 },
      { id: 'o', type: 'ellipse', x: 300, y: 0, width: 80, height: 60, opacity: 100 },
      { id: 'ar', type: 'arrow', x: 100, y: 30, points: [[0, 0], [200, 0]], startBinding: { elementId: 'r' }, endBinding: { elementId: 'o' }, opacity: 100 },
    ],
  }));
  const [r, t, , ar] = s.elements;
  assert.equal(r.angle, 0.3);
  assert.equal(r.group, 'out');
  assert.equal(t.containerId, 'r');
  assert.equal(t.text, 'Box', 'the original text, without the wrapping line breaks');
  assert.equal(ar.startId, 'r');
  assert.equal(ar.endId, 'o');
});

test('merging two versions of a drawing element by element', () => {
  const r = (id, x, extra = {}) => ({ ...E.createElement('rectangle', x, 0), id, seed: 1, w: 10, h: 10, ...extra });
  const base = { ...E.emptyScene(), elements: [r('a', 0), r('b', 20), r('c', 40)] };
  // Here: a is moved, c deleted and d added. There: b's color changes and e is added after a.
  const mine = { ...base, elements: [r('a', 5), r('b', 20), r('d', 60)] };
  const theirs = { ...base, elements: [r('a', 0), r('e', 1), r('b', 20, { stroke: '#e03131' }), r('c', 40)] };
  const { scene, conflict } = E.mergeScenes(base, mine, theirs);
  assert.equal(conflict, false);
  assert.deepEqual(scene.elements.map((e) => e.id), ['a', 'e', 'b', 'd'], 'c stays deleted; e goes after a');
  assert.equal(scene.elements[0].x, 5, 'my move');
  assert.equal(scene.elements[2].stroke, '#e03131', 'their color');
  // Both change the same element differently: mine wins and it is flagged.
  const both = E.mergeScenes(base, { ...base, elements: [r('a', 7), r('b', 20), r('c', 40)] }, { ...base, elements: [r('a', 9), r('b', 20), r('c', 40)] });
  assert.equal(both.conflict, true);
  assert.equal(both.scene.elements[0].x, 7);
  // Deleted there and changed here: mine stays.
  const keep = E.mergeScenes(base, { ...base, elements: [r('a', 3), r('b', 20), r('c', 40)] }, { ...base, elements: [r('b', 20), r('c', 40)] });
  assert.deepEqual(keep.scene.elements.map((e) => e.id), ['a', 'b', 'c']);
  // Background: the one that changed.
  assert.equal(E.mergeScenes(base, mine, { ...theirs, background: '#fffce8' }).scene.background, '#fffce8');
});

test('growing with the keyboard without moving the center', () => {
  const r = { ...E.createElement('rectangle', 0, 0), w: 100, h: 50, angle: 1 };
  const g = E.growElement(r, 10, 0);
  assert.equal(g.w, 110);
  assert.deepEqual(E.center(g), E.center(r));
  const t = { ...E.createElement('text', 0, 0), text: 'hello', fontSize: 20 };
  assert.equal(E.growElement(t, 10, 0).fontSize, 22);
  assert.equal(E.growElement(t, -10, 0).fontSize, 18);
});

test('a PNG too big for the browser is exported at a smaller scale', () => {
  assert.equal(pngScale(2000, 1500, 2), 2, 'a normal drawing keeps its scale');
  const wide = pngScale(70000, 200, 2);
  assert.ok(70000 * wide <= PNG_MAX_SIDE + 1e-6, `no side over the limit: ${wide}`);
  const big = pngScale(20000, 20000, 2);
  assert.ok(20000 * big * 20000 * big <= PNG_MAX_AREA * (1 + 1e-9), `no more pixels than the limit: ${big}`);
  assert.equal(pngScale(0, 0, 2), 2, 'an empty box does not break it');
});

test('attached arrows and texts that did not change keep the same object', () => {
  const a = { ...E.createElement('rectangle', 0, 0), w: 100, h: 50 };
  const b = { ...E.createElement('rectangle', 300, 0), w: 100, h: 50 };
  const arrow = { ...E.createElement('arrow', 0, 0), points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], startId: a.id, endId: b.id };
  const text = { ...E.createElement('text', 0, 0), text: 'hi', containerId: a.id };
  const first = E.syncBindings([a, b, arrow, text]);
  const again = E.syncBindings(first);
  first.forEach((el, i) => assert.equal(again[i], el, `${el.type} is reused`));
  const moved = E.syncBindings([E.moveElement(first[0], 0, 40), ...first.slice(1)]);
  assert.notEqual(moved[2], first[2], 'the arrow of a moved box changes');
  assert.notEqual(moved[3], first[3], 'and so does its text');
});

test('the text boxes are measured again after forgetting them', () => {
  const t = { ...E.createElement('text', 0, 0), text: 'hello', fontSize: 20 };
  const before = E.bounds(t).w;
  try {
    E.setTextMeasurer((s, f) => s.length * f);
    assert.equal(E.bounds(t).w, 100);
  } finally {
    E.setTextMeasurer((s, f) => s.length * f * 0.5);
  }
  E.forgetTextBoxes();
  assert.equal(E.bounds(t).w, before);
});
