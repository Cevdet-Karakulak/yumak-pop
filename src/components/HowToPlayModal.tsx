import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MechanicKind } from '../game/levels';
import { useSave } from '../save';
import { UI } from '../theme';
import { BasketView, SpoolView } from './SpoolView';
import { FONT, Sheet, T, YarnButton } from './ui';

export function HowToPlaySheet({
  visible,
  onClose,
  onReplayTutorial,
}: {
  visible: boolean;
  onClose: () => void;
  onReplayTutorial?: () => void;
}) {
  const { t } = useSave();

  const cards: {
    key: MechanicKind;
    title: string;
    desc: string;
    visual: React.ReactNode;
  }[] = [
    {
      key: 'basic',
      title: t.mech_basic_title,
      desc: t.mech_basic_desc,
      visual: <SpoolView color="R" cap={4} need={4} size={46} />,
    },
    {
      key: 'knots',
      title: t.mech_knots_title,
      desc: t.mech_knots_desc,
      visual: <SpoolView color="B" cap={5} need={5} knots={2} size={46} />,
    },
    {
      key: 'twin',
      title: t.mech_twin_title,
      desc: t.mech_twin_desc,
      visual: (
        <View style={{ alignItems: 'center' }}>
          <SpoolView color="G" cap={4} need={4} twinId={1} isTwinTop size={36} />
          <View style={{ marginTop: -4 }}>
            <SpoolView color="Y" cap={4} need={4} twinId={1} size={36} showCount={false} />
          </View>
        </View>
      ),
    },
    {
      key: 'basket',
      title: t.mech_basket_title,
      desc: t.mech_basket_desc,
      visual: <BasketView count={4} size={52} />,
    },
    {
      key: 'mystery',
      title: t.mech_mystery_title,
      desc: t.mech_mystery_desc,
      visual: <SpoolView color="P" cap={4} need={4} isMystery size={46} />,
    },
    {
      key: 'rainbow',
      title: t.mech_rainbow_title,
      desc: t.mech_rainbow_desc,
      visual: <SpoolView color="Y" cap={4} need={4} isWild size={46} />,
    },
    {
      key: 'frozen',
      title: t.mech_frozen_title,
      desc: t.mech_frozen_desc,
      visual: <SpoolView color="T" cap={4} need={4} frozen={2} size={46} />,
    },
    {
      key: 'dual',
      title: t.mech_dual_title,
      desc: t.mech_dual_desc,
      visual: <SpoolView color="R" cap={3} need={3} secondColor="B" size={46} />,
    },
    {
      key: 'vortex',
      title: t.mech_vortex_title,
      desc: t.mech_vortex_desc,
      visual: (
        <View style={styles.vortexIcon}>
          <Ionicons name="warning" size={28} color="#fff" />
        </View>
      ),
    },
  ];

  return (
    <Sheet visible={visible} onClose={onClose} title={t.howToPlay}>
      <ScrollView
        style={{ maxHeight: 370, alignSelf: 'stretch' }}
        showsVerticalScrollIndicator={false}
      >
        {cards.map((c) => (
          <View key={c.key} style={styles.card}>
            <View style={styles.visualBox}>{c.visual}</View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <T style={{ fontFamily: FONT.black, fontSize: 15, color: UI.plum }}>{c.title}</T>
              <T style={{ fontSize: 12.5, color: UI.plumLight, lineHeight: 17, marginTop: 2 }}>
                {c.desc}
              </T>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignSelf: 'stretch', marginTop: 10, gap: 10 }}>
        {onReplayTutorial && (
          <YarnButton
            small
            label={t.replayGuide}
            icon="school"
            color="mint"
            onPress={() => {
              onClose();
              onReplayTutorial();
            }}
            style={{ flex: 1 }}
          />
        )}
        <YarnButton
          small
          label={t.gotIt}
          icon="checkmark-circle"
          color="coral"
          onPress={onClose}
          style={{ flex: 1 }}
        />
      </View>
    </Sheet>
  );
}

export function MechanicIntroSheet({
  mechanic,
  onClose,
}: {
  mechanic: MechanicKind | null;
  onClose: () => void;
}) {
  const { t } = useSave();
  if (!mechanic) return null;

  const titleMap: Record<MechanicKind, string> = {
    basic: t.mech_basic_title,
    knots: t.mech_knots_title,
    twin: t.mech_twin_title,
    basket: t.mech_basket_title,
    mystery: t.mech_mystery_title,
    rainbow: t.mech_rainbow_title,
    frozen: t.mech_frozen_title,
    dual: t.mech_dual_title,
    vortex: t.mech_vortex_title,
    bridge: t.mech_bridge_title,
    ice_zone: t.mech_ice_zone_title,
    conveyor: t.mech_conveyor_title,
  };
  const descMap: Record<MechanicKind, string> = {
    basic: t.mech_basic_desc,
    knots: t.mech_knots_desc,
    twin: t.mech_twin_desc,
    basket: t.mech_basket_desc,
    mystery: t.mech_mystery_desc,
    rainbow: t.mech_rainbow_desc,
    frozen: t.mech_frozen_desc,
    dual: t.mech_dual_desc,
    vortex: t.mech_vortex_desc,
    bridge: t.mech_bridge_desc,
    ice_zone: t.mech_ice_zone_desc,
    conveyor: t.mech_conveyor_desc,
  };

  return (
    <Sheet visible={!!mechanic} onClose={onClose} title={titleMap[mechanic]}>
      <View style={styles.heroVisual}>
        {mechanic === 'basic' && <SpoolView color="R" cap={4} need={4} size={68} />}
        {mechanic === 'knots' && <SpoolView color="B" cap={5} need={5} knots={2} size={72} />}
        {mechanic === 'twin' && (
          <View style={{ alignItems: 'center' }}>
            <SpoolView color="G" cap={4} need={4} twinId={1} isTwinTop size={54} />
            <View style={{ marginTop: -4 }}>
              <SpoolView color="Y" cap={4} need={4} twinId={1} size={54} />
            </View>
          </View>
        )}
        {mechanic === 'basket' && <BasketView count={5} size={82} />}
        {mechanic === 'mystery' && <SpoolView color="P" cap={4} need={4} isMystery size={68} />}
        {mechanic === 'rainbow' && <SpoolView color="Y" cap={4} need={4} isWild size={68} />}
        {mechanic === 'frozen' && <SpoolView color="T" cap={4} need={4} frozen={2} size={68} />}
        {mechanic === 'dual' && <SpoolView color="R" cap={3} need={3} secondColor="B" size={68} />}
        {mechanic === 'vortex' && (
          <View style={styles.vortexIcon}>
            <Ionicons name="warning" size={44} color="#fff" />
          </View>
        )}
        {mechanic === 'bridge' && (
          <View style={{ alignItems: 'center' }}>
            <T style={{ fontSize: 52 }}>🌉</T>
            <T style={{ fontSize: 13, color: UI.coral, fontFamily: FONT.black, marginTop: 4 }}>
              {t.mech_bridge_title}
            </T>
          </View>
        )}
        {mechanic === 'ice_zone' && (
          <View style={{ alignItems: 'center' }}>
            <T style={{ fontSize: 52 }}>❄️</T>
            <T style={{ fontSize: 13, color: '#0284C7', fontFamily: FONT.black, marginTop: 4 }}>
              {t.mech_ice_zone_title}
            </T>
          </View>
        )}
        {mechanic === 'conveyor' && (
          <View style={{ alignItems: 'center' }}>
            <T style={{ fontSize: 52 }}>⚙️</T>
            <T style={{ fontSize: 13, color: UI.gold, fontFamily: FONT.black, marginTop: 4 }}>
              {t.mech_conveyor_title}
            </T>
          </View>
        )}
      </View>
      <T
        style={{
          textAlign: 'center',
          fontSize: 16,
          color: UI.plum,
          lineHeight: 22,
          marginVertical: 14,
        }}
      >
        {descMap[mechanic]}
      </T>
      <YarnButton
        label={t.gotIt}
        icon="play"
        color="mint"
        onPress={onClose}
        style={{ alignSelf: 'stretch' }}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: '#F3D5C1',
  },
  visualBox: {
    width: 58,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF6EA',
    borderRadius: 12,
    paddingVertical: 2,
  },
  heroVisual: {
    width: 120,
    height: 130,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: UI.peach,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  vortexIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: UI.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
