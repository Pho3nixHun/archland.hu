# Internationalization Best Practices

*Implementation guide for Archland.hu Constitution: Internationalization with Transloco*

*Integrated with Angular Signals, View-Model patterns, and Constitutional principles*

## Core Principle

Use Transloco for internationalization with externalized user-facing text, proper pluralization, and locale-specific formatting. Never build sentences by concatenating strings in templates. Integrate seamlessly with our constitutional patterns: Signals, View-Models, Type Safety, and Design Tokens.

## Why Transloco Aligns with Our Constitution

### Constitutional Compliance
- **Signal Integration**: Transloco's 2025 Signal-based API aligns with our Signals-first approach
- **Type Safety**: Strict TypeScript interfaces for all translation keys and parameters
- **Component Architecture**: Works seamlessly with our view-model patterns
- **Performance**: Single subscription per template through structural directive
- **No String Concatenation**: Proper sentence structure and pluralization support

### Real-World Benefits for Archland.hu
- **Hungarian/English Support**: Native support for complex Hungarian grammar and pluralization
- **Real Estate Terminology**: Organized translation files for property, investment, and legal terms
- **Dynamic Content**: Property listings, user interfaces, and investment calculations
- **SEO Optimization**: Proper meta tags and content localization for search engines
- **Accessibility**: Screen reader support with localized ARIA labels and descriptions

## Modern Transloco Setup (2025)

### Installation and Configuration

```bash
# Install Transloco with MessageFormat for pluralization
npm install @ngneat/transloco @ngneat/transloco-messageformat messageformat
```

### Bootstrap Configuration

```typescript
// main.ts - Standalone application setup
import { bootstrapApplication } from '@angular/platform-browser';
import { provideTransloco } from '@ngneat/transloco';
import { TranslocoMessageFormatModule } from '@ngneat/transloco-messageformat';

bootstrapApplication(AppComponent, {
  providers: [
    // Transloco configuration
    provideTransloco({
      config: {
        availableLangs: ['en', 'hu'],
        defaultLang: 'en',
        reRenderOnLangChange: true, // Enable dynamic language switching
        prodMode: !isDevMode(),
        fallbackLang: 'en',
        missingHandler: {
          useFallbackTranslation: true,
          allowEmpty: false
        }
      },
      loader: TranslocoHttpLoader
    }),

    // MessageFormat for pluralization
    importProvidersFrom(TranslocoMessageFormatModule.init()),

    // Other providers...
  ]
});

// HTTP Loader for translation files
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  getTranslation = (lang: string): Observable<Translation> => {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  };
}
```

## Translation File Organization

### Hierarchical Structure

