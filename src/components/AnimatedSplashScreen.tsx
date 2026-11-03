import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz, play } from '../audio';
import { useSave } from '../save';
import { UI, YARN } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TITLE_LETTERS = [
  { char: 'Y', color: YARN.R.base },
  { char: 'u', color: YARN.O.base },
  { char: 'm', color: YARN.Y.base },
  { char: 'a', color: YARN.T.base },
  { char: 'k', color: YARN.B.base },
  { char: ' ', color: 'transparent' },
  { char: 'P', color: YARN.K.base },
  { char: 'o', color: YARN.P.base },
  { char: 'p', color: YARN.G.base },
];

const STATUS_STAGES_BY_LANG: Record<string, { threshold: number; text: string }[]> = {
  tr: [
    { threshold: 0, text: 'Makaralar diziliyor...' },
    { threshold: 25, text: 'Yumaklar sarılıyor...' },
    { threshold: 55, text: 'İplikler hazırlanıyor...' },
    { threshold: 80, text: 'Örgü masası kuruluyor...' },
    { threshold: 99, text: 'Örgü dünyası hazır! 🎉' },
  ],
  en: [
    { threshold: 0, text: 'Aligning spools...' },
    { threshold: 25, text: 'Winding yarn balls...' },
    { threshold: 55, text: 'Preparing colorful threads...' },
    { threshold: 80, text: 'Setting up knitting table...' },
    { threshold: 99, text: 'Knitting world ready! 🎉' },
  ],
  de: [
    { threshold: 0, text: 'Spulen werden angeordnet...' },
    { threshold: 25, text: 'Wollknäuel werden gewickelt...' },
    { threshold: 55, text: 'Bunte Fäden werden vorbereitet...' },
    { threshold: 80, text: 'Stricktisch wird vorbereitet...' },
    { threshold: 99, text: 'Strickwelt bereit! 🎉' },
  ],
  es: [
    { threshold: 0, text: 'Alineando carretes...' },
    { threshold: 25, text: 'Enrollando ovillos de lana...' },
    { threshold: 55, text: 'Preparando hilos de colores...' },
    { threshold: 80, text: 'Preparando mesa de tejido...' },
    { threshold: 99, text: '¡Mundo de tejido listo! 🎉' },
  ],
  fr: [
    { threshold: 0, text: 'Alignement des bobines...' },
    { threshold: 25, text: 'Enroulement des pelotes de laine...' },
    { threshold: 55, text: 'Préparation des fils colorés...' },
    { threshold: 80, text: 'Préparation de la table à tricoter...' },
    { threshold: 99, text: 'Monde du tricot prêt ! 🎉' },
  ],
  it: [
    { threshold: 0, text: 'Allineamento rocchetti...' },
    { threshold: 25, text: 'Avvolgimento gomitoli di lana...' },
    { threshold: 55, text: 'Preparazione fili colorati...' },
    { threshold: 80, text: 'Allestimento tavolo da maglia...' },
    { threshold: 99, text: 'Mondo della maglia pronto! 🎉' },
  ],
  pt: [
    { threshold: 0, text: 'Alinhando carretéis...' },
    { threshold: 25, text: 'Enrolando novelos de lã...' },
    { threshold: 55, text: 'Preparando fios coloridos...' },
    { threshold: 80, text: 'Montando mesa de tricô...' },
    { threshold: 99, text: 'Mundo do tricô pronto! 🎉' },
  ],
  ru: [
    { threshold: 0, text: 'Расстановка катушек...' },
    { threshold: 25, text: 'Сматывание клубков пряжи...' },
    { threshold: 55, text: 'Подготовка цветных нитей...' },
    { threshold: 80, text: 'Обустройство стола для вязания...' },
    { threshold: 99, text: 'Мир вязания готов! 🎉' },
  ],
  ja: [
    { threshold: 0, text: '糸巻きを配置中...' },
    { threshold: 25, text: '毛糸玉を巻き巻き中...' },
    { threshold: 55, text: 'カラフルな糸を準備中...' },
    { threshold: 80, text: '編み物テーブルをセッティング中...' },
    { threshold: 99, text: '編み物の世界が準備完了！🎉' },
  ],
  ko: [
    { threshold: 0, text: '실타래 정렬 중...' },
    { threshold: 25, text: '실뭉치 감는 중...' },
    { threshold: 55, text: '색색의 실 준비 중...' },
    { threshold: 80, text: '뜨개질 테이블 세팅 중...' },
    { threshold: 99, text: '뜨개질 세계 준비 완료! 🎉' },
  ],
  zh: [
    { threshold: 0, text: '线轴排列中...' },
    { threshold: 25, text: '毛线球缠绕中...' },
    { threshold: 55, text: '准备彩色毛线...' },
    { threshold: 80, text: '搭建编织桌...' },
    { threshold: 99, text: '编织世界已就绪！🎉' },
  ],
  ar: [
    { threshold: 0, text: 'ترتيب البكرات...' },
    { threshold: 25, text: 'لف كرات الصوف...' },
    { threshold: 55, text: 'تجهيز الخيوط الملونة...' },
    { threshold: 80, text: 'إعداد طاولة الحياكة...' },
    { threshold: 99, text: 'عالم الحياكة جاهز! 🎉' },
  ],
};

