import recursive from "recursive-readdir";
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

import Files from '../../collections/files';

const filesFilter = (file) => (['.mp3','.wav','.aiff','.m4a','.MP3','.apk','.mp4','.png','.mov'].indexOf(path.extname(file)) > -1)

function readFiles(callback=false) {
  console.log("reading files")

  recursive(global.files_dir, function (err, files) {
    // filter files
    const validFiles = files.filter(filesFilter)

    // init
    let output = []


    // loop files
    let index = 0;
    for (let file of validFiles) {

      index++;

      const p = path.parse(file);
      const dirRelative = p.dir.substr(global.files_dir.length);
      const size = fs.statSync(file).size
      const fs_relative_path = dirRelative+'/'+p.base
      
      output.push({
        abs_path: file,
        path: fs_relative_path,
        name: p.base,
        size
      })
    }

    if (callback) {
      callback(output)
    }
    console.log("done reading files")
  });

}

async function updateFiles(callback=false) {

  await readFiles(async function(fs_files) {
    const db_files = Files.find().fetch()
    let changed = false
 
    // remove deleted files from collection
    for (let f_db of db_files) {
      const db_is_in_fs = (fs_files.findIndex((f_fs)=>
        filesEqual(f_db, f_fs)
      ) > -1)
      if (!db_is_in_fs) {
        console.log("removing ", f_db)
        Files.remove({path:f_db.path, size:f_db.size})
        changed = true
      }
    }

    // add new files to collection
    for (let f_fs of fs_files) {
      const fs_is_in_db = (db_files.findIndex((f_db)=>
        filesEqual(f_db, f_fs)
      ) > -1)
      if (!fs_is_in_db) {
        console.log("adding ", f_fs)
        Files.insert(f_fs)
        changed = true
      }
    }

    // update url path
    Files.find().forEach((file)=>{
      const url_path = getUrlPath(file.path)
      if (url_path !== file.url_path) {
        Files.update(file._id, {$set: {url_path}})
        changed = true
      }
    })

    if (callback) {
      callback(output)
    }

    const zipPath = global.files_dir + "/files.zip"
    if (changed || ! fs.existsSync(zipPath)) {
      makeArchive(zipPath)
    }

  })
}

function makeArchive(zipPath) {
  var zip = new AdmZip();

  console.log("creating zip archive")
  recursive(global.files_dir, function (err, files) {
    // filter files
    const validFiles = files.filter(filesFilter)

    // loop files
    let index = 0;
    for (let file of validFiles) {

      const p = path.parse(file);
      const dirRelative = p.dir.substr(global.files_dir.length);
      const fs_relative_path = dirRelative+'/'+p.base

      // console.log("adding " + fs_relative_path + " to zip ")
      zip.addLocalFile(file, dirRelative);
    }

    zip.writeZip(zipPath);

  })
}

function receiveFiles(fileInfo, fileData) {
  const target = global.files_dir + "/files.zip"
  try {
    fs.writeFileSync(target, fileData, 'binary');
    var zip = new AdmZip(target);
    zip.extractAllTo(global.files_dir, true)
    updateFiles()
  } catch(error) {
    if (error) {
      console.log(error)
    }
  }

}


/********* helpers ***********/

function filesEqual(file1, file2) {
  const result = (
    file1.path === file2.path &&
    file1.size === file2.size
  )
  //console.log("comparing", file1.path, file2.path, result)
  return result;
}

function getUrlPath(fs_relative_path) {
  return global.files_uri_path + encodeURI(fs_relative_path);
}

export { updateFiles, getUrlPath, receiveFiles }