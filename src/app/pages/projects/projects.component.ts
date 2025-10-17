import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import {
    PropertyCardComponent,
    IPropertyCardVM,
} from '../../shared/components/property-card/property-card.component';

export interface IProject {
    readonly id: string;
    readonly titleKey: string;
    readonly descriptionKey: string;
    readonly statusKey?: string;
    readonly statusMessageKey?: string;
    readonly images: ReadonlyArray<{
        readonly url: string;
        readonly alt: string;
    }>;
    readonly variant: 'default' | 'featured' | 'sold';
    readonly completionYear?: number;
    readonly apartmentCount?: number;
}

@Component({
    selector: 'app-projects',
    standalone: true,
    imports: [CommonModule, TranslocoDirective, PropertyCardComponent],
    template: `
        <div class="projects-page" *transloco="let t">
            <!-- Page Header -->
            <section class="projects-header">
                <div class="container">
                    <h1 class="projects-header__title">
                        {{ t('navigation.projects') }}
                    </h1>
                    <p class="projects-header__subtitle">
                        {{ t('articles.projects.title') }}
                    </p>
                </div>
            </section>

            <!-- Current Projects -->
            <section class="projects-section">
                <div class="container">
                    <h2 class="projects-section__title">Legújabb projektünk</h2>
                    <div class="projects-section__grid">
                        @for (
                            project of currentProjectsVM();
                            track project.id
                        ) {
                            <app-property-card
                                [vm]="project"
                                (cardClick)="onProjectClick($event)"
                            />
                        }
                    </div>
                </div>
            </section>

            <!-- Completed Projects -->
            <section class="projects-section projects-section--completed">
                <div class="container">
                    <h2 class="projects-section__title">
                        Befejezett projektjeink
                    </h2>
                    <div class="projects-section__grid">
                        @for (
                            project of completedProjectsVM();
                            track project.id
                        ) {
                            <app-property-card
                                [vm]="project"
                                (cardClick)="onProjectClick($event)"
                            />
                        }
                    </div>
                </div>
            </section>
        </div>
    `,
    styleUrls: ['./projects.component.scss'],
})
export class ProjectsComponent {
    constructor(private router: Router) {}
    readonly currentProjectsVM = computed((): readonly IPropertyCardVM[] => [
        {
            id: 'homewell',
            titleKey: 'projects.homewell.title',
            descriptionKey: 'projects.homewell.description',
            statusKey: 'projects.homewell.status',
            statusMessageKey: 'projects.homewell.statusMessage',
            imageUrl: 'assets/images/homewell-3D-utcai-3.webp',
            imageAltKey: 'projects.homewell.images.cardAlt',
            ctaTextKey: 'projects.actions.viewDetails',
            variant: 'featured',
        },
    ]);

    readonly completedProjectsVM = computed((): readonly IPropertyCardVM[] => [
        {
            id: 'casa-aquila',
            titleKey: 'projects.casaAquila.title',
            descriptionKey: 'projects.casaAquila.description',
            imageUrl: 'assets/images/casa-aquila-homlokzat.webp',
            imageAltKey: 'projects.casaAquila.images.cardAlt',
            ctaTextKey: 'projects.actions.viewDetails',
            variant: 'default',
        },
        {
            id: 'gold-residence',
            titleKey: 'projects.goldResidence.title',
            descriptionKey: 'projects.goldResidence.description',
            imageUrl: 'assets/images/gold-residence-utcai-bejarat.webp',
            imageAltKey: 'projects.goldResidence.images.cardAlt',
            ctaTextKey: 'projects.actions.viewDetails',
            variant: 'default',
        },
        {
            id: 'oasis-residence',
            titleKey: 'projects.oasisResidence.title',
            descriptionKey: 'projects.oasisResidence.description',
            imageUrl: 'assets/images/oasis_0009_Szurmai-1-B-epulet-esti.webp',
            imageAltKey: 'projects.oasisResidence.images.cardAlt',
            ctaTextKey: 'projects.actions.viewDetails',
            variant: 'default',
        },
        {
            id: 'hogyes-16',
            titleKey: 'projects.hogyes16.title',
            descriptionKey: 'projects.hogyes16.description',
            imageUrl: 'assets/images/hogyes_0000_IMG_20250528_0945161.webp',
            imageAltKey: 'projects.hogyes16.images.cardAlt',
            ctaTextKey: 'projects.actions.viewDetails',
            variant: 'default',
        },
    ]);

    readonly onProjectClick = (projectId: string): void => {
        console.log('Navigate to project detail:', projectId);
        void this.router.navigate(['/projects', projectId]);
    };
}
