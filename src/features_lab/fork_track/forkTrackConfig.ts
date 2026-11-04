/**
 * Selective Dual-Head Fork Track Configuration (Isolated Module)
 * 
 * Tasarım Kuralı: Çift başlı yılan mekaniği her bölümde OLMAZ.
 * Yalnızca belirli dönüm noktası (Milestone / Özel Mücadele) bölümlerinde çıkar.
 * Bu sayede standart bölümlerin akıcı ve rahatlatıcı yapısı bozulmaz.
 */

export interface ForkLevelDefinition {
  levelNumber: number;
  title: string;
  isForkLevel: boolean;
  leftBasketColor: string;
  rightBasketColor: string;
  splitPointRatio: number; // 0.0 - 1.0 (Y-ayrımının parkurdaki konumu)
  difficultyLabel: 'Tanıtım' | 'Taktiksel' | 'Zirve Mücadelesi';
  description: string;
}

export const FORK_MILESTONE_LEVELS: Record<number, ForkLevelDefinition> = {
  115: {
    levelNumber: 115,
    title: 'Çatal Ayrımı',
    isForkLevel: true,
    leftBasketColor: 'Mavi',
    rightBasketColor: 'Kırmızı',
    splitPointRatio: 0.55,
    difficultyLabel: 'Tanıtım',
    description: 'İlk çift başlı yılan deneyimi. Makaraları dengeli sararak iki kuyuyu da kontrol altında tut.',
  },
  125: {
    levelNumber: 125,
    title: 'İkiz Akış Barajı',
    isForkLevel: true,
    leftBasketColor: 'Yeşil',
    rightBasketColor: 'Sarı',
    splitPointRatio: 0.45,
    difficultyLabel: 'Taktiksel',
    description: 'Yol daha erken ikiye ayrılıyor! Hangi kafanın daha hızlı ilerlediğini dikkatle izle.',
  },
  135: {
    levelNumber: 135,
    title: 'Kesişen İplikler',
    isForkLevel: true,
    leftBasketColor: 'Mor',
    rightBasketColor: 'Turuncu',
    splitPointRatio: 0.50,
    difficultyLabel: 'Taktiksel',
    description: 'Buzlu alan ile çatal parkurun birleşimi. Stratejik makara planlaması gerektirir.',
  },
  145: {
    levelNumber: 145,
    title: 'İkiz Ejder Geçidi',
    isForkLevel: true,
    leftBasketColor: 'Kırmızı',
    rightBasketColor: 'Mavi',
    splitPointRatio: 0.40,
    difficultyLabel: 'Zirve Mücadelesi',
    description: 'Bölüm 150 öncesi büyük taktiksel sınav. İki kuyunun da tehlike eşiğini dengede tut.',
  },
  150: {
    levelNumber: 150,
    title: 'Yumak Ustası Finali',
    isForkLevel: true,
    leftBasketColor: 'Altın',
    rightBasketColor: 'Gümüş',
    splitPointRatio: 0.35,
    difficultyLabel: 'Zirve Mücadelesi',
    description: 'Büyük Şampiyonluk bölümü! Her iki kafa da nefes kesici bir tempo ile ilerler.',
  },
};

/**
 * Verilen bölüm numarasının çift başlı yılan içerip içermediğini kontrol eder.
 * Standart bölümler her zaman false döner.
 */
export function isForkMechanicActive(levelNumber: number): boolean {
  return !!FORK_MILESTONE_LEVELS[levelNumber]?.isForkLevel;
}

export function getForkLevelConfig(levelNumber: number): ForkLevelDefinition | null {
  return FORK_MILESTONE_LEVELS[levelNumber] || null;
}
