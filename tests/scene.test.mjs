import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/scene.js';
import { toSvgString, pngScale, PNG_MAX_SIDE, PNG_MAX_AREA } from '../js/render.js';
import { loadPrefs, savePrefs, cleanPrefs, BACKGROUNDS, PREFS_KEY } from '../js/prefs.js';
import * as D from '../js/drawings.js';
import * as S from '../js/store.js';
import { pickLang, translator, fill } from '../js/i18n.js';
import { polylinePath, ellipsePath, toSvgD, hachurePath, MAX_HACHURE_LINES } from '../js/stroke.js';

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

test('preferences: only known values are kept, anything else falls back to the default', () => {
  const mem = new Map();
  const storage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) };
  const DEF = { appearance: 'system', grid: false, lang: 'auto' };
  assert.deepEqual(loadPrefs(storage), DEF, 'nothing stored');
  assert.ok(savePrefs(storage, { appearance: 'dark', grid: true, lang: 'es', extra: '<script>' }));
  assert.equal(mem.get(PREFS_KEY), '{"appearance":"dark","grid":true,"lang":"es"}', 'unknown fields are not stored');
  assert.deepEqual(loadPrefs(storage), { appearance: 'dark', grid: true, lang: 'es' });
  mem.set(PREFS_KEY, '{"appearance":"purple","grid":"yes","lang":"klingon"}');
  assert.deepEqual(loadPrefs(storage), DEF, 'an unknown appearance and a grid that is not a boolean');
  mem.set(PREFS_KEY, 'not json');
  assert.deepEqual(loadPrefs(storage), DEF, 'broken JSON');
  assert.deepEqual(loadPrefs(null), DEF, 'no storage at all');
  assert.equal(savePrefs(null, { appearance: 'light' }), false);
  assert.deepEqual(cleanPrefs(['light']), DEF);
});

test('the canvas colours offered pass the same check as colours in files', () => {
  for (const [c] of BACKGROUNDS) assert.ok(E.isColor(c), c);
  assert.ok(!E.isColor('red;}'));
  assert.ok(!E.isColor(' #fff'));
});

test('an SVG without background has no background rectangle', () => {
  const r = { ...E.createElement('rectangle', 0, 0), w: 100, h: 50 };
  const scene = { ...E.emptyScene(), background: '#e7f5ff', elements: [r] };
  assert.match(toSvgString(scene), /<rect [^>]*fill="#e7f5ff"/);
  assert.doesNotMatch(toSvgString(scene, { background: false }), /<rect /);
});

test('snapping to the grid rounds to the nearest line', () => {
  assert.equal(E.GRID_SIZE, 20);
  assert.equal(E.snap(13), 20);
  assert.equal(E.snap(9), 0);
  assert.equal(E.snap(-11), -20);
  assert.equal(E.snap(118), 120);
  assert.deepEqual(E.snapPoint({ x: 27, y: 92 }), { x: 20, y: 100 });
  assert.equal(E.snap(37, 10), 40);
});

test('arrowheads: stored only on arrows and only when not the default, validated, and imported from Excalidraw', () => {
  assert.equal(E.createElement('rectangle', 0, 0, { heads: 'both' }).heads, undefined, 'not on other shapes');
  assert.equal(E.createElement('arrow', 0, 0, { heads: 'end' }).heads, undefined, 'the default is not stored');
  assert.equal(E.createElement('arrow', 0, 0, { heads: 'both' }).heads, 'both');
  const raw = { type: 'arrow', x: 0, y: 0, points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] };
  assert.equal(E.cleanElement({ ...raw, heads: 'start' }).heads, 'start');
  assert.equal(E.cleanElement({ ...raw, heads: '<b>' }).heads, undefined, 'unknown values are dropped');
  assert.equal(E.cleanElement({ ...raw, type: 'line', heads: 'both' }).heads, undefined);
  const arrow = (heads) => ({ ...E.createElement('arrow', 0, 0, { heads }), points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] });
  assert.deepEqual(['end', 'start', 'both', 'none'].map((h) => E.drawOps(arrow(h)).length), [2, 2, 3, 1], 'one path for the line plus one per head');
  const ex = (extra) => E.fromExcalidraw({ type: 'excalidraw', elements: [{ id: 'a', type: 'arrow', x: 0, y: 0, width: 100, height: 0, points: [[0, 0], [100, 0]], ...extra }] }).elements[0].heads;
  assert.equal(ex({}), undefined, 'Excalidraw default: an arrowhead at the end');
  assert.equal(ex({ startArrowhead: 'arrow', endArrowhead: 'arrow' }), 'both');
  assert.equal(ex({ startArrowhead: 'arrow', endArrowhead: null }), 'start');
  assert.equal(ex({ startArrowhead: null, endArrowhead: null }), 'none');
});

