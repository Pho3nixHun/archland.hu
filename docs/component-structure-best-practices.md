# Component Structure Best Practices

*Implementation guide for Angular Development Constitution: Component Structure*

*View-Model as Input Pattern for Pure Presentation Components*

## Core Principle

Components must receive a `vm` (view-model) as a typed input containing pre-computed, static data ready for template rendering. Components are pure presentation layers that render the provided view-model without business logic, state management, or data transformation.

## Why Input-Based View-Models Matter

### Constitutional Compliance
- **Pure Presentation**: Components only render data, never compute or transform it
- **Deterministic Rendering**: Same VM input always produces same output
- **Type Safety**: Strongly-typed interfaces define exactly what data components need
- **Testability**: Easy to test with mock view-model data
- **Reusability**: Components work anywhere with compatible view-model data

### Architecture Benefits
- **Clear Separation**: Services handle business logic, components handle presentation
- **Performance**: No reactive computations in components, pre-computed data only
- **Maintainability**: Changes to business logic don't affect component structure
- **Consistency**: All components follow the same input-based pattern

## View-Model Pattern Implementation

### 1. Component Structure

```typescript
// Component interface - defines exactly what data the component needs
interface IContactInformationVM {
  readonly sectionTitleKey: string;           // Translation key for Transloco
  readonly sectionExplanationKey: string | null;
  readonly emailLabelKey: string;
  readonly emailValue: string;                // Pre-formatted, ready-to-display value
  readonly phoneLabelKey: string | null;
  readonly phoneValue: string | null;
  readonly variant: 'user' | 'admin';         // For conditional rendering/styling
  readonly showActions: boolean;
  readonly isLoading: boolean;
}

// Pure presentation component
@Component({
  selector: 'app-contact-information',
  template: `
    <ng-container *transloco="let t">
      <section [attr.data-variant]="vm().variant" class="contact-section">
        <h2>{{ t(vm().sectionTitleKey) }}</h2>

        @if (vm().sectionExplanationKey) {
          <p class="explanation">{{ t(vm().sectionExplanationKey) }}</p>
        }

        @if (vm().isLoading) {
          <div class="loading-spinner" aria-label="Loading contact information">
            {{ t('common.loading') }}
          </div>
        } @else {
          <dl class="contact-details">
            <dt>{{ t(vm().emailLabelKey) }}</dt>
            <dd>
              <a [href]="'mailto:' + vm().emailValue">{{ vm().emailValue }}</a>
            </dd>

            @if (vm().phoneLabelKey && vm().phoneValue) {
              <dt>{{ t(vm().phoneLabelKey) }}</dt>
              <dd>
                <a [href]="'tel:' + vm().phoneValue">{{ vm().phoneValue }}</a>
              </dd>
            }
          </dl>

          @if (vm().showActions) {
            <div class="actions">
              <button
                type="button"
                class="btn-secondary"
                (click)="editContact.emit()">
                {{ t('contact.actions.edit') }}
              </button>
            </div>
          }
        }
      </section>
    </ng-container>
  `,
  styleUrls: ['./contact-information.component.scss']
})
export class ContactInformationComponent {
  // ✅ REQUIRED: VM as typed input
  vm = input.required<IContactInformationVM>();

  // ✅ ALLOWED: Event outputs for user interactions
  editContact = output<void>();

  // ❌ NEVER: Internal state, computed values, or business logic
  // private internalState = signal(...);  // NO!
  // get computedValue() { ... }           // NO!
  // private businessLogic() { ... }       // NO!
}
```

### 2. Service Layer - VM Creation

