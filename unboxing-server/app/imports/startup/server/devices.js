express = require('express');

const app = express();
server = app.listen(3004);

const io = require('socket.io')(server);