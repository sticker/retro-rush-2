import * as Phaser from "phaser";
import { sfx } from "../audio/sharedSfx";
import { ARENA, ASSET_KEYS, GAME_HEIGHT, GAME_WIDTH } from "../core/constants";
import { pop, popIn, sparkleBurst, tapRipple } from "../core/effects";
import type { MicrogameDefinition, MicrogameInstance, MicrogameOutcome } from "../core/microgame";
import { addPixelText, addScanlines } from "../core/phaser-helpers";
import { recordHighScore } from "../core/progression";
import { getThemeForScore } from "../core/theme";
import { microgames } from "../minigames";

type RunState = "briefing" | "active" | "result" | "gameover";

export class RunScene extends Phaser.Scene {
  private readonly arena = new Phaser.Geom.Rectangle(
    ARENA.x,
    ARENA.y,
    ARENA.width,
    ARENA.height,
  );

  private rng = new Phaser.Math.RandomDataGenerator([String(Date.now())]);
  private gameLayer!: Phaser.GameObjects.Container;
  private hudLayer!: Phaser.GameObjects.Container;
  private instructionText!: Phaser.GameObjects.Text;
  private miniTitleText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private eraText!: Phaser.GameObjects.Text;
  private timerFill!: Phaser.GameObjects.Rectangle;
  private timerFrame!: Phaser.GameObjects.Rectangle;
  private instructionPlaque!: Phaser.GameObjects.Image;
  private resultBadge!: Phaser.GameObjects.Image;
  private resultText!: Phaser.GameObjects.Text;
  private current?: MicrogameInstance;
  private currentDefinition?: MicrogameDefinition;
  private gameQueue: MicrogameDefinition[] = [];
  private previousId?: string;
  private score = 0;
  private lives = 3;
  private state: RunState = "briefing";
  private stateUntil = 0;
  private roundStartedAt = 0;
  private roundDuration = 0;
  private pendingGameOver = false;

  constructor() {
    super("RunScene");
  }

  create(): void {
    sfx.unlock();
    this.rng = new Phaser.Math.RandomDataGenerator([`${Date.now()}-${Math.random()}`]);
    this.score = 0;
    this.lives = 3;
    this.gameQueue = [];
    this.pendingGameOver = false;

    this.createCabinet();
    this.gameLayer = this.add.container(0, 0);
    this.hudLayer = this.add.container(0, 0);
    this.createHud();
    addScanlines(this, GAME_WIDTH, GAME_HEIGHT, 0.1);

    this.input.on("pointerdown", this.showTapRipple, this);
    this.input.keyboard?.on("keydown-R", this.restartToTitle, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.current?.destroy();
      this.input.off("pointerdown", this.showTapRipple, this);
      this.input.keyboard?.off("keydown-R", this.restartToTitle, this);
    });

