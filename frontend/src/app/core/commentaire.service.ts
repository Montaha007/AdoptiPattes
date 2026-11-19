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
export class CommentaireService {
  private http = inject(HttpClient);
  list(id: number) {
    return this.http.get<Comment[]>("/api/annonces/" + id + "/commentaires");
  }
  add(id: number, contenu: string) {
    return this.http.post<Comment>("/api/annonces/" + id + "/commentaires", {
      contenu,
    });
  }
  update(id: number, contenu: string) {
    return this.http.put<Comment>("/api/commentaires/" + id, { contenu });
  }
  delete(id: number) {
    return this.http.delete<void>("/api/commentaires/" + id);
  }
}
