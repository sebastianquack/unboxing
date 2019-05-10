import { Meteor } from 'meteor/meteor';
import os from 'os';
import { Random } from 'meteor/random'

import Events from '../../collections/events';
import { Challenges, Gestures, Sequences, Devices } from '../../collections/';

import {importExportConfig, importExportConfigTranslationsOnly} from '../../helper/server/importexport'
import { updateFiles } from '../../helper/server/files';
import { sendMessage } from '../../startup/server/devices'
import { runAdb } from '../../startup/server/adb'

function createChallenge(uuid) {
  console.log("creating new challenge");
  let uuids = {};
  uuids[uuid] = "ready";
  let id = Challenges.insert({
    created_at: Date.now(),
    status: "idle",
    uuids: uuids
  });
  return Challenges.findOne(id);
}

Meteor.methods({
  'action'(data) {
    console.log(data);
    Events.insert({
      type: "button pressed",
      issued_at: Date.now(),
    	...data
    })
  },
  'logEvent'(type, data = {}) {
    console.log(data)
    Events.insert({
      type,
      issued_at: Date.now(),
    	data
    })
  },  
  'removeSequenceItem'(id) {
    console.log("remove sequence item", id)
    Sequences.update(
      { items: { $elemMatch: { _id: id } } },
      { $pull: { items: { _id: id } } }
    )
  },
  'updateSequenceItem'(id, $set) {
    const sequence = Sequences.find(
      { items: { $elemMatch: { _id: id } } },
      { items: { $elemMatch: { _id: id } } } // should return only the one item, but returns all
    ).fetch()[0]

    const sequence_id = sequence._id
    const item = sequence.items.filter( item => item._id === id )[0]

    Sequences.update(
      { 'items._id': id }, 
      { $set: { 'items.$': { ...item, ...$set} } }
    )

    Meteor.call('sortSequenceItems', sequence_id)
  },
  'addSequenceItem'(sequence_id) {
    Sequences.update(
      {_id: sequence_id},
      { $push: { items: { $each: [ {
        _id: Random.id(),
        name: "new item",
        startTime: 0,
        track: "default",
        path: "",
        //gesture_id: "",
        sensorModulation: "off",
        autoplay: "off",
        //sensorStart: true,
      } ], $sort: { startTime: 1 }, $slice: 1000 } } }
    );
  },
  'addSequenceItems'({items, sequence_id}) {
    for (let item of items) {
      if (!item.duration) {
        const file = Files.findOne({path: item.path})
        // console.log("duration", item, file)
        item.duration = file.duration
      }
      Sequences.update(
        {_id: sequence_id},
        { $push: { items: { $each: [ {
          _id: Random.id(),
          name: "new item",
          startTime: 0,
          track: "default",
          path: "",
          //gesture_id: "",
          sensorModulation: "off",
          autoplay: "off",
          //sensorStart: true,
          ...item,
        } ], $sort: { startTime: 1 }, $slice: 1000 } } }
      );
    }
  },
  'sortSequenceItems'(sequence_id) {
    Sequences.update(
      {_id: sequence_id},
      { $push: { items: { 
        $each: [], 
        $sort: { startTime: 1 },
        $slice: 1000
      } } }
    )
  }, 
  /*'setupChallenge'(uuid, value) {
    console.log("setupChallenge");
    let challenges = Challenges.find({}, {sort: { created_at: -1 }, limit: 1}).fetch();
    let challenge = null;

    // this is the first challenge ever
    if(challenges.length == 0) {
      if(value) {
        challenge = createChallenge(uuid);
      }
      return;
    } else {
      challenge = challenges[0];
    }

    // the current challenge is failed or completed or too old
    if(challenge.status != "idle" || challenge.created_at < Date.now() - 1000 * 60 * 5) {
      if(value) {
        challenge = createChallenge(uuid);   
      }
      return;
    }

    // check if uuid is in the challenge
    let uuids = challenge.uuids;
    if(uuids[uuid] && !value) {
      console.log("removing uuid from challenge");
      delete uuids[uuid]; // remove uuid from challenge
    }
    if(uuids[uuid] === undefined && value) {
      console.log("adding uuid to challenge");
      uuids[uuid] = "ready"; // add uuid to challenge
    }
    
    Challenges.update(challenge._id, {$set: {uuids: uuids}});
  },
  'attemptChallenge'(id, uuid) {
    let challenge = Challenges.findOne(id);
    if(!challenge) {
      console.log("challenge not found");
      return;
    }
    console.log("attemptChallenge");

    let retryInterval = 10000;

    // check if this is the first attempt for this challenge
    let attempts = Events.find({
      type: "challenge_attempt", 
      challenge_id: challenge._id,
      received_at: { $gt: Date.now() - retryInterval }
    }).fetch();
    console.log("found attempts: " + JSON.stringify(attempts));
    if(!attempts.length) {
      let targetTime = Date.now() + 3000; // scheduled playback on success
      challenge.targetTime = targetTime;
      Challenges.update(challenge._id, {$set: {status: "active", targetTime: targetTime}});      
      console.log("set challenge targetTime to " + challenge.targetTime);

      // todo - set timeout to check for failure
      Meteor.setTimeout(()=>{
        challenge = Challenges.findOne(id);
        if(challenge.status != "completed" && challenge.status != "failed") {

          // check if challenge is completed
          let newAttempts = Events.find({
            type: "challenge_attempt", 
            challenge_id: challenge._id,
            received_at: { $gt: Date.now() - retryInterval }
          }).fetch();
          
          if(Object.keys(challenge.uuids).length == newAttempts.length) {
            if(challenge.status != "completed") {
              console.log("setting challenge status to completed");
              Challenges.update(challenge._id, {$set: {status: "completed"}});  
            }
          } else {
            if(challenge.status != "failed") {
              console.log("setting challenge status to failed");
              Challenges.update(challenge._id, {$set: {status: "failed"}});            
            }
          }
          
        }

      }, 2000); // allowed reaction time
    } 

    let attemptCounter = attempts.length;

    // record attempt if user hasn't tried yet in the last 10 seconds
    let myAttempts = Events.find({
      type: "challenge_attempt", 
      challenge_id: challenge._id, 
      player_uuid: uuid,
      received_at: { $gt: Date.now() - retryInterval }
    }).fetch();
    if(!myAttempts.length) {
      Events.insert({
        type: "challenge_attempt",
        received_at: Date.now(),
        player_uuid: uuid,
        challenge_id: id
      });
    }    

  },*/
  'updateFiles'() {
    updateFiles();
  },
  'dataExportJSONmeta'() {
    return {
      path: importExportConfig.path,
      hostname: os.hostname(),
    }
  },
  'translationsExportJSONmeta'() {
    return {
      translationsPath: importExportConfigTranslationsOnly.path,
      hostname: os.hostname(),
    }
  },
  'filesArchiveExportJSONmeta'() {
    return {
      filesArchivePath: global.files_uri_path+'/files.zip',
      hostname: os.hostname(),
    }
  },
  'hostname'() {
    return os.hostname()
  },
  'sendAdminMessage'(deviceIds, message) {
    console.log("sendMessage", deviceIds, message)
    sendMessage(deviceIds, message)
  }, 
  async 'importEntries'(json) {
    const collections = Object.keys(json)
    console.log("received entries import", collections)

    let ie_collections = {...importExportConfig.collections, ...importExportConfigTranslationsOnly.collections};

    delete ie_collections.files // remove remote files that dont't correspond to actual local files

    for (collection in ie_collections) {
      if (json[collection]) {
        const Coll = ie_collections[collection];
        console.log("replacing collection: " + collection)
        await Coll.rawCollection().remove({}, {multi:true})
        for (let entry of json[collection]) {
          await Coll.rawCollection().insert(entry)
        }
      } else {
        console.warn(collection + " not found")
      }
    }
  },
  runAdb,

});

