express = require('express');

const app = express();
server = app.listen(process.env.PORT || 3005);

const io = require('socket.io')(server);

// const mockInternet = require('./mock-internet-server')

let deviceMap = {}; // {deviceId: {challengeId: id, track: name}} -- used to store where devices are
let challengeState = {} // {challengeId: {sequenceControlStatus: startTime: }}


function joinChallenge(deviceId, challengeId) {
  if(!deviceMap[deviceId]) deviceMap[deviceId] = {};
  deviceMap[deviceId].challengeId = challengeId;
  deviceMap[deviceId].track = undefined; // reset track of device that just joined
  deviceMap[deviceId].timestamp = Date.now() / 1000;
  
  console.log(deviceMap);
  console.log("purging...");

  let now = Date.now() / 1000;

  // purge old devices from deviceMap
  for(let deviceId in deviceMap) {  
    if(now - deviceMap[deviceId].timestamp > 7200) { // 2 hours
      delete deviceMap[deviceId];
    }
  }
  checkChallengeState(challengeId);


  console.log(deviceMap);
  console.log(challengeState);
}


// returns {withInstrument: x, total: y}
function countParticipants(challengeId) {
  let numParticipantsTotal = 0;
  let numParticipantsWithInstrument = 0;
  for(let deviceId in deviceMap) {
    if(deviceMap[deviceId].challengeId == challengeId) {
      numParticipantsTotal++;
      if(deviceMap[deviceId].track) {
        numParticipantsWithInstrument++;
      }
    }
  }
  return {withInstrument: numParticipantsWithInstrument, total: numParticipantsTotal}
}


// returns {piano: 2, violin1: 4}
function countSelectedTracks(challengeId) {
  let selectedTracks = {};
  for(let deviceId in deviceMap) {
    if(deviceMap[deviceId].track) {
      if(!selectedTracks[deviceMap[deviceId].track]) selectedTracks[deviceMap[deviceId].track] = 0;
      selectedTracks[deviceMap[deviceId].track]++;
    }
  }
  return selectedTracks; 
}


function updateDeviceMap(socket, challengeId) {
  let numParticipants = countParticipants(challengeId);
  let selectedTracks = countSelectedTracks(challengeId);
  let msgObj = {
    code: "challengeParticipantUpdate", 
    challengeId: challengeId, 
    numParticipants: numParticipants.total,
    numParticipantsWithInstrument: numParticipants.withInstrument,
    selectedTracks: selectedTracks,
    deviceMap: deviceMap
  };
  console.log("updateDeviceMap", msgObj);
  socket.emit('message', msgObj);
  socket.broadcast.emit('message', msgObj);
}


function leaveChallenge(socket, deviceId, challengeId) {
  console.log(deviceId, "leave challenge", challengeId)
  if(deviceId) {
     delete deviceMap[deviceId];
  }
  if(challengeId) {
     updateDeviceMap(socket, challengeId);
     checkChallengeState(challengeId);
  }
  console.log("challengeState", challengeState)
}


function checkChallengeState(challengeId) {
  if(countParticipants(challengeId).total == 0) {
    if(challengeState[challengeId]) {
      challengeState[challengeId].sequenceControlStatus = "idle";   
    }
  }
}


function init(io) {

  // setup socket api
  io.on('connection', function(socket) {
    console.log('\nClient connected');
    
    socket.on('disconnect', () => {
      console.log('\nClient disconnected');
      if(socket.deviceId && socket.challengeId) {
        leaveChallenge(socket, socket.deviceId, socket.challengeId)  
      }
    });
    
    socket.on('message', function(msg) {
      console.log('\nreceived message: ' + JSON.stringify(msg));

      if(msg.code == "selectTrack") {
        if(msg.challengeId && msg.deviceId && msg.track) {
          console.log("selectTrack " + msg.track);
          if(!deviceMap[msg.deviceId]) deviceMap[msg.deviceId] = {};
          deviceMap[msg.deviceId].challengeId = msg.challengeId;
          deviceMap[msg.deviceId].track = msg.track;
          deviceMap[msg.deviceId].timestamp = Date.now() / 1000;
          updateDeviceMap(socket, msg.challengeId);
        }
      }

      if(msg.code == "installationInfo") {
        let payload = {
          deviceMap: deviceMap,
          challengeState: challengeState
        }
        console.log("sending back with payload", payload);
        socket.emit('message', {code: 'installationInfo', payload: payload});  
      }

      if(msg.code == "joinChallenge") {
        if(msg.challengeId && msg.deviceId) {
          joinChallenge(msg.deviceId, msg.challengeId);
          updateDeviceMap(socket, msg.challengeId);
          socket.deviceId = msg.deviceId
          socket.challengeId = msg.challengeId

          if(challengeState[msg.challengeId]) {
            if(challengeState[msg.challengeId].sequenceControlStatus == "playing") {
              socket.emit('message', {code: "startSequence", challengeId: msg.challengeId, startTime: challengeState[msg.challengeId].startTime});  
            }
          } else {
            challengeState[msg.challengeId] = {
              sequenceControlStatus: "idle"
            }
          }
        }
        console.log("joining challenge")
        console.log("challengeState", challengeState)
      }

      if(msg.code == "leaveChallenge") {
        leaveChallenge(socket, msg.deviceId, msg.challengeId)
      }

      if(msg.code == "startSequence") {
        if(msg.challengeId) {
          if(!challengeState[msg.challengeId]) {
            challengeState[msg.challengeId] = {};
          }
          if(challengeState[msg.challengeId].sequenceControlStatus != "playing") {
            challengeState[msg.challengeId].sequenceControlStatus = "playing";
            challengeState[msg.challengeId].startTime = msg.startTime;
          }
          console.log(JSON.stringify(challengeState));
        }
      }

      socket.broadcast.emit('message', msg);  

    });

  });

}

init(io);



