import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const ASMR_SOURCES = [
  require('../../../assets/sounds/asmr_c4.wav'),
  require('../../../assets/sounds/asmr_e4.wav'),
  require('../../../assets/sounds/asmr_g4.wav'),
  require('../../../assets/sounds/asmr_b4.wav'),
  require('../../../assets/sounds/asmr_c5.wav'),
];

const FEVER_CHORD_SOURCE = require('../../../assets/sounds/asmr_fever.wav');

let tonePlayers: AudioPlayer[] = [];
let chordPlayer: AudioPlayer | null = null;
let isLoaded = false;

export function initAsmrAudio() {
  if (isLoaded) return;
  try {
    tonePlayers = ASMR_SOURCES.map((src) => {
      const p = createAudioPlayer(src);
      p.volume = 0.75;
      return p;
    });
    chordPlayer = createAudioPlayer(FEVER_CHORD_SOURCE);
    chordPlayer.volume = 0.85;
    isLoaded = true;
  } catch (err) {
    console.warn('ASMR Audio load error:', err);
  }
}

export function playAsmrComboTone(comboIndex: number) {
  try {
    initAsmrAudio();
    const idx = Math.max(0, Math.min(comboIndex, tonePlayers.length - 1));
    const player = tonePlayers[idx];
    if (player) {
      player.seekTo(0);
      player.play();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } catch (err) {
    console.warn('playAsmrComboTone error:', err);
  }
}

export function playAsmrFeverChord() {
  try {
    initAsmrAudio();
    if (chordPlayer) {
      chordPlayer.seekTo(0);
      chordPlayer.play();
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } catch (err) {
    console.warn('playAsmrFeverChord error:', err);
  }
}