```typescript
@Injectable({
  providedIn: 'root'
})
export class ContactInformationService {
  private readonly contactStore = inject(ContactStore);
  private readonly userStore = inject(UserStore);

  // ✅ Service responsibility: Transform domain data from store into view-model
  getContactInformationVM = (): Signal<IContactInformationVM> => {
    return computed(() => {
      const contact = this.contactStore.selectedContact();
      const currentUser = this.userStore.currentUser();
      const isLoading = this.contactStore.isLoading();

      if (isLoading || !contact) {
        return this.createLoadingVM();
      }

      return {
        sectionTitleKey: 'contact.title',
        sectionExplanationKey: contact.isPublic ? null : 'contact.private.explanation',
        emailLabelKey: 'contact.email.label',
        emailValue: contact.email,
        phoneLabelKey: contact.phone ? 'contact.phone.label' : null,
        phoneValue: contact.phone || null,
        variant: this.determineVariant(contact, currentUser),
        showActions: this.canEditContact(contact, currentUser),
        isLoading: false
      };
    });
  };

  private createLoadingVM = (): IContactInformationVM => ({
    sectionTitleKey: 'contact.title',
    sectionExplanationKey: null,
    emailLabelKey: 'contact.email.label',
    emailValue: '',
    phoneLabelKey: null,
    phoneValue: null,
    variant: 'user',
    showActions: false,
    isLoading: true
  });

  private determineVariant = (contact: ContactDomain, user: UserDomain): 'user' | 'admin' => {
    return user.roles.includes('admin') || contact.userId === user.id ? 'admin' : 'user';
  };

  private canEditContact = (contact: ContactDomain, user: UserDomain): boolean => {
    return user.roles.includes('admin') || contact.userId === user.id;
  };
}
```

### 3. Store Layer - Data Management

```typescript
// SignalStore handles data fetching and state management
export const ContactStore = signalStore(
  { providedIn: 'root' },
  withState<IContactState>({
    contacts: [],
    selectedContact: null,
    isLoading: false,
    error: null
  }),
  withMethods((store, contactApiService = inject(ContactApiService)) => ({
    // ✅ Store responsibility: Data fetching and state management
    loadContact: (contactId: string) => {
      patchState(store, { isLoading: true, error: null });

      contactApiService.getContactById(contactId).subscribe({
        next: (contact) => {
          patchState(store, {
            selectedContact: contact,
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

    selectContact: (contact: IContactDomain) => {
      patchState(store, { selectedContact: contact });
    },

    updateContact: (contactId: string, updates: Partial<IContactDomain>) => {
      const currentContact = store.selectedContact();
      if (!currentContact || currentContact.id !== contactId) return;

      // Optimistic update
      patchState(store, {
        selectedContact: { ...currentContact, ...updates }
      });

      contactApiService.updateContact(contactId, updates).subscribe({
        next: (updatedContact) => {
          patchState(store, { selectedContact: updatedContact });
        },
        error: (error) => {
          // Revert on error
          patchState(store, {
            selectedContact: currentContact,
            error: error.message
          });
        }
      });
    }
  }))
);
```

### 4. Parent Component Usage

```typescript
@Component({
  selector: 'app-user-profile',
  template: `
    <div class="user-profile">
      <app-contact-information
        [vm]="contactVM()"
        (editContact)="handleEditContact()" />

      <!-- Other profile sections -->
    </div>
  `
})
export class UserProfileComponent {
  private readonly contactService = inject(ContactInformationService);
  private readonly contactStore = inject(ContactStore);
  private readonly router = inject(Router);

  // ✅ Get VM from service (service gets data from store)
  contactVM = this.contactService.getContactInformationVM();

  ngOnInit(): void {
    // ✅ Trigger data loading through store
    this.contactStore.loadContact('current-user-contact');
  }

  handleEditContact = (): void => {
    // Handle the edit action - this is where business logic lives
    this.router.navigate(['/contact/edit']);
  };
}
```

## Component Variants Pattern

### Variant-Driven Styling

