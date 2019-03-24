import { Challenges, Gestures, Sequences, Files, Translations, Places, Walks } from '../../collections/';

const importExportConfig = {
  path: "/unboxing_data.json",
  collections: {
    challenges: Challenges,
    sequences: Sequences,
    gestures: Gestures,
    files: Files,
    places: Places,
    walks: Walks
  }
}

const importExportConfigTranslationsOnly = {
  path: "/unboxing_translations.json",
  collections: {
    translations: Translations
  }
}

export { importExportConfig, importExportConfigTranslationsOnly }