test('fonts: stored only on texts and only when not the handwriting one, validated, measured, exported and imported', () => {
  assert.equal(E.createElement('rectangle', 0, 0, { font: 'code' }).font, undefined, 'not on shapes');
  assert.equal(E.createElement('text', 0, 0, { font: 'hand' }).font, undefined, 'the default is not stored');
  assert.equal(E.createElement('text', 0, 0, { font: 'code' }).font, 'code');
  assert.equal(E.createElement('text', 0, 0, { font: 'toString' }).font, undefined, 'only real font names');
  const raw = { type: 'text', x: 0, y: 0, text: 'hello world', fontSize: 20 };
  assert.equal(E.cleanElement({ ...raw, font: 'normal' }).font, 'normal');
  assert.equal(E.cleanElement({ ...raw, font: 'Comic; }' }).font, undefined);
  assert.equal(E.cleanElement({ ...raw, font: '__proto__' }).font, undefined);
  // The measurer is told each text's font (here a fake one: monospaced letters are wider).
  E.setTextMeasurer((t, f, family) => t.length * f * (family === E.FONTS.code ? 0.6 : 0.5));
  const hand = E.cleanElement(raw);
  const code = E.cleanElement({ ...raw, font: 'code' });
  assert.ok(E.bounds(code).w > E.bounds(hand).w, 'a monospaced text is measured wider');
  assert.equal(E.fontOf(code), E.FONTS.code);
  const svg = toSvgString({ ...E.emptyScene(), elements: [code] });
  assert.ok(svg.includes('monospace'), 'the SVG uses the text\'s font');
  const ex = (fontFamily) => E.fromExcalidraw({ type: 'excalidraw', elements: [{ id: 't', type: 'text', x: 0, y: 0, width: 50, height: 25, text: 'x', fontSize: 20, fontFamily }] }).elements[0].font;
  assert.deepEqual([ex(1), ex(2), ex(3), ex(5), ex(6), ex(8), ex(99)], [undefined, 'normal', 'code', undefined, 'normal', 'code', undefined]);
});

test('security: a giant shape in a file cannot make the fill or the export grow without bound', () => {
  const s = E.parseScene('{"type":"sketch","version":1,"elements":[{"type":"rectangle","x":-1e300,"y":0,"w":1e9,"h":1e9,"fill":"#000000","fillStyle":"hachure"}]}');
  const r = s.elements[0];
  assert.deepEqual([r.x, r.w, r.h], [-E.MAX_COORD, E.MAX_COORD, E.MAX_COORD], 'coordinates are capped when opened');
  const line = E.parseScene('{"type":"sketch","version":1,"elements":[{"type":"line","x":0,"y":0,"points":[{"x":0,"y":0},{"x":5e12,"y":-5e12}]}]}').elements[0];
  assert.deepEqual(line.points[1], { x: E.MAX_COORD, y: -E.MAX_COORD }, 'points too');
  assert.ok(hachurePath(0, 0, 1e9, 1e9).length <= MAX_HACHURE_LINES * 2, 'at most MAX_HACHURE_LINES lines, even for a shape that skipped parseScene');
  const t0 = Date.now();
  toSvgString(s);
  assert.ok(Date.now() - t0 < 2000, 'the SVG export stays fast');
});

