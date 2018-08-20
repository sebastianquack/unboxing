import { Mongo } from 'meteor/mongo';

const Gestures = new Mongo.Collection('gestures');

Gestures.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Gestures;

/* SCHEMA 
 *
 * name: string
 * active: bool
 * sensitivity: integer
 * records: [{}]
 * start: integer
 * stop: integer
 */
