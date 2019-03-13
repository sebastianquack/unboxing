import { Mongo } from 'meteor/mongo';

const Challenges = new Mongo.Collection('challenges');

Challenges.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Challenges;

/* SCHEMA 
	- name: string
	- instructions: string
	- sequence_id: string
	- sequence_loop: bool
	- autoplay_items: string // "all", "first", "none"
	- item_manual_mode: string // "assisted", "free"
 */

