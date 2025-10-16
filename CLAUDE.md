# Archland.hu Angular Development Guidelines

Auto-generated Angular project context. Last updated: 2025-09-15

## Framework & Architecture

### Core Technologies (REQUIRED)
- **Angular**: v20 (strict requirements)
- **TypeScript**: Latest with strict configuration
- **State Management**: NgRx SignalStore
- **Testing**: Jest with Angular Testing Library for unit tests, Cypress for E2E
- **Internationalization**: Transloco
- **Build Tool**: Angular CLI with Nx (optional)

### Component Architecture Patterns
- **No @Input/@Output**: Use InputSignal and OutputEmitterRef
- **View-Model Pattern**: Components must have `vm` for state management
- **CVA Components**: Handle ControlValueAccessor fields through interface, not vm
- **Attribute Components**: Pass HTML attributes directly, not through vm

## Angular Project Structure
```
src/app/
├── features/
│   ├── admin/                    # Admin authentication and management
│   │   ├── components/
│   │   │   ├── login/
│   │   │   ├── admin-dashboard/
│   │   │   └── user-management/
│   │   ├── services/
│   │   ├── models/
│   │   └── admin.module.ts
│   ├── page-editor/              # In-place editing and content management
│   │   ├── components/
│   │   │   ├── editor-toolbar/
│   │   │   ├── inline-editor/
│   │   │   └── component-configurator/
│   │   ├── services/
│   │   ├── models/
│   │   └── page-editor.module.ts
│   ├── component-library/        # Drag-and-drop component library
│   │   ├── components/
│   │   │   ├── component-palette/
│   │   │   ├── component-browser/
│   │   │   └── component-preview/
│   │   ├── services/
│   │   ├── models/
│   │   └── component-library.module.ts
│   └── portfolio/                # Public portfolio display
│       ├── components/
│       │   ├── portfolio-page/
│       │   ├── property-showcase/
│       │   └── portfolio-navigation/
│       ├── services/
│       ├── models/
│       └── portfolio.module.ts
├── shared/
│   ├── components/               # 24+ Real Estate Portfolio Components
│   │   ├── hero/                 # Hero sections with CTAs
│   │   ├── navigation/           # Responsive site navigation
│   │   ├── property-card/        # Property listing display
│   │   ├── property-gallery/     # Image galleries for properties
│   │   ├── investment-metrics/   # ROI and investment data
│   │   ├── location-map/         # Interactive property maps
│   │   ├── testimonial/          # Client testimonials
│   │   ├── team-member/          # Team profiles
│   │   ├── contact-form/         # Lead generation forms
│   │   ├── calculator-widget/    # Investment calculators
│   │   ├── about-section/        # Company information
│   │   ├── statistics-counter/   # Animated metrics
│   │   ├── call-to-action/       # Conversion components
│   │   ├── article/              # Content articles
│   │   ├── comparison-table/     # Property comparisons
│   │   ├── investment-timeline/  # Project timelines
│   │   ├── market-insights/      # Market data display
│   │   ├── property-search/      # Search and filtering
│   │   └── footer/               # Site footer
│   ├── services/
│   ├── models/
│   ├── directives/
│   │   ├── drag-drop/            # Custom drag-and-drop
│   │   ├── inline-edit/          # In-place editing
│   │   └── resize-observer/      # Responsive layout
│   └── pipes/
├── core/
│   ├── services/
│   │   ├── auth/                 # Authentication services
│   │   ├── content/              # Content management
│   │   ├── layout/               # Layout and page services
│   │   └── api/                  # API communication
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── admin.guard.ts
│   │   └── editing.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   └── models/
└── assets/
    ├── styles/tokens/            # 3-layer design token system
    │   ├── _palette.scss         # Raw color scales
    │   ├── _semantic.scss        # Contextual tokens
    │   ├── _components.scss      # Component-specific tokens
    │   ├── _spacing.scss         # 4px grid system
    │   └── _typography.scss      # Modular scale typography
    └── i18n/              # Translation files
```

