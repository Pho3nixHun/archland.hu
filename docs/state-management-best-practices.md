# State Management - Best Practices Guide

> **Constitutional Reference**: Section II. State Management
> **Version**: 1.0.0
> **Last Updated**: 2025-09-26
> **Sources**: NgRx official documentation, Angular team recommendations, community patterns

This document provides comprehensive best practices for the State Management section of the Archland.hu Constitution, covering NgRx SignalStore, Angular Signals vs RxJS usage patterns, and immutable state implementation.

## Table of Contents
1. [NgRx SignalStore Implementation](#ngrx-signalstore-implementation)
2. [Angular Signals vs RxJS Guidelines](#angular-signals-vs-rxjs-guidelines)
3. [Immutable State Patterns](#immutable-state-patterns)
4. [Architecture Patterns](#architecture-patterns)
5. [Code Examples](#code-examples)
6. [Performance Considerations](#performance-considerations)
7. [Migration Strategies](#migration-strategies)

---

## NgRx SignalStore Implementation

### 1. Core SignalStore Principles

#### 1.1 Constitutional Requirements
- **MUST** use NgRx SignalStore for state management
- **MUST** prefer Angular Signals over RxJS whenever possible
- **MUST** maintain immutable state patterns

#### 1.2 SignalStore Advantages (2025)
NgRx SignalStore represents a significant evolution in Angular state management, offering:
- **Reduced Boilerplate**: Eliminates much of the redux boilerplate through functional approach
- **Enhanced Performance**: Leverages Angular's signal-based reactivity for optimal performance
- **TypeScript-First**: Provides powerful type inference without explicit type definitions
- **Simplified API**: Built-in facade pattern with intuitive method signatures

### 2. Feature-Based Store Architecture

#### 2.1 Store Organization Pattern
**Constitutional Requirement**: Organize by feature areas, not code types.

```typescript
// features/portfolio/stores/portfolio.store.ts
import { signalStore, withState, withMethods, withComputed } from '@ngrx/signals';
import { inject } from '@angular/core';

interface IPortfolioState {
  readonly properties: ReadonlyArray<IProperty>;
  readonly selectedProperty: IProperty | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly filters: IPropertyFilters;
  readonly searchQuery: string;
  readonly pagination: IPagination;
}

export const PortfolioStore = signalStore(
  { providedIn: 'root' },
  withState<IPortfolioState>({
    properties: [],
    selectedProperty: null,
    isLoading: false,
    error: null,
    filters: {
      priceRange: { min: 0, max: 10000000 },
      location: null,
      propertyType: null,
      status: 'available'
    },
    searchQuery: '',
    pagination: {
      currentPage: 1,
      pageSize: 12,
      totalItems: 0,
      totalPages: 0
    }
  }),
  withMethods((store, portfolioService = inject(PortfolioService)) => ({
    // Load properties with optimistic loading state
    loadProperties: () => {
      patchState(store, { isLoading: true, error: null });

      portfolioService.getProperties(
        store.filters(),
        store.searchQuery(),
        store.pagination()
      ).subscribe({
        next: (response) => {
          patchState(store, {
            properties: response.properties,
            pagination: response.pagination,
            isLoading: false
          });
        },
        error: (error) => {
          patchState(store, {
            error: error.message,
            isLoading: false
          });
        }
      });
    },

    // Select property with optimistic update
    selectProperty: (property: IProperty) => {
      patchState(store, { selectedProperty: property });
    },

    // Update filters with automatic data refresh
    updateFilters: (filters: Partial<IPropertyFilters>) => {
      patchState(store, (state) => ({
        filters: { ...state.filters, ...filters },
        pagination: { ...state.pagination, currentPage: 1 }
      }));
      // Auto-refresh data when filters change
      store.loadProperties();
    },

    // Search with debouncing handled at component level
    updateSearchQuery: (query: string) => {
      patchState(store, {
        searchQuery: query,
        pagination: { ...store.pagination(), currentPage: 1 }
      });
    },

    // Pagination navigation
    navigateToPage: (page: number) => {
      patchState(store, (state) => ({
        pagination: { ...state.pagination, currentPage: page }
      }));
      store.loadProperties();
    },

    // Reset all filters and search
    resetFilters: () => {
      patchState(store, {
        filters: {
          priceRange: { min: 0, max: 10000000 },
          location: null,
          propertyType: null,
          status: 'available'
        },
        searchQuery: '',
        pagination: {
          ...store.pagination(),
          currentPage: 1
        }
      });
      store.loadProperties();
    }
  })),
  withComputed((store) => ({
    // Filtered and sorted properties
    displayProperties: computed(() => {
      const properties = store.properties();
      const query = store.searchQuery().toLowerCase();

      if (!query) return properties;

      return properties.filter(property =>
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query)
      );
    }),

    // Property statistics
    propertyStats: computed(() => {
      const properties = store.properties();
      return {
        total: properties.length,
        available: properties.filter(p => p.status === 'available').length,
        sold: properties.filter(p => p.status === 'sold').length,
        underContract: properties.filter(p => p.status === 'under-contract').length,
        averagePrice: properties.length > 0
          ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length
          : 0
      };
    }),

    // UI state helpers
    hasProperties: computed(() => store.properties().length > 0),
    hasSelectedProperty: computed(() => store.selectedProperty() !== null),
    isFilterActive: computed(() => {
      const filters = store.filters();
      return filters.location !== null ||
             filters.propertyType !== null ||
             filters.status !== 'available' ||
             filters.priceRange.min > 0 ||
             filters.priceRange.max < 10000000;
    }),
    hasNextPage: computed(() => {
      const pagination = store.pagination();
      return pagination.currentPage < pagination.totalPages;
    }),
    hasPreviousPage: computed(() => store.pagination().currentPage > 1)
  }))
);
```

### 3. Store and Service Separation Pattern

#### 3.1 Clear Responsibility Separation
**Best Practice**: Separate data operations (service) from reactive state (store).

```typescript
// features/portfolio/services/portfolio.service.ts
@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  // Pure data fetching - no state management
  getProperties(
    filters: IPropertyFilters,
    searchQuery: string,
    pagination: IPagination
  ): Observable<IPropertyResponse> {
    const params = this.buildHttpParams(filters, searchQuery, pagination);
    return this.http.get<IPropertyResponse>(`${this.config.apiUrl}/properties`, { params });
  }

  getPropertyById(id: string): Observable<IProperty> {
    return this.http.get<IProperty>(`${this.config.apiUrl}/properties/${id}`);
  }

  createProperty(property: ICreatePropertyRequest): Observable<IProperty> {
    return this.http.post<IProperty>(`${this.config.apiUrl}/properties`, property);
  }

  updateProperty(id: string, updates: IUpdatePropertyRequest): Observable<IProperty> {
    return this.http.patch<IProperty>(`${this.config.apiUrl}/properties/${id}`, updates);
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.apiUrl}/properties/${id}`);
  }

  private buildHttpParams(
    filters: IPropertyFilters,
    searchQuery: string,
    pagination: IPagination
  ): HttpParams {
    let params = new HttpParams()
      .set('page', pagination.currentPage.toString())
      .set('limit', pagination.pageSize.toString());

    if (searchQuery) {
      params = params.set('search', searchQuery);
    }

    if (filters.location) {
      params = params.set('location', filters.location);
    }

    if (filters.propertyType) {
      params = params.set('type', filters.propertyType);
    }

    if (filters.status !== 'available') {
      params = params.set('status', filters.status);
    }

    if (filters.priceRange.min > 0) {
      params = params.set('minPrice', filters.priceRange.min.toString());
    }

    if (filters.priceRange.max < 10000000) {
      params = params.set('maxPrice', filters.priceRange.max.toString());
    }

    return params;
  }
}
```

### 4. Complex State Management Patterns

#### 4.1 Entity Management with Optimistic Updates
```typescript
// stores/user-management.store.ts
interface IUserManagementState {
  readonly users: ReadonlyArray<IUser>;
  readonly selectedUser: IUser | null;
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly error: string | null;
  readonly optimisticOperations: ReadonlyArray<IOptimisticOperation>;
}

export const UserManagementStore = signalStore(
  { providedIn: 'root' },
  withState<IUserManagementState>({
    users: [],
    selectedUser: null,
    isLoading: false,
    isSaving: false,
    error: null,
    optimisticOperations: []
  }),
  withMethods((store, userService = inject(UserService)) => ({
    // Optimistic user status update
    changeUserStatus: (userId: string, newStatus: UserStatus) => {
      const currentUser = store.users().find(u => u.id === userId);
      if (!currentUser) return;

      const previousStatus = currentUser.status;
      const operationId = crypto.randomUUID();

      // Optimistically update UI
      patchState(store, (state) => ({
        users: state.users.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        ),
        optimisticOperations: [...state.optimisticOperations, {
          id: operationId,
          type: 'user-status-change',
          entityId: userId,
          originalData: { status: previousStatus }
        }]
      }));

      // Perform backend operation
      userService.updateUserStatus(userId, newStatus).subscribe({
        next: (updatedUser) => {
          // Remove optimistic operation on success
          patchState(store, (state) => ({
            users: state.users.map(user =>
              user.id === userId ? updatedUser : user
            ),
            optimisticOperations: state.optimisticOperations.filter(
              op => op.id !== operationId
            )
          }));
        },
        error: (error) => {
          // Revert optimistic update on error
          patchState(store, (state) => ({
            users: state.users.map(user =>
              user.id === userId ? { ...user, status: previousStatus } : user
            ),
            optimisticOperations: state.optimisticOperations.filter(
              op => op.id !== operationId
            ),
            error: error.message
          }));
        }
      });
    }
  }))
);
```

---

## Angular Signals vs RxJS Guidelines

### 1. Decision Framework (2025 Recommendations)

#### 1.1 Use Angular Signals For:
**Official Angular Team Recommendation**: Use Signals for state and data storage.

```typescript
// ✅ PREFERRED: Signals for state management
export class UserProfile {
  // Signal-based state
  private readonly user = signal<IUser | null>(null);
  private readonly isEditing = signal(false);
  private readonly formData = signal<IUserFormData | null>(null);

  // Computed values (reactive)
  readonly displayName = computed(() => {
    const currentUser = this.user();
    return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Unknown User';
  });

  readonly canSave = computed(() => {
    const form = this.formData();
    const editing = this.isEditing();
    return editing && form && this.isValidForm(form);
  });

  readonly userSummary = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return null;

    return {
      name: this.displayName(),
      email: currentUser.email,
      memberSince: currentUser.createdAt,
      isActive: currentUser.status === 'active'
    };
  });

  // State mutations
  updateUser(user: IUser): void {
    this.user.set(user);
  }

  startEditing(): void {
    this.isEditing.set(true);
    this.formData.set(this.createFormData(this.user()));
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.formData.set(null);
  }

  private isValidForm(form: IUserFormData): boolean {
    return form.firstName.length > 0 &&
           form.lastName.length > 0 &&
           this.isValidEmail(form.email);
  }
}
```

#### 1.2 Use RxJS For:
**Official Angular Team Recommendation**: Leave RxJS to handle events and complex logic.

```typescript
// ✅ REQUIRED: RxJS for complex event handling and async operations
export class PropertySearch {
  private readonly searchService = inject(PropertySearchService);
  private readonly destroyRef = inject(DestroyRef);

  // Signal for current state
  private readonly searchResults = signal<IProperty[]>([]);
  private readonly isSearching = signal(false);

  // RxJS for complex search logic
  private readonly searchQuery$ = new BehaviorSubject<string>('');
  private readonly filters$ = new BehaviorSubject<ISearchFilters>({});

  constructor() {
    // Complex stream processing with RxJS
    const searchStream$ = combineLatest([
      this.searchQuery$.pipe(distinctUntilChanged()),
      this.filters$.pipe(distinctUntilChanged())
    ]).pipe(
      debounceTime(300),
      filter(([query, filters]) => query.length >= 2 || this.hasActiveFilters(filters)),
      tap(() => this.isSearching.set(true)),
      switchMap(([query, filters]) =>
        this.searchService.searchProperties(query, filters).pipe(
          catchError(error => {
            console.error('Search failed:', error);
            return of([]);
          })
        )
      ),
      tap(() => this.isSearching.set(false)),
      takeUntilDestroyed(this.destroyRef)
    );

    // Update signal from RxJS stream
    searchStream$.subscribe(results => {
      this.searchResults.set(results);
    });
  }

  // Public signal access
  readonly results = this.searchResults.asReadonly();
  readonly isLoading = this.isSearching.asReadonly();

  // Methods to trigger RxJS streams
  updateSearchQuery(query: string): void {
    this.searchQuery$.next(query);
  }

  updateFilters(filters: ISearchFilters): void {
    this.filters$.next(filters);
  }

  private hasActiveFilters(filters: ISearchFilters): boolean {
    return Object.values(filters).some(value =>
      value !== null && value !== undefined && value !== ''
    );
  }
}
```

### 2. Interoperability Patterns

#### 2.1 Converting Observables to Signals
**Best Practice**: Always convert Observables to Signals before template usage.

```typescript
export class DataLoader {
  private readonly dataService = inject(DataService);

  // ✅ PREFERRED: Convert Observable to Signal
  readonly userData = toSignal(
    this.dataService.getUserData().pipe(
      retry(3),
      catchError(() => of(null))
    ),
    { initialValue: null }
  );

  // ✅ For HTTP requests
  readonly properties = toSignal(
    this.dataService.getProperties(),
    { initialValue: [] }
  );

  // ✅ Complex stream converted to signal
  readonly searchResults = toSignal(
    this.searchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchService.search(query)),
      startWith([])
    )
  );
}
```

```html
<!-- ✅ PREFERRED: Signal in template -->
<div class="user-profile">
  @if (userData(); as user) {
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  } @else {
    <p>Loading user data...</p>
  }
