import { Component, signal } from "@angular/core";
@Component({
  selector: "app-cats",
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
          aria-label="Pet the tiny lavender cat"
        >
          <span class="purr" role="status">{{ message() }}</span
          ><svg viewBox="0 0 100 90" aria-hidden="true">
            <path
              d="M70 70 Q98 72 92 45"
              fill="none"
              stroke="#9c83cb"
              stroke-width="9"
              stroke-linecap="round"
            />
            <ellipse cx="51" cy="65" rx="25" ry="19" fill="#bda9df" />
            <path
              d="M22 37 L21 9 40 23 Q51 18 62 23 L80 9 79 40Z"
              fill="#bda9df"
            />
            <ellipse cx="51" cy="40" rx="30" ry="24" fill="#bda9df" />
            <path d="M26 17 L29 30 36 24 M74 17 L65 25 73 30" fill="#f1b4c8" />
            <path
              d="M34 40 Q39 34 43 40 M59 40 Q64 34 68 40"
              fill="none"
              stroke="#46375e"
              stroke-width="3"
              stroke-linecap="round"
            />
            <path d="M47 45 L55 45 51 50Z" fill="#965d84" />
            <ellipse cx="31" cy="47" rx="6" ry="3" fill="#f1b4c8" />
            <ellipse cx="71" cy="47" rx="6" ry="3" fill="#f1b4c8" />
            <path
              d="M36 74v9 M63 74v9"
              stroke="#9c83cb"
              stroke-width="10"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
      <div class="cat-walk second" [class.paused]="paused()">
        <button
          class="tiny-cat peach"
          (click)="pet()"
          aria-label="Pet the tiny peach cat"
        >
          <img src="assets/tiny-cat.svg" alt="" aria-hidden="true">
        </button>
      </div>
    }`,
})
export class CatsComponent {
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