## Essential Commands
```bash
# Development
ng serve                    # Start dev server
ng build                    # Production build
ng test                     # Run unit tests
ng e2e                      # Run E2E tests

# Code Generation
ng generate component shared/components/[name]
ng generate service core/services/[name]
ng generate module features/[name] --routing

# Linting & Formatting
npm run lint               # ESLint check
npm run lint:fix           # ESLint auto-fix
npm run format             # Prettier format

# Testing & Quality
npm run test:coverage      # Unit tests with coverage
npm run test:integration   # Integration tests
npm run audit:a11y         # Accessibility audit
npm run audit:performance  # Performance audit
```

## Code Style (CONSTITUTIONAL REQUIREMENTS)

### TypeScript Rules (NON-NEGOTIABLE)
```typescript
// ✅ REQUIRED: Arrow functions only
const handleClick = () => { ... };
const processData = (data: UserData) => { ... };

// ❌ FORBIDDEN: Function declarations
function handleClick() { ... }  // NEVER use this

// ✅ REQUIRED: Strict typing, no 'any'
interface IUserProfile {
  id: string;
  name: string;
  email: string;
}

// ❌ FORBIDDEN: any types or casting
const user: any = getData();        // NEVER
const user = getData() as User;     // NEVER

// ✅ REQUIRED: Type guards
const isUser = (data: unknown): data is User => {
  return typeof data === 'object' && data !== null && 'id' in data;
};
```

### Component Patterns
```typescript
// ✅ REQUIRED: InputSignal and OutputEmitterRef
@Component({...})
export class UserCardComponent {
  user = input.required<IUserProfile>();           // InputSignal
  userClick = output<IUserProfile>();              // OutputEmitterRef

  // ✅ REQUIRED: View-model for state
  vm = {
    isExpanded: signal(false),
    displayName: computed(() => this.user().name),
    containerClass: computed(() => `user-card ${this.isExpanded() ? 'expanded' : ''}`),
  };
}

// ❌ FORBIDDEN: @Input/@Output decorators
@Input() user!: IUserProfile;        // NEVER use
@Output() userClick = new EventEmitter<IUserProfile>();  // NEVER use
```

### Design System Integration
```scss
// ✅ REQUIRED: Use design tokens
@use '../../../assets/styles/tokens/palette' as palette;
@use '../../../assets/styles/tokens/semantic' as semantic;
@use '../../../assets/styles/tokens/spacing' as spacing;

.user-card {
  background: semantic.$surface-primary;
  border: 1px solid semantic.$border-subtle;
  padding: spacing.$component-gap-md;
  border-radius: semantic.$border-radius-md;
}

// ❌ FORBIDDEN: Hard-coded values
.user-card {
  background: #ffffff;     // NEVER
  border: 1px solid #ccc;  // NEVER
  padding: 16px;           // NEVER
}
```

## Current Feature Implementation: Project Skeleton Setup

### Phase 1: Project Skeleton (001-make-the-project)
Angular v20 application foundation with constitutional compliance and framework testing.

**Core Components**:
```typescript
// Application Components
- WelcomeComponent: Landing page with project information
- TestDashboardComponent: Framework integration testing container

// Testing Components
- FrameworkTestComponent: Comprehensive framework validation
- DemoCounterComponent: NgRx SignalStore demonstration

// Services
- ConfigurationService: Application and feature flag management
- FrameworkTestService: Automated framework testing execution
- DesignTokenService: 3-layer design token system management
```

**Framework Integration Tests**:
- Angular v20 features (standalone components, signals)
- NgRx SignalStore state management
- Transloco internationalization (Hungarian/English)
- Design token system (palette → semantic → component)
- TypeScript strict mode compliance
- Accessibility (WCAG 2.1 AA)
- Performance validation

### Future Implementation: Page Component Library

