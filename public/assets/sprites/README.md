# Runtime Sprites

Transparent PNG sprites used by the game at runtime.

These are cropped and size-optimized from the generated chroma-key source images in `public/assets/generated/source`. Keep source images when regenerating art, but point Phaser preload calls at this folder.

Text and numbers are rendered by Phaser on top of these images so the UI stays legible and localization-friendly.

`mole-hole-front.png` is a derived front-rim layer from `mole-hole.png`. The whack-a-mole game draws `mole-hole.png`, then the mole, then `mole-hole-front.png` so the character appears to emerge from inside the hole.
