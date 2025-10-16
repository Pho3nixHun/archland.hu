# CVA-Based Components - Best Practices Guide

> **Constitutional Reference**: Section Component Architecture - CVA-Based Components
> **Version**: 1.0.0
> **Last Updated**: 2025-09-26
> **Sources**: Angular.dev official documentation, CVA community patterns, 2025 reactive forms best practices

This document provides comprehensive best practices for CVA-Based Components in the Archland.hu Constitution, covering ControlValueAccessor implementation, proper separation from view-models, and reactive forms integration.

## Table of Contents
1. [Constitutional Requirements](#constitutional-requirements)
2. [ControlValueAccessor Interface](#controlvalueaccessor-interface)
3. [Separation from View-Model](#separation-from-view-model)
4. [Reactive Forms Integration](#reactive-forms-integration)
5. [Validation Patterns](#validation-patterns)
6. [Error Handling Strategies](#error-handling-strategies)
7. [Advanced CVA Patterns](#advanced-cva-patterns)
8. [Testing CVA Components](#testing-cva-components)

---

## Constitutional Requirements

### 1. Mandatory Separation Rules

#### 1.1 Core Principle
- **NEVER** place ControlValueAccessor-specific fields (e.g., `value`, `disabled`, `onChange`) inside the `vm`
- **MUST** handle CVA interface methods through the CVA implementation only
- **MUST** maintain clear separation between form control logic and presentation logic

#### 1.2 Architecture Benefits
This separation ensures:
- **Clean Interface Design**: CVA logic remains separate from component presentation logic
- **Proper Form Integration**: Seamless integration with Angular's reactive forms
- **Reusability**: CVA components can be used across different form contexts
- **Testability**: CVA logic and presentation logic can be tested independently
- **Maintainability**: Changes to form logic don't affect presentation and vice versa

### 2. Implementation Requirements

#### 2.1 CVA Interface Compliance
```typescript
// ✅ REQUIRED: Complete CVA interface implementation
interface ControlValueAccessor {
  writeValue(obj: unknown): void;
  registerOnChange(fn: (value: unknown) => void): void;
  registerOnTouched(fn: () => void): void;
  setDisabledState?(isDisabled: boolean): void;
}
```

#### 2.2 Registration Requirements
```typescript
// ✅ REQUIRED: Proper provider registration
@Component({
  // Component configuration
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YourComponent),
      multi: true
    }
  ]
})
```

---

## ControlValueAccessor Interface

### 1. Basic CVA Implementation

#### 1.1 Simple CVA Component
```typescript
// ✅ REQUIRED: Basic CVA implementation with proper separation
@Component({
  selector: 'app-rating-selector',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingSelector),
      multi: true
    }
  ],
  template: `
    <div class="rating-selector" [class]="vm.containerClasses()">
      <fieldset [disabled]="disabled">
        <legend>{{ vm.fieldLegend() }}</legend>

        <div class="rating-options">
          <label
            *ngFor="let rating of vm.ratingOptions(); trackBy: vm.trackRating"
            class="rating-option"
            [class.selected]="vm.isRatingSelected(rating.value)"
          >
            <input
              type="radio"
              [value]="rating.value"
              [checked]="vm.isRatingSelected(rating.value)"
              [disabled]="disabled"
              (change)="handleRatingChange($event)"
              (blur)="handleBlur()"
              [attr.aria-describedby]="vm.descriptionId()"
            >
            <span class="rating-label">
              {{ rating.label }}
            </span>
            <span class="rating-stars">
              {{ vm.getStarDisplay(rating.value) }}
            </span>
          </label>
        </div>

        <div class="rating-feedback" *ngIf="vm.showFeedback()">
          <span [id]="vm.descriptionId()">
            {{ vm.feedbackText() }}
          </span>
        </div>
      </fieldset>
    </div>
  `
})
export class RatingSelector implements ControlValueAccessor, OnDestroy {
  // ✅ CVA Fields - NEVER in VM
  private _value: number = 0;
  private _disabled: boolean = false;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  // ✅ Component configuration inputs (these CAN be in VM)
  label = input<string>('Rating');
  showStars = input<boolean>(true);
  showFeedback = input<boolean>(true);
  maxRating = input<number>(5);

  readonly vm = {
    // ✅ Presentation logic only - no CVA state
    containerClasses: computed(() => ({
      'rating-selector--disabled': this.disabled,
      'rating-selector--with-stars': this.showStars(),
      'rating-selector--with-feedback': this.showFeedback()
    })),

    fieldLegend: computed(() => this.label()),

    ratingOptions: computed(() =>
      Array.from({ length: this.maxRating() }, (_, i) => ({
        value: i + 1,
        label: `${i + 1} Star${i === 0 ? '' : 's'}`
      }))
    ),

    isRatingSelected: (value: number): boolean =>
      this.value === value,

    getStarDisplay: (rating: number): string =>
      this.showStars() ? '★'.repeat(rating) : '',

    showFeedback: computed(() =>
      this.showFeedback() && this.value > 0
    ),

    feedbackText: computed(() =>
      `You selected ${this.value} out of ${this.maxRating()} stars`
    ),

    descriptionId: computed(() =>
      `rating-description-${Math.random().toString(36).substr(2, 9)}`
    ),

    trackRating: (index: number, rating: { value: number; label: string }): number =>
      rating.value
  };

  // ✅ CVA Property Accessors - Outside VM
  get value(): number {
    return this._value;
  }

  set value(val: number) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(val: boolean) {
    this._disabled = val;
  }

  // ✅ ControlValueAccessor Implementation - Outside VM
  writeValue(value: number): void {
    this._value = value || 0;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // ✅ Event Handlers - Bridge between template and CVA
  readonly handleRatingChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    const newValue = parseInt(target.value, 10);

    if (!this.disabled && !isNaN(newValue)) {
      this.value = newValue;
    }
  };

  readonly handleBlur = (): void => {
    this.onTouched();
  };

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
```

#### 1.2 Complex Object CVA
```typescript
// ✅ REQUIRED: CVA for complex data structures
interface IPropertySearch {
  readonly query: string;
  readonly location: string;
  readonly priceRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly propertyTypes: ReadonlyArray<string>;
}

@Component({
  selector: 'app-property-search-form',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PropertySearchForm),
      multi: true
    }
  ],
  template: `
    <div class="property-search-form" [class]="vm.formClasses()">
      <div class="search-fields">
        <!-- Search query -->
        <div class="form-group">
          <label [for]="vm.queryFieldId()">Search Properties</label>
          <input
            [id]="vm.queryFieldId()"
            type="text"
            [value]="vm.currentSearch().query"
            [disabled]="disabled"
            [placeholder]="vm.queryPlaceholder()"
            (input)="handleQueryChange($event)"
            (blur)="handleBlur()"
          >
        </div>

        <!-- Location selector -->
        <div class="form-group">
          <label [for]="vm.locationFieldId()">Location</label>
          <select
            [id]="vm.locationFieldId()"
            [value]="vm.currentSearch().location"
            [disabled]="disabled"
            (change)="handleLocationChange($event)"
            (blur)="handleBlur()"
          >
            <option value="">Any Location</option>
            <option *ngFor="let location of vm.availableLocations()" [value]="location">
              {{ location }}
            </option>
          </select>
        </div>

        <!-- Price range -->
        <div class="form-group price-range">
          <label>Price Range</label>
          <div class="price-inputs">
            <input
              type="number"
              [value]="vm.currentSearch().priceRange.min"
              [disabled]="disabled"
              placeholder="Min price"
              (input)="handleMinPriceChange($event)"
              (blur)="handleBlur()"
            >
            <input
              type="number"
              [value]="vm.currentSearch().priceRange.max"
              [disabled]="disabled"
              placeholder="Max price"
              (input)="handleMaxPriceChange($event)"
              (blur)="handleBlur()"
            >
          </div>
        </div>

        <!-- Property types -->
        <div class="form-group">
          <fieldset [disabled]="disabled">
            <legend>Property Types</legend>
            <div class="property-type-options">
              <label
                *ngFor="let type of vm.availablePropertyTypes()"
                class="checkbox-option"
              >
                <input
                  type="checkbox"
                  [value]="type"
                  [checked]="vm.isPropertyTypeSelected(type)"
                  [disabled]="disabled"
                  (change)="handlePropertyTypeChange($event)"
                  (blur)="handleBlur()"
                >
                {{ type }}
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      <!-- Search summary -->
      <div class="search-summary" *ngIf="vm.showSummary()">
        <span>{{ vm.summaryText() }}</span>
        <button
          type="button"
          [disabled]="disabled"
          (click)="handleReset()"
        >
          Reset
        </button>
      </div>
    </div>
  `
})
export class PropertySearchForm implements ControlValueAccessor, OnDestroy {
  // ✅ CVA Fields - NEVER in VM
  private _value: IPropertySearch = {
    query: '',
    location: '',
    priceRange: { min: 0, max: 1000000 },
    propertyTypes: []
  };
  private _disabled: boolean = false;

  private onChange: (value: IPropertySearch) => void = () => {};
  private onTouched: () => void = () => {};

  // ✅ Component configuration (can be in VM)
  availableLocations = input<ReadonlyArray<string>>([
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'
  ]);

  readonly vm = {
    // ✅ Presentation logic only
    formClasses: computed(() => ({
      'property-search-form--disabled': this.disabled
    })),

    currentSearch: computed(() => this._value),

    queryFieldId: computed(() => 'search-query'),
    locationFieldId: computed(() => 'search-location'),

    queryPlaceholder: computed(() => 'Search properties...'),

    availableLocations: computed(() => this.availableLocations()),

    availablePropertyTypes: computed(() => [
      'House', 'Apartment', 'Condo', 'Townhouse', 'Land'
    ]),

    isPropertyTypeSelected: (type: string): boolean =>
      this._value.propertyTypes.includes(type),

    showSummary: computed(() => {
      const search = this._value;
      return !!(search.query || search.location ||
               search.priceRange.min > 0 || search.priceRange.max < 1000000 ||
               search.propertyTypes.length > 0);
    }),

    summaryText: computed(() => {
      const search = this._value;
      const parts: string[] = [];

      if (search.query) parts.push(`"${search.query}"`);
      if (search.location) parts.push(`in ${search.location}`);
      if (search.priceRange.min > 0 || search.priceRange.max < 1000000) {
        parts.push(`$${search.priceRange.min.toLocaleString()} - $${search.priceRange.max.toLocaleString()}`);
      }
      if (search.propertyTypes.length > 0) {
        parts.push(search.propertyTypes.join(', '));
      }

      return parts.length > 0 ? `Searching: ${parts.join(' • ')}` : '';
    })
  };

  // ✅ CVA Implementation - Outside VM
  get disabled(): boolean {
    return this._disabled;
  }

  writeValue(value: IPropertySearch): void {
    this._value = value || {
      query: '',
      location: '',
      priceRange: { min: 0, max: 1000000 },
      propertyTypes: []
    };
  }

  registerOnChange(fn: (value: IPropertySearch) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  // ✅ Event Handlers - Bridge between template and CVA
  readonly handleQueryChange = (event: Event): void => {
    const query = (event.target as HTMLInputElement).value;
    this.updateValue({ query });
  };

  readonly handleLocationChange = (event: Event): void => {
    const location = (event.target as HTMLSelectElement).value;
    this.updateValue({ location });
  };

  readonly handleMinPriceChange = (event: Event): void => {
    const min = parseInt((event.target as HTMLInputElement).value, 10) || 0;
    this.updateValue({
      priceRange: { ...this._value.priceRange, min }
    });
  };

  readonly handleMaxPriceChange = (event: Event): void => {
    const max = parseInt((event.target as HTMLInputElement).value, 10) || 1000000;
    this.updateValue({
      priceRange: { ...this._value.priceRange, max }
    });
  };

  readonly handlePropertyTypeChange = (event: Event): void => {
    const checkbox = event.target as HTMLInputElement;
    const type = checkbox.value;

    const currentTypes = [...this._value.propertyTypes];

    if (checkbox.checked) {
      if (!currentTypes.includes(type)) {
        currentTypes.push(type);
      }
    } else {
      const index = currentTypes.indexOf(type);
      if (index > -1) {
        currentTypes.splice(index, 1);
      }
    }

    this.updateValue({ propertyTypes: currentTypes });
  };

  readonly handleReset = (): void => {
    this.updateValue({
      query: '',
      location: '',
      priceRange: { min: 0, max: 1000000 },
      propertyTypes: []
    });
  };

  readonly handleBlur = (): void => {
    this.onTouched();
  };

  // ✅ Helper method for updates
  private readonly updateValue = (partial: Partial<IPropertySearch>): void => {
    this._value = { ...this._value, ...partial };
    this.onChange(this._value);
  };

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
```

---

## Separation from View-Model

### 1. Architectural Boundaries

#### 1.1 What Belongs Where
```typescript
// ✅ CORRECT: Clear separation of concerns
export class CustomFormControl implements ControlValueAccessor {
  // ❌ NEVER in VM: CVA-specific fields
  private _value: string = '';
  private _disabled: boolean = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // ✅ CAN be in VM: Component configuration
  placeholder = input<string>('');
  maxLength = input<number | null>(null);
  showCharacterCount = input<boolean>(false);

  // ✅ MUST be in VM: Presentation logic
  readonly vm = {
    // UI state computations
    containerClasses: computed(() => ({
      'form-control--disabled': this.disabled,
      'form-control--has-value': this._value.length > 0
    })),

    displayPlaceholder: computed(() => this.placeholder()),

    characterCount: computed(() => this._value.length),

    maxCharacterCount: computed(() => this.maxLength()),

    showCharacterCounter: computed(() =>
      this.showCharacterCount() && this.maxLength() !== null
    ),

    isNearLimit: computed(() => {
      const max = this.maxLength();
      return max !== null && this._value.length > max * 0.8;
    }),

    characterCounterText: computed(() => {
      const current = this._value.length;
      const max = this.maxLength();
      return max !== null ? `${current}/${max}` : `${current}`;
    }),

    // Event handlers that don't directly manage CVA state
    getInputAttributes: () => ({
      placeholder: this.placeholder(),
      maxlength: this.maxLength(),
      disabled: this.disabled
    })
  };

  // ✅ CVA accessors - outside VM
  get value(): string { return this._value; }
  set value(val: string) {
    if (val !== this._value) {
      this._value = val;
      this.onChange(val);
    }
  }

  get disabled(): boolean { return this._disabled; }

  // ✅ CVA implementation - outside VM
  writeValue(value: string): void {
    this._value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }
}
```

#### 1.2 Common Mistakes to Avoid
```typescript
// ❌ WRONG: CVA fields in VM
export class IncorrectCVAComponent {
  readonly vm = {
    // ❌ NEVER: CVA state in VM
    value: signal(''),
    disabled: signal(false),

    // ❌ NEVER: CVA callbacks in VM
    handleValueChange: (newValue: string) => {
      this.vm.value.set(newValue);
      this.onChange(newValue); // This breaks the pattern
    }
  };
}

// ✅ CORRECT: Proper separation
export class CorrectCVAComponent implements ControlValueAccessor {
  // ✅ CVA state outside VM
  private _value: string = '';
  private _disabled: boolean = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly vm = {
    // ✅ Only presentation logic in VM
    displayValue: computed(() => this._value.toUpperCase()),

    isValueEmpty: computed(() => this._value.length === 0),

    containerClasses: computed(() => ({
      'has-value': this._value.length > 0,
      'is-disabled': this._disabled
    }))
  };

  // ✅ Event handler bridges template to CVA
  readonly handleInput = (event: Event): void => {
    const newValue = (event.target as HTMLInputElement).value;
    this._value = newValue;
    this.onChange(newValue);
  };

  // ✅ CVA implementation
  writeValue(value: string): void {
    this._value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }
}
```

---

## Reactive Forms Integration

### 1. FormControl Integration

#### 1.1 Basic Form Integration
```typescript
// ✅ Parent component using CVA in reactive form
@Component({
  selector: 'app-property-form',
  template: `
    <form [formGroup]="propertyForm" (ngSubmit)="handleSubmit()">
      <div class="form-section">
        <h3>Property Details</h3>

        <!-- CVA components integrate seamlessly -->
        <app-rating-selector
          formControlName="rating"
          label="Property Rating"
          [maxRating]="5"
        />

        <app-property-search-form
          formControlName="searchCriteria"
          [availableLocations]="availableLocations"
        />

        <!-- Regular form controls work alongside CVA -->
        <div class="form-group">
          <label for="title">Title</label>
          <input
            id="title"
            type="text"
            formControlName="title"
            required
          >
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            formControlName="description"
            rows="4"
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          [disabled]="propertyForm.invalid || propertyForm.pending"
        >
          {{ propertyForm.pending ? 'Saving...' : 'Save Property' }}
        </button>

        <button type="button" (click)="handleReset()">
          Reset Form
        </button>
      </div>

      <!-- Form debug info -->
      <div class="form-debug" *ngIf="showDebugInfo">
        <h4>Form State</h4>
        <pre>{{ getFormDebugInfo() }}</pre>
      </div>
    </form>
  `
})
export class PropertyForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  availableLocations = ['New York', 'Los Angeles', 'Chicago', 'Houston'];
  showDebugInfo = false;

  // ✅ Reactive form with CVA controls
  propertyForm = this.formBuilder.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    rating: [0, [Validators.required, Validators.min(1)]],
    searchCriteria: [{
      query: '',
      location: '',
      priceRange: { min: 0, max: 1000000 },
      propertyTypes: []
    } as IPropertySearch, [this.searchCriteriaValidator]]
  });

  ngOnInit(): void {
    // ✅ React to form changes
    this.propertyForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
    });

    // ✅ Monitor specific CVA control
    this.propertyForm.get('rating')?.valueChanges.subscribe(rating => {
      console.log('Rating changed:', rating);
    });

    this.propertyForm.get('searchCriteria')?.valueChanges.subscribe(criteria => {
      console.log('Search criteria changed:', criteria);
    });
  }

  readonly handleSubmit = (): void => {
    if (this.propertyForm.valid) {
      const formValue = this.propertyForm.value;
      console.log('Submitting property:', formValue);

      // Process form data
      this.saveProperty(formValue);
    } else {
      console.log('Form is invalid:', this.propertyForm.errors);
      this.markAllFieldsAsTouched();
    }
  };

  readonly handleReset = (): void => {
    this.propertyForm.reset({
      title: '',
      description: '',
      rating: 0,
      searchCriteria: {
        query: '',
        location: '',
        priceRange: { min: 0, max: 1000000 },
        propertyTypes: []
      }
    });
  };

  // ✅ Custom validator for CVA component
  private readonly searchCriteriaValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as IPropertySearch;

    if (!value) return null;

    const errors: ValidationErrors = {};

    // Validate price range
    if (value.priceRange.min < 0) {
      errors['invalidMinPrice'] = 'Minimum price cannot be negative';
    }

    if (value.priceRange.max <= value.priceRange.min) {
      errors['invalidPriceRange'] = 'Maximum price must be greater than minimum price';
    }

    // Validate property types
    if (value.propertyTypes.length > 3) {
      errors['tooManyPropertyTypes'] = 'Please select at most 3 property types';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  private readonly saveProperty = (propertyData: unknown): void => {
    // Implementation for saving property
    console.log('Saving property:', propertyData);
  };

  private readonly markAllFieldsAsTouched = (): void => {
    Object.keys(this.propertyForm.controls).forEach(key => {
      const control = this.propertyForm.get(key);
      control?.markAsTouched();
    });
  };

  readonly getFormDebugInfo = (): string => {
    return JSON.stringify({
      value: this.propertyForm.value,
      valid: this.propertyForm.valid,
      errors: this.propertyForm.errors,
      touched: this.propertyForm.touched,
      dirty: this.propertyForm.dirty
    }, null, 2);
  };
}
```

#### 1.2 Dynamic Forms with CVA
```typescript
// ✅ Dynamic form creation with CVA components
@Component({
  selector: 'app-dynamic-property-form',
  template: `
    <form [formGroup]="dynamicForm">
      <div
        *ngFor="let field of formFields(); trackBy: trackFormField"
        class="dynamic-form-field"
      >
        <!-- CVA component field -->
        <app-rating-selector
          *ngIf="field.type === 'rating'"
          [formControlName]="field.name"
          [label]="field.label"
          [maxRating]="field.config?.maxRating || 5"
        />

        <!-- Search form field -->
        <app-property-search-form
          *ngIf="field.type === 'search'"
          [formControlName]="field.name"
          [availableLocations]="field.config?.availableLocations || []"
        />

        <!-- Regular input field -->
        <div *ngIf="field.type === 'text'" class="form-group">
          <label [for]="field.name">{{ field.label }}</label>
          <input
            [id]="field.name"
            type="text"
            [formControlName]="field.name"
            [placeholder]="field.config?.placeholder"
          >
        </div>

        <!-- Field validation errors -->
        <div class="field-errors" *ngIf="getFieldErrors(field.name)?.length">
          <span
            *ngFor="let error of getFieldErrors(field.name)"
            class="error-message"
          >
            {{ error }}
          </span>
        </div>
      </div>

      <button
        type="submit"
        [disabled]="dynamicForm.invalid"
        (click)="handleDynamicSubmit()"
      >
        Submit Dynamic Form
      </button>
    </form>
  `
})
export class DynamicPropertyForm implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);

  // Form configuration
  formFields = input.required<ReadonlyArray<IFormFieldConfig>>();

  dynamicForm!: FormGroup;

  ngOnInit(): void {
    this.buildDynamicForm();
  }

  private readonly buildDynamicForm = (): void => {
    const formControls: Record<string, FormControl> = {};

    this.formFields().forEach(field => {
      const validators = this.buildValidators(field);
      const defaultValue = this.getDefaultValue(field);

      formControls[field.name] = new FormControl(defaultValue, validators);
    });

    this.dynamicForm = this.formBuilder.group(formControls);
  };

  private readonly buildValidators = (field: IFormFieldConfig): ValidatorFn[] => {
    const validators: ValidatorFn[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.type === 'text' && field.config?.minLength) {
      validators.push(Validators.minLength(field.config.minLength));
    }

    if (field.type === 'rating' && field.config?.minRating) {
      validators.push(Validators.min(field.config.minRating));
    }

    return validators;
  };

  private readonly getDefaultValue = (field: IFormFieldConfig): unknown => {
    switch (field.type) {
      case 'rating':
        return 0;
      case 'search':
        return {
          query: '',
          location: '',
          priceRange: { min: 0, max: 1000000 },
          propertyTypes: []
        };
      case 'text':
      default:
        return '';
    }
  };

  readonly trackFormField = (index: number, field: IFormFieldConfig): string =>
    field.name;

  readonly getFieldErrors = (fieldName: string): string[] => {
    const control = this.dynamicForm.get(fieldName);

    if (!control || !control.errors || !control.touched) {
      return [];
    }

    const errors: string[] = [];

    Object.keys(control.errors).forEach(errorKey => {
      switch (errorKey) {
        case 'required':
          errors.push('This field is required');
          break;
        case 'minlength':
          errors.push(`Minimum length is ${control.errors![errorKey].requiredLength}`);
          break;
        case 'min':
          errors.push(`Minimum value is ${control.errors![errorKey].min}`);
          break;
        default:
          errors.push(`Validation error: ${errorKey}`);
      }
    });

    return errors;
  };

  readonly handleDynamicSubmit = (): void => {
    if (this.dynamicForm.valid) {
      console.log('Dynamic form submitted:', this.dynamicForm.value);
    } else {
      console.log('Dynamic form is invalid');
      this.markAllFieldsAsTouched();
    }
  };

  private readonly markAllFieldsAsTouched = (): void => {
    Object.keys(this.dynamicForm.controls).forEach(key => {
      this.dynamicForm.get(key)?.markAsTouched();
    });
  };

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}

// ✅ Form field configuration interface
interface IFormFieldConfig {
  readonly name: string;
  readonly label: string;
  readonly type: 'text' | 'rating' | 'search';
  readonly required?: boolean;
  readonly config?: {
    readonly placeholder?: string;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly minRating?: number;
    readonly maxRating?: number;
    readonly availableLocations?: ReadonlyArray<string>;
  };
}
```

---

## Validation Patterns

### 1. CVA with Validator Interface

#### 1.1 Basic CVA Validation
```typescript
// ✅ REQUIRED: CVA component implementing Validator interface
@Component({
  selector: 'app-email-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EmailInput),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => EmailInput),
      multi: true
    }
  ],
  template: `
    <div class="email-input" [class]="vm.containerClasses()">
      <label [for]="vm.inputId()">{{ vm.labelText() }}</label>

      <input
        [id]="vm.inputId()"
        type="email"
        [value]="currentValue"
        [disabled]="disabled"
        [placeholder]="vm.placeholderText()"
        (input)="handleInput($event)"
        (blur)="handleBlur()"
        [attr.aria-invalid]="vm.hasValidationError()"
        [attr.aria-describedby]="vm.errorId()"
      >

      <div class="email-input__validation" *ngIf="vm.showValidationFeedback()">
        <!-- Success state -->
        <div class="validation-success" *ngIf="vm.isValid()">
          <span class="success-icon">✓</span>
          Valid email address
        </div>

        <!-- Error state -->
        <div class="validation-error" *ngIf="vm.hasValidationError()">
          <span class="error-icon">⚠</span>
          <span [id]="vm.errorId()">{{ vm.validationErrorMessage() }}</span>
        </div>

        <!-- Loading state for async validation -->
        <div class="validation-loading" *ngIf="vm.isValidating()">
          <span class="loading-spinner"></span>
          Checking email availability...
        </div>
      </div>
    </div>
  `
})
export class EmailInput implements ControlValueAccessor, Validator, OnDestroy {
  // ✅ CVA fields outside VM
  private _value: string = '';
  private _disabled: boolean = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Configuration inputs
  label = input<string>('Email Address');
  placeholder = input<string>('Enter your email');
  required = input<boolean>(true);
  checkAvailability = input<boolean>(false);

  // Internal validation state
  private readonly validationErrors = signal<ValidationErrors | null>(null);
  private readonly isValidating = signal<boolean>(false);

  readonly vm = {
    containerClasses: computed(() => ({
      'email-input--disabled': this.disabled,
      'email-input--valid': this.vm.isValid(),
      'email-input--invalid': this.vm.hasValidationError(),
      'email-input--validating': this.isValidating()
    })),

    inputId: computed(() => `email-${Math.random().toString(36).substr(2, 9)}`),

    labelText: computed(() => this.label()),

    placeholderText: computed(() => this.placeholder()),

    errorId: computed(() => `${this.vm.inputId()}-error`),

    showValidationFeedback: computed(() =>
      this._value.length > 0 && (this.vm.isValid() || this.vm.hasValidationError() || this.isValidating())
    ),

    isValid: computed(() => {
      const errors = this.validationErrors();
      return this._value.length > 0 && errors === null && !this.isValidating();
    }),

    hasValidationError: computed(() => {
      const errors = this.validationErrors();
      return errors !== null && Object.keys(errors).length > 0;
    }),

    validationErrorMessage: computed(() => {
      const errors = this.validationErrors();
      if (!errors) return '';

      if (errors['required']) return 'Email address is required';
      if (errors['email']) return 'Please enter a valid email address';
      if (errors['emailTaken']) return 'This email address is already in use';

      return 'Invalid email address';
    })
  };

  // ✅ CVA property accessors
  get currentValue(): string {
    return this._value;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  // ✅ ControlValueAccessor implementation
  writeValue(value: string): void {
    this._value = value || '';
    this.validateValue();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  // ✅ Validator implementation
  validate(): ValidationErrors | null {
    return this.validationErrors();
  }

  // ✅ Event handlers
  readonly handleInput = (event: Event): void => {
    const newValue = (event.target as HTMLInputElement).value;
    this._value = newValue;
    this.onChange(newValue);
    this.validateValue();
  };

  readonly handleBlur = (): void => {
    this.onTouched();
    this.validateValue();
  };

  // ✅ Validation logic
  private readonly validateValue = (): void => {
    const value = this._value;
    const errors: ValidationErrors = {};

    // Required validation
    if (this.required() && (!value || value.trim().length === 0)) {
      errors['required'] = true;
      this.validationErrors.set(errors);
      return;
    }

    // Email format validation
    if (value && !this.isValidEmailFormat(value)) {
      errors['email'] = true;
      this.validationErrors.set(errors);
      return;
    }

    // If email is valid and we need to check availability
    if (value && this.isValidEmailFormat(value) && this.checkAvailability()) {
      this.performAsyncValidation(value);
      return;
    }

    // No errors
    this.validationErrors.set(null);
  };

  private readonly isValidEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  private readonly performAsyncValidation = (email: string): void => {
    this.isValidating.set(true);

    // Simulate async validation (replace with real API call)
    setTimeout(() => {
      const errors: ValidationErrors = {};

      // Simulate checking if email is taken
      const takenEmails = ['test@example.com', 'admin@example.com'];
      if (takenEmails.includes(email.toLowerCase())) {
        errors['emailTaken'] = true;
      }

      this.validationErrors.set(Object.keys(errors).length > 0 ? errors : null);
      this.isValidating.set(false);
    }, 1000);
  };

  ngOnDestroy(): void {
    // Cleanup async validation if component is destroyed
  }
}
```

#### 1.2 Complex Validation with Multiple Validators
```typescript
// ✅ REQUIRED: CVA with complex validation rules
@Component({
  selector: 'app-password-strength',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordStrength),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PasswordStrength),
      multi: true
    }
  ],
  template: `
    <div class="password-strength" [class]="vm.containerClasses()">
      <label [for]="vm.inputId()">{{ vm.labelText() }}</label>

      <div class="password-input-container">
        <input
          [id]="vm.inputId()"
          [type]="vm.inputType()"
          [value]="currentValue"
          [disabled]="disabled"
          [placeholder]="vm.placeholderText()"
          (input)="handleInput($event)"
          (blur)="handleBlur()"
          [attr.aria-describedby]="vm.strengthMeterIdList()"
        >

        <button
          type="button"
          class="toggle-visibility"
          (click)="vm.togglePasswordVisibility()"
          [attr.aria-label]="vm.visibilityToggleLabel()"
        >
          {{ vm.visibilityToggleText() }}
        </button>
      </div>

      <!-- Strength meter -->
      <div class="strength-meter" [id]="vm.strengthMeterId()">
        <div class="strength-bar">
          <div
            class="strength-fill"
            [style.width.%]="vm.strengthPercentage()"
            [class]="vm.strengthBarClass()"
          ></div>
        </div>

        <div class="strength-label">
          Strength: {{ vm.strengthText() }}
        </div>
      </div>

      <!-- Validation requirements -->
      <div class="validation-requirements" [id]="vm.requirementsId()">
        <div class="requirement-list">
          <div
            *ngFor="let requirement of vm.validationRequirements()"
            class="requirement-item"
            [class.met]="requirement.isMet"
            [class.unmet]="!requirement.isMet"
          >
            <span class="requirement-icon">
              {{ requirement.isMet ? '✓' : '○' }}
            </span>
            <span class="requirement-text">
              {{ requirement.text }}
            </span>
          </div>
        </div>
      </div>

      <!-- Error messages -->
      <div class="validation-errors" *ngIf="vm.hasValidationErrors()">
        <div
          *ngFor="let error of vm.validationErrorMessages()"
          class="error-message"
        >
          {{ error }}
        </div>
      </div>
    </div>
  `
})
export class PasswordStrength implements ControlValueAccessor, Validator, OnDestroy {
  // ✅ CVA state outside VM
  private _value: string = '';
  private _disabled: boolean = false;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Component configuration
  label = input<string>('Password');
  placeholder = input<string>('Enter a strong password');
  minLength = input<number>(8);
  requireNumbers = input<boolean>(true);
  requireUppercase = input<boolean>(true);
  requireLowercase = input<boolean>(true);
  requireSpecialChars = input<boolean>(true);

  // Internal state
  private readonly showPassword = signal<boolean>(false);
  private readonly validationErrors = signal<ValidationErrors | null>(null);

  readonly vm = {
    containerClasses: computed(() => ({
      'password-strength--disabled': this.disabled,
      'password-strength--weak': this.vm.strengthScore() < 2,
      'password-strength--medium': this.vm.strengthScore() >= 2 && this.vm.strengthScore() < 4,
      'password-strength--strong': this.vm.strengthScore() >= 4
    })),

    inputId: computed(() => `password-${Math.random().toString(36).substr(2, 9)}`),
    strengthMeterId: computed(() => `${this.vm.inputId()}-strength`),
    requirementsId: computed(() => `${this.vm.inputId()}-requirements`),

    strengthMeterIdList: computed(() =>
      `${this.vm.strengthMeterId()} ${this.vm.requirementsId()}`
    ),

    labelText: computed(() => this.label()),
    placeholderText: computed(() => this.placeholder()),

    inputType: computed(() => this.showPassword() ? 'text' : 'password'),

    visibilityToggleText: computed(() => this.showPassword() ? '🙈' : '👁️'),
    visibilityToggleLabel: computed(() =>
      this.showPassword() ? 'Hide password' : 'Show password'
    ),

    // Password strength calculation
    strengthScore: computed(() => {
      const password = this._value;
      if (!password) return 0;

      let score = 0;

      if (password.length >= this.minLength()) score++;
      if (this.requireLowercase() && /[a-z]/.test(password)) score++;
      if (this.requireUppercase() && /[A-Z]/.test(password)) score++;
      if (this.requireNumbers() && /\d/.test(password)) score++;
      if (this.requireSpecialChars() && /[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

      return score;
    }),

    strengthPercentage: computed(() => {
      const maxScore = this.vm.calculateMaxScore();
      return maxScore > 0 ? (this.vm.strengthScore() / maxScore) * 100 : 0;
    }),

    strengthText: computed(() => {
      const score = this.vm.strengthScore();
      const maxScore = this.vm.calculateMaxScore();

      if (score === 0) return 'None';
      if (score < maxScore * 0.4) return 'Weak';
      if (score < maxScore * 0.8) return 'Medium';
      return 'Strong';
    }),

    strengthBarClass: computed(() => ({
      'strength-fill--weak': this.vm.strengthScore() < 2,
      'strength-fill--medium': this.vm.strengthScore() >= 2 && this.vm.strengthScore() < 4,
      'strength-fill--strong': this.vm.strengthScore() >= 4
    })),

    // Validation requirements
    validationRequirements: computed(() => {
      const password = this._value;
      const requirements = [];

      requirements.push({
        text: `At least ${this.minLength()} characters`,
        isMet: password.length >= this.minLength()
      });

      if (this.requireLowercase()) {
        requirements.push({
          text: 'At least one lowercase letter',
          isMet: /[a-z]/.test(password)
        });
      }

      if (this.requireUppercase()) {
        requirements.push({
          text: 'At least one uppercase letter',
          isMet: /[A-Z]/.test(password)
        });
      }

      if (this.requireNumbers()) {
        requirements.push({
          text: 'At least one number',
          isMet: /\d/.test(password)
        });
      }

      if (this.requireSpecialChars()) {
        requirements.push({
          text: 'At least one special character',
          isMet: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
      }

      return requirements;
    }),

    hasValidationErrors: computed(() => {
      const errors = this.validationErrors();
      return errors !== null && Object.keys(errors).length > 0;
    }),

    validationErrorMessages: computed(() => {
      const errors = this.validationErrors();
      if (!errors) return [];

      const messages: string[] = [];

      if (errors['required']) messages.push('Password is required');
      if (errors['minlength']) messages.push(`Password must be at least ${this.minLength()} characters`);
      if (errors['requiresLowercase']) messages.push('Password must contain lowercase letters');
      if (errors['requiresUppercase']) messages.push('Password must contain uppercase letters');
      if (errors['requiresNumbers']) messages.push('Password must contain numbers');
      if (errors['requiresSpecialChars']) messages.push('Password must contain special characters');

      return messages;
    }),

    calculateMaxScore: (): number => {
      let maxScore = 1; // Length requirement
      if (this.requireLowercase()) maxScore++;
      if (this.requireUppercase()) maxScore++;
      if (this.requireNumbers()) maxScore++;
      if (this.requireSpecialChars()) maxScore++;
      return maxScore;
    },

    togglePasswordVisibility: (): void => {
      this.showPassword.update(show => !show);
    }
  };

  // ✅ CVA property accessors
  get currentValue(): string {
    return this._value;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  // ✅ ControlValueAccessor implementation
  writeValue(value: string): void {
    this._value = value || '';
    this.validatePassword();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  // ✅ Validator implementation
  validate(): ValidationErrors | null {
    return this.validationErrors();
  }

  // ✅ Event handlers
  readonly handleInput = (event: Event): void => {
    const newValue = (event.target as HTMLInputElement).value;
    this._value = newValue;
    this.onChange(newValue);
    this.validatePassword();
  };

  readonly handleBlur = (): void => {
    this.onTouched();
  };

  // ✅ Validation logic
  private readonly validatePassword = (): void => {
    const password = this._value;
    const errors: ValidationErrors = {};

    if (password.length < this.minLength()) {
      errors['minlength'] = {
        requiredLength: this.minLength(),
        actualLength: password.length
      };
    }

    if (this.requireLowercase() && !/[a-z]/.test(password)) {
      errors['requiresLowercase'] = true;
    }

    if (this.requireUppercase() && !/[A-Z]/.test(password)) {
      errors['requiresUppercase'] = true;
    }

    if (this.requireNumbers() && !/\d/.test(password)) {
      errors['requiresNumbers'] = true;
    }

    if (this.requireSpecialChars() && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors['requiresSpecialChars'] = true;
    }

    this.validationErrors.set(Object.keys(errors).length > 0 ? errors : null);
  };

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
```

---

## Error Handling Strategies

### 1. Validation Error Display

#### 1.1 Error State Management
```typescript
// ✅ REQUIRED: Comprehensive error handling in CVA
@Component({
  selector: 'app-validated-input',
  template: `
    <div class="validated-input" [class]="vm.containerClasses()">
      <label [for]="vm.inputId()">
        {{ vm.labelText() }}
        <span class="required-indicator" *ngIf="required()">*</span>
      </label>

      <div class="input-container">
        <input
          [id]="vm.inputId()"
          [type]="inputType()"
          [value]="currentValue"
          [disabled]="disabled"
          [placeholder]="vm.placeholderText()"
          (input)="handleInput($event)"
          (blur)="handleBlur()"
          [attr.aria-invalid]="vm.hasError()"
          [attr.aria-describedby]="vm.errorDescriptionId()"
        >

        <!-- Error icon -->
        <span class="error-icon" *ngIf="vm.hasError() && vm.showErrorIcon()">
          ⚠️
        </span>

        <!-- Success icon -->
        <span class="success-icon" *ngIf="vm.isValid() && vm.showSuccessIcon()">
          ✅
        </span>
      </div>

      <!-- Error messages -->
      <div
        class="error-messages"
        [id]="vm.errorDescriptionId()"
        *ngIf="vm.shouldShowErrors()"
        role="alert"
        aria-live="polite"
      >
        <div
          *ngFor="let error of vm.currentErrors(); trackBy: vm.trackError"
          class="error-message"
        >
          <span class="error-code" *ngIf="showErrorCodes()">
            [{{ error.code }}]
          </span>
          <span class="error-text">{{ error.message }}</span>
        </div>
      </div>

      <!-- Help text -->
      <div class="help-text" *ngIf="vm.shouldShowHelp()">
        {{ helpText() }}
      </div>
    </div>
  `
})
export class ValidatedInput implements ControlValueAccessor, Validator, OnDestroy {
  // ✅ CVA state outside VM
  private _value: string = '';
  private _disabled: boolean = false;
  private _touched: boolean = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  // Configuration inputs
  label = input<string>('Input Field');
  inputType = input<'text' | 'email' | 'password' | 'tel'>('text');
  placeholder = input<string>('');
  helpText = input<string>('');
  required = input<boolean>(false);
  showErrorCodes = input<boolean>(false);

  // Validation configuration
  minLength = input<number | null>(null);
  maxLength = input<number | null>(null);
  pattern = input<string | null>(null);
  customValidators = input<ValidatorFn[]>([]);

  // UI configuration
  showErrorIcon = input<boolean>(true);
  showSuccessIcon = input<boolean>(true);
  showErrorsOnTouch = input<boolean>(true);

  // Internal error state
  private readonly validationErrors = signal<ValidationErrors | null>(null);

  readonly vm = {
    containerClasses: computed(() => ({
      'validated-input--error': this.vm.hasError() && this.vm.shouldShowErrors(),
      'validated-input--valid': this.vm.isValid(),
      'validated-input--disabled': this.disabled,
      'validated-input--touched': this._touched
    })),

    inputId: computed(() => `input-${Math.random().toString(36).substr(2, 9)}`),
    errorDescriptionId: computed(() => `${this.vm.inputId()}-errors`),

    labelText: computed(() => this.label()),
    placeholderText: computed(() => this.placeholder()),

    hasError: computed(() => {
      const errors = this.validationErrors();
      return errors !== null && Object.keys(errors).length > 0;
    }),

    isValid: computed(() => {
      const errors = this.validationErrors();
      return this._value.length > 0 && errors === null;
    }),

    shouldShowErrors: computed(() => {
      if (!this.vm.hasError()) return false;
      return !this.showErrorsOnTouch() || this._touched;
    }),

    shouldShowHelp: computed(() => {
      const helpText = this.helpText();
      return helpText.length > 0 && !this.vm.shouldShowErrors();
    }),

    currentErrors: computed(() => {
      const errors = this.validationErrors();
      if (!errors) return [];

      const errorList: Array<{ code: string; message: string }> = [];

      Object.keys(errors).forEach(errorCode => {
        const message = this.getErrorMessage(errorCode, errors[errorCode]);
        errorList.push({ code: errorCode, message });
      });

      return errorList;
    }),

    trackError: (index: number, error: { code: string; message: string }): string =>
      error.code
  };

  // ✅ CVA property accessors
  get currentValue(): string {
    return this._value;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  // ✅ ControlValueAccessor implementation
  writeValue(value: string): void {
    this._value = value || '';
    this.validateInput();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  // ✅ Validator implementation
  validate(): ValidationErrors | null {
    return this.validationErrors();
  }

  // ✅ Event handlers
  readonly handleInput = (event: Event): void => {
    const newValue = (event.target as HTMLInputElement).value;
    this._value = newValue;
    this.onChange(newValue);
    this.validateInput();
  };

  readonly handleBlur = (): void => {
    this._touched = true;
    this.onTouched();
    this.validateInput();
  };

  // ✅ Validation logic
  private readonly validateInput = (): void => {
    const value = this._value;
    const errors: ValidationErrors = {};

    // Required validation
    if (this.required() && (!value || value.trim().length === 0)) {
      errors['required'] = true;
    }

    // Length validations
    if (value && this.minLength() !== null && value.length < this.minLength()!) {
      errors['minlength'] = {
        requiredLength: this.minLength(),
        actualLength: value.length
      };
    }

    if (value && this.maxLength() !== null && value.length > this.maxLength()!) {
      errors['maxlength'] = {
        requiredLength: this.maxLength(),
        actualLength: value.length
      };
    }

    // Pattern validation
    if (value && this.pattern() !== null) {
      const regex = new RegExp(this.pattern()!);
      if (!regex.test(value)) {
        errors['pattern'] = {
          requiredPattern: this.pattern(),
          actualValue: value
        };
      }
    }

    // Input type specific validations
    if (value && this.inputType() === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors['email'] = true;
      }
    }

    // Custom validators
    this.customValidators().forEach(validator => {
      const result = validator({ value } as AbstractControl);
      if (result) {
        Object.assign(errors, result);
      }
    });

    this.validationErrors.set(Object.keys(errors).length > 0 ? errors : null);
  };

  private readonly getErrorMessage = (errorCode: string, errorValue: unknown): string => {
    switch (errorCode) {
      case 'required':
        return `${this.label()} is required`;

      case 'minlength':
        const minLengthInfo = errorValue as { requiredLength: number; actualLength: number };
        return `Must be at least ${minLengthInfo.requiredLength} characters (currently ${minLengthInfo.actualLength})`;

      case 'maxlength':
        const maxLengthInfo = errorValue as { requiredLength: number; actualLength: number };
        return `Must not exceed ${maxLengthInfo.requiredLength} characters (currently ${maxLengthInfo.actualLength})`;

      case 'email':
        return 'Please enter a valid email address';

      case 'pattern':
        return 'Please enter a value in the correct format';

      default:
        return `Validation error: ${errorCode}`;
    }
  };

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
```

---

## Advanced CVA Patterns

### 1. Nested CVA Components

#### 1.1 Composite CVA with Sub-components
```typescript
// ✅ REQUIRED: Complex composite CVA component
interface IAddressDetails {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly country: string;
}

@Component({
  selector: 'app-address-form',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressForm),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AddressForm),
      multi: true
    }
  ],
  template: `
    <fieldset class="address-form" [disabled]="disabled">
      <legend>{{ vm.legendText() }}</legend>

      <div class="address-form__grid">
        <!-- Street Address -->
        <div class="form-group form-group--full-width">
          <app-validated-input
            label="Street Address"
            [value]="vm.currentAddress().street"
            [disabled]="disabled"
            [required]="true"
            (valueChange)="handleStreetChange($event)"
            (blur)="handleFieldBlur()"
          />
        </div>

        <!-- City -->
        <div class="form-group">
          <app-validated-input
            label="City"
            [value]="vm.currentAddress().city"
            [disabled]="disabled"
            [required]="true"
            (valueChange)="handleCityChange($event)"
            (blur)="handleFieldBlur()"
          />
        </div>

        <!-- State -->
        <div class="form-group">
          <label for="state-select">State</label>
          <select
            id="state-select"
            [value]="vm.currentAddress().state"
            [disabled]="disabled"
            (change)="handleStateChange($event)"
            (blur)="handleFieldBlur()"
          >
            <option value="">Select State</option>
            <option *ngFor="let state of vm.availableStates()" [value]="state.code">
              {{ state.name }}
            </option>
          </select>
        </div>

        <!-- ZIP Code -->
        <div class="form-group">
          <app-validated-input
            label="ZIP Code"
            inputType="text"
            [value]="vm.currentAddress().zipCode"
            [disabled]="disabled"
            [required]="true"
            [pattern]="vm.zipCodePattern()"
            [maxLength]="10"
            (valueChange)="handleZipCodeChange($event)"
            (blur)="handleFieldBlur()"
          />
        </div>

        <!-- Country -->
        <div class="form-group form-group--full-width">
          <label for="country-select">Country</label>
          <select
            id="country-select"
            [value]="vm.currentAddress().country"
            [disabled]="disabled"
            (change)="handleCountryChange($event)"
            (blur)="handleFieldBlur()"
          >
            <option *ngFor="let country of vm.availableCountries()" [value]="country.code">
              {{ country.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Address validation summary -->
      <div class="address-validation" *ngIf="vm.showValidationSummary()">
        <div class="validation-summary" [class]="vm.validationSummaryClass()">
          <span class="validation-icon">{{ vm.validationIcon() }}</span>
          <span class="validation-message">{{ vm.validationMessage() }}</span>
        </div>
      </div>
    </fieldset>
  `
})
export class AddressForm implements ControlValueAccessor, Validator, OnDestroy {
  // ✅ CVA state outside VM
  private _value: IAddressDetails = {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  };
  private _disabled: boolean = false;

  private onChange: (value: IAddressDetails) => void = () => {};
  private onTouched: () => void = () => {};

  // Configuration
  label = input<string>('Address');
  countries = input<ReadonlyArray<{ code: string; name: string }>>([
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' }
  ]);

  // Validation state
  private readonly validationErrors = signal<ValidationErrors | null>(null);
  private readonly fieldErrors = signal<Record<string, string>>({});

  readonly vm = {
    legendText: computed(() => this.label()),

    currentAddress: computed(() => this._value),

    availableStates: computed(() => {
      const country = this._value.country;
      if (country === 'US') {
        return [
          { code: 'CA', name: 'California' },
          { code: 'NY', name: 'New York' },
          { code: 'TX', name: 'Texas' },
          { code: 'FL', name: 'Florida' }
        ];
      }
      if (country === 'CA') {
        return [
          { code: 'ON', name: 'Ontario' },
          { code: 'BC', name: 'British Columbia' },
          { code: 'AB', name: 'Alberta' },
          { code: 'QC', name: 'Quebec' }
        ];
      }
      return [];
    }),

    availableCountries: computed(() => this.countries()),

    zipCodePattern: computed(() => {
      const country = this._value.country;
      if (country === 'US') {
        return '^\\d{5}(-\\d{4})?$'; // US ZIP code pattern
      }
      if (country === 'CA') {
        return '^[A-Za-z]\\d[A-Za-z] \\d[A-Za-z]\\d$'; // Canadian postal code
      }
      return null;
    }),

    showValidationSummary: computed(() => {
      const errors = this.validationErrors();
      const fieldErrors = this.fieldErrors();
      return errors !== null || Object.keys(fieldErrors).length > 0;
    }),

    validationSummaryClass: computed(() => ({
      'validation-summary--error': this.vm.hasValidationErrors(),
      'validation-summary--valid': this.vm.isValid()
    })),

    validationIcon: computed(() => {
      return this.vm.hasValidationErrors() ? '⚠️' : '✅';
    }),

    validationMessage: computed(() => {
      if (this.vm.hasValidationErrors()) {
        const errorCount = Object.keys(this.validationErrors() || {}).length +
                          Object.keys(this.fieldErrors()).length;
        return `${errorCount} validation error${errorCount !== 1 ? 's' : ''} found`;
      }
      return 'Address is valid';
    }),

    hasValidationErrors: computed(() => {
      const errors = this.validationErrors();
      const fieldErrors = this.fieldErrors();
      return (errors !== null && Object.keys(errors).length > 0) ||
             Object.keys(fieldErrors).length > 0;
    }),

    isValid: computed(() => {
      return this.vm.isAddressComplete() && !this.vm.hasValidationErrors();
    }),

    isAddressComplete: computed(() => {
      const addr = this._value;
      return !!(addr.street && addr.city && addr.state && addr.zipCode && addr.country);
    })
  };

  // ✅ CVA property accessors
  get disabled(): boolean {
    return this._disabled;
  }

  // ✅ ControlValueAccessor implementation
  writeValue(value: IAddressDetails): void {
    this._value = value || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    };
    this.validateAddress();
  }

  registerOnChange(fn: (value: IAddressDetails) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  // ✅ Validator implementation
  validate(): ValidationErrors | null {
    return this.validationErrors();
  }

  // ✅ Event handlers
  readonly handleStreetChange = (street: string): void => {
    this.updateAddress({ street });
  };

  readonly handleCityChange = (city: string): void => {
    this.updateAddress({ city });
  };

  readonly handleStateChange = (event: Event): void => {
    const state = (event.target as HTMLSelectElement).value;
    this.updateAddress({ state });
  };

  readonly handleZipCodeChange = (zipCode: string): void => {
    this.updateAddress({ zipCode });
  };

  readonly handleCountryChange = (event: Event): void => {
    const country = (event.target as HTMLSelectElement).value;
    // Clear state when country changes
    this.updateAddress({ country, state: '' });
  };

  readonly handleFieldBlur = (): void => {
    this.onTouched();
  };

  // ✅ Helper methods
  private readonly updateAddress = (partial: Partial<IAddressDetails>): void => {
    this._value = { ...this._value, ...partial };
    this.onChange(this._value);
    this.validateAddress();
  };

  private readonly validateAddress = (): void => {
    const addr = this._value;
    const errors: ValidationErrors = {};

    // Required field validations
    if (!addr.street?.trim()) {
      errors['streetRequired'] = 'Street address is required';
    }

    if (!addr.city?.trim()) {
      errors['cityRequired'] = 'City is required';
    }

    if (!addr.state) {
      errors['stateRequired'] = 'State is required';
    }

    if (!addr.zipCode?.trim()) {
      errors['zipCodeRequired'] = 'ZIP code is required';
    }

    // ZIP code format validation
    if (addr.zipCode) {
      const pattern = this.vm.zipCodePattern();
      if (pattern && !new RegExp(pattern).test(addr.zipCode)) {
        errors['invalidZipCode'] = 'Invalid ZIP code format';
      }
    }

    this.validationErrors.set(Object.keys(errors).length > 0 ? errors : null);
  };

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
```

---

## Testing CVA Components

### 1. Unit Testing Strategies

#### 1.1 CVA Interface Testing
```typescript
describe('RatingSelector CVA', () => {
  let component: RatingSelector;
  let fixture: ComponentFixture<RatingSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingSelector]
    }).compileComponents();

    fixture = TestBed.createComponent(RatingSelector);
    component = fixture.componentInstance;
  });

  describe('ControlValueAccessor Interface', () => {
    it('should implement ControlValueAccessor correctly', () => {
      expect(component.writeValue).toBeDefined();
      expect(component.registerOnChange).toBeDefined();
      expect(component.registerOnTouched).toBeDefined();
      expect(component.setDisabledState).toBeDefined();
    });

    it('should update internal value when writeValue is called', () => {
      component.writeValue(3);

      expect(component.value).toBe(3);
    });

    it('should call onChange when value changes through user interaction', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      // Simulate user rating selection
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { value: '4' },
        enumerable: true
      });

      component.handleRatingChange(event);

      expect(onChangeSpy).toHaveBeenCalledWith(4);
      expect(component.value).toBe(4);
    });

    it('should call onTouched when component is blurred', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      component.handleBlur();

      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should disable component when setDisabledState is called', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.disabled).toBe(true);
      expect(fixture.nativeElement.querySelector('fieldset')).toHaveAttribute('disabled');
    });
  });

  describe('Form Integration', () => {
    it('should work with reactive forms', () => {
      @Component({
        template: `
          <form [formGroup]="testForm">
            <app-rating-selector formControlName="rating"></app-rating-selector>
          </form>
        `
      })
      class TestHostComponent {
        testForm = new FormGroup({
          rating: new FormControl(0)
        });
      }

      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();

      const hostComponent = hostFixture.componentInstance;
      const ratingComponent = hostFixture.debugElement.query(
        By.directive(RatingSelector)
      ).componentInstance;

      // Test form value propagation to component
      hostComponent.testForm.patchValue({ rating: 5 });
      hostFixture.detectChanges();

      expect(ratingComponent.value).toBe(5);

      // Test component value propagation to form
      const event = new Event('change');
      Object.defineProperty(event, 'target', {
        value: { value: '3' },
        enumerable: true
      });

      ratingComponent.handleRatingChange(event);

      expect(hostComponent.testForm.get('rating')?.value).toBe(3);
    });

    it('should validate with form validators', () => {
      @Component({
        template: `
          <form [formGroup]="testForm">
            <app-rating-selector formControlName="rating"></app-rating-selector>
          </form>
        `
      })
      class TestHostComponent {
        testForm = new FormGroup({
          rating: new FormControl(0, [Validators.required, Validators.min(1)])
        });
      }

      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();

      const hostComponent = hostFixture.componentInstance;
      const ratingControl = hostComponent.testForm.get('rating')!;

      // Test required validation
      expect(ratingControl.hasError('required')).toBe(false); // 0 is not empty
      expect(ratingControl.hasError('min')).toBe(true); // 0 is less than 1

      // Set valid value
      ratingControl.setValue(3);
      expect(ratingControl.valid).toBe(true);
    });
  });

  describe('View Model Separation', () => {
    it('should keep CVA state separate from VM', () => {
      // Verify CVA state is not in VM
      expect(component.vm.hasOwnProperty('value')).toBe(false);
      expect(component.vm.hasOwnProperty('disabled')).toBe(false);
      expect(component.vm.hasOwnProperty('onChange')).toBe(false);

      // Verify VM contains only presentation logic
      expect(typeof component.vm.containerClasses).toBe('function');
      expect(typeof component.vm.isRatingSelected).toBe('function');
      expect(typeof component.vm.getStarDisplay).toBe('function');
    });

    it('should compute presentation values correctly', () => {
      fixture.componentRef.setInput('showStars', true);
      fixture.componentRef.setInput('maxRating', 5);
      component.writeValue(3);
      fixture.detectChanges();

      expect(component.vm.isRatingSelected(3)).toBe(true);
      expect(component.vm.isRatingSelected(4)).toBe(false);
      expect(component.vm.getStarDisplay(3)).toBe('★★★');
    });
  });
});
```

#### 1.2 Validation Testing
```typescript
describe('PasswordStrength Validation', () => {
  let component: PasswordStrength;
  let fixture: ComponentFixture<PasswordStrength>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrength]
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrength);
    component = fixture.componentInstance;
  });

  describe('Validator Interface', () => {
    it('should implement Validator interface', () => {
      expect(component.validate).toBeDefined();
      expect(typeof component.validate).toBe('function');
    });

    it('should return validation errors for weak password', () => {
      component.writeValue('weak');

      const errors = component.validate();

      expect(errors).not.toBeNull();
      expect(errors!['minlength']).toBeDefined();
      expect(errors!['requiresUppercase']).toBe(true);
      expect(errors!['requiresNumbers']).toBe(true);
      expect(errors!['requiresSpecialChars']).toBe(true);
    });

    it('should return null for strong password', () => {
      component.writeValue('StrongP@ssw0rd123');

      const errors = component.validate();

      expect(errors).toBeNull();
    });

    it('should validate length requirements', () => {
      fixture.componentRef.setInput('minLength', 12);
      component.writeValue('Short1!');

      const errors = component.validate();

      expect(errors!['minlength']).toEqual({
        requiredLength: 12,
        actualLength: 7
      });
    });
  });

  describe('Strength Calculation', () => {
    it('should calculate strength score correctly', () => {
      fixture.componentRef.setInput('minLength', 8);
      fixture.componentRef.setInput('requireUppercase', true);
      fixture.componentRef.setInput('requireLowercase', true);
      fixture.componentRef.setInput('requireNumbers', true);
      fixture.componentRef.setInput('requireSpecialChars', true);

      // Weak password (only length)
      component.writeValue('password');
      expect(component.vm.strengthScore()).toBe(2); // length + lowercase

      // Medium password
      component.writeValue('Password1');
      expect(component.vm.strengthScore()).toBe(4); // length + lower + upper + number

      // Strong password
      component.writeValue('Password1!');
      expect(component.vm.strengthScore()).toBe(5); // all requirements
    });

    it('should update strength percentage based on score', () => {
      fixture.componentRef.setInput('minLength', 8);

      component.writeValue('Password1!');
      fixture.detectChanges();

      // With all 5 requirements, max score is 5, current score is 5
      expect(component.vm.strengthPercentage()).toBe(100);

      component.writeValue('password');
      fixture.detectChanges();

      // Score is 2, percentage should be 40%
      expect(component.vm.strengthPercentage()).toBe(40);
    });
  });

  describe('Form Integration with Validation', () => {
    it('should integrate validation with reactive forms', () => {
      @Component({
        template: `
          <form [formGroup]="passwordForm">
            <app-password-strength
              formControlName="password"
              [minLength]="8"
              [requireUppercase]="true"
            ></app-password-strength>
          </form>
        `
      })
      class TestHostComponent {
        passwordForm = new FormGroup({
          password: new FormControl('')
        });
      }

      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();

      const hostComponent = hostFixture.componentInstance;
      const passwordControl = hostComponent.passwordForm.get('password')!;

      // Test weak password
      passwordControl.setValue('weak');
      expect(passwordControl.invalid).toBe(true);
      expect(passwordControl.errors!['minlength']).toBeDefined();
      expect(passwordControl.errors!['requiresUppercase']).toBe(true);

      // Test strong password
      passwordControl.setValue('StrongP@ssw0rd');
      expect(passwordControl.valid).toBe(true);
      expect(passwordControl.errors).toBeNull();
    });
  });
});
```

---

## Conclusion

This CVA-Based Components documentation establishes the essential patterns for implementing ControlValueAccessor components that comply with the Archland.hu Constitution. The key principles ensure:

- **Constitutional Compliance**: CVA-specific fields (`value`, `disabled`, `onChange`) are NEVER placed in the view-model
- **Proper Separation**: Clear distinction between form control logic and presentation logic
- **Seamless Integration**: Full compatibility with Angular's reactive forms system
- **Validation Support**: Comprehensive validation patterns using the Validator interface
- **Error Handling**: Robust error display and user feedback mechanisms
- **Testability**: Complete test coverage for CVA interface and form integration

**Implementation Requirements**:
- All CVA components MUST implement the complete ControlValueAccessor interface
- CVA state MUST be managed outside the view-model pattern
- Form validation MUST use the Validator interface when needed
- Error handling MUST provide clear, accessible feedback to users
- Testing MUST cover CVA interface, form integration, and validation scenarios

**Quality Gates**:
- CVA fields are never found in component view-models (code review enforcement)
- All CVA components pass form integration tests
- Validation components implement proper error handling
- Accessibility requirements are met for form controls and error messages
- Test coverage includes CVA interface, reactive forms integration, and validation scenarios

This architecture ensures CVA components are reusable, maintainable, and fully integrated with Angular's form system while maintaining the constitutional requirement for proper separation of concerns.

---

**Document Information**
- **Authority**: Archland.hu Constitution Component Architecture - CVA-Based Components
- **Review Cycle**: Quarterly (aligned with Angular forms updates)
- **Stakeholders**: Frontend developers, form architects, UX engineers, accessibility specialists
- **Related Documents**: [Component Structure Best Practices], [Type Safety Best Practices], [Framework Standards Best Practices]