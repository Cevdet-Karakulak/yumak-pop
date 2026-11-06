import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';
import { SaveData } from '../save';

export const IOS_APP_ID = '6829707682';
export const ANDROID_PACKAGE_NAME = 'com.floppatech.yumakpop';

// Direct review write URLs
export const IOS_REVIEW_URL = `https://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`;
export const ANDROID_MARKET_URL = `market://details?id=${ANDROID_PACKAGE_NAME}`;
export const ANDROID_WEB_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`;

// FloppaTech Corp Support Portal
export const FLOPPATECH_SUPPORT_URL = 'https://floppatechcorp.vercel.app/support';

/**
 * Checks whether the in-app review prompt should be displayed to the user.
 * Criteria:
 * 1. Has not rated yet (data.hasRatedApp !== true).
 * 2. Has spent at least 5 minutes (300 seconds) of active in-game time.
 * 3. Has completed at least 3 levels (progress milestone).
 * 4. Has been dismissed fewer than 3 times (anti-spam capping).
 * 5. At least 24 hours have passed since the last prompt dismissal.
 */
export function shouldPromptReview(data: SaveData): boolean {
  if (data.hasRatedApp) return false;

  const dismissCount = data.reviewPromptDismissCount ?? 0;
  if (dismissCount >= 3) return false;

  const now = Date.now();
  const lastPrompt = data.lastReviewPromptTime ?? 0;
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  if (lastPrompt > 0 && now - lastPrompt < ONE_DAY_MS) return false;

  const activePlaySeconds = data.totalPlayTimeSeconds ?? 0;
  const completed = data.completedLevels ?? 0;

  // Active play time of 5+ minutes (300s) AND at least 3 completed levels
  const meetsTime = activePlaySeconds >= 300;
  const meetsLevel = completed >= 3;

  return meetsTime && meetsLevel;
}

/**
 * Opens the native store review dialog or redirects directly to the store listing review page.
 */
export async function openStoreForReview(): Promise<void> {
  try {
    // 1. Try native in-app review if supported and available
    const isAvailable = await StoreReview.isAvailableAsync().catch(() => false);
    if (isAvailable) {
      await StoreReview.requestReview().catch(() => {});
    }
  } catch (err) {
    console.log('Native StoreReview not available, opening direct store link:', err);
  }

  // 2. Open official direct store review page
  try {
    if (Platform.OS === 'ios') {
      const canOpen = await Linking.canOpenURL(IOS_REVIEW_URL);
      if (canOpen) {
        await Linking.openURL(IOS_REVIEW_URL);
      } else {
        await Linking.openURL(`https://apps.apple.com/app/id${IOS_APP_ID}`);
      }
    } else {
      // Android: prefer market://, fallback to https://play.google.com/
      Linking.openURL(ANDROID_MARKET_URL).catch(() => {
        Linking.openURL(ANDROID_WEB_URL).catch(() => {});
      });
    }
  } catch (err) {
    console.warn('Error opening store review URL:', err);
  }
}

/**
 * Opens FloppaTech Corp Support Portal for feedback
 */
export function openSupportPortal(): void {
  Linking.openURL(FLOPPATECH_SUPPORT_URL).catch(() => {});
}
