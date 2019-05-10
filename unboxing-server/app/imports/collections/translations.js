import { Mongo } from 'meteor/mongo';

const Translations = new Mongo.Collection('translations');

if (Meteor.isServer){
  Translations.rawCollection().createIndex({ key: 1 })
}

Translations.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Translations;

/* SCHEMA 
  - key (string)
  - content_en (string)
  - content_de (string)
*/
