import {
    Component,
    computed,
    effect,
    inject,
    input,
    output,
    signal,
    OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoService } from '@jsverse/transloco';

export interface IImageCarouselImage {
    readonly url: string;
    readonly altKey: string;
}

export interface IImageCarouselVM {
    readonly images: readonly IImageCarouselImage[];
    readonly isOpen: boolean;
    readonly currentIndex: number;
    readonly showThumbnails: boolean;
}

@Component({
    selector: 'app-image-carousel',
    standalone: true,
    imports: [CommonModule],
    template: `
        @if (vm().isOpen) {
            <div
                class="carousel-overlay"
                (click)="onOverlayClick($event)"
                role="dialog"
                aria-modal="true"
                [attr.aria-label]="ariaLabel()"
                [attr.aria-describedby]="'carousel-image-' + vm().currentIndex"
            >
                <div class="carousel-container">
                    <!-- Close Button -->
                    <button
                        class="carousel-close"
                        (click)="onClose()"
                        [attr.aria-label]="closeLabel()"
                        type="button"
                    >
                        ✕
                    </button>

                    <!-- Main Image -->
                    <div class="carousel-main">
                        @if (vm().images.length > 1) {
                            <button
                                class="carousel-nav carousel-nav--prev"
                                (click)="onPrevious()"
                                [disabled]="vm().currentIndex === 0"
                                [attr.aria-label]="previousLabel()"
                                type="button"
                            >
                                ←
                            </button>
                        }

                        <div class="carousel-image-container">
                            <img
                                [src]="currentImage().url"
                                [alt]="currentImageAlt()"
                                [id]="'carousel-image-' + vm().currentIndex"
                                class="carousel-image"
                                loading="eager"
                            />
                        </div>

                        @if (vm().images.length > 1) {
                            <button
                                class="carousel-nav carousel-nav--next"
                                (click)="onNext()"
                                [disabled]="
                                    vm().currentIndex === vm().images.length - 1
                                "
                                [attr.aria-label]="nextLabel()"
                                type="button"
                            >
                                →
                            </button>
                        }
                    </div>

                    <!-- Image Counter -->
                    @if (vm().images.length > 1) {
                        <div class="carousel-counter">
                            {{
                                counterLabel(
                                    vm().currentIndex + 1,
                                    vm().images.length
                                )
                            }}
                        </div>
                    }

                    <!-- Thumbnails -->
                    @if (vm().showThumbnails && vm().images.length > 1) {
                        <div class="carousel-thumbnails">
                            @for (
                                image of vm().images;
                                track image.url;
                                let i = $index
                            ) {
                                <button
                                    class="carousel-thumbnail"
                                    [class.carousel-thumbnail--active]="
                                        i === vm().currentIndex
                                    "
                                    (click)="onThumbnailClick(i)"
                                    [attr.aria-label]="thumbnailLabel(i + 1)"
                                    type="button"
                                >
                                    <img
                                        [src]="image.url"
                                        [alt]="thumbnailAlt(image.altKey)"
                                        class="carousel-thumbnail-image"
                                        loading="lazy"
                                    />
                                </button>
                            }
                        </div>
                    }
                </div>
            </div>
        }
    `,
    styleUrls: ['./image-carousel.component.scss'],
})
export class ImageCarouselComponent implements OnDestroy {
    private readonly transloco = inject(TranslocoService);

    readonly images = input.required<readonly IImageCarouselImage[]>();
    readonly isOpen = input.required<boolean>();
    readonly initialIndex = input<number>(0);
    readonly showThumbnails = input<boolean>(true);

    readonly close = output<void>();
    readonly imageChange = output<number>();

    private readonly currentIndex = signal(0);

    readonly vm = computed(
        (): IImageCarouselVM => ({
            images: this.images(),
            isOpen: this.isOpen(),
            currentIndex: this.currentIndex(),
            showThumbnails: this.showThumbnails(),
        })
    );

    readonly currentImage = computed(() => {
        const images = this.vm().images;
        const index = this.vm().currentIndex;
        return images[index] || images[0];
    });

    readonly ariaLabel = computed((): string =>
        this.transloco.translate('carousel.ariaLabel')
    );

    readonly closeLabel = computed((): string =>
        this.transloco.translate('carousel.close')
    );

    readonly previousLabel = computed((): string =>
        this.transloco.translate('carousel.previous')
    );

    readonly nextLabel = computed((): string =>
        this.transloco.translate('carousel.next')
    );

    readonly currentImageAlt = computed((): string =>
        this.transloco.translate(this.currentImage().altKey)
    );

    readonly counterLabel = (current: number, total: number): string =>
        this.transloco.translate('carousel.counter', {
            current,
            total,
        });

    readonly thumbnailLabel = (index: number): string =>
        this.transloco.translate('carousel.thumbnail', { index });

    readonly thumbnailAlt = (altKey: string): string =>
        this.transloco.translate(altKey);

    constructor() {
        // Reset index when carousel opens or images change
        effect(() => {
            if (this.isOpen()) {
                this.currentIndex.set(this.initialIndex());
            }
        });

        // Handle keyboard navigation and body scroll lock
        effect(() => {
            if (this.vm().isOpen) {
                // Store original overflow value
                const originalOverflow = document.body.style.overflow;

                const handleKeydown = (event: KeyboardEvent): void => {
                    switch (event.key) {
                        case 'Escape':
                            this.onClose();
                            break;
                        case 'ArrowLeft':
                            event.preventDefault();
                            this.onPrevious();
                            break;
                        case 'ArrowRight':
                            event.preventDefault();
                            this.onNext();
                            break;
                    }
                };

                document.addEventListener('keydown', handleKeydown);
                document.body.style.overflow = 'hidden';

                return () => {
                    document.removeEventListener('keydown', handleKeydown);
                    // Restore original overflow value
                    document.body.style.overflow = originalOverflow || '';
                };
            } else {
                // Ensure scroll is restored when closed
                document.body.style.overflow = '';
            }
            return undefined;
        });
    }

    readonly onClose = (): void => {
        this.close.emit();
    };

    readonly onPrevious = (): void => {
        const currentIdx = this.currentIndex();
        if (currentIdx > 0) {
            const newIndex = currentIdx - 1;
            this.currentIndex.set(newIndex);
            this.imageChange.emit(newIndex);
        }
    };

    readonly onNext = (): void => {
        const currentIdx = this.currentIndex();
        const maxIdx = this.vm().images.length - 1;
        if (currentIdx < maxIdx) {
            const newIndex = currentIdx + 1;
            this.currentIndex.set(newIndex);
            this.imageChange.emit(newIndex);
        }
    };

    readonly onThumbnailClick = (index: number): void => {
        this.currentIndex.set(index);
        this.imageChange.emit(index);
    };

    readonly onOverlayClick = (event: Event): void => {
        if (event.target === event.currentTarget) {
            this.onClose();
        }
    };

    ngOnDestroy(): void {
        // Ensure body scroll is restored when component is destroyed
        document.body.style.overflow = '';
    }
}
