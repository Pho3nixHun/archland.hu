import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

export interface IHeaderVM {
    readonly logo?: {
        readonly url: string;
        readonly altKey: string;
        readonly ariaLabel: string;
    };
    readonly companyNameKey: string;
    readonly navigationAriaLabelKey: string;
    readonly mobileMenuAriaLabelKey: string;
    readonly navigationItems: ReadonlyArray<{
        readonly labelKey: string;
        readonly route: string | string[];
        readonly fragment?: string;
        readonly isActive?: boolean;
    }>;
    readonly currentLanguage: string;
    readonly languageItems: ReadonlyArray<{
        readonly id: string;
        readonly labelKey: string;
        readonly ariaLabelKey: string;
        readonly isActive?: boolean;
    }>;
}

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslocoDirective],
    template: `
        <header class="header" role="banner" *transloco="let t">
            <nav
                class="header__nav container"
                [attr.aria-label]="t(vm().navigationAriaLabelKey)"
            >
                <div class="header__brand">
                    @let logo = vm().logo;
                    @if (logo) {
                        <a
                            routerLink="/"
                            class="header__logo-link"
                            [attr.aria-label]="t(logo.ariaLabel)"
                        >
                            <img
                                [src]="logo.url"
                                [alt]="t(logo.altKey)"
                                class="header__logo"
                            />
                            <span class="header__company-name">
                                {{ t(vm().companyNameKey) }}
                            </span>
                        </a>
                    }
                </div>

                <!-- Mobile Menu Button -->
                <button
                    type="button"
                    class="header__mobile-toggle"
                    (click)="mobileMenuToggle.emit()"
                    [class.header__mobile-toggle--active]="isMobileMenuOpen()"
                    [attr.aria-expanded]="isMobileMenuOpen()"
                    [attr.aria-label]="t(vm().mobileMenuAriaLabelKey)"
                >
                    <!-- TODO: Replace with SVG icon -->
                    <span class="header__hamburger"></span>
                    <span class="header__hamburger"></span>
                    <span class="header__hamburger"></span>
                </button>

                <!-- Desktop Language Switcher -->
                <div class="header__language-switcher">
                    @for (lang of vm().languageItems; track lang.id) {
                        <button
                            type="button"
                            class="header__lang-button"
                            (click)="languageSwitch.emit(lang.id)"
                            [class.header__lang-button--active]="lang.isActive"
                            [attr.aria-label]="t(lang.ariaLabelKey)"
                        >
                            {{ t(lang.labelKey) }}
                        </button>
                    }
                </div>

                <!-- Desktop Navigation -->
                <div
                    class="header__menu"
                    [class.header__menu--open]="isMobileMenuOpen()"
                    *transloco="let t"
                >
                    <ul class="header__nav-list" role="list">
                        @for (item of navigationItems(); track item.id) {
                            <li class="header__nav-item">
                                <a
                                    [routerLink]="item.route"
                                    [fragment]="item.fragment"
                                    class="header__nav-link"
                                    [class.header__nav-link--active]="
                                        item.isActive
                                    "
                                    [attr.aria-current]="
                                        item.isActive ? 'page' : null
                                    "
                                    (click)="mobileMenuClose.emit()"
                                >
                                    {{ t(item.labelKey) }}
                                </a>
                            </li>
                        }
                    </ul>

                    <!-- Language Switcher in Mobile Menu (duplicate for mobile) -->
                    <div
                        class="header__language-switcher header__language-switcher--mobile"
                    >
                        @for (lang of vm().languageItems; track lang.id) {
                            <button
                                type="button"
                                class="header__lang-button"
                                (click)="languageSwitch.emit(lang.id)"
                                [class.header__lang-button--active]="
                                    lang.isActive
                                "
                                [attr.aria-label]="t(lang.ariaLabelKey)"
                            >
                                {{ t(lang.labelKey) }}
                            </button>
                        }
                    </div>
                </div>
            </nav>
        </header>
    `,
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    vm = input.required<IHeaderVM>();
    navigationItems = computed(() => {
        return this.vm().navigationItems.map((item, i) => ({
            ...item,
            id: `nav-item-${i}`,
            isActive: item.isActive ?? false,
        }));
    });
    isMobileMenuOpen = input<boolean>(false);

    mobileMenuToggle = output<void>();
    mobileMenuClose = output<void>();
    languageSwitch = output<string>();

    private readonly router = inject(Router);

    readonly onAnchorClick = (event: Event, _route: string): void => {
        event.preventDefault();
        // Navigate to home page
        void this.router.navigate(['/']);
    };
}
