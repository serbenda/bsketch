// Property-based / fuzz tests: random (but deterministic) inputs against the functions that read whatever comes
// from a file or from storage. No dependencies: a small seeded PRNG of our own.
//
//   node --test tests/fuzz.test.mjs                 the default runs (a few seconds)
//   FUZZ_RUNS=5000 node --test tests/fuzz.test.mjs  more runs per property
//   FUZZ_SEED=123 node --test tests/fuzz.test.mjs   another seed (a failure prints the seed and run to repeat it)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../js/scene.js';
import * as D from '../js/drawings.js';
import { memoryStore, webStore } from '../js/store.js';
import { cleanPrefs, DEFAULT_PREFS, APPEARANCES, LANG_CHOICES } from '../js/prefs.js';
import { pickLang, fill, LANGS } from '../js/i18n.js';

const RUNS = Math.max(1, Number(process.env.FUZZ_RUNS) || 400);
const SEED = Number(process.env.FUZZ_SEED) || 0x5eed1234;

// --- PRNG and generators ---

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
};

class Gen {
  constructor(seed) { this.r = mulberry32(seed); }
  float() { return this.r(); }
  int(a, b) { return a + Math.floor(this.r() * (b - a + 1)); }
  bool(p = 0.5) { return this.r() < p; }
  pick(arr) { return arr[Math.floor(this.r() * arr.length)]; }
  str(max = 12, alphabet = 'abcXYZ019 -_\n\t{}"\\/é😀\u0000 ') {
    const n = this.int(0, max);
    let s = '';
    for (let i = 0; i < n; i++) s += this.pick([...alphabet]);
    return s;
  }
}

// JSON-ish values built as trees so that keys like __proto__ become own properties (as JSON.parse makes them)
// and numbers like Infinity can be written as text (1e999 parses to Infinity).
class Obj { constructor(pairs) { this.pairs = pairs; } }
const obj = (o) => new Obj(Object.entries(o).filter(([, v]) => v !== undefined));

function toText(v) {
  if (v instanceof Obj) return `{${v.pairs.map(([k, x]) => `${JSON.stringify(k)}:${toText(x)}`).join(',')}}`;
  if (Array.isArray(v)) return `[${v.map(toText).join(',')}]`;
  if (typeof v === 'number') {
    if (Number.isNaN(v)) return 'null';
    if (v === Infinity) return '1e999';
    if (v === -Infinity) return '-1e999';
    if (Object.is(v, -0)) return '-0';
    return JSON.stringify(v);
  }
  if (v === undefined) return 'null';
  return JSON.stringify(v);
}
// The same tree as a JS value (keeps NaN, which JSON cannot carry).
function toValue(v) {
  if (v instanceof Obj) {
    const o = {};
    for (const [k, x] of v.pairs) Object.defineProperty(o, k, { value: toValue(x), enumerable: true, writable: true, configurable: true });
    return o;
  }
  if (Array.isArray(v)) return v.map(toValue);
  return v;
}

const EXTREMES = [NaN, Infinity, -Infinity, 1e308, -1e308, 0, -0, 1e6, -1e6, 1e6 + 1, -1e6 - 1, 5e-324, 2 ** 53, -(2 ** 31), 2 ** 32];
// With g.bounded, no value reaches the ±MAX_COORD clamp (wrong types and NaN still come).
const SMALL_EXTREMES = [NaN, 0, -0, 5e-324, 1e5, -1e5];
function number(g) {
  const k = g.int(0, 9);
  if (k < 4) return g.int(-500, 500);
  if (k < 6) return (g.float() - 0.5) * 10 ** g.int(0, g.bounded ? 5 : 12);
  if (k < 8) return g.pick(g.bounded ? SMALL_EXTREMES : EXTREMES);
  // wrong types
  return g.pick(['12', ' 7 ', '', 'abc', '1e999', true, false, null, [], [5], [1, 2], obj({}), obj({ x: 1 })]);
}
const VALID_COLORS = ['#1e1e1e', '#fff', '#ffc9c9', '#12345678', 'transparent', 'red', 'rgb(1, 2, 3)', 'rgba(0,0,0,0.5)', ' blue '];
const BAD_COLORS = ['#12', '#ggg', 'url(x)', 'a'.repeat(30), '<script>', 'rgb(1,2,3);x', '', 'red blue', 'expression(alert(1))'];
const color = (g) => (g.bool(0.6) ? g.pick(VALID_COLORS) : g.bool(0.7) ? g.pick(BAD_COLORS) : number(g));
const PROTO_KEYS = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf', 'hasOwnProperty'];
// Object keys for random JSON. "toString"/"valueOf" as keys make an object that String()/Number() cannot convert:
// that used to crash parseScene (see the regression test at the end), so only g.traps generates them.
const OBJ_KEYS = ['type', 'elements', 'background', 'appState', 'id', 'x', 'points', 'text', '__proto__', 'constructor', 'prototype', 'hasOwnProperty', 'a', 'b'];
const pollute = () => obj({ polluted: 'yes', prototype: obj({ polluted: 'yes' }) });

function bigString(g) {
  const k = g.int(0, 3);
  if (k === 0) return 'x'.repeat(g.int(9990, 20000));
  if (k === 1) return Array.from({ length: g.int(1, 3000) }, () => g.str(6)).join('\n');
  return g.str(60);
}

function idFrom(g, pool) {
  const k = g.int(0, 9);
  if (k < 6 && pool.length) return g.pick(pool);
  if (k === 6) return g.pick(['', 'i'.repeat(64), 'i'.repeat(65), ...PROTO_KEYS]);
  if (k === 7) return number(g);
  return g.str(10, 'abcdef0123');
}

function deep(g, depth) {
  let v = g.pick([1, 'x', null, obj({ x: 1 })]);
  for (let i = 0; i < depth; i++) v = g.bool() ? [v] : obj({ x: v });
  return v;
}

function points(g, many = false) {
  const n = many ? g.int(4990, 6000) : g.pick([0, 1, 2, 2, 2, 3, 5, g.int(0, 40)]);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const k = many ? 0 : g.int(0, 9);
    if (k < 7) pts.push(obj({ x: many ? g.int(-1e6, 1e6) : number(g), y: many ? g.int(-1e6, 1e6) : number(g) }));
    else pts.push(g.pick([null, 5, 'p', [1, 2], obj({}), obj({ x: '5', y: '6' })]));
  }
  return pts;
}