</div>

<!-- ❌ DISCOURAGED: async pipe -->
<div class="user-profile">
  <div *ngIf="userData$ | async as user; else loading">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </div>
  <ng-template #loading>
    <p>Loading user data...</p>
  </ng-template>
</div>
```

#### 2.2 Signal to Observable Conversion
```typescript
// When you need to convert signals back to observables
export class NotificationService {
  private readonly userStore = inject(UserStore);

  // Convert signal to observable for RxJS operators
  readonly userNotifications$ = toObservable(this.userStore.currentUser).pipe(
    filter(user => user !== null),
    switchMap(user => this.getNotificationsForUser(user!.id)),
    shareReplay(1)
  );

  private getNotificationsForUser(userId: string): Observable<INotification[]> {
    return this.http.get<INotification[]>(`/api/users/${userId}/notifications`);
  }
}
```

### 3. Template Integration Best Practices

#### 3.1 Signal-First Template Design
```html
<!-- ✅ EXCELLENT: Pure signal-based reactive template -->
<div class="portfolio-dashboard">
  <!-- Loading state -->
  @if (portfolioStore.isLoading()) {
    <div class="loading-spinner">
      <app-spinner />
      <p>Loading properties...</p>
    </div>
  }

  <!-- Error state -->
  @if (portfolioStore.error(); as error) {
    <div class="error-banner">
      <app-error-alert [message]="error" />
      <button (click)="portfolioStore.loadProperties()">Retry</button>
    </div>
  }

  <!-- Main content -->
  @if (portfolioStore.hasProperties()) {
    <!-- Statistics -->
    <div class="stats-overview">
      @let stats = portfolioStore.propertyStats();
      <div class="stat-card">
        <span class="stat-label">Total Properties</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Available</span>
        <span class="stat-value">{{ stats.available }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Average Price</span>
        <span class="stat-value">{{ stats.averagePrice | currency }}</span>
      </div>
    </div>

    <!-- Property grid -->
    <div class="property-grid">
      @for (property of portfolioStore.displayProperties(); track property.id) {
        <app-property-card
          [property]="property"
          [isSelected]="portfolioStore.selectedProperty()?.id === property.id"
          (propertyClick)="portfolioStore.selectProperty($event)"
        />
      }
    </div>

    <!-- Pagination -->
    <app-pagination
      [currentPage]="portfolioStore.pagination().currentPage"
      [totalPages]="portfolioStore.pagination().totalPages"
      [hasNext]="portfolioStore.hasNextPage()"
      [hasPrevious]="portfolioStore.hasPreviousPage()"
      (pageChange)="portfolioStore.navigateToPage($event)"
    />
  } @else {
    <div class="empty-state">
      <p>No properties found</p>
      @if (portfolioStore.isFilterActive()) {
        <button (click)="portfolioStore.resetFilters()">Clear Filters</button>
      }
    </div>
  }
</div>
```

---

## Immutable State Patterns

### 1. TypeScript Immutability Enforcement

#### 1.1 Constitutional Requirement: Readonly State Definitions
```typescript
// ✅ REQUIRED: All state interfaces must be readonly
interface IPortfolioState {
  readonly properties: ReadonlyArray<IProperty>;
  readonly selectedProperty: IProperty | null;
  readonly filters: IPropertyFilters;
  readonly pagination: IPagination;
}

interface IProperty {
  readonly id: string;
  readonly title: string;
  readonly price: number;
  readonly location: string;
  readonly images: ReadonlyArray<IPropertyImage>;
  readonly features: ReadonlyArray<string>;
  readonly metadata: Readonly<IPropertyMetadata>;
}

// Deep readonly utility type
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Apply deep immutability
interface IApplicationState extends DeepReadonly<{
  user: IUserState;
  portfolio: IPortfolioState;
  ui: IUIState;
}> {}
```

#### 1.2 Immer Integration for Complex Updates
```typescript
// Install: npm install immer
import { produce } from 'immer';

// ✅ REQUIRED: Use Immer for complex nested state updates
export const UserManagementStore = signalStore(
  withState<DeepReadonly<IUserManagementState>>({
    users: [],
    departments: {},
    permissions: {}
  }),
  withMethods((store) => ({
    // Complex nested update with Immer
    updateUserDepartment: (userId: string, departmentId: string, role: string) => {
      patchState(store, (state) =>
        produce(state, (draft) => {
          // Safe mutable updates on draft
          const user = draft.users.find(u => u.id === userId);
          if (user) {
            user.departmentId = departmentId;
            user.role = role;
            user.updatedAt = new Date().toISOString();
          }

          // Update department membership
          if (!draft.departments[departmentId]) {
            draft.departments[departmentId] = {
              id: departmentId,
              members: [],
              createdAt: new Date().toISOString()
            };
          }

          const department = draft.departments[departmentId];
          const existingMemberIndex = department.members.findIndex(m => m.userId === userId);

          if (existingMemberIndex >= 0) {
            department.members[existingMemberIndex].role = role;
          } else {
            department.members.push({ userId, role, joinedAt: new Date().toISOString() });
          }
        })
      );
    },

    // Array operations with Immer
    addPropertyToFavorites: (userId: string, propertyId: string) => {
      patchState(store, (state) =>
        produce(state, (draft) => {
          const user = draft.users.find(u => u.id === userId);
          if (user && !user.favoriteProperties.includes(propertyId)) {
            user.favoriteProperties.push(propertyId);
            user.updatedAt = new Date().toISOString();
          }
        })
      );
    },

    // Remove from nested arrays
    removePropertyFromFavorites: (userId: string, propertyId: string) => {
      patchState(store, (state) =>
        produce(state, (draft) => {
          const user = draft.users.find(u => u.id === userId);
          if (user) {
            const index = user.favoriteProperties.indexOf(propertyId);
            if (index >= 0) {
              user.favoriteProperties.splice(index, 1);
              user.updatedAt = new Date().toISOString();
            }
          }
        })
      );
    }
  }))
);
```

### 2. Manual Immutable Update Patterns

#### 2.1 Simple State Updates Without Immer
```typescript
// ✅ ACCEPTABLE: Simple updates without Immer
withMethods((store) => ({
  // Simple property update
  updateUserName: (userId: string, name: string) => {
    patchState(store, (state) => ({
      users: state.users.map(user =>
        user.id === userId ? { ...user, name, updatedAt: new Date() } : user
      )
    }));
  },

  // Array additions
  addUser: (newUser: IUser) => {
    patchState(store, (state) => ({
      users: [...state.users, newUser]
    }));
  },

  // Array removals
  removeUser: (userId: string) => {
    patchState(store, (state) => ({
      users: state.users.filter(user => user.id !== userId)
    }));
  },

  // Nested object updates
  updateUserPreferences: (userId: string, preferences: Partial<IUserPreferences>) => {
    patchState(store, (state) => ({
      users: state.users.map(user =>
        user.id === userId
          ? {
              ...user,
              preferences: {
                ...user.preferences,
                ...preferences
              },
              updatedAt: new Date()
            }
          : user
      )
    }));
  }
}))
```

### 3. Immutability Validation and Testing

#### 3.1 Runtime Immutability Checks
```typescript
// Development-only immutability validation
const validateImmutability = <T>(state: T, actionName: string): T => {
  if (process.env['NODE_ENV'] === 'development') {
    // Deep freeze in development to catch mutations
    return deepFreeze(state);
  }
  return state;
};

const deepFreeze = <T>(obj: T): T => {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as any)[prop];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });
  return obj;
};