test('security: one very long word inside a shape is split quickly', () => {
  const box = { ...E.createElement('rectangle', 0, 0), w: 120, h: 80 };
  const t = { ...E.createElement('text', 0, 0), text: 'x'.repeat(10000), containerId: box.id, w: 100 };
  let calls = 0;
  E.setTextMeasurer((txt, f) => { calls++; return txt.length * f * 0.5; });
  const lines = E.textLines(t);
  assert.ok(lines.length > 100 && lines.every((l) => l.length <= 9), `${lines.length} lines`);
  assert.ok(calls < 50000, `${calls} measures (letter by letter it was millions)`);
});

test('security: numbers written into the SVG cannot carry markup, even from a scene that skipped parseScene', () => {
  const evil = '"><script>alert(1)</script><x a="';
  const r = { ...E.createElement('rectangle', 0, 0), w: 50, h: 50, opacity: evil, width: evil };
  const t = { ...E.createElement('text', 0, 80), text: 'hi', fontSize: evil, opacity: evil };
  const merged = E.mergeScenes(E.emptyScene(), E.emptyScene(), { ...E.emptyScene(), elements: [r, t] }).scene;
  const svg = toSvgString(merged);
  assert.ok(!svg.includes('<script'), 'no markup from numeric fields');
});

test('arrow routes: elbows and curves go through the right points, are stored only when not straight, and validated', () => {
  const arrow = (route, z = { x: 200, y: 100 }) => ({ ...E.createElement('arrow', 0, 0, { route }), points: [{ x: 0, y: 0 }, z] });
  assert.equal(E.createElement('rectangle', 0, 0, { route: 'elbow' }).route, undefined, 'not on shapes');
  assert.equal(arrow('straight').route, undefined, 'straight is the default and is not stored');
  assert.deepEqual(E.routePoints(arrow('elbow')), [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 200, y: 100 }], 'wider than tall: across, down, across');
  assert.deepEqual(E.routePoints(arrow('elbow', { x: 100, y: 200 })).map((p) => [p.x, p.y]), [[0, 0], [0, 100], [100, 100], [100, 200]], 'taller than wide: down first');
  const curve = E.routePoints(arrow('curve'));
  assert.equal(curve.length, 17);
  assert.deepEqual([curve[0], curve[16]], [{ x: 0, y: 0 }, { x: 200, y: 100 }], 'a curve keeps its ends');
  assert.equal(E.bounds(arrow('straight', { x: 200, y: 0 })).h, 0);
  assert.ok(E.bounds(arrow('curve', { x: 200, y: 0 })).h > 20, 'a curve’s box includes its bulge');
  assert.ok(E.hitTest(arrow('elbow'), 100, 50), 'hit on the elbow’s middle segment');
  assert.ok(!E.hitTest(arrow('straight'), 100, 10), 'which a straight arrow does not cross');
  const raw = { type: 'arrow', x: 0, y: 0, points: [{ x: 0, y: 0 }, { x: 10, y: 10 }] };
  assert.equal(E.cleanElement({ ...raw, route: 'curve' }).route, 'curve');
  assert.equal(E.cleanElement({ ...raw, route: 'zigzag' }).route, undefined);
  assert.equal(E.cleanElement({ ...raw, route: 'elbow', points: [{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 9, y: 0 }] }).route, undefined, 'only with two points');
  assert.ok(E.drawOps(arrow('elbow')).length === 2 && toSvgString({ ...E.emptyScene(), elements: [arrow('curve')] }).includes('<path'));
});