// A near-valid bsketch element: real type (mostly) and random/extreme fields.
function element(g, pool, opts = {}) {
  const type = g.bool(0.85) ? g.pick(E.TYPES) : g.pick(['frame', 'image', 'freedraw', 'RECTANGLE', '', 1, null, ...PROTO_KEYS]);
  const linear = type === 'line' || type === 'arrow' || type === 'draw';
  const f = {
    id: g.bool(0.1) ? undefined : idFrom(g, pool),
    type,
    x: number(g), y: number(g), w: number(g), h: number(g),
    seed: g.bool(0.2) ? undefined : number(g),
    stroke: color(g), fill: color(g),
    fillStyle: g.pick(['solid', 'hachure', 'cross-hatch', 1, undefined]),
    width: number(g), dashed: g.pick([true, false, 'true', 1, undefined]),
    roughness: number(g), opacity: number(g), fontSize: number(g),
    angle: g.bool(0.4) ? number(g) : undefined,
    points: linear || g.bool(0.1) ? (g.bool(0.9) ? points(g, opts.manyPoints && g.bool(0.05)) : g.pick(['abc', 5, null, obj({})])) : undefined,
    text: type === 'text' || g.bool(0.05) ? (g.bool(0.85) ? (opts.big && g.bool(0.1) ? bigString(g) : g.str(30)) : g.pick([5, true, null, [1, 'a'], obj({ a: 1 })])) : undefined,
    font: g.bool(0.5) ? g.pick(['hand', 'normal', 'code', 'Arial', '', 1, ...PROTO_KEYS]) : undefined,
    containerId: g.bool(0.25) ? idFrom(g, pool) : undefined,
    startId: g.bool(0.3) ? idFrom(g, pool) : undefined,
    endId: g.bool(0.3) ? idFrom(g, pool) : undefined,
    heads: g.bool(0.5) ? g.pick([...E.HEADS, 'END', 'arrow', 1, null]) : undefined,
    route: g.bool(0.5) ? g.pick([...E.ROUTES, 'Curve', 'zigzag', 2, null]) : undefined,
    group: g.bool(0.3) ? idFrom(g, pool) : undefined,
    align: g.bool(0.1) ? g.pick(['center', 'left', 3]) : undefined,
    fileId: type === 'image' || g.bool(0.05) ? (g.bool(0.9) ? g.pick(FILE_IDS) : idFrom(g, pool)) : undefined,
    name: type === 'frame' || g.bool(0.05) ? (g.bool(0.85) ? g.str(30) : g.pick([5, null, 'n'.repeat(300), obj({})])) : undefined,
  };
  const pairs = Object.entries(f).filter(([, v]) => v !== undefined);
  if (g.bool(0.1)) pairs.push(['__proto__', pollute()]);
  if (g.bool(0.05)) pairs.push(['constructor', obj({ prototype: pollute() })]);
  if (g.bool(0.05)) pairs.push(['extra', opts.deep ? deep(g, g.int(10, 400)) : g.str(5)]);
  if (g.bool(0.05)) pairs.push(['x', number(g)]); // duplicate key: the last wins
  // shuffle a little, to vary which duplicate wins
  if (g.bool(0.2)) pairs.sort(() => g.float() - 0.5);
  return new Obj(pairs);
}

// Pictures (scene.files): data: URLs of allowed and refused kinds, by id.
const FILE_IDS = ['f1', 'f2', 'f3', '__proto__', 'constructor'];
const DATA_URLS = ['data:image/png;base64,iVBORw0KGgo=', 'data:image/jpeg;base64,/9j/4AAQ', 'data:image/webp;base64,UklGRg==',
  'data:image/gif;base64,R0lGOD', 'data:image/svg+xml;base64,PHN2Zz4=', 'data:text/html;base64,PGI+', 'https://example.com/x.png',
  'data:image/png;base64,not base64!', 'data:image/png,raw', ''];
function files(g, excal = false) {
  return new Obj(Array.from({ length: g.int(0, 4) }, () => {
    const data = g.bool(0.9) ? g.pick(DATA_URLS) : number(g);
    return [g.bool(0.9) ? g.pick(FILE_IDS) : g.pick(['', 'i'.repeat(65), 'x']), excal || g.bool(0.1) ? obj({ mimeType: 'image/png', dataURL: data }) : data];
  }));
}

function scene(g, opts = {}) {
  const pool = Array.from({ length: g.int(1, 8) }, (_, i) => `e${i}`);
  const n = g.pick([0, 1, 2, 3, 5, 8, g.int(0, 30)]);
  const elements = Array.from({ length: n }, () => (g.bool(0.95) ? element(g, pool, opts) : randomJson(g, 2)));
  const pairs = [['type', 'sketch'], ['version', g.pick([1, 2, 0, 'x', null])], ['background', color(g)], ['elements', elements]];
  if (g.bool(0.5)) pairs.push(['files', g.bool(0.9) ? files(g) : randomJson(g, 1)]);
  if (g.bool(0.1)) pairs.push(['__proto__', pollute()]);
  if (g.bool(0.2)) pairs.sort(() => g.float() - 0.5);
  return new Obj(pairs);
}

