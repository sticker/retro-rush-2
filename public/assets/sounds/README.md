# Sound Assets

These audio files are mapped in `src/audio/Sfx.ts`.

- `NextGame.mp3`: microgame instruction/cue transition
- `beep.mp3`: small UI blip fallback
- `correct.mp3`: coin, number-chain correct taps, whack-a-mole hits, beat-timing success
- `destroy.wav`: currently unused, available for future impact sounds
- `fail.mp3`: miss/failure
- `gameover.mp3`: game-over screen
- `jump.mp3`: jump
- `push.wav`: button mash press, circuit-snap switch
- `success.mp3`: clear/perfect

If a sample cannot play, `Sfx` falls back to generated WebAudio chiptune sounds.
