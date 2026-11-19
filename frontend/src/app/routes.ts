import { Routes } from "@angular/router";
import { authGuard, adminGuard } from "./core";
export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./annonce-list.component").then((m) => m.AnnonceListComponent),
    title: "Explore · AdoptiPattes",
  },
  {
    path: "login",
    loadComponent: () => import("./auth.component").then((m) => m.AuthComponent),
    title: "Welcome back · AdoptiPattes",
  },
  {
    path: "register",
    loadComponent: () => import("./auth.component").then((m) => m.AuthComponent),
    data: { register: true },
    title: "Join the kindness · AdoptiPattes",
  },
  {
    path: "annonces/new",
    canActivate: [authGuard],
    loadComponent: () => import("./annonce-form.component").then((m) => m.AnnonceFormComponent),
    title: "Share a story · AdoptiPattes",
  },
  {
    path: "annonces/:id/edit",
    canActivate: [adminGuard],
    loadComponent: () => import("./annonce-form.component").then((m) => m.AnnonceFormComponent),
    title: "Update a story · AdoptiPattes",
  },
  {
    path: "annonces/:id",
    loadComponent: () =>
      import("./annonce-detail.component").then((m) => m.AnnonceDetailComponent),
    title: "A little story · AdoptiPattes",
  },
  {
    path: "users",
    canActivate: [adminGuard],
    loadComponent: () => import("./user-list.component").then((m) => m.UserListComponent),
    title: "Our community · AdoptiPattes",
  },
  { path: "**", redirectTo: "" },
];

