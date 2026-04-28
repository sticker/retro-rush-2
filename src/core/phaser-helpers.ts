import * as Phaser from "phaser";

export function coverImage(
  image: Phaser.GameObjects.Image,
  width: number,
  height: number,
): Phaser.GameObjects.Image {
  const scale = Math.max(width / image.width, height / image.height);
  image.setScale(scale);
  return image;
}

export function addScanlines(
  scene: Phaser.Scene,
  width: number,
  height: number,
  alpha = 0.13,
): Phaser.GameObjects.Graphics {
  const lines = scene.add.graphics();
  lines.setDepth(1000);
  lines.fillStyle(0x000000, alpha);
  for (let y = 0; y < height; y += 4) {
    lines.fillRect(0, y, width, 1);
  }
  return lines;
}

export function addPixelText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number,
  color = "#fff4cf",
  align: CanvasTextAlign = "center",
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text, {
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
      fontSize: `${size}px`,
      fontStyle: "900",
      color,
      align,
      letterSpacing: 0,
      stroke: "#07070a",
      strokeThickness: Math.max(2, Math.floor(size / 9)),
      shadow: {
        offsetX: Math.max(2, Math.floor(size / 12)),
        offsetY: Math.max(2, Math.floor(size / 12)),
        color: "#000000",
        blur: 0,
        fill: true,
      },
    })
    .setOrigin(0.5);
}

export function drawPixelFrame(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number,
  edge: number,
  highlight: number,
): void {
  graphics.fillStyle(edge, 1);
  graphics.fillRect(x - 8, y - 8, width + 16, height + 16);
  graphics.fillStyle(highlight, 1);
  graphics.fillRect(x - 4, y - 4, width + 8, 4);
  graphics.fillRect(x - 4, y - 4, 4, height + 8);
  graphics.fillStyle(fill, 1);
  graphics.fillRect(x, y, width, height);
}
