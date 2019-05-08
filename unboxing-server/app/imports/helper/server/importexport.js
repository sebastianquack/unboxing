import { Challenges, Installations, Gestures, Sequences, Files, Translations, Places, Walks, Servers } from '../../collections/';

const importExportConfig = {
  path: "/unboxing_data.json",
  collections: {
    challenges: Challenges,
    sequences: Sequences,
    gestures: Gestures,
    files: Files,
    places: Places,
    walks: Walks,
    servers: Servers,
    installations: Installations
  }
}

const importExportConfigTranslationsOnly = {
  path: "/unboxing_translations.json",
  collections: {
    translations: Translations
  }
}

export { importExportConfig, importExportConfigTranslationsOnly }