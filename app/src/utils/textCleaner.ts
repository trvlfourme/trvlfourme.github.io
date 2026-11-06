/**
 * Completely strips markdown symbols (#, *, >, -, `, _, etc.) from a text string,
 * leaving clean, natural Russian text without any formatting artifacts.
 */
export function stripMarkdownSymbols(text: string): string {
  if (!text) return '';

  return text
    // Remove template artefacts
    .replace(/^#{1,6}\s*Ключевая задача раздела:[^\n]*\n*/gim, '')
    .replace(/^Ключевая задача раздела:[^\n]*\n*/gim, '')
    .replace(/^>\s*\*\*Исходное требование:\*\*[\s\S]*?(?=\n\n|\n[A-Za-zА-Яа-я0-9#\-])/gim, '')
    .replace(/^>\s*\*\*Исходное требование:\*\*[^\n]*\n*/gim, '')
    .replace(/^>\s*Исходное требование:[^\n]*\n*/gim, '')
    .replace(/^Исходное требование:[^\n]*\n*/gim, '')
    .replace(/^В рамках подготовки по теме [«"][^»"\n]+[»"][^\n]*\n*/gim, '')
    .replace(/В рамках подготовки по теме [«"][^»"\n]+[»"] этот пункт является базовым для исключения стресса и срывов сроков\.\s*/gim, '')
    
    // Remove headings hashes (#, ##, ###, ####)
    .replace(/^#{1,6}\s+/gm, '')
    
    // Remove blockquote markers (>)
    .replace(/^>\s*/gm, '')
    
    // Remove bold and italic markers (**, *, __, _)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    
    // Remove inline code ticks
    .replace(/`([^`]+)`/g, '$1')
    
    // Clean bullet lists (- or *)
    .replace(/^[-*•]\s+/gm, '• ')
    
    // Clean multiple linebreaks
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Sanitizes an article object by removing template artifacts and cleaning its sections.
 */
export function sanitizeArticle<T extends { sections?: Array<{ title?: string; content?: string }> }>(article: T): T {
  if (!article || !article.sections) return article;

  return {
    ...article,
    sections: article.sections.map(s => ({
      ...s,
      title: (s.title || '').replace(/^#{1,6}\s+/, '').trim(),
      content: stripMarkdownSymbols(s.content || '')
    }))
  };
}
