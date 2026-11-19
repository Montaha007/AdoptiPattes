import { Injectable, inject, signal } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpParams,
} from "@angular/common/http";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, tap, throwError } from "rxjs";

import { User, Auth, Annonce, AnnonceInput, Comment } from "./models";
@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  user = signal<User | null>(null);
  token = signal<string | null>(sessionStorage.getItem("adp-token"));
  constructor() {
    queueMicrotask(() => {
      if (this.token())
        this.http
          .get<User>("/api/auth/me")
          .subscribe({
            next: (u) => this.user.set(u),
            error: () => this.logout(),
          });
    });
  }
  isAdmin() {
    return this.user()?.roles.includes("ADMIN") ?? false;
  }
  login(value: unknown) {
    return this.http
      .post<Auth>("/api/auth/login", value)
      .pipe(tap((a) => this.save(a)));
  }
  register(value: unknown) {
    return this.http
      .post<Auth>("/api/auth/register", value)
      .pipe(tap((a) => this.save(a)));
  }
  private save(a: Auth) {
    sessionStorage.setItem("adp-token", a.token);
    this.token.set(a.token);
    this.user.set(a.user);
  }
  logout() {
    sessionStorage.removeItem("adp-token");
    this.token.set(null);
    this.user.set(null);
  }
}
