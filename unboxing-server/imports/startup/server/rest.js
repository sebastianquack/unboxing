import { Challenges, Gestures, Sequences, Files } from '../../collections/';
import hash from 'object-hash'

async function getEverything(req, res) {  
  const challenges = await Challenges.find().fetch();
  const sequences = await Sequences.find().fetch();
  const gestures = await Gestures.find().fetch();
  const files = await Files.find().fetch();

  const collections = {
    challenges,
    sequences,
    gestures,
    files
  }

  const version = hash(collections)

  res.status(200).json({ 
    version,
    collections
  });
}

export {
  getEverything
}