import { Mongo } from 'meteor/mongo';

const Places = new Mongo.Collection('places');

Places.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Places;

/* SCHEMA 
	- description (string)
	- challenge_id (string) -> challenges
*/

