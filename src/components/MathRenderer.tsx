import React from 'react';
import katex from 'katex';
import { TrendingUp, Table as TableIcon } from 'lucide-react';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Kiểm tra xem chuỗi có phải là công thức toán LaTeX thực sự hay là câu tiếng Việt bị kẹp nhầm dấu $
 */
function isTrueMathExpression(tex: string): boolean {
  const trimmed = tex.trim();
  if (!trimmed) return false;

  // 1. Kiểm tra tiếng Việt trước tiên: Nếu có >= 2 từ tiếng Việt có dấu -> Chắc chắn là văn bản thường
  const words = trimmed.split(/\s+/);
  const vietnameseAccentedWords = words.filter((w) =>
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(w)
  );
  if (vietnameseAccentedWords.length >= 2) {
    return false;
  }

  // 2. Nếu có >= 4 từ cách nhau bởi khoảng trắng mà không chứa cấu trúc khối LaTeX chuyên sâu
  if (words.length >= 4 && !trimmed.includes('\\begin') && !trimmed.includes('\\frac') && !trimmed.includes('\\pmatrix')) {
    return false;
  }

  // 3. Nếu chứa các ký hiệu toán học đặc thù
  if (
    trimmed.includes('\\') ||
    trimmed.includes('^') ||
    trimmed.includes('_') ||
    trimmed.includes('=') ||
    trimmed.includes('+') ||
    trimmed.includes('-') ||
    trimmed.includes('*') ||
    trimmed.includes('/') ||
    trimmed.includes('<') ||
    trimmed.includes('>') ||
    trimmed.includes('{') ||
    trimmed.includes('}') ||
    trimmed.includes('\\ge') ||
    trimmed.includes('\\le') ||
    trimmed.includes('\\sqrt') ||
    trimmed.includes('\\frac') ||
    trimmed.includes('\\infty') ||
    trimmed.includes('\\nearrow') ||
    trimmed.includes('\\searrow')
  ) {
    return true;
  }

  // 4. Nếu là biến đơn hoặc số đơn giản (ví dụ $x$, $y$, $10$, $a$, $b$, $x_1$)
  if (/^[a-zA-Z0-9\s,\.\'\"]+$/.test(trimmed) && trimmed.length <= 15) {
    return true;
  }

  return true;
}

/**
 * Render một đoạn văn bản thuần chứa định dạng Markdown inline (**in đậm**, *nghiêng*, `code`)
 * và loại bỏ triệt để các dấu hoa thị thừa thãi gây rối mắt.
 */
function renderFormattedInlineText(text: string, keyPrefix: string): React.ReactNode[] {
  if (!text) return [];

  const nodes: React.ReactNode[] = [];
  const tokenRegex = /(\*\*[^\*]+?\*\*|\*[^\*]+?\*|`[^`]+?`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const startIdx = match.index;
    if (startIdx > lastIdx) {
      const cleanPlain = text.substring(lastIdx, startIdx).replace(/(?<!\*)\*(?!\*)/g, '');
      nodes.push(<span key={`${keyPrefix}-plain-${lastIdx}`}>{cleanPlain}</span>);
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      nodes.push(
        <strong key={`${keyPrefix}-bold-${startIdx}`} className="font-bold text-slate-900">
          {inner}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <em key={`${keyPrefix}-italic-${startIdx}`} className="italic text-slate-800 font-serif">
          {inner}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      nodes.push(
        <code
          key={`${keyPrefix}-code-${startIdx}`}
          className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-emerald-800 font-mono text-[11px]"
        >
          {inner}
        </code>
      );
    }

    lastIdx = startIdx + token.length;
  }

  if (lastIdx < text.length) {
    const cleanTrailing = text.substring(lastIdx).replace(/(?<!\*)\*(?!\*)/g, '');
    nodes.push(<span key={`${keyPrefix}-plain-end`}>{cleanTrailing}</span>);
  }

  return nodes;
}

/**
 * Render công thức toán an toàn với KaTeX
 */
function safeRenderKaTeX(tex: string, isBlock: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode: isBlock,
      throwOnError: false,
      output: 'htmlAndMathml',
    });
  } catch {
    return tex;
  }
}

/**
 * Xử lý chuỗi chứa công thức toán $...$ hoặc $$...$$ xen kẽ văn bản Markdown
 */
function renderParagraphWithMath(
  text: string,
  keyPrefix: string
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      const textChunk = text.substring(lastIndex, matchIndex);
      parts.push(...renderFormattedInlineText(textChunk, `${keyPrefix}-txt-${lastIndex}`));
    }

    const token = match[0];
    const isBlock = token.startsWith('$$');
    const rawTex = isBlock ? token.slice(2, -2).trim() : token.slice(1, -1).trim();

    if (!isTrueMathExpression(rawTex)) {
      parts.push(...renderFormattedInlineText(rawTex, `${keyPrefix}-pseudo-${matchIndex}`));
    } else {
      parts.push(
        <span
          key={`${keyPrefix}-math-${matchIndex}`}
          className={isBlock ? 'my-2 block overflow-x-auto text-center' : 'inline-block mx-0.5 align-baseline'}
          dangerouslySetInnerHTML={{ __html: safeRenderKaTeX(rawTex, isBlock) }}
        />
      );
    }

    lastIndex = matchIndex + token.length;
  }

  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    parts.push(...renderFormattedInlineText(remainingText, `${keyPrefix}-txt-end`));
  }

  return parts;
}

/**
 * Làm sạch và chuẩn hóa nội dung của ô trong bảng:
 * Tự động chuyển các ký hiệu toán học như \nearrow, \searrow, -\infty, +\infty, 0, +, -, || thành KaTeX
 */
function renderTableCellContent(rawCell: string, cellKey: string): React.ReactNode {
  let cell = rawCell.trim();
  if (!cell) return <span className="text-slate-300">-</span>;

  // Xử lý dấu không xác định hai gạch thẳng đứng ||
  if (cell === '||' || cell === '\\|\\|' || cell === '|') {
    return (
      <span className="inline-block px-1 font-bold text-slate-700 tracking-tighter select-none" title="Không xác định">
        &#x2551;
      </span>
    );
  }

  // Tự động nhận diện mũi tên biến thiên
  if (cell === '\\nearrow' || cell.includes('\\nearrow')) {
    cell = cell.replace(/\\nearrow/g, '$\\nearrow$');
  }
  if (cell === '\\searrow' || cell.includes('\\searrow')) {
    cell = cell.replace(/\\searrow/g, '$\\searrow$');
  }

  // Nếu cell chứa ký hiệu toán học không có $ (ví dụ: -\infty, +\infty, x_0)
  if (
    !cell.includes('$') &&
    (cell.includes('\\') || cell.includes('infty') || /^[+-]?(\d+|\d*\.\d+)$/.test(cell) || cell === '+' || cell === '-' || cell === '0')
  ) {
    cell = `$${cell}$`;
  }

  return <>{renderParagraphWithMath(cell, cellKey)}</>;
}

/**
 * Kiểm tra xem một danh sách các dòng có phải là Markdown Table không
 */
function isMarkdownTableLines(lines: string[]): boolean {
  if (lines.length < 2) return false;
  const tableLines = lines.filter((l) => l.trim().length > 0);
  if (tableLines.length < 2) return false;

  // Dòng đầu phải có |
  if (!tableLines[0].includes('|')) return false;

  // Phải có dòng phân cách dạng |---|---| hoặc |:---:|
  const hasDelimiter = tableLines.some((l) =>
    /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(l.trim())
  );

  return hasDelimiter;
}

/**
 * Component hiển thị Bảng Biến Thiên hoặc Bảng Dữ Liệu Toán Học chuẩn GDPT 2018
 */
function MarkdownTableBlock({ rawBlock, blockKey }: { rawBlock: string; blockKey: string }) {
  const lines = rawBlock
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Tách các hàng và các ô
  const parsedRows: string[][] = [];
  let delimiterIndex = -1;

  lines.forEach((line, idx) => {
    if (/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line)) {
      delimiterIndex = idx;
      return;
    }

    // Tách ô bằng |
    let parts = line.split('|');
    // Nếu bắt đầu bằng | thì bỏ phần tử rỗng đầu
    if (line.startsWith('|')) {
      parts = parts.slice(1);
    }
    // Nếu kết thúc bằng | thì bỏ phần tử rỗng cuối
    if (line.endsWith('|')) {
      parts = parts.slice(0, -1);
    }

    const cleanedRow = parts.map((p) => p.trim());
    if (cleanedRow.length > 0) {
      parsedRows.push(cleanedRow);
    }
  });

  if (parsedRows.length === 0) return null;

  // Kiểm tra xem bảng này có phải là Bảng biến thiên hay không
  // Dấu hiệu: Hàng đầu tiên bắt đầu bằng x (hoặc $x$), hàng hai là y' (hoặc f'(x)), hàng ba là y (hoặc f(x))
  const firstCellRow0 = (parsedRows[0]?.[0] || '').toLowerCase().replace(/[\$\s]/g, '');
  const firstCellRow1 = (parsedRows[1]?.[0] || '').toLowerCase().replace(/[\$\s]/g, '');
  const firstCellRow2 = (parsedRows[2]?.[0] || '').toLowerCase().replace(/[\$\s]/g, '');

  const isVariationTable =
    firstCellRow0 === 'x' &&
    (firstCellRow1.includes("y'") || firstCellRow1.includes("f'(x)") || firstCellRow1 === 'y' || firstCellRow1 === 'f(x)') ||
    rawBlock.includes('\\nearrow') ||
    rawBlock.includes('\\searrow');

  if (isVariationTable) {
    return (
      <div className="my-4 overflow-hidden rounded-2xl border-2 border-emerald-800/80 bg-white shadow-sm font-sans">
        {/* Header Badge */}
        <div className="bg-emerald-800 text-white px-3.5 py-1.5 flex items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            Bảng Biến Thiên Chuẩn Mực (GDPT 2018)
          </span>
          <span className="text-[10px] text-emerald-200 font-normal">Hàm số liên tục</span>
        </div>

        {/* Nội dung Bảng Biến Thiên 3 Hàng */}
        <div className="overflow-x-auto p-2">
          <table className="w-full border-collapse text-xs sm:text-sm text-center min-w-[420px]">
            <tbody>
              {parsedRows.map((row, rIdx) => {
                const isXRow = rIdx === 0;
                const isDerivRow = rIdx === 1;
                const isYRow = rIdx === 2;

                return (
                  <tr
                    key={`v-row-${rIdx}`}
                    className={`border-b ${
                      isXRow
                        ? 'border-b-2 border-emerald-700 bg-slate-50/70'
                        : isDerivRow
                        ? 'border-b-2 border-emerald-700 bg-white'
                        : 'border-none bg-emerald-50/30'
                    }`}
                  >
                    {row.map((cell, cIdx) => {
                      const isHeaderCell = cIdx === 0;
                      return (
                        <td
                          key={`v-cell-${rIdx}-${cIdx}`}
                          className={`py-2 px-2.5 transition-colors ${
                            isHeaderCell
                              ? 'font-bold font-serif text-emerald-950 bg-emerald-100/60 border-r-2 border-emerald-700 text-center w-16 text-sm sm:text-base sticky left-0 z-10'
                              : 'text-slate-800'
                          } ${isYRow ? 'h-16 align-middle' : 'h-10 align-middle'}`}
                        >
                          <div className="flex items-center justify-center min-h-[24px]">
                            {renderTableCellContent(cell, `${blockKey}-${rIdx}-${cIdx}`)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Bảng thông thường (General Data Table)
  const headerRow = delimiterIndex > 0 ? parsedRows[0] : null;
  const bodyRows = delimiterIndex > 0 ? parsedRows.slice(1) : parsedRows;

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs font-sans">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-[13px] text-left">
          {headerRow && (
            <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                {headerRow.map((hCell, hIdx) => (
                  <th key={`th-${hIdx}`} className="py-2.5 px-3.5 text-center border-r border-slate-200 last:border-none">
                    {renderTableCellContent(hCell, `${blockKey}-th-${hIdx}`)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr
                key={`tr-${rIdx}`}
                className={`border-b border-slate-100 transition-colors hover:bg-emerald-50/40 ${
                  rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                }`}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={`td-${rIdx}-${cIdx}`}
                    className="py-2 px-3 text-center border-r border-slate-200/60 last:border-none text-slate-700"
                  >
                    {renderTableCellContent(cell, `${blockKey}-td-${rIdx}-${cIdx}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * MathRenderer parses text with inline `$formula$` or display `$$formula$$`,
 * cleans markdown asterisks, structures paragraphs, and renders KaTeX cleanly.
 * Hỗ trợ nhận diện và hiển thị Bảng Biến Thiên & Bảng Markdown chuyên nghiệp.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', inline = false }) => {
  if (!content) return null;

  // Nếu là inline và không chứa công thức
  if (inline && !content.includes('$')) {
    return <span className={`inline-block ${className}`}>{renderFormattedInlineText(content, 'inline-clean')}</span>;
  }

  // Tách dòng để xử lý bảng markdown, danh sách, tiêu đề
  const rawParagraphs = content.split(/\r?\n\r?\n/);

  return (
    <div className={`math-content space-y-2.5 leading-relaxed ${className}`}>
      {rawParagraphs.map((para, paraIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // KIỂM TRA BẢNG MARKDOWN HOẶC BẢNG BIẾN THIÊN
        const lines = trimmed.split(/\r?\n/);
        if (isMarkdownTableLines(lines)) {
          return <MarkdownTableBlock key={`table-${paraIdx}`} rawBlock={trimmed} blockKey={`tbl-${paraIdx}`} />;
        }

        // Xử lý tiêu đề markdown: ### hoặc ##
        if (trimmed.startsWith('### ')) {
          const headerText = trimmed.replace(/^###\s+/, '');
          return (
            <h4
              key={`h4-${paraIdx}`}
              className="text-xs sm:text-sm font-bold text-slate-900 border-l-3 border-emerald-600 pl-2.5 my-2.5 pt-0.5"
            >
              {renderParagraphWithMath(headerText, `h4-${paraIdx}`)}
            </h4>
          );
        }

        if (trimmed.startsWith('## ')) {
          const headerText = trimmed.replace(/^##\s+/, '');
          return (
            <h3
              key={`h3-${paraIdx}`}
              className="text-sm sm:text-base font-bold text-emerald-950 uppercase tracking-tight my-3 pb-1 border-b border-emerald-200"
            >
              {renderParagraphWithMath(headerText, `h3-${paraIdx}`)}
            </h3>
          );
        }

        // Tách các dòng bên trong đoạn (list items hoặc line breaks)
        return (
          <div key={`para-${paraIdx}`} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const lineTrimmed = line.trim();
              if (!lineTrimmed) return null;

              // Xử lý mục gạch đầu dòng dạng: * hoặc - hoặc •
              const isBullet = /^[\*\-\•]\s+/.test(lineTrimmed);
              // Xử lý mục đánh số dạng: 1. hoặc 2. hoặc ?1:
              const isNumbered = /^\d+\.\s+/.test(lineTrimmed);
              const isQuestionPrompt = /^\?[0-9a-zA-Z]+\:\s*/.test(lineTrimmed);

              if (isBullet) {
                const bulletContent = lineTrimmed.replace(/^[\*\-\•]\s+/, '');
                return (
                  <div key={`line-${paraIdx}-${lineIdx}`} className="flex items-start gap-2 pl-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-2"></span>
                    <div className="flex-1 text-justify">
                      {renderParagraphWithMath(bulletContent, `b-${paraIdx}-${lineIdx}`)}
                    </div>
                  </div>
                );
              }

              if (isNumbered) {
                const numMatch = lineTrimmed.match(/^(\d+)\.\s+(.*)/);
                const num = numMatch ? numMatch[1] : '1';
                const numContent = numMatch ? numMatch[2] : lineTrimmed;

                return (
                  <div key={`line-${paraIdx}-${lineIdx}`} className="flex items-start gap-2 pl-1 my-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0 mt-0.5 shadow-2xs">
                      {num}
                    </span>
                    <div className="flex-1 text-justify">
                      {renderParagraphWithMath(numContent, `num-${paraIdx}-${lineIdx}`)}
                    </div>
                  </div>
                );
              }

              if (isQuestionPrompt) {
                return (
                  <div key={`line-${paraIdx}-${lineIdx}`} className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 my-1 text-blue-950 font-medium">
                    {renderParagraphWithMath(lineTrimmed, `q-${paraIdx}-${lineIdx}`)}
                  </div>
                );
              }

              return (
                <div key={`line-${paraIdx}-${lineIdx}`} className="text-justify">
                  {renderParagraphWithMath(lineTrimmed, `p-${paraIdx}-${lineIdx}`)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default MathRenderer;
