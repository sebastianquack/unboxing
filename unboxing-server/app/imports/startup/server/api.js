import fs from 'fs';
import serveStatic from 'serve-static';
import express from 'express';
import bodyParser from 'body-parser';
import {importExportConfig, importExportConfigTranslationsOnly} from '../../helper/server/importexport'

import {
  getEverything,
  getEverythingWeb,
  getTime,
  addGesture,
  uploadFiles,
  getDataJSON,
  getTranslationsJSON
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
//app.use(bodyParser.json()); // for parsing application/json

// serve REST api requests
app.get('/api/getEverything.json', getEverything);
app.get('/api/getEverythingWeb.json', getEverythingWeb);
app.get('/api/getTime.json', getTime);
app.post('/api/addGesture.json', addGesture);
app.post('/files', uploadFiles)
app.get(importExportConfig.path, getDataJSON);
app.get(importExportConfigTranslationsOnly.path, getTranslationsJSON);

// connect express to meteor app
WebApp.connectHandlers.use(app);
