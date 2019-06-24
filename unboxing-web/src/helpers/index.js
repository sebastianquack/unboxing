
export function formatChallengeTitle(challenge) {
  return challenge.sequence.title_en + " " + challenge.sequence.subtitle_en;
}

export function findFullSoundfiles(challenge, filesUrl) {
  return challenge.sequence.items
    .filter((item)=>item.track.indexOf("full-piano") > -1)
    .map((item)=>filesUrl + item.path)
}

export function assembleTrackList(challenge, filesUrl) {

  // step 1 - find tracks
  let trackNames = challenge.sequence.tracks
    .filter((item)=>
      /*item.name.indexOf("full-piano") > -1
      || item.name.indexOf("full-flute") > -1
      || item.name.indexOf("full-pauke") > -1
      || item.name.indexOf("full-oboe") > -1
      || item.name.indexOf("full-horn") > -1
      || item.name.indexOf("full-fagott") > -1
      || item.name.indexOf("full-violin1") > -1
      || item.name.indexOf("full-violin2") > -1
      || item.name.indexOf("full-viola") > -1
      || item.name.indexOf("full-cello") > -1
      || item.name.indexOf("full-bass") > -1*/
      item.name.indexOf("full-") > -1 
      )
    .map((item)=>item.name)

  // step 2 - identify files
  let result = [];
  trackNames.forEach((trackName)=>{
    for(let i = 0; i < challenge.sequence.items.length; i++) {
      if(challenge.sequence.items[i].track === trackName) {
        result.push({
          trackName: trackName,
          file: filesUrl + challenge.sequence.items[i].path,
          events: assembleTrackEvents(challenge.sequence.items.filter( item => item.track === trackName.substr(5)))
        })
        break;
      }
    }
  });

  let instruments = loadInstruments();

  result.sort((a, b) => { return(
      (a.trackName && b.trackName && instruments[a.trackName.replace("full-", "")] && instruments[b.trackName.replace("full-", "")]) ?
      instruments[a.trackName.replace("full-", "")].order -
      instruments[b.trackName.replace("full-", "")].order 
      : 0)
  });
    

  return result;
}

// transform items to a list of state events: "prepare", "play", "idle"...
export function assembleTrackEvents(items) {
  const prepareOffsetMs = -2000
  let events = []
  items.forEach( item => { // assuming they are ordered by startTime
    // the "prepare" state will need more checks to avoid overlaps
    //if ((item.startTime + prepareOffsetMs) > 0) {
    //  events.push({
    //    type: "prepare",
    //    timeMs: item.startTime + prepareOffsetMs 
    //  })
    //}
    events.push({
      type: "play",
      timeMs: item.startTime
    })
    events.push({
      type: "idle",
      timeMs: item.startTime + item.duration
    })
  })
  return events
}

