import fs from 'fs';
import serveStatic from 'serve-static';
import express from 'express';
import bodyParser from 'body-parser';

import {
  getEverything,
  getTime,
  addGesture
} from './rest'

// create files directory if it doesn't exist
if (!fs.existsSync(files_dir)) {
  console.log("creating files directory ")
  fs.mkdirSync(files_dir);
}

// create express server
var app = express()

// serve static files
app.use(global.files_uri_path, serveStatic(files_dir, { 'index': false }))

// body parse
app.use(bodyParser.json()); // for parsing application/json

// serve REST api requests
app.get('/api/getEverything.json', getEverything);
app.get('/api/getTime.json', getTime);
app.post('/api/addGesture.json', addGesture);

// connect express to meteor app
WebApp.connectHandlers.use(app);
