import * as Phaser from "phaser";
import { ASSET_KEYS } from "../core/constants";
import { sparkleBurst } from "../core/effects";
import type { MicrogameContext, MicrogameDefinition, MicrogameOutcome } from "../core/microgame";
import { Lifetime } from "../core/microgame";

interface Rock {
  body: Phaser.GameObjects.Image;
  radius: number;
  vx: number;
  vy: number;
}

class AsteroidDodgeGame {
  private readonly life = new Lifetime();
  private readonly player: Phaser.GameObjects.Container;
  private readonly rocks: Rock[] = [];
  private readonly cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private targetX: number;
  private spawnTimer = 0;
  private trailTimer = 0;

  constructor(private readonly ctx: MicrogameContext) {
    this.targetX = ctx.arena.centerX;
    this.cursors = ctx.scene.input.keyboard?.createCursorKeys();
    this.drawField();
    this.player = this.createShip(ctx.arena.centerX, ctx.arena.bottom - 58);
    ctx.layer.add(this.player);

    const move = (pointer: Phaser.Input.Pointer) => {
      this.targetX = Phaser.Math.Clamp(pointer.x, ctx.arena.left + 26, ctx.arena.right - 26);
    };
    ctx.scene.input.on("pointermove", move);
    ctx.scene.input.on("pointerdown", move);
    this.life.add(() => {
      ctx.scene.input.off("pointermove", move);
      ctx.scene.input.off("pointerdown", move);
    });
  }

  update(_time: number, delta: number): MicrogameOutcome | void {
    const dt = delta / 1000;
    const keyboardDirection =
      (this.cursors?.left?.isDown ? -1 : 0) + (this.cursors?.right?.isDown ? 1 : 0);
    if (keyboardDirection !== 0) {
      this.targetX = Phaser.Math.Clamp(
        this.targetX + keyboardDirection * 300 * dt,
        this.ctx.arena.left + 26,
        this.ctx.arena.right - 26,
      );
    }

    this.player.x = Phaser.Math.Linear(this.player.x, this.targetX, 0.24);
    this.trailTimer += delta;
    if (this.trailTimer > 95) {
      this.trailTimer = 0;
      const ember = this.ctx.scene.add.rectangle(
        this.player.x + this.ctx.rng.between(-7, 7),
        this.player.y + 33,
        5,
        9,
        this.ctx.theme.secondary,
        0.85,
      );
      ember.setDepth(820);
      this.ctx.layer.add(ember);
      this.ctx.scene.tweens.add({
        targets: ember,
        y: ember.y + 24,
        alpha: 0,
        scale: 0.2,
        duration: 230,
        onComplete: () => ember.destroy(),
      });
    }
    this.spawnTimer += delta;
    const interval = Math.max(165, 390 - this.ctx.difficulty * 32) / this.ctx.speed;
    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawnRock();
    }

    for (let index = this.rocks.length - 1; index >= 0; index -= 1) {
      const rock = this.rocks[index]!;
      rock.body.x += rock.vx * dt;
      rock.body.y += rock.vy * dt;
      rock.body.rotation += 2.4 * dt;

      if (
        Phaser.Math.Distance.Between(rock.body.x, rock.body.y, this.player.x, this.player.y) <
        rock.radius + 15
      ) {
        sparkleBurst(this.ctx.scene, this.player.x, this.player.y, this.ctx.theme.danger, 22, 830);
        return "failure";
      }

      if (rock.body.y > this.ctx.arena.bottom + 40) {
        rock.body.destroy();
        this.rocks.splice(index, 1);
      }
    }

    return undefined;
  }

  destroy(): void {
    this.life.destroy();
  }

  private drawField(): void {
    const { scene, layer, arena, theme } = this.ctx;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x05070d, 1).fillRect(arena.x, arena.y, arena.width, arena.height);
    graphics.lineStyle(1, theme.accent, 0.2);
    for (let y = arena.top + 28; y < arena.bottom; y += 34) {
      graphics.lineBetween(arena.left + 12, y, arena.right - 12, y);
    }
    for (let x = arena.left + 20; x < arena.right; x += 42) {
      graphics.lineBetween(x, arena.top + 8, x, arena.bottom - 8);
    }
    graphics.fillStyle(theme.secondary, 0.9);
    for (let i = 0; i < 22; i += 1) {
      graphics.fillRect(
        this.ctx.rng.between(arena.left + 8, arena.right - 8),
        this.ctx.rng.between(arena.top + 8, arena.bottom - 8),
        2,
        2,
      );
    }
    layer.add(graphics);
  }

  private createShip(x: number, y: number): Phaser.GameObjects.Container {
    const { scene } = this.ctx;
    const ship = scene.add.container(x, y);
    const body = scene.add
      .image(0, 0, ASSET_KEYS.spaceship)
      .setDisplaySize(70, 82)
      .setOrigin(0.5, 0.55);
    ship.add(body);
    scene.tweens.add({
      targets: body,
      scaleX: body.scaleX * 1.035,
      scaleY: body.scaleY * 0.985,
      duration: 110,
      yoyo: true,
      repeat: -1,
    });
    return ship;
  }

  private spawnRock(): void {
    const { scene, layer, arena, rng, speed, difficulty } = this.ctx;
    const size = rng.between(30, 52);
    const rock = scene.add.image(
      rng.between(arena.left + size, arena.right - size),
      arena.top - 28,
      ASSET_KEYS.asteroid,
    );
    rock.setDisplaySize(size * 1.45, size * 1.25);
    rock.setTint(rng.pick([0xffffff, 0xffe0b0, 0xc8d7ff]));
    layer.add(rock);
    this.rocks.push({
      body: rock,
      radius: size * 0.64,
      vx: rng.between(-28, 28) * speed,
      vy: (235 + difficulty * 24 + rng.between(0, 95)) * speed,
    });
  }
}

export const asteroidDodge: MicrogameDefinition = {
  id: "asteroid-dodge",
  title: "Asteroid Dodge",
  instruction: "よけろ!",
  durationMs: 5200,
  completion: "survive",
  create: (ctx) => new AsteroidDodgeGame(ctx),
};