const TAP_HINTS: Record<string, string> = {
  tr: '✨ Yumağa Dokun!',
  en: '✨ Tap Yarn!',
  de: '✨ Wolle antippen!',
  es: '✨ ¡Toca la lana!',
  fr: '✨ Touchez la laine !',
  it: '✨ Tocca la lana!',
  pt: '✨ Toque no novelo!',
  ru: '✨ Нажми на пряжу!',
  ja: '✨ 毛糸をタップ！',
  ko: '✨ 실뭉치 탭하기!',
  zh: '✨ 点击毛线球！',
  ar: '✨ انقر على الصوف!',
};

// Ambient drifting craft particles
const AMBIENT_PARTICLES = [
  { id: 1, emoji: '✨', x: '18%', y: '26%', size: 18, delay: 0 },
  { id: 2, emoji: '🧵', x: '82%', y: '32%', size: 22, delay: 400 },
  { id: 3, emoji: '🧶', x: '12%', y: '58%', size: 24, delay: 800 },
  { id: 4, emoji: '⭐', x: '84%', y: '62%', size: 16, delay: 600 },
  { id: 5, emoji: '💖', x: '24%', y: '78%', size: 18, delay: 1000 },
];

interface TapBurstParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  anim: Animated.Value;
  rot: Animated.Value;
}

interface AnimatedSplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