// Apply in store
export const SafePortfolioStore = signalStore(
  withState<IPortfolioState>({...}),
  withMethods((store) => ({
    updateProperties: (properties: ReadonlyArray<IProperty>) => {
      const newState = { properties };
      patchState(store, validateImmutability(newState, 'updateProperties'));
    }
  }))
);
```

#### 3.2 Testing Immutability
```typescript
describe('PortfolioStore Immutability', () => {
  let store: InstanceType<typeof PortfolioStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PortfolioStore]
    });
    store = TestBed.inject(PortfolioStore);
  });

  it('should not mutate original state when updating properties', () => {
    const initialProperties = store.properties();
    const newProperty: IProperty = createMockProperty();

    // Perform update
    store.addProperty(newProperty);

    // Verify original array is not mutated
    expect(store.properties()).not.toBe(initialProperties);
    expect(initialProperties).not.toContain(newProperty);
    expect(store.properties()).toContain(newProperty);
  });

  it('should maintain deep immutability for nested objects', () => {
    const property = createMockProperty();
    store.addProperty(property);

    const originalProperty = store.properties()[0];
    const updatedMetadata = { ...originalProperty.metadata, views: 100 };

    store.updatePropertyMetadata(property.id, updatedMetadata);

    const updatedProperty = store.properties().find(p => p.id === property.id)!;

    // Verify deep immutability
    expect(updatedProperty.metadata).not.toBe(originalProperty.metadata);
    expect(originalProperty.metadata.views).not.toBe(100);
    expect(updatedProperty.metadata.views).toBe(100);
  });
});
```

---

## Architecture Patterns

### 1. Store Hierarchy and Organization

#### 1.1 Global vs Feature Stores
```typescript
// Global application store
export const AppStore = signalStore(
  { providedIn: 'root' },
  withState<IAppState>({
    user: null,
    theme: 'light',
    language: 'en',
    isOnline: true,
    notifications: []
  }),
  withMethods((store) => ({
    setUser: (user: IUser) => patchState(store, { user }),
    setTheme: (theme: Theme) => patchState(store, { theme }),
    setLanguage: (language: string) => patchState(store, { language })
  }))
);

