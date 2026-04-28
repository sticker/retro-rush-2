import * as Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants";
import { pop, sparkleBurst } from "../core/effects";
import type { MicrogameContext, MicrogameDefinition, MicrogameOutcome } from "../core/microgame";
import { Lifetime } from "../core/microgame";

interface Orb {
  value: number;
  container: Phaser.GameObjects.Container;
  orb: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  cleared: boolean;
}

class NumberChainGame {
  private readonly life = new Lifetime();
  private readonly orbs: Orb[] = [];
  private readonly nextText: Phaser.GameObjects.Text;
  private next = 1;
  private failed = false;

  constructor(private readonly ctx: MicrogameContext) {
    this.drawStage();
    this.nextText = ctx.scene.add
      .text(ctx.arena.centerX, ctx.arena.top + 26, "NEXT 1", {
        fontFamily: '"Courier New", monospace',
        fontSize: "24px",
        color: ctx.theme.accentText,
        align: "center",
        letterSpacing: 0,
        stroke: "#050507",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    ctx.layer.add(this.nextText);
    this.placeOrbs();
  }

  update(): MicrogameOutcome | void {
    if (this.failed) {
      return "failure";
    }
    return this.next > 7 ? "success" : undefined;
  }

  destroy(): void {
    this.life.destroy();
  }

  private drawStage(): void {
    const { scene, layer, arena, theme } = this.ctx;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x130d18, 1).fillRect(arena.x, arena.y, arena.width, arena.height);
    graphics.lineStyle(2, theme.secondary, 0.2);
    for (let x = arena.left + 16; x < arena.right; x += 36) {
      graphics.lineBetween(x, arena.top + 58, x - 24, arena.bottom - 14);
    }
    graphics.fillStyle(theme.accent, 0.12).fillRect(arena.left + 22, arena.top + 56, arena.width - 44, arena.height - 80);
    layer.add(graphics);
  }

  private placeOrbs(): void {
    const cells: Array<[number, number]> = [
      [0.22, 0.25],
      [0.5, 0.23],
      [0.78, 0.27],
      [0.28, 0.5],
      [0.68, 0.49],
      [0.43, 0.72],
      [0.82, 0.74],
    ];
    const shuffled = Phaser.Utils.Array.Shuffle([...cells]);
    for (let value = 1; value <= 7; value += 1) {
      const [px, py] = shuffled[value - 1] ?? [0.5, 0.5];
      const x = this.ctx.arena.left + this.ctx.arena.width * px + this.ctx.rng.between(-10, 10);
      const y = this.ctx.arena.top + this.ctx.arena.height * py + this.ctx.rng.between(-10, 10);
      const container = this.ctx.scene.add.container(x, y).setSize(56, 56);
      const orb = this.ctx.scene.add.image(0, 0, ASSET_KEYS.numberOrb).setDisplaySize(58, 58);
      const label = this.ctx.scene.add
        .text(0, 1, String(value), {
          fontFamily: '"Courier New", monospace',
          fontSize: "30px",
          fontStyle: "900",
          color: "#fff6ce",
          align: "center",
          letterSpacing: 0,
          stroke: "#68270c",
          strokeThickness: 5,
        })
        .setOrigin(0.5);
      container.add([orb, label]);
      const entry: Orb = { value, container, orb, label, cleared: false };
      this.ctx.layer.add(container);
      this.ctx.scene.tweens.add({
        targets: orb,
        angle: value % 2 === 0 ? 6 : -6,
        duration: 700 + value * 35,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      this.orbs.push(entry);
    }

    const tapAt = (pointer: Phaser.Input.Pointer) => this.tapAt(pointer.x, pointer.y);
    this.ctx.scene.input.on("pointerdown", tapAt);
    this.life.add(() => this.ctx.scene.input.off("pointerdown", tapAt));
  }

  private tapAt(x: number, y: number): void {
    const target = this.orbs.find((orb) => {
      if (orb.cleared) {
        return false;
      }
      return Phaser.Math.Distance.Between(x, y, orb.container.x, orb.container.y) <= 40;
    });
    if (target) {
      this.tapOrb(target);
    }
  }

  private tapOrb(entry: Orb): void {
    if (entry.cleared) {
      return;
    }
    if (entry.value !== this.next) {
      this.failed = true;
      this.ctx.sfx.play("miss");
      sparkleBurst(this.ctx.scene, entry.container.x, entry.container.y, this.ctx.theme.danger, 14, 830);
      return;
    }

    entry.cleared = true;
    this.ctx.sfx.play("coin");
    sparkleBurst(this.ctx.scene, entry.container.x, entry.container.y, this.ctx.theme.secondary, 18, 830);
    this.ctx.scene.tweens.add({
      targets: entry.container,
      alpha: 0,
      scaleX: 1.35,
      scaleY: 1.35,
      duration: 150,
      ease: "Back.easeOut",
    });
    this.next += 1;
    this.nextText.setText(this.next <= 7 ? `NEXT ${this.next}` : "CHAIN!");
    pop(this.ctx.scene, this.nextText, 1.2, 110);
  }
}

export const numberChain: MicrogameDefinition = {
  id: "number-chain",
  title: "Number Chain",
  instruction: "1から!",
  durationMs: 6200,
  completion: "objective",
  create: (ctx) => new NumberChainGame(ctx),
};
