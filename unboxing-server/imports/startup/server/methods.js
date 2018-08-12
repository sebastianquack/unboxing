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
    console.log("challenge update");
    let challenges = Challenges.find({}, {sort: { created_at: -1 }, limit: 1}).fetch();
    let challenge = null;

    if(challenges.length == 0) {
      if(value) {
        challenge = createChallenge(uuid);
      }
      return;
    } else {
      challenge = challenges[0];
    }

    if(challenge.created_at < Date.now() - 1000 * 60 * 10) {
      if(value) {
        challenge = createChallenge(uuid);   
      }
      return;
    }

    console.log("challenge found");
    // check if uuid is in the challenge
    let uuids = challenge.uuids;
    if(uuids[uuid] && !value) {
      console.log("removing uuid from challenge");
      delete uuids[uuid]; // remove uuid from challenge
      console.log(uuids);
    }
    if(uuids[uuid] === undefined && value) {
      console.log("adding uuid to challenge");
      uuids[uuid] = "ready"; // add uuid to challenge
    }
    Object.keys(uuids).forEach((key)=>{
      uuids[key] = "ready"; // reset all uuids to ready when constellation changes
    });
    Challenges.update(challenge._id, {$set: {uuids: uuids, status: "idle", targetTime: null}});
  },
  'attemptChallenge'(id, uuid) {
    let challenge = Challenges.findOne(id);
    if(!challenge) {
      console.log("challenge not found");
      return;
    }
    console.log("attemptChallenge");

    if(challenge.status == "failed") {
      if(Date.now() > challenge.targetTime + 10 * 1000) { // try again after 10 seconds
        challenge.status = "idle";
      }
    }

    if(challenge.status == "idle") {
      let targetTime = Date.now() + 500; // give players 0.5 seconds to react
      challenge.targetTime = targetTime;
      Challenges.update(challenge._id, {$set: {status: "active", targetTime: targetTime}});      
      console.log("set challenge targetTime to " + challenge.targetTime);
    }
    
    // check if challenge is still possible
    if(Date.now() < challenge.targetTime) {

      // check if user hasn't tried
      if(challenge.uuids[uuid]) {
        if(challenge.uuids[uuid] == "ready") {
          challenge.uuids[uuid] = "attempted";
          Challenges.update(challenge._id, {$set: {uuids: challenge.uuids}});      

          // check if all signed up users are done
          let status = "complete";
          Object.keys(challenge.uuids).forEach((key)=>{
            if(challenge.uuids[key] != "attempted") {
              status = "active";
            }
          })

          console.log("setting challenge status to " + status);
          Challenges.update(challenge._id, {$set: {status: status}});      
        }
      }

    } else {
      // too late - challege is marked as failed
      Challenges.update(challenge._id, {$set: {status: "failed"}});  
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
