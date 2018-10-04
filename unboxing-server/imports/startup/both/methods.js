import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random'

import Events from '../../collections/events';
import { Challenges, Gestures, Sequences } from '../../collections/';

Meteor.methods({
  'addGesture'(data) {
    console.log('new gesture', data)
    const gesture = {
      name: "new",
      active: false,
      records: data.records,
      start: 0,
      stop: data.records.length-1,
      sensitivity: data.sensitivity || 1,
      date: new Date
    }
    const id = Gestures.insert(gesture)
    Meteor.call('activateGesture', id)
  },
  'removeGesture'(id) {
    console.log("remove gesture ", id)
    Gestures.remove(id)
  },
  'activateGesture'(id) {
    Gestures.update({active: true}, {$set: {active: false}}, () => {
      Gestures.update({_id: id}, {$set: {active: true}})
    })
  },
  'updateGesture'(id,$set) {
    Gestures.update({_id: id}, {$set})
  },
  'addSequence'() {
    Sequences.insert({
      name: "new",
      items: []
    })
  },
  'removeSequence'(id) {
    console.log("remove sequence ", id)
    Sequences.remove(id)
  },
  'updateSequence'(id,$set) {
    Sequences.update({_id: id}, {$set})
  },
  'addSequenceItem'(sequence_id) {
    Sequences.update(
      {_id: sequence_id},
      { $push: { items: { $each: [ {
        _id: Random.id(),
        name: "new item",
        startTime: 0,
        track: "default",
        path: "",
        gesture_id: ""
      } ], $sort: { startTime: 1 }, $slice: 1000 } } }
    )
  },
  'sortSequenceItems'(sequence_id) {
    Sequences.update(
      {_id: sequence_id},
      { $push: { items: { 
        $each: [], 
        $sort: { startTime: 1 },
        $slice: 1000
      } } }
    )
  },
  'removeSequenceItem'(id) {
    console.log("remove sequence item", id)
    Sequences.update(
      { },
      { $pull: { items: { _id: id } } }
    )
  },
  'updateSequenceItem'(id, $set) {
    const sequence = Sequences.find(
      { items: { $elemMatch: { _id: id } } },
      { items: { $elemMatch: { _id: id } } } // should return only the one item, but returns all
    ).fetch()[0]

    const sequence_id = sequence._id
    const item = sequence.items.filter( item => item._id === id )[0]

    Sequences.update(
      { 'items._id': id }, 
      { $set: { 'items.$': { ...item, ...$set} } }
    )

    Meteor.call('sortSequenceItems', sequence_id)
  },
  'addChallenge'() {
    Challenges.insert({
      name: "new",
      instructions: "how it works",
      sequence_id: "",
      sequence_loop: false,
      sequence_autoplay: true
    });
  },
  'removeChallenge'(id) {
    console.log("remove challenge", id);
    Challenges.remove(id);
  },
  'updateChallenge'(id,$set) {
    Challenges.update({_id: id}, {$set})
  },
  
});
