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

const STATUS_STAGES = [
  { threshold: 0, text: 'Makaralar diziliyor...' },
  { threshold: 28, text: 'Yumaklar sarılıyor...' },
  { threshold: 58, text: 'İplikler hazırlanıyor...' },
  { threshold: 82, text: 'Örgü masası kuruluyor...' },
  { threshold: 99, text: 'Örgü dünyası hazır! 🎉' },
];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  anim: Animated.Value;
}

interface AnimatedSplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
}

export function AnimatedSplashScreen({ isReady, onFinish }: AnimatedSplashScreenProps) {
  const insets = useSafeAreaInsets();

  // Root fade out
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Mascot idle floating bob
  const mascotBob = useRef(new Animated.Value(0)).current;

  // Mascot interactive squash & stretch
  const squashX = useRef(new Animated.Value(1)).current;
  const squashY = useRef(new Animated.Value(1)).current;

  // Ambient halo glow pulse
  const haloPulse = useRef(new Animated.Value(1)).current;

  // Progress animation (0 to 100)
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [percentDisplay, setPercentDisplay] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_STAGES[0].text);

  // Tap burst particles
  const [particles, setParticles] = useState<Particle[]>([]);

  // 1. Idle Bobbing & Halo Pulse Animation
  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(mascotBob, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(mascotBob, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    bobLoop.start();

    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, {
          toValue: 1.12,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(haloPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    haloLoop.start();

    return () => {
      bobLoop.stop();
      haloLoop.stop();
    };
  }, []);

  // 2. Track Progress Listener for percent and label updates
  useEffect(() => {
    const listenerId = progressAnim.addListener(({ value }) => {
      const p = Math.floor(value);
      setPercentDisplay(p);
      for (let i = STATUS_STAGES.length - 1; i >= 0; i--) {
        if (p >= STATUS_STAGES[i].threshold) {
          setStatusText(STATUS_STAGES[i].text);
          break;
        }
      }
    });

    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, []);

  // 3. Drive Progress Fill (Smooth ~1.8s)
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 1850,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // needed for width interpolation
    }).start();
  }, []);

  // 4. Handle Completion and Exit Transition
  useEffect(() => {
    if (percentDisplay >= 100 && isReady) {
      const timer = setTimeout(() => {
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 380,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [percentDisplay, isReady]);

  // Interactive Mascot Tap Handler
  const handleMascotTap = () => {
    buzz('light');
    play('pop');

    // Bouncy squash & stretch
    squashX.setValue(1.18);
    squashY.setValue(0.82);
    Animated.parallel([
      Animated.spring(squashX, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.spring(squashY, {
        toValue: 1,
        friction: 4,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();

    // Spawn floating yarn particles
    const emojis = ['🧶', '🧵', '✨', '💖', '⭐'];
    const newBatch: Particle[] = [];
    const count = 5;

    for (let i = 0; i < count; i++) {
      const anim = new Animated.Value(0);
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const dist = 55 + Math.random() * 45;
      const px = Math.cos(angle) * dist;
      const py = Math.sin(angle) * dist - 25;

      const p: Particle = {
        id: Date.now() + i + Math.random(),
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: px,
        y: py,
        anim,
      };
      newBatch.push(p);

      Animated.timing(anim, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setParticles((prev) => prev.filter((item) => item.id !== p.id));
      });
    }

    setParticles((prev) => [...prev.slice(-10), ...newBatch]);
  };

  const translateY = mascotBob.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.root, { opacity: containerOpacity }]}>
      {/* Knitted Fabric Texture */}
      <Image
        source={require('../../assets/images/bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Ambient Gradient Glow */}
      <Animated.View
        style={[
          styles.ambientHalo,
          {
            transform: [{ scale: haloPulse }],
          },
        ]}
      />

      {/* Main Center Content */}
      <View style={[styles.contentContainer, { paddingTop: insets.top + 30 }]}>
        
        {/* Interactive 3D Mascot Spool */}
        <Pressable onPress={handleMascotTap} style={styles.mascotTouchArea}>
          <Animated.View
            style={[
              styles.mascotWrapper,
              {
                transform: [
                  { translateY },
                  { scaleX: squashX },
                  { scaleY: squashY },
                ],
              },
            ]}
          >
            {/* Halo Backdrop Circle */}
            <View style={styles.haloCircle} />

            <Image
              source={require('../../assets/images/mascot.png')}
              style={styles.mascotImage}
              resizeMode="contain"
            />

            {/* Tap Hint Pill */}
            <View style={styles.tapPill}>
              <Text style={styles.tapPillText}>🧶 Dokun!</Text>
            </View>
          </Animated.View>
        </Pressable>

        {/* Floating Particles */}
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
            outputRange: [0.6, 1.4],
          });

          return (
            <Animated.Text
              key={p.id}
              pointerEvents="none"
              style={[
                styles.particle,
                {
                  opacity: pOpacity,
                  transform: [
                    { translateX: transX },
                    { translateY: transY },
                    { scale: pScale },
                  ],
                },
              ]}
            >
              {p.emoji}
            </Animated.Text>
          );
        })}

        {/* Game Title with Individual Colorful Yarn Letters */}
        <View style={styles.titleRow}>
          {TITLE_LETTERS.map((item, idx) => (
            <Text key={idx} style={[styles.titleLetter, { color: item.color }]}>
              {item.char}
            </Text>
          ))}
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitleText}>Örgü Yılanını Çöz, İpleri Sar!</Text>
      </View>

      {/* Bottom Loading Progress Area */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
        
        {/* Status Stage & Percentage */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>{statusText}</Text>
          <Text style={styles.percentText}>%{percentDisplay}</Text>
        </View>

        {/* Knitted Bar Groove */}
        <View style={styles.barGroove}>
          <Animated.View style={[styles.barFill, { width: progressWidth }]}>
            {/* Rolling Mini Yarn Ball at the tip */}
            <View style={styles.tipYarnBall}>
              <Text style={styles.tipYarnEmoji}>🧶</Text>
            </View>
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
  ambientHalo: {
    position: 'absolute',
    top: '22%',
    alignSelf: 'center',
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(255, 122, 107, 0.15)',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mascotTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  haloCircle: {
    position: 'absolute',
    width: 175,
    height: 175,
    borderRadius: 88,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 4,
    borderColor: 'rgba(255, 217, 194, 0.9)',
    shadowColor: UI.coral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  mascotImage: {
    width: 185,
    height: 185,
  },
  tapPill: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: UI.white,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: UI.coral,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tapPillText: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 12,
    color: UI.coralDark,
  },
  particle: {
    position: 'absolute',
    fontSize: 22,
    alignSelf: 'center',
    top: '36%',
    zIndex: 100,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  titleLetter: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitleText: {
    fontFamily: 'Baloo2_600SemiBold',
    fontSize: 15,
    color: UI.plumLight,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  bottomContainer: {
    width: '100%',
    paddingHorizontal: 36,
    alignItems: 'center',
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
    height: 18,
    borderRadius: 9,
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
    borderRadius: 7,
    backgroundColor: UI.coral,
    position: 'relative',
  },
  tipYarnBall: {
    position: 'absolute',
    right: -10,
    top: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: UI.white,
    borderWidth: 1.5,
    borderColor: UI.coral,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  tipYarnEmoji: {
    fontSize: 11,
    lineHeight: 13,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    opacity: 0.65,
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: UI.coral,
  },
  brandSignature: {
    fontSize: 10,
    letterSpacing: 2.2,
    fontWeight: '700',
    color: UI.plumLight,
  },
});
