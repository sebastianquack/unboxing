import { Sequences } from '../../collections';

Migrations.add({
  version: 1,
  name: 'Hello Migrations',
  up: function() {
  }
});

Migrations.add({
  version: 2,
  name: 'add sensorModulation and sensorStart to items',
  up: function(){
    add_default_attributes_to_items({
      sensorModulation: "off",
      sensorStart: false
    })    
  }
});

Migrations.add({
  version: 3,
  name: 'add autoplay in items',
  up: function(){
    add_default_attributes_to_items({
      autoplay: "off"
    })    
  }
});

Migrations.add({
  version: 4,
  name: 'add bpm to sequence',
  up: function() {
    add_default_attributes_to_sequence({
      bpm: 60
    });
  }
});

Migrations.add({
  version: 5,
  name: 'remove sensorStart and gesture_id from items',
  up: function() {
    // mongo > 3.6: Sequences.update({}, {$unset: {"items.$[].sensorStart":""}},{multi:true} );
    Sequences.find().forEach(sequence => {
      for (let item of sequence.items) {
        delete item.sensorStart
        delete item.gesture_id
        if (item.autoplay === "first") item.autoplay === "off"
      }
      Sequences.update(sequence._id, {$set:{ items: sequence.items}})
    })
  },
  down: function() {}
});


const version = 5;

Meteor.startup(() => {
  Migrations.migrateTo(version);
});


/***** helper *****/

// add attribute to sequence
add_default_attributes_to_sequence = function(attribs) {
  Sequences.find().forEach( sequence => {
      let new_attribs = {};
      for (let a in attribs) {
        if (!sequence[a]) {
          new_attribs[a] = attribs[a]
        }
      }
      if (Object.keys(new_attribs).length > 0) {
        console.log(`adding new default attributes ${JSON.stringify(new_attribs)} to sequence"`)
        Meteor.call('updateSequence', sequence._id, new_attribs)
      }
  });
}

// add attributes with default values to all items unless they are already set in the item
add_default_attributes_to_items = function(attribs) {
  Sequences.find().forEach( sequence => {
    sequence.items.forEach( item => {
      console.log(item._id, { })
      let new_attribs = {}
      for (let a in attribs) {
        if (!item[a]) {
          new_attribs[a] = attribs[a]
        }
      }
      if (Object.keys(new_attribs).length > 0) {
        console.log(`adding new default attributes ${JSON.stringify(new_attribs)} to item "${item.name}"`)
        Meteor.call('updateSequenceItem', item._id, new_attribs)
      }
    })
  })
}
