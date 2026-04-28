import * as Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants";
import { pop, sparkleBurst } from "../core/effects";
import type { MicrogameContext, MicrogameDefinition, MicrogameOutcome } from "../core/microgame";
import { Lifetime } from "../core/microgame";

class BeatTimingGame {
  private readonly life = new Lifetime();
  private readonly cursor: Phaser.GameObjects.Rectangle;
  private readonly gate: Phaser.GameObjects.Image;
  private readonly status: Phaser.GameObjects.Text;
  private elapsed = 0;
  private attempts = 0;
  private hits = 0;
  private readonly required = 3;
  private outcome?: MicrogameOutcome;

  constructor(private readonly ctx: MicrogameContext) {
    this.drawStage();
    this.gate = ctx.scene.add
      .image(ctx.arena.centerX, ctx.arena.centerY + 20, ASSET_KEYS.timingGate)
      .setDisplaySize(112, 106);
    this.cursor = ctx.scene.add
      .rectangle(ctx.arena.left + 28, ctx.arena.centerY + 20, 16, ctx.arena.height - 116, ctx.theme.secondary, 0.95)
      .setStrokeStyle(2, 0xffffff, 0.72);
    this.status = ctx.scene.add
      .text(ctx.arena.centerX, ctx.arena.top + 32, `0/${this.required}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: "26px",
        color: ctx.theme.accentText,
        align: "center",
        letterSpacing: 0,
        stroke: "#050507",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    ctx.layer.add([this.gate, this.cursor, this.status]);

    const tap = () => this.tap();
    ctx.scene.input.on("pointerdown", tap);
    ctx.scene.input.keyboard?.on("keydown-SPACE", tap);
    this.life.add(() => {
      ctx.scene.input.off("pointerdown", tap);
      ctx.scene.input.keyboard?.off("keydown-SPACE", tap);
    });
  }

  update(_time: number, delta: number): MicrogameOutcome | void {
    if (this.outcome) {
      return this.outcome;
    }
    this.elapsed += delta;
    const width = this.ctx.arena.width - 56;
    const cycle = Math.max(720, 1200 - this.ctx.difficulty * 55) / this.ctx.speed;
    const phase = (this.elapsed % cycle) / cycle;
    const wave = 0.5 - Math.cos(phase * Math.PI * 2) * 0.5;
    this.cursor.x = this.ctx.arena.left + 28 + width * wave;
    this.cursor.setFillStyle(
      Math.abs(this.cursor.x - this.gate.x) < 32 ? this.ctx.theme.success : this.ctx.theme.secondary,
    );
    return undefined;
  }

  destroy(): void {
    this.life.destroy();
  }

  private drawStage(): void {
    const { scene, layer, arena, theme } = this.ctx;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x070d18, 1).fillRect(arena.x, arena.y, arena.width, arena.height);
    graphics.fillStyle(0x050507, 1).fillRect(arena.left + 28, arena.centerY - 72, arena.width - 56, 144);
    graphics.lineStyle(3, theme.accent, 0.34).strokeRect(arena.left + 28, arena.centerY - 72, arena.width - 56, 144);
    graphics.fillStyle(theme.accent, 0.12).fillRect(arena.centerX - 32, arena.centerY - 72, 64, 144);
    graphics.lineStyle(1, theme.secondary, 0.34);
    for (let x = arena.left + 48; x < arena.right - 30; x += 28) {
      graphics.lineBetween(x, arena.centerY - 64, x, arena.centerY + 64);
    }
    layer.add(graphics);
  }

  private tap(): void {
    if (this.outcome) {
      return;
    }
    this.attempts += 1;
    const distance = Math.abs(this.cursor.x - this.gate.x);
    if (distance <= 34) {
      this.hits += 1;
      this.ctx.sfx.play("coin");
      this.status.setText(`${this.hits}/${this.required}`);
      pop(this.ctx.scene, this.gate, distance <= 14 ? 1.22 : 1.12, 110);
      pop(this.ctx.scene, this.status, 1.18, 90);
      sparkleBurst(this.ctx.scene, this.gate.x, this.gate.y, distance <= 14 ? this.ctx.theme.success : this.ctx.theme.secondary, distance <= 14 ? 24 : 14, 830);
      if (this.hits >= this.required) {
        this.outcome = "success";
      }
      return;
    }

    this.ctx.sfx.play("wrong");
    this.ctx.scene.cameras.main.shake(90, 0.004);
    sparkleBurst(this.ctx.scene, this.cursor.x, this.cursor.y, this.ctx.theme.danger, 10, 830);
    if (this.attempts - this.hits >= 2) {
      this.outcome = "failure";
    }
  }
}

export const beatTiming: MicrogameDefinition = {
  id: "beat-timing",
  title: "Beat Timing",
  instruction: "今だ!",
  durationMs: 5600,
  completion: "objective",
  create: (ctx) => new BeatTimingGame(ctx),
};