```json
// src/assets/i18n/en.json
{
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "save": "Save",
    "cancel": "Cancel",
    "close": "Close",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort by"
  },

  "navigation": {
    "home": "Home",
    "properties": "Properties",
    "portfolio": "Portfolio",
    "about": "About Us",
    "contact": "Contact",
    "login": "Sign In",
    "logout": "Sign Out",
    "dashboard": "Dashboard"
  },

  "property": {
    "title": "Property",
    "titles": {
      "residential": "Residential Property",
      "commercial": "Commercial Property",
      "industrial": "Industrial Property"
    },
    "status": {
      "available": "Available",
      "sold": "Sold",
      "pending": "Pending",
      "reserved": "Reserved"
    },
    "metrics": {
      "roi": "ROI",
      "yield": "Rental Yield",
      "price": "Price",
      "area": "Area",
      "rooms": "Rooms",
      "bathrooms": "Bathrooms"
    },
    "search": {
      "placeholder": "Search properties by location, type, or price...",
      "results": "{count, plural, =0 {No properties found} =1 {1 property found} other {# properties found}}",
      "filters": {
        "type": "Property Type",
        "priceRange": "Price Range",
        "location": "Location",
        "status": "Availability"
      }
    },
    "card": {
      "newListing": "New Listing",
      "featured": "Featured",
      "viewDetails": "View Details",
      "contactAgent": "Contact Agent",
      "saveFavorite": "Save to Favorites",
      "shareProperty": "Share Property"
    }
  },

  "investment": {
    "calculator": {
      "title": "Investment Calculator",
      "inputs": {
        "purchasePrice": "Purchase Price",
        "downPayment": "Down Payment",
        "monthlyRent": "Expected Monthly Rent",
        "expenses": "Monthly Expenses"
      },
      "outputs": {
        "monthlyReturn": "Monthly Return",
        "yearlyRoi": "Annual ROI",
        "cashFlow": "Monthly Cash Flow"
      }
    },
    "metrics": {
      "portfolio": "Portfolio Performance",
      "totalValue": "Total Portfolio Value",
      "totalReturn": "Total Return",
      "averageRoi": "Average ROI"
    }
  },

  "forms": {
    "contact": {
      "title": "Contact Us",
      "firstName": "First Name",
      "lastName": "Last Name",
      "email": "Email Address",
      "phone": "Phone Number",
      "message": "Message",
      "subject": "Subject",
      "inquiry": {
        "general": "General Inquiry",
        "property": "Property Inquiry",
        "investment": "Investment Opportunity",
        "partnership": "Partnership"
      },
      "submit": "Send Message",
      "success": "Thank you! We'll get back to you soon.",
      "error": "Sorry, there was an error sending your message."
    },
    "validation": {
      "required": "This field is required",
      "email": "Please enter a valid email address",
      "phone": "Please enter a valid phone number",
      "minLength": "Must be at least {min} characters",
      "maxLength": "Cannot exceed {max} characters"
    }
  },

  "auth": {
    "login": {
      "title": "Sign In to Your Account",
      "email": "Email Address",
      "password": "Password",
      "remember": "Remember me",
      "forgotPassword": "Forgot your password?",
      "submit": "Sign In",
      "noAccount": "Don't have an account?",
      "signUp": "Sign up here"
    },
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "accountLocked": "Account temporarily locked",
      "sessionExpired": "Your session has expired"
    }
  },

  "dates": {
    "today": "Today",
    "yesterday": "Yesterday",
    "daysAgo": "{count, plural, =1 {1 day ago} other {# days ago}}",
    "monthsAgo": "{count, plural, =1 {1 month ago} other {# months ago}}",
    "yearsAgo": "{count, plural, =1 {1 year ago} other {# years ago}}"
  },

  "currency": {
    "formats": {
      "eur": "€{amount}",
      "usd": "${amount}",
      "huf": "{amount} Ft"
    }
  },

  "accessibility": {
    "property": {
      "cardDescription": "Property card for {name} in {location}",
      "imageAlt": "Photo of {propertyName}",
      "statusBadge": "Property status: {status}",
      "priceLabel": "Price: {price}",
      "metricsLabel": "Investment metrics"
    },
    "navigation": {
      "skipToContent": "Skip to main content",
      "mainMenu": "Main navigation menu",
      "breadcrumb": "Breadcrumb navigation"
    },
    "forms": {
      "requiredField": "Required field",
      "optionalField": "Optional field",
      "fieldError": "Error in {fieldName}"
    }
  }
}
```

### Hungarian Translation File

```json
// src/assets/i18n/hu.json
{
  "common": {
    "loading": "Betöltés...",
    "error": "Hiba történt",
    "save": "Mentés",
    "cancel": "Mégse",
    "close": "Bezárás",
    "search": "Keresés",
    "filter": "Szűrés",
    "sort": "Rendezés"
  },

  "navigation": {
    "home": "Főoldal",
    "properties": "Ingatlanok",
    "portfolio": "Portfólió",
    "about": "Rólunk",
    "contact": "Kapcsolat",
    "login": "Bejelentkezés",
    "logout": "Kijelentkezés",
    "dashboard": "Irányítópult"
  },

  "property": {
    "title": "Ingatlan",
    "titles": {
      "residential": "Lakóingatlan",
      "commercial": "Kereskedelmi ingatlan",
      "industrial": "Ipari ingatlan"
    },
    "status": {
      "available": "Elérhető",
      "sold": "Eladva",
      "pending": "Folyamatban",
      "reserved": "Foglalt"
    },
    "search": {
      "placeholder": "Keresés ingatlanok között helyszín, típus vagy ár alapján...",
      "results": "{count, plural, =0 {Nincs találat} =1 {1 ingatlan találva} other {# ingatlan találva}}"
    }
  },

  "dates": {
    "today": "Ma",
    "yesterday": "Tegnap",
    "daysAgo": "{count, plural, =1 {1 napja} other {# napja}}",
    "monthsAgo": "{count, plural, =1 {1 hónapja} other {# hónapja}}",
    "yearsAgo": "{count, plural, =1 {1 éve} other {# éve}}"
  }

  // ... rest of translations
}
```

