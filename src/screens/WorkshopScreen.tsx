import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz, playAsmrComboTone, playAsmrFeverChord } from '../audio';
import { Bouncy, FONT, RoundIcon, T } from '../components/ui';
import { useSave } from '../save';
import { UI } from '../theme';
import {
  getBobbinOutfit,
  getWorkshopItem,
  getWorkshopRoom,
  getWorkshopUI,
} from '../workshopI18n';

// 6 Progressive 3D Miniature Diorama Room Stages for Room 1: Usta Atölyesi
const WORKSHOP_STAGE_IMAGES: Record<number, ImageSourcePropType> = {
  0: require('../../assets/images/workshop_stage_0.jpg'), // Sade boş ahşap oda
  1: require('../../assets/images/workshop_stage_1.jpg'), // + Sallanan Ahşap Koltuk
  2: require('../../assets/images/workshop_stage_2.jpg'), // + Köy Tuğlası Şömine
  3: require('../../assets/images/workshop_stage_3.jpg'), // + El Dokuması Kelt Halısı
  4: require('../../assets/images/workshop_stage_4.jpg'), // + Ihlamur & Demlik Köşesi
  5: require('../../assets/images/workshop_stage_5.jpg'), // + Antika Ahşap Çıkrık & Yumak Vitrini
};

// 6 Progressive 3D Miniature Diorama Room Stages for Room 2: Kışlık Kar Dağ Evi
const SKI_LODGE_STAGE_IMAGES: Record<number, ImageSourcePropType> = {
  0: require('../../assets/images/ski_lodge_stage_0.jpg'), // Sade boş kütük dağ kulübesi
  1: require('../../assets/images/ski_lodge_stage_1.jpg'), // + Döküm Demir Kuzine Dağ Sobası
  2: require('../../assets/images/ski_lodge_stage_2.jpg'), // + Peluş Beyaz Koyun Postu & Kütük Sehpa
  3: require('../../assets/images/ski_lodge_stage_3.jpg'), // + Vintage Ahşap Kros Kayaklar
  4: require('../../assets/images/ski_lodge_stage_4.jpg'), // + Sıcak Çikolata & Marşmelov
  5: require('../../assets/images/ski_lodge_stage_5.jpg'), // + Karlı Pencere Sediri & Kar Feneri
};

// Real 3D Bobbin Character Sprites with Ground Contact Shadows (Alpha RGBA PNGs)
const BOBBIN_OUTFIT_IMAGES: Record<string, ImageSourcePropType> = {
  none: require('../../assets/images/bobbin_none.png'),
  classic_honey: require('../../assets/images/bobbin_honey.png'),
  arctic_sky: require('../../assets/images/bobbin_arctic.png'),
  emerald_moss: require('../../assets/images/bobbin_emerald.png'),
  royal_berry: require('../../assets/images/bobbin_royal.png'),
  winter_fur: require('../../assets/images/bobbin_winter_fur.png'),
};

interface WorkshopItemBase {
  id: string;
  step: number;
  starsRequired: number;
  icon: keyof typeof Ionicons.glyphMap;
  colorTag: string;
}

interface WorkshopItem extends WorkshopItemBase {
  name: string;
  shortLabel: string;
  desc: string;
}

// Room 1 Items Base: Usta Atölyesi
const WORKSHOP_CATALOG_BASE: WorkshopItemBase[] = [
  { id: 'rocking_chair', step: 1, starsRequired: 5, icon: 'partly-sunny' as any, colorTag: '#E06D53' },
  { id: 'fireplace', step: 2, starsRequired: 10, icon: 'flame', colorTag: '#F59E0B' },
  { id: 'woven_rug', step: 3, starsRequired: 15, icon: 'color-palette', colorTag: '#10B981' },
  { id: 'tea_station', step: 4, starsRequired: 20, icon: 'cafe', colorTag: '#6366F1' },
  { id: 'antique_loom', step: 5, starsRequired: 30, icon: 'construct', colorTag: '#EC4899' },
];

