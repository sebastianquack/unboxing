import { Meteor } from 'meteor/meteor';

import Events from '../../collections/events';
import Files from '../../collections/files';

Meteor.publish('events.all', function (data) {
  let options = {}
  if (data && data.limit) {
    options.limit = data.limit,
    options.sort = { issued_at: -1, received_at: -1 }
  }
  return Events.find({}, options)
});

Meteor.publish('files.all', function (data) {
  let options = {}
  return Files.find({}, options)
});
