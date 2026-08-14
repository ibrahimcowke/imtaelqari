import type { Book, BookPage, BookBlock, BookBlockType } from '../types/book';
import BOOK_JSON from './BOOK_CONTENT_ORGANIZED.json';

// Utility to normalize Arabic text for search
export function normalizeArabic(text: string): string {
  return text
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[يى]/g, 'ي')
    .replace(/[\u064B-\u065F]/g, ''); // Remove tashkeel (diacritics)
}

// Convert a single text block into BookBlock[]
function parseTextToBlocks(text: string, pageNumber: number): BookBlock[] {
  if (!text) return [];

  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  
  return lines.map((line, index) => {
    let type: BookBlockType = 'paragraph';
    const trimmed = line.trim();

    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      type = 'bullet';
    } else if (trimmed.startsWith('«') && trimmed.endsWith('»')) {
      type = 'quote';
    } else if (trimmed.length < 60 && !trimmed.includes('.')) {
      // Heuristic for headings: short lines without periods
      type = 'heading';
    }

    return {
      id: `p${pageNumber}-b${index + 1}`,
      type,
      text: trimmed,
    };
  });
}

class BookDataService {
  private book: Book | null = null;
  private pages: BookPage[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // Extract basic book info
    const bookData = (BOOK_JSON as any).book || BOOK_JSON;
    this.book = {
      title: bookData.title || '',
      subtitle: bookData.subtitle || bookData.shortTitle || '',
      author: bookData.author || '',
      volume: bookData.volume || '',
      pages: bookData.source_pdf_pages || bookData.pdfPages || 174,
      language: bookData.language || 'ar',
      direction: bookData.direction || 'rtl',
    };

    // Transform pages
    this.pages = (BOOK_JSON as any).pages.map((p: any) => {
      const pageNum = p.page || p.pdfPage;
      const blocks = p.blocks || parseTextToBlocks(p.text || '', pageNum);
      const display_text = p.text || '';
      
      return {
        page: pageNum,
        source_page_index: pageNum,
        title: p.title || `صفحة ${pageNum}`,
        image: p.source_image || (pageNum ? `pages/${pageNum.toString().padStart(3, '0')}.webp` : ''),
        raw_ocr_text: p.text || '',
        display_text,
        search_text_normalized: normalizeArabic(display_text),
        blocks,
      };
    });
  }

  getBookInfo(): Book {
    if (!this.book) throw new Error("Book not initialized");
    return this.book;
  }

  getPages(): BookPage[] {
    return this.pages;
  }

  getPage(pageNumber: number): BookPage | undefined {
    return this.pages.find((p) => p.page === pageNumber);
  }

  search(query: string): { page: BookPage; matchCount: number }[] {
    const normalizedQuery = normalizeArabic(query);
    if (!normalizedQuery) return [];

    const results = this.pages.map(page => {
      // Basic match counting
      const matches = page.search_text_normalized.split(normalizedQuery).length - 1;
      return { page, matchCount: matches };
    }).filter(res => res.matchCount > 0);

    return results.sort((a, b) => b.matchCount - a.matchCount);
  }
}

export const bookDataService = new BookDataService();