## Component Integration Patterns

### View-Model Integration with Transloco

```typescript
@Component({
  selector: 'app-property-card',
  template: `
    <ng-container *transloco="let t">
      <article
        class="property-card"
        [attr.aria-label]="t('accessibility.property.cardDescription', {
          name: property().displayName,
          location: property().location
        })">

        <div class="property-image">
          <img
            [src]="property().thumbnailImage"
            [alt]="t('accessibility.property.imageAlt', {
              propertyName: property().displayName
            })">

          @if (property().isNewListing) {
            <span
              class="new-badge"
              [attr.aria-label]="t('property.card.newListing')">
              {{ t('property.card.newListing') }}
            </span>
          }

          @if (property().featured) {
            <span class="featured-badge">
              {{ t('property.card.featured') }}
            </span>
          }
        </div>

        <div class="property-content">
          <h3 class="property-title">{{ property().displayName }}</h3>
          <p class="property-address">{{ property().formattedAddress }}</p>

          <div
            class="property-price"
            [attr.aria-label]="t('accessibility.property.priceLabel', {
              price: property().priceDisplay
            })">
            {{ property().priceDisplay }}
          </div>

          <div
            class="property-metrics"
            [attr.aria-label]="t('accessibility.property.metricsLabel')">
            <span class="metric">
              <span class="metric-label">{{ t('property.metrics.roi') }}:</span>
              <span class="metric-value">{{ property().roiDisplay }}</span>
            </span>
            <span class="metric">
              <span class="metric-label">{{ t('property.metrics.yield') }}:</span>
              <span class="metric-value">{{ property().yieldDisplay }}</span>
            </span>
          </div>

          <div class="property-actions">
            <button
              type="button"
              class="btn-primary"
              (click)="vm.viewDetails()">
              {{ t('property.card.viewDetails') }}
            </button>
            <button
              type="button"
              class="btn-secondary"
              (click)="vm.contactAgent()"
              [attr.aria-label]="t('property.card.contactAgent')">
              {{ t('property.card.contactAgent') }}
            </button>
          </div>
        </div>
      </article>
    </ng-container>
  `
})
export class PropertyCardComponent {
  property = input.required<IPropertyViewModel>();

  vm = {
    viewDetails: () => {
      // Navigate to property details
    },

    contactAgent: () => {
      // Open contact form
    }
  };
}
```

### Transloco Service Integration

```typescript
@Injectable({
  providedIn: 'root'
})
export class PropertyViewModelService {
  private readonly transloco = inject(TranslocoService);
  private readonly dateService = inject(DateService);

  convertToViewModel = (domain: IPropertyDomain): IPropertyViewModel => {
    return {
      id: domain.id,
      displayName: domain.name,
      // Use translations for status labels
      statusLabel: this.transloco.translate(`property.status.${domain.status}`),
      statusColor: this.getStatusColor(domain.status),
      propertyTypeLabel: this.transloco.translate(`property.titles.${domain.property_type}`),

      // Localized date formatting
      createdDateDisplay: this.transloco.translate('dates.daysAgo', {
        count: this.dateService.daysSince(domain.created_at)
      }),

      // Other properties...
    };
  };

  // Method to update view-model when language changes
  updateViewModelForLanguage = (
    viewModel: IPropertyViewModel,
    domain: IPropertyDomain
  ): IPropertyViewModel => {
    return {
      ...viewModel,
      statusLabel: this.transloco.translate(`property.status.${domain.status}`),
      propertyTypeLabel: this.transloco.translate(`property.titles.${domain.property_type}`),
    };
  };
}
```

### Form Integration with Validation

