# Angular Development Constitution

## Core Principles

### I. Framework Standards
- Use Angular v20+ with standalone components as default
- Enable strict TypeScript configuration with `noImplicitAny`, `strictNullChecks`, and `strictFunctionTypes`
- Always use Signal-based change detection and avoid OnPush when using Signals
- Support responsive design with mobile-first approach (breakpoints: 576px, 768px, 992px, 1200px)
- Use CSS Container Queries for component-level responsive design (90%+ browser support in 2025)
- Use native `window.matchMedia()` for viewport-based responsive logic in TypeScript, avoid CDK dependencies
- Prefer container queries for micro-layout (component internals), media queries for macro-layout (page structure)
- **REQUIRED**: Use Angular's new control flow syntax (`@if`, `@for`, `@switch`) instead of structural directives
- **REQUIRED**: Use `@let` for template variable declarations and complex expression reuse
- ✅ DO: `@Component({ ... })` (standalone) ❌ DON'T: `@NgModule` declarations
- ✅ DO: Use `inject()` in components ❌ DON'T: Constructor injection in new code
- ✅ DO: `@if (condition) { content } @else { fallback }` ❌ DON'T: `*ngIf="condition"`
- ✅ DO: `@for (item of items; track item.id) { content }` ❌ DON'T: `*ngFor="let item of items"`
- ✅ DO: `@let user = user$ | async; @if (user) { {{ user.name }} }` ❌ DON'T: Repetitive async pipes
- Follow Angular's official style guide and enable zoneless change detection where possible

> **📖 Detailed Implementation Guide**: [Framework Standards Best Practices](.specify/memory/framework-standards-best-practices.md)
> **📖 Template Syntax Guide**: [Angular Template Syntax Best Practices](.specify/memory/angular-template-syntax-best-practices.md)

### II. State Management
- Use NgRx SignalStore with `withState()`, `withMethods()`, and `withComputed()` for all state management
- Prefer Angular Signals over RxJS Observables for synchronous state
- Use RxJS only for asynchronous operations (HTTP calls, timers, event streams)
- Maintain immutable state patterns with `patchState()` and readonly interfaces
- Store state in the highest common ancestor component that needs it
- ✅ DO: `const store = signalStore(withState({...}))` ❌ DON'T: `new BehaviorSubject()`
- ✅ DO: `computed(() => store.items().filter(...))` ❌ DON'T: `combineLatest([store$, filter$])`
- ✅ DO: `readonly items: ReadonlyArray<T>` ❌ DON'T: `items: T[]` in state interfaces

> **📖 Detailed Implementation Guide**: [State Management Best Practices](.specify/memory/state-management-best-practices.md)

### III. Component Communication
- Never use `@Input()` or `@Output()` decorators in new code
- Use `input()`, `input.required()`, and `output()` for all component inputs/outputs
- All component communication must be type-safe with proper interfaces
- Use `model()` for two-way binding instead of separate input/output pairs
- Prefer `computed()` for derived values from inputs
- ✅ DO: `name = input.required<string>()` ❌ DON'T: `@Input() name!: string`
- ✅ DO: `click = output<MouseEvent>()` ❌ DON'T: `@Output() click = new EventEmitter()`
- ✅ DO: `value = model<string>('')` ❌ DON'T: `@Input() value + @Output() valueChange`
- ✅ DO: `displayName = computed(() => this.user().firstName + ' ' + this.user().lastName)`

> **📖 Detailed Implementation Guide**: [Component Communication Best Practices](.specify/memory/component-communication-best-practices.md)

### IV. Coding Principles
- Follow functional and declarative programming principles over imperative approaches
- All functions must be defined as arrow functions: `const functionName = () => { ... }`
- Functions must be pure when possible, avoiding side effects
- Each function must have a single responsibility and be easily testable
- Respect SOLID principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- Apply DRY principle but favor readability over deduplication when in conflict
- Use immutable data structures and avoid mutating parameters or state directly
- ✅ DO: `const calculateTotal = (items: Item[]) => items.reduce(...)` ❌ DON'T: `function calculateTotal(items) { ... }`
- ✅ DO: `const newState = { ...currentState, updated: true }` ❌ DON'T: `currentState.updated = true`
- ✅ DO: Keep functions under 20 lines when possible ❌ DON'T: Create monolithic functions

> **📖 Detailed Implementation Guide**: [Coding Principles Best Practices](.specify/memory/coding-principles-best-practices.md)

