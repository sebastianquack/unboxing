import { Mongo } from 'meteor/mongo';

const Devices = new Mongo.Collection('devices');

Devices.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const schema = {
  deviceId: "",
  connected: false, // connection status
  deviceStatus: {}, // sent by device
  downloadBot: null,
  adb: {},
  lastHeardOf: 0
}

const defaults = {
}

export { 
  Devices, 
  schema as deviceSchema
}
