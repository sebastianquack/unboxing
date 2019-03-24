
import { Mongo } from 'meteor/mongo';

const Events = new Mongo.Collection('events');

Events.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Events;