### V. Type Safety (NON-NEGOTIABLE)
- Never use `any` type - use `unknown` for truly unknown data, then narrow with type guards
- Never use type casting (`as Type`) - always use type guards or assertion functions
- All type conversions must be explicit and safe using type guard functions
- Enable strict TypeScript configuration: `strict: true`, `noImplicitReturns`, `noUncheckedIndexedAccess`
- All interfaces must use `readonly` properties when data shouldn't be mutated
- Use branded types for primitive values that have semantic meaning
- Prefer union types over enums, use `const` assertions for literal types
- ✅ DO: `const isString = (value: unknown): value is string => typeof value === 'string'`
- ❌ DON'T: `const str = data as string` or `const str: any = data`
- ✅ DO: `interface IUser { readonly id: string; readonly name: string }`
- ❌ DON'T: `interface User { id: string; name: string }` (when immutable)

> **📖 Detailed Implementation Guide**: [Type Safety Best Practices](.specify/memory/type-safety-best-practices.md)

## Component Architecture

### Component Structure
- All components must receive a `vm` (view-model) as a typed input: `vm = input.required<IComponentVM>()`
- View-model contains pre-computed, static data ready for template rendering (translation keys, formatted values, variants)
- Components are pure presentation - no business logic, only rendering the provided view-model data
- Use content projection with `<ng-content select="...">` for flexible, reusable components
- Services create view-models through `computed()` that transform domain data into component-ready formats
- Keep components stateless and deterministic - same VM input produces same output
- ✅ DO: `vm = input.required<IContactVM>()` with interface defining all template data
- ❌ DON'T: Internal component state, signals, or business logic in components
- ✅ DO: Services return `computed(() => ({ titleKey: 'contact.title', emailValue: contact.email }))`
- ✅ DO: `<span>{{ t(vm().titleKey) }}</span>` ❌ DON'T: `<span>{{ computeTitle() }}</span>`

> **📖 Detailed Implementation Guide**: [Component Structure Best Practices](.specify/memory/component-structure-best-practices.md)

### CVA-Based Components
- Never place ControlValueAccessor fields (`value`, `disabled`, `onChange`, `onTouched`) inside the view-model
- Handle all CVA interactions through the proper ControlValueAccessor interface methods
- Use signals for internal component state, CVA interface for form integration
- Implement proper validation and error state handling through CVA
- Always implement both `registerOnChange` and `registerOnTouched` methods
- ✅ DO: `writeValue(value) { this.vm.internalValue.set(value); }` (separate from CVA value)
- ❌ DON'T: `vm = { value: signal(''), disabled: signal(false) }` (CVA concerns in vm)
- ✅ DO: Validate through Angular's validator functions ❌ DON'T: Custom validation outside forms

> **📖 Detailed Implementation Guide**: [CVA-Based Components Best Practices](.specify/memory/cva-components-best-practices.md)

### Attribute-Driven Components
- Pass HTML attributes (`id`, `aria-*`, `data-*`, `class`, `style`) directly to components, never through view-model
- Use Angular's host binding (`@Component({ host: {...} })`) for attribute management
- Separate DOM concerns from component logic - attributes belong to the DOM layer
- Use `input()` for HTML attributes and bind them to host element properties
- Implement proper accessibility with ARIA attributes passed as inputs
- **REQUIRED**: All ARIA attributes must be translation keys, not hardcoded English text
- **REQUIRED**: Use separate inputs for ARIA label keys and computed ARIA label values
- ✅ DO: `<my-component id="unique-id" ariaLabelKey="header.logoAriaLabel">`
- ❌ DON'T: `vm = { id: signal(''), ariaLabel: signal('') }` (DOM concerns in vm)
- ✅ DO: `host: { '[attr.id]': 'elementId', '[attr.aria-label]': 't(ariaLabelKey())' }`
- ✅ DO: `elementId = input<string>(); ariaLabelKey = input<string>()`
- ✅ DO: Provide both label keys and computed values ❌ DON'T: Hardcoded ARIA text

> **📖 Detailed Implementation Guide**: [Attribute-Driven Components Best Practices](.specify/memory/attribute-driven-components-best-practices.md)

## Services & Architecture
- Services exist primarily to convert domain-layer data into view-model optimized data structures
- Maintain strict separation: Domain Layer → Service Layer → Component View-Model → Template
- Use dependency injection with `inject()` function, avoid constructor injection in new code
- Implement repository pattern with abstract classes for data access abstraction
- Services must be stateless - use SignalStore for state management instead
- Follow single responsibility principle - one clear purpose per service
- ✅ DO: `convertToViewModel = (domain: DomainType): ViewModelType => ({ ... })`
- ❌ DON'T: Mix HTTP calls, business logic, and view formatting in one service
- ✅ DO: Abstract repository pattern with dependency injection
- ❌ DON'T: Services that hold state in properties - use stores instead

