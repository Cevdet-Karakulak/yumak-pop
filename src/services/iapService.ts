import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNIap from 'react-native-iap';

export const IAP_SKUS = {
  REMOVE_ADS: 'com.floppatech.yumakpop.removeads',
};

export const STORAGE_KEY_AD_FREE = '@yumakpop:ad_free';

let isConnected = false;
let purchaseUpdateSubscription: any = null;
let purchaseErrorSubscription: any = null;
let activePurchaseSuccessCallback: (() => void) | null = null;
let activePurchaseErrorCallback: ((msg: string) => void) | null = null;

/**
 * Initialize connection with StoreKit / Google Play Billing
 */
export async function initIAP(onGlobalAdFreeActivated?: () => void): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const res = await RNIap.initConnection();
    isConnected = Boolean(res);
    console.log('[IAP] Initialized connection on', Platform.OS, ':', isConnected);

    // Attach cross-platform purchase listeners (Crucial for Android Google Play Billing)
    if (!purchaseUpdateSubscription) {
      purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
        const productId = purchase.productId;
        if (productId === IAP_SKUS.REMOVE_ADS) {
          console.log('[IAP] Purchase confirmed via listener:', productId);
          await AsyncStorage.setItem(STORAGE_KEY_AD_FREE, 'true');
          try {
            await RNIap.finishTransaction({ purchase: purchase as any, isConsumable: false });
          } catch (fErr) {
            console.warn('[IAP] finishTransaction error:', fErr);
          }
          if (activePurchaseSuccessCallback) {
            const cb = activePurchaseSuccessCallback;
            activePurchaseSuccessCallback = null;
            cb();
          }
          onGlobalAdFreeActivated?.();
        }
      });
    }

    if (!purchaseErrorSubscription) {
      purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
        console.warn('[IAP] Purchase listener error on', Platform.OS, ':', error);
        if (activePurchaseErrorCallback) {
          const cb = activePurchaseErrorCallback;
          activePurchaseErrorCallback = null;
          cb(error?.message || 'Purchase failed');
        }
      });
    }

    return isConnected;
  } catch (err) {
    console.warn('[IAP] initConnection error (normal in simulator/Expo Go):', err);
    isConnected = false;
    return false;
  }
}

/**
 * Cleanly end connection and detach listeners
 */
export async function endIAP(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
    if (isConnected) {
      await RNIap.endConnection();
      isConnected = false;
    }
  } catch (err) {
    console.warn('[IAP] endConnection warning:', err);
  }
}

/**
 * Fetch localized price string (e.g. "₺139,99" or "$3.99")
 */
export async function fetchRemoveAdsPrice(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    if (!isConnected) {
      await initIAP();
    }
    const products = await RNIap.fetchProducts({ skus: [IAP_SKUS.REMOVE_ADS], type: 'in-app' });
    if (products && products.length > 0) {
      const p = products[0] as any;
      return p.displayPrice || p.localizedPrice || p.price || null;
    }
  } catch (err) {
    console.warn('[IAP] fetchProducts warning:', err);
  }
  return null;
}

/**
 * Request In-App Purchase for Remove Ads (Non-Consumable / One-Time Product)
 * Fully compatible with both iOS StoreKit and Android Google Play Billing.
 */
export async function purchaseRemoveAds(
  onSuccess: () => void,
  onError?: (msg: string) => void
): Promise<boolean> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(STORAGE_KEY_AD_FREE, 'true');
    onSuccess();
    return true;
  }

  try {
    if (!isConnected) {
      await initIAP();
    }

    activePurchaseSuccessCallback = onSuccess;
    activePurchaseErrorCallback = onError || null;

    const purchase = await RNIap.requestPurchase({
      sku: IAP_SKUS.REMOVE_ADS,
      skus: [IAP_SKUS.REMOVE_ADS],
      request: {
        apple: { sku: IAP_SKUS.REMOVE_ADS },
        google: { skus: [IAP_SKUS.REMOVE_ADS] },
      },
      type: 'in-app',
    } as any);

    if (purchase) {
      await AsyncStorage.setItem(STORAGE_KEY_AD_FREE, 'true');
      try {
        await RNIap.finishTransaction({ purchase: purchase as any, isConsumable: false });
      } catch (finishErr) {
        console.warn('[IAP] finishTransaction warning:', finishErr);
      }
      activePurchaseSuccessCallback = null;
      activePurchaseErrorCallback = null;
      onSuccess();
      return true;
    }
    return true;
  } catch (err: any) {
    activePurchaseSuccessCallback = null;
    activePurchaseErrorCallback = null;
    if (err?.code === 'E_USER_CANCELLED' || err?.message?.includes('cancelled')) {
      console.log('[IAP] User cancelled purchase');
      return false;
    }
    console.warn('[IAP] Purchase error on', Platform.OS, ':', err);
    onError?.(err?.message || 'Purchase could not be completed.');
    return false;
  }
}

/**
 * Restore Non-Consumable / Active Purchases
 * Checks StoreKit on iOS and Google Play Billing on Android.
 */
export async function restorePurchases(
  onRestored: () => void,
  onNoneFound?: () => void,
  onError?: (msg: string) => void
): Promise<boolean> {
  if (Platform.OS === 'web') {
    onNoneFound?.();
    return false;
  }

  try {
    if (!isConnected) {
      await initIAP();
    }

    const availablePurchases = await RNIap.getAvailablePurchases();
    const hasRemoveAds = Array.isArray(availablePurchases) && availablePurchases.some(
      (p) => p.productId === IAP_SKUS.REMOVE_ADS
    );

    if (hasRemoveAds) {
      await AsyncStorage.setItem(STORAGE_KEY_AD_FREE, 'true');
      // If purchase needs acknowledgement on Android, acknowledge it
      const matchedPurchase = availablePurchases.find((p) => p.productId === IAP_SKUS.REMOVE_ADS);
      if (matchedPurchase) {
        try {
          await RNIap.finishTransaction({ purchase: matchedPurchase as any, isConsumable: false });
        } catch (_) {}
      }
      onRestored();
      return true;
    } else {
      onNoneFound?.();
      return false;
    }
  } catch (err: any) {
    console.warn('[IAP] restorePurchases warning on', Platform.OS, ':', err);
    onError?.(err?.message || 'Restore failed.');
    return false;
  }
}
