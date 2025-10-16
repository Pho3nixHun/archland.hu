# Type Safety - Best Practices Guide

> **Constitutional Reference**: Section V. Type Safety (NON-NEGOTIABLE)
> **Version**: 1.0.0
> **Last Updated**: 2025-09-26
> **Sources**: TypeScript.org official documentation, Angular team recommendations, TypeScript 5.8 release notes

This document provides comprehensive best practices for the Type Safety section of the Archland.hu Constitution, covering strict TypeScript configuration, avoiding `any` types, eliminating type casting, and implementing proper type guards.

## Table of Contents
1. [Constitutional Requirements](#constitutional-requirements)
2. [Strict TypeScript Configuration](#strict-typescript-configuration)
3. [Alternatives to Any Type](#alternatives-to-any-type)
4. [Type Guards and Safe Conversions](#type-guards-and-safe-conversions)
5. [TypeScript 5.8+ Advanced Features](#typescript-58-advanced-features)
6. [Angular-Specific Type Safety](#angular-specific-type-safety)
7. [Testing Type Safety](#testing-type-safety)
8. [Migration Strategies](#migration-strategies)

---

## Constitutional Requirements

### 1. Non-Negotiable Rules

#### 1.1 Absolute Prohibitions
- **NEVER** use `any` as a type
- **NEVER** use type casting (`as string`, `as MyInterface`)
- **ALWAYS** use proper type guards for type conversion
- **MUST** maintain strict TypeScript configuration enforced

#### 1.2 Core Principles
Type safety is **NON-NEGOTIABLE** because it:
- **Eliminates Runtime Errors**: Converts potential runtime failures into compile-time errors
- **Enhances Code Quality**: Improves maintainability and reduces debugging time
- **Enables Refactoring**: Provides confidence when changing code structure
- **Improves Developer Experience**: Better IDE support, autocomplete, and error detection
- **Prevents Production Issues**: Catches bugs before they reach users

### 2. Benefits of Strict Type Safety

#### 2.1 Error Prevention
Turn runtime errors into compile-time errors. Every error that can be found before the code runs in production is an error that will never show up to your users.

#### 2.2 Enhanced Developer Productivity
- **Better IDE Support**: Intelligent autocomplete, navigation, and refactoring
- **Self-Documenting Code**: Types serve as documentation
- **Faster Debugging**: TypeScript points directly to the source of type-related issues
- **Confident Refactoring**: Type system validates changes across the entire codebase

---

## Strict TypeScript Configuration

### 1. Required tsconfig.json Configuration

#### 1.1 Basic Strict Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // ✅ REQUIRED: Strict mode family
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    // ✅ REQUIRED: Additional safety checks
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    // ✅ TypeScript 5.8+ features
    "useUnknownInCatchVariables": true,
    "noErrorTruncation": true
  },

  // ✅ REQUIRED: Angular compiler options
  "angularCompilerOptions": {
    "strictTemplates": true,
    "strictInputAccessModifiers": true,
    "strictInputTypes": true,
    "strictNullInputTypes": true,
    "strictAttributeTypes": true,
    "strictSafeNavigationTypes": true,
    "strictDomLocalRefTypes": true,
    "strictOutputEventTypes": true,
    "strictDomEventTypes": true,
    "strictContextGenerics": true,
    "strictLiteralTypes": true,
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true
  }
}
```

#### 1.2 ESLint Configuration for Type Safety
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    // ✅ REQUIRED: Enforce no any usage
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",

    // ✅ REQUIRED: Ban type assertions
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      {
        "assertionStyle": "never"
      }
    ],

    // ✅ REQUIRED: Enforce proper type definitions
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/typedef": [
      "error",
      {
        "variableDeclaration": true,
        "variableDeclarationIgnoreFunction": false
      }
    ]
  }
}
```

### 2. Gradual Migration Strategy

#### 2.1 Feature-by-Feature Enablement
```typescript
// ✅ REQUIRED: Migration approach for existing projects

// Phase 1: Enable basic strict checks
interface IMigrationPhase1 {
  readonly strict: true;
  readonly noImplicitAny: true;
  readonly strictNullChecks: false; // Enable in Phase 2
}

// Phase 2: Enable null checking
interface IMigrationPhase2 extends IMigrationPhase1 {
  readonly strictNullChecks: true;
  readonly strictFunctionTypes: true;
}

// Phase 3: Full strict mode
interface IMigrationPhase3 extends IMigrationPhase2 {
  readonly noImplicitReturns: true;
  readonly noFallthroughCasesInSwitch: true;
  readonly exactOptionalPropertyTypes: true;
}
```

---

## Alternatives to Any Type

### 1. Use `unknown` Instead of `any`

#### 1.1 Basic Unknown Usage
```typescript
// ✅ REQUIRED: Use unknown for uncertain types
const processApiResponse = (response: unknown): IProcessedData => {
  // Must perform type checking before using
  if (isValidApiResponse(response)) {
    return {
      id: response.id,
      title: response.title,
      data: response.data
    };
  }

  throw new Error('Invalid API response format');
};

// ❌ FORBIDDEN: Using any
const processApiResponseBad = (response: any): IProcessedData => {
  // No type checking - dangerous!
  return {
    id: response.id,
    title: response.title,
    data: response.data
  };
};
```

#### 1.2 Unknown with Type Narrowing
```typescript
// ✅ REQUIRED: Proper unknown handling
const handleUserInput = (input: unknown): string => {
  if (typeof input === 'string') {
    // TypeScript knows input is string here
    return input.toUpperCase();
  }

  if (typeof input === 'number') {
    // TypeScript knows input is number here
    return input.toString();
  }

  if (input && typeof input === 'object' && 'toString' in input) {
    // Safe object property access
    return String(input.toString);
  }

  return 'Invalid input';
};

// ✅ Advanced unknown handling with validation
const parseJsonSafely = <T>(json: string, validator: (value: unknown) => value is T): T | null => {
  try {
    const parsed: unknown = JSON.parse(json);

    if (validator(parsed)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
};

// Usage example
const userValidator = (value: unknown): value is IUser => {
  return typeof value === 'object' &&
         value !== null &&
         'id' in value &&
         'name' in value &&
         typeof (value as IUser).id === 'string' &&
         typeof (value as IUser).name === 'string';
};

const userData: IUser | null = parseJsonSafely(jsonString, userValidator);
```

### 2. Specific Type Alternatives

#### 2.1 Generic Types
```typescript
// ✅ REQUIRED: Use generics instead of any
interface IDataProcessor<TInput, TOutput> {
  readonly process: (input: TInput) => TOutput;
  readonly validate: (input: unknown) => input is TInput;
}

class PropertyDataProcessor implements IDataProcessor<IRawProperty, IProperty> {
  readonly process = (input: IRawProperty): IProperty => ({
    id: input.id,
    title: input.title.trim(),
    price: Math.max(0, input.price),
    location: input.location.trim(),
    images: input.images?.filter(img => img.url) || [],
    features: input.features?.map(f => f.toLowerCase()) || [],
    createdAt: new Date(input.createdAt),
    updatedAt: new Date(input.updatedAt)
  });

  readonly validate = (input: unknown): input is IRawProperty => {
    return typeof input === 'object' &&
           input !== null &&
           'id' in input &&
           'title' in input &&
           'price' in input &&
           typeof (input as IRawProperty).id === 'string' &&
           typeof (input as IRawProperty).title === 'string' &&
           typeof (input as IRawProperty).price === 'number';
  };
}
```

#### 2.2 Union Types
```typescript
// ✅ REQUIRED: Use union types for multiple possibilities
type ApiResponse<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

type PropertyStatus = 'available' | 'sold' | 'under-contract' | 'off-market';

type SortDirection = 'asc' | 'desc';

// ✅ Discriminated unions for complex scenarios
interface ILoadingState {
  readonly status: 'loading';
}

interface ISuccessState<T> {
  readonly status: 'success';
  readonly data: T;
}

interface IErrorState {
  readonly status: 'error';
  readonly error: string;
}

type AsyncState<T> = ILoadingState | ISuccessState<T> | IErrorState;

// Usage with exhaustive checking
const handleAsyncState = <T>(state: AsyncState<T>): string => {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Loaded ${JSON.stringify(state.data)}`;
    case 'error':
      return `Error: ${state.error}`;
    default:
      // TypeScript ensures this is never reached
      const _exhaustiveCheck: never = state;
      return _exhaustiveCheck;
  }
};
```

#### 2.3 Record and Index Types
```typescript
// ✅ REQUIRED: Use Record instead of any object
type PropertyFilters = Record<string, string | number | boolean>;

interface IPropertySearchParams {
  readonly filters: Record<keyof IProperty, string>;
  readonly sorting: Record<string, SortDirection>;
  readonly pagination: Record<'page' | 'limit', number>;
}

// ✅ More specific record types
type UserPreferences = Record<
  'theme' | 'language' | 'notifications',
  string | boolean
>;

type ApiEndpoints = Record<
  'properties' | 'users' | 'auth',
  string
>;

// ✅ Index signatures with constraints
interface IConfigurable {
  [key: string]: string | number | boolean;
}

// Better: specific keys with index signature fallback
interface IAppConfig {
  readonly apiUrl: string;
  readonly timeout: number;
  readonly debugMode: boolean;
  // Allow additional string keys
  readonly [key: string]: string | number | boolean;
}
```

---

## Type Guards and Safe Conversions

### 1. User-Defined Type Guards

#### 1.1 Basic Type Guard Patterns
```typescript
// ✅ REQUIRED: Type guards for runtime type checking

// Primitive type guards
const isString = (value: unknown): value is string =>
  typeof value === 'string';

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean';

const isArray = <T>(value: unknown, itemGuard: (item: unknown) => item is T): value is T[] =>
  Array.isArray(value) && value.every(itemGuard);

// Object type guards
const isProperty = (value: unknown): value is IProperty => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return isString(obj.id) &&
         isString(obj.title) &&
         isNumber(obj.price) &&
         isString(obj.location) &&
         obj.price > 0 &&
         obj.title.length > 0;
};

const isPropertyArray = (value: unknown): value is IProperty[] =>
  isArray(value, isProperty);
```

#### 1.2 Complex Type Guards
```typescript
// ✅ REQUIRED: Complex validation with detailed type guards
interface IPropertyValidationOptions {
  readonly strict?: boolean;
  readonly allowEmptyImages?: boolean;
  readonly requiredFeatures?: ReadonlyArray<string>;
}

const createPropertyValidator = (
  options: IPropertyValidationOptions = {}
) => (value: unknown): value is IProperty => {
  if (!isProperty(value)) {
    return false;
  }

  const { strict = false, allowEmptyImages = true, requiredFeatures = [] } = options;

  // Strict validation
  if (strict) {
    // Check date fields
    if (!(value.createdAt instanceof Date) || !(value.updatedAt instanceof Date)) {
      return false;
    }

    // Check image array
    if (!allowEmptyImages && (!value.images || value.images.length === 0)) {
      return false;
    }

    // Check required features
    if (requiredFeatures.length > 0) {
      const hasRequiredFeatures = requiredFeatures.every(feature =>
        value.features.includes(feature)
      );
      if (!hasRequiredFeatures) {
        return false;
      }
    }
  }

  return true;
};

// Usage
const isValidProperty = createPropertyValidator({ strict: true });
const isBasicProperty = createPropertyValidator();
```

#### 1.3 API Response Type Guards
```typescript
// ✅ REQUIRED: API response validation
interface IApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: string;
}

const isApiResponse = <T>(
  value: unknown,
  dataGuard: (data: unknown) => data is T
): value is IApiResponse<T> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check required fields
  if (!isBoolean(obj.success) || !isString(obj.timestamp)) {
    return false;
  }

  // Validate success case
  if (obj.success) {
    return obj.data !== undefined && dataGuard(obj.data);
  }

  // Validate error case
  return isString(obj.error);
};

// Usage examples
const validatePropertyResponse = (response: unknown): response is IApiResponse<IProperty> =>
  isApiResponse(response, isProperty);

const validatePropertyListResponse = (response: unknown): response is IApiResponse<IProperty[]> =>
  isApiResponse(response, isPropertyArray);

// In service methods
export class PropertyService {
  private readonly http = inject(HttpClient);

  readonly getProperty = (id: string): Observable<IProperty> =>
    this.http.get<unknown>(`/api/properties/${id}`).pipe(
      map(response => {
        if (validatePropertyResponse(response)) {
          return response.data;
        }
        throw new Error('Invalid property response format');
      })
    );
}
```

### 2. Discriminated Union Type Guards

#### 2.1 Action-Based Discriminated Unions
```typescript
// ✅ REQUIRED: Discriminated unions for state management
interface ILoadPropertiesAction {
  readonly type: 'LOAD_PROPERTIES';
  readonly payload: {
    readonly filters: IPropertyFilters;
  };
}

interface ILoadPropertiesSuccessAction {
  readonly type: 'LOAD_PROPERTIES_SUCCESS';
  readonly payload: {
    readonly properties: ReadonlyArray<IProperty>;
  };
}

interface ILoadPropertiesFailureAction {
  readonly type: 'LOAD_PROPERTIES_FAILURE';
  readonly payload: {
    readonly error: string;
  };
}

type PropertyAction =
  | ILoadPropertiesAction
  | ILoadPropertiesSuccessAction
  | ILoadPropertiesFailureAction;

// Type guards for each action
const isLoadPropertiesAction = (action: PropertyAction): action is ILoadPropertiesAction =>
  action.type === 'LOAD_PROPERTIES';

const isLoadPropertiesSuccessAction = (action: PropertyAction): action is ILoadPropertiesSuccessAction =>
  action.type === 'LOAD_PROPERTIES_SUCCESS';

const isLoadPropertiesFailureAction = (action: PropertyAction): action is ILoadPropertiesFailureAction =>
  action.type === 'LOAD_PROPERTIES_FAILURE';

// Usage in reducers or handlers
const handlePropertyAction = (action: PropertyAction): void => {
  if (isLoadPropertiesAction(action)) {
    // TypeScript knows this is ILoadPropertiesAction
    console.log('Loading properties with filters:', action.payload.filters);
  } else if (isLoadPropertiesSuccessAction(action)) {
    // TypeScript knows this is ILoadPropertiesSuccessAction
    console.log('Properties loaded:', action.payload.properties.length);
  } else if (isLoadPropertiesFailureAction(action)) {
    // TypeScript knows this is ILoadPropertiesFailureAction
    console.error('Properties failed to load:', action.payload.error);
  }
};
```

### 3. Error Handling with Type Guards

#### 3.1 Safe Error Processing
```typescript
// ✅ REQUIRED: Type-safe error handling
interface IKnownError {
  readonly name: string;
  readonly message: string;
  readonly code?: string;
}

interface IValidationError extends IKnownError {
  readonly name: 'ValidationError';
  readonly field: string;
  readonly value: unknown;
}

interface INetworkError extends IKnownError {
  readonly name: 'NetworkError';
  readonly status: number;
  readonly url: string;
}

type ApplicationError = IValidationError | INetworkError | IKnownError;

// Type guards for error types
const isError = (value: unknown): value is Error =>
  value instanceof Error;

const isKnownError = (error: unknown): error is IKnownError =>
  typeof error === 'object' &&
  error !== null &&
  'name' in error &&
  'message' in error &&
  typeof (error as IKnownError).name === 'string' &&
  typeof (error as IKnownError).message === 'string';

const isValidationError = (error: unknown): error is IValidationError =>
  isKnownError(error) &&
  error.name === 'ValidationError' &&
  'field' in error &&
  'value' in error;

const isNetworkError = (error: unknown): error is INetworkError =>
  isKnownError(error) &&
  error.name === 'NetworkError' &&
  'status' in error &&
  'url' in error &&
  typeof (error as INetworkError).status === 'number' &&
  typeof (error as INetworkError).url === 'string';

// Safe error handling
const handleError = (error: unknown): string => {
  if (isValidationError(error)) {
    return `Validation failed for field '${error.field}': ${error.message}`;
  }

  if (isNetworkError(error)) {
    return `Network error (${error.status}): ${error.message} at ${error.url}`;
  }

  if (isKnownError(error)) {
    return `${error.name}: ${error.message}`;
  }

  if (isError(error)) {
    return `Unexpected error: ${error.message}`;
  }

  return `Unknown error: ${String(error)}`;
};
```

---

## TypeScript 5.8+ Advanced Features

### 1. Enhanced Type Safety Features

#### 1.1 Uninitialized Variable Detection
```typescript
// ✅ TypeScript 5.8 detects uninitialized variables
class PropertyManager {
  private properties: IProperty[]; // ❌ Error: Property not initialized

  // ✅ REQUIRED: Proper initialization
  private readonly properties: IProperty[] = [];

  // ✅ Or initialize in constructor
  private readonly config: IAppConfig;

  constructor(config: IAppConfig) {
    this.config = config; // ✅ Proper initialization
  }
}
```

#### 1.2 Enhanced Return Type Checking
```typescript
// ✅ REQUIRED: Explicit return types with TypeScript 5.8 validation
const calculatePropertyValue = (property: IProperty): number => {
  if (property.area <= 0) {
    // ✅ TypeScript 5.8 ensures all paths return the correct type
    return 0;
  }

  const baseValue: number = property.price;
  const areaMultiplier: number = property.area * 100;

  // ✅ Must return number as declared
  return baseValue + areaMultiplier;
};

// ✅ Conditional return types with enhanced checking
const getPropertyData = <T extends 'basic' | 'detailed'>(
  property: IProperty,
  type: T
): T extends 'basic' ? IBasicProperty : IDetailedProperty => {
  if (type === 'basic') {
    // TypeScript 5.8 improves inference here
    return {
      id: property.id,
      title: property.title,
      price: property.price
    } as T extends 'basic' ? IBasicProperty : IDetailedProperty;
  }

  return {
    ...property,
    calculatedValue: calculatePropertyValue(property),
    marketAnalysis: getMarketAnalysis(property)
  } as T extends 'basic' ? IBasicProperty : IDetailedProperty;
};
```

### 2. Improved Type Inference

#### 2.1 Better Generic Inference
```typescript
// ✅ TypeScript 5.8 improved inference for complex generics
class DataStore<TData, TKey extends keyof TData> {
  private readonly data: Map<TData[TKey], TData> = new Map();

  // ✅ Better inference for method chains
  readonly add = (item: TData): this => {
    const key = item[this.keyField];
    this.data.set(key, item);
    return this;
  };

  readonly get = (key: TData[TKey]): TData | undefined =>
    this.data.get(key);

  readonly filter = <TResult extends TData>(
    predicate: (item: TData) => item is TResult
  ): TResult[] =>
    Array.from(this.data.values()).filter(predicate);

  constructor(private readonly keyField: TKey) {}
}

// ✅ Usage with improved inference
const propertyStore = new DataStore<IProperty, 'id'>('id');
const properties = propertyStore
  .add({ id: '1', title: 'Test', price: 100000 } as IProperty)
  .add({ id: '2', title: 'Test 2', price: 200000 } as IProperty)
  .filter((p): p is IProperty => p.price > 150000); // Better type inference
```

### 3. Direct Execution Support

#### 3.1 Configuration for Direct .ts Execution
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",

    // ✅ TypeScript 5.8 direct execution options
    "rewriteRelativeImportExtensions": true,
    "erasableSyntaxOnly": true,
    "allowImportingTsExtensions": true
  },

  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}
```

---

## Angular-Specific Type Safety

### 1. Template Type Safety

#### 1.1 Strict Template Configuration
```typescript
// ✅ REQUIRED: Strict template types
@Component({
  selector: 'app-property-list',
  template: `
    <!-- TypeScript checks all template expressions -->
    @for (property of properties(); track property.id) {
      <div class="property-card">
        <!-- ✅ Type-safe property access -->
        <h3>{{ property.title }}</h3>
        <p>{{ property.price | currency }}</p>

        <!-- ✅ Type-safe event binding -->
        <button (click)="selectProperty(property)">
          Select Property
        </button>

        <!-- ✅ Type-safe conditional -->
        @if (property.images.length > 0) {
          <img [src]="property.images[0].url" [alt]="property.title">
        }
      </div>
    }
  `
})
export class PropertyList {
  properties = input.required<ReadonlyArray<IProperty>>();

  propertySelected = output<IProperty>();

  // ✅ Type-safe method signatures
  readonly selectProperty = (property: IProperty): void => {
    this.propertySelected.emit(property);
  };
}
```

#### 1.2 Form Type Safety
```typescript
// ✅ REQUIRED: Typed forms
interface IPropertyFormData {
  readonly title: string;
  readonly price: number;
  readonly location: string;
  readonly description: string;
  readonly features: ReadonlyArray<string>;
}

@Component({
  selector: 'app-property-form',
  template: `
    <form [formGroup]="propertyForm" (ngSubmit)="handleSubmit()">
      <!-- Type-safe form controls -->
      <input formControlName="title" type="text" required>
      <input formControlName="price" type="number" min="0" required>
      <input formControlName="location" type="text" required>
      <textarea formControlName="description"></textarea>

      <button type="submit" [disabled]="!propertyForm.valid">
        Create Property
      </button>
    </form>
  `
})
export class PropertyForm {
  // ✅ Typed form group
  readonly propertyForm: FormGroup<{
    title: FormControl<string>;
    price: FormControl<number>;
    location: FormControl<string>;
    description: FormControl<string>;
  }>;

  propertyCreated = output<IPropertyFormData>();

  constructor() {
    this.propertyForm = new FormGroup({
      title: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)]
      }),
      price: new FormControl<number>(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)]
      }),
      location: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      description: new FormControl<string>('', {
        nonNullable: true
      })
    });
  }

  readonly handleSubmit = (): void => {
    if (this.propertyForm.valid) {
      // ✅ Type-safe form value access
      const formData: IPropertyFormData = {
        title: this.propertyForm.value.title!,
        price: this.propertyForm.value.price!,
        location: this.propertyForm.value.location!,
        description: this.propertyForm.value.description!,
        features: []
      };

      this.propertyCreated.emit(formData);
    }
  };
}
```

### 2. Service Type Safety

#### 2.1 HTTP Client Type Safety
```typescript
// ✅ REQUIRED: Fully typed HTTP services
@Injectable({ providedIn: 'root' })
export class TypeSafePropertyService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  // ✅ Typed HTTP methods
  readonly getProperties = (filters: IPropertyFilters): Observable<IProperty[]> =>
    this.http.get<IApiResponse<IProperty[]>>(`${this.config.apiUrl}/properties`, {
      params: this.buildHttpParams(filters)
    }).pipe(
      map(response => this.validateAndExtractData(response, isPropertyArray))
    );

  readonly getPropertyById = (id: string): Observable<IProperty> =>
    this.http.get<IApiResponse<IProperty>>(`${this.config.apiUrl}/properties/${id}`).pipe(
      map(response => this.validateAndExtractData(response, isProperty))
    );

  readonly createProperty = (property: ICreatePropertyRequest): Observable<IProperty> =>
    this.http.post<IApiResponse<IProperty>>(`${this.config.apiUrl}/properties`, property).pipe(
      map(response => this.validateAndExtractData(response, isProperty))
    );

  // ✅ Type-safe helper methods
  private readonly buildHttpParams = (filters: IPropertyFilters): HttpParams => {
    let params = new HttpParams();

    // Type-safe parameter building
    if (filters.location) {
      params = params.set('location', filters.location);
    }

    if (filters.minPrice !== undefined) {
      params = params.set('minPrice', filters.minPrice.toString());
    }

    if (filters.maxPrice !== undefined) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }

    return params;
  };

  private readonly validateAndExtractData = <T>(
    response: IApiResponse<T>,
    validator: (data: unknown) => data is T
  ): T => {
    if (!response.success) {
      throw new Error(response.error || 'API request failed');
    }

    if (!validator(response.data)) {
      throw new Error('Invalid response data format');
    }

    return response.data;
  };
}
```

---

## Testing Type Safety

### 1. Type-Safe Test Setup

#### 1.1 Component Testing with Strict Types
```typescript
describe('PropertyCard', () => {
  let component: PropertyCard;
  let fixture: ComponentFixture<PropertyCard>;

  const mockProperty: IProperty = {
    id: '1',
    title: 'Test Property',
    price: 500000,
    location: 'Test Location',
    description: 'Test Description',
    area: 1200,
    images: [{ url: 'test.jpg', alt: 'Test Image' }],
    features: ['parking', 'balcony'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyCard]
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyCard);
    component = fixture.componentInstance;
  });

  it('should display property information correctly', () => {
    // ✅ Type-safe input setting
    fixture.componentRef.setInput('property', mockProperty);
    fixture.detectChanges();

    // ✅ Type-safe assertions
    expect(component.property()).toEqual(mockProperty);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toBe(mockProperty.title);
    expect(compiled.querySelector('.price')?.textContent)
      .toContain(mockProperty.price.toString());
  });

  it('should emit property selection event', () => {
    fixture.componentRef.setInput('property', mockProperty);

    // ✅ Type-safe event spying
    spyOn(component.propertySelected, 'emit');

    component.selectProperty();

    // ✅ Type-safe event verification
    expect(component.propertySelected.emit).toHaveBeenCalledWith(mockProperty);
  });
});
```

#### 1.2 Service Testing with Type Guards
```typescript
describe('PropertyService', () => {
  let service: PropertyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PropertyService]
    });

    service = TestBed.inject(PropertyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should validate API response format', () => {
    const mockResponse: IApiResponse<IProperty[]> = {
      success: true,
      data: [mockProperty],
      timestamp: new Date().toISOString()
    };

    service.getProperties({}).subscribe(properties => {
      // ✅ Type-safe response verification
      expect(Array.isArray(properties)).toBe(true);
      expect(properties.length).toBe(1);
      expect(isProperty(properties[0])).toBe(true);
    });

    const req = httpMock.expectOne('/api/properties');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle invalid response format', () => {
    const invalidResponse = {
      success: true,
      data: [{ invalid: 'data' }] // Missing required property fields
    };

    service.getProperties({}).subscribe({
      next: () => fail('Should have thrown an error'),
      error: (error: Error) => {
        expect(error.message).toBe('Invalid response data format');
      }
    });

    const req = httpMock.expectOne('/api/properties');
    req.flush(invalidResponse);
  });
});
```

### 2. Type Guard Testing

#### 2.1 Comprehensive Type Guard Tests
```typescript
describe('Type Guards', () => {
  describe('isProperty', () => {
    it('should validate correct property objects', () => {
      const validProperty: IProperty = mockProperty;
      expect(isProperty(validProperty)).toBe(true);
    });

    it('should reject invalid property objects', () => {
      const testCases: Array<{ input: unknown; description: string }> = [
        { input: null, description: 'null value' },
        { input: undefined, description: 'undefined value' },
        { input: 'string', description: 'string value' },
        { input: 123, description: 'number value' },
        { input: {}, description: 'empty object' },
        { input: { id: 123 }, description: 'invalid id type' },
        { input: { id: 'valid', title: '' }, description: 'empty title' },
        { input: { id: 'valid', title: 'valid', price: -100 }, description: 'negative price' }
      ];

      testCases.forEach(({ input, description }) => {
        expect(isProperty(input)).toBe(false, `should reject ${description}`);
      });
    });

    it('should handle edge cases', () => {
      const edgeCases: unknown[] = [
        { ...mockProperty, id: '' }, // empty required field
        { ...mockProperty, price: 0 }, // zero price
        { ...mockProperty, title: '   ' } // whitespace-only title
      ];

      edgeCases.forEach(testCase => {
        expect(isProperty(testCase)).toBe(false);
      });
    });
  });

  describe('isApiResponse', () => {
    it('should validate success responses', () => {
      const successResponse: IApiResponse<string> = {
        success: true,
        data: 'test data',
        timestamp: new Date().toISOString()
      };

      expect(isApiResponse(successResponse, isString)).toBe(true);
    });

    it('should validate error responses', () => {
      const errorResponse: IApiResponse<never> = {
        success: false,
        error: 'Test error',
        timestamp: new Date().toISOString()
      };

      expect(isApiResponse(errorResponse, () => true)).toBe(true);
    });

    it('should reject malformed responses', () => {
      const malformedResponses: unknown[] = [
        { success: 'true' }, // wrong type
        { success: true }, // missing required fields
        { success: true, data: 'test' }, // missing timestamp
        { success: false }, // missing error and timestamp
      ];

      malformedResponses.forEach(response => {
        expect(isApiResponse(response, isString)).toBe(false);
      });
    });
  });
});
```

---

## Migration Strategies

### 1. Gradual Migration from Loose Types

#### 1.1 Phase-Based Migration Plan
```typescript
// ✅ Phase 1: Enable basic strict checks and ban 'any'
interface IMigrationPhase1Config {
  readonly compilerOptions: {
    readonly strict: false; // Will be enabled in Phase 2
    readonly noImplicitAny: true; // Start here
    readonly noImplicitReturns: true;
    readonly noFallthroughCasesInSwitch: true;
  };
  readonly eslintRules: {
    readonly '@typescript-eslint/no-explicit-any': 'error';
    readonly '@typescript-eslint/no-unsafe-any': 'warn'; // Upgrade to error in Phase 2
  };
}

// ✅ Phase 2: Enable strict null checks
interface IMigrationPhase2Config extends IMigrationPhase1Config {
  readonly compilerOptions: {
    readonly strict: false;
    readonly noImplicitAny: true;
    readonly strictNullChecks: true; // New in Phase 2
    readonly strictFunctionTypes: true; // New in Phase 2
    readonly noImplicitReturns: true;
    readonly noFallthroughCasesInSwitch: true;
  };
  readonly eslintRules: {
    readonly '@typescript-eslint/no-explicit-any': 'error';
    readonly '@typescript-eslint/no-unsafe-any': 'error'; // Upgraded
    readonly '@typescript-eslint/no-unsafe-assignment': 'warn';
  };
}

// ✅ Phase 3: Full strict mode
interface IMigrationPhase3Config extends IMigrationPhase2Config {
  readonly compilerOptions: {
    readonly strict: true; // Final phase
    readonly exactOptionalPropertyTypes: true;
    readonly noUncheckedIndexedAccess: true;
  };
  readonly eslintRules: {
    readonly '@typescript-eslint/no-explicit-any': 'error';
    readonly '@typescript-eslint/no-unsafe-any': 'error';
    readonly '@typescript-eslint/no-unsafe-assignment': 'error';
    readonly '@typescript-eslint/no-unsafe-call': 'error';
    readonly '@typescript-eslint/no-unsafe-member-access': 'error';
    readonly '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }];
  };
}
```

#### 1.2 Codemod Patterns for Migration
```typescript
// ✅ REQUIRED: Automated migration helpers

// Replace 'any' with 'unknown'
const migrateAnyToUnknown = (sourceCode: string): string => {
  return sourceCode
    .replace(/:\s*any\b/g, ': unknown')
    .replace(/Array<any>/g, 'Array<unknown>')
    .replace(/any\[\]/g, 'unknown[]');
};

// Add type guards for unknown usage
const addTypeGuards = (sourceCode: string): string => {
  // Pattern: if (someVar as SomeType)
  // Replace with: if (isSomeType(someVar))
  return sourceCode.replace(
    /if\s*\(\s*([^)]+)\s+as\s+([^)]+)\s*\)/g,
    'if (is$2($1))'
  );
};

// Migration utility class
class TypeSafetyMigrator {
  readonly migrateFile = (filePath: string): void => {
    let content = readFileSync(filePath, 'utf-8');

    // Step 1: Replace any with unknown
    content = migrateAnyToUnknown(content);

    // Step 2: Add type guards
    content = addTypeGuards(content);

    // Step 3: Add necessary imports
    content = this.addTypeGuardImports(content);

    writeFileSync(filePath, content);
  };

  private readonly addTypeGuardImports = (content: string): string => {
    const importStatement = `import { isString, isNumber, isBoolean, isObject } from '../utils/type-guards';\n`;

    if (!content.includes('type-guards')) {
      return importStatement + content;
    }

    return content;
  };
}
```

### 2. Refactoring Patterns

#### 2.1 From Type Assertions to Type Guards
```typescript
// ❌ BEFORE: Unsafe type assertions
const processApiData = (data: unknown): void => {
  const properties = data as IProperty[]; // Dangerous!

  properties.forEach(property => {
    console.log((property as IProperty).title); // More danger!
  });
};

// ✅ AFTER: Safe type guards
const processApiDataSafe = (data: unknown): void => {
  if (!isPropertyArray(data)) {
    throw new Error('Invalid property array data');
  }

  // TypeScript now knows data is IProperty[]
  data.forEach(property => {
    // No casting needed - type is guaranteed
    console.log(property.title);
  });
};
```

#### 2.2 From Loose Objects to Strict Interfaces
```typescript
// ❌ BEFORE: Loose object typing
const createPropertyCard = (data: Record<string, unknown>): HTMLElement => {
  const title = data.title as string; // Unsafe
  const price = data.price as number; // Unsafe

  // Implementation...
  return document.createElement('div');
};

// ✅ AFTER: Strict interface with validation
interface IPropertyCardData {
  readonly title: string;
  readonly price: number;
  readonly location: string;
  readonly imageUrl?: string;
}

const isPropertyCardData = (data: unknown): data is IPropertyCardData =>
  typeof data === 'object' &&
  data !== null &&
  'title' in data &&
  'price' in data &&
  'location' in data &&
  typeof (data as IPropertyCardData).title === 'string' &&
  typeof (data as IPropertyCardData).price === 'number' &&
  typeof (data as IPropertyCardData).location === 'string';

const createPropertyCardSafe = (data: unknown): HTMLElement => {
  if (!isPropertyCardData(data)) {
    throw new Error('Invalid property card data');
  }

  // TypeScript guarantees type safety
  const { title, price, location, imageUrl } = data;

  // Safe implementation...
  return document.createElement('div');
};
```

---

## Conclusion

This Type Safety documentation establishes the **NON-NEGOTIABLE** foundation for type-safe development in the Archland.hu Angular application. The key principles ensure:

- **Zero `any` Usage**: Eliminate all `any` types through `unknown`, union types, and proper generics
- **No Type Casting**: Replace all type assertions with safe type guards and validation
- **Strict Configuration**: Enforce maximum TypeScript compiler strictness settings
- **Runtime Validation**: Implement comprehensive type guards for all external data
- **Angular Integration**: Apply strict typing to templates, forms, and services
- **Testing Coverage**: Validate type safety through comprehensive test suites

**Implementation Enforcement**:
- **Linting Rules**: ESLint configuration prevents `any` usage and type assertions
- **Build Failures**: TypeScript strict mode causes compilation errors for type violations
- **Code Reviews**: All PRs must verify constitutional type safety compliance
- **Automated Testing**: Type guard tests ensure runtime type validation works correctly

**Migration Priority**:
1. **Phase 1**: Ban `any` types and enable basic strict checks
2. **Phase 2**: Enable strict null checks and function type validation
3. **Phase 3**: Full strict mode with exact optional properties
4. **Ongoing**: Continuous refactoring from type assertions to type guards

**Quality Gates**:
- Zero `any` types in codebase (enforced by linting)
- Zero type assertions/casting (enforced by linting and code review)
- 100% type guard coverage for external data sources
- Strict TypeScript configuration with all safety flags enabled
- All template expressions must be type-safe (Angular strict templates)

This type safety foundation prevents runtime errors, improves code maintainability, enhances developer productivity, and ensures the long-term reliability of the Archland.hu application.

---

**Document Information**
- **Authority**: Archland.hu Constitution Section V (NON-NEGOTIABLE)
- **Enforcement Level**: Mandatory - Build failures for violations
- **Review Cycle**: Monthly (aligned with TypeScript releases)
- **Stakeholders**: All developers, code reviewers, build engineers, QA team
- **Related Documents**: [Framework Standards Best Practices], [Coding Principles Best Practices], [Component Communication Best Practices]