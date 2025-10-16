# Services & Architecture Best Practices

*Implementation guide for Archland.hu Constitution: Services & Architecture*

## Core Principle

Services should only exist to convert domain-layer types into view-model types. Maintain clear separation of concerns between layers, following clean architecture patterns while avoiding over-engineering.

## Why Proper Service Architecture Matters

### Constitutional Compliance
- **Single Responsibility**: Each service has one clear purpose - data transformation
- **Layer Separation**: Clean boundaries between domain, service, and presentation layers
- **Type Safety**: Strict TypeScript interfaces for all layer interactions
- **Dependency Inversion**: Services depend on abstractions, not implementations

### Real-World Benefits for Archland.hu
- **Maintainable Codebase**: Clear service boundaries make code easier to modify
- **Testable Architecture**: Services are isolated and mockable for unit testing
- **Scalable Design**: New property types and features integrate seamlessly
- **Performance Optimization**: Efficient data transformation reduces computational overhead

## Architecture Layers

### Domain Layer (Data Models)
Raw data from APIs, databases, or external sources. These represent the "source of truth" but may not be directly usable in components.

```typescript
// Domain models - direct from API/database
interface IPropertyDomain {
  readonly id: string;
  readonly name: string;
  readonly address: {
    readonly street: string;
    readonly city: string;
    readonly postal_code: string;
    readonly country: string;
  };
  readonly price_eur: number;
  readonly currency: 'EUR' | 'USD' | 'HUF';
  readonly property_type: 'residential' | 'commercial' | 'industrial';
  readonly investment_data: {
    readonly expected_roi: number;
    readonly rental_yield: number;
    readonly market_value: number;
  };
  readonly status: 'available' | 'sold' | 'pending' | 'reserved';
  readonly images: string[];
  readonly created_at: string; // ISO date string
  readonly updated_at: string;
}

interface IUserDomain {
  readonly id: string;
  readonly email: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly role: 'admin' | 'editor' | 'viewer';
  readonly preferences: {
    readonly language: 'en' | 'hu';
    readonly currency: 'EUR' | 'USD' | 'HUF';
    readonly notifications: boolean;
  };
  readonly created_at: string;
}
```

### View-Model Layer (Component State)
Optimized data structures for component consumption, with computed properties, formatted values, and UI-specific logic.

```typescript
// View-model interfaces - optimized for components
interface IPropertyViewModel {
  readonly id: string;
  readonly displayName: string;
  readonly formattedAddress: string;
  readonly priceDisplay: string;
  readonly priceNumeric: number;
  readonly propertyTypeLabel: string;
  readonly statusLabel: string;
  readonly statusColor: 'success' | 'warning' | 'error' | 'info';
  readonly roiDisplay: string;
  readonly yieldDisplay: string;
  readonly thumbnailImage: string;
  readonly allImages: string[];
  readonly isNewListing: boolean;
  readonly daysOnMarket: number;
  readonly investmentMetrics: {
    readonly expectedRoi: string;
    readonly rentalYield: string;
    readonly marketValue: string;
  };
  readonly createdDate: Date;
  readonly updatedDate: Date;
}

interface IUserViewModel {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly roleLabel: string;
  readonly languageLabel: string;
  readonly currencySymbol: string;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly isActive: boolean;
  readonly memberSince: string;
}
```

### Service Layer (Data Transformation)
The bridge between domain and view-model layers. Services perform the critical conversion task.

