import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { User, UserService, errorMessage } from "./core";
@Component({
  imports: [MatTableModule, FormsModule],
  template: `<section class="users-page">
    <span class="eyebrow">ADMIN CORNER</span>
    <h1>The humans behind the kindness.</h1>
    <p>
      Community members and their roles. Personal details are visible only to
      administrators.
    </p>
    <input
      class="member-search"
      aria-label="Search members"
      placeholder="Search name or email..."
      [(ngModel)]="search"
    />
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    @if (loading()) {
      <p>Loading members...</p>
    } @else {
      <div class="table-scroll">
        <table mat-table [dataSource]="filtered()">
          <ng-container matColumnDef="name"
            ><th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let u">
              {{ u.prenom }} {{ u.nom }}
            </td></ng-container
          ><ng-container matColumnDef="email"
            ><th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">{{ u.email }}</td></ng-container
          ><ng-container matColumnDef="tel"
            ><th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let u">{{ u.tel }}</td></ng-container
          ><ng-container matColumnDef="roles"
            ><th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let u">
              <span class="status">{{ u.roles.join(", ") }}</span>
            </td></ng-container
          >
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
          <tr *matNoDataRow>
            <td colspan="4" class="state">No members match this search.</td>
          </tr>
        </table>
      </div>
    }
  </section>`,
})
export class UserListComponent {
  api = inject(UserService);
  users = signal<User[]>([]);
  error = signal("");
  loading = signal(true);
  search = "";
  columns = ["name", "email", "tel", "roles"];
  constructor() {
    this.api.list().subscribe({
      next: (u) => {
        this.users.set(u);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(errorMessage(e));
        this.loading.set(false);
      },
    });
  }
  filtered() {
    const q = this.search.toLowerCase();
    return this.users().filter((u) =>
      (u.prenom + " " + u.nom + " " + u.email).toLowerCase().includes(q),
    );
  }
}

