import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { audioSettings, syncMusic } from './audio';
import { MechanicKind } from './game/levels';
import { deviceLang, Lang, STRINGS, Strings } from './i18n';

export type BoosterKind = 'undo' | 'slot' | 'magnet';

export interface SaveData {
  unlocked: number;
  stars: Record<number, number>;
  coins: number;
  unlockedSlots: number; // 3..6 active rack slots (starts at 3)
  boosters: Record<BoosterKind, number>;
  sound: boolean;
  music: boolean;
  haptics: boolean;
  lang: Lang | null;
  tutorialDone: boolean;
  seenMechanics: Partial<Record<MechanicKind, boolean>>;
  deaths: number;
  completedLevels: number;
  workshopItems: string[];
  bobbinOutfit: string;
  workshopVersion?: number;
}

const KEY = 'yumakpop:save:v1';

const DEFAULT: SaveData = {
  unlocked: 1,
  stars: {},
  coins: 120,
  unlockedSlots: 3,
  boosters: { undo: 3, slot: 2, magnet: 2 },
  sound: true,
  music: true,
  haptics: true,
  lang: null,
  tutorialDone: false,
  seenMechanics: {},
  deaths: 0,
  completedLevels: 0,
  workshopItems: [],
  bobbinOutfit: 'none',
  workshopVersion: 2,
};

export const BOOSTER_PRICE: Record<BoosterKind, number> = { undo: 60, slot: 120, magnet: 150 };
export const CONTINUE_PRICE = 90;
export const COLOR_SWAP_PRICE = 30;
export const SLOT_UNLOCK_PRICES: Record<number, number> = {
  3: 40,  // 4th slot (index 3) - for this level
  4: 75,  // 5th slot (index 4) - for this level
  5: 100, // 6th slot (index 5) - for this level
};

interface Ctx {
  data: SaveData;
  loaded: boolean;
  t: Strings;
  lang: Lang;
  update: (fn: (d: SaveData) => SaveData) => void;
  reset: () => void;
}

const SaveContext = createContext<Ctx | null>(null);

export function SaveProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SaveData>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          const isLegacyWorkshop = parsed.workshopVersion !== 2;
          setData({
            ...DEFAULT,
            ...parsed,
            workshopItems: isLegacyWorkshop ? [] : (parsed.workshopItems ?? []),
            bobbinOutfit: isLegacyWorkshop ? 'none' : (parsed.bobbinOutfit ?? 'none'),
            workshopVersion: 2,
            boosters: { ...DEFAULT.boosters, ...parsed.boosters },
            seenMechanics: { ...DEFAULT.seenMechanics, ...parsed.seenMechanics },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    audioSettings.sound = data.sound;
    audioSettings.haptics = data.haptics;
    if (audioSettings.music !== data.music) {
      audioSettings.music = data.music;
      syncMusic();
    }
  }, [data.sound, data.music, data.haptics]);

  const update = useCallback((fn: (d: SaveData) => SaveData) => {
    setData((prev) => {
      const next = fn(prev);
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    update((d) => ({ ...DEFAULT, sound: d.sound, music: d.music, haptics: d.haptics, lang: d.lang }));
  }, [update]);

  const lang = data.lang ?? deviceLang();
  const value = useMemo(
    () => ({ data, loaded, t: STRINGS[lang], lang, update, reset }),
    [data, loaded, lang, update, reset],
  );
  return <SaveContext.Provider value={value}>{children}</SaveContext.Provider>;
}

export function useSave() {
  const c = useContext(SaveContext);
  if (!c) throw new Error('useSave outside provider');
  return c;
}
