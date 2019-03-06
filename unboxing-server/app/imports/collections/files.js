import { Mongo } from 'meteor/mongo';
const getMP3Duration = require('get-mp3-duration')
import path from 'path';
import fs from 'fs';

const Files = new Mongo.Collection('files');

Files.allow({
  insert: () => true,
  update: () => true,
  remove: () => true
});

export default Files;


const updateDuration = (userId, doc) => {
  
  if (path.extname(doc.path) == ".mp3") {

    const buffer = fs.readFileSync(doc.abs_path)
    const duration = getMP3Duration(buffer)

    Files.direct.update({_id: doc._id},{
      $set: { duration }
    })      

  }
}

Files.after.insert(updateDuration)
Files.after.update(updateDuration)
