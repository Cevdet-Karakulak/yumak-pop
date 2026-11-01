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

export async function initAudio() {
  if (ready) return;
  ready = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' } as any);
  } catch {}
  (Object.keys(SOURCES) as Sfx[]).forEach((k) => {
    const n = POOL_SIZE[k] ?? 1;
    pools[k] = {
      players: Array.from({ length: n }, () => {
        const p = createAudioPlayer(SOURCES[k]);
        p.volume = k === 'pull' ? 0.5 : 0.8;
        return p;
      }),
      next: 0,
    };
  });
  music = createAudioPlayer(require('../assets/sounds/music.wav'));
  music.loop = true;
  music.volume = 0.35;
  syncMusic();
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
