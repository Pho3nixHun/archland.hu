# Design Tokens Best Practices

*Implementation guide for Archland.hu Constitution: Design Tokens System*

*Based on Brad Frost's Atomic Design methodology and industry-leading design token practices*

## Core Principle

Use a 3-layer token system for all design values: **Palette tokens** (raw scales), **Semantic tokens** (contextual meaning), and **Component tokens** (component-scoped). This approach, inspired by Brad Frost's atomic design and modern design token practices, ensures scalable, maintainable, and consistent design systems.

## Why Brad Frost's Approach Matters

### Atomic to Subatomic Evolution
Brad Frost evolved his atomic design methodology to include a **6th stage: Design Tokens** - the "subatomic" foundation that provides the raw materials for all design decisions. Tokens serve as the bridge between design decisions and implementation, creating a shared vocabulary between designers and developers.

### Constitutional Alignment for Archland.hu
- **Algorithmic Design**: Colors, spacing, and typography calculated systematically
- **Centralized Control**: All design values managed from a single source
- **Configurable Theming**: Expose design values for easy customization
- **Type Safety**: Strict TypeScript interfaces for all token usage

## The 3-Layer Token System

### Layer 1: Palette Tokens (Reference/Global)
Raw design values without semantic meaning. These are the "atoms" of your design language.

```scss
// _palette.scss - Raw color scales
$grey-50: #fafafa;
$grey-100: #f5f5f5;
$grey-200: #eeeeee;
$grey-300: #e0e0e0;
$grey-400: #bdbdbd;
$grey-500: #9e9e9e;
$grey-600: #757575;
$grey-700: #616161;
$grey-800: #424242;
$grey-900: #212121;

$blue-50: #e3f2fd;
$blue-100: #bbdefb;
$blue-200: #90caf9;
$blue-300: #64b5f6;
$blue-400: #42a5f5;
$blue-500: #2196f3;
$blue-600: #1e88e6;
$blue-700: #1976d2;
$blue-800: #1565c0;
$blue-900: #0d47a1;

$green-50: #e8f5e8;
$green-100: #c8e6c9;
$green-200: #a5d6a7;
$green-300: #81c784;
$green-400: #66bb6a;
$green-500: #4caf50;
$green-600: #43a047;
$green-700: #388e3c;
$green-800: #2e7d32;
$green-900: #1b5e20;

$red-50: #ffebee;
$red-100: #ffcdd2;
$red-200: #ef9a9a;
$red-300: #e57373;
$red-400: #ef5350;
$red-500: #f44336;
$red-600: #e53935;
$red-700: #d32f2f;
$red-800: #c62828;
$red-900: #b71c1c;

// Spacing scale (4px base)
$space-1: 4px;
$space-2: 8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
$space-10: 40px;
$space-12: 48px;
$space-16: 64px;
$space-20: 80px;
$space-24: 96px;

// Typography scale (modular scale 1.25)
$font-size-xs: 12px;    // 12px
$font-size-sm: 14px;    // 14px
$font-size-base: 16px;  // 16px (base)
$font-size-lg: 20px;    // 20px (16 * 1.25)
$font-size-xl: 25px;    // 25px (20 * 1.25)
$font-size-2xl: 31px;   // 31px (25 * 1.25)
$font-size-3xl: 39px;   // 39px (31 * 1.25)
$font-size-4xl: 49px;   // 49px (39 * 1.25)

// Line height scale (1.4-1.6 range, decreasing with size)
$line-height-tight: 1.25;   // For large headings
$line-height-normal: 1.4;   // For medium text
$line-height-relaxed: 1.6;  // For body text
```

### Layer 2: Semantic Tokens (Contextual/System)
Meaningful names that describe intention and usage, referencing palette tokens.