export function AnimatedSplashScreen({ isReady, onFinish }: AnimatedSplashScreenProps) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useSave();
  const stages = STATUS_STAGES_BY_LANG[lang] ?? STATUS_STAGES_BY_LANG.en;

  // Root container opacity for fade out
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Mascot idle animations: float + tilt wobble
  const mascotBob = useRef(new Animated.Value(0)).current;
  const mascotTilt = useRef(new Animated.Value(0)).current;

  // Mascot interactive squash & stretch
  const squashX = useRef(new Animated.Value(1)).current;
  const squashY = useRef(new Animated.Value(1)).current;

  // Expanding aura ripples
  const auraScale1 = useRef(new Animated.Value(1)).current;
  const auraOpacity1 = useRef(new Animated.Value(0.7)).current;
  const auraScale2 = useRef(new Animated.Value(1)).current;
  const auraOpacity2 = useRef(new Animated.Value(0.5)).current;

  // Tap shockwave ring
  const shockwaveScale = useRef(new Animated.Value(0)).current;
  const shockwaveOpacity = useRef(new Animated.Value(0)).current;

  // Progress animation (0 to 100)
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [percentDisplay, setPercentDisplay] = useState(0);
  const [statusText, setStatusText] = useState(stages[0].text);

  // Shimmer streak across the loading bar
  const shimmerTranslate = useRef(new Animated.Value(-100)).current;

  // Staggered title letters bounce wave
  const letterBounces = useRef(TITLE_LETTERS.map(() => new Animated.Value(0))).current;

  // Tap burst particles
  const [particles, setParticles] = useState<TapBurstParticle[]>([]);

  // Flanking mini-props idle float
  const propFloat = useRef(new Animated.Value(0)).current;

  // 1. Core Idle Loop Animations
  useEffect(() => {
    // Mascot floating bob
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mascotBob, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(mascotBob, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    // Mascot gentle 3D tilt wobble
    const tiltLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mascotTilt, {
          toValue: 1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(mascotTilt, {
          toValue: -1,
          duration: 2100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    // Side props gentle float
    const propLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(propFloat, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(propFloat, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    // Concentric Aura 1 Ripple
    const aura1Loop = Animated.loop(
      Animated.parallel([
        Animated.timing(auraScale1, {
          toValue: 1.35,
          duration: 2200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(auraOpacity1, {
            toValue: 0.8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(auraOpacity1, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    // Concentric Aura 2 Ripple (delayed)
    const aura2Timer = setTimeout(() => {
      const aura2Loop = Animated.loop(
        Animated.parallel([
          Animated.timing(auraScale2, {
            toValue: 1.5,
            duration: 2400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(auraOpacity2, {
              toValue: 0.6,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(auraOpacity2, {
              toValue: 0,
              duration: 1900,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      aura2Loop.start();
    }, 900);

    // Bar Shimmer loop
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerTranslate, {
          toValue: SCREEN_WIDTH,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.delay(600),
        Animated.timing(shimmerTranslate, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    // Title Letters Wave Cascade
    const waveAnimations = letterBounces.map((val, idx) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(idx * 85),
          Animated.timing(val, {
            toValue: -10,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 340,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.delay(2000 - idx * 85),
        ]),
      ),
    );

    bobLoop.start();
    tiltLoop.start();
    propLoop.start();
    aura1Loop.start();
    shimmerLoop.start();
    waveAnimations.forEach((a) => a.start());

    return () => {
      bobLoop.stop();
      tiltLoop.stop();
      propLoop.stop();
      aura1Loop.stop();
      clearTimeout(aura2Timer);
      shimmerLoop.stop();
      waveAnimations.forEach((a) => a.stop());
    };
  }, []);

  // 2. Drive Progress Fill & Track Listener
  useEffect(() => {
    const listenerId = progressAnim.addListener(({ value }) => {
      const p = Math.floor(value);
      setPercentDisplay(p);
      for (let i = stages.length - 1; i >= 0; i--) {
        if (p >= stages[i].threshold) {
          setStatusText(stages[i].text);
          break;
        }
      }
    });

    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 1950,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, []);

  // 3. Complete and Transition Out
  useEffect(() => {
    if (percentDisplay >= 100 && isReady) {
      const timer = setTimeout(() => {
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [percentDisplay, isReady]);

  // 4. Interactive Mascot Tap with Shockwave & Burst Fireworks
  const handleMascotTap = () => {
    buzz('light');
    play('pop');

    // Trigger expanding shockwave ring
    shockwaveScale.setValue(0.7);
    shockwaveOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(shockwaveScale, {
        toValue: 2.2,
        duration: 550,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(shockwaveOpacity, {
        toValue: 0,
        duration: 550,
        useNativeDriver: true,
      }),
    ]).start();

    // Squash & stretch
    squashX.setValue(1.22);
    squashY.setValue(0.78);
    Animated.parallel([
      Animated.spring(squashX, {
        toValue: 1,
        friction: 3.5,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.spring(squashY, {
        toValue: 1,
        friction: 3.5,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();

    // Spawn 7 multi-colored floating particles
    const emojis = ['🧶', '🧵', '✨', '💖', '⭐', '🌟', '🎉'];
    const newBatch: TapBurstParticle[] = [];
    const count = 7;

    for (let i = 0; i < count; i++) {
      const anim = new Animated.Value(0);
      const rot = new Animated.Value(0);
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 65 + Math.random() * 55;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist - 30;

      const p: TapBurstParticle = {
        id: Date.now() + i + Math.random(),
        emoji: emojis[i % emojis.length],
        x: px,
        y: py,
        anim,
        rot,
      };
      newBatch.push(p);

      Animated.parallel([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rot, {
          toValue: (Math.random() > 0.5 ? 1 : -1) * 360,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setParticles((prev) => prev.filter((item) => item.id !== p.id));
      });
    }

    setParticles((prev) => [...prev.slice(-14), ...newBatch]);
  };

  // Interpolations
  const translateY = mascotBob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  const rotateZ = mascotTilt.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-3.5deg', '3.5deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // The mini yarn ball spins continuously as it travels! (0 -> 1440 deg)
  const tipYarnSpin = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0deg', '1440deg'],
  });

  const propTransY = propFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View style={[styles.root, { opacity: containerOpacity }]}>
      {/* Knitted Fabric Texture */}
      <Image
        source={require('../../assets/images/bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Floating Ambient Craft Sprinkles */}
      {AMBIENT_PARTICLES.map((item) => (
        <Animated.View
          key={item.id}
          pointerEvents="none"
          style={[
            styles.ambientParticle,
            {
              left: item.x as any,
              top: item.y as any,
              transform: [{ translateY: propTransY }],
            },
          ]}
        >
          <Text style={{ fontSize: item.size, opacity: 0.55 }}>{item.emoji}</Text>
        </Animated.View>
      ))}

      {/* Main Center Content */}
      <View style={[styles.contentContainer, { paddingTop: insets.top + 20 }]}>
        
        {/* Flanking Left Mini Wooden Spool */}
        <Animated.View
          style={[
            styles.flankingLeftProp,
            { transform: [{ translateY: propTransY }, { rotate: '-12deg' }] },
          ]}
        >
          <Image
            source={require('../../assets/sprites/spool_B.png')}
            style={styles.flankingSpoolImg}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Flanking Right Mini Wicker Craft Basket */}
        <Animated.View
          style={[
            styles.flankingRightProp,
            { transform: [{ translateY: propTransY }, { rotate: '12deg' }] },
          ]}
        >
          <Image
            source={require('../../assets/sprites/wicker_basket.png')}
            style={styles.flankingBasketImg}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Tap Shockwave Ripple */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shockwaveRing,
            {
              transform: [{ scale: shockwaveScale }],
              opacity: shockwaveOpacity,
            },
          ]}
        />

        {/* Interactive 3D Mascot Spool (Completely transparent backdrop) */}
        <Pressable onPress={handleMascotTap} style={styles.mascotTouchArea}>
          <Animated.View
            style={[
              styles.mascotWrapper,
              {
                transform: [
                  { translateY },
                  { rotate: rotateZ },
                  { scaleX: squashX },
                  { scaleY: squashY },
                ],
              },
            ]}
          >
            {/* Subtle Natural Ground Shadow */}
            <View style={styles.mascotGroundShadow} />

            <Image
              source={require('../../assets/images/mascot.png')}
              style={styles.mascotImage}
              resizeMode="contain"
            />

            {/* Tap Hint Pill with Pulsing Star */}
            <View style={styles.tapPill}>
              <Text style={styles.tapPillText}>{TAP_HINTS[lang] ?? TAP_HINTS.en}</Text>
            </View>
          </Animated.View>
        </Pressable>

        {/* Floating Tap Burst Particles */}
        {particles.map((p) => {
          const transX = p.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, p.x],
          });
          const transY = p.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, p.y],
          });
          const pOpacity = p.anim.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [1, 0.9, 0],
          });
          const pScale = p.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1.5],
          });
          const pRot = p.rot.interpolate({
            inputRange: [-360, 360],
            outputRange: ['-360deg', '360deg'],
          });

          return (
            <Animated.Text
              key={p.id}
              pointerEvents="none"
              style={[
                styles.burstParticle,
                {
                  opacity: pOpacity,
                  transform: [
                    { translateX: transX },
                    { translateY: transY },
                    { scale: pScale },
                    { rotate: pRot },
                  ],
                },
              ]}
            >
              {p.emoji}
            </Animated.Text>
          );
        })}

        {/* Staggered Animated Title Letters */}
        <View style={styles.titleRow}>
          {TITLE_LETTERS.map((item, idx) => (
            <Animated.Text
              key={idx}
              style={[
                styles.titleLetter,
                {
                  color: item.color,
                  transform: [{ translateY: letterBounces[idx] }],
                },
              ]}
            >
              {item.char}
            </Animated.Text>
          ))}
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitleText}>{t.tagline}</Text>
      </View>

      {/* Bottom Loading Progress Area */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
        
        {/* Status Stage & Percentage */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{statusText}</Text>
          <Text style={styles.percentText}>{lang === 'tr' ? `%${percentDisplay}` : `${percentDisplay}%`}</Text>
        </View>

        {/* Knitted Bar Groove */}
        <View style={styles.barGroove}>
          {/* Animated Fill Bar */}
          <Animated.View style={[styles.barFill, { width: progressWidth }]}>
            
            {/* Shimmer Light Streak across bar */}
            <Animated.View
              style={[
                styles.shimmerStreak,
                {
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            />

            {/* Spinning & Rolling Mini Yarn Ball at the tip */}
            <Animated.View
              style={[
                styles.tipYarnBall,
                {
                  transform: [{ rotate: tipYarnSpin }],
                },
              ]}
            >
              <Text style={styles.tipYarnEmoji}>🧶</Text>
            </Animated.View>
          </Animated.View>
        </View>

        {/* FloppaTech Corporate Studio Signature */}
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandSignature}>FLOPPATECH CORP</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    backgroundColor: UI.cream,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  ambientParticle: {
    position: 'absolute',
    zIndex: 5,
  },
  flankingLeftProp: {
    position: 'absolute',
    left: 20,
    top: '38%',
    opacity: 0.85,
    zIndex: 10,
  },
  flankingSpoolImg: {
    width: 58,
    height: 58,
  },
  flankingRightProp: {
    position: 'absolute',
    right: 20,
    top: '37%',
    opacity: 0.85,
    zIndex: 10,
  },
  flankingBasketImg: {
    width: 66,
    height: 66,
  },
  shockwaveRing: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: UI.coral,
    zIndex: 8,
  },
  mascotTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    zIndex: 20,
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotGroundShadow: {
    position: 'absolute',
    bottom: 12,
    width: 140,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 58, 94, 0.16)',
    transform: [{ scaleY: 0.6 }],
  },
  mascotImage: {
    width: 215,
    height: 215,
  },
  tapPill: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: UI.white,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: UI.coral,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  tapPillText: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 12,
    color: UI.coralDark,
  },
  burstParticle: {
    position: 'absolute',
    fontSize: 24,
    alignSelf: 'center',
    top: '40%',
    zIndex: 100,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    zIndex: 25,
  },
  titleLetter: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 15,
    color: UI.plumLight,
    marginTop: 4,
    letterSpacing: 0.3,
    zIndex: 25,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 36,
    alignItems: 'center',
    zIndex: 30,
  },
  statusRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  statusLabel: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 14,
    color: UI.plum,
  },
  percentText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: UI.coral,
  },
  barGroove: {
    width: '100%',
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(91, 58, 94, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255, 217, 194, 0.95)',
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
    padding: 1.5,
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: UI.coral,
    position: 'relative',
    overflow: 'visible',
  },
  shimmerStreak: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 8,
  },
  tipYarnBall: {
    position: 'absolute',
    right: -12,
    top: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: UI.white,
    borderWidth: 1.5,
    borderColor: UI.coral,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tipYarnEmoji: {
    fontSize: 13,
    lineHeight: 15,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    opacity: 0.7,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UI.coral,
  },
  brandSignature: {
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: '700',
    color: UI.plumLight,
  },
});