test('drawings in the browser: create, switch, rename and delete keep every drawing in its place', async () => {
  const mem = new Map();
  const st = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  const store = S.memoryStore();
  const scene = (n) => E.serializeScene({ ...E.emptyScene(), elements: Array.from({ length: n }, () => ({ ...E.createElement('rectangle', 0, 0), w: 10, h: 10 })) });
  const count = async (id) => JSON.parse(await store.get(id)).elements.length;
  mem.set(D.CURRENT_KEY, scene(2));
  const idx = D.loadIndex(st);
  assert.equal(idx.list.length, 1, 'the drawing open before becomes the first');
  const first = idx.active;
  await D.migrate(st, store, idx);
  assert.equal(await count(first), 2, 'the old sketch.current moves into the store');
  assert.equal(mem.get(D.CURRENT_KEY), undefined, 'and leaves localStorage');
  const second = await D.createDrawing(st, store, idx, 'Plan B');
  assert.equal(idx.active, second);
  assert.equal(await count(second), 0, 'the new one opens empty');
  assert.equal(await count(first), 2, 'the first is kept');
  await store.set(second, scene(1));
  assert.ok(D.openDrawing(st, idx, first));
  assert.equal(await count(D.activeOf(idx).id), 2);
  D.renameDrawing(st, idx, first, '  Roadmap  ');
  assert.equal(D.activeOf(idx).name, 'Roadmap');
  await D.deleteDrawing(st, store, idx, first);
  assert.deepEqual(idx.list.map((d) => d.name), ['Plan B']);
  assert.equal(await store.get(first), null, 'its scene is gone');
  assert.equal(await count(idx.active), 1, 'deleting the open one opens the next');
  await D.deleteDrawing(st, store, idx, idx.active);
  assert.equal(idx.list.length, 1, 'deleting the last leaves a new empty one');
  assert.equal(await count(idx.active), 0);
  assert.deepEqual(D.loadIndex(st), idx, 'the index is saved');
  mem.set(D.INDEX_KEY, JSON.stringify({ active: '../x', list: [{ id: '../x', name: '<b>' }] }));
  assert.notEqual(D.loadIndex(st).active, '../x', 'a broken or hostile index starts again');
  assert.equal(D.cleanIndex({ active: 'abcd1', list: [{ id: 'abcd1', name: 'x'.repeat(500) }] }).list[0].name.length, 80);
});

test('drawings: a broken index keeps its list, orphaned scenes come back, and another tab\'s list is followed', async () => {
  const mem = new Map();
  const st = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  assert.equal(D.cleanIndex({ active: 'nope!', list: [{ id: 'aaaa1', name: 'A' }, { id: 'bbbb2', name: 'B' }] }).active, 'aaaa1', 'an unknown open drawing opens the first');
  const store = S.memoryStore();
  const idx = { active: 'aaaa1', list: [{ id: 'aaaa1', name: 'A', updated: 0 }] };
  await store.set('aaaa1', '{}');
  await store.set('cccc3', '{}');
  await store.set('../bad', '{}');
  assert.equal(await D.recover(st, store, idx), 1);
  assert.deepEqual(idx.list.map((d) => d.id), ['aaaa1', 'cccc3']);
  // Another tab deleted A (open here) and added D: this tab takes the new list and keeps A.
  mem.set(D.INDEX_KEY, JSON.stringify({ active: 'dddd4', list: [{ id: 'dddd4', name: 'D' }, { id: 'cccc3', name: 'C' }] }));
  assert.ok(D.refreshIndex(st, idx));
  assert.equal(idx.active, 'aaaa1');
  assert.deepEqual(idx.list.map((d) => d.id), ['aaaa1', 'dddd4', 'cccc3']);
  const many = { active: 'aaaa1', list: Array.from({ length: 500 }, (_, i) => ({ id: `x${String(i).padStart(4, '0')}`, name: 'n' })) };
  many.active = many.list[0].id;
  await assert.rejects(D.createDrawing(st, store, many, 'one too many'), /too_many/);
});

