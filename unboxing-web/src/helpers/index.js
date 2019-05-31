
export function formatChallengeTitle(challenge) {
  return challenge.sequence.title_en + " " + challenge.sequence.subtitle_en;
}

export function findFullSoundfiles(challenge, filesUrl) {
  return challenge.sequence.items
    .filter((item)=>item.track.indexOf("full-") > -1)
    .map((item)=>filesUrl + item.path)
}