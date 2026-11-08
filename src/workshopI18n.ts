import { Lang } from './i18n';

export interface RoomLocale {
  name: string;
  badge: string;
  subtitle: string;
  unlockConditionText: string;
}

export interface ItemLocale {
  name: string;
  shortLabel: string;
  desc: string;
}

export interface OutfitLocale {
  name: string;
  desc: string;
}

const ROOMS_DATA: Record<string, Record<Lang, RoomLocale>> = {
  "artisan_loft": {
    "tr": {
      "name": "Bobbin'in Usta Atölyesi",
      "badge": "🪵 Atölye",
      "subtitle": "Sonbahar Çatı Katı & Ahşap Dinlenme Odası",
      "unlockConditionText": "Başlangıç Odası"
    },
    "en": {
      "name": "Bobbin's Artisan Workshop",
      "badge": "🪵 Workshop",
      "subtitle": "Autumn Attic & Wooden Lounge",
      "unlockConditionText": "Starter Room"
    },
    "de": {
      "name": "Bobbins Handwerkswerkstatt",
      "badge": "🪵 Werkstatt",
      "subtitle": "Herbst-Dachboden & Holz-Lounge",
      "unlockConditionText": "Startraum"
    },
    "es": {
      "name": "Taller Artesanal de Bobbin",
      "badge": "🪵 Taller",
      "subtitle": "Ático de Otoño y Salón de Madera",
      "unlockConditionText": "Sala Inicial"
    },
    "fr": {
      "name": "Atelier Artisanal de Bobbin",
      "badge": "🪵 Atelier",
      "subtitle": "Grenier d'Automne & Salon en Bois",
      "unlockConditionText": "Salle de Départ"
    },
    "it": {
      "name": "Bottega Artigiana di Bobbin",
      "badge": "🪵 Bottega",
      "subtitle": "Soffitta d'Autunno & Salotto in Legno",
      "unlockConditionText": "Stanza Iniziale"
    },
    "pt": {
      "name": "Oficina Artesanal do Bobbin",
      "badge": "🪵 Oficina",
      "subtitle": "Sótão de Outono e Sala de Estar de Madeira",
      "unlockConditionText": "Quarto Inicial"
    },
    "ru": {
      "name": "Мастерская ремесленника Боббина",
      "badge": "🪵 Мастерская",
      "subtitle": "Осенний чердак и деревянная гостиная",
      "unlockConditionText": "Начальная комната"
    },
    "ja": {
      "name": "ボビンの職人アトリエ",
      "badge": "🪵 アトリエ",
      "subtitle": "秋の屋根裏部屋＆木のラウンジ",
      "unlockConditionText": "スターター部屋"
    },
    "ko": {
      "name": "보빈의 장인 공방",
      "badge": "🪵 공방",
      "subtitle": "가을 다락방 & 아늑한 나무 라운지",
      "unlockConditionText": "시작 방"
    },
    "zh": {
      "name": "波宾的匠人工坊",
      "badge": "🪵 工坊",
      "subtitle": "秋日阁楼与温馨原木休息室",
      "unlockConditionText": "初始房间"
    },
    "ar": {
      "name": "ورشة بوبين الحرفية",
      "badge": "🪵 ورشة",
      "subtitle": "علية الخريف وصالة خشبية دافئة",
      "unlockConditionText": "الغرفة الأولى"
    }
  },
  "ski_lodge": {
    "tr": {
      "name": "Kışlık Kar Dağ Evi",
      "badge": "🏔️ Kar Dağ Evi",
      "subtitle": "Kuzineli Dağ Kulübesi & Kış Masalı",
      "unlockConditionText": "50. Seviye veya Atölye %80"
    },
    "en": {
      "name": "Winter Ski Lodge",
      "badge": "🏔️ Ski Lodge",
      "subtitle": "Cozy Hearth Cabin & Winter Tale",
      "unlockConditionText": "Level 50 or Workshop 80%"
    },
    "de": {
      "name": "Winterliche Skihütte",
      "badge": "🏔️ Skihütte",
      "subtitle": "Kamin-Berghütte & Wintermärchen",
      "unlockConditionText": "Level 50 oder Werkstatt 80%"
    },
    "es": {
      "name": "Refugio de Montaña Invernal",
      "badge": "🏔️ Refugio Nieve",
      "subtitle": "Cabaña con Hogar y Cuento Invernal",
      "unlockConditionText": "Nivel 50 o Taller 80%"
    },
    "fr": {
      "name": "Chalet de Ski Hivernal",
      "badge": "🏔️ Chalet Neige",
      "subtitle": "Cabane au Coin du Feu & Conte d'Hiver",
      "unlockConditionText": "Niveau 50 ou Atelier 80%"
    },
    "it": {
      "name": "Baita Invernale di Montagna",
      "badge": "🏔️ Baita Neve",
      "subtitle": "Baita con Camino & Fiaba d'Inverno",
      "unlockConditionText": "Livello 50 o Bottega 80%"
    },
    "pt": {
      "name": "Chalé de Inverno na Neve",
      "badge": "🏔️ Chalé Neve",
      "subtitle": "Cabana com Lareira e Conto de Inverno",
      "unlockConditionText": "Nível 50 ou Oficina 80%"
    },
    "ru": {
      "name": "Зимний лыжный домик",
      "badge": "🏔️ Лыжный домик",
      "subtitle": "Хижина с печью и зимняя сказка",
      "unlockConditionText": "Уровень 50 или Мастерская 80%"
    },
    "ja": {
      "name": "冬のスキーロッジ",
      "badge": "🏔️ スキー山小屋",
      "subtitle": "暖炉のある山小屋＆冬の物語",
      "unlockConditionText": "レベル50 または アトリエ80%"
    },
    "ko": {
      "name": "겨울 눈 덮인 스키 별장",
      "badge": "🏔️ 눈덮인 별장",
      "subtitle": "벽난로 산장 & 겨울 동화",
      "unlockConditionText": "50 레벨 또는 공방 80%"
    },
    "zh": {
      "name": "冬季高山雪屋",
      "badge": "🏔️ 高山雪屋",
      "subtitle": "壁炉木屋与冬日童话",
      "unlockConditionText": "第50关 或 工坊达80%"
    },
    "ar": {
      "name": "كوخ الشتاء الجبلي",
      "badge": "🏔️ كوخ الجبل",
      "subtitle": "كوخ الموقد وحكاية الشتاء",
      "unlockConditionText": "المستوى 50 أو 80% من الورشة"
    }
  },
  "holiday_hearth": {
    "tr": {
      "name": "Yeni Yıl Şömine Odası",
      "badge": "🎄 Şenlik Odası",
      "subtitle": "Peri Işıkları & Mini Çam Ağacı",
      "unlockConditionText": "100. Seviyede Açılır"
    },
    "en": {
      "name": "Holiday Hearth Room",
      "badge": "🎄 Holiday Room",
      "subtitle": "Fairy Lights & Mini Pine Tree",
      "unlockConditionText": "Unlocks at Level 100"
    },
    "de": {
      "name": "Festliches Kaminzimmer",
      "badge": "🎄 Festraum",
      "subtitle": "Lichterketten & Kleiner Tannenbaum",
      "unlockConditionText": "Freischaltung ab Level 100"
    },
    "es": {
      "name": "Sala Navideña con Chimenea",
      "badge": "🎄 Sala Fiesta",
      "subtitle": "Luces de Hadas y Mini Árbol de Navidad",
      "unlockConditionText": "Se desbloquea en nivel 100"
    },
    "fr": {
      "name": "Salon de Fêtes au Coin du Feu",
      "badge": "🎄 Salle Fêtes",
      "subtitle": "Guirlandes Féeriques & Mini Sapin",
      "unlockConditionText": "Débloqué au niveau 100"
    },
    "it": {
      "name": "Stanza Festiva con Camino",
      "badge": "🎄 Stanza Feste",
      "subtitle": "Lucine Fatate & Mini Albero di Natale",
      "unlockConditionText": "Si sblocca al livello 100"
    },
    "pt": {
      "name": "Sala de Festas com Lareira",
      "badge": "🎄 Sala Festiva",
      "subtitle": "Luzes de Fada e Mini Pinheiro",
      "unlockConditionText": "Desbloqueia no nível 100"
    },
    "ru": {
      "name": "Новогодняя комната с камином",
      "badge": "🎄 Праздничная",
      "subtitle": "Гирлянды и миниатюрная ёлочка",
      "unlockConditionText": "Открывается на уровне 100"
    },
    "ja": {
      "name": "ホリデー暖炉ルーム",
      "badge": "🎄 祝祭ルーム",
      "subtitle": "イルミネーション＆ミニツリー",
      "unlockConditionText": "レベル100で解放"
    },
    "ko": {
      "name": "연말 벽난로 방",
      "badge": "🎄 축제 방",
      "subtitle": "반짝이는 전구 & 미니 전나무",
      "unlockConditionText": "100 레벨에서 잠금 해제"
    },
    "zh": {
      "name": "节日壁炉暖阁",
      "badge": "🎄 节日暖阁",
      "subtitle": "梦幻彩灯与迷你松树",
      "unlockConditionText": "达到100级解锁"
    },
    "ar": {
      "name": "غرفة الموقد الاحتفالية",
      "badge": "🎄 غرفة العيد",
      "subtitle": "أضواء خيالية وشجرة صنوبر صغيرة",
      "unlockConditionText": "يفتح في المستوى 100"
    }
  },
  "coastal_terrace": {
    "tr": {
      "name": "Akdeniz Sahil Verandası",
      "badge": "🍋 Sahil Terası",
      "subtitle": "Limon Ağaçları & Deniz Manzarası",
      "unlockConditionText": "150. Seviyede Açılır"
    },
    "en": {
      "name": "Coastal Sun Terrace",
      "badge": "🍋 Sun Terrace",
      "subtitle": "Lemon Trees & Gentle Ocean Breeze",
      "unlockConditionText": "Unlocks at Level 150"
    },
    "de": {
      "name": "Mediterrane Küstenterrasse",
      "badge": "🍋 Sonnenterrasse",
      "subtitle": "Zitronenbäume & Meeresbrise",
      "unlockConditionText": "Freischaltung ab Level 150"
    },
    "es": {
      "name": "Terraza Costera Soleada",
      "badge": "🍋 Terraza Sol",
      "subtitle": "Limoneros y Brisa Marina",
      "unlockConditionText": "Se desbloquea en nivel 150"
    },
    "fr": {
      "name": "Terrasse Côtière Ensoleillée",
      "badge": "🍋 Terrasse Mer",
      "subtitle": "Citronniers & Douce Brise Marine",
      "unlockConditionText": "Débloqué au niveau 150"
    },
    "it": {
      "name": "Terrazza Costiera Mediterranea",
      "badge": "🍋 Terrazza Mare",
      "subtitle": "Alberi di Limone & Brezza Marina",
      "unlockConditionText": "Si sblocca al livello 150"
    },
    "pt": {
      "name": "Terraço Litorâneo Ensolarado",
      "badge": "🍋 Terraço Sol",
      "subtitle": "Limoeiros e Brisa Suave do Mar",
      "unlockConditionText": "Desbloqueia no nível 150"
    },
    "ru": {
      "name": "Средиземноморская терраса",
      "badge": "🍋 Терраса у моря",
      "subtitle": "Лимонные деревья и морской бриз",
      "unlockConditionText": "Открывается на уровне 150"
    },
    "ja": {
      "name": "海辺のサンテラス",
      "badge": "🍋 海辺テラス",
      "subtitle": "レモンの木＆穏やかな潮風",
      "unlockConditionText": "レベル150で解放"
    },
    "ko": {
      "name": "지중해 해변 테라스",
      "badge": "🍋 해변 테라스",
      "subtitle": "레몬 나무 & 잔잔한 바다 바람",
      "unlockConditionText": "150 레벨에서 잠금 해제"
    },
    "zh": {
      "name": "地中海海滨露台",
      "badge": "🍋 海滨露台",
      "subtitle": "柠檬树与怡人海风",
      "unlockConditionText": "达到150级解锁"
    },
    "ar": {
      "name": "شرفة ساحلية مشمسة",
      "badge": "🍋 شرفة ساحلية",
      "subtitle": "أشجار الليمون ونسيم البحر",
      "unlockConditionText": "يفتح في المستوى 150"
    }
  }
};