```typescript
@Component({
  selector: 'app-contact-form',
  template: `
    <ng-container *transloco="let t">
      <form [formGroup]="vm.form()" (ngSubmit)="vm.submit()">
        <h2>{{ t('forms.contact.title') }}</h2>

        <div class="form-group">
          <label for="firstName">
            {{ t('forms.contact.firstName') }}
            <span class="required" [attr.aria-label]="t('accessibility.forms.requiredField')">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            formControlName="firstName"
            [placeholder]="t('forms.contact.firstName')"
            [attr.aria-invalid]="vm.hasError('firstName')"
            [attr.aria-describedby]="vm.hasError('firstName') ? 'firstName-error' : null">

          @if (vm.hasError('firstName')) {
            <div
              id="firstName-error"
              class="error-message"
              role="alert">
              {{ t('forms.validation.required') }}
            </div>
          }
        </div>

        <div class="form-group">
          <label for="email">
            {{ t('forms.contact.email') }}
            <span class="required" [attr.aria-label]="t('accessibility.forms.requiredField')">*</span>
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            [placeholder]="t('forms.contact.email')"
            [attr.aria-invalid]="vm.hasError('email')"
            [attr.aria-describedby]="vm.hasError('email') ? 'email-error' : null">

          @if (vm.hasError('email') && vm.form().get('email')?.errors?.['required']) {
            <div id="email-error" class="error-message" role="alert">
              {{ t('forms.validation.required') }}
            </div>
          }
          @if (vm.hasError('email') && vm.form().get('email')?.errors?.['email']) {
            <div id="email-error" class="error-message" role="alert">
              {{ t('forms.validation.email') }}
            </div>
          }
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary"
            [disabled]="vm.form().invalid || vm.isSubmitting()">
            @if (vm.isSubmitting()) {
              {{ t('common.loading') }}
            } @else {
              {{ t('forms.contact.submit') }}
            }
          </button>
          <button
            type="button"
            class="btn-secondary"
            (click)="vm.cancel()">
            {{ t('common.cancel') }}
          </button>
        </div>
      </form>
    </ng-container>
  `
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly transloco = inject(TranslocoService);

  vm = {
    form: signal(this.createForm()),
    isSubmitting: signal(false),

    hasError: (fieldName: string): boolean => {
      const field = this.vm.form().get(fieldName);
      return !!(field?.invalid && (field?.dirty || field?.touched));
    },

    submit: () => {
      if (this.vm.form().valid) {
        this.vm.isSubmitting.set(true);
        // Submit logic
      }
    },

    cancel: () => {
      this.vm.form.set(this.createForm());
    }
  };

  private createForm = (): FormGroup => {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  };
}
```

## Pluralization and MessageFormat

### Complex Pluralization Rules

```json
{
  "property": {
    "search": {
      "results": "{count, plural, =0 {No properties found} =1 {Found 1 property} other {Found # properties}}",
      "filters": "{activeCount, plural, =0 {No filters active} =1 {1 filter active} other {# filters active}}"
    }
  },

  "investment": {
    "portfolio": {
      "summary": "{propertyCount, plural, =0 {Your portfolio is empty} =1 {You own 1 property worth {totalValue}} other {You own # properties worth {totalValue} total}}"
    }
  },

  "dates": {
    "relative": "{days, plural, =0 {today} =1 {1 day ago} other {# days ago}}",
    "publishedAgo": "Published {time, plural, =0 {today} =1 {1 {timeUnit} ago} other {# {timeUnit}s ago}}"
  }
}
```

### Hungarian Pluralization

```json
{
  "property": {
    "search": {
      "results": "{count, plural, =0 {Nincs találat} =1 {1 ingatlan találva} other {# ingatlan találva}}"
    }
  },

  "dates": {
    "relative": "{days, plural, =0 {ma} =1 {1 napja} other {# napja}}"
  }
}
```

### Component Usage

```typescript
@Component({
  template: `
    <ng-container *transloco="let t">
      <div class="search-results">
        <h2>{{ t('property.search.results', { count: vm.searchResults().length }) }}</h2>

        <p>{{ t('property.search.filters', { activeCount: vm.activeFilters().length }) }}</p>
      </div>
    </ng-container>
  `
})
export class PropertySearchResultsComponent {
  vm = {
    searchResults: signal<IPropertyViewModel[]>([]),
    activeFilters: signal<ISearchFilter[]>([])
  };
}
```

## Language Switching and Persistence

### Language Switcher Component

