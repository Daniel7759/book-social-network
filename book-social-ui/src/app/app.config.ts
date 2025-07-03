import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthService } from './services/auth.service';

// Función que inicializa el AuthService antes de que la app comience
function initializeAuthService(authService: AuthService) {
  return () => {
    // Forzar la inicialización del AuthService
    return new Promise<void>((resolve) => {
      // Dar tiempo al AuthService para inicializar completamente
      setTimeout(() => {
        // El AuthService ya se inicializa en el constructor, solo necesitamos asegurar que esté listo
        resolve();
      }, 0);
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthService,
      deps: [AuthService],
      multi: true
    }
  ]
};
