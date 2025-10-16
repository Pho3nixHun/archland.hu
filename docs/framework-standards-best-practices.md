# Framework Standards - Best Practices Guide

> **Constitutional Reference**: Section I. Framework Standards
> **Version**: 1.0.0
> **Last Updated**: 2025-09-26
> **Sources**: Angular.dev official documentation, Angular roadmap, community best practices

This document provides comprehensive best practices for the Framework Standards section of the Archland.hu Constitution, covering Angular v20, official style guide compliance, and responsive design implementation.

## Table of Contents
1. [Angular v20 Framework Requirements](#angular-v20-framework-requirements)
2. [Angular Official Style Guide Compliance](#angular-official-style-guide-compliance)
3. [Responsive Design Implementation](#responsive-design-implementation)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Code Examples](#code-examples)
6. [Performance Standards](#performance-standards)
7. [Migration and Upgrade Path](#migration-and-upgrade-path)

---

## Angular v20 Framework Requirements

### 1. Core Version Prerequisites

**Required Dependencies:**
- **Angular**: v20.x (latest stable)
- **TypeScript**: v5.8+ (required by Angular v20)
- **Node.js**: v20+ (Node v18 no longer supported)

```bash
# Verify versions
ng version
node --version  # Must be v20+
```

### 2. New Angular v20 Features (Mandatory Usage)

#### 2.1 Stable Signals Ecosystem
All fundamental reactivity primitives are now stable and **MUST** be used:
- `signal()` - reactive primitive
- `effect()` - side-effect logic when signals change
- `linkedSignal()` - derived signals
- Signal-based queries (`viewChild()`, `contentChild()`)
- Signal inputs (`input()`, `input.required()`)

```typescript
// ✅ REQUIRED: Use stable signals
export class UserComponent {
  // Signal inputs (replaces @Input)
  user = input.required<IUserProfile>();
  isEditable = input(false);

  // Signal queries (replaces @ViewChild)
  userForm = viewChild.required<ElementRef>('userForm');

  // Derived signals
  displayName = computed(() =>
    `${this.user().firstName} ${this.user().lastName}`
  );

  // Effects for side effects
  private saveEffect = effect(() => {
    if (this.user().isDirty) {
      this.saveUser(this.user());
    }
  });
}
```

#### 2.2 Zoneless Change Detection (Stable)
As of Angular v20.2, zoneless change detection is production-ready and **SHOULD** be implemented:

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    // ... other providers
  ]
});
```

#### 2.3 Enhanced Server-Side Rendering
Route-level render modes and incremental hydration are now stable:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio/portfolio.component'),
    data: {
      renderMode: 'ssr',
      hydrationStrategy: 'incremental'
    }
  }
];
```

#### 2.4 Modern Testing Integration
Angular v20 introduces experimental support for Vitest:

```typescript
// vitest.config.ts (experimental)
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
  },
});
```

### 3. AI Integration Support
Angular v20 includes built-in AI development support:

```bash
# Access AI integration guides
ng generate component user-profile --ai-assisted
```

---

## Angular Official Style Guide Compliance

### 1. Updated Naming Conventions (Angular v20)

#### 1.1 Simplified File Naming
**Major Change**: Most suffixes have been removed from file names.

```bash
# ✅ NEW (Angular v20 Style Guide)
src/app/features/user/
├── user.ts              # UserComponent (was user.component.ts)
├── user.html            # Template
├── user.scss            # Styles
├── user.spec.ts         # Tests
├── user-card.ts         # UserCardComponent
├── user-page.ts         # UserPageComponent
└── user-profile.ts      # UserProfileComponent

# ❌ OLD (Deprecated naming)
├── user.component.ts
├── user.component.html
├── user.component.scss
├── user.component.spec.ts
```

#### 1.2 Component Class Naming
Match class names to their purpose, not file structure:

```typescript
// ✅ REQUIRED: Descriptive class names
export class User { }            // Simple component
export class UserCard { }        // Card variant
export class UserPage { }        // Page component
export class UserProfile { }     // Profile component

// ❌ FORBIDDEN: Generic suffixed names
export class UserComponent { }   // Too generic
```

### 2. Project Structure Standards

#### 2.1 Feature-First Organization
**Constitutional Requirement**: Organize by feature areas, not code types.

```bash
src/app/
├── features/
│   ├── portfolio/
│   │   ├── components/
│   │   │   ├── property-card.ts
│   │   │   ├── property-gallery.ts
│   │   │   └── investment-metrics.ts
│   │   ├── services/
│   │   │   └── portfolio.service.ts
│   │   ├── models/
│   │   │   └── property.interface.ts
│   │   └── portfolio.routes.ts
│   └── admin/
│       ├── components/
│       ├── services/
│       └── admin.routes.ts
├── shared/
│   ├── components/    # Reusable UI components
│   ├── services/      # Cross-feature services
│   └── models/        # Shared interfaces
└── core/
    ├── services/      # Singleton services
    ├── guards/        # Route guards
    └── interceptors/  # HTTP interceptors
```

#### 2.2 Single Concept Focus
**Official Guideline**: "Prefer focusing source files on a single concept"

```typescript
// ✅ GOOD: Single responsibility
export class UserProfile {
  // Only handles user profile display and editing
}

export class UserAuth {
  // Only handles authentication logic
}

// ❌ BAD: Multiple responsibilities
export class User {
  // Handles profile, authentication, permissions, notifications...
}
```

### 3. Modern Dependency Injection

#### 3.1 Prefer inject() Function
**Official Recommendation**: Use `inject()` over constructor injection for better type inference.

```typescript
// ✅ REQUIRED: inject() function
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AppConfig);

  getUser(id: string): Observable<IUser> {
    return this.http.get<IUser>(`${this.config.apiUrl}/users/${id}`);
  }
}

// ❌ DISCOURAGED: Constructor injection
export class UserService {
  constructor(
    private http: HttpClient,
    private config: AppConfig
  ) {}
}
```

### 4. Component Best Practices

#### 4.1 Template Complexity
Keep components focused on presentation, avoid complex logic in templates:

```typescript
// ✅ GOOD: Logic in component, simple template
export class UserCard {
  user = input.required<IUser>();

  displayClass = computed(() => {
    const user = this.user();
    return {
      'user-card': true,
      'user-card--premium': user.isPremium,
      'user-card--inactive': !user.isActive
    };
  });
}
```

```html
<!-- ✅ GOOD: Simple template -->
<div [class]="displayClass()">
  <h3>{{ user().name }}</h3>
</div>

<!-- ❌ BAD: Complex logic in template -->
<div [class]="{
  'user-card': true,
  'user-card--premium': user().subscription?.type === 'premium' && user().subscription?.isActive,
  'user-card--inactive': !user().isActive || user().lastLogin < thirtyDaysAgo
}">
  <h3>{{ user().name }}</h3>
</div>
```

#### 4.2 Member Visibility
Use appropriate access modifiers:

```typescript
export class UserProfile {
  // ✅ Public: Used in template and external APIs
  user = input.required<IUser>();

  // ✅ Protected: Only used in template
  protected displayName = computed(() => this.user().name);

  // ✅ Private: Internal component logic only
  private readonly userService = inject(UserService);

  // ✅ Readonly: Angular-initialized properties
  protected readonly userForm = viewChild.required<ElementRef>('userForm');
}
```

#### 4.3 Binding Preferences
Prefer `class` and `style` bindings over directive alternatives:

```html
<!-- ✅ PREFERRED: Direct bindings -->
<div [class.active]="isActive()" [style.color]="themeColor()">

<!-- ❌ DISCOURAGED: Directive equivalents -->
<div [ngClass]="{'active': isActive()}" [ngStyle]="{'color': themeColor()}">
```

---

## Responsive Design Implementation

### 1. Angular CDK BreakpointObserver (Required)

#### 1.1 Service Integration
**Constitutional Requirement**: Must support responsive design for desktop and mobile.

```typescript
// ✅ REQUIRED: BreakpointObserver service
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

export class ResponsiveLayout {
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Observable for layout changes
  readonly isHandset = this.breakpointObserver.observe([
    Breakpoints.Handset
  ]);

  readonly isTablet = this.breakpointObserver.observe([
    Breakpoints.Tablet
  ]);

  // Custom breakpoints matching constitution
  readonly customBreakpoints = this.breakpointObserver.observe([
    '(max-width: 576px)',    // Mobile
    '(max-width: 768px)',    // Tablet
    '(max-width: 992px)',    // Desktop
    '(min-width: 1200px)'    // Large desktop
  ]);
}
```

#### 1.2 Reactive Layout Management
Centralize responsive logic to avoid performance issues:

```typescript
// shared/services/layout.service.ts
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Constitutional breakpoints
  readonly breakpoints = {
    mobile: '(max-width: 575.98px)',
    tablet: '(min-width: 576px) and (max-width: 767.98px)',
    desktop: '(min-width: 768px) and (max-width: 991.98px)',
    large: '(min-width: 992px) and (max-width: 1199.98px)',
    xlarge: '(min-width: 1200px)'
  } as const;

  readonly isMobile = this.breakpointObserver.observe([this.breakpoints.mobile]);
  readonly isTablet = this.breakpointObserver.observe([this.breakpoints.tablet]);
  readonly isDesktop = this.breakpointObserver.observe([this.breakpoints.desktop]);

  // Computed signals for template usage
  readonly layoutState = toSignal(
    combineLatest([this.isMobile, this.isTablet, this.isDesktop]).pipe(
      map(([mobile, tablet, desktop]) => ({
        isMobile: mobile.matches,
        isTablet: tablet.matches,
        isDesktop: desktop.matches || !mobile.matches && !tablet.matches,
        viewportClass: this.getViewportClass(mobile.matches, tablet.matches, desktop.matches)
      }))
    ),
    { initialValue: { isMobile: false, isTablet: false, isDesktop: true, viewportClass: 'desktop' } }
  );

  private getViewportClass(mobile: boolean, tablet: boolean, desktop: boolean): string {
    if (mobile) return 'mobile';
    if (tablet) return 'tablet';
    return 'desktop';
  }
}
```

### 2. Mobile-First Implementation Strategy

#### 2.1 Component-Based Responsiveness
Create adaptive components that respond to layout changes:

```typescript
// components/navigation/navigation.ts
export class Navigation {
  private readonly layoutService = inject(LayoutService);

  // Reactive layout state
  protected readonly layout = this.layoutService.layoutState;

  // Conditional component rendering
  protected readonly navigationTemplate = computed(() => {
    const currentLayout = this.layout();
    return currentLayout.isMobile ? 'mobile-nav' : 'desktop-nav';
  });

  // Dynamic CSS classes
  protected readonly navigationClasses = computed(() => ({
    'navigation': true,
    'navigation--mobile': this.layout().isMobile,
    'navigation--tablet': this.layout().isTablet,
    'navigation--desktop': this.layout().isDesktop
  }));
}
```

```html
<!-- navigation.html -->
<nav [class]="navigationClasses()">
  <!-- Mobile hamburger menu -->
  @if (layout().isMobile) {
    <button class="nav-toggle" (click)="toggleMobileMenu()">
      <span class="hamburger"></span>
    </button>
    <div class="mobile-menu" [class.open]="mobileMenuOpen()">
      <ng-container *ngTemplateOutlet="navItems"></ng-container>
    </div>
  }

  <!-- Desktop horizontal navigation -->
  @if (layout().isDesktop) {
    <div class="desktop-nav">
      <ng-container *ngTemplateOutlet="navItems"></ng-container>
    </div>
  }

  <!-- Shared navigation items template -->
  <ng-template #navItems>
    <!-- Navigation items here -->
  </ng-template>
</nav>
```

#### 2.2 Custom Responsive Directives
Create reusable responsive behavior:

```typescript
// shared/directives/responsive-visibility.directive.ts
@Directive({
  selector: '[appShowOnBreakpoint]',
  standalone: true
})
export class ResponsiveVisibilityDirective implements OnInit, OnDestroy {
  @Input() appShowOnBreakpoint: 'mobile' | 'tablet' | 'desktop' | 'large' = 'desktop';

  private readonly layoutService = inject(LayoutService);
  private readonly elementRef = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.layoutService.layoutState.subscribe(layout => {
      const shouldShow = this.shouldShowOnCurrentBreakpoint(layout);
      this.renderer.setStyle(
        this.elementRef.nativeElement,
        'display',
        shouldShow ? 'block' : 'none'
      );
    });
  }

  private shouldShowOnCurrentBreakpoint(layout: LayoutState): boolean {
    switch (this.appShowOnBreakpoint) {
      case 'mobile': return layout.isMobile;
      case 'tablet': return layout.isTablet;
      case 'desktop': return layout.isDesktop;
      default: return true;
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
```

### 3. Performance Optimization

#### 3.1 Breakpoint Observer Best Practices
**Critical**: Avoid creating multiple breakpoint observers:

```typescript
// ✅ GOOD: Centralized breakpoint management
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Single observer for all breakpoints
  private readonly allBreakpoints = this.breakpointObserver.observe([
    this.breakpoints.mobile,
    this.breakpoints.tablet,
    this.breakpoints.desktop
  ]);

  // Shared across all components
  readonly layoutState = toSignal(this.allBreakpoints);
}

// ❌ BAD: Multiple observers in each component
export class SomeComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Creates unnecessary performance overhead
  private readonly mobileQuery = this.breakpointObserver.observe(['(max-width: 576px)']);
  private readonly tabletQuery = this.breakpointObserver.observe(['(max-width: 768px)']);
}
```

---

## Implementation Guidelines

### 1. Upgrade Path to Angular v20

#### 1.1 Step-by-Step Migration
```bash
# 1. Update Angular CLI globally
npm uninstall -g @angular/cli
npm install -g @angular/cli@latest

# 2. Navigate to project and update (one major version at a time)
cd your-angular-project
ng update @angular/cli @angular/core

# 3. Update TypeScript to v5.8+
npm install typescript@~5.8.0 --save-dev

# 4. Update Node.js to v20+ (if not already)
nvm use 20  # or your preferred method
```

#### 1.2 Feature Adoption Strategy
```typescript
// Phase 1: Replace @Input/@Output with signals
// Before
@Input() user!: IUser;
@Output() userClick = new EventEmitter<IUser>();

// After
user = input.required<IUser>();
userClick = output<IUser>();

// Phase 2: Implement zoneless change detection
// main.ts
providers: [
  provideExperimentalZonelessChangeDetection(),
]

// Phase 3: Adopt new naming conventions
// Rename files and update imports systematically
```

### 2. Code Quality Standards

#### 2.1 ESLint Configuration for Angular v20
```json
// .eslintrc.json
{
  "extends": [
    "@angular-eslint/recommended",
    "@angular-eslint/template/process-inline-templates"
  ],
  "rules": {
    "@angular-eslint/prefer-standalone": "error",
    "@angular-eslint/use-lifecycle-interface": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@angular-eslint/component-class-suffix": [
      "error",
      { "suffixes": ["Component", "Page", "Card", "Dialog"] }
    ]
  }
}
```

### 3. Testing Standards

#### 3.1 Component Testing with Signals
```typescript
// user-profile.spec.ts
describe('UserProfile', () => {
  let component: UserProfile;
  let fixture: ComponentFixture<UserProfile>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UserProfile);
    component = fixture.componentInstance;

    // Set required signal inputs
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
  });

  it('should display computed name correctly', () => {
    expect(component.displayName()).toBe('John Doe');
  });

  it('should emit user click event', () => {
    spyOn(component.userClick, 'emit');

    component.handleUserClick();

    expect(component.userClick.emit).toHaveBeenCalledWith(mockUser);
  });
});
```

---

## Performance Standards

### 1. Metrics and Targets

#### 1.1 Angular v20 Performance Benefits
- **Change Detection**: 40-50% faster with zoneless detection
- **Hydration**: 40-50% LCP improvements with incremental hydration
- **Bundle Size**: Reduced by optimized tree-shaking of signal-based code
- **Runtime Performance**: Signals provide more efficient reactivity than RxJS observables

#### 1.2 Responsive Design Performance
```typescript
// Performance monitoring
export class PerformanceMonitor {
  private readonly performanceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.entryType === 'layout-shift') {
        // Track CLS for responsive layout changes
        this.trackLayoutShift(entry as LayoutShift);
      }
    });
  });

  constructor() {
    this.performanceObserver.observe({ entryTypes: ['layout-shift'] });
  }

  private trackLayoutShift(entry: LayoutShift): void {
    if (entry.value > 0.1) {
      console.warn('High layout shift detected:', entry.value);
    }
  }
}
```

### 2. Bundle Optimization

#### 2.1 Lazy Loading with Angular v20
```typescript
// app.routes.ts - Route-level code splitting
export const routes: Routes = [
  {
    path: 'portfolio',
    loadComponent: () => import('./features/portfolio/portfolio.component')
      .then(m => m.PortfolioComponent),
    data: { preload: true }
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes')
      .then(m => m.adminRoutes),
    canActivate: [AdminGuard]
  }
];
```

---

## Migration and Upgrade Path

### 1. Constitutional Compliance Checklist

#### 1.1 Framework Standards Validation
- [ ] Angular v20.x installed and configured
- [ ] TypeScript v5.8+ configured with strict mode
- [ ] Node.js v20+ in use
- [ ] Zoneless change detection enabled (recommended)
- [ ] Signal-based reactivity implemented
- [ ] New naming conventions adopted
- [ ] BreakpointObserver service integrated
- [ ] Mobile-first responsive design implemented
- [ ] Performance targets met
- [ ] Testing framework updated for new patterns

#### 1.2 Code Review Requirements
All code changes must verify:
1. **Signal Usage**: No @Input/@Output decorators used
2. **Naming Conventions**: Files follow new Angular v20 standards
3. **Responsive Design**: Components adapt to different screen sizes
4. **Performance**: No unnecessary BreakpointObserver instances
5. **Type Safety**: Strict TypeScript compliance maintained

---

## Conclusion

This Framework Standards documentation provides the foundation for all Angular v20 development within the Archland.hu project. These practices ensure:

- **Modern Angular**: Leverage latest Angular v20 features and performance improvements
- **Maintainability**: Follow official style guide for consistent, readable code
- **Responsiveness**: Implement robust mobile-first design using Angular CDK
- **Performance**: Optimize for fast loading and smooth user interactions
- **Future-Proof**: Align with Angular's roadmap and emerging best practices

**Next Steps**: Apply these standards to all existing and new components, services, and features within the project architecture.

---

**Document Information**
- **Authority**: Archland.hu Constitution Section I
- **Review Cycle**: Quarterly (aligned with Angular releases)
- **Stakeholders**: All frontend developers, architects, code reviewers
- **Related Documents**: [State Management Best Practices], [Component Communication Standards], [Type Safety Guidelines]