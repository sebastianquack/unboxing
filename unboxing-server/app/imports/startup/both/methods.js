import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random'

import Events from '../../collections/events';
import { Challenges, Installations, Gestures, Sequences, Places, Walks, Translations, Servers, Files } from '../../collections/';
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
      title_en: "",
      title_de: "",
      subtitle_en: "",
      subtitle_de: "",
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
  // sequence item methods are in server/methods due to https://github.com/meteor/meteor/issues/6223
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
      description_en: "new",
      description_de: "new",
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
  'updatePlace'(id,$set, $unset=null) {
    if(!$unset) {
      Places.update({_id: id}, {$set})  
    } else {
      Places.update({_id: id}, {$unset})  
    }
    
  },

  'addWalk'() {
    Walks.insert({
      description: "new",
      tag: "berlin",
      paths: `{<br>
        "1": {<br>
          "startInstrument": "viola1.1",<br>
          "tutorialChallenge": "1",<br>
          "places": [<br>
          {"challenge": "2", "place": "1", "duration": 10}<br>
          ]<br>
        }<br>
      }<br>
      `,
    });
  },
  'removeWalk'(id) {
    console.log("remove walk", id);
    Walks.remove(id);
  },
  'updateWalk'(id,$set, $unset=null) {
    if(!$unset) {
      Walks.update({_id: id}, {$set})  
    } else {
      Walks.update({_id: id}, {$unset})  
    }
    
  },

  'addInstallation'() {
    Installations.insert({
      name: "new",
      challenges: "1 2 3",
      deviceGroups: `[<br>{<br>
        "name":"name",<br>
        "devices":[1, 2, 3],<br>
        "startInstruments":["viola1", "viola1", "viola1"],<br>
        "relayServerName": "raspi-master"<br>
      }<br>]
      `
    });
  },
  'removeInstallation'(id) {
    console.log("remove installation", id);
    Installations.remove(id);
  },
  'updateInstallation'(id,$set, $unset=null) {
    if(!$unset) {
      Installations.update({_id: id}, {$set})  
    } else {
      Installations.update({_id: id}, {$unset})  
    }
    
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
