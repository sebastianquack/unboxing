import { Mongo } from 'meteor/mongo';

const Translations = new Mongo.Collection('translations');

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