test('drawings kept by older versions in localStorage move into IndexedDB; a failing store keeps them', async () => {
  const mem = new Map();
  const st = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  const one = E.serializeScene({ ...E.emptyScene(), elements: [{ ...E.createElement('ellipse', 0, 0), w: 5, h: 5 }] });
  mem.set(D.INDEX_KEY, JSON.stringify({ active: 'aaaa1', list: [{ id: 'aaaa1', name: 'A' }, { id: 'bbbb2', name: 'B' }] }));
  mem.set(D.CURRENT_KEY, one);
  mem.set(S.itemKey('bbbb2'), one);
  const idx = D.loadIndex(st);
  const broken = { ...S.memoryStore(), kind: 'indexeddb', set: async () => { throw new Error('quota'); } };
  await assert.rejects(D.migrate(st, broken, idx));
  assert.equal(mem.get(D.CURRENT_KEY), one, 'nothing is removed when the store fails');
  const store = { ...S.memoryStore(), kind: 'indexeddb' };
  await D.migrate(st, store, idx);
  assert.equal(await store.get('aaaa1'), one);
  assert.equal(await store.get('bbbb2'), one);
  assert.deepEqual([...mem.keys()], [D.INDEX_KEY], 'only the index is left in localStorage');
  // Without IndexedDB, the scenes stay in localStorage under their own keys.
  const web = S.webStore(st);
  await web.set('cccc3', one);
  assert.equal(mem.get(S.itemKey('cccc3')), one);
  assert.equal((await S.openSceneStore(null, st)).kind, 'localstorage');
  assert.equal((await S.openSceneStore(null, null)).kind, 'memory');
});

test('languages: the chosen one, else the browser\'s, else English; untranslated text stays English', () => {
  assert.equal(pickLang('es', ['en-US']), 'es');
  assert.equal(pickLang('auto', ['es-ES', 'en']), 'es');
  assert.equal(pickLang('auto', ['fr-FR', 'de']), 'en');
  assert.equal(pickLang('auto', []), 'en');
  const es = translator('es');
  assert.equal(es('Rectangle'), 'Rectángulo');
  assert.equal(es('Not in the dictionary'), 'Not in the dictionary');
  assert.equal(es('toString'), 'toString', 'only real entries');
  assert.equal(fill(es('Opened "{name}": {n} elements.'), { name: 'a.sketch', n: 3 }), 'Abierto «a.sketch»: 3 elementos.');
  assert.equal(translator('en')('Rectangle'), 'Rectangle');
});

