/* eslint-disable no-console, no-undef */

import { Meteor } from 'meteor/meteor';
//import { Random } from 'meteor/random';
//import SimpleSchema from 'meteor/aldeed:simple-schema';

import Events from '../../collections/events';
//import RoomSchema from '../../schemas/room';


Meteor.startup(() => {

  Events.insert({
    type: "server restart",
    issued_at: Date.now()
  })

  console.log('running fixures');
/*
   rooms.forEach(room => {
    if (!Rooms.findOne(room)) {
      console.log('inserting room ' + room);
      const name = room[0].toUpperCase() + room.substring(1);
      Rooms.insert({
        ...RoomSchema.clean({}),
        key: room,
        name: { en: name, de: name }
      });
    }
  });

  */});
