# Component Communication - Best Practices Guide

> **Constitutional Reference**: Section III. Component Communication
> **Version**: 1.0.0
> **Last Updated**: 2025-09-26
> **Sources**: Angular.dev official documentation, Angular team recommendations, community patterns

This document provides comprehensive best practices for the Component Communication section of the Archland.hu Constitution, covering InputSignal, OutputEmitterRef, and type-safe component interfaces.

## Table of Contents
1. [InputSignal Implementation](#inputsignal-implementation)
2. [OutputEmitterRef Patterns](#outputemitterref-patterns)
3. [Type-Safe Component Interfaces](#type-safe-component-interfaces)
4. [Content Projection Patterns](#content-projection-patterns)
5. [Advanced Communication Patterns](#advanced-communication-patterns)
6. [Performance Optimization](#performance-optimization)
7. [Testing Strategies](#testing-strategies)
8. [Migration Guidelines](#migration-guidelines)

---

## InputSignal Implementation

### 1. Constitutional Requirements

#### 1.1 Forbidden Patterns
- **NEVER** use `@Input()` decorators
- **NEVER** use `@Output()` decorators
- **MUST** use `InputSignal` and `OutputEmitterRef` instead
- **MUST** ensure type-safe component interfaces

#### 1.2 InputSignal Advantages (Angular v20)
InputSignal provides significant advantages over traditional `@Input()` decorators:
- **Type Safety**: Compile-time validation of required inputs
- **Signal Reactivity**: Automatic dependency tracking and change detection optimization
- **Performance**: More efficient than traditional input properties
- **Developer Experience**: Better IDE support and error messages

### 2. Basic InputSignal Patterns

#### 2.1 Required vs Optional Inputs
```typescript
// components/property-card.ts
export class PropertyCard {
  // ✅ REQUIRED: Use input.required() for mandatory data
  property = input.required<IProperty>();

  // ✅ OPTIONAL: Use input() with default values
  showFavoriteButton = input(true);
  displayMode = input<'card' | 'list' | 'grid'>('card');
  maxImages = input(5);

  // ✅ OPTIONAL: Complex default objects
  cardConfig = input<ICardConfig>({
    showPrice: true,
    showLocation: true,
    showImages: true,
    animationDuration: 300
  });

  // ❌ FORBIDDEN: @Input decorators
  // @Input() property!: IProperty;
  // @Input() showFavoriteButton = true;
}
```

#### 2.2 Input Transformations
```typescript
export class UserProfile {
  // ✅ Built-in transformers for common scenarios
  isActive = input(false, { transform: booleanAttribute });
  maxWidth = input(300, { transform: numberAttribute });

  // ✅ Custom transformation functions
  createdDate = input('', {
    transform: (value: string) => value ? new Date(value) : new Date()
  });

  // ✅ Complex transformation with validation
  priceRange = input<IPriceRange>({ min: 0, max: 1000000 }, {
    transform: (value: IPriceRange) => {
      // Validate and normalize price range
      const min = Math.max(0, value.min);
      const max = Math.max(min, value.max);
      return { min, max };
    }
  });

  // ✅ Array transformation
  tags = input<string[]>([], {
    transform: (value: string | string[]) =>
      Array.isArray(value) ? value : value.split(',').map(t => t.trim())
  });
}
```

#### 2.3 Computed Values from Inputs
```typescript
export class PropertyCard {
  property = input.required<IProperty>();
  showExtendedInfo = input(false);
  currency = input<'USD' | 'EUR' | 'HUF'>('USD');

  // ✅ REQUIRED: Use computed() for derived values
  displayPrice = computed(() => {
    const prop = this.property();
    const curr = this.currency();

    return this.formatPrice(prop.price, curr);
  });

  propertyTitle = computed(() => {
    const prop = this.property();
    const extended = this.showExtendedInfo();

    return extended
      ? `${prop.title} - ${prop.location}`
      : prop.title;
  });

  cardClasses = computed(() => ({
    'property-card': true,
    'property-card--featured': this.property().isFeatured,
    'property-card--sold': this.property().status === 'sold',
    'property-card--extended': this.showExtendedInfo()
  }));

  propertyFeatures = computed(() => {
    const prop = this.property();
    return prop.features.slice(0, this.maxFeatures());
  });

  private formatPrice(price: number, currency: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    });
    return formatter.format(price);
  }
}
```

### 3. Reactive Input Patterns

#### 3.1 Effects with Input Changes
```typescript
export class PropertyGallery {
  propertyId = input.required<string>();
  autoSlideInterval = input(5000);

  private autoSlideTimer?: ReturnType<typeof setInterval>;

  // ✅ Use effect() to react to input changes
  constructor() {
    // React to property changes
    effect(() => {
      const id = this.propertyId();
      if (id) {
        this.loadPropertyImages(id);
      }
    });

    // React to auto-slide interval changes
    effect(() => {
      const interval = this.autoSlideInterval();
      this.setupAutoSlide(interval);
    });
  }

  private loadPropertyImages(propertyId: string): void {
    // Load images logic
    console.log('Loading images for property:', propertyId);
  }

  private setupAutoSlide(interval: number): void {
    // Clear existing timer
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }

    // Set new timer if interval > 0
    if (interval > 0) {
      this.autoSlideTimer = setInterval(() => {
        this.nextSlide();
      }, interval);
    }
  }

  private nextSlide(): void {
    // Auto-slide logic
  }
}
```

---

## OutputEmitterRef Patterns

### 1. Basic Output Implementation

#### 1.1 Typed Output Definitions
```typescript
export class PropertyCard {
  property = input.required<IProperty>();

  // ✅ REQUIRED: Use output() with proper typing
  propertyClick = output<IProperty>();
  favoriteToggle = output<{ propertyId: string; isFavorite: boolean }>();
  imageLoad = output<{ propertyId: string; imageCount: number }>();

  // ✅ Void outputs for simple events
  cardExpand = output<void>();
  cardCollapse = output<void>();

  // ❌ FORBIDDEN: EventEmitter and @Output
  // @Output() propertyClick = new EventEmitter<IProperty>();
  // @Output() favoriteToggle = new EventEmitter<any>();

  // Event handlers
  handlePropertyClick(): void {
    this.propertyClick.emit(this.property());
  }

  handleFavoriteClick(event: MouseEvent): void {
    event.stopPropagation(); // Prevent property click

    const property = this.property();
    const newFavoriteState = !property.isFavorite;

    this.favoriteToggle.emit({
      propertyId: property.id,
      isFavorite: newFavoriteState
    });
  }

  handleImageLoadComplete(imageCount: number): void {
    this.imageLoad.emit({
      propertyId: this.property().id,
      imageCount
    });
  }
}
```

#### 1.2 Complex Event Patterns
```typescript
export class PropertySearchForm {
  // Complex search event with full context
  searchExecuted = output<ISearchEvent>();
  filterChanged = output<IFilterChangedEvent>();
  searchReset = output<void>();

  // Form state
  private searchForm = signal<ISearchFormData>({
    query: '',
    location: null,
    priceRange: { min: 0, max: 1000000 },
    propertyType: null,
    features: []
  });

  executeSearch(): void {
    const formData = this.searchForm();
    const searchEvent: ISearchEvent = {
      query: formData.query,
      filters: {
        location: formData.location,
        priceRange: formData.priceRange,
        propertyType: formData.propertyType,
        features: formData.features
      },
      timestamp: new Date(),
      searchId: crypto.randomUUID()
    };

    this.searchExecuted.emit(searchEvent);
  }

  updateFilter<K extends keyof IPropertyFilters>(
    filterKey: K,
    value: IPropertyFilters[K]
  ): void {
    const currentForm = this.searchForm();
    const updatedForm = {
      ...currentForm,
      [filterKey]: value
    };

    this.searchForm.set(updatedForm);

    // Emit filter change event with context
    this.filterChanged.emit({
      filterKey,
      value,
      allFilters: updatedForm,
      timestamp: new Date()
    });
  }

  resetSearch(): void {
    this.searchForm.set({
      query: '',
      location: null,
      priceRange: { min: 0, max: 1000000 },
      propertyType: null,
      features: []
    });

    this.searchReset.emit();
  }
}

// Type definitions
interface ISearchEvent {
  readonly query: string;
  readonly filters: IPropertyFilters;
  readonly timestamp: Date;
  readonly searchId: string;
}

interface IFilterChangedEvent {
  readonly filterKey: keyof IPropertyFilters;
  readonly value: unknown;
  readonly allFilters: ISearchFormData;
  readonly timestamp: Date;
}
```

### 2. Advanced Output Patterns

#### 2.1 Conditional and Debounced Outputs
```typescript
export class PropertySearchInput {
  searchQuery = output<string>();
  searchCleared = output<void>();

  private searchTerm = signal('');
  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Debounced search emission
    effect(() => {
      const term = this.searchTerm();

      // Clear existing timer
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }

      // Set new timer for debounced emission
      this.searchDebounceTimer = setTimeout(() => {
        if (term.length >= 2) { // Only emit if significant input
          this.searchQuery.emit(term);
        } else if (term.length === 0) {
          this.searchCleared.emit();
        }
      }, 300);
    });
  }

  updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }
}
```

#### 2.2 Validation and Error Outputs
```typescript
export class PropertyForm {
  // Multiple output types for different scenarios
  propertySubmitted = output<IProperty>();
  validationFailed = output<IValidationError[]>();
  formChanged = output<{ isValid: boolean; isDirty: boolean }>();

  private formData = signal<IPropertyFormData>({} as IPropertyFormData);
  private validationErrors = signal<IValidationError[]>([]);

  // Computed form validity
  private readonly isValid = computed(() =>
    this.validationErrors().length === 0
  );

  private readonly isDirty = computed(() =>
    // Compare with original data
    this.hasFormChanges(this.formData())
  );

  constructor() {
    // React to form changes
    effect(() => {
      const isValid = this.isValid();
      const isDirty = this.isDirty();

      this.formChanged.emit({ isValid, isDirty });
    });
  }

  updateProperty<K extends keyof IPropertyFormData>(
    field: K,
    value: IPropertyFormData[K]
  ): void {
    const currentData = this.formData();
    const updatedData = { ...currentData, [field]: value };

    this.formData.set(updatedData);

    // Validate and update errors
    const errors = this.validateProperty(field, value, updatedData);
    this.updateValidationErrors(field, errors);
  }

  submitProperty(): void {
    const formData = this.formData();
    const allErrors = this.validateAllFields(formData);

    if (allErrors.length > 0) {
      this.validationErrors.set(allErrors);
      this.validationFailed.emit(allErrors);
      return;
    }

    // Convert form data to property
    const property: IProperty = this.convertFormDataToProperty(formData);
    this.propertySubmitted.emit(property);
  }

  private validateProperty(
    field: keyof IPropertyFormData,
    value: unknown,
    allData: IPropertyFormData
  ): IValidationError[] {
    // Field-specific validation logic
    const errors: IValidationError[] = [];

    switch (field) {
      case 'title':
        if (typeof value !== 'string' || value.length < 3) {
          errors.push({
            field: 'title',
            message: 'Title must be at least 3 characters long',
            code: 'TITLE_TOO_SHORT'
          });
        }
        break;
      case 'price':
        if (typeof value !== 'number' || value <= 0) {
          errors.push({
            field: 'price',
            message: 'Price must be a positive number',
            code: 'INVALID_PRICE'
          });
        }
        break;
    }

    return errors;
  }
}
```

---

## Type-Safe Component Interfaces

### 1. Interface Design Principles

#### 1.1 Constitutional Compliance
```typescript
// ✅ REQUIRED: Define interfaces for all component data
interface IPropertyCardProps {
  readonly property: IProperty;
  readonly showFavoriteButton?: boolean;
  readonly displayMode?: 'card' | 'list' | 'grid';
  readonly maxImages?: number;
  readonly cardConfig?: ICardConfig;
}

interface IPropertyCardEvents {
  readonly propertyClick: IProperty;
  readonly favoriteToggle: {
    readonly propertyId: string;
    readonly isFavorite: boolean;
  };
  readonly imageLoad: {
    readonly propertyId: string;
    readonly imageCount: number;
  };
}

// ✅ Component implementation with strict typing
export class PropertyCard implements IPropertyCardProps {
  // Input signals with exact interface matching
  property = input.required<IProperty>();
  showFavoriteButton = input<boolean>(true);
  displayMode = input<'card' | 'list' | 'grid'>('card');
  maxImages = input<number>(5);
  cardConfig = input<ICardConfig>({
    showPrice: true,
    showLocation: true,
    showImages: true,
    animationDuration: 300
  });

  // Output signals with exact interface matching
  propertyClick = output<IProperty>();
  favoriteToggle = output<{
    propertyId: string;
    isFavorite: boolean;
  }>();
  imageLoad = output<{
    propertyId: string;
    imageCount: number;
  }>();
}
```

#### 1.2 Generic Component Interfaces
```typescript
// ✅ REQUIRED: Generic interfaces for reusable components
interface IListComponentProps<T> {
  readonly items: ReadonlyArray<T>;
  readonly itemTemplate?: string;
  readonly isLoading?: boolean;
  readonly emptyMessage?: string;
  readonly trackByFn?: (index: number, item: T) => unknown;
}

interface IListComponentEvents<T> {
  readonly itemClick: T;
  readonly itemSelect: { item: T; selected: boolean };
  readonly loadMore: void;
}

// Generic list component implementation
export class GenericList<T> implements IListComponentProps<T> {
  items = input.required<ReadonlyArray<T>>();
  itemTemplate = input<string>('default');
  isLoading = input<boolean>(false);
  emptyMessage = input<string>('No items found');
  trackByFn = input<(index: number, item: T) => unknown>(
    (index: number) => index
  );

  itemClick = output<T>();
  itemSelect = output<{ item: T; selected: boolean }>();
  loadMore = output<void>();

  // Type-safe item selection
  private selectedItems = signal<Set<T>>(new Set());

  readonly hasSelection = computed(() =>
    this.selectedItems().size > 0
  );

  handleItemClick(item: T): void {
    this.itemClick.emit(item);
  }

  toggleItemSelection(item: T): void {
    const current = this.selectedItems();
    const newSelection = new Set(current);

    const isSelected = current.has(item);
    if (isSelected) {
      newSelection.delete(item);
    } else {
      newSelection.add(item);
    }

    this.selectedItems.set(newSelection);
    this.itemSelect.emit({ item, selected: !isSelected });
  }
}
```

### 2. Validation and Runtime Type Checking

#### 2.1 Input Validation with Type Guards
```typescript
// Type guards for runtime validation
const isValidProperty = (value: unknown): value is IProperty => {
  return typeof value === 'object' &&
         value !== null &&
         'id' in value &&
         'title' in value &&
         'price' in value &&
         typeof (value as IProperty).id === 'string' &&
         typeof (value as IProperty).title === 'string' &&
         typeof (value as IProperty).price === 'number';
};

const isValidPriceRange = (value: unknown): value is IPriceRange => {
  return typeof value === 'object' &&
         value !== null &&
         'min' in value &&
         'max' in value &&
         typeof (value as IPriceRange).min === 'number' &&
         typeof (value as IPriceRange).max === 'number' &&
         (value as IPriceRange).min <= (value as IPriceRange).max;
};

export class ValidatedPropertyCard {
  // ✅ Input validation with type guards
  property = input.required<IProperty>({
    transform: (value: unknown) => {
      if (!isValidProperty(value)) {
        throw new Error(`Invalid property data: ${JSON.stringify(value)}`);
      }
      return value;
    }
  });

  priceRange = input<IPriceRange>({ min: 0, max: 1000000 }, {
    transform: (value: unknown) => {
      if (!isValidPriceRange(value)) {
        console.warn(`Invalid price range, using default:`, value);
        return { min: 0, max: 1000000 };
      }
      return value;
    }
  });

  // Computed validation status
  readonly isValidData = computed(() => {
    const prop = this.property();
    const range = this.priceRange();

    return isValidProperty(prop) &&
           isValidPriceRange(range) &&
           prop.price >= range.min &&
           prop.price <= range.max;
  });
}
```

### 3. Component Contract Enforcement

#### 3.1 Design-by-Contract Pattern
```typescript
// Component contract interfaces
interface IComponentContract<TProps, TEvents> {
  readonly props: TProps;
  readonly events: TEvents;
  readonly validation: IValidationRules<TProps>;
}

interface IValidationRules<T> {
  readonly required: ReadonlyArray<keyof T>;
  readonly validators: Partial<Record<keyof T, (value: unknown) => boolean>>;
}

// Contract implementation
const PropertyCardContract: IComponentContract<
  IPropertyCardProps,
  IPropertyCardEvents
> = {
  props: {
    property: {} as IProperty,
    showFavoriteButton: true,
    displayMode: 'card',
    maxImages: 5,
    cardConfig: {
      showPrice: true,
      showLocation: true,
      showImages: true,
      animationDuration: 300
    }
  },
  events: {
    propertyClick: {} as IProperty,
    favoriteToggle: { propertyId: '', isFavorite: false },
    imageLoad: { propertyId: '', imageCount: 0 }
  },
  validation: {
    required: ['property'],
    validators: {
      property: isValidProperty,
      maxImages: (value) => typeof value === 'number' && value > 0,
      displayMode: (value) =>
        ['card', 'list', 'grid'].includes(value as string)
    }
  }
};

// Contract-based component
export class ContractPropertyCard {
  // Contract validation in development
  constructor() {
    if (process.env['NODE_ENV'] === 'development') {
      this.validateContract();
    }
  }

  property = input.required<IProperty>();
  showFavoriteButton = input<boolean>(true);
  displayMode = input<'card' | 'list' | 'grid'>('card');

  propertyClick = output<IProperty>();
  favoriteToggle = output<{ propertyId: string; isFavorite: boolean }>();

  private validateContract(): void {
    const contract = PropertyCardContract;

    // Validate required inputs exist
    contract.validation.required.forEach(prop => {
      if (!(prop in this)) {
        throw new Error(`Missing required property: ${String(prop)}`);
      }
    });

    // Additional contract validation...
  }
}
```

---

## Content Projection Patterns

### 1. Angular v20 Content Projection

#### 1.1 Signal-Based Content Queries
```typescript
export class CardContainer {
  title = input<string>('');

  // ✅ REQUIRED: Use contentChild() and contentChildren() signals
  cardHeader = contentChild<ElementRef>('cardHeader');
  cardActions = contentChildren<ElementRef>('cardAction');

  // ❌ FORBIDDEN: Decorator-based content queries
  // @ContentChild('cardHeader') cardHeader!: ElementRef;
  // @ContentChildren('cardAction') cardActions!: QueryList<ElementRef>;

  // Computed values from content queries
  readonly hasHeader = computed(() =>
    this.cardHeader() !== undefined
  );

  readonly hasActions = computed(() =>
    this.cardActions().length > 0
  );

  readonly cardClasses = computed(() => ({
    'card': true,
    'card--with-header': this.hasHeader(),
    'card--with-actions': this.hasActions()
  }));
}
```

```html
<!-- card-container.html -->
<div [class]="cardClasses()">
  <!-- Dynamic header projection -->
  @if (hasHeader()) {
    <div class="card__header">
      <ng-content select="[cardHeader]"></ng-content>
    </div>
  }

  <!-- Main content -->
  <div class="card__content">
    <ng-content></ng-content>
  </div>

  <!-- Action buttons -->
  @if (hasActions()) {
    <div class="card__actions">
      <ng-content select="[cardAction]"></ng-content>
    </div>
  }
</div>
```

#### 1.2 Multi-Slot Content Projection
```typescript
export class PropertyLayout {
  layout = input<'sidebar' | 'full' | 'split'>('full');

  // Content projections for different slots
  sidebarContent = contentChild<ElementRef>('sidebar');
  mainContent = contentChild<ElementRef>('main');
  footerContent = contentChild<ElementRef>('footer');

  readonly layoutClasses = computed(() => ({
    'property-layout': true,
    [`property-layout--${this.layout()}`]: true,
    'property-layout--has-sidebar': this.sidebarContent() !== undefined,
    'property-layout--has-footer': this.footerContent() !== undefined
  }));

  readonly shouldShowSidebar = computed(() =>
    this.layout() !== 'full' && this.sidebarContent() !== undefined
  );
}
```

```html
<!-- property-layout.html -->
<div [class]="layoutClasses()">
  <!-- Conditional sidebar -->
  @if (shouldShowSidebar()) {
    <aside class="property-layout__sidebar">
      <ng-content select="[sidebar]"></ng-content>
    </aside>
  }

  <!-- Main content area -->
  <main class="property-layout__main">
    <ng-content select="[main]"></ng-content>
  </main>

  <!-- Optional footer -->
  @if (footerContent()) {
    <footer class="property-layout__footer">
      <ng-content select="[footer]"></ng-content>
    </footer>
  }
</div>
```

### 2. Dynamic Content Projection

#### 2.1 Template Outlet Patterns
```typescript
export class DynamicList<T> {
  items = input.required<ReadonlyArray<T>>();

  // Template references for different item types
  defaultTemplate = contentChild<TemplateRef<any>>('defaultItem');
  headerTemplate = contentChild<TemplateRef<any>>('headerItem');
  footerTemplate = contentChild<TemplateRef<any>>('footerItem');

  // Template selection logic
  getTemplateForItem(item: T, index: number): TemplateRef<any> | undefined {
    if (index === 0 && this.headerTemplate()) {
      return this.headerTemplate();
    }

    if (index === this.items().length - 1 && this.footerTemplate()) {
      return this.footerTemplate();
    }

    return this.defaultTemplate();
  }

  // Context for template variables
  getContextForItem(item: T, index: number) {
    return {
      $implicit: item,
      item,
      index,
      first: index === 0,
      last: index === this.items().length - 1,
      even: index % 2 === 0,
      odd: index % 2 !== 0
    };
  }
}
```

```html
<!-- dynamic-list.html -->
<div class="dynamic-list">
  @for (item of items(); track item.id; let i = $index) {
    <div class="dynamic-list__item">
      @if (getTemplateForItem(item, i); as template) {
        <ng-container
          [ngTemplateOutlet]="template"
          [ngTemplateOutletContext]="getContextForItem(item, i)"
        ></ng-container>
      } @else {
        <!-- Fallback content -->
        <span>{{ item }}</span>
      }
    </div>
  }
</div>
```

Usage:
```html
<app-dynamic-list [items]="properties">
  <!-- Header template -->
  <ng-template #headerItem let-item let-index="index">
    <h3>Featured Property: {{ item.title }}</h3>
  </ng-template>

  <!-- Default item template -->
  <ng-template #defaultItem let-item let-index="index">
    <div class="property-item">
      <h4>{{ item.title }}</h4>
      <p>{{ item.price | currency }}</p>
    </div>
  </ng-template>

  <!-- Footer template -->
  <ng-template #footerItem let-item>
    <div class="property-footer">
      <p>Last property: {{ item.title }}</p>
    </div>
  </ng-template>
</app-dynamic-list>
```

---

## Advanced Communication Patterns

### 1. Component Composition

#### 1.1 Higher-Order Component Pattern
```typescript
// Base composable interface
interface IComposableComponent {
  readonly isLoading: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly data: Signal<unknown>;
}

// Loading behavior composition
export const withLoadingState = <T extends {}>(Base: T) => {
  return class extends (Base as any) implements IComposableComponent {
    isLoading = signal(false);
    error = signal<string | null>(null);
    data = signal<unknown>(null);

    protected setLoading(loading: boolean): void {
      this.isLoading.set(loading);
    }

    protected setError(error: string | null): void {
      this.error.set(error);
    }

    protected setData(data: unknown): void {
      this.data.set(data);
      this.error.set(null);
    }
  };
};

// Composed component
@Component({
  selector: 'app-property-list',
  template: `
    @if (isLoading()) {
      <div class="loading">Loading properties...</div>
    }
    @if (error()) {
      <div class="error">{{ error() }}</div>
    }
    @if (properties()) {
      <div class="property-list">
        @for (property of properties(); track property.id) {
          <app-property-card [property]="property" />
        }
      </div>
    }
  `
})
export class PropertyList extends withLoadingState(class {}) {
  properties = computed(() => this.data() as IProperty[] || []);

  private readonly propertyService = inject(PropertyService);

  ngOnInit(): void {
    this.loadProperties();
  }

  private async loadProperties(): Promise<void> {
    try {
      this.setLoading(true);
      const properties = await this.propertyService.getProperties();
      this.setData(properties);
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.setLoading(false);
    }
  }
}
```

### 2. Event Bus Pattern with Signals

#### 2.1 Type-Safe Event Bus
```typescript
// Global event types
interface IGlobalEvents {
  'property:selected': { property: IProperty; source: string };
  'user:preferences-changed': { preferences: IUserPreferences };
  'notification:show': { message: string; type: 'info' | 'warning' | 'error' };
  'search:executed': { query: string; filters: IPropertyFilters };
}

// Type-safe event bus service
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private readonly events = new Map<keyof IGlobalEvents, Signal<any>>();
  private readonly emitters = new Map<keyof IGlobalEvents, WritableSignal<any>>();

  // Get signal for specific event type
  getEvent<K extends keyof IGlobalEvents>(
    eventType: K
  ): Signal<IGlobalEvents[K] | null> {
    if (!this.events.has(eventType)) {
      const emitter = signal<IGlobalEvents[K] | null>(null);
      this.events.set(eventType, emitter);
      this.emitters.set(eventType, emitter);
    }
    return this.events.get(eventType)!;
  }

  // Emit event with type safety
  emit<K extends keyof IGlobalEvents>(
    eventType: K,
    data: IGlobalEvents[K]
  ): void {
    const emitter = this.emitters.get(eventType);
    if (emitter) {
      emitter.set(data);

      // Clear after emission to allow re-emission detection
      setTimeout(() => emitter.set(null), 0);
    }
  }

  // Subscribe to events with automatic cleanup
  subscribe<K extends keyof IGlobalEvents>(
    eventType: K,
    handler: (data: IGlobalEvents[K]) => void,
    destroyRef: DestroyRef
  ): void {
    const eventSignal = this.getEvent(eventType);

    const subscription = effect(() => {
      const eventData = eventSignal();
      if (eventData !== null) {
        handler(eventData);
      }
    });

    // Auto-cleanup on component destroy
    destroyRef.onDestroy(() => {
      // Effect automatically cleans up
    });
  }
}

// Usage in components
export class PropertyCard {
  property = input.required<IProperty>();

  private readonly eventBus = inject(EventBusService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // Listen for global events
    this.eventBus.subscribe(
      'user:preferences-changed',
      (data) => this.handlePreferencesChanged(data.preferences),
      this.destroyRef
    );
  }

  handlePropertyClick(): void {
    // Emit global event
    this.eventBus.emit('property:selected', {
      property: this.property(),
      source: 'property-card'
    });
  }

  private handlePreferencesChanged(preferences: IUserPreferences): void {
    // React to global preference changes
    console.log('User preferences changed:', preferences);
  }
}
```

---

## Performance Optimization

### 1. Change Detection Optimization

#### 1.1 OnPush with Signals
```typescript
@Component({
  selector: 'app-optimized-property-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (property of displayProperties(); track trackProperty) {
      <app-property-card
        [property]="property"
        [showFavorites]="showFavorites()"
        (propertyClick)="handlePropertyClick($event)"
      />
    }
  `
})
export class OptimizedPropertyList {
  properties = input.required<ReadonlyArray<IProperty>>();
  searchQuery = input<string>('');
  showFavorites = input<boolean>(true);

  // ✅ Optimized: Computed values automatically optimize re-renders
  displayProperties = computed(() => {
    const props = this.properties();
    const query = this.searchQuery().toLowerCase();

    if (!query) return props;

    return props.filter(property =>
      property.title.toLowerCase().includes(query) ||
      property.location.toLowerCase().includes(query)
    );
  });

  // ✅ Optimized: Stable track function
  readonly trackProperty = (index: number, property: IProperty) => property.id;

  // Event handlers
  handlePropertyClick(property: IProperty): void {
    console.log('Property clicked:', property.id);
  }
}
```

#### 1.2 Lazy Loading Content
```typescript
export class LazyPropertyGallery {
  propertyId = input.required<string>();

  // Lazy loading state
  private readonly isVisible = signal(false);
  private readonly images = signal<IPropertyImage[]>([]);

  // Only load when visible
  readonly shouldLoadImages = computed(() =>
    this.isVisible() && this.images().length === 0
  );

  constructor() {
    // Load images when component becomes visible
    effect(() => {
      if (this.shouldLoadImages()) {
        this.loadImages();
      }
    });
  }

  // Intersection observer for lazy loading
  onVisibilityChange(isVisible: boolean): void {
    this.isVisible.set(isVisible);
  }

  private async loadImages(): Promise<void> {
    const propertyId = this.propertyId();
    const images = await this.propertyService.getPropertyImages(propertyId);
    this.images.set(images);
  }
}
```

### 2. Memory Management

#### 2.1 Automatic Cleanup with Effects
```typescript
export class AutoCleanupComponent {
  private readonly websocketService = inject(WebSocketService);
  private readonly destroyRef = inject(DestroyRef);

  // ✅ Effects automatically cleanup
  constructor() {
    // WebSocket connection effect
    effect(() => {
      const connection = this.websocketService.connect();

      // Cleanup happens automatically when effect re-runs or component destroys
      this.destroyRef.onDestroy(() => {
        connection.disconnect();
      });
    });
  }
}
```

---

## Testing Strategies

### 1. Signal Component Testing

#### 1.1 InputSignal Testing
```typescript
describe('PropertyCard', () => {
  let component: PropertyCard;
  let fixture: ComponentFixture<PropertyCard>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PropertyCard]
    });

    fixture = TestBed.createComponent(PropertyCard);
    component = fixture.componentInstance;
  });

  it('should set required property input', () => {
    const mockProperty = createMockProperty();

    // Set signal input
    fixture.componentRef.setInput('property', mockProperty);
    fixture.detectChanges();

    // Verify signal value
    expect(component.property()).toEqual(mockProperty);
  });

  it('should compute display price correctly', () => {
    const mockProperty = createMockProperty({ price: 500000 });

    fixture.componentRef.setInput('property', mockProperty);
    fixture.componentRef.setInput('currency', 'USD');
    fixture.detectChanges();

    expect(component.displayPrice()).toContain('$500,000');
  });

  it('should handle input transformations', () => {
    fixture.componentRef.setInput('isActive', 'true'); // String input
    fixture.detectChanges();

    expect(component.isActive()).toBe(true); // Transformed to boolean
  });
});
```

#### 1.2 OutputEmitterRef Testing
```typescript
describe('PropertyCard Outputs', () => {
  let component: PropertyCard;
  let fixture: ComponentFixture<PropertyCard>;

  it('should emit property click event', () => {
    const mockProperty = createMockProperty();
    fixture.componentRef.setInput('property', mockProperty);

    // Spy on output
    spyOn(component.propertyClick, 'emit');

    // Trigger click
    component.handlePropertyClick();

    expect(component.propertyClick.emit).toHaveBeenCalledWith(mockProperty);
  });

  it('should emit favorite toggle with correct data', () => {
    const mockProperty = createMockProperty({ id: 'prop1', isFavorite: false });
    fixture.componentRef.setInput('property', mockProperty);

    spyOn(component.favoriteToggle, 'emit');

    component.handleFavoriteClick(new MouseEvent('click'));

    expect(component.favoriteToggle.emit).toHaveBeenCalledWith({
      propertyId: 'prop1',
      isFavorite: true
    });
  });
});
```

### 2. Integration Testing

#### 2.1 Parent-Child Communication Testing
```typescript
describe('PropertyList Integration', () => {
  let parentComponent: PropertyList;
  let childComponent: PropertyCard;
  let fixture: ComponentFixture<PropertyList>;

  it('should handle child component events', () => {
    const mockProperties = [createMockProperty()];
    fixture.componentRef.setInput('properties', mockProperties);
    fixture.detectChanges();

    // Get child component
    const childDebugElement = fixture.debugElement.query(
      By.directive(PropertyCard)
    );
    childComponent = childDebugElement.componentInstance;

    // Spy on parent method
    spyOn(parentComponent, 'handlePropertySelected');

    // Trigger child event
    childComponent.propertyClick.emit(mockProperties[0]);

    expect(parentComponent.handlePropertySelected)
      .toHaveBeenCalledWith(mockProperties[0]);
  });
});
```

---

## Migration Guidelines

### 1. From @Input/@Output to Signals

#### 1.1 Step-by-Step Migration
```typescript
// Phase 1: Existing component with decorators
export class LegacyPropertyCard {
  @Input() property!: IProperty;
  @Input() showFavorites = true;
  @Output() propertyClick = new EventEmitter<IProperty>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property']) {
      this.updateDisplayData();
    }
  }

  private updateDisplayData(): void {
    // React to property changes
  }
}

