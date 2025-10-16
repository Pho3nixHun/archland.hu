import { inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { signalStore, withState, withHooks, patchState } from '@ngrx/signals';
import { withEffects } from '@ngrx/signals/events';
import { filter, tap } from 'rxjs/operators';

const toReadonlyRecord = (
    value: unknown
): Readonly<Record<string, unknown>> | null => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return null;
    }

    const entries = Object.entries(value).reduce<Record<string, unknown>>(
        (accumulator, [key, entryValue]) => {
            accumulator[key] = entryValue;
            return accumulator;
        },
        {}
    );

    return Object.freeze(entries);
};

const extractFragment = (url: string): string | null => {
    const hashIndex = url.indexOf('#');
    if (hashIndex === -1) {
        return null;
    }

    const fragment = url.slice(hashIndex + 1);
    return fragment.length > 0 ? fragment : null;
};

const extractSnapshotData = (
    router: Router
): {
    readonly data: Readonly<Record<string, unknown>> | null;
    readonly params: Readonly<Record<string, unknown>> | null;
    readonly queryParams: Readonly<Record<string, unknown>> | null;
} => {
    const snapshot = router.routerState.root.firstChild?.snapshot ?? null;

    return {
        data: toReadonlyRecord(snapshot?.data ?? null),
        params: toReadonlyRecord(snapshot?.params ?? null),
        queryParams: toReadonlyRecord(snapshot?.queryParams ?? null),
    };
};

export interface IRouterState {
    readonly currentUrl: string;
    readonly fragment: string | null;
    readonly data: Readonly<Record<string, unknown>> | null;
    readonly params: Readonly<Record<string, unknown>> | null;
    readonly queryParams: Readonly<Record<string, unknown>> | null;
}

const initialState: IRouterState = {
    currentUrl: '/',
    fragment: null,
    data: null,
    params: null,
    queryParams: null,
};

export const RouterStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withEffects(store => {
        const router = inject(Router);

        return {
            // Reactive router state tracking
            routerEffect$: router.events.pipe(
                filter(
                    (event): event is NavigationEnd =>
                        event instanceof NavigationEnd
                ),
                tap(event => {
                    const snapshotData = extractSnapshotData(router);
                    patchState(store, {
                        currentUrl: event.urlAfterRedirects,
                        fragment: extractFragment(event.urlAfterRedirects),
                        data: snapshotData.data,
                        params: snapshotData.params,
                        queryParams: snapshotData.queryParams,
                    });
                })
            ),
        };
    }),
    withHooks(store => {
        const router = inject(Router);
        return {
            onInit: () => {
                // Initialize current URL on store creation
                const snapshotData = extractSnapshotData(router);
                patchState(store, {
                    currentUrl: router.url,
                    fragment: extractFragment(router.url),
                    data: snapshotData.data,
                    params: snapshotData.params,
                    queryParams: snapshotData.queryParams,
                });
            },
        };
    })
);
