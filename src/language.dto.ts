/**
 * The languages the app's screens are written in, as ISO 639-1 codes.
 * A new one needs its dictionary on the frontend (`src/app/i18n/`).
 */
export const INTERFACE_LANGUAGES = ['en', 'uk'] as const;

/** A language the app's screens are written in. */
export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];

/**
 * The languages places are shown in: their names, and the About texts
 * written or translated for them. ISO 639-1 codes.
 */
export const CONTENT_LANGUAGES = ['en', 'uk'] as const;

/** A language places are shown in. */
export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number];

/** The language used when none was chosen, or the one asked for isn't offered. */
export const DEFAULT_LANGUAGE = 'en' satisfies InterfaceLanguage & ContentLanguage;

/**
 * The header the frontend's server sends with every call to
 * cotraveller-back: the content language the traveller reads places in.
 * Names and About texts are answered in it; a background job (an export)
 * keeps the one it was asked in.
 */
export const CONTENT_LANGUAGE_HEADER = 'x-content-language';

/** Whether `value` is one of the interface languages. */
export function isInterfaceLanguage(value: unknown): value is InterfaceLanguage {
  return (INTERFACE_LANGUAGES as readonly unknown[]).includes(value);
}

/** Whether `value` is one of the content languages. */
export function isContentLanguage(value: unknown): value is ContentLanguage {
  return (CONTENT_LANGUAGES as readonly unknown[]).includes(value);
}
