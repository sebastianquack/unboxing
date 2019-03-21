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

function init(io) {

  // setup socket api
  io.on('connection', function(socket) {
    console.log('Client connected');
    
    socket.on('disconnect', () => console.log('Client disconnected'));
    
    socket.on('message', async function(msg) {
      console.log('received message: ' + JSON.stringify(msg));

      if(msg.code == "joinChallenge") {
        if(msg.challengeId && msg.deviceId) {
          deviceMap[msg.deviceId] = msg.challengeId;
          updateDeviceMap(socket, msg.challengeId);

          if(challengeState[msg.challengeId]) {
            if(challengeState[msg.challengeId].sequenceControlStatus == "playing") {
              socket.emit('message', {code: "startSequence", challengeId: msg.challengeId, startTime: challengeState[msg.challengeId].startTime});  
            }
          }
        }
      }

      if(msg.code == "leaveChallenge") {
         if(msg.deviceId) {
            delete deviceMap[msg.deviceId];
         }

         if(msg.challengeId) {
            
            updateDeviceMap(socket, msg.challengeId);
            if(countParticipants(msg.challengeId) == 0) {
              challengeState[msg.challengeId].sequenceControlStatus = "idle";  
            }
          
          } 
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



