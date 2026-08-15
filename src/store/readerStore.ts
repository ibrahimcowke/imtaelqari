import { create } from 'zustand';
import type { ReaderPreferences } from '../types/book';

interface ReaderState {
  currentPage: number;
  preferences: ReaderPreferences;
  isControlsVisible: boolean;
  isSidebarOpen: boolean;
  isReadingAloud: boolean;
  setCurrentPage: (page: number) => void;
  updatePreferences: (prefs: Partial<ReaderPreferences>) => void;
  toggleControls: () => void;
  toggleSidebar: () => void;
  toggleReadingAloud: () => void;
}

const defaultPreferences: ReaderPreferences = {
  theme: 'paper',
  fontSize: 20,
  fontFamily: 'Noto Naskh Arabic',
  lineHeight: 1.8,
  paragraphSpacing: 1.5,
  readerWidth: 'medium',
  textAlign: 'justify',
  letterSpacing: 'normal',
  mode: 'text',
  ttsRate: 1,
  autoHideControls: true,
};

export const useReaderStore = create<ReaderState>((set) => ({
  currentPage: 1, // Will be initialized from last reading progress
  preferences: defaultPreferences,
  isControlsVisible: true,
  isSidebarOpen: false,
  isReadingAloud: false,
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  updatePreferences: (prefs) => 
    set((state) => ({ preferences: { ...state.preferences, ...prefs } })),
    
  toggleControls: () => 
    set((state) => ({ isControlsVisible: !state.isControlsVisible })),
    
  toggleSidebar: () => 
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    
  toggleReadingAloud: () =>
    set((state) => {
      const isReading = !state.isReadingAloud;
      if (!isReading && typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore speech synthesis errors in unsupported environments
        }
      }
      return { isReadingAloud: isReading };
    }),
}));
