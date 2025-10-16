import { computed, inject } from '@angular/core';
import {
    signalStore,
    withState,
    withMethods,
    withComputed,
    patchState,
} from '@ngrx/signals';
import { withEffects } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { EMPTY } from 'rxjs';
import {
    catchError,
    filter,
    finalize,
    switchMap,
    take,
    tap,
} from 'rxjs/operators';

export interface ITranslocoState {
    readonly currentLanguage: string;
    readonly availableLanguages: readonly string[];
    readonly isLoading: boolean;
}

export interface ILanguageItem {
    readonly id: string;
    readonly isActive: boolean;
}

const createInitialState = (): ITranslocoState => {
    const translocoService = inject(TranslocoService);

    const availableLangs = translocoService
        .getAvailableLangs()
        .map(lang => (typeof lang === 'string' ? lang : lang.id));

    const currentLang = translocoService.getActiveLang();

    return {
        currentLanguage: currentLang,
        availableLanguages: availableLangs,
        isLoading: false,
    };
};

export const TranslocoStore = signalStore(
    { providedIn: 'root' },
    withState(createInitialState),
    withEffects(store => {
        const translocoService = inject(TranslocoService);

        return {
            // Reactive language change tracking
            languageChangeEffect$: translocoService.langChanges$.pipe(
                tap(newLang => {
                    patchState(store, {
                        currentLanguage: newLang,
                        isLoading: false,
                    });
                })
            ),
        };
    }),
    withMethods(store => {
        const translocoService = inject(TranslocoService);

        const setLanguageCommand = rxMethod<string>(language$ =>
            language$.pipe(
                filter(language => language !== store.currentLanguage()),
                tap(() => patchState(store, { isLoading: true })),
                switchMap(language =>
                    translocoService.load(language).pipe(
                        take(1),
                        tap(() => translocoService.setActiveLang(language)),
                        catchError(error => {
                            if (!translocoService.config.prodMode) {
                                console.error(
                                    `Failed to load language "${language}"`,
                                    error
                                );
                            }
                            return EMPTY;
                        }),
                        finalize(() => patchState(store, { isLoading: false }))
                    )
                )
            )
        );

        return {
            setLanguage: (language: string) => {
                setLanguageCommand(language);
            },
            setAvailableLanguages: (languages: readonly string[]) => {
                patchState(store, { availableLanguages: languages });
            },
        };
    }),
    withComputed(store => ({
        languageItems: computed((): readonly ILanguageItem[] => {
            const currentLang = store.currentLanguage();
            return store.availableLanguages().map(lang => ({
                id: lang,
                isActive: lang === currentLang,
            }));
        }),
        hasMultipleLanguages: computed(
            () => store.availableLanguages().length > 1
        ),
    }))
);
