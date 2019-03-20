const express = require('express');

const app = express();
server = app.listen(process.env.PORT || 3000);

const io = require('socket.io')(server);

async function joinRoom(io, socket, room) {
  console.log("joining " + room);
  await socket.join(room);
}

function init(io) {

  // setup socket api
  io.on('connection', function(socket) {
    console.log('Client connected');
    
    if(socket.handshake.query.currentRoomId && !socket.room) {
      console.log("query param found, rejoining room...");
      joinRoom(io, socket, socket.handshake.query.currentRoomId);
    }

    socket.on('disconnect', () => console.log('Client disconnected'));

    socket.on('joinRoom', async function(room) {
      console.log("signup request for room " + room);
      console.log("current room for this socket: " + socket.room);
      // check if socket already has a room
      if(socket.room) {
        if(socket.room != room) {
          console.log("socket already in another room " + socket.room + ", leaving...");
          await socket.leave(socket.room);
        }
      }
      // check if room needs to be changed
      if(socket.room != room) {
        joinRoom(io, socket, room);
      }
      
    });

    socket.on('leaveRoom', function(room) {
      console.log("removing socket from room " + room);
      //socket.broadcast.in(socket.room).emit('message', {system: true, message: "a human left"});
      socket.leave(room);
      socket.room = null;
    });
    
    socket.on('message', async function(msg) {
      console.log('received message: ' + JSON.stringify(msg));

      if(socket.room != msg.room) {
        console.log("re-assigning to room");
        if(socket.room) {
          await socket.leave(socket.room);
        }
        await socket.join(msg.room);
        socket.room = msg.room;
      }

      socket.broadcast.in(socket.room).emit('message', {message: msg.message});  

      
    });

  });

}

init(io);



