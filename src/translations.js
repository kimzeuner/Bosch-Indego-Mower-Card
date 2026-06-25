import en from "./translations/en.json";
import de from "./translations/de.json";

const TRANSLATIONS = { en, de };

export function getTranslations(hass) {
  const language = hass?.language || "en";
  const baseLanguage = language.split("-")[0];
  return TRANSLATIONS[language] || TRANSLATIONS[baseLanguage] || TRANSLATIONS.en;
}

export function t(translations, key) {
  return key.split(".").reduce((obj, part) => obj?.[part], translations) || key;
}
