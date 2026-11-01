import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  LayoutAnimation,
  LayoutRectangle,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz, play } from '../audio';
import { PopBurst, PopIn, useShake } from '../components/effects';
import { HowToPlaySheet, MechanicIntroSheet } from '../components/HowToPlayModal';
import { InterstitialAdModal } from '../components/InterstitialAdModal';
import { SnakeTrackView } from '../components/SnakeTrackView';
import { BasketView, SpoolView } from '../components/SpoolView';
import { Bouncy, CoinBadge, FONT, RoundIcon, Sheet, T, YarnButton } from '../components/ui';
import {
  addSlot,
  checkTap,
  cloneState,
  crawlTick,
  GameState,
  magnetFront,
  pushBackSnake,
  tapColumn,
  unravelTick,
} from '../game/engine';
import { createLevel, getLevelInfo, MechanicKind, TOTAL_LEVELS } from '../game/levels';
import {
  BOOSTER_PRICE,
  BoosterKind,
  COLOR_SWAP_PRICE,
  CONTINUE_PRICE,
  SLOT_UNLOCK_PRICES,
  useSave,
} from '../save';
import { UI, YARN } from '../theme';

const MAX_RACK = 7;
const UNRAVEL_INTERVAL_MS = 270;

interface PopItem {
  id: number;
  x: number;
  y: number;
  color: string;
}