```scss
// _semantic.scss - Contextual meaning
:root {
  // Surface colors (backgrounds)
  --arch-surface-primary: #{$grey-50};
  --arch-surface-secondary: #{$grey-100};
  --arch-surface-tertiary: #{$grey-200};
  --arch-surface-inverse: #{$grey-900};
  --arch-surface-elevated: #{$white};
  --arch-surface-overlay: #{rgba($grey-900, 0.8)};

  // Text colors
  --arch-text-primary: #{$grey-900};
  --arch-text-secondary: #{$grey-700};
  --arch-text-subtle: #{$grey-600};
  --arch-text-inverse: #{$grey-50};
  --arch-text-disabled: #{$grey-400};

  // Interactive colors
  --arch-interactive-primary: #{$blue-600};
  --arch-interactive-primary-hover: #{$blue-700};
  --arch-interactive-primary-active: #{$blue-800};
  --arch-interactive-secondary: #{$grey-200};
  --arch-interactive-secondary-hover: #{$grey-300};

  // Status colors
  --arch-status-success: #{$green-600};
  --arch-status-success-subtle: #{$green-100};
  --arch-status-warning: #{$yellow-600};
  --arch-status-warning-subtle: #{$yellow-100};
  --arch-status-error: #{$red-600};
  --arch-status-error-subtle: #{$red-100};
  --arch-status-info: #{$blue-600};
  --arch-status-info-subtle: #{$blue-100};

  // Border colors
  --arch-border-default: #{$grey-300};
  --arch-border-subtle: #{$grey-200};
  --arch-border-strong: #{$grey-400};
  --arch-border-focus: #{$blue-600};
  --arch-border-error: #{$red-600};

  // Spacing (semantic names)
  --arch-space-component-gap-xs: #{$space-1};    // 4px
  --arch-space-component-gap-sm: #{$space-2};    // 8px
  --arch-space-component-gap-md: #{$space-4};    // 16px
  --arch-space-component-gap-lg: #{$space-6};    // 24px
  --arch-space-component-gap-xl: #{$space-8};    // 32px

  --arch-space-section-gap-sm: #{$space-8};      // 32px
  --arch-space-section-gap-md: #{$space-12};     // 48px
  --arch-space-section-gap-lg: #{$space-16};     // 64px
  --arch-space-section-gap-xl: #{$space-20};     // 80px

  // Typography semantic tokens
  --arch-font-size-caption: #{$font-size-xs};
  --arch-font-size-body-sm: #{$font-size-sm};
  --arch-font-size-body: #{$font-size-base};
  --arch-font-size-body-lg: #{$font-size-lg};
  --arch-font-size-heading-sm: #{$font-size-xl};
  --arch-font-size-heading-md: #{$font-size-2xl};
  --arch-font-size-heading-lg: #{$font-size-3xl};
  --arch-font-size-heading-xl: #{$font-size-4xl};

  --arch-line-height-caption: #{$line-height-normal};
  --arch-line-height-body: #{$line-height-relaxed};
  --arch-line-height-heading: #{$line-height-tight};

  // Border radius
  --arch-border-radius-sm: 4px;
  --arch-border-radius-md: 8px;
  --arch-border-radius-lg: 12px;
  --arch-border-radius-pill: 999px;

  // Shadows
  --arch-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --arch-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --arch-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --arch-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

### Layer 3: Component Tokens (Specific/Local)
Component-scoped tokens that reference semantic tokens, providing the highest level of specificity.

```scss
// _components.scss - Component-specific tokens
:root {
  // Button component tokens
  --arch-button-background: var(--arch-interactive-primary);
  --arch-button-background-hover: var(--arch-interactive-primary-hover);
  --arch-button-background-active: var(--arch-interactive-primary-active);
  --arch-button-text-color: var(--arch-text-inverse);
  --arch-button-border-radius: var(--arch-border-radius-md);
  --arch-button-padding-x: var(--arch-space-component-gap-md);
  --arch-button-padding-y: var(--arch-space-component-gap-sm);
  --arch-button-font-size: var(--arch-font-size-body);
  --arch-button-line-height: var(--arch-line-height-body);
  --arch-button-shadow: var(--arch-shadow-sm);
  --arch-button-shadow-hover: var(--arch-shadow-md);

  // Property Card component tokens
  --arch-property-card-background: var(--arch-surface-elevated);
  --arch-property-card-border: var(--arch-border-subtle);
  --arch-property-card-border-radius: var(--arch-border-radius-lg);
  --arch-property-card-padding: var(--arch-space-component-gap-lg);
  --arch-property-card-gap: var(--arch-space-component-gap-md);
  --arch-property-card-shadow: var(--arch-shadow-sm);
  --arch-property-card-shadow-hover: var(--arch-shadow-lg);
  --arch-property-card-title-color: var(--arch-text-primary);
  --arch-property-card-title-size: var(--arch-font-size-heading-sm);
  --arch-property-card-description-color: var(--arch-text-secondary);
  --arch-property-card-price-color: var(--arch-interactive-primary);
  --arch-property-card-price-size: var(--arch-font-size-body-lg);

  // Navigation component tokens
  --arch-nav-background: var(--arch-surface-primary);
  --arch-nav-border-bottom: var(--arch-border-default);
  --arch-nav-link-color: var(--arch-text-primary);
  --arch-nav-link-color-hover: var(--arch-interactive-primary);
  --arch-nav-link-color-active: var(--arch-interactive-primary);
  --arch-nav-padding-x: var(--arch-space-section-gap-md);
  --arch-nav-padding-y: var(--arch-space-component-gap-md);
  --arch-nav-gap: var(--arch-space-component-gap-lg);

  // Form component tokens
  --arch-input-background: var(--arch-surface-elevated);
  --arch-input-border: var(--arch-border-default);
  --arch-input-border-focus: var(--arch-border-focus);
  --arch-input-border-error: var(--arch-border-error);
  --arch-input-border-radius: var(--arch-border-radius-md);
  --arch-input-padding-x: var(--arch-space-component-gap-md);
  --arch-input-padding-y: var(--arch-space-component-gap-sm);
  --arch-input-font-size: var(--arch-font-size-body);
  --arch-input-line-height: var(--arch-line-height-body);
  --arch-input-shadow-focus: 0 0 0 3px rgba(var(--arch-interactive-primary-rgb), 0.1);

  // Status indicator tokens
  --arch-status-available-color: var(--arch-status-success);
  --arch-status-available-background: var(--arch-status-success-subtle);
  --arch-status-sold-color: var(--arch-status-error);
  --arch-status-sold-background: var(--arch-status-error-subtle);
  --arch-status-pending-color: var(--arch-status-warning);
  --arch-status-pending-background: var(--arch-status-warning-subtle);
}
```

## TypeScript Token Interfaces

### Token Type Definitions

```typescript
// Design token type definitions
interface IColorToken {
  readonly value: string;
  readonly description?: string;
  readonly category: 'palette' | 'semantic' | 'component';
}

