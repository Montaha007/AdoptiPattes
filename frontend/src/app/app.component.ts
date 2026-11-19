import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { AuthService } from "./core";
import { CatsComponent } from "./cats.component";
import { PixelThemeToggleComponent } from "./shared/pixel-theme-toggle.component";
@Component({
  selector: "app-root",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    CatsComponent,
    PixelThemeToggleComponent,
  ],
  template: ` <a class="skip" href="#main" (click)="skipToContent($event)">Skip to content</a>
    <header class="site-header">
      <a class="brand" routerLink="/" aria-label="AdoptiPattes home"
        ><img class="brand-icon" src="assets/tiny-cat.svg" alt="">Adopti<span>Pattes</span><i>•</i></a
      >
      <nav aria-label="Main navigation">
        <a
          routerLink="/"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Explore</a
        ><a routerLink="/" [queryParams]="{ type: 'ADOPTION' }"
          >Adopt a friend</a
        ><a routerLink="/" [queryParams]="{ type: 'ANIMAL_ERRANT' }"
          >Help a stray</a
        >
        @if (auth.user()) {
          <a routerLink="/my-publications" routerLinkActive="active">My publications</a>
        }
        @if (auth.isAdmin()) {
          <a routerLink="/users">Members</a>
        }
      </nav>
      <div class="account">
        @if (auth.user(); as u) {
          <span class="user-label"
            >Hi, {{ u.prenom
            }}<small>{{ auth.isAdmin() ? "Admin" : "Member" }}</small></span
          ><button mat-button (click)="logout()">Log out</button>
        } @else {
          <a mat-button routerLink="/login">Log in</a
          ><a mat-flat-button routerLink="/register">Join the kindness</a>
        }
        <app-pixel-theme-toggle />
      </div>
    </header>
    <main id="main" tabindex="-1"><router-outlet /></main>
    <footer>
      <a class="brand" routerLink="/">Adopti<span>Pattes</span><i>•</i></a>
      <p>A little kindness. A whole lot of love.</p>
      <span>Made for paws & people </span>
    </footer>
    <app-cats />`,
})
export class AppComponent { skipToContent(event: Event) { event.preventDefault(); document.getElementById("main")?.focus(); }
  auth = inject(AuthService);
  router = inject(Router);
  logout() {
    this.auth.logout();
    this.router.navigate(["/"]);
  }
}


