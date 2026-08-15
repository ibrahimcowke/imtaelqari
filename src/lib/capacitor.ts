import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { ReaderTheme } from '../types/book';

const THEME_STATUS_BAR_COLORS: Record<ReaderTheme, { color: string; style: Style }> = {
  paper:    { color: '#fdfcf8', style: Style.Light },
  white:    { color: '#ffffff', style: Style.Light },
  sage:     { color: '#e8ece1', style: Style.Light },
  sepia:    { color: '#f4ecd8', style: Style.Light },
  rose:     { color: '#fbf4f2', style: Style.Light },
  emerald:  { color: '#081711', style: Style.Dark },
  midnight: { color: '#080e1a', style: Style.Dark },
  coffee:   { color: '#140f0c', style: Style.Dark },
  slate:    { color: '#0f1216', style: Style.Dark },
  dark:     { color: '#0f0f0f', style: Style.Dark },
};

/**
 * Initialize Capacitor native plugins and listeners
 */
export async function initCapacitorApp(onBackPress?: () => boolean) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Hide splash screen smoothly after app initialization
    await SplashScreen.hide();
  } catch (err) {
    console.warn('SplashScreen hide error:', err);
  }

  try {
    // Listen for hardware back button on Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (onBackPress && onBackPress()) {
        return;
      }
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn('App backButton listener error:', err);
  }
}

/**
 * Update the native Android status bar based on current active reader theme
 */
export async function updateNativeStatusBar(theme: ReaderTheme) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const config = THEME_STATUS_BAR_COLORS[theme] || THEME_STATUS_BAR_COLORS.dark;
    await StatusBar.setStyle({ style: config.style });
    await StatusBar.setBackgroundColor({ color: config.color });
  } catch (err) {
    console.warn('StatusBar update error:', err);
  }
}

/**
 * Trigger subtle haptic tactile feedback (e.g. for page flip or bookmark)
 */
export async function triggerHapticFeedback(style: ImpactStyle = ImpactStyle.Light) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Haptics.impact({ style });
  } catch {
    // Graceful fallback on unsupported devices
  }
}
