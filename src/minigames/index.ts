import { asteroidDodge } from "./asteroidDodge";
import { buttonMash } from "./buttonMash";
import { circuitSnap } from "./circuitSnap";
import { coinHop } from "./coinHop";
import type { MicrogameDefinition } from "../core/microgame";

export const microgames: MicrogameDefinition[] = [
  asteroidDodge,
  coinHop,
  circuitSnap,
  buttonMash,
];