interface ISpacingToken {
  readonly value: string;
  readonly px: number;
  readonly description?: string;
  readonly category: 'palette' | 'semantic' | 'component';
}

interface ITypographyToken {
  readonly fontSize: string;
  readonly lineHeight: string;
  readonly fontWeight?: string;
  readonly fontFamily?: string;
  readonly description?: string;
  readonly category: 'palette' | 'semantic' | 'component';
}

// Complete token system interface
interface IDesignTokens {
  readonly colors: {
    readonly palette: Record<string, IColorToken>;
    readonly semantic: Record<string, IColorToken>;
    readonly component: Record<string, IColorToken>;
  };
  readonly spacing: {
    readonly palette: Record<string, ISpacingToken>;
    readonly semantic: Record<string, ISpacingToken>;
    readonly component: Record<string, ISpacingToken>;
  };
  readonly typography: {
    readonly palette: Record<string, ITypographyToken>;
    readonly semantic: Record<string, ITypographyToken>;
    readonly component: Record<string, ITypographyToken>;
  };
  readonly borderRadius: Record<string, ISpacingToken>;
  readonly shadows: Record<string, IColorToken>;
}
```

### Token Service Implementation

```typescript
@Injectable({
  providedIn: 'root'
})
export class DesignTokenService {
  private readonly tokens: IDesignTokens = {
    colors: {
      palette: {
        grey50: { value: '#fafafa', category: 'palette' },
        grey100: { value: '#f5f5f5', category: 'palette' },
        blue600: { value: '#1e88e6', category: 'palette' },
        // ... all palette colors
      },
      semantic: {
        surfacePrimary: { value: 'var(--arch-surface-primary)', category: 'semantic' },
        textPrimary: { value: 'var(--arch-text-primary)', category: 'semantic' },
        interactivePrimary: { value: 'var(--arch-interactive-primary)', category: 'semantic' },
        // ... all semantic colors
      },
      component: {
        buttonBackground: { value: 'var(--arch-button-background)', category: 'component' },
        propertyCardBackground: { value: 'var(--arch-property-card-background)', category: 'component' },
        // ... all component colors
      }
    },
    // ... spacing, typography, etc.
  };

