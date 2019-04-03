import { Mongo } from 'meteor/mongo';

const Servers = new Mongo.Collection('servers');

Servers.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Servers;

/* SCHEMA 
  - type (string)
  - name (string)
  - url (string)
  - connection (string)
  - (optional) ssid (string)
  - (optional) psk (string)
*/

