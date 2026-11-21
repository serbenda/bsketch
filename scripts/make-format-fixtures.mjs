// bsketch-7f3a9c2e — © Sergio Santiago Bendaña Quesada. All rights reserved. See LICENSE.
// Writes tests/fixtures/format/sketch-<version>.sketch: the same rich drawing, opened and saved by the engine of
// each release (its own parseScene and serializeScene, from a temporary worktree of its commit), so the tests can
// check that every file a release saved still opens. Run it once per new release: node scripts/make-format-fixtures.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(new URL('..', import.meta.url).pathname);
// 1.0.0 was withdrawn (its tag removed) but people may have saved files with it: its version commit is used.
const RELEASES = [['1.0.0', '897cd7a'], ['1.1.0', 'v1.1.0'], ['1.2.0', 'v1.2.0'], ['1.3.0', 'v1.3.0'], ['1.4.0', 'v1.4.0'], ['1.5.0', 'v1.5.0']];
const only = process.argv.slice(2);

// A 1×1 PNG.
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

// Every kind of element and every stored option any release knew; each release keeps what it understands.
const rich = {
  type: 'sketch', version: 1, background: '#fff9db',
  files: { pic: PNG },
  elements: [
    { id: 'f1', type: 'frame', x: -40, y: -60, w: 900, h: 500, seed: 11, name: 'Slide one', notes: 'Say hello.\nThen the plan.' },
    { id: 'r1', type: 'rectangle', x: 0, y: 0, w: 160, h: 80, seed: 1, stroke: '#1971c2', fill: '#a5d8ff', fillStyle: 'cross-hatch', width: 4, roughness: 2, opacity: 0.8, rounded: true, angle: 0.3, group: 'g1' },
    { id: 't1', type: 'text', x: 20, y: 25, w: 120, h: 30, seed: 2, text: 'Inside', fontSize: 20, containerId: 'r1', font: 'normal' },
    { id: 'e1', type: 'ellipse', x: 400, y: 0, w: 140, h: 90, seed: 3, fill: '#ffec99', fillStyle: 'solid', dashed: true, dotted: true, group: 'g1' },
    { id: 'd1', type: 'diamond', x: 200, y: 250, w: 120, h: 120, seed: 4, locked: true },
    { id: 'a1', type: 'arrow', x: 160, y: 40, w: 240, h: 5, seed: 5, points: [{ x: 0, y: 0 }, { x: 240, y: 5 }], startId: 'r1', endId: 'e1', heads: 'both', route: 'elbow', animated: true },
    { id: 'a2', type: 'arrow', x: 0, y: 300, w: 180, h: 0, seed: 6, points: [{ x: 0, y: 0 }, { x: 180, y: 0 }], route: 'curve', bend: 0.6, heads: 'none' },
    { id: 'l1', type: 'line', x: 0, y: 400, w: 300, h: 40, seed: 7, points: [{ x: 0, y: 0 }, { x: 150, y: 40 }, { x: 300, y: 0 }], dashed: true },
    { id: 'p1', type: 'draw', x: 600, y: 200, w: 50, h: 30, seed: 8, points: [{ x: 0, y: 0 }, { x: 10, y: 12 }, { x: 30, y: 25 }, { x: 50, y: 30 }], width: 1 },
    { id: 't2', type: 'text', x: 600, y: 300, w: 200, h: 60, seed: 9, text: 'Two lines\nñ, ç, 😀', fontSize: 28, font: 'code' },
    { id: 'i1', type: 'image', x: 650, y: 50, w: 100, h: 100, seed: 10, fileId: 'pic', angle: -0.2 },
  ],
};

const outDir = join(root, 'tests/fixtures/format');
mkdirSync(outDir, { recursive: true });
for (const [version, rev] of RELEASES) {
  if (only.length && !only.includes(version)) continue;
  const dir = mkdtempSync(join(tmpdir(), 'bsketch-fixture-'));
  try {
    execFileSync('git', ['-C', root, 'worktree', 'add', '--detach', '--quiet', dir, rev]);
    const E = await import(pathToFileURL(join(dir, 'js/scene.js')).href);
    const scene = E.parseScene(JSON.stringify(rich));
    const text = E.serializeScene(scene);
    writeFileSync(join(outDir, `sketch-${version}.sketch`), text);
    console.log(`${version} (${rev}): ${scene.elements.length} elements`);
  } finally {
    execFileSync('git', ['-C', root, 'worktree', 'remove', '--force', dir]);
    rmSync(dir, { recursive: true, force: true });
  }
}