### Component Categories
```typescript
// Layout Components (Phase 2)
- HeroComponent: Hero sections with CTA buttons
- NavigationComponent: Responsive site navigation
- FooterComponent: Site footer with company info

// Content Components (Phase 2)
- AboutSectionComponent: Company information display
- ProjectCardComponent: Real estate project showcase
- ArticleComponent: Rich content articles

// Interactive Components (Phase 2)
- ContactFormComponent: Lead generation forms
- ImageGalleryComponent: Project image galleries
- PageBuilderComponent: Drag-and-drop page editor

// Management Components (Phase 2)
- ComponentPaletteComponent: Available components library
- ImageManagementComponent: Image upload and optimization
```

### State Management with NgRx SignalStore
```typescript
// Test Dashboard Store (Project Skeleton)
export const TestDashboardStore = signalStore(
  withState<ITestDashboardState>({
    isInitialized: false,
    currentTest: null,
    testResults: [],
    testProgress: {
      current: 0,
      total: 0,
      percentage: 0,
      estimatedTimeRemaining: 0,
      isComplete: false
    },
    errors: [],
    lastUpdated: new Date()
  }),
  withMethods((store, testService = inject(FrameworkTestService)) => ({
    runAllTests: () => {
      testService.runAllTests().subscribe({
        next: (result) => {
          const results = [...store.testResults(), result];
          patchState(store, {
            testResults: results,
            currentTest: result.testName,
            lastUpdated: new Date()
          });
        }
      });
    }
  })),
  withComputed((store) => ({
    allTestsPassed: computed(() =>
      store.testResults().length > 0 &&
      store.testResults().every(result => result.status === TestStatus.PASSED)
    ),
    overallScore: computed(() => {
      const results = store.testResults();
      if (results.length === 0) return 0;
      const passedCount = results.filter(result => result.status === TestStatus.PASSED).length;
      return Math.round((passedCount / results.length) * 100);
    })
  }))
);

// Demo Counter Store (SignalStore Demonstration)
export const DemoCounterStore = signalStore(
  withState<IDemoCounterState>({
    value: 0,
    step: 1,
    minValue: -100,
    maxValue: 100,
    history: [],
    isAtLimit: false
  }),
  withMethods((store) => ({
    increment: () => {
      const newValue = Math.min(store.value() + store.step(), store.maxValue());
      patchState(store, {
        value: newValue,
        isAtLimit: newValue === store.maxValue(),
        history: [...store.history(), {
          type: 'increment',
          previousValue: store.value(),
          newValue,
          timestamp: new Date()
        }]
      });
    },
    decrement: () => {
      const newValue = Math.max(store.value() - store.step(), store.minValue());
      patchState(store, {
        value: newValue,
        isAtLimit: newValue === store.minValue(),
        history: [...store.history(), {
          type: 'decrement',
          previousValue: store.value(),
          newValue,
          timestamp: new Date()
        }]
      });
    }
  })),
  withComputed((store) => ({
    canIncrement: computed(() => store.value() < store.maxValue()),
    canDecrement: computed(() => store.value() > store.minValue()),
    formattedValue: computed(() => `${store.value().toLocaleString()}`)
  }))
);
```

### Key Models
```typescript
// Project Skeleton Models
interface IApplicationConfig {
  readonly name: string;
  readonly version: string;
  readonly environment: 'development' | 'production' | 'test';
  readonly features: IFeatureFlags;
  readonly buildInfo: IBuildInfo;
}

interface IFrameworkTestResult {
  readonly testName: string;
  readonly category: TestCategory;
  readonly status: TestStatus;
  readonly duration: number;
  readonly message: string;
  readonly details?: ITestDetails;
  readonly timestamp: Date;
}

interface ITestDashboardState {
  readonly isInitialized: boolean;
  readonly currentTest: string | null;
  readonly testResults: ReadonlyArray<IFrameworkTestResult>;
  readonly testProgress: ITestProgress;
  readonly errors: ReadonlyArray<Error>;
  readonly lastUpdated: Date;
}

interface IDemoCounterState {
  readonly value: number;
  readonly step: number;
  readonly minValue: number;
  readonly maxValue: number;
  readonly history: ReadonlyArray<ICounterAction>;
  readonly isAtLimit: boolean;
}

interface IDesignTokens {
  readonly colors: IColorTokens;
  readonly spacing: ISpacingTokens;
  readonly typography: ITypographyTokens;
  readonly layout: ILayoutTokens;
  readonly motion: IMotionTokens;
}

// Future Phase 2 Models
interface IPage {
  readonly id: string;
  readonly title: string;
  readonly components: IPageComponent[];
  readonly status: 'draft' | 'published';
}

interface IProject {
  readonly id: string;
  readonly name: string;
  readonly status: ProjectStatus;
  readonly images: IImage[];
  readonly pricing: IPricing;
}
```

