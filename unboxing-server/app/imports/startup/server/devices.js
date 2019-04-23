express = require('express');
import { Devices } from '../../collections/devices'

const app = express();
server = app.listen(3004);

const io = require('socket.io')(server);

function init(io) {

  // setup socket api
  io.on('connection', function(socket) {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected: ' + socket.deviceId);
      Devices.update({ deviceId }, {$set:{connected: false}})
    });
    
    socket.on('message', async function(msg) {
      console.log('Message received: ', msg);
      socket.deviceId = msg.deviceId // store deviceId
      Devices.update({ deviceId }, {$set:{connected: true}})

      if (msg.code == "statusUpdate") {
        Devices.update({ deviceId }, {$set:{deviceStatus: payload}})
      }

    });
  });
}

init(io);