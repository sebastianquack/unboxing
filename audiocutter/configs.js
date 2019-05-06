const configs = [
  {
    output: "Satz_3_komplett",
    midi: "Mozart KV466 3.Satz Click Midi.mid",
    totalLengthMs: 7.5 * 60 * 1000, // length of the generated click track - roughly same length as the recording
    lastBar: 428,
    beatsOffset: 26,                // leave the first ones out - not represented in the recording, just remove them
    beatCountOffset: 2,             // beats until the first bar start - relates to the beginning of the recording
    beginningOffsetMs: 105,         // add milliseconds in the beginning before the first beat starts - relates to the beginning of the recording
    corrections: [ // need to be chronological
      {
        bar: 180,
        barBeat: 1,
        offsetMs: 594,
        offsetBar: 2,
      },
      {
        bar: 212,
        barBeat: 1,
        offsetMs: 282,
        offsetBar: 0,
      },
      {
        bar: 240,
        barBeat: 1,
        offsetMs: 525,
        offsetBar: 0,
      },
      {
        bar: 354,
        barBeat: 1,
        offsetMs: 5000,//6363,
        offsetBar: 34,
      }      
    ]
  }
]

module.exports = configs