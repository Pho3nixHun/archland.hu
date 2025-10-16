import { Component, computed, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
    HeaderComponent,
    IHeaderVM,
} from './shared/components/header/header.component';
import {
    FooterComponent,
    IFooterVM,
} from './shared/components/footer/footer.component';
import { RouterStore } from './core/stores/router.store';
import { TranslocoStore } from './core/stores/transloco.store';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class AppComponent {
    protected readonly title = signal('Archland Kft.');
    readonly isMobileMenuOpen = signal(false);
    private readonly routerStore = inject(RouterStore);
    protected readonly translocoStore = inject(TranslocoStore);

    readonly headerVM = computed((): IHeaderVM => {
        const currentRoute = this.routerStore.currentUrl();
        const currentSection = this.routerStore.fragment();
        const isHomePage = currentRoute === '/';
        const isProjectsPage = currentRoute.startsWith('/projects');

        return {
            currentLanguage: this.translocoStore.currentLanguage(),
            languageItems: this.translocoStore.languageItems().map(lang => ({
                id: lang.id,
                labelKey: `header.languages.${lang.id}.label`,
                ariaLabelKey: `header.languages.${lang.id}.ariaLabel`,
                isActive: lang.isActive,
            })),
            navigationAriaLabelKey: 'header.navigation.ariaLabel',
            mobileMenuAriaLabelKey: 'header.navigation.mobileMenuAriaLabel',
            companyNameKey: 'header.companyName',
            navigationItems: [
                {
                    labelKey: 'header.navigation.home',
                    route: '/',
                    isActive: isHomePage && currentSection === 'home',
                },
                {
                    labelKey: 'header.navigation.about',
                    route: '/',
                    fragment: 'about',
                    isActive: isHomePage && currentSection === 'about',
                },
                {
                    labelKey: 'header.navigation.projects',
                    route: '/projects',
                    isActive:
                        isProjectsPage ||
                        (isHomePage && currentSection === 'projects'),
                },
                {
                    labelKey: 'header.navigation.contact',
                    route: '/',
                    fragment: 'contact',
                    isActive: isHomePage && currentSection === 'contact',
                },
            ],
        };
    });

    readonly footerVM = computed(
        (): IFooterVM => ({
            companyName: 'Archland Kft.',
            descriptionKey: 'footer.description',
            phone: '+36309558370',
            email: 'info@archland.hu',
            sitemapTitleKey: 'footer.sitemap',
            socialsTitleKey: 'footer.socials',
            facebookUrl: 'https://www.facebook.com/ujlakasokhajduszoboszlo/',
            sitemapLinks: [
                { textKey: 'navigation.home', url: '#home' },
                { textKey: 'navigation.about', url: '#about' },
                { textKey: 'navigation.projects', url: '#projects' },
                { textKey: 'navigation.contact', url: '#contact' },
            ],
        })
    );

    // Event handlers following constitutional patterns
    readonly onMobileMenuToggle = (): void => {
        this.isMobileMenuOpen.update(open => !open);
    };

    readonly onMobileMenuClose = (): void => {
        this.isMobileMenuOpen.set(false);
    };

    readonly onLanguageSwitch = (lang: string): void => {
        this.translocoStore.setLanguage(lang);
    };
}
