import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  // withInMemoryScrolling: En vez de hacer href="#inicio" en las tarjetas de catalogo
  // Hago fragment="inicio" para ir a cada una de las categorias
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes, 
      withInMemoryScrolling({ 
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled' 
      })
    ), 
    provideClientHydration()
  ]
};
