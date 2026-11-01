/**
 * Yarn colour palette. Each key is a single character used by the
 * pixel-art motifs in patterns.ts.
 */
export const YARN: Record<string, { base: string; light: string; dark: string }> = {
  R: { base: '#E62D3C', light: '#FF737D', dark: '#A01423' }, // Vivid Red
  Y: { base: '#FFB905', light: '#FFDA5A', dark: '#BE8200' }, // Golden Honey Yellow
  B: { base: '#1973DC', light: '#5FAFFF', dark: '#0A419B' }, // Royal Sky Blue
  T: { base: '#00AF9B', light: '#41E1C8', dark: '#006E5F' }, // Turquoise / Teal
  O: { base: '#FA7D00', light: '#FFAA3C', dark: '#B95000' }, // Tangy Orange
  P: { base: '#822DC3', light: '#B969F5', dark: '#4B127D' }, // Royal Purple
  G: { base: '#23914B', light: '#55C87D', dark: '#0F5528' }, // Emerald Forest Green
  K: { base: '#FF5F96', light: '#FF9BC3', dark: '#BE2D5F' }, // Bubblegum Rose Pink
  D: { base: '#0F5528', light: '#55C87D', dark: '#083317' }, // Dark Green
  L: { base: '#5FAFFF', light: '#A0D2FF', dark: '#1973DC' }, // Light Blue
  W: { base: '#FFF4DE', light: '#FFFFFF', dark: '#E5D3B0' }, // Cream
  N: { base: '#9A6A47', light: '#B98C6A', dark: '#6F4A2E' }, // Brown
  A: { base: '#9AA0AA', light: '#BFC4CC', dark: '#6E747E' }, // Gray
  X: { base: '#3F3D56', light: '#5F5C7A', dark: '#26243A' }, // Dark Slate
};

export const UI = {
  cream: '#FFF6EA',
  peach: '#FFD9C2',
  coral: '#FF7A6B',
  coralDark: '#E0584A',
  plum: '#5B3A5E',
  plumLight: '#8A6690',
  lavender: '#E8DDF7',
  mint: '#BFEBD8',
  gold: '#FFC93C',
  wood: '#D9A066',
  woodDark: '#A86F3A',
  shadow: 'rgba(91,58,94,0.18)',
  white: '#FFFFFF',
};
