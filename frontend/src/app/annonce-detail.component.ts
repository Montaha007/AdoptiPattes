import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import {
  MatDialog,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  Annonce,
  Comment,
  AnnonceService,
  CommentaireService,
  AuthService,
  typeName,
  statusName,
  errorMessage,
} from "./core";
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule],
  template: `<h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.text }}</mat-dialog-content
    ><mat-dialog-actions align="end"
      ><button mat-button [mat-dialog-close]="false">Keep it</button
      ><button mat-flat-button [mat-dialog-close]="true">
        Delete
      </button></mat-dialog-actions
    >`,
})
export class ConfirmDialog {
  data = inject(MAT_DIALOG_DATA);
}
@Component({
  selector: "app-commentaire-form",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `<form #f="ngForm" (ngSubmit)="submit()">
    <mat-form-field appearance="outline"
      ><mat-label>Leave a little kindness</mat-label
      ><textarea
        matInput
        name="contenu"
        [(ngModel)]="contenu"
        rows="3"
        required
        maxlength="2000"
        placeholder="Offer help, ask a question, or share some advice..."
      ></textarea>
    </mat-form-field>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    <button mat-flat-button [disabled]="busy() || !f.valid || !contenu.trim()">
      {{ busy() ? "Posting..." : "Post comment" }}
    </button>
  </form>`,
})
export class CommentaireFormComponent {
  @Input({ required: true }) annonceId!: number;
  @Output() saved = new EventEmitter<void>();
  api = inject(CommentaireService);
  contenu = "";
  busy = signal(false);
  error = signal("");
  submit() {
    if (!this.contenu.trim() || this.busy()) return;
    this.busy.set(true);
    this.api.add(this.annonceId, this.contenu).subscribe({
      next: () => {
        this.busy.set(false);
        this.contenu = "";
        this.error.set("");
        this.saved.emit();
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(errorMessage(e));
      },
    });
  }
}
@Component({
  selector: "app-commentaire-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  template: `@for (c of comments; track c.id) {
      <article class="comment">
        <span class="author-avatar">{{ c.auteur.prenom[0] }}</span>
        <div class="comment-content">
          <strong>{{ c.auteur.prenom }} {{ c.auteur.nom }}</strong
          ><small>{{ c.dateCommentaire | date: "medium" }}</small>
          @if (editing === c.id) {
            <mat-form-field appearance="outline"
              ><mat-label>Edit comment</mat-label
              ><textarea
                matInput
                [(ngModel)]="draft"
                maxlength="2000"
              ></textarea></mat-form-field
            ><button mat-button (click)="editing = 0">Cancel</button
            ><button
              mat-flat-button
              (click)="save(c.id)"
              [disabled]="busy() || !draft.trim()"
            >
              Save
            </button>
          } @else {
            <p>{{ c.contenu }}</p>
            @if (auth.isAdmin()) {
              <button mat-button (click)="editing = c.id; draft = c.contenu">
                Edit</button
              ><button mat-button (click)="remove(c)" [disabled]="busy()">
                Delete
              </button>
            }
          }
        </div>
      </article>
    } @empty {
      <p class="muted">Be the first to lend a little support.</p>
    }
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }`,
})
export class CommentaireListComponent {
  @Input() comments: Comment[] = [];
  @Output() changed = new EventEmitter<void>();
  auth = inject(AuthService);
  api = inject(CommentaireService);
  dialog = inject(MatDialog);
  editing = 0;
  draft = "";
  busy = signal(false);
  error = signal("");
  save(id: number) {
    if (this.busy()) return;
    this.busy.set(true);
    this.api.update(id, this.draft).subscribe({
      next: () => {
        this.editing = 0;
        this.busy.set(false);
        this.error.set("");
        this.changed.emit();
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(errorMessage(e));
      },
    });
  }
  remove(c: Comment) {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: "Delete this comment?",
          text: "This will permanently remove this comment.",
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.busy.set(true);
          this.api.delete(c.id).subscribe({
            next: () => {
              this.busy.set(false);
              this.changed.emit();
            },
            error: (e) => {
              this.busy.set(false);
              this.error.set(errorMessage(e));
            },
          });
        }
      });
  }
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    CommentaireListComponent,
    CommentaireFormComponent,
  ],
  template: `<section class="detail-page">
    <a routerLink="/" class="back-link">Back to all the little paws</a>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    @if (loading()) {
      <p>Loading this little story...</p>
    }
    @if (item(); as a) {
      <div class="detail-grid">
        <div>
          <div class="detail-photo">
            <img
              [src]="a.photoUrl || 'assets/hero-cat.svg'"
              (error)="fallback($event)"
              [alt]="a.titre"
            /><span class="category-tag">{{ typeName(a.type) }}</span>
          </div>
          <section class="story">
            <span class="eyebrow">THEIR LITTLE STORY</span>
            <h2>A little more about this post</h2>
            <p class="story-text">{{ a.description }}</p>
          </section>
          <section class="discussion">
            <h2>
              A circle of support <span>({{ comments().length }})</span>
            </h2>
            <app-commentaire-list
              [comments]="comments()"
              (changed)="loadComments()"
            />
            @if (commentError()) {
              <p class="error" role="alert">{{ commentError() }}</p>
              <button mat-button (click)="loadComments()">
                Retry comments
              </button>
            }
            @if (auth.user()) {
              <h3>Have a little help to offer?</h3>
              <app-commentaire-form
                [annonceId]="a.id"
                (saved)="loadComments()"
              />
            } @else {
              <div class="join-note">
                <p>A kind word can make a big difference.</p>
                <a mat-flat-button routerLink="/login"
                  >Log in to join the conversation</a
                >
              </div>
            }
          </section>
        </div>
        <aside class="detail-info">
          <span class="status">{{ statusName(a.statut) }}</span>
          <h1>{{ a.titre }}</h1>
          <p class="muted">
            {{
              a.espece === "CHAT"
                ? "Cat"
                : a.espece === "CHIEN"
                  ? "Dog"
                  : "Other"
            }}
            · {{ a.ville }}
          </p>
          <hr />
          <div class="posted-by">
            <span class="author-avatar">{{ a.auteur.prenom[0] }}</span>
            <div>
              Shared by <strong>{{ a.auteur.prenom }}</strong><small>{{
                a.datePublication | date: "mediumDate"
              }}</small>
            </div>
          </div>
          <h3> {{ a.ville }}</h3>
          @if (a.adresse) {
            <p>{{ a.adresse }}</p>
          }
          @if (a.latitude !== null && a.longitude !== null) {
            <a
              mat-stroked-button
              [href]="mapUrl(a)"
              target="_blank"
              rel="noopener noreferrer"
              >View on OpenStreetMap</a
            >
          }
          @if (auth.isAdmin() || auth.user()?.id === a.auteur.id) {
              <div class="admin-actions">
              <h3>{{ auth.isAdmin() ? "Moderation" : "Your publication" }}</h3>
              <a mat-flat-button [routerLink]="['/annonces', a.id, 'edit']"
                >Edit post / change status</a
              ><button mat-button (click)="remove(a)" [disabled]="deleting()">
                Delete announcement
              </button>
            </div>
          }
          <div class="gentle-note">
             A gentle reminder
            <p>
              Be kind, meet safely, and contact a veterinarian for medical
              concerns.
            </p>
          </div>
        </aside>
      </div>
    }
  </section>`,
})
export class AnnonceDetailComponent {
  api = inject(AnnonceService);
  commentApi = inject(CommentaireService);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  dialog = inject(MatDialog);
  id = Number(this.route.snapshot.paramMap.get("id"));
  item = signal<Annonce | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  deleting = signal(false);
  error = signal("");
  commentError = signal("");
  typeName = typeName;
  statusName = statusName;
  constructor() {
    this.api.get(this.id).subscribe({
      next: (a) => {
        this.item.set(a);
        this.loading.set(false);
        this.loadComments();
      },
      error: (e) => {
        this.error.set(errorMessage(e));
        this.loading.set(false);
      },
    });
  }
  loadComments() {
    this.commentError.set("");
    this.commentApi
      .list(this.id)
      .subscribe({
        next: (c) => this.comments.set(c),
        error: (e) => this.commentError.set(errorMessage(e)),
      });
  }
  mapUrl(a: Annonce) {
    return (
      "https://www.openstreetmap.org/?mlat=" +
      a.latitude +
      "&mlon=" +
      a.longitude +
      "#map=16/" +
      a.latitude +
      "/" +
      a.longitude
    );
  }
  fallback(e: Event) {
    (e.target as HTMLImageElement).src = "assets/hero-cat.svg";
  }
  remove(a: Annonce) {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: "Delete this announcement?",
          text: "The announcement and all its comments will be permanently deleted.",
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.deleting.set(true);
          this.api.delete(a.id).subscribe({
            next: () => this.router.navigate(["/my-publications"]),
            error: (e) => {
              this.deleting.set(false);
              this.error.set(errorMessage(e));
            },
          });
        }
      });
  }
}

