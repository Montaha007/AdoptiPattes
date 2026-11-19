import { Injectable, inject, signal } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpParams,
} from "@angular/common/http";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, tap, throwError } from "rxjs";

import { AuthService } from "./auth.service";
import { User } from "./models";
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService),
    router = inject(Router);
  const api = req.url.startsWith("/api/");
  if (api && auth.token())
    req = req.clone({
      setHeaders: { Authorization: "Bearer " + auth.token() },
    });
  return next(req).pipe(
    catchError((e) => {
      if (
        api &&
        e.status === 401 &&
        !req.url.endsWith("/login") &&
        !req.url.endsWith("/register")
      ) {
        auth.logout();
        router.navigate(["/login"], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => e);
    }),
  );
};
export const authGuard: CanActivateFn = (_, state) => {
  const a = inject(AuthService),
    r = inject(Router);
  return a.token()
    ? true
    : r.createUrlTree(["/login"], { queryParams: { returnUrl: state.url } });
};
export const adminGuard: CanActivateFn = () => {
  const a = inject(AuthService),
    r = inject(Router),
    http = inject(HttpClient);
  if (!a.token()) return r.createUrlTree(["/login"]);
  return http.get<User>("/api/auth/me").pipe(
    tap((u) => a.user.set(u)),
    mapAdmin(r),
    catchError(() => [r.createUrlTree(["/login"])]),
  );
};
import { map } from "rxjs";
const mapAdmin = (r: Router) =>
  map((u: User) => (u.roles.includes("ADMIN") ? true : r.createUrlTree(["/"])));

