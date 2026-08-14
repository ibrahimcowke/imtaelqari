import Dexie from 'dexie';
import type { Table } from 'dexie';
import type {
  Bookmark,
  Highlight,
  ReaderNote,
  FavoriteQuote,
  TextCorrection,
  ReadingSession,
  ReadingProgress,
  ReaderPreferences
} from '../types/book';

export class AppDatabase extends Dexie {
  bookmarks!: Table<Bookmark, string>;
  highlights!: Table<Highlight, string>;
  notes!: Table<ReaderNote, string>;
  quotes!: Table<FavoriteQuote, string>;
  corrections!: Table<TextCorrection, string>;
  sessions!: Table<ReadingSession, string>;
  progress!: Table<ReadingProgress, number>; // Primary key is page
  preferences!: Table<ReaderPreferences, string>;

  constructor() {
    super('ImtaaAlQariReaderDB');
    
    this.version(1).stores({
      bookmarks: 'id, page, createdAt',
      highlights: 'id, page, blockId, createdAt',
      notes: 'id, page, blockId, updatedAt',
      quotes: 'id, page, createdAt',
      corrections: 'id, page, blockId, verified, updatedAt',
      sessions: 'id, date',
      progress: 'page, updatedAt', // Single entry per page, or we could just store a generic key
      preferences: 'id' // 'default' will be the key
    });
  }
}

export const db = new AppDatabase();
