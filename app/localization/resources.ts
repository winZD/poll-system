import english from './locales/en.json';
import croatian from './locales/hr.json';

const languages = ['en', 'hr'] as const;

export const supportedLangages = [...languages];

type Language = (typeof languages)[number];

export type Resource = { common: typeof english };

export const resources: Record<Language, Resource> = {
  en: {
    common: english,
  },
  hr: {
    common: croatian,
  },
};
