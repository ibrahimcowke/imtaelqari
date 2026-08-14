import type { Book, BookPage, BookBlock, BookBlockType } from '../types/book';
import BOOK_JSON from './BOOK_CONTENT_ORGANIZED.json';

// High-performance Arabic text normalizer with regex cache
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670]/g;
const ALEF_REGEX = /[أإآا]/g;
const YAA_REGEX = /[يى]/g;
const TAA_MARBUTA_REGEX = /[ة]/g;

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(ALEF_REGEX, 'ا')
    .replace(TAA_MARBUTA_REGEX, 'ه')
    .replace(YAA_REGEX, 'ي')
    .replace(TASHKEEL_REGEX, '');
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
  private pageMap: Map<number, BookPage> = new Map();
  private searchCache: Map<string, { page: BookPage; matchCount: number }[]> = new Map();

  constructor() {
    this.init();
  }

  private init() {
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

    // Pre-allocate and index pages into Map for O(1) instant lookup
    const rawPages = (BOOK_JSON as any).pages || [];
    this.pages = new Array(rawPages.length);

    for (let i = 0; i < rawPages.length; i++) {
      const p = rawPages[i];
      const pageNum = p.page || p.pdfPage;
      const blocks = p.blocks || parseTextToBlocks(p.text || '', pageNum);
      const display_text = p.text || '';
      
      const bookPage: BookPage = {
        page: pageNum,
        source_page_index: pageNum,
        title: p.title || `صفحة ${pageNum}`,
        image: p.source_image || (pageNum ? `pages/${pageNum.toString().padStart(3, '0')}.webp` : ''),
        raw_ocr_text: p.text || '',
        display_text,
        search_text_normalized: normalizeArabic(display_text),
        blocks,
      };

      this.pages[i] = bookPage;
      this.pageMap.set(pageNum, bookPage);
    }
  }

  getBookInfo(): Book {
    if (!this.book) throw new Error("Book not initialized");
    return this.book;
  }

  getPages(): BookPage[] {
    return this.pages;
  }

  // O(1) Instant Lookup
  getPage(pageNumber: number): BookPage | undefined {
    return this.pageMap.get(pageNumber);
  }

  // High performance cached search
  search(query: string): { page: BookPage; matchCount: number }[] {
    const normalizedQuery = normalizeArabic(query.trim());
    if (!normalizedQuery) return [];

    if (this.searchCache.has(normalizedQuery)) {
      return this.searchCache.get(normalizedQuery)!;
    }

    const results: { page: BookPage; matchCount: number }[] = [];
    const len = this.pages.length;

    for (let i = 0; i < len; i++) {
      const page = this.pages[i];
      const text = page.search_text_normalized;
      if (text.includes(normalizedQuery)) {
        // Fast match count without creating huge array splits
        let count = 0;
        let pos = text.indexOf(normalizedQuery);
        while (pos !== -1) {
          count++;
          pos = text.indexOf(normalizedQuery, pos + normalizedQuery.length);
        }
        results.push({ page, matchCount: count });
      }
    }

    results.sort((a, b) => b.matchCount - a.matchCount);

    // Keep cache bounded to 100 queries
    if (this.searchCache.size > 100) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey) this.searchCache.delete(firstKey);
    }
    this.searchCache.set(normalizedQuery, results);

    return results;
  }
}

export const bookDataService = new BookDataService();