// Feature-specific stores
export const PortfolioStore = signalStore({ providedIn: 'root' }, ...);
export const AdminStore = signalStore({ providedIn: 'root' }, ...);
export const PageEditorStore = signalStore({ providedIn: 'root' }, ...);
```

#### 1.2 Store Communication Patterns
```typescript
// Cross-store communication through services
@Injectable({ providedIn: 'root' })
export class StoreOrchestrator {
  private readonly appStore = inject(AppStore);
  private readonly portfolioStore = inject(PortfolioStore);
  private readonly notificationStore = inject(NotificationStore);

  // Coordinate actions across multiple stores
  userLoggedIn(user: IUser): void {
    this.appStore.setUser(user);
    this.portfolioStore.loadUserPortfolio(user.id);
    this.notificationStore.loadUserNotifications(user.id);
  }

  userLoggedOut(): void {
    this.appStore.clearUser();
    this.portfolioStore.clearPortfolio();
    this.notificationStore.clearNotifications();
  }
}
```

### 2. Performance Optimization Patterns

#### 2.1 Selective Updates and Memoization
```typescript
export const OptimizedPortfolioStore = signalStore(
  withState<IPortfolioState>({...}),
  withComputed((store) => ({
    // Memoized expensive computations
    expensiveCalculation: computed(() => {
      const properties = store.properties();
      // Only recalculates when properties actually change
      return properties.reduce((analysis, property) => {
        return {
          ...analysis,
          totalValue: analysis.totalValue + property.price,
          averagePrice: (analysis.totalValue + property.price) / (analysis.count + 1),
          count: analysis.count + 1
        };
      }, { totalValue: 0, averagePrice: 0, count: 0 });
    }),

    // Filtered views for different components
    availableProperties: computed(() =>
      store.properties().filter(p => p.status === 'available')
    ),

    soldProperties: computed(() =>
      store.properties().filter(p => p.status === 'sold')
    )
  }))
);
```

#### 2.2 Lazy Loading and Code Splitting
```typescript
// Lazy-loaded feature store
const AdminStore = signalStore(
  withState<IAdminState>({...}),
  // Heavy admin functionality only loaded when needed
);

