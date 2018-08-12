import { Meteor } from 'meteor/meteor';

import Events from '../../collections/events';
import { Challenges, Gestures } from '../../collections/';
import { updateFiles } from '../../helper/server/files';

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
      received_at: Date.now(),
    	...data
    })
  },
  'setupChallenge'(uuid, value) {
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

  },
  'getTime'() {
    const t = Date.now()
    //console.log(`sending time ${t} to client`)
    return t;
  },
  'updateFiles'() {
    updateFiles();
  },
  'addGesture'(data) {
    console.log('new gesture', data)
    const gesture = {
      name: "new",
      active: false,
      records: data.records,
      start: 0,
      stop: data.records.length-1,
      sensitivity: data.sensitivity || 1,
      date: new Date
    }
    const id = Gestures.insert(gesture)
    Meteor.call('activateGesture', id)
  },
  removeGesture(id) {
    console.log("remove gesture ", id)
    Gestures.remove(id)
  },
  'activateGesture'(id) {
    Gestures.update({active: true}, {$set: {active: false}}, () => {
      Gestures.update({_id: id}, {$set: {active: true}})
    })
  },
  'updateGesture'(id,$set) {
    Gestures.update({_id: id}, {$set})
  }

});
