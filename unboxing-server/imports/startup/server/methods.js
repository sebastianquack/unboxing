import { Meteor } from 'meteor/meteor';

import Events from '../../collections/events';
import Challenges from '../../collections/challenges';
import { updateFiles } from '../../helper/server/files';

function createChallenge(uuid) {
  console.log("creating new challenge");
  let id = Challenges.insert({
    created_at: Date.now(),
    uuids: [uuid]
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
  'registerToChallenge'(uuid, value) {
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

    if(challenge.created_at < Date.now() - 1000 * 60 * 1) {
      if(value) {
        challenge = createChallenge(uuid);   
      }
      return;
    }

    console.log("challenge found");
    // check if uuid is in the challenge
    let uuids = challenge.uuids;
    let index = uuids.indexOf(uuid);
    if(index != -1 && !value) {
      console.log("removing uuid from challenge");
      uuids.splice(index, 1); // remove uuid from challenge
      console.log(uuids);
    }
    if(index == -1 && value) {
      console.log("adding uuid to challenge");
      uuids.push(uuid); // add uuid to challenge
    }
    Challenges.update(challenge._id, {$set: {uuids: uuids}});
  },
  'getTime'() {
    const t = Date.now()
    //console.log(`sending time ${t} to client`)
    return t;
  },
  'updateFiles'() {
    updateFiles();
  }
});
