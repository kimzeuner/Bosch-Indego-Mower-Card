import en from "./translations/en.json";
import de from "./translations/de.json";

const TRANSLATIONS = {
  en,
  de
};

export function getTranslations(hass) {
  const lang = hass?.language || "en";
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

export function t(translations, key) {
  return key
    .split(".")
    .reduce((obj, part) => obj?.[part], translations) || key;
}