const ITEMS_DATA: Record<string, Record<Lang, { name: string; short: string; desc: string }>> = {
  "rocking_chair": {
    "tr": {
      "name": "Sallanan Ahşap Koltuk",
      "short": "1. Koltuk",
      "desc": "Torna kayın ağacından oyulmuş, mercan yün minderli dinlenme koltuğu odaya eklenir."
    },
    "en": {
      "name": "Wooden Rocking Chair",
      "short": "1. Rocker",
      "desc": "A carved beechwood rocker with a cozy coral wool cushion is placed in the room."
    },
    "de": {
      "name": "Schaukelstuhl aus Holz",
      "short": "1. Stuhl",
      "desc": "Ein geschnitzter Buchensessel mit warmem Korallenkissen wird platziert."
    },
    "es": {
      "name": "Mecedora de Madera",
      "short": "1. Mecedora",
      "desc": "Una mecedora de haya tallada con cojín de lana coralina."
    },
    "fr": {
      "name": "Fauteuil à Bascule en Bois",
      "short": "1. Fauteuil",
      "desc": "Un fauteuil à bascule en hêtre sculpté avec coussin en laine corail."
    },
    "it": {
      "name": "Sedia a Dondolo in Legno",
      "short": "1. Dondolo",
      "desc": "Una sedia a dondolo in faggio intagliato con cuscino in lana corallo."
    },
    "pt": {
      "name": "Cadeira de Balanço de Madeira",
      "short": "1. Cadeira",
      "desc": "Uma cadeira de balanço entalhada em faia com almofada de lã coral."
    },
    "ru": {
      "name": "Деревянное кресло-качалка",
      "short": "1. Кресло",
      "desc": "Резное буковое кресло-качалка с мягкой коралловой подушкой."
    },
    "ja": {
      "name": "木製ロッキングチェア",
      "short": "1. チェア",
      "desc": "温かみのあるコーラルウールのクッション付きブナ材ロッキングチェア。"
    },
    "ko": {
      "name": "나무 흔들의자",
      "short": "1. 흔들의자",
      "desc": "포근한 코랄 양모 방석이 놓인 너도밤나무 흔들의자."
    },
    "zh": {
      "name": "实木摇椅",
      "short": "1. 摇椅",
      "desc": "一把雕刻精致的山毛榉摇椅，配有温暖的珊瑚绒坐垫。"
    },
    "ar": {
      "name": "كرسي هزاز خشبي",
      "short": "1. الكرسي",
      "desc": "كرسي هزاز من خشب الزان المنحوت بوسادة صوف مرجانية دافئة."
    }
  },
  "fireplace": {
    "tr": {
      "name": "Köy Tuğlası Şömine",
      "short": "2. Şömine",
      "desc": "Sol duvara atölyeyi sımsıcak tutan kor ateşli tuğla şömine inşa edilir."
    },
    "en": {
      "name": "Rustic Brick Fireplace",
      "short": "2. Fireplace",
      "desc": "A glowing brick fireplace is built to keep the workshop nice and warm."
    },
    "de": {
      "name": "Rustikaler Backsteinkamin",
      "short": "2. Kamin",
      "desc": "Ein gemauerter Kamin sorgt für wohlige Wärme in der Werkstatt."
    },
    "es": {
      "name": "Chimenea de Ladrillo Rústico",
      "short": "2. Chimenea",
      "desc": "Una chimenea de ladrillo para mantener el taller calentito."
    },
    "fr": {
      "name": "Cheminée en Briques Rustiques",
      "short": "2. Cheminée",
      "desc": "Une cheminée chaleureuse en briques pour réchauffer l'atelier."
    },
    "it": {
      "name": "Camino in Mattoni Rustici",
      "short": "2. Camino",
      "desc": "Un camino in mattoni per riscaldare la bottega."
    },
    "pt": {
      "name": "Lareira de Tijolos Rústicos",
      "short": "2. Lareira",
      "desc": "Uma lareira de tijolos para manter a oficina quentinha."
    },
    "ru": {
      "name": "Кирпичный деревенский камин",
      "short": "2. Камин",
      "desc": "Уютный кирпичный камин, согревающий мастерскую живым огнём."
    },
    "ja": {
      "name": "素朴なレンガの暖炉",
      "short": "2. 暖炉",
      "desc": "アトリエを優しく温めるレンガ造りの暖炉が設置されます。"
    },
    "ko": {
      "name": "클래식 벽돌 벽난로",
      "short": "2. 벽난로",
      "desc": "공방을 아늑하고 따뜻하게 데워줄 벽돌 벽난로가 설치됩니다."
    },
    "zh": {
      "name": "温馨砖石壁炉",
      "short": "2. 壁炉",
      "desc": "砌起一座温暖的砖砌壁炉，让整个工坊充满暖意。"
    },
    "ar": {
      "name": "موقد قرميدي ريفي",
      "short": "2. الموقد",
      "desc": "موقد قرميدي دافئ لإبقاء الورشة مفعمة بالدفء."
    }
  },
  "woven_rug": {
    "tr": {
      "name": "El Dokuması Kelt Halısı",
      "short": "3. Halı",
      "desc": "Ahşap parkenin üzerine el dokuması geometrik desenli yün halı serilir."
    },
    "en": {
      "name": "Handwoven Celtic Rug",
      "short": "3. Rug",
      "desc": "A cozy patterned wool rug is spread over the polished parquet floor."
    },
    "de": {
      "name": "Handgewebter Keltenteppich",
      "short": "3. Teppich",
      "desc": "Ein gewebter Wollteppich wird auf dem Holzparkett ausgebreitet."
    },
    "es": {
      "name": "Alfombra Celta Tejida a Mano",
      "short": "3. Alfombra",
      "desc": "Una alfombra de lana con patrones geométricos sobre el piso."
    },
    "fr": {
      "name": "Tapis Celte Tissé Main",
      "short": "3. Tapis",
      "desc": "Un tapis de laine géométrique posé sur le plancher en bois."
    },
    "it": {
      "name": "Tappeto Celtico Fatto a Mano",
      "short": "3. Tappeto",
      "desc": "Un tappeto in lana geometrico steso sul pavimento in legno."
    },
    "pt": {
      "name": "Tapete Celta Tecido à Mão",
      "short": "3. Tapete",
      "desc": "Um tapete de lã artesanal espalhado sobre o chão de madeira."
    },
    "ru": {
      "name": "Тканый кельтский ковёр",
      "short": "3. Ковёр",
      "desc": "Уютный шерстяной ковёр с геометрическим узором на полу."
    },
    "ja": {
      "name": "手織りのケルト柄ラグ",
      "short": "3. ラグ",
      "desc": "木のフローリングの上に幾何学模様の手織りウールラグを敷きます。"
    },
    "ko": {
      "name": "수제 켈트 양모 러그",
      "short": "3. 러그",
      "desc": "원목 마루 위에 기하학 무늬의 수제 양모 러그를 펼칩니다."
    },
    "zh": {
      "name": "手工编织凯尔特地毯",
      "short": "3. 地毯",
      "desc": "在原木地板上铺上一张精美的手织羊毛地毯。"
    },
    "ar": {
      "name": "سجادة سلتية منسوجة يدوياً",
      "short": "3. السجادة",
      "desc": "سجادة صوفية منقوشة بأنماط هندسية تُفرش على الأرضية الخشبية."
    }
  },
  "tea_station": {
    "tr": {
      "name": "Ihlamur & Demlik Köşesi",
      "short": "4. Demlik",
      "desc": "Koltuğun yanına dumanı tüten seramik demlik, ıhlamur fincanı ve sehpa eklenir."
    },
    "en": {
      "name": "Herbal Tea & Teapot Nook",
      "short": "4. Teapot",
      "desc": "A steaming ceramic teapot, herbal cup, and side table next to the rocker."
    },
    "de": {
      "name": "Kräutertee & Teekannen-Ecke",
      "short": "4. Teekanne",
      "desc": "Eine dampfende Teekanne, Tasse und ein Beistelltischchen."
    },
    "es": {
      "name": "Rincón de Té y Tetera",
      "short": "4. Tetera",
      "desc": "Una tetera de cerámica humeante, taza de té y mesita auxiliar."
    },
    "fr": {
      "name": "Coin Tisane & Théière",
      "short": "4. Théière",
      "desc": "Une théière fumante, tasse d'infusion et petite table d'appoint."
    },
    "it": {
      "name": "Angolo Tè & Teiera",
      "short": "4. Teiera",
      "desc": "Una teiera fumante con tazza e tavolino accanto alla sedia."
    },
    "pt": {
      "name": "Cantinho do Chá e Bule",
      "short": "4. Bule",
      "desc": "Um bule de cerâmica fumegante, xícara de chá e mesinha lateral."
    },
    "ru": {
      "name": "Уголок с чаем и чайником",
      "short": "4. Чайник",
      "desc": "Дымящийся керамический чайник, чашка чая и деревянный столик."
    },
    "ja": {
      "name": "ハーブティー＆急須席",
      "short": "4. ティーポット",
      "desc": "湯気の立つ急須とハーブティーカップ、サイドテーブルが並びます。"
    },
    "ko": {
      "name": "허브티 & 티팟 코너",
      "short": "4. 티팟",
      "desc": "김이 모락모락 나는 도자기 주전자와 찻잔, 작은 사이드 테이블."
    },
    "zh": {
      "name": "香草茶与陶瓷茶壶角",
      "short": "4. 茶壶",
      "desc": "摇椅旁添上一壶冒着热气的陶瓷茶壶、茶杯与实木边几。"
    },
    "ar": {
      "name": "ركن الشاي وإبريق الفخار",
      "short": "4. الإبريق",
      "desc": "إبريق شاي فخاري يتصاعد منه البخار مع كوب وطاولة جانبية."
    }
  },
  "antique_loom": {
    "tr": {
      "name": "Antika Çıkrık & Vitrin",
      "short": "5. Çıkrık",
      "desc": "Arka köşeye usta işi ahşap iplik çıkrığı ve rengârenk yumak rafları kurulur."
    },
    "en": {
      "name": "Antique Spinning Wheel & Shelf",
      "short": "5. Loom",
      "desc": "A master craftsman spinning wheel and colorful yarn shelves complete the room."
    },
    "de": {
      "name": "Antikes Spinnrad & Regal",
      "short": "5. Spinnrad",
      "desc": "Ein meisterhaftes Spinnrad und bunte Wollknäuel-Regale schmücken die Ecke."
    },
    "es": {
      "name": "Rueda de Hilar Antigua y Vitrina",
      "short": "5. Rueda",
      "desc": "Una rueca de hilar artesanal y estantes llenos de ovillos coloridos."
    },
    "fr": {
      "name": "Rouet Ancien & Vitrine de Laine",
      "short": "5. Rouet",
      "desc": "Un superbe rouet traditionnel et des étagères de pelotes colorées."
    },
    "it": {
      "name": "Filarello Antico & Vetrina",
      "short": "5. Filarello",
      "desc": "Un filarello artigianale e scaffali colmi di gomitoli variopinti."
    },
    "pt": {
      "name": "Roda de Fiar Antiga e Prateleira",
      "short": "5. Roda",
      "desc": "Uma linda roda de fiar artesanal e prateleiras com novelos coloridos."
    },
    "ru": {
      "name": "Антикварная прялка и витрина",
      "short": "5. Прялка",
      "desc": "Мастерская деревянная прялка и стеллажи с разноцветной пряжей."
    },
    "ja": {
      "name": "アンティーク糸車と棚",
      "short": "5. 糸車",
      "desc": "美しい木製糸車とカラフルな毛糸玉の棚が部屋を完成させます。"
    },
    "ko": {
      "name": "엔틱 물레 & 털실 진열대",
      "short": "5. 물레",
      "desc": "장인의 손길이 담긴 목제 물레와 알록달록 털실 선반이 완성됩니다."
    },
    "zh": {
      "name": "复古纺车与毛线展示架",
      "short": "5. 纺车",
      "desc": "角落里布置起工艺精巧的木质纺车与五彩斑斓的毛线架。"
    },
    "ar": {
      "name": "مغزل قديم ورف خيوط",
      "short": "5. المغزل",
      "desc": "مغزل خشبي متقن الصنع ورفوف مليئة بكرات الصوف الملونة."
    }
  },
  "cast_iron_stove": {
    "tr": {
      "name": "Döküm Demir Dağ Sobası",
      "short": "1. Soba",
      "desc": "Odun çıtırtıları ve pencereli ateş kapağıyla dağ kulübesini ısıtan döküm kuzine soba."
    },
    "en": {
      "name": "Cast Iron Cabin Stove",
      "short": "1. Stove",
      "desc": "A crackling cast-iron stove with a glass door warms the cabin."
    },
    "de": {
      "name": "Gusseiserner Hüttenofen",
      "short": "1. Ofen",
      "desc": "Ein knisternder Gusseisenofen wärmt die verschneite Berghütte."
    },
    "es": {
      "name": "Estufa de Hierro Fundido",
      "short": "1. Estufa",
      "desc": "Una estufa de hierro fundido que calienta la cabaña nevada."
    },
    "fr": {
      "name": "Poêle en Fonte de Montagne",
      "short": "1. Poêle",
      "desc": "Un poêle en fonte crépitant réchauffe le chalet enneigé."
    },
    "it": {
      "name": "Stufa in Ghisa di Montagna",
      "short": "1. Stufa",
      "desc": "Una stufa in ghisa scoppiettante scalda la baita montana."
    },
    "pt": {
      "name": "Fogão a Lenha de Ferro Fundido",
      "short": "1. Fogão",
      "desc": "Um fogão a lenha que aquece a cabana na neve com madeira estalando."
    },
    "ru": {
      "name": "Чугунная дровяная печь",
      "short": "1. Печь",
      "desc": "Потрескивающая чугунная печка с дверцей согревает снежную хижину."
    },
    "ja": {
      "name": "鋳鉄の薪ストーブ",
      "short": "1. ストーブ",
      "desc": "パチパチと薪がはぜる鋳鉄ストーブが山小屋を温めます。"
    },
    "ko": {
      "name": "주철 화목 난로",
      "short": "1. 난로",
      "desc": "타닥타닥 장작 타는 소리와 함께 산장을 훈훈하게 덥혀주는 주철 난로."
    },
    "zh": {
      "name": "铸铁壁炉柴火炉",
      "short": "1. 炉灶",
      "desc": "噼啪作响的铸铁壁炉，透过玻璃炉门驱散高山的严寒。"
    },
    "ar": {
      "name": "مدفأة حطب حديدية",
      "short": "1. المدفأة",
      "desc": "مدفأة حديدية متقدة بالحطب تدفئ الكوخ الجبلي."
    }
  },
  "sheepskin_rug": {
    "tr": {
      "name": "Beyaz Koyun Postu & Kütük Sehpa",
      "short": "2. Post & Sehpa",
      "desc": "Koyu kütük parkenin üzerine serilen bembeyaz peluş dağ postu ve cilalı kütük sehpa."
    },
    "en": {
      "name": "Plush Sheepskin & Log Table",
      "short": "2. Fur & Table",
      "desc": "A soft fluffy white sheepskin rug and a smooth tree stump coffee table."
    },
    "de": {
      "name": "Schaffell-Teppich & Holzstumpf-Tisch",
      "short": "2. Fell & Tisch",
      "desc": "Ein flauschiges Schaffell und ein polierter Baumstamm-Tisch."
    },
    "es": {
      "name": "Alfombra de Piel de Oveja y Mesa de Tronco",
      "short": "2. Piel y Mesa",
      "desc": "Una suave alfombra blanca de borrego y una mesa hecha de tronco."
    },
    "fr": {
      "name": "Peau de Mouton & Table en Rondin",
      "short": "2. Peau & Table",
      "desc": "Une peau de mouton douillette et une table basse en tronc poli."
    },
    "it": {
      "name": "Tappeto in Montone & Tavolino Tronco",
      "short": "2. Pelle & Tavolo",
      "desc": "Un morbido tappeto di montone e un tavolino in tronco levigato."
    },
    "pt": {
      "name": "Pelego Branco e Mesinha de Tronco",
      "short": "2. Pelego e Mesa",
      "desc": "Um tapete macio de pelego branco e mesinha de tronco polido."
    },
    "ru": {
      "name": "Овечья шкура и столик из спила",
      "short": "2. Шкура и стол",
      "desc": "Мягкая белая овчина и кофейный столик из полированного спила."
    },
    "ja": {
      "name": "羊毛ラグ＆丸太テーブル",
      "short": "2. ラグ＆机",
      "desc": "ふかふかの白いシープスキンラグと磨き丸太のローテーブル。"
    },
    "ko": {
      "name": "양모 러그 & 통나무 테이블",
      "short": "2. 러그 & 테이블",
      "desc": "포근한 흰색 양모 러그와 반짝이는 통나무 티테이블."
    },
    "zh": {
      "name": "白色羊毛地毯与原木矮几",
      "short": "2. 地毯与茶几",
      "desc": "厚实温暖的纯白羊毛毯，配上打磨温润的原木茶几。"
    },
    "ar": {
      "name": "سجادة صوفية وطاولة جذع خشب",
      "short": "2. السجادة والطاولة",
      "desc": "سجادة صوف ناعمة بيضاء وطاولة قهوة مصنوعة من جذع شجرة مصقول."
    }
  },
  "vintage_skis": {
    "tr": {
      "name": "Ahşap Kros Kayak Takımı",
      "short": "3. Kayaklar",
      "desc": "Kütük duvara çapraz asılı el yapımı vintage ahşap kayak takımı ve deri bağcıklar."
    },
    "en": {
      "name": "Vintage Wooden Ski Set",
      "short": "3. Skis",
      "desc": "Handcrafted vintage wooden skis and leather bindings crossed on the wall."
    },
    "de": {
      "name": "Vintage Holzski-Set",
      "short": "3. Ski",
      "desc": "Klassische Holzski mit Lederbindungen an der Holzwand."
    },
    "es": {
      "name": "Esquís de Madera Clásicos",
      "short": "3. Esquís",
      "desc": "Esquís clásicos de madera con correas de cuero colgados en la pared."
    },
    "fr": {
      "name": "Skis Rétro en Bois",
      "short": "3. Skis",
      "desc": "Des skis en bois d'époque fixés au mur en rondins."
    },
    "it": {
      "name": "Sci Vintage in Legno",
      "short": "3. Sci",
      "desc": "Sci vintage in legno con attacchi in cuoio appesi alla parete."
    },
    "pt": {
      "name": "Esquis de Madeira Vintage",
      "short": "3. Esquis",
      "desc": "Esquis clássicos de madeira com amarras de couro na parede."
    },
    "ru": {
      "name": "Винтажные деревянные лыжи",
      "short": "3. Лыжи",
      "desc": "Винтажные деревянные лыжи с кожаными ремешками на стене."
    },
    "ja": {
      "name": "ヴィンテージ木製スキー",
      "short": "3. スキー",
      "desc": "丸太の壁に飾られた革ストラップ付き手作りヴィンテージ木製スキー。"
    },
    "ko": {
      "name": "빈티지 나무 스키 세트",
      "short": "3. 스키",
      "desc": "통나무 벽에 걸린 가죽 스트랩의 클래식 수제 원목 스키 세트."
    },
    "zh": {
      "name": "复古木质滑雪板",
      "short": "3. 滑雪板",
      "desc": "挂在原木墙上的复古手工木质滑雪板与牛皮绑带。"
    },
    "ar": {
      "name": "زلاجات خشبية كلاسيكية",
      "short": "3. الزلاجات",
      "desc": "مجموعة زلاجات خشبية مصنوعة يدويًا معلقة على الحائط."
    }
  },
  "hot_cocoa": {
    "tr": {
      "name": "Sıcak Kakao & Marşmelov",
      "short": "4. Kakao",
      "desc": "Kütük sehpa üzerinde dumanı tüten köpüklü sıcak çikolata, marşmelov ve çubuk tarçın."
    },
    "en": {
      "name": "Hot Cocoa & Marshmallows",
      "short": "4. Cocoa",
      "desc": "Steaming hot chocolate mugs topped with marshmallows and cinnamon sticks."
    },
    "de": {
      "name": "Heiße Schokolade & Marshmallows",
      "short": "4. Kakao",
      "desc": "Dampfende Schokolade mit Marshmallows und Zimtstangen."
    },
    "es": {
      "name": "Chocolate Caliente y Nubes",
      "short": "4. Chocolate",
      "desc": "Tazas de chocolate caliente con malvaviscos y canela."
    },
    "fr": {
      "name": "Chocolat Chaud & Guimauves",
      "short": "4. Chocolat",
      "desc": "Chocolat chaud onctueux garni de guimauves et cannelle."
    },
    "it": {
      "name": "Cioccolata Calda & Marshmallow",
      "short": "4. Cioccolata",
      "desc": "Cioccolata calda fumante con marshmallow e cannella."
    },
    "pt": {
      "name": "Chocolate Quente e Marshmallow",
      "short": "4. Chocolate",
      "desc": "Xícaras de chocolate quente com marshmallows e canela."
    },
    "ru": {
      "name": "Горячий шоколад с маршмеллоу",
      "short": "4. Какао",
      "desc": "Чашки горячего шоколада с зефирками и палочками корицы."
    },
    "ja": {
      "name": "ホットココア＆マシュマロ",
      "short": "4. ココア",
      "desc": "マシュマロとシナモンスティックを添えた湯気立つホットココア。"
    },
    "ko": {
      "name": "핫초코 & 마시멜로",
      "short": "4. 핫초코",
      "desc": "마시멜로와 시나몬 스틱을 얹은 따끈한 핫초콜릿 머그잔."
    },
    "zh": {
      "name": "热可可与棉花糖",
      "short": "4. 可可",
      "desc": "冒着热气的浓郁热可可，点缀着松软棉花糖与肉桂棒。"
    },
    "ar": {
      "name": "شوكولاتة ساخنة ومارشميلو",
      "short": "4. الكاكاو",
      "desc": "أكواب شوكولاتة ساخنة تعلوها حبات المارشميلو وعيدان القرفة."
    }
  },
  "tartan_daybed": {
    "tr": {
      "name": "Pencere Sediri & Kar Feneri",
      "short": "5. Sedir",
      "desc": "Karlı dağ penceresinin önünde kalın ekose battaniyeli kütük sedir ve pirinç kar feneri."
    },
    "en": {
      "name": "Snow Window Daybed & Lantern",
      "short": "5. Daybed",
      "desc": "A plaid blanket daybed by the snowy window with a warm brass lantern."
    },
    "de": {
      "name": "Fensterbank & Schneelaterne",
      "short": "5. Bank",
      "desc": "Ein gemütlicher Fensterplatz mit Decke und warmer Messinglaterne."
    },
    "es": {
      "name": "Diván de Ventana y Linterna de Nieve",
      "short": "5. Diván",
      "desc": "Un rincón acolchado con manta de cuadros frente a la ventana nevada."
    },
    "fr": {
      "name": "Banquette de Fenêtre & Lanterne",
      "short": "5. Banquette",
      "desc": "Une banquette avec plaid écossais face à la neige et lanterne en laiton."
    },
    "it": {
      "name": "Panca sotto la Finestra & Lanterna",
      "short": "5. Panca",
      "desc": "Una comoda panca con coperta scozzese affacciata sulla neve."
    },
    "pt": {
      "name": "Canto da Janela e Lanterna de Neve",
      "short": "5. Canto",
      "desc": "Um divã aconchegante com manta xadrez diante da janela nevada."
    },
    "ru": {
      "name": "Кушетка у окна и фонарь",
      "short": "5. Кушетка",
      "desc": "Уютный диванчик с пледом у заснеженного окна и латунный фонарь."
    },
    "ja": {
      "name": "雪景色の窓辺ベンチ＆ランタン",
      "short": "5. ベンチ",
      "desc": "雪降る窓辺のチェック柄ブランケット付きベンチと真鍮ランタン。"
    },
    "ko": {
      "name": "창가 벤치 소파 & 눈꽃 랜턴",
      "short": "5. 벤치소파",
      "desc": "눈 내리는 창가 앞 도톰한 체크 담요 벤치와 은은한 황동 랜턴."
    },
    "zh": {
      "name": "雪景窗台卧榻与暖光灯笼",
      "short": "5. 卧榻",
      "desc": "雪景窗前铺着厚实苏格兰格子毛毯的卧榻，伴着暖融融的黄铜灯笼。"
    },
    "ar": {
      "name": "أريكة نافذة الثلج وفانوس دافئ",
      "short": "5. الأريكة",
      "desc": "أريكة مريحة ببطانية صوفية أمام نافذة الثلج مع فانوس نحاسي دافئ."
    }
  }
};

