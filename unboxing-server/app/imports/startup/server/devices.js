express = require('express');
import { Devices } from '../../collections'

const app = express();
server = app.listen(3004);

const io = require('socket.io')(server);

let sockets = []

function init(io) {

  console.log("setting up admin socket...")

  // setup socket api
  io.on('connection', function(socket) {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
      const deviceId = socket.deviceId
      console.log('Client disconnected: ' + deviceId);
      if (deviceId) {
        Devices.update({ deviceId }, {$set:{connected: false}})
      }
    });
    
    socket.on('message', async function(msg) {
      console.log('Message received: ', msg);
      const deviceId = parseInt(msg.deviceId)
      socket.deviceId = deviceId // store deviceId
      deviceId, Devices.update({ deviceId }, {$set:{connected: true}})

      if (msg.code == "statusUpdate") {
        Devices.update({ deviceId }, {$set:{deviceStatus: msg.payload}})
      }

    });
  });
}

//WebApp.connectHandlers.use(app);

init(io);

const sendMessage = ( deviceIds, message) => {
  if (message.payload && message.payload.tag) {
    message.payload.startTime = (message.payload.startTimeOffset*1000) + Date.now()
  }
  console.log("sending admin message", message)
  io.sockets.emit('message', {
    deviceIds,
    ...message
  });  
}

export { sendMessage }