import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buzz, playAsmrComboTone, playAsmrFeverChord } from '../audio';
import { Bouncy, FONT, RoundIcon, T } from '../components/ui';
import { useSave } from '../save';
import { UI, YARN } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WORKSHOP_UNIFIED_IMAGE = require('../../assets/images/bobbin_workshop.jpg');

interface WorkshopItem {
  id: string;
  name: string;
  desc: string;
  starsRequired: number;
  icon: string;
  category: 'room' | 'knitwear';
  colorTag: string;
}

const WORKSHOP_CATALOG: WorkshopItem[] = [
  {
    id: 'rocking_chair',
    name: 'Sallanan Ahşap Koltuk',
    desc: 'Torna kayın ağacından oyulmuş, mercan yün minderli dinlenme koltuğu.',
    starsRequired: 5,
    icon: 'rocking-chair',
    category: 'room',
    colorTag: '#E06D53',
  },
  {
    id: 'fireplace',
    name: 'Köy Tuğlası Şömine',
    desc: 'Atölyeyi sımsıcak tutan kor ateş ve çıtırdayan meşe odunları.',
    starsRequired: 15,
    icon: 'flame',
    category: 'room',
    colorTag: '#F59E0B',
  },
  {
    id: 'woven_rug',
    name: 'El Dokuması Kelt Halısı',
    desc: 'Herringbone parkeyi süsleyen yumuşacık geometrik örgü halı.',
    starsRequired: 30,
    icon: 'color-palette',
    category: 'room',
    colorTag: '#10B981',
  },
  {
    id: 'tea_station',
    name: 'Ihlamur & Demlik Köşesi',
    desc: 'Sıcak ıhlamur çayı ve tarçın kokulu seramik kupa.',
    starsRequired: 50,
    icon: 'cafe',
    category: 'room',
    colorTag: '#6366F1',
  },
  {
    id: 'antique_loom',
    name: 'Antika Ahşap Çıkrık',
    desc: 'Usta zanaatkârın en sevdiği el yapımı meşe iplik eğirme tezgâhı.',
    starsRequired: 75,
    icon: 'construct',
    category: 'room',
    colorTag: '#EC4899',
  },
];

const KNITWEAR_CATALOG = [
  {
    id: 'classic_honey',
    name: 'Klasik Bal Sarısı Atkı',
    desc: 'Bobbin’in ilk günden beri boynundan çıkarmadığı sıcacık yün.',
    starsRequired: 0,
    color: '#F59E0B',
    accentEmoji: '🧣',
  },
  {
    id: 'arctic_sky',
    name: 'Kutup Mavisi Kaşmir',
    desc: 'Kar fırtınalarında Bobbin’i koruyan çift kat gök mavisi örgü.',
    starsRequired: 20,
    color: '#0EA5E9',
    accentEmoji: '❄️',
  },
  {
    id: 'emerald_moss',
    name: 'Zümrüt Ormanı Yeleği',
    desc: 'Orman yosunlarından ilham alan taze nane ve zümrüt tonları.',
    starsRequired: 40,
    color: '#10B981',
    accentEmoji: '🌲',
  },
  {
    id: 'royal_berry',
    name: 'Kraliyet Böğürtlen Fuları',
    desc: 'Büyük Usta turnuvalarında giyilen asil mürdüm kaşmir fular.',
    starsRequired: 65,
    color: '#8B5CF6',
    accentEmoji: '👑',
  },
];

