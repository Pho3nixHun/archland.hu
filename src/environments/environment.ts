export interface Environment {
    readonly production: boolean;
    readonly contactFormAccessKey: string;
}

export const environment: Environment = {
    production: import.meta.env.PROD,
    contactFormAccessKey: import.meta.env.NG_APP_CONTACT_FORM_ACCESS_KEY ?? '',
};
