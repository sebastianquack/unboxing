const _ = require('underscore')
const randomItem = function(list) { return _.sample(list) }
const randomSubset = function(list,  n) { return _.sample(list, n) }

/************ custom config ************/

const totalPeople = 37

const connections = { // places and connections to other places
  1: [2, 3, 4, 6, 7, 10, 11],
  2: [3, 4, 6, 10, 7],
  3: [2, 4, 5.1, ],
  4: [2, 3, 6, 7, 5.1],
  5.1:[3, 4],
  5.2:[10, 11],
  6: [4,7,8,9],
  7: [6,8,9,4, 2],
  8: [6,7,9],
  9: [6, 7,8,2,10,11],
  10:[11,9,2,5.2],
  11:[10,5.2,9,6]
}

// get list of places
const places = Object.keys(connections);
//console.log(places);

// everyone is here at the beginning
const initialPlace = 1;
const finalPlace = "2";

const steps = [
  37,
  5+1,
  8+1,
  4+1, // this was 1
  4+1,
  4+1,
  8+1,
  4+1,
  //37
] // max people per step


function searchPaths(maxFragments, maxDuplicates) {

  //console.log("searching for paths with max duplicates " + maxDup);

  // this is where we count how many people are in each place per step
  var counterArray = {};
  for(var x = 0; x < places.length; x++){
      counterArray[places[x]] = [];    
      for(var y = 0; y < steps.length; y++){ 
          counterArray[places[x]][y] = 0;    
      }    
  }
  //console.log(counterArray);

  // this is where we store our paths
  let paths = []
  for(var x = 0; x < totalPeople; x++){
      paths[x] = [];    
      for(var y = 0; y < steps.length; y++){ 
          paths[x][y] = -1;    
      }    
  }

  // put everyone in the initialPlace
  for(let personCounter = 0; personCounter < totalPeople; personCounter++) {
    paths[personCounter][0] = initialPlace;
  }

  let abort = false;

  // go over each person and each step
  for(let stepCounter = 1; stepCounter < steps.length; stepCounter++) {
    for(let personCounter = 0; personCounter < totalPeople; personCounter++) {
    
      //console.log("\nlooking at person " + personCounter + " at step " + stepCounter);

      let ok = false;
      let canditatePlace = -1;

      let currentPlace = paths[personCounter][stepCounter - 1];
      //console.log("currentPlace", currentPlace);

      let maxCapacity = steps[stepCounter] + 1;
      //special condition for 5.1 and 5.2
      if(canditatePlace == "5.1" || canditatePlace == "5.2") {
        maxCapacity = Math.ceil(maxCapacity / 2);
      }

      //console.log("shuffling connections...");
      shuffle(connections[currentPlace]);
      //console.log("available connections", connections[currentPlace]);

      let availablePlaces = false;
      for(let canditateCounter = 0; canditateCounter < connections[currentPlace].length; canditateCounter++) {
        canditatePlace = connections[currentPlace][canditateCounter];
        if(counterArray[canditatePlace][stepCounter] > 0 && counterArray[canditatePlace][stepCounter] <= maxCapacity) availablePlaces = true;
      }
      let absoluteMinimum = 1;
      if(!availablePlaces) {
        absoluteMinimum = 0;
      }

      //connections[currentPlace].sort((a, b) => { counterArray[b][stepCounter]-counterArray[a][stepCounter] })
      
      // which connections are already populated and not overcrowded
      let availbaleCandidates = 0;
      let firstBest = null;
      for(let canditateCounter = 0; canditateCounter < connections[currentPlace].length; canditateCounter++) {
        //console.log("examining canditatePlace", canditatePlace);
        canditatePlace = connections[currentPlace][canditateCounter];
        
        if(counterArray[canditatePlace][stepCounter] >= absoluteMinimum && counterArray[canditatePlace][stepCounter] <= maxCapacity) {
          ok = true;
          counterArray[canditatePlace][stepCounter]++;
          //console.log("canditatePlace is good! incrementing counter");
          break;
        }
      
      }

      if(ok) {
        paths[personCounter][stepCounter] = canditatePlace;  
      } else {
        //console.log("problem - coulnd't find a path, aborting");
        abort = true;
        break;
      }
      
    }

    if(abort) break;

  }
  
  if(!abort) {
    
    let fragments = 0;
    for(var x = 0; x < places.length; x++) {
      for(var y = 0; y < steps.length; y++){

        if(counterArray[places[x]][y] > 0 && counterArray[places[x]][y] <= 2) {
          fragments++;
        }
      }    
    }

    if(fragments < maxFragments /*&& duplicatePaths(paths) < maxDuplicates*/) {

      console.log("solution found!");
      console.log(counterArray);
      console.log("fragments: " + fragments);  
      console.log("duplicate paths", duplicatePaths(paths));
      return paths;  
    }
  }
  return null;
}


