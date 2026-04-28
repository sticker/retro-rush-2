import type * as Phaser from "phaser";
import type { Sfx } from "../audio/Sfx";
import type { EraTheme } from "./theme";

export type MicrogameOutcome = "success" | "failure";
export type MicrogameCompletion = "survive" | "objective";

export interface MicrogameContext {
  scene: Phaser.Scene;
  layer: Phaser.GameObjects.Container;
  arena: Phaser.Geom.Rectangle;
  difficulty: number;
  round: number;
  speed: number;
  rng: Phaser.Math.RandomDataGenerator;
  sfx: Sfx;
  theme: EraTheme;
}

export interface MicrogameInstance {
  update(time: number, delta: number): MicrogameOutcome | void;
  destroy(): void;
}

export interface MicrogameDefinition {
  id: string;
  title: string;
  instruction: string;
  durationMs: number;
  completion: MicrogameCompletion;
  create(ctx: MicrogameContext): MicrogameInstance;
}

export class Lifetime {
  private readonly disposers: Array<() => void> = [];

  add(disposer: () => void): void {
    this.disposers.push(disposer);
  }

  destroy(): void {
    for (const dispose of this.disposers.splice(0)) {
      dispose();
    }
  }
}