// Room 2 Items Base: Kışlık Kar Dağ Evi
const SKI_LODGE_CATALOG_BASE: WorkshopItemBase[] = [
  { id: 'cast_iron_stove', step: 1, starsRequired: 5, icon: 'flame', colorTag: '#E06D53' },
  { id: 'sheepskin_rug', step: 2, starsRequired: 10, icon: 'color-palette', colorTag: '#F59E0B' },
  { id: 'vintage_skis', step: 3, starsRequired: 15, icon: 'snow' as any, colorTag: '#0EA5E9' },
  { id: 'hot_cocoa', step: 4, starsRequired: 20, icon: 'cafe', colorTag: '#8B5CF6' },
  { id: 'tartan_daybed', step: 5, starsRequired: 30, icon: 'home', colorTag: '#10B981' },
];

interface KnitwearItemBase {
  id: string;
  starsRequired: number;
  color: string;
  accentEmoji: string;
  image: ImageSourcePropType;
}

interface KnitwearItem extends KnitwearItemBase {
  name: string;
  desc: string;
}

const KNITWEAR_CATALOG_BASE: KnitwearItemBase[] = [
  { id: 'none', starsRequired: 0, color: '#92400E', accentEmoji: '🪵', image: BOBBIN_OUTFIT_IMAGES.none },
  { id: 'classic_honey', starsRequired: 3, color: '#F59E0B', accentEmoji: '🧣', image: BOBBIN_OUTFIT_IMAGES.classic_honey },
  { id: 'arctic_sky', starsRequired: 8, color: '#0EA5E9', accentEmoji: '❄️', image: BOBBIN_OUTFIT_IMAGES.arctic_sky },
  { id: 'winter_fur', starsRequired: 12, color: '#38BDF8', accentEmoji: '🎿', image: BOBBIN_OUTFIT_IMAGES.winter_fur },
  { id: 'emerald_moss', starsRequired: 16, color: '#10B981', accentEmoji: '🌲', image: BOBBIN_OUTFIT_IMAGES.emerald_moss },
  { id: 'royal_berry', starsRequired: 25, color: '#8B5CF6', accentEmoji: '👑', image: BOBBIN_OUTFIT_IMAGES.royal_berry },
];

interface RoomDefBase {
  id: string;
  stages: Record<number, ImageSourcePropType>;
  catalogBase: WorkshopItemBase[];
  unlockLevel: number;
  isComingSoon?: boolean;
}

interface RoomDef extends RoomDefBase {
  name: string;
  badge: string;
  subtitle: string;
  unlockConditionText: string;
  catalog: WorkshopItem[];
}

const ROOM_DEFINITIONS_BASE: RoomDefBase[] = [
  {
    id: 'artisan_loft',
    stages: WORKSHOP_STAGE_IMAGES,
    catalogBase: WORKSHOP_CATALOG_BASE,
    unlockLevel: 1,
  },
  {
    id: 'ski_lodge',
    stages: SKI_LODGE_STAGE_IMAGES,
    catalogBase: SKI_LODGE_CATALOG_BASE,
    unlockLevel: 50,
  },
  {
    id: 'holiday_hearth',
    stages: WORKSHOP_STAGE_IMAGES,
    catalogBase: [],
    unlockLevel: 100,
    isComingSoon: true,
  },
  {
    id: 'coastal_terrace',
    stages: WORKSHOP_STAGE_IMAGES,
    catalogBase: [],
    unlockLevel: 150,
    isComingSoon: true,
  },
];

