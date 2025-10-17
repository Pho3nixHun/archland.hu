interface ImportMetaEnv {
    readonly NG_APP_CONTACT_FORM_ACCESS_KEY?: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
