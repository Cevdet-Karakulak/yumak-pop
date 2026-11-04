import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { playAsmrComboTone } from '../yarn_fever/asmrAudio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DRAGON_HEAD = require('../../../assets/sprites/dragon_head.png');
const BASKET_IMG = require('../../../assets/sprites/wicker_basket.png');

export function ForkLevelTab() {
  const [selectedLevel, setSelectedLevel] = useState<114 | 115 | 150>(115);

  // Dual Head Game State (for Level 115 & 150)
  const [blueHeadProgress, setBlueHeadProgress] = useState(40); // 0 (basket) to 100 (start)
  const [redHeadProgress, setRedHeadProgress] = useState(45);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isCrawling, setIsCrawling] = useState(true);

  // Auto crawl timer for simulation
  useEffect(() => {
    if (selectedLevel === 114 || !isCrawling || isGameOver || isVictory) return;
    const interval = setInterval(() => {
      setBlueHeadProgress((b) => {
        const next = b - 1.2;
        if (next <= 5) {
          setIsGameOver(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          return 0;
        }
        return next;
      });
      setRedHeadProgress((r) => {
        const next = r - 1.1;
        if (next <= 5) {
          setIsGameOver(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          return 0;
        }
        return next;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [selectedLevel, isCrawling, isGameOver, isVictory]);

  const windBlueYarn = () => {
    if (isGameOver || isVictory) return;
    setBlueHeadProgress((b) => {
      const next = Math.min(100, b + 15);
      if (next >= 95 && redHeadProgress >= 90) {
        setIsVictory(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      return next;
    });
    playAsmrComboTone(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const windRedYarn = () => {
    if (isGameOver || isVictory) return;
    setRedHeadProgress((r) => {
      const next = Math.min(100, r + 15);
      if (next >= 95 && blueHeadProgress >= 90) {
        setIsVictory(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      return next;
    });
    playAsmrComboTone(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const resetSimulation = () => {
    setBlueHeadProgress(40);
    setRedHeadProgress(45);
    setIsGameOver(false);
    setIsVictory(false);
    setIsCrawling(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerBox}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Kullanıcı Kararı: Seçici Çatal Parkur</Text>
        </View>
        <Text style={styles.title}>🔀 Çift Başlı Yılan (Milestone Seviyeler)</Text>
        <Text style={styles.desc}>
          Kullanıcı talimatı: <Text style={{ fontWeight: '800' }}>"Her bölümde olmasın, bazı özel bölümlerde çıksın."</Text>
          {'\n'}Standart bölümler (Örn: 114) tek hatlı akıcı ritmini korur. Çift baş yalnızca her 10-15 seviyede bir büyük taktiksel mücadele olarak devreye girer!
        </Text>
      </View>

      {/* Level Selector Pills */}
      <View style={styles.levelSelectorBar}>
        <TouchableOpacity
          style={[
            styles.levelPill,
            selectedLevel === 114 && styles.levelPillActiveNormal,
          ]}
          onPress={() => setSelectedLevel(114)}
        >
          <Text
            style={[
              styles.levelPillText,
              selectedLevel === 114 && styles.levelPillTextActive,
            ]}
          >
            🟢 Bölüm 114 (Tek Hat)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.levelPill,
            selectedLevel === 115 && styles.levelPillActiveFork,
          ]}
          onPress={() => {
            setSelectedLevel(115);
            resetSimulation();
          }}
        >
          <Text
            style={[
              styles.levelPillText,
              selectedLevel === 115 && styles.levelPillTextActive,
            ]}
          >
            ⚡ Bölüm 115 (Çatal)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.levelPill,
            selectedLevel === 150 && styles.levelPillActiveFinal,
          ]}
          onPress={() => {
            setSelectedLevel(150);
            resetSimulation();
          }}
        >
          <Text
            style={[
              styles.levelPillText,
              selectedLevel === 150 && styles.levelPillTextActive,
            ]}
          >
            👑 Bölüm 150 (Final)
          </Text>
        </TouchableOpacity>
      </View>

      {/* LEVEL 114: STANDART SINGLE TRACK PREVIEW */}
      {selectedLevel === 114 ? (
        <View style={styles.previewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLevelTitle}>Bölüm 114: Köprü ve Buzlu Geçit</Text>
            <Text style={styles.cardBadgeNormal}>Standart Seviye</Text>
          </View>
          <Text style={styles.trackDescText}>
            ✓ Tek bir parkur hattı ve tek bir sepet.
            {'\n'}✓ Oyuncu yalnızca köprü altından geçişi ve buzlu alandaki donma sürelerini takip eder.
            {'\n'}✓ Çift baş stresi veya kafa karışıklığı kesinlikle yoktur.
          </Text>

          <View style={styles.singleTrackVisual}>
            <View style={styles.singleTrackLine} />
            <Image source={BASKET_IMG} style={styles.singleBasket} resizeMode="contain" />
            <Image source={DRAGON_HEAD} style={styles.singleHead} resizeMode="contain" />
          </View>
        </View>
      ) : (
        /* LEVEL 115 / 150: INTERACTIVE DUAL HEAD FORK SIMULATION */
        <View style={styles.previewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLevelTitle}>
              {selectedLevel === 115 ? 'Bölüm 115: Çatal Kavşak' : 'Bölüm 150: Şampiyonluk Finali'}
            </Text>
            <Text style={styles.cardBadgeFork}>⚡ Özel Mücadele</Text>
          </View>

          {/* Interactive Y-Fork Track SVG */}
          <View style={styles.svgContainer}>
            <Svg width="100%" height={180} viewBox="0 0 320 180">
              {/* Main Trunk (Stem) */}
              <Line x1="160" y1="170" x2="160" y2="105" stroke="#D97706" strokeWidth="8" strokeLinecap="round" />
              {/* Fork Junction Point */}
              <Circle cx="160" cy="105" r="9" fill="#B45309" stroke="#fff" strokeWidth="2" />
              {/* Left Branch to Blue Basket */}
              <Path d="M 160 105 Q 110 80, 50 45" fill="none" stroke="#2563EB" strokeWidth="7" strokeLinecap="round" />
              {/* Right Branch to Red Basket */}
              <Path d="M 160 105 Q 210 80, 270 45" fill="none" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" />
            </Svg>

            {/* Left Blue Basket */}
            <View style={styles.leftBasketPos}>
              <Image source={BASKET_IMG} style={styles.basketImg} resizeMode="contain" />
              <Text style={[styles.basketLabel, { color: '#2563EB' }]}>Mavi Kuyu</Text>
            </View>

            {/* Right Red Basket */}
            <View style={styles.rightBasketPos}>
              <Image source={BASKET_IMG} style={styles.basketImg} resizeMode="contain" />
              <Text style={[styles.basketLabel, { color: '#DC2626' }]}>Kırmızı Kuyu</Text>
            </View>

            {/* Blue Head Indicator */}
            <View
              style={[
                styles.headPosLeft,
                {
                  opacity: isVictory ? 0.3 : 1,
                  transform: [{ scale: blueHeadProgress <= 20 ? 1.15 : 1 }],
                },
              ]}
            >
              <Image source={DRAGON_HEAD} style={styles.headImg} resizeMode="contain" />
              <Text style={styles.dangerLabel}>
                {blueHeadProgress <= 20 ? '⚠️ TEHLİKE!' : `%${Math.round(blueHeadProgress)}`}
              </Text>
            </View>

            {/* Red Head Indicator */}
            <View
              style={[
                styles.headPosRight,
                {
                  opacity: isVictory ? 0.3 : 1,
                  transform: [{ scale: redHeadProgress <= 20 ? 1.15 : 1 }],
                },
              ]}
            >
              <Image source={DRAGON_HEAD} style={styles.headImg} resizeMode="contain" />
              <Text style={styles.dangerLabel}>
                {redHeadProgress <= 20 ? '⚠️ TEHLİKE!' : `%${Math.round(redHeadProgress)}`}
              </Text>
            </View>

            {/* Result Overlay */}
            {isGameOver && (
              <View style={styles.resultOverlay}>
                <Text style={styles.gameOverTitle}>Kuyuya Ulaştı!</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={resetSimulation}>
                  <Text style={styles.retryBtnText}>Tekrar Dene</Text>
                </TouchableOpacity>
              </View>
            )}

            {isVictory && (
              <View style={[styles.resultOverlay, { backgroundColor: 'rgba(5,150,105,0.92)' }]}>
                <Text style={styles.victoryTitle}>🎉 İKİ KUYU DA KURTARILDI!</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={resetSimulation}>
                  <Text style={styles.retryBtnText}>Tekrar Oyna</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Interactive Player Controls */}
          <Text style={styles.controlsNotice}>
            📱 İki kafayı da dengeli sar! Birini çok boşlarsan kuyuya düşer.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.blueSpoolBtn}
              onPress={windBlueYarn}
              activeOpacity={0.8}
            >
              <Ionicons name="color-wand" size={18} color="#fff" />
              <Text style={styles.spoolBtnText}>Mavi Makara Sar</Text>
              <Text style={styles.spoolSubText}>Sol Kafayı Geri Çeker</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.redSpoolBtn}
              onPress={windRedYarn}
              activeOpacity={0.8}
            >
              <Ionicons name="color-wand" size={18} color="#fff" />
              <Text style={styles.spoolBtnText}>Kırmızı Makara Sar</Text>
              <Text style={styles.spoolSubText}>Sağ Kafayı Geri Çeker</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF8F0' },
  content: { padding: 16, paddingBottom: 40 },
  headerBox: { marginBottom: 14 },
  badge: {
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  badgeText: { color: '#991B1B', fontSize: 11, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '900', color: '#451A03' },
  desc: { fontSize: 12, color: '#78350F', marginTop: 4, lineHeight: 18 },
  levelSelectorBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  levelPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#EFEBE4',
    alignItems: 'center',
  },
  levelPillActiveNormal: { backgroundColor: '#059669', borderColor: '#059669' },
  levelPillActiveFork: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  levelPillActiveFinal: { backgroundColor: '#D97706', borderColor: '#D97706' },
  levelPillText: { fontSize: 11, fontWeight: '800', color: '#78350F' },
  levelPillTextActive: { color: '#fff' },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: '#EFEBE4',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLevelTitle: { fontSize: 15, fontWeight: '900', color: '#451A03' },
  cardBadgeNormal: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardBadgeFork: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trackDescText: { fontSize: 11, color: '#78350F', lineHeight: 17, marginBottom: 14 },
  singleTrackVisual: {
    height: 100,
    backgroundColor: '#FEF3C7',
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  singleTrackLine: {
    height: 6,
    backgroundColor: '#D97706',
    borderRadius: 3,
  },
  singleBasket: {
    position: 'absolute',
    left: 14,
    width: 36,
    height: 36,
  },
  singleHead: {
    position: 'absolute',
    right: 30,
    width: 38,
    height: 38,
  },
  svgContainer: {
    height: 200,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    position: 'relative',
    overflow: 'hidden',
  },
  leftBasketPos: { position: 'absolute', top: 12, left: 24, alignItems: 'center' },
  rightBasketPos: { position: 'absolute', top: 12, right: 24, alignItems: 'center' },
  basketImg: { width: 44, height: 44 },
  basketLabel: { fontSize: 10, fontWeight: '800', marginTop: 2 },
  headPosLeft: { position: 'absolute', top: 72, left: 88, alignItems: 'center' },
  headPosRight: { position: 'absolute', top: 72, right: 88, alignItems: 'center' },
  headImg: { width: 36, height: 36 },
  dangerLabel: { fontSize: 9, fontWeight: '900', color: '#991B1B', marginTop: 1 },
  resultOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(153,27,27,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  gameOverTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 12 },
  victoryTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginBottom: 12, textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
  },
  retryBtnText: { color: '#451A03', fontSize: 13, fontWeight: '800' },
  controlsNotice: {
    fontSize: 11,
    color: '#78350F',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  buttonRow: { flexDirection: 'row', gap: 10 },
  blueSpoolBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  redSpoolBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
  },
  spoolBtnText: { color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 3 },
  spoolSubText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 1 },
});
