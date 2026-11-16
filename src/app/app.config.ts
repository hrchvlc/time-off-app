import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // useSetInputAPI - reported bug with signal input
    // changing into input type (in new request modal)
    provideIonicAngular({ useSetInputAPI: true }),
  ],
};
