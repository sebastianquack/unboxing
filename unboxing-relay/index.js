express = require('express');

const app = express();
server = app.listen(process.env.PORT || 3005);

const io = require('socket.io')(server);

let deviceMap = {}; // {deviceId: {challengeId: }} -- used to store where devices are
let challengeState = {} // {challengeId: {sequenceControlStatus: startTime: }}

function countParticipants(challengeId) {
  let numParticipants = 0;
  for(let deviceId in deviceMap) {
    if(deviceMap[deviceId] == challengeId) {
      numParticipants++;
    }
  }
  return numParticipants;
}

function updateDeviceMap(socket, challengeId) {
  let numParticipants = countParticipants(challengeId);
  let msgObj = {code: "challengeParticipantUpdate", challengeId: challengeId, numParticipants: numParticipants};
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

      if(msg.code == "joinChallenge") {
        if(msg.challengeId && msg.deviceId) {
          deviceMap[msg.deviceId] = msg.challengeId;
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

      console.log(JSON.stringify(deviceMap));

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