test('images: only checked pictures are kept, once per scene, and they travel with the elements that use them', () => {
  const png = 'data:image/png;base64,iVBORw0KGgo=';
  const raw = {
    type: 'sketch', version: 1, background: '#ffffff',
    elements: [
      { id: 'i1', type: 'image', x: 0, y: 0, w: 100, h: 50, fileId: 'f1' },
      { id: 'i2', type: 'image', x: 0, y: 0, w: 100, h: 50, fileId: 'svg' },
      { id: 'i3', type: 'image', x: 0, y: 0, w: 100, h: 50, fileId: 'gone' },
      { id: 'i4', type: 'image', x: 0, y: 0, w: 100, h: 50 },
    ],
    files: { f1: png, svg: 'data:image/svg+xml;base64,PHN2Zz4=', unused: png, remote: 'https://example.com/x.png', html: 'data:text/html;base64,PGI+' },
  };
  const s = E.parseScene(JSON.stringify(raw));
  assert.deepEqual(s.elements.map((e) => e.id), ['i1'], 'an image without an allowed picture is dropped');
  assert.deepEqual(s.files, { f1: png }, 'SVG, remote and unused pictures are not kept');
  assert.deepEqual(JSON.parse(E.serializeScene({ ...s, files: { ...s.files, extra: png } })).files, { f1: png }, 'saving keeps only what is used');
  assert.equal(JSON.parse(E.serializeScene({ ...s, elements: [] })).files, undefined);
  assert.ok(!E.isImageData(`data:image/png;base64,${'A'.repeat(E.MAX_IMAGE_CHARS)}`), 'too big');
  // A picture named like a prototype key is refused, and nothing reaches Object.prototype.
  const evil = E.parseScene(`{"type":"sketch","version":1,"elements":[{"id":"x","type":"image","x":0,"y":0,"w":5,"h":5,"fileId":"__proto__"}],"files":{"__proto__":"${png}","constructor":"${png}"}}`);
  assert.equal(evil.elements.length, 0);
  assert.equal(evil.files, undefined);
  assert.equal(({}).polluted, undefined);
  assert.deepEqual(E.filesFor([{ type: 'image', fileId: '__proto__' }], JSON.parse(`{"__proto__":"${png}"}`)), {});
  // Excalidraw's pictures come in with their files.
  const ex = E.parseScene(JSON.stringify({ type: 'excalidraw', elements: [{ id: 'x', type: 'image', x: 1, y: 2, width: 30, height: 20, fileId: 'abc' }], files: { abc: { mimeType: 'image/png', dataURL: png } } }));
  assert.equal(ex.elements[0].type, 'image');
  assert.equal(ex.files.abc, png);
  // A merge keeps the pictures either side uses.
  const theirs = { ...s, elements: [...s.elements, { ...s.elements[0], id: 'j', fileId: 'f2' }], files: { f1: png, f2: png } };
  const merged = E.mergeScenes(s, s, theirs).scene;
  assert.deepEqual(Object.keys(merged.files).sort(), ['f1', 'f2']);
  // Pictures keep their proportions when resized (Shift stretches them).
  const img = s.elements[0];
  const r = E.resizeByHandle(img, 'e', { x: 200, y: 25 });
  assert.equal(r.w / r.h, 2);
  const stretched = E.resizeByHandle(img, 'e', { x: 200, y: 25 }, { keepRatio: true });
  assert.equal(stretched.w / stretched.h, 4, 'Shift stretches it');
  // An SVG export embeds only checked pictures.
  const svg = toSvgString(s);
  assert.ok(svg.includes(`<image href="${png}"`));
  assert.ok(!toSvgString({ ...s, files: { f1: 'javascript:alert(1)' } }).includes('<image'));
});

test('frames: a title, inside elements move with them, they stay upright and behind', () => {
  const f = { ...E.createElement('frame', 0, 0), w: 300, h: 200, name: '  Login\n screen  ' };
  const inside = { ...E.createElement('rectangle', 20, 20), w: 50, h: 50 };
  const outside = { ...E.createElement('rectangle', 400, 20), w: 50, h: 50 };
  const s = E.parseScene(E.serializeScene({ ...E.emptyScene(), elements: [f, inside, outside] }));
  const frame = s.elements[0];
  assert.equal(frame.name, 'Login screen');
  assert.deepEqual(E.inFrame(s.elements, frame).map((e) => e.id), [inside.id]);
  assert.equal(E.rotateElement(frame, { x: 0, y: 0 }, 1), frame, 'frames do not rotate');
  assert.equal(E.cleanElement({ ...frame, angle: 1 }).angle, undefined);
  assert.ok(E.hitTest(frame, 10, -10), 'the title picks the frame');
  assert.ok(!E.hitTest(frame, 150, 100), 'its inside does not (what is drawn there stays easy to pick)');
  assert.ok(toSvgString(s).includes('>Login screen</text>'));
  assert.equal(E.cleanElement({ ...frame, name: { toString: 1 } }).name, '');
});

