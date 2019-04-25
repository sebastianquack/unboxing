const deviceIds = 
["1",
"4",
"5",
"6",
"7",
"8",
"9",
"10",
"11",
"12",
"13",
"14",
"15",
"16",
"17",
"18",
"19",
"20",
"22",
"23",
"24",
"25",
"26",
"27",
"28",
"29",
"30",
"31",
"32",
"33",
"34",
"35",
"36",
"37",
"38",
"39",
"40"];

const places = [
[2, 6, 7, 4, 3, 5, 3],
[2, 6, 7, 4, 8, 9, 6],
[2, 6, 3, 10, 11, 5, 10],
[2, 5, 3, 6, 7, 9, 4],
[2, 5, 3, 6, 7, 9, 8],
[3, 6, 4, 10, 11, 5, 10],
[3, 6, 4, 10, 11, 5, 10],
[3, 5, 2, 6, 4, 9, 6],
[3, 5, 2, 6, 4, 9, 8],
[4, 5, 2, 6, 7, 9, 6],
[4, 6, 2, 10, 11, 5, 10],
[4, 6, 2, 10, 11, 5, 8],
[4, 6, 3, 5, 2, 6, 8],
[4, 6, 3, 5, 2, 6, 8],
[6, 8, 7, 9, 13, 5, 10],
[6, 8, 7, 9, 13, 5, 10],
[6, 8, 7, 9, 2, 5, 4],
[6, 8, 11, 5, 10, 9, 4],
[6, 8, 11, 5, 10, 9, 8],
[10, 9, 8, 2, 3, 5, 6],
[10, 9, 8, 2, 3, 5, 4],
[10, 9, 8, 4, 3, 5, 6],
[10, 9, 8, 4, 2, 5, 3],
[10, 9, 8, 4, 2, 5, 6],
[11, 9, 10, 12, 8, 6, 4],
[11, 9, 10, 12, 8, 6, 3],
[11, 9, 10, 5, 11, 9, 6],
[11, 9, 13, 5, 13, 9, 8],
[11, 5, 13, 12, 8, 6, 3],
[12, 8, 4, 2, 7, 6, 3],
[12, 8, 4, 2, 3, 5, 3],
[12, 8, 4, 2, 3, 6, 3],
[12, 8, 11, 5, 10, 9, 4],
[13, 5, 11, 9, 4, 6, 4],
[13, 5, 11, 12, 8, 6, 4],
[13, 5, 13, 12, 10, 9, 4],
[13, 5, 13, 9, 4, 6, 3]];

/*

1_1-16 4 Personen ca. 5 min
1_16-32 8 Personen ca 6 min
1_77-87 1 Person ca. 3 min
1_127 4 Personen ca. 5 min
1_390 4 Personen ca. 4 min
2_1 8 Personen ca. 6 min
2_ 84 4 Personen ca. 6 min
*/

//challenges: 0-viola1, 1, 2, 3, 4, 5, 6, 7, 8
const avgPathLength = 3;
const durations = [5, 6, 3, 5, 4, 6, 6];

function renderStep(challenge, place, duration, comma=',') {
  console.log('{"challenge":"' + challenge + '", "place":"' + place + '", "duration":' + duration + '}' + comma);
}


/*
console.log("{");

for(let i = 0; i < 37; i++) {
  console.log('"' + deviceIds[i] + '":{');
  console.log('"places":[');
  renderStep("0-viola1", "1", durations[0]);
  let placesList = places[i];
  for(let j = 0; j < placesList.length; j++) {
    renderStep(j + 1, placesList[j], durations[j]);
  }
  renderStep("8", "2", "15", '');
  console.log("],");
  console.log('"startInstrument":"viola1"');
  console.log("}" + (i < 36 ? "," : ""));
}

console.log("}");
*/

console.log("{");

for(let i = 0; i < 37; i++) {
  console.log('"' + deviceIds[i] + '":{');
  console.log('"places":[');
  renderStep("admin-1", "1", 6);
  renderStep("admin-2", "2", 6);
  renderStep("admin-1", "1", 6);
  renderStep("admin-2", "2", 6, "");
  console.log("]");
  console.log("}" + (i < 36 ? "," : ""));
}

console.log("}");




/* example JSON
{
"1":{
  "places":[
    {"challenge":"0-viola1", "place":"1", "duration": 1}, 
    {"challenge":"1",  "place":"2", "duration": 1},
    {"challenge":"2",  "place":"3", "duration": 1},
    {"challenge":"3",  "place":"4", "duration": 1},
    {"challenge":"4",  "place":"5", "duration": 1},
    {"challenge":"5",  "place":"6", "duration": 1},
    {"challenge":"6", "place":"7", "duration": 1},
    {"challenge":"7",  "place":"8", "duration": 1},
    {"challenge":"8",  "place":"9", "duration": 1}
   ],
  "startInstrument":"viola1"
}
}
*/