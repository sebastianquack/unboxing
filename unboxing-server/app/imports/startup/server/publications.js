import { Meteor } from 'meteor/meteor';

import { Challenges, Walks, Places, Events, Files, Gestures, Sequences, Translations } from '../../collections/';


Meteor.publish('events.all', function (data={}) {
  let options = {}
  if (data.limit) {
    options.limit = data.limit,
    options.sort = { issued_at: -1 }
  }
  let query = data.query || {}
  console.log(data, query)
  return Events.find(query, options)
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

Meteor.publish('places.all', function (query={}) {
  let options = {}
  return Places.find(query, options)
});

Meteor.publish('walks.all', function (query={}) {
  let options = {}
  return Walks.find(query, options)
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


Meteor.publish('translations.all', function (data) {
  let options = {}
  return Translations.find({}, options)
});

