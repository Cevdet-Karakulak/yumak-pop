import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { buzz, playAsmrComboTone } from '../audio';
import { UI } from '../theme';
import { CoinBadge, FONT, T, YarnButton } from './ui';

interface VictoryModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  stars: number;
  coins: number;
  isDaily?: boolean;
  dailyBonusText?: string | null;
  coinsLabel: string;
  starsLabel: string;
  nextLabel: string;
  homeLabel: string;
  retryLabel: string;
  allDoneLabel: string;
  hasNextLevel: boolean;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

const CONFETTI_PIECES = [
  { color: '#FF6B8B', dx: -115, dy: -95, rot: '-25deg', size: 10 },
  { color: '#FFB800', dx: -80, dy: -125, rot: '35deg', size: 12 },
  { color: '#2EC4B6', dx: -40, dy: -135, rot: '-15deg', size: 9 },
  { color: '#7B61FF', dx: 45, dy: -135, rot: '25deg', size: 10 },
  { color: '#38BDF8', dx: 88, dy: -120, rot: '-40deg', size: 11 },
  { color: '#F59E0B', dx: 120, dy: -90, rot: '20deg', size: 9 },
  { color: '#10B981', dx: -130, dy: -35, rot: '45deg', size: 9 },
  { color: '#EC4899', dx: 132, dy: -38, rot: '-30deg', size: 10 },
  { color: '#FBBF24', dx: -95, dy: 20, rot: '15deg', size: 8 },
  { color: '#60A5FA', dx: 98, dy: 18, rot: '-20deg', size: 8 },
];

