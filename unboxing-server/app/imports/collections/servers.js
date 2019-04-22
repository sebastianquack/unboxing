import { Mongo } from 'meteor/mongo';

const Servers = new Mongo.Collection('servers');

Servers.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const schema = {
  type: ["relay", "other"],
  name: "",
  url: "",
  connection: ["wifi", "cellular"],
  ssid: "", // optional
  psk: "", // optional
}

const defaults = {
  type: "",
  name: "",
  url: "",
  connection: "",
  ssid: "",
  psk: "",
}

export { 
  Servers, 
  schema as serverSchema, 
  defaults as serverDefaults
}
