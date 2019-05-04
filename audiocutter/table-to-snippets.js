const fs = require('fs');
const csv = require('csvtojson')
const { cut } = require('./cut')

const beats = require('./output/Satz_3_komplett.json')
const audioFilesDir = '/Users/holger/Documents/Projekte/unboxing/audio/MCO_Teldex Edit 3.Satz'
const cutStartOffsetMs = -25 // cut a little later or earlier to compensate for discrepancies

const configs = [
  {
    name: "3_1-428",
    cuesTable: "Übersicht Einsätze_Clips - 3. Satz.csv",
  },
  {
    name: "3_1-30",
    cuesTable: "Übersicht Einsätze_Clips - 3. Satz, T. 1-30.csv",
    startSequenceAt: "-1.2"
  },
  {
    name: "3_30-62",
    cuesTable: "Übersicht Einsätze_Clips - 3. Satz, 30-62.csv",
    startSequenceAt: "30.1"
  },
  {
    name: "3_240-270",
    cuesTable: "Übersicht Einsätze_Clips - 3. Satz, T. 240-270.csv",
    startSequenceAt: "240.1"
  },
  {
    name: "3_354-369",
    cuesTable: "Übersicht Einsätze_Clips - 3. Satz, T. 354-369.csv",
    startSequenceAt: "354.1"
  },  
]

// const name = "3_1-428"
// const name = "3_1-30"
// const name = "3_30-62"
// const name = "3_240-270"
// const name = "3_354-369"

/**** END CONFIG  ****/

const doCuts = async (config) => {

  const csvFilePath = 'tables/' + config.cuesTable
  const outputName =  config.name

  console.log(`name: ${config.name}`)
  console.log(`table: ${csvFilePath}`)

  const sequenceStartOffsetMs = config.startSequenceAt ? getMillisAtBarBeat(beats, { // create a subsequence by offsetting the millis of the resulting files
    bar: parseInt(config.startSequenceAt.split(".")[0]),
    barBeat: parseInt(config.startSequenceAt.split(".")[1]),
  }) : 0

  const sequenceFilePrefix = outputName + "_"
  const outputDir = './snippets/'+outputName

  const parseCue = (str) => {
    const [start, end] = str.split('-')
    const [startBar, startBeat] = start.split('.')
    let [endBar, endBeat] = end.split('.')
    endBeat = endBeat.split(' ')[0] // remove comments
    return {
      start: {
        bar: parseInt(startBar),
        barBeat: parseInt(startBeat || 1)
      },
      end: {
        bar: parseInt(endBar),
        barBeat: parseInt(endBeat)
      }
    }
  }

  await csv({ignoreEmpty: true})
  .fromFile(csvFilePath)
  .then( async (jsonObj)=>{
      //console.log(jsonObj);

      if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
      }

      return await jsonObj.forEach( async row => {
        if (row.field2) {
          const files = row.field2.split("\n").map(file => file.trim())
          return await files.forEach( async (file, index) => {
            const audioFilePath = audioFilesDir + '/' + file
            // console.log("file: " + file)
            const cues = Object.values(row).splice(2).map(parseCue)
            console.log(cues.length + " cues found for " + file)
            const instrument = row.field1.trim()
            const subinstrument =  (files.length > 1) ? "."+(index+1) : ""
            const filePrefix = sequenceFilePrefix + instrument + subinstrument + "_"
            return await cut(cues, beats, audioFilePath, outputDir, filePrefix, cutStartOffsetMs, cutStartOffsetMs, sequenceStartOffsetMs)  
          })
        }
      })

  })
}

function getMillisAtBarBeat(beats, {bar, barBeat}) {
  const beat = beats.find(b => b.bar == bar && b.barBeat == barBeat)
  if (!beat) {
    console.log(`could not find beat ${bar}.${barBeat} -> starting at 0ms`)
    return 0
  } else {
    const offsetMs = beat.absTimeMs
    console.log(`sequence offset for beat ${bar}.${barBeat} is ${offsetMs}ms`)
    return -offsetMs
  }
}

(async () => {
  for (let config of configs) {
    await doCuts(config)
  }
})()
