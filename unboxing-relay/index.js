express = require('express');

const app = express();
server = app.listen(process.env.PORT || 3005);

const io = require('socket.io')(server, {
  pingTimeout: 30000,
});

// const mockInternet = require('./mock-internet-server')

let deviceMap = {}; // {deviceId: {challengeId: id, track: name}} -- used to store where devices are
let challengeState = {} // {challengeId: {sequenceControlStatus: startTime: }}


function joinChallenge(deviceId, challengeId) {
  if(!deviceMap[deviceId]) deviceMap[deviceId] = {};
  deviceMap[deviceId].challengeId = challengeId;
  deviceMap[deviceId].track = undefined; // reset track of device that just joined
  deviceMap[deviceId].timestamp = Date.now() / 1000;
   
  //console.log(deviceMap);
  //console.log("purging...");

  let now = Date.now() / 1000;

  // purge old devices from deviceMap
  for(let deviceId in deviceMap) {  
    if(now - deviceMap[deviceId].timestamp > 7200) { // 2 hours
      delete deviceMap[deviceId];
    }
  }
  checkChallengeState(challengeId);

  //console.log(deviceMap);
  //console.log(challengeState);
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
    if(deviceMap[deviceId].track && deviceMap[deviceId].challengeId == challengeId) {
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
  //console.log("updateDeviceMap", msgObj);
  socket.emit('message', msgObj);
  socket.broadcast.emit('message', msgObj);
}


function leaveChallenge(socket, deviceId, challengeId) {
  //console.log(deviceId, "leave challenge", challengeId)
  if(deviceId) {
     delete deviceMap[deviceId];
  }
  if(challengeId) {
     updateDeviceMap(socket, challengeId);
     checkChallengeState(challengeId);
  }
  //console.log("challengeState", challengeState)
}


function checkChallengeState(challengeId) {
  if(countParticipants(challengeId).total == 0) {
    if(challengeState[challengeId]) {
      challengeState[challengeId].sequenceControlStatus = "idle";   
    }
  }
}

function trackSelect(deviceId, challengeId, track) {
  if(!deviceMap[deviceId]) deviceMap[deviceId] = {};
    deviceMap[deviceId].challengeId = challengeId;
    deviceMap[deviceId].track = track;
    deviceMap[deviceId].timestamp = Date.now() / 1000;
}


function init(io) {

  // setup socket api
  io.on('connection', function(socket) {
    console.log('\nClient connected');
    
    socket.on('disconnect', (reason) => {
      console.log('\nClient disconnected, reason: ' + reason);
      if(socket.deviceId && socket.challengeId) {
        let now = Date.now() / 1000;
        if(deviceMap[socket.deviceId] && (now - deviceMap[socket.deviceId].timestamp) > 1200) { // 20 minutes
          leaveChallenge(socket, socket.deviceId, socket.challengeId)    
        }
      }
    });
    
    socket.on('message', function(msg) {
      console.log('\nreceived message');
      console.log(JSON.stringify(msg));

      let challengeId = msg.challengeId 
      + (msg.installationId ? "@" + msg.installationId : "")
      + (msg.placeId ? "@" + msg.placeId : "");
      
      //console.log("using challengeId: " + challengeId);

      if(msg.code == "selectTrack") {
        if(challengeId && msg.deviceId && msg.track) {
          console.log("selectTrack " + msg.track);
          trackSelect(msg.deviceId, challengeId, msg.track);
          updateDeviceMap(socket, challengeId);
        }
      }

      if(msg.code == "installationInfo") {
        let payload = {
          deviceMap: deviceMap,
          challengeState: challengeState
        }
        //console.log("sending back with payload", payload);
        socket.emit('message', {code: 'installationInfo', payload: payload});  
      }

      if(msg.code == "joinChallenge") {
        if(msg.challengeId && msg.deviceId) {
          joinChallenge(msg.deviceId, challengeId);
          trackSelect(msg.deviceId, challengeId, msg.track);
          updateDeviceMap(socket, challengeId);
          socket.deviceId = msg.deviceId
          socket.challengeId = challengeId

          if(challengeState[challengeId]) {
            if(msg.challengeShorthand) {
              challengeState[challengeId].shorthand = msg.challengeShorthand;
            }
            if(challengeState[challengeId].sequenceControlStatus == "playing") {
              socket.emit('message', {code: "startSequence", 
                challengeId: msg.challengeId, 
                installationId: msg.installationId,
                placeId: msg.placeId,
                startTime: challengeState[challengeId].startTime});  
            }
          } else {
            challengeState[challengeId] = {
              sequenceControlStatus: "idle"
            }
          }
        }
        //console.log("joining challenge")
        //console.log("challengeState", challengeState)
      }

      if(msg.code == "leaveChallenge") {
        leaveChallenge(socket, msg.deviceId, challengeId)
      }

      if(msg.code == "startSequence") {
        if(msg.challengeId) {
          if(!challengeState[challengeId]) {
            challengeState[challengeId] = {};
          }
          if(challengeState[challengeId].sequenceControlStatus != "playing") {
            challengeState[challengeId].sequenceControlStatus = "playing";
            challengeState[challengeId].startTime = msg.startTime;
          }
          //console.log(JSON.stringify(challengeState));
        }
      }

      socket.broadcast.emit('message', msg); // message is passed on with original challengeId, placeId, and installationId 

      console.log("\ndeviceMap");
      Object.keys(deviceMap).forEach((key)=>{
        console.log("* " + key + " " + JSON.stringify(deviceMap[key]))
      });
      console.log("\nchallengeState");
      Object.keys(challengeState).forEach((key)=>{
        console.log("* " + challengeState[key].shorthand + " " + key);
        console.log("  " + challengeState[key].sequenceControlStatus)
        console.log("  " + JSON.stringify(countParticipants(key)));
        console.log("  " + JSON.stringify(countSelectedTracks(key)));
      });
      

    });

  });

}

init(io);



