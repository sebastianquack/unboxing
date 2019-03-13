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

Gestures.after.remove( (userId, doc) => {
  const activeCount = Gestures.find({active: true}).count()
  if (activeCount == 0) {
    const anyGesture = Gestures.findOne()
    if (anyGesture) {
      Meteor.call('activateGesture', anyGesture._id)
    }
  }
})