> **📖 Detailed Implementation Guide**: [Services & Architecture Best Practices](.specify/memory/services-architecture-best-practices.md)

## Documentation Standards
- Maintain up-to-date `README.md` files with project purpose, usage, and links to related repos
- Document components and APIs with JSDoc
- All public interfaces must be documented

## Folder Structure & Naming Conventions

### Organization
- Organize by **feature first** (e.g., `/src/app/features/feature-name/...`)
- Shared and cross-cutting code belongs in `/src/app/shared` and `/src/app/core`
- Use one file per class, interface, or component

### Naming Standards
- Components, services, directives, pipes: `kebab-case` (e.g., `user-profile.component.ts`)
- Folders: `kebab-case` (e.g., `user-profile/`)
- Class names: `UpperCamelCase` (PascalCase), suffixed with type (e.g., `UserProfileComponent`, `AuthService`)
- Interfaces: `PascalCase` with `I` prefix (e.g., `IUserProfile`)
- Variables and function names: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Observables: suffix with `$` (e.g., `user$`)
- Modules: `PascalCase` with suffix `Module` (e.g., `UserProfileModule`)

## Design System & Configuration

### Design Tokens
- Use Brad Frost's 3-layer token system for all design values (subatomic foundation of atomic design):
  1. **Palette tokens** (Tier-1): Raw scales without semantic meaning (`grey-50` to `grey-900`, `space-1` to `space-24`)
  2. **Semantic tokens** (Tier-2): Contextual meaning applied to palette tokens (`--surface-primary`, `--text-subtle`, `--border-focus`)
  3. **Component tokens** (Tier-3): Component-scoped tokens referencing semantic tokens (`--button-background`, `--card-shadow`)
- All design values must be algorithmic: 4px spacing grid, 1.25 modular scale typography, calculated color scales
- Never hard-code design values in components - always reference tokens
- Use CSS custom properties for runtime theme switching capability
- ✅ DO: `background: var(--surface-primary)` ❌ DON'T: `background: #ffffff`
- ✅ DO: `padding: var(--space-4)` ❌ DON'T: `padding: 16px`
- ✅ DO: Algorithmic token generation ❌ DON'T: Manual token definition

> **📖 Detailed Implementation Guide**: [Design Tokens Best Practices](.specify/memory/design-tokens-best-practices.md)

### Design Standards
- Centralize all design tokens in a shared configuration system with TypeScript interfaces
- Implement algorithmic design: 4px spacing grid, 1.25 modular typography scale, systematic color generation
- Typography base size: 16px with modular scale ratio 1.25 for hierarchical sizing
- Line height: 1.4-1.6 range (larger fonts use smaller ratios: headings ~1.25, body ~1.6)
- Spacing: 4px base grid (`space-1: 4px`, `space-2: 8px`, `space-4: 16px`, etc.)
- Colors: Always palette → semantic → component token hierarchy
- Support runtime theming through CSS custom properties
- Utility classes for common patterns, but favor component-scoped styles
- ✅ DO: Systematic, algorithmic design values ❌ DON'T: Arbitrary, manual design decisions
- ✅ DO: `--space-4: 16px` with 4px increments ❌ DON'T: Random spacing values
- ✅ DO: `font-size: 20px` (16 × 1.25) ❌ DON'T: `font-size: 18px` (arbitrary)

## Quality Standards

### Accessibility
- Follow WCAG 2.1 AA standards as minimum - make accessibility part of definition of done
- Use semantic HTML elements first, ARIA attributes only when semantic HTML is insufficient
- Implement proper focus management, keyboard navigation, and screen reader support
- Ensure 4.5:1 color contrast ratio minimum, 3:1 for large text
- All interactive elements must have accessible names and proper roles
- Test with keyboard navigation and screen readers during development
- **REQUIRED**: All ARIA labels must be internationalized - never hardcode English-only ARIA text
- **REQUIRED**: Prefer visible text and `aria-labelledby` over `aria-label` for better translation support
- **REQUIRED**: Use Angular's `[attr.aria-*]` binding syntax for all ARIA attributes
- **REQUIRED**: Pass all accessibility attributes as component inputs, never in view-model
- ✅ DO: `<button>Submit</button>` ❌ DON'T: `<div onclick="submit()">Submit</div>`
- ✅ DO: `<nav [attr.aria-label]="t('navigation.mainAriaLabel')">` ❌ DON'T: `aria-label="Main navigation"`
- ✅ DO: `<button [attr.aria-labelledby]="headingId">` ❌ DON'T: `aria-label="Hardcoded text"`
- ✅ DO: `ariaLabel = input<string>()` with `[attr.aria-label]="ariaLabel()"` ❌ DON'T: ARIA in view-model
- ✅ DO: Semantic HTML + ARIA when needed ❌ DON'T: ARIA-only solutions

