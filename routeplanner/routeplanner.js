const _ = require('underscore')
const randomItem = function(list) { return _.sample(list) }
const randomSubset = function(list,  n) { return _.sample(list, n) }

/************ custom config ************/

const totalPeople = 37

const connections = { // places and connections to other places
  2: [3, 4, 6, 10],
  3: [2, 4, 5.1, ],
  4: [2, 3, 6, 7, 5.1],
  5.1:[3, 4],
  5.2:[10, 11],
  6: [4,7,8],
  7: [6,8,9,4],
  8: [6,7,9],
  9: [7,8,2,10],
  10:[11,9,2,5.2],
  11:[10,5.2,9]
}

const places = Object.keys(connections).map(parseFloat)

const initialPlaces = [
  2,3,4,6,7,10,11
]

const steps = [
  4+1,
  8+1,
  1,
  4+1,
  4+1,
  8+1,
  4+1,
  37
] // people per step

// 5.1 and 5.2 must appear together or not at all
function specialPlaceValidator(placesSuggestion, step) {
  if (step == 2) return true // unless step 2
  return (placesSuggestion.indexOf(5.1) * placesSuggestion.indexOf(5.2) >= 0)
}

/****** general *********/

// initial state
let paths = {}
for (let i = 0; i < totalPeople; i++) {
  paths[i] = [initialPlaces[i % initialPlaces.length]]
}

// console.log(paths)


const chooseRandomPlaces = (numberPlaces) => {
  return randomSubset(places, numberPlaces)
}

const chooseNewPlaceForPath = (path, newPlaces) => {
  console.log("choosing new place for path ", path, " from " + newPlaces.length + " options")
  const newPlace = tryBruteForce(
    () => getPossibleNextPlaceForPath(path, connections),
    (p) => (
      newPlaces.indexOf(p) > -1 &&
      pathPastValidator(path, p)
    )
  )
  return newPlace
}

const distributePeopleToPlaces = (newPlaces) => {
  let newDistribution = []
  for (let i = 0; i < totalPeople; i++) {
    newDistribution[i] = newPlaces[i % newPlaces.length]
    getPossibleNextPlaceForPath
  }
  let randomPlacesToPickFrom = _.shuffle(newDistribution)
  let newPaths = {}
  for (let i = 0; i < totalPeople; i++) {
    const newPlace = chooseNewPlaceForPath(paths[i], randomPlacesToPickFrom)
    newPaths[i]=newPlace
    randomPlacesToPickFrom.splice(randomPlacesToPickFrom.indexOf(newPlace),1)
  }
  return newPaths
}

const addStep = (step) => {
  const numberPeople = steps[step]
  const numberPlaces = Math.floor(totalPeople / numberPeople)
  console.log("choosing " + numberPlaces + " places")
  const newPlaces = tryBruteForce(
    () => chooseRandomPlaces(numberPlaces),
    (p) => (specialPlaceValidator(p,step)),
  )
  // distributing people
  const newPaths = tryBruteForce(
    () => distributePeopleToPlaces(newPlaces),
    (p) => p.length == totalPeople,
  )
  for (let key in paths) {
    paths[key].push(newPaths[i])
  }
  console.log(paths)
}

for (let step = 0; step < steps.length; step ++) {
  console.log("step " + step, paths)
  addStep(step)
}

function tryBruteForce(func, validator, max=1000000) {
  for (let i = 1; i<=max; i++) {
    let result = func()
    if (validator(result)) {
      console.log("success after " + i + " tries")
      return result
    }
  }
  console.log("failed after " + max + " tries")
  process.exit(1);
}

/*********** helper  **************/

function getPossibleNextPlaceForPath(path, connections) {
  const lastPlace = path[path.length-1]
  const possiblePlaces = connections[lastPlace]
  return randomItem(possiblePlaces)
}

/********** validators ************/

function pathPastValidator(path, newPlace) {
  for (let p in path) {
    if (p == newPlace) return (Math.random() < 0.5) // sometimes accept duplicate places
  }
  return true
}