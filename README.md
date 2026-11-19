# AdoptiPattes 

A Spring Boot + Angular community platform for adoption, stray-animal reports and advice. Built from the supplied AdoptiPattes assignment. The project at `D:\GL\Springboot\Workspace\adp` has been completed in place. Its original Gradle starter was backed up before conversion. This project uses the required Maven / Spring Boot 3.x / Java 17 stack.

## Start with your local MySQL (recommended)

Double-click **START-MYSQL.cmd** and enter your MySQL password when prompted. It uses `root` on port `3306`, the separate **adp_db** database, app port **8082**, and a local Mailpit email inbox on **8025**. Your existing `amsdbrest2026` database is untouched. Passwords are not saved in project files. The classroom admin/member credentials below apply to this launcher too. A fresh JWT signing secret is generated each launch unless you supply `JWT_SECRET`; sign in again after restarting.

The bundled Mailpit Windows binary is from the official axllent/mailpit v1.27.0 release; its license is in `tools/mailpit/LICENSE`. It captures local registration notifications without sending email externally. Configure real SMTP using the instructions below when deploying.

## Start the optional database-free demo (Windows)

1. Open PowerShell **in this project folder** (the folder containing this README).
2. Run `java -jar adp.jar --spring.profiles.active=demo --server.address=127.0.0.1`.
3. Open **http://localhost:8082**. Frontend and backend are inside this single JAR.
4. Stop with Ctrl+C. Port 8080 and 8085 are not used.

Alternatively run `powershell -ExecutionPolicy Bypass -File .\start-demo.ps1`.
To use another port, add `--server.port=8092` to the Java command.

The **demo** profile is for local demonstrations only: persistent H2 database in `data/`, fixed demo credentials, and email delivery disabled. It requires neither MySQL nor Docker. Do not deploy this profile publicly. Data persists after restart; use a different `--spring.datasource.url=jdbc:h2:file:./data/another-demo;MODE=MySQL` if you want an independent fresh demo database.

| Account | Email | Password | Permissions |
|---|---|---|---|
| Admin | admin@adoptipattes.local | AdminDemo!2026 | Read, publish, edit, change status, delete, view users |
| Member 1 | maya@adoptipattes.local | MemberDemo!2026 | Read and publish announcements/comments |
| Member 2 | sami@adoptipattes.local | MemberDemo!2026 | Read and publish announcements/comments |
| Visitor | No login | — | Read announcements and comments |

There are 15 seed announcements across all three categories and 20 comments. The seeder is idempotent and will not refill an already populated announcement table. Sample images use public Unsplash URLs; a local illustration is shown if an image is unavailable.

## What is included

- Spring Boot **3.5.16**, Java **17**, Maven; Spring Web, JPA, Security, Mail, Validation, BCrypt and JJWT.
- Angular **21.2.26** standalone components, Angular Material **21.2.14**, HttpClient services, route guards and JWT interceptor.
- A responsive retro-console interface with a persistent paper/arcade theme toggle, 8px layout tokens, reduced-motion support, keyboard focus states and interactive local SVG cats. Pixelify Sans is loaded from Google Fonts; no UI images or dependencies are required from a paid source.
- Four entities: User, Role, Annonce, Commentaire. Enum values and permissions match the brief.
- Public listing/detail, category and city filters, posting, comments, administrator moderation and member list.
- Author determined by authenticated JWT; registration always creates a member, even if the client submits a role.
- GPS validation for stray reports, optional browser geolocation, OpenStreetMap links.
- SMTP notification to the administrator after a successful registration transaction.
- Responsive lavender/pink interface, original SVG cat illustration, two interactive wandering cats, hide/pause controls and reduced-motion support.
- Validation and explicit loading/error/empty states. Members can edit/delete their own announcements; admins can moderate all announcements and delete users. Passwords are never returned by the API.
- Single `adp.jar` packaging; hash-based Angular routing supports refresh and direct links without server rewrites.
- Automated API integration tests, Postman collection, database bootstrap, Docker Compose, and Render deployment instructions.

The visual design is custom and uses public Angular Material components, as requested. The assignment names Paper Dashboard Angular and says an alternative requires instructor validation: have the instructor approve this custom Material design.

## Open and edit the source

**Eclipse / Spring Tool Suite:** File → Import → Maven → Existing Maven Projects → select this project's root directory (containing `pom.xml`) → Finish. Keep Java 17 selected. Run `AdpApplication` as a Spring Boot App. For the local demo, add `--spring.profiles.active=demo` under Run Configurations → Arguments → Program arguments. If the old `adp` project conflicts in Eclipse, close it or use a new workspace; do not delete its files.

