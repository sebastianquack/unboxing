import { Meteor } from 'meteor/meteor'

import { Challenges, Websites, Gestures, Sequences, Files, Walks, Places, Translations, Servers, Installations } from '../../collections/';
import objectHash from 'object-hash'
import { importExportConfig, importExportConfigTranslationsOnly } from '../../helper/server/importexport';
import { receiveFiles } from '../../helper/server/files';

import {cleanJSON} from '../../helper/both/cleanJSON';

let getEverythingCache = {
  collections: null,
  hash: "0",
  timestamp: 0,
  ttl: 10000,
}

let getEverythingWebCache = {
  collections: null,
  hash: "0",
  timestamp: 0,
  ttl: 10000,
}


async function getEverything(req, res) {  

  let collections = null
  let hash = null
  let fromCache = null

  if ( ((getEverythingCache.timestamp + getEverythingCache.ttl) > Date.now()) ) {
    collections = getEverythingCache.collections
    hash = getEverythingCache.hash
    fromCache = true
  } else {

    const challenges = Challenges.find().fetch();
    const sequences = Sequences.find().fetch();
    const gestures = Gestures.find().fetch();
    const files = Files.find({$or: [{noSync: false}, {noSync: {$exists: false}}]},{sort: {path: 1}}).fetch();
    const places = Places.find().fetch();
    const walks = Walks.find().fetch();
    const translations = Translations.find().fetch();
    const servers = Servers.find().fetch();
    const installations = Installations.find().fetch();
  
    // clean json
    for(let i = 0; i < walks.length; i++) {
      walks[i].paths = cleanJSON(walks[i].paths);
    }
  
    for(let i = 0; i < challenges.length; i++) {
      challenges[i].stages = cleanJSON(challenges[i].stages);  
    }
  
    for(let i = 0; i < installations.length; i++) {
      installations[i].deviceGroups = cleanJSON(installations[i].deviceGroups);  
    }
  
    collections = {
      challenges,
      sequences,
      gestures,
      files,
      places,
      walks,
      translations,
      servers,
      installations
    }

    hash = objectHash(collections)
    fromCache = false
  
    getEverythingCache.collections = collections
    getEverythingCache.timestamp = Date.now()
    getEverythingCache.hash = hash
  }

  const version = hash.substr(0,5)

  Meteor.call('logEvent', 'get everything', { version, client: req.header('x-forwarded-for') || req.connection.remoteAddress})

  res.status(200).json({ 
    version,
    hash,
    fromCache,
    collections
  });

}

async function getEverythingWeb(req, res) {  

  let data = null
  let hash = null
  let fromCache = null

  if ( ((getEverythingWebCache.timestamp + getEverythingWebCache.ttl) > Date.now()) ) {
    data = getEverythingWebCache.data
    hash = getEverythingWebCache.hash
    fromCache = true
  } else {

    const website = Websites.findOne();

    if(!website) {
      console.log("no website defined");
      res.status(404);
      return;
    }

    let menuContent = cleanJSON(website.menuContent);  

    try {
      menuContent = JSON.parse(menuContent)
    } 
    catch(e) {
      console.log(e)
      res.status(404);
      return;
    }
            
    // only send the challenges that are defined in the website
    let challenges = [];
    let split = website.challenges.replace("&nbsp;", "").split(" ");   
    for(let i = 0; i < split.length; i++) {
      split[i].trim();
      let challenge = Challenges.findOne({shorthand: split[i]});
      if(challenge) {
        challenge.sequence = Sequences.findOne({_id: challenge.sequence_id});
        let stages = cleanJSON(challenge.stages);  
        try {
          stages = JSON.parse(stages)
        } 
        catch(e) {
          console.log(e)
          res.status(404);
          return;
        }
        challenge.stages = stages;
        challenges.push(challenge);        
      }
    }
    
    const translations = Translations.find().fetch();
    
    data = {
      challenges,
      translations,
      menuContent
    }

    hash = objectHash(data)
    fromCache = false
  
    getEverythingWebCache.data = data
    getEverythingWebCache.timestamp = Date.now()
    getEverythingWebCache.hash = hash
  }

  const version = hash.substr(0,5)

  Meteor.call('logEvent', 'get everything web', { version, client: req.header('x-forwarded-for') || req.connection.remoteAddress})

  res.status(200).json({ 
    version,
    hash,
    fromCache,
    data
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

async function uploadFiles(req, res) {
  const file = receiveFiles(() => {
    //res.end(); //end the respone 
    res.status(200).json({ 
      status: "ok"
    });
  })
  req.pipe(file)
}

// export all data
async function getDataJSON(req, res) {

  const collections = {}
  for (collection in importExportConfig.collections) {
    collections[collection] = await importExportConfig.collections[collection].find().fetch();
  }

  res.status(200).json(collections);  
}

// export just translations
async function getTranslationsJSON(req, res) {

  const collections = {}
  for (collection in importExportConfigTranslationsOnly.collections) {
    collections[collection] = await importExportConfigTranslationsOnly.collections[collection].find().fetch();
  }

  res.status(200).json(collections);  
}


export {
  getEverything,
  getEverythingWeb,
  getTime,
  addGesture,
  uploadFiles,
  getDataJSON,
  getTranslationsJSON
}