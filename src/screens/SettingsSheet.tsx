import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';

import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Switch, View } from 'react-native';
import { fetchRemoveAdsPrice, purchaseRemoveAds, restorePurchases } from '../services/iapService';
import { Bouncy, FONT, Sheet, T, YarnButton } from '../components/ui';
import { LANGUAGES } from '../i18n';
import { useSave } from '../save';
import { UI } from '../theme';

export const PRIVACY_URL = 'https://floppatechcorp.vercel.app/privacy/yumak-pop/';

export function SettingsSheet({
  visible,
  onClose,
  onOpenLab,
  onRateApp,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenLab?: () => void;
  onRateApp?: () => void;
}) {
  const { data, update, t, lang, reset } = useSave();
  const [confirm, setConfirm] = useState(false);
  const [labUnlocked, setLabUnlocked] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [removeAdsPrice, setRemoveAdsPrice] = useState('₺69,99');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (visible && !data.isAdFree) {
      fetchRemoveAdsPrice()
        .then((p) => {
          if (p) setRemoveAdsPrice(p);
        })
        .catch(() => {});
    }
  }, [visible, data.isAdFree]);

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      await purchaseRemoveAds(
        () => {
          update((d) => ({ ...d, isAdFree: true }));
          Alert.alert('🎉 Yumak Pop', t.purchaseSuccess);
        },
        (msg) => {
          Alert.alert('Yumak Pop', msg || t.purchaseFailed);
        }
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await restorePurchases(
        () => {
          update((d) => ({ ...d, isAdFree: true }));
          Alert.alert('🎉 Yumak Pop', t.restoreSuccess);
        },
        () => {
          Alert.alert('Yumak Pop', t.restoreNone);
        },
        (msg) => {
          Alert.alert('Yumak Pop', msg || t.purchaseFailed);
        }
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const Row = ({ icon, label, value, onChange }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', paddingVertical: 6 }}>
      <Ionicons name={icon} size={24} color={UI.coral} />
      <T style={{ flex: 1, marginLeft: 10, fontSize: 18 }}>{label}</T>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: UI.coral, false: '#E3D6CF' }} thumbColor="#fff" />
    </View>
  );

  return (
    <Sheet visible={visible} onClose={onClose} title={t.settings}>
      <Row icon="volume-high" label={t.sound} value={data.sound} onChange={(v) => update((d) => ({ ...d, sound: v }))} />
      <Row icon="musical-notes" label={t.music} value={data.music} onChange={(v) => update((d) => ({ ...d, music: v }))} />
      <Row icon="phone-portrait" label={t.haptics} value={data.haptics} onChange={(v) => update((d) => ({ ...d, haptics: v }))} />

      <View style={{ alignSelf: 'stretch', paddingVertical: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="language" size={24} color={UI.coral} />
          <T style={{ flex: 1, marginLeft: 10, fontSize: 18 }}>{t.language}</T>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor: '#F1E1D6',
            }}
          >
            <T style={{ fontSize: 13, color: UI.coralDark, fontFamily: FONT.black }}>
              {LANGUAGES.find((l) => l.code === lang)?.name ?? lang.toUpperCase()}
            </T>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 4, gap: 8 }}
        >
          {LANGUAGES.map((l) => {
            const active = lang === l.code;
            return (
              <Bouncy key={l.code} onPress={() => update((d) => ({ ...d, lang: l.code }))}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: active ? UI.coral : '#F1E1D6',
                    borderWidth: 1.5,
                    borderColor: active ? UI.coralDark : 'transparent',
                  }}
                >
                  <T style={{ fontSize: 16, marginRight: 6 }}>{l.flag}</T>
                  <T
                    style={{
                      color: active ? '#fff' : UI.plum,
                      fontFamily: active ? FONT.black : FONT.bold,
                      fontSize: 14,
                    }}
                  >
                    {l.name}
                  </T>
                </View>
              </Bouncy>
            );
          })}
        </ScrollView>
      </View>

      {data.isAdFree ? (
        <View
          style={{
            alignSelf: 'stretch',
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ECFDF5',
            borderColor: '#10B981',
            borderWidth: 1.5,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginTop: 10,
          }}
        >
          <Ionicons name="checkmark-circle" size={24} color="#059669" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <T style={{ color: '#065F46', fontFamily: FONT.black, fontSize: 15 }}>
              {t.removeAdsActive}
            </T>
            <T style={{ color: '#047857', fontSize: 12 }}>
              {t.removeAdsDesc}
            </T>
          </View>
        </View>
      ) : (
        <View
          style={{
            alignSelf: 'stretch',
            backgroundColor: '#FFFBEB',
            borderColor: '#F59E0B',
            borderWidth: 1.5,
            borderRadius: 16,
            padding: 12,
            marginTop: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="sparkles" size={20} color="#D97706" style={{ marginRight: 8 }} />
            <T style={{ flex: 1, fontFamily: FONT.black, fontSize: 16, color: '#92400E' }}>
              {t.removeAds}
            </T>
            <View
              style={{
                backgroundColor: '#FEF3C7',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
              }}
            >
              <T style={{ fontFamily: FONT.black, fontSize: 13, color: '#B45309' }}>
                {removeAdsPrice}
              </T>
            </View>
          </View>
          <T style={{ color: '#78350F', fontSize: 12, marginBottom: 10 }}>
            {t.removeAdsDesc}
          </T>
          <YarnButton
            small
            label={isPurchasing ? '...' : `${t.removeAds} (${removeAdsPrice})`}
            icon="cart"
            color="gold"
            disabled={isPurchasing}
            onPress={handlePurchase}
          />
        </View>
      )}

      <Bouncy
        disabled={isRestoring}
        onPress={handleRestore}
        style={{
          alignSelf: 'center',
          paddingVertical: 4,
          paddingHorizontal: 12,
          marginTop: 6,
          marginBottom: 4,
        }}
      >
        <T style={{ color: UI.plumLight, fontSize: 13, textDecorationLine: 'underline' }}>
          {isRestoring ? '...' : t.restorePurchases}
        </T>
      </Bouncy>

      <YarnButton
        small
        label={t.rateMenuBtn}
        icon="star"
        color="gold"
        onPress={() => {
          onClose();
          onRateApp?.();
        }}
        style={{ marginTop: 12, alignSelf: 'stretch' }}
      />

      {confirm ? (
        <View style={{ alignSelf: 'stretch', marginTop: 10, alignItems: 'center' }}>
          <T style={{ textAlign: 'center', marginBottom: 8 }}>{t.resetConfirm}</T>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <YarnButton
              small
              label={t.yes}
              color="coral"
              onPress={() => {
                reset();
                setConfirm(false);
              }}
            />
            <YarnButton small label={t.no} color="plum" onPress={() => setConfirm(false)} />
          </View>
        </View>
      ) : (
        <YarnButton small label={t.reset} icon="trash" color="plum" onPress={() => setConfirm(true)} style={{ marginTop: 12 }} />
      )}

      <Bouncy onPress={() => Linking.openURL(PRIVACY_URL)} style={{ marginTop: 14 }}>
        <T style={{ color: UI.plumLight, textDecorationLine: 'underline' }}>{t.privacy}</T>
      </Bouncy>
      <Bouncy
        onPress={() => {
          const next = tapCount + 1;
          setTapCount(next);
          if (next >= 3) {
            setLabUnlocked(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          } else {
            Haptics.selectionAsync().catch(() => {});
          }
        }}
        style={{ marginTop: 4, paddingVertical: 4 }}
      >
        <T style={{ color: UI.plumLight, fontSize: 13 }}>
          FloppaTech Corp • {t.version} {Constants.expoConfig?.version ?? '1.0.0'}
        </T>
      </Bouncy>

      {(labUnlocked || __DEV__) && Boolean(onOpenLab) && (
        <Bouncy
          onPress={() => {
            onClose();
            onOpenLab?.();
          }}
          style={{
            marginTop: 10,
            backgroundColor: '#78350F',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 14,
            alignItems: 'center',
            alignSelf: 'stretch',
          }}
        >
          <T style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
            🧪 Yenilikler Laboratuvarı (Sandbox v2)
          </T>
        </Bouncy>
      )}
      
    </Sheet>
  );
}