### Internationalization
- Use Transloco with Signal-based API for all internationalization needs
- Externalize ALL user-facing text into hierarchical translation files - no hardcoded strings
- Use structural directive `*transloco="let t"` for optimal performance (single subscription per template)
- Never build sentences by concatenating translation strings - use ICU MessageFormat for complex grammar
- Implement proper pluralization with MessageFormat plugin, not conditional logic
- Support RTL languages and locale-specific formatting from day one
- ✅ DO: `*transloco="let t"` then `{{ t('key') }}` ❌ DON'T: `{{ 'hardcoded text' }}`
- ✅ DO: `"{count, plural, =0 {no items} one {1 item} other {# items}}"` ❌ DON'T: String concatenation
- ✅ DO: Feature-based translation file organization ❌ DON'T: Flat, monolithic translation files

> **📖 Detailed Implementation Guide**: [Internationalization Best Practices](.specify/memory/internationalization-best-practices.md)

### Performance
- Use lazy loading for feature modules and routes - avoid eager loading of non-critical features
- Implement OnPush change detection strategy only when NOT using Signals (Signals optimize automatically)
- Optimize assets: WebP images, modern formats, responsive images with `srcset`
- Keep third-party dependencies minimal - audit bundle size regularly with tools like webpack-bundle-analyzer
- Use trackBy functions in *ngFor loops for large lists to prevent unnecessary DOM manipulation
- Implement virtual scrolling for large datasets using Angular CDK
- ✅ DO: Lazy load feature modules ❌ DON'T: Load all features at startup
- ✅ DO: `trackByFn = (index: number, item: T) => item.id` ❌ DON'T: Default object comparison
- ✅ DO: Signals for reactive state ❌ DON'T: OnPush with manual change detection

### Security
- Sanitize ALL user input using Angular's built-in DomSanitizer - never trust user data
- Protect against CSRF attacks using proper tokens, SameSite cookie settings, and HTTP-only cookies
- Store secrets in environment variables or secure vaults - never commit secrets to version control
- Use Content Security Policy (CSP) headers to prevent XSS attacks
- Validate and sanitize data on both client and server sides
- Use only libraries with permissive licenses (MIT, Apache 2.0, BSD) - avoid GPL and copyleft licenses
- ✅ DO: `sanitizer.sanitize(SecurityContext.HTML, userInput)` ❌ DON'T: `innerHTML = userInput`
- ✅ DO: Environment variables for API keys ❌ DON'T: Hardcoded secrets in code
- ✅ DO: Server-side validation + client-side validation ❌ DON'T: Client-side only validation

## Developer Experience
- Standardize tooling: ESLint with Angular-specific rules, Prettier for code formatting, Husky for pre-commit hooks
- Configure unified development commands: `npm start`, `npm build`, `npm test`, `npm lint`
- Use Angular CLI or Nx for project scaffolding, code generation, and build optimization
- Enable Hot Module Replacement (HMR) in development for faster feedback loops
- Implement strict linting rules that enforce constitutional compliance automatically
- Use TypeScript strict mode with additional compiler options for maximum type safety
- ✅ DO: Automated linting and formatting on save/commit ❌ DON'T: Manual code style enforcement
- ✅ DO: Constitutional compliance via automated tooling ❌ DON'T: Manual constitutional review only

## Governance

### Constitution Authority
- This constitution supersedes all other practices and guidelines
- All development decisions must align with these principles
- Amendments require documentation, approval, and migration plan

### Code Review Requirements
- All PRs/reviews must verify compliance with this constitution
- Type safety violations are automatic rejections
- Complexity must be justified and documented
- Architecture decisions must align with established patterns

### Quality Gates
- No code enters main branch without passing all linting and type checks
- Component architecture must follow established view-model patterns
- Design token usage must be verified in all UI changes
- Accessibility standards must be met for all user-facing features

**Version**: 1.1.0 | **Ratified**: 2025-09-15 | **Last Amended**: 2025-09-28