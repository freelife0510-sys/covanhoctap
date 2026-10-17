import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * MathRenderer parses text with inline `$formula$` or display `$$formula$$`
 * or renders directly with KaTeX.
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

  // If the content is purely a formula without dollar signs and inline is specified
  if (inline && !content.includes('$')) {
    return (
      <span
        className={`katex-wrapper ${className}`}
        dangerouslySetInnerHTML={{ __html: renderFormula(content, false) }}
      />
    );
  }

  // Parse strings containing $ ... $ or $$ ... $$
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  // Regex matches $$...$$ or $...$
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {content.substring(lastIndex, matchIndex)}
        </span>
      );
    }

    const token = match[0];
    const isBlock = token.startsWith('$$');
    const tex = isBlock ? token.slice(2, -2).trim() : token.slice(1, -1).trim();

    parts.push(
      <span
        key={`math-${matchIndex}`}
        className={isBlock ? 'my-2 block overflow-x-auto text-center' : 'inline-block mx-0.5'}
        dangerouslySetInnerHTML={{ __html: renderFormula(tex, isBlock) }}
      />
    );

    lastIndex = matchIndex + token.length;
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {content.substring(lastIndex)}
      </span>
    );
  }

  return <div className={`math-content leading-relaxed ${className}`}>{parts}</div>;
};

export default MathRenderer;
