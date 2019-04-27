import { Mongo } from 'meteor/mongo';

const Installations = new Mongo.Collection('installations');

Installations.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Installations;


