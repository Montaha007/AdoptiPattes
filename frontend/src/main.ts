import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideRouter, withHashLocation } from "@angular/router";
import { AppComponent } from "./app/app.component";
import { routes } from "./app/routes";
import { authInterceptor } from "./app/core";
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withHashLocation()),
  ],
}).catch(console.error);