```typescript
// VM interface with variant support
interface ICardVM {
  readonly title: string;
  readonly content: string;
  readonly variant: 'primary' | 'secondary' | 'danger';
  readonly size: 'small' | 'medium' | 'large';
  readonly interactive: boolean;
}

@Component({
  selector: 'app-card',
  template: `
    <div
      class="card"
      [attr.data-variant]="vm().variant"
      [attr.data-size]="vm().size"
      [class.interactive]="vm().interactive">

      <h3 class="card-title">{{ vm().title }}</h3>
      <div class="card-content">{{ vm().content }}</div>

      @if (vm().interactive) {
        <div class="card-actions">
          <ng-content select="[slot=actions]"></ng-content>
        </div>
      }
    </div>
  `,
  host: {
    '[attr.role]': 'vm().interactive ? "button" : "article"'
  }
})
export class CardComponent {
  vm = input.required<ICardVM>();
}
```

### CSS for Variant Support

```scss
.card {
  border-radius: var(--border-radius-md);
  padding: var(--space-4);
  border: 1px solid var(--border-default);

  // Variant-based styling
  &[data-variant="primary"] {
    background: var(--surface-primary);
    border-color: var(--border-primary);
  }

  &[data-variant="secondary"] {
    background: var(--surface-secondary);
  }

  &[data-variant="danger"] {
    background: var(--surface-danger-subtle);
    border-color: var(--border-danger);
  }

  // Size-based styling
  &[data-size="small"] {
    padding: var(--space-2);
    font-size: var(--font-size-sm);
  }

  &[data-size="large"] {
    padding: var(--space-6);
    font-size: var(--font-size-lg);
  }

  // Interactive state
  &.interactive {
    cursor: pointer;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: var(--shadow-md);
    }
  }
}
```

## Content Projection Patterns

### 1. Slot-Based Projection

```typescript
interface IModalVM {
  readonly titleKey: string;
  readonly showCloseButton: boolean;
  readonly size: 'small' | 'medium' | 'large';
  readonly variant: 'default' | 'danger' | 'success';
}

@Component({
  selector: 'app-modal',
  template: `
    <ng-container *transloco="let t">
      <div class="modal-overlay" (click)="closeModal.emit()">
        <div
          class="modal-content"
          [attr.data-size]="vm().size"
          [attr.data-variant]="vm().variant"
          (click)="$event.stopPropagation()">

          <header class="modal-header">
            <h2>{{ t(vm().titleKey) }}</h2>
            @if (vm().showCloseButton) {
              <button
                type="button"
                class="close-button"
                (click)="closeModal.emit()"
                [attr.aria-label]="t('common.close')">
                ×
              </button>
            }
          </header>

          <main class="modal-body">
            <ng-content></ng-content>
          </main>

          <footer class="modal-footer">
            <ng-content select="[slot=actions]"></ng-content>
          </footer>
        </div>
      </div>
    </ng-container>
  `
})
export class ModalComponent {
  vm = input.required<IModalVM>();
  closeModal = output<void>();
}
```

### 2. Usage with Content Projection

```html
<app-modal [vm]="confirmDeleteVM()" (closeModal)="handleCloseModal()">
  <!-- Default slot content -->
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>

  <!-- Named slot content -->
  <div slot="actions">
    <button type="button" class="btn-secondary" (click)="handleCancel()">
      Cancel
    </button>
    <button type="button" class="btn-danger" (click)="handleConfirmDelete()">
      Delete
    </button>
  </div>
</app-modal>
```

## Complex Component Example

### Form Component with VM Pattern

