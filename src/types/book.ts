export type BookBlockType = "heading" | "paragraph" | "bullet" | "quote";

export interface BookBlock {
  id: string;
  type: BookBlockType;
  text: string;
}

export interface BookPage {
  page: number;
  source_page_index: number;
  title: string;
  image: string;
  raw_ocr_text: string;
  display_text: string;
  search_text_normalized: string;
  blocks: BookBlock[];
}

export interface BookSection {
  id: string;
  title: string;
  start_page: number;
  end_page: number;
}

export interface HeadingIndexItem {
  heading: string;
  page: number;
  blockId: string;
}

export interface Book {
  title: string;
  subtitle: string;
  author: string;
  volume: string;
  pages: number;
  language: string;
  direction: string;
}

export type ReaderTheme = "paper" | "white" | "sage" | "sepia" | "dark" | "emerald" | "midnight" | "rose" | "coffee" | "slate";
export type ReaderMode = "text" | "scan" | "compare" | "continuous";
export type ReaderWidth = "narrow" | "medium" | "wide";
export type HighlightColor = "amber" | "rose" | "sage" | "blue-gray";

export interface Bookmark {
  id: string;
  page: number;
  blockId?: string;
  heading?: string;
  preview: string;
  createdAt: string;
}

export interface Highlight {
  id: string;
  page: number;
  blockId: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  color: HighlightColor;
  createdAt: string;
}

export interface ReaderNote {
  id: string;
  page: number;
  blockId?: string;
  selection?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteQuote {
  id: string;
  text: string;
  page: number;
  blockId?: string;
  heading?: string;
  source?: string;
  createdAt: string;
}

export interface TextCorrection {
  id: string;
  page: number;
  blockId: string;
  originalText: string;
  correctedText: string;
  verified: boolean;
  updatedAt: string;
}

export interface ReadingSession {
  id: string;
  date: string;
  durationMinutes: number;
  pagesVisited: number[];
}

export interface ReadingProgress {
  page: number;
  blockId?: string;
  continuousScrollOffset?: number;
  percent: number;
  updatedAt: string;
}

export type TextAlign = "justify" | "right" | "center";
export type LetterSpacing = "tight" | "normal" | "loose";

export interface ReaderPreferences {
  theme: ReaderTheme;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  paragraphSpacing: number;
  readerWidth: ReaderWidth;
  textAlign: TextAlign;
  letterSpacing: LetterSpacing;
  mode: ReaderMode;
  ttsRate: number;
  autoHideControls: boolean;
}

export interface KhatmaPlan {
  id: string;
  title: string;
  targetDays: number;
  startPage: number;
  endPage: number;
  currentPage: number;
  startDate: string;
  targetDate: string;
  isCompleted: boolean;
  dailyGoalPages: number;
  lastReadDate?: string;
}

export interface FlashcardItem {
  id: string;
  page: number;
  category: 'wisdom' | 'poem' | 'vocabulary' | 'concept';
  front: string; // Question / Term / Prompt
  back: string;  // Answer / Meaning / Explanation
  difficulty?: 'easy' | 'medium' | 'hard';
  reviewedCount: number;
  lastReviewedAt?: string;
  isMastered: boolean;
}

export interface VoiceRecordingItem {
  id: string;
  page: number;
  title: string;
  passageText: string;
  audioBlobUrl?: string;
  audioBase64?: string;
  durationSeconds: number;
  createdAt: string;
}

export interface HeritageInsight {
  term: string;
  root?: string;
  meaning: string;
  literaryContext?: string;
  benefit?: string;
}

