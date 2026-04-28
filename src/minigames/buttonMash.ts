import * as Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants";
import { pop, sparkleBurst } from "../core/effects";
import type { MicrogameContext, MicrogameDefinition, MicrogameOutcome } from "../core/microgame";
import { Lifetime } from "../core/microgame";

class ButtonMashGame {
  private readonly life = new Lifetime();
  private readonly space?: Phaser.Input.Keyboard.Key;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly meterGlow: Phaser.GameObjects.Rectangle;
  private readonly segments: Phaser.GameObjects.Rectangle[] = [];
  private readonly button: Phaser.GameObjects.Container;
  private readonly counter: Phaser.GameObjects.Text;
  private count = 0;
  private readonly target: number;

  constructor(private readonly ctx: MicrogameContext) {
    this.target = Phaser.Math.Clamp(14 + ctx.difficulty * 2, 14, 30);
    this.space = ctx.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.drawPanel();
    this.button = this.createButton(ctx.arena.centerX, ctx.arena.centerY + 56);
    ctx.layer.add(this.button);

    this.meterGlow = ctx.scene.add
      .rectangle(ctx.arena.left + 52, ctx.arena.top + 118, ctx.arena.width - 104, 38, ctx.theme.accent, 0)
      .setOrigin(0, 0.5);
    ctx.layer.add(this.meterGlow);
    this.fill = ctx.scene.add
      .rectangle(ctx.arena.left + 52, ctx.arena.top + 118, ctx.arena.width - 104, 26, ctx.theme.accent)
      .setOrigin(0, 0.5)
      .setScale(0, 1);
    ctx.layer.add(this.fill);

    const segmentCount = 12;
    const segmentGap = 4;
    const segmentWidth = (ctx.arena.width - 104 - segmentGap * (segmentCount - 1)) / segmentCount;
    for (let i = 0; i < segmentCount; i += 1) {
      const segment = ctx.scene.add
        .rectangle(
          ctx.arena.left + 52 + i * (segmentWidth + segmentGap),
          ctx.arena.top + 118,
          segmentWidth,
          18,
          0xffffff,
          0.14,
        )
        .setOrigin(0, 0.5);
      ctx.layer.add(segment);
      this.segments.push(segment);
    }
    this.counter = ctx.scene.add
      .text(ctx.arena.centerX, ctx.arena.top + 168, `0/${this.target}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: "26px",
        color: ctx.theme.accentText,
        align: "center",
        letterSpacing: 0,
      })
      .setOrigin(0.5);
    ctx.layer.add(this.counter);

    const press = () => this.press();
    ctx.scene.input.on("pointerdown", press);
    this.life.add(() => ctx.scene.input.off("pointerdown", press));
  }

  update(): MicrogameOutcome | void {
    if (this.space && Phaser.Input.Keyboard.JustDown(this.space)) {
      this.press();
    }
    return this.count >= this.target ? "success" : undefined;
  }

  destroy(): void {
    this.life.destroy();
  }

  private drawPanel(): void {
    const { scene, layer, arena, theme } = this.ctx;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x100d14, 1).fillRect(arena.x, arena.y, arena.width, arena.height);
    graphics.fillStyle(0x050507, 1).fillRect(arena.left + 44, arena.top + 104, arena.width - 88, 52);
    graphics.lineStyle(4, theme.secondary, 0.8).strokeRect(arena.left + 44, arena.top + 104, arena.width - 88, 52);
    graphics.fillStyle(theme.accent, 0.16);
    for (let y = arena.top + 222; y < arena.bottom - 34; y += 34) {
      graphics.fillRect(arena.left + 52, y, arena.width - 104, 4);
    }
    layer.add(graphics);
  }

  private createButton(x: number, y: number): Phaser.GameObjects.Container {
    const { scene } = this.ctx;
    const button = scene.add.container(x, y);
    button.add(scene.add.image(0, 0, ASSET_KEYS.mashButton).setDisplaySize(164, 128));
    return button;
  }

  private press(): void {
    this.count += 1;
    const progress = Phaser.Math.Clamp(this.count / this.target, 0, 1);
    this.fill.setScale(progress, 1);
    this.meterGlow.setAlpha(0.12 + progress * 0.22);
    const activeSegments = Math.ceil(progress * this.segments.length);
    this.segments.forEach((segment, index) => {
      const active = index < activeSegments;
      segment.setFillStyle(active ? this.ctx.theme.secondary : 0xffffff, active ? 0.86 : 0.14);
    });
    this.counter.setText(`${Math.min(this.count, this.target)}/${this.target}`);
    this.ctx.sfx.play("mash");
    pop(this.ctx.scene, this.counter, 1.08, 50);
    pop(this.ctx.scene, this.meterGlow, 1.02, 40);
    sparkleBurst(
      this.ctx.scene,
      this.ctx.arena.left + 52 + (this.ctx.arena.width - 104) * progress,
      this.ctx.arena.top + 118 + Phaser.Math.Between(-12, 12),
      progress > 0.85 ? this.ctx.theme.success : this.ctx.theme.secondary,
      progress > 0.85 ? 10 : 5,
      820,
    );
    this.ctx.scene.tweens.add({
      targets: this.button,
      scaleX: 0.94,
      scaleY: 0.88,
      duration: 34,
      yoyo: true,
    });
  }
}

export const buttonMash: MicrogameDefinition = {
  id: "button-mash",
  title: "Button Mash",
  instruction: "連打!",
  durationMs: 3300,
  completion: "objective",
  create: (ctx) => new ButtonMashGame(ctx),
};
