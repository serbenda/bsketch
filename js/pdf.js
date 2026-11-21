// © 2026 Sergio Santiago Bendaña Quesada. All rights reserved: no use, copy or reuse without written permission,
// and no use by AI or automated tools (training, datasets, retrieval, code generation, scraping). See LICENSE. bsketch-7f3a9c2e
// A small PDF writer: one JPEG image per page, each page the image's proportions. No library: the pages are pictures
// the browser already encodes (JPEG goes into a PDF as it is, with the DCTDecode filter). Pure, no DOM.

const enc = new TextEncoder();

// pages: [{ jpeg: Uint8Array, width, height }] (pixels) → the PDF's bytes. `longSide` is the page's longest side in
// points (842 pt is A4's).
export function makePdf(pages, { longSide = 842, title = '' } = {}) {
  if (!pages.length) throw new Error('no_pages');
  const parts = [];
  const offsets = [];
  let size = 0;
  const push = (data) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data;
    parts.push(bytes);
    size += bytes.length;
  };
  const obj = (n, body) => {
    offsets[n] = size;
    push(`${n} 0 obj\n`);
    for (const b of [].concat(body)) push(b);
    push('\nendobj\n');
  };
  // Objects: 1 catalog, 2 pages, 3 info; then per page: page, content, image.
  const n = pages.length;
  const pageObj = (i) => 4 + i * 3;
  push('%PDF-1.4\n%âãÏÓ\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Count ${n} /Kids [${pages.map((_, i) => `${pageObj(i)} 0 R`).join(' ')}] >>`);
  const safeTitle = String(title).replace(/[^\x20-\x7e]/g, '?').replace(/([\\()])/g, '\\$1').slice(0, 200);
  obj(3, `<< /Producer (bsketch) /Title (${safeTitle}) >>`);
  pages.forEach((p, i) => {
    const k = longSide / Math.max(p.width, p.height);
    const w = Math.round(p.width * k * 100) / 100;
    const h = Math.round(p.height * k * 100) / 100;
    const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
    obj(pageObj(i), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${pageObj(i) + 2} 0 R >> >> /Contents ${pageObj(i) + 1} 0 R >>`);
    obj(pageObj(i) + 1, [`<< /Length ${content.length} >>\nstream\n`, content, '\nendstream']);
    obj(pageObj(i) + 2, [
      `<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`,
      p.jpeg,
      '\nendstream',
    ]);
  });
  const count = 4 + n * 3;
  const xref = size;
  push(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let i = 1; i < count; i++) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size ${count} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const out = new Uint8Array(size);
  let at = 0;
  for (const b of parts) {
    out.set(b, at);
    at += b.length;
  }
  return out;
}
