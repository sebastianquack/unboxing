express = require('express');
import { Devices, deviceSchema } from '../../collections'

const app = express();
server = app.listen(62901);

const io = require('socket.io')(server);

let sockets = []

Meteor.setTimeout(() => {
  const devices = Devices.find({}).fetch()
  for (let device of devices) {
    if (Date.now() - device.lastHeardOf > 6 * 60 * 60 * 1000) {// 6 hours
      Devices.update({_id: device._id}, { $set: deviceSchema })
    }
  }
}, 60000);

function init(io) {

  console.log("setting up admin socket...")

  // setup socket api
  io.on('connection', (socket)=> {
    console.log('Client connected');
    
    socket.on('disconnect', async function() {
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
      Devices.update({ deviceId }, {$set:{connected: true, lastHeardOf: Date.now()}})

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
    if(!message.payload.startTime) {
      message.payload.startTime = (message.payload.startTimeOffset*1000) + Date.now()  
    }
    
  }
  console.log("sending admin message", message)
  io.sockets.emit('message', {
    deviceIds,
    ...message
  });  
}

export { sendMessage }