import { Meteor } from 'meteor/meteor';

import Challenges from '../../collections/challenges';
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

Meteor.publish('challenges.latest', function () {
  let options = {};
  options.limit = 1;
  options.sort = { created_at: -1 };
  return Challenges.find({"created_at" : { $gt : Date.now() - 1000 * 60 * 5 }}, options)
});

Meteor.publish('files.all', function (data) {
  let options = {}
  return Files.find({}, options)
});
