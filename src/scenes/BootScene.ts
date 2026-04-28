import * as Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    this.load.image(
      ASSET_KEYS.titleBackdrop,
      "/assets/generated/retro-rush-title-backdrop.png",
    );
    this.load.image(ASSET_KEYS.gameCabinet, "/assets/ui/game-cabinet.png");
    this.load.image(ASSET_KEYS.instructionPlaque, "/assets/ui/instruction-plaque.png");
    this.load.image(ASSET_KEYS.resultBadge, "/assets/ui/result-badge.png");
    this.load.image(ASSET_KEYS.spaceship, "/assets/sprites/spaceship.png");
    this.load.image(ASSET_KEYS.asteroid, "/assets/sprites/asteroid.png");
    this.load.image(ASSET_KEYS.runner, "/assets/sprites/runner.png");
    this.load.image(ASSET_KEYS.coin, "/assets/sprites/coin.png");
    this.load.image(ASSET_KEYS.circuitSocket, "/assets/sprites/circuit-socket.png");
    this.load.image(ASSET_KEYS.mashButton, "/assets/sprites/mash-button.png");
    this.load.image(ASSET_KEYS.mole, "/assets/sprites/mole.png");
    this.load.image(ASSET_KEYS.moleHole, "/assets/sprites/mole-hole.png");
    this.load.image(ASSET_KEYS.moleHoleFront, "/assets/sprites/mole-hole-front.png");
    this.load.image(ASSET_KEYS.numberOrb, "/assets/sprites/number-orb.png");
    this.load.image(ASSET_KEYS.timingGate, "/assets/sprites/timing-gate.png");
  }

  create(): void {
    this.scene.start("TitleScene");
  }
}
