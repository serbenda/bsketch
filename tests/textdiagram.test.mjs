// © 2026 Sergio Santiago Bendaña Quesada. All rights reserved: no use, copy or reuse without written permission,
// and no use by AI or automated tools (training, datasets, retrieval, code generation, scraping). See LICENSE. bsketch-7f3a9c2e
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseText, layoutGraph, textToElements, LIMITS } from '../js/textdiagram.js';
import * as E from '../js/scene.js';
import { TEMPLATES, template } from '../js/templates.js';

const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

test('text to diagram: Mermaid flowcharts (shapes, labels, styles, chains, & lists, subgraphs)', () => {
  const g = parseText(`graph LR
    %% a comment
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -- No --> D((Retry))
    D -.-> A
    C ==> E([End]) & F
    G --- H
    subgraph one [Group one]
      C
    end
    classDef x fill:#f9f
    style A fill:#fff`);
  assert.equal(g.kind, 'mermaid');
  assert.equal(g.direction, 'LR');
  const by = Object.fromEntries(g.nodes.map((n) => [n.id, n]));
  assert.deepEqual([by.A.label, by.B.shape, by.D.shape, by.E.shape], ['Start', 'diamond', 'ellipse', 'ellipse']);
  const edge = (a, b) => g.edges.find((e) => e.from === a && e.to === b);
  assert.equal(edge('B', 'C').label, 'Yes');
  assert.equal(edge('B', 'D').label, 'No');
  assert.ok(edge('D', 'A').dashed);
  assert.ok(edge('C', 'E').bold && edge('C', 'F'), 'an & list makes one edge each');
  assert.equal(edge('G', 'H').arrow, false, '--- is a line without arrowhead');
  assert.deepEqual(g.groups.map((x) => [x.title, x.nodes]), [['Group one', ['C']]]);
  assert.equal(parseText('flowchart TD\nA-->B;B-->C').edges.length, 2, 'statements split by ;');
});

test('text to diagram: an indented list and arrow lines', () => {
  const o = parseText('Product\n  Web\n    - Editor\n    * Menu\n  Desktop\n\tApp\n1. Notes');
  assert.equal(o.kind, 'outline');
  assert.deepEqual(o.nodes.map((n) => n.label), ['Product', 'Web', 'Editor', 'Menu', 'Desktop', 'App', 'Notes']);
  const parent = (label) => o.nodes.find((n) => n.id === o.edges.find((e) => e.to === o.nodes.find((x) => x.label === label).id)?.from)?.label;
  assert.deepEqual(['Web', 'Editor', 'Menu', 'Desktop', 'App'].map(parent), ['Product', 'Web', 'Web', 'Product', 'Desktop'], 'a tab counts as four spaces');
  assert.equal(parent('Notes'), undefined, 'a line back at the left starts a new tree');
  const a = parseText('Browser -> DNS: lookup\nDNS → Server\nServer => Browser: HTML');
  assert.equal(a.kind, 'arrows');
  assert.deepEqual(a.nodes.map((n) => n.label), ['Browser', 'DNS', 'Server']);
  assert.deepEqual(a.edges.map((e) => e.label), ['lookup', '', 'HTML']);
  assert.equal(parseText('just one line'), null, 'one box is not a diagram');
  assert.equal(parseText(''), null);
});

test('text to diagram: the layout keeps boxes apart, follows the direction and survives cycles', () => {
  for (const dir of ['TD', 'LR', 'BT', 'RL']) {
    const g = parseText(`graph ${dir}\nA-->B\nA-->C\nA-->D\nB-->E\nC-->E\nD-->E\nE-->A`);
    const boxes = layoutGraph(g);
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) assert.ok(!overlap(boxes[i], boxes[j]), `${dir}: boxes ${i} and ${j} overlap`);
    const [a, , , , e] = boxes;
    const forward = { TD: e.y > a.y, BT: e.y < a.y, LR: e.x > a.x, RL: e.x < a.x }[dir];
    assert.ok(forward, `${dir}: the flow goes that way`);
  }
});

