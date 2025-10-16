# Attribute-Driven Components Best Practices

*Implementation guide for Archland.hu Constitution: Attribute-Driven Components*

## Core Principle

Pass required HTML attributes (e.g., `error`, `id`, `aria-*`) directly on the component, not inside the view-model (`vm`). This ensures proper DOM structure, accessibility compliance, and semantic HTML while maintaining clean separation of concerns.

## Why Attribute-Driven Components Matter

### Constitutional Compliance
- **Clean Separation**: HTML attributes belong to the DOM layer, not the view-model
- **Accessibility First**: ARIA attributes must be applied to the correct DOM elements
- **Semantic HTML**: Native HTML attributes provide built-in browser behavior
- **Type Safety**: Direct attribute binding prevents runtime errors

### Real-World Benefits for Archland.hu
- **SEO Optimization**: Proper HTML structure improves search engine rankings
- **Screen Reader Support**: Correct ARIA implementation for property search accessibility
- **Form Validation**: Native HTML validation works seamlessly
- **Developer Experience**: Predictable attribute behavior across components

## Implementation Patterns

### ✅ Correct: Direct Attribute Binding

```typescript
@Component({
  selector: 'app-property-search',
  template: `
    <div class="search-container">
      <input
        type="search"
        [value]="vm.searchQuery()"
        (input)="vm.updateQuery($event)"
        placeholder="Search properties..."
        class="search-input">
    </div>
  `,
  host: {
    // HTML attributes passed directly to component host
    '[attr.aria-label]': 'ariaLabel',
    '[attr.aria-describedby]': 'ariaDescribedBy',
    '[attr.id]': 'elementId',
    '[class.has-error]': 'hasError',
    '[attr.data-testid]': 'testId'
  }
})
export class PropertySearchComponent {
  // Inputs for HTML attributes - NOT in vm
  ariaLabel = input<string>('Search real estate properties');
  ariaDescribedBy = input<string | undefined>();
  elementId = input<string | undefined>();
  hasError = input<boolean>(false);
  testId = input<string | undefined>();

  // View-model for component state only
  vm = {
    searchQuery: signal(''),
    isLoading: signal(false),
    results: signal<IProperty[]>([]),

    updateQuery: (event: Event) => {
      const target = event.target as HTMLInputElement;
      this.vm.searchQuery.set(target.value);
    }
  };
}
```

### ✅ Usage Example

```html
<!-- Correct: Attributes passed directly to component -->
<app-property-search
  id="main-search"
  aria-label="Find investment properties"
  aria-describedby="search-help-text"
  [hasError]="searchForm.get('query')?.invalid"
  data-testid="property-search-field">
</app-property-search>

<div id="search-help-text" class="help-text">
  Search by location, property type, or investment criteria
</div>
```

### ❌ Incorrect: Attributes in View-Model

```typescript
// DON'T DO THIS - Violates constitutional principles
@Component({
  selector: 'app-property-search',
  template: `
    <div
      [attr.id]="vm.elementId()"
      [attr.aria-label]="vm.ariaLabel()"
      [class.has-error]="vm.hasError()">
      <!-- Component content -->
    </div>
  `
})
export class PropertySearchComponent {
  vm = {
    // WRONG: HTML attributes don't belong in view-model
    elementId: signal<string>(''),
    ariaLabel: signal<string>(''),
    hasError: signal<boolean>(false),

    // Correct: Component state belongs here
    searchQuery: signal(''),
    isLoading: signal(false)
  };
}
```

## Advanced Host Binding Patterns

### Dynamic Class and Style Binding

