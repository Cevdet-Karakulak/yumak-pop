import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

type Sfx = 'pull' | 'tap' | 'pop' | 'button' | 'blocked' | 'win' | 'lose';

const SOURCES: Record<Sfx, number> = {
  pull: require('../assets/sounds/pull.wav'),
  tap: require('../assets/sounds/tap.wav'),
  pop: require('../assets/sounds/pop.wav'),
  button: require('../assets/sounds/button.wav'),
  blocked: require('../assets/sounds/blocked.wav'),
  win: require('../assets/sounds/win.wav'),
  lose: require('../assets/sounds/lose.wav'),
};

const POOL_SIZE: Partial<Record<Sfx, number>> = { pull: 4, pop: 3, tap: 2 };

let pools: Partial<Record<Sfx, { players: AudioPlayer[]; next: number }>> = {};
let music: AudioPlayer | null = null;
let ready = false;

export const audioSettings = { sound: true, music: true, haptics: true };

const ASMR_SOURCES = [
  require('../assets/sounds/asmr_c4.wav'),
  require('../assets/sounds/asmr_e4.wav'),
  require('../assets/sounds/asmr_g4.wav'),
  require('../assets/sounds/asmr_b4.wav'),
  require('../assets/sounds/asmr_c5.wav'),
];
const FEVER_CHORD_SOURCE = require('../assets/sounds/asmr_fever.wav');

let asmrPlayers: AudioPlayer[] = [];
let feverChordPlayer: AudioPlayer | null = null;

export async function initAudio() {
  if (ready) return;
  ready = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' } as any);
  } catch {}
  (Object.keys(SOURCES) as Sfx[]).forEach((k) => {
    try {
      const n = POOL_SIZE[k] ?? 1;
      pools[k] = {
        players: Array.from({ length: n }, () => {
          const p = createAudioPlayer(SOURCES[k]);
          p.volume = k === 'pull' ? 0.5 : 0.8;
          return p;
        }),
        next: 0,
      };
    } catch (err) {
      console.warn('Audio pool init error for', k, err);
    }
  });

  try {
    asmrPlayers = ASMR_SOURCES.map((src) => {
      const p = createAudioPlayer(src);
      p.volume = 0.85;
      return p;
    });
    feverChordPlayer = createAudioPlayer(FEVER_CHORD_SOURCE);
    feverChordPlayer.volume = 0.95;
  } catch (err) {
    console.warn('ASMR audio init error:', err);
  }

  try {
    music = createAudioPlayer(require('../assets/sounds/music.wav'));
    music.loop = true;
    music.volume = 0.35;
    syncMusic();
  } catch (err) {
    console.warn('Music init error:', err);
  }
}

export function playAsmrComboTone(comboIndex: number) {
  if (!audioSettings.sound) return;
  try {
    const idx = Math.max(0, Math.min(comboIndex, asmrPlayers.length - 1));
    const p = asmrPlayers[idx];
    if (p) {
      p.seekTo(0);
      p.play();
    }
    buzz('light');
  } catch {}
}

export function playAsmrFeverChord() {
  if (!audioSettings.sound) return;
  try {
    if (feverChordPlayer) {
      feverChordPlayer.seekTo(0);
      feverChordPlayer.play();
    }
    buzz('success');
  } catch {}
}

export function play(sfx: Sfx) {
  if (!audioSettings.sound) return;
  const pool = pools[sfx];
  if (!pool) return;
  const p = pool.players[pool.next];
  pool.next = (pool.next + 1) % pool.players.length;
  try {
    p.seekTo(0);
    p.play();
  } catch {}
}

export function syncMusic() {
  if (!music) return;
  try {
    if (audioSettings.music) music.play();
    else music.pause();
  } catch {}
}

export function pauseMusic() {
  try {
    music?.pause();
  } catch {}
}

export function buzz(kind: 'light' | 'medium' | 'success' | 'error') {
  if (!audioSettings.haptics) return;
  try {
    let p: Promise<void> | null = null;
    if (kind === 'light') p = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (kind === 'medium') p = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (kind === 'success') p = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else p = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  } catch {}
}