```typescript
@Component({
  selector: 'app-language-switcher',
  template: `
    <ng-container *transloco="let t">
      <div class="language-switcher" role="group" [attr.aria-label]="t('common.selectLanguage')">
        @for (lang of vm.availableLanguages(); track lang.code) {
          <button
            type="button"
            class="language-option"
            [class.active]="lang.code === vm.currentLanguage()"
            [attr.aria-pressed]="lang.code === vm.currentLanguage()"
            [attr.lang]="lang.code"
            (click)="vm.switchLanguage(lang.code)">
            <span class="flag" [attr.aria-hidden]="true">{{ lang.flag }}</span>
            <span class="name">{{ lang.name }}</span>
          </button>
        }
      </div>
    </ng-container>
  `,
  host: {
    'role': 'region',
    '[attr.aria-label]': '"Language selection"'
  }
})
export class LanguageSwitcherComponent {
  private readonly transloco = inject(TranslocoService);
  private readonly storage = inject(LocalStorageService);

  vm = {
    currentLanguage: computed(() => this.transloco.getActiveLang()),

    availableLanguages: signal([
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'hu', name: 'Magyar', flag: '🇭🇺' }
    ]),

    switchLanguage: (langCode: string) => {
      this.transloco.setActiveLang(langCode);
      this.storage.setItem('preferredLanguage', langCode);

      // Update HTML lang attribute for accessibility
      document.documentElement.lang = langCode;
    }
  };

  ngOnInit(): void {
    // Restore saved language preference
    const savedLang = this.storage.getItem('preferredLanguage');
    if (savedLang && this.vm.availableLanguages().some(lang => lang.code === savedLang)) {
      this.vm.switchLanguage(savedLang);
    }
  }
}
```

### Persistence Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class LocalizationService {
  private readonly transloco = inject(TranslocoService);
  private readonly storage = inject(LocalStorageService);
  private readonly router = inject(Router);

  // Initialize language from various sources
  initializeLanguage = (): void => {
    const sources = [
      this.getLanguageFromRoute(),
      this.storage.getItem('preferredLanguage'),
      this.getBrowserLanguage(),
      'en' // fallback
    ];

    const language = sources.find(lang =>
      lang && this.isLanguageSupported(lang)
    ) || 'en';

    this.setLanguage(language);
  };

  setLanguage = (langCode: string): void => {
    if (this.isLanguageSupported(langCode)) {
      this.transloco.setActiveLang(langCode);
      this.storage.setItem('preferredLanguage', langCode);
      document.documentElement.lang = langCode;

      // Update meta tags for SEO
      this.updateMetaTags(langCode);
    }
  };

  private getLanguageFromRoute = (): string | null => {
    // Extract language from URL if using route-based localization
    const urlSegments = this.router.url.split('/');
    const langSegment = urlSegments[1];
    return this.isLanguageSupported(langSegment) ? langSegment : null;
  };

  private getBrowserLanguage = (): string => {
    const browserLang = navigator.language.split('-')[0];
    return this.isLanguageSupported(browserLang) ? browserLang : 'en';
  };

  private isLanguageSupported = (langCode: string): boolean => {
    return ['en', 'hu'].includes(langCode);
  };

  private updateMetaTags = (langCode: string): void => {
    const metaLang = document.querySelector('meta[name="language"]');
    if (metaLang) {
      metaLang.setAttribute('content', langCode);
    }
  };
}
```

## Lazy Loading and Scoped Translations

### Feature-based Translation Loading

```typescript
// Property feature translations
// src/assets/i18n/property/en.json
{
  "listing": {
    "title": "Property Listings",
    "filters": "Filter Properties",
    "sortBy": "Sort by {criteria}"
  },
  "details": {
    "overview": "Property Overview",
    "features": "Key Features",
    "investment": "Investment Analysis"
  }
}

// Loading scoped translations
@Component({
  providers: [
    {
      provide: TRANSLOCO_SCOPE,
      useValue: 'property'
    }
  ]
})
export class PropertyListComponent {
  // Automatically loads property/en.json or property/hu.json
}
```

### Lazy Loading with Signals

```typescript
@Injectable()
export class PropertyTranslationService {
  private readonly transloco = inject(TranslocoService);

  private readonly propertyTranslations = signal<Record<string, any> | null>(null);