```typescript
interface IUserFormVM {
  readonly titleKey: string;
  readonly fields: {
    readonly firstName: IFieldVM;
    readonly lastName: IFieldVM;
    readonly email: IFieldVM;
    readonly role: ISelectFieldVM;
  };
  readonly submitButtonLabelKey: string;
  readonly cancelButtonLabelKey: string;
  readonly isSubmitting: boolean;
  readonly canSubmit: boolean;
  readonly variant: 'create' | 'edit';
}

interface IFieldVM {
  readonly labelKey: string;
  readonly value: string;
  readonly placeholder: string;
  readonly required: boolean;
  readonly errorKey: string | null;
  readonly disabled: boolean;
}

interface ISelectFieldVM extends IFieldVM {
  readonly options: ReadonlyArray<{
    readonly value: string;
    readonly labelKey: string;
  }>;
}

@Component({
  selector: 'app-user-form',
  template: `
    <ng-container *transloco="let t">
      <form class="user-form" [attr.data-variant]="vm().variant">
        <h2>{{ t(vm().titleKey) }}</h2>

        <div class="form-field">
          <label for="firstName">{{ t(vm().fields.firstName.labelKey) }}</label>
          <input
            id="firstName"
            type="text"
            [value]="vm().fields.firstName.value"
            [placeholder]="vm().fields.firstName.placeholder"
            [required]="vm().fields.firstName.required"
            [disabled]="vm().fields.firstName.disabled"
            [attr.aria-invalid]="vm().fields.firstName.errorKey ? 'true' : null"
            (input)="fieldChanged.emit({ field: 'firstName', value: $event.target.value })">

          @if (vm().fields.firstName.errorKey) {
            <div class="error-message" role="alert">
              {{ t(vm().fields.firstName.errorKey) }}
            </div>
          }
        </div>

        <!-- Repeat for other fields... -->

        <div class="form-actions">
          <button
            type="button"
            class="btn-secondary"
            (click)="cancel.emit()">
            {{ t(vm().cancelButtonLabelKey) }}
          </button>

          <button
            type="submit"
            class="btn-primary"
            [disabled]="!vm().canSubmit || vm().isSubmitting"
            (click)="submit.emit()">
            @if (vm().isSubmitting) {
              {{ t('common.saving') }}
            } @else {
              {{ t(vm().submitButtonLabelKey) }}
            }
          </button>
        </div>
      </form>
    </ng-container>
  `
})
export class UserFormComponent {
  vm = input.required<IUserFormVM>();

  fieldChanged = output<{ field: string; value: string }>();
  submit = output<void>();
  cancel = output<void>();
}
```

## Testing Pure Components

### 1. Unit Testing with Mock VMs

```typescript
describe('ContactInformationComponent', () => {
  let component: ContactInformationComponent;
  let fixture: ComponentFixture<ContactInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactInformationComponent, TranslocoTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactInformationComponent);
    component = fixture.componentInstance;
  });

  it('should display contact information correctly', () => {
    // ✅ Easy testing with mock VM data
    const mockVM: IContactInformationVM = {
      sectionTitleKey: 'contact.title',
      sectionExplanationKey: null,
      emailLabelKey: 'contact.email',
      emailValue: 'test@example.com',
      phoneLabelKey: 'contact.phone',
      phoneValue: '+1234567890',
      variant: 'user',
      showActions: true,
      isLoading: false
    };

    fixture.componentRef.setInput('vm', mockVM);
    fixture.detectChanges();

    const emailLink = fixture.debugElement.query(By.css('a[href^="mailto:"]'));
    expect(emailLink.nativeElement.textContent).toBe('test@example.com');
    expect(emailLink.nativeElement.href).toBe('mailto:test@example.com');

    const phoneLink = fixture.debugElement.query(By.css('a[href^="tel:"]'));
    expect(phoneLink.nativeElement.textContent).toBe('+1234567890');
  });

  it('should handle loading state', () => {
    const loadingVM: IContactInformationVM = {
      ...mockBaseVM,
      isLoading: true
    };

    fixture.componentRef.setInput('vm', loadingVM);
    fixture.detectChanges();

    const loadingSpinner = fixture.debugElement.query(By.css('.loading-spinner'));
    expect(loadingSpinner).toBeTruthy();

    const contactDetails = fixture.debugElement.query(By.css('.contact-details'));
    expect(contactDetails).toBeFalsy();
  });

  it('should emit edit event when edit button clicked', () => {
    spyOn(component.editContact, 'emit');

    const actionableVM: IContactInformationVM = {
      ...mockBaseVM,
      showActions: true
    };

    fixture.componentRef.setInput('vm', actionableVM);
    fixture.detectChanges();

    const editButton = fixture.debugElement.query(By.css('.btn-secondary'));
    editButton.nativeElement.click();

    expect(component.editContact.emit).toHaveBeenCalled();
  });
});
```

