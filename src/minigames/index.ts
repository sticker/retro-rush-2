import { asteroidDodge } from "./asteroidDodge";
import { beatTiming } from "./beatTiming";
import { buttonMash } from "./buttonMash";
import { circuitSnap } from "./circuitSnap";
import { coinHop } from "./coinHop";
import { numberChain } from "./numberChain";
import { whackMole } from "./whackMole";
import type { MicrogameDefinition } from "../core/microgame";

export const microgames: MicrogameDefinition[] = [
  asteroidDodge,
  coinHop,
  circuitSnap,
  buttonMash,
  whackMole,
  numberChain,
  beatTiming,
];
