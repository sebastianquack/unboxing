express = require('express');

const app = express();
server = app.listen(3004);

const io = require('socket.io')(server);

function init(io) {

  // setup socket api
  io.on('connection', function(socket) {
    console.log('Client connected: ' + socket.deviceId);
    
    socket.on('disconnect', () => {
      console.log('Client disconnected: ' + socket.deviceId);
      
    });
    
    socket.on('message', async function(msg) {
      console.log('Message received: ', msg);
    });
  });
}

init(io);