### 2. Service Testing for VM Creation

```typescript
describe('ContactInformationService', () => {
  let service: ContactInformationService;
  let mockApiService: jasmine.SpyObj<ContactApiService>;
  let mockUserService: jasmine.SpyObj<CurrentUserService>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ContactApiService', ['getContactInfo']);
    const userSpy = jasmine.createSpyObj('CurrentUserService', [], {
      user: signal({ id: 'user1', roles: ['user'] })
    });

    TestBed.configureTestingModule({
      providers: [
        ContactInformationService,
        { provide: ContactApiService, useValue: apiSpy },
        { provide: CurrentUserService, useValue: userSpy }
      ]
    });

    service = TestBed.inject(ContactInformationService);
    mockApiService = TestBed.inject(ContactApiService) as jasmine.SpyObj<ContactApiService>;
    mockUserService = TestBed.inject(CurrentUserService) as jasmine.SpyObj<CurrentUserService>;
  });

  it('should create admin variant VM for admin users', () => {
    // Arrange
    const mockContact = { email: 'test@example.com', phone: null, isPublic: true };
    const mockUser = { id: 'admin1', roles: ['admin'] };

    mockApiService.getContactInfo.and.returnValue(of(mockContact));
    mockUserService.user.and.returnValue(signal(mockUser));

    // Act
    const vm = service.getContactInformationVM();

    // Assert
    expect(vm().variant).toBe('admin');
    expect(vm().showActions).toBe(true);
    expect(vm().emailValue).toBe('test@example.com');
  });
});
```

## Performance Considerations

### 1. OnPush Compatibility
Since components receive pre-computed data as inputs, they work perfectly with OnPush change detection:

```typescript
@Component({
  selector: 'app-optimized-component',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush  // ✅ Works perfectly
})
export class OptimizedComponent {
  vm = input.required<IOptimizedVM>();
}
```

### 2. Memoization in Services
Services can optimize VM creation with memoization:

```typescript
@Injectable()
export class OptimizedService {
  private readonly vmCache = new Map<string, IComponentVM>();

  getOptimizedVM = (id: string): Signal<IComponentVM> => {
    return computed(() => {
      const cacheKey = `${id}-${this.getDataVersion()}`;

      if (this.vmCache.has(cacheKey)) {
        return this.vmCache.get(cacheKey)!;
      }

      const vm = this.createVM(id);
      this.vmCache.set(cacheKey, vm);
      return vm;
    });
  };
}
```

## Migration Strategy

### From Internal State to Input VM

```typescript
// BEFORE: Internal state management (incorrect)
@Component({
  template: `
    <div>
      <h2>{{ vm.title() }}</h2>
      <p>{{ vm.description() }}</p>
    </div>
  `
})
export class OldComponent {
  vm = {
    title: signal(''),
    description: signal(''),
    load: () => { /* complex logic */ }
  };

  ngOnInit() {
    this.vm.load();
  }
}

// AFTER: Input-based VM (correct)
interface INewComponentVM {
  readonly title: string;
  readonly description: string;
}

@Component({
  template: `
    <div>
      <h2>{{ vm().title }}</h2>
      <p>{{ vm().description }}</p>
    </div>
  `
})
export class NewComponent {
  vm = input.required<INewComponentVM>();
}
```

## Key Principles Summary

1. **Components are Pure**: No business logic, state management, or data transformation
2. **VM as Input**: Always receive view-model as typed input, never create internally
3. **Services Create VMs**: Business logic and data transformation happen in services
4. **Type Safety**: Strong interfaces define exactly what components need
5. **Deterministic**: Same input always produces same output
6. **Testable**: Easy to test with mock data
7. **Reusable**: Components work anywhere with compatible view-model data
8. **Performance**: OnPush compatible and optimizable

This architecture ensures components are truly reusable, testable, and maintainable while providing excellent developer experience and performance characteristics.