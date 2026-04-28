export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 800;

export const ARENA = {
  x: 74,
  y: 162,
  width: 332,
  height: 398,
} as const;

export const STORAGE_KEYS = {
  highScore: "retro-rush.high-score",
} as const;

export const ASSET_KEYS = {
  titleBackdrop: "title-backdrop",
  gameCabinet: "ui-game-cabinet",
  instructionPlaque: "ui-instruction-plaque",
  resultBadge: "ui-result-badge",
  spaceship: "sprite-spaceship",
  asteroid: "sprite-asteroid",
  runner: "sprite-runner",
  coin: "sprite-coin",
  circuitSocket: "sprite-circuit-socket",
  mashButton: "sprite-mash-button",
  mole: "sprite-mole",
  moleHole: "sprite-mole-hole",
  moleHoleFront: "sprite-mole-hole-front",
  numberOrb: "sprite-number-orb",
  timingGate: "sprite-timing-gate",
} as const;
