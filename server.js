const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

const utils = require('./utils');
const currentSessionsArray = [];

app.use(express.static(__dirname + '/public'));

function onConnection(socket) {
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data)
  });

  socket.on('drawingInSession', (data) => {
    socket.broadcast.to(data.sessionId).emit('drawingInSession', data);
  });

  socket.on("createSession", () => {
    let newSessionId = utils.randomSessionId(currentSessionsArray);
    currentSessionsArray.push(newSessionId);
    socket.join(newSessionId);
    socket.emit("createdSession", {
      success: true,
      sessionId: newSessionId
    });
  });

  socket.on("joinSession", (data) => {
    if (currentSessionsArray.includes(data.sessionId)) {
      socket.join(data.sessionId);
      socket.emit("joinedSession", {
        success: true,
        sessionId: data.sessionId
      })
    }
  })
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));
