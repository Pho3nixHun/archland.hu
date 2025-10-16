import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    ReactiveFormsModule,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';

export interface IContactFormVM {
    readonly titleKey: string;
    readonly subtitleKey: string;
    readonly form: {
        readonly nameKey: string;
        readonly emailKey: string;
        readonly phoneKey: string;
        readonly messageKey: string;
        readonly sendKey: string;
    };
    readonly loading: boolean;
}

export interface IContactFormData {
    readonly name: string;
    readonly email: string;
    readonly phone: string;
    readonly message: string;
}

const requiredValidator: ValidatorFn = control => Validators.required(control);
const emailValidator: ValidatorFn = control => Validators.email(control);
const minLengthValidator = (minimumLength: number): ValidatorFn => {
    const validator = Validators.minLength(minimumLength);
    return control => validator(control);
};

@Component({
    selector: 'app-contact-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslocoDirective],
    template: `
        <section class="contact-form" [attr.aria-labelledby]="'contact-title'">
            <div class="container" *transloco="let t">
                <div class="contact-form__header">
                    <h2 id="contact-title" class="contact-form__title">
                        {{ t(vm().titleKey) }}
                    </h2>
                    <p class="contact-form__subtitle">
                        {{ t(vm().subtitleKey) }}
                    </p>
                </div>

                <form
                    [formGroup]="contactForm"
                    (ngSubmit)="onSubmit()"
                    class="contact-form__form"
                    novalidate
                >
                    <div class="contact-form__field">
                        <label for="contact-name" class="contact-form__label">
                            {{ t(vm().form.nameKey) }} *
                        </label>
                        <input
                            id="contact-name"
                            type="text"
                            formControlName="name"
                            class="contact-form__input"
                            [class.contact-form__input--error]="
                                isFieldInvalid('name')
                            "
                            [attr.aria-describedby]="
                                isFieldInvalid('name') ? 'name-error' : null
                            "
                            required
                        />
                        @if (isFieldInvalid('name')) {
                            <div
                                id="name-error"
                                class="contact-form__error"
                                role="alert"
                            >
                                A név megadása kötelező.
                            </div>
                        }
                    </div>

                    <div class="contact-form__field">
                        <label for="contact-email" class="contact-form__label">
                            {{ t(vm().form.emailKey) }} *
                        </label>
                        <input
                            id="contact-email"
                            type="email"
                            formControlName="email"
                            class="contact-form__input"
                            [class.contact-form__input--error]="
                                isFieldInvalid('email')
                            "
                            [attr.aria-describedby]="
                                isFieldInvalid('email') ? 'email-error' : null
                            "
                            required
                        />
                        @if (isFieldInvalid('email')) {
                            <div
                                id="email-error"
                                class="contact-form__error"
                                role="alert"
                            >
                                Érvényes e-mail cím megadása kötelező.
                            </div>
                        }
                    </div>

                    <div class="contact-form__field">
                        <label for="contact-phone" class="contact-form__label">
                            {{ t(vm().form.phoneKey) }}
                        </label>
                        <input
                            id="contact-phone"
                            type="tel"
                            formControlName="phone"
                            class="contact-form__input"
                        />
                    </div>

                    <div class="contact-form__field">
                        <label
                            for="contact-message"
                            class="contact-form__label"
                        >
                            {{ t(vm().form.messageKey) }} *
                        </label>
                        <textarea
                            id="contact-message"
                            formControlName="message"
                            class="contact-form__textarea"
                            [class.contact-form__textarea--error]="
                                isFieldInvalid('message')
                            "
                            [attr.aria-describedby]="
                                isFieldInvalid('message')
                                    ? 'message-error'
                                    : null
                            "
                            rows="5"
                            required
                        ></textarea>
                        @if (isFieldInvalid('message')) {
                            <div
                                id="message-error"
                                class="contact-form__error"
                                role="alert"
                            >
                                Az üzenet megadása kötelező.
                            </div>
                        }
                    </div>

                    <button
                        type="submit"
                        class="contact-form__submit"
                        [disabled]="vm().loading || contactForm.invalid"
                        [attr.aria-label]="
                            t(vm().form.sendKey) + ' kapcsolati üzenet'
                        "
                    >
                        {{ vm().loading ? 'Küldés...' : t(vm().form.sendKey) }}
                    </button>
                </form>
            </div>
        </section>
    `,
    styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent {
    vm = input.required<IContactFormVM>();
    formSubmit = output<IContactFormData>();

    private readonly formBuilder = inject(FormBuilder);

    readonly contactForm = this.formBuilder.group({
        name: this.formBuilder.nonNullable.control('', [
            requiredValidator,
            minLengthValidator(2),
        ]),
        email: this.formBuilder.nonNullable.control('', [
            requiredValidator,
            emailValidator,
        ]),
        phone: this.formBuilder.nonNullable.control(''),
        message: this.formBuilder.nonNullable.control('', [
            requiredValidator,
            minLengthValidator(10),
        ]),
    });

    readonly isFieldInvalid = (fieldName: string): boolean => {
        const field = this.contactForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    };

    readonly onSubmit = (): void => {
        if (this.contactForm.valid) {
            const formValue = this.contactForm.getRawValue();
            this.formSubmit.emit(formValue);
        }
    };
}
