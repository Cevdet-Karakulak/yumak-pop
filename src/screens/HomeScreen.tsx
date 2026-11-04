import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz, play } from '../audio';
import { HowToPlaySheet } from '../components/HowToPlayModal';
import { Bouncy, CoinBadge, FONT, RoundIcon, T, YarnButton } from '../components/ui';
import { TOTAL_LEVELS } from '../game/levels';
import { useSave } from '../save';
import { UI, YARN } from '../theme';
import { SettingsSheet } from './SettingsSheet';

const TITLE_COLORS = ['R', 'O', 'Y', 'G', 'B', 'P', 'K', 'T', 'R'];

interface TapParticle {
  id: number;
  icon: string;
  x: number;
  anim: Animated.Value;
}

export function HomeScreen({
  onPlay,
  onLevels,
  onPlayTutorial,
  onOpenLab,
  onWorkshop,
}: {
  onPlay: () => void;
  onLevels: () => void;
  onPlayTutorial: () => void;
  onOpenLab?: () => void;
  onWorkshop?: () => void;
}) {
  const { data, t } = useSave();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState(false);
  const [howTo, setHowTo] = useState(false);

  // Gentle idle breathing bob for mascot
  const bob = useRef(new Animated.Value(0)).current;
  const propBob = useRef(new Animated.Value(0)).current;

  // Mascot interactive squash & stretch
  const squashX = useRef(new Animated.Value(1)).current;
  const squashY = useRef(new Animated.Value(1)).current;

  // Tap burst particles
  const [particles, setParticles] = useState<TapParticle[]>([]);

  // Ambient drifting background craft particles
  const drift1 = useRef(new Animated.Value(0)).current;
  const drift2 = useRef(new Animated.Value(0)).current;
  const drift3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Idle mascot floating bob
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    bobLoop.start();

    // Side props gentle counter-bob
    const propLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(propBob, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(propBob, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    propLoop.start();

    // 2. Ambient drifting particles
    const createDrift = (val: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: 1,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: dur,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );

    const d1 = createDrift(drift1, 2800);
    const d2 = createDrift(drift2, 3400);
    const d3 = createDrift(drift3, 3100);
    d1.start();
    d2.start();
    d3.start();

    return () => {
      bobLoop.stop();
      propLoop.stop();
      d1.stop();
      d2.stop();
      d3.stop();
    };
  }, []);

  const onMascotTap = () => {
    play('pop');
    buzz('light');

    // Cheerful squash-and-stretch reaction
    Animated.sequence([
      Animated.parallel([
        Animated.timing(squashX, { toValue: 1.14, duration: 90, useNativeDriver: true }),
        Animated.timing(squashY, { toValue: 0.88, duration: 90, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(squashX, { toValue: 0.94, friction: 3, tension: 120, useNativeDriver: true }),
        Animated.spring(squashY, { toValue: 1.08, friction: 3, tension: 120, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(squashX, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.spring(squashY, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]),
    ]).start();

    // Spawn cute floating love & craft particles
    const icons = ['✨', '🧶', '💖', '⭐', '🧵'];
    const newItems: TapParticle[] = Array.from({ length: 4 }).map((_, idx) => {
      const anim = new Animated.Value(0);
      const id = Date.now() + Math.random() + idx;
      const x = (Math.random() - 0.5) * 120;
      const icon = icons[Math.floor(Math.random() * icons.length)];

      Animated.timing(anim, {
        toValue: 1,
        duration: 900 + Math.random() * 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      });

      return { id, icon, x, anim };
    });

    setParticles((prev) => [...prev.slice(-6), ...newItems]);
  };

  const onPropTap = (_label: string) => {
    play('pop');
    buzz('light');
  };

  const current = Math.min(data.unlocked, TOTAL_LEVELS);
  const totalStars = Object.values(data.stars).reduce((sum, s) => sum + (s || 0), 0);

  return (
    <View style={styles.root}>
      {/* Background Knitted Texture */}
      <Image
        source={require('../../assets/images/bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Floating Ambient Craft Sprinkles */}
      <Animated.View
        style={[
          styles.ambientParticle,
          {
            top: '15%',
            left: '8%',
            transform: [
              { translateY: drift1.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] }) },
              { rotate: drift1.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '10deg'] }) },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <T style={{ fontSize: 22, opacity: 0.8 }}>🧶</T>
      </Animated.View>

      <Animated.View
        style={[
          styles.ambientParticle,
          {
            top: '20%',
            right: '10%',
            transform: [
              { translateY: drift2.interpolate({ inputRange: [0, 1], outputRange: [10, -10] }) },
              { scale: drift2.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.2] }) },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <T style={{ fontSize: 20, opacity: 0.85 }}>✨</T>
      </Animated.View>

      <Animated.View
        style={[
          styles.ambientParticle,
          {
            bottom: '26%',
            left: '6%',
            transform: [
              { translateY: drift3.interpolate({ inputRange: [0, 1], outputRange: [-12, 10] }) },
              { rotate: drift3.interpolate({ inputRange: [0, 1], outputRange: ['12deg', '-8deg'] }) },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <T style={{ fontSize: 20, opacity: 0.75 }}>⭐</T>
      </Animated.View>

      <Animated.View
        style={[
          styles.ambientParticle,
          {
            bottom: '25%',
            right: '8%',
            transform: [
              { translateY: drift1.interpolate({ inputRange: [0, 1], outputRange: [8, -12] }) },
              { scale: drift1.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.1] }) },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <T style={{ fontSize: 22, opacity: 0.8 }}>🧵</T>
      </Animated.View>

      {/* Main Screen Content */}
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 6,
            paddingBottom: Math.max(insets.bottom, 16) + 6,
          },
        ]}
      >
        {/* Top Header Bar */}
        <View style={styles.top}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <RoundIcon icon="settings" onPress={() => setSettings(true)} />
            <RoundIcon icon="help-circle" onPress={() => setHowTo(true)} bg={UI.peach} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.topLevelPill}>
              <Ionicons name="ribbon" size={14} color={UI.coral} />
              <T style={styles.topLevelText}>
                {t.level} {current}
              </T>
            </View>
            <CoinBadge coins={data.coins} />
          </View>
        </View>

        {/* Yumak Pop Title */}
        <View style={{ alignItems: 'center', marginTop: 4 }}>
          <View style={{ flexDirection: 'row' }}>
            {t.title.split('').map((ch, i) => (
              <T
                key={i}
                style={{
                  fontFamily: FONT.black,
                  fontSize: 50,
                  lineHeight: 58,
                  color: ch === ' ' ? 'transparent' : YARN[TITLE_COLORS[i % TITLE_COLORS.length]].base,
                  textShadowColor: '#fff',
                  textShadowOffset: { width: 0, height: 3 },
                  textShadowRadius: 2,
                  transform: [{ rotate: `${i % 2 ? 4 : -4}deg` }],
                }}
              >
                {ch === ' ' ? '  ' : ch}
              </T>
            ))}
          </View>
          <T style={{ fontSize: 13.5, color: UI.plumLight, marginTop: 2, textAlign: 'center', paddingHorizontal: 24, lineHeight: 18 }}>
            {t.tagline}
          </T>
        </View>

        {/* Hero Interactive Mascot Area */}
        <View style={styles.mascotArea}>
          {/* Warm workshop ambient glow */}
          <View style={styles.mascotGlow} pointerEvents="none" />

          {/* Wooden craft pedestal mat under the mascot */}
          <View style={styles.pedestalMat} pointerEvents="none" />

          {/* Left Flanking Prop: Large Tilted Wood Yarn Spool */}
          <Animated.View
            style={[
              styles.leftPropWrap,
              {
                transform: [
                  { translateY: propBob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
                  { rotate: '-14deg' },
                ],
              },
            ]}
          >
            <Pressable onPress={() => onPropTap('spool')}>
              <Image
                source={require('../../assets/sprites/spool_B.png')}
                style={styles.flankingSpoolImg}
                resizeMode="contain"
              />
            </Pressable>
          </Animated.View>

          {/* Right Flanking Prop: Wicker Craft Basket with Colorful Wool */}
          <Animated.View
            style={[
              styles.rightPropWrap,
              {
                transform: [
                  { translateY: propBob.interpolate({ inputRange: [0, 1], outputRange: [-6, 2] }) },
                  { rotate: '10deg' },
                ],
              },
            ]}
          >
            <Pressable onPress={() => onPropTap('basket')}>
              <Image
                source={require('../../assets/sprites/wicker_basket.png')}
                style={styles.flankingBasketImg}
                resizeMode="contain"
              />
            </Pressable>
          </Animated.View>

          {/* Center Interactive Mascot Spool */}
          <Pressable onPress={onMascotTap} style={styles.mascotTouch}>
            <Animated.View
              style={[
                styles.mascotWrap,
                {
                  transform: [
                    { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
                    { scaleX: squashX },
                    { scaleY: squashY },
                  ],
                },
              ]}
            >
              <Image
                source={require('../../assets/images/mascot.png')}
                style={styles.mascotImg}
                resizeMode="contain"
              />
            </Animated.View>
          </Pressable>

          {/* Tap Burst Floating Particles */}
          {particles.map((p) => {
            const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -95] });
            const opacity = p.anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
            const scale = p.anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 1.3, 0.8] });

            return (
              <Animated.View
                key={p.id}
                style={[
                  styles.burstParticle,
                  {
                    transform: [
                      { translateX: p.x },
                      { translateY },
                      { scale },
                    ],
                    opacity,
                  },
                ]}
                pointerEvents="none"
              >
                <T style={{ fontSize: 28 }}>{p.icon}</T>
              </Animated.View>
            );
          })}
        </View>

        {/* Floating Bottom Button Group (Exactly as drawn by user) */}
        <View style={styles.buttonGroupWrap}>
          {/* Level Progress Pill */}
          <View style={styles.levelProgressPill}>
            <Ionicons name="ribbon" size={15} color={UI.coral} />
            <T style={styles.levelProgressText}>
              {t.level} {current}  •  ⭐ {totalStars} Yıldız
            </T>
          </View>

          {/* Top Wide Button: OYNA */}
          <YarnButton
            label={t.play.toUpperCase()}
            icon="play"
            color="coral"
            onPress={onPlay}
            style={styles.mainPlayBtn}
          />

          {/* Bottom Dual Buttons: Bölümler & Nasıl Oynanır: exact half-width each, perfectly aligned with OYNA */}
          <View style={styles.dualRow}>
            <View style={styles.halfBtnWrap}>
              <YarnButton
                small
                label={t.levels}
                icon="map"
                color="mint"
                onPress={onLevels}
                style={{ width: '100%' }}
              />
            </View>
            <View style={styles.halfBtnWrap}>
              <YarnButton
                small
                label={t.howToPlay}
                icon="book"
                color="sky"
                onPress={() => setHowTo(true)}
                style={{ width: '100%' }}
              />
            </View>
          </View>

          {/* Bobbin's Cozy Workshop Feature Button */}
          {Boolean(onWorkshop) && (
            <Bouncy
              onPress={onWorkshop}
              style={{
                width: '100%',
                backgroundColor: '#78350F',
                paddingVertical: 12,
                borderRadius: 20,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                marginTop: 8,
                borderWidth: 2,
                borderColor: '#FDE68A',
                elevation: 4,
              }}
            >
              <Ionicons name="home" size={18} color="#FDE68A" />
              <T style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                🪵 Bobbin'in Atölyesi
              </T>
              <View
                style={{
                  backgroundColor: '#FEF3C7',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 10,
                  marginLeft: 4,
                }}
              >
                <T style={{ color: '#92400E', fontSize: 11.5, fontWeight: 'bold' }}>
                  ⭐ {totalStars} Yıldız
                </T>
              </View>
            </Bouncy>
          )}
        </View>
      </View>

      <SettingsSheet visible={settings} onClose={() => setSettings(false)} onOpenLab={onOpenLab} />
      <HowToPlaySheet
        visible={howTo}
        onClose={() => setHowTo(false)}
        onReplayTutorial={onPlayTutorial}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topLevelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 38,
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#F3D5C1',
  },
  topLevelText: {
    fontFamily: FONT.black,
    fontSize: 13,
    color: UI.coral,
  },
  ambientParticle: {
    position: 'absolute',
    zIndex: 1,
  },
  mascotArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 230, 185, 0.48)',
  },
  pedestalMat: {
    position: 'absolute',
    bottom: 30,
    width: 250,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(168, 102, 48, 0.22)',
    transform: [{ scaleY: 0.6 }],
  },
  leftPropWrap: {
    position: 'absolute',
    left: '8%',
    bottom: 25,
    zIndex: 5,
  },
  flankingSpoolImg: {
    width: 82,
    height: 82,
  },
  rightPropWrap: {
    position: 'absolute',
    right: '8%',
    bottom: 22,
    zIndex: 5,
  },
  flankingBasketImg: {
    width: 88,
    height: 88,
  },
  mascotTouch: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  mascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImg: {
    width: 320,
    height: 310,
    maxWidth: '92%',
    maxHeight: 330,
  },
  burstParticle: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 25,
  },
  buttonGroupWrap: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    gap: 10,
  },
  levelProgressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
    gap: 6,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: '#F3D5C1',
    shadowColor: '#7B5A82',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  levelProgressText: {
    fontFamily: FONT.black,
    fontSize: 13,
    color: UI.plum,
  },
  mainPlayBtn: {
    width: '100%',
    height: 58,
  },
  dualRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    alignItems: 'center',
  },
  halfBtnWrap: {
    flex: 1,
  },
});
