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
      console.log('Client disconnected: ' + socket.deviceId);
      Devices.update({ deviceId }, {$set:{connected: false}})
    });
    
    socket.on('message', async function(msg) {
      // console.log('Message received: ', msg);
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
  io.sockets.emit('message', {
    deviceIds,
    ...message
  });  
}

export { sendMessage }