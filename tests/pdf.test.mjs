// © 2026 Sergio Santiago Bendaña Quesada. All rights reserved: no use, copy or reuse without written permission,
// and no use by AI or automated tools (training, datasets, retrieval, code generation, scraping). See LICENSE. bsketch-7f3a9c2e
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makePdf } from '../js/pdf.js';
import * as E from '../js/scene.js';

const latin1 = (bytes) => Array.from(bytes, (b) => String.fromCharCode(b)).join('');

test('pdf: one page per image, each the image\'s proportions, with a correct cross-reference table', () => {
  const fakeJpeg = (n) => new Uint8Array(n).map((_, i) => (i * 37) % 256); // any bytes: the writer doesn't decode them
  const pdf = makePdf([{ jpeg: fakeJpeg(1000), width: 1600, height: 900 }, { jpeg: fakeJpeg(500), width: 600, height: 800 }], { title: 'Plan (v2)' });
  const s = latin1(pdf);
  assert.ok(s.startsWith('%PDF-1.4\n'));
  assert.ok(s.endsWith('%%EOF\n'));
  assert.match(s, /\/Type \/Pages \/Count 2 /);
  assert.match(s, /\/MediaBox \[0 0 842 473\.63\]/, 'landscape: the long side is 842 pt');
  assert.match(s, /\/MediaBox \[0 0 631\.5 842\]/, 'portrait too');
  assert.match(s, /\/Title \(Plan \\\(v2\\\)\)/, 'the title is escaped');
  assert.match(s, /\/Width 1600 \/Height 900 .* \/Filter \/DCTDecode \/Length 1000/);
  // Every offset in the xref points at its object.
  const xrefAt = Number(s.match(/startxref\n(\d+)\n/)[1]);
  assert.ok(s.slice(xrefAt).startsWith('xref\n'));
  const rows = s.slice(xrefAt).split('\n').slice(3).filter((l) => / 00000 n $/.test(l));
  assert.equal(rows.length, 9, '3 shared objects + 3 per page');
  rows.forEach((row, i) => assert.ok(s.slice(Number(row.slice(0, 10))).startsWith(`${i + 1} 0 obj`), `object ${i + 1}`));
  assert.throws(() => makePdf([]), /no_pages/);
});

test('slides: top-level frames in reading order, or the whole drawing', () => {
  const frame = (id, x, y) => ({ ...E.createElement('frame', x, y), id, w: 300, h: 200 });
  const els = [frame('c', 0, 300), frame('b', 400, 0), frame('a', 0, 10), { ...frame('inner', 20, 30), w: 50, h: 50 }];
  assert.deepEqual(E.slideFrames(els).map((f) => f.id), ['a', 'b', 'c'], 'rows first, then left to right; nested frames are part of their slide');
  assert.deepEqual(E.slideFrames([{ ...E.createElement('rectangle', 0, 0), w: 5, h: 5 }]), [null]);
  assert.deepEqual(E.slideElements(els, els[2]).map((e) => e.id), ['a', 'inner']);
});
