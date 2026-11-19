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
export class UserService {
  private http = inject(HttpClient);
  list() {
    return this.http.get<User[]>("/api/users");
  }
}