function excalidrawElement(g, pool) {
  const type = g.bool(0.85) ? g.pick(['rectangle', 'ellipse', 'diamond', 'line', 'arrow', 'freedraw', 'text']) : g.pick(['image', 'frame', 'magicframe', 'embeddable', 'draw', ...PROTO_KEYS]);
  const pts = g.bool(0.9) ? Array.from({ length: g.pick([0, 1, 2, 2, 3, g.int(0, 20)]) }, () => (g.bool(0.9) ? [number(g), number(g)] : g.pick([null, 5, obj({ x: 1 }), []]))) : g.pick([null, 'x', obj({})]);
  return obj({
    id: idFrom(g, pool), type,
    x: number(g), y: number(g), width: number(g), height: number(g), angle: number(g),
    seed: number(g), strokeColor: color(g), backgroundColor: color(g),
    fillStyle: g.pick(['solid', 'hachure', 'cross-hatch', 'zigzag', undefined]),
    strokeWidth: number(g), strokeStyle: g.pick(['solid', 'dashed', 'dotted', 5, undefined]),
    roughness: number(g), opacity: g.bool(0.5) ? g.int(0, 100) : number(g),
    fontSize: number(g), fontFamily: g.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, '1', null, ...PROTO_KEYS, undefined]),
    text: g.bool() ? g.str(20) : undefined, originalText: g.bool() ? g.pick([g.str(20), null, 5]) : undefined,
    containerId: g.bool(0.3) ? g.pick([idFrom(g, pool), null]) : undefined,
    startArrowhead: g.pick([null, 'arrow', 'bar', 'triangle', undefined]),
    endArrowhead: g.pick([null, 'arrow', 'dot', undefined]),
    elbowed: g.pick([true, false, 1, undefined]),
    startBinding: g.bool(0.3) ? g.pick([obj({ elementId: idFrom(g, pool) }), null, 5]) : undefined,
    endBinding: g.bool(0.3) ? g.pick([obj({ elementId: idFrom(g, pool) }), null]) : undefined,
    groupIds: g.bool(0.3) ? g.pick([[], [idFrom(g, pool)], [g.str(4), idFrom(g, pool)], 'g1', null]) : undefined,
    points: type === 'line' || type === 'arrow' || type === 'freedraw' || g.bool(0.1) ? pts : undefined,
    isDeleted: g.pick([true, false, false, false, undefined, 1]),
    fileId: type === 'image' ? g.pick(FILE_IDS) : undefined,
    name: type === 'frame' || type === 'magicframe' ? g.pick([g.str(20), null, 5]) : undefined,
  });
}

function excalidraw(g) {
  const pool = Array.from({ length: g.int(1, 6) }, (_, i) => `x${i}`);
  const n = g.pick([0, 1, 3, g.int(0, 25)]);
  return obj({
    type: 'excalidraw', version: 2,
    elements: g.bool(0.95) ? Array.from({ length: n }, () => (g.bool(0.95) ? excalidrawElement(g, pool) : randomJson(g, 2))) : randomJson(g, 2),
    appState: g.bool(0.8) ? obj({ viewBackgroundColor: color(g) }) : g.pick([null, 5, 'x', undefined]),
    files: g.bool(0.5) ? files(g, true) : undefined,
  });
}

function randomJson(g, depth = 4) {
  const k = g.int(0, depth > 0 ? 7 : 4);
  if (k === 0) return null;
  if (k === 1) return g.bool();
  if (k === 2) return number(g);
  if (k === 3) return g.str(10);
  if (k === 4) return g.pick(['sketch', 'excalidraw', ...E.TYPES, ...PROTO_KEYS]);
  if (k === 5) return Array.from({ length: g.int(0, 5) }, () => randomJson(g, depth - 1));
  const keys = g.traps ? [...OBJ_KEYS, 'toString', 'valueOf'] : OBJ_KEYS;
  return new Obj(Array.from({ length: g.int(0, 6) }, () => [g.pick(keys), randomJson(g, depth - 1)]));
}

// Text that is not even JSON (or is, by chance).
function garbageText(g) {
  return g.pick([
    () => g.str(40, '{}[]",:01aen tulfs\\'),
    () => '',
    () => 'null',
    () => '{"type":"sketch","elements":[',
    () => '﻿{"type":"sketch","elements":[]}',
    () => `${'['.repeat(g.int(1, 3000))}${']'.repeat(g.int(0, 3000))}`,
    () => toText(randomJson(g)),
  ])();
}

// One input of any kind, as text.
function anyInput(g) {
  const k = g.int(0, 9);
  if (k < 5) return toText(scene(g));
  if (k < 7) return toText(excalidraw(g));
  if (k < 9) return toText(randomJson(g));
  return garbageText(g);
}

// A plain JS value as JSON text, keeping ±Infinity (as 1e999) and own __proto__ keys.
function jsonText(v) {
  if (Array.isArray(v)) return `[${v.map(jsonText).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v).map((k) => `${JSON.stringify(k)}:${jsonText(v[k])}`).join(',')}}`;
  return toText(v);
}

// A smaller JSON text that still fails: drops elements, then keys of the elements that are left.
function shrink(text, fails) {
  let v;
  try { v = JSON.parse(text); } catch { return text; }
  if (!v || !Array.isArray(v.elements)) return text;
  let best = text;
  const tryIt = (cand) => {
    const t = jsonText(cand);
    if (t.length < best.length && fails(t)) { best = t; v = cand; return true; }
    return false;
  };
  for (let budget = 300, changed = true; changed && budget > 0;) {
    changed = false;
    for (let i = v.elements.length - 1; i >= 0 && budget-- > 0; i--) {
      if (tryIt({ ...v, elements: v.elements.filter((_, j) => j !== i) })) changed = true;
    }
    v.elements.forEach((el, i) => {
      if (!el || typeof el !== 'object' || Array.isArray(el)) return;
      for (const k of Object.keys(el)) {
        if (budget-- <= 0 || k === 'type') continue;
        const e2 = { ...JSON.parse(jsonText(el)) };
        delete e2[k];
        const els = [...v.elements];
        els[i] = e2;
        if (tryIt({ ...v, elements: els })) { changed = true; el = e2; }
      }
    });
  }
  return best;
}

// Runs `prop` on RUNS generated inputs; a failure says which seed and run reproduce it, and the input (shrunk
// when it is a scene).
function forAll(name, gen, prop, runs = RUNS) {
  const seed = (SEED ^ hash(name)) >>> 0;
  const g = new Gen(seed);
  for (let i = 0; i < runs; i++) {
    const input = gen(g, i);
    try {
      prop(input, i);
    } catch (err) {
      let shown;
      try { shown = typeof input === 'string' ? input : toText(input); } catch { shown = String(input); }
      if (typeof input === 'string') {
        shown = shrink(input, (t) => { try { prop(t, i); return false; } catch { return true; } });
      }
      if (shown.length > 2000) shown = `${shown.slice(0, 2000)}… (${shown.length} chars)`;
      // A new error (an AssertionError would print its diff instead of this message); the original is the cause.
      throw new Error(`[${name}] FUZZ_SEED=${SEED} FUZZ_RUNS=${runs} run ${i}: ${err.message.slice(0, 1500)}\ninput: ${shown}`, { cause: err });
    }
  }
}

