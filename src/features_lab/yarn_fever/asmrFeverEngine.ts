/**
 * ASMR Yarn Fever Engine (Isolated Prototype Module)
 * 
 * Tasarım Felsefesi: Oyunu bozmadan, arcade gürültüsü yaratmadan,
 * dinlendirici ve tatmin edici bir akustik deneyim (Kalimba / Ahşap Ksilofon tonları).
 */

export interface AsmrTone {
  note: string;
  freq: number;
  label: string;
  durationMs: number;
  gain: number;
}

export const ASMR_CHORD_SEQUENCE: AsmrTone[] = [
  { note: 'C4', freq: 261.63, label: 'Do (Hafif Ahşap Tık)', durationMs: 220, gain: 0.18 },
  { note: 'E4', freq: 329.63, label: 'Mi (Yumuşak Yün Tınısı)', durationMs: 240, gain: 0.20 },
  { note: 'G4', freq: 392.00, label: 'Sol (Akustik Rezonans)', durationMs: 260, gain: 0.22 },
  { note: 'B4', freq: 493.88, label: 'Si (Dingin Yükseliş)', durationMs: 280, gain: 0.24 },
  { note: 'C5', freq: 523.25, label: 'Yüksek Do (Huzurlu Akor)', durationMs: 450, gain: 0.28 },
];

export interface FeverState {
  comboStreak: number;
  isFeverActive: boolean;
  timeDilation: number; // 1.0 normal, 0.75 dinlendirici yavaşlama
  coinMultiplier: number;
  feverRemainingSeconds: number;
}

export class AsmrFeverController {
  private streak: number = 0;
  private isFever: boolean = false;
  private feverTimer: any = null;
  private durationSeconds: number = 6;
  private onStateChange?: (state: FeverState) => void;

  constructor(onStateChange?: (state: FeverState) => void) {
    this.onStateChange = onStateChange;
  }

  public registerMatch(): { tone: AsmrTone; triggeredFever: boolean } {
    this.streak++;
    const toneIndex = Math.min(this.streak - 1, ASMR_CHORD_SEQUENCE.length - 1);
    const tone = ASMR_CHORD_SEQUENCE[toneIndex];

    let triggeredFever = false;
    if (this.streak >= 5 && !this.isFever) {
      this.activateFever();
      triggeredFever = true;
    }

    this.notify();
    return { tone, triggeredFever };
  }

  public registerMiss(): void {
    if (this.isFever) {
      // Fever aktifken tek bir kaçırma fever'ı anında kesmez, sadece yumuşatır
      return;
    }
    this.streak = 0;
    this.notify();
  }

  private activateFever(): void {
    this.isFever = true;
    if (this.feverTimer) clearTimeout(this.feverTimer);
    
    this.feverTimer = setTimeout(() => {
      this.deactivateFever();
    }, this.durationSeconds * 1000);
  }

  private deactivateFever(): void {
    this.isFever = false;
    this.streak = 0;
    this.notify();
  }

  public getState(): FeverState {
    return {
      comboStreak: this.streak,
      isFeverActive: this.isFever,
      timeDilation: this.isFever ? 0.75 : 1.0, // %25 dinlendirici yavaşlama (oyunu bozmaz)
      coinMultiplier: this.isFever ? 1.5 : 1.0,
      feverRemainingSeconds: this.isFever ? this.durationSeconds : 0,
    };
  }

  private notify(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  public reset(): void {
    if (this.feverTimer) clearTimeout(this.feverTimer);
    this.streak = 0;
    this.isFever = false;
    this.notify();
  }
}
