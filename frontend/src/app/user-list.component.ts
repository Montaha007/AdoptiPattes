import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialog } from "./annonce-detail.component";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { User, UserService, AuthService, errorMessage } from "./core";
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, FormsModule, MatButtonModule],
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
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let u">
              @if (u.id !== auth.user()?.id) {
                <button mat-button (click)="remove(u)" [disabled]="deleting() !== null">Delete user</button>
              } @else { <span>Your account</span> }
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
          <tr *matNoDataRow>
            <td colspan="5" class="state">No members match this search.</td>
          </tr>
        </table>
      </div>
    }
  </section>`,
})
export class UserListComponent {
  api = inject(UserService);
  auth = inject(AuthService);
  dialog = inject(MatDialog);
  deleting = signal<number | null>(null);
  users = signal<User[]>([]);
  error = signal("");
  loading = signal(true);
  search = "";
  columns = ["name", "email", "tel", "roles", "actions"];
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
  remove(user: User) {
    this.dialog.open(ConfirmDialog, { data: {
      title: 'Delete this user?',
      text: 'Permanently delete ' + user.prenom + ' ' + user.nom + ', their posts, and their comments? Comments on their posts will also be deleted.',
    }}).afterClosed().subscribe(ok => {
      if (!ok || this.deleting() !== null) return;
      this.deleting.set(user.id);
      this.error.set('');
      this.api.delete(user.id).subscribe({
        next: () => { this.users.update(users => users.filter(u => u.id !== user.id)); this.deleting.set(null); },
        error: e => { this.error.set(errorMessage(e)); this.deleting.set(null); },
      });
    });
  }
  filtered() {
    const q = this.search.toLowerCase();
    return this.users().filter((u) =>
      (u.prenom + " " + u.nom + " " + u.email).toLowerCase().includes(q),
    );
  }
}