// --- Checks of what the code promises ---

const KEYS = new Set(['id', 'type', 'x', 'y', 'w', 'h', 'seed', 'stroke', 'fill', 'fillStyle', 'width', 'dashed', 'roughness',
  'opacity', 'fontSize', 'points', 'angle', 'text', 'font', 'containerId', 'align', 'startId', 'endId', 'heads', 'route', 'group',
  'fileId', 'name', 'animated', 'dotted', 'rounded', 'locked']); // image, frame, flow, line and corner styles, lock
const TAU = Math.PI * 2;
const M = E.MAX_COORD;
const inRange = (v, a, b) => typeof v === 'number' && Number.isFinite(v) && v >= a && v <= b;
const isRef = (v) => typeof v === 'string' && v.length > 0 && v.length <= 64;

function checkElement(el, where = '') {
  const at = `${where} ${JSON.stringify(el).slice(0, 300)}`;
  assert.equal(Object.getPrototypeOf(el), Object.prototype, `plain object ${at}`);
  for (const k of Object.keys(el)) assert.ok(KEYS.has(k), `unknown key ${k} ${at}`);
  assert.ok(E.TYPES.includes(el.type), `type ${at}`);
  assert.ok(isRef(el.id), `id ${at}`);
  for (const k of ['x', 'y', 'w', 'h']) assert.ok(Number.isFinite(el[k]), `${k} finite ${at}`);
  // Elements laid out from others (bound text, attached arrows) can be moved by the layout; the rest keep the
  // file's limits exactly.
  if (!el.containerId && !el.startId && !el.endId) {
    for (const k of ['x', 'y', 'w', 'h']) assert.ok(inRange(el[k], -M, M), `${k} within ±MAX_COORD ${at}`);
  }
  assert.ok(Number.isInteger(el.seed) && el.seed >= 0 && el.seed < 2 ** 32, `seed ${at}`);
  assert.ok(E.isColor(el.stroke), `stroke ${at}`);
  assert.ok(E.isColor(el.fill), `fill ${at}`);
  assert.ok(E.FILL_STYLES.includes(el.fillStyle), `fillStyle ${at}`);
  if ('dotted' in el) assert.ok(el.dotted === true && el.dashed === true, `dotted only on a dashed line ${at}`);
  if ('rounded' in el) assert.ok(el.rounded === true && el.type === 'rectangle', `rounded only on rectangles ${at}`);
  if ('locked' in el) assert.equal(el.locked, true, `locked ${at}`);
  if ('animated' in el) assert.ok(el.animated === true && (el.type === 'arrow' || el.type === 'line'), `animated ${at}`);
  assert.ok(inRange(el.width, 0.5, 40), `width ${at}`);
  assert.equal(typeof el.dashed, 'boolean', `dashed ${at}`);
  assert.ok(inRange(el.roughness, 0, 3), `roughness ${at}`);
  assert.ok(inRange(el.opacity, 0.05, 1), `opacity ${at}`);
  assert.ok(inRange(el.fontSize, 6, 400), `fontSize ${at}`);
  if (E.isLinear(el)) {
    assert.ok(Array.isArray(el.points) && el.points.length >= 1 && el.points.length <= 5000, `points ${at}`);
    for (const p of el.points) {
      assert.deepEqual(Object.keys(p), ['x', 'y'], `point keys ${at}`);
      assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y), `point finite ${at}`);
      // Where each point lands (x + point) stays within ±MAX_COORD (up to rounding).
      assert.ok(inRange(el.x + p.x, -M - 1e-6, M + 1e-6) && inRange(el.y + p.y, -M - 1e-6, M + 1e-6), `point within ±MAX_COORD ${at}`);
    }
    assert.ok(!('angle' in el), `no angle on linear ${at}`);
  } else {
    assert.ok(!('points' in el), `points only on linear ${at}`);
    if ('angle' in el) assert.ok(el.angle > 0 && el.angle < TAU && el.type !== 'frame', `angle ${at}`);
  }
  if (el.type === 'image') assert.ok(isRef(el.fileId), `fileId ${at}`);
  else assert.ok(!('fileId' in el), `fileId only on images ${at}`);
  if (el.type === 'frame') assert.ok(typeof el.name === 'string' && el.name.length <= 100 && !/\s\s|[\t\n\r]/.test(el.name), `name ${at}`);
  else assert.ok(!('name' in el), `name only on frames ${at}`);
  if (el.type === 'text') {
    assert.equal(typeof el.text, 'string', `text ${at}`);
    assert.ok(el.text.length <= 10000, `text length ${at}`);
    if ('font' in el) assert.ok(el.font === 'normal' || el.font === 'code', `font ${at}`);
    if ('containerId' in el) {
      assert.ok(isRef(el.containerId), `containerId ${at}`);
      assert.equal(el.align, 'center', `align ${at}`);
    }
  } else {
    for (const k of ['text', 'font', 'containerId', 'align']) assert.ok(!(k in el), `${k} only on text ${at}`);
  }
  if (!('containerId' in el)) assert.ok(!('align' in el), `align only when bound ${at}`);
  if (el.type !== 'arrow' && el.type !== 'line') {
    for (const k of ['startId', 'endId', 'route']) assert.ok(!(k in el), `${k} only on lines ${at}`);
  }
  for (const k of ['startId', 'endId', 'group']) if (k in el) assert.ok(isRef(el[k]), `${k} ${at}`);
  if ('heads' in el) assert.ok(el.type === 'arrow' && ['start', 'both', 'none'].includes(el.heads), `heads ${at}`);
  if ('route' in el) assert.ok(['elbow', 'curve'].includes(el.route) && el.points.length === 2, `route ${at}`);
}