```typescript
@Injectable({
  providedIn: 'root'
})
export class PropertyViewModelService {
  private readonly currencyService = inject(CurrencyService);
  private readonly i18nService = inject(I18nService);
  private readonly dateService = inject(DateService);

  // Primary responsibility: convert domain to view-model
  convertToViewModel = (domain: IPropertyDomain): IPropertyViewModel => {
    return {
      id: domain.id,
      displayName: domain.name,
      formattedAddress: this.formatAddress(domain.address),
      priceDisplay: this.currencyService.format(domain.price_eur, domain.currency),
      priceNumeric: this.currencyService.convertToEur(domain.price_eur, domain.currency),
      propertyTypeLabel: this.i18nService.translate(`property.type.${domain.property_type}`),
      statusLabel: this.i18nService.translate(`property.status.${domain.status}`),
      statusColor: this.getStatusColor(domain.status),
      roiDisplay: `${domain.investment_data.expected_roi.toFixed(1)}%`,
      yieldDisplay: `${domain.investment_data.rental_yield.toFixed(2)}%`,
      thumbnailImage: domain.images[0] || '/assets/images/property-placeholder.jpg',
      allImages: domain.images,
      isNewListing: this.dateService.isWithinDays(domain.created_at, 30),
      daysOnMarket: this.dateService.daysSince(domain.created_at),
      investmentMetrics: {
        expectedRoi: `${domain.investment_data.expected_roi.toFixed(1)}%`,
        rentalYield: `${domain.investment_data.rental_yield.toFixed(2)}%`,
        marketValue: this.currencyService.format(domain.investment_data.market_value, domain.currency)
      },
      createdDate: new Date(domain.created_at),
      updatedDate: new Date(domain.updated_at)
    };
  };

  // Batch conversion for lists
  convertListToViewModel = (domains: IPropertyDomain[]): IPropertyViewModel[] => {
    return domains.map(this.convertToViewModel);
  };

  // Private helper methods
  private formatAddress = (address: IPropertyDomain['address']): string => {
    return `${address.street}, ${address.city} ${address.postal_code}, ${address.country}`;
  };

  private getStatusColor = (status: IPropertyDomain['status']): IPropertyViewModel['statusColor'] => {
    const statusColorMap: Record<IPropertyDomain['status'], IPropertyViewModel['statusColor']> = {
      available: 'success',
      pending: 'warning',
      reserved: 'warning',
      sold: 'error'
    };
    return statusColorMap[status];
  };
}
```

## Service Architecture Patterns

### Repository Pattern Integration

```typescript
// Abstract repository (domain layer contract)
abstract class PropertyRepository {
  abstract getAll(): Observable<IPropertyDomain[]>;
  abstract getById(id: string): Observable<IPropertyDomain>;
  abstract create(property: ICreatePropertyRequest): Observable<IPropertyDomain>;
  abstract update(id: string, updates: IUpdatePropertyRequest): Observable<IPropertyDomain>;
  abstract delete(id: string): Observable<void>;
}

// HTTP implementation (infrastructure layer)
@Injectable({
  providedIn: 'root'
})
export class HttpPropertyRepository extends PropertyRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/properties';

  getAll = (): Observable<IPropertyDomain[]> => {
    return this.http.get<IPropertyDomain[]>(this.baseUrl);
  };

  getById = (id: string): Observable<IPropertyDomain> => {
    return this.http.get<IPropertyDomain>(`${this.baseUrl}/${id}`);
  };

  create = (property: ICreatePropertyRequest): Observable<IPropertyDomain> => {
    return this.http.post<IPropertyDomain>(this.baseUrl, property);
  };

  update = (id: string, updates: IUpdatePropertyRequest): Observable<IPropertyDomain> => {
    return this.http.patch<IPropertyDomain>(`${this.baseUrl}/${id}`, updates);
  };

  delete = (id: string): Observable<void> => {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  };
}

// Service that coordinates repository and view-model conversion
@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly repository = inject(PropertyRepository);
  private readonly viewModelService = inject(PropertyViewModelService);

  // Public API returns view-models, not domain models
  getProperties = (): Observable<IPropertyViewModel[]> => {
    return this.repository.getAll().pipe(
      map(domains => this.viewModelService.convertListToViewModel(domains))
    );
  };

  getProperty = (id: string): Observable<IPropertyViewModel> => {
    return this.repository.getById(id).pipe(
      map(domain => this.viewModelService.convertToViewModel(domain))
    );
  };

  createProperty = (request: ICreatePropertyRequest): Observable<IPropertyViewModel> => {
    return this.repository.create(request).pipe(
      map(domain => this.viewModelService.convertToViewModel(domain))
    );
  };
}
```

### Dependency Injection Configuration

```typescript
// DI token for repository abstraction
export const PROPERTY_REPOSITORY = new InjectionToken<PropertyRepository>('PropertyRepository');

// Provider configuration
export const PROPERTY_PROVIDERS = [
  // Repository implementation
  {
    provide: PropertyRepository,
    useClass: HttpPropertyRepository
  },

  // Alternative for testing
  // {
  //   provide: PropertyRepository,
  //   useClass: MockPropertyRepository
  // },

  // View-model service
  PropertyViewModelService,

  // Main service
  PropertyService,

  // Supporting services
  CurrencyService,
  DateService
];

// Bootstrap configuration
bootstrapApplication(AppComponent, {
  providers: [
    ...PROPERTY_PROVIDERS,
    // other providers
  ]
});
```

## Advanced Patterns

### Service Composition

