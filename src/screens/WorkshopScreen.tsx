import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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

interface WorkshopItem {
  id: string;
  step: number; // 1..5 sequential room stage
  name: string;
  shortLabel: string;
  desc: string;
  starsRequired: number;
  icon: keyof typeof Ionicons.glyphMap;
  colorTag: string;
}

// Room 1 Items: Usta Atölyesi
const WORKSHOP_CATALOG: WorkshopItem[] = [
  {
    id: 'rocking_chair',
    step: 1,
    name: 'Sallanan Ahşap Koltuk',
    shortLabel: '1. Koltuk',
    desc: 'Torna kayın ağacından oyulmuş, mercan yün minderli dinlenme koltuğu odaya eklenir.',
    starsRequired: 5,
    icon: 'PartlySunny' as any,
    colorTag: '#E06D53',
  },
  {
    id: 'fireplace',
    step: 2,
    name: 'Köy Tuğlası Şömine',
    shortLabel: '2. Şömine',
    desc: 'Sol duvara atölyeyi sımsıcak tutan kor ateşli tuğla şömine inşa edilir.',
    starsRequired: 10,
    icon: 'flame',
    colorTag: '#F59E0B',
  },
  {
    id: 'woven_rug',
    step: 3,
    name: 'El Dokuması Kelt Halısı',
    shortLabel: '3. Halı',
    desc: 'Ahşap parkenin üzerine el dokuması geometrik desenli yün halı serilir.',
    starsRequired: 15,
    icon: 'color-palette',
    colorTag: '#10B981',
  },
  {
    id: 'tea_station',
    step: 4,
    name: 'Ihlamur & Demlik Köşesi',
    shortLabel: '4. Demlik',
    desc: 'Koltuğun yanına dumanı tüten seramik demlik, ıhlamur fincanı ve sehpa eklenir.',
    starsRequired: 20,
    icon: 'cafe',
    colorTag: '#6366F1',
  },
  {
    id: 'antique_loom',
    step: 5,
    name: 'Antika Çıkrık & Vitrin',
    shortLabel: '5. Çıkrık',
    desc: 'Arka köşeye usta işi ahşap iplik çıkrığı ve rengârenk yumak rafları kurulur.',
    starsRequired: 30,
    icon: 'construct',
    colorTag: '#EC4899',
  },
];

// Room 2 Items: Kışlık Kar Dağ Evi
const SKI_LODGE_CATALOG: WorkshopItem[] = [
  {
    id: 'cast_iron_stove',
    step: 1,
    name: 'Döküm Demir Dağ Sobası',
    shortLabel: '1. Soba',
    desc: 'Odun çıtırtıları ve pencereli ateş kapağıyla dağ kulübesini ısıtan döküm kuzine soba.',
    starsRequired: 5,
    icon: 'flame',
    colorTag: '#E06D53',
  },
  {
    id: 'sheepskin_rug',
    step: 2,
    name: 'Beyaz Koyun Postu & Kütük Sehpa',
    shortLabel: '2. Post & Sehpa',
    desc: 'Koyu kütük parkenin üzerine serilen bembeyaz peluş dağ postu ve cilalı kütük sehpa.',
    starsRequired: 10,
    icon: 'color-palette',
    colorTag: '#F59E0B',
  },
  {
    id: 'vintage_skis',
    step: 3,
    name: 'Ahşap Kros Kayak Takımı',
    shortLabel: '3. Kayaklar',
    desc: 'Kütük duvara çapraz asılı el yapımı vintage ahşap kayak takımı ve deri bağcıklar.',
    starsRequired: 15,
    icon: 'snow' as any,
    colorTag: '#0EA5E9',
  },
  {
    id: 'hot_cocoa',
    step: 4,
    name: 'Sıcak Kakao & Marşmelov',
    shortLabel: '4. Kakao',
    desc: 'Kütük sehpa üzerinde dumanı tüten köpüklü sıcak çikolata, marşmelov ve çubuk tarçın.',
    starsRequired: 20,
    icon: 'cafe',
    colorTag: '#8B5CF6',
  },
  {
    id: 'tartan_daybed',
    step: 5,
    name: 'Pencere Sediri & Kar Feneri',
    shortLabel: '5. Sedir',
    desc: 'Karlı dağ penceresinin önünde kalın ekose battaniyeli kütük sedir ve pirinç kar feneri.',
    starsRequired: 30,
    icon: 'home',
    colorTag: '#10B981',
  },
];