function checkScene(s) {
  const keys = Object.keys(s).sort();
  assert.deepEqual(keys.filter((k) => k !== 'files'), ['background', 'elements', 'type', 'version']);
  // Pictures: only data: URLs of the allowed kinds, only those an image uses, and every image has its picture.
  if ('files' in s) {
    assert.ok(Object.keys(s.files).length > 0, 'empty files kept');
    for (const [id, v] of Object.entries(s.files)) {
      assert.ok(E.isImageData(v), `refused picture kept ${id}`);
      assert.ok(s.elements.some((e) => e.type === 'image' && e.fileId === id), `unused picture kept ${id}`);
    }
  }
  for (const e of s.elements) if (e.type === 'image') assert.ok(s.files && Object.hasOwn(s.files, e.fileId), `image without its picture ${e.id}`);
  assert.equal(s.type, 'sketch');
  assert.equal(s.version, 1);
  assert.ok(E.isColor(s.background), `background ${s.background}`);
  assert.ok(Array.isArray(s.elements) && s.elements.length <= 20000);
  // Bindings point to elements that exist and can hold them (the last one with an id is the one that counts).
  const byId = new Map(s.elements.map((e) => [e.id, e]));
  const bindable = (e) => E.isContainer(e) || e.type === 'image' || (e.type === 'text' && !e.containerId);
  s.elements.forEach((el, i) => {
    checkElement(el, `#${i}`);
    if (el.containerId) assert.ok(E.isContainer(byId.get(el.containerId) || {}), `container exists #${i}`);
    if (el.startId) assert.ok(byId.has(el.startId) && bindable(byId.get(el.startId)), `start exists #${i}`);
    if (el.endId) {
      assert.ok(byId.has(el.endId) && bindable(byId.get(el.endId)), `end exists #${i}`);
      if (el.startId) assert.notEqual(byId.get(el.endId), byId.get(el.startId), `start and end differ #${i}`);
    }
  });
}

const isSceneLike = (text) => {
  try {
    const d = JSON.parse(text);
    return d?.type === 'excalidraw' || (d?.type === 'sketch' && Array.isArray(d.elements));
  } catch {
    return false;
  }
};

function parseOrBad(text) {
  try {
    return { scene: E.parseScene(text) };
  } catch (err) {
    return { err };
  }
}

const finitePath = (path) => path.every((c) => c.op === 'Z' || [c.x, c.y, ...(c.op === 'Q' ? [c.cx, c.cy] : [])].every(Number.isFinite));

function checkNoPollution() {
  assert.equal(({}).polluted, undefined, 'Object.prototype polluted');
  assert.equal([].polluted, undefined, 'Array.prototype polluted');
  assert.deepEqual(Object.getOwnPropertyNames(Object.prototype).sort(), PROTO_NAMES);
}
const PROTO_NAMES = Object.getOwnPropertyNames(Object.prototype).sort();

// --- scene.js ---

test('parseScene: never throws except bad_file for non-scenes; the output keeps every limit', () => {
  forAll('parse', anyInput, (text) => {
    const r = parseOrBad(text);
    if (r.err) {
      assert.equal(r.err.message, 'bad_file', `unexpected ${r.err.stack}`);
      assert.ok(!isSceneLike(text), 'a sketch/excalidraw scene was rejected');
    } else {
      assert.ok(isSceneLike(text), 'a non-scene was accepted');
      checkScene(r.scene);
    }
  });
  checkNoPollution();
});

test('parseScene: .excalidraw input becomes a valid scene', () => {
  forAll('excalidraw', (g) => toText(excalidraw(g)), (text) => {
    const s = E.parseScene(text);
    checkScene(s);
    const src = JSON.parse(text);
    const kept = Array.isArray(src.elements) ? src.elements.filter((e) => e && !e.isDeleted).length : 0;
    assert.ok(s.elements.length <= kept);
  });
  checkNoPollution();
});

// Two scenes are the same if they save to the same JSON, up to rounding: the layout of an attached arrow is
// recomputed from coordinates that went through x + (p - x), so its numbers may move in the last bits
// (e.g. 1.1949773657105403 → …398). Key order and -0 do not count either.
function close(a, b, path) {
  if (typeof a === 'number' && typeof b === 'number') {
    // Coordinates can be as big as MAX_COORD (1e6) and an attached arrow is laid out from them, so rounding at that
    // scale (well under a thousandth of a unit: invisible) counts as equal.
    assert.ok(Math.abs(a - b) <= 1e-9 * Math.max(1e6, Math.abs(a), Math.abs(b)), `${path}: ${a} != ${b}`);
  } else if (a && b && typeof a === 'object' && typeof b === 'object') {
    assert.equal(Array.isArray(a), Array.isArray(b), path);
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), `${path} keys`);
    for (const k of Object.keys(a)) close(a[k], b[k], `${path}.${k}`);
  } else {
    assert.equal(a, b, path);
  }
}
const assertSameScene = (a, b) => close(JSON.parse(E.serializeScene(a)), JSON.parse(E.serializeScene(b)), 'scene');

function idempotent(text) {
  const once = E.parseScene(text);
  const out = E.serializeScene(once);
  assert.ok(out.endsWith('\n'));
  const twice = E.parseScene(out);
  // Compared as parsed JSON: the order of an element's keys may change (a bound text's angle is added last by the
  // layout, but read back in its usual place), and -0 is saved as 0.
  assertSameScene(twice, once);
}

test('parseScene is idempotent: parse(serialize(parse(x))) equals parse(x) (coordinates away from ±MAX_COORD)', () => {
  forAll('idempotent', (g) => {
    g.bounded = true;
    return g.bool(0.7) ? toText(scene(g)) : toText(excalidraw(g));
  }, idempotent);
});

test('parseScene is idempotent with coordinates at ±MAX_COORD too', () => {
  idempotent('{"type":"sketch","elements":[{"id":"r","type":"rectangle","x":0,"y":0,"w":10,"h":10},'
    + '{"id":"a","type":"arrow","x":-1000000,"y":0,"points":[{"x":-5,"y":0},{"x":-10,"y":0}],"endId":"r"}]}');
  forAll('idempotent-extreme', (g) => (g.bool(0.7) ? toText(scene(g)) : toText(excalidraw(g))), idempotent);
});

test('cleanElement: null or a valid element, and cleaning again changes nothing (NaN and friends included)', () => {
  forAll('cleanElement', (g) => (g.bool(0.9) ? element(g, ['a', 'b', 'c']) : randomJson(g)), (tree) => {
    const raw = toValue(tree);
    const el = E.cleanElement(raw);
    if (el === null) return;
    checkElement(el);
    // (compared as JSON: -0 and 0 are the same once saved)
    assert.equal(JSON.stringify(E.cleanElement(el)), JSON.stringify(el));
    assert.equal(JSON.stringify(E.cleanElement(JSON.parse(JSON.stringify(el)))), JSON.stringify(el));
  }, RUNS * 4);
  checkNoPollution();
});

