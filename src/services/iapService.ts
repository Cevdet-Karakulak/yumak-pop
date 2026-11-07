import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNIap from 'react-native-iap';

export const IAP_SKUS = {
  REMOVE_ADS: 'com.floppatech.yumakpop.removeads',
};

export const STORAGE_KEY_AD_FREE = '@yumakpop:ad_free';

let isConnected = false;

/**
 * Initialize connection with StoreKit / Google Play Billing
 */
export async function initIAP(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const res = await RNIap.initConnection();
    isConnected = Boolean(res);
    console.log('[IAP] Initialized connection:', isConnected);
    return isConnected;
  } catch (err) {
    console.warn('[IAP] initConnection error (normal in simulator/Expo Go):', err);
    isConnected = false;
    return false;
  }
}

/**
 * Cleanly end connection
 */
export async function endIAP(): Promise<void> {
  if (Platform.OS === 'web' || !isConnected) return;
  try {
    await RNIap.endConnection();
    isConnected = false;
  } catch (err) {
    console.warn('[IAP] endConnection warning:', err);
  }
}

/**
 * Fetch localized price string (e.g. "₺69,99" or "$1.99")
 */
export async function fetchRemoveAdsPrice(): Promise<string> {
  if (Platform.OS === 'web') return '₺69,99';
  try {
    if (!isConnected) {
      await initIAP();
    }
    const products = await RNIap.fetchProducts({ skus: [IAP_SKUS.REMOVE_ADS] });
    if (products && products.length > 0) {
      const p = products[0] as any;
      return p.displayPrice || p.localizedPrice || p.price || '₺69,99';
    }
  } catch (err) {
    console.warn('[IAP] getProducts warning:', err);
  }
  return '₺69,99';
}

/**
 * Request In-App Purchase for Remove Ads (Non-Consumable)
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

    const purchase = await RNIap.requestPurchase({
      sku: IAP_SKUS.REMOVE_ADS,
      skus: [IAP_SKUS.REMOVE_ADS],
    } as any);

    if (purchase) {
      await AsyncStorage.setItem(STORAGE_KEY_AD_FREE, 'true');
      try {
        await RNIap.finishTransaction({ purchase: purchase as any, isConsumable: false });
      } catch (finishErr) {
        console.warn('[IAP] finishTransaction warning:', finishErr);
      }
      onSuccess();
      return true;
    }
    return false;
  } catch (err: any) {
    if (err?.code === 'E_USER_CANCELLED' || err?.message?.includes('cancelled')) {
      console.log('[IAP] User cancelled purchase');
      return false;
    }
    console.warn('[IAP] Purchase error:', err);
    onError?.(err?.message || 'Purchase could not be completed.');
    return false;
  }
}

/**
 * Restore Non-Consumable Purchases (Strict Apple Guideline 3.1.1 Requirement)
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
      onRestored();
      return true;
    } else {
      onNoneFound?.();
      return false;
    }
  } catch (err: any) {
    console.warn('[IAP] restorePurchases warning:', err);
    onError?.(err?.message || 'Restore failed.');
    return false;
  }
}
