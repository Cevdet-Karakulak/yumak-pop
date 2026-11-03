import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Linking, ScrollView, Switch, View } from 'react-native';
import { Bouncy, FONT, Sheet, T, YarnButton } from '../components/ui';
import { LANGUAGES } from '../i18n';
import { useSave } from '../save';
import { UI } from '../theme';

export const PRIVACY_URL = 'https://floppatechcorp.vercel.app/privacy/yumak-pop/';

export function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data, update, t, lang, reset } = useSave();
  const [confirm, setConfirm] = useState(false);

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
      <T style={{ color: UI.plumLight, fontSize: 13, marginTop: 4 }}>
        FloppaTech Corp · {t.version} {Constants.expoConfig?.version ?? '1.0.0'}
      </T>
    </Sheet>
  );
}