```typescript
@Component({
  selector: 'app-property-card',
  host: {
    // Static classes
    'class': 'property-card',

    // Dynamic classes based on inputs
    '[class.featured]': 'featured()',
    '[class.sold]': 'status() === "sold"',
    '[class.new-listing]': 'isNewListing()',

    // Style binding with units
    '[style.--priority-level]': 'priorityLevel()',
    '[style.border-color]': 'status() === "sold" ? "var(--color-success)" : "var(--color-border)"',

    // ARIA attributes
    '[attr.aria-label]': 'ariaLabel',
    '[attr.role]': '"article"',
    '[attr.tabindex]': 'focusable() ? 0 : -1'
  }
})
export class PropertyCardComponent {
  // Direct attribute inputs
  featured = input<boolean>(false);
  status = input<'available' | 'sold' | 'pending'>('available');
  priorityLevel = input<number>(0);
  ariaLabel = input<string>();
  focusable = input<boolean>(true);

  // Computed properties for complex logic
  isNewListing = computed(() => {
    // Logic based on property date
    return false; // Simplified
  });

  // View-model for internal state
  vm = {
    isExpanded: signal(false),
    showDetails: signal(false)
  };
}
```

### Form Integration Pattern

```typescript
@Component({
  selector: 'app-contact-form-field',
  template: `
    <div class="field-container">
      <label [for]="fieldId">{{ label() }}</label>
      <input
        [id]="fieldId"
        [type]="type()"
        [value]="vm.value()"
        [required]="required()"
        [disabled]="disabled()"
        (input)="vm.updateValue($event)"
        (blur)="vm.markTouched()"
        class="form-input">

      @if (hasError() && vm.touched()) {
        <div class="error-message" [id]="errorId">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
  host: {
    '[attr.aria-invalid]': 'hasError()',
    '[attr.aria-describedby]': 'hasError() ? errorId : undefined',
    '[class.field-error]': 'hasError()',
    '[class.field-disabled]': 'disabled()'
  }
})
export class ContactFormFieldComponent {
  // HTML form attributes - NOT in vm
  fieldId = input.required<string>();
  label = input.required<string>();
  type = input<string>('text');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  hasError = input<boolean>(false);
  errorMessage = input<string>('');

  // Computed error ID for ARIA
  errorId = computed(() => `${this.fieldId()}-error`);

  // View-model for field state
  vm = {
    value: signal(''),
    touched: signal(false),

    updateValue: (event: Event) => {
      const target = event.target as HTMLInputElement;
      this.vm.value.set(target.value);
    },

    markTouched: () => {
      this.vm.touched.set(true);
    }
  };
}
```

## Accessibility Best Practices

### ARIA Attributes Binding

```typescript
@Component({
  host: {
    // Always use attr. prefix for ARIA
    '[attr.aria-label]': 'ariaLabel',
    '[attr.aria-labelledby]': 'ariaLabelledBy',
    '[attr.aria-describedby]': 'ariaDescribedBy',
    '[attr.aria-expanded]': 'expanded()',
    '[attr.aria-invalid]': 'hasValidationError()',
    '[attr.aria-live]': 'announcements() ? "polite" : undefined',

    // Role and state
    '[attr.role]': 'role',
    '[attr.tabindex]': 'focusable() ? 0 : -1'
  }
})
export class AccessibleComponent {
  // ARIA inputs
  ariaLabel = input<string>();
  ariaLabelledBy = input<string>();
  ariaDescribedBy = input<string>();
  role = input<string>('button');

