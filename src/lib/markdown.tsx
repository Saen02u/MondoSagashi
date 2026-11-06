import React, { ReactNode } from 'react';
import { ExternalLink, CheckSquare, Square } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Sanitizes URLs to prevent javascript: or data: injection
 */
function getSafeUrl(rawUrl: string): string | null {
  try {
    const trimmed = rawUrl.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('/')) {
      return trimmed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`, and [links](url)
 */
function renderInlineFormatting(text: string): ReactNode[] {
  const elements: ReactNode[] = [];
  // Tokenizer pattern for bold, italic, inline code, and links
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith('**') && token.endsWith('**')) {
      elements.push(
        <strong key={match.index} className="font-semibold text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      elements.push(
        <em key={match.index} className="italic text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      elements.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-slate-800/90 text-amber-300/90 text-xs font-mono border border-slate-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const closeBracket = token.indexOf('](');
      const label = token.slice(1, closeBracket);
      const rawUrl = token.slice(closeBracket + 2, -1);
      const safeUrl = getSafeUrl(rawUrl);

      if (safeUrl) {
        elements.push(
          <a
            key={match.index}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline underline-offset-4 decoration-amber-500/40 hover:decoration-amber-400 transition-colors"
          >
            {label}
            <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-70" />
          </a>
        );
      } else {
        elements.push(label);
      }
    } else {
      elements.push(token);
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining trailing text
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
}

/**
 * Pure React XSS-safe Markdown Renderer.
 * Parses lines into structured React components without dangerouslySetInnerHTML.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n');
  const renderedNodes: ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];

  let inList = false;
  let listItems: ReactNode[] = [];
  let isOrderedList = false;

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (isOrderedList) {
        renderedNodes.push(
          <ol
            key={`ol-${renderedNodes.length}`}
            className="my-4 pl-6 list-decimal space-y-1.5 text-slate-300 leading-relaxed text-sm sm:text-base marker:text-amber-500/70"
          >
            {listItems}
          </ol>
        );
      } else {
        renderedNodes.push(
          <ul
            key={`ul-${renderedNodes.length}`}
            className="my-4 space-y-1.5 text-slate-300 leading-relaxed text-sm sm:text-base"
          >
            {listItems}
          </ul>
        );
      }
      listItems = [];
      inList = false;
      isOrderedList = false;
    }
  };

  const flushCodeBlock = () => {
    if (inCodeBlock) {
      renderedNodes.push(
        <div
          key={`code-${renderedNodes.length}`}
          className="my-5 rounded-lg border border-slate-800 bg-[#0d121a] overflow-hidden shadow-inner"
        >
          {codeBlockLang && (
            <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-800/80 bg-slate-900/60 text-xs font-mono text-slate-400">
              <span className="text-amber-400/90">{codeBlockLang}</span>
              <span className="text-slate-500">code block</span>
            </div>
          )}
          <pre className="p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        </div>
      );
      codeBlockLines = [];
      codeBlockLang = '';
      inCodeBlock = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();

    // 1. Code Block Fence (```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // 2. Horizontal Rule (--- or ***)
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      flushList();
      renderedNodes.push(
        <hr
          key={`hr-${i}`}
          className="my-6 border-t border-slate-800"
        />
      );
      continue;
    }

    // 3. Headings
    if (line.startsWith('# ')) {
      flushList();
      renderedNodes.push(
        <h1
          key={`h1-${i}`}
          className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight mt-7 mb-3 first:mt-0"
        >
          {renderInlineFormatting(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      flushList();
      renderedNodes.push(
        <h2
          key={`h2-${i}`}
          className="text-lg sm:text-xl font-semibold text-slate-100 tracking-tight mt-6 mb-2.5 pb-1 border-b border-slate-800/80"
        >
          {renderInlineFormatting(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      flushList();
      renderedNodes.push(
        <h3
          key={`h3-${i}`}
          className="text-base sm:text-lg font-medium text-amber-200/95 tracking-normal mt-5 mb-2"
        >
          {renderInlineFormatting(line.slice(4))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('#### ')) {
      flushList();
      renderedNodes.push(
        <h4
          key={`h4-${i}`}
          className="text-sm sm:text-base font-medium text-slate-300 mt-4 mb-1.5"
        >
          {renderInlineFormatting(line.slice(5))}
        </h4>
      );
      continue;
    }

    // 4. Blockquotes
    if (line.startsWith('> ') || line === '>') {
      flushList();
      const quoteText = line.startsWith('> ') ? line.slice(2) : '';
      renderedNodes.push(
        <blockquote
          key={`quote-${i}`}
          className="my-4 py-2.5 px-4 bg-slate-900/50 border-l-2 border-amber-500/70 text-slate-300 italic text-sm sm:text-base rounded-r"
        >
          {renderInlineFormatting(quoteText)}
        </blockquote>
      );
      continue;
    }

    // 5. Checklist items (- [ ] or - [x])
    const checklistMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (checklistMatch) {
      if (!inList || isOrderedList) {
        flushList();
        inList = true;
        isOrderedList = false;
      }
      const isChecked = checklistMatch[1].toLowerCase() === 'x';
      const itemContent = checklistMatch[2];

      listItems.push(
        <li key={`check-${i}`} className="flex items-start gap-2.5 py-0.5">
          <span className="mt-1 shrink-0 text-amber-400">
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-amber-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-600" />
            )}
          </span>
          <span className={isChecked ? 'line-through text-slate-500' : 'text-slate-200'}>
            {renderInlineFormatting(itemContent)}
          </span>
        </li>
      );
      continue;
    }

    // 6. Unordered List Items (- item or * item)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList || isOrderedList) {
        flushList();
        inList = true;
        isOrderedList = false;
      }
      listItems.push(
        <li key={`li-${i}`} className="flex items-start gap-2.5 py-0.5">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500/80 shrink-0" />
          <span>{renderInlineFormatting(line.slice(2))}</span>
        </li>
      );
      continue;
    }

    // 7. Ordered List Items (1. item)
    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (!inList || !isOrderedList) {
        flushList();
        inList = true;
        isOrderedList = true;
      }
      listItems.push(
        <li key={`oli-${i}`} className="py-0.5">
          {renderInlineFormatting(orderedMatch[2])}
        </li>
      );
      continue;
    }

    // 8. Empty lines
    if (!line.trim()) {
      flushList();
      continue;
    }

    // 9. Standard Paragraph
    flushList();
    renderedNodes.push(
      <p
        key={`p-${i}`}
        className="my-3 text-slate-300 leading-relaxed text-sm sm:text-base font-normal"
      >
        {renderInlineFormatting(line)}
      </p>
    );
  }

  // Final flush
  flushList();
  flushCodeBlock();

  return <div className="markdown-body space-y-1">{renderedNodes}</div>;
};
