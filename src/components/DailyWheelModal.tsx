import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { buzz, play } from '../audio';
import { BoosterKind, todayKey, useSave } from '../save';
import { showAdMobInterstitial } from '../services/adService';
import { UI } from '../theme';
import { InterstitialAdModal } from './InterstitialAdModal';
import { FONT, RoundIcon, T, YarnButton } from './ui';

type Prize =
  | { kind: 'coins'; amount: number }
  | { kind: 'stars'; amount: number }
  | { kind: 'booster'; booster: BoosterKind; amount: number };

interface Slice {
  prize: Prize;
  weight: number;
  color: string;
  icon: string;
  label: string;
}

// Clockwise from the top pointer. Warm yarn palette alternating light/dark.
const SLICES: Slice[] = [
  { prize: { kind: 'coins', amount: 30 }, weight: 22, color: '#FFD9C2', icon: '🪙', label: '30' },
  { prize: { kind: 'booster', booster: 'undo', amount: 1 }, weight: 14, color: '#FF9A85', icon: '↩️', label: '+1' },
  { prize: { kind: 'coins', amount: 60 }, weight: 16, color: '#FFE07A', icon: '🪙', label: '60' },
  { prize: { kind: 'stars', amount: 2 }, weight: 10, color: '#A985B0', icon: '⭐', label: '+2' },
  { prize: { kind: 'booster', booster: 'slot', amount: 1 }, weight: 12, color: '#8EE6C2', icon: '➕', label: '+1' },
  { prize: { kind: 'coins', amount: 100 }, weight: 10, color: '#9FD8FF', icon: '🪙', label: '100' },
  { prize: { kind: 'booster', booster: 'magnet', amount: 1 }, weight: 10, color: '#FF9A85', icon: '🧲', label: '+1' },
  { prize: { kind: 'coins', amount: 250 }, weight: 6, color: '#FFC23C', icon: '💰', label: '250' },
];

const SLICE_DEG = 360 / SLICES.length;

