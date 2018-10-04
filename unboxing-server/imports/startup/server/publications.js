import { Meteor } from 'meteor/meteor';

import { Challenges, Events, Files, Gestures, Sequences } from '../../collections/';


Meteor.publish('events.all', function (data) {
  let options = {}
  if (data && data.limit) {
    options.limit = data.limit,
    options.sort = { issued_at: -1, received_at: -1 }
  }
  return Events.find({}, options)
});

Meteor.publish('challenges.all', function () {
  let options = {}
  return Challenges.find({}, options)
});

/*Meteor.publish('challenges.latest', function () {
  let options = {};
  options.limit = 1;
  options.sort = { created_at: -1 };
  return Challenges.find({"created_at" : { $gt : Date.now() - 1000 * 60 * 5 }}, options)
});*/

Meteor.publish('files.all', function (query={}) {
  let options = {}
  return Files.find(query, options)
});

Meteor.publish('gestures.all', function (data) {
  let options = {}
  return Gestures.find({}, options)
});

Meteor.publish('gestures.active', function (data) {
  let options = {}
  return Gestures.find({active: true}, options)
});

Meteor.publish('sequences.all', function (data) {
  let options = {}
  return Sequences.find({}, options)
});

