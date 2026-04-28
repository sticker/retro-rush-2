import * as Phaser from "phaser";

export function pop(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.Components.Transform,
  scale = 1.16,
  duration = 120,
): void {
  const baseX = target.scaleX;
  const baseY = target.scaleY;
  scene.tweens.killTweensOf(target);
  scene.tweens.add({
    targets: target,
    scaleX: baseX * scale,
    scaleY: baseY * scale,
    duration,
    yoyo: true,
    ease: "Back.easeOut",
    onComplete: () => {
      target.setScale(baseX, baseY);
    },
  });
}

export function popIn(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Alpha,
  targetScale = 1,
): void {
  target.setAlpha(0).setScale(targetScale * 0.72);
  scene.tweens.add({
    targets: target,
    alpha: 1,
    scaleX: targetScale,
    scaleY: targetScale,
    duration: 180,
    ease: "Back.easeOut",
  });
}

export function sparkleBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  count = 16,
  depth = 850,
): void {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.14, 0.14);
    const distance = Phaser.Math.Between(22, 58);
    const size = Phaser.Math.Between(3, 7);
    const pixel = scene.add.rectangle(x, y, size, size, color).setDepth(depth);
    scene.tweens.add({
      targets: pixel,
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance,
      alpha: 0,
      scale: 0.2,
      duration: Phaser.Math.Between(220, 420),
      ease: "Quad.easeOut",
      onComplete: () => pixel.destroy(),
    });
  }
}

export function tapRipple(scene: Phaser.Scene, x: number, y: number, color = 0xffdf72): void {
  const ring = scene.add.circle(x, y, 8).setStrokeStyle(3, color, 0.9).setDepth(1200);
  scene.tweens.add({
    targets: ring,
    radius: 34,
    alpha: 0,
    duration: 260,
    ease: "Quad.easeOut",
    onComplete: () => ring.destroy(),
  });
}