function pickSlice(): number {
  const total = SLICES.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SLICES.length; i++) {
    r -= SLICES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

function slicePath(i: number, r: number, cx: number, cy: number): string {
  const a0 = ((i * SLICE_DEG - SLICE_DEG / 2 - 90) * Math.PI) / 180;
  const a1 = ((i * SLICE_DEG + SLICE_DEG / 2 - 90) * Math.PI) / 180;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

export function canSpinFree(lastFree?: string): boolean {
  return lastFree !== todayKey();
}

export function DailyWheelModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data, update, t } = useSave();
  const rot = useRef(new Animated.Value(0)).current;
  const rotDeg = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<Slice | null>(null);
  const [fallbackAd, setFallbackAd] = useState(false);

  const today = todayKey();
  const freeReady = data.wheelLastFree !== today;
  const adReady = !freeReady && data.wheelAdSpinDate !== today;

  useEffect(() => {
    if (!visible) {
      setWon(null);
      setSpinning(false);
    }
  }, [visible]);

  const grant = (s: Slice) => {
    const p = s.prize;
    update((d) => {
      if (p.kind === 'coins') return { ...d, coins: d.coins + p.amount };
      if (p.kind === 'stars') return { ...d, bonusStars: (d.bonusStars || 0) + p.amount };
      return { ...d, boosters: { ...d.boosters, [p.booster]: d.boosters[p.booster] + p.amount } };
    });
  };

  const spin = (source: 'free' | 'ad') => {
    if (spinning) return;
    const idx = pickSlice();
    setWon(null);
    setSpinning(true);
    // Mark the spin as consumed up front so closing mid-spin can't re-roll.
    update((d) => (source === 'free' ? { ...d, wheelLastFree: today } : { ...d, wheelAdSpinDate: today }));
    play('button');

    const jitter = (Math.random() - 0.5) * (SLICE_DEG * 0.6);
    const current = rotDeg.current % 360;
    const target = rotDeg.current - current + 360 * 6 + (360 - idx * SLICE_DEG) + jitter;
    rotDeg.current = target;

    Animated.timing(rot, {
      toValue: target,
      duration: 4200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const s = SLICES[idx];
      grant(s);
      setWon(s);
      setSpinning(false);
      play('win');
      buzz('success');
    });
  };

  const spinWithAd = () => {
    if (spinning) return;
    const shown = showAdMobInterstitial(
      () => spin('ad'),
      () => setFallbackAd(true),
    );
    if (!shown) setFallbackAd(true);
  };

  const prizeText = (s: Slice) => {
    const p = s.prize;
    if (p.kind === 'coins') return `🪙 ${p.amount}`;
    if (p.kind === 'stars') return `⭐ ${p.amount} ${t.wheelStars}`;
    return `${s.icon} ${t[p.booster]} +${p.amount}`;
  };

  if (!visible) return null;

  const SIZE = 280;
  const R = SIZE / 2 - 8;
  const C = SIZE / 2;
  const spinInterp = rot.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => { if (!spinning) onClose(); }}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.stitch} pointerEvents="none" />
          {!spinning && (
            <View style={{ position: 'absolute', right: 10, top: 10, zIndex: 10 }}>
              <RoundIcon icon="close" onPress={onClose} size={38} bg={UI.peach} />
            </View>
          )}
          <T style={styles.title}>🎡 {t.wheelTitle}</T>

          <View style={{ width: SIZE, height: SIZE + 14, alignItems: 'center' }}>
            {/* Pointer */}
            <View style={styles.pointer}>
              <Ionicons name="caret-down" size={40} color={UI.coralDark} />
            </View>
            <Animated.View style={{ width: SIZE, height: SIZE, marginTop: 14, transform: [{ rotate: spinInterp }] }}>
              <Svg width={SIZE} height={SIZE}>
                <Circle cx={C} cy={C} r={R + 6} fill="#A86F3A" />
                <G>
                  {SLICES.map((s, i) => (
                    <Path key={i} d={slicePath(i, R, C, C)} fill={s.color} stroke="#FFF6EA" strokeWidth={2} />
                  ))}
                </G>
                <Circle cx={C} cy={C} r={26} fill="#5B3A5E" stroke="#FFC93C" strokeWidth={4} />
              </Svg>
              {SLICES.map((s, i) => {
                const a = ((i * SLICE_DEG - 90) * Math.PI) / 180;
                const lr = R * 0.66;
                return (
                  <View
                    key={`l${i}`}
                    pointerEvents="none"
                    style={[
                      styles.sliceLabel,
                      {
                        left: C + lr * Math.cos(a) - 30,
                        top: C + lr * Math.sin(a) - 24,
                        transform: [{ rotate: `${i * SLICE_DEG}deg` }],
                      },
                    ]}
                  >
                    <Text style={styles.sliceIcon}>{s.icon}</Text>
                    <Text style={styles.sliceText}>{s.label}</Text>
                  </View>
                );
              })}
            </Animated.View>
          </View>

          <View style={{ minHeight: 40, justifyContent: 'center', marginTop: 6 }}>
            {won ? (
              <T style={styles.wonText}>
                {t.wheelWon} {prizeText(won)}
              </T>
            ) : (
              <T style={styles.hint}>{freeReady ? t.wheelReady : adReady ? '' : t.wheelComeBack}</T>
            )}
          </View>

          {freeReady ? (
            <YarnButton label={t.wheelSpin} icon="sync" color="gold" onPress={() => spin('free')} disabled={spinning} style={styles.btn} />
          ) : adReady ? (
            <YarnButton small label={t.wheelSpinAd} color="plum" onPress={spinWithAd} disabled={spinning} style={styles.btn} />
          ) : (
            <YarnButton small label={t.wheelCollect} icon="checkmark" color="mint" onPress={onClose} disabled={spinning} style={styles.btn} />
          )}
        </View>

        <InterstitialAdModal
          visible={fallbackAd}
          isRewarded
          onClose={() => {
            setFallbackAd(false);
            spin('ad');
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(60,35,62,0.6)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: UI.cream,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 22,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: UI.peach,
  },
  stitch: { position: 'absolute', top: 6, left: 6, right: 6, bottom: 6, borderRadius: 24, borderWidth: 2, borderColor: '#F2B79B', borderStyle: 'dashed' },
  title: { fontFamily: FONT.black, fontSize: 28, color: UI.plum, marginBottom: 4 },
  pointer: { position: 'absolute', top: -6, zIndex: 5 },
  sliceLabel: { position: 'absolute', width: 60, height: 48, alignItems: 'center', justifyContent: 'center' },
  sliceIcon: { fontSize: 20 },
  sliceText: { fontSize: 15, fontWeight: '900', color: '#3D1D09' },
  wonText: { fontFamily: FONT.black, fontSize: 20, color: UI.coralDark, textAlign: 'center' },
  hint: { fontSize: 14, color: UI.plumLight, textAlign: 'center' },
  btn: { alignSelf: 'stretch', width: '100%', marginTop: 6 },
});