// Dynamic store loading
export const loadAdminStore = () =>
  import('./admin/stores/admin.store').then(m => m.AdminStore);
```

---

## Performance Considerations

### 1. Change Detection Optimization

#### 1.1 SignalStore vs Traditional NgRx Performance
- **Memory Usage**: 40-60% reduction compared to classic NgRx
- **Bundle Size**: Smaller footprint due to eliminated action/reducer boilerplate
- **Runtime Performance**: Signals provide more efficient reactivity than RxJS subscriptions
- **Developer Experience**: Faster development cycles with less boilerplate

#### 1.2 Signal vs Observable Performance Comparison
```typescript
// Performance benchmarks (approximate)
// Signal updates: ~0.1ms per update
// Observable updates: ~0.3ms per update
// Template renders: 2-3x faster with signals vs async pipe

// ✅ OPTIMIZED: Signal-based performance
export class PerformantComponent {
  private readonly store = inject(PortfolioStore);

  // Fast signal access
  readonly properties = this.store.properties;
  readonly isLoading = this.store.isLoading;

  // Efficient computed values
  readonly displayProperties = computed(() => {
    const props = this.properties();
    const query = this.searchQuery();
    // Only executes when dependencies change
    return this.filterAndSortProperties(props, query);
  });
}
```

### 2. Memory Management

#### 2.1 Automatic Cleanup with Signals
```typescript
// ✅ Signals automatically manage subscriptions
export class AutoCleanupComponent {
  private readonly portfolioStore = inject(PortfolioStore);