export function VictoryModal({
  visible,
  title,
  subtitle,
  stars,
  coins,
  isDaily,
  dailyBonusText,
  coinsLabel,
  starsLabel,
  nextLabel,
  homeLabel,
  retryLabel,
  allDoneLabel,
  hasNextLevel,
  onNext,
  onRetry,
  onHome,
}: VictoryModalProps) {
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const starScales = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const starTranslateY = useRef([
    new Animated.Value(-70),
    new Animated.Value(-90),
    new Animated.Value(-70),
  ]).current;
  const starRot = useRef([
    new Animated.Value(-0.45),
    new Animated.Value(0.35),
    new Animated.Value(0.45),
  ]).current;
  const ringScales = useRef([
    new Animated.Value(0.5),
    new Animated.Value(0.5),
    new Animated.Value(0.5),
  ]).current;
  const ringOpacities = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const pulseVal = useRef(new Animated.Value(1)).current;
  const haloRotate = useRef(new Animated.Value(0)).current;
  const confettiProg = useRef(new Animated.Value(0)).current;
  const rewardScale = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    if (!visible) return;

    // Reset all animated values
    cardScale.setValue(0.78);
    cardOpacity.setValue(0);
    rewardScale.setValue(0.75);
    confettiProg.setValue(0);
    pulseVal.setValue(1);
    haloRotate.setValue(0);

    for (let i = 0; i < 3; i++) {
      starScales[i].setValue(0);
      starTranslateY[i].setValue(i === 1 ? -85 : -65);
      starRot[i].setValue(i === 0 ? -0.45 : i === 1 ? 0.3 : 0.45);
      ringScales[i].setValue(0.5);
      ringOpacities[i].setValue(0);
    }

    // 1. Card entrance spring
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 90,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Confetti & Halo spin + Rewards pop
    Animated.timing(confettiProg, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(450),
      Animated.spring(rewardScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const haloLoop = Animated.loop(
      Animated.timing(haloRotate, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    haloLoop.start();

    // 3. Staggered swoop-in + bounce for each star (1, 2, 3)
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 3; i++) {
      const earned = stars >= i + 1;
      const delay = 140 + i * 210;
      const targetScale = i === 1 ? 1.18 : 1.0;

      const tId = setTimeout(() => {
        if (earned) {
          playAsmrComboTone(i + 1);
          buzz(i === 1 ? 'medium' : 'light');
          ringOpacities[i].setValue(0.95);
          ringScales[i].setValue(0.6);
          Animated.parallel([
            Animated.timing(ringScales[i], {
              toValue: 2.05,
              duration: 550,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacities[i], {
              toValue: 0,
              duration: 550,
              useNativeDriver: true,
            }),
          ]).start();
        }
      }, delay + 140);
      timers.push(tId);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.spring(starScales[i], {
            toValue: targetScale,
            friction: 4.5,
            tension: 130,
            useNativeDriver: true,
          }),
          Animated.spring(starTranslateY[i], {
            toValue: 0,
            friction: 5.5,
            tension: 110,
            useNativeDriver: true,
          }),
          Animated.spring(starRot[i], {
            toValue: 0,
            friction: 5,
            tension: 95,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }

    // 4. Continuous gentle rhythmic breathing pulse for earned stars
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(850),
        Animated.timing(pulseVal, {
          toValue: 1.12,
          duration: 650,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseVal, {
          toValue: 1.0,
          duration: 650,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => {
      timers.forEach(clearTimeout);
      haloLoop.stop();
      pulseLoop.stop();
    };
  }, [visible, stars]);

  if (!visible) return null;

  const haloSpin = haloRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.backdrop, StyleSheet.absoluteFill, { zIndex: 9600, elevation: 9600 }]} pointerEvents="auto">
      <Animated.View
        style={[
          styles.sheet,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }],
          },
        ]}
      >
        <View style={styles.sheetStitch} pointerEvents="none" />

        {/* Confetti Burst Particles */}
        <View style={styles.confettiOrigin} pointerEvents="none">
          {CONFETTI_PIECES.map((c, idx) => {
            const tx = confettiProg.interpolate({
              inputRange: [0, 1],
              outputRange: [0, c.dx],
            });
            const ty = confettiProg.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [20, c.dy, c.dy + 35],
            });
            const op = confettiProg.interpolate({
              inputRange: [0, 0.15, 0.75, 1],
              outputRange: [0, 1, 0.85, 0],
            });
            return (
              <Animated.View
                key={idx}
                style={[
                  styles.confettiDot,
                  {
                    width: c.size,
                    height: c.size * 0.65,
                    backgroundColor: c.color,
                    opacity: op,
                    transform: [{ translateX: tx }, { translateY: ty }, { rotate: c.rot }],
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Top Ribbon Trophy Header */}
        <View style={styles.ribbonBadge}>
          <Ionicons name="trophy" size={18} color="#92400E" />
          <T style={styles.ribbonTitle} numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </T>
        </View>

        {/* 3-Star Celebratory Stage with Halo Rays & Swooping/Pulsing Stars */}
        <View style={styles.starsStage}>
          <Animated.View style={[styles.haloGlow, { transform: [{ rotate: haloSpin }] }]} pointerEvents="none">
            <View style={styles.haloRay1} />
            <View style={styles.haloRay2} />
          </Animated.View>

          <View style={styles.winStarsRow}>
            {[1, 2, 3].map((starIdx) => {
              const idx = starIdx - 1;
              const earned = stars >= starIdx;
              const spinInterp = starRot[idx].interpolate({
                inputRange: [-1, 1],
                outputRange: ['-57deg', '57deg'],
              });
              const combinedScale = earned
                ? Animated.multiply(starScales[idx], pulseVal)
                : starScales[idx];

              return (
                <View key={starIdx} style={[styles.starSlot, starIdx === 2 && { marginTop: -16 }]}>
                  {/* Golden Landing Shockwave Ring */}
                  {earned && (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.starRingBurst,
                        {
                          opacity: ringOpacities[idx],
                          transform: [{ scale: ringScales[idx] }],
                        },
                      ]}
                    />
                  )}
                  <Animated.View
                    style={[
                      styles.winStarBadge,
                      starIdx === 2 && styles.winStarCenterBadge,
                      !earned && styles.winStarDimmed,
                      {
                        transform: [
                          { translateY: starTranslateY[idx] },
                          { scale: combinedScale },
                          { rotate: spinInterp },
                        ],
                      },
                    ]}
                  >
                    <Ionicons
                      name={earned ? 'star' : 'star-outline'}
                      size={starIdx === 2 ? 44 : 36}
                      color={earned ? '#FFB800' : '#A88E7B'}
                    />
                  </Animated.View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Subtitle & Daily Streak Notice */}
        <T style={styles.subtitleText}>{subtitle}</T>
        {isDaily && dailyBonusText && (
          <T style={styles.dailyBonusText}>{dailyBonusText}</T>
        )}

        {/* Animated Rewards Box */}
        <Animated.View style={[styles.rewardsCard, { transform: [{ scale: rewardScale }] }]}>
          <View style={styles.winStarCountPill}>
            <T style={styles.starRewardText}>
              ⭐ +{stars} {starsLabel}
            </T>
          </View>
          <View style={styles.rewardDivider} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <T style={styles.coinLabel}>{coinsLabel}</T>
            <CoinBadge coins={coins} />
          </View>
        </Animated.View>

        {/* Action Buttons */}
        {isDaily ? (
          <YarnButton
            label={homeLabel}
            icon="home"
            color="mint"
            onPress={onHome}
            style={{ alignSelf: 'stretch', width: '100%' }}
          />
        ) : hasNextLevel ? (
          <YarnButton
            label={nextLabel}
            icon="play"
            color="mint"
            onPress={onNext}
            style={{ alignSelf: 'stretch', width: '100%' }}
          />
        ) : (
          <T style={{ textAlign: 'center', marginBottom: 10 }}>{allDoneLabel}</T>
        )}

        <View style={{ flexDirection: 'row', marginTop: 12, gap: 10, width: '100%', alignSelf: 'stretch' }}>
          <YarnButton small label={retryLabel} icon="refresh" color="sky" onPress={onRetry} style={{ flex: 1 }} />
          <YarnButton small label={homeLabel} icon="home" color="plum" onPress={onHome} style={{ flex: 1 }} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 22, 46, 0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 410,
    backgroundColor: UI.cream,
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FDBA74',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 16,
  },
  sheetStitch: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FDBA74',
    borderStyle: 'dashed',
    opacity: 0.7,
  },
  confettiOrigin: {
    position: 'absolute',
    top: 85,
    alignSelf: 'center',
    zIndex: 30,
  },
  confettiDot: {
    position: 'absolute',
    borderRadius: 4,
  },
  ribbonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 8,
  },
  ribbonTitle: {
    fontFamily: FONT.black,
    fontSize: 22,
    color: '#78350F',
  },
  starsStage: {
    width: '100%',
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  haloGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(253, 224, 71, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloRay1: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.24)',
  },
  haloRay2: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.24)',
    transform: [{ rotate: '45deg' }],
  },
  winStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  starSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starRingBurst: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3.5,
    borderColor: '#FBBF24',
  },
  winStarBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFBEB',
    borderWidth: 3,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  winStarCenterBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3.5,
    borderColor: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  winStarDimmed: {
    opacity: 0.36,
    backgroundColor: '#F5EBE0',
    borderColor: '#C5B0A0',
    shadowOpacity: 0.05,
  },
  subtitleText: {
    marginTop: 2,
    marginBottom: 8,
    color: UI.plumLight,
    textAlign: 'center',
    fontSize: 13.5,
  },
  dailyBonusText: {
    marginBottom: 8,
    color: UI.coralDark,
    textAlign: 'center',
    fontFamily: FONT.black,
  },
  rewardsCard: {
    width: '100%',
    backgroundColor: '#FFF8EC',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#FDE68A',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  winStarCountPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FBBF24',
  },
  starRewardText: {
    fontFamily: FONT.black,
    fontSize: 14,
    color: '#92400E',
  },
  rewardDivider: {
    width: '75%',
    height: 1,
    backgroundColor: '#FDE68A',
  },
  coinLabel: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: UI.plum,
  },
});