export function WorkshopScreen({ onBack }: { onBack: () => void }) {
  const { data, update } = useSave();
  const insets = useSafeAreaInsets();

  const totalStars = Object.values(data.stars).reduce((a, b) => a + b, 0);
  const unlockedItems = new Set(data.workshopItems || ['rocking_chair']);
  const currentOutfit = data.bobbinOutfit || 'classic_honey';
  const activeOutfit = KNITWEAR_CATALOG.find((o) => o.id === currentOutfit) || KNITWEAR_CATALOG[0];

  const [activeTab, setActiveTab] = useState<'room' | 'knitwear'>('room');
  const [speech, setSpeech] = useState(
    'Hoş geldin! Bölümlerden topladığın yıldızlarla atölyemizi ilmek ilmek sıcacık bir yuvaya dönüştürelim!'
  );

  // Subtle breathing animation for diorama view
  const breatheAnim = useRef(new Animated.Value(1)).current;

  const handleUnlockItem = (item: WorkshopItem) => {
    if (unlockedItems.has(item.id)) {
      setSpeech(`${item.name} atölyemizde harika duruyor! Çıtırtısını ve huzurunu hissedebiliyor musun?`);
      playAsmrComboTone(1);
      buzz('light');
      return;
    }

    if (totalStars < item.starsRequired) {
      setSpeech(`Bu güzellik için ${item.starsRequired} yıldıza ihtiyacımız var. Biraz daha bölüm tamamlayalım!`);
      buzz('error');
      return;
    }

    // Unlock item
    update((d) => ({
      ...d,
      workshopItems: [...(d.workshopItems || []), item.id],
    }));

    setSpeech(`Harika! ${item.name} atölyemize eklendi. Burası artık çok daha huzurlu!`);
    playAsmrFeverChord();
    buzz('success');
  };

  const handleSelectOutfit = (outfit: (typeof KNITWEAR_CATALOG)[0]) => {
    if (totalStars < outfit.starsRequired) {
      setSpeech(`Bu özel örgü aksesuar için ${outfit.starsRequired} yıldız gerekiyor. Hadi birkaç bölüm daha örelim!`);
      buzz('error');
      return;
    }

    update((d) => ({
      ...d,
      bobbinOutfit: outfit.id,
    }));

    setSpeech(`Bobbin yeni ${outfit.name} atkısını taktı! Çok yakıştı değil mi?`);
    playAsmrComboTone(3);
    buzz('success');
  };

  const unlockedCount = WORKSHOP_CATALOG.filter((i) => unlockedItems.has(i.id)).length;
  const progressRatio = Math.min(1, unlockedCount / WORKSHOP_CATALOG.length);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <RoundIcon icon="arrow-back" onPress={onBack} bg="#FDE68A" />
        <View style={styles.titleWrap}>
          <T style={styles.titleText}>🪵 Bobbin'in Atölyesi</T>
          <T style={styles.subtitleText}>Ahşap & Örgü Dinlenme Odası</T>
        </View>
        <View style={styles.starPill}>
          <T style={{ fontSize: 16 }}>⭐</T>
          <T style={styles.starCount}>{totalStars}</T>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Unified 3D Stop-Motion Miniature Diorama Showcase (100% Unobstructed) */}
        <View style={styles.dioramaCard}>
          <Image
            source={WORKSHOP_UNIFIED_IMAGE}
            style={styles.dioramaImage}
            resizeMode="cover"
          />

          {/* Warm Vintage Vignette Gradient Border */}
          <View style={styles.dioramaBorderOverlay} pointerEvents="none" />

          {/* Visual Knitwear Scarf / Collar Overlay on Bobbin */}
          <View
            pointerEvents="none"
            style={[
              styles.bobbinScarfCollar,
              {
                borderColor: activeOutfit.color,
                backgroundColor: `${activeOutfit.color}40`,
                shadowColor: activeOutfit.color,
              },
            ]}
          >
            <View style={[styles.bobbinScarfKnot, { backgroundColor: activeOutfit.color }]}>
              <T style={{ fontSize: 13 }}>{activeOutfit.accentEmoji}</T>
            </View>
          </View>

          {/* Compact Pointer Tag at Bottom-Right Pointing to Bobbin's Equipped Knitwear */}
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
              ↑ Bobbin'de Takılı: {activeOutfit.name}
            </T>
          </TouchableOpacity>
        </View>

        {/* Bobbin Dialogue Card (Placed Outside Diorama So Room & Character Stay 100% Visible) */}
        <View style={styles.speechCardOutside}>
          <View style={styles.speechAvatarBadge}>
            <T style={{ fontSize: 18 }}>🪵</T>
          </View>
          <T style={styles.speechText}>{speech}</T>
        </View>

        {/* Room Restoration Progress Gauge */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <T style={styles.progressTitle}>Atölye Tamamlanma Oranı</T>
            <T style={styles.progressPercent}>{Math.round(progressRatio * 100)}%</T>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(8, progressRatio * 100)}%` },
              ]}
            />
          </View>
          <T style={styles.progressSub}>
            {unlockedCount} / {WORKSHOP_CATALOG.length} Eşya Yerleştirildi
          </T>
        </View>

        {/* Category Tabs: Atölye Eşyaları & Örgü Gardırobu */}
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
              Atölye Eşyaları
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
              Örgü Aksesuarları
            </T>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Atölye Eşyaları (Room Items) */}
        {activeTab === 'room' && (
          <View style={styles.itemList}>
            {WORKSHOP_CATALOG.map((item) => {
              const isUnlocked = unlockedItems.has(item.id);
              const canAfford = totalStars >= item.starsRequired;

              return (
                <View key={item.id} style={styles.itemCard}>
                  <View
                    style={[
                      styles.itemIconWrap,
                      { backgroundColor: isUnlocked ? item.colorTag : '#E5E7EB' },
                    ]}
                  >
                    <Ionicons
                      name={
                        item.icon === 'flame'
                          ? 'flame'
                          : item.icon === 'cafe'
                          ? 'cafe'
                          : item.icon === 'color-palette'
                          ? 'color-palette'
                          : item.icon === 'construct'
                          ? 'construct'
                          : 'cube'
                      }
                      size={26}
                      color={isUnlocked ? '#fff' : '#9CA3AF'}
                    />
                  </View>

                  <View style={styles.itemInfo}>
                    <T style={styles.itemName}>{item.name}</T>
                    <T style={styles.itemDesc}>{item.desc}</T>
                    <View style={styles.itemMeta}>
                      <T style={{ fontSize: 13, color: '#F59E0B', fontWeight: 'bold' }}>
                        ⭐ {item.starsRequired} Yıldız Gereklidir
                      </T>
                    </View>
                  </View>

                  <Bouncy
                    onPress={() => handleUnlockItem(item)}
                    style={[
                      styles.actionBtn,
                      isUnlocked
                        ? styles.actionBtnActive
                        : canAfford
                        ? styles.actionBtnAfford
                        : styles.actionBtnLocked,
                    ]}
                  >
                    <T
                      style={[
                        styles.actionBtnText,
                        isUnlocked && styles.actionBtnTextActive,
                      ]}
                    >
                      {isUnlocked ? '✓ Yerinde' : canAfford ? 'Oluştur' : '🔒 Kilitli'}
                    </T>
                  </Bouncy>
                </View>
              );
            })}
          </View>
        )}

        {/* Tab 2: Örgü Aksesuarları (Knitwear for Bobbin) */}
        {activeTab === 'knitwear' && (
          <View style={styles.itemList}>
            <View style={styles.identityNotice}>
              <Ionicons name="sparkles" size={18} color="#D97706" />
              <T style={styles.identityNoticeText}>
                Bobbin daima kendi sevimli kimliğini korur. Burada kazandığın yıldızlarla Bobbin’e sıcacık el örgüsü kaşmir atkılar ve aksesuarlar hediye edebilirsin!
              </T>
            </View>

            {KNITWEAR_CATALOG.map((outfit) => {
              const isEquipped = currentOutfit === outfit.id;
              const isUnlocked = totalStars >= outfit.starsRequired;

              return (
                <View key={outfit.id} style={styles.itemCard}>
                  <View
                    style={[
                      styles.itemIconWrap,
                      { backgroundColor: outfit.color },
                    ]}
                  >
                    <T style={{ fontSize: 24 }}>{outfit.accentEmoji}</T>
                  </View>

                  <View style={styles.itemInfo}>
                    <T style={styles.itemName}>{outfit.name}</T>
                    <T style={styles.itemDesc}>{outfit.desc}</T>
                    <View style={styles.itemMeta}>
                      <T style={{ fontSize: 13, color: '#F59E0B', fontWeight: 'bold' }}>
                        {outfit.starsRequired === 0
                          ? '🌟 Başlangıç Hediyesi'
                          : `⭐ ${outfit.starsRequired} Yıldız`}
                      </T>
                    </View>
                  </View>

                  <Bouncy
                    onPress={() => handleSelectOutfit(outfit)}
                    style={[
                      styles.actionBtn,
                      isEquipped
                        ? styles.actionBtnActive
                        : isUnlocked
                        ? styles.actionBtnAfford
                        : styles.actionBtnLocked,
                    ]}
                  >
                    <T
                      style={[
                        styles.actionBtnText,
                        isEquipped && styles.actionBtnTextActive,
                      ]}
                    >
                      {isEquipped ? '✓ Takılı' : isUnlocked ? 'Kullan' : '🔒 Kilitli'}
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
    height: 350,
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
  dioramaBorderOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  bobbinScarfCollar: {
    position: 'absolute',
    right: '14%',
    bottom: '22%',
    width: 108,
    height: 34,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  bobbinScarfKnot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFDF9',
  },
  equippedPinBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(28, 17, 10, 0.86)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  equippedColorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedPinText: {
    fontSize: 11.5,
    color: '#FEF3C7',
    fontFamily: FONT.bold,
  },
  speechCardOutside: {
    marginTop: 12,
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
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 14,
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
    marginTop: 14,
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
    marginTop: 14,
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
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
});