## Accessibility Requirements
- **WCAG 2.1 AA compliance** mandatory for all components
- **Semantic HTML** always use proper elements (`<article>`, `<section>`, `<nav>`)
- **ARIA attributes** for complex interactions and dynamic content
- **Keyboard navigation** full support required (Tab, Enter, Escape, Arrow keys)
- **Screen reader** compatibility verified with proper labels and descriptions
- **Focus management** visible focus indicators and logical tab order

## Responsive Design
- **Mobile-first** approach required for all components
- **Breakpoints**: 576px (mobile), 768px (tablet), 992px (desktop), 1200px (large)
- **Touch targets**: Minimum 44px × 44px for interactive elements
- **Content reflow**: No horizontal scrolling on any device
- **Image optimization**: Responsive images with WebP format and lazy loading

## Testing Standards
```typescript
// Component Testing with Angular Testing Library
describe('HeroComponent', () => {
  it('should display content with proper ARIA attributes', () => {
    const fixture = createComponent(HeroComponent, {
      componentInputs: {
        heading: 'Test Heading',
        subheading: 'Test Subheading',
        description: 'Test Description',
        ctaText: 'Learn More'
      }
    });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Heading');
    expect(screen.getByRole('button')).toHaveAccessibleName(/Learn More.*Test Heading/);
  });
});

// Integration Testing
describe('Page Builder Integration', () => {
  it('should create page with components', async () => {
    await navigateToPageBuilder();
    await dragComponentToPage('hero');
    await configureComponent({ heading: 'Welcome' });
    expect(await getPageComponent('hero')).toBeVisible();
  });
});
```

## Performance Targets
- **Hero Component LCP**: < 1.5 seconds
- **Component Library Loading**: Lazy loaded to reduce initial bundle
- **Image Optimization**: WebP format with responsive variants
- **Bundle Size**: Core bundle < 500KB, feature bundles lazy loaded
- **Change Detection**: OnPush strategy with Signal-based reactivity

## Recent Features
1. **Project Skeleton Setup (001-make-the-project)**: Angular v20 foundation with constitutional compliance
   - Framework integration testing dashboard
   - NgRx SignalStore demonstration with demo counter
   - 3-layer design token system implementation
   - Transloco internationalization (Hungarian/English)
   - TypeScript strict mode with constitutional linting rules
   - WCAG 2.1 AA accessibility foundation

2. **Configurable Portfolio Website Platform (002-the-application-goal)**: Real estate investment LLC portfolio platform
   - Admin authentication and secure content editing
   - In-place editing with rich text formatting capabilities
   - Drag-and-drop component library with 24+ real estate components
   - Investment metrics calculation and ROI analysis tools
   - Property management with image galleries and location maps
   - Contact forms and lead generation for real estate inquiries
   - Responsive design optimized for real estate portfolio presentation

3. **Upcoming: Page Component Library (003-implement-components-for)**: Implementation of the 24+ reusable Angular components
4. **Upcoming: Image Management System**: Upload, optimization, and responsive image generation

<!-- MANUAL ADDITIONS START -->
<!-- Add project-specific guidelines here -->
<!-- MANUAL ADDITIONS END -->

---
*Based on Archland.hu Constitution v1.0.0 | Generated: 2025-09-15*