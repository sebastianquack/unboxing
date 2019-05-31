import { Mongo } from 'meteor/mongo';

const Websites = new Mongo.Collection('websites');

Websites.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Websites;

