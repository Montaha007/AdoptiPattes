import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { AuthService, errorMessage } from "./core";
@Component({
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `<section class="auth-layout">
    <div class="auth-art">
      <span class="eyebrow">A SOFTER PLACE TO LAND</span>
      <h1>
        {{
          register
            ? "Good hearts belong together."
            : "Welcome back, kind human."
        }}
      </h1>
      <img src="assets/hero-cat.svg" alt="A friendly lavender cat" />
      <p>A little kindness can change a little life.</p>
    </div>
    <div class="form-panel">
      <span class="eyebrow">ADOPTIPATTES COMMUNITY</span>
      <h2>
        {{
          register
            ? "Let’s make a little difference."
            : "Your community missed you."
        }}
      </h2>
      <p>
        {{
          register
            ? "Create your account and start spreading kindness."
            : "Sign in to share, help, and connect."
        }}
      </p>
      <form #form="ngForm" (ngSubmit)="submit(form.valid)">
        @if (register) {
          <div class="two-columns">
            <mat-form-field appearance="outline"
              ><mat-label>First name</mat-label
              ><input
                matInput
                name="prenom"
                [(ngModel)]="model.prenom"
                required
                maxlength="80"
                autocomplete="given-name" /></mat-form-field
            ><mat-form-field appearance="outline"
              ><mat-label>Last name</mat-label
              ><input
                matInput
                name="nom"
                [(ngModel)]="model.nom"
                required
                maxlength="80"
                autocomplete="family-name"
            /></mat-form-field>
          </div>
          <mat-form-field appearance="outline"
            ><mat-label>Phone number</mat-label
            ><input
              matInput
              name="tel"
              [(ngModel)]="model.tel"
              required
              maxlength="30"
              autocomplete="tel"
          /></mat-form-field>
        }
        <mat-form-field appearance="outline"
          ><mat-label>Email address</mat-label
          ><input
            matInput
            name="email"
            [(ngModel)]="model.email"
            type="email"
            email
            required
            maxlength="254"
            autocomplete="email" /></mat-form-field
        ><mat-form-field appearance="outline"
          ><mat-label>Password</mat-label
          ><input
            matInput
            name="password"
            [(ngModel)]="model.password"
            type="password"
            required
            [minlength]="register ? 10 : 1"
            maxlength="72"
            [autocomplete]="register ? 'new-password' : 'current-password'"
          />
          @if (register) {
            <mat-hint>At least 10 characters.</mat-hint>
          }
        </mat-form-field>
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <button
          mat-flat-button
          type="submit"
          [disabled]="busy() || !form.valid"
        >
          {{
            busy()
              ? "One little moment..."
              : register
                ? "Create my account"
                : "Log in"
          }}
        </button>
      </form>
      <p class="form-switch">
        {{ register ? "Already part of the family?" : "New around here?" }}
        <a [routerLink]="register ? '/login' : '/register'">{{
          register ? "Log in" : "Join the community"
        }}</a>
      </p>
    </div>
  </section>`,
})
export class AuthComponent {
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  register = this.route.snapshot.data["register"] === true;
  busy = signal(false);
  error = signal("");
  model = { email: "", password: "", prenom: "", nom: "", tel: "" };
  submit(valid: boolean | null) {
    if (!valid || this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    (this.register
      ? this.auth.register(this.model)
      : this.auth.login(this.model)
    ).subscribe({
      next: () => {
        const target = this.route.snapshot.queryParamMap.get("returnUrl");
        this.router.navigateByUrl(
          target?.startsWith("/") && !target.startsWith("//") ? target : "/",
        );
      },
      error: (e) => {
        this.busy.set(false);
        this.error.set(errorMessage(e));
      },
    });
  }
}

