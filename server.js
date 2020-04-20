var express = require('express');

var app = express();
var server = app.listen(3001);
var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket){
    console.log('New connection id: ', socket.id);
    socket.on('mouse', mouseMsg);
    function mouseMsg(data) {
        socket.broadcast.emit('mouse', data);
        console.log(data);
    }
}

app.use(express.static('public'));

console.log("Server is running");
