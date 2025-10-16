import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

export interface IFooterVM {
    readonly companyName: string;
    readonly descriptionKey: string;
    readonly phone: string;
    readonly email: string;
    readonly sitemapTitleKey: string;
    readonly socialsTitleKey: string;
    readonly facebookUrl: string;
    readonly sitemapLinks: ReadonlyArray<{
        readonly textKey: string;
        readonly url: string;
    }>;
}

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule, TranslocoDirective],
    template: `
        <footer class="footer" role="contentinfo">
            <div class="container" *transloco="let t">
                <div class="footer__content">
                    <div class="footer__company">
                        <h3 class="footer__company-name">
                            {{ vm().companyName }}
                        </h3>
                        <p class="footer__description">
                            {{ t(vm().descriptionKey) }}
                        </p>
                        <div class="footer__contact">
                            <a
                                [href]="'tel:' + vm().phone"
                                class="footer__contact-link"
                                [attr.aria-label]="'Telefon: ' + vm().phone"
                            >
                                {{ vm().phone }}
                            </a>
                            <a
                                [href]="'mailto:' + vm().email"
                                class="footer__contact-link"
                                [attr.aria-label]="'E-mail: ' + vm().email"
                            >
                                {{ vm().email }}
                            </a>
                        </div>
                    </div>

                    <div class="footer__sitemap">
                        <h4 class="footer__section-title">
                            {{ t(vm().sitemapTitleKey) }}
                        </h4>
                        <nav
                            class="footer__nav"
                            [attr.aria-label]="t(vm().sitemapTitleKey)"
                        >
                            <ul class="footer__nav-list">
                                @for (
                                    link of vm().sitemapLinks;
                                    track link.url
                                ) {
                                    <li class="footer__nav-item">
                                        <a
                                            [href]="link.url"
                                            class="footer__nav-link"
                                        >
                                            {{ t(link.textKey) }}
                                        </a>
                                    </li>
                                }
                            </ul>
                        </nav>
                    </div>

                    <div class="footer__socials">
                        <h4 class="footer__section-title">
                            {{ t(vm().socialsTitleKey) }}
                        </h4>
                        <a
                            [href]="vm().facebookUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="footer__social-link"
                            aria-label="Facebook oldal (új ablakban nyílik meg)"
                        >
                            Facebook
                        </a>
                    </div>
                </div>

                <div class="footer__copyright">
                    <p>
                        &copy; {{ currentYear }} {{ vm().companyName }}. Minden
                        jog fenntartva.
                    </p>
                </div>
            </div>
        </footer>
    `,
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
    vm = input.required<IFooterVM>();

    readonly currentYear = new Date().getFullYear();
}
