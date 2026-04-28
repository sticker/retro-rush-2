export interface EraTheme {
  id: string;
  label: string;
  minScore: number;
  caseColor: number;
  caseShadow: number;
  screen: number;
  text: string;
  muted: string;
  accent: number;
  accentText: string;
  secondary: number;
  danger: number;
  success: number;
}

export const ERA_THEMES: EraTheme[] = [
  {
    id: "mono",
    label: "MONO CRT",
    minScore: 0,
    caseColor: 0x2d3341,
    caseShadow: 0x11141c,
    screen: 0x0b1013,
    text: "#d8f2d0",
    muted: "#7ea885",
    accent: 0xa6ff6d,
    accentText: "#a6ff6d",
    secondary: 0xf6df6f,
    danger: 0xff5b45,
    success: 0x71ff9f,
  },
  {
    id: "color",
    label: "8-BIT COLOR",
    minScore: 8,
    caseColor: 0x3b314b,
    caseShadow: 0x15111f,
    screen: 0x0b0d18,
    text: "#fff0bc",
    muted: "#97b6cc",
    accent: 0x4fe8ff,
    accentText: "#4fe8ff",
    secondary: 0xffd84f,
    danger: 0xff554f,
    success: 0x5cff89,
  },
  {
    id: "polygon",
    label: "POLY FUTURE",
    minScore: 18,
    caseColor: 0x403845,
    caseShadow: 0x111016,
    screen: 0x070813,
    text: "#f8f4dd",
    muted: "#b7a7c8",
    accent: 0xff8359,
    accentText: "#ff9a73",
    secondary: 0x4ce6b7,
    danger: 0xff405c,
    success: 0x77f5b2,
  },
];

export function getThemeForScore(score: number): EraTheme {
  return [...ERA_THEMES]
    .reverse()
    .find((theme) => score >= theme.minScore) ?? ERA_THEMES[0]!;
}
