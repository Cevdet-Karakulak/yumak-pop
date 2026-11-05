import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { pauseMusic, play, syncMusic } from '../audio';
import { FONT, T, YarnButton } from './ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  isRewarded?: boolean;
}

export function InterstitialAdModal({
  visible,
  onClose,
  title = 'Sponsorlu Reklam',
  isRewarded = false,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(3);
  const [canClose, setCanClose] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setSecondsLeft(3);
      setCanClose(false);
      progressAnim.setValue(0);
      return;
    }

    // Pause game music while ad plays
    pauseMusic();

    // 3-second smooth progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 3-second countdown interval
    let remaining = 3;
    const interval = setInterval(() => {
      remaining -= 1;
      setSecondsLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        clearInterval(interval);
        setCanClose(true);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      syncMusic();
    };
  }, [visible]);

  if (!visible) return null;

  const handleDismiss = () => {
    if (!canClose) {
      play('tap');
      return;
    }
    play('pop');
    syncMusic();
    onClose();
  };

  return (
    <View
      style={[
        styles.backdrop,
        StyleSheet.absoluteFill,
        { zIndex: 99999, elevation: 99999 },
      ]}
      pointerEvents="auto"
    >
      <View style={styles.container}>
        {/* Top Bar with Ad Tag & Close Timer */}
        <View style={styles.header}>
          <View style={styles.adTag}>
            <Ionicons name="megaphone" size={14} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.adTagText}>{isRewarded ? 'Ödüllü Reklam' : 'Sponsorlu Reklam'}</Text>
          </View>

          {canClose ? (
            <TouchableOpacity
              onPress={handleDismiss}
              activeOpacity={0.8}
              style={styles.closeBtnActive}
            >
              <Ionicons name="close" size={18} color="#FFF" />
              <Text style={styles.closeBtnText}>Kapat</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.timerPill}>
              <Ionicons name="time-outline" size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.timerText}>{secondsLeft}s</Text>
            </View>
          )}
        </View>

        {/* Linear Progress Bar at top */}
        <View style={styles.progressBarTrack}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        {/* Ad Creative Card */}
        <View style={styles.adCard}>
          {/* Visual Header / Banner */}
          <View style={styles.bannerWrap}>
            <Image
              source={require('../../assets/images/bg.jpg')}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View style={styles.mascotShowcase}>
              <Image
                source={require('../../assets/images/mascot.png')}
                style={styles.showcaseImg}
                resizeMode="contain"
              />
            </View>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>✨ EN ÇOK SEVİLEN ÖRGÜ OYUNU</Text>
            </View>
          </View>

          {/* App Info & Description */}
          <View style={styles.infoArea}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.appIcon}
                resizeMode="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.appTitle}>Yumak Pop 3D</Text>
                <Text style={styles.appSubtitle}>FloppaTech Corp • Ücretsiz Bulmaca</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 }}>
                  <Text style={styles.stars}>★★★★★</Text>
                  <Text style={styles.ratingText}>4.9 (100K+ Oyuncu)</Text>
                </View>
              </View>
            </View>

            <Text style={styles.adDescription}>
              Makaraları sar, rengarenk örgü yılanları kuyuya çekilmeden çöz! 18 farklı usta işi ahşap parkur seni bekliyor.
            </Text>
          </View>

          {/* Continue / Action Button */}
          <View style={styles.actionWrap}>
            <YarnButton
              label={
                canClose
                  ? isRewarded
                    ? 'ÖDÜLÜ AL VE DEVAM ET ›'
                    : 'SONRAKİ BÖLÜME GEÇ ›'
                  : `Reklamı Kapat (${secondsLeft}s)...`
              }
              icon={canClose ? 'play' : 'time'}
              color={canClose ? 'mint' : 'plum'}
              onPress={handleDismiss}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 25, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFF6EA',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#F3D5C1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#3D2010',
  },
  adTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timerText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  closeBtnActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#45C99A',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 3,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF7A6B',
  },
  adCard: {
    padding: 14,
  },
  bannerWrap: {
    width: '100%',
    height: 190,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E8C5A0',
  },
  mascotShowcase: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseImg: {
    width: '100%',
    height: '100%',
  },
  bannerBadge: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(61, 32, 16, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bannerBadgeText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  infoArea: {
    marginVertical: 14,
  },
  appIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F3D5C1',
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#3D2010',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#8A6690',
  },
  stars: {
    color: '#FFB905',
    fontSize: 12,
    fontWeight: '900',
  },
  ratingText: {
    fontSize: 11.5,
    color: '#5B3A5E',
    fontWeight: '600',
  },
  adDescription: {
    fontSize: 12.5,
    color: '#5B3A5E',
    lineHeight: 18,
    marginTop: 10,
  },
  actionWrap: {
    marginTop: 4,
  },
});
