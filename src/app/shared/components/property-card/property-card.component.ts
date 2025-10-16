import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

export interface IPropertyCardVM {
    readonly id: string;
    readonly titleKey: string;
    readonly descriptionKey: string;
    readonly statusKey?: string;
    readonly statusMessageKey?: string;
    readonly imageUrl?: string;
    readonly imageAltKey?: string;
    readonly ctaTextKey: string;
    readonly variant: 'default' | 'featured' | 'sold';
}

@Component({
    selector: 'app-property-card',
    standalone: true,
    imports: [CommonModule, TranslocoDirective],
    template: `
        <article
            class="property-card"
            [class.property-card--featured]="vm().variant === 'featured'"
            [class.property-card--sold]="vm().variant === 'sold'"
            [attr.aria-labelledby]="'property-title-' + vm().id"
        >
            <div class="property-card__content" *transloco="let t">
                @if (vm().imageUrl; as imageUrl) {
                    <div class="property-card__image-container">
                        <img
                            [src]="imageUrl"
                            [alt]="t(vm().imageAltKey ?? vm().titleKey)"
                            class="property-card__image"
                            loading="lazy"
                        />
                        @if (vm().statusKey; as statusKey) {
                            <div class="property-card__status">
                                {{ t(statusKey) }}
                            </div>
                        }
                    </div>
                }

                <div class="property-card__info">
                    <h3
                        class="property-card__title"
                        [id]="'property-title-' + vm().id"
                    >
                        {{ t(vm().titleKey) }}
                    </h3>

                    <p class="property-card__description">
                        {{ t(vm().descriptionKey) }}
                    </p>

                    @if (vm().statusMessageKey; as statusMessageKey) {
                        <div class="property-card__status-message">
                            {{ t(statusMessageKey) }}
                        </div>
                    }

                    <button
                        type="button"
                        class="property-card__cta"
                        (click)="cardClick.emit(vm().id)"
                        [attr.aria-label]="
                            t(vm().ctaTextKey) + ' - ' + t(vm().titleKey)
                        "
                    >
                        {{ t(vm().ctaTextKey) }}
                    </button>
                </div>
            </div>
        </article>
    `,
    styleUrls: ['./property-card.component.scss'],
})
export class PropertyCardComponent {
    vm = input.required<IPropertyCardVM>();
    cardClick = output<string>();
}
