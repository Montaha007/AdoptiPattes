import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ThemeService } from "../core/theme.service";

@Component({
  selector: "app-pixel-theme-toggle",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button class="pixel-theme-toggle" type="button" (click)="theme.toggle()"
    [attr.aria-pressed]="theme.isArcade()"
    [attr.aria-label]="theme.isArcade() ? 'Use paper theme' : 'Use arcade theme'">
    <span class="pixel-theme-toggle__icon" aria-hidden="true">{{ theme.isArcade() ? 'NIGHT' : 'DAY' }}</span>
    <span class="pixel-theme-toggle__label">{{ theme.isArcade() ? 'Paper' : 'Arcade' }}</span>
  </button>`,
})
export class PixelThemeToggleComponent { readonly theme = inject(ThemeService); }
