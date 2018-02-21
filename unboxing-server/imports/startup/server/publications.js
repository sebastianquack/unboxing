import { Meteor } from 'meteor/meteor';

import Events from '../../collections/events';

Meteor.publish('events.all', function () {
  return Events.find()
});
