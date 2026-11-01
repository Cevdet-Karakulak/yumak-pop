// Generates original sound effects + a short music loop as WAV files.
// Run: node scripts/gen-sounds.js
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

function writeWav(name, samples) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => {
    const v = Math.max(-1, Math.min(1, s));
    buf.writeInt16LE(Math.round(v * 32000), 44 + i * 2);
  });
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log('wrote', name, (buf.length / 1024).toFixed(1) + 'KB');
}

const empty = (sec) => new Float32Array(Math.floor(sec * RATE));
const noteHz = (n) => 440 * Math.pow(2, (n - 69) / 12);

function addTone(arr, start, dur, f0, f1, vol, shape = 'sine', attack = 0.005, release = null) {
  const s0 = Math.floor(start * RATE);
  const len = Math.floor(dur * RATE);
  let phase = 0;
  for (let i = 0; i < len && s0 + i < arr.length; i++) {
    const t = i / len;
    const f = f0 + (f1 - f0) * t;
    phase += (2 * Math.PI * f) / RATE;
    let w;
    if (shape === 'sine') w = Math.sin(phase);
    else if (shape === 'tri') w = (2 / Math.PI) * Math.asin(Math.sin(phase));
    else w = Math.sin(phase) + 0.3 * Math.sin(2 * phase) + 0.12 * Math.sin(3 * phase);
    const a = Math.min(1, i / (attack * RATE));
    const env = release === null ? Math.pow(1 - t, 2) : Math.min(1, (len - i) / (release * RATE));
    arr[s0 + i] += w * vol * a * env;
  }
}

function addNoise(arr, start, dur, vol) {
  const s0 = Math.floor(start * RATE);
  const len = Math.floor(dur * RATE);
  let last = 0;
  for (let i = 0; i < len && s0 + i < arr.length; i++) {
    last = last * 0.6 + (Math.random() * 2 - 1) * 0.4;
    arr[s0 + i] += last * vol * Math.pow(1 - i / len, 3);
  }
}

// soft pluck when a stitch is pulled
let a = empty(0.12);
addTone(a, 0, 0.12, 900, 1300, 0.35, 'rich');
writeWav('pull.wav', a);

// tap on spool – wooden "tok"
a = empty(0.1);
addTone(a, 0, 0.09, 520, 300, 0.6, 'tri', 0.001);
addNoise(a, 0, 0.03, 0.25);
writeWav('tap.wav', a);

// spool complete – bubbly pop
a = empty(0.35);
addTone(a, 0, 0.12, 300, 900, 0.5, 'sine', 0.002);
addTone(a, 0.07, 0.25, 1046, 1568, 0.3, 'tri');
addNoise(a, 0, 0.05, 0.3);
writeWav('pop.wav', a);

// UI button
a = empty(0.08);
addTone(a, 0, 0.08, 700, 760, 0.35, 'tri', 0.002);
writeWav('button.wav', a);

// error / blocked
a = empty(0.2);
addTone(a, 0, 0.2, 220, 180, 0.4, 'tri');
writeWav('blocked.wav', a);

// win jingle
a = empty(1.4);
[72, 76, 79, 84].forEach((n, i) => addTone(a, i * 0.12, 0.5, noteHz(n), noteHz(n), 0.32, 'rich'));
addTone(a, 0.55, 0.8, noteHz(88), noteHz(88), 0.25, 'sine');
addTone(a, 0.55, 0.8, noteHz(84), noteHz(84), 0.2, 'sine');
writeWav('win.wav', a);

// lose
a = empty(1.0);
[67, 63, 60].forEach((n, i) => addTone(a, i * 0.2, 0.45, noteHz(n), noteHz(n) * 0.98, 0.3, 'tri'));
writeWav('lose.wav', a);

// cozy music loop: 8 bars, 96 BPM, C major pentatonic lullaby
const bpm = 96;
const beat = 60 / bpm;
const bars = 8;
a = empty(bars * 4 * beat);
const chords = [
  [48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59],
  [48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 55],
];
const melody = [
  76, null, 79, 76, 74, null, 72, null,
  72, null, 74, 76, 79, null, 76, null,
  77, null, 76, 74, 72, null, 69, null,
  71, null, 72, 74, 74, null, null, null,
  76, null, 79, 81, 79, null, 76, null,
  72, null, 74, 76, 76, null, 74, null,
  72, null, 69, 72, 74, null, 76, 74,
  72, null, null, null, 67, null, null, null,
];
chords.forEach((ch, bar) => {
  ch.forEach((n, k) => {
    for (let b = 0; b < 4; b++) {
      addTone(a, bar * 4 * beat + b * beat + k * 0.02, beat * 0.95, noteHz(n), noteHz(n), 0.07, 'sine', 0.02);
    }
  });
  addTone(a, bar * 4 * beat, beat * 3.8, noteHz(ch[0] - 12), noteHz(ch[0] - 12), 0.12, 'sine', 0.03);
});
melody.forEach((n, i) => {
  if (n) addTone(a, i * (beat / 2), beat * 0.9, noteHz(n), noteHz(n), 0.14, 'rich', 0.01);
});
// gentle fade at loop edges to avoid clicks
for (let i = 0; i < 300; i++) {
  a[i] *= i / 300;
  a[a.length - 1 - i] *= i / 300;
}
writeWav('music.wav', a);