const OUTFITS_DATA: Record<string, Record<Lang, OutfitLocale>> = {
  "none": {
    "tr": {
      "name": "Sade Ahşap Gövde (Kıyafetsiz)",
      "desc": "Bobbin’in üzerinde hiçbir atkı veya yelek olmadan doğal ceviz ağacı görünümü."
    },
    "en": {
      "name": "Natural Walnut (No Scarf)",
      "desc": "Bobbin's warm handcrafted walnut body with no accessories."
    },
    "de": {
      "name": "Natürliches Walnussholz (Ohne Schal)",
      "desc": "Bobbins natürlicher, gedrechselter Holzkörper ohne Schal."
    },
    "es": {
      "name": "Nogal Natural (Sin Bufanda)",
      "desc": "El cuerpo natural de madera de nogal de Bobbin sin accesorios."
    },
    "fr": {
      "name": "Noyer Naturel (Sans Écharpe)",
      "desc": "Le corps en noyer naturel de Bobbin, sans accessoire."
    },
    "it": {
      "name": "Noce Naturale (Senza Sciarpa)",
      "desc": "Il corpo in legno di noce di Bobbin al naturale."
    },
    "pt": {
      "name": "Nogueira Natural (Sem Lenço)",
      "desc": "O corpo de nogueira torneada do Bobbin sem acessórios."
    },
    "ru": {
      "name": "Натуральный орех (Без шарфа)",
      "desc": "Естественный вид резного тела Боббина из орехового дерева."
    },
    "ja": {
      "name": "ナチュラルウォルナット（スカーフなし）",
      "desc": "アクセサリーをつけないボビン本来の温かな木目。"
    },
    "ko": {
      "name": "자연 그대로의 호두나무 (스카프 없음)",
      "desc": "어떤 악세서리도 착용하지 않은 보빈 본연의 따스한 원목 모습."
    },
    "zh": {
      "name": "原木胡桃木（无围巾）",
      "desc": "不配戴任何配饰的波宾原本温暖的天然胡桃木身躯。"
    },
    "ar": {
      "name": "خشب الجوز الطبيعي (بدون وشاح)",
      "desc": "جسم بوبين الخشبي الدافئ دون أي إكسسوارات."
    }
  },
  "classic_honey": {
    "tr": {
      "name": "Klasik Bal Sarısı Atkı",
      "desc": "Bobbin’in boynuna el örgüsü sıcacık püsküllü bal sarısı yün atkı takılır."
    },
    "en": {
      "name": "Classic Honey Yellow Scarf",
      "desc": "A cozy fringed honey yellow knit scarf wrapped around Bobbin's neck."
    },
    "de": {
      "name": "Klassischer Honiggelber Schal",
      "desc": "Ein warmer, handgestrickter honiggelber Wollschal."
    },
    "es": {
      "name": "Bufanda Clásica Amarillo Miel",
      "desc": "Una cálida bufanda tejida a mano en color miel con flecos."
    },
    "fr": {
      "name": "Écharpe Classique Jaune Miel",
      "desc": "Une écharpe tricotée en laine jaune miel avec franges."
    },
    "it": {
      "name": "Sciarpa Classica Giallo Miele",
      "desc": "Una calda sciarpa in lana giallo miele con frange."
    },
    "pt": {
      "name": "Cachecol Clássico Amarelo Mel",
      "desc": "Um cachecol quentinho de lã amarelo mel com franjas."
    },
    "ru": {
      "name": "Классический медовый шарф",
      "desc": "Теплый вязаный медово-желтый шарф с кисточками на шее Боббина."
    },
    "ja": {
      "name": "ハニーイエローの定番マフラー",
      "desc": "ボビンの首元に巻かれた温かなフリンジ付きハニーイエローマフラー。"
    },
    "ko": {
      "name": "클래식 허니 옐로우 목도리",
      "desc": "보빈의 목에 감긴 포근한 수제 술장식 허니 옐로우 양모 목도리."
    },
    "zh": {
      "name": "经典蜂蜜黄针织围巾",
      "desc": "波宾脖子上围着的一条温暖蓬松的蜂蜜黄流苏羊毛围巾。"
    },
    "ar": {
      "name": "وشاح أصفر عسلي كلاسيكي",
      "desc": "وشاح صوف دافئ بلون العسل يلتف حول عنق بوبين."
    }
  },
  "arctic_sky": {
    "tr": {
      "name": "Kutup Mavisi Kaşmir Atkı",
      "desc": "Kar tanesi motifli, çift kat gök mavisi yumuşacık kaşmir atkı."
    },
    "en": {
      "name": "Arctic Sky Cashmere Scarf",
      "desc": "Double-layered sky blue cashmere scarf with snowflake patterns."
    },
    "de": {
      "name": "Polarschnee Kaschmirschal",
      "desc": "Doppellagiger himmelblauer Kaschmirschal mit Schneeflocken."
    },
    "es": {
      "name": "Bufanda de Cachemira Azul Ártico",
      "desc": "Suave bufanda de cachemira celeste con copos de nieve."
    },
    "fr": {
      "name": "Écharpe en Cachemire Bleu Arctique",
      "desc": "Écharpe douce en cachemire bleu ciel ornée de flocons."
    },
    "it": {
      "name": "Sciarpa in Cashmere Blu Artico",
      "desc": "Morbida sciarpa in cashmere azzurro con fiocchi di neve."
    },
    "pt": {
      "name": "Cachecol de Caxemira Azul Ártico",
      "desc": "Cachecol macio de caxemira azul celeste com flocos de neve."
    },
    "ru": {
      "name": "Кашемировый шарф «Полярное небо»",
      "desc": "Мягкий двухслойный кашемировый шарф с узором снежинок."
    },
    "ja": {
      "name": "アークティックスカイのカシミヤマフラー",
      "desc": "雪の結晶柄が織り込まれた空色カシミヤの2重マフラー。"
    },
    "ko": {
      "name": "북극 하늘 캐시미어 목도리",
      "desc": "눈꽃 무늬가 수놓아진 하늘색 더블 레이어 캐시미어 목도리."
    },
    "zh": {
      "name": "极地晴空羊绒围巾",
      "desc": "带有雪花提花织纹的双层天蓝色高档羊绒围巾。"
    },
    "ar": {
      "name": "وشاح كشمير أزرق قطبي",
      "desc": "وشاح كشمير ناعم بلون السماء الزرقاء بنقشات ندف الثلج."
    }
  },
  "winter_fur": {
    "tr": {
      "name": "Kürklü Kar Beresi & Polar Boğazlık",
      "desc": "Kış fırtınalarına karşı Bobbin’in beresine eklenen sıcacık kulaklıklar ve yün polar boğazlık."
    },
    "en": {
      "name": "Winter Fur Beanie & Fleece Snood",
      "desc": "Fluffy ear warmers and a fleece snood to brave the mountain storms."
    },
    "de": {
      "name": "Pelzmütze & Fleece-Kragen",
      "desc": "Flauschige Ohrenwärmer und ein wärmender Fleecekragen."
    },
    "es": {
      "name": "Gorro con Piel y Braga Polar",
      "desc": "Orejeras de pelo y cuello polar para las tormentas de montaña."
    },
    "fr": {
      "name": "Bonnet Fourré & Cache-Col Polaire",
      "desc": "Cache-oreilles en fourrure et col polaire pour affronter le froid."
    },
    "it": {
      "name": "Berretto in Pelliccia & Scaldacollo",
      "desc": "Paraorecchie caldi e scaldacollo in pile contro il gelo."
    },
    "pt": {
      "name": "Gorro com Pelo e Gola de Fleece",
      "desc": "Protetores de orelha fofos e gola térmica para o frio da montanha."
    },
    "ru": {
      "name": "Меховая шапка и флисовый снуд",
      "desc": "Теплые меховые наушники и флисовый воротник от вьюги."
    },
    "ja": {
      "name": "ファー付きニット帽＆フリーススヌード",
      "desc": "吹雪にも負けないふわふわ耳当て付きの帽子とフリーススヌード。"
    },
    "ko": {
      "name": "퍼 니트모자 & 플리스 넥워머",
      "desc": "겨울 강풍을 막아줄 보송보송 귀마개와 따뜻한 플리스 넥워머."
    },
    "zh": {
      "name": "绒毛护耳毛线帽与加厚围脖",
      "desc": "抵御严寒风雪的毛绒护耳与加厚保暖摇粒绒围脖。"
    },
    "ar": {
      "name": "قبعة شتوية من الفرو ولفحة دافئة",
      "desc": "أغطية أذن فروية ناعمة ولفحة دافئة لمواجهة العواصف الثلجية."
    }
  },
  "emerald_moss": {
    "tr": {
      "name": "Zümrüt Ormanı Örgü Yelek",
      "desc": "Bobbin’in gövdesini saran saç örgülü zümrüt yeşili usta zanaatkâr yeleği."
    },
    "en": {
      "name": "Emerald Forest Cable Vest",
      "desc": "A rich emerald green cable-knit artisan vest wrapped around Bobbin."
    },
    "de": {
      "name": "Smaragdwald Strickweste",
      "desc": "Eine smaragdgrüne Zopfstrickweste für kleine Handwerksmeister."
    },
    "es": {
      "name": "Chaleco de Punto Verde Esmeralda",
      "desc": "Un elegante chaleco verde esmeralda con punto trenzado."
    },
    "fr": {
      "name": "Gilet Torsadé Vert Émeraude",
      "desc": "Un élégant gilet tricoté en mailles torsadées vert émeraude."
    },
    "it": {
      "name": "Gilet Trecce Verde Smeraldo",
      "desc": "Un gilet artigianale verde smeraldo con trama a trecce."
    },
    "pt": {
      "name": "Colete de Tricô Verde Esmeralda",
      "desc": "Um colete artesanal de tricô trançado em tom verde esmeralda."
    },
    "ru": {
      "name": "Изумрудный жилет с косами",
      "desc": "Стильный изумрудный жилет с узором «косичка» для мастера."
    },
    "ja": {
      "name": "エメラルドグリーンのケーブル編みベスト",
      "desc": "ボビンの胴体を包む上品なエメラルドグリーンのケーブル編みベスト。"
    },
    "ko": {
      "name": "에메랄드 포레스트 꽈배기 니트 조끼",
      "desc": "보빈의 몸을 감싸주는 세련된 에메랄드 꽈배기 패턴 니트 조끼."
    },
    "zh": {
      "name": "翡翠森林麻花针织马甲",
      "desc": "精巧的翡翠绿复古麻花针织马甲，专为工匠大师定制。"
    },
    "ar": {
      "name": "سترة صوفية بلون الزمرد الأخضر",
      "desc": "سترة حرفية أنيقة بلون الزمرد الأخضر تلف قوام بوبين."
    }
  },
  "royal_berry": {
    "tr": {
      "name": "Kraliyet Böğürtlen Pelerini",
      "desc": "Altın makara broşlu, asil mürdüm ve altın işlemeli başusta pelerini."
    },
    "en": {
      "name": "Royal Berry Grand Cape",
      "desc": "A deep mulberry cape with gold embroidery and a golden spool brooch."
    },
    "de": {
      "name": "Königlicher Brombeer-Umhang",
      "desc": "Ein feiner brombeerfarbener Umhang mit goldener Spulenbrosche."
    },
    "es": {
      "name": "Capa Real de Moras y Oro",
      "desc": "Una capa noble color mora con bordados y broche de carrete dorado."
    },
    "fr": {
      "name": "Cape Royale Mûre & Or",
      "desc": "Une cape noble pourpre brodée d'or avec broche bobine dorée."
    },
    "it": {
      "name": "Mantello Reale More e Oro",
      "desc": "Un mantello nobiliare color mora con spilla a rocchetto d'oro."
    },
    "pt": {
      "name": "Capa Real de Amora e Ouro",
      "desc": "Uma capa nobre cor amora com bordados e broche de carretel dourado."
    },
    "ru": {
      "name": "Королевская ягодная мантия",
      "desc": "Благородная пурпурная мантия с золотой вышивкой и брошью-катушкой."
    },
    "ja": {
      "name": "ロイヤルベリーのマント",
      "desc": "金色の糸車ブローチが輝く高貴なベリー色の特製マント。"
    },
    "ko": {
      "name": "로열 베리 벨벳 망토",
      "desc": "골드 실타래 브로치가 돋보이는 우아한 플럼빛 명예 장인 망토."
    },
    "zh": {
      "name": "皇家浆果鎏金披风",
      "desc": "点缀着金线刺绣与纯金线轴胸针的尊贵浆果紫大师披风。"
    },
    "ar": {
      "name": "عباءة التوت الملكية الذهبية",
      "desc": "عباءة ملكية بلون التوت مع تطريز ذهبي وبروش بكرة ذهبية فاخر."
    }
  }
};

