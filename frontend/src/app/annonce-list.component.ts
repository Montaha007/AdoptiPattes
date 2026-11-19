import { Component, inject, signal, DestroyRef } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, merge, switchMap, catchError, of, tap } from "rxjs";
import {
  Annonce,
  AnnonceService,
  AuthService,
  types,
  typeName,
  statusName,
  errorMessage,
} from "./core";
@Component({
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: ` <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow"
          ><span></span> A KINDER WORLD STARTS WITH US</span
        >
        <h1>Little paws.<br />Big <em>possibilities.</em></h1>
        <p>
          Find a forever friend, lend a helping hand, or share a little wisdom.
          Every small act of kindness matters.
        </p>
        <div class="hero-actions">
          <a mat-flat-button routerLink="/" [queryParams]="{ type: 'ADOPTION' }"
            >Find your new friend <span></span></a
          >
          @if (auth.user()) {
            <a mat-stroked-button routerLink="/annonces/new"
              >Share an announcement</a
            >
          } @else {
            <a mat-stroked-button routerLink="/login"
              >Log in to share a story</a
            >
          }
        </div>
        <div class="community">
          <div class="avatar-stack">
            <span>M</span><span>S</span><span></span>
          </div>
          <div>
            <strong>Good hearts. Happy tails.</strong
            ><small>A community that cares, together.</small>
          </div>
        </div>
      </div>
      <div class="hero-art">
        <div class="hero-orbit"></div>
        <span class="spark s1"></span><span class="spark s2"></span
        ><img
          class="hero-cat"
          src="assets/hero-cat.svg"
          alt="A smiling illustrated cat surrounded by hearts"
        />
        <div class="floating-note note-top">
          <span></span>
          <div>A little love<small>changes everything</small></div>
        </div>
        <div class="floating-note note-bottom">
          <span></span>
          <div>Home is a feeling.<small>Let's help them find it.</small></div>
        </div>
      </div>
    </section>
    <section class="explore">
      <div class="section-heading">
        <div>
          <span class="eyebrow">ONE COMMUNITY. SO MANY WAYS TO CARE.</span>
          <h2>A little help goes a long way<span> </span></h2>
        </div>
        @if (auth.user()) {
          <a mat-flat-button routerLink="/annonces/new"> Share a post</a>
        } @else {
          <a mat-stroked-button routerLink="/login">Join the conversation</a>
        }
      </div>
      <div class="filter-row">
        <div class="type-tabs" aria-label="Announcement category">
          <button [class.selected]="!type" (click)="select('')">
            All the little paws
          </button>
          @for (t of types; track t.value) {
            <button
              [class.selected]="type === t.value"
              (click)="select(t.value)"
            >
              {{ t.icon }} {{ t.label }}
            </button>
          }
        </div>
        <form class="city-search" (ngSubmit)="refresh.next()">
          <span aria-hidden="true"></span
          ><input
            aria-label="Filter by city"
            name="ville"
            [(ngModel)]="ville"
            placeholder="Search by city..."
          /><button type="submit" aria-label="Search">Search</button>
        </form>
      </div>
      <div class="results-meta">
        <span>{{ items().length }} stories waiting for a little kindness</span
        ><span>Newest first</span>
      </div>
      @if (loading()) {
        <div class="state">
          <mat-spinner diameter="36" />
          <p>Gathering little stories...</p>
        </div>
      } @else if (error()) {
        <div class="state error" role="alert">
          <p>{{ error() }}</p>
          <button mat-button (click)="refresh.next()">Try again</button>
        </div>
      } @else if (!items().length) {
        <div class="state">
          <span class="empty-icon"></span>
          <h3>No little paws here yet</h3>
          <p>Try another city or share the first announcement.</p>
          <button mat-button (click)="reset()">Clear filters</button>
        </div>
      } @else {
        <div class="card-grid">
          @for (a of items(); track a.id) {
            <article class="pet-card">
              <a class="card-photo" [routerLink]="['/annonces', a.id]"
                ><img
                  [src]="a.photoUrl || 'assets/hero-cat.svg'"
                  (error)="fallback($event)"
                  [alt]="a.titre"
                  loading="lazy"
                /><span
                  class="category-tag"
                  [class.stray]="a.type === 'ANIMAL_ERRANT'"
                  [class.advice]="a.type === 'DEMANDE_CONSEIL'"
                  >{{ typeName(a.type) }}</span
                ></a
              >
              <div class="card-body">
                <div class="pet-meta">
                  <span
                    >{{
                      a.espece === "CHAT"
                        ? "Cat"
                        : a.espece === "CHIEN"
                          ? "Dog"
                          : "Other"
                    }}
                    · {{ a.ville }}</span
                  ><span
                    class="status"
                    [class.resolved]="a.statut === 'RESOLUE'"
                    >{{ statusName(a.statut) }}</span
                  >
                </div>
                <h3>
                  <a [routerLink]="['/annonces', a.id]">{{ a.titre }}</a>
                </h3>
                <p>{{ a.description }}</p>
                <div class="card-bottom">
                  <span class="author-avatar">{{ a.auteur.prenom[0] }}</span
                  ><span
                    >{{ a.auteur.prenom
                    }}<small>{{
                      a.datePublication | date: "MMM d"
                    }}</small></span
                  ><a
                    [routerLink]="['/annonces', a.id]"
                    class="comment-count"
                    aria-label="Read comments"
                    > {{ a.commentaireCount }}</a
                  >
                </div>
              </div>
            </article>
          }
        </div>
      }
    </section>
    <section class="kindness-banner">
      <span></span>
      <div>
        <h2>You don't need a cape to be someone's hero.</h2>
        <p>
          A shared post. A thoughtful comment. A welcoming home. It all counts.
        </p>
      </div>
      <a mat-stroked-button routerLink="/register">Be part of something kind</a>
    </section>`,
})
export class AnnonceListComponent {
  api = inject(AnnonceService);
  route = inject(ActivatedRoute);
  destroy = inject(DestroyRef);
  auth = inject(AuthService);
  types = types;
  typeName = typeName;
  statusName = statusName;
  type = "";
  ville = "";
  items = signal<Annonce[]>([]);
  loading = signal(true);
  error = signal("");
  refresh = new Subject<void>();
  constructor() {
    merge(
      this.route.queryParamMap.pipe(
        tap((p) => (this.type = p.get("type") || "")),
      ),
      this.refresh,
    )
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set("");
        }),
        switchMap(() =>
          this.api.list(this.type, this.ville).pipe(
            catchError((e) => {
              this.error.set(errorMessage(e));
              return of([]);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe((a) => {
        this.items.set(a);
        this.loading.set(false);
      });
  }
  select(type: string) {
    this.type = type;
    this.refresh.next();
  }
  reset() {
    this.type = "";
    this.ville = "";
    this.refresh.next();
  }
  fallback(e: Event) {
    (e.target as HTMLImageElement).src = "assets/hero-cat.svg";
  }
}