export function loadInstruments() { return { 
/* xPos: Position on stage, between -100 and +100
 * yPos: Position on stage, between 0 and 100
 * direction: looking to left, right or center
 */
  "flute1": { 
    name_de: "Flöte", 
    name_en: "Flute",
    sequenceGroup: "flute1",
    image: '/images/instruments/Flute.png',   
    order: 1,
    priority: 1,
    xPos: -20,
    yPos: 70,
  },
  "oboe1": { 
    name_de: "Oboe 1", 
    name_en: "Oboe 1",
    sequenceGroup: "oboe1",
    image: '/images/instruments/Oboe.png',    
    order: 2,
    priority: 1,
    xPos: 0,
    yPos: 70,    
  },
  "oboe2": { 
    name_de: "Oboe 2", 
    name_en: "Oboe 2",
    sequenceGroup: "oboe2",
    image: '/images/instruments/Oboe.png',
    order: 3,
    priority: 2,
    xPos: 20,
    yPos: 70,    
  },
  "fagott1": { 
    name_de: "Fagott 1", 
    name_en: "Bassoon 1",
    sequenceGroup: "fagott1",
    image: '/images/instruments/Fagott.png',  
    order: 4,
    priority: 1,
    xPos: -10,
    yPos: 90,
  },
  "fagott2": { 
    name_de: "Fagott 2", 
    name_en: "Bassoon 2",
    sequenceGroup: "fagott2",
    image: '/images/instruments/Fagott.png',  
    order: 5,
    priority: 2,
    xPos: 10,
    yPos: 90,    
  },
  "horn1": { 
    name_de: "Horn 1",
    name_en: "Horn 1",
    sequenceGroup: "horn1",
    image: '/images/instruments/Horn.png',    
    order: 6,
    priority: 1,
    xPos: -40,
    yPos: 90,
  },
  "horn2": { 
    name_de: "Horn 2",
    name_en: "Horn 2",
    sequenceGroup: "horn2",
    image: '/images/instruments/Horn.png',
    order: 7,
    priority: 2,
    xPos: -25,
    yPos: 90,
  },
  "trompete1": { 
    name_de: "Trompete 1",
    name_en: "Trumpet 1",
    sequenceGroup: "trompete1",
    image: '/images/instruments/Trompete.png',
    order: 8,
    priority: 1,
    xPos: 25,
    yPos: 90,    
  },
  "trompete2": { 
    name_de: "Trompete 2",
    name_en: "Trumpet 2",
    sequenceGroup: "trompete2",
    image: '/images/instruments/Trompete.png',
    order: 9,
    priority: 2,
    xPos: 40,
    yPos: 90,    
  },
  "pauke1": { 
    name_de: "Pauke",
    name_en: "Timpani",
    sequenceGroup: "pauke1",
    image: '/images/instruments/Pauke.png',
    order: 10,
    priority: 1,
    xPos: 60,
    yPos: 80,
  },
  "kadenz":  { 
    name_de: "Klavier", 
    name_en: "Piano",
    sequenceGroup: "piano1",
    image: '/images/instruments/Piano.png',  
    order: 11,
    priority: 1,
    xPos: 0,
    yPos: 25,
  },
  "piano1":  { 
    name_de: "Klavier", 
    name_en: "Piano",
    sequenceGroup: "piano1",
    image: '/images/instruments/Piano.png',  
    order: 11,
    priority: 1,
    xPos: 0,
    yPos: 25,
  },
  "violin1": { 
    name_de: "Violine 2",
    name_en: "Violin 2",
    sequenceGroup: "violin2",
    image: '/images/instruments/Violine.png', 
    order: 16,
    priority: 2,
  },
  "violin1.1": { 
    name_de: "Violine 1",
    name_en: "Violin 1",
    sequenceGroup: "violin1",
    image: '/images/instruments/Violine.png', 
    order: 12,
    priority: 1,
    direction: "right",
    xPos: -25,
    yPos: 25,
  },
  "violin1.2": { 
    name_de: "Violine 1",
    name_en: "Violin 1",
    sequenceGroup: "violin1",
    image: '/images/instruments/Violine.png', 
    order: 13,
    priority: 1,
    direction: "right",
    xPos: -30,
    yPos: 10,
  },
  "violin1.3": { 
    name_de: "Violine 1",
    name_en: "Violin 1",
    sequenceGroup: "violin1",
    image: '/images/instruments/Violine.png', 
    order: 14,
    priority: 1,
    direction: "right",
    xPos: -40,
    yPos: 30,
  },
  "violin1.4": { 
    name_de: "Violine 1",
    name_en: "Violin 1",
    sequenceGroup: "violin1",
    image: '/images/instruments/Violine.png', 
    order: 15,
    priority: 1,
    direction: "right",
    xPos: -50,
    yPos: 25,
  },
  "violin2": { 
    name_de: "Violine 2",
    name_en: "Violin 2",
    sequenceGroup: "violin2",
    image: '/images/instruments/Violine.png', 
    order: 16,
    priority: 2
  },
  "violin2.1": { 
    name_de: "Violine 2",
    name_en: "Violin 2",
    sequenceGroup: "violin2",
    image: '/images/instruments/Violine.png', 
    order: 16,
    priority: 2,
    direction: "left",
    xPos: 20,
    yPos: 28,
  },
  "violin2.2": { 
    name_de: "Violine 2",
    name_en: "Violin 2",
    sequenceGroup: "violin2",
    image: '/images/instruments/Violine.png', 
    order: 17,
    priority: 2,
    direction: "left",
    xPos: 25,
    yPos: 15,    
  },
  "violin2.3": { 
    name_de: "Violine 2",
    name_en: "Violin 2",
    sequenceGroup: "violin2",
    image: '/images/instruments/Violine.png', 
    order: 18,
    priority: 2,
    direction: "left",
    xPos: 40,
    yPos: 31,    
  },
  "violin2.4": { 
    name_de: "Violine 2",
    name_en: "Violin 2",
    sequenceGroup: "violin2",
    image: '/images/instruments/Violine.png', 
    order: 19,
    priority: 1,
    direction: "left",
    xPos: 45,
    yPos: 20,    
  },
  "viola": { 
    name_de: "Viola",
    name_en: "Viola",
    sequenceGroup: "viola1",
    image: '/images/instruments/Viola.png',   
    order: 20,
    priority: 1 
  },
  "viola1.1": { 
    name_de: "Viola",
    name_en: "Viola",
    sequenceGroup: "viola1",
    image: '/images/instruments/Viola.png',   
    order: 20,
    priority: 1,
    direction: "left",
    xPos: 25,
    yPos: 55,
  },
  "viola1.2": { 
    name_de: "Viola",
    name_en: "Viola",
    sequenceGroup: "viola1",
    image: '/images/instruments/Viola.png',   
    order: 21,
    priority: 1,
    direction: "left",
    xPos: 30,
    yPos: 45,    
  },
  "viola1.3": { 
    name_de: "Viola",
    name_en: "Viola",
    sequenceGroup: "viola1",
    image: '/images/instruments/Viola.png',   
    order: 22,
    priority: 1,
    direction: "left",
    xPos: 40,
    yPos: 60,    
  },
  "cello": { 
    name_de: "Cello",
    name_en: "Cello",
    sequenceGroup: "cello",
    image: '/images/instruments/Cello.png',   
    order: 23,
    priority: 1 
  },
  "cello1.1": { 
    name_de: "Cello",
    name_en: "Cello",
    sequenceGroup: "cello",
    image: '/images/instruments/Cello.png',   
    order: 23,
    priority: 1,
    direction: "right",
    xPos: -25,
    yPos: 55,    
  },
  "cello1.2": { 
    name_de: "Cello",
    name_en: "Cello",
    sequenceGroup: "cello",
    image: '/images/instruments/Cello.png',   
    order: 24,
    priority: 1,
    direction: "right",
    xPos: -30,
    yPos: 40,    
  },
  "cello1.3": { 
    name_de: "Cello",
    name_en: "Cello",
    sequenceGroup: "cello",
    image: '/images/instruments/Cello.png',
    order: 25,
    priority: 1,
    direction: "right",
    xPos: -40,
    yPos: 60,    
  },
  "bass": { 
    name_de: "Kontrabass",
    name_en: "Double Bass",
    sequenceGroup: "bass",
    image: '/images/instruments/Kontrabass.png',   
    order: 26,
    priority: 1 
  },
  "bass1.1": { 
    name_de: "Kontrabass",
    name_en: "Double Bass",
    sequenceGroup: "bass",
    image: '/images/instruments/Kontrabass.png',   
    order: 26,
    priority: 1,
    direction: "right",
    xPos: -60,
    yPos: 70,    
  },
  "bass1.2": { 
    name_de: "Kontrabass",
    name_en: "Double Bass",
    sequenceGroup: "bass",
    image: '/images/instruments/Kontrabass.png',   
    order: 27,
    priority: 1,
    direction: "right",
    xPos: -70,
    yPos: 60,        
  },
}}
