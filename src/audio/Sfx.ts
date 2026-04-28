export type SfxKey =
  | "start"
  | "clear"
  | "miss"
  | "cue"
  | "blip"
  | "coin"
  | "jump"
  | "swap"
  | "mash";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export class Sfx {
  private context?: AudioContext;
  private enabled = true;

  unlock(): void {
    const context = this.getContext();
    if (context?.state === "suspended") {
      void context.resume();
    }
  }

  play(key: SfxKey): void {
    if (!this.enabled) {
      return;
    }

    const now = this.getContext()?.currentTime ?? 0;
    switch (key) {
      case "start":
        this.tone(196, 0.05, "square", now, 0.055);
        this.tone(392, 0.06, "square", now + 0.055, 0.06);
        this.tone(784, 0.08, "square", now + 0.115, 0.055);
        this.noise(0.05, now + 0.17, 0.025);
        break;
      case "clear":
        this.tone(523, 0.06, "square", now, 0.055);
        this.tone(659, 0.06, "square", now + 0.06, 0.055);
        this.tone(784, 0.07, "square", now + 0.12, 0.06);
        this.tone(1046, 0.11, "triangle", now + 0.19, 0.05);
        this.noise(0.07, now + 0.19, 0.025);
        break;
      case "miss":
        this.sweep(220, 92, 0.22, "sawtooth", now, 0.055);
        this.noise(0.12, now, 0.035);
        break;
      case "cue":
        this.tone(392, 0.045, "square", now, 0.04);
        this.tone(587, 0.045, "square", now + 0.065, 0.045);
        this.tone(784, 0.05, "square", now + 0.13, 0.045);
        this.tone(1175, 0.075, "triangle", now + 0.2, 0.04);
        this.tone(98, 0.045, "triangle", now, 0.035);
        this.tone(147, 0.055, "triangle", now + 0.13, 0.03);
        break;
      case "coin":
        this.tone(988, 0.035, "square", now, 0.038);
        this.tone(1568, 0.045, "square", now + 0.035, 0.042);
        this.tone(2349, 0.06, "triangle", now + 0.072, 0.026);
        break;
      case "jump":
        this.sweep(310, 720, 0.095, "triangle", now, 0.04);
        break;
      case "swap":
        this.tone(466, 0.035, "square", now, 0.035);
        this.tone(699, 0.04, "square", now + 0.035, 0.035);
        this.tone(932, 0.035, "triangle", now + 0.075, 0.026);
        break;
      case "mash":
        this.tone(170 + Math.random() * 100, 0.022, "square", now, 0.03);
        this.noise(0.018, now, 0.02);
        break;
      case "blip":
        this.tone(740, 0.035, "square", now, 0.03);
        break;
    }
  }

  private getContext(): AudioContext | undefined {
    if (this.context) {
      return this.context;
    }

    const ContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!ContextClass) {
      this.enabled = false;
      return undefined;
    }

    this.context = new ContextClass();
    return this.context;
  }

  private tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    startAt: number,
    volume: number,
  ): void {
    const context = this.getContext();
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  private sweep(
    fromFrequency: number,
    toFrequency: number,
    duration: number,
    type: OscillatorType,
    startAt: number,
    volume: number,
  ): void {
    const context = this.getContext();
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(fromFrequency, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(toFrequency, startAt + duration);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  private noise(duration: number, startAt: number, volume: number): void {
    const context = this.getContext();
    if (!context) {
      return;
    }

    const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount);
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1200, startAt);
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(startAt);
  }
}