export function GameScreen({
  level,
  forceTutorial,
  onHome,
  onNext,
}: {
  level: number;
  forceTutorial?: boolean;
  onHome: () => void;
  onNext: (n: number) => void;
}) {
  const { data, update, t } = useSave();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const info = useMemo(() => getLevelInfo(level), [level]);

  const [game, setGame] = useState<GameState>(() => createLevel(level, 3));
  const gameRef = useRef(game);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const boostersUsed = useRef(0);
  const finished = useRef(false);
  const uid = useRef(1);

  const [pops, setPops] = useState<PopItem[]>([]);
  const [result, setResult] = useState<null | { won: boolean; stars: number; coins: number }>(null);
  const [tutStep, setTutStep] = useState(
    forceTutorial || (level === 1 && !data.tutorialDone) ? 0 : -1,
  );
  const [buyKind, setBuyKind] = useState<BoosterKind | null>(null);
  const [howToOpen, setHowToOpen] = useState(false);
  const [introMech, setIntroMech] = useState<MechanicKind | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [banner, setBanner] = useState(info.hard);
  const [unlockSlotIdx, setUnlockSlotIdx] = useState<number | null>(null);
  const [swapSlotIdx, setSwapSlotIdx] = useState<number | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [showLevelAd, setShowLevelAd] = useState(false);
  const [pendingNextLevel, setPendingNextLevel] = useState<number | null>(null);
  const [showRewardedReviveAd, setShowRewardedReviveAd] = useState(false);
  const [showRewardedSlotAd, setShowRewardedSlotAd] = useState(false);
  const [showRewardedSwapAd, setShowRewardedSwapAd] = useState(false);
  const [normalReviveUsed, setNormalReviveUsed] = useState(false);
  const [adReviveUsed, setAdReviveUsed] = useState(false);
  const rackShake = useShake();

  // Reset to 3 slots and refresh revive chances on level change or restart
  useEffect(() => {
    finished.current = false;
    boostersUsed.current = 0;
    setNormalReviveUsed(false);
    setAdReviveUsed(false);
    setPops([]);
    setResult(null);
    setBoth(createLevel(level, 3));
  }, [level]);

  // Active live unravel whip info
  const [activeUnravel, setActiveUnravel] = useState<{
    spoolSlot: number;
    color: string;
    headX: number;
    headY: number;
  } | null>(null);

  // Layout rectangles for coordinate mapping
  const trackRect = useRef<LayoutRectangle | null>(null);
  const rackRect = useRef<LayoutRectangle | null>(null);
  const trackRef = useRef<React.ComponentRef<typeof View>>(null);
  const rackRef = useRef<React.ComponentRef<typeof View>>(null);

  const remeasure = () => {
    requestAnimationFrame(() => {
      trackRef.current?.measureInWindow((x, y, w, h) => {
        trackRect.current = { x, y, width: w, height: h };
      });
      rackRef.current?.measureInWindow((x, y, w, h) => {
        rackRect.current = { x, y, width: w, height: h };
      });
    });
  };

  useEffect(() => {
    if (info.newMechanic && info.newMechanic !== 'basic' && !data.seenMechanics[info.newMechanic]) {
      setIntroMech(info.newMechanic);
    }
  }, [info, data.seenMechanics]);

  const dismissIntroMech = () => {
    if (introMech) {
      const m = introMech;
      update((d) => ({ ...d, seenMechanics: { ...d.seenMechanics, [m]: true } }));
    }
    setIntroMech(null);
  };

  const showToast = (msg: string) => setToastMsg(msg);
  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(null), 2500);
    const handleNextLevel = () => {
    const nextLvl = level + 1;
    // Every 3 levels passed: show interstitial ad before advancing to the new level
    const passed = data.completedLevels || 0;
    if (passed > 0 && passed % 3 === 0) {
      setPendingNextLevel(nextLvl);
      setShowLevelAd(true);
    } else {
      onNext(nextLvl);
    }
  };

  const onLevelAdDismiss = () => {
    setShowLevelAd(false);
    const targetLvl = pendingNextLevel ?? (level + 1);
    setPendingNextLevel(null);
    onNext(targetLvl);
  };

  return () => clearTimeout(id);
  }, [toastMsg]);

  // Sizing: Expands track to fill the craft table while keeping all bottom controls comfortably visible!
  const usableH = height - insets.top - insets.bottom;
  const viewTrackW = Math.min(width - 8, 480);
  const bottomControlsBudget = 265;
  const viewTrackH = Math.max(340, Math.min(620, usableH - bottomControlsBudget - 8));
  const totalSlots = 6;
  const slotGap = 4;
  const slotW = Math.min(46, Math.floor((width - 24) / totalSlots) - slotGap);
  const colCount = game.columns.length;
  const colW = (width - 16) / colCount;
  const frontSize = Math.min(46, colW * 0.65, 48);

  // Physical coordinates of spools on the rack relative to track view
  const defaultSlotCoords = useMemo(() => {
    // Physical vertical center of the active spool on the holding rack:
    const targetY = viewTrackH + 12 + (slotW * 1.30) * 0.45;
    return Array.from({ length: totalSlots }).map((_, idx) => ({
      x: viewTrackW * 0.5 + (idx - (totalSlots - 1) / 2) * (slotW + slotGap),
      y: targetY,
    }));
  }, [totalSlots, viewTrackW, viewTrackH, slotW, slotGap]);

  const [slotCoords, setSlotCoords] = useState<{ x: number; y: number }[]>(defaultSlotCoords);

  useEffect(() => {
    setSlotCoords(defaultSlotCoords);
  }, [defaultSlotCoords]);

  const measureSlots = useCallback(() => {
    if (typeof document !== 'undefined') {
      const rackEl = rackRef.current as any;
      const trackEl = trackRef.current as any;
      const rNode = rackEl?.getBoundingClientRect ? rackEl : rackEl?._nativeNode ?? rackEl?.node;
      const tNode = trackEl?.getBoundingClientRect ? trackEl : trackEl?._nativeNode ?? trackEl?.node;

      if (rNode?.getBoundingClientRect && tNode?.getBoundingClientRect) {
        const tRect = tNode.getBoundingClientRect();
        if (rNode.children && rNode.children.length >= totalSlots && tRect.width > 0) {
          const coords = Array.from(rNode.children).slice(0, totalSlots).map((child: any) => {
            const cRect = child.getBoundingClientRect();
            return {
              x: cRect.left - tRect.left + cRect.width * 0.50,
              y: cRect.top - tRect.top + cRect.height * 0.45,
            };
          });
          setSlotCoords(coords);
          return;
        }

        const rRect = rNode.getBoundingClientRect();
        if (rRect.height > 0 && tRect.height > 0) {
          const relTop = rRect.top - tRect.top;
          const relLeft = rRect.left - tRect.left;
          const coords = Array.from({ length: totalSlots }).map((_, idx) => ({
            x: relLeft + (idx + 0.5) * (slotW + slotGap),
            y: relTop + (slotW * 1.30) * 0.45,
          }));
          setSlotCoords(coords);
          return;
        }
      }
    }
    if (rackRef.current && trackRef.current) {
      (rackRef.current as any).measureLayout?.(
        trackRef.current,
        (left: number, top: number) => {
          const coords = Array.from({ length: totalSlots }).map((_, idx) => ({
            x: left + (idx + 0.5) * (slotW + slotGap),
            y: top + (slotW * 1.30) * 0.45,
          }));
          setSlotCoords(coords);
        },
        () => {}
      );
    }
  }, [totalSlots, slotW, slotGap]);

  useEffect(() => {
    const t = setTimeout(measureSlots, 100);
    return () => clearTimeout(t);
  }, [level, viewTrackH, viewTrackW, measureSlots]);

  const setBoth = (g: GameState) => {
    gameRef.current = g;
    setGame(g);
  };

  const finish = useCallback(
    (won: boolean) => {
      if (finished.current) return;
      finished.current = true;
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      setActiveUnravel(null);

      if (won) {
        const stars = Math.max(1, 3 - boostersUsed.current);
        const coins = 15 + stars * 5 + (info.hard ? 20 : 0);
        update((d) => ({
          ...d,
          coins: d.coins + coins,
          unlocked: Math.max(d.unlocked, Math.min(TOTAL_LEVELS, level + 1)),
          stars: { ...d.stars, [level]: Math.max(d.stars[level] ?? 0, stars) },
          tutorialDone: true,
          completedLevels: (d.completedLevels || 0) + 1,
        }));
        setTimeout(() => {
          play('win');
          buzz('success');
          setResult({ won: true, stars, coins });
        }, 500);
      } else {
        setTimeout(() => {
          play('lose');
          buzz('error');
          setResult({ won: false, stars: 0, coins: 0 });
        }, 400);
      }
    },
    [info.hard, level, update],
  );

  const lastUnravelTime = useRef(0);

  // Master Game Ticker: handles rhythmic step-by-step unraveling and steady idle crawling!
  useEffect(() => {
    const interval = setInterval(() => {
      const cur = gameRef.current;
      if (finished.current) return;

      // Immediate status check: trigger game-over or victory dialog if state reached lost or won
      if (cur.status === 'lost') {
        finish(false);
        return;
      }
      if (cur.status === 'won') {
        finish(true);
        return;
      }
      if (cur.status !== 'playing') return;

      const now = Date.now();
      const headSeg = cur.segments[0];
      const hasMatch =
        headSeg &&
        cur.rack.some(
          (sp) => sp !== null && sp.color === headSeg.color && sp.need > 0,
        );

      if (hasMatch) {
        // Relaxed, rhythmic 270ms pace per stitch so player can clearly savour the unravelling!
        if (now - lastUnravelTime.current >= UNRAVEL_INTERVAL_MS) {
          lastUnravelTime.current = now;
          const res = unravelTick(cur);
          if (res.state.status === 'lost') {
            setBoth(res.state);
            finish(false);
            return;
          }
          if (res.tickInfo) {
            setBoth(res.state);
            setActiveUnravel({
              spoolSlot: res.tickInfo.spoolSlot,
              color: res.tickInfo.color,
              headX: 0,
              headY: 0,
            });
            play('pull');

            if (res.tickInfo.popped) {
              play('pop');
              buzz('medium');
              // Add burst effect over slot
              const c = slotCoords[res.tickInfo.spoolSlot];
              if (c) {
                setPops((ps) => [
                  ...ps,
                  { id: uid.current++, x: c.x, y: c.y, color: res.tickInfo!.color },
                ]);
              }
            }

            if (res.state.status === 'won') {
              // 600ms celebration delay so player sees final ring pop before win dialog
              setTimeout(() => finish(true), 600);
            }
          }
        }
      } else {
        setActiveUnravel(null);
        // Snappy, continuous steady crawl forward when waiting for player move!
        const crawlSpeed = (info.hard ? 0.22 : 0.17) * 0.55;
        const crawled = crawlTick(cur, crawlSpeed);
        setBoth(crawled);
        if (crawled.status === 'lost') {
          finish(false);
          return;
        }
      }
    }, 33);

    return () => clearInterval(interval);
  }, [slotCoords, viewTrackH, finish, info.hard]);

  const startUnravelLoop = () => {
    // Unravel is automatically evaluated on the continuous master game ticker
  };

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(false), 1800);
    return () => clearTimeout(id);
  }, [banner]);

  // Column Tap Action
  const onTapColumn = (c: number) => {
    const g = gameRef.current;
    if (g.status !== 'playing' || finished.current) return;
    if (!g.columns[c].length) return;

    const chk = checkTap(g, c);
    if (!chk.ok) {
      play('blocked');
      buzz('error');
      rackShake.shake();
      if (chk.reason === 'knotted' || chk.reason === 'twin_partner_blocked') {
        showToast(t.toastKnotted);
      } else if (chk.reason === 'frozen') {
        showToast('❄️ Buzlu makara! Çözmek için rafta makara patlat');
      } else if (chk.reason === 'twin_needs_2_slots') {
        showToast(t.toastTwinSlots);
      } else if (chk.reason === 'rack_full') {
        showToast(t.toastRackFull);
      }
      return;
    }

    const hadBasket = (g.baskets[c]?.length ?? 0) > 0;
    const r = tapColumn(g, c);
    if (!r) return;

    setBoth(r.state);
    play('tap');
    buzz('light');
    if (hadBasket) {
      setTimeout(() => play('pull'), 150);
    }
    measureSlots();

    if (r.state.status === 'lost') {
      finish(false);
      return;
    }
    if (r.state.status === 'won') {
      finish(true);
      return;
    }

    if (tutStep === 0) {
      setTutStep(1);
    }

    startUnravelLoop();
  };

  const consume = (kind: BoosterKind): boolean => {
    if (data.boosters[kind] > 0) {
      update((d) => ({ ...d, boosters: { ...d.boosters, [kind]: d.boosters[kind] - 1 } }));
      boostersUsed.current += 1;
      return true;
    }
    setBuyKind(kind);
    return false;
  };

  const applyBooster = (kind: BoosterKind, fromLose = false) => {
    const g = gameRef.current;
    if (finished.current && !fromLose) return;

    if (kind === 'undo') {
      // Push back snake by 20%
      if (!consume('undo')) return;
      setBoth(pushBackSnake(g));
    } else if (kind === 'slot') {
      if (g.rack.length >= MAX_RACK) return play('blocked');
      if (!consume('slot')) return;
      setBoth(addSlot(g));
    } else {
      // Magnet: unravel front segment immediately
      const r = magnetFront(g);
      if (!r) return play('blocked');
      if (!consume('magnet')) return;
      setBoth(r.state);
      play('pop');
      if (r.state.status === 'won') return finish(true);
    }

    if (fromLose) {
      finished.current = false;
      setResult(null);
    }
    startUnravelLoop();
  };

  const handleRevive = (isAd: boolean) => {
    if (isAd) {
      setShowRewardedReviveAd(true);
    } else {
      setNormalReviveUsed(true);
      executeRevive(false);
    }
  };

  const executeRevive = (isAd: boolean) => {
    finished.current = false;
    setResult(null);
    const revivedState = pushBackSnake(gameRef.current, isAd ? 32 : 28);
    setBoth(revivedState);
    play('pull');
    buzz('success');
    showToast(isAd ? '🎬 Reklam Ödülü: Yılan Geri İtildi!' : '🛡️ Yılan Geri İtildi!');
    startUnravelLoop();
  };

  const executeColorSwap = (slotIdx: number) => {
    const cur = gameRef.current;
    if (slotIdx === null || !cur.rack[slotIdx] || !cur.segments[0]) return;
    const targetColor = cur.segments[0].color;
    const oldColor = cur.rack[slotIdx]!.color;
    if (oldColor === targetColor) return;

    const next = cloneState(cur);
    next.rack[slotIdx]!.color = targetColor;

    // Strict color conservation:
    // 1. Try finding a reserve spool of targetColor in columns or baskets, and swap its color with oldColor:
    let balanced = false;
    for (const col of next.columns) {
      const sp = col.find((s) => s.color === targetColor);
      if (sp) {
        sp.color = oldColor;
        balanced = true;
        break;
      }
    }
    if (!balanced) {
      for (const b of next.baskets) {
        const sp = b.find((s) => s.color === targetColor);
        if (sp) {
          sp.color = oldColor;
          balanced = true;
          break;
        }
      }
    }
    // 2. If no reserve targetColor spool exists, convert a later snake segment of oldColor to targetColor
    if (!balanced) {
      const laterSeg = next.segments.slice(1).find((s) => s.color === oldColor);
      if (laterSeg) {
        laterSeg.color = targetColor;
        balanced = true;
      }
    }

    setBoth(next);
    setSwapSlotIdx(null);
    play('pop');
    buzz('success');
    showToast('🎨 Makara Rengi Dönüştürüldü!');
  };

  const continueWithCoins = () => {
    if (data.coins < CONTINUE_PRICE) return play('blocked');
    update((d) => ({ ...d, coins: d.coins - CONTINUE_PRICE }));
    boostersUsed.current += 1;
    finished.current = false;
    setResult(null);
    setBoth(addSlot(gameRef.current));
    startUnravelLoop();
  };

  const handleNextLevel = () => {
    const nextLvl = level + 1;
    // Every 3 levels successfully passed: show interstitial ad before advancing to the new level
    const passed = data.completedLevels || 0;
    if (passed > 0 && passed % 3 === 0) {
      setPendingNextLevel(nextLvl);
      setShowLevelAd(true);
    } else {
      onNext(nextLvl);
    }
  };

  const onLevelAdDismiss = () => {
    setShowLevelAd(false);
    const targetLvl = pendingNextLevel ?? (level + 1);
    setPendingNextLevel(null);
    onNext(targetLvl);
  };

  const restart = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    finished.current = false;
    boostersUsed.current = 0;
    setNormalReviveUsed(false);
    setAdReviveUsed(false);
    setPops([]);
    setResult(null);
    setBoth(createLevel(level, 3));
  };

  const buy = (kind: BoosterKind) => {
    if (data.coins < BOOSTER_PRICE[kind]) return play('blocked');
    update((d) => ({
      ...d,
      coins: d.coins - BOOSTER_PRICE[kind],
      boosters: { ...d.boosters, [kind]: d.boosters[kind] + 1 },
    }));
    setBuyKind(null);
  };

  const stepsToHole = Math.max(0, Math.round((game.dangerHolePos - game.headPos) / game.stepPenalty));
  const isDanger = stepsToHole <= 5;

  return (
    <View style={styles.root}>
      <Image
        source={require('../../assets/images/board_bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[styles.root, { paddingTop: insets.top + 2, paddingBottom: Math.max(insets.bottom, 6), justifyContent: 'flex-start' }]}>
        {/* Header */}
        <View style={styles.header}>
          <RoundIcon icon="home" onPress={onHome} size={40} />
          <View style={styles.levelPill}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <T style={{ fontFamily: FONT.black, fontSize: 17 }}>
                {t.level} {level}
              </T>
              {info.mechanics.includes('knots') && <T style={{ fontSize: 13 }}>🔒</T>}
              {info.mechanics.includes('twin') && <T style={{ fontSize: 13 }}>🔗</T>}
              {info.mechanics.includes('basket') && <T style={{ fontSize: 13 }}>🧺</T>}
            </View>
            {/* Danger Steps Indicator */}
            <View
              style={[
                styles.stepBadge,
                isDanger && { backgroundColor: UI.coral, borderColor: '#FFF' },
              ]}
            >
              <Ionicons
                name={isDanger ? 'alert-circle' : 'footsteps'}
                size={13}
                color={isDanger ? '#FFF' : UI.plum}
              />
              <T
                style={{
                  fontSize: 12,
                  marginLeft: 4,
                  color: isDanger ? '#FFF' : UI.plum,
                  fontFamily: FONT.bold,
                }}
              >
                {isDanger ? `🚨 KUYUYA: ${stepsToHole} ADIM!` : `Kuyuya: ${stepsToHole} Adım`}
              </T>
            </View>
          </View>
          <RoundIcon icon="help-circle" onPress={() => setHowToOpen(true)} size={40} bg={UI.peach} />
          <View style={{ width: 6 }} />
          <CoinBadge coins={data.coins} />
        </View>

        {/* Interactive Guided Tutorial Card */}
        {tutStep >= 0 && (
          <View style={styles.tutorialOverlay} pointerEvents="box-none">
            <View style={[styles.tutorialCard, { top: insets.top + 56 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <T style={{ fontFamily: FONT.black, fontSize: 15, color: UI.coral }}>
                  {tutStep === 0
                    ? '🎯 1. Adım: Makaraya Dokun!'
                    : tutStep === 1
                    ? '🧶 2. Adım: İp Sökülüyor!'
                    : tutStep === 2
                    ? '🚨 3. Adım: Kuyuya Dikkat!'
                    : '🎉 Rehber Tamamlandı!'}
                </T>
                <Pressable
                  onPress={() => {
                    setTutStep(-1);
                    update((d) => ({ ...d, tutorialDone: true }));
                  }}
                  style={{ padding: 4 }}
                >
                  <T style={{ fontSize: 12, color: UI.plumLight, textDecorationLine: 'underline' }}>
                    Rehberi Geç
                  </T>
                </Pressable>
              </View>
              <T style={{ fontSize: 13, color: UI.plum, lineHeight: 18 }}>
                {tutStep === 0
                  ? 'Yılanın başındaki renkle eşleşen makaraya dokun. Makara rafa çıkıp ipi otomatik çekmeye başlar!'
                  : tutStep === 1
                  ? 'Makara rafa yerleşti ve ipleri sarıyor! İp söküldükçe yılan geriye çekilerek kuyu tehlikesinden uzaklaşır.'
                  : tutStep === 2
                  ? 'Adım sayacına dikkat et! Her hamlende yılan kuyuya bir adım yaklaşır. Kuyuya çekilmeden önce tüm ipleri bitir!'
                  : 'Tüm kuralları öğrendin. Artık rahatça oynayabilirsin!'}
              </T>
              {tutStep >= 1 && (
                <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
                  <YarnButton
                    small
                    label={tutStep === 3 ? 'Hemen Başla!' : 'Devam Et ➔'}
                    color={tutStep === 3 ? 'mint' : 'sky'}
                    onPress={() => {
                      if (tutStep < 3) {
                        setTutStep(tutStep + 1);
                      } else {
                        setTutStep(-1);
                        update((d) => ({ ...d, tutorialDone: true }));
                      }
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {/* 3D Curved Track + Braided Sweater Snake */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 4 }}>
          <View
            ref={trackRef}
            collapsable={false}
            onLayout={() => {
              remeasure();
              measureSlots();
            }}
          >
            <SnakeTrackView
              game={game}
              trackShape={info.trackShape}
              viewWidth={viewTrackW}
              viewHeight={viewTrackH}
              activeUnravel={activeUnravel}
              slotCoords={slotCoords}
            />
          </View>
        </View>

        {/* Stable Fixed Bottom Section */}
        <View style={styles.bottomArea}>
          {/* Spool Rack (Holding Area) */}
          <Animated.View
            style={[styles.shelf, rackShake.style]}
            onLayout={measureSlots}
          >
            <View
              ref={rackRef}
              collapsable={false}
              style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center' }}
              onLayout={() => {
                remeasure();
                measureSlots();
              }}
            >
              {Array.from({ length: totalSlots }).map((_, i) => {
                const activeRackLen = game.rack.length;
                const isUnlocked = i < activeRackLen;
                const isNextUnlockable = i === activeRackLen;
                const sp = isUnlocked ? game.rack[i] : null;
                const unlockPrice = SLOT_UNLOCK_PRICES[i] ?? 50;

                return (
                  <View
                    key={i}
                    style={[
                      styles.slot,
                      { width: slotW, height: slotW * 1.30, marginHorizontal: slotGap / 2 },
                    ]}
                  >
                    {isUnlocked ? (
                      sp ? (
                        <Pressable
                          onPress={() => {
                            if (game.segments[0] && sp.color !== game.segments[0].color) {
                              setSwapSlotIdx(i);
                            } else {
                              showToast('Bu makara yün sarıyor');
                            }
                          }}
                        >
                          <PopIn key={sp.id}>
                            <SpoolView
                              color={sp.color}
                              cap={sp.cap}
                              need={sp.need}
                              size={slotW * 0.94}
                              isUnraveling={activeUnravel?.spoolSlot === i}
                              isWild={sp.isWild}
                              secondColor={sp.secondColor}
                            />
                          </PopIn>
                        </Pressable>
                      ) : (
                        <View
                          style={[
                            styles.emptySlot,
                            { width: slotW * 0.58, height: slotW * 0.58, borderRadius: slotW * 0.29 },
                          ]}
                        />
                      )
                    ) : (
                      <Pressable
                        onPress={() => {
                          if (isNextUnlockable) {
                            setUnlockSlotIdx(i);
                          } else {
                            showToast('🔒 Önceki yuvayı açmalısın!');
                          }
                        }}
                        style={[
                          styles.lockedSlot,
                          {
                            width: slotW * 0.88,
                            height: slotW * 1.15,
                            borderRadius: 10,
                            opacity: isNextUnlockable ? 1 : 0.6,
                          },
                        ]}
                      >
                        <Ionicons
                          name={isNextUnlockable ? 'lock-closed' : 'lock-closed-outline'}
                          size={17}
                          color={isNextUnlockable ? UI.gold : '#8B5A33'}
                        />
                        {isNextUnlockable && (
                          <View style={styles.unlockPriceBadge}>
                            <T style={{ fontSize: 9, fontFamily: FONT.black, color: '#FFF' }}>
                              {unlockPrice}🟡
                            </T>
                          </View>
                        )}
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Spool queues + Baskets sitting in an Artisan Wooden Tray */}
          <View style={styles.spoolTrayWrapper}>
            <View style={styles.spoolTray}>
              <View style={styles.queues}>
                {game.columns.map((col, c) => {
                  const basketCount = game.baskets[c]?.length ?? 0;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => onTapColumn(c)}
                      style={{ width: colW, height: 96, alignItems: 'center', justifyContent: 'flex-start' }}
                    >
                      {col.slice(0, 3).map((sp, k) => {
                        const s = k === 0 ? frontSize : frontSize * 0.78;
                        const nextSp = col[k + 1];
                        const isTwinTop = !!(sp.twinId && nextSp?.twinId === sp.twinId);
                        return (
                          <View
                            key={sp.id}
                            style={{ marginTop: k === 0 ? 0 : -s * 0.58, zIndex: 10 - k }}
                          >
                            <SpoolView
                              color={sp.color}
                              cap={sp.cap}
                              need={sp.need}
                              hidden={sp.hidden && k > 0}
                              knots={sp.knots}
                              twinId={sp.twinId}
                              isTwinTop={isTwinTop}
                              isWild={sp.isWild}
                              frozen={sp.frozen}
                              isMystery={sp.isMystery}
                              secondColor={sp.secondColor}
                              size={s}
                              dim={k > 0}
                              showCount={k === 0 || !!sp.twinId}
                            />
                          </View>
                        );
                      })}
                      {basketCount > 0 ? (
                        <View style={{ marginTop: col.length === 0 ? 12 : -frontSize * 0.28 }}>
                          <BasketView
                            count={basketCount + Math.max(0, col.length - 3)}
                            size={frontSize * 0.9}
                          />
                        </View>
                      ) : col.length > 3 ? (
                        <View style={styles.moreBadge}>
                          <T style={{ fontSize: 12, color: '#fff' }}>+{col.length - 3}</T>
                        </View>
                      ) : null}
                      {col.length === 0 && (
                        <View
                          style={[
                            styles.emptyCol,
                            { width: frontSize * 0.82, height: frontSize * 1.05 },
                          ]}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Boosters */}
          <View style={styles.boosters}>
            {(['undo', 'slot', 'magnet'] as BoosterKind[]).map((k) => (
              <Bouncy key={k} onPress={() => applyBooster(k)}>
                <View style={styles.booster}>
                  <Ionicons
                    name={k === 'undo' ? 'arrow-undo' : k === 'slot' ? 'add-circle' : 'magnet'}
                    size={21}
                    color={UI.plum}
                  />
                  <T style={{ fontSize: 10, marginTop: -2 }}>
                    {k === 'undo' ? 'Geri İt' : t[k]}
                  </T>
                  <View
                    style={[
                      styles.boosterCount,
                      data.boosters[k] === 0 && { backgroundColor: UI.gold },
                    ]}
                  >
                    <T style={{ fontSize: 10, color: '#fff', fontFamily: FONT.black }}>
                      {data.boosters[k] > 0 ? data.boosters[k] : '+'}
                    </T>
                  </View>
                </View>
              </Bouncy>
            ))}
            {/* Renk Değiştir Booster */}
            <Bouncy
              onPress={() => {
                const headColor = game.segments[0]?.color;
                const stuckIdx = game.rack.findIndex((sp) => sp && sp.color !== headColor);
                if (stuckIdx >= 0) {
                  setSwapSlotIdx(stuckIdx);
                } else if (game.rack.every((sp) => sp === null)) {
                  showToast('Rafta henüz makara yok!');
                } else {
                  showToast('Raftaki makaralar zaten yılanla eşleşiyor!');
                }
              }}
            >
              <View style={styles.booster}>
                <Ionicons name="color-wand" size={21} color={UI.plum} />
                <T style={{ fontSize: 10, marginTop: -2 }}>Renk Değiş</T>
                <View style={[styles.boosterCount, { backgroundColor: UI.gold }]}>
                  <T style={{ fontSize: 9, color: '#fff', fontFamily: FONT.black }}>
                    {COLOR_SWAP_PRICE}🟡
                  </T>
                </View>
              </View>
            </Bouncy>
          </View>
        </View>
      </View>

      {/* Pop burst particle effects */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {pops.map((p) => (
          <PopBurst
            key={p.id}
            {...p}
            onDone={() => setPops((all) => all.filter((x) => x.id !== p.id))}
          />
        ))}
      </View>

      {/* Dynamic Toast Hint */}
      {toastMsg && (
        <View style={[styles.toastWrap, { top: insets.top + 60 }]} pointerEvents="none">
          <View style={styles.toast}>
            <T style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>{toastMsg}</T>
          </View>
        </View>
      )}

      {/* Result sheets */}
      <Sheet visible={!!result?.won} title="ÖRGÜ KURTULDU!">
        <T style={{ marginVertical: 6, color: UI.plumLight }}>
          Yılan kuyuya düşmeden tüm ipleri çözdün!
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <T style={{ marginRight: 8 }}>{t.coinsEarned}</T>
          <CoinBadge coins={result?.coins ?? 0} />
        </View>
        {level < TOTAL_LEVELS ? (
          <YarnButton
            label={t.next}
            icon="play"
            color="mint"
            onPress={handleNextLevel}
            style={{ alignSelf: 'stretch' }}
          />
        ) : (
          <T style={{ textAlign: 'center', marginBottom: 10 }}>{t.allDone}</T>
        )}
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
          <YarnButton small label={t.retry} icon="refresh" color="sky" onPress={restart} />
          <YarnButton small label={t.home} icon="home" color="plum" onPress={onHome} />
        </View>
      </Sheet>

      {/* Game Over / Revive Sheet with 1-chance & ad options */}
      <Sheet
        visible={!!result && !result.won}
        title={!normalReviveUsed || !adReviveUsed ? 'KUYUYA DÜŞTÜ!' : 'OYUN BİTTİ!'}
      >
        <T style={{ color: UI.plumLight, marginBottom: 14, textAlign: 'center' }}>
          {!normalReviveUsed
            ? 'Yılan kuyuya çekildi! 1 canlanma hakkını kullanabilir veya reklam izleyerek devam edebilirsin.'
            : !adReviveUsed
            ? 'Normal canlanma hakkın bitti! Reklam izleyerek son bir şans kazanabilirsin.'
            : 'Tüm canlanma hakların tükendi! Bu bölümü baştan dene.'}
        </T>

        {!normalReviveUsed && (
          <YarnButton
            label="Geri İt & Devam Et (1 Hak)"
            icon="refresh"
            color="mint"
            onPress={() => handleRevive(false)}
            style={{ alignSelf: 'stretch', marginBottom: 10 }}
          />
        )}

        {!adReviveUsed && (
          <YarnButton
            label={isWatchingAd ? '🎬 Reklam Yükleniyor...' : '🎬 Reklam İzle & Geri İt'}
            icon="videocam"
            color="gold"
            disabled={isWatchingAd}
            onPress={() => handleRevive(true)}
            style={{ alignSelf: 'stretch', marginBottom: 10 }}
          />
        )}

        {normalReviveUsed && adReviveUsed ? (
          <YarnButton
            label="🔄 Bölümü Yeniden Dene"
            icon="refresh"
            color="coral"
            onPress={restart}
            style={{ alignSelf: 'stretch', marginBottom: 10 }}
          />
        ) : (
          <View style={{ flexDirection: 'row', marginTop: 4, gap: 12 }}>
            <YarnButton small label={t.retry} icon="refresh" color="coral" onPress={restart} />
            <YarnButton small label={t.home} icon="home" color="plum" onPress={onHome} />
          </View>
        )}

        {normalReviveUsed && adReviveUsed && (
          <View style={{ marginTop: 10, alignSelf: 'stretch' }}>
            <YarnButton
              label="🏠 Ana Menü"
              icon="home"
              color="plum"
              onPress={onHome}
              style={{ alignSelf: 'stretch' }}
            />
          </View>
        )}
      </Sheet>

      <Sheet visible={!!buyKind} onClose={() => setBuyKind(null)} title={buyKind ? t[buyKind] : ''}>
        {buyKind && (
          <>
            <Ionicons
              name={buyKind === 'undo' ? 'arrow-undo' : buyKind === 'slot' ? 'add-circle' : 'magnet'}
              size={56}
              color={UI.coral}
            />
            <T style={{ textAlign: 'center', marginVertical: 10 }}>{t[`${buyKind}Desc` as const]}</T>
            <CoinBadge coins={data.coins} />
            <View style={{ height: 14 }} />
            <YarnButton
              label={`${t.buy} · ${BOOSTER_PRICE[buyKind]}`}
              color="gold"
              onPress={() => buy(buyKind)}
              disabled={data.coins < BOOSTER_PRICE[buyKind]}
              style={{ alignSelf: 'stretch' }}
            />
          </>
        )}
      </Sheet>

      {/* Slot Unlock Sheet */}
      <Sheet
        visible={unlockSlotIdx !== null}
        onClose={() => setUnlockSlotIdx(null)}
        title="YENİ MAKARA YUVASI AÇ"
      >
        <Ionicons name="lock-open" size={48} color={UI.gold} style={{ alignSelf: 'center', marginVertical: 6 }} />
        <T style={{ textAlign: 'center', color: UI.plumLight, marginVertical: 6 }}>
          Rafına 1 yeni yuva ekleyerek daha fazla makara tutabilir ve tıkanmaları önleyebilirsin!
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
          <T style={{ marginRight: 8 }}>Mevcut Altın:</T>
          <CoinBadge coins={data.coins} />
        </View>
        <YarnButton
          label={`🟡 ${unlockSlotIdx !== null ? (SLOT_UNLOCK_PRICES[unlockSlotIdx] ?? 40) : 40} Altın ile Aç (Bu Bölüm)`}
          color="gold"
          onPress={() => {
            const price = unlockSlotIdx !== null ? (SLOT_UNLOCK_PRICES[unlockSlotIdx] ?? 40) : 40;
            if (data.coins < price) {
              showToast('Yeterli altının yok!');
              return play('blocked');
            }
            update((d) => ({
              ...d,
              coins: d.coins - price,
            }));
            const nextState = cloneState(gameRef.current);
            nextState.rack.push(null);
            setBoth(nextState);
            setUnlockSlotIdx(null);
            play('win');
            buzz('success');
            showToast('🎉 Bu Bölüm İçin Yeni Yuva Açıldı!');
          }}
          disabled={data.coins < (unlockSlotIdx !== null ? (SLOT_UNLOCK_PRICES[unlockSlotIdx] ?? 40) : 40)}
          style={{ alignSelf: 'stretch', marginBottom: 10 }}
        />
        <YarnButton
          label="🎬 Reklam İzle (Ücretsiz Aç)"
          color="mint"
          onPress={() => setShowRewardedSlotAd(true)}
          style={{ alignSelf: 'stretch' }}
        />
      </Sheet>

      {/* Color Swap Sheet */}
      <Sheet
        visible={swapSlotIdx !== null}
        onClose={() => setSwapSlotIdx(null)}
        title="MAKARA RENGİNİ DÖNÜŞTÜR"
      >
        <Ionicons name="color-palette" size={48} color={UI.coral} style={{ alignSelf: 'center', marginVertical: 6 }} />
        <T style={{ textAlign: 'center', color: UI.plumLight, marginVertical: 6 }}>
          Bu makarayı yılanın kafasındaki renge dönüştür! Anında ipler çözülmeye başlayacak.
        </T>
        {swapSlotIdx !== null && game.rack[swapSlotIdx] && game.segments[0] && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 12, gap: 14 }}>
            <View style={{ alignItems: 'center' }}>
              <T style={{ fontSize: 11, color: UI.plumLight, marginBottom: 4 }}>Şu Anki</T>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: YARN[game.rack[swapSlotIdx]!.color]?.base ?? '#CCC' }} />
            </View>
            <Ionicons name="arrow-forward" size={20} color={UI.plumLight} />
            <View style={{ alignItems: 'center' }}>
              <T style={{ fontSize: 11, color: UI.plumLight, marginBottom: 4 }}>Dönüşecek</T>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: YARN[game.segments[0].color]?.base ?? '#CCC' }} />
            </View>
          </View>
        )}
        <YarnButton
          label={`🟡 ${COLOR_SWAP_PRICE} Altın ile Dönüştür`}
          color="gold"
          onPress={() => {
            if (swapSlotIdx === null || !game.rack[swapSlotIdx] || !game.segments[0]) return;
            if (data.coins < COLOR_SWAP_PRICE) {
              showToast('Yeterli altının yok!');
              return play('blocked');
            }
            update((d) => ({ ...d, coins: d.coins - COLOR_SWAP_PRICE }));
            executeColorSwap(swapSlotIdx);
          }}
          disabled={data.coins < COLOR_SWAP_PRICE}
          style={{ alignSelf: 'stretch', marginBottom: 10 }}
        />
        <YarnButton
          label="🎬 Reklam İzle (Ücretsiz Dönüştür)"
          color="mint"
          onPress={() => {
            if (swapSlotIdx === null || !game.rack[swapSlotIdx] || !game.segments[0]) return;
            setShowRewardedSwapAd(true);
          }}
          style={{ alignSelf: 'stretch' }}
        />
      </Sheet>

      <HowToPlaySheet
        visible={howToOpen}
        onClose={() => setHowToOpen(false)}
        onReplayTutorial={() => setTutStep(0)}
      />
      <MechanicIntroSheet mechanic={introMech} onClose={dismissIntroMech} />
      {/* 3 Completed Levels Interstitial Ad (Plays before advancing to next level) */}
      <InterstitialAdModal
        visible={showLevelAd}
        onClose={onLevelAdDismiss}
        title="Sıradaki Bölüm Reklamı"
        isRewarded={false}
      />

      {/* Rewarded Revive Ad */}
      <InterstitialAdModal
        visible={showRewardedReviveAd}
        onClose={() => {
          setShowRewardedReviveAd(false);
          setAdReviveUsed(true);
          executeRevive(true);
        }}
        title="Canlanma Ödüllü Reklamı"
        isRewarded={true}
      />

      {/* Rewarded Slot Unlock Ad */}
      <InterstitialAdModal
        visible={showRewardedSlotAd}
        onClose={() => {
          setShowRewardedSlotAd(false);
          const nextState = cloneState(gameRef.current);
          nextState.rack.push(null);
          setBoth(nextState);
          setUnlockSlotIdx(null);
          play('win');
          buzz('success');
          showToast('🎉 Reklam Ödülü: Yeni Yuva Açıldı!');
        }}
        title="Yuva Açma Ödüllü Reklamı"
        isRewarded={true}
      />

      {/* Rewarded Color Swap Ad */}
      <InterstitialAdModal
        visible={showRewardedSwapAd}
        onClose={() => {
          setShowRewardedSwapAd(false);
          if (swapSlotIdx !== null) {
            executeColorSwap(swapSlotIdx);
          }
        }}
        title="Renk Dönüştürme Ödüllü Reklamı"
        isRewarded={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 52,
  },
  levelPill: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5D6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#F3C5A8',
  },
  bottomArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 'auto',
    paddingBottom: 2,
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  tutorialCard: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: UI.coral,
  },
  shelf: {
    marginHorizontal: 12,
    maxWidth: 420,
    alignSelf: 'center',
    width: '94%',
    marginTop: 2,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(54, 25, 10, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(235, 195, 150, 0.40)',
    borderBottomWidth: 2.5,
    borderBottomColor: 'rgba(25, 10, 4, 0.70)',
  },
  slot: { alignItems: 'center', justifyContent: 'center' },
  emptySlot: {
    borderWidth: 2,
    borderColor: 'rgba(235, 195, 150, 0.40)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(20, 8, 3, 0.35)',
  },
  lockedSlot: {
    backgroundColor: 'rgba(38, 16, 5, 0.70)',
    borderWidth: 1.5,
    borderColor: 'rgba(235, 195, 150, 0.35)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  unlockPriceBadge: {
    backgroundColor: '#8C4312',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
    borderWidth: 1,
    borderColor: UI.gold,
  },
  spoolTrayWrapper: {
    paddingHorizontal: 10,
    maxWidth: 430,
    alignSelf: 'center',
    width: '100%',
    marginTop: 3,
    marginBottom: 2,
    justifyContent: 'center',
  },
  spoolTray: {
    backgroundColor: 'rgba(64, 30, 12, 0.60)',
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(235, 195, 150, 0.45)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(25, 10, 4, 0.75)',
    minHeight: 110,
    height: 110,
    justifyContent: 'center',
  },
  queues: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 96,
  },
  moreBadge: {
    marginTop: 2,
    backgroundColor: UI.plumLight,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  emptyCol: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(235, 195, 150, 0.35)',
    backgroundColor: 'rgba(20, 8, 3, 0.25)',
  },
  boosters: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 2,
    paddingBottom: 4,
  },
  booster: {
    width: 72,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#E7CFC0',
  },
  boosterCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: UI.coral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toastWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: 'rgba(91,58,94,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: UI.gold,
  },
});