```typescript
@Injectable({
  providedIn: 'root'
})
export class PropertyListViewModelService {
  private readonly propertyVmService = inject(PropertyViewModelService);
  private readonly userVmService = inject(UserViewModelService);
  private readonly searchService = inject(PropertySearchService);

  // Compose multiple services for complex view-models
  createListViewModel = (
    properties: IPropertyDomain[],
    currentUser: IUserDomain,
    searchParams: ISearchParams
  ): IPropertyListViewModel => {
    const propertyVMs = this.propertyVmService.convertListToViewModel(properties);
    const userVM = this.userVmService.convertToViewModel(currentUser);

    return {
      properties: propertyVMs,
      currentUser: userVM,
      searchSummary: this.searchService.createSummary(searchParams, properties.length),
      canAddProperty: userVM.canEdit,
      totalCount: properties.length,
      hasResults: properties.length > 0
    };
  };
}
```

### Caching and Performance

```typescript
@Injectable({
  providedIn: 'root'
})
export class CachedPropertyService {
  private readonly repository = inject(PropertyRepository);
  private readonly viewModelService = inject(PropertyViewModelService);
  private readonly cache = new Map<string, { data: IPropertyViewModel; timestamp: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  getProperty = (id: string): Observable<IPropertyViewModel> => {
    const cached = this.getCachedProperty(id);

    if (cached) {
      return of(cached);
    }

    return this.repository.getById(id).pipe(
      map(domain => this.viewModelService.convertToViewModel(domain)),
      tap(viewModel => this.setCachedProperty(id, viewModel))
    );
  };

  private getCachedProperty = (id: string): IPropertyViewModel | null => {
    const cached = this.cache.get(id);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired) {
      this.cache.delete(id);
      return null;
    }

    return cached.data;
  };

  private setCachedProperty = (id: string, data: IPropertyViewModel): void => {
    this.cache.set(id, {
      data,
      timestamp: Date.now()
    });
  };
}
```

### Error Handling and Logging

```typescript
@Injectable({
  providedIn: 'root'
})
export class PropertyServiceWithErrorHandling {
  private readonly repository = inject(PropertyRepository);
  private readonly viewModelService = inject(PropertyViewModelService);
  private readonly logger = inject(LoggerService);
  private readonly errorHandler = inject(ErrorHandlerService);

  getProperties = (): Observable<IPropertyViewModel[]> => {
    return this.repository.getAll().pipe(
      map(domains => {
        this.logger.debug('Converting properties to view models', { count: domains.length });
        return this.viewModelService.convertListToViewModel(domains);
      }),
      catchError(error => {
        this.logger.error('Failed to load properties', error);
        return this.errorHandler.handlePropertyLoadError(error);
      })
    );
  };
}
```

## Testing Strategies

### Service Unit Testing

```typescript
describe('PropertyViewModelService', () => {
  let service: PropertyViewModelService;
  let mockCurrencyService: jasmine.SpyObj<CurrencyService>;
  let mockI18nService: jasmine.SpyObj<I18nService>;

  beforeEach(() => {
    const currencySpy = jasmine.createSpyObj('CurrencyService', ['format', 'convertToEur']);
    const i18nSpy = jasmine.createSpyObj('I18nService', ['translate']);

    TestBed.configureTestingModule({
      providers: [
        PropertyViewModelService,
        { provide: CurrencyService, useValue: currencySpy },
        { provide: I18nService, useValue: i18nSpy }
      ]
    });

    service = TestBed.inject(PropertyViewModelService);
    mockCurrencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>;
    mockI18nService = TestBed.inject(I18nService) as jasmine.SpyObj<I18nService>;
  });

  it('should convert domain model to view model', () => {
    // Arrange
    mockCurrencyService.format.and.returnValue('€500,000');
    mockI18nService.translate.and.returnValue('Residential');

    const domain: IPropertyDomain = {
      id: '1',
      name: 'Test Property',
      price_eur: 500000,
      currency: 'EUR',
      property_type: 'residential',
      // ... other properties
    };

    // Act
    const result = service.convertToViewModel(domain);

    // Assert
    expect(result.id).toBe('1');
    expect(result.displayName).toBe('Test Property');
    expect(result.priceDisplay).toBe('€500,000');
    expect(mockCurrencyService.format).toHaveBeenCalledWith(500000, 'EUR');
  });
});

// Integration testing
describe('PropertyService Integration', () => {
  let service: PropertyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PropertyService,
        PropertyViewModelService,
        { provide: PropertyRepository, useClass: HttpPropertyRepository }
      ]
    });

    service = TestBed.inject(PropertyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should load and convert properties', () => {
    const mockDomainData: IPropertyDomain[] = [/* mock data */];

    service.getProperties().subscribe(properties => {
      expect(properties).toEqual(jasmine.any(Array));
      expect(properties[0]).toEqual(jasmine.objectContaining({
        id: jasmine.any(String),
        displayName: jasmine.any(String),
        priceDisplay: jasmine.any(String)
      }));
    });

    const req = httpMock.expectOne('/api/properties');
    req.flush(mockDomainData);
  });
});
```