interface KnitwearItem {
  id: string;
  name: string;
  desc: string;
  starsRequired: number;
  color: string;
  accentEmoji: string;
  image: ImageSourcePropType;
}

const KNITWEAR_CATALOG: KnitwearItem[] = [
  {
    id: 'none',
    name: 'Sade Ahşap Gövde (Kıyafetsiz)',
    desc: 'Bobbin’in üzerinde hiçbir atkı veya yelek olmadan doğal ceviz ağacı görünümü.',
    starsRequired: 0,
    color: '#92400E',
    accentEmoji: '🪵',
    image: BOBBIN_OUTFIT_IMAGES.none,
  },
  {
    id: 'classic_honey',
    name: 'Klasik Bal Sarısı Atkı',
    desc: 'Bobbin’in boynuna el örgüsü sıcacık püsküllü bal sarısı yün atkı takılır.',
    starsRequired: 3,
    color: '#F59E0B',
    accentEmoji: '🧣',
    image: BOBBIN_OUTFIT_IMAGES.classic_honey,
  },
  {
    id: 'arctic_sky',
    name: 'Kutup Mavisi Kaşmir Atkı',
    desc: 'Kar tanesi motifli, çift kat gök mavisi yumuşacık kaşmir atkı.',
    starsRequired: 8,
    color: '#0EA5E9',
    accentEmoji: '❄️',
    image: BOBBIN_OUTFIT_IMAGES.arctic_sky,
  },
  {
    id: 'winter_fur',
    name: 'Kürklü Kar Beresi & Polar Boğazlık',
    desc: 'Kış fırtınalarına karşı Bobbin’in beresine eklenen sıcacık kulaklıklar ve yün polar boğazlık.',
    starsRequired: 12,
    color: '#38BDF8',
    accentEmoji: '🎿',
    image: BOBBIN_OUTFIT_IMAGES.winter_fur,
  },
  {
    id: 'emerald_moss',
    name: 'Zümrüt Ormanı Örgü Yelek',
    desc: 'Bobbin’in gövdesini saran saç örgülü zümrüt yeşili usta zanaatkâr yeleği.',
    starsRequired: 16,
    color: '#10B981',
    accentEmoji: '🌲',
    image: BOBBIN_OUTFIT_IMAGES.emerald_moss,
  },
  {
    id: 'royal_berry',
    name: 'Kraliyet Böğürtlen Pelerini',
    desc: 'Altın makara broşlu, asil mürdüm ve altın işlemeli başusta pelerini.',
    starsRequired: 25,
    color: '#8B5CF6',
    accentEmoji: '👑',
    image: BOBBIN_OUTFIT_IMAGES.royal_berry,
  },
];

interface RoomDef {
  id: string;
  name: string;
  badge: string;
  subtitle: string;
  stages: Record<number, ImageSourcePropType>;
  catalog: WorkshopItem[];
  unlockLevel: number;
  unlockConditionText: string;
  isComingSoon?: boolean;
}

const ROOM_DEFINITIONS: RoomDef[] = [
  {
    id: 'artisan_loft',
    name: "Bobbin'in Usta Atölyesi",
    badge: '🪵 Atölye',
    subtitle: 'Sonbahar Çatı Katı & Ahşap Dinlenme Odası',
    stages: WORKSHOP_STAGE_IMAGES,
    catalog: WORKSHOP_CATALOG,
    unlockLevel: 1,
    unlockConditionText: 'Başlangıç Odası',
  },
  {
    id: 'ski_lodge',
    name: 'Kışlık Kar Dağ Evi',
    badge: '🏔️ Kar Dağ Evi',
    subtitle: 'Kuzineli Dağ Kulübesi & Kış Masalı',
    stages: SKI_LODGE_STAGE_IMAGES,
    catalog: SKI_LODGE_CATALOG,
    unlockLevel: 50,
    unlockConditionText: '50. Seviye veya Atölye %80',
  },
  {
    id: 'holiday_hearth',
    name: 'Yeni Yıl Şömine Odası',
    badge: '🎄 Şenlik Odası',
    subtitle: 'Peri Işıkları & Mini Çam Ağacı',
    stages: WORKSHOP_STAGE_IMAGES,
    catalog: [],
    unlockLevel: 100,
    unlockConditionText: '100. Seviyede Açılır',
    isComingSoon: true,
  },
  {
    id: 'coastal_terrace',
    name: 'Akdeniz Sahil Verandası',
    badge: '🍋 Sahil Terası',
    subtitle: 'Limon Ağaçları & Deniz Manzarası',
    stages: WORKSHOP_STAGE_IMAGES,
    catalog: [],
    unlockLevel: 150,
    unlockConditionText: '150. Seviyede Açılır',
    isComingSoon: true,
  },
];