test('limits: 20 000 elements, 5000 points, 10 000 characters of text, deep nesting', () => {
  const g = new Gen(SEED);
  const pt = { x: 1, y: 2 };
  const many = { type: 'sketch', elements: Array.from({ length: 20050 }, (_, i) => ({ id: `r${i}`, type: 'rectangle', x: i, y: 0, w: 1, h: 1 })) };
  const t0 = performance.now();
  const s = E.parseScene(JSON.stringify(many));
  assert.equal(s.elements.length, 20000);
  assert.ok(Number.isFinite(E.sceneBounds(s.elements).w));
  assert.ok(performance.now() - t0 < 3000);
  const line = E.cleanElement({ type: 'draw', points: Array.from({ length: 7000 }, () => pt) });
  assert.equal(line.points.length, 5000);
  assert.equal(E.cleanElement({ type: 'text', text: 'é'.repeat(12000) }).text.length, 10000);
  const nested = toText(obj({ type: 'sketch', elements: [element(g, []), obj({ type: 'rectangle', deep: deep(g, 2000) })] }));
  checkScene(E.parseScene(nested));
  forAll('big', (gg) => toText(scene(gg, { big: true, manyPoints: true, deep: true })), (text) => checkScene(E.parseScene(text)), Math.ceil(RUNS / 10));
});

test('bounds, sceneBounds, routePoints and drawOps: fast and finite for any parsed element', () => {
  forAll('geometry', (g) => (g.bool(0.75) ? toText(scene(g)) : toText(excalidraw(g))), (text) => {
    const s = E.parseScene(text);
    const t0 = performance.now();
    for (const el of s.elements) {
      const b = E.bounds(el);
      assert.ok([b.x, b.y, b.w, b.h].every(Number.isFinite) && b.w >= 0 && b.h >= 0, `bounds ${JSON.stringify(b)}`);
      const a = E.aabb(el);
      assert.ok([a.x, a.y, a.w, a.h].every(Number.isFinite), 'aabb');
      if (el.type === 'line' || el.type === 'arrow') {
        const rp = E.routePoints(el);
        assert.ok(rp.length >= 1 && rp.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)), 'routePoints finite');
        const expected = !el.route || el.points.length !== 2 ? [el.points.length] : el.route === 'elbow' ? [2, 4] : [2, 17];
        assert.ok(expected.includes(rp.length), `routePoints length ${rp.length}`);
      }
      const ops = E.drawOps(el);
      assert.ok(Array.isArray(ops));
      let cmds = 0;
      for (const op of ops) {
        assert.ok(Array.isArray(op.path) && finitePath(op.path), `drawOps finite ${el.type}`);
        if (op.clip) assert.ok(finitePath(op.clip), 'clip finite');
        cmds += op.path.length;
      }
      assert.ok(cmds < 30000, `too many path commands: ${cmds}`);
      if (el.type === 'text') assert.equal(ops.length, 0);
    }
    const sb = E.sceneBounds(s.elements);
    assert.ok([sb.x, sb.y, sb.w, sb.h].every(Number.isFinite) && sb.w >= 0 && sb.h >= 0, 'sceneBounds');
    assert.ok(performance.now() - t0 < 500, 'geometry took too long');
  });
});

// A scene with unique ids and its edited copy: some elements changed, some deleted, some added.
function validScene(g) {
  const s = E.parseScene(toText(scene(g)));
  const seen = new Set();
  s.elements = s.elements.filter((e) => !seen.has(e.id) && seen.add(e.id));
  return E.parseScene(E.serializeScene(s));
}
let fresh = 0;
function edit(g, base) {
  const els = [];
  for (const e of base.elements) {
    const k = g.int(0, 9);
    if (k < 5) els.push(e);
    else if (k < 7) els.push({ ...e, x: Math.max(-M, Math.min(M, e.x + g.int(-50, 50))), stroke: g.pick(VALID_COLORS).trim() });
    else if (k < 8) continue;
    else els.push(e, E.cleanElement({ ...toValue(element(g, [])), id: `n${fresh++}` }) || { ...e, id: `n${fresh++}` });
  }
  const s = { ...base, background: g.bool(0.2) ? g.pick(VALID_COLORS).trim() : base.background, elements: els };
  return E.parseScene(E.serializeScene(s));
}

test('mergeScenes: valid scenes merge into a valid scene with every id that should stay', () => {
  forAll('merge', (g) => {
    g.bounded = true; // extreme coordinates are covered by the ±MAX_COORD test
    const base = validScene(g);
    return { base, mine: edit(g, base), theirs: edit(g, base) };
  }, ({ base, mine, theirs }) => {
    const { scene: out, conflict } = E.mergeScenes(base, mine, theirs);
    checkScene(out);
    assert.equal(typeof conflict, 'boolean');
    const ids = out.elements.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate ids');
    const B = new Set(base.elements.map((e) => e.id));
    const Mi = new Set(mine.elements.map((e) => e.id));
    const T = new Set(theirs.elements.map((e) => e.id));
    for (const id of ids) assert.ok(Mi.has(id) || T.has(id), `id from nowhere ${id}`);
    for (const id of Mi) if (T.has(id) || !B.has(id)) assert.ok(ids.includes(id), `lost ${id} (mine)`);
    for (const id of T) if (Mi.has(id) || !B.has(id)) assert.ok(ids.includes(id), `lost ${id} (theirs)`);
    // Nothing changed on one side: the result is the other side.
    assertSameScene(E.mergeScenes(base, mine, base).scene, mine);
    assertSameScene(E.mergeScenes(base, base, theirs).scene, theirs);
    assertSameScene(E.mergeScenes(base, mine, mine).scene, mine);
    assert.equal(E.mergeScenes(base, mine, mine).conflict, false);
  });
  checkNoPollution();
});

// --- drawings.js ---

