import { Meteor } from 'meteor/meteor';

import Events from '../../collections/events';

Meteor.methods({
  'action'(data) {
    console.log(data);
    Events.insert({
      type: "button pressed",
      received_at: Date.now(),
    	...data
    })
  },
  'getTime'() {
    const t = Date.now()
    console.log(`sending time ${t} to client`)
    return t;
  }
});