**VS Code:** Open `D:\GL\Springboot\Workspace\adp` to see the Java backend and Angular frontend together. Use Terminal > Run Task > **Spring Boot development (MySQL)** to run the Java source, and **Angular development server** for the frontend. The backend task prompts for your database password. Prerequisites: Node.js **24 LTS** and npm. Angular 21 supports Node 20.19+, 22.12+, or 24.x; use Node 24 for reproducible tooling rather than an unsupported major. `frontend/.nvmrc` is included for nvm users.

```powershell
cd frontend
npm ci
npm start
```

Open http://localhost:4200. The development proxy sends `/api` requests to `http://localhost:8082`. Run the backend separately. If you change the backend port, update `frontend/proxy.conf.json`. There are no mock API responses in the frontend.

## Development in VS Code

Use Terminal > Run Task > Spring Boot development (MySQL) to run the Java source on port 8082. Start Angular development server in a second terminal on port 4200. For the packaged version, double-click START-MYSQL.cmd.

## Build and test from source

Requires Java 17, Maven 3.6.3+ and Node 24 LTS.

```powershell
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

Linux/macOS: `sh build.sh`.
The script installs locked frontend dependencies, compiles Angular, copies the browser build into Spring's static resources, runs backend integration tests and creates `adp.jar`.

Run backend tests independently: `mvn -f pom.xml test`.
Run frontend compilation independently: `cd frontend; npm run build`.
The backend tests use an isolated in-memory H2 database and a mocked mail transport; they never use your MySQL database.

## Required MySQL + SMTP configuration

The **normal/default profile uses MySQL**, not H2. Configure these environment variables in the same PowerShell window used to start Java. Replace example values with your own. Spring does not automatically load `.env`.

```powershell
$env:DB_URL='jdbc:mysql://localhost:3306/adp_db?createDatabaseIfNotExist=true&connectionTimeZone=UTC'
$env:DB_USERNAME='adp'
$env:DB_PASSWORD='YOUR_DATABASE_PASSWORD'
$env:JWT_SECRET='YOUR_RANDOM_SECRET_OF_AT_LEAST_32_BYTES'
$env:ADMIN_EMAIL='your-admin@example.com'
$env:ADMIN_PASSWORD='YOUR_STRONG_ADMIN_PASSWORD'
$env:MEMBER_PASSWORD='YOUR_STRONG_DEMO_MEMBER_PASSWORD'
$env:SEED_ENABLED='true'
$env:SMTP_HOST='localhost'
$env:SMTP_PORT='1025'
$env:MAIL_FROM='adoptipattes@example.com'
java -jar adp.jar
```

Use `database/init.sql` in MySQL Workbench to create the database if necessary. Give the dedicated application user access only to `adp_db`. Java creates the tables using `spring.jpa.hibernate.ddl-auto=update`, as specified in the assignment. In a mature production deployment, replace automatic DDL updates with reviewed migrations.

Generate a JWT secret in PowerShell:

```powershell
$bytes = New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
```

For Windows PowerShell 5.1, use `[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)` instead of `Fill`.

The initial administrator is created when `ADMIN_PASSWORD` is set. Existing account passwords are not reset at each startup. Seed records are created only when `SEED_ENABLED=true`; disable seeding after preparing your dataset.

### Optional Docker MySQL and local email inbox

Copy `.env.example` to `.env`, set both database passwords, then run `docker compose up -d`. MySQL is mapped to **3307** to avoid an existing MySQL service on 3306. Set `DB_URL` accordingly. Mailpit receives SMTP on **1025** and shows messages at **http://localhost:8025**. Register a new member, open Mailpit, and verify the notification includes their name, email and phone.

For real email, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_AUTH=true`, `SMTP_STARTTLS=true` as required by your provider, plus `MAIL_FROM` and `ADMIN_EMAIL`. Use the normal profile. `MAIL_ENABLED` defaults to true. SMTP failures are logged and do not undo an already successful registration; automatic delivery retry is not implemented.

## API and permissions

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public; member role only |
| POST | /api/auth/login | Public; returns token + safe user data |
| GET | /api/auth/me | Signed-in user |
| GET | /api/annonces?type=ADOPTION&ville=Tunis | Public |
| GET | /api/annonces/{id} | Public |
| POST | /api/annonces | Member/Admin |
| PUT, DELETE | /api/annonces/{id} | Owner or Admin |
| GET | /api/annonces/{id}/commentaires | Public |
| POST | /api/annonces/{id}/commentaires | Member/Admin |
| PUT, DELETE | /api/commentaires/{id} | Admin |
| GET | /api/users | Admin |

