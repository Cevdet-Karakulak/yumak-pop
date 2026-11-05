import { Platform } from 'react-native';
import { pauseMusic, syncMusic } from '../audio';

// Production Google AdMob IDs (FloppaTech Corp / Yumak Pop)
export const ADMOB_ANDROID_APP_ID = 'ca-app-pub-9426623468970945~7281224562';
export const ADMOB_ANDROID_INTERSTITIAL_ID = 'ca-app-pub-9426623468970945/5968142896';

// iOS AdMob IDs (AdMob konsolunda Yumak Pop iOS açıldığında buraya ID girilebilir; boşken Google iOS test birimi kullanılır)
export const ADMOB_IOS_APP_ID = 'ca-app-pub-9426623468970945~7281224562';
export const ADMOB_IOS_INTERSTITIAL_ID = ''; // iOS için özel AdMob geçiş reklamı açılınca buraya eklenebilir

// Google AdMob Standard Test IDs for Interstitials
export const ADMOB_TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';
export const ADMOB_TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';

// Platform-aware unit selection: If iOS ad unit is not yet defined, use official iOS test ad unit so iOS doesn't crash or reject Android ad units
const INTERSTITIAL_UNIT_ID = Platform.select({
  ios: (__DEV__ || !ADMOB_IOS_INTERSTITIAL_ID) ? ADMOB_TEST_INTERSTITIAL_IOS : ADMOB_IOS_INTERSTITIAL_ID,
  default: __DEV__ ? ADMOB_TEST_INTERSTITIAL_ANDROID : ADMOB_ANDROID_INTERSTITIAL_ID,
})!;

let interstitialAd: any = null;
let isAdLoaded = false;
let isAdLoading = false;
let isAdOpened = false;
let onAdClosedCallback: (() => void) | null = null;
let onAdFallbackCallback: (() => void) | null = null;
let showWatchdogTimer: ReturnType<typeof setTimeout> | null = null;
let isInitialized = false;

function clearWatchdog() {
  if (showWatchdogTimer) {
    clearTimeout(showWatchdogTimer);
    showWatchdogTimer = null;
  }
}

/**
 * Initialize Google Mobile Ads SDK and start preloading the first interstitial ad.
 */
export async function initAdMob(): Promise<void> {
  if (Platform.OS === 'web') return;
  if (isInitialized) return;

  try {
    const mobileAdsModule = require('react-native-google-mobile-ads');
    const mobileAds = mobileAdsModule.default || mobileAdsModule;
    await mobileAds().initialize();
    isInitialized = true;
    console.log('[AdMob] SDK initialized successfully on', Platform.OS);
    preloadInterstitial();
  } catch (err) {
    console.warn('[AdMob] Initialization warning (expected on web or simulators):', err);
  }
}

/**
 * Preload an Interstitial Ad in background so it's ready when player completes 3 levels.
 */
export function preloadInterstitial(): void {
  if (Platform.OS === 'web' || isAdLoading || isAdLoaded) return;

  try {
    const { InterstitialAd, AdEventType } = require('react-native-google-mobile-ads');

    if (!interstitialAd) {
      interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, {
        requestNonPersonalizedAdsOnly: false,
      });

      interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        isAdLoaded = true;
        isAdLoading = false;
        console.log('[AdMob] Interstitial Ad loaded and ready to show on', Platform.OS);
      });

      if (AdEventType.OPENED) {
        interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
          isAdOpened = true;
          clearWatchdog();
          console.log('[AdMob] Interstitial Ad opened on screen');
        });
      }

      interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        clearWatchdog();
        isAdLoaded = false;
        isAdLoading = false;
        isAdOpened = false;
        onAdFallbackCallback = null;
        console.log('[AdMob] Interstitial Ad closed by player');
        syncMusic();
        if (onAdClosedCallback) {
          const cb = onAdClosedCallback;
          onAdClosedCallback = null;
          cb();
        }
        // Preload next ad for future level transitions
        setTimeout(() => preloadInterstitial(), 1500);
      });

      interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        clearWatchdog();
        isAdLoaded = false;
        isAdLoading = false;
        isAdOpened = false;
        console.warn('[AdMob] Interstitial Ad error on', Platform.OS, error);
        syncMusic();
        if (onAdFallbackCallback) {
          const fb = onAdFallbackCallback;
          onAdFallbackCallback = null;
          onAdClosedCallback = null;
          fb();
        } else if (onAdClosedCallback) {
          const cb = onAdClosedCallback;
          onAdClosedCallback = null;
          cb();
        }
      });
    }

    isAdLoading = true;
    interstitialAd.load();
  } catch (err) {
    isAdLoading = false;
    console.warn('[AdMob] Preload warning:', err);
  }
}

/**
 * Shows the native AdMob Interstitial Ad.
 * Returns true if real AdMob ad presentation is initiated.
 * Returns false if ad is not ready / web / error (caller can immediately use fallback modal).
 * Includes an iOS safety watchdog so if native presentation fails silently, onFallback or onDismiss is guaranteed to fire.
 */
export function showAdMobInterstitial(
  onDismiss: () => void,
  onFallback?: () => void,
): boolean {
  if (Platform.OS === 'web') return false;

  if (interstitialAd && isAdLoaded) {
    try {
      isAdLoaded = false;
      isAdOpened = false;
      pauseMusic();
      onAdClosedCallback = onDismiss;
      onAdFallbackCallback = onFallback || null;

      // Safety watchdog for iOS UIKit view controller presentation:
      // If the native ad hasn't opened within 1200ms, fall back cleanly so UI never freezes.
      clearWatchdog();
      showWatchdogTimer = setTimeout(() => {
        if (!isAdOpened) {
          console.warn('[AdMob] Watchdog triggered: native interstitial did not open in time, using fallback');
          const fb = onAdFallbackCallback;
          const cb = onAdClosedCallback;
          onAdFallbackCallback = null;
          onAdClosedCallback = null;
          syncMusic();
          if (fb) {
            fb();
          } else if (cb) {
            cb();
          }
          setTimeout(() => preloadInterstitial(), 1000);
        }
      }, 1200);

      interstitialAd.show();
      return true;
    } catch (err) {
      clearWatchdog();
      console.warn('[AdMob] Show error, falling back:', err);
      onAdClosedCallback = null;
      onAdFallbackCallback = null;
      syncMusic();
      return false;
    }
  }

  // If not yet loaded, trigger background load for next time
  preloadInterstitial();
  return false;
}
