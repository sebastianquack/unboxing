import { Meteor } from 'meteor/meteor'

import { Challenges, Gestures, Sequences, Files, Walks, Places } from '../../collections/';
import objectHash from 'object-hash'
import { importExportConfig } from '../../helper/server/importexport';

import cleanJSON from '../../helper/both/cleanJSON';

async function getEverything(req, res) {  
  const challenges = await Challenges.find().fetch();
  const sequences = await Sequences.find().fetch();
  const gestures = await Gestures.find().fetch();
  const files = await Files.find({},{sort: {path: 1}}).fetch();
  const places = await Places.find().fetch();
  let walks = await Walks.find().fetch();

  // clean json
  for(let i = 0; i < walks.length; i++) {
    walks[i].paths = cleanJSON(walks[i].paths);
  }

  const collections = {
    challenges,
    sequences,
    gestures,
    files,
    places,
    walks
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

// export all data
async function getDataJSON(req, res) {

  const collections = {}
  for (collection in importExportConfig.collections) {
    collections[collection] = await importExportConfig.collections[collection].find().fetch();
  }

  res.status(200).json(collections);  
}

export {
  getEverything,
  getTime,
  addGesture,
  getDataJSON
}