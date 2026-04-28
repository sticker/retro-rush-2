import * as Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants";
import { pop, sparkleBurst } from "../core/effects";
import type { MicrogameContext, MicrogameDefinition, MicrogameOutcome } from "../core/microgame";
import { Lifetime } from "../core/microgame";

interface Coin {
  body: Phaser.GameObjects.Container;
  taken: boolean;
}

class CoinHopGame {
  private readonly life = new Lifetime();
  private readonly player: Phaser.GameObjects.Container;
  private readonly coins: Coin[] = [];
  private readonly space?: Phaser.Input.Keyboard.Key;
  private readonly up?: Phaser.Input.Keyboard.Key;
  private readonly counter: Phaser.GameObjects.Text;
  private velocityY = 0;
  private collected = 0;
  private readonly target = 10;
  private readonly groundY: number;

  constructor(private readonly ctx: MicrogameContext) {
    this.groundY = ctx.arena.bottom - 62;
    this.space = ctx.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.up = ctx.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.drawStage();
    this.player = this.createRunner(ctx.arena.left + 82, this.groundY);
    ctx.layer.add(this.player);
    this.counter = ctx.scene.add
      .text(ctx.arena.right - 20, ctx.arena.top + 22, `0/${this.target}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: "24px",
        color: ctx.theme.accentText,
        align: "right",
        letterSpacing: 0,
      })
      .setOrigin(1, 0.5);
    ctx.layer.add(this.counter);

    const jump = () => this.jump();
    ctx.scene.input.on("pointerdown", jump);
    this.life.add(() => ctx.scene.input.off("pointerdown", jump));

    for (let i = 0; i < 14; i += 1) {
      this.spawnCoin(ctx.arena.right + 48 + i * 74);
    }
  }

  update(_time: number, delta: number): MicrogameOutcome | void {
    const dt = delta / 1000;
    if (
      (this.space && Phaser.Input.Keyboard.JustDown(this.space)) ||
      (this.up && Phaser.Input.Keyboard.JustDown(this.up))
    ) {
      this.jump();
    }

    this.velocityY += 1420 * dt;
    this.player.y += this.velocityY * dt;
    if (this.player.y >= this.groundY) {
      this.player.y = this.groundY;
      this.velocityY = 0;
    }

    const scroll = (260 + this.ctx.difficulty * 16) * this.ctx.speed * dt;
    for (const coin of this.coins) {
      coin.body.x -= scroll;
      coin.body.rotation += 4 * dt;

      if (!coin.taken && Phaser.Math.Distance.Between(coin.body.x, coin.body.y, this.player.x, this.player.y - 38) < 32) {
        coin.taken = true;
        coin.body.setVisible(false);
        this.collected += 1;
        this.counter.setText(`${this.collected}/${this.target}`);
        this.ctx.sfx.play("coin");
        sparkleBurst(this.ctx.scene, coin.body.x, coin.body.y, this.ctx.theme.secondary, 12, 820);
        pop(this.ctx.scene, this.counter, 1.18, 90);
        if (this.collected >= this.target) {
          return "success";
        }
      }

      if (coin.body.x < this.ctx.arena.left - 34) {
        coin.taken = false;
        coin.body.setVisible(true);
        coin.body.x = this.ctx.arena.right + this.ctx.rng.between(38, 126);
        coin.body.y = this.groundY - this.ctx.rng.pick([56, 92, 128]);
      }
    }

    return undefined;
  }

  destroy(): void {
    this.life.destroy();
  }

  private drawStage(): void {
    const { scene, layer, arena, theme } = this.ctx;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x08111b, 1).fillRect(arena.x, arena.y, arena.width, arena.height);
    graphics.fillStyle(theme.accent, 0.14);
    for (let x = arena.left; x < arena.right; x += 44) {
      graphics.fillRect(x, arena.top + 54 + ((x / 44) % 2) * 18, 28, 7);
    }
    graphics.fillStyle(0x182128, 1).fillRect(arena.x, this.groundY + 18, arena.width, 34);
    graphics.fillStyle(theme.secondary, 0.9);
    for (let x = arena.left; x < arena.right; x += 34) {
      graphics.fillRect(x, this.groundY + 22, 20, 4);
    }
    layer.add(graphics);
  }

  private createRunner(x: number, y: number): Phaser.GameObjects.Container {
    const runner = this.ctx.scene.add.container(x, y);
    const body = this.ctx.scene.add
      .image(0, -40, ASSET_KEYS.runner)
      .setDisplaySize(96, 99)
      .setOrigin(0.5);
    runner.add(body);
    this.ctx.scene.tweens.add({
      targets: body,
      angle: 3,
      duration: 180,
      yoyo: true,
      repeat: -1,
    });
    return runner;
  }

  private spawnCoin(x: number): void {
    const coin = this.ctx.scene.add.container(
      x,
      this.groundY - this.ctx.rng.pick([56, 92, 128]),
    );
    coin.add(this.ctx.scene.add.image(0, 0, ASSET_KEYS.coin).setDisplaySize(38, 39));
    this.ctx.layer.add(coin);
    this.coins.push({ body: coin, taken: false });
  }

  private jump(): void {
    if (this.player.y >= this.groundY - 1) {
      this.velocityY = -585;
      this.ctx.sfx.play("jump");
      pop(this.ctx.scene, this.player, 1.08, 80);
    }
  }
}

export const coinHop: MicrogameDefinition = {
  id: "coin-hop",
  title: "Coin Hop",
  instruction: "とれ!",
  durationMs: 7000,
  completion: "objective",
  create: (ctx) => new CoinHopGame(ctx),
};
