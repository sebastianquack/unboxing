/* eslint-disable no-console, no-undef */

import { Meteor } from 'meteor/meteor';
//import { Random } from 'meteor/random';
//import SimpleSchema from 'meteor/aldeed:simple-schema';

import Servers from '../../collections/servers';
//import RoomSchema from '../../schemas/room';

const servers=[{
  _id: 1,
  name: "raspi-master",
  type: "relay",
	url: "http://192.168.8.1:3005",
	connection: "wifi",
	ssid: "unboxing",
	psk: "87542000",
},{
  _id: 2,
  name: "raspi-1",
  type: "relay",
	url: "http://192.168.8.1:3005",
	connection: "wifi",
	ssid: "unboxing-1",
	psk: "87542000",
}, {
  _id: 3,
  name: "mobile-heroku",
  type: "relay",
	url: "https://unboxing-relay.herokuapp.com",
	connection: "mobile"
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
