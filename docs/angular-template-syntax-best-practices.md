# Angular Template Syntax Best Practices

## Modern Control Flow Syntax (Angular v17+)

### Overview
Angular v17+ introduced a new, more intuitive control flow syntax that replaces structural directives. This syntax is closer to JavaScript, offers better type checking, and reduces bundle size by being built into the template compiler.

### @if Control Flow

**Required Usage**: Use `@if` instead of `*ngIf` for all conditional rendering.

```typescript
// ✅ DO: Use @if with @else chains
@if (user.isLoggedIn) {
  <user-dashboard [user]="user" />
} @else if (user.isGuest) {
  <guest-welcome />
} @else {
  <login-form />
}

// ❌ DON'T: Use structural directives
<user-dashboard *ngIf="user.isLoggedIn" [user]="user" />
<guest-welcome *ngIf="user.isGuest" />
<login-form *ngIf="!user.isLoggedIn && !user.isGuest" />
```

**Benefits of @if:**
- More intuitive syntax closer to JavaScript
- Better type narrowing and inference
- Reduced runtime footprint
- No need to import CommonModule

### @for Control Flow

**Required Usage**: Use `@for` instead of `*ngFor` for all iteration.

```typescript
// ✅ DO: Use @for with track expression
@for (item of items; track item.id) {
  <item-card [item]="item" />
} @empty {
  <no-items-message />
}

// ✅ DO: Use index and other loop variables
@for (user of users; track user.id; let index = $index, isFirst = $first) {
  <user-row
    [user]="user"
    [index]="index"
    [class.first]="isFirst"
  />
}

// ❌ DON'T: Use *ngFor
<item-card *ngFor="let item of items; trackBy: trackByFn" [item]="item" />
```

**Available Loop Variables:**
- `$index` - current index
- `$first` - true if first item
- `$last` - true if last item
- `$even` - true if even index
- `$odd` - true if odd index
- `$count` - total number of items

### @switch Control Flow

**Required Usage**: Use `@switch` instead of `*ngSwitch` for multi-condition rendering.

```typescript
// ✅ DO: Use @switch with @case and @default
@switch (userRole) {
  @case ('admin') {
    <admin-panel />
  }
  @case ('editor') {
    <editor-tools />
  }
  @case ('viewer') {
    <readonly-view />
  }
  @default {
    <access-denied />
  }
}

// ❌ DON'T: Use ngSwitch
<div [ngSwitch]="userRole">
  <admin-panel *ngSwitchCase="'admin'" />
  <editor-tools *ngSwitchCase="'editor'" />
  <readonly-view *ngSwitchCase="'viewer'" />
  <access-denied *ngSwitchDefault />
</div>
```

## @let Template Variables

### Overview
The `@let` syntax allows you to define local template variables and reuse complex expressions, improving template readability and performance.

### Basic Usage

```typescript
// ✅ DO: Use @let for complex expressions
@let user = user$ | async;
@let fullName = user?.firstName + ' ' + user?.lastName;
@let canEdit = user?.role === 'admin' || user?.role === 'editor';

@if (user) {
  <h1>Welcome, {{ fullName }}!</h1>
  @if (canEdit) {
    <edit-button />
  }
}

// ❌ DON'T: Repeat complex expressions
@if (user$ | async; as user) {
  <h1>Welcome, {{ (user$ | async)?.firstName + ' ' + (user$ | async)?.lastName }}!</h1>
  @if ((user$ | async)?.role === 'admin' || (user$ | async)?.role === 'editor') {
    <edit-button />
  }
}
```

### Advanced @let Patterns

```typescript
// ✅ DO: Use @let with computed values
@let theme = isDarkMode() ? 'dark' : 'light';
@let containerClass = 'container ' + theme + '-theme';
@let styles = {
  backgroundColor: theme === 'dark' ? '#333' : '#fff',
  color: theme === 'dark' ? '#fff' : '#333'
};

<div [class]="containerClass" [ngStyle]="styles">
  Content
</div>

// ✅ DO: Use @let with async data and error handling
@let apiData = apiCall$ | async;
@let isLoading = apiData === null;
@let hasError = apiData?.error !== undefined;
@let successData = apiData?.data;

@if (isLoading) {
  <loading-spinner />
} @else if (hasError) {
  <error-message [error]="apiData.error" />
} @else if (successData) {
  <data-display [data]="successData" />
}
```

