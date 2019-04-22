import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random'

import Events from '../../collections/events';
import { Challenges, Gestures, Sequences, Places, Walks, Translations, Servers } from '../../collections/';
import { serverDefaults } from '../../collections'

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
  'toggleGesture'(id) {
    const gesture = Gestures.findOne({_id: id})
    Gestures.update({_id: id}, {$set: {active: !gesture.active}})
  },
  'activateGesture'(id) {
    Gestures.update({_id: id}, {$set: {active: true}})
  },  
  'updateGesture'(id,$set) {
    Gestures.update({_id: id}, {$set})
  },
  'addSequence'() {
    Sequences.insert({
      name: "new",
      custom_duration: 0,
      items: [],
      bpm: 60
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
        //gesture_id: "",
        sensorModulation: "off",
        autoplay: "off",
        //sensorStart: true,
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
      { items: { $elemMatch: { _id: id } } },
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
      shorthand: "",
      tag: "",
      instructions: "how it works",
      sequence_id: "",
      sequence_loop: false,
      item_manual_mode: "guitar hero",
      relay_server_id: "",
      stages: `[{<br>
                "text1_en":"",<br> 
                "text1_de":"",<br> 
                "text2_en":"",<br> 
                "text2_de":"",<br> 
                "video_en":"",<br>
                "video_de":"",<br>
                "minParticipants": 1,<br>
                "instruments": []<br>
              }]`
    });
  },
  'removeChallenge'(id) {
    console.log("remove challenge", id);
    Challenges.remove(id);
  },
  'updateChallenge'(id,$set, $unset=null) {
    if(!$unset) {
      Challenges.update({_id: id}, {$set})  
    } else {
      Challenges.update({_id: id}, {$unset})  
    }
    
  },

  'addPlace'() {
    Places.insert({
      description: "new",
      shorthand: "",
      challenge_id: "",
      tag: "",
      navigationDiagram: "",
      navigationPhoto: "",
    });
  },
  'removePlace'(id) {
    console.log("remove place", id);
    Places.remove(id);
  },
  'updatePlace'(id,$set) {
    Places.update({_id: id}, {$set})
  },

  'addWalk'() {
    Walks.insert({
      description: "new",
      tag: "",
      active: true,
      startTime: "12:00",
      tutorial: true,
      paths: "",
    });
  },
  'removeWalk'(id) {
    console.log("remove walk", id);
    Walks.remove(id);
  },
  'updateWalk'(id,$set) {
    Walks.update({_id: id}, {$set})
  },

  'addTranslation'() {
    Translations.insert({
      key: "",
      content_en: "",
      content_de: "",
    });
  },
  'removeTranslation'(id) {
    console.log("remove translation", id);
    Translations.remove(id);
  },
  'updateTranslation'(id,$set) {
    Translations.update({_id: id}, {$set})
  },

  'addServer'() {
    Servers.insert(serverDefaults)
  },
  'removeServer'(id) {
    Servers.remove(id);
  },
  'updateServer'(id,$set) {
    Servers.update({_id: id}, {$set})
  },

});
