import { Mongo } from 'meteor/mongo';

const Devices = new Mongo.Collection('devices');

Devices.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const schema = {
  device_id: "",
}

const defaults = {
}

export { 
  Devices, 
  schema as deviceSchema
}
