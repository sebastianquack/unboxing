import { Mongo } from 'meteor/mongo';

const Files = new Mongo.Collection('files');

Files.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Files;
