import * as Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants";
import { sparkleBurst } from "../core/effects";
import type { MicrogameContext, MicrogameDefinition, MicrogameOutcome } from "../core/microgame";
import { Lifetime } from "../core/microgame";

const COLORS = [0xff5b45, 0x4fe8ff, 0xffd84f, 0x71ff9f];

interface Node {
  rect: Phaser.GameObjects.Image;
  light: Phaser.GameObjects.Image;
  colorIndex: number;
  targetIndex: number;
}

class CircuitSnapGame {
  private readonly life = new Lifetime();
  private readonly nodes: Node[] = [];
  private solved = false;

  constructor(private readonly ctx: MicrogameContext) {
    this.drawBoard();
    const count = ctx.difficulty >= 3 ? 4 : 3;
    const gap = 82;
    const startX = ctx.arena.centerX - ((count - 1) * gap) / 2;

    for (let i = 0; i < count; i += 1) {
      const targetIndex = ctx.rng.between(0, COLORS.length - 1);
      let colorIndex = ctx.rng.between(0, COLORS.length - 1);
      if (colorIndex === targetIndex) {
        colorIndex = (colorIndex + 1) % COLORS.length;
      }

      const target = ctx.scene.add
        .image(startX + i * gap, ctx.arena.top + 86, ASSET_KEYS.circuitSocket)
        .setDisplaySize(58, 58)
        .setTint(COLORS[targetIndex]!);
      const socket = ctx.scene.add
        .image(startX + i * gap, ctx.arena.centerY + 52, ASSET_KEYS.circuitSocket)
        .setDisplaySize(72, 72)
        .setTint(0x647389);
      const light = ctx.scene.add
        .image(startX + i * gap, ctx.arena.centerY + 52, ASSET_KEYS.circuitSocket)
        .setDisplaySize(58, 58)
        .setTint(COLORS[colorIndex]!);
      light.setInteractive({ useHandCursor: true });
      socket.setInteractive({ useHandCursor: true });
      const cycle = () => this.cycleNode(i);
      light.on("pointerdown", cycle);
      socket.on("pointerdown", cycle);
      this.life.add(() => {
        light.off("pointerdown", cycle);
        socket.off("pointerdown", cycle);
      });
      ctx.layer.add([target, socket, light]);
      this.nodes.push({ rect: socket, light, colorIndex, targetIndex });
    }

    const handleKey = (event: KeyboardEvent) => {
      const index = Number.parseInt(event.key, 10) - 1;
      if (index >= 0 && index < this.nodes.length) {
        this.cycleNode(index);
      }
    };
    ctx.scene.input.keyboard?.on("keydown", handleKey);
    this.life.add(() => ctx.scene.input.keyboard?.off("keydown", handleKey));
  }

  update(): MicrogameOutcome | void {
    return this.solved ? "success" : undefined;
  }

  destroy(): void {
    this.life.destroy();
  }

  private drawBoard(): void {
    const { scene, layer, arena, theme } = this.ctx;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x071016, 1).fillRect(arena.x, arena.y, arena.width, arena.height);
    graphics.lineStyle(4, theme.accent, 0.32);
    graphics.strokeRect(arena.x + 32, arena.top + 46, arena.width - 64, 88);
    graphics.strokeRect(arena.x + 32, arena.centerY + 4, arena.width - 64, 128);
    graphics.lineStyle(2, theme.secondary, 0.45);
    for (let x = arena.left + 70; x < arena.right - 40; x += 82) {
      graphics.lineBetween(x, arena.top + 134, x, arena.centerY + 4);
    }
    layer.add(graphics);

    const labelStyle = {
      fontFamily: '"Courier New", monospace',
      fontSize: "18px",
      color: theme.muted,
      letterSpacing: 0,
    };
    layer.add(scene.add.text(arena.left + 46, arena.top + 30, "TARGET", labelStyle));
    layer.add(scene.add.text(arena.left + 46, arena.centerY - 24, "INPUT", labelStyle));
  }

  private cycleNode(index: number): void {
    const node = this.nodes[index];
    if (!node) {
      return;
    }

    node.colorIndex = (node.colorIndex + 1) % COLORS.length;
    node.light.setTint(COLORS[node.colorIndex]!);
    this.ctx.sfx.play("swap");
    sparkleBurst(this.ctx.scene, node.light.x, node.light.y, COLORS[node.colorIndex]!, 8, 820);
    this.ctx.scene.tweens.add({
      targets: [node.rect, node.light],
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 50,
      yoyo: true,
    });
    this.solved = this.nodes.every((entry) => entry.colorIndex === entry.targetIndex);
  }
}

export const circuitSnap: MicrogameDefinition = {
  id: "circuit-snap",
  title: "Circuit Snap",
  instruction: "そろえろ!",
  durationMs: 5600,
  completion: "objective",
  create: (ctx) => new CircuitSnapGame(ctx),
};
