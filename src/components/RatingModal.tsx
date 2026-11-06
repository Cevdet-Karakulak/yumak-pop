import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
import { play } from '../audio';
import { Bouncy, FONT, T, YarnButton } from './ui';
import { useSave } from '../save';
import { openStoreForReview, openSupportPortal } from '../services/reviewService';
import { UI } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** When opened manually (e.g. from Settings), bypass the dismiss count increment */
  isManual?: boolean;
}

export function RatingModal({ visible, onClose, isManual = false }: Props) {
  const { data, update, t } = useSave();
  const [rating, setRating] = useState<number>(5); // Default to glowing 5 stars!
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  // Bobbin idle floating bob animation
  const bobAnim = useRef(new Animated.Value(0)).current;
  // Card pop-in scale animation
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const starScales = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  useEffect(() => {
    if (!visible) {
      setHasSubmitted(false);
      return;
    }

    // Modal pop-in
    scaleAnim.setValue(0.85);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 65,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Bobbin gentle breathing bob
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -6,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    bobLoop.start();

    return () => bobLoop.stop();
  }, [visible]);

  if (!visible) return null;

  const handleSelectStar = (stars: number) => {
    setRating(stars);
    play('pop');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    // Bounce the tapped star
    const anim = starScales[stars - 1];
    if (anim) {
      anim.setValue(1.4);
      Animated.spring(anim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleDismissLater = () => {
    play('tap');
    if (!isManual) {
      update((d) => ({
        ...d,
        lastReviewPromptTime: Date.now(),
        reviewPromptDismissCount: (d.reviewPromptDismissCount || 0) + 1,
      }));
    }
    onClose();
  };

  const handleHighRatingSubmit = async () => {
    setHasSubmitted(true);
    play('win');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Reward player with +5 Workshop Stars and +100 Coins!
    update((d) => ({
      ...d,
      coins: d.coins + 100,
      bonusStars: (d.bonusStars || 0) + 5,
      hasRatedApp: true,
      userGivenRating: rating,
      lastReviewPromptTime: Date.now(),
    }));

    // Trigger native store review dialog and/or direct store URL
    await openStoreForReview();

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleLowRatingSubmit = () => {
    play('tap');
    update((d) => ({
      ...d,
      hasRatedApp: true,
      userGivenRating: rating,
      lastReviewPromptTime: Date.now(),
    }));
    openSupportPortal();
    onClose();
  };

  const isHighRating = rating >= 4;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismissLater}
    >
      <View style={styles.backdrop}>
        <Animated.View style={[styles.dialogCard, { transform: [{ scale: scaleAnim }] }]}>
          {/* Top Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleDismissLater}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={20} color="#78350F" />
          </TouchableOpacity>

          {/* Bobbin Mascot Badge */}
          <Animated.View style={[styles.mascotContainer, { transform: [{ translateY: bobAnim }] }]}>
            <View style={styles.mascotHalo}>
              <Image
                source={require('../../assets/images/mascot.png')}
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Title & Subtitle */}
          <T style={styles.title}>{isHighRating ? t.rateHighTitle : t.rateLowTitle}</T>
          <T style={styles.subtitle}>
            {isHighRating ? t.rateHighDesc : t.rateLowDesc}
          </T>

          {/* Interactive 5-Star Row */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const isFilled = starIndex <= rating;
              const scale = starScales[starIndex - 1];
              return (
                <TouchableOpacity
                  key={starIndex}
                  onPress={() => handleSelectStar(starIndex)}
                  activeOpacity={0.8}
                  style={styles.starTouchArea}
                >
                  <Animated.View style={{ transform: [{ scale }] }}>
                    <Ionicons
                      name={isFilled ? 'star' : 'star-outline'}
                      size={42}
                      color={isFilled ? '#F59E0B' : '#D1BFA8'}
                      style={styles.starShadow}
                    />
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>

          <T style={styles.hint}>{t.rateHint}</T>

          {/* Dynamic Content based on Rating */}
          {isHighRating ? (
            <View style={styles.actionSection}>
              {/* Reward Badge */}
              <View style={styles.rewardBox}>
                <Ionicons name="gift" size={18} color="#D97706" style={{ marginRight: 6 }} />
                <T style={styles.rewardText}>{t.rateRewardBadge}</T>
              </View>

              {/* Rate on Store Button */}
              <YarnButton
                label={hasSubmitted ? t.rateThanks : t.rateStoreBtn}
                icon="star"
                color="gold"
                onPress={handleHighRatingSubmit}
                style={styles.submitBtn}
              />
            </View>
          ) : (
            <View style={styles.actionSection}>
              <YarnButton
                label={t.rateFeedbackBtn}
                icon="chatbubble-ellipses"
                color="plum"
                onPress={handleLowRatingSubmit}
                style={styles.submitBtn}
              />
              <YarnButton
                small
                label={t.close}
                color="coral"
                onPress={() => {
                  update((d) => ({ ...d, hasRatedApp: true, userGivenRating: rating }));
                  onClose();
                }}
                style={{ marginTop: 6 }}
              />
            </View>
          )}

          {/* Maybe Later link */}
          {!hasSubmitted && (
            <Bouncy onPress={handleDismissLater} style={styles.laterBtn}>
              <T style={styles.laterText}>{t.rateLater}</T>
            </Bouncy>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 18, 12, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFF8F0',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#EAD7C5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1E3D3',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  mascotContainer: {
    marginTop: -8,
    marginBottom: 8,
    alignItems: 'center',
  },
  mascotHalo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FCE7D0',
    borderWidth: 3,
    borderColor: '#F6D3B0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  mascotImage: {
    width: 82,
    height: 82,
  },
  title: {
    fontSize: 22,
    fontFamily: FONT.black,
    color: '#78350F',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  starTouchArea: {
    padding: 4,
  },
  starShadow: {
    textShadowColor: 'rgba(217, 119, 6, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 4,
  },
  hint: {
    fontSize: 12,
    color: '#B45309',
    marginBottom: 16,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 12,
  },
  rewardText: {
    fontSize: 13,
    fontFamily: FONT.black,
    color: '#B45309',
  },
  submitBtn: {
    width: '100%',
  },
  laterBtn: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  laterText: {
    fontSize: 13,
    color: '#A16207',
    textDecorationLine: 'underline',
    fontFamily: FONT.bold,
  },
});
