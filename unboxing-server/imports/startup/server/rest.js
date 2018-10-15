import { Meteor } from 'meteor/meteor'

import { Challenges, Gestures, Sequences, Files } from '../../collections/';
import objectHash from 'object-hash'

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

  const hash = objectHash(collections)
  const version = hash.substr(0,5)

  Meteor.call('logEvent', 'get everything', { version, client: req.header('x-forwarded-for') || req.connection.remoteAddress})

  res.status(200).json({ 
    version,
    hash,
    collections
  });

}

function getTime(req, res) {
  console.log("getTime");
  const t = Date.now();
  res.status(200).json({ 
    time: t
  });
}

async function addGesture(req, res) {
  await Meteor.call('addGesture', req.body)
  res.status(200).json({ 
    status: "ok"
  });
}

export {
  getEverything,
  getTime,
  addGesture
}