// Phase 2: Migrated to signals
export class ModernPropertyCard {
  // ✅ Replace @Input with input signals
  property = input.required<IProperty>();
  showFavorites = input<boolean>(true);

  // ✅ Replace @Output with output signals
  propertyClick = output<IProperty>();

  // ✅ Replace ngOnChanges with effects
  constructor() {
    effect(() => {
      const property = this.property();
      this.updateDisplayData();
    });
  }

  private updateDisplayData(): void {
    // React to property changes
  }
}
```

### 2. Template Migration

#### 2.1 Template Binding Updates
```html
<!-- Before: Traditional binding -->
<app-property-card
  [property]="selectedProperty"
  [showFavorites]="userPreferences.showFavorites"
  (propertyClick)="onPropertySelected($event)"
>
</app-property-card>

<!-- After: Signal-based binding (same syntax) -->
<app-property-card
  [property]="selectedProperty()"
  [showFavorites]="userPreferences().showFavorites"
  (propertyClick)="onPropertySelected($event)"
>
</app-property-card>
```

---

## Conclusion

This Component Communication documentation establishes the foundation for modern, type-safe component architecture in the Archland.hu Angular application. The key principles ensure:

- **Signal-First Design**: Use InputSignal and OutputEmitterRef for all component communication
- **Type Safety**: Enforce strict typing through interfaces and validation patterns
- **Performance**: Leverage signal-based reactivity for optimal change detection
- **Composability**: Design components for maximum reusability and maintainability
- **Modern Patterns**: Align with Angular v20 best practices and future-proof architecture

**Implementation Priority**:
1. Replace all @Input/@Output decorators with signal-based alternatives
2. Implement type-safe component interfaces from the start
3. Use content projection patterns for flexible component composition
4. Apply performance optimization techniques systematically

---

**Document Information**
- **Authority**: Archland.hu Constitution Section III
- **Review Cycle**: Quarterly (aligned with Angular releases)
- **Stakeholders**: Frontend developers, component architects, UX engineers
- **Related Documents**: [Framework Standards Best Practices], [State Management Best Practices], [Type Safety Guidelines]