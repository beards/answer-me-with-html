// The `doc_width` setting: the doc template's reading width. The default leaves the page byte-identical to one from
// before the setting existed, the page carries the width it was made with, and the sheet template is untouched.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderDoc } from '../src/render.js';
import { rootTag, readPage } from '../src/page.js';
import { DOC_WIDTH, readDocWidth } from '../src/themes/doc-width.js';

const DOC = '---\ntemplate: doc\ntitle: Width\nlang: en\n---\n## A One\nbody text\n';
const SHEET = '---\ntemplate: sheet\ntitle: Width\nlang: en\n---\n## A One\nbody text\n';

test('doc_width: the default adds nothing to the page', () => {
  const plain = renderDoc(DOC).html;
  assert.equal(renderDoc(DOC, {}, {}, { docWidth: DOC_WIDTH.default }).html, plain);
  // base.css always declares the fallback; only the override and the root attribute are new.
  assert.doesNotMatch(plain, /html \{ --am-doc-max:/);
  assert.doesNotMatch(plain, /data-doc-width/);
});

test('doc_width: another width sets the variable and the root attribute', () => {
  const html = renderDoc(DOC, {}, {}, { docWidth: 1680 }).html;
  assert.match(html, /html \{ --am-doc-max: 1680px; \}/);
  assert.match(html.match(/<html\b[^>]*>/)[0], /data-doc-width="1680"/);
  // .am-doc reads the variable with the default as its fallback, so a page without the variable keeps the width it always had.
  assert.match(html, /\.am-doc \{ max-width: var\(--am-doc-max, 916px\);/);
});

test('doc_width: the sheet template keeps its own width', () => {
  const html = renderDoc(SHEET, {}, {}, { docWidth: 1200 }).html;
  assert.match(html, /\.am-sheet \{ max-width: 1680px;/);
});

test('doc_width: the root tag carries the width only when it is not the default', () => {
  const base = { lang: 'en', theme: 'paper', mode: 'auto', style: '80' };
  assert.doesNotMatch(rootTag(base), /data-doc-width/);
  assert.doesNotMatch(rootTag({ ...base, docWidth: DOC_WIDTH.default }), /data-doc-width/);
  assert.match(rootTag({ ...base, docWidth: 1680 }), /data-doc-width="1680"/);
});

test('doc_width: readPage reads it back, and falls back to the default', () => {
  const base = { lang: 'en', theme: 'paper', mode: 'auto', style: '80' };
  assert.equal(readPage(`${rootTag({ ...base, docWidth: 1680 })}</html>`).docWidth, 1680);
  assert.equal(readPage(`${rootTag(base)}</html>`).docWidth, DOC_WIDTH.default);
  // A page from before the setting existed, and a value outside the range.
  assert.equal(readPage('<html lang="en"></html>').docWidth, DOC_WIDTH.default);
  assert.equal(readPage('<html lang="en" data-doc-width="9000"></html>').docWidth, DOC_WIDTH.default);
  assert.equal(readPage('<html lang="en" data-doc-width="wide"></html>').docWidth, DOC_WIDTH.default);
});

test('readDocWidth: accepts the range and refuses anything outside it', () => {
  assert.equal(readDocWidth(String(DOC_WIDTH.min)), DOC_WIDTH.min);
  assert.equal(readDocWidth(String(DOC_WIDTH.max)), DOC_WIDTH.max);
  assert.equal(readDocWidth(String(DOC_WIDTH.min - 1)), DOC_WIDTH.default);
  assert.equal(readDocWidth(String(DOC_WIDTH.max + 1)), DOC_WIDTH.default);
  assert.equal(readDocWidth(undefined), DOC_WIDTH.default);
});
