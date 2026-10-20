import React from 'react';
import katex from 'katex';

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

  // Nếu chứa các ký hiệu toán học đặc thù
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
    trimmed.includes('(') ||
    trimmed.includes(')') ||
    trimmed.includes('\\ge') ||
    trimmed.includes('\\le') ||
    trimmed.includes('\\sqrt') ||
    trimmed.includes('\\frac')
  ) {
    return true;
  }

  // Nếu là biến đơn hoặc số đơn giản (ví dụ $x$, $y$, $10$, $a$, $b$, $x_1$)
  if (/^[a-zA-Z0-9\s,\.\'\"]+$/.test(trimmed) && trimmed.length <= 15) {
    return true;
  }

  // Nếu có nhiều hơn 3 từ tiếng Việt có dấu và không có toán tử -> coi là văn bản thường
  const vietnameseWords = trimmed.split(/\s+/).filter(w => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(w));
  if (vietnameseWords.length >= 2) {
    return false;
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
  // Regex tách **bold**, *italic*, `code`
  const tokenRegex = /(\*\*[^\*]+?\*\*|\*[^\*]+?\*|`[^`]+?`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const startIdx = match.index;
    if (startIdx > lastIdx) {
      // Dọn dẹp dấu hoa thị rác lẻ loi
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
 * MathRenderer parses text with inline `$formula$` or display `$$formula$$`,
 * cleans markdown asterisks, structures paragraphs, and renders KaTeX cleanly.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', inline = false }) => {
  if (!content) return null;

  // Function to render math safely
  const renderFormula = (tex: string, isBlock: boolean): string => {
    try {
      return katex.renderToString(tex, {
        displayMode: isBlock,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return tex;
    }
  };

  // If inline and doesn't contain dollar sign
  if (inline && !content.includes('$')) {
    return <span className={`inline-block ${className}`}>{renderFormattedInlineText(content, 'inline-clean')}</span>;
  }

  // Tách dòng để xử lý danh sách, tiêu đề, và đoạn văn bản ngắt ý đẹp mắt
  const rawParagraphs = content.split(/\r?\n\r?\n/);

  return (
    <div className={`math-content space-y-2.5 leading-relaxed ${className}`}>
      {rawParagraphs.map((para, paraIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Xử lý tiêu đề markdown: ### hoặc ##
        if (trimmed.startsWith('### ')) {
          const headerText = trimmed.replace(/^###\s+/, '');
          return (
            <h4
              key={`h4-${paraIdx}`}
              className="text-xs sm:text-sm font-bold text-slate-900 border-l-3 border-emerald-600 pl-2.5 my-2.5 pt-0.5"
            >
              {renderParagraphWithMath(headerText, `h4-${paraIdx}`, renderFormula)}
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
              {renderParagraphWithMath(headerText, `h3-${paraIdx}`, renderFormula)}
            </h3>
          );
        }

        // Tách các dòng bên trong đoạn (list items hoặc line breaks)
        const lines = trimmed.split(/\r?\n/);

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
                      {renderParagraphWithMath(bulletContent, `b-${paraIdx}-${lineIdx}`, renderFormula)}
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
                      {renderParagraphWithMath(numContent, `num-${paraIdx}-${lineIdx}`, renderFormula)}
                    </div>
                  </div>
                );
              }

              if (isQuestionPrompt) {
                return (
                  <div key={`line-${paraIdx}-${lineIdx}`} className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 my-1 text-blue-950 font-medium">
                    {renderParagraphWithMath(lineTrimmed, `q-${paraIdx}-${lineIdx}`, renderFormula)}
                  </div>
                );
              }

              return (
                <div key={`line-${paraIdx}-${lineIdx}`} className="text-justify">
                  {renderParagraphWithMath(lineTrimmed, `p-${paraIdx}-${lineIdx}`, renderFormula)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Xử lý chuỗi chứa công thức toán $...$ hoặc $$...$$ xen kẽ văn bản Markdown
 */
function renderParagraphWithMath(
  text: string,
  keyPrefix: string,
  renderFormula: (tex: string, isBlock: boolean) => string
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  // Regex khớp $$...$$ hoặc $...$
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

    // Kiểm tra xem có phải văn bản tiếng Việt bị kẹp nhầm dấu $ không
    if (!isTrueMathExpression(rawTex)) {
      parts.push(...renderFormattedInlineText(rawTex, `${keyPrefix}-pseudo-${matchIndex}`));
    } else {
      parts.push(
        <span
          key={`${keyPrefix}-math-${matchIndex}`}
          className={isBlock ? 'my-2 block overflow-x-auto text-center' : 'inline-block mx-0.5 align-baseline'}
          dangerouslySetInnerHTML={{ __html: renderFormula(rawTex, isBlock) }}
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

export default MathRenderer;