const ID_RE = /^[a-z0-9]{4,40}$/;
function checkIndex(idx) {
  assert.deepEqual(Object.keys(idx).sort(), ['active', 'list']);
  assert.ok(Array.isArray(idx.list) && idx.list.length >= 1 && idx.list.length <= 500);
  const ids = idx.list.map((d) => d.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate ids');
  for (const d of idx.list) {
    assert.deepEqual(Object.keys(d).sort(), ['id', 'name', 'updated']);
    assert.ok(ID_RE.test(d.id), `id ${d.id}`);
    assert.ok(typeof d.name === 'string' && d.name.length >= 1 && d.name.length <= 80, `name ${d.name}`);
    assert.equal(d.name, d.name.trim());
    assert.ok(!/\s\s|[\t\n\r]/.test(d.name), `name spaces ${JSON.stringify(d.name)}`);
    assert.ok(Number.isFinite(d.updated));
  }
  assert.ok(ids.includes(idx.active), 'active not in the list');
}

function rawIndex(g) {
  if (g.bool(0.15)) return randomJson(g);
  const pool = Array.from({ length: g.int(1, 6) }, () => g.pick(['abcd', 'a1b2c3', '0000', 'x'.repeat(40), 'x'.repeat(41), 'ABCD', 'ab', 'ab-cd', '', ...PROTO_KEYS, g.str(12, 'abz09')]));
  const list = Array.from({ length: g.pick([0, 1, 2, 5, g.int(0, 30), g.bool(0.03) ? 700 : 3]) }, () => (g.bool(0.9)
    ? obj({ id: g.bool(0.9) ? g.pick(pool) : number(g), name: g.pick([g.str(20), '   ', ' a  b\t\nc ', 'n'.repeat(200), 5, null, obj({}), undefined]), updated: number(g) })
    : randomJson(g, 1)));
  return obj({ active: g.bool(0.8) ? g.pick(pool) : randomJson(g, 1), list: g.bool(0.95) ? list : randomJson(g, 1) });
}

const validEntries = (raw) => (raw && typeof raw === 'object' && Array.isArray(raw.list)
  ? raw.list.slice(0, 500).filter((d) => d && typeof d.id === 'string' && ID_RE.test(d.id)) : []);

test('cleanIndex: null only without a single valid entry, else a valid index whose active drawing is in the list', () => {
  forAll('cleanIndex', rawIndex, (tree) => {
    const raw = toValue(tree);
    const idx = D.cleanIndex(raw);
    const valid = validEntries(raw);
    if (idx === null) {
      assert.equal(valid.length, 0, 'a list with valid entries was thrown away');
      return;
    }
    checkIndex(idx);
    assert.equal(idx.list[0].id, valid[0].id, 'order kept');
    // A known active drawing stays open; an unknown one opens the first entry.
    assert.equal(idx.active, idx.list.some((d) => d.id === raw.active) ? raw.active : idx.list[0].id);
    assert.equal(JSON.stringify(D.cleanIndex(JSON.parse(JSON.stringify(idx)))), JSON.stringify(idx));
  }, RUNS * 2);
  checkNoPollution();
});

test('loadIndex: any stored text (or a broken storage) gives a valid index', () => {
  forAll('loadIndex', (g) => ({ text: g.bool(0.8) ? toText(rawIndex(g)) : garbageText(g), mode: g.pick(['ok', 'ok', 'ok', 'null', 'throws', 'number']) }), ({ text, mode }) => {
    const storage = {
      getItem(k) {
        assert.equal(k, D.INDEX_KEY);
        if (mode === 'throws') throw new Error('SecurityError');
        if (mode === 'null') return null;
        if (mode === 'number') return 12;
        return text;
      },
      setItem() { throw new Error('read only'); },
    };
    const idx = D.loadIndex(storage, 'Drawing 1');
    checkIndex(idx);
  });
});

// --- prefs.js and i18n.js ---

test('cleanPrefs: always the three known keys with known values', () => {
  const before = { ...DEFAULT_PREFS };
  forAll('cleanPrefs', (g) => (g.bool(0.7)
    ? obj({ appearance: g.pick([...APPEARANCES, 'blue', '', 1, null]), grid: g.pick([true, false, 'true', 1, null]), lang: g.pick([...LANG_CHOICES, ...LANGS, 'fr', 'EN', ...PROTO_KEYS]), [g.pick(PROTO_KEYS)]: pollute() })
    : randomJson(g)), (tree) => {
    const p = cleanPrefs(toValue(tree));
    assert.deepEqual(Object.keys(p).sort(), ['appearance', 'grid', 'lang']);
    assert.ok(APPEARANCES.includes(p.appearance));
    assert.equal(typeof p.grid, 'boolean');
    assert.ok(LANG_CHOICES.includes(p.lang));
    assert.deepEqual(cleanPrefs(p), p);
  }, RUNS * 2);
  assert.deepEqual({ ...DEFAULT_PREFS }, before);
  checkNoPollution();
});

test('pickLang: always a language we have; a valid choice wins', () => {
  forAll('pickLang', (g) => ({
    choice: g.pick([...LANGS, 'auto', 'fr', 'ES', '', null, undefined, 5, ...PROTO_KEYS]),
    navs: Array.from({ length: g.int(0, 5) }, () => g.pick(['es-ES', 'ES', 'en-GB', 'fr', 'zh-Hant-TW', '', null, undefined, 7, g.str(6), '-es', 'es_ES'])),
  }), ({ choice, navs }) => {
    const l = pickLang(choice, navs);
    assert.ok(LANGS.includes(l));
    if (LANGS.includes(choice)) assert.equal(l, choice);
    assert.ok(LANGS.includes(pickLang(choice)));
  });
});

test('fill: fills only its own {holes}, once, and leaves the rest as written', () => {
  forAll('fill', (g) => {
    const keys = ['name', 'n', 'x_1', ...PROTO_KEYS];
    const parts = Array.from({ length: g.int(0, 8) }, () => (g.bool() ? `{${g.pick(keys)}}` : g.str(6, 'ab {}-é')));
    const vars = new Obj(Array.from({ length: g.int(0, 4) }, () => [g.pick(keys), g.pick([g.str(5), '{name}', 0, null, 3.5, true])]));
    return { s: parts.join(''), vars: toValue(vars) };
  }, ({ s, vars }) => {
    const out = fill(s, vars);
    assert.equal(typeof out, 'string');
    // Reference: scan left to right.
    let ref = '';
    for (let i = 0; i < s.length;) {
      const m = /^\{(\w+)\}/.exec(s.slice(i));
      if (m) {
        ref += Object.hasOwn(vars, m[1]) ? String(vars[m[1]]) : m[0];
        i += m[0].length;
      } else {
        ref += s[i++];
      }
    }
    assert.equal(out, ref);
    assert.equal(fill(s, {}), s);
  });
  checkNoPollution();
});

// --- Bugs the fuzzer found (fixed; kept as regression tests) ---

test('parseScene: a field that is an object with a non-callable toString does not crash', () => {
  const check = (text) => {
    const r = parseOrBad(text);
    if (r.err) assert.equal(r.err.message, 'bad_file', r.err.message);
    else checkScene(r.scene);
  };
  check('{"type":"sketch","elements":[{"type":"text","text":{"toString":1}}]}');
  check('{"type":"sketch","elements":[{"type":"rectangle","x":{"toString":1}}]}');
  check('{"type":"excalidraw","elements":[{"type":{"toString":1}}]}');
  forAll('traps', (g) => {
    g.traps = true;
    return anyInput(g);
  }, check, RUNS);
});

// --- drawings.js with a scene store: random sequences of operations ---

// localStorage as a Map (with length/key, which webStore uses to list its keys).
function fakeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    key: (i) => [...m.keys()][i] ?? null,
    get length() { return m.size; },
    _m: m,
  };
}

