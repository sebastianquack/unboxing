/* eslint-disable no-console, no-undef */

import { Meteor } from 'meteor/meteor';
//import { Random } from 'meteor/random';
//import SimpleSchema from 'meteor/aldeed:simple-schema';

import {Servers, Devices} from '../../collections';
//import RoomSchema from '../../schemas/room';

const servers=[{
  _id: 1,
  name: "raspi-master",
  type: "relay",
	url: "http://192.168.8.1:3005",
	connectionType: "wifi",
	ssid: "unboxing",
	psk: "87542000",
},{
  _id: 3,
  name: "mobile-heroku",
  type: "relay",
	url: "https://unboxing-relay.herokuapp.com",
	connectionType: "cellular"
}]

export { relay_servers }

// create 42 devices
let devices = []
for (let i = 1 ; i <= 42; i++)  {
  devices.push({
    _id: i,
    deviceId: i,
    ip: "192.168.8.1"+(i.toString().padStart(2, '0')),
    deviceStatus: {},
    adb: {},
  })
}

Meteor.startup(() => {

  Meteor.call('logEvent', 'server restart')

  console.log('running fixures');

  // add all servers from const
  servers.forEach( server => {
    Servers.update({_id: server._id}, server, {upsert: true})
  })

  // add all devices from const
  devices.forEach( server => {
    Devices.update({_id: server._id}, server, {upsert: true})
  })

});
