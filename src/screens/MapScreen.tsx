import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Bouncy, CoinBadge, FONT, RoundIcon, T } from '../components/ui';
import {
  getActiveChapters,
  getChapterForLevel,
  getLevelInfo,
  LEVELS_PER_CHAPTER,
  TOTAL_LEVELS,
} from '../game/levels';
import { useSave } from '../save';
import { UI, YARN } from '../theme';

const NODE = 66;
const STEP = 104;
const NODE_COLORS = ['R', 'O', 'Y', 'G', 'T', 'B', 'P', 'K'];

export function MapScreen({ onBack, onPlay }: { onBack: () => void; onPlay: (n: number) => void }) {
  const { data, t } = useSave();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const chapters = getActiveChapters(TOTAL_LEVELS);
  const currentLevelChapter = getChapterForLevel(Math.min(data.unlocked, TOTAL_LEVELS));
  const [selectedChapterId, setSelectedChapterId] = useState(currentLevelChapter.id);

  const currentChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];
  const startLevel = currentChapter.startLevel;
  const endLevel = Math.min(currentChapter.endLevel, TOTAL_LEVELS);
  const levelsCount = endLevel - startLevel + 1;

  const amp = Math.min(110, width / 2 - NODE);
  const contentH = levelsCount * STEP + 90;

  // Level at bottom of current chapter, path winds upwards
  const pos = (lvl: number) => {
    const idx = lvl - startLevel;
    return {
      x: width / 2 + Math.sin(lvl * 0.9) * amp,
      y: contentH - 65 - idx * STEP,
    };
  };

  useEffect(() => {
    // Scroll to player's current level if in this chapter, otherwise start at bottom
    if (data.unlocked >= startLevel && data.unlocked <= endLevel) {
      const y = pos(data.unlocked).y - 380;
      setTimeout(() => scroll.current?.scrollTo({ y: Math.max(0, y), animated: true }), 100);
    } else {
      setTimeout(() => scroll.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [selectedChapterId]);

  let d = '';
  for (let n = startLevel; n <= endLevel; n++) {
    const p = pos(n);
    if (n === startLevel) d = `M${p.x} ${p.y}`;
    else {
      const q = pos(n - 1);
      const my = (p.y + q.y) / 2;
      d += ` C${q.x} ${my} ${p.x} ${my} ${p.x} ${p.y}`;
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={require('../../assets/images/bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <RoundIcon icon="arrow-back" onPress={onBack} />
        <View style={{ alignItems: 'center' }}>
          <T style={{ fontFamily: FONT.black, fontSize: 24 }}>{t.levels}</T>
          <T style={{ fontSize: 12, color: UI.plumLight }}>{currentChapter.title}</T>
        </View>
        <CoinBadge coins={data.coins} />
      </View>

      {/* Chapter Navigation Tabs (For easy monthly 50-100 level expansion) */}
      {chapters.length > 1 && (
        <View style={[styles.chapterBar, width >= 600 && { maxWidth: 560, width: '100%', alignSelf: 'center' }]}>
          {chapters.map((ch) => {
            const isSelected = ch.id === selectedChapterId;
            const isLocked = data.unlocked < ch.startLevel;
            return (
              <Bouncy
                key={ch.id}
                onPress={() => !isLocked && setSelectedChapterId(ch.id)}
                disabled={isLocked}
                style={{ flex: 1 }}
              >
                <View
                  style={[
                    styles.chapterPill,
                    isSelected && styles.chapterPillActive,
                    isLocked && styles.chapterPillLocked,
                  ]}
                >
                  <T style={{ fontSize: 13 }}>{ch.icon}</T>
                  <T
                    style={[
                      styles.chapterPillText,
                      isSelected && styles.chapterPillTextActive,
                      isLocked && { color: '#A0949D' },
                    ]}
                  >
                    {ch.startLevel}-{ch.endLevel}
                  </T>
                  {isLocked && <Ionicons name="lock-closed" size={11} color="#A0949D" />}
                </View>
              </Bouncy>
            );
          })}
        </View>
      )}

      {/* Map Nodes Scroll Area */}
      <ScrollView
        ref={scroll}
        contentContainerStyle={{ height: contentH }}
        showsVerticalScrollIndicator={false}
      >
        <Svg width={width} height={contentH} style={StyleSheet.absoluteFill}>
          <Path d={d} stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.8} />
          <Path d={d} stroke={UI.coral} strokeWidth={4} fill="none" strokeDasharray="10 9" strokeLinecap="round" />
        </Svg>

        {Array.from({ length: levelsCount }).map((_, i) => {
          const n = startLevel + i;
          const p = pos(n);
          const locked = n > data.unlocked;
          const current = n === data.unlocked;
          const stars = data.stars[n] ?? 0;
          const c = YARN[NODE_COLORS[(n - 1) % NODE_COLORS.length]];
          const hard = getLevelInfo(n).hard;

          return (
            <View
              key={n}
              style={{
                position: 'absolute',
                left: p.x - NODE / 2,
                top: p.y - NODE / 2,
                alignItems: 'center',
              }}
            >
              <Bouncy onPress={() => !locked && onPlay(n)} disabled={locked}>
                <View
                  style={[
                    styles.node,
                    { backgroundColor: locked ? '#CFC6CC' : c.base, borderColor: locked ? '#B3A9B0' : c.dark },
                    current && styles.current,
                  ]}
                >
                  <View style={[styles.nodeShine, { backgroundColor: locked ? '#E0D9DD' : c.light }]} />
                  {locked ? (
                    <Ionicons name="lock-closed" size={24} color="#fff" />
                  ) : (
                    <T style={styles.nodeText}>{n}</T>
                  )}
                  {hard && !locked && (
                    <View style={styles.hard}>
                      <Ionicons name="flame" size={14} color="#fff" />
                    </View>
                  )}
                </View>
              </Bouncy>
              {!locked && (
                <View style={{ flexDirection: 'row', marginTop: -6 }}>
                  {[0, 1, 2].map((s) => (
                    <Ionicons
                      key={s}
                      name="star"
                      size={16}
                      color={s < stars ? UI.gold : 'rgba(255,255,255,0.9)'}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  chapterBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
  },
  chapterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#F3D5C1',
  },
  chapterPillActive: {
    backgroundColor: '#FFE9DC',
    borderColor: UI.coral,
    borderWidth: 2,
  },
  chapterPillLocked: {
    backgroundColor: 'rgba(230, 222, 226, 0.7)',
    borderColor: '#CFC5CB',
  },
  chapterPillText: {
    fontFamily: FONT.black,
    fontSize: 12.5,
    color: UI.plum,
  },
  chapterPillTextActive: {
    color: UI.coral,
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    elevation: 4,
    shadowColor: UI.plum,
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
  current: {
    borderColor: '#fff',
    borderWidth: 5,
    transform: [{ scale: 1.12 }],
  },
  nodeShine: {
    position: 'absolute',
    top: 8,
    left: 12,
    width: 20,
    height: 10,
    borderRadius: 6,
    opacity: 0.8,
  },
  nodeText: {
    color: '#fff',
    fontFamily: FONT.black,
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 1,
  },
  hard: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: UI.coralDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
