# Generated Assets

`retro-rush-title-backdrop.png` は組み込み画像生成ツールで作成したタイトル/背景用アセットです。

`source/` 配下のファイルは、ゲーム内スプライト用に組み込み画像生成ツールで作成したクロマキー元画像です。`sprites/` ではなく生成元の保管場所なので、ゲームから直接参照しません。

UI source images are also stored in `source/`. Runtime UI assets are cropped/resized into `public/assets/ui`.

Prompt summary:

```text
Create a high-quality pixel-art inspired retro arcade backdrop for a game called Retro Rush, with no text/logos/letters/numbers/watermarks. 1980s/1990s Japanese arcade mood, CRT glow, abstract cartridges, joystick silhouettes, starfield grid, coin sparkle, scanline atmosphere, energetic motion streaks. 16:9 landscape, darker readable center, detailed edges, crisp 8-bit/16-bit pixel art influence, balanced colorful palette with cyan/red/yellow/green accents.
```

Sprite prompt pattern:

```text
Create one high-quality polished 16-bit pixel art game sprite on a perfectly flat chroma-key background, with no text, no logo, no watermark, no shadows, and generous padding. The chroma-key background was removed locally and the cropped transparent PNG was saved under public/assets/sprites.
```