  // Get token value with type safety
  getColorToken = (category: 'palette' | 'semantic' | 'component', name: string): string => {
    const token = this.tokens.colors[category][name];
    if (!token) {
      throw new Error(`Color token not found: ${category}.${name}`);
    }
    return token.value;
  };

  getSpacingToken = (category: 'palette' | 'semantic' | 'component', name: string): string => {
    const token = this.tokens.spacing[category][name];
    if (!token) {
      throw new Error(`Spacing token not found: ${category}.${name}`);
    }
    return token.value;
  };

  // Get all tokens for a category
  getTokensByCategory = <T extends keyof IDesignTokens>(
    tokenType: T,
    category: 'palette' | 'semantic' | 'component'
  ): Record<string, IDesignTokens[T][keyof IDesignTokens[T]][string]> => {
    return this.tokens[tokenType][category];
  };

  // Token validation
  validateTokenUsage = (tokenPath: string): boolean => {
    const [tokenType, category, name] = tokenPath.split('.');
    return !!(this.tokens as any)[tokenType]?.[category]?.[name];
  };
}
```

## Angular Implementation Patterns

### Component Token Usage

```typescript
@Component({
  selector: 'app-property-card',
  template: `
    <article class="property-card" [class.featured]="featured()">
      <div class="property-image">
        <img [src]="property().thumbnailImage" [alt]="property().displayName">
        @if (property().isNewListing) {
          <span class="new-badge">New</span>
        }
      </div>

      <div class="property-content">
        <h3 class="property-title">{{ property().displayName }}</h3>
        <p class="property-address">{{ property().formattedAddress }}</p>
        <div class="property-price">{{ property().priceDisplay }}</div>

        <div class="property-metrics">
          <span class="metric">
            <span class="metric-label">ROI:</span>
            <span class="metric-value">{{ property().roiDisplay }}</span>
          </span>
          <span class="metric">
            <span class="metric-label">Yield:</span>
            <span class="metric-value">{{ property().yieldDisplay }}</span>
          </span>
        </div>
      </div>
    </article>
  `,
  styleUrls: ['./property-card.component.scss'],
  host: {
    '[style.--local-featured-border]': 'featured() ? "var(--arch-interactive-primary)" : "transparent"'
  }
})
export class PropertyCardComponent {
  property = input.required<IPropertyViewModel>();
  featured = input<boolean>(false);

  private readonly tokenService = inject(DesignTokenService);

