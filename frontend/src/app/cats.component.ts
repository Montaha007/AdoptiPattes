import { AuthService } from "./core";
import { PixelCatComponent } from "./shared/pixel-cat.component";
import { ChangeDetectionStrategy, Component, signal, inject } from "@angular/core";
@Component({
  selector: "app-cats",
  imports: [PixelCatComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="cat-controls">
      <button (click)="visible.set(!visible())" [attr.aria-pressed]="visible()">
        {{ visible() ? "Hide" : "Show" }} tiny cats
      </button>
      @if (visible()) {
        <button (click)="paused.set(!paused())" [attr.aria-pressed]="paused()">
          {{ paused() ? "Let them wander" : "Pause cats" }}
        </button>
      }
    </div>
    @if (visible()) {
      <div class="cat-walk" [class.paused]="paused()">
        <button
          class="tiny-cat"
          (click)="pet()"
          aria-label="Pet your tiny pixel cat"
        >
          <span class="purr" role="status">{{ message() }}</span
          ><app-pixel-cat [compact]="true" [color]="auth.user()?.catColor || 'lavender'" [paused]="paused()" />
        </button>
      </div>
      <div class="cat-walk second" [class.paused]="paused()">
        <button
          class="tiny-cat peach"
          (click)="pet()"
          aria-label="Pet the tiny ginger pixel cat"
        >
          <app-pixel-cat [compact]="true" color="ginger" [paused]="paused()" />
        </button>
      </div>
    }`,
})
export class CatsComponent {
  auth = inject(AuthService);
  visible = signal(true);
  paused = signal(matchMedia("(prefers-reduced-motion: reduce)").matches);
  message = signal("");
  timer?: ReturnType<typeof setTimeout>;
  pet() {
    this.message.set(
      ["Purr... ", "You made my day!", "Tiny paws, big love"][
        Math.floor(Math.random() * 3)
      ],
    );
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.message.set(""), 2200);
  }
  ngOnDestroy() {
    clearTimeout(this.timer);
  }
}


