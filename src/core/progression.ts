import { STORAGE_KEYS } from "./constants";
import { getThemeForScore } from "./theme";

export function getHighScore(): number {
  const stored = window.localStorage.getItem(STORAGE_KEYS.highScore);
  const parsed = stored ? Number.parseInt(stored, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function recordHighScore(score: number): number {
  const previous = getHighScore();
  const next = Math.max(previous, score);
  window.localStorage.setItem(STORAGE_KEYS.highScore, String(next));
  return next;
}

export function getUnlockedEraLabel(): string {
  return getThemeForScore(getHighScore()).label;
}