test('library: our own and Excalidraw\'s libraries are read and checked; saving keeps only what each item uses', () => {
  const png = 'data:image/png;base64,iVBORw0KGgo=';
  const rect = { id: 'r', type: 'rectangle', x: 0, y: 0, w: 10, h: 10 };
  const ours = E.parseLibrary(JSON.stringify({ type: 'bsketchlib', version: 1, items: [
    { name: ' Box ', elements: [rect] },
    { name: 'Pic', elements: [{ id: 'i', type: 'image', x: 0, y: 0, w: 5, h: 5, fileId: 'f' }], files: { f: png, other: png } },
    { name: 'empty', elements: [] },
    { name: 'bad', elements: [{ type: 'script' }] },
  ] }));
  assert.deepEqual(ours.map((i) => i.name), ['Box', 'Pic']);
  assert.deepEqual(ours[1].files, { f: png });
  const v2 = E.parseLibrary(JSON.stringify({ type: 'excalidrawlib', version: 2, libraryItems: [{ name: 'Server', elements: [{ id: 'a', type: 'rectangle', x: 0, y: 0, width: 40, height: 20 }] }] }));
  assert.equal(v2[0].name, 'Server');
  assert.equal(v2[0].elements[0].w, 40);
  const v1 = E.parseLibrary(JSON.stringify({ type: 'excalidrawlib', version: 1, library: [[{ id: 'a', type: 'ellipse', x: 0, y: 0, width: 40, height: 20 }]] }));
  assert.equal(v1[0].elements[0].type, 'ellipse');
  assert.throws(() => E.parseLibrary('{"type":"sketch"}'), /bad_file/);
  assert.throws(() => E.parseLibrary('nope'), /bad_file/);
  const again = E.parseLibrary(E.serializeLibrary(ours));
  assert.deepEqual(again.map((i) => [i.name, i.elements.length, Object.keys(i.files || {})]), [['Box', 1, []], ['Pic', 1, ['f']]]);
  assert.equal(E.parseLibrary(JSON.stringify({ type: 'bsketchlib', items: Array.from({ length: 300 }, () => ({ elements: [rect] })) })).length, E.MAX_LIBRARY_ITEMS);
});