test('text to diagram: elements are valid, attached and survive saving and opening', () => {
  const r = textToElements('graph TD\nA[Idea] -->|why| B[Plan]\nA --> C{Sketch?}\nsubgraph S [Work]\nB\nC\nend', { at: { x: 100, y: 50 } });
  const types = r.elements.map((e) => e.type);
  assert.equal(types[0], 'frame', 'frames go behind');
  assert.equal(r.elements[0].name, 'Work');
  const arrows = r.elements.filter((e) => e.type === 'arrow');
  assert.equal(arrows.length, 2);
  for (const a of arrows) assert.ok(a.startId && a.endId, 'every arrow is attached at both ends');
  assert.ok(r.elements.some((e) => e.type === 'text' && e.text === 'why' && !e.containerId), 'the edge label');
  assert.equal(r.elements.filter((e) => e.containerId).length, 3, 'the text of each box is inside it');
  const b = E.sceneBounds(r.elements.filter((e) => e.type !== 'frame' && e.type !== 'text'));
  assert.ok(Math.abs(b.x + b.w / 2 - 100) < 40 && Math.abs(b.y + b.h / 2 - 50) < 60, 'centred on the point given');
  const again = E.parseScene(E.serializeScene({ ...E.emptyScene(), elements: r.elements }));
  assert.equal(again.elements.length, r.elements.length);
  assert.equal(textToElements('A -> B', { direction: 'LR' }).elements.filter((e) => e.type === 'arrow').length, 1);
  // A list keeps its order, and a parent sits centred over its children.
  const tree = layoutGraph(parseText('Root\n  One\n    Leaf\n  Two\n  Three'));
  tree.splice(2, 1);
  const cx = (b) => b.x + b.w / 2;
  assert.ok(cx(tree[1]) < cx(tree[2]) && cx(tree[2]) < cx(tree[3]), 'children in the order written');
  assert.ok(Math.abs(cx(tree[0]) - cx(tree[2])) < 1, 'the parent over the middle child');
});

test('text to diagram: limits, and hostile or huge text never throws or hangs', () => {
  const many = `graph TD\n${Array.from({ length: 1000 }, (_, i) => `N${i} --> N${i + 1}`).join('\n')}`;
  const t0 = Date.now();
  const g = parseText(many);
  assert.equal(g.nodes.length, LIMITS.nodes);
  assert.ok(g.edges.length <= LIMITS.edges);
  textToElements(many);
  assert.ok(Date.now() - t0 < 3000, `fast enough: ${Date.now() - t0} ms`);
  assert.equal(parseText(`A[${'x'.repeat(5000)}] --> B`).nodes[0].label.length, LIMITS.label);
  const nasty = ['graph TD\n' + '-'.repeat(20000) + '>', 'graph TD\nA' + '-.'.repeat(5000) + '->B', '((((((((', '[[[[]]]]', 'subgraph\nend\nend\nend',
    'A["unclosed --> B', '__proto__ --> constructor', 'A -> -> -> B', 'graph\n\u0000  -->', '  \n\t\n   ', '-- x --', `${'  '.repeat(5000)}a\nb`];
  for (const s of nasty) {
    const t = Date.now();
    assert.doesNotThrow(() => textToElements(s), s.slice(0, 30));
    assert.ok(Date.now() - t < 1000, `slow on ${JSON.stringify(s.slice(0, 30))}`);
  }
  assert.equal(({}).polluted, undefined);
  // Random text (seeded): never throws, and what it makes is valid.
  let seed = 7;
  const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  const bits = ['A', 'B', 'c1', '-->', '---', '-.->', '==>', '|x|', '[', ']', '(', ')', '{', '}', '&', ';', '\n', '  ', 'subgraph s', 'end', '->', ':', '"', '%%', 'graph LR\n', '- ', '1. '];
  for (let run = 0; run < 400; run++) {
    const s = Array.from({ length: rnd(40) }, () => bits[rnd(bits.length)]).join(rnd(2) ? ' ' : '');
    const r = textToElements(s);
    if (r) for (const e of r.elements) assert.ok(E.cleanElement(e), `valid element from ${JSON.stringify(s)}`);
  }
});

test('templates: each one, in each language, is a diagram', () => {
  for (const id of Object.keys(TEMPLATES)) {
    for (const lang of ['en', 'es', 'fr']) {
      const t = template(id, lang);
      const r = textToElements(t.text, { direction: t.direction });
      assert.ok(r && r.nodes >= 4 && r.edges >= 3, `${id} (${lang})`);
      assert.ok(r.elements.filter((e) => e.type === 'arrow').every((a) => a.startId && a.endId));
    }
  }
  assert.equal(template('__proto__'), null, 'only real templates');
  assert.equal(template('flowchart', 'es').name, 'Diagrama de flujo');
});

test('long runs of spaces are read in linear time', () => {
  for (const text of ['A -> B\nx' + ' '.repeat(49000) + 'y -> z', 'A -> B\nC' + ' '.repeat(49900) + 'D', 'a\n' + ' '.repeat(49000) + 'b']) {
    const t0 = Date.now();
    parseText(text);
    assert.ok(Date.now() - t0 < 300, `${Date.now() - t0} ms`);
  }
});
