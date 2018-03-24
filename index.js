var app1 = require('express')();
var http1 = require('http').Server(app1);
var io1 = require('socket.io')(http1);
var port1 = process.env.PORT || 3000;

app1.get('/', function(req, res){
  res.sendFile('/home/aditya/LiveWhiteboardServer/public/index.html');
});

io1.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io1.emit('chat message', msg);
  });
});

http1.listen(port1, function(){
  console.log('listening on *:' + port1);
});

