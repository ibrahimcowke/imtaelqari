// Real Calendar Day Reading Streak Service

export interface DayStatus {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // e.g. "السبت"
  dayNumber: number; // e.g. 16
  isToday: boolean;
  isCompleted: boolean;
  isPast: boolean;
  isFuture: boolean;
}

const STORAGE_KEY_CHECKINS = 'imta_reading_checkins';
const STORAGE_KEY_STREAK = 'imta_reading_streak';
const STORAGE_KEY_LAST_CHECKIN = 'imta_last_checkin_date';

const ARABIC_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export const formatDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getCheckinHistory = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHECKINS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveCheckinHistory = (dates: string[]): void => {
  localStorage.setItem(STORAGE_KEY_CHECKINS, JSON.stringify(dates));
};

export const calculateStreak = (history: string[]): number => {
  if (!history || history.length === 0) return 0;
  
  const historySet = new Set(history);
  const now = new Date();
  const todayKey = formatDateKey(now);
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);
  
  let currentKey = historySet.has(todayKey) ? todayKey : historySet.has(yesterdayKey) ? yesterdayKey : null;
  if (!currentKey) return 0;
  
  let count = 0;
  const runner = new Date(currentKey);
  
  while (true) {
    const key = formatDateKey(runner);
    if (historySet.has(key)) {
      count++;
      runner.setDate(runner.getDate() - 1);
    } else {
      break;
    }
  }
  
  return count;
};

export const checkInToday = (): { streak: number; isNewCheckin: boolean } => {
  const todayKey = formatDateKey(new Date());
  const history = getCheckinHistory();
  const set = new Set(history);
  
  const isNewCheckin = !set.has(todayKey);
  if (isNewCheckin) {
    set.add(todayKey);
    const updated = Array.from(set);
    saveCheckinHistory(updated);
    localStorage.setItem(STORAGE_KEY_LAST_CHECKIN, todayKey);
    const streak = calculateStreak(updated);
    localStorage.setItem(STORAGE_KEY_STREAK, streak.toString());
    return { streak, isNewCheckin: true };
  }
  
  const streak = calculateStreak(history);
  return { streak, isNewCheckin: false };
};

export const isCheckedInToday = (): boolean => {
  const todayKey = formatDateKey(new Date());
  const history = getCheckinHistory();
  return history.includes(todayKey);
};

export const getRollingWeekDays = (): DayStatus[] => {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const historySet = new Set(getCheckinHistory());
  
  const days: DayStatus[] = [];
  // Rolling 7 days: 6 days ago up to today
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = formatDateKey(d);
    
    days.push({
      dateStr: key,
      dayName: ARABIC_DAYS[d.getDay()],
      dayNumber: d.getDate(),
      isToday: key === todayKey,
      isCompleted: historySet.has(key),
      isPast: i > 0,
      isFuture: false,
    });
  }
  
  return days;
};
