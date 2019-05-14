const deviceGroups = 
{"1": "A", // A
"4": "A",
"5": "A",
"6": "A",
"7": "A",

"8": "B", // B
"9": "B",
"10": "B",
"11": "B",

"36": "C", // C
"37": "C",
"38": "C",
"39": "C",

"13": "D", // D
"14": "D",
"15": "D",
"16": "D",
"17": "D",

"18": "E", // E
"19": "E",
"20": "E",
"22": "E",
"23": "E",

"25": "F", // F
"26": "F",
"27": "F",
"28": "F",
"29": "F",

"30": "G", // G
"31": "G",
"32": "G",
"33": "G",
"34": "G",

"12": "H", // H
"24": "H",
"35": "H",
"40": "H",
};

const startInstruments = 
{"1": "piano1", // A
"4": "piano1",
"5": "violin1.1",
"6": "bass1.1",
"7": "viola1.1",

"8": "flute1", // B
"9": "oboe1",
"10": "fagott1",
"11": "violin2.1",

"36": "violin2.2", // C
"37": "viola1.1",
"38": "cello1.3",
"39": "violin1.4",

"13": "pauke1", // D
"14": "cello1.1",
"15": "oboe2",
"16": "fagott2",
"17": "trompete1",

"18": "horn2", // E
"19": "trompete2",
"20": "violin1.2",
"22": "violin2.2",
"23": "violin1.3",

"25": "cello1.2", // F
"26": "bass1.2",
"27": "violin1.4",
"28": "violin2.3",
"29": "viola1.3",

"30": "violin1.1", // G
"31": "violin2.4",
"32": "violin1.2",
"33": "violin2.1",
"34": "cello1.2",

"12": "horn1", // H
"24": "viola1.2",
"35": "violin1.3",
"40": "violin1.1",
};

const finalNavigations = 
{"1": "ziel-piano1", // A
"4": "ziel-piano1",
"5": "ziel-piano1",
"6": "ziel-bass1",
"7": "ziel-viola1",

"8": "ziel-flute1", // B
"9": "ziel-oboe1",
"10": "ziel-fagott1",
"11": "ziel-violin1", // eigentlich 2

"36": "ziel-violin1", // C. // eigentlich 2
"37": "ziel-viola1",
"38": "ziel-cello1",
"39": "ziel-violin1",

"13": "ziel-pauke1", // D
"14": "ziel-cello1",
"15": "ziel-oboe1",  // eigentlich 2
"16": "ziel-fagott1", // eigentlich 2
"17": "ziel-trompete1",

"18": "ziel-horn1", // E.  // eigentlich 2
"19": "ziel-trompete1",  // eigentlich 2
"20": "ziel-violin1",
"22": "ziel-violin1", // eigentlich 2
"23": "ziel-violin1",


"25": "ziel-cello1", // F
"26": "ziel-bass1",
"27": "ziel-violin1",
"28": "ziel-violin1", // eigentlich 2
"29": "ziel-viola1",

"30": "ziel-violin1", // G
"31": "ziel-violin1",   // eigentlich 2
"32": "ziel-violin1",
"33": "ziel-violin1",   // eigentlich 2
"34": "ziel-cello1",

"12": "ziel-horn1",
"24": "ziel-viola1",
"35": "ziel-violin1",
"40": "ziel-violin1", // eigentlich 2
};

const places = {
"A": [1, 2, 4, 5, 6, 8],
"B": [10, 2, 3, 4, 6, 7],
"C": [9, 10, 2, 3, 4, 6],
"D": [8, 10, 1, 2, 4, 5],
"E": [7, 8, 10, 1, 2, 4],
"F": [6, 8, 9, 10, 2, 3],
"G": [5, 6, 8, 9, 10, 2],
"H": [4, 6, 7, 8, 10, 1]
}


const tutorialChallenges = {
"A": "practice-ab",
"B": "practice-ab",
"C": "practice-cd",
"D": "practice-cd",
"E": "practice-ef",
"F": "practice-ef",
"G": "practice-gh",
"H": "practice-gh",
}

const finalChallenge = "final-all"

// outdoor version    
const challenges = [1, 2, 3, 5, 6, 7];

// VERSION SUNDAY
const durations = [5, 6, 2, 4, 6, 4]; // cut challenge 4
const avgPathLength = 2;

function renderStep(challenge, place, duration, comma=',') {
  console.log('{"challenge":"' + challenge + '", "place":"' + place + '", "duration":' + duration + '}' + comma);
}

console.log("{");

for(let i = 0; i < 37; i++) {
  let deviceId = Object.keys(deviceGroups)[i]
  console.log('"' + deviceId + '":{');
  
  console.log(`"tutorialChallenge": "${tutorialChallenges[deviceGroups[deviceId]]}", `);
  console.log(`"finalChallenge": "${finalChallenge}", `);
  console.log(`"startInstrument": "${startInstruments[deviceId]}", `);

  console.log('"places":[');
  let placesList = places[deviceGroups[deviceId]];
  for(let j = 0; j < placesList.length; j++) {
    renderStep(challenges[j], placesList[j], durations[j] + avgPathLength);
  }

  // final navigational challenge one per instrument
  renderStep(finalNavigations[deviceId], 11, 15, "");

  console.log("]");
  console.log("}" + (i < 36 ? "," : ""));
}

console.log("}");

