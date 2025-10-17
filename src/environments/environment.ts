import json from './environment.json';

export interface Environment {
    readonly production: boolean;
    readonly contactFormAccessKey: string;
}

export const environment: Environment = {
    production: json.production,
    contactFormAccessKey: json.contactFormAccessKey,
};
