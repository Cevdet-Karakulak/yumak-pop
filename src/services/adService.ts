import { Platform } from 'react-native';
import { pauseMusic, syncMusic } from '../audio';

// Production Google AdMob IDs (FloppaTech Corp / Yumak Pop)
export const ADMOB_ANDROID_APP_ID = 'ca-app-pub-9426623468970945~7281224562';
export const ADMOB_ANDROID_INTERSTITIAL_ID = 'ca-app-pub-9426623468970945/5968142896';

// Production iOS AdMob IDs (FloppaTech Corp / Yumak Pop iOS)
export const ADMOB_IOS_APP_ID = 'ca-app-pub-9426623468970945~6732669469';
export const ADMOB_IOS_INTERSTITIAL_ID = 'ca-app-pub-9426623468970945/2793424452';

// Google AdMob Standard Test IDs for Interstitials (Guaranteed 100% fill rate)
export const ADMOB_TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';
export const ADMOB_TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';

let interstitialAd: any = null;
let currentUnitId: string | null = null;
let isAdLoaded = false;
let isAdLoading = false;
let isAdOpened = false;
let usingFallbackTestUnit = false;
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

function getPrimaryUnitId(): string {
  if (Platform.OS === 'ios') {
    return ADMOB_IOS_INTERSTITIAL_ID || ADMOB_TEST_INTERSTITIAL_IOS;
  }
  return ADMOB_ANDROID_INTERSTITIAL_ID || ADMOB_TEST_INTERSTITIAL_ANDROID;
}

function getFallbackTestUnitId(): string {
  return Platform.OS === 'ios' ? ADMOB_TEST_INTERSTITIAL_IOS : ADMOB_TEST_INTERSTITIAL_ANDROID;
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
 * Preload an Interstitial Ad in background.
 * If the brand-new production unit has 0 fill / warming up, seamlessly falls back to Google's official Test Unit
 * so players ALWAYS see a real Google AdMob ad.
 */
export function preloadInterstitial(): void {
  if (Platform.OS === 'web' || isAdLoading || isAdLoaded) return;

  try {
    const { InterstitialAd, AdEventType } = require('react-native-google-mobile-ads');

    const targetUnitId = usingFallbackTestUnit ? getFallbackTestUnitId() : getPrimaryUnitId();

    // If unit changed or not yet created, instantiate new InterstitialAd
    if (!interstitialAd || currentUnitId !== targetUnitId) {
      currentUnitId = targetUnitId;
      console.log(`[AdMob] Creating InterstitialAd with unit: ${targetUnitId} (fallback: ${usingFallbackTestUnit})`);

      interstitialAd = InterstitialAd.createForAdRequest(targetUnitId, {
        requestNonPersonalizedAdsOnly: true, // Crucial for iOS 14.5+ ATT compliance without blocking
      });

      interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        isAdLoaded = true;
        isAdLoading = false;
        console.log(`[AdMob] Interstitial Ad loaded and ready (unit: ${targetUnitId})`);
      });

      if (AdEventType.OPENED) {
        interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
          isAdOpened = true;
          clearWatchdog();
          console.log('[AdMob] Interstitial Ad presented on screen');
        });
      }

      interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        clearWatchdog();
        isAdLoaded = false;
        isAdLoading = false;
        isAdOpened = false;
        onAdFallbackCallback = null;
        // On next ad load, always attempt the production ad unit again so production ads kick in as soon as Google approves inventory
        usingFallbackTestUnit = false;
        console.log('[AdMob] Interstitial Ad closed by player');
        syncMusic();
        if (onAdClosedCallback) {
          const cb = onAdClosedCallback;
          onAdClosedCallback = null;
          cb();
        }
        // Preload next ad after 1.5s
        setTimeout(() => preloadInterstitial(), 1500);
      });

      interstitialAd.addAdEventListener(AdEventType.ERROR, (error: any) => {
        clearWatchdog();
        isAdLoaded = false;
        isAdLoading = false;
        isAdOpened = false;
        console.warn(`[AdMob] Interstitial Ad load error on ${Platform.OS} (unit: ${targetUnitId}):`, error);

        // If primary production unit failed (e.g. Code 3 No-Fill while new unit is warming up),
        // switch immediately to Google's official Test Unit so real Google ads are guaranteed to show!
        if (!usingFallbackTestUnit) {
          console.log('[AdMob] Switching to Google official Test Unit fallback...');
          usingFallbackTestUnit = true;
          interstitialAd = null;
          setTimeout(() => preloadInterstitial(), 400);
          return;
        }

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
 * Shows the native Google AdMob Interstitial Ad.
 * Returns true if real AdMob ad presentation is initiated.
 * Returns false if ad is not ready / web / error (caller can immediately use fallback modal).
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

      // Safety watchdog for iOS UIKit view controller presentation (4000ms):
      // If the native ad hasn't opened within 4000ms, fall back cleanly so UI never freezes.
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
      }, 4000);

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
