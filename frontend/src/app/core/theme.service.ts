import { Injectable, computed, signal } from "@angular/core";

export type ThemeMode = "paper" | "arcade";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly storageKey = "adp-theme";
  readonly mode = signal<ThemeMode>(this.initialMode());
  readonly isArcade = computed(() => this.mode() === "arcade");

  constructor() { this.apply(this.mode()); }
  toggle(): void { this.set(this.isArcade() ? "paper" : "arcade"); }
  set(mode: ThemeMode): void { this.mode.set(mode); localStorage.setItem(this.storageKey, mode); this.apply(mode); }

  private initialMode(): ThemeMode {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === "paper" || saved === "arcade") return saved;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "arcade" : "paper";
  }

  private apply(mode: ThemeMode): void {
    document.documentElement.dataset["theme"] = mode;
    document.documentElement.style.colorScheme = mode === "arcade" ? "dark" : "light";
  }
}
