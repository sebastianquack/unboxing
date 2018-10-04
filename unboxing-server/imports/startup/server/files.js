import fs from 'fs';
import { updateFiles } from '../../helper/server/files';

// configure uploads directory using environment variable
files_dir = process.env.UNBOXING_files_dir || process.env.PWD + '/files';
console.log("files directory: " + files_dir)

// configure path to access the files directory through http
files_uri_path = '/files';

// create files directory if it doesn't exist
if (!fs.existsSync(files_dir)) {
  console.log("creating files directory ")
  fs.mkdirSync(files_dir);
}

// make paths global
global.files_dir = files_dir;
global.files_uri_path = files_uri_path;

// read files
console.log("Initially checking files");
updateFiles();