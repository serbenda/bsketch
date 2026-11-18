#!/usr/bin/env node
// Builds the portable version: a single HTML file with everything inside (code, styles, font and icon)
// that opens with a double click in any browser, with nothing to install and no connection.
// Its CSP forbids any network connection and only allows the script and style it carries.
//
// Usage: node scripts/build-portable.mjs [output]   (default: dist/bsketch-portable.html)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(process.argv[2] || join(ROOT, 'dist', 'bsketch-portable.html'));
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// --- ES modules → a single classic script (file:// does not allow modules) ---
const IMPORT_RE = /^import\s+(?:\*\s+as\s+(\w+)|\{([^}]*)\})\s+from\s+'\.\/([\w-]+)\.js';\s*$/gm;
const modules = new Map();
const order = [];

function load(name) {
  if (modules.has(name)) return;
  modules.set(name, null); // in progress: to detect cycles
  let src = read(`js/${name}.js`);
  const deps = [];
  src = src.replace(IMPORT_RE, (_, star, named, dep) => {
    deps.push(dep);
    if (star) return `const ${star} = __m[${JSON.stringify(dep)}];`;
    const parts = named.split(',').map((x) => x.trim()).filter(Boolean).map((x) => x.replace(/\s+as\s+/, ': '));
    return `const { ${parts.join(', ')} } = __m[${JSON.stringify(dep)}];`;
  });
  if (/^\s*import\s/m.test(src)) throw new Error(`${name}.js: import not supported by the bundler`);
  const exported = [];
  src = src.replace(/^export\s+(async\s+function\*?|function\*?|class|const|let)\s+([\w$]+)/gm, (_, kind, id) => {
    exported.push(id);
    return `${kind} ${id}`;
  });
  if (/^export\s/m.test(src)) throw new Error(`${name}.js: export not supported by the bundler`);
  for (const d of deps) {
    if (modules.get(d) === null) throw new Error(`Circular dependency: ${name} → ${d}`);
    load(d);
  }
  modules.set(name, `__m[${JSON.stringify(name)}] = (() => {\n${src}\nreturn { ${exported.join(', ')} };\n})();`);
  order.push(name);
}
load('app');

const script = `(() => {\n'use strict';\nconst __m = {};\n${order.map((n) => modules.get(n)).join('\n\n')}\n})();`;
const b64 = (p) => readFileSync(join(ROOT, p)).toString('base64');
const iconUri = `data:image/svg+xml;base64,${b64('icon.svg')}`;
const fontUri = `data:font/woff;base64,${b64('fonts/caveat.woff')}`;

const sketchCss = read('css/sketch.css');
if (!sketchCss.includes('url("../fonts/caveat.woff")')) throw new Error('The font is not in css/sketch.css');
const css = `${read('css/styles.css')}\n${sketchCss.replace('url("../fonts/caveat.woff")', `url("${fontUri}")`)}`;

const sha = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const csp = [
  "default-src 'none'",
  `script-src ${sha(script)}`,
  `style-src ${sha(css)}`,
  'img-src data: blob:',
  'font-src data:',
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "require-trusted-types-for 'script'",
  'trusted-types sketch',
].join('; ');

let html = read('index.html');
const swap = (re, value) => {
  if (!re.test(html)) throw new Error(`${re} not found in index.html`);
  html = html.replace(re, value);
};
swap(/<meta http-equiv="Content-Security-Policy"\s+content="[^"]*">/, `<meta http-equiv="Content-Security-Policy" content="${csp}">`);
swap(/<link rel="icon" href="icon\.svg"[^>]*>/, `<link rel="icon" href="${iconUri}" type="image/svg+xml">`);
swap(/\n\s*<link rel="manifest"[^>]*>/, ''); // no service worker and no install
swap(/\n\s*<link rel="preload"[^>]*>/, '');
swap(/\n\s*<link rel="stylesheet" href="css\/sketch\.css">/, ''); // goes together with styles.css
swap(/<link rel="stylesheet" href="css\/styles\.css">/, () => `<style>${css}</style>`);
swap(/\n\s*<script type="module" src="js\/app\.js"><\/script>/, '');
swap(/<img src="icon\.svg"/, `<img src="${iconUri}"`);
swap(/\n\s*<a id="portable"[^>]*>[^<]*<\/a>/, ''); // this already is the portable version
swap(/<title>bsketch<\/title>/, '<title>bsketch portable</title>');
swap(/<!-- No network:[^>]*-->/, '<!-- Portable version: everything is inside this file and it connects to nothing. -->');
html = html.replace('</body>', () => `<script>${script}</script>\n</body>`);

const version = JSON.parse(read('package.json')).version || '0.0.0';
const stamp = `<!-- bsketch portable ${version}: open it with a double click in any browser. Nothing to install and no connection. -->\n`;
html = html.replace(/^<!DOCTYPE html>\n/i, (m) => `${m}${stamp}`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`${OUT} (${(html.length / 1024).toFixed(0)} KB, ${order.length} modules)`);
