import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { AnnonceService, AnnonceInput, types, errorMessage } from "./core";
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `<section class="editor-page">
    <a routerLink="/" class="back-link">Back to the community</a
    ><span class="eyebrow">A SMALL POST. A BIG DIFFERENCE.</span>
    <h1>{{ id ? "Give this story an update." : "Share a little story." }}</h1>
    <p>Tell our community who needs a hand, a home, or a little advice.</p>
    @if (loading()) {
      <p>Loading announcement...</p>
    } @else if (loadError()) {
      <p class="error" role="alert">{{ loadError() }}</p>
    } @else {
      <form #form="ngForm" class="editor-form" (ngSubmit)="save(form.valid)">
        <h2>The little details</h2>
        <mat-form-field appearance="outline"
          ><mat-label>Announcement title</mat-label
          ><input
            matInput
            name="titre"
            [(ngModel)]="model.titre"
            required
            maxlength="120"
        /></mat-form-field>
        <div class="two-columns">
          <mat-form-field appearance="outline"
            ><mat-label>How can we help?</mat-label
            ><mat-select name="type" [(ngModel)]="model.type" required>
              @for (t of types; track t.value) {
                <mat-option [value]="t.value">{{ t.label }}</mat-option>
              }
            </mat-select></mat-form-field
          ><mat-form-field appearance="outline"
            ><mat-label>Animal</mat-label
            ><mat-select name="espece" [(ngModel)]="model.espece" required
              ><mat-option value="CHAT">Cat</mat-option
              ><mat-option value="CHIEN">Dog</mat-option
              ><mat-option value="AUTRE">Other</mat-option></mat-select
            ></mat-form-field
          >
        </div>
        <mat-form-field appearance="outline"
          ><mat-label>Tell their story</mat-label
          ><textarea
            matInput
            name="description"
            [(ngModel)]="model.description"
            rows="5"
            required
            maxlength="5000"
          ></textarea></mat-form-field
        ><mat-form-field appearance="outline"
          ><mat-label>Photo URL (optional)</mat-label
          ><input
            matInput
            name="photoUrl"
            [(ngModel)]="model.photoUrl"
            type="url"
            pattern="https?://.+"
            maxlength="2048"
          /><mat-hint
            >Link to a publicly hosted image, starting with https://.</mat-hint
          ></mat-form-field
        >
        <h2>A place on the map</h2>
        <div class="two-columns">
          <mat-form-field appearance="outline"
            ><mat-label>City</mat-label
            ><input
              matInput
              name="ville"
              [(ngModel)]="model.ville"
              required
              maxlength="120" /></mat-form-field
          ><mat-form-field appearance="outline"
            ><mat-label>Address (optional)</mat-label
            ><input
              matInput
              name="adresse"
              [(ngModel)]="model.adresse"
              maxlength="255"
          /></mat-form-field>
        </div>
        <p class="muted">
          {{
            model.type === "ANIMAL_ERRANT"
              ? "GPS coordinates are required to help people find this stray."
              : "GPS coordinates are optional. Enter both or leave both empty."
          }}
        </p>
        <button
          mat-stroked-button
          type="button"
          (click)="locate()"
          [disabled]="locating()"
        >
          {{ locating() ? "Finding you..." : " Use my location" }}
        </button>
        @if (locationMessage()) {
          <p role="status">{{ locationMessage() }}</p>
        }
        <div class="two-columns coordinates">
          <mat-form-field appearance="outline"
            ><mat-label>Latitude</mat-label
            ><input
              matInput
              name="latitude"
              type="number"
              step="any"
              min="-90"
              max="90"
              [(ngModel)]="model.latitude"
              [required]="model.type === 'ANIMAL_ERRANT'" /></mat-form-field
          ><mat-form-field appearance="outline"
            ><mat-label>Longitude</mat-label
            ><input
              matInput
              name="longitude"
              type="number"
              step="any"
              min="-180"
              max="180"
              [(ngModel)]="model.longitude"
              [required]="model.type === 'ANIMAL_ERRANT'"
          /></mat-form-field>
        </div>
        @if (id) {
          <mat-form-field appearance="outline"
            ><mat-label>Status</mat-label
            ><mat-select name="statut" [(ngModel)]="model.statut"
              ><mat-option value="OUVERTE">Open</mat-option
              ><mat-option value="EN_COURS">In progress</mat-option
              ><mat-option value="RESOLUE">Happy ending</mat-option></mat-select
            ></mat-form-field
          >
        }
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <div class="form-actions">
          <a mat-button routerLink="/">Cancel</a
          ><button
            mat-flat-button
            type="submit"
            [disabled]="busy() || !form.valid"
          >
            {{
              busy()
                ? "Saving..."
                : id
                  ? "Save changes"
                  : "Publish announcement"
            }}
          </button>
        </div>
      </form>
    }
  </section>`,
})
export class AnnonceFormComponent {
  api = inject(AnnonceService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  id = Number(this.route.snapshot.paramMap.get("id")) || undefined;
  types = types;
  busy = signal(false);
  loading = signal(!!this.id);
  loadError = signal("");
  error = signal("");
  locating = signal(false);
  locationMessage = signal("");
  model: AnnonceInput = {
    titre: "",
    type: "ADOPTION",
    espece: "CHAT",
    description: "",
    photoUrl: "",
    ville: "",
    adresse: "",
    latitude: null,
    longitude: null,
    statut: "OUVERTE",
  };
  constructor() {
    if (this.id)
      this.api.get(this.id).subscribe({
        next: (a) => {
          this.model = { ...a };
          this.loading.set(false);
        },
        error: (e) => {
          this.loadError.set(errorMessage(e));
          this.loading.set(false);
        },
      });
  }
  locate() {
    if (!navigator.geolocation) {
      this.locationMessage.set(
        "Geolocation is unavailable. Enter coordinates manually.",
      );
      return;
    }
    this.locating.set(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        this.model.latitude = Number(p.coords.latitude.toFixed(6));
        this.model.longitude = Number(p.coords.longitude.toFixed(6));
        this.locating.set(false);
        this.locationMessage.set(
          "Location added. Check that it matches the animal’s location.",
        );
      },
      () => {
        this.locating.set(false);
        this.locationMessage.set(
          "Location access was unavailable. Enter the coordinates manually.",
        );
      },
      { timeout: 10000 },
    );
  }
  save(valid: boolean | null) {
    if (!valid || this.busy()) return;
    if ((this.model.latitude === null) !== (this.model.longitude === null)) {
      this.error.set("Enter both GPS coordinates or leave both blank.");
      return;
    }
    this.busy.set(true);
    this.error.set("");
    this.api.save(this.model, this.id).subscribe({
      next: (a) => this.router.navigate(["/annonces", a.id]),
      error: (e) => {
        this.busy.set(false);
        this.error.set(errorMessage(e));
      },
    });
  }
}

