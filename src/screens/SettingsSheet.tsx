import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Linking, Switch, View } from 'react-native';
import { Bouncy, FONT, Sheet, T, YarnButton } from '../components/ui';
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

      <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', paddingVertical: 8 }}>
        <Ionicons name="language" size={24} color={UI.coral} />
        <T style={{ flex: 1, marginLeft: 10, fontSize: 18 }}>{t.language}</T>
        {(['tr', 'en'] as const).map((l) => (
          <Bouncy key={l} onPress={() => update((d) => ({ ...d, lang: l }))}>
            <View
              style={{
                marginLeft: 8,
                paddingHorizontal: 14,
                paddingVertical: 4,
                borderRadius: 14,
                backgroundColor: lang === l ? UI.coral : '#F1E1D6',
              }}
            >
              <T style={{ color: lang === l ? '#fff' : UI.plum, fontFamily: FONT.black }}>{l.toUpperCase()}</T>
            </View>
          </Bouncy>
        ))}
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