  loadPropertyTranslations = (): Observable<Record<string, any>> => {
    if (this.propertyTranslations()) {
      return of(this.propertyTranslations()!);
    }

    const currentLang = this.transloco.getActiveLang();

    return this.transloco.selectTranslation('property').pipe(
      tap(translations => {
        this.propertyTranslations.set(translations);
      })
    );
  };

  // Get property-specific translation with fallback
  getPropertyTranslation = (key: string, params?: any): string => {
    const translations = this.propertyTranslations();
    if (!translations) {
      return key; // Fallback to key if not loaded
    }

    return this.transloco.translate(`property.${key}`, params);
  };
}
```

## Testing Internationalization

### Translation Testing

```typescript
describe('PropertyCardComponent', () => {
  let component: PropertyCardComponent;
  let translocoService: TranslocoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: {
            en: {
              'property.status.available': 'Available',
              'property.card.viewDetails': 'View Details'
            },
            hu: {
              'property.status.available': 'Elérhető',
              'property.card.viewDetails': 'Részletek'
            }
          },
          translocoConfig: {
            availableLangs: ['en', 'hu'],
            defaultLang: 'en'
          }
        })
      ]
    }).compileComponents();

    component = TestBed.createComponent(PropertyCardComponent);
    translocoService = TestBed.inject(TranslocoService);
  });

  it('should display translated status', () => {
    const property = mockPropertyViewModel({ status: 'available' });
    component.property.set(property);

    const statusElement = component.nativeElement.querySelector('.property-status');
    expect(statusElement.textContent).toBe('Available');

    // Test language switching
    translocoService.setActiveLang('hu');
    fixture.detectChanges();

    expect(statusElement.textContent).toBe('Elérhető');
  });

  it('should handle pluralization correctly', () => {
    const searchResults = [mockProperty(), mockProperty()];
    component.searchResults.set(searchResults);

    const resultsText = component.nativeElement.querySelector('.results-count');
    expect(resultsText.textContent).toContain('2 properties found');
  });
});
```

### Translation Key Validation

```typescript
@Injectable()
export class TranslationValidatorService {
  private readonly transloco = inject(TranslocoService);

  // Validate all translation keys exist
  validateTranslationKeys = (requiredKeys: string[]): string[] => {
    const missingKeys: string[] = [];
    const currentLang = this.transloco.getActiveLang();

    requiredKeys.forEach(key => {
      const translation = this.transloco.translate(key);
      if (translation === key) {
        // Translation not found, returned the key itself
        missingKeys.push(`${currentLang}.${key}`);
      }
    });

    return missingKeys;
  };

  // Development helper to check translation completeness
  auditTranslations = (): void => {
    if (!isDevMode()) return;

    const requiredKeys = [
      'property.status.available',
      'property.card.viewDetails',
      'forms.validation.required'
      // Add all required keys
    ];

    const missingKeys = this.validateTranslationKeys(requiredKeys);

    if (missingKeys.length > 0) {
      console.warn('Missing translation keys:', missingKeys);
    }
  };
}
```

## SEO and Accessibility Integration

### Meta Tags and SEO

```typescript
@Injectable()
export class LocalizedSeoService {
  private readonly transloco = inject(TranslocoService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  updatePageSeo = (pageKey: string, params?: any): void => {
    const currentLang = this.transloco.getActiveLang();

    // Update page title
    const pageTitle = this.transloco.translate(`seo.${pageKey}.title`, params);
    this.title.setTitle(`${pageTitle} - Archland.hu`);

    // Update meta description
    const description = this.transloco.translate(`seo.${pageKey}.description`, params);
    this.meta.updateTag({ name: 'description', content: description });

    // Update Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:locale', content: this.getLocaleCode(currentLang) });

    // Update language alternates
    this.updateLanguageAlternates();
  };

  private getLocaleCode = (langCode: string): string => {
    const localeMap: Record<string, string> = {
      'en': 'en_US',
      'hu': 'hu_HU'
    };
    return localeMap[langCode] || 'en_US';
  };

  private updateLanguageAlternates = (): void => {
    const languages = ['en', 'hu'];
    const currentUrl = window.location.pathname;

    languages.forEach(lang => {
      const hrefLang = lang === 'hu' ? 'hu' : 'en';
      const href = `https://archland.hu/${lang}${currentUrl}`;

      // Add or update link tag for language alternate
      let linkElement = document.querySelector(`link[hreflang="${hrefLang}"]`) as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.rel = 'alternate';
        linkElement.hreflang = hrefLang;
        document.head.appendChild(linkElement);
      }
      linkElement.href = href;
    });
  };
}
```

### Accessibility Enhancement

```json
{
  "accessibility": {
    "skipLinks": {
      "mainContent": "Skip to main content",
      "navigation": "Skip to navigation",
      "footer": "Skip to footer"
    },
    "landmarks": {
      "banner": "Site header",
      "navigation": "Main navigation",
      "main": "Main content",
      "complementary": "Sidebar",
      "contentinfo": "Site footer"
    },
    "buttons": {
      "expand": "Expand {section}",
      "collapse": "Collapse {section}",
      "close": "Close {dialog}",
      "menu": "Open menu"
    },
    "status": {
      "loading": "Loading content",
      "success": "Action completed successfully",
      "error": "An error occurred"
    }
  }
}
```

## Performance Optimization

### Translation Preloading

```typescript
@Injectable()
export class TranslationPreloadService {
  private readonly transloco = inject(TranslocoService);

