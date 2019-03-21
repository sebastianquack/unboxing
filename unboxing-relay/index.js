express = require('express');

const app = express();
server = app.listen(process.env.PORT || 3005);

const io = require('socket.io')(server);

let challengeMap = {}; // {deviceId: {challengeId: }}

function updateChallengeMap(socket, challengeId) {
  let numParticipants = 0;
  for(let deviceId in challengeMap) {
    if(challengeMap[deviceId] == challengeId) {
      numParticipants++;
    }
  }
  socket.broadcast.emit('message', {code: "challengeParticipantUpdate", challengeId: challengeId, numParticipants: numParticipants})
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
          challengeMap[msg.deviceId] = msg.challengeId;
          updateChallengeMap(socket, msg.challengeId);
        }
      }

      if(msg.code == "leaveChallenge") {
         if(msg.deviceId && msg.challengeId) {
            delete challengeMap[msg.deviceId];
            updateChallengeMap(socket, msg.challengeId);
          } 
      }

      console.log(JSON.stringify(challengeMap));

      socket.broadcast.emit('message', msg);  

    });

  });

}

init(io);