  // No manual subscription management needed
  readonly properties = this.portfolioStore.properties;
  readonly isLoading = this.portfolioStore.isLoading;

  // Effects automatically cleanup on component destroy
  private readonly autoSaveEffect = effect(() => {
    const selectedProperty = this.portfolioStore.selectedProperty();
    if (selectedProperty?.isDirty) {
      this.saveProperty(selectedProperty);
    }
  });
}

// ❌ Traditional observable cleanup required
export class ManualCleanupComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.portfolioService.properties$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(/* ... */);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Migration Strategies

### 1. From Classic NgRx to SignalStore

#### 1.1 Step-by-Step Migration Process
```typescript
// Phase 1: Create SignalStore alongside existing store
export const LegacyUserStore = createFeature({
  name: 'user',
  reducer: userReducer,
  extraSelectors: ({ selectUserState }) => ({
    selectCurrentUser: createSelector(selectUserState, state => state.currentUser)
  })
});

export const NewUserStore = signalStore(
  { providedIn: 'root' },
  withState<IUserState>({
    currentUser: null,
    isLoading: false
  }),
  // Migrate methods gradually
  withMethods((store) => ({
    setCurrentUser: (user: IUser) => patchState(store, { currentUser: user })
  }))
);

// Phase 2: Create facade service for smooth transition
@Injectable({ providedIn: 'root' })
export class UserStoreFacade {
  private readonly store = inject(Store);
  private readonly signalStore = inject(NewUserStore);
  private readonly useSignalStore = signal(false); // Feature flag

  readonly currentUser = computed(() =>
    this.useSignalStore()
      ? this.signalStore.currentUser()
      : toSignal(this.store.select(LegacyUserStore.selectCurrentUser))()
  );

  setCurrentUser(user: IUser): void {
    if (this.useSignalStore()) {
      this.signalStore.setCurrentUser(user);
    } else {
      this.store.dispatch(UserActions.setCurrentUser({ user }));
    }
  }

  enableSignalStore(): void {
    this.useSignalStore.set(true);
  }
}
```

