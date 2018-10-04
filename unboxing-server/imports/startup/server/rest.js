import { Challenges, Gestures, Sequences } from '../../collections/';
import hash from 'object-hash'

async function getEverything(req, res) {  
  const challenges = await Challenges.find().fetch();
  const sequences = await Sequences.find().fetch();
  const gestures = await Gestures.find().fetch();

  const collections = {
    challenges,
    sequences,
    gestures
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