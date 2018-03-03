import { Mongo } from 'meteor/mongo';

const Challenges = new Mongo.Collection('challenges');

Challenges.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Challenges;
