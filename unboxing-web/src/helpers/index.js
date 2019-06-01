
export function formatChallengeTitle(challenge) {
  return challenge.sequence.title_en + " " + challenge.sequence.subtitle_en;
}

export function findFullSoundfiles(challenge, filesUrl) {
  return challenge.sequence.items
    .filter((item)=>item.track.indexOf("full-") > -1)
    .map((item)=>filesUrl + item.path)
}

export function assembleTrackList(challenge, filesUrl) {

  // step 1 - find tracks
  let trackNames = challenge.sequence.tracks
    .filter((item)=>item.name.indexOf("full-") > -1)
    .map((item)=>item.name)

  // step 2 - identify files
  let result = [];
  trackNames.forEach((trackName)=>{
    for(let i = 0; i < challenge.sequence.items.length; i++) {
      if(challenge.sequence.items[i].track === trackName) {
        result.push({
          trackName: trackName,
          file: filesUrl + challenge.sequence.items[i].path
        })
        break;
      }
    }
  });

  return result;
}