export function WorkshopScreen({ onBack }: { onBack: () => void }) {
  const { data, update } = useSave();
  const insets = useSafeAreaInsets();

  const [activeRoomId, setActiveRoomId] = useState<string>(data.activeRoomId || 'artisan_loft');
  const activeRoom = ROOM_DEFINITIONS.find((r) => r.id === activeRoomId) || ROOM_DEFINITIONS[0];
  const currentCatalog = activeRoom.catalog;

  const availableStars = Math.max(0, Object.values(data.stars || {}).reduce((a, b) => a + (b || 0), 0) - (data.spentStars || 0));
  const unlockedList = data.workshopItems || [];
  const unlockedSet = new Set(unlockedList);
  const purchasedOutfits = data.purchasedOutfits || ['none'];

  // Check if a room theme is unlocked (Option A: Natural level / stage progression)
  const isRoomUnlocked = (roomId: string) => {
    if (roomId === 'artisan_loft') return true;
    if (roomId === 'ski_lodge') {
      const room1Count = WORKSHOP_CATALOG.filter((i) => unlockedSet.has(i.id)).length;
      return (data.unlocked || 1) >= 50 || room1Count >= 4 || (data.unlockedRooms && data.unlockedRooms.includes('ski_lodge'));
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
    KNITWEAR_CATALOG.find((o) => o.id === currentOutfitId) || KNITWEAR_CATALOG[0];

  const [activeTab, setActiveTab] = useState<'room' | 'knitwear'>('room');
  const [speech, setSpeech] = useState(
    highestUnlockedStage === 0 && currentOutfitId === 'none'
      ? `${activeRoom.name} şu an sade ve boş! Yıldızlarınla sırayla eşyaları odaya yerleştirelim!`
      : `Hoş geldin! ${activeRoom.name} odamıza yeni eşyalar ekleyebilir veya Bobbin'e sıcacık el örgüsü aksesuarlar giydirebilirsin!`
  );

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
        setSpeech(`✨ "${room.name}" çok yakında eklenecek yeni tematik güncellememizle açılacak!`);
      } else {
        setSpeech(`🏔️ "${room.name}" kilidini açmak için Usta Atölyesi'nde en az 4 eşyayı tamamla veya 50. seviyeye ulaş!`);
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
    setSpeech(`"${room.name}" odasına geçildi! Sıcacık dağ evimizi yıldızlarınla adım adım döşeyelim.`);
  };

  const handleRoomItemAction = (item: WorkshopItem) => {
    const isUnlocked = unlockedSet.has(item.id);

    // If already unlocked: toggle between showing up to this stage vs hiding it (going 1 stage back)
    if (isUnlocked) {
      if (displayedStage === item.step) {
        const prevStage = item.step - 1;
        setDisplayedStage(prevStage);
        animateRoomChange();
        setSpeech(
          prevStage === 0
            ? `${item.name} geçici olarak gizlendi. Şu an sade başlangıç odasını görüyorsun.`
            : `${item.name} gizlendi; ${prevStage}. aşama görünümü aktif.`
        );
      } else {
        setDisplayedStage(item.step);
        animateRoomChange();
        setSpeech(`${item.name} tekrar odadaki yerini aldı!`);
      }
      playAsmrComboTone(1);
      buzz('light');
      return;
    }

    // Sequential check: must unlock previous step first so the 3D room builds up naturally
    const prevItem = currentCatalog.find((x) => x.step === item.step - 1);
    if (prevItem && !unlockedSet.has(prevItem.id)) {
      setSpeech(
        `Odayı sırayla dekore ediyoruz! Önce "${prevItem.name}" (${prevItem.starsRequired} ⭐) eşyasını odaya ekleyelim.`
      );
      buzz('error');
      return;
    }

    if (availableStars < item.starsRequired) {
      setSpeech(
        `"${item.name}" için ${item.starsRequired} yıldıza ihtiyacımız var (Kullanılabilir: ${availableStars} ⭐). Birkaç bölüm daha tamamlayıp yıldız toplayalım!`
      );
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
    setSpeech(`Harika! ${item.starsRequired} ⭐ harcandı ve ${item.name} odaya eklendi! Kalan: ${nextRemaining} ⭐`);
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
      setSpeech(`${outfit.name} çıkarıldı. Bobbin şimdi sade ahşap görünümünde!`);
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
      setSpeech(
        outfit.id === 'none'
          ? 'Bobbin tüm aksesuarlarını çıkardı, doğal ceviz ağacı gövdesiyle duruyor!'
          : `Bobbin "${outfit.name}" aksesuarını kuşandı!`
      );
      playAsmrComboTone(3);
      buzz('success');
      return;
    }

    // If not owned, check available stars to purchase!
    if (availableStars < outfit.starsRequired) {
      setSpeech(
        `"${outfit.name}" için ${outfit.starsRequired} yıldız gerekiyor (Kullanılabilir: ${availableStars} ⭐). Biraz daha bölüm geçerek yıldız toplayalım!`
      );
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
    setSpeech(`Harika! ${outfit.starsRequired} ⭐ harcandı ve "${outfit.name}" Bobbin'e giydirildi! Kalan: ${nextRemaining} ⭐`);
    playAsmrComboTone(3);
    buzz('success');
  };

  const unlockedCount = currentCatalog.filter((i) => unlockedSet.has(i.id)).length;
  const progressRatio = currentCatalog.length > 0 ? Math.min(1, unlockedCount / currentCatalog.length) : 0;
  const currentRoomImage =
    activeRoom.stages[displayedStage] || activeRoom.stages[0];
  const currentBobbinImage =
    BOBBIN_OUTFIT_IMAGES[activeOutfit.id] || BOBBIN_OUTFIT_IMAGES.none;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <RoundIcon icon="arrow-back" onPress={onBack} bg="#FDE68A" />
        <View style={styles.titleWrap}>
          <T style={styles.titleText}>{activeRoom.name}</T>
          <T style={styles.subtitleText}>{activeRoom.subtitle}</T>
        </View>
        <View style={styles.starPill}>
          <T style={{ fontSize: 16 }}>⭐</T>
          <T style={styles.starCount}>{availableStars}</T>
        </View>
      </View>

      {/* Room Themes Carousel / Selector */}
      <View style={{ backgroundColor: '#FDF2E2', borderBottomWidth: 1, borderColor: '#F3D5C1' }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roomSelectorRow}
        >
          {ROOM_DEFINITIONS.map((room) => {
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
                  {!isUnlocked ? '🔒 ' : ''}{room.badge}
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
        {/* Live Progressive 3D Diorama Room + Real 3D Outfitted Bobbin */}
        <Animated.View style={[styles.dioramaCard, { opacity: roomFade }]}>
          {/* Layer 1: Progressive 3D Room Background (Stage 0..5) */}
          <Image
            source={currentRoomImage}
            style={styles.dioramaImage}
            resizeMode="cover"
          />

          {/* Layer 2: Real 3D Bobbin with Equipped Knitwear (or Bare Wood) Standing in Room */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.bobbinCharacterContainer,
              { transform: [{ scale: characterPop }] },
            ]}
          >
            <Image
              source={currentBobbinImage}
              style={styles.bobbinCharacterImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Warm Vintage Vignette Frame */}
          <View style={styles.dioramaBorderOverlay} pointerEvents="none" />

          {/* Top-Left Live Stage Status Pill */}
          <View style={styles.stageStatusPill}>
            <Ionicons name="home" size={12} color="#FDE68A" />
            <T style={styles.stageStatusText}>
              {displayedStage === 0
                ? `${activeRoom.badge}: Sade Başlangıç`
                : `${activeRoom.badge}: ${displayedStage}/${currentCatalog.length} Eşya`}
            </T>
          </View>

          {/* Bottom-Right Active Outfit Indicator Pill */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setActiveTab('knitwear');
              buzz('light');
            }}
            style={[
              styles.equippedPinBadge,
              { borderColor: activeOutfit.color },
            ]}
          >
            <View style={[styles.equippedColorDot, { backgroundColor: activeOutfit.color }]}>
              <T style={{ fontSize: 11 }}>{activeOutfit.accentEmoji}</T>
            </View>
            <T style={styles.equippedPinText}>
              {activeOutfit.id === 'none'
                ? 'Kıyafet: Sade (Atkısız)'
                : `Takılı: ${activeOutfit.name}`}
            </T>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stage Switcher Bar */}
        {highestUnlockedStage > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stageSwitcherRow}
          >
            <TouchableOpacity
              onPress={() => {
                setDisplayedStage(0);
                animateRoomChange();
                buzz('light');
              }}
              style={[
                styles.stageChip,
                displayedStage === 0 && styles.stageChipActive,
              ]}
            >
              <T
                style={[
                  styles.stageChipText,
                  displayedStage === 0 && styles.stageChipTextActive,
                ]}
              >
                0. Sade Oda
              </T>
            </TouchableOpacity>

            {currentCatalog.filter((i) => i.step <= highestUnlockedStage).map((item) => {
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
            <Image
              source={currentBobbinImage}
              style={{ width: 30, height: 30 }}
              resizeMode="contain"
            />
          </View>
          <T style={styles.speechText}>{speech}</T>
        </View>

        {/* Room Restoration Progress Gauge */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <T style={styles.progressTitle}>{activeRoom.badge} İlerlemesi</T>
            <T style={styles.progressPercent}>{Math.round(progressRatio * 100)}%</T>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(4, progressRatio * 100)}%` },
              ]}
            />
          </View>
          <T style={styles.progressSub}>
            {unlockedCount} / {currentCatalog.length} Eşya Odaya Eklendi
          </T>
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
            <Ionicons
              name="home"
              size={18}
              color={activeTab === 'room' ? '#78350F' : UI.plumLight}
            />
            <T
              style={[
                styles.tabText,
                activeTab === 'room' && styles.tabTextActive,
              ]}
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
            <Ionicons
              name="shirt"
              size={18}
              color={activeTab === 'knitwear' ? '#78350F' : UI.plumLight}
            />
            <T
              style={[
                styles.tabText,
                activeTab === 'knitwear' && styles.tabTextActive,
              ]}
            >
              Bobbin Kıyafetleri
            </T>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Oda Eşyaları (Sequential Real 3D Room Upgrades) */}
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
                  style={[
                    styles.itemCard,
                    isNextStep && { borderColor: '#F59E0B', borderWidth: 2 },
                  ]}
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
                            ? '✓ Odada Görünüyor'
                            : '👁️ Odada Gizli (Göster için dokun)'
                          : isNextStep
                          ? canAfford
                            ? `⭐ ${item.starsRequired} Yıldız ile Alınabilir`
                            : `⭐ ${item.starsRequired} Yıldız Gerekir (Kalan: ${availableStars} ⭐)`
                          : `🔒 ${item.step - 1}. Adım Sonrası Açılır (⭐ ${item.starsRequired})`}
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
                          ? '✓ Yerinde'
                          : 'Gizli'
                        : canAfford
                        ? 'Satın Al'
                        : isNextStep
                        ? `${item.starsRequired} ⭐`
                        : 'Kilitli'}
                    </T>
                  </Bouncy>
                </View>
              );
            })}
          </View>
        )}

        {/* Tab 2: Bobbin Kıyafetleri (Real 3D Scarves & Vests on Bobbin) */}
        {activeTab === 'knitwear' && (
          <View style={styles.itemList}>
            <View style={styles.identityNotice}>
              <Ionicons name="sparkles" size={18} color="#D97706" />
              <T style={styles.identityNoticeText}>
                Seçtiğin atkı veya örgü yelek yukarıdaki atölyede Bobbin’in boynuna ve gövdesine gerçek 3D olarak giydirilir!
              </T>
            </View>

            {KNITWEAR_CATALOG.map((outfit) => {
              const isEquipped = currentOutfitId === outfit.id;
              const isOwned = purchasedOutfits.includes(outfit.id) || outfit.id === 'none';
              const canAfford = availableStars >= outfit.starsRequired;

              return (
                <View
                  key={outfit.id}
                  style={[
                    styles.itemCard,
                    isEquipped && { borderColor: '#10B981', borderWidth: 2 },
                  ]}
                >
                  {/* Real 3D Miniature Preview of Bobbin Wearing This Exact Outfit */}
                  <View
                    style={[
                      styles.outfitThumbWrap,
                      { borderColor: isEquipped ? '#10B981' : outfit.color },
                    ]}
                  >
                    <Image
                      source={outfit.image}
                      style={styles.outfitThumbImage}
                      resizeMode="contain"
                    />
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
                          ? '🌟 Başlangıç Görünümü'
                          : isEquipped
                          ? '✓ Şu An Bobbin’in Üzerinde'
                          : isOwned
                          ? '✓ Gardıropta (Ücretsiz Kuşan)'
                          : canAfford
                          ? `⭐ ${outfit.starsRequired} Yıldız ile Satın Al`
                          : `⭐ ${outfit.starsRequired} Yıldız Gerekir (Kalan: ${availableStars} ⭐)`}
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
                          ? '✓ Doğal'
                          : '✓ Çıkar'
                        : isOwned
                        ? outfit.id === 'none'
                          ? 'Sadeleş'
                          : 'Kuşan'
                        : canAfford
                        ? `✨ ${outfit.starsRequired} ⭐ Al`
                        : `⭐ ${outfit.starsRequired}`}
                    </T>
                  </Bouncy>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8D8',
    backgroundColor: '#FFFDF9',
  },
  titleWrap: {
    alignItems: 'center',
  },
  titleText: {
    fontFamily: FONT.black,
    fontSize: 20,
    color: '#78350F',
  },
  subtitleText: {
    fontSize: 11.5,
    color: '#92400E',
    marginTop: -2,
  },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: 5,
  },
  starCount: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#92400E',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  dioramaCard: {
    width: '100%',
    height: 330,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#29180C',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#D4B996',
    elevation: 8,
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  dioramaImage: {
    width: '100%',
    height: '100%',
  },
  bobbinCharacterContainer: {
    position: 'absolute',
    right: '4%',
    bottom: '6%',
    width: '42%',
    height: '76%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bobbinCharacterImage: {
    width: '100%',
    height: '100%',
  },
  dioramaBorderOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  stageStatusPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(28, 17, 10, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.5)',
  },
  stageStatusText: {
    fontSize: 11,
    color: '#FEF3C7',
    fontFamily: FONT.bold,
  },
  equippedPinBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(28, 17, 10, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  equippedColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedPinText: {
    fontSize: 11,
    color: '#FEF3C7',
    fontFamily: FONT.bold,
  },
  stageSwitcherRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingVertical: 2,
  },
  stageChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F9F5EE',
    borderWidth: 1.5,
    borderColor: '#E6D5BE',
  },
  stageChipActive: {
    backgroundColor: '#78350F',
    borderColor: '#D97706',
  },
  stageChipText: {
    fontSize: 12,
    fontFamily: FONT.bold,
    color: '#78350F',
  },
  stageChipTextActive: {
    color: '#FEF3C7',
  },
  speechCardOutside: {
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#78350F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  speechAvatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  speechText: {
    flex: 1,
    fontSize: 12.5,
    color: '#78350F',
    lineHeight: 17,
    fontFamily: FONT.bold,
  },
  progressCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 18,
    padding: 14,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#78350F',
  },
  progressPercent: {
    fontFamily: FONT.black,
    fontSize: 16,
    color: '#D97706',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#FDE68A',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 6,
  },
  progressSub: {
    fontSize: 12,
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
    fontSize: 13.5,
    color: '#9CA3AF',
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
    padding: 2,
  },
  outfitThumbImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#451A03',
  },
  itemDesc: {
    fontSize: 11.5,
    color: '#78716C',
    marginTop: 2,
    lineHeight: 15,
  },
  itemMeta: {
    marginTop: 4,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 78,
  },
  actionBtnAfford: {
    backgroundColor: '#D97706',
  },
  actionBtnActive: {
    backgroundColor: '#10B981',
  },
  actionBtnLocked: {
    backgroundColor: '#E5E7EB',
  },
  actionBtnText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#9CA3AF',
  },
  actionBtnTextActive: {
    color: '#FFFFFF',
  },
  roomSelectorRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#FFF6EA',
    borderWidth: 1.5,
    borderColor: '#E8D2BE',
    gap: 6,
  },
  roomPillActive: {
    backgroundColor: '#3D2010',
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  roomPillLocked: {
    opacity: 0.65,
    backgroundColor: '#F3EAE0',
  },
  roomPillText: {
    fontSize: 13,
    color: '#78350F',
    fontFamily: FONT.bold,
  },
  roomPillTextActive: {
    color: '#FFF',
    fontFamily: FONT.black,
  },
  roomPillBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  roomPillBadgeText: {
    fontSize: 10.5,
    color: '#D97706',
    fontFamily: FONT.black,
  },
});