test('animated arrows: only arrows and lines keep it, the line flows and the SVG animates it', () => {
  const raw = { id: 'a', type: 'arrow', x: 0, y: 0, points: [{ x: 0, y: 0 }, { x: 100, y: 0 }] };
  assert.equal(E.cleanElement({ ...raw, animated: true }).animated, true);
  assert.equal(E.cleanElement({ ...raw, animated: 'yes' }).animated, undefined, 'only true');
  assert.equal(E.cleanElement({ ...raw, type: 'line', animated: true }).animated, true);
  assert.equal(E.cleanElement({ id: 'r', type: 'rectangle', x: 0, y: 0, w: 5, h: 5, animated: true }).animated, undefined);
  assert.equal(E.createElement('rectangle', 0, 0, { animated: true }).animated, undefined);
  const el = E.cleanElement({ ...raw, animated: true });
  const ops = E.drawOps(el);
  assert.ok(ops[0].flow && ops[0].dashed, 'the line flows');
  assert.ok(ops.slice(1).every((o) => !o.flow), 'its head does not');
  const svg = toSvgString({ ...E.emptyScene(), elements: [el] });
  assert.equal((svg.match(/<animate /g) || []).length, 1);
  assert.match(svg, /<animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.7s" repeatCount="indefinite"\/><\/path>/);
  assert.ok(!toSvgString({ ...E.emptyScene(), elements: [E.cleanElement(raw)] }).includes('<animate'));
});

test('export to .excalidraw: what bsketch has comes back the same when opened again', () => {
  const png = 'data:image/png;base64,iVBORw0KGgo=';
  const box = { ...E.createElement('rectangle', 0, 0, { fill: '#a5d8ff', fillStyle: 'solid' }), id: 'box', w: 160, h: 80, group: 'g1' };
  const label = { ...E.createElement('text', 0, 0), id: 'lbl', text: 'Hello', containerId: 'box', font: 'code' };
  const ell = { ...E.createElement('ellipse', 300, 0, { dashed: true }), id: 'ell', w: 120, h: 80, angle: 0.5 };
  const arrow = { ...E.createElement('arrow', 160, 40, { heads: 'both' }), id: 'arr', points: [{ x: 0, y: 0 }, { x: 140, y: 0 }], startId: 'box', endId: 'ell' };
  const pic = { ...E.createElement('image', 0, 200), id: 'pic', w: 50, h: 50, fileId: 'f1' };
  const frame = { ...E.createElement('frame', -20, -40, {}), id: 'frm', w: 500, h: 400, name: 'Login' };
  const scene = E.parseScene(E.serializeScene({ ...E.emptyScene(), background: '#fff9db', elements: [frame, box, label, ell, arrow, pic], files: { f1: png } }));
  const ex = E.toExcalidraw(scene);
  assert.equal(ex.type, 'excalidraw');
  assert.equal(ex.files.f1.mimeType, 'image/png');
  const exBox = ex.elements.find((e) => e.id === 'box');
  assert.deepEqual(exBox.boundElements.map((b) => b.type).sort(), ['arrow', 'text']);
  assert.equal(exBox.frameId, 'frm');
  assert.equal(ex.elements.find((e) => e.id === 'arr').endBinding.elementId, 'ell');
  const back = E.parseScene(JSON.stringify(ex));
  const by = Object.fromEntries(back.elements.map((e) => [e.id, e]));
  assert.equal(back.background, '#fff9db');
  assert.deepEqual([by.box.fill, by.box.fillStyle, by.box.group], ['#a5d8ff', 'solid', 'g1']);
  assert.deepEqual([by.lbl.text, by.lbl.font, by.lbl.containerId], ['Hello', 'code', 'box']);
  assert.equal(by.ell.dashed, true);
  assert.ok(Math.abs(by.ell.angle - 0.5) < 1e-9);
  assert.deepEqual([by.arr.heads, by.arr.startId, by.arr.endId], ['both', 'box', 'ell']);
  assert.equal(by.pic.fileId, 'f1');
  assert.equal(back.files.f1, png);
  assert.equal(by.frm.name, 'Login');
  // Routes go as the points they are drawn through.
  const curved = E.toExcalidraw({ ...E.emptyScene(), elements: [{ ...E.cleanElement({ id: 'c', type: 'arrow', x: 0, y: 0, points: [{ x: 0, y: 0 }, { x: 100, y: 0 }], route: 'curve' }) }] });
  assert.ok(curved.elements[0].points.length > 2 && curved.elements[0].roundness.type === 2);
});

test('more styles and lock: dotted, cross-hatch, round corners and locked are kept, checked and drawn', () => {
  const rect = { id: 'r', type: 'rectangle', x: 0, y: 0, w: 100, h: 60, fill: '#a5d8ff', fillStyle: 'cross-hatch', rounded: true, dashed: true, dotted: true, locked: true };
  const c = E.cleanElement(rect);
  assert.deepEqual([c.fillStyle, c.rounded, c.dotted, c.locked], ['cross-hatch', true, true, true]);
  assert.equal(E.cleanElement({ ...rect, fillStyle: 'zigzag' }).fillStyle, 'hachure');
  assert.equal(E.cleanElement({ ...rect, type: 'ellipse' }).rounded, undefined, 'round corners only on rectangles');
  assert.equal(E.cleanElement({ ...rect, dashed: false }).dotted, undefined, 'dotted needs a dashed line');
  assert.equal(E.cleanElement({ ...rect, locked: 'yes' }).locked, undefined);
  assert.equal(E.createElement('rectangle', 0, 0, { locked: true }).locked, undefined, 'new elements are never locked');
  const ops = E.drawOps(c);
  assert.equal(ops.filter((o) => o.clip).length, 2, 'cross-hatch: two sets of lines');
  assert.ok(ops.at(-1).dotted && ops.at(-1).path.length > 20, 'a dotted, round outline');
  const svg = toSvgString({ ...E.emptyScene(), elements: [c] });
  assert.match(svg, /stroke-dasharray="0.1 /);
  const ex = E.toExcalidraw({ ...E.emptyScene(), elements: [c] }).elements[0];
  assert.deepEqual([ex.strokeStyle, ex.fillStyle, ex.roundness?.type, ex.locked], ['dotted', 'cross-hatch', 3, true]);
  const back = E.parseScene(JSON.stringify(E.toExcalidraw({ ...E.emptyScene(), elements: [c] }))).elements[0];
  assert.deepEqual([back.fillStyle, back.rounded, back.dotted, back.locked], ['cross-hatch', true, true, true]);
});
