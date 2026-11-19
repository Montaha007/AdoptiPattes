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
export class AnnonceService {
  private http = inject(HttpClient);
  list(type = "", ville = "") {
    let params = new HttpParams();
    if (type) params = params.set("type", type);
    if (ville) params = params.set("ville", ville);
    return this.http.get<Annonce[]>("/api/annonces", { params });
  }
  get(id: number) {
    return this.http.get<Annonce>("/api/annonces/" + id);
  }
  save(value: AnnonceInput, id?: number) {
    return id
      ? this.http.put<Annonce>("/api/annonces/" + id, value)
      : this.http.post<Annonce>("/api/annonces", value);
  }
  delete(id: number) {
    return this.http.delete<void>("/api/annonces/" + id);
  }
}
