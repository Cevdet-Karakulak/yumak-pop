/**
 * Bobbin's Cozy Craft Workshop & Wardrobe Types (Isolated Module)
 * 
 * Tasarım Prensibi: Sentetik/ucuz AI çizimi hissi vermeyen,
 * tamamen gerçek stop-motion ahşap ve merino yünü dokularına dayalı
 * yüksek kaliteli, fiziksel zanaat deneyimi.
 */

export interface WorkshopItem {
  id: string;
  name: string;
  category: 'floor' | 'furniture' | 'decor' | 'storage';
  starCost: number;
  unlockedByDefault: boolean;
  materialDescription: string;
  bobbinReaction: string;
}

export interface BobbinCostume {
  id: string;
  name: string;
  requirement: string;
  visualDescription: string;
  isUnlocked: boolean;
  passiveBonus: string;
}

export const WORKSHOP_ITEMS: WorkshopItem[] = [
  {
    id: 'herringbone_rug',
    name: 'Püsküllü Doğal Jüt & Yün Kilim',
    category: 'floor',
    starCost: 0,
    unlockedByDefault: true,
    materialDescription: 'Kalın düğümlü doğal jüt ve devasa merino yün ilmekleri, el dokuması püsküller.',
    bobbinReaction: "Ayaklarımın altında yumuşacık bir zemin var, atölyemize tam yakıştı!",
  },
  {
    id: 'rocking_chair',
    name: 'Masif Kayın Sallanan Koltuk',
    category: 'furniture',
    starCost: 40,
    unlockedByDefault: false,
    materialDescription: 'Gürgen ağacından torna edilmiş parmaklıklar, pişmiş toprak rengi kalın örgü yün minder.',
    bobbinReaction: "Yumak sararken oturup sallanacağım harika bir koltuğum oldu!",
  },
  {
    id: 'stone_fireplace',
    name: 'Taş Şömine & Çıtırdayan Odun Ateşi',
    category: 'furniture',
    starCost: 60,
    unlockedByDefault: false,
    materialDescription: 'Mini tuğla ve doğal taş işçiliği, pirinç çaydanlık ve kuruyan el örgüsü yün çoraplar.',
    bobbinReaction: "Çıtırtılar başladı! Kışın bile atölyemiz sıcacık kalacak.",
  },
  {
    id: 'macrame_wall_art',
    name: 'Doğal İplik Makrome Duvar Panosu',
    category: 'decor',
    starCost: 80,
    unlockedByDefault: false,
    materialDescription: 'Ham pamuk iplikten düğümlenmiş kalp motifi, doğal çam dalına asılı zarif püsküller.',
    bobbinReaction: "Bu el emeği duvar tablosu atölyemize gerçek bir zanaat ruhu kattı!",
  },
  {
    id: 'yarn_shelves',
    name: 'Masif Ahşap Yumak Rafı',
    category: 'storage',
    starCost: 100,
    unlockedByDefault: false,
    materialDescription: 'Meşe ağacından raflarda rengarenk sarılmış kalın merino yumaklar ve pirinç terzi makasları.',
    bobbinReaction: "Bütün iplerim düzenli! Artık istediğim rengi anında bulabileceğim.",
  },
];

export const BOBBIN_COSTUMES: BobbinCostume[] = [
  {
    id: 'default_sweater',
    name: 'Klasik El Örgüsü Kazak',
    requirement: 'Başlangıç',
    visualDescription: 'Bobbin\'in ilk günden beri giydiği sıcak krem ve hardal rengi çizgili el örgüsü kazak.',
    isUnlocked: true,
    passiveBonus: 'Standart görünüm',
  },
  {
    id: 'winter_scarf',
    name: 'Kışlık Kalın Örgü Atkı & Ponpon Bere',
    requirement: 'Atölye %60 Tamamlandığında',
    visualDescription: 'Mercan rengi devasa örgü atkı ve tepesinde kabarık yün ponponu olan kışlık bere.',
    isUnlocked: false,
    passiveBonus: 'Buzlu alanlarda ipler %15 daha hızlı çözülür',
  },
  {
    id: 'master_apron',
    name: 'Deri Zanaatkar Önlüğü & Pirinç Toka',
    requirement: 'Atölye %100 Tamamlandığında',
    visualDescription: 'Eskitme kahverengi deri önlük, minik ahşap cetvel ve pirinç dikiş yüksüğü detayları.',
    isUnlocked: false,
    passiveBonus: 'Makaralar sarılırken +%10 Ekstra Altın kazandırır',
  },
];