export interface WorkshopUILocale {
  bareStart: string;
  itemsCount: (n: number, total: number) => string;
  outfitBare: string;
  equipped: (name: string) => string;
  bareRoomChip: string;
  progressTitle: (badge: string) => string;
  progressSub: (unlocked: number, total: number) => string;
  tabKnitwear: string;
  identityNotice: string;
  visibleInRoom: string;
  hiddenInRoom: string;
  canBuyStars: (stars: number) => string;
  needStars: (stars: number, avail: number) => string;
  unlockAfterStep: (step: number, stars: number) => string;
  inPlace: string;
  hidden: string;
  buy: string;
  locked: string;
  starterLook: string;
  equippedOnBobbin: string;
  inWardrobe: string;
  buyOutfitStars: (stars: number) => string;
  natural: string;
  unequip: string;
  strip: string;
  equip: string;
  buyStarsBtn: (stars: number) => string;
  welcomeEmpty: (room: string) => string;
  welcomeReturn: (room: string) => string;
  roomLockedSoon: (name: string) => string;
  roomLockedProgress: (name: string) => string;
  roomSelected: (name: string) => string;
  itemHidden: (name: string, step: number) => string;
  itemShown: (name: string) => string;
  prevItemReq: (prevName: string, stars: number) => string;
  needStarsItem: (name: string, stars: number, avail: number) => string;
  itemUnlocked: (name: string, stars: number, rem: number) => string;
  outfitUnequipped: (name: string) => string;
  outfitEquipped: (name: string) => string;
  outfitReset: () => string;
  needStarsOutfit: (name: string, stars: number, avail: number) => string;
  outfitUnlocked: (name: string, stars: number, rem: number) => string;
}