  // State inputs
  expanded = input<boolean>(false);
  hasValidationError = input<boolean>(false);
  focusable = input<boolean>(true);
  announcements = input<boolean>(false);
}
```

### Semantic HTML Enhancement

```typescript
@Component({
  selector: 'app-property-navigation',
  template: `
    <nav class="property-nav" [attr.aria-label]="navigationLabel()">
      <ol class="breadcrumb">
        @for (item of vm.breadcrumbs(); track item.id) {
          <li>
            @if (item.current) {
              <span aria-current="page">{{ item.label }}</span>
            } @else {
              <a [href]="item.url">{{ item.label }}</a>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  host: {
    // Semantic navigation role
    'role': 'navigation',
    '[attr.aria-label]': 'navigationLabel()',
    '[attr.id]': 'navigationId'
  }
})
export class PropertyNavigationComponent {
  // Navigation attributes
  navigationLabel = input<string>('Property navigation');
  navigationId = input<string>();

  // View-model for navigation state
  vm = {
    breadcrumbs: signal<IBreadcrumb[]>([]),
    currentPage: signal<string>('')
  };
}
```

## Testing Patterns

### Attribute Verification Tests

```typescript
describe('PropertySearchComponent', () => {
  it('should apply HTML attributes to host element', () => {
    const fixture = createComponent(PropertySearchComponent, {
      componentInputs: {
        elementId: 'property-search-1',
        ariaLabel: 'Search investment properties',
        hasError: true,
        testId: 'search-component'
      }
    });

    const hostElement = fixture.debugElement.nativeElement;

    expect(hostElement.id).toBe('property-search-1');
    expect(hostElement.getAttribute('aria-label')).toBe('Search investment properties');
    expect(hostElement.classList.contains('has-error')).toBe(true);
    expect(hostElement.getAttribute('data-testid')).toBe('search-component');
  });

  it('should maintain accessibility attributes dynamically', () => {
    const fixture = createComponent(PropertySearchComponent, {
      componentInputs: {
        ariaDescribedBy: 'help-text',
        hasError: false
      }
    });

    fixture.setInput('hasError', true);
    fixture.detectChanges();

    const hostElement = fixture.debugElement.nativeElement;
    expect(hostElement.getAttribute('aria-describedby')).toBe('help-text');
    expect(hostElement.classList.contains('has-error')).toBe(true);
  });
});
```

## Migration Strategy

### From Attribute-in-VM to Direct Binding

```typescript
// BEFORE: Attributes in view-model (incorrect)
@Component({
  template: `
    <div [attr.id]="vm.elementId()" [class.error]="vm.hasError()">
      Content
    </div>
  `
})
export class OldComponent {
  vm = {
    elementId: signal(''),
    hasError: signal(false)
  };
}

// AFTER: Direct attribute binding (correct)
@Component({
  template: `<div>Content</div>`,
  host: {
    '[attr.id]': 'elementId',
    '[class.error]': 'hasError'
  }
})
export class NewComponent {
  elementId = input<string>();
  hasError = input<boolean>(false);

  vm = {
    // Only component state here
    isLoading: signal(false)
  };
}
```

## Common Patterns for Archland.hu

### Property Components

```typescript
// Property Card with attributes
@Component({
  selector: 'app-property-card',
  host: {
    'role': 'article',
    '[attr.aria-labelledby]': 'titleId',
    '[attr.data-property-id]': 'propertyId',
    '[class.featured]': 'featured()',
    '[class.sold]': 'status() === "sold"'
  }
})
export class PropertyCardComponent {
  propertyId = input.required<string>();
  featured = input<boolean>(false);
  status = input<'available' | 'sold' | 'pending'>('available');
  titleId = computed(() => `property-${this.propertyId()}-title`);
}

// Contact Form with validation attributes
@Component({
  selector: 'app-contact-form',
  host: {
    '[attr.novalidate]': 'true',
    '[attr.aria-live]': 'submitStatus() ? "polite" : undefined'
  }
})
export class ContactFormComponent {
  submitStatus = input<'success' | 'error' | null>(null);
}
```

## Key Takeaways

1. **Constitutional Compliance**: Never put HTML attributes in the view-model
2. **Accessibility First**: Use proper ARIA attributes with `attr.` prefix
3. **Semantic HTML**: Leverage native HTML behavior and attributes
4. **Host Binding**: Use Angular's host binding for clean attribute management
5. **Type Safety**: Define inputs for all attributes to maintain type safety
6. **Testing**: Verify attribute application in component tests
7. **Performance**: Direct attribute binding is more efficient than template binding

This approach ensures components are accessible, semantic, and follow Angular best practices while maintaining the constitutional separation between DOM attributes and component state.