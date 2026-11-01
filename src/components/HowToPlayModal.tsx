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
      title: '🧶 Örgü Yılan & Kuyu',
      desc: 'Ray boyunca ilerleyen örgü yılan kuyuya düşmeden önce doğru makaraları rafa yerleştirerek ipleri sök!',
      visual: <SpoolView color="R" cap={4} need={4} size={46} />,
    },
    {
      key: 'knots',
      title: '🔒 Düğümlü Makara',
      desc: 'Düğümlü makaralara doğrudan basılamaz. Yanındaki komşu sütundan makara çekerek düğümü çöz!',
      visual: <SpoolView color="B" cap={5} need={5} knots={2} size={46} />,
    },
    {
      key: 'twin',
      title: '🔗 İkiz Bağlı Makaralar',
      desc: 'İki makara birlikte rafa iner. Rafa yerleştirmek için en az 2 boş yuva gerekir!',
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
      title: '🧺 Sürpriz Örgü Sepeti',
      desc: 'Sütunun arkasındaki hasır sepetler önü açıldıkça yeni makaralar fırlatır!',
      visual: <BasketView count={4} size={52} />,
    },
    {
      key: 'mystery',
      title: '❓ Gizemli Makara',
      desc: 'Rengi gizlidir. Rafa aldığında asıl canlı rengi ve örgüsü ortaya çıkar!',
      visual: <SpoolView color="P" cap={4} need={4} isMystery size={46} />,
    },
    {
      key: 'rainbow',
      title: '🌈 Gökkuşağı Joker Makara',
      desc: 'Her renkle eşleşir! Yılanın başındaki her rengi çeker ve kriz anlarında hayat kurtarır.',
      visual: <SpoolView color="Y" cap={4} need={4} isWild size={46} />,
    },
    {
      key: 'frozen',
      title: '❄️ Buzlu / Donmuş Makara',
      desc: 'Buzla kilitlidir. Rafta makara patlattıkça buzları çatlar ve çözülür!',
      visual: <SpoolView color="T" cap={4} need={4} frozen={2} size={46} />,
    },
    {
      key: 'dual',
      title: '🪢 Çift Katmanlı Makara',
      desc: 'İki katmanlı bobin! İlk renk bitince içindeki ikinci renk açılır ve sarmaya devam eder.',
      visual: <SpoolView color="R" cap={3} need={3} secondColor="B" size={46} />,
    },
    {
      key: 'vortex',
      title: '🌀 Tehlikeli Obur Kuyu',
      desc: 'Her hamlende yılan kuyuya doğru yaklaşır. Kuyuya çekilmeden önce tüm yünleri topla!',
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
            label="Rehberi Başlat"
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
    basic: '🧶 Örgü Yılan & Kuyu',
    knots: '🔒 Düğümlü Makara!',
    twin: '🔗 İkiz Bağlı Makaralar!',
    basket: '🧺 Sürpriz Örgü Sepeti!',
    mystery: '❓ Gizemli Makara!',
    rainbow: '🌈 Gökkuşağı Joker!',
    frozen: '❄️ Buzlu Makara!',
    dual: '🪢 Çift Katmanlı Makara!',
    vortex: '🌀 Tehlikeli Obur Kuyu!',
  };
  const descMap: Record<MechanicKind, string> = {
    basic: 'Ray boyunca ilerleyen örgü yılan kuyuya düşmeden önce doğru makaraları seçerek ipleri sök!',
    knots: 'Düğümlü makaralara doğrudan basılamaz. Hemen yanındaki komşu sütundan makara çekerek düğümü çöz!',
    twin: 'Kordonla bağlı iki makara aynı anda rafa iner! Rafta en az 2 boş yer olmalı.',
    basket: 'Sütunun arkasındaki sepetler önü açıldıkça yeni yedek makaralar çıkarır!',
    mystery: 'Rengi işlemeli soru işaretiyle gizlenmiştir. Rafa aldığında asıl rengi ve örgüsü ortaya çıkar!',
    rainbow: 'Gökkuşağı makara her renkle eşleşir! Yılanın başındaki herhangi bir ipi çeker.',
    frozen: 'Buzla kilitlidir! Rafta makara patlattıkça buzu çatlar ve çözülür.',
    dual: 'İki renkli bobin! İlk yün katmanı sarılınca altındaki ikinci gizli renk devreye girer.',
    vortex: 'Yılan kuyuya doğru hızla yaklaşıyor! Hamlelerini iyi planla, kuyuya düşmeden tüm ipleri topla!',
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
