import { Mongo } from 'meteor/mongo';

const Walks = new Mongo.Collection('walks');

Walks.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Walks;

/* SCHEMA 
	- description (string)
	- challenge_id (string) -> challenges
*/