### 2. From Service-Based State to SignalStore

#### 2.1 Service to Store Migration
```typescript
// Before: Service-based state management
@Injectable({ providedIn: 'root' })
export class OldPortfolioService {
  private readonly properties$ = new BehaviorSubject<IProperty[]>([]);
  private readonly isLoading$ = new BehaviorSubject<boolean>(false);

  getProperties(): Observable<IProperty[]> {
    return this.properties$.asObservable();
  }

  loadProperties(): void {
    this.isLoading$.next(true);
    // ... async operation
  }
}

// After: SignalStore-based state management
export const PortfolioStore = signalStore(
  { providedIn: 'root' },
  withState<IPortfolioState>({
    properties: [],
    isLoading: false
  }),
  withMethods((store, service = inject(PortfolioService)) => ({
    loadProperties: () => {
      patchState(store, { isLoading: true });
      service.fetchProperties().subscribe({
        next: (properties) => patchState(store, { properties, isLoading: false }),
        error: () => patchState(store, { isLoading: false })
      });
    }
  }))
);

// Migration component
export class MigratedComponent {
  // Replace service injection with store
  private readonly portfolioStore = inject(PortfolioStore);

  // Change from observable to signal
  readonly properties = this.portfolioStore.properties;
  readonly isLoading = this.portfolioStore.isLoading;

  ngOnInit(): void {
    // Same method call, different implementation
    this.portfolioStore.loadProperties();
  }
}
```

---

## Conclusion

This State Management documentation establishes the foundation for robust, performant, and maintainable state management in the Archland.hu Angular application. The key principles ensure:

- **Modern Architecture**: Leverage NgRx SignalStore for optimal performance and developer experience
- **Clear Boundaries**: Use Signals for state, RxJS for complex events and async operations
- **Type Safety**: Enforce immutability through TypeScript and runtime validation
- **Performance**: Optimize change detection and memory usage through signal-based reactivity
- **Maintainability**: Follow established patterns for scalable, testable state management

**Implementation Priority**:
1. Implement NgRx SignalStore for new features
2. Migrate existing state management incrementally
3. Establish immutable state patterns from the beginning
4. Use hybrid Signal/RxJS approach based on use case complexity

---

**Document Information**
- **Authority**: Archland.hu Constitution Section II
- **Review Cycle**: Quarterly (aligned with Angular and NgRx releases)
- **Stakeholders**: Frontend developers, state management architects, performance engineers
- **Related Documents**: [Framework Standards Best Practices], [Component Communication Standards], [Type Safety Guidelines]