const UI_DATA: Record<Lang, Record<string, string>> = {
  "tr": {
    "bareStart": "Sade Başlangıç",
    "itemsCount": "{n}/{total} Eşya",
    "outfitBare": "Kıyafet: Sade (Atkısız)",
    "equipped": "Takılı: {name}",
    "bareRoomChip": "0. Sade Oda",
    "progressTitle": "{badge} İlerlemesi",
    "progressSub": "{unlocked} / {total} Eşya Odaya Eklendi",
    "tabKnitwear": "Bobbin Kıyafetleri",
    "identityNotice": "Seçtiğin atkı veya örgü yelek yukarıdaki atölyede Bobbin’in boynuna ve gövdesine gerçek 3D olarak giydirilir!",
    "visibleInRoom": "✓ Odada Görünüyor",
    "hiddenInRoom": "👁️ Odada Gizli (Göster için dokun)",
    "canBuyStars": "⭐ {stars} Yıldız ile Alınabilir",
    "needStars": "⭐ {stars} Yıldız Gerekir (Kalan: {avail} ⭐)",
    "unlockAfterStep": "🔒 {step}. Adım Sonrası Açılır (⭐ {stars})",
    "inPlace": "✓ Yerinde",
    "hidden": "Gizli",
    "buy": "Satın Al",
    "locked": "Kilitli",
    "starterLook": "🌟 Başlangıç Görünümü",
    "equippedOnBobbin": "✓ Şu An Bobbin’in Üzerinde",
    "inWardrobe": "✓ Gardıropta (Ücretsiz Kuşan)",
    "buyOutfitStars": "⭐ {stars} Yıldız ile Satın Al",
    "natural": "✓ Doğal",
    "unequip": "✓ Çıkar",
    "strip": "Sadeleş",
    "equip": "Kuşan",
    "buyStarsBtn": "✨ {stars} ⭐ Al",
    "welcomeEmpty": "{room} şu an sade ve boş! Yıldızlarınla sırayla eşyaları odaya yerleştirelim!",
    "welcomeReturn": "Hoş geldin! {room} odamıza yeni eşyalar ekleyebilir veya Bobbin'e sıcacık el örgüsü aksesuarlar giydirebilirsin!",
    "roomLockedSoon": "✨ \"{name}\" çok yakında eklenecek yeni tematik güncellememizle açılacak!",
    "roomLockedProgress": "🏔️ \"{name}\" kilidini açmak için Usta Atölyesi'nde en az 4 eşyayı tamamla veya 50. seviyeye ulaş!",
    "roomSelected": "\"{name}\" odasına geçildi! Sıcacık odamızı yıldızlarınla adım adım döşeyelim.",
    "itemHidden": "{name} geçici olarak gizlendi. Şu an {step}. aşama görünümü aktif.",
    "itemShown": "{name} tekrar odadaki yerini aldı!",
    "prevItemReq": "Odayı sırayla dekore ediyoruz! Önce \"{prevName}\" ({stars} ⭐) eşyasını odaya ekleyelim.",
    "needStarsItem": "\"{name}\" için {stars} yıldıza ihtiyacımız var (Kullanılabilir: {avail} ⭐). Birkaç bölüm daha tamamlayıp yıldız toplayalım!",
    "itemUnlocked": "Harika! {stars} ⭐ harcandı ve {name} odaya eklendi! Kalan: {rem} ⭐",
    "outfitUnequipped": "{name} çıkarıldı. Bobbin şimdi sade ahşap görünümünde!",
    "outfitEquipped": "Bobbin \"{name}\" aksesuarını kuşandı!",
    "outfitReset": "Bobbin tüm aksesuarlarını çıkardı, doğal ceviz ağacı gövdesiyle duruyor!",
    "needStarsOutfit": "\"{name}\" için {stars} yıldız gerekiyor (Kullanılabilir: {avail} ⭐). Biraz daha bölüm geçerek yıldız toplayalım!",
    "outfitUnlocked": "Harika! {stars} ⭐ harcandı ve \"{name}\" Bobbin'e giydirildi! Kalan: {rem} ⭐"
  },
  "en": {
    "bareStart": "Bare Room",
    "itemsCount": "{n}/{total} Items",
    "outfitBare": "Outfit: Natural (No scarf)",
    "equipped": "Equipped: {name}",
    "bareRoomChip": "0. Bare Room",
    "progressTitle": "{badge} Progress",
    "progressSub": "{unlocked} / {total} Items Added to Room",
    "tabKnitwear": "Bobbin's Outfits",
    "identityNotice": "Selected scarves and vests are fitted onto Bobbin in the live 3D workshop above!",
    "visibleInRoom": "✓ Visible in Room",
    "hiddenInRoom": "👁️ Hidden (Tap to show)",
    "canBuyStars": "⭐ Available for {stars} Stars",
    "needStars": "⭐ Requires {stars} Stars (Have: {avail} ⭐)",
    "unlockAfterStep": "🔒 Unlocks after Step {step} (⭐ {stars})",
    "inPlace": "✓ In Room",
    "hidden": "Hidden",
    "buy": "Buy",
    "locked": "Locked",
    "starterLook": "🌟 Starter Look",
    "equippedOnBobbin": "✓ Currently on Bobbin",
    "inWardrobe": "✓ In Wardrobe (Equip)",
    "buyOutfitStars": "⭐ Buy for {stars} Stars",
    "natural": "✓ Natural",
    "unequip": "✓ Unequip",
    "strip": "Reset",
    "equip": "Equip",
    "buyStarsBtn": "✨ {stars} ⭐ Buy",
    "welcomeEmpty": "{room} is empty right now! Let's decorate it step-by-step with your stars!",
    "welcomeReturn": "Welcome back! Add new items to {room} or dress Bobbin in cozy knitted knitwear!",
    "roomLockedSoon": "✨ \"{name}\" will open very soon in an upcoming themed update!",
    "roomLockedProgress": "🏔️ Reach Level 50 or complete 4 items in the Artisan Workshop to unlock \"{name}\"!",
    "roomSelected": "Switched to \"{name}\"! Let's decorate this cozy room step-by-step with your stars.",
    "itemHidden": "{name} temporarily hidden. Stage {step} view is active.",
    "itemShown": "{name} placed back in the room!",
    "prevItemReq": "Step-by-step decoration! Let's unlock \"{prevName}\" ({stars} ⭐) first.",
    "needStarsItem": "We need {stars} stars for \"{name}\" (Have: {avail} ⭐). Clear more levels to collect stars!",
    "itemUnlocked": "Awesome! {stars} ⭐ spent, {name} added to the room! Remaining: {rem} ⭐",
    "outfitUnequipped": "{name} unequipped. Bobbin is back in his natural carved wood look!",
    "outfitEquipped": "Bobbin equipped \"{name}\"!",
    "outfitReset": "Bobbin removed all accessories, showing his natural warm walnut body!",
    "needStarsOutfit": "We need {stars} stars for \"{name}\" (Have: {avail} ⭐). Clear more levels to collect stars!",
    "outfitUnlocked": "Splendid! {stars} ⭐ spent and \"{name}\" fitted onto Bobbin! Remaining: {rem} ⭐"
  },
  "de": {
    "bareStart": "Leerer Raum",
    "itemsCount": "{n}/{total} Gegenstände",
    "outfitBare": "Outfit: Schlicht (Ohne Schal)",
    "equipped": "Ausgerüstet: {name}",
    "bareRoomChip": "0. Leerer Raum",
    "progressTitle": "{badge}-Fortschritt",
    "progressSub": "{unlocked} / {total} Gegenstände hinzugefügt",
    "tabKnitwear": "Bobbins Outfits",
    "identityNotice": "Ausgewählte Schals und Westen werden Bobbin im 3D-Raum oben angezogen!",
    "visibleInRoom": "✓ Im Raum sichtbar",
    "hiddenInRoom": "👁️ Versteckt (Tippen zum Zeigen)",
    "canBuyStars": "⭐ Verfügbar für {stars} Sterne",
    "needStars": "⭐ Benötigt {stars} Sterne (Du hast: {avail} ⭐)",
    "unlockAfterStep": "🔒 Freischaltung nach Schritt {step} (⭐ {stars})",
    "inPlace": "✓ Platziert",
    "hidden": "Versteckt",
    "buy": "Kaufen",
    "locked": "Gesperrt",
    "starterLook": "🌟 Start-Look",
    "equippedOnBobbin": "✓ Bobbin trägt dies",
    "inWardrobe": "✓ Im Schrank (Anziehen)",
    "buyOutfitStars": "⭐ Für {stars} Sterne kaufen",
    "natural": "✓ Schlicht",
    "unequip": "✓ Ablegen",
    "strip": "Zurücksetzen",
    "equip": "Anziehen",
    "buyStarsBtn": "✨ {stars} ⭐ Holen",
    "welcomeEmpty": "{room} ist noch leer! Lass uns Schritt für Schritt mit deinen Sternen dekorieren!",
    "welcomeReturn": "Willkommen zurück! Dekoriere {room} oder kleide Bobbin mit warmen Stricksachen ein!",
    "roomLockedSoon": "✨ \"{name}\" wird bald in einem thematischen Update eröffnet!",
    "roomLockedProgress": "🏔️ Erreiche Level 50 oder schließe 4 Gegenstände in der Werkstatt ab, um \"{name}\" freizuschalten!",
    "roomSelected": "Zu \"{name}\" gewechselt! Lass uns diesen gemütlichen Raum einrichten.",
    "itemHidden": "{name} vorübergehend versteckt. Stufe {step} ist aktiv.",
    "itemShown": "{name} wieder im Raum platziert!",
    "prevItemReq": "Schritt für Schritt dekorieren! Schalte zuerst \"{prevName}\" ({stars} ⭐) frei.",
    "needStarsItem": "Wir brauchen {stars} Sterne für \"{name}\" (Du hast: {avail} ⭐). Spiele mehr Level!",
    "itemUnlocked": "Großartig! {stars} ⭐ ausgegeben, {name} hinzugefügt! Übrig: {rem} ⭐",
    "outfitUnequipped": "{name} abgelegt. Bobbin ist wieder im Naturholz-Look!",
    "outfitEquipped": "Bobbin trägt nun \"{name}\"!",
    "outfitReset": "Bobbin hat alle Accessoires abgelegt und zeigt sein natürliches Holz!",
    "needStarsOutfit": "Wir brauchen {stars} Sterne für \"{name}\" (Du hast: {avail} ⭐).",
    "outfitUnlocked": "Klasse! {stars} ⭐ verwendet und \"{name}\" Bobbin angezogen! Übrig: {rem} ⭐"
  },
  "es": {
    "bareStart": "Sala Vacía",
    "itemsCount": "{n}/{total} Objetos",
    "outfitBare": "Ropa: Natural (Sin bufanda)",
    "equipped": "Equipado: {name}",
    "bareRoomChip": "0. Habitación Simple",
    "progressTitle": "Progreso de {badge}",
    "progressSub": "{unlocked} / {total} Objetos agregados a la sala",
    "tabKnitwear": "Ropa de Bobbin",
    "identityNotice": "¡Las bufandas y chalecos elegidos se colocan en Bobbin en el taller 3D!",
    "visibleInRoom": "✓ Visible en la sala",
    "hiddenInRoom": "👁️ Oculto (Toca para mostrar)",
    "canBuyStars": "⭐ Disponible por {stars} estrellas",
    "needStars": "⭐ Requiere {stars} estrellas (Tienes: {avail} ⭐)",
    "unlockAfterStep": "🔒 Se desbloquea tras el paso {step} (⭐ {stars})",
    "inPlace": "✓ Puesto",
    "hidden": "Oculto",
    "buy": "Comprar",
    "locked": "Bloqueado",
    "starterLook": "🌟 Aspecto Inicial",
    "equippedOnBobbin": "✓ Bobbin lo lleva puesto",
    "inWardrobe": "✓ En el Armario (Equipar)",
    "buyOutfitStars": "⭐ Comprar por {stars} estrellas",
    "natural": "✓ Natural",
    "unequip": "✓ Quitar",
    "strip": "Reset",
    "equip": "Equipar",
    "buyStarsBtn": "✨ {stars} ⭐ Obtener",
    "welcomeEmpty": "¡{room} está vacía! ¡Vamos a decorarla paso a paso con tus estrellas!",
    "welcomeReturn": "¡Te damos la bienvenida! ¡Añade objetos a {room} o viste a Bobbin con ropa tejida!",
    "roomLockedSoon": "✨ \"¡{name}\" se abrirá muy pronto en una próxima actualización!",
    "roomLockedProgress": "🏔️ ¡Alcanza el nivel 50 o completa 4 objetos en el taller para desbloquear \"{name}\"!",
    "roomSelected": "¡Cambiado a \"{name}\"! Decoremos esta acogedora sala con tus estrellas.",
    "itemHidden": "{name} oculto temporalmente. Fase {step} activa.",
    "itemShown": "¡{name} de nuevo en su lugar!",
    "prevItemReq": "¡Decoración paso a paso! Primero desbloquea \"{prevName}\" ({stars} ⭐).",
    "needStarsItem": "Necesitamos {stars} estrellas para \"{name}\" (Tienes: {avail} ⭐). ¡Supera más niveles!",
    "itemUnlocked": "¡Genial! {stars} ⭐ gastadas y {name} añadido. Restan: {rem} ⭐",
    "outfitUnequipped": "Se quitó {name}. ¡Bobbin vuelve a su aspecto de madera natural!",
    "outfitEquipped": "¡Bobbin se ha puesto \"{name}\"!",
    "outfitReset": "¡Bobbin se quitó todos los accesorios y luce su madera natural!",
    "needStarsOutfit": "Necesitamos {stars} estrellas para \"{name}\" (Tienes: {avail} ⭐).",
    "outfitUnlocked": "¡Fantástico! {stars} ⭐ gastadas y \"{name}\" puesto en Bobbin. Restan: {rem} ⭐"
  },
  "fr": {
    "bareStart": "Pièce Nue",
    "itemsCount": "{n}/{total} Objets",
    "outfitBare": "Tenue: Naturelle (Sans écharpe)",
    "equipped": "Équipé: {name}",
    "bareRoomChip": "0. Pièce Nue",
    "progressTitle": "Progression: {badge}",
    "progressSub": "{unlocked} / {total} Objets ajoutés à la pièce",
    "tabKnitwear": "Tenues de Bobbin",
    "identityNotice": "Les écharpes et gilets choisis habillent Bobbin dans l'atelier 3D ci-dessus !",
    "visibleInRoom": "✓ Visible dans la pièce",
    "hiddenInRoom": "👁️ Masqué (Toucher pour afficher)",
    "canBuyStars": "⭐ Disponible pour {stars} étoiles",
    "needStars": "⭐ Nécessite {stars} étoiles (Tu as: {avail} ⭐)",
    "unlockAfterStep": "🔒 Débloqué après l'étape {step} (⭐ {stars})",
    "inPlace": "✓ En place",
    "hidden": "Masqué",
    "buy": "Acheter",
    "locked": "Verrouillé",
    "starterLook": "🌟 Look de Départ",
    "equippedOnBobbin": "✓ Porté par Bobbin",
    "inWardrobe": "✓ Dans la Garde-robe (Équiper)",
    "buyOutfitStars": "⭐ Acheter pour {stars} étoiles",
    "natural": "✓ Naturel",
    "unequip": "✓ Retirer",
    "strip": "Réinitialiser",
    "equip": "Porter",
    "buyStarsBtn": "✨ {stars} ⭐ Obtenir",
    "welcomeEmpty": "{room} est vide pour l'instant ! Décorons-la étape par étape grâce à tes étoiles !",
    "welcomeReturn": "Bienvenue ! Ajoute des meubles à {room} ou habille Bobbin avec des tricots douillets !",
    "roomLockedSoon": "✨ \"{name}\" ouvrira très bientôt dans une prochaine mise à jour !",
    "roomLockedProgress": "🏔️ Atteins le niveau 50 ou termine 4 objets pour débloquer \"{name}\" !",
    "roomSelected": "Passé à \"{name}\" ! Meublons cette chaleureuse pièce avec tes étoiles.",
    "itemHidden": "{name} temporairement masqué. Étape {step} active.",
    "itemShown": "{name} remis en place dans la pièce !",
    "prevItemReq": "Décoration étape par étape ! Débloque d'abord \"{prevName}\" ({stars} ⭐).",
    "needStarsItem": "Il faut {stars} étoiles pour \"{name}\" (Tu as: {avail} ⭐). Réussis plus de niveaux !",
    "itemUnlocked": "Superbe ! {stars} ⭐ dépensées et {name} ajouté ! Restant: {rem} ⭐",
    "outfitUnequipped": "{name} retiré. Bobbin retrouve son aspect en bois naturel !",
    "outfitEquipped": "Bobbin a enfilé \"{name}\" !",
    "outfitReset": "Bobbin a retiré tous ses accessoires pour un style en noyer brut !",
    "needStarsOutfit": "Il faut {stars} étoiles pour \"{name}\" (Tu as: {avail} ⭐).",
    "outfitUnlocked": "Magnifique ! {stars} ⭐ utilisées et \"{name}\" porté par Bobbin ! Restant: {rem} ⭐"
  },
  "it": {
    "bareStart": "Stanza Vuota",
    "itemsCount": "{n}/{total} Oggetti",
    "outfitBare": "Abito: Naturale (Senza sciarpa)",
    "equipped": "Equipaggiato: {name}",
    "bareRoomChip": "0. Stanza Base",
    "progressTitle": "Avanzamento: {badge}",
    "progressSub": "{unlocked} / {total} Oggetti aggiunti",
    "tabKnitwear": "Abiti di Bobbin",
    "identityNotice": "Le sciarpe e i gilet selezionati vengono indossati da Bobbin nella bottega 3D!",
    "visibleInRoom": "✓ Visibile nella stanza",
    "hiddenInRoom": "👁️ Nascosto (Tocca per mostrare)",
    "canBuyStars": "⭐ Disponibile per {stars} stelle",
    "needStars": "⭐ Richiede {stars} stelle (Hai: {avail} ⭐)",
    "unlockAfterStep": "🔒 Si sblocca dopo lo step {step} (⭐ {stars})",
    "inPlace": "✓ Sistemato",
    "hidden": "Nascosto",
    "buy": "Acquista",
    "locked": "Bloccato",
    "starterLook": "🌟 Look Base",
    "equippedOnBobbin": "✓ Indossato da Bobbin",
    "inWardrobe": "✓ Nel Guardaroba (Indossa)",
    "buyOutfitStars": "⭐ Acquista per {stars} stelle",
    "natural": "✓ Naturale",
    "unequip": "✓ Rimuovi",
    "strip": "Reset",
    "equip": "Indossa",
    "buyStarsBtn": "✨ {stars} ⭐ Prendi",
    "welcomeEmpty": "{room} è ancora vuota! Arrediamola passo dopo passo con le tue stelle!",
    "welcomeReturn": "Bentornato! Aggiungi arredi a {room} o vesti Bobbin con caldi capi lavorati a maglia!",
    "roomLockedSoon": "✨ \"{name}\" aprirà presto con un nuovo aggiornamento tematico!",
    "roomLockedProgress": "🏔️ Raggiungi il livello 50 o completa 4 arredi per sbloccare \"{name}\"!",
    "roomSelected": "Passato a \"{name}\"! Arrediamo questa calda stanza con le tue stelle.",
    "itemHidden": "{name} temporaneamente nascosto. Step {step} attivo.",
    "itemShown": "{name} di nuovo nella stanza!",
    "prevItemReq": "Arrediamo in ordine! Sblocca prima \"{prevName}\" ({stars} ⭐).",
    "needStarsItem": "Servono {stars} stelle per \"{name}\" (Hai: {avail} ⭐). Supera più livelli!",
    "itemUnlocked": "Meraviglioso! {stars} ⭐ spese e {name} aggiunto! Rimaste: {rem} ⭐",
    "outfitUnequipped": "{name} rimosso. Bobbin torna al legno naturale!",
    "outfitEquipped": "Bobbin ora indossa \"{name}\"!",
    "outfitReset": "Bobbin ha tolto gli accessori ed è in legno di noce al naturale!",
    "needStarsOutfit": "Servono {stars} stelle per \"{name}\" (Hai: {avail} ⭐).",
    "outfitUnlocked": "Fantastico! {stars} ⭐ utilizzate e \"{name}\" indossato da Bobbin! Rimaste: {rem} ⭐"
  },
  "pt": {
    "bareStart": "Quarto Vazio",
    "itemsCount": "{n}/{total} Itens",
    "outfitBare": "Visual: Natural (Sem lenço)",
    "equipped": "Equipado: {name}",
    "bareRoomChip": "0. Quarto Básico",
    "progressTitle": "Progresso: {badge}",
    "progressSub": "{unlocked} / {total} Itens adicionados ao cômodo",
    "tabKnitwear": "Roupas do Bobbin",
    "identityNotice": "Os cachecóis e coletes escolhidos são vestidos no Bobbin na oficina 3D!",
    "visibleInRoom": "✓ Visível no quarto",
    "hiddenInRoom": "👁️ Oculto (Toque para exibir)",
    "canBuyStars": "⭐ Disponível por {stars} estrelas",
    "needStars": "⭐ Requer {stars} estrelas (Você tem: {avail} ⭐)",
    "unlockAfterStep": "🔒 Desbloqueia após a etapa {step} (⭐ {stars})",
    "inPlace": "✓ Posicionado",
    "hidden": "Oculto",
    "buy": "Comprar",
    "locked": "Bloqueado",
    "starterLook": "🌟 Visual Inicial",
    "equippedOnBobbin": "✓ Equipado no Bobbin",
    "inWardrobe": "✓ No Guarda-roupa (Equipar)",
    "buyOutfitStars": "⭐ Comprar por {stars} estrelas",
    "natural": "✓ Natural",
    "unequip": "✓ Tirar",
    "strip": "Reset",
    "equip": "Equipar",
    "buyStarsBtn": "✨ {stars} ⭐ Comprar",
    "welcomeEmpty": "{room} está vazia agora! Vamos decorá-la passo a passo com suas estrelas!",
    "welcomeReturn": "Boas-vindas! Adicione itens a {room} ou vista o Bobbin com acessórios quentinhos de tricô!",
    "roomLockedSoon": "✨ \"{name}\" será inaugurada em breve em uma atualização temática!",
    "roomLockedProgress": "🏔️ Alcance o nível 50 ou complete 4 itens para desbloquear \"{name}\"!",
    "roomSelected": "Mudou para \"{name}\"! Vamos mobiliar esse cômodo aconchegante.",
    "itemHidden": "{name} oculto temporariamente. Fase {step} ativa.",
    "itemShown": "{name} de volta ao seu lugar!",
    "prevItemReq": "Decoração em ordem! Desbloqueie primeiro \"{prevName}\" ({stars} ⭐).",
    "needStarsItem": "Precisamos de {stars} estrelas para \"{name}\" (Você tem: {avail} ⭐).",
    "itemUnlocked": "Incrível! {stars} ⭐ gastas e {name} adicionado! Restam: {rem} ⭐",
    "outfitUnequipped": "{name} retirado. Bobbin voltou ao visual de madeira natural!",
    "outfitEquipped": "Bobbin equipou \"{name}\"!",
    "outfitReset": "Bobbin retirou todos os acessórios e está com sua madeira natural!",
    "needStarsOutfit": "Precisamos de {stars} estrelas para \"{name}\" (Você tem: {avail} ⭐).",
    "outfitUnlocked": "Maravilha! {stars} ⭐ gastas e \"{name}\" colocado no Bobbin! Restam: {rem} ⭐"
  },
  "ru": {
    "bareStart": "Пустая комната",
    "itemsCount": "{n}/{total} Предметов",
    "outfitBare": "Образ: Натуральный (Без шарфа)",
    "equipped": "Надето: {name}",
    "bareRoomChip": "0. Базовая комната",
    "progressTitle": "Прогресс: {badge}",
    "progressSub": "{unlocked} / {total} Предметов добавлено",
    "tabKnitwear": "Наряды Боббина",
    "identityNotice": "Выбранный шарф или жилет надевается на Боббина прямо в 3D-мастерской!",
    "visibleInRoom": "✓ Виден в комнате",
    "hiddenInRoom": "👁️ Скрыт (Нажмите, чтобы показать)",
    "canBuyStars": "⭐ Доступно за {stars} звёзд",
    "needStars": "⭐ Нужно {stars} звёзд (У вас: {avail} ⭐)",
    "unlockAfterStep": "🔒 Откроется после шага {step} (⭐ {stars})",
    "inPlace": "✓ На месте",
    "hidden": "Скрыто",
    "buy": "Купить",
    "locked": "Закрыто",
    "starterLook": "🌟 Базовый образ",
    "equippedOnBobbin": "✓ Надето на Боббина",
    "inWardrobe": "✓ В гардеробе (Надеть)",
    "buyOutfitStars": "⭐ Купить за {stars} звёзд",
    "natural": "✓ Базовый",
    "unequip": "✓ Снять",
    "strip": "Снять всё",
    "equip": "Надеть",
    "buyStarsBtn": "✨ {stars} ⭐ Взять",
    "welcomeEmpty": "{room} пока пустая! Давай украсим её шаг за шагом твоими звёздами!",
    "welcomeReturn": "Добро пожаловать! Украшай {room} или наряжай Боббина в уютные вязаные вещи!",
    "roomLockedSoon": "✨ \"{name}\" откроется совсем скоро в новом тематическом обновлении!",
    "roomLockedProgress": "🏔️ Достигните 50 уровня или соберите 4 предмета, чтобы открыть \"{name}\"!",
    "roomSelected": "Перешли в \"{name}\"! Обустроим эту уютную комнату твоими звёздами.",
    "itemHidden": "{name} временно скрыт. Активен {step} этап.",
    "itemShown": "{name} снова на месте!",
    "prevItemReq": "Обустраиваем по порядку! Сначала откройте \"{prevName}\" ({stars} ⭐).",
    "needStarsItem": "Для \"{name}\" нужно {stars} звёзд (У вас: {avail} ⭐). Пройдите ещё уровни!",
    "itemUnlocked": "Отлично! Потрачено {stars} ⭐, {name} добавлен! Осталось: {rem} ⭐",
    "outfitUnequipped": "{name} снят. Боббин вернулся к естественному деревянному виду!",
    "outfitEquipped": "Боббин надел \"{name}\"!",
    "outfitReset": "Боббин снял все аксессуары и красуется резным деревом!",
    "needStarsOutfit": "Для \"{name}\" нужно {stars} звёзд (У вас: {avail} ⭐).",
    "outfitUnlocked": "Чудесно! Потрачено {stars} ⭐, \"{name}\" надет на Боббина! Осталось: {rem} ⭐"
  },
  "ja": {
    "bareStart": "空の部屋",
    "itemsCount": "{n}/{total} アイテム",
    "outfitBare": "服装: ナチュラル（スカーフなし）",
    "equipped": "着用中: {name}",
    "bareRoomChip": "0. 何もない部屋",
    "progressTitle": "{badge}の進捗",
    "progressSub": "{unlocked} / {total} 個のアイテムを設置済み",
    "tabKnitwear": "ボビンの衣装",
    "identityNotice": "選んだマフラーやベストは上の3Dアトリエでボビンが実際に着用します！",
    "visibleInRoom": "✓ 部屋に配置中",
    "hiddenInRoom": "👁️ 非表示（タップで表示）",
    "canBuyStars": "⭐ スター{stars}個で入手可能",
    "needStars": "⭐ スター{stars}個が必要（所持: {avail} ⭐）",
    "unlockAfterStep": "🔒 ステップ{step}の後に解放（⭐ {stars}）",
    "inPlace": "✓ 設置中",
    "hidden": "非表示",
    "buy": "購入",
    "locked": "ロック",
    "starterLook": "🌟 初期スタイル",
    "equippedOnBobbin": "✓ ボビンが着用中",
    "inWardrobe": "✓ ワードローブ（装着）",
    "buyOutfitStars": "⭐ スター{stars}個で購入",
    "natural": "✓ 素顔",
    "unequip": "✓ 外す",
    "strip": "素顔に戻る",
    "equip": "着用",
    "buyStarsBtn": "✨ {stars} ⭐ ゲット",
    "welcomeEmpty": "「{room}」はまだ空っぽ！スターを使って順番に家具を揃えましょう！",
    "welcomeReturn": "おかえりなさい！「{room}」に家具を置いたり、ボビンに手編みの服を着せましょう！",
    "roomLockedSoon": "✨ 「{name}」は次回のテーマアップデートでまもなくオープンします！",
    "roomLockedProgress": "🏔️ レベル50に到達するか、職人アトリエで4個の家具を完成させて「{name}」を解放しよう！",
    "roomSelected": "「{name}」に移動しました！スターで温かな部屋を作り上げましょう。",
    "itemHidden": "{name}を一時的に非表示にしました。ステップ{step}を表示中。",
    "itemShown": "{name}を再び部屋に配置しました！",
    "prevItemReq": "順番に飾っていきましょう！まずは「{prevName}」（⭐ {stars}）を解放してください。",
    "needStarsItem": "「{name}」にはスター{stars}個が必要です（所持: {avail} ⭐）。",
    "itemUnlocked": "すばらしい！スター{stars}個を使い「{name}」を設置しました！残り: {rem} ⭐",
    "outfitUnequipped": "{name}を外しました。ボビンは自然な木の姿に戻りました！",
    "outfitEquipped": "ボビンが「{name}」を着用しました！",
    "outfitReset": "ボビンはすべての服を脱ぎ、温もりあるウォルナットの姿になりました！",
    "needStarsOutfit": "「{name}」にはスター{stars}個が必要です（所持: {avail} ⭐）。",
    "outfitUnlocked": "素敵！スター{stars}個を使ってボビンに「{name}」を着せました！残り: {rem} ⭐"
  },
  "ko": {
    "bareStart": "기본 빈 방",
    "itemsCount": "{n}/{total} 가구",
    "outfitBare": "의상: 기본 (스카프 없음)",
    "equipped": "착용 중: {name}",
    "bareRoomChip": "0. 기본 방",
    "progressTitle": "{badge} 복원 진행률",
    "progressSub": "{unlocked} / {total} 개 가구 설치 완료",
    "tabKnitwear": "보빈의 의상실",
    "identityNotice": "선택한 목도리와 조끼를 위 3D 공방의 보빈에게 직접 입혀줄 수 있어요!",
    "visibleInRoom": "✓ 방에 배치됨",
    "hiddenInRoom": "👁️ 숨김 (탭하여 표시)",
    "canBuyStars": "⭐ 별 {stars}개로 획득 가능",
    "needStars": "⭐ 별 {stars}개 필요 (보유: {avail} ⭐)",
    "unlockAfterStep": "🔒 {step}단계 완료 후 잠금 해제 (⭐ {stars})",
    "inPlace": "✓ 설치됨",
    "hidden": "숨김",
    "buy": "구매",
    "locked": "잠김",
    "starterLook": "🌟 기본 외형",
    "equippedOnBobbin": "✓ 보빈이 착용 중",
    "inWardrobe": "✓ 보관함 (무료 착용)",
    "buyOutfitStars": "⭐ 별 {stars}개로 구매",
    "natural": "✓ 기본",
    "unequip": "✓ 벗기",
    "strip": "기본으로",
    "equip": "착용",
    "buyStarsBtn": "✨ {stars} ⭐ 획득",
    "welcomeEmpty": "지금 {room}은 텅 비어있어요! 별을 모아 하나씩 방을 꾸며볼까요?",
    "welcomeReturn": "어서 와요! {room}에 새 가구를 들여놓거나 보빈에게 따뜻한 손뜨개 옷을 입혀주세요!",
    "roomLockedSoon": "✨ \"{name}\"은 곧 다가올 테마 업데이트에서 공개됩니다!",
    "roomLockedProgress": "🏔️ 50레벨을 달성하거나 장인 공방 가구 4개를 모아 \"{name}\"을 잠금 해제하세요!",
    "roomSelected": "\"{name}\"(으)로 이동했습니다! 모은 별로 포근한 방을 꾸며보세요.",
    "itemHidden": "{name} 가구를 숨겼습니다. {step}단계 인테리어 적용 중.",
    "itemShown": "{name} 가구를 다시 방에 배치했습니다!",
    "prevItemReq": "가구는 순서대로 꾸며요! 먼저 \"{prevName}\"(⭐ {stars})을 들여놓으세요.",
    "needStarsItem": "\"{name}\"에는 별 {stars}개가 필요해요 (현재: {avail} ⭐).",
    "itemUnlocked": "좋아요! 별 {stars}개를 사용해 {name}을 설치했습니다! 남은 별: {rem} ⭐",
    "outfitUnequipped": "{name} 의상을 벗었습니다. 보빈이 본래 나무 모습으로 돌아왔어요!",
    "outfitEquipped": "보빈이 \"{name}\"을(를) 입었습니다!",
    "outfitReset": "보빈이 모든 장식을 벗고 아늑한 호두나무 몸체로 돌아왔습니다!",
    "needStarsOutfit": "\"{name}\"에는 별 {stars}개가 필요해요 (현재: {avail} ⭐).",
    "outfitUnlocked": "멋져요! 별 {stars}개를 사용해 보빈에게 \"{name}\"을 입혔습니다! 남은 별: {rem} ⭐"
  },
  "zh": {
    "bareStart": "初始空房",
    "itemsCount": "{n}/{total} 件物品",
    "outfitBare": "服饰: 原木自然（无围巾）",
    "equipped": "已穿戴: {name}",
    "bareRoomChip": "0. 原始空屋",
    "progressTitle": "{badge}进度",
    "progressSub": "已添加 {unlocked} / {total} 件物品",
    "tabKnitwear": "波宾的衣橱",
    "identityNotice": "选中的围巾或马甲将即时穿戴在上方3D工坊中的波宾身上！",
    "visibleInRoom": "✓ 已在房间展示",
    "hiddenInRoom": "👁️ 已隐藏（点击显示）",
    "canBuyStars": "⭐ 可用 {stars} 颗星星兑换",
    "needStars": "⭐ 需要 {stars} 颗星星（当前: {avail} ⭐）",
    "unlockAfterStep": "🔒 完成第 {step} 步后解锁（⭐ {stars}）",
    "inPlace": "✓ 已放置",
    "hidden": "隐藏",
    "buy": "兑换",
    "locked": "未解锁",
    "starterLook": "🌟 经典外观",
    "equippedOnBobbin": "✓ 波宾正在穿戴",
    "inWardrobe": "✓ 衣橱已收纳（免费穿戴）",
    "buyOutfitStars": "⭐ 用 {stars} 颗星星解锁",
    "natural": "✓ 原始",
    "unequip": "✓ 卸下",
    "strip": "恢复自然",
    "equip": "穿戴",
    "buyStarsBtn": "✨ {stars} ⭐ 解锁",
    "welcomeEmpty": "“{room}”目前还是空空的！快用通关获得的星星逐步布置吧！",
    "welcomeReturn": "欢迎回来！继续装点“{room}”，或者给波宾换上暖洋洋的手织毛线服饰吧！",
    "roomLockedSoon": "✨ “{name}”即将随后续主题更新精彩开启！",
    "roomLockedProgress": "🏔️ 达到第50关或完成匠人工坊4件物品以解锁“{name}”！",
    "roomSelected": "已进入“{name}”！快用星星一步步布置这座温馨小窝吧。",
    "itemHidden": "{name}已暂时收起。目前展示第 {step} 阶段。",
    "itemShown": "{name}已重新放置回房间中！",
    "prevItemReq": "按照顺序打造房间！请先解锁“{prevName}”（⭐ {stars}）。",
    "needStarsItem": "解锁“{name}”需要 {stars} 颗星星（当前拥有: {avail} ⭐）。",
    "itemUnlocked": "太棒了！花费 {stars} ⭐，成功布置了{name}！剩余: {rem} ⭐",
    "outfitUnequipped": "已卸下{name}。波宾恢复了温暖的天然原木外观！",
    "outfitEquipped": "波宾穿戴了“{name}”！",
    "outfitReset": "波宾脱下了全部配饰，展现出纯朴温润的胡桃木原貌！",
    "needStarsOutfit": "解锁“{name}”需要 {stars} 颗星星（当前拥有: {avail} ⭐）。",
    "outfitUnlocked": "太赞了！花费 {stars} ⭐，已为波宾穿上“{name}”！剩余: {rem} ⭐"
  },
  "ar": {
    "bareStart": "غرفة فارغة",
    "itemsCount": "{n}/{total} قطع",
    "outfitBare": "الزي: طبيعي (بدون وشاح)",
    "equipped": "مرتدي: {name}",
    "bareRoomChip": "0. غرفة أساسية",
    "progressTitle": "تقدم {badge}",
    "progressSub": "تمت إضافة {unlocked} / {total} قطع إلى الغرفة",
    "tabKnitwear": "أزياء بوبين",
    "identityNotice": "الأوشحة والسترات المختارة يرتديها بوبين مباشرة في الورشة ثلاثية الأبعاد أعلاه!",
    "visibleInRoom": "✓ معروض في الغرفة",
    "hiddenInRoom": "👁️ مخفي (انقر للعرض)",
    "canBuyStars": "⭐ متاح مقابل {stars} نجوم",
    "needStars": "⭐ يلزم {stars} نجوم (لديك: {avail} ⭐)",
    "unlockAfterStep": "🔒 يفتح بعد الخطوة {step} (⭐ {stars})",
    "inPlace": "✓ في المكان",
    "hidden": "مخفي",
    "buy": "شراء",
    "locked": "مغلق",
    "starterLook": "🌟 المظهر الأساسي",
    "equippedOnBobbin": "✓ يرتديه بوبين الآن",
    "inWardrobe": "✓ في الخزانة (ارتداء)",
    "buyOutfitStars": "⭐ شراء مقابل {stars} نجوم",
    "natural": "✓ طبيعي",
    "unequip": "✓ نزع",
    "strip": "طبيعي",
    "equip": "ارتداء",
    "buyStarsBtn": "✨ {stars} ⭐ شراء",
    "welcomeEmpty": "{room} فارغة حالياً! دعنا نزينها خطوة بخطوة بنجومك الجميلة!",
    "welcomeReturn": "أهلاً بك مجدداً! أضف أثاثاً جديداً إلى {room} أو ألبس بوبين أزياء صوفية دافئة!",
    "roomLockedSoon": "✨ سيتم فتح \"{name}\" قريباً جداً في التحديث القادم!",
    "roomLockedProgress": "🏔️ بلغ المستوى 50 أو أكمل 4 قطع لفتح \"{name}\"!",
    "roomSelected": "تم الانتقال إلى \"{name}\"! لنؤثث هذه الغرفة الدافئة خطوة بخطوة.",
    "itemHidden": "تم إخفاء {name} مؤقتاً. مرحلة العرض {step} نشطة.",
    "itemShown": "تمت إعادة {name} إلى مكانه في الغرفة!",
    "prevItemReq": "نؤثث الغرفة بالترتيب! افتح أولاً \"{prevName}\" (⭐ {stars}).",
    "needStarsItem": "يلزمنا {stars} نجوم لـ \"{name}\" (لديك: {avail} ⭐).",
    "itemUnlocked": "رائع! تم إنفاق {stars} ⭐ وإضافة {name}! المتبقي: {rem} ⭐",
    "outfitUnequipped": "تم خلع {name}. عاد بوبين لمظهره الخشبي الطبيعي!",
    "outfitEquipped": "ارتدى بوبين \"{name}\"!",
    "outfitReset": "خلع بوبين جميع الإكسسوارات وعاد لجسده الخشبي الدافئ!",
    "needStarsOutfit": "يلزمنا {stars} نجوم لـ \"{name}\" (لديك: {avail} ⭐).",
    "outfitUnlocked": "بديع! تم إنفاق {stars} ⭐ وإلباس \"{name}\" لبوبين! المتبقي: {rem} ⭐"
  }
};

