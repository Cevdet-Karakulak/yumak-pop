import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { playAsmrComboTone, playAsmrFeverChord } from '../yarn_fever/asmrAudio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WORKSHOP_BG = require('../../../assets/images/features_lab/workshop_bg.jpg');
const CHAIR_IMG = require('../../../assets/images/features_lab/rocking_chair.png');
const BOBBIN_CLASSIC = require('../../../assets/images/mascot.png');
const BOBBIN_MASTER = require('../../../assets/images/features_lab/master_crafter_cutout.png');

export function WorkshopTab() {
  const [stars, setStars] = useState(180);
  const [isChairCrafted, setIsChairCrafted] = useState(false);
  const [isCostumeUnlocked, setIsCostumeUnlocked] = useState(false);
  const [costumeMode, setCostumeMode] = useState<'classic' | 'master'>('classic');
  const [speech, setSpeech] = useState(
    'Atölyemize hoş geldin usta! Burayı ilmek ilmek donatalım mı?'
  );

  const craftChair = () => {
    if (stars < 40) return;
    setStars((s) => s - 40);
    setIsChairCrafted(true);
    setSpeech('Oh be! Torna kayın sallanan koltuğum atölyeye tam oturdu usta!');
    playAsmrComboTone(2);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const craftCostume = () => {
    if (stars < 60) return;
    setStars((s) => s - 60);
    setIsCostumeUnlocked(true);
    setCostumeMode('master');
    setSpeech('Harika! Deri önlüğüm, kışlık bere ve kalın atkım bana çok yakıştı!');
    playAsmrFeverChord();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stars Header */}
      <View style={styles.statsBar}>
        <View style={styles.starBadge}>
          <Text style={styles.starText}>🌟 {stars}</Text>
        </View>
        <TouchableOpacity
          style={styles.addStarBtn}
          onPress={() => {
            setStars((s) => s + 50);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }}
        >
          <Text style={styles.addStarText}>+50 Yıldız Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* Realistic Stop-Motion Workshop Diorama */}
      <View style={styles.dioramaFrame}>
        <Image source={WORKSHOP_BG} style={styles.dioramaBg} resizeMode="cover" />

        {/* Rocking Chair Prop */}
        <View
          style={[
            styles.chairWrapper,
            !isChairCrafted && { opacity: 0.25, transform: [{ scale: 0.95 }] },
          ]}
        >
          <Image source={CHAIR_IMG} style={styles.chairImg} resizeMode="contain" />
          <View style={styles.propTag}>
            <Text style={styles.propTagText}>
              {isChairCrafted ? '✓ Sallanan Koltuk' : '🔒 Sallanan Koltuk'}
            </Text>
          </View>
        </View>

        {/* Bobbin Center Character */}
        <View style={styles.bobbinWrapper}>
          {/* Speech Bubble */}
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>🪵 {speech}</Text>
          </View>

          <Image
            source={costumeMode === 'master' ? BOBBIN_MASTER : BOBBIN_CLASSIC}
            style={styles.bobbinImg}
            resizeMode="contain"
          />
        </View>

        {/* Costume Switcher Pill */}
        <View style={styles.costumeSwitchBar}>
          <TouchableOpacity
            style={[
              styles.costumeToggleBtn,
              costumeMode === 'classic' && styles.costumeToggleBtnActive,
            ]}
            onPress={() => {
              setCostumeMode('classic');
              Haptics.selectionAsync().catch(() => {});
            }}
          >
            <Text
              style={[
                styles.costumeToggleText,
                costumeMode === 'classic' && styles.costumeToggleTextActive,
              ]}
            >
              Klasik Kazak
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.costumeToggleBtn,
              costumeMode === 'master' && styles.costumeToggleBtnActive,
              !isCostumeUnlocked && { opacity: 0.6 },
            ]}
            onPress={() => {
              if (!isCostumeUnlocked) return;
              setCostumeMode('master');
              Haptics.selectionAsync().catch(() => {});
            }}
          >
            <Text
              style={[
                styles.costumeToggleText,
                costumeMode === 'master' && styles.costumeToggleTextActive,
              ]}
            >
              {isCostumeUnlocked ? '🧣 Zanaatkar Kışlık' : '🔒 Kışlık Kostüm'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Crafting Items Cards */}
      <Text style={styles.sectionTitle}>Atölye Eşyaları & Gardırop</Text>

      {/* Item 1: Jute Rug (Unlocked) */}
      <View style={styles.card}>
        <View style={styles.cardIconBox}>
          <Text style={{ fontSize: 26 }}>🧶</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>1. Jüt & Merino Yün Kilim</Text>
          <Text style={styles.cardDesc}>Herringbone parke üzerinde el dokuması püsküllü zemin.</Text>
          <Text style={styles.cardStatusReady}>✓ Atölyede Mevcut</Text>
        </View>
        <View style={styles.readyBadge}>
          <Text style={styles.readyBadgeText}>Hazır</Text>
        </View>
      </View>

      {/* Item 2: Turned Beech Rocking Chair */}
      <View style={styles.card}>
        <View style={styles.cardIconBox}>
          <Text style={{ fontSize: 26 }}>🪑</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>2. Torna Kayın Sallanan Koltuk</Text>
          <Text style={styles.cardDesc}>Doğal gürgen torna parmaklıklar ve pişmiş toprak merino minder.</Text>
          <Text style={styles.cardCost}>Maliyet: 40 🌟</Text>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, isChairCrafted && styles.actionBtnDone]}
          disabled={isChairCrafted}
          onPress={craftChair}
        >
          <Text style={styles.actionBtnText}>
            {isChairCrafted ? '✓ Örüldü' : 'Ör & Kur!'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Item 3: Master Crafter Costume */}
      <View style={styles.card}>
        <View style={styles.cardIconBox}>
          <Text style={{ fontSize: 26 }}>🧣</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>3. Kışlık Zanaatkar Kostümü</Text>
          <Text style={styles.cardDesc}>Dikişli deri önlük, ponponlu bere, kabartmalı kalın atkı ve şişler.</Text>
          <Text style={styles.cardCost}>Maliyet: 60 🌟</Text>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, isCostumeUnlocked && styles.actionBtnDone]}
          disabled={isCostumeUnlocked}
          onPress={craftCostume}
        >
          <Text style={styles.actionBtnText}>
            {isCostumeUnlocked ? '✓ Gardıropta' : 'Aç & Giydir!'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF8F0' },
  content: { padding: 16, paddingBottom: 40 },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  starBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  starText: { fontSize: 16, fontWeight: '800', color: '#B45309' },
  addStarBtn: {
    backgroundColor: '#D97706',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addStarText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  dioramaFrame: {
    width: '100%',
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: '#78350F',
    borderWidth: 3,
    position: 'relative',
    backgroundColor: '#3E2723',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  dioramaBg: { width: '100%', height: '100%', opacity: 0.95 },
  chairWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    width: 140,
    height: 140,
    alignItems: 'center',
  },
  chairImg: { width: '100%', height: '100%' },
  propTag: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: 'rgba(62,39,35,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B45309',
  },
  propTagText: { color: '#FDF8F0', fontSize: 10, fontWeight: '800' },
  bobbinWrapper: {
    position: 'absolute',
    bottom: 20,
    right: 24,
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderColor: '#FBBF24',
    borderWidth: 1.5,
    marginBottom: 6,
    maxWidth: 200,
    elevation: 4,
  },
  bubbleText: { fontSize: 11, fontWeight: '800', color: '#451A03', textAlign: 'center' },
  bobbinImg: { width: 140, height: 140 },
  costumeSwitchBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  costumeToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  costumeToggleBtnActive: { backgroundColor: '#78350F' },
  costumeToggleText: { fontSize: 11, fontWeight: '800', color: '#78350F' },
  costumeToggleTextActive: { color: '#fff' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#451A03',
    marginTop: 18,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#EFEBE4',
    borderWidth: 1.5,
    elevation: 2,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1, paddingRight: 8 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#451A03' },
  cardDesc: { fontSize: 11, color: '#78350F', marginTop: 2 },
  cardStatusReady: { fontSize: 11, fontWeight: '800', color: '#059669', marginTop: 3 },
  cardCost: { fontSize: 11, fontWeight: '800', color: '#D97706', marginTop: 3 },
  readyBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  readyBadgeText: { color: '#065F46', fontWeight: '800', fontSize: 11 },
  actionBtn: {
    backgroundColor: '#78350F',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnDone: { backgroundColor: '#059669' },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 11 },
});
