import { Platform } from 'react-native';
import { pauseMusic, syncMusic } from '../audio';

// Production Google AdMob IDs (FloppaTech Corp / Yumak Pop)
export const ADMOB_APP_ID = 'ca-app-pub-9426623468970945~7281224562';
export const ADMOB_INTERSTITIAL_ID = 'ca-app-pub-9426623468970945/5968142896';

// Google AdMob Standard Test ID for Interstitial
export const ADMOB_TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

// Use production ID in release builds, test ID in development to prevent account policy strikes
const INTERSTITIAL_UNIT_ID = __DEV__ ? ADMOB_TEST_INTERSTITIAL_ID : ADMOB_INTERSTITIAL_ID;

let interstitialAd: any = null;
let isAdLoaded = false;
let isAdLoading = false;
let onAdClosedCallback: (() => void) | null = null;
let isInitialized = false;

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
    console.log('[AdMob] SDK initialized successfully');
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
        console.log('[AdMob] Interstitial Ad loaded and ready to show');
      });

      interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        isAdLoaded = false;
        isAdLoading = false;
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
        isAdLoaded = false;
        isAdLoading = false;
        console.warn('[AdMob] Interstitial Ad error:', error);
        if (onAdClosedCallback) {
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
 * Returns true if real AdMob ad is presented.
 * Returns false if ad is not ready / web / error (caller can use fallback modal).
 */
export function showAdMobInterstitial(onDismiss: () => void): boolean {
  if (Platform.OS === 'web') return false;

  if (interstitialAd && isAdLoaded) {
    try {
      pauseMusic();
      onAdClosedCallback = onDismiss;
      interstitialAd.show();
      return true;
    } catch (err) {
      console.warn('[AdMob] Show error, falling back:', err);
      onAdClosedCallback = null;
      syncMusic();
      return false;
    }
  }

  // If not yet loaded, trigger background load for next time
  preloadInterstitial();
  return false;
}
