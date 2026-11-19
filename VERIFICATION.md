# Verification

Verified on 19 November 2026 against the completed project in D:\GL\Springboot\Workspace\adp.

- Java 17 / Spring Boot 3.5.16: 12 integration tests passed, zero failures/errors.
- Angular 21.2.26 / Material 21.2.14: production build passed from frontend/.
- MySQL: dedicated adp_db database created and populated; existing amsdbrest2026 left untouched.
- 24 live HTTP/SMTP checks passed against the same backend implementation: visitor/member/admin permissions, CRUD, filters, validation, registration, and local Mailpit receipt.
- Browser checks: member login, publication, comment creation, administrator login/directory and session persistence.
- Production npm dependency audit: zero reported vulnerabilities when checked.
- The final executable is adp.jar, containing the Angular production build.

The local email inbox captures SMTP on 1025 and is available at http://localhost:8025. No external email delivery or VPS deployment is claimed. The custom Angular Material interface replaces the proposed template; instructor approval is still required by the brief.

Python is not an application dependency. Application source is Java, TypeScript, HTML templates, SCSS and SVG; launch/build helpers use PowerShell and shell scripts.
