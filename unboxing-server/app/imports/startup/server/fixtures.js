/* eslint-disable no-console, no-undef */

import { Meteor } from 'meteor/meteor';
//import { Random } from 'meteor/random';
//import SimpleSchema from 'meteor/aldeed:simple-schema';

import {Servers} from '../../collections';
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
  _id: 2,
  name: "raspi-1",
  type: "relay",
	url: "http://192.168.8.1:3005",
	connectionType: "wifi",
	ssid: "unboxing-1",
	psk: "87542000",
}, {
  _id: 3,
  name: "mobile-heroku",
  type: "relay",
	url: "https://unboxing-relay.herokuapp.com",
	connectionType: "cellular"
},{
  _id: 4,
  name: "192.168.8.62",
  type: "relay",
	url: "http://192.168.8.62:3005",
	connectionType: "wifi",
	ssid: "unboxing",
	psk: "87542000",
},{
  _id: 5,
  name: "192.168.8.91",
  type: "relay",
  url: "http://192.168.8.91:3005",
  connectionType: "wifi",
  ssid: "unboxing",
  psk: "87542000",
},{
  _id: 6,
  name: "192.168.1.2",
  type: "relay",
  url: "http://192.168.1.2:3005",
  connectionType: "wifi",
  ssid: "unboxing",
  psk: "87542000",
}]

export { relay_servers }

Meteor.startup(() => {

  Meteor.call('logEvent', 'server restart')

  console.log('running fixures');

  // add all servers from const
  servers.forEach( server => {
    Servers.update({_id: server._id}, server, {upsert: true})
  })

});
