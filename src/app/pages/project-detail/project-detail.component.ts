import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import {
    ImageCarouselComponent,
    IImageCarouselImage,
} from '../../shared/components/image-carousel/image-carousel.component';

interface IProjectDetailImage {
    readonly url: string;
    readonly altKey: string;
}

interface IProjectDetailStats {
    readonly apartments?: number;
    readonly floors?: number;
    readonly energyRatingKey?: string;
    readonly completionYear?: number;
}

export interface IProjectDetailVM {
    readonly project: {
        readonly id: string;
        readonly titleKey: string;
        readonly descriptionKey: string;
        readonly fullDescriptionKey: string;
        readonly images: readonly IProjectDetailImage[];
        readonly features: readonly string[];
        readonly stats: IProjectDetailStats;
    };
}

@Component({
    selector: 'app-project-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        TranslocoDirective,
        ImageCarouselComponent,
    ],
    template: `
        <div class="project-detail" *transloco="let t">
            <!-- Back Navigation -->
            <nav class="project-detail__nav">
                <div class="container">
                    <a routerLink="/projects" class="project-detail__back-link">
                        ← {{ t('navigation.projects') }}
                    </a>
                </div>
            </nav>

            <!-- Project Header -->
            <section class="project-detail__header">
                <div class="container">
                    <h1 class="project-detail__title">
                        {{ t(projectVM().project.titleKey) }}
                    </h1>
                    <p class="project-detail__subtitle">
                        {{ t(projectVM().project.descriptionKey) }}
                    </p>
                </div>
            </section>

            <!-- Project Gallery -->
            <section class="project-detail__gallery">
                <div class="container">
                    <div class="gallery">
                        @for (
                            image of projectVM().project.images;
                            track trackByUrl($index, image);
                            let i = $index
                        ) {
                            <img
                                [src]="image.url"
                                [alt]="t(image.altKey)"
                                class="gallery__image gallery__image--clickable"
                                loading="lazy"
                                (click)="onImageClick(i)"
                                (keydown.enter)="onImageClick(i)"
                                (keydown.space)="onImageClick(i)"
                                tabindex="0"
                                [attr.aria-label]="
                                    'Open image ' + (i + 1) + ' in gallery view'
                                "
                                role="button"
                            />
                        }
                    </div>
                </div>
            </section>

            <!-- Project Details -->
            <section class="project-detail__content">
                <div class="container">
                    <div class="project-detail__grid">
                        <div class="project-detail__description">
                            <h2>Projekt részletei</h2>
                            <div class="project-detail__text">
                                {{ t(projectVM().project.fullDescriptionKey) }}
                            </div>
                            @if (projectVM().project.features.length) {
                                <ul class="project-detail__features">
                                    @for (
                                        featureKey of projectVM().project
                                            .features;
                                        track featureKey
                                    ) {
                                        <li>{{ t(featureKey) }}</li>
                                    }
                                </ul>
                            }
                        </div>

                        <div class="project-detail__stats">
                            <h3>Kulcsadatok</h3>
                            <div class="stats">
                                @if (projectVM().project.stats.apartments) {
                                    <div class="stats__item">
                                        <span class="stats__label"
                                            >Lakások száma:</span
                                        >
                                        <span class="stats__value">{{
                                            projectVM().project.stats.apartments
                                        }}</span>
                                    </div>
                                }
                                @if (projectVM().project.stats.floors) {
                                    <div class="stats__item">
                                        <span class="stats__label"
                                            >Szintek száma:</span
                                        >
                                        <span class="stats__value">{{
                                            projectVM().project.stats.floors
                                        }}</span>
                                    </div>
                                }
                                @if (
                                    projectVM().project.stats.energyRatingKey;
                                    as energyRatingKey
                                ) {
                                    <div class="stats__item">
                                        <span class="stats__label"
                                            >Energetikai besorolás:</span
                                        >
                                        <span class="stats__value">{{
                                            t(energyRatingKey)
                                        }}</span>
                                    </div>
                                }
                                @if (projectVM().project.stats.completionYear) {
                                    <div class="stats__item">
                                        <span class="stats__label"
                                            >Befejezés éve:</span
                                        >
                                        <span class="stats__value">{{
                                            projectVM().project.stats
                                                .completionYear
                                        }}</span>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Image Carousel -->
            <app-image-carousel
                [images]="carouselImages()"
                [isOpen]="isCarouselOpen()"
                [initialIndex]="carouselInitialIndex()"
                [showThumbnails]="true"
                (close)="onCarouselClose()"
                (imageChange)="onCarouselImageChange($event)"
            />
        </div>
    `,
    styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent {
    constructor(private route: ActivatedRoute) {}

    private projectId = computed(
        () => this.route.snapshot.paramMap.get('id') || 'homewell'
    );

    // Carousel state
    private readonly isCarouselOpenSignal = signal(false);
    private readonly carouselInitialIndexSignal = signal(0);

    readonly projectVM = computed((): IProjectDetailVM => {
        const id = this.projectId();

        // Mock data - in real app, this would come from a service
        const projects: Record<string, IProjectDetailVM['project']> = {
            homewell: {
                id: 'homewell',
                titleKey: 'projects.homewell.title',
                descriptionKey: 'projects.homewell.description',
                fullDescriptionKey: 'projects.homewell.fullDescription',
                images: [
                    {
                        url: '/homewell-3D-utcai-3.png',
                        altKey: 'projects.homewell.images.gallery.exterior',
                    },
                    {
                        url: '/homewell-03.jpg',
                        altKey: 'projects.homewell.images.gallery.construction',
                    },
                    {
                        url: '/home-well-07.jpg',
                        altKey: 'projects.homewell.images.gallery.interior',
                    },
                    {
                        url: '/HOMEWELL-6-lakas.jpg',
                        altKey: 'projects.homewell.images.gallery.floorplan',
                    },
                ],
                features: [
                    'projects.homewell.features.geothermal',
                    'projects.homewell.features.solar',
                    'projects.homewell.features.energyClass',
                ],
                stats: {
                    apartments: 8,
                    floors: 3,
                    energyRatingKey: 'projects.homewell.stats.energyRating',
                    completionYear: 2025,
                },
            },
            'casa-aquila': {
                id: 'casa-aquila',
                titleKey: 'projects.casaAquila.title',
                descriptionKey: 'projects.casaAquila.description',
                fullDescriptionKey: 'projects.casaAquila.fullDescription',
                images: [
                    {
                        url: '/casa-aquila-homlokzat.jpg',
                        altKey: 'projects.casaAquila.images.gallery.exterior',
                    },
                    {
                        url: '/casa_0000_LS25_04.jpg',
                        altKey: 'projects.casaAquila.images.gallery.detail',
                    },
                    {
                        url: '/casa_0001_IMG_20250528_101914.jpg',
                        altKey: 'projects.casaAquila.images.gallery.construction',
                    },
                    {
                        url: '/casa_0002_IMG_20250528_101728.jpg',
                        altKey: 'projects.casaAquila.images.gallery.structure',
                    },
                ],
                features: [
                    'projects.casaAquila.features.zeroEnergy',
                    'projects.casaAquila.features.geothermal',
                    'projects.casaAquila.features.ledLighting',
                ],
                stats: {
                    apartments: 8,
                    floors: 3,
                    energyRatingKey: 'projects.casaAquila.stats.energyRating',
                    completionYear: 2024,
                },
            },
            'gold-residence': {
                id: 'gold-residence',
                titleKey: 'projects.goldResidence.title',
                descriptionKey: 'projects.goldResidence.description',
                fullDescriptionKey: 'projects.goldResidence.description',
                images: [
                    {
                        url: '/gold-residence-utcai-bejarat.jpg',
                        altKey: 'projects.goldResidence.images.gallery.exterior',
                    },
                    {
                        url: '/gold-residence-kert-es-terasz.jpg',
                        altKey: 'projects.goldResidence.images.gallery.garden',
                    },
                ],
                features: [
                    'projects.goldResidence.features.zeroEnergy',
                    'projects.goldResidence.features.twentyFlats',
                    'projects.goldResidence.features.closeToSpa',
                ],
                stats: {
                    apartments: 20,
                    floors: 3,
                    energyRatingKey:
                        'projects.goldResidence.stats.energyRating',
                    completionYear: 2022,
                },
            },
            'oasis-residence': {
                id: 'oasis-residence',
                titleKey: 'projects.oasisResidence.title',
                descriptionKey: 'projects.oasisResidence.description',
                fullDescriptionKey: 'projects.oasisResidence.description',
                images: [
                    {
                        url: '/oasis_0009_Szurmai-1-B-epulet-esti.jpg',
                        altKey: 'projects.oasisResidence.images.gallery.exterior',
                    },
                    {
                        url: '/oasis_0000_Szurmai-10-belso-2.jpg',
                        altKey: 'projects.oasisResidence.images.gallery.interior',
                    },
                    {
                        url: '/oasis_0001_Szurmai-9-belso-1.jpg',
                        altKey: 'projects.oasisResidence.images.gallery.courtyard',
                    },
                    {
                        url: '/oasis-medence-3d.jpg',
                        altKey: 'projects.oasisResidence.images.gallery.pool',
                    },
                ],
                features: [
                    'projects.oasisResidence.features.thirtyFlats',
                    'projects.oasisResidence.features.pool',
                    'projects.oasisResidence.features.closeToSpa',
                ],
                stats: {
                    apartments: 30,
                    floors: 3,
                    energyRatingKey:
                        'projects.oasisResidence.stats.energyRating',
                    completionYear: 2021,
                },
            },
            'hogyes-16': {
                id: 'hogyes-16',
                titleKey: 'projects.hogyes16.title',
                descriptionKey: 'projects.hogyes16.description',
                fullDescriptionKey: 'projects.hogyes16.description',
                images: [
                    {
                        url: '/hogyes_0000_IMG_20250528_0945161.jpg',
                        altKey: 'projects.hogyes16.images.gallery.exterior',
                    },
                    {
                        url: '/hogyes_0001_IMG_20250528_0944381.jpg',
                        altKey: 'projects.hogyes16.images.gallery.detail',
                    },
                    {
                        url: '/hogyes_0002_IMG_20250528_0944111.jpg',
                        altKey: 'projects.hogyes16.images.gallery.facade',
                    },
                ],
                features: [
                    'projects.hogyes16.features.tenFlats',
                    'projects.hogyes16.features.cityCenter',
                    'projects.hogyes16.features.heatPump',
                ],
                stats: {
                    apartments: 10,
                    floors: 3,
                    energyRatingKey: 'projects.hogyes16.stats.energyRating',
                    completionYear: 2020,
                },
            },
        };

        return {
            project: projects[id] || projects['homewell'],
        };
    });

    // Carousel computed properties
    readonly carouselImages = computed((): readonly IImageCarouselImage[] =>
        this.projectVM().project.images.map(image => ({
            url: image.url,
            altKey: image.altKey,
        }))
    );

    readonly isCarouselOpen = computed(() => this.isCarouselOpenSignal());
    readonly carouselInitialIndex = computed(() =>
        this.carouselInitialIndexSignal()
    );

    // Event handlers
    readonly onImageClick = (index: number): void => {
        this.carouselInitialIndexSignal.set(index);
        this.isCarouselOpenSignal.set(true);
    };

    readonly onCarouselClose = (): void => {
        this.isCarouselOpenSignal.set(false);
    };

    readonly onCarouselImageChange = (index: number): void => {
        this.carouselInitialIndexSignal.set(index);
    };

    readonly trackByUrl = (
        index: number,
        item: { url: string; altKey: string }
    ): string => item.url;
}
