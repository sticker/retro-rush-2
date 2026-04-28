import * as Phaser from "phaser";
import { ASSET_KEYS, GAME_HEIGHT, GAME_WIDTH } from "../core/constants";
import { popIn, tapRipple } from "../core/effects";
import { addPixelText, addScanlines, coverImage } from "../core/phaser-helpers";
import { getHighScore } from "../core/progression";
import { sfx } from "../audio/sharedSfx";

export class TitleScene extends Phaser.Scene {
  private startLocked = false;

  constructor() {
    super("TitleScene");
  }

  create(): void {
    this.startLocked = false;

    const backdrop = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.titleBackdrop);
    coverImage(backdrop, GAME_WIDTH, GAME_HEIGHT);

    this.add.graphics().fillStyle(0x020207, 0.2).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.gameCabinet).setDisplaySize(
      GAME_WIDTH,
      GAME_HEIGHT,
    );
    addScanlines(this, GAME_WIDTH, GAME_HEIGHT, 0.14);

    const titleRetro = addPixelText(this, GAME_WIDTH / 2, 188, "RETRO", 56, "#fff1a8");
    const titleRush = addPixelText(this, GAME_WIDTH / 2, 246, "RUSH", 72, "#ff775e");
    const titleJp = addPixelText(this, GAME_WIDTH / 2, 310, "レトロラッシュ", 23, "#66f2ff");
    popIn(this, titleRetro);
    this.time.delayedCall(80, () => popIn(this, titleRush));
    this.time.delayedCall(150, () => popIn(this, titleJp));

    const highScore = getHighScore();
    this.add
      .text(GAME_WIDTH / 2, 374, `HIGH SCORE ${highScore.toString().padStart(2, "0")}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: "22px",
        color: "#f8f0cc",
        align: "center",
        letterSpacing: 0,
      })
      .setOrigin(0.5);

    const startBox = this.add
      .image(GAME_WIDTH / 2, 504, ASSET_KEYS.instructionPlaque)
      .setDisplaySize(300, 82);
    const startText = addPixelText(this, GAME_WIDTH / 2, 504, "TOUCH START", 27, "#fff6ce");

    this.tweens.add({
      targets: startText,
      alpha: 0.35,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: "Steps",
    });

    this.add
      .text(GAME_WIDTH / 2, 612, "TAP / DRAG / SPACE", {
        fontFamily: '"Courier New", monospace',
        fontSize: "18px",
        color: "#c2d6de",
        align: "center",
        letterSpacing: 0,
      })
      .setOrigin(0.5);

    this.input.once("pointerdown", (pointer: Phaser.Input.Pointer) => {
      tapRipple(this, pointer.x, pointer.y);
      this.startGame();
    });
    this.input.keyboard?.once("keydown-SPACE", () => this.startGame());
    this.input.keyboard?.once("keydown-ENTER", () => this.startGame());
  }

  private startGame(): void {
    if (this.startLocked) {
      return;
    }
    this.startLocked = true;
    sfx.unlock();
    sfx.play("start");
    this.cameras.main.flash(120, 255, 230, 130);
    this.time.delayedCall(140, () => this.scene.start("RunScene"));
  }
}
