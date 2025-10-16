import { Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

export interface IAboutSectionVM {
    readonly titleKey: string;
    readonly missionTitleKey: string;
    readonly missionDescriptionKey: string;
    readonly missionCommitmentKey: string;
    readonly missionMottoKey: string;
    readonly historyTitleKey: string;
    readonly historyContentKey: string;
}

@Component({
    selector: 'app-about-section',
    standalone: true,
    imports: [TranslocoDirective],
    template: `
        <section class="about-section" [attr.aria-labelledby]="'about-title'">
            <div class="container" *transloco="let t">
                <h2 id="about-title" class="about-section__title">
                    {{ t(vm().titleKey) }}
                </h2>

                <div class="about-section__content">
                    <div class="about-section__mission">
                        <h3 class="about-section__mission-title">
                            {{ t(vm().missionTitleKey) }}
                        </h3>

                        <p class="about-section__mission-description">
                            {{ t(vm().missionDescriptionKey) }}
                        </p>

                        <p class="about-section__mission-commitment">
                            {{ t(vm().missionCommitmentKey) }}
                        </p>

                        <blockquote class="about-section__motto">
                            {{ t(vm().missionMottoKey) }}
                        </blockquote>
                    </div>

                    <div class="about-section__history">
                        <h3 class="about-section__history-title">
                            {{ t(vm().historyTitleKey) }}
                        </h3>

                        <div class="about-section__history-content">
                            {{ t(vm().historyContentKey) }}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `,
    styleUrls: ['./about-section.component.scss'],
})
export class AboutSectionComponent {
    vm = input.required<IAboutSectionVM>();
}
