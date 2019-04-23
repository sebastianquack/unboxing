const csv = require('csvtojson')
const { cut } = require('./cut')

const beats = require('./output/Satz_3_komplett.json')

const csvFilePath = 'tables/Übersicht Einsätze_Clips - 3. Satz.csv'
const audioFilesDir = '/Users/holger/Documents/Projekte/unboxing/audio/MCO_Teldex Edit 3.Satz'

const outputDir = './snippets'

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

csv({ignoreEmpty: true})
.fromFile(csvFilePath)
.then((jsonObj)=>{
    // console.log(jsonObj);
    jsonObj.forEach( row => {
      if (row.field2) {
        const file = row.field2
        const audioFilePath = audioFilesDir + '/' + file
        // console.log("file: " + file)
        const cues = Object.values(row).splice(2).map(parseCue)
        console.log(cues.length + " cues found for " + file)
        const filePrefix = row.field1.trim() + "_"
        cut(cues, beats, audioFilePath, outputDir, filePrefix)
      }
    })

})

