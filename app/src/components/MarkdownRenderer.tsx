import React from 'react';
import { AlertTriangle, Lightbulb, Target, CheckCircle2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Parses inline formatting like **bold**, *italic*, and `code` into React nodes,
 * completely stripping raw markdown symbols (*, _, `) so they never leak into the UI.
 */
export function formatInlineText(text: string): React.ReactNode[] {
  // Regex pattern matching **bold**, *italic*, and `code`
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={index} className="font-semibold text-stone-900">
          {boldContent}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const italicContent = part.slice(1, -1);
      return (
        <em key={index} className="italic text-stone-800">
          {italicContent}
        </em>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const codeContent = part.slice(1, -1);
      return (
        <code key={index} className="px-1.5 py-0.5 text-xs font-mono bg-stone-100 text-amber-900 rounded border border-stone-200">
          {codeContent}
        </code>
      );
    }

    // Clean any stray accidental markdown characters from plain text
    return <span key={index}>{part}</span>;
  });
}

/**
 * Cleans content of legacy robotic template labels
 */
export function cleanTemplateArtifacts(raw: string): string {
  if (!raw) return '';
  return raw
    // Strip "Ключевая задача раздела: ..."
    .replace(/^#{1,6}\s*Ключевая задача раздела:[^\n]*\n*/gim, '')
    .replace(/^Ключевая задача раздела:[^\n]*\n*/gim, '')
    // Strip "Исходное требование: ..." blockquotes and lines
    .replace(/^>\s*\*\*Исходное требование:\*\*[\s\S]*?(?=\n\n|\n[A-Za-zА-Яа-я0-9#\-])/gim, '')
    .replace(/^>\s*\*\*Исходное требование:\*\*[^\n]*\n*/gim, '')
    .replace(/^>\s*Исходное требование:[^\n]*\n*/gim, '')
    .replace(/^Исходное требование:[^\n]*\n*/gim, '')
    // Strip "В рамках подготовки по теме..." robotic intro
    .replace(/^В рамках подготовки по теме [«"][^»"\n]+[»"][^\n]*\n*/gim, '')
    .replace(/В рамках подготовки по теме [«"][^»"\n]+[»"] этот пункт является базовым для исключения стресса и срывов сроков\.\s*/gim, '')
    .trim();
}

/**
 * Production-grade Markdown parser and renderer.
 * Formats headings, lists, callouts, and blockquotes into clean, beautiful typography
 * with ZERO raw '#', '*', '>', or '-' characters leaking to the screen.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const cleaned = cleanTemplateArtifacts(content);
  const rawLines = cleaned.split('\n');

  // Group lines into blocks (paragraphs, lists, blockquotes, callouts, headings)
  const blocks: React.ReactNode[] = [];
  let currentListItems: { type: 'ul' | 'ol'; text: string; num?: string }[] = [];
  let currentQuoteLines: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentListItems.length === 0) return;
    const isOrdered = currentListItems[0].type === 'ol';
    const items = [...currentListItems];
    currentListItems = [];

    if (isOrdered) {
      blocks.push(
        <ol key={`${keyPrefix}-ol-${blocks.length}`} className="my-4 space-y-2.5 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-stone-700 leading-relaxed text-sm sm:text-base">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center mt-0.5">
                {item.num || idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                {formatInlineText(item.text)}
              </div>
            </li>
          ))}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={`${keyPrefix}-ul-${blocks.length}`} className="my-4 space-y-2.5 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-stone-700 leading-relaxed text-sm sm:text-base">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {formatInlineText(item.text)}
              </div>
            </li>
          ))}
        </ul>
      );
    }
  };

  const flushQuote = (keyPrefix: string) => {
    if (currentQuoteLines.length === 0) return;
    const text = currentQuoteLines.join(' ');
    currentQuoteLines = [];
    blocks.push(
      <blockquote 
        key={`${keyPrefix}-quote-${blocks.length}`} 
        className="my-4 border-l-4 border-amber-500 bg-amber-50/60 rounded-r-xl px-4 py-3 text-stone-800 text-sm sm:text-base italic leading-relaxed"
      >
        {formatInlineText(text)}
      </blockquote>
    );
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i].trim();

    if (!rawLine) {
      flushList(`line-${i}`);
      flushQuote(`line-${i}`);
      continue;
    }

    // 1. Headings (### or #### or ##)
    const headingMatch = rawLine.match(/^(#{2,5})\s+(.+)$/);
    if (headingMatch) {
      flushList(`line-${i}`);
      flushQuote(`line-${i}`);
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();

      if (level === 2) {
        blocks.push(
          <h2 key={`h2-${i}`} className="text-xl sm:text-2xl font-bold text-stone-900 mt-7 mb-3 tracking-tight">
            {formatInlineText(headingText)}
          </h2>
        );
      } else if (level === 3) {
        blocks.push(
          <h3 key={`h3-${i}`} className="text-lg sm:text-xl font-bold text-stone-900 mt-6 mb-2.5 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {formatInlineText(headingText)}
          </h3>
        );
      } else {
        // level 4 or 5
        blocks.push(
          <h4 key={`h4-${i}`} className="text-base sm:text-lg font-bold text-stone-900 mt-5 mb-2 text-stone-800">
            {formatInlineText(headingText)}
          </h4>
        );
      }
      continue;
    }

    // 2. Blockquotes (> ...)
    if (rawLine.startsWith('>')) {
      flushList(`line-${i}`);
      const quoteText = rawLine.replace(/^>\s*/, '').trim();
      if (quoteText) {
        currentQuoteLines.push(quoteText);
      }
      continue;
    }

    // 3. Highlight callout boxes: ⚠️, 💡, 🎯
    if (rawLine.startsWith('⚠️') || rawLine.startsWith('💡') || rawLine.startsWith('🎯')) {
      flushList(`line-${i}`);
      flushQuote(`line-${i}`);

      const isWarning = rawLine.startsWith('⚠️');
      const isTip = rawLine.startsWith('💡');
      const isTarget = rawLine.startsWith('🎯');

      let icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />;
      let bgClasses = 'bg-stone-100 border-stone-200 text-stone-900';

      if (isWarning) {
        icon = <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />;
        bgClasses = 'bg-amber-500/10 border-amber-300 text-stone-900';
      } else if (isTip) {
        icon = <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />;
        bgClasses = 'bg-blue-500/10 border-blue-300 text-stone-900';
      } else if (isTarget) {
        icon = <Target className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />;
        bgClasses = 'bg-emerald-500/10 border-emerald-300 text-stone-900';
      }

      // Strip leading emoji
      const calloutText = rawLine.replace(/^[⚠️💡🎯]\s*/, '');

      blocks.push(
        <div key={`callout-${i}`} className={`my-4 p-4 rounded-xl border flex items-start gap-3 text-sm leading-relaxed ${bgClasses}`}>
          {icon}
          <div className="flex-1 min-w-0">
            {formatInlineText(calloutText)}
          </div>
        </div>
      );
      continue;
    }

    // 4. Unordered List Items (- or *)
    const ulMatch = rawLine.match(/^[-*•]\s+(.+)$/);
    if (ulMatch) {
      flushQuote(`line-${i}`);
      currentListItems.push({ type: 'ul', text: ulMatch[1].trim() });
      continue;
    }

    // 5. Ordered List Items (1. or 2))
    const olMatch = rawLine.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (olMatch) {
      flushQuote(`line-${i}`);
      currentListItems.push({ type: 'ol', text: olMatch[2].trim(), num: `${olMatch[1]}.` });
      continue;
    }

    // 6. Regular Paragraph
    flushList(`line-${i}`);
    flushQuote(`line-${i}`);

    blocks.push(
      <p key={`p-${i}`} className="my-3 text-stone-700 leading-relaxed text-sm sm:text-base">
        {formatInlineText(rawLine)}
      </p>
    );
  }

  // Final flushes
  flushList('final');
  flushQuote('final');

  return (
    <div className={`space-y-1 text-stone-700 ${className}`}>
      {blocks}
    </div>
  );
};