export function getWorkshopRoom(roomId: string, lang: Lang): RoomLocale {
  const r = ROOMS_DATA[roomId];
  if (!r) return { name: roomId, badge: roomId, subtitle: '', unlockConditionText: '' };
  return r[lang] || r['en'] || r['tr'];
}

export function getWorkshopItem(itemId: string, lang: Lang): ItemLocale {
  const it = ITEMS_DATA[itemId];
  if (!it) return { name: itemId, shortLabel: itemId, desc: '' };
  const loc = it[lang] || it['en'] || it['tr'];
  return { name: loc.name, shortLabel: loc.short, desc: loc.desc };
}

export function getBobbinOutfit(outfitId: string, lang: Lang): OutfitLocale {
  const o = OUTFITS_DATA[outfitId];
  if (!o) return { name: outfitId, desc: '' };
  return o[lang] || o['en'] || o['tr'];
}

export function getWorkshopUI(lang: Lang): WorkshopUILocale {
  const ui = UI_DATA[lang] || UI_DATA['en'] || UI_DATA['tr'];
  return {
    ...ui,
    itemsCount: (n: number, total: number) => ui.itemsCount.replace('{n}', String(n)).replace('{total}', String(total)),
    equipped: (name: string) => ui.equipped.replace('{name}', name),
    progressTitle: (badge: string) => ui.progressTitle.replace('{badge}', badge),
    progressSub: (unlocked: number, total: number) => ui.progressSub.replace('{unlocked}', String(unlocked)).replace('{total}', String(total)),
    canBuyStars: (stars: number) => ui.canBuyStars.replace('{stars}', String(stars)),
    needStars: (stars: number, avail: number) => ui.needStars.replace('{stars}', String(stars)).replace('{avail}', String(avail)),
    unlockAfterStep: (step: number, stars: number) => ui.unlockAfterStep.replace('{step}', String(step)).replace('{stars}', String(stars)),
    buyOutfitStars: (stars: number) => ui.buyOutfitStars.replace('{stars}', String(stars)),
    buyStarsBtn: (stars: number) => ui.buyStarsBtn.replace('{stars}', String(stars)),
    welcomeEmpty: (room: string) => ui.welcomeEmpty.replace('{room}', room),
    welcomeReturn: (room: string) => ui.welcomeReturn.replace('{room}', room),
    roomLockedSoon: (name: string) => ui.roomLockedSoon.replace('{name}', name),
    roomLockedProgress: (name: string) => ui.roomLockedProgress.replace('{name}', name),
    roomSelected: (name: string) => ui.roomSelected.replace('{name}', name),
    itemHidden: (name: string, step: number) => ui.itemHidden.replace('{name}', name).replace('{step}', String(step)),
    itemShown: (name: string) => ui.itemShown.replace('{name}', name),
    prevItemReq: (prevName: string, stars: number) => ui.prevItemReq.replace('{prevName}', prevName).replace('{stars}', String(stars)),
    needStarsItem: (name: string, stars: number, avail: number) => ui.needStarsItem.replace('{name}', name).replace('{stars}', String(stars)).replace('{avail}', String(avail)),
    itemUnlocked: (name: string, stars: number, rem: number) => ui.itemUnlocked.replace('{name}', name).replace('{stars}', String(stars)).replace('{rem}', String(rem)),
    outfitUnequipped: (name: string) => ui.outfitUnequipped.replace('{name}', name),
    outfitEquipped: (name: string) => ui.outfitEquipped.replace('{name}', name),
    outfitReset: () => ui.outfitReset,
    needStarsOutfit: (name: string, stars: number, avail: number) => ui.needStarsOutfit.replace('{name}', name).replace('{stars}', String(stars)).replace('{avail}', String(avail)),
    outfitUnlocked: (name: string, stars: number, rem: number) => ui.outfitUnlocked.replace('{name}', name).replace('{stars}', String(stars)).replace('{rem}', String(rem)),
  } as unknown as WorkshopUILocale;
}
