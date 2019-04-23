// based on https://github.com/kevin-roark/midi-timing/blob/master/midi.js

var fs = require('fs')
var midiConverter = require('midi-converter');

// console.log(JSON.stringify(jsonSong,null,1))

// var tempoMap = getTempoMap(jsonSong);
// console.log(JSON.stringify(tempoMap,null,1))

const beatsPerBar = 4

function loadMidi(filePath) {
  console.log("Reading " + filePath)
  var midiSong = fs.readFileSync(filePath, 'binary');
  jsonSong = midiConverter.midiToJson(midiSong);
  return jsonSong
}

function getBeats (track, tempoMap, ticksPerBeat, lengthMs) {
  var beats = [];
  var activeElsByNoteNumber = {};

  var currentTime = 0;
  var currentTempoIndex = 0;
  var currentUSPB = tempoMap[currentTempoIndex].microsecondsPerBeat;
  var currentBeat = 0;

  // we go tick-by-tick to not miss tempo changes LOL
  var currentTicks = 0;
  while (currentTime < lengthMs) {

    if (currentTicks % ticksPerBeat === 0) {
      beats.push({
        humanTime: humanTime(currentTime),
        absTimeMs: currentTime,
        beat: currentBeat
      })
      currentBeat += 1;
    }
    
    currentTicks += 1;
    currentTime += ticksToMS(1, currentUSPB);
    while (currentTempoIndex < tempoMap.length - 1 && currentTime >= tempoMap[currentTempoIndex + 1].time) {
      currentTempoIndex += 1;
      let tempo = tempoMap[currentTempoIndex];
      currentUSPB = tempo.microsecondsPerBeat;
    }
  }

  return beats;
}


function getTimingTrack (track, tempoMap) {
  var timedTrack = [];
  var activeElsByNoteNumber = {};

  var currentTime = 0;
  var currentTempoIndex = 0;
  var currentUSPB = tempoMap[currentTempoIndex].microsecondsPerBeat;
  var currentProgramNumber = 1;

  // we go tick-by-tick to not miss tempo changes LOL
  var currentTicks = 0;
  while (track.length > 0) {
    while (track.length > 0 && currentTicks === track[0].deltaTime) {
      currentTicks = 0;
      var el = track.shift();

      timedTrack.push({
        humanTime: humanTime(currentTime), 
        absTimeMs: Math.round(currentTime, 2),
        ...el
      })
    }

    currentTicks += 1;
    currentTime += ticksToMS(1, currentUSPB);
    while (currentTempoIndex < tempoMap.length - 1 && currentTime >= tempoMap[currentTempoIndex + 1].time) {
      currentTempoIndex += 1;
      let tempo = tempoMap[currentTempoIndex];
      currentUSPB = tempo.microsecondsPerBeat;
    }
  }

  return timedTrack;
}


function getTempoMap(song) {
  let tempos = [];

  let track = song.tracks[0];
  let currentTime = 0;
  let currentMicroSecondsPerBeat = 500000; // default idk

  track.forEach(el => {
    currentTime += ticksToMS(el.deltaTime, currentMicroSecondsPerBeat);

    if (el.subtype === 'setTempo') {
      let tempo = {
        microsecondsPerBeat: el.microsecondsPerBeat,
        bpm: round((1 / el.microsecondsPerBeat) * 1000000 * 60, 2),
        time: round(currentTime, 2),
        human: humanTime(currentTime)
      };
      tempos.push(tempo);

      currentMicroSecondsPerBeat = el.microsecondsPerBeat;
    }
  });

  if (tempos.length === 0) {
    tempos.push({
      microsecondsPerBeat: 500000,
      time: 0
    });
  }

  return tempos;
}


function ticksToMS (ticks, microsecondsPerBeat) {
  var beats = ticks / jsonSong.header.ticksPerBeat;
  var microseconds = microsecondsPerBeat * beats;
  var ms = microseconds / 1000;
  return ms;
}

function msToTicks (ms, microsecondsPerBeat) {
  var microseconds = ms * 1000;
  var beats = microseconds / microsecondsPerBeat;
  var ticks = jsonSong.header.ticksPerBeat * beats;
  return Math.round(ticks);
}


function round (n, places = 2) {
let d = Math.pow(10, places);
return Math.round(n * d) / d;
}

function humanTime (ms) {
let s = ms / 1000;
let minutes = Math.floor((s / 60)) + '';
let seconds = Math.round((s % 60)) + '';
if (seconds.length === 1) seconds = '0' + seconds;
let millis = ms % 1000
let humanTime = minutes + ':' + seconds + "." + millis.toFixed(0).padStart(3, '0');
return humanTime;
}

module.exports = {
  loadMidi,
  getTempoMap,
  getTimingTrack,
  getBeats,
  humanTime
}