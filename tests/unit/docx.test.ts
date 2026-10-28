import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { buildDocx } from '../../src/documents/exportDocx.ts';
import { latexToOmml } from '../../src/documents/mathDocx.ts';

test('DOCX is genuine OOXML containing editable equations, lists, tables and page breaks', async () => {
  const formulas = [
    '\\frac{1}{2}',
    '\\sqrt{x+1}',
    'x_1^2',
    '\\int_0^1 x^2 dx',
    '\\sum_{i=1}^{n} i',
    '\\vec{AB}',
    '\\begin{matrix}1&2\\\\3&4\\end{matrix}',
  ];
  const content = {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Tiếng Việt <script>không chạy</script>' }] },
      {
        type: 'bulletList',
        content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mục danh sách chấm' }] }] }],
      },
      {
        type: 'orderedList',
        attrs: { start: 1 },
        content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mục danh sách số' }] }] }],
      },
      ...formulas.map(latex => ({ type: 'blockMath', attrs: { latex } })),
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [{ type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bảng thật' }] }] }],
          },
        ],
      },
      { type: 'pageBreak' },
    ],
  };
  const bytes = await buildDocx(content);
  assert.equal(bytes[0], 80);
  assert.equal(bytes[1], 75);
  const zip = await JSZip.loadAsync(bytes);
  assert.ok(zip.file('[Content_Types].xml'));
  const xml = await zip.file('word/document.xml')!.async('text');
  for (const tag of ['m:oMath', 'm:f', 'm:rad', 'm:sSubSup', 'm:nary', 'm:m', 'm:acc', 'w:tbl', 'w:br', 'w:numPr']) {
    assert.ok(xml.includes(`<${tag}`), tag);
  }
  assert.ok(xml.includes('&lt;script&gt;'));
  assert.ok(xml.includes('Mục danh sách chấm'));
  assert.ok(xml.includes('Mục danh sách số'));
  assert.ok(!xml.includes('<html'));
});

test('unsupported math and unknown document nodes fail instead of silently dropping content', async () => {
  assert.throws(() => latexToOmml('\\unsupported{x}'), /Chưa hỗ trợ/);
  await assert.rejects(() => buildDocx({ type: 'doc', content: [{ type: 'unknown' }] }), /Chưa hỗ trợ/);
  assert.throws(() => latexToOmml('\\frac{1}'), /thiếu/);
});
