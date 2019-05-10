import { Meteor } from 'meteor/meteor';

import { Challenges, Installations, Walks, Places, Events, Files, Gestures, Sequences, Translations, Servers, Devices } from '../../collections/';


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

function logSub(name) {
  // console.log("subscribing " + name)
}

Meteor.publish('files.all', function (query={}) {
  let options = {}
  logSub("files.all")
  return Files.find(query, options)
});

Meteor.publish('files.all.paths', function (query={}) {
  let options = {
    fields: {'path':1}
  }
  logSub("files.all.paths")
  return Files.find(query, options)
});

Meteor.publish('file.byPath', function (path) {
  let options = {}
  logSub("file")
  return Files.find({path}, options)
});

Meteor.publish('places.all', function (query={}) {
  let options = {}
  logSub("places.all")
  return Places.find(query, options)
});

Meteor.publish('walks.all', function (query={}) {
  let options = {}
  logSub("walks.all")
  return Walks.find(query, options)
});

Meteor.publish('gestures.all', function (data) {
  let options = {}
  logSub("gestures.all")
  return Gestures.find({}, options)
});

Meteor.publish('gestures.active', function (data) {
  let options = {}
  logSub("gestures.active")
  return Gestures.find({active: true}, options)
});

Meteor.publish('sequences.all', function (data) {
  let options = {}
  logSub("sequences.all")
  return Sequences.find({}, options)
});

Meteor.publish('sequence', function (id) {
  let options = {}
  logSub("sequence")
  return Sequences.find({_id: id}, options)
});

Meteor.publish('sequences.meta', function (data) {
  let options = {
    fields: {'items':0}
  }
  logSub("sequences.meta")
  return Sequences.find({}, options)
});

Meteor.publish('translations.all', function (data) {
  let options = {}
  logSub("translations.all")
  return Translations.find({}, options)
});


Meteor.publish('servers.all', function (data) {
  let options = {}
  logSub("servers.all")
  return Servers.find({}, options)
});

Meteor.publish('installations.all', function (data) {
  let options = {}
  logSub("installations.all")
  return Installations.find({}, options)
});


Meteor.publish('devices.all', function (data) {
  let options = {}
  logSub("devices.all")
  return Devices.find({}, options)
});
