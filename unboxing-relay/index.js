express = require('express');

const app = express();
server = app.listen(process.env.PORT || 3005);

const io = require('socket.io')(server);

let deviceMap = {}; // {deviceId: {challengeId: id, track: name}} -- used to store where devices are
let challengeState = {} // {challengeId: {sequenceControlStatus: startTime: }}

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
    selectedTracks: selectedTracks
  };
  console.log("updateDeviceMap", msgObj);
  socket.emit('message', msgObj);
  socket.broadcast.emit('message', msgObj);
}

function leaveChallenge(socket, deviceId, challengeId) {
  console.log("leave challenge", deviceId, challengeId)

  if(deviceId) {
     delete deviceMap[deviceId];
  }

  if(challengeId) {
     
     updateDeviceMap(socket, challengeId);
     if(countParticipants(challengeId) == 0) {
       challengeState[challengeId].sequenceControlStatus = "idle";  
     }
   
  }

  console.log("challengeState", challengeState)
}


function init(io) {

  // setup socket api
  io.on('connection', function(socket) {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected')
      leaveChallenge(socket, socket.deviceId, socket.challengeId)
    });
    
    socket.on('message', async function(msg) {
      console.log('received message: ' + JSON.stringify(msg));

      if(msg.code == "selectTrack") {
        if(msg.challengeId && msg.deviceId && msg.track) {
          console.log("selectTrack " + msg.track);
          if(!deviceMap[msg.deviceId]) deviceMap[msg.deviceId] = {};
          deviceMap[msg.deviceId].challengeId = msg.challengeId;
          deviceMap[msg.deviceId].track = msg.track;
          updateDeviceMap(socket, msg.challengeId);
        }
      }

      if(msg.code == "joinChallenge") {
        if(msg.challengeId && msg.deviceId) {
          if(!deviceMap[msg.deviceId]) deviceMap[msg.deviceId] = {};
          deviceMap[msg.deviceId].challengeId = msg.challengeId;
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

      console.log("deviceMap: " + JSON.stringify(deviceMap));

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



