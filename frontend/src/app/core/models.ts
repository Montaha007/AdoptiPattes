import { HttpErrorResponse } from "@angular/common/http";
export interface Person {
  id: number;
  nom: string;
  prenom: string;
}
export interface User extends Person {
  email: string;
  tel: string;
  roles: string[];
  catColor?: string;
}
export interface Auth {
  token: string;
  user: User;
}
export interface Annonce {
  id: number;
  titre: string;
  type: string;
  espece: string;
  description: string;
  photoUrl: string;
  ville: string;
  adresse: string;
  latitude: number | null;
  longitude: number | null;
  statut: string;
  datePublication: string;
  auteur: Person;
  commentaireCount: number;
}
export interface Comment {
  id: number;
  contenu: string;
  dateCommentaire: string;
  idAnnonce: number;
  auteur: Person;
}
export type AnnonceInput = Omit<
  Annonce,
  "id" | "datePublication" | "auteur" | "commentaireCount"
>;
export const types = [
  { value: "ADOPTION", label: "Find a friend", icon: "" },
  { value: "ANIMAL_ERRANT", label: "Lend a paw", icon: "" },
  { value: "DEMANDE_CONSEIL", label: "Share advice", icon: "" },
];
export const typeName = (v: string) =>
  types.find((t) => t.value === v)?.label || v;
export const statusName = (v: string) =>
  ({ OUVERTE: "Open", EN_COURS: "In progress", RESOLUE: "Happy ending" })[v] ||
  v;
export const errorMessage = (e: HttpErrorResponse) =>
  e.status === 0
    ? "We cannot reach the server. Check that the backend is running."
    : e.error?.message || "Something went wrong. Please try again.";
