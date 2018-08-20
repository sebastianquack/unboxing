import { Mongo } from 'meteor/mongo';
import makeColor from 'string-to-color'

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
    color: makeColor(t)
  }))
  Sequences.direct.update({_id: doc._id},{
    $set: { tracks }
  } )
}

Sequences.after.insert(updateTracksInfo)
Sequences.after.update(updateTracksInfo)