test('drawings: random create/open/rename/delete/touch/refresh/recover sequences keep a valid index and store', async () => {
  const g = new Gen((SEED ^ hash('drawings')) >>> 0);
  const runs = Math.max(5, Math.ceil(RUNS / 5));
  for (let run = 0; run < runs; run++) {
    const storage = fakeStorage();
    const store = g.bool() ? memoryStore() : webStore(storage);
    const log = [];
    try {
      if (g.bool(0.5)) storage.setItem(D.INDEX_KEY, toText(rawIndex(g)));
      if (g.bool(0.3)) storage.setItem(D.CURRENT_KEY, toText(scene(g)));
      const idx = D.loadIndex(storage);
      await D.migrate(storage, store, idx);
      checkIndex(idx);
      const created = new Set();
      const deleted = new Set();
      for (let step = 0; step < 25; step++) {
        const pickId = () => (g.bool(0.85) ? g.pick(idx.list).id : g.pick(['nope', 'abcd', '', ...PROTO_KEYS]));
        const op = g.pick(['create', 'create', 'open', 'rename', 'delete', 'delete', 'touch', 'refresh', 'recover']);
        log.push(op);
        const savedBefore = storage.getItem(D.INDEX_KEY);
        if (op === 'create') {
          const id = await D.createDrawing(storage, store, idx, g.pick([g.str(20), '  ', null, 'n'.repeat(100), undefined]), E.parseScene(toText(scene(g))));
          assert.equal(idx.active, id);
          created.add(id);
          deleted.delete(id);
        } else if (op === 'open') {
          const id = pickId();
          const ok = D.openDrawing(storage, idx, id);
          if (ok) assert.equal(idx.active, id);
        } else if (op === 'rename') {
          D.renameDrawing(storage, idx, pickId(), g.pick([g.str(20), '   ', ' a  b ', 5, 'x'.repeat(200)]));
        } else if (op === 'delete') {
          const id = pickId();
          const listed = idx.list.some((d) => d.id === id);
          await D.deleteDrawing(storage, store, idx, id);
          if (listed) {
            assert.ok(!idx.list.some((d) => d.id === id), 'still listed after delete');
            deleted.add(id);
            created.delete(id);
          }
        } else if (op === 'touch') {
          D.touch(storage, idx);
        } else if (op === 'refresh') {
          // Another tab wrote its own index (often a valid one with some of our drawings, sometimes garbage).
          const other = g.bool(0.7)
            ? JSON.stringify({ active: g.pick(idx.list).id, list: idx.list.filter(() => g.bool(0.6)).concat(g.bool(0.5) ? [{ id: `zz${g.int(1000, 9999)}`, name: 'Other tab', updated: 1 }] : []) })
            : toText(randomJson(g));
          storage.setItem(D.INDEX_KEY, other);
          const activeBefore = idx.active;
          D.refreshIndex(storage, idx);
          assert.equal(idx.active, activeBefore, 'refresh changed the open drawing');
        } else {
          for (let k = g.int(0, 3); k > 0; k--) {
            const id = g.pick([`rec${g.int(1000, 9999)}`, 'BAD-ID', 'ab', ...PROTO_KEYS]);
            await store.set(id, '{}');
            deleted.delete(id);
          }
          const before = idx.list.length;
          const n = await D.recover(storage, store, idx);
          assert.equal(idx.list.length, before + n);
          for (const id of await store.keys()) {
            if (ID_RE.test(id) && idx.list.length < 500) assert.ok(idx.list.some((d) => d.id === id), `scene ${id} kept where nobody can open it`);
          }
        }
        checkIndex(idx);
        const saved = storage.getItem(D.INDEX_KEY);
        if (saved !== savedBefore && op !== 'refresh') {
          // What an operation saves reads back as the same index.
          assert.deepEqual(D.cleanIndex(JSON.parse(saved)), JSON.parse(JSON.stringify(idx)));
        }
        for (const id of created) {
          if (idx.list.some((d) => d.id === id)) checkScene(E.parseScene(await store.get(id)));
        }
        for (const id of deleted) assert.equal(await store.get(id), null, `deleted ${id} still in the store`);
      }
    } catch (err) {
      throw new Error(`[drawings] FUZZ_SEED=${SEED} run ${run} ops ${log.join(',')}: ${err.message.slice(0, 1500)}`, { cause: err });
    }
  }
  checkNoPollution();
});

test('drawings: refreshIndex never grows the list past 500 drawings', () => {
  const storage = fakeStorage();
  const list = Array.from({ length: 500 }, (_, i) => ({ id: `d${String(i).padStart(4, '0')}`, name: `D ${i}`, updated: 0 }));
  storage.setItem(D.INDEX_KEY, JSON.stringify({ active: list[0].id, list }));
  const idx = { active: 'mine1', list: [{ id: 'mine1', name: 'Mine', updated: 0 }] };
  D.refreshIndex(storage, idx);
  checkIndex(idx);
});
