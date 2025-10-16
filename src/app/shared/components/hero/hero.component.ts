import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

export interface IHeroVM {
    readonly titleKey: string;
    readonly subtitleKey: string;
    readonly descriptionKey: string;
    readonly ctaTextKey: string;
    readonly ctaUrl: string;
    readonly backgroundVariant: 'primary' | 'secondary';
    readonly showSecondCta: boolean;
    readonly secondCtaTextKey?: string;
    readonly secondCtaUrl?: string;
    readonly backgroundImage?: string;
}

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule, TranslocoDirective],
    template: `
        <section
            class="hero"
            [class.hero--secondary]="vm().backgroundVariant === 'secondary'"
            [class.hero--with-image]="!!vm().backgroundImage"
            [style.background-image]="
                vm().backgroundImage
                    ? 'url(' + vm().backgroundImage + ')'
                    : null
            "
            role="banner"
            [attr.aria-labelledby]="ariaLabelledBy()"
        >
            @if (vm().backgroundImage) {
                <div class="hero__overlay"></div>
            }
            <div class="container" *transloco="let t">
                <div class="hero__content">
                    <h1 class="hero__title" [id]="ariaLabelledBy()">
                        {{ t(vm().titleKey) }}
                    </h1>

                    <h2 class="hero__subtitle">
                        {{ t(vm().subtitleKey) }}
                    </h2>

                    <p class="hero__description">
                        {{ t(vm().descriptionKey) }}
                    </p>

                    <div class="hero__actions">
                        <a
                            [href]="vm().ctaUrl"
                            class="hero__cta hero__cta--primary"
                            [attr.aria-label]="
                                t(vm().ctaTextKey) + ' - ' + t(vm().titleKey)
                            "
                        >
                            {{ t(vm().ctaTextKey) }}
                        </a>

                        @if (vm().showSecondCta && vm().secondCtaUrl) {
                            @if (vm().secondCtaTextKey; as secondCtaTextKey) {
                                <a
                                    [href]="vm().secondCtaUrl"
                                    class="hero__cta hero__cta--secondary"
                                    [attr.aria-label]="
                                        t(secondCtaTextKey) +
                                        ' - ' +
                                        t(vm().titleKey)
                                    "
                                >
                                    {{ t(secondCtaTextKey) }}
                                </a>
                            }
                        }
                    </div>
                </div>
            </div>
        </section>
    `,
    styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
    vm = input.required<IHeroVM>();

    readonly ariaLabelledBy = computed(
        () => `hero-title-${Math.random().toString(36).substr(2, 9)}`
    );
}
