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
  ReaderPreferences,
  KhatmaPlan,
  FlashcardItem,
  VoiceRecordingItem,
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
  khatmas!: Table<KhatmaPlan, string>;
  flashcards!: Table<FlashcardItem, string>;
  recordings!: Table<VoiceRecordingItem, string>;

  constructor() {
    super('ImtaaAlQariReaderDB');
    
    this.version(1).stores({
      bookmarks: 'id, page, createdAt',
      highlights: 'id, page, blockId, createdAt',
      notes: 'id, page, blockId, updatedAt',
      quotes: 'id, page, createdAt',
      corrections: 'id, page, blockId, verified, updatedAt',
      sessions: 'id, date',
      progress: 'page, updatedAt',
      preferences: 'id'
    });

    this.version(2).stores({
      khatmas: 'id, isCompleted, startDate, targetDate',
      flashcards: 'id, page, category, isMastered, difficulty',
      recordings: 'id, page, createdAt'
    });
  }
}

export const db = new AppDatabase();
