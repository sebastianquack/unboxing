const exec = require('await-exec')
const Timeout = require('await-timeout');

const ffmpeg_additional_args = ' -filter:a "volume=10dB" -qscale:a 9'

// amplify: -filter:a "volume=10dB"
// VBR encoding 45-85kbit/s: -qscale:a 9

async function cut(cues, beats, filePath, outputDir, filePrefix, cutStartOffsetMs=0, cutEndOffsetMs=0, sequenceStartOffsetMs=0) {
  for (let cue of cues) {
    
    const startBeat = beats.find( b => b.bar == cue.start.bar && b.barBeat == cue.start.barBeat)
    
    let startMs = 0
    if (!startBeat) {
      console.warn(`start cue ${cue.start.bar}.${cue.start.barBeat} not found`)
      if (cue.start.bar < 0) {
        console.warn(`using beginning of file instead of start cue ${cue.start.bar}.${cue.start.barBeat}`)
      } else {
        console.warn(`skipping cue ${cue.start.bar}.${cue.start.barBeat}-${cue.end.bar}.${cue.end.barBeat}`)
        continue
      }
    } else {
      startMs = startBeat.absTimeMs + cutStartOffsetMs
    }

    if ( startMs <= 0) { 
      startMs = cutStartOffsetMs // move cut point to actually 0 by using cutStartOffset, which will be cancelled out later
    }

    const endBeat = beats.find( b => b.bar == cue.end.bar && b.barBeat == cue.end.barBeat)
    if (!endBeat) {
      console.warn(`end cue ${cue.end.bar}.${cue.end.barBeat} not found`)
      console.warn(`skipping cue ${cue.start.bar}.${cue.start.barBeat}-${cue.end.bar}.${cue.end.barBeat}`)
      continue
    }
    const endMs = endBeat.absTimeMs

    const lengthMs = endMs - startMs

    //console.log(startMs, lengthMs)

    const outputFilename = `${filePrefix}${cue.start.bar}.${cue.start.barBeat}-${cue.end.bar}.${cue.end.barBeat}_@${Math.round(startMs+sequenceStartOffsetMs-cutStartOffsetMs)}.mp3`
    const outputPath = outputDir + '/' + outputFilename
    const command = `ffmpeg -ss ${(startMs/1000).toFixed(3)} -t ${(lengthMs/1000).toFixed(3)} -i "${filePath}" ${ffmpeg_additional_args} "${outputPath}"`
    console.log(command)
    //try {
      await exec(command)
      //await Timeout.set(2000)
      //console.log(result)
      //return result
    //} catch(error) {
      //console.warn(" FFMPEG ERROR", JSON.stringify(error))
      //return false
    //}
  }
  
  // console.log("generating " + outputDir + '/' + outputFilename)
}

// ffmpeg -ss 10 -t 6.5 -i 01PNO.wav out.wav

module.exports = { cut }