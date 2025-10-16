# Coding Principles - Best Practices Guide

> **Constitutional Reference**: Section IV. Coding Principles
> **Version**: 1.0.0
> **Last Updated**: 2025-09-26
> **Sources**: Angular.dev official documentation, TypeScript team recommendations, SOLID principles literature

This document provides comprehensive best practices for the Coding Principles section of the Archland.hu Constitution, covering functional programming, arrow function usage, single responsibility principle, and SOLID/DRY principles.

## Table of Contents
1. [Functional and Declarative Programming](#functional-and-declarative-programming)
2. [Arrow Function Requirements](#arrow-function-requirements)
3. [Single Responsibility Principle](#single-responsibility-principle)
4. [SOLID Principles Implementation](#solid-principles-implementation)
5. [DRY Principle Application](#dry-principle-application)
6. [Code Organization Patterns](#code-organization-patterns)
7. [Testing and Quality Assurance](#testing-and-quality-assurance)
8. [Performance Considerations](#performance-considerations)

---

## Functional and Declarative Programming

### 1. Constitutional Requirements

#### 1.1 Fundamental Principles
- **MUST** follow functional and declarative programming principles
- **MUST** define functions as arrow functions: `const someFunction = () => { ... }`
- **NEVER** use function declarations: `function someFunction() { ... }`
- **MUST** ensure functions are concise and have single responsibility
- **MUST** respect SOLID and DRY principles

#### 1.2 Functional Programming in Angular (2025)
Modern Angular increasingly embraces functional paradigms through:
- **Signal-based reactivity**: Declarative state management
- **inject() function**: Functional dependency injection
- **Resource API**: Declarative data fetching with automatic state handling
- **Computed values**: Pure functional transformations

### 2. Declarative Programming Patterns

#### 2.1 Template Declarative Approach
```typescript
// ✅ REQUIRED: Declarative component design
export class PropertyList {
  properties = input.required<ReadonlyArray<IProperty>>();
  searchQuery = input<string>('');

  // ✅ Declarative computed values
  readonly filteredProperties = computed(() => {
    const props = this.properties();
    const query = this.searchQuery().toLowerCase();

    return query
      ? props.filter(prop =>
          prop.title.toLowerCase().includes(query) ||
          prop.location.toLowerCase().includes(query)
        )
      : props;
  });

  readonly hasProperties = computed(() => this.filteredProperties().length > 0);

  readonly propertyStats = computed(() => ({
    total: this.filteredProperties().length,
    averagePrice: this.calculateAveragePrice(this.filteredProperties()),
    maxPrice: Math.max(...this.filteredProperties().map(p => p.price))
  }));

  // ✅ Pure function for calculations
  private readonly calculateAveragePrice = (properties: ReadonlyArray<IProperty>): number => {
    return properties.length > 0
      ? properties.reduce((sum, prop) => sum + prop.price, 0) / properties.length
      : 0;
  };
}
```

```html
<!-- ✅ REQUIRED: Declarative template -->
<div class="property-list">
  @if (hasProperties()) {
    <!-- Property statistics -->
    <div class="property-stats">
      <span>Total: {{ propertyStats().total }}</span>
      <span>Average: {{ propertyStats().averagePrice | currency }}</span>
      <span>Max: {{ propertyStats().maxPrice | currency }}</span>
    </div>

    <!-- Property grid -->
    @for (property of filteredProperties(); track property.id) {
      <app-property-card [property]="property" />
    }
  } @else {
    <div class="empty-state">No properties found</div>
  }
</div>
```

#### 2.2 Service Functional Design
```typescript
// ✅ REQUIRED: Functional service design
@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  // ✅ Pure functions for data transformation
  readonly getProperties = (filters: IPropertyFilters): Observable<IProperty[]> =>
    this.http.get<IPropertyResponse>(`${this.config.apiUrl}/properties`, {
      params: this.buildQueryParams(filters)
    }).pipe(
      map(response => response.properties),
      map(properties => properties.map(this.normalizeProperty)),
      catchError(this.handleError('getProperties'))
    );

  readonly searchProperties = (query: string): Observable<IProperty[]> =>
    this.http.get<IPropertyResponse>(`${this.config.apiUrl}/properties/search`, {
      params: { q: query }
    }).pipe(
      map(response => response.properties),
      map(properties => properties.map(this.normalizeProperty)),
      debounceTime(300),
      distinctUntilChanged(),
      catchError(this.handleError('searchProperties'))
    );

  // ✅ Pure transformation functions
  private readonly normalizeProperty = (property: IRawProperty): IProperty => ({
    id: property.id,
    title: property.title.trim(),
    price: Math.max(0, property.price),
    location: property.location.trim(),
    images: property.images.filter(img => img.url && img.url.length > 0),
    features: property.features.map(feature => feature.toLowerCase()),
    createdAt: new Date(property.createdAt),
    updatedAt: new Date(property.updatedAt)
  });

  private readonly buildQueryParams = (filters: IPropertyFilters): HttpParams => {
    const params = new HttpParams();

    return Object.entries(filters).reduce((acc, [key, value]) => {
      return value !== null && value !== undefined
        ? acc.set(key, String(value))
        : acc;
    }, params);
  };

  private readonly handleError = <T>(operation: string) =>
    (error: unknown): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(`${operation} failed`));
    };
}
```

### 3. Functional Composition Patterns

#### 3.1 Higher-Order Functions
```typescript
// ✅ REQUIRED: Functional composition utilities
export const compose = <T>(...functions: Array<(arg: T) => T>) =>
  (value: T): T => functions.reduceRight((acc, fn) => fn(acc), value);

export const pipe = <T>(...functions: Array<(arg: T) => T>) =>
  (value: T): T => functions.reduce((acc, fn) => fn(acc), value);

// Property transformation pipeline
export class PropertyTransformService {
  // ✅ Functional transformation pipeline
  readonly transformProperty = pipe(
    this.validatePropertyData,
    this.normalizePropertyText,
    this.calculatePropertyMetrics,
    this.enrichPropertyData
  );

  private readonly validatePropertyData = (property: IRawProperty): IRawProperty => {
    if (!property.id || !property.title) {
      throw new Error('Invalid property data: missing required fields');
    }
    return property;
  };

  private readonly normalizePropertyText = (property: IRawProperty): IRawProperty => ({
    ...property,
    title: property.title.trim(),
    location: property.location.trim(),
    description: property.description?.trim() || ''
  });

  private readonly calculatePropertyMetrics = (property: IRawProperty): IRawProperty => ({
    ...property,
    pricePerSqFt: property.area > 0 ? property.price / property.area : 0,
    isAffordable: property.price < 500000,
    marketSegment: property.price > 1000000 ? 'luxury' : property.price > 500000 ? 'premium' : 'standard'
  });

  private readonly enrichPropertyData = (property: IRawProperty): IProperty => ({
    id: property.id,
    title: property.title,
    price: property.price,
    location: property.location,
    description: property.description,
    area: property.area,
    pricePerSqFt: property.pricePerSqFt,
    isAffordable: property.isAffordable,
    marketSegment: property.marketSegment,
    images: property.images || [],
    features: property.features || [],
    createdAt: new Date(property.createdAt),
    updatedAt: new Date(property.updatedAt)
  });
}
```

#### 3.2 Array Functional Methods
```typescript
export class PropertyAnalyticsService {
  // ✅ REQUIRED: Use functional array methods instead of imperative loops
  readonly calculateMarketAnalytics = (properties: ReadonlyArray<IProperty>): IMarketAnalytics => {
    const priceAnalysis = properties
      .map(prop => prop.price)
      .filter(price => price > 0)
      .reduce((analysis, price, _, prices) => ({
        min: Math.min(analysis.min, price),
        max: Math.max(analysis.max, price),
        average: prices.reduce((sum, p) => sum + p, 0) / prices.length,
        median: this.calculateMedian(prices)
      }), { min: Infinity, max: 0, average: 0, median: 0 });

    const locationAnalysis = properties
      .reduce((acc, prop) => {
        acc[prop.location] = (acc[prop.location] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const featureAnalysis = properties
      .flatMap(prop => prop.features)
      .reduce((acc, feature) => {
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalProperties: properties.length,
      priceAnalysis,
      locationDistribution: locationAnalysis,
      popularFeatures: Object.entries(featureAnalysis)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([feature, count]) => ({ feature, count }))
    };
  };

  // ✅ Pure helper function
  private readonly calculateMedian = (numbers: number[]): number => {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };
}
```

---

## Arrow Function Requirements

### 1. Constitutional Mandate

#### 1.1 Function Definition Rules
```typescript
// ✅ REQUIRED: Arrow function definitions only
const calculatePropertyValue = (property: IProperty): number => {
  return property.price * property.area;
};

const validatePropertyData = (property: unknown): property is IProperty => {
  return typeof property === 'object' &&
         property !== null &&
         'id' in property &&
         'title' in property;
};

const processPropertyBatch = async (properties: IProperty[]): Promise<IProcessedProperty[]> => {
  return Promise.all(properties.map(async (property) => ({
    ...property,
    processed: true,
    processedAt: new Date()
  })));
};

// ❌ FORBIDDEN: Function declarations
function calculatePropertyValue(property: IProperty): number {
  return property.price * property.area;
}

function validatePropertyData(property: unknown): property is IProperty {
  return typeof property === 'object';
}
```

#### 1.2 Lexical This Binding Benefits
```typescript
export class PropertyEventHandler {
  private properties = signal<IProperty[]>([]);

  // ✅ REQUIRED: Arrow functions preserve lexical 'this'
  readonly handlePropertySearch = (query: string): void => {
    const filteredProperties = this.properties()
      .filter(prop => prop.title.toLowerCase().includes(query.toLowerCase()));

    this.properties.set(filteredProperties);
  };

  readonly handlePropertySort = (sortBy: keyof IProperty): void => {
    const sortedProperties = [...this.properties()].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal);
      }

      return Number(aVal) - Number(bVal);
    });

    this.properties.set(sortedProperties);
  };

  // ✅ Arrow functions in event callbacks
  readonly setupEventListeners = (): void => {
    document.addEventListener('property-search', (event: CustomEvent) => {
      // 'this' correctly refers to the class instance
      this.handlePropertySearch(event.detail.query);
    });

    document.addEventListener('property-sort', (event: CustomEvent) => {
      // 'this' binding is preserved
      this.handlePropertySort(event.detail.sortBy);
    });
  };
}
```

### 2. Advanced Arrow Function Patterns

#### 2.1 Curried Functions
```typescript
// ✅ REQUIRED: Functional currying with arrow functions
const createPropertyFilter = (filterType: keyof IProperty) =>
  (filterValue: string | number) =>
    (properties: IProperty[]): IProperty[] =>
      properties.filter(property => {
        const propValue = property[filterType];

        if (typeof propValue === 'string' && typeof filterValue === 'string') {
          return propValue.toLowerCase().includes(filterValue.toLowerCase());
        }

        return propValue === filterValue;
      });

// Usage examples
const filterByLocation = createPropertyFilter('location');
const filterByNewYork = filterByLocation('New York');
const newYorkProperties = filterByNewYork(allProperties);

const filterByPrice = createPropertyFilter('price');
const filterExpensive = filterByPrice(1000000);
const expensiveProperties = filterExpensive(allProperties);
```

#### 2.2 Function Composition
```typescript
// ✅ REQUIRED: Composable arrow functions
const validateRequired = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '';

const validateStringLength = (min: number, max: number) =>
  (value: string): boolean =>
    value.length >= min && value.length <= max;

const validateNumericRange = (min: number, max: number) =>
  (value: number): boolean =>
    value >= min && value <= max;

// Property validation composition
const validatePropertyTitle = (title: string): boolean =>
  validateRequired(title) && validateStringLength(3, 100)(title);

const validatePropertyPrice = (price: number): boolean =>
  validateRequired(price) && validateNumericRange(1, 100000000)(price);

const validateProperty = (property: IProperty): IValidationResult => {
  const errors: string[] = [];

  if (!validatePropertyTitle(property.title)) {
    errors.push('Invalid title: must be 3-100 characters');
  }

  if (!validatePropertyPrice(property.price)) {
    errors.push('Invalid price: must be between $1 and $100,000,000');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### 3. Performance Considerations

#### 3.1 Arrow Function Optimization
```typescript
export class OptimizedPropertyService {
  private readonly memoizedCalculations = new Map<string, number>();

  // ✅ Memoized arrow functions for expensive calculations
  readonly calculatePropertyROI = (property: IProperty): number => {
    const cacheKey = `roi-${property.id}-${property.price}`;

    if (this.memoizedCalculations.has(cacheKey)) {
      return this.memoizedCalculations.get(cacheKey)!;
    }

    const roi = this.performROICalculation(property);
    this.memoizedCalculations.set(cacheKey, roi);

    return roi;
  };

  private readonly performROICalculation = (property: IProperty): number => {
    // Complex ROI calculation logic
    const annualRent = property.price * 0.08; // 8% rental yield
    const expenses = property.price * 0.02; // 2% expenses
    const netIncome = annualRent - expenses;

    return (netIncome / property.price) * 100;
  };

  // ✅ Batch processing with arrow functions
  readonly processPropertiesBatch = async (
    properties: IProperty[],
    batchSize: number = 10
  ): Promise<IProcessedProperty[]> => {
    const batches = this.chunkArray(properties, batchSize);

    const processedBatches = await Promise.all(
      batches.map(async (batch) =>
        Promise.all(batch.map(this.processIndividualProperty))
      )
    );

    return processedBatches.flat();
  };

  private readonly processIndividualProperty = async (
    property: IProperty
  ): Promise<IProcessedProperty> => ({
    ...property,
    roi: this.calculatePropertyROI(property),
    marketValue: await this.getMarketValue(property),
    processedAt: new Date()
  });

  private readonly chunkArray = <T>(array: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
      array.slice(index * size, index * size + size)
    );
}
```

---

## Single Responsibility Principle

### 1. Component Responsibility Separation

#### 1.1 Smart vs Dumb Components
```typescript
// ✅ REQUIRED: Smart component - handles data and business logic
@Component({
  selector: 'app-property-container',
  template: `
    <app-property-search
      [searchQuery]="searchQuery()"
      (searchChange)="updateSearchQuery($event)"
      (filtersChange)="updateFilters($event)"
    />

    <app-property-list
      [properties]="filteredProperties()"
      [isLoading]="isLoading()"
      [error]="error()"
      (propertySelect)="selectProperty($event)"
      (propertyFavorite)="toggleFavorite($event)"
    />

    <app-property-details
      [property]="selectedProperty()"
      [isVisible]="hasSelectedProperty()"
      (close)="clearSelection()"
    />
  `
})
export class PropertyContainer {
  private readonly propertyService = inject(PropertyService);
  private readonly favoriteService = inject(FavoriteService);

  // State management - single responsibility: data orchestration
  private readonly properties = signal<IProperty[]>([]);
  private readonly selectedProperty = signal<IProperty | null>(null);
  private readonly searchQuery = signal<string>('');
  private readonly filters = signal<IPropertyFilters>({});
  private readonly isLoading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);

  // Computed values
  readonly filteredProperties = computed(() =>
    this.applyFiltersToProperties(this.properties(), this.filters(), this.searchQuery())
  );

  readonly hasSelectedProperty = computed(() => this.selectedProperty() !== null);

  // Single responsibility: coordinate data operations
  readonly updateSearchQuery = (query: string): void => {
    this.searchQuery.set(query);
  };

  readonly updateFilters = (filters: IPropertyFilters): void => {
    this.filters.set(filters);
  };

  readonly selectProperty = (property: IProperty): void => {
    this.selectedProperty.set(property);
  };

  readonly clearSelection = (): void => {
    this.selectedProperty.set(null);
  };

  readonly toggleFavorite = async (property: IProperty): Promise<void> => {
    try {
      await this.favoriteService.toggleFavorite(property.id);
      // Update local state to reflect change
      this.updatePropertyInList(property.id, {
        ...property,
        isFavorite: !property.isFavorite
      });
    } catch (error) {
      this.error.set('Failed to update favorite status');
    }
  };

  private readonly applyFiltersToProperties = (
    properties: IProperty[],
    filters: IPropertyFilters,
    query: string
  ): IProperty[] => {
    return properties
      .filter(prop => this.matchesSearchQuery(prop, query))
      .filter(prop => this.matchesFilters(prop, filters));
  };

  private readonly matchesSearchQuery = (property: IProperty, query: string): boolean => {
    if (!query) return true;

    const searchTerm = query.toLowerCase();
    return property.title.toLowerCase().includes(searchTerm) ||
           property.location.toLowerCase().includes(searchTerm) ||
           property.features.some(feature => feature.toLowerCase().includes(searchTerm));
  };

  private readonly matchesFilters = (property: IProperty, filters: IPropertyFilters): boolean => {
    // Filter matching logic
    return true; // Simplified for example
  };
}

// ✅ REQUIRED: Dumb component - pure presentation
@Component({
  selector: 'app-property-list',
  template: `
    @if (isLoading()) {
      <div class="loading">Loading properties...</div>
    } @else if (error()) {
      <div class="error">{{ error() }}</div>
    } @else if (properties().length === 0) {
      <div class="empty">No properties found</div>
    } @else {
      <div class="property-grid">
        @for (property of properties(); track property.id) {
          <app-property-card
            [property]="property"
            (select)="propertySelect.emit($event)"
            (favorite)="propertyFavorite.emit($event)"
          />
        }
      </div>
    }
  `
})
export class PropertyList {
  // Single responsibility: display property list
  properties = input.required<ReadonlyArray<IProperty>>();
  isLoading = input<boolean>(false);
  error = input<string | null>(null);

  propertySelect = output<IProperty>();
  propertyFavorite = output<IProperty>();
}
```

#### 1.2 Service Responsibility Separation
```typescript
// ✅ REQUIRED: Data access service - single responsibility
@Injectable({ providedIn: 'root' })
export class PropertyDataService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  // Single responsibility: HTTP data operations
  readonly getProperties = (): Observable<IProperty[]> =>
    this.http.get<IProperty[]>(`${this.config.apiUrl}/properties`);

  readonly getPropertyById = (id: string): Observable<IProperty> =>
    this.http.get<IProperty>(`${this.config.apiUrl}/properties/${id}`);

  readonly createProperty = (property: ICreatePropertyRequest): Observable<IProperty> =>
    this.http.post<IProperty>(`${this.config.apiUrl}/properties`, property);

  readonly updateProperty = (id: string, updates: IUpdatePropertyRequest): Observable<IProperty> =>
    this.http.patch<IProperty>(`${this.config.apiUrl}/properties/${id}`, updates);

  readonly deleteProperty = (id: string): Observable<void> =>
    this.http.delete<void>(`${this.config.apiUrl}/properties/${id}`);
}

// ✅ REQUIRED: Business logic service - single responsibility
@Injectable({ providedIn: 'root' })
export class PropertyBusinessService {
  private readonly dataService = inject(PropertyDataService);

  // Single responsibility: business logic and validation
  readonly validateProperty = (property: IProperty): IValidationResult => {
    const errors: string[] = [];

    if (property.price <= 0) {
      errors.push('Price must be greater than zero');
    }

    if (property.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    if (!property.location || property.location.length === 0) {
      errors.push('Location is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  readonly calculatePropertyMetrics = (property: IProperty): IPropertyMetrics => ({
    pricePerSqFt: property.area > 0 ? property.price / property.area : 0,
    estimatedROI: this.calculateROI(property),
    marketSegment: this.determineMarketSegment(property.price),
    investmentGrade: this.calculateInvestmentGrade(property)
  });

  readonly createPropertyWithValidation = async (
    propertyData: ICreatePropertyRequest
  ): Promise<IProperty> => {
    // Business logic validation
    const validation = this.validatePropertyData(propertyData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Delegate to data service
    return firstValueFrom(this.dataService.createProperty(propertyData));
  };

  private readonly validatePropertyData = (data: ICreatePropertyRequest): IValidationResult => {
    // Validation logic specific to creation
    return { isValid: true, errors: [] };
  };

  private readonly calculateROI = (property: IProperty): number => {
    // ROI calculation logic
    return 0.08; // 8% example
  };

  private readonly determineMarketSegment = (price: number): string => {
    if (price > 1000000) return 'luxury';
    if (price > 500000) return 'premium';
    return 'standard';
  };

  private readonly calculateInvestmentGrade = (property: IProperty): 'A' | 'B' | 'C' => {
    // Investment grade calculation
    return 'B';
  };
}

// ✅ REQUIRED: Caching service - single responsibility
@Injectable({ providedIn: 'root' })
export class PropertyCacheService {
  private readonly cache = new Map<string, { data: unknown; expiry: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  // Single responsibility: caching operations
  readonly get = <T>(key: string): T | null => {
    const cached = this.cache.get(key);

    if (!cached || Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  };

  readonly set = <T>(key: string, data: T, ttl: number = this.defaultTTL): void => {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  };

  readonly invalidate = (pattern: string): void => {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.includes(pattern));

    keysToDelete.forEach(key => this.cache.delete(key));
  };

  readonly clear = (): void => {
    this.cache.clear();
  };
}
```

---

## SOLID Principles Implementation

### 1. Single Responsibility Principle (S)

#### 1.1 Component SRP Implementation
```typescript
// ✅ REQUIRED: Each component has one clear responsibility

// Property display responsibility
@Component({
  selector: 'app-property-card',
  template: `...` // Only property display template
})
export class PropertyCard {
  property = input.required<IProperty>();
  propertyClick = output<IProperty>();

  // Single responsibility: display property data
  readonly handleClick = (): void => {
    this.propertyClick.emit(this.property());
  };
}

// Search functionality responsibility
@Component({
  selector: 'app-property-search',
  template: `...` // Only search interface template
})
export class PropertySearch {
  searchChange = output<string>();
  filterChange = output<IPropertyFilters>();

  // Single responsibility: handle search input
  readonly handleSearch = (query: string): void => {
    this.searchChange.emit(query);
  };
}

// Data loading responsibility
@Component({
  selector: 'app-property-loader',
  template: `...` // Only loading state template
})
export class PropertyLoader {
  isLoading = input.required<boolean>();
  error = input<string | null>(null);
  retry = output<void>();

  // Single responsibility: display loading states
  readonly handleRetry = (): void => {
    this.retry.emit();
  };
}
```

### 2. Open/Closed Principle (O)

#### 2.2 Extension Through Composition
```typescript
// ✅ REQUIRED: Base property service
@Injectable({ providedIn: 'root' })
export class BasePropertyService {
  private readonly http = inject(HttpClient);

  readonly getProperties = (): Observable<IProperty[]> =>
    this.http.get<IProperty[]>('/api/properties');
}

// ✅ Extension through composition, not inheritance
@Injectable({ providedIn: 'root' })
export class EnhancedPropertyService {
  private readonly baseService = inject(BasePropertyService);
  private readonly cacheService = inject(PropertyCacheService);

  readonly getProperties = (): Observable<IProperty[]> =>
    this.baseService.getProperties().pipe(
      tap(properties => this.cacheService.set('properties', properties)),
      map(properties => properties.map(this.enhanceProperty))
    );

  private readonly enhanceProperty = (property: IProperty): IProperty => ({
    ...property,
    displayPrice: this.formatPrice(property.price),
    isNew: this.isNewProperty(property.createdAt)
  });

  private readonly formatPrice = (price: number): string =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);

  private readonly isNewProperty = (createdAt: Date): boolean =>
    Date.now() - createdAt.getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
}

// ✅ Further extension through directives
@Directive({
  selector: '[appPropertyAnalytics]'
})
export class PropertyAnalyticsDirective {
  private readonly analyticsService = inject(AnalyticsService);

  @HostListener('click', ['$event'])
  readonly trackClick = (event: MouseEvent): void => {
    this.analyticsService.track('property_click', {
      timestamp: new Date(),
      element: event.target
    });
  };
}
```

### 3. Liskov Substitution Principle (L)

#### 3.1 Interface Substitutability
```typescript
// ✅ REQUIRED: Base interface contract
interface IPropertyStorage {
  readonly save: (property: IProperty) => Observable<IProperty>;
  readonly load: (id: string) => Observable<IProperty>;
  readonly delete: (id: string) => Observable<void>;
  readonly list: () => Observable<IProperty[]>;
}

// ✅ HTTP implementation
@Injectable()
export class HttpPropertyStorage implements IPropertyStorage {
  private readonly http = inject(HttpClient);

  readonly save = (property: IProperty): Observable<IProperty> =>
    this.http.post<IProperty>('/api/properties', property);

  readonly load = (id: string): Observable<IProperty> =>
    this.http.get<IProperty>(`/api/properties/${id}`);

  readonly delete = (id: string): Observable<void> =>
    this.http.delete<void>(`/api/properties/${id}`);

  readonly list = (): Observable<IProperty[]> =>
    this.http.get<IProperty[]>('/api/properties');
}

// ✅ Local storage implementation (substitutable)
@Injectable()
export class LocalPropertyStorage implements IPropertyStorage {
  private readonly storageKey = 'properties';

  readonly save = (property: IProperty): Observable<IProperty> => {
    const properties = this.getStoredProperties();
    const existingIndex = properties.findIndex(p => p.id === property.id);

    if (existingIndex >= 0) {
      properties[existingIndex] = property;
    } else {
      properties.push(property);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(properties));
    return of(property);
  };

  readonly load = (id: string): Observable<IProperty> => {
    const properties = this.getStoredProperties();
    const property = properties.find(p => p.id === id);

    return property
      ? of(property)
      : throwError(() => new Error(`Property ${id} not found`));
  };

  readonly delete = (id: string): Observable<void> => {
    const properties = this.getStoredProperties().filter(p => p.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(properties));
    return of(undefined);
  };

  readonly list = (): Observable<IProperty[]> =>
    of(this.getStoredProperties());

  private readonly getStoredProperties = (): IProperty[] => {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  };
}

// ✅ Service using LSP - can substitute any implementation
@Injectable({ providedIn: 'root' })
export class PropertyService {
  constructor(
    @Inject('PROPERTY_STORAGE') private readonly storage: IPropertyStorage
  ) {}

  // Works with any IPropertyStorage implementation
  readonly getProperty = (id: string): Observable<IProperty> =>
    this.storage.load(id);

  readonly saveProperty = (property: IProperty): Observable<IProperty> =>
    this.storage.save(property);
}
```

### 4. Interface Segregation Principle (I)

#### 4.1 Focused Interfaces
```typescript
// ✅ REQUIRED: Segregated interfaces instead of monolithic ones

// ❌ BAD: Fat interface
interface IPropertyServiceFat {
  // Read operations
  getProperty(id: string): Observable<IProperty>;
  listProperties(): Observable<IProperty[]>;
  searchProperties(query: string): Observable<IProperty[]>;

  // Write operations
  createProperty(property: ICreatePropertyRequest): Observable<IProperty>;
  updateProperty(id: string, updates: IUpdatePropertyRequest): Observable<IProperty>;
  deleteProperty(id: string): Observable<void>;

  // Analytics operations
  trackPropertyView(id: string): Observable<void>;
  getPropertyAnalytics(id: string): Observable<IPropertyAnalytics>;

  // Cache operations
  clearCache(): void;
  refreshCache(): Observable<void>;
}

// ✅ GOOD: Segregated interfaces
interface IPropertyReader {
  readonly getProperty: (id: string) => Observable<IProperty>;
  readonly listProperties: () => Observable<IProperty[]>;
  readonly searchProperties: (query: string) => Observable<IProperty[]>;
}

interface IPropertyWriter {
  readonly createProperty: (property: ICreatePropertyRequest) => Observable<IProperty>;
  readonly updateProperty: (id: string, updates: IUpdatePropertyRequest) => Observable<IProperty>;
  readonly deleteProperty: (id: string) => Observable<void>;
}

interface IPropertyAnalytics {
  readonly trackPropertyView: (id: string) => Observable<void>;
  readonly getPropertyAnalytics: (id: string) => Observable<IPropertyAnalytics>;
}

interface IPropertyCache {
  readonly clearCache: () => void;
  readonly refreshCache: () => Observable<void>;
}

// ✅ Implementations can implement only needed interfaces
@Injectable({ providedIn: 'root' })
export class PropertyReadService implements IPropertyReader {
  private readonly http = inject(HttpClient);

  readonly getProperty = (id: string): Observable<IProperty> =>
    this.http.get<IProperty>(`/api/properties/${id}`);

  readonly listProperties = (): Observable<IProperty[]> =>
    this.http.get<IProperty[]>('/api/properties');

  readonly searchProperties = (query: string): Observable<IProperty[]> =>
    this.http.get<IProperty[]>('/api/properties/search', {
      params: { q: query }
    });
}

@Injectable({ providedIn: 'root' })
export class PropertyWriteService implements IPropertyWriter {
  private readonly http = inject(HttpClient);

  readonly createProperty = (property: ICreatePropertyRequest): Observable<IProperty> =>
    this.http.post<IProperty>('/api/properties', property);

  readonly updateProperty = (id: string, updates: IUpdatePropertyRequest): Observable<IProperty> =>
    this.http.patch<IProperty>(`/api/properties/${id}`, updates);

  readonly deleteProperty = (id: string): Observable<void> =>
    this.http.delete<void>(`/api/properties/${id}`);
}
```

### 5. Dependency Inversion Principle (D)

#### 5.1 Dependency Injection with Abstractions
```typescript
// ✅ REQUIRED: Depend on abstractions, not concretions

// Abstraction
interface INotificationService {
  readonly send: (recipient: string, message: string) => Observable<void>;
  readonly sendBatch: (notifications: INotification[]) => Observable<void>;
}

// High-level module depends on abstraction
@Injectable({ providedIn: 'root' })
export class PropertyAlertService {
  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationService: INotificationService
  ) {}

  readonly notifyPropertyMatch = async (user: IUser, property: IProperty): Promise<void> => {
    const message = `New property match: ${property.title} in ${property.location}`;

    try {
      await firstValueFrom(this.notificationService.send(user.email, message));
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  readonly notifyPriceChange = async (subscribers: IUser[], property: IProperty): Promise<void> => {
    const notifications: INotification[] = subscribers.map(user => ({
      recipient: user.email,
      message: `Price updated for ${property.title}: ${property.displayPrice}`,
      type: 'price_change'
    }));

    try {
      await firstValueFrom(this.notificationService.sendBatch(notifications));
    } catch (error) {
      console.error('Failed to send batch notifications:', error);
    }
  };
}

// Low-level modules implement the abstraction
@Injectable()
export class EmailNotificationService implements INotificationService {
  private readonly http = inject(HttpClient);

  readonly send = (recipient: string, message: string): Observable<void> =>
    this.http.post<void>('/api/notifications/email', {
      to: recipient,
      body: message
    });

  readonly sendBatch = (notifications: INotification[]): Observable<void> =>
    this.http.post<void>('/api/notifications/batch', { notifications });
}

@Injectable()
export class SmsNotificationService implements INotificationService {
  private readonly http = inject(HttpClient);

  readonly send = (recipient: string, message: string): Observable<void> =>
    this.http.post<void>('/api/notifications/sms', {
      phone: recipient,
      text: message
    });

  readonly sendBatch = (notifications: INotification[]): Observable<void> =>
    forkJoin(
      notifications.map(notification =>
        this.send(notification.recipient, notification.message)
      )
    ).pipe(map(() => void 0));
}

// ✅ Configuration with modern inject() function
export const NOTIFICATION_PROVIDERS = [
  {
    provide: 'NOTIFICATION_SERVICE',
    useClass: EmailNotificationService // Can be switched to SMS
  }
];
```

---

## DRY Principle Application

### 1. Code Reusability Patterns

#### 1.1 Utility Functions
```typescript
// ✅ REQUIRED: DRY utility functions
export class PropertyUtils {
  // ✅ Single source of truth for price formatting
  static readonly formatPrice = (price: number, currency: string = 'USD'): string =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(price);

  // ✅ Reusable validation logic
  static readonly validatePropertyData = (property: Partial<IProperty>): IValidationResult => {
    const errors: string[] = [];

    if (!property.title || property.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }

    if (!property.price || property.price <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (!property.location || property.location.length === 0) {
      errors.push('Location is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // ✅ Common transformation logic
  static readonly normalizePropertyData = (rawProperty: IRawProperty): IProperty => ({
    id: rawProperty.id,
    title: rawProperty.title.trim(),
    price: Math.max(0, rawProperty.price),
    location: rawProperty.location.trim(),
    description: rawProperty.description?.trim() || '',
    images: rawProperty.images?.filter(img => img.url) || [],
    features: rawProperty.features?.map(f => f.toLowerCase()) || [],
    createdAt: new Date(rawProperty.createdAt),
    updatedAt: new Date(rawProperty.updatedAt)
  });

  // ✅ Reusable filtering logic
  static readonly createPropertyFilter = <K extends keyof IProperty>(
    field: K,
    predicate: (value: IProperty[K]) => boolean
  ) =>
    (properties: IProperty[]): IProperty[] =>
      properties.filter(property => predicate(property[field]));

  // ✅ Common sorting logic
  static readonly createPropertySorter = <K extends keyof IProperty>(
    field: K,
    direction: 'asc' | 'desc' = 'asc'
  ) =>
    (properties: IProperty[]): IProperty[] =>
      [...properties].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === 'asc' ? comparison : -comparison;
      });
}
```

#### 1.2 Generic Components
```typescript
// ✅ REQUIRED: Generic reusable components to avoid duplication

// Generic data list component
@Component({
  selector: 'app-data-list',
  template: `
    <div class="data-list" [class]="containerClass()">
      @if (isLoading()) {
        <div class="data-list__loading">
          <ng-content select="[slot=loading]">
            <div>Loading...</div>
          </ng-content>
        </div>
      }

      @if (error()) {
        <div class="data-list__error">
          <ng-content select="[slot=error]">
            <div>Error: {{ error() }}</div>
          </ng-content>
        </div>
      }

      @if (isEmpty()) {
        <div class="data-list__empty">
          <ng-content select="[slot=empty]">
            <div>No items found</div>
          </ng-content>
        </div>
      }

      @if (hasItems()) {
        <div class="data-list__items">
          @for (item of items(); track trackBy(item)) {
            <div class="data-list__item">
              <ng-content select="[slot=item]"></ng-content>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DataListComponent<T> {
  items = input.required<ReadonlyArray<T>>();
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  containerClass = input<string>('');
  trackBy = input<(item: T) => unknown>((item: T) => item);

  readonly hasItems = computed(() =>
    this.items().length > 0 && !this.isLoading() && !this.error()
  );

  readonly isEmpty = computed(() =>
    this.items().length === 0 && !this.isLoading() && !this.error()
  );
}

// Generic form field component
@Component({
  selector: 'app-form-field',
  template: `
    <div class="form-field" [class]="fieldClasses()">
      <label [for]="fieldId()" class="form-field__label">
        {{ label() }}
        @if (required()) {
          <span class="form-field__required">*</span>
        }
      </label>

      <div class="form-field__input">
        <ng-content></ng-content>
      </div>

      @if (error()) {
        <div class="form-field__error">{{ error() }}</div>
      }

      @if (helpText()) {
        <div class="form-field__help">{{ helpText() }}</div>
      }
    </div>
  `
})
export class FormFieldComponent {
  label = input.required<string>();
  fieldId = input.required<string>();
  required = input<boolean>(false);
  error = input<string | null>(null);
  helpText = input<string | null>(null);
  disabled = input<boolean>(false);

  readonly fieldClasses = computed(() => ({
    'form-field--required': this.required(),
    'form-field--error': !!this.error(),
    'form-field--disabled': this.disabled()
  }));
}
```

### 2. Configuration and Constants

#### 2.1 Centralized Configuration
```typescript
// ✅ REQUIRED: Single source of truth for configuration
export const APP_CONFIG = {
  api: {
    baseUrl: 'https://api.archland.hu',
    timeout: 30000,
    retries: 3
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  },
  validation: {
    property: {
      titleMinLength: 3,
      titleMaxLength: 100,
      descriptionMaxLength: 1000,
      minPrice: 1,
      maxPrice: 100000000
    }
  },
  ui: {
    debounceTime: 300,
    animationDuration: 250
  },
  cache: {
    defaultTtl: 5 * 60 * 1000, // 5 minutes
    maxEntries: 1000
  }
} as const;

// ✅ Type-safe configuration access
type AppConfig = typeof APP_CONFIG;

@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly config: AppConfig = APP_CONFIG;

  readonly getApiConfig = () => this.config.api;
  readonly getPaginationConfig = () => this.config.pagination;
  readonly getValidationConfig = () => this.config.validation;
  readonly getUiConfig = () => this.config.ui;
  readonly getCacheConfig = () => this.config.cache;
}
```

#### 2.2 Reusable Validation Rules
```typescript
// ✅ REQUIRED: DRY validation patterns
export class ValidationRules {
  // ✅ Reusable validation functions
  static readonly required = (value: unknown): boolean =>
    value !== null && value !== undefined && value !== '';

  static readonly minLength = (min: number) => (value: string): boolean =>
    value.length >= min;

  static readonly maxLength = (max: number) => (value: string): boolean =>
    value.length <= max;

  static readonly email = (value: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  static readonly phone = (value: string): boolean =>
    /^\+?[\d\s-()]+$/.test(value);

  static readonly positiveNumber = (value: number): boolean =>
    typeof value === 'number' && value > 0;

  static readonly numberRange = (min: number, max: number) =>
    (value: number): boolean =>
      typeof value === 'number' && value >= min && value <= max;

  // ✅ Composite validations
  static readonly propertyTitle = (title: string): IValidationResult => {
    const config = APP_CONFIG.validation.property;
    const errors: string[] = [];

    if (!ValidationRules.required(title)) {
      errors.push('Title is required');
    } else {
      if (!ValidationRules.minLength(config.titleMinLength)(title)) {
        errors.push(`Title must be at least ${config.titleMinLength} characters`);
      }
      if (!ValidationRules.maxLength(config.titleMaxLength)(title)) {
        errors.push(`Title must not exceed ${config.titleMaxLength} characters`);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  static readonly propertyPrice = (price: number): IValidationResult => {
    const config = APP_CONFIG.validation.property;
    const errors: string[] = [];

    if (!ValidationRules.required(price)) {
      errors.push('Price is required');
    } else {
      if (!ValidationRules.numberRange(config.minPrice, config.maxPrice)(price)) {
        errors.push(`Price must be between $${config.minPrice} and $${config.maxPrice}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  };
}
```

---

## Code Organization Patterns

### 1. File Structure and Naming

#### 1.1 Constitutional Compliance
```typescript
// ✅ REQUIRED: Barrel exports for clean imports
// shared/utils/index.ts
export * from './property-utils';
export * from './validation-utils';
export * from './date-utils';
export * from './currency-utils';

// ✅ Feature-based organization
src/app/
├── features/
│   ├── property-management/
│   │   ├── components/
│   │   │   ├── property-list.component.ts
│   │   │   ├── property-card.component.ts
│   │   │   └── property-form.component.ts
│   │   ├── services/
│   │   │   ├── property-data.service.ts
│   │   │   ├── property-business.service.ts
│   │   │   └── property-validation.service.ts
│   │   └── models/
│   │       ├── property.interface.ts
│   │       └── property-filters.interface.ts
│   └── user-management/
├── shared/
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── models/
└── core/
    ├── services/
    ├── guards/
    └── interceptors/
```

### 2. Consistent Patterns

#### 2.1 Service Layer Pattern
```typescript
// ✅ REQUIRED: Consistent service patterns across application

// Base service interface
interface IBaseService<T, TCreate, TUpdate> {
  readonly getAll: () => Observable<T[]>;
  readonly getById: (id: string) => Observable<T>;
  readonly create: (item: TCreate) => Observable<T>;
  readonly update: (id: string, updates: TUpdate) => Observable<T>;
  readonly delete: (id: string) => Observable<void>;
}

// Generic base service implementation
@Injectable()
export abstract class BaseService<T, TCreate, TUpdate>
  implements IBaseService<T, TCreate, TUpdate> {

  protected readonly http = inject(HttpClient);
  protected abstract readonly endpoint: string;

  readonly getAll = (): Observable<T[]> =>
    this.http.get<T[]>(this.endpoint);

  readonly getById = (id: string): Observable<T> =>
    this.http.get<T>(`${this.endpoint}/${id}`);

  readonly create = (item: TCreate): Observable<T> =>
    this.http.post<T>(this.endpoint, item);

  readonly update = (id: string, updates: TUpdate): Observable<T> =>
    this.http.patch<T>(`${this.endpoint}/${id}`, updates);

  readonly delete = (id: string): Observable<void> =>
    this.http.delete<void>(`${this.endpoint}/${id}`);
}

// Specific service implementations
@Injectable({ providedIn: 'root' })
export class PropertyService extends BaseService<
  IProperty,
  ICreatePropertyRequest,
  IUpdatePropertyRequest
> {
  protected readonly endpoint = '/api/properties';

  // Additional property-specific methods
  readonly searchProperties = (query: string): Observable<IProperty[]> =>
    this.http.get<IProperty[]>(`${this.endpoint}/search`, {
      params: { q: query }
    });

  readonly getPropertiesByLocation = (location: string): Observable<IProperty[]> =>
    this.http.get<IProperty[]>(`${this.endpoint}/by-location/${location}`);
}

@Injectable({ providedIn: 'root' })
export class UserService extends BaseService<
  IUser,
  ICreateUserRequest,
  IUpdateUserRequest
> {
  protected readonly endpoint = '/api/users';

  // Additional user-specific methods
  readonly getUserPreferences = (userId: string): Observable<IUserPreferences> =>
    this.http.get<IUserPreferences>(`${this.endpoint}/${userId}/preferences`);

  readonly updateUserPreferences = (
    userId: string,
    preferences: IUserPreferences
  ): Observable<IUserPreferences> =>
    this.http.put<IUserPreferences>(
      `${this.endpoint}/${userId}/preferences`,
      preferences
    );
}
```

---

## Testing and Quality Assurance

### 1. Functional Testing Patterns

#### 1.1 Pure Function Testing
```typescript
describe('PropertyUtils', () => {
  describe('formatPrice', () => {
    it('should format USD currency correctly', () => {
      const result = PropertyUtils.formatPrice(1234567, 'USD');
      expect(result).toBe('$1,234,567.00');
    });

    it('should format EUR currency correctly', () => {
      const result = PropertyUtils.formatPrice(1234567, 'EUR');
      expect(result).toBe('€1,234,567.00');
    });

    it('should handle zero price', () => {
      const result = PropertyUtils.formatPrice(0, 'USD');
      expect(result).toBe('$0.00');
    });
  });

  describe('validatePropertyData', () => {
    it('should validate correct property data', () => {
      const property: Partial<IProperty> = {
        title: 'Test Property',
        price: 500000,
        location: 'New York'
      };

      const result = PropertyUtils.validatePropertyData(property);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for invalid data', () => {
      const property: Partial<IProperty> = {
        title: 'A',
        price: -100,
        location: ''
      };

      const result = PropertyUtils.validatePropertyData(property);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be at least 3 characters');
      expect(result.errors).toContain('Price must be greater than 0');
      expect(result.errors).toContain('Location is required');
    });
  });
});
```

#### 1.2 Arrow Function Testing
```typescript
describe('Arrow Function Behaviors', () => {
  class TestComponent {
    private value = 42;

    // Arrow function preserves 'this'
    readonly getValue = (): number => this.value;

    // Arrow function in callback context
    readonly processCallback = (callback: () => number): number => callback();
  }

  it('should preserve lexical this binding in arrow functions', () => {
    const component = new TestComponent();
    const getValue = component.getValue;

    // Arrow function preserves 'this' context
    expect(getValue()).toBe(42);
  });

  it('should work correctly as callbacks', () => {
    const component = new TestComponent();

    const result = component.processCallback(component.getValue);
    expect(result).toBe(42);
  });

  it('should maintain this binding in async contexts', async () => {
    const component = new TestComponent();

    const promise = new Promise<number>(resolve => {
      setTimeout(() => resolve(component.getValue()), 10);
    });

    const result = await promise;
    expect(result).toBe(42);
  });
});
```

### 2. SOLID Principles Testing

#### 2.1 Dependency Injection Testing
```typescript
describe('PropertyService with DI', () => {
  let service: PropertyService;
  let mockHttpClient: jasmine.SpyOf<HttpClient>;
  let mockNotificationService: jasmine.SpyOf<INotificationService>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'patch', 'delete']);
    const notificationSpy = jasmine.createSpyObj('INotificationService', ['send', 'sendBatch']);

    TestBed.configureTestingModule({
      providers: [
        PropertyService,
        { provide: HttpClient, useValue: httpSpy },
        { provide: 'NOTIFICATION_SERVICE', useValue: notificationSpy }
      ]
    });

    service = TestBed.inject(PropertyService);
    mockHttpClient = TestBed.inject(HttpClient) as jasmine.SpyOf<HttpClient>;
    mockNotificationService = TestBed.inject('NOTIFICATION_SERVICE');
  });

  it('should call HTTP client with correct parameters', () => {
    const mockProperties = [createMockProperty()];
    mockHttpClient.get.and.returnValue(of(mockProperties));

    service.getProperties().subscribe(properties => {
      expect(properties).toEqual(mockProperties);
    });

    expect(mockHttpClient.get).toHaveBeenCalledWith('/api/properties');
  });

  it('should handle errors appropriately', () => {
    const error = new Error('Network error');
    mockHttpClient.get.and.returnValue(throwError(() => error));

    service.getProperties().subscribe({
      next: () => fail('Should have failed'),
      error: (err) => expect(err).toBe(error)
    });
  });
});
```

---

## Performance Considerations

### 1. Functional Programming Performance

#### 1.1 Memoization Patterns
```typescript
// ✅ REQUIRED: Memoize expensive pure functions
export class MemoizedPropertyCalculations {
  private static readonly memoCache = new Map<string, unknown>();

  static readonly memoize = <TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    keyGenerator?: (...args: TArgs) => string
  ) =>
    (...args: TArgs): TReturn => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

      if (MemoizedPropertyCalculations.memoCache.has(key)) {
        return MemoizedPropertyCalculations.memoCache.get(key) as TReturn;
      }

      const result = fn(...args);
      MemoizedPropertyCalculations.memoCache.set(key, result);

      return result;
    };

  // ✅ Memoized expensive calculations
  static readonly calculateROI = MemoizedPropertyCalculations.memoize(
    (property: IProperty): number => {
      // Complex ROI calculation
      const annualRent = property.price * 0.08;
      const expenses = property.price * 0.02;
      const netIncome = annualRent - expenses;

      return (netIncome / property.price) * 100;
    },
    (property: IProperty) => `roi-${property.id}-${property.price}`
  );

  static readonly calculateMarketValue = MemoizedPropertyCalculations.memoize(
    (property: IProperty, marketConditions: IMarketConditions): number => {
      // Complex market value calculation
      return property.price * marketConditions.multiplier;
    },
    (property: IProperty, conditions: IMarketConditions) =>
      `market-${property.id}-${conditions.date.getTime()}`
  );
}
```

#### 1.2 Efficient Array Operations
```typescript
// ✅ REQUIRED: Optimize functional array operations
export class OptimizedPropertyFiltering {
  // ✅ Use early returns and efficient filtering
  static readonly filterProperties = (
    properties: ReadonlyArray<IProperty>,
    filters: IPropertyFilters
  ): IProperty[] => {
    if (!filters || Object.keys(filters).length === 0) {
      return [...properties];
    }

    return properties.filter(property => {
      // Early return optimizations
      if (filters.minPrice && property.price < filters.minPrice) return false;
      if (filters.maxPrice && property.price > filters.maxPrice) return false;
      if (filters.location && !property.location.includes(filters.location)) return false;

      return true;
    });
  };

  // ✅ Batch processing for large datasets
  static readonly processPropertiesInBatches = async <T>(
    properties: ReadonlyArray<IProperty>,
    processor: (property: IProperty) => Promise<T>,
    batchSize: number = 50
  ): Promise<T[]> => {
    const results: T[] = [];

    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }

    return results;
  };
}
```

---

## Conclusion

This Coding Principles documentation establishes the foundation for consistent, maintainable, and high-quality code in the Archland.hu Angular application. The key principles ensure:

- **Functional Design**: Embrace functional and declarative programming patterns for better predictability and testability
- **Arrow Function Consistency**: Maintain lexical scoping and consistent syntax throughout the codebase
- **Single Responsibility**: Design components, services, and functions with clear, focused purposes
- **SOLID Architecture**: Apply proven design principles for scalable, maintainable code structure
- **DRY Implementation**: Eliminate code duplication through reusable utilities, patterns, and abstractions

**Implementation Priority**:
1. Enforce arrow function usage in all new code
2. Implement SOLID principles in service and component design
3. Apply DRY principles through shared utilities and generic components
4. Establish consistent patterns for common operations
5. Maintain functional programming approaches where applicable

**Quality Gates**:
- All functions must be arrow functions (enforced by linting)
- Components must demonstrate single responsibility
- Services must follow interface segregation
- Code duplication must be eliminated through reusable patterns
- All implementations must include comprehensive test coverage

---

**Document Information**
- **Authority**: Archland.hu Constitution Section IV
- **Review Cycle**: Quarterly (aligned with TypeScript and Angular releases)
- **Stakeholders**: All development team members, code reviewers, architects
- **Related Documents**: [Framework Standards Best Practices], [State Management Best Practices], [Component Communication Best Practices]