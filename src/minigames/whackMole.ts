import * as Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants";
import { pop, sparkleBurst } from "../core/effects";
import type { MicrogameContext, MicrogameDefinition, MicrogameOutcome } from "../core/microgame";
import { Lifetime } from "../core/microgame";

interface MoleHole {
  x: number;
  y: number;
  mole: Phaser.GameObjects.Image;
  front: Phaser.GameObjects.Image;
  moleScaleX: number;
  moleScaleY: number;
  active: boolean;
}

class WhackMoleGame {
  private readonly life = new Lifetime();
  private readonly holes: MoleHole[] = [];
  private readonly counter: Phaser.GameObjects.Text;
  private score = 0;
  private spawnTimer = 0;
  private readonly target: number;

  constructor(private readonly ctx: MicrogameContext) {
    this.target = Phaser.Math.Clamp(6 + Math.floor(ctx.difficulty / 2), 6, 9);
    this.drawStage();
    this.counter = ctx.scene.add
      .text(ctx.arena.right - 18, ctx.arena.top + 20, `0/${this.target}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: "24px",
        color: ctx.theme.accentText,
        align: "right",
        letterSpacing: 0,
      })
      .setOrigin(1, 0.5);
    ctx.layer.add(this.counter);

    const positions = [
      [0.25, 0.28],
      [0.5, 0.25],
      [0.75, 0.28],
      [0.3, 0.58],
      [0.58, 0.56],
      [0.78, 0.68],
    ] as const;

    for (const [px, py] of positions) {
      this.createHole(ctx.arena.left + ctx.arena.width * px, ctx.arena.top + ctx.arena.height * py);
    }
  }

  update(_time: number, delta: number): MicrogameOutcome | void {
    this.spawnTimer += delta;
    const interval = Math.max(250, 640 - this.ctx.difficulty * 42) / this.ctx.speed;
    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.popRandomMole();
    }
    return this.score >= this.target ? "success" : undefined;
  }

  destroy(): void {
    this.life.destroy();
  }

  private drawStage(): void {
    const { scene, layer, arena, theme } = this.ctx;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x101509, 1).fillRect(arena.x, arena.y, arena.width, arena.height);
    graphics.fillStyle(0x1d2f16, 1).fillRect(arena.x, arena.y + 42, arena.width, arena.height - 42);
    graphics.lineStyle(2, theme.accent, 0.24);
    for (let y = arena.top + 64; y < arena.bottom; y += 34) {
      graphics.lineBetween(arena.left + 12, y, arena.right - 12, y + 8);
    }
    graphics.fillStyle(theme.secondary, 0.14).fillRect(arena.left + 18, arena.top + 24, arena.width - 36, 18);
    layer.add(graphics);
  }

  private createHole(x: number, y: number): void {
    const holeBack = this.ctx.scene.add.image(x, y, ASSET_KEYS.moleHole).setDisplaySize(102, 67);
    const mole = this.ctx.scene.add
      .image(x, y + 30, ASSET_KEYS.mole)
      .setDisplaySize(56, 49)
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });
    const moleScaleX = mole.scaleX;
    const moleScaleY = mole.scaleY;
    mole.setScale(moleScaleX, moleScaleY * 0.25);
    const front = this.ctx.scene.add.image(x, y, ASSET_KEYS.moleHoleFront).setDisplaySize(102, 67);
    const entry: MoleHole = { x, y, mole, front, moleScaleX, moleScaleY, active: false };
    const whack = () => this.whack(entry);
    mole.on("pointerdown", whack);
    this.life.add(() => mole.off("pointerdown", whack));
    this.ctx.layer.add([holeBack, mole, front]);
    this.holes.push(entry);
  }

  private popRandomMole(): void {
    const candidates = this.holes.filter((hole) => !hole.active);
    const entry = this.ctx.rng.pick(candidates.length > 0 ? candidates : this.holes);
    if (!entry || entry.active) {
      return;
    }
    entry.active = true;
    entry.mole
      .setAlpha(1)
      .setY(entry.y + 30)
      .setScale(entry.moleScaleX, entry.moleScaleY * 0.25);
    this.ctx.scene.tweens.add({
      targets: entry.mole,
      y: entry.y + 6,
      scaleY: entry.moleScaleY,
      duration: 110,
      ease: "Back.easeOut",
    });
    this.ctx.scene.time.delayedCall(Math.max(430, 900 - this.ctx.difficulty * 45) / this.ctx.speed, () => {
      if (entry.active) {
        this.hideMole(entry);
      }
    });
  }

  private whack(entry: MoleHole): void {
    if (!entry.active) {
      return;
    }
    entry.active = false;
    this.score += 1;
    this.counter.setText(`${this.score}/${this.target}`);
    this.ctx.sfx.play("hit");
    pop(this.ctx.scene, this.counter, 1.18, 90);
    pop(this.ctx.scene, entry.front, 1.06, 80);
    sparkleBurst(this.ctx.scene, entry.x, entry.y - 12, this.ctx.theme.secondary, 16, 830);
    this.ctx.scene.tweens.add({
      targets: entry.mole,
      y: entry.y + 28,
      scaleY: entry.moleScaleY * 0.32,
      alpha: 0,
      duration: 90,
      ease: "Quad.easeIn",
    });
  }

  private hideMole(entry: MoleHole): void {
    entry.active = false;
    this.ctx.scene.tweens.add({
      targets: entry.mole,
      y: entry.y + 30,
      scaleY: entry.moleScaleY * 0.25,
      alpha: 0,
      duration: 120,
      ease: "Quad.easeIn",
    });
  }
}

export const whackMole: MicrogameDefinition = {
  id: "whack-mole",
  title: "Whack Mole",
  instruction: "たたけ!",
  durationMs: 5400,
  completion: "objective",
  create: (ctx) => new WhackMoleGame(ctx),
};
