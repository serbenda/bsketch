// bsketch-7f3a9c2e — © Sergio Santiago Bendaña Quesada. All rights reserved. See LICENSE.
// The .sketch format, version 1, is frozen (docs/FORMAT.md): every file a release saved opens in this one with
// nothing lost, and what this one saves is still version 1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as E from '../js/scene.js';

const dir = new URL('./fixtures/format/', import.meta.url);
const fixtures = readdirSync(dir).filter((f) => f.endsWith('.sketch')).sort();

// Where an attached arrow's ends or a text inside a shape sit is worked out again on opening (each release may lay
// them out a little better); everything else must come back exactly as saved.
const LAID_OUT = (el) => (el.startId || el.endId ? ['x', 'y', 'w', 'h', 'points'] : el.containerId ? ['x', 'y', 'w', 'h'] : []);

test('there is a saved file from every release since 1.0.0', () => {
  for (const v of ['1.0.0', '1.1.0', '1.2.0', '1.3.0', '1.4.0', '1.5.0']) assert.ok(fixtures.includes(`sketch-${v}.sketch`), v);
});

for (const name of fixtures) {
  test(`${name} opens with nothing lost`, () => {
    const text = readFileSync(new URL(name, dir), 'utf8');
    const saved = JSON.parse(text);
    assert.equal(saved.version, E.VERSION, 'still format version 1');
    const scene = E.parseScene(text);
    assert.equal(scene.background, saved.background);
    assert.equal(scene.elements.length, saved.elements.length, 'every element');
    assert.deepEqual(scene.elements.map((e) => e.id), saved.elements.map((e) => e.id), 'in the same order');
    for (const old of saved.elements) {
      const now = scene.elements.find((e) => e.id === old.id);
      const skip = LAID_OUT(old);
      for (const [k, v] of Object.entries(old)) if (!skip.includes(k)) assert.deepEqual(now[k], v, `${old.id}.${k}`);
    }
    assert.deepEqual(scene.files || {}, saved.files || {}, 'the pictures');
    // Saved again and opened again, it stays the same.
    const again = E.parseScene(E.serializeScene(scene));
    assert.deepEqual(again, scene);
  });
}

// What the format holds today. Changing this list means changing docs/FORMAT.md, and only by adding optional fields
// that older versions can do without.
test('the fields of format version 1 are the documented ones', () => {
  const latest = fixtures.at(-1);
  const scene = E.parseScene(readFileSync(new URL(latest, dir), 'utf8'));
  const keys = {};
  for (const el of scene.elements) keys[el.type] = [...new Set([...(keys[el.type] || []), ...Object.keys(el)])].sort();
  const doc = readFileSync(new URL('../docs/FORMAT.md', import.meta.url), 'utf8');
  for (const k of new Set(Object.values(keys).flat())) assert.ok(doc.includes(`\`${k}\``), `docs/FORMAT.md documents \`${k}\``);
  assert.deepEqual(Object.keys(JSON.parse(E.serializeScene(scene))), ['type', 'version', 'background', 'elements', 'files']);
});
