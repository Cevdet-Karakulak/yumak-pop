import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { playAsmrComboTone, playAsmrFeverChord } from '../yarn_fever/asmrAudio';

const SPOOL_IMG = require('../../../assets/sprites/spool_R.png');

const CHORD_NOTES = [
  { name: 'Do (C4)', hz: '261.6 Hz', desc: 'Hafif Ahşap Tık', index: 0 },
  { name: 'Mi (E4)', hz: '329.6 Hz', desc: 'Yumuşak Yün İlmeği', index: 1 },
  { name: 'Sol (G4)', hz: '392.0 Hz', desc: 'Akustik Rezonans', index: 2 },
  { name: 'Si (B4)', hz: '493.9 Hz', desc: 'Berrak Yükseliş', index: 3 },
  { name: 'Do (C5)', hz: '523.3 Hz', desc: 'Huzurlu Zirve', index: 4 },
];

export function AsmrFeverTab() {
  const [combo, setCombo] = useState(0);
  const [isFever, setIsFever] = useState(false);
  const [score, setScore] = useState(0);
  const [activeNoteText, setActiveNoteText] = useState('Henüz notaya basılmadı');

  const onMatchSuccess = () => {
    const nextCombo = Math.min(5, combo + 1);
    setCombo(nextCombo);
    setScore((s) => s + (isFever ? 150 : 100));

    if (nextCombo < 5) {
      playAsmrComboTone(nextCombo - 1);
      setActiveNoteText(`${CHORD_NOTES[nextCombo - 1].name} • ${CHORD_NOTES[nextCombo - 1].desc}`);
    } else {
      setIsFever(true);
      playAsmrFeverChord();
      setActiveNoteText('✨ Do-Mi-Sol-Do (YARN FEVER AKTİF!)');
    }
  };

  const onMiss = () => {
    if (isFever) return;
    setCombo(0);
    setActiveNoteText('Kombo sıfırlandı');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  };

  const resetFever = () => {
    setCombo(0);
    setIsFever(false);
    setActiveNoteText('Huzur modu tamamlandı');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.headerBox}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Dinlendirici ASMR Deneyimi</Text>
        </View>
        <Text style={styles.title}>🎵 Sakin ASMR Akorları & Slo-Mo</Text>
        <Text style={styles.desc}>
          Kullanıcı kuralı: <Text style={{ fontStyle: 'italic' }}>"Oyunu çok bozmadan uygulayalım."</Text>
          {'\n'}Gürültülü arcade efektleri yerine; yumuşak ahşap kalimba tınıları, sakin Do-Mi-Sol-Si-Do akorları ve hafif %25 slo-mo zaman gevşemesi.
        </Text>
      </View>

      {/* Live Playable Interactive Board */}
      <View style={[styles.gameBoard, isFever && styles.gameBoardFever]}>
        <View style={styles.gameBoardHeader}>
          <Text style={styles.scoreText}>Puan: {score}</Text>
          <View style={[styles.comboBadge, isFever && styles.comboBadgeFever]}>
            <Text style={[styles.comboText, isFever && styles.comboTextFever]}>
              {isFever ? '✨ YARN FEVER AKTİF!' : `Kombo: ${combo} / 5`}
            </Text>
          </View>
        </View>

        {/* Central Spool Simulation */}
        <View style={styles.centerStage}>
          <View style={[styles.spoolAura, isFever && styles.spoolAuraFever]}>
            <Image source={SPOOL_IMG} style={styles.spoolImg} resizeMode="contain" />
          </View>

          <Text style={styles.tempoLabel}>
            {isFever
              ? '🍃 Yılan Hızı: Dingin Slo-Mo (0.75x)'
              : '⚡ Yılan Hızı: Normal (1.0x)'}
          </Text>
          <Text style={styles.multiplierLabel}>
            {isFever ? 'Puan Çarpanı: 1.5x (Huzurlu Bonus)' : 'Puan Çarpanı: 1.0x'}
          </Text>
        </View>

        {/* Play Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.matchBtn}
            onPress={onMatchSuccess}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.matchBtnText}>Doğru Renk Eşleştir! (+1)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.missBtn}
            onPress={onMiss}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle" size={20} color="#991B1B" />
            <Text style={styles.missBtnText}>Kaçır</Text>
          </TouchableOpacity>
        </View>

        {isFever && (
          <TouchableOpacity style={styles.resetFeverBtn} onPress={resetFever}>
            <Text style={styles.resetFeverText}>Fever Modunu Sıfırla</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Note Tuner Tester Section */}
      <Text style={styles.sectionTitle}>🎶 Kalimba Akor Tınılarını Tek Tek Dinle</Text>
      <View style={styles.tunerCard}>
        {CHORD_NOTES.map((n, i) => (
          <TouchableOpacity
            key={i}
            style={styles.noteRow}
            onPress={() => {
              playAsmrComboTone(n.index);
              setActiveNoteText(`${n.name} • ${n.desc}`);
            }}
          >
            <View style={styles.noteIndexBox}>
              <Text style={styles.noteIndexText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.noteNameText}>{n.name} ({n.hz})</Text>
              <Text style={styles.noteDescText}>{n.desc}</Text>
            </View>
            <Text style={styles.playTag}>Dinle ▶</Text>
          </TouchableOpacity>
        ))}

        {/* Full Chord Row */}
        <TouchableOpacity
          style={styles.chordRow}
          onPress={() => {
            playAsmrFeverChord();
            setActiveNoteText('✨ Do-Mi-Sol-Do (Huzurlu Tam Akor)');
          }}
        >
          <View style={[styles.noteIndexBox, { backgroundColor: '#F59E0B' }]}>
            <Text style={[styles.noteIndexText, { color: '#fff' }]}>5+</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.noteNameText, { color: '#78350F' }]}>
              Do-Mi-Sol-Do (Tam Akor)
            </Text>
            <Text style={styles.noteDescText}>Yarn Fever Patlama & Slo-Mo Tınısı</Text>
          </View>
          <Text style={[styles.playTag, { color: '#B45309' }]}>Dinle ✨</Text>
        </TouchableOpacity>

        {/* Active Note Feedback */}
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackLabel}>Son Çalan Tını:</Text>
          <Text style={styles.feedbackVal}>{activeNoteText}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF8F0' },
  content: { padding: 16, paddingBottom: 40 },
  headerBox: { marginBottom: 14 },
  badge: {
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  badgeText: { color: '#065F46', fontSize: 11, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '900', color: '#451A03' },
  desc: { fontSize: 12, color: '#78350F', marginTop: 4, lineHeight: 18 },
  gameBoard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: '#EFEBE4',
    marginBottom: 20,
    elevation: 3,
  },
  gameBoardFever: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  gameBoardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreText: { fontSize: 16, fontWeight: '800', color: '#78350F' },
  comboBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  comboBadgeFever: { backgroundColor: '#F59E0B' },
  comboText: { fontSize: 12, fontWeight: '800', color: '#B45309' },
  comboTextFever: { color: '#fff' },
  centerStage: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  spoolAura: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  spoolAuraFever: {
    backgroundColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  spoolImg: { width: 60, height: 60 },
  tempoLabel: { fontSize: 13, fontWeight: '800', color: '#451A03' },
  multiplierLabel: { fontSize: 11, fontWeight: '800', color: '#059669', marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  matchBtn: {
    flex: 1,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  matchBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  missBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  missBtnText: { color: '#991B1B', fontSize: 12, fontWeight: '800' },
  resetFeverBtn: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  resetFeverText: { fontSize: 11, color: '#B45309', fontWeight: '800', textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#451A03', marginBottom: 10 },
  tunerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    borderColor: '#EFEBE4',
    borderWidth: 1.5,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDF8F0',
  },
  chordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  noteIndexBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteIndexText: { fontSize: 12, fontWeight: '800', color: '#B45309' },
  noteNameText: { fontSize: 13, fontWeight: '800', color: '#451A03' },
  noteDescText: { fontSize: 10, color: '#78350F' },
  playTag: { fontSize: 11, fontWeight: '800', color: '#D97706' },
  feedbackBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FDF8F0',
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  feedbackLabel: { fontSize: 11, fontWeight: '700', color: '#78350F' },
  feedbackVal: { fontSize: 11, fontWeight: '800', color: '#B45309' },
});