  // Example of programmatic token usage
  ngOnInit(): void {
    // Validate token usage during development
    if (!this.tokenService.validateTokenUsage('colors.component.propertyCardBackground')) {
      console.warn('Invalid token usage in PropertyCardComponent');
    }
  }
}
```

### Component Styles with Tokens

```scss
// property-card.component.scss
.property-card {
  background: var(--arch-property-card-background);
  border: 1px solid var(--arch-property-card-border);
  border-radius: var(--arch-property-card-border-radius);
  padding: var(--arch-property-card-padding);
  box-shadow: var(--arch-property-card-shadow);
  transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;

  &:hover {
    box-shadow: var(--arch-property-card-shadow-hover);
  }

  &.featured {
    border-color: var(--local-featured-border);
    box-shadow: var(--arch-property-card-shadow-hover);
  }

  .property-image {
    border-radius: var(--arch-border-radius-md);
    margin-bottom: var(--arch-property-card-gap);
    position: relative;

    img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: inherit;
    }

    .new-badge {
      position: absolute;
      top: var(--arch-space-component-gap-sm);
      right: var(--arch-space-component-gap-sm);
      background: var(--arch-status-success);
      color: var(--arch-text-inverse);
      padding: var(--arch-space-component-gap-xs) var(--arch-space-component-gap-sm);
      border-radius: var(--arch-border-radius-pill);
      font-size: var(--arch-font-size-caption);
      font-weight: 600;
    }
  }

  .property-content {
    display: flex;
    flex-direction: column;
    gap: var(--arch-property-card-gap);
  }

  .property-title {
    font-size: var(--arch-property-card-title-size);
    color: var(--arch-property-card-title-color);
    font-weight: 600;
    margin: 0;
  }

  .property-address {
    color: var(--arch-property-card-description-color);
    font-size: var(--arch-font-size-body-sm);
    margin: 0;
  }

  .property-price {
    color: var(--arch-property-card-price-color);
    font-size: var(--arch-property-card-price-size);
    font-weight: 700;
  }

  .property-metrics {
    display: flex;
    gap: var(--arch-space-component-gap-md);

    .metric {
      display: flex;
      flex-direction: column;
      gap: var(--arch-space-component-gap-xs);

      .metric-label {
        font-size: var(--arch-font-size-caption);
        color: var(--arch-text-subtle);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .metric-value {
        font-size: var(--arch-font-size-body);
        font-weight: 600;
        color: var(--arch-text-primary);
      }
    }
  }
}
```

## Theming and Customization

### Theme Configuration Service

```typescript
interface IThemeConfig {
  readonly name: string;
  readonly tokens: Partial<IDesignTokens>;
  readonly cssProperties: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly currentTheme = signal<string>('default');

  private readonly themes: Record<string, IThemeConfig> = {
    default: {
      name: 'Default Theme',
      tokens: {}, // Uses default tokens
      cssProperties: {}
    },
    luxury: {
      name: 'Luxury Theme',
      tokens: {},
      cssProperties: {
        '--arch-interactive-primary': '#d4af37', // Gold
        '--arch-interactive-primary-hover': '#b8941f',
        '--arch-border-radius-md': '12px',
        '--arch-property-card-shadow': '0 8px 32px rgba(0, 0, 0, 0.12)',
      }
    },
    minimal: {
      name: 'Minimal Theme',
      tokens: {},
      cssProperties: {
        '--arch-border-radius-md': '2px',
        '--arch-property-card-shadow': 'none',
        '--arch-border-default': '#e0e0e0',
      }
    }
  };

  // Apply theme
  applyTheme = (themeName: string): void => {
    const theme = this.themes[themeName];
    if (!theme) {
      console.error(`Theme not found: ${themeName}`);
      return;
    }

    const root = this.document.documentElement;

    // Apply CSS properties
    Object.entries(theme.cssProperties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    this.currentTheme.set(themeName);
  };

  // Get available themes
  getAvailableThemes = (): IThemeConfig[] => {
    return Object.values(this.themes);
  };

  // Get current theme
  getCurrentTheme = computed(() => this.currentTheme());
}
```

## Token Generation and Automation

### Design Token Build Process

```typescript
// scripts/build-tokens.ts
interface ITokenSource {
  colors: Record<string, any>;
  spacing: Record<string, any>;
  typography: Record<string, any>;
}

const generateScssTokens = (tokens: ITokenSource): string => {
  let scss = '// Generated design tokens - DO NOT EDIT MANUALLY\n\n';

  // Generate palette variables
  scss += '// Palette tokens\n';
  Object.entries(tokens.colors.palette || {}).forEach(([name, token]) => {
    scss += `$${kebabCase(name)}: ${token.value};\n`;
  });

  scss += '\n// CSS Custom Properties\n:root {\n';

  // Generate semantic tokens
  Object.entries(tokens.colors.semantic || {}).forEach(([name, token]) => {
    scss += `  --arch-${kebabCase(name)}: ${token.value};\n`;
  });

  scss += '}\n';
  return scss;
};

const generateTypeScriptTokens = (tokens: ITokenSource): string => {
  return `// Generated design tokens - DO NOT EDIT MANUALLY
export const DESIGN_TOKENS = ${JSON.stringify(tokens, null, 2)} as const;

export type DesignTokens = typeof DESIGN_TOKENS;
`;
};

// Build process
const buildTokens = async (): Promise<void> => {
  const tokens = await loadTokensFromSource(); // Load from Figma, JSON, etc.

  // Generate SCSS
  const scssContent = generateScssTokens(tokens);
  await writeFile('./src/assets/styles/tokens/_generated.scss', scssContent);

  // Generate TypeScript
  const tsContent = generateTypeScriptTokens(tokens);
  await writeFile('./src/app/shared/tokens/generated-tokens.ts', tsContent);

  console.log('Design tokens generated successfully!');
};
```

## Testing Token Systems

### Token Usage Validation

```typescript
describe('Design Token System', () => {
  let tokenService: DesignTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DesignTokenService]
    });
    tokenService = TestBed.inject(DesignTokenService);
  });

  it('should provide all required color tokens', () => {
    const requiredTokens = [
      'colors.semantic.surfacePrimary',
      'colors.semantic.textPrimary',
      'colors.semantic.interactivePrimary',
      'colors.component.buttonBackground'
    ];

    requiredTokens.forEach(token => {
      expect(tokenService.validateTokenUsage(token)).toBe(true);
    });
  });

  it('should throw error for invalid tokens', () => {
    expect(() => {
      tokenService.getColorToken('semantic', 'nonExistentToken');
    }).toThrow('Color token not found: semantic.nonExistentToken');
  });
});

