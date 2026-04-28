import * as Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../core/constants";
import { BootScene } from "../scenes/BootScene";
import { RunScene } from "../scenes/RunScene";
import { TitleScene } from "../scenes/TitleScene";

export function createRetroRushGame(parent: string | HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#050509",
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, TitleScene, RunScene],
  });
}
