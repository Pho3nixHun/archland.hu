import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

import {
    HeroComponent,
    IHeroVM,
} from '../../shared/components/hero/hero.component';
import {
    AboutSectionComponent,
    IAboutSectionVM,
} from '../../shared/components/about-section/about-section.component';
import {
    PropertyCardComponent,
    IPropertyCardVM,
} from '../../shared/components/property-card/property-card.component';
import {
    ContactFormComponent,
    IContactFormVM,
    IContactFormData,
} from '../../shared/components/contact-form/contact-form.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        TranslocoDirective,
        HeroComponent,
        AboutSectionComponent,
        PropertyCardComponent,
        ContactFormComponent,
    ],
    template: `
        <div class="home" *transloco="let t">
            <!-- Hero Section -->
            <section id="home">
                <app-hero [vm]="heroVM()" />
            </section>

            <!-- About Section -->
            <section id="about">
                <app-about-section [vm]="aboutVM()" />
            </section>

            <!-- Second Hero Section -->
            <app-hero [vm]="hero2VM()" />

            <!-- Featured Projects Section -->
            <section id="projects" class="featured-projects-section">
                <div class="container">
                    <h2 class="featured-projects-section__title">
                        {{ t('articles.projects.title') }}
                    </h2>
                    <div class="featured-projects-section__grid">
                        @for (
                            project of featuredProjectsVM();
                            track project.id
                        ) {
                            <app-property-card
                                [vm]="project"
                                [routerLink]="['/projects', project.id]"
                            />
                        }
                    </div>
                    <div class="featured-projects-section__cta">
                        <a
                            routerLink="/projects"
                            class="featured-projects-section__view-all"
                        >
                            {{ t('navigation.projects') }} →
                        </a>
                    </div>
                </div>
            </section>

            <!-- Energy Efficient Article -->
            <section class="article-section">
                <div class="container">
                    <article class="article">
                        <h2 class="article__title">
                            {{ t('articles.energyEfficient.title') }}
                        </h2>
                        <h3 class="article__subtitle">
                            {{ t('articles.energyEfficient.subtitle') }}
                        </h3>
                        <div class="article__content">
                            {{ t('articles.energyEfficient.content') }}
                        </div>
                    </article>
                </div>
            </section>

            <!-- Contact Section -->
            <section id="contact">
                <app-contact-form
                    [vm]="contactVM()"
                    (formSubmit)="onContactFormSubmit($event)"
                />
            </section>
        </div>
    `,
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    // View Models following constitutional patterns
    readonly heroVM = computed(
        (): IHeroVM => ({
            titleKey: 'hero.title',
            subtitleKey: 'hero.subtitle',
            descriptionKey: 'hero.description',
            ctaTextKey: 'hero.cta',
            ctaUrl: '#about',
            backgroundVariant: 'primary',
            showSecondCta: false,
            backgroundImage: 'assets/images/homewell-3D-utcai-3.webp',
        })
    );

    readonly hero2VM = computed(
        (): IHeroVM => ({
            titleKey: 'hero2.title',
            subtitleKey: 'hero2.subtitle',
            descriptionKey: 'hero.cta2',
            ctaTextKey: 'hero.cta2',
            ctaUrl: '#contact',
            backgroundVariant: 'secondary',
            showSecondCta: false,
        })
    );

    readonly aboutVM = computed(
        (): IAboutSectionVM => ({
            titleKey: 'about.title',
            missionTitleKey: 'about.mission.title',
            missionDescriptionKey: 'about.mission.description',
            missionCommitmentKey: 'about.mission.commitment',
            missionMottoKey: 'about.mission.motto',
            historyTitleKey: 'about.history.title',
            historyContentKey: 'about.history.content',
        })
    );

    readonly featuredProjectsVM = computed((): readonly IPropertyCardVM[] => [
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
        {
            id: 'casa-aquila',
            titleKey: 'projects.casaAquila.title',
            descriptionKey: 'projects.casaAquila.description',
            imageUrl: 'assets/images/casa-aquila-homlokzat.webp',
            imageAltKey: 'projects.casaAquila.images.cardAlt',
            ctaTextKey: 'projects.actions.viewDetails',
            variant: 'default',
        },
    ]);

    readonly contactVM = computed(
        (): IContactFormVM => ({
            titleKey: 'contact.title',
            subtitleKey: 'contact.subtitle',
            form: {
                nameKey: 'contact.form.name',
                emailKey: 'contact.form.email',
                phoneKey: 'contact.form.phone',
                messageKey: 'contact.form.message',
                sendKey: 'contact.form.send',
            },
            loading: false,
        })
    );

    readonly onContactFormSubmit = (formData: IContactFormData): void => {
        console.log('Contact form submitted:', formData);
        // TODO: Send contact form data to backend
    };
}
