import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
} from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
registerLocaleData(localeIt);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' },
    MessageService,
    ConfirmationService,
    provideRouter(
      appRoutes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withEnabledBlockingInitialNavigation(),
    ),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
      translation: {
        // filtri generali
        startsWith: 'Inizia con',
        contains: 'Contiene',
        notContains: 'Non contiene',
        endsWith: 'Finisce con',
        equals: 'Uguale',
        notEquals: 'Diverso',
        noFilter: 'Nessun filtro',
        lt: 'Minore di',
        lte: 'Minore o uguale',
        gt: 'Maggiore di',
        gte: 'Maggiore o uguale',
        is: 'È',
        isNot: 'Non è',
        before: 'Prima',
        after: 'Dopo',
        dateIs: 'La data è',
        dateIsNot: 'La data non è',
        dateBefore: 'La data è prima',
        dateAfter: 'La data è dopo',
        clear: 'Pulisci',
        apply: 'Applica',
        matchAll: 'Match tutti',
        matchAny: 'Match qualunque',
        addRule: 'Aggiungi regola',
        removeRule: 'Rimuovi regola',
        accept: 'Sì',
        reject: 'No',
        choose: 'Scegli',
        upload: 'Carica',
        cancel: 'Annulla',
        today: 'Oggi',
        // calendario
        monthNames: [
          'Gennaio',
          'Febbraio',
          'Marzo',
          'Aprile',
          'Maggio',
          'Giugno',
          'Luglio',
          'Agosto',
          'Settembre',
          'Ottobre',
          'Novembre',
          'Dicembre',
        ],
        monthNamesShort: [
          'Gen',
          'Feb',
          'Mar',
          'Apr',
          'Mag',
          'Giu',
          'Lug',
          'Ago',
          'Set',
          'Ott',
          'Nov',
          'Dic',
        ],
        dayNames: [
          'Domenica',
          'Lunedì',
          'Martedì',
          'Mercoledì',
          'Giovedì',
          'Venerdì',
          'Sabato',
        ],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
        dayNamesMin: ['Do', 'Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa'],
        dateFormat: 'dd/mm/yy',
      },
    }),
  ],
};