Creation returns 201; reads and updates 200; deletions 204; missing records 404; invalid fields 400; duplicate registration 409; missing/invalid authentication 401; insufficient permissions 403. Deleting an announcement also deletes its comments. Dates are assigned in UTC by the server. Member-created announcements start OUVERTE.

JWTs expire after eight hours and are stored in browser sessionStorage. The interceptor adds tokens only to relative `/api/` requests, clears the session after 401 and routes to login. Logout clears the current tab's token; already issued tokens remain valid until expiry (no server-side revocation list). The backend enforces every permission independently of frontend guards. CORS defaults to http://localhost:4200 and is configurable with `CORS_ORIGINS`.

Import `postman/ADP.postman_collection.json` into Postman. Run the collection in order against a fresh demo instance; login requests save member/admin tokens and creation requests save generated IDs. Do not run destructive CRUD tests against valuable production data.

## Architecture

```text
frontend/src/app/
  core/          Models, Auth/Annonce/Commentaire/User services, guards, interceptor
  routes.ts      Public/member/admin routes
  annonce-list.component.ts        Searchable announcement cards
  annonce-detail.component.ts      Details, comment list/form, moderation dialog
  annonce-form.component.ts        Create/edit, validation, geolocation
  auth.component.ts        Login and registration
  user-list.component.ts       Admin member table
  cats.component.ts        Interactive decorative companions
src/main/java/tn/blueorbit/adp/
  entities/      JPA entities and enums
  repositories/  Spring Data JPA queries
  dto/           Validated requests and safe responses
  services/      Interfaces and transactional implementations
  controllers/  REST routes and error responses
  security/      JWT filter, UserDetailsService, SecurityFilterChain
  config/        Idempotent seed data
```

The brief lists four entities but only specifies public CRUD routes for announcements/comments and admin user listing. This implementation keeps user creation in registration and roles in the internal RoleService; it does not expose unrestricted account/role management APIs.

## Render deployment

This project is deployed on Render as a Docker **Web Service**. Render provides the application
server and HTTPS URL, but this project still needs an external MySQL database because its JPA
configuration uses MySQL. Do not use the `demo` profile or demo passwords in production.

1. Push this repository to GitHub. Keep `.env`, database files, passwords, SMTP credentials and
   JWT secrets out of the repository.
2. Create a MySQL database with a provider that allows external connections. Copy its host, port,
   database name, username and password. The database must allow the Render service to connect.
3. In Render, choose **New → Web Service**, connect the GitHub repository, and choose **Docker**.
   Render will use the repository `Dockerfile`. Leave the port unset; Render supplies `PORT`.
4. Add these environment variables in Render's **Environment** page:

   `DB_URL` = `jdbc:mysql://HOST:PORT/DATABASE?createDatabaseIfNotExist=true&connectionTimeZone=UTC`

   `DB_USERNAME` = your MySQL username
   `DB_PASSWORD` = your MySQL password
   `JWT_SECRET` = a new random secret of at least 32 bytes
   `CORS_ORIGINS` = your Render URL, for example `https://your-service.onrender.com`
   `SEED_ENABLED` = `true` for the first deployment, then change it to `false`
   `ADMIN_EMAIL` = the email that should receive registration notifications
   `ADMIN_PASSWORD` = a strong initial admin password
   `MAIL_ENABLED` = `true`

5. Add the SMTP variables for your mail provider: `SMTP_HOST`, `SMTP_PORT`,
   `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_AUTH`, `SMTP_STARTTLS`, and `MAIL_FROM`.
   Use an SMTP app password, not your normal email password. Add these only in Render's
   environment settings, never in GitHub.
6. Deploy and wait for the build to finish. Test the public URL, registration, login, posting,
   owner edit/delete, admin user deletion and registration email. After the first successful
   seed, set `SEED_ENABLED=false` and redeploy.

The Docker image builds Angular first, copies it into Spring Boot's static resources, runs the
backend tests, and starts the packaged JAR on Render's assigned port. Browser geolocation works
on the Render HTTPS URL.

## Presentation checklist

Show visitor browsing and city/category filters; log in as Maya and create a stray report with GPS; edit and delete that post; leave a comment; log in as Admin and moderate another post, edit/delete a comment and inspect users; register a new member and show the Mailpit/SMTP email; show the combined JAR and Postman tests. See `docs/architecture.md` for the class diagram and design notes.