  // Preload translations for critical path
  preloadCriticalTranslations = (): Observable<void> => {
    const criticalLangs = ['en', 'hu'];
    const criticalScopes = ['common', 'navigation', 'property'];

    const preloadObservables = criticalLangs.flatMap(lang =>
      criticalScopes.map(scope =>
        this.transloco.load(`${scope}/${lang}`)
      )
    );

    return forkJoin(preloadObservables).pipe(
      map(() => void 0),
      catchError(error => {
        console.error('Failed to preload translations:', error);
        return of(void 0);
      })
    );
  };
}
```

### Memory Optimization

```typescript
@Injectable()
export class TranslationMemoryService {
  private readonly transloco = inject(TranslocoService);
  private readonly unusedTranslations = new Set<string>();

  // Clean up unused translations
  cleanupUnusedTranslations = (): void => {
    this.unusedTranslations.forEach(scope => {
      this.transloco.getTranslation(scope).pipe(
        take(1)
      ).subscribe(() => {
        // Remove from memory if not accessed recently
      });
    });
  };

  // Track translation usage
  markTranslationUsed = (scope: string): void => {
    this.unusedTranslations.delete(scope);
  };
}
```

## Integration with Design System

### Localized Design Tokens

```scss
// Language-specific design tokens
:root[lang="hu"] {
  // Hungarian typically needs more space
  --arch-line-height-body: 1.7;
  --arch-letter-spacing-body: 0.01em;
}

:root[lang="en"] {
  --arch-line-height-body: 1.6;
  --arch-letter-spacing-body: normal;
}
```

### RTL Support Preparation

```typescript
@Injectable()
export class DirectionalityService {
  private readonly transloco = inject(TranslocoService);

  isRTL = computed(() => {
    const lang = this.transloco.getActiveLang();
    return ['ar', 'he', 'fa'].includes(lang);
  });

  getDirection = computed(() => this.isRTL() ? 'rtl' : 'ltr');

  updateDocumentDirection = (): void => {
    document.documentElement.dir = this.getDirection();
    document.documentElement.setAttribute('data-direction', this.getDirection());
  };
}
```

## Key Takeaways

1. **Constitutional Integration**: Transloco aligns perfectly with Signals, View-Models, and Type Safety
2. **Structural Directive**: Use `*transloco="let t"` for optimal performance
3. **No String Concatenation**: Proper sentence structure and pluralization
4. **Hierarchical Organization**: Feature-based translation file structure
5. **Accessibility First**: ARIA labels, screen reader support, and semantic HTML
6. **Hungarian Support**: Complex pluralization and grammatical rules
7. **Performance**: Lazy loading, preloading, and memory optimization
8. **SEO Integration**: Localized meta tags and language alternates
9. **Testing**: Comprehensive translation validation and visual regression
10. **Design System Integration**: Localized tokens and directional support

This internationalization system ensures Archland.hu delivers an excellent user experience for both Hungarian and English speakers while maintaining constitutional compliance and performance standards.