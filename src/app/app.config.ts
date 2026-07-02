import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { registerLocaleData } from '@angular/common';
import localeEsCl from '@angular/common/locales/es-CL';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

registerLocaleData(localeEsCl);

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
    { provide: LOCALE_ID, useValue: 'es-CL' }, 
    provideClientHydration(),
    provideHttpClient()
  ]
};
