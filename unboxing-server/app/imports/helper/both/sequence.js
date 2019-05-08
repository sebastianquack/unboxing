function parseFilePathToItem(value) {

  let example1 = "2_1-16_bass1_00.22.11.01.mp3"
  let regexp1 = /(\d)(?:_)(.*)(?:_)(.*)(?:_)(\d+)(?:\.)(\d+)(?:\.)(\d+)(?:\.)(\d+)(?:\..{3})/g;
  // for example: "/directory/2_1-16_bass1_00.22.11.01.mp3"
  var match1 = regexp1.exec(value);

  let example2 = "2_1-16_bass1_112.1-120.4_@99163.mp3"
  let regexp2 = /(\d)(?:_)(.*)(?:_)(.*)(?:_)(.*)(?:_)@(.*)(?:\..{3})/g;
               // movem _ bars   _ track  _ pos    _@ millis .ext
  var match2 = regexp2.exec(value);

  let startTime = 0
  let name = value
  let track = "undefined"

  if (match1 && match1.length == 8) {
    let match = match1
    
    let subframes = match[7]; // 1/80 of 1/25 of a second -> 0.0125 * 0.04 = 0.5 milliseconds
    let frames = match[6]; // 1/25 of a second = 40 milliseconds
    let seconds = match[5]; 
    let minutes = match[4];
    track = match[3];
    let bars = match[2];
    let movement = match[1];

    startTime = minutes * 60000 + seconds * 1000 + frames * 40 + subframes * 0.5;
    name = `${track} ${minutes}.${seconds}.${frames}.${subframes}`; 

  } else if (match2 && match2.length == 6) {
    let match = match2

    let millis = match[5]
    let pos = match[4]
    track = match[3];
    let bars = match[2];
    let movement = match[1];

    startTime = parseInt(millis);
    name = `${track} ${pos}`; 

  } else {
    console.log(`filename has wrong format - use ${example1} or ${example2}`);
    return false;
  }

  return {startTime: startTime, track: track, name: name, path: value}

}

export { parseFilePathToItem }