### @let Scoping Rules

```typescript
// ✅ DO: Understand @let scoping
@let globalVar = 'available everywhere';

@if (condition) {
  @let localVar = 'only available in this block';
  <p>{{ globalVar }} and {{ localVar }}</p>

  @for (item of items; track item.id) {
    @let itemVar = item.name.toUpperCase();
    <span>{{ globalVar }}, {{ localVar }}, {{ itemVar }}</span>
  }

  <!-- itemVar not available here -->
  <p>{{ globalVar }} and {{ localVar }}</p>
}

<!-- localVar not available here -->
<p>{{ globalVar }}</p>
```

## Best Practices

### 1. Migration Strategy
```bash
# Angular provides automated migration
ng generate @angular/core:control-flow
```

### 2. Performance Optimization
```typescript
// ✅ DO: Use @let to avoid multiple async pipe subscriptions
@let data = expensiveOperation$ | async;
@if (data) {
  <component1 [data]="data" />
  <component2 [data]="data" />
  <component3 [data]="data" />
}

// ❌ DON'T: Multiple subscriptions
<component1 [data]="expensiveOperation$ | async" />
<component2 [data]="expensiveOperation$ | async" />
<component3 [data]="expensiveOperation$ | async" />
```

### 3. Type Safety
```typescript
// ✅ DO: Leverage improved type narrowing
@let user = userSignal();
@if (user.type === 'premium') {
  <!-- TypeScript knows user.type is 'premium' here -->
  <premium-features [premiumLevel]="user.premiumLevel" />
}

// ✅ DO: Use @let with type guards
@let userData = data();
@let isValidUser = userData && 'id' in userData && 'name' in userData;
@if (isValidUser) {
  <!-- TypeScript knows userData has id and name -->
  <user-card [id]="userData.id" [name]="userData.name" />
}
```

### 4. Accessibility Integration
```typescript
// ✅ DO: Use control flow with accessible patterns
@let hasErrors = form.invalid && form.touched;
@let errorId = 'error-' + fieldId;

<input
  [attr.aria-invalid]="hasErrors"
  [attr.aria-describedby]="hasErrors ? errorId : null"
/>

@if (hasErrors) {
  <div [id]="errorId" class="error-message">
    @for (error of getFieldErrors(); track error.type) {
      <span>{{ t(error.messageKey) }}</span>
    }
  </div>
}
```

### 5. Internationalization
```typescript
// ✅ DO: Use @let with translation system
@let t = getTranslationFunction();
@let currentLang = getCurrentLanguage();
@let isRTL = RTL_LANGUAGES.includes(currentLang);

<div [dir]="isRTL ? 'rtl' : 'ltr'">
  @for (item of menuItems; track item.id) {
    <menu-item
      [label]="t(item.labelKey)"
      [href]="item.href"
    />
  }
</div>
```

## Migration Checklist

- [ ] Replace all `*ngIf` with `@if/@else` syntax
- [ ] Replace all `*ngFor` with `@for` syntax (remember track expressions)
- [ ] Replace all `*ngSwitch` with `@switch/@case/@default` syntax
- [ ] Identify repeated expressions that can use `@let`
- [ ] Update unit tests to work with new syntax
- [ ] Remove CommonModule imports where no longer needed
- [ ] Verify type safety improvements work as expected
- [ ] Test accessibility features with new syntax
- [ ] Update linting rules to enforce new syntax

## Common Patterns

### Loading States
```typescript
@let data = dataSignal();
@let isLoading = loadingSignal();
@let error = errorSignal();

@if (isLoading) {
  <loading-spinner />
} @else if (error) {
  <error-display [error]="error" />
} @else if (data) {
  <data-table [data]="data" />
} @else {
  <empty-state />
}
```

### Complex Conditionals
```typescript
@let user = currentUser();
@let canEdit = user && (user.role === 'admin' || user.role === 'owner');
@let canDelete = user && user.role === 'admin';
@let isOwner = user && user.role === 'owner';

@if (canEdit) {
  <edit-button />
}
@if (canDelete) {
  <delete-button />
}
@if (isOwner) {
  <transfer-ownership-button />
}
```

This new syntax represents Angular's commitment to developer experience improvements while maintaining performance and type safety.