export function WorkshopScreen({ onBack }: { onBack: () => void }) {
  const { data, update, lang } = useSave();
  const insets = useSafeAreaInsets();
  const currentLang = lang || 'en';
  const ui = useMemo(() => getWorkshopUI(currentLang), [currentLang]);

  const localizedRooms: RoomDef[] = useMemo(() => {
    return ROOM_DEFINITIONS_BASE.map((r) => {
      const rLoc = getWorkshopRoom(r.id, currentLang);
      const catalog: WorkshopItem[] = r.catalogBase.map((item) => {
        const itLoc = getWorkshopItem(item.id, currentLang);
        return {
          ...item,
          name: itLoc.name,
          shortLabel: itLoc.shortLabel,
          desc: itLoc.desc,
        };
      });
      return {
        ...r,
        name: rLoc.name,
        badge: rLoc.badge,
        subtitle: rLoc.subtitle,
        unlockConditionText: rLoc.unlockConditionText,
        catalog,
      };
    });
  }, [currentLang]);

  const localizedKnitwear: KnitwearItem[] = useMemo(() => {
    return KNITWEAR_CATALOG_BASE.map((k) => {
      const oLoc = getBobbinOutfit(k.id, currentLang);
      return {
        ...k,
        name: oLoc.name,
        desc: oLoc.desc,
      };
    });
  }, [currentLang]);

  const [activeRoomId, setActiveRoomId] = useState<string>(data.activeRoomId || 'artisan_loft');
  const activeRoom = localizedRooms.find((r) => r.id === activeRoomId) || localizedRooms[0];
  const currentCatalog = activeRoom.catalog;

  const availableStars = Math.max(
    0,
    Object.values(data.stars || {}).reduce((a, b) => a + (b || 0), 0) + (data.bonusStars || 0) - (data.spentStars || 0)
  );
  const unlockedList = data.workshopItems || [];
  const unlockedSet = new Set(unlockedList);
  const purchasedOutfits = data.purchasedOutfits || ['none'];

  // Check if a room theme is unlocked
  const isRoomUnlocked = (roomId: string) => {
    if (roomId === 'artisan_loft') return true;
    if (roomId === 'ski_lodge') {
      const room1Count = WORKSHOP_CATALOG_BASE.filter((i) => unlockedSet.has(i.id)).length;
      return (
        (data.unlocked || 1) >= 50 ||
        room1Count >= 4 ||
        (data.unlockedRooms && data.unlockedRooms.includes('ski_lodge'))
      );
    }
    return false;
  };

  // Highest sequential stage unlocked for the active room (0..5)
  let highestUnlockedStage = 0;
  for (const item of currentCatalog) {
    if (unlockedSet.has(item.id)) {
      highestUnlockedStage = Math.max(highestUnlockedStage, item.step);
    }
  }

  // Allow player to preview/toggle any stage up to highestUnlockedStage
  const [displayedStage, setDisplayedStage] = useState<number>(highestUnlockedStage);
  useEffect(() => {
    setDisplayedStage(highestUnlockedStage);
  }, [highestUnlockedStage, activeRoomId]);

  const currentOutfitId = data.bobbinOutfit || 'none';
  const activeOutfit =
    localizedKnitwear.find((o) => o.id === currentOutfitId) || localizedKnitwear[0];

  const [activeTab, setActiveTab] = useState<'room' | 'knitwear'>('room');
  const [speech, setSpeech] = useState<string>('');

  useEffect(() => {
    if (highestUnlockedStage === 0 && currentOutfitId === 'none') {
      setSpeech(ui.welcomeEmpty(activeRoom.name));
    } else {
      setSpeech(ui.welcomeReturn(activeRoom.name));
    }
  }, [activeRoom.name, currentLang]);

  // Pop animation when room stage or Bobbin outfit changes
  const characterPop = useRef(new Animated.Value(1)).current;
  const roomFade = useRef(new Animated.Value(1)).current;

  const animateRoomChange = () => {
    roomFade.setValue(0.82);
    Animated.spring(roomFade, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const animateCharacterPop = () => {
    characterPop.setValue(0.88);
    Animated.spring(characterPop, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 12,
    }).start();
  };

  const handleSelectRoom = (room: RoomDef) => {
    if (room.id === activeRoomId) return;
    const unlocked = isRoomUnlocked(room.id);
    if (!unlocked) {
      if (room.isComingSoon) {
        setSpeech(ui.roomLockedSoon(room.name));
      } else {
        setSpeech(ui.roomLockedProgress(room.name));
      }
      playAsmrComboTone(1);
      buzz('error');
      return;
    }

    setActiveRoomId(room.id);
    update((d) => ({ ...d, activeRoomId: room.id }));
    animateRoomChange();
    animateCharacterPop();
    playAsmrComboTone(2);
    buzz('light');
    setSpeech(ui.roomSelected(room.name));
  };

  const handleRoomItemAction = (item: WorkshopItem) => {
    const isUnlocked = unlockedSet.has(item.id);

    // If already unlocked: toggle between showing up to this stage vs hiding it
    if (isUnlocked) {
      if (displayedStage === item.step) {
        const prevStage = item.step - 1;
        setDisplayedStage(prevStage);
        animateRoomChange();
        setSpeech(ui.itemHidden(item.name, prevStage));
      } else {
        setDisplayedStage(item.step);
        animateRoomChange();
        setSpeech(ui.itemShown(item.name));
      }
      playAsmrComboTone(1);
      buzz('light');
      return;
    }

    // Sequential check: must unlock previous step first
    const prevItem = currentCatalog.find((x) => x.step === item.step - 1);
    if (prevItem && !unlockedSet.has(prevItem.id)) {
      setSpeech(ui.prevItemReq(prevItem.name, prevItem.starsRequired));
      buzz('error');
      return;
    }

    if (availableStars < item.starsRequired) {
      setSpeech(ui.needStarsItem(item.name, item.starsRequired, availableStars));
      buzz('error');
      return;
    }

    // Deduct stars and unlock item!
    const nextUnlocked = Array.from(new Set([...unlockedList, item.id]));
    const nextRemaining = availableStars - item.starsRequired;
    update((d) => ({
      ...d,
      spentStars: (d.spentStars || 0) + item.starsRequired,
      workshopItems: nextUnlocked,
    }));
    setDisplayedStage(item.step);
    animateRoomChange();
    animateCharacterPop();
    setSpeech(ui.itemUnlocked(item.name, item.starsRequired, nextRemaining));
    playAsmrFeverChord();
    buzz('success');
  };

  const handleSelectOutfit = (outfit: KnitwearItem) => {
    const isOwned = purchasedOutfits.includes(outfit.id) || outfit.id === 'none';

    // If already equipped and not 'none', unequip back to 'none'
    if (currentOutfitId === outfit.id && outfit.id !== 'none') {
      update((d) => ({
        ...d,
        bobbinOutfit: 'none',
      }));
      animateCharacterPop();
      setSpeech(ui.outfitUnequipped(outfit.name));
      playAsmrComboTone(1);
      buzz('light');
      return;
    }

    // If already owned, equip for free!
    if (isOwned) {
      update((d) => ({
        ...d,
        bobbinOutfit: outfit.id,
      }));
      animateCharacterPop();
      setSpeech(outfit.id === 'none' ? ui.outfitReset() : ui.outfitEquipped(outfit.name));
      playAsmrComboTone(3);
      buzz('success');
      return;
    }

    // If not owned, check available stars to purchase!
    if (availableStars < outfit.starsRequired) {
      setSpeech(ui.needStarsOutfit(outfit.name, outfit.starsRequired, availableStars));
      buzz('error');
      return;
    }

    // Deduct stars, add to purchased outfits, and equip!
    const nextPurchased = Array.from(new Set([...purchasedOutfits, outfit.id]));
    const nextRemaining = availableStars - outfit.starsRequired;
    update((d) => ({
      ...d,
      spentStars: (d.spentStars || 0) + outfit.starsRequired,
      purchasedOutfits: nextPurchased,
      bobbinOutfit: outfit.id,
    }));
    animateCharacterPop();
    setSpeech(ui.outfitUnlocked(outfit.name, outfit.starsRequired, nextRemaining));
    playAsmrComboTone(3);
    buzz('success');
  };

  const unlockedCount = currentCatalog.filter((i) => unlockedSet.has(i.id)).length;
  const progressRatio = currentCatalog.length > 0 ? Math.min(1, unlockedCount / currentCatalog.length) : 0;
  const currentRoomImage = activeRoom.stages[displayedStage] || activeRoom.stages[0];
  const currentBobbinImage = BOBBIN_OUTFIT_IMAGES[activeOutfit.id] || BOBBIN_OUTFIT_IMAGES.none;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <RoundIcon icon="arrow-back" onPress={onBack} bg="#FDE68A" />
        <View style={styles.titleWrap}>
          <T numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.titleText}>
            {activeRoom.name}
          </T>
          <T numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.subtitleText}>
            {activeRoom.subtitle}
          </T>
        </View>
        <View style={styles.starPill}>
          <T style={{ fontSize: 16 }}>⭐</T>
          <T style={styles.starCount}>{availableStars}</T>
        </View>
      </View>

      {/* Room Themes Carousel / Selector */}
      <View style={{ backgroundColor: '#FDF2E2', borderBottomWidth: 1, borderColor: '#F3D5C1' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomSelectorRow}>
          {localizedRooms.map((room) => {
            const isActive = room.id === activeRoomId;
            const isUnlocked = isRoomUnlocked(room.id);
            const count = room.catalog.filter((i) => unlockedSet.has(i.id)).length;
            const pct = room.catalog.length > 0 ? Math.round((count / room.catalog.length) * 100) : 0;

            return (
              <TouchableOpacity
                key={room.id}
                onPress={() => handleSelectRoom(room)}
                activeOpacity={0.8}
                style={[
                  styles.roomPill,
                  isActive && styles.roomPillActive,
                  !isUnlocked && styles.roomPillLocked,
                ]}
              >
                <T style={[styles.roomPillText, isActive && styles.roomPillTextActive]}>
                  {!isUnlocked ? '🔒 ' : ''}
                  {room.badge}
                </T>
                {isUnlocked && room.catalog.length > 0 && (
                  <View style={[styles.roomPillBadge, isActive && { backgroundColor: '#F59E0B' }]}>
                    <T style={[styles.roomPillBadgeText, isActive && { color: '#3D2010' }]}>
                      {pct}%
                    </T>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabletCenterWrap}>
        {/* Live Progressive 3D Diorama Room + Real 3D Outfitted Bobbin */}
        <Animated.View style={[styles.dioramaCard, { opacity: roomFade }]}>
          {/* Layer 1: Progressive 3D Room Background (Stage 0..5) */}
          <Image source={currentRoomImage} style={styles.dioramaImage} resizeMode="cover" />

          {/* Layer 2: Real 3D Bobbin with Equipped Knitwear Standing in Room */}
          <Animated.View
            pointerEvents="none"
            style={[styles.bobbinCharacterContainer, { transform: [{ scale: characterPop }] }]}
          >
            <Image source={currentBobbinImage} style={styles.bobbinCharacterImage} resizeMode="contain" />
          </Animated.View>

          {/* Warm Vintage Vignette Frame */}
          <View style={styles.dioramaBorderOverlay} pointerEvents="none" />

          {/* Top-Left Live Stage Status Pill */}
          <View style={styles.stageStatusPill}>
            <Ionicons name="home" size={12} color="#FDE68A" />
            <T style={styles.stageStatusText}>
              {displayedStage === 0
                ? `${activeRoom.badge}: ${ui.bareStart}`
                : `${activeRoom.badge}: ${ui.itemsCount(displayedStage, currentCatalog.length)}`}
            </T>
          </View>

          {/* Bottom-Right Active Outfit Indicator Pill */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setActiveTab('knitwear');
              buzz('light');
            }}
            style={[styles.equippedPinBadge, { borderColor: activeOutfit.color }]}
          >
            <View style={[styles.equippedColorDot, { backgroundColor: activeOutfit.color }]}>
              <T style={{ fontSize: 11 }}>{activeOutfit.accentEmoji}</T>
            </View>
            <T style={styles.equippedPinText}>
              {activeOutfit.id === 'none' ? ui.outfitBare : ui.equipped(activeOutfit.name)}
            </T>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stage Switcher Bar */}
        {highestUnlockedStage > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stageSwitcherRow}>
            <TouchableOpacity
              onPress={() => {
                setDisplayedStage(0);
                animateRoomChange();
                buzz('light');
              }}
              style={[styles.stageChip, displayedStage === 0 && styles.stageChipActive]}
            >
              <T style={[styles.stageChipText, displayedStage === 0 && styles.stageChipTextActive]}>
                {ui.bareRoomChip}
              </T>
            </TouchableOpacity>

            {currentCatalog
              .filter((i) => i.step <= highestUnlockedStage)
              .map((item) => {
                const active = displayedStage === item.step;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      setDisplayedStage(item.step);
                      animateRoomChange();
                      buzz('light');
                    }}
                    style={[styles.stageChip, active && styles.stageChipActive]}
                  >
                    <T style={[styles.stageChipText, active && styles.stageChipTextActive]}>
                      + {item.shortLabel}
                    </T>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        )}

        {/* Bobbin Dialogue Card */}
        <View style={styles.speechCardOutside}>
          <View style={styles.speechAvatarBadge}>
            <Image source={currentBobbinImage} style={{ width: 30, height: 30 }} resizeMode="contain" />
          </View>
          <T style={styles.speechText}>{speech}</T>
        </View>

        {/* Room Restoration Progress Gauge */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <T style={styles.progressTitle}>{ui.progressTitle(activeRoom.badge)}</T>
            <T style={styles.progressPercent}>{Math.round(progressRatio * 100)}%</T>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${Math.max(4, progressRatio * 100)}%` }]} />
          </View>
          <T style={styles.progressSub}>{ui.progressSub(unlockedCount, currentCatalog.length)}</T>
        </View>

        {/* Category Tabs: Oda Eşyaları & Bobbin Kıyafetleri */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'room' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('room');
              buzz('light');
            }}
          >
            <Ionicons name="home" size={18} color={activeTab === 'room' ? '#78350F' : UI.plumLight} />
            <T
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={[styles.tabText, activeTab === 'room' && styles.tabTextActive]}
            >
              {activeRoom.badge} ({unlockedCount}/{currentCatalog.length})
            </T>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'knitwear' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('knitwear');
              buzz('light');
            }}
          >
            <Ionicons name="shirt" size={18} color={activeTab === 'knitwear' ? '#78350F' : UI.plumLight} />
            <T
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={[styles.tabText, activeTab === 'knitwear' && styles.tabTextActive]}
            >
              {ui.tabKnitwear}
            </T>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Oda Eşyaları */}
        {activeTab === 'room' && (
          <View style={styles.itemList}>
            {currentCatalog.map((item) => {
              const isUnlocked = unlockedSet.has(item.id);
              const isVisibleInRoom = isUnlocked && displayedStage >= item.step;
              const isNextStep = item.step === highestUnlockedStage + 1;
              const canAfford = availableStars >= item.starsRequired && isNextStep;

              return (
                <View
                  key={item.id}
                  style={[styles.itemCard, isNextStep && { borderColor: '#F59E0B', borderWidth: 2 }]}
                >
                  <View
                    style={[
                      styles.itemIconWrap,
                      { backgroundColor: isUnlocked ? item.colorTag : isNextStep ? '#FEF3C7' : '#E5E7EB' },
                    ]}
                  >
                    <Ionicons
                      name={item.icon ? (item.icon as any) : 'home'}
                      size={24}
                      color={isUnlocked ? '#fff' : isNextStep ? '#D97706' : '#9CA3AF'}
                    />
                    <View style={styles.stepNumberBadge}>
                      <T style={styles.stepNumberText}>{item.step}</T>
                    </View>
                  </View>

                  <View style={styles.itemInfo}>
                    <T style={styles.itemName}>{item.name}</T>
                    <T style={styles.itemDesc}>{item.desc}</T>
                    <View style={styles.itemMeta}>
                      <T
                        style={{
                          fontSize: 12.5,
                          color: isUnlocked ? '#10B981' : '#F59E0B',
                          fontFamily: FONT.bold,
                        }}
                      >
                        {isUnlocked
                          ? isVisibleInRoom
                            ? ui.visibleInRoom
                            : ui.hiddenInRoom
                          : isNextStep
                          ? canAfford
                            ? ui.canBuyStars(item.starsRequired)
                            : ui.needStars(item.starsRequired, availableStars)
                          : ui.unlockAfterStep(item.step - 1, item.starsRequired)}
                      </T>
                    </View>
                  </View>

                  <Bouncy
                    onPress={() => handleRoomItemAction(item)}
                    style={[
                      styles.actionBtn,
                      isUnlocked
                        ? isVisibleInRoom
                          ? styles.actionBtnActive
                          : { backgroundColor: '#6B7280' }
                        : canAfford
                        ? styles.actionBtnAfford
                        : styles.actionBtnLocked,
                    ]}
                  >
                    <T
                      style={[
                        styles.actionBtnText,
                        (isUnlocked || canAfford) && styles.actionBtnTextActive,
                      ]}
                    >
                      {isUnlocked
                        ? isVisibleInRoom
                          ? ui.inPlace
                          : ui.hidden
                        : canAfford
                        ? ui.buy
                        : isNextStep
                        ? `${item.starsRequired} ⭐`
                        : ui.locked}
                    </T>
                  </Bouncy>
                </View>
              );
            })}
          </View>
        )}

        {/* Tab 2: Bobbin Kıyafetleri */}
        {activeTab === 'knitwear' && (
          <View style={styles.itemList}>
            <View style={styles.identityNotice}>
              <Ionicons name="sparkles" size={18} color="#D97706" />
              <T style={styles.identityNoticeText}>{ui.identityNotice}</T>
            </View>

            {localizedKnitwear.map((outfit) => {
              const isEquipped = currentOutfitId === outfit.id;
              const isOwned = purchasedOutfits.includes(outfit.id) || outfit.id === 'none';
              const canAfford = availableStars >= outfit.starsRequired;

              return (
                <View
                  key={outfit.id}
                  style={[styles.itemCard, isEquipped && { borderColor: '#10B981', borderWidth: 2 }]}
                >
                  <View
                    style={[
                      styles.outfitThumbWrap,
                      { borderColor: isEquipped ? '#10B981' : outfit.color },
                    ]}
                  >
                    <Image source={outfit.image} style={styles.outfitThumbImage} resizeMode="contain" />
                  </View>

                  <View style={styles.itemInfo}>
                    <T style={styles.itemName}>{outfit.name}</T>
                    <T style={styles.itemDesc}>{outfit.desc}</T>
                    <View style={styles.itemMeta}>
                      <T
                        style={{
                          fontSize: 12.5,
                          color: isEquipped ? '#10B981' : isOwned ? '#3B82F6' : '#F59E0B',
                          fontFamily: FONT.bold,
                        }}
                      >
                        {outfit.starsRequired === 0
                          ? ui.starterLook
                          : isEquipped
                          ? ui.equippedOnBobbin
                          : isOwned
                          ? ui.inWardrobe
                          : canAfford
                          ? ui.buyOutfitStars(outfit.starsRequired)
                          : ui.needStars(outfit.starsRequired, availableStars)}
                      </T>
                    </View>
                  </View>

                  <Bouncy
                    onPress={() => handleSelectOutfit(outfit)}
                    style={[
                      styles.actionBtn,
                      isEquipped
                        ? styles.actionBtnActive
                        : isOwned || canAfford
                        ? styles.actionBtnAfford
                        : styles.actionBtnLocked,
                    ]}
                  >
                    <T
                      style={[
                        styles.actionBtnText,
                        (isEquipped || isOwned || canAfford) && styles.actionBtnTextActive,
                      ]}
                    >
                      {isEquipped
                        ? outfit.id === 'none'
                          ? ui.natural
                          : ui.unequip
                        : isOwned
                        ? outfit.id === 'none'
                          ? ui.strip
                          : ui.equip
                        : canAfford
                        ? ui.buyStarsBtn(outfit.starsRequired)
                        : `⭐ ${outfit.starsRequired}`}
                    </T>
                  </Bouncy>
                </View>
              );
            })}
          </View>
        )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFBEB',
    borderBottomWidth: 1.5,
    borderColor: '#F3D5C1',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    fontFamily: FONT.black,
    fontSize: 20,
    color: '#451A03',
  },
  subtitleText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#92400E',
    marginTop: 1,
  },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  starCount: {
    fontFamily: FONT.black,
    fontSize: 16,
    color: '#78350F',
  },
  roomSelectorRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexGrow: 1,
    justifyContent: 'center',
  },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  roomPillActive: {
    backgroundColor: '#451A03',
    borderColor: '#451A03',
  },
  roomPillLocked: {
    opacity: 0.75,
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  roomPillText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#78350F',
  },
  roomPillTextActive: {
    color: '#FEF3C7',
  },
  roomPillBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  roomPillBadgeText: {
    fontSize: 10.5,
    fontFamily: FONT.black,
    color: '#78350F',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  tabletCenterWrap: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  dioramaCard: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#26150C',
    shadowColor: '#451A03',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#E7D5C0',
  },
  dioramaImage: {
    width: '100%',
    height: '100%',
  },
  bobbinCharacterContainer: {
    position: 'absolute',
    right: '8%',
    bottom: '4%',
    width: '42%',
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 10,
  },
  bobbinCharacterImage: {
    width: '100%',
    height: '100%',
  },
  dioramaBorderOverlay: {
    ...StyleSheet.absoluteFill as any,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  stageStatusPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(41, 24, 12, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 20,
  },
  stageStatusText: {
    fontSize: 11.5,
    color: '#FEF3C7',
    fontFamily: FONT.bold,
  },
  equippedPinBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(41, 24, 12, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    zIndex: 20,
    maxWidth: '75%',
  },
  equippedColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedPinText: {
    fontSize: 11.5,
    fontFamily: FONT.bold,
    color: '#FEF3C7',
  },
  stageSwitcherRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  stageChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  stageChipActive: {
    backgroundColor: '#78350F',
    borderColor: '#78350F',
  },
  stageChipText: {
    fontSize: 12,
    fontFamily: FONT.bold,
    color: '#4B5563',
  },
  stageChipTextActive: {
    color: '#FFFFFF',
  },
  speechCardOutside: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 12,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  speechAvatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  speechText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 17,
    color: '#78350F',
    fontFamily: FONT.bold,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#F1E6D4',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#451A03',
  },
  progressPercent: {
    fontFamily: FONT.black,
    fontSize: 14,
    color: '#D97706',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 4,
  },
  progressSub: {
    fontSize: 11.5,
    fontFamily: FONT.bold,
    color: '#92400E',
    marginTop: 6,
    textAlign: 'right',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#F9F5EE',
    borderWidth: 1.5,
    borderColor: '#F1E6D4',
  },
  tabButtonActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  tabText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#9CA3AF',
    flexShrink: 1,
  },
  tabTextActive: {
    color: '#78350F',
  },
  itemList: {
    marginTop: 12,
    gap: 10,
  },
  identityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  identityNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#F1E6D4',
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  itemIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stepNumberBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#451A03',
    borderWidth: 1.5,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 10,
    color: '#FEF3C7',
    fontFamily: FONT.black,
  },
  outfitThumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#29180C',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  outfitThumbImage: {
    width: 50,
    height: 50,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: FONT.black,
    fontSize: 14.5,
    color: '#451A03',
  },
  itemDesc: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 15,
  },
  itemMeta: {
    marginTop: 4,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  actionBtnActive: {
    backgroundColor: '#10B981',
  },
  actionBtnAfford: {
    backgroundColor: '#F59E0B',
  },
  actionBtnLocked: {
    backgroundColor: '#E5E7EB',
  },
  actionBtnText: {
    fontFamily: FONT.black,
    fontSize: 12,
    color: '#6B7280',
  },
  actionBtnTextActive: {
    color: '#FFFFFF',
  },
});
