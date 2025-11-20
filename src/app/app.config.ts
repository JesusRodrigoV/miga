import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from "@angular/router";
import { provideAnimations } from "@angular/platform-browser/animations";
import { routes } from "./app.routes";
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from "@angular/platform-browser";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { providePrimeNG } from "primeng/config";
import { CustomTitleStrategy } from "@core/services/custom-title-strategy";
import { MessageService } from "primeng/api";
import { MgPreset } from "src/theme";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: "top" }),
    ),
    providePrimeNG({
      theme: {
        preset: MgPreset,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    MessageService,
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    provideHttpClient(withFetch()),
    provideAnimations(),
    { provide: TitleStrategy, useClass: CustomTitleStrategy },
  ],
};
