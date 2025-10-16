import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideZoneChangeDetection,
    isDevMode,
} from '@angular/core';
import {
    provideRouter,
    withInMemoryScrolling,
    withViewTransitions,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
    provideTransloco,
    TranslocoLoader,
    Translation,
} from '@jsverse/transloco';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(
            routes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled',
            }),
            withViewTransitions()
        ),
        provideHttpClient(),
        provideTransloco({
            config: {
                availableLangs: ['hu', 'en'],
                defaultLang: 'hu',
                reRenderOnLangChange: true,
                fallbackLang: 'hu',
                prodMode: !isDevMode(),
            },
            loader: class TranslocoHttpLoader implements TranslocoLoader {
                getTranslation(lang: string) {
                    return import(`../assets/i18n/${lang}.json`).then(
                        module => module.default as Translation
                    );
                }
            },
        }),
    ],
};
