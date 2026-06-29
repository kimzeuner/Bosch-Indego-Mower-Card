const modules = import.meta.glob("./translations/*.json", {
  eager: true,
  import: "default",
});

const TRANSLATIONS = {};

for (const [path, translations] of Object.entries(modules)) {
  const language = path.match(/([a-z]{2})\.json$/)[1];
  TRANSLATIONS[language] = translations;
}

export function getTranslations(hass) {
  const language = hass?.language || "en";
  const baseLanguage = language.split("-")[0];

  return (
    TRANSLATIONS[language] ||
    TRANSLATIONS[baseLanguage] ||
    TRANSLATIONS.en
  );
}

export function t(translations, key) {
  return (
    key.split(".").reduce((obj, part) => obj?.[part], translations) || key
  );
}
