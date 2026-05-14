export const palette = {
  light: {
    paper: '#F7F0E5',
    card: '#FBF7EF',
    ink: '#3C3027',
    inkSoft: '#6F6256',
    muted: '#9A897A',
    hairline: '#DED0BF',
    pressed: '#EFE3D3',
    accent: '#8A6248',
  },
  dark: {
    paper: '#1D1814',
    card: '#28211B',
    ink: '#F1E5D3',
    inkSoft: '#C3AE96',
    muted: '#8F7D6C',
    hairline: '#44372C',
    pressed: '#342A22',
    accent: '#D4AE83',
  },
} as const;

export type CozyPalette = Record<keyof typeof palette.light, string>;
