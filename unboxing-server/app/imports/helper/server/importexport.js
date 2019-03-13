import { Challenges, Gestures, Sequences, Files } from '../../collections/';

const importExportConfig = {
  path: "/unboxing_data.json",
  collections: {
    challenges: Challenges,
    sequences: Sequences,
    gestures: Gestures,
    files: Files,
  }
}

export { importExportConfig }