// Visual regression testing for token consistency
describe('Token Visual Consistency', () => {
  it('should maintain consistent spacing scale', () => {
    const spacingTokens = ['space-1', 'space-2', 'space-4', 'space-8'];
    const values = spacingTokens.map(token =>
      parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue(`--arch-${token}`))
    );

    // Verify 4px base and consistent scaling
    expect(values[0]).toBe(4);   // space-1 = 4px
    expect(values[1]).toBe(8);   // space-2 = 8px
    expect(values[2]).toBe(16);  // space-4 = 16px
    expect(values[3]).toBe(32);  // space-8 = 32px
  });
});
```

## Brad Frost's Token Principles Applied

### 1. Atomic Foundation
Design tokens serve as the **subatomic** foundation - the raw materials that feed into atoms, molecules, and organisms in the component hierarchy.

### 2. Systematic Consistency
Following Brad's methodology, tokens create **systematic consistency** across the entire design system, ensuring that every component speaks the same design language.

### 3. Scalable Architecture
The 3-layer approach provides **flexibility without chaos** - teams can customize component tokens without breaking the semantic foundation.

### 4. Developer-Designer Collaboration
Tokens create a **shared vocabulary** between designers and developers, reducing miscommunication and ensuring design fidelity.

## Migration Strategy

### From Hard-coded Values to Token System

```scss
// BEFORE: Hard-coded values (incorrect)
.property-card {
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  color: #333333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

// AFTER: Token-based (correct)
.property-card {
  background: var(--arch-property-card-background);
  padding: var(--arch-property-card-padding);
  border-radius: var(--arch-property-card-border-radius);
  color: var(--arch-property-card-title-color);
  box-shadow: var(--arch-property-card-shadow);
}
```

### Gradual Token Adoption

1. **Phase 1**: Implement palette tokens (colors, spacing, typography scales)
2. **Phase 2**: Add semantic tokens for common use cases
3. **Phase 3**: Create component tokens for complex components
4. **Phase 4**: Integrate theming and customization capabilities

## Key Takeaways

1. **Brad Frost's Evolution**: Tokens are the "subatomic" foundation of atomic design
2. **3-Layer Architecture**: Palette → Semantic → Component provides optimal flexibility
3. **Constitutional Compliance**: Algorithmic design with centralized token management
4. **Type Safety**: Strict TypeScript interfaces for all token usage
5. **Systematic Naming**: Consistent naming conventions across all token layers
6. **Theming Support**: Built-in support for multiple themes and customization
7. **Build Integration**: Automated token generation and validation processes
8. **Testing**: Comprehensive testing for token consistency and usage

This design token system ensures Archland.hu maintains consistent, scalable, and maintainable design while following Brad Frost's proven atomic design methodology and modern best practices.