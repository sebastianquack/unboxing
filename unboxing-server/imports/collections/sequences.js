import { Mongo } from 'meteor/mongo';
import makeColor from 'string-to-color'
import Color from 'color';

const Sequences = new Mongo.Collection('sequences');

Sequences.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Sequences;

/* SCHEMA 
 *
 * name: string
 * items[]:
 *   - startTime: integer (milliseconds)
 *   - path: string (file path)
 *   - track: string (indicates events that belong to the same track, like "violin1" or "piano")
 *   - gesture_id: string (name of the entry gesture)
 * tracks[]: (auto generated)
 *   - name
 *   - color
 */

 updateTracksInfo = (userId, doc) => {
  const trackNames = [...new Set(doc.items.map( i => i.track))]
  const tracks = trackNames.map( t => ({
    name: t,
    color: Color(makeColor(t)).mix(Color("white")).string()
  })).sort(compare)
  Sequences.direct.update({_id: doc._id},{
    $set: { tracks }
  } )
}

updateDuration = (userId, doc) => {
  const duration = doc.items.reduce( 
    (accumulator, track) => {
      return track.startTime > accumulator ? track.startTime : accumulator // should add duration of each item, if exists
    }
    , 0 )
  //console.log("duration ", duration)
  Sequences.direct.update({_id: doc._id},{
    $set: { duration }
  } )
}

Sequences.after.insert(updateDuration)
Sequences.after.update(updateDuration)

Sequences.after.insert(updateTracksInfo)
Sequences.after.update(updateTracksInfo)

const compare = function (a,b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}