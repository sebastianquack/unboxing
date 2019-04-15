const fs = require("fs");
const WavEncoder = require("wav-encoder");

const { loadMidi, getTempoMap, getTimingTrack, getBeats, humanTime } = require("./midi")

const filePath = "./Mozart KV466 3.Satz Click Midi.mid"
//const filePath = "/Users/holger/Downloads/III.\ Rondo\ Click\ \&\ Playback.1.mid"
//const filePath = "/Users/holger/Downloads/Projekt_Satz3_click.band.mid"

const beatsOffset = 26//16 // leave the first ones out
const beatCountOffset = 2//16 // beats until the first bar start
const beginningOffsetMs = 105 // add milliseconds in the beginning before the first beat starts

const totalLengthMs = 7.5 * 60 * 1000

const sampleRate = 44100
const clickLengthMs = 3
const clickVolume = 0.5

const outputDir = 'output'
const outputFilename = `clicks_off${beatsOffset}_vorlauf${beatCountOffset}_absOff${beginningOffsetMs}`

const makeClick = function(lengthMs, volume) {
  return new Float32Array(sampleRate * 0.001 * lengthMs).map(() => volume * (Math.random() - 0.5))
}

const makeSilence = function(lengthMs) {
  return new Float32Array(sampleRate * 0.001 * lengthMs).map(() => 0)
}

const lower = function(sound) {
  var output = new Float32Array(sound.length)
  let i = 0
  for (let sample of sound) {
    output[i] = sample
    output[i+1] = sample
    i += 2
  }
  return output
}


// get a list of beats
var jsonSong = loadMidi(filePath)
var tempoMap = getTempoMap(jsonSong)
var timedTrack = getTimingTrack(jsonSong.tracks[0], tempoMap)
var markers = timedTrack.filter( e => e.subtype == "marker" )
var clickMarkers = markers.filter( m => m.text.match(/click/i) )
var ticksPerBeat = jsonSong.header.ticksPerBeat
var beats = getBeats(jsonSong.tracks[0], tempoMap, ticksPerBeat, totalLengthMs, beatsOffset)

// console.log(JSON.stringify(jsonSong.header,null,1))
// console.log(JSON.stringify(jsonSong.tracks,null,1))
// console.log(JSON.stringify(timedTrack,null,1))
// console.log(JSON.stringify(markers,null,1))
// console.log(JSON.stringify(clickMarkers,null,1))
// console.log(JSON.stringify(tempoMap,null,1))
// console.log(JSON.stringify(beats,null,1))

// shift everything to cut away some beats at the beginning
var beatsOffsetMs = beats[beatsOffset].absTimeMs
console.log("remove " + beatsOffset + " beats, " + beatsOffsetMs + "ms")
beats.forEach( b => {
  b.absTimeMs = b.absTimeMs - beatsOffsetMs
  b.humanTime = humanTime(b.absTimeMs)
})

// calculate musical metric of bars and beats of bars
var beatsPerBar = 4
console.log("Vorlauf: " + beatCountOffset)
beats.forEach( b => {
  b.beat = b.beat - beatCountOffset - beatsOffset
  bar = Math.floor(b.beat / beatsPerBar) // starts from 0
  barBeat = b.beat % beatsPerBar // starts from 0
  b.bar = bar >= 0 ? bar+1 : bar // start counting from bar 1
  b.barBeat = bar >= 0 ? barBeat+1 : (barBeat||-4) + beatsPerBar + 1 // start counting beats from 1, also in negative bars
})

// sanitize
beats = beats.filter( b => b.absTimeMs >= 0)

// add absolute offset at the beginning
console.log("Add absolute offset of " + beginningOffsetMs + "ms at the beginning")
beats.forEach( b => b.absTimeMs += beginningOffsetMs)

// the final beat data
//console.log(JSON.stringify(beats,null,1))
console.log(beatsToCSV(beats, "\t"))

// create click sequence
const click = makeClick(clickLengthMs, clickVolume)
const softClick = makeClick(clickLengthMs, clickVolume * 0.5)
const lowClick = lower(lower(click))

const sequence = []

let lastClickEndMs = 0
for (let beat of beats) {
  if (beat.absTimeMs < lastClickEndMs) {
    continue
  }
  let silence = makeSilence(beat.absTimeMs - lastClickEndMs)
  let firstBeat = beat.barBeat == 2
  let tenthBar = (beat.bar % 10 === 0 || beat.bar === 1) && beat.barBeat == 2
  sequence.push(firstBeat ? (tenthBar ? lowClick : click) : softClick) // stress on the 1 
  sequence.push(silence)
  lastClickEndMs = beat.absTimeMs + clickLengthMs
}

// create audio file
const audio = {
  sampleRate,
  channelData: [
    concatenate(Float32Array, ...sequence),
    concatenate(Float32Array, ...sequence),
  ]
};

if (!fs.existsSync(outputDir)){
  fs.mkdirSync(outputDir);
}

WavEncoder.encode(audio).then((buffer) => {
  const filename = outputDir + '/' + outputFilename
  fs.writeFileSync(`${filename}.wav`, new Buffer(buffer));
  fs.writeFileSync(`${filename}.tsv`, beatsToCSV(beats, "\t"))
});


/********************** helper *****************/

function concatenate(resultConstructor, ...arrays) {
  let totalLength = 0;
  for (let arr of arrays) {
      totalLength += arr.length;
  }
  let result = new resultConstructor(totalLength);
  let offset = 0;
  for (let arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
  }
  return result;
}

function beatsToCSV(beats, delimiter = ",") {
  const csvLinesArray = beats.map( b => [
    b.beat,
    b.bar,
    b.barBeat,
    b.absTimeMs
  ])
  csvLinesArray.unshift([
    '#',
    'bar',
    'beat',
    'time (ms)'
  ])
  cvsLines = csvLinesArray.map( l => l.join(delimiter))
  var endOfLine = require('os').EOL;
  return cvsLines.join(endOfLine)
}