for(let i = 0; i < 100000; i++) {
  let paths = searchPaths(1, 8); 
  if(paths) console.log(paths);
  //if(paths) console.log("totalDuplicatesInPaths", totalDuplicatesInPaths(paths));
}



/*** helper functions ***/

function duplicatePaths(paths) {
  let strings = [];
  for(let personCounter = 0; personCounter < totalPeople; personCounter++) {
    strings.push(JSON.stringify(paths[personCounter]));
  }
  return maxDuplicates(strings);
}

function totalDuplicatesInPaths(paths) {
  let duplicates = 0;
  for(let personCounter = 0; personCounter < totalPeople; personCounter++) {
    duplicates += maxDuplicates(paths[0])
  }
  return duplicates;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function allDuplicates(your_array) {
  var counts = {};
  your_array.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

  let duplicates = 0;
  Object.keys(counts).forEach((key)=>{
    if(key != "-1") {
      duplicates += counts[key]; 
    }
  })
  return duplicates;
}

function maxDuplicates(your_array) {
  var counts = {};
  your_array.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

  let duplicates = 0;
  Object.keys(counts).forEach((key)=>{
    if(key != "-1" && counts[key] > duplicates) {
      duplicates = counts[key]; 
    }
  })
  //console.log(counts);
  //console.log("max duplicates: ", duplicates); 
  return duplicates;
}























//// 5.1 and 5.2 must appear together or not at all
//function specialPlaceValidator(placesSuggestion, step) {
//  if (step == 2) return true // unless step 2
//  return (placesSuggestion.indexOf(5.1) * placesSuggestion.indexOf(5.2) >= 0)
//}//

///****** general *********///

//// initial state
//let paths = {}
//for (let i = 0; i < totalPeople; i++) {
//  paths[i] = [initialPlaces[i % initialPlaces.length]]
//}//

//// console.log(paths)//
//

//const chooseRandomPlaces = (numberPlaces) => {
//  return randomSubset(places, numberPlaces)
//}//

//const chooseNewPlaceForPath = (path, newPlaces) => {
//  console.log("choosing new place for path ", path, " from " + newPlaces.length + " options")
//  const newPlace = tryBruteForce(
//    () => getPossibleNextPlaceForPath(path, connections),
//    (p) => (
//      newPlaces.indexOf(p) > -1 &&
//      pathPastValidator(path, p)
//    )
//  )
//  return newPlace
//}//

//const distributePeopleToPlaces = (newPlaces) => {
//  let newDistribution = []
//  for (let i = 0; i < totalPeople; i++) {
//    newDistribution[i] = newPlaces[i % newPlaces.length]
//    getPossibleNextPlaceForPath
//  }
//  let randomPlacesToPickFrom = _.shuffle(newDistribution)
//  let newPaths = {}
//  for (let i = 0; i < totalPeople; i++) {
//    const newPlace = chooseNewPlaceForPath(paths[i], randomPlacesToPickFrom)
//    newPaths[i]=newPlace
//    randomPlacesToPickFrom.splice(randomPlacesToPickFrom.indexOf(newPlace),1)
//  }
//  return newPaths
//}//

//const addStep = (step) => {
//  const numberPeople = steps[step]
//  const numberPlaces = Math.floor(totalPeople / numberPeople)
//  console.log("choosing " + numberPlaces + " places")
//  const newPlaces = tryBruteForce(
//    () => chooseRandomPlaces(numberPlaces),
//    (p) => (specialPlaceValidator(p,step)),
//  )
//  // distributing people
//  const newPaths = tryBruteForce(
//    () => distributePeopleToPlaces(newPlaces),
//    (p) => p.length == totalPeople,
//  )
//  for (let key in paths) {
//    paths[key].push(newPaths[i])
//  }
//  console.log(paths)
//}//

//for (let step = 0; step < steps.length; step ++) {
//  console.log("step " + step, paths)
//  addStep(step)
//}//

//function tryBruteForce(func, validator, max=1000000) {
//  for (let i = 1; i<=max; i++) {
//    let result = func()
//    if (validator(result)) {
//      console.log("success after " + i + " tries")
//      return result
//    }
//  }
//  console.log("failed after " + max + " tries")
//  process.exit(1);
//}//

///*********** helper  **************///

//function getPossibleNextPlaceForPath(path, connections) {
//  const lastPlace = path[path.length-1]
//  const possiblePlaces = connections[lastPlace]
//  return randomItem(possiblePlaces)
//}//

///********** validators ************///

//function pathPastValidator(path, newPlace) {
//  for (let p in path) {
//    if (p == newPlace) return (Math.random() < 0.5) // sometimes accept duplicate places
//  }
//  return true
//}