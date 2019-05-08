import { Mongo } from 'meteor/mongo';
import makeColor from 'string-to-color'
import Color from 'color';
import Files from './files'

const Sequences = new Mongo.Collection('sequences');


Sequences.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

const itemSchema = {
  sensorModulation: {
    default: "off",
    options: [
      "volume tilt", 
      "speed tilt", 
      "volume move",
      "off when moving",
      "crescendo"
    ]
  }
}

export {Sequences, itemSchema};

/* SCHEMA 
 *
 * name: string
 * custom_duration: integer (milliseconds) // use to manually set duration of sequence (for example with silence at the end)
 * items[]:
 *   - name
 *   - startTime: integer (milliseconds)
 *   - path: string (file path)
 *   - track: string (indicates events that belong to the same track, like "violin1" or "piano")
 *   - gesture_id: string (name of the entry gesture)
 *   - sensorModulation: string // ongoing play mode, for example tilt to volume
 *   - sensorStart: boolean (use peakService to start.)
 * tracks[]: (auto generated)
 *   - name
 *   - color
 */


 updateTracksInfo = (userId, doc) => {
  if (!doc.items) return
  const trackNames = [...new Set(doc.items.map( i => i.track))]
  const tracks = trackNames.map( t => ({
    name: t,
    color: Color(makeColor(t)).mix(Color("white")).string()
  })).sort(compare)
  Sequences.direct.update({_id: doc._id},{
    $set: { tracks }
  } )
}

updateItemsDuration = (userId, doc,fieldNames, modifier, options) => {
  if (modifier && modifier.$set && modifier.$set["items.$"]) {
    const path = modifier.$set["items.$"].path
    const file = Files.findOne({path})
    const duration = (file && file.duration) ? file.duration : 0
    if (duration) {
      modifier.$set["items.$"].duration = duration
    }
  }
}

updateTracksDuration = (userId, doc) => {
  if (!doc.items) return
  const duration = doc.items.reduce( 
    (accumulator, item) => {
      const end = item.startTime + ( item.duration ? item.duration : 0 )
      return end > accumulator ? end : accumulator // should add duration of each item, if exists
    }
    , 0 )
  //console.log("duration ", duration)
  Sequences.direct.update({_id: doc._id},{
    $set: { duration }
  } )
  // set custom duration to duration if nothing is specified
  if (!doc.custom_duration || doc.custom_duration === 0 || typeof doc.custom_duration !== "number" || doc.duration > doc.custom_duration ) {
    Sequences.direct.update({_id: doc._id},{
      $set: { custom_duration: duration }
    } )    
  }
}

Sequences.before.update(updateItemsDuration)

Sequences.after.insert(updateTracksDuration)
Sequences.after.update(updateTracksDuration)

Sequences.after.insert(updateTracksInfo)
Sequences.after.update(updateTracksInfo)

const compare = function (a,b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}