    this.startNextRound(this.time.now);
  }

  update(time: number, delta: number): void {
    if (this.state === "briefing" && time >= this.stateUntil) {
      this.beginActiveRound(time);
      return;
    }

    if (this.state === "active") {
      const progress = Phaser.Math.Clamp((time - this.roundStartedAt) / this.roundDuration, 0, 1);
      this.timerFill.displayWidth = 316 * (1 - progress);

      const outcome = this.current?.update(time, delta);
      if (outcome) {
        this.finishRound(outcome, time);
        return;
      }

      if (time - this.roundStartedAt >= this.roundDuration && this.currentDefinition) {
        const timeoutOutcome =
          this.currentDefinition.completion === "survive" ? "success" : "failure";
        this.finishRound(timeoutOutcome, time);
      }
      return;
    }

    if (this.state === "result" && time >= this.stateUntil) {
      if (this.pendingGameOver) {
        this.showGameOver();
      } else {
        this.startNextRound(time);
      }
    }
  }

  private createCabinet(): void {
    const theme = getThemeForScore(0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x030407);
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, ASSET_KEYS.gameCabinet).setDisplaySize(
      GAME_WIDTH,
      GAME_HEIGHT,
    );

    const graphics = this.add.graphics();
    graphics.fillStyle(0x04090f, 0.7).fillRect(ARENA.x - 8, ARENA.y - 8, ARENA.width + 16, ARENA.height + 16);
    graphics.fillStyle(theme.screen, 1).fillRect(ARENA.x, ARENA.y, ARENA.width, ARENA.height);
    graphics.lineStyle(2, theme.accent, 0.36).strokeRect(ARENA.x, ARENA.y, ARENA.width, ARENA.height);

    const glow = this.add.rectangle(
      this.arena.centerX,
      this.arena.centerY,
      ARENA.width + 4,
      ARENA.height + 4,
      theme.accent,
      0.045,
    );
    this.tweens.add({
      targets: glow,
      alpha: 0.12,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private createHud(): void {
    this.add.rectangle(122, 52, 170, 34, 0x050507, 0.72).setStrokeStyle(2, 0xf2c95b, 0.22);
    this.add.rectangle(358, 52, 154, 34, 0x050507, 0.62).setStrokeStyle(2, 0xff5b45, 0.22);

    this.scoreText = this.add
      .text(46, 52, "SCORE 00", {
        fontFamily: '"Courier New", monospace',
        fontSize: "22px",
        color: "#fff0bc",
        letterSpacing: 0,
      })
      .setOrigin(0, 0.5);

    this.livesText = this.add
      .text(434, 52, "♥♥♥", {
        fontFamily: '"Courier New", monospace',
        fontSize: "24px",
        color: "#ff6b57",
        align: "right",
        letterSpacing: 0,
      })
      .setOrigin(1, 0.5);

    this.eraText = this.add
      .text(GAME_WIDTH / 2, 92, "MONO CRT", {
        fontFamily: '"Courier New", monospace',
        fontSize: "16px",
        color: "#9eefff",
        align: "center",
        letterSpacing: 0,
      })
      .setOrigin(0.5);

    this.miniTitleText = this.add
      .text(50, 130, "", {
        fontFamily: '"Courier New", monospace',
        fontSize: "16px",
        color: "#d8e7f3",
        letterSpacing: 0,
      })
      .setOrigin(0, 0.5);

    this.instructionText = addPixelText(this, GAME_WIDTH / 2, 384, "", 48, "#fff6ce");
    this.instructionText.setDepth(900);
    this.instructionPlaque = this.add
      .image(GAME_WIDTH / 2, 384, ASSET_KEYS.instructionPlaque)
      .setDisplaySize(360, 99)
      .setDepth(895)
      .setVisible(false);

    this.resultText = addPixelText(this, GAME_WIDTH / 2, 386, "", 56, "#fff6ce");
    this.resultText.setDepth(910).setVisible(false);
    this.resultBadge = this.add
      .image(GAME_WIDTH / 2, 386, ASSET_KEYS.resultBadge)
      .setDisplaySize(330, 157)
      .setDepth(905)
      .setVisible(false);

    this.timerFrame = this.add.rectangle(82, 742, 316, 12, 0x050507).setOrigin(0, 0.5);
    this.timerFrame.setStrokeStyle(2, 0xffdf72, 0.32);
    this.timerFill = this.add.rectangle(82, 742, 316, 12, 0xffdf72).setOrigin(0, 0.5);
  }

  private startNextRound(time: number): void {
    this.gameLayer.removeAll(true);
    this.timerFill.displayWidth = 316;
    const theme = getThemeForScore(this.score);
    this.currentDefinition = this.nextMicrogame();
    this.previousId = this.currentDefinition.id;
    this.current = undefined;
    this.state = "briefing";
    this.stateUntil = time + Math.max(520, 950 - this.score * 18);
    this.miniTitleText.setText(this.currentDefinition.title.toUpperCase());
    this.instructionText.setText(this.currentDefinition.instruction);
    this.instructionText.setColor(theme.accentText);
    this.instructionText.setVisible(true);
    this.instructionPlaque.setVisible(true);
    popIn(this, this.instructionPlaque);
    popIn(this, this.instructionText);
    this.cameras.main.shake(45, 0.002);
    sparkleBurst(this, GAME_WIDTH / 2, 384, theme.accent, 8, 892);
    this.resultText.setVisible(false);
    this.resultBadge.setVisible(false);
    this.updateHud();
    sfx.play("cue");
  }

  private beginActiveRound(time: number): void {
    if (!this.currentDefinition) {
      return;
    }

    this.instructionText.setVisible(false);
    this.tweens.add({
      targets: this.instructionPlaque,
      alpha: 0,
      scaleX: 0.86,
      scaleY: 0.86,
      duration: 90,
      onComplete: () => this.instructionPlaque.setVisible(false),
    });
    const speed = this.getSpeed();
    const duration = this.currentDefinition.durationMs / speed;
    this.roundDuration = Math.max(1700, duration);
    this.roundStartedAt = time;
    this.state = "active";
    this.current = this.currentDefinition.create({
      scene: this,
      layer: this.gameLayer,
      arena: this.arena,
      difficulty: Math.floor(this.score / 4) + this.getClearCycle(),
      round: this.score + 1,
      speed,
      rng: this.rng,
      sfx,
      theme: getThemeForScore(this.score),
    });
  }

  private finishRound(outcome: MicrogameOutcome, time: number): void {
    this.current?.destroy();
    this.current = undefined;
    this.state = "result";
    this.stateUntil = time + 680;

    if (outcome === "success") {
      this.score += 1;
      sfx.play("clear");
      this.resultText.setColor("#a6ff6d").setText("CLEAR!");
      this.resultBadge.setTint(0xa6ff6d);
      sparkleBurst(this, GAME_WIDTH / 2, 386, 0xa6ff6d, 24, 908);
      this.cameras.main.flash(80, 166, 255, 109);
      pop(this, this.scoreText, 1.22, 120);
    } else {
      this.lives -= 1;
      sfx.play("miss");
      this.resultText.setColor("#ff6b57").setText("MISS!");
      this.resultBadge.setTint(0xff7b65);
      sparkleBurst(this, GAME_WIDTH / 2, 386, 0xff6b57, 18, 908);
      this.cameras.main.shake(120, 0.008);
      pop(this, this.livesText, 1.25, 140);
      this.pendingGameOver = this.lives <= 0;
    }

    this.updateHud();
    this.resultBadge.setVisible(true);
    this.resultText.setVisible(true);
    popIn(this, this.resultBadge);
    popIn(this, this.resultText);
  }

  private showGameOver(): void {
    this.state = "gameover";
    this.gameLayer.removeAll(true);
    this.resultBadge.setVisible(false);
    this.resultText.setVisible(false);
    this.instructionPlaque.setVisible(false);
    this.instructionText.setVisible(false);
    this.scoreText.setVisible(false);
    this.livesText.setVisible(false);
    this.eraText.setVisible(false);
    this.miniTitleText.setVisible(false);
    this.timerFill.setVisible(false);
    this.timerFrame.setVisible(false);
    const best = recordHighScore(this.score);

    const overlay = this.add.graphics().setDepth(875);
    overlay.fillStyle(0x05070a, 0.78).fillRect(
      this.arena.left,
      this.arena.top,
      this.arena.width,
      this.arena.height,
    );
    overlay.lineStyle(2, 0xffdf72, 0.36).strokeRect(
      this.arena.left + 8,
      this.arena.top + 8,
      this.arena.width - 16,
      this.arena.height - 16,
    );

    const scorePanel = this.add
      .rectangle(GAME_WIDTH / 2, 378, 284, 96, 0x06101a, 0.9)
      .setDepth(880)
      .setStrokeStyle(2, 0xffdf72, 0.42);
    scorePanel.setAlpha(0).setScale(0.88);
    this.tweens.add({
      targets: scorePanel,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: "Back.easeOut",
    });

    addPixelText(this, GAME_WIDTH / 2, 276, "GAME OVER", 38, "#ff775e").setDepth(890);
    addPixelText(this, GAME_WIDTH / 2, 362, `SCORE ${this.score}`, 30, "#fff6ce").setDepth(890);
    addPixelText(this, GAME_WIDTH / 2, 404, `BEST ${best}`, 18, "#9eefff").setDepth(890);

    this.createGameOverButton(156, 486, "RETRY", () => this.scene.restart());
    this.createGameOverButton(324, 486, "TOP", () => this.scene.start("TitleScene"));
    this.input.keyboard?.once("keydown-SPACE", () => this.scene.restart());
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.restart());
  }

  private updateHud(): void {
    const score = this.score.toString().padStart(2, "0");
    const theme = getThemeForScore(this.score);
    this.scoreText.setText(`SCORE ${score}`);
    this.livesText.setText("♥".repeat(Math.max(0, this.lives)));
    this.eraText.setText(theme.label).setColor(theme.accentText);
    this.timerFill.setFillStyle(theme.secondary);
  }

  private getSpeed(): number {
    return Phaser.Math.Clamp(1 + this.score * 0.04 + this.getClearCycle() * 0.12, 1, 2.15);
  }

  private restartToTitle(): void {
    this.scene.start("TitleScene");
  }

  private showTapRipple(pointer: Phaser.Input.Pointer): void {
    tapRipple(this, pointer.x, pointer.y, getThemeForScore(this.score).secondary);
  }

  private nextMicrogame(): MicrogameDefinition {
    if (this.gameQueue.length === 0) {
      this.gameQueue = Phaser.Utils.Array.Shuffle([...microgames]);
      if (this.previousId && this.gameQueue[0]?.id === this.previousId && this.gameQueue.length > 1) {
        const first = this.gameQueue[0]!;
        this.gameQueue[0] = this.gameQueue[1]!;
        this.gameQueue[1] = first;
      }
    }
    return this.gameQueue.shift() ?? microgames[0]!;
  }

  private getClearCycle(): number {
    return Math.floor(this.score / microgames.length);
  }

  private createGameOverButton(x: number, y: number, label: string, action: () => void): void {
    const button = this.add
      .rectangle(x, y, 132, 54, 0x0b1018, 0.95)
      .setDepth(900)
      .setStrokeStyle(3, 0xffdf72, 0.86)
      .setInteractive({ useHandCursor: true });
    const text = addPixelText(this, x, y, label, 22, "#fff6ce").setDepth(905);

    button.on("pointerover", () => {
      button.setFillStyle(0x172231, 1);
      pop(this, text, 1.08, 90);
    });
    button.on("pointerout", () => button.setFillStyle(0x0b1018, 0.95));
    button.on("pointerdown", () => {
      sfx.play("start");
      action();
    });
  }
}