## Migration Strategy

### From Mixed Concerns to Clean Services

```typescript
// BEFORE: Service with mixed concerns (incorrect)
@Injectable()
export class OldPropertyService {
  private http = inject(HttpClient);

  // WRONG: Mixing HTTP, business logic, and view formatting
  getPropertiesForDisplay() {
    return this.http.get<any[]>('/api/properties').pipe(
      map(properties => properties.map(p => ({
        ...p,
        displayName: p.name,
        formattedPrice: `€${p.price.toLocaleString()}`, // View logic in service!
        statusColor: p.status === 'sold' ? 'red' : 'green' // UI logic in service!
      })))
    );
  }
}

// AFTER: Clean separation (correct)
@Injectable()
export class PropertyService {
  private repository = inject(PropertyRepository);
  private viewModelService = inject(PropertyViewModelService);

  // CORRECT: Single responsibility - coordinate and convert
  getProperties = (): Observable<IPropertyViewModel[]> => {
    return this.repository.getAll().pipe(
      map(domains => this.viewModelService.convertListToViewModel(domains))
    );
  };
}
```

## Key Architectural Principles

### 1. Single Responsibility Principle
Each service has one clear purpose:
- **Repository Services**: Data access and persistence
- **View-Model Services**: Domain-to-presentation conversion
- **Business Services**: Domain logic and rules
- **Coordination Services**: Orchestrate multiple services

### 2. Dependency Inversion
```typescript
// High-level modules depend on abstractions
@Injectable()
export class PropertyService {
  constructor(
    private repository: PropertyRepository, // Abstract
    private viewModelService: PropertyViewModelService // Concrete but focused
  ) {}
}
```

### 3. Interface Segregation
```typescript
// Focused interfaces for specific needs
interface IPropertyDisplayService {
  convertToViewModel(domain: IPropertyDomain): IPropertyViewModel;
}

interface IPropertyPersistenceService {
  save(property: IPropertyDomain): Observable<IPropertyDomain>;
  load(id: string): Observable<IPropertyDomain>;
}
```

### 4. Open/Closed Principle
```typescript
// Services are open for extension, closed for modification
@Injectable()
export class ExtendedPropertyViewModelService extends PropertyViewModelService {
  // Add new conversion methods without modifying base service
  convertToListItemViewModel = (domain: IPropertyDomain): IPropertyListItemViewModel => {
    const base = this.convertToViewModel(domain);
    return {
      id: base.id,
      displayName: base.displayName,
      priceDisplay: base.priceDisplay,
      thumbnailImage: base.thumbnailImage
    };
  };
}
```

## Common Anti-Patterns to Avoid

### ❌ God Services
```typescript
// DON'T: Single service doing everything
@Injectable()
export class PropertyGodService {
  // HTTP calls
  loadProperties() { /* ... */ }

  // Business logic
  calculateROI() { /* ... */ }

  // View formatting
  formatCurrency() { /* ... */ }

  // Validation
  validateProperty() { /* ... */ }

  // Email sending
  sendNotification() { /* ... */ }
}
```

### ❌ Leaky Abstractions
```typescript
// DON'T: Exposing implementation details
@Injectable()
export class PropertyService {
  getProperties(): Observable<HttpResponse<IPropertyDomain[]>> {
    // Exposing HTTP implementation detail
    return this.http.get<IPropertyDomain[]>('/api/properties', { observe: 'response' });
  }
}
```

### ❌ View Logic in Services
```typescript
// DON'T: UI concerns in services
@Injectable()
export class PropertyService {
  getPropertiesWithStyling() {
    return this.repository.getAll().pipe(
      map(properties => properties.map(p => ({
        ...p,
        cssClass: p.status === 'sold' ? 'text-red-500' : 'text-green-500' // WRONG!
      })))
    );
  }
}
```

## Key Takeaways

1. **Constitutional Compliance**: Services exist only to convert domain types to view-model types
2. **Clean Architecture**: Maintain strict layer separation with clear boundaries
3. **Single Responsibility**: Each service has one focused purpose
4. **Type Safety**: Use strict TypeScript interfaces for all service contracts
5. **Dependency Injection**: Leverage Angular's DI for flexible, testable architecture
6. **Performance**: Implement caching and optimization at the service layer
7. **Testing**: Design services for easy unit and integration testing

This architecture ensures maintainable, scalable, and testable Angular applications while adhering to constitutional principles and industry best practices.