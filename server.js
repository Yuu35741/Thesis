var express = require('express');

var app = express();
var router = express.Router();
var server = app.listen(3001, () => {
    console.log("Server is running on port 3001");
});

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var socket = require('socket.io');
var io = socket(server);
var fs = require('fs');

io.sockets.on('connection', newConnection);

app.get('/rooms', function (req, res) {
    console.log("Received GET request");
    fs.readFile('database/rooms.json', (err, data) => {
        if (err) throw err;
        if (Object.keys(data).length === 0) res.send("Empty")
        else {
            let rooms = JSON.parse(data);
            console.log(rooms);
            res.send(rooms);
        };
    });
})

app.post("/create", function (req, res) {
    console.log("Received POST create");
    fs.readFile('database/rooms.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            obj = JSON.parse(data); //now it an object
            obj.rooms.push({ id: obj.rooms.length, host: req.body.username, players: [req.body.username] }); //add some data
            var roominfo = obj.rooms[obj.rooms.length - 1];
            console.log(roominfo);
            json = JSON.stringify(obj); //convert it back to json
            fs.writeFile('database/rooms.json', json, function (err, result) {
                if (err) console.log('error', err);
            });
            res.send(JSON.stringify(roominfo));
        }
    });
});

app.post("/join", function (req, res) {
    if (req.body.username != req.body.host) {
        console.log("Received POST join");
        console.log(req.body.username, req.body.host);
        fs.readFile('database/rooms.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                obj = JSON.parse(data); //now it an object
                var index = obj.rooms.findIndex(function (item, i) {
                    return item.host === req.body.host
                });
                obj.rooms[index].players.push(req.body.username); //add some data
                console.log(obj.rooms[index].players);
                json = JSON.stringify(obj); //convert it back to json
                fs.writeFile('database/rooms.json', json, function (err, result) {
                    if (err) console.log('error', err);
                });
                res.send(JSON.stringify(obj.rooms[index]));
            }
        });
    };
});

app.post("/leave", function (req, res) {
    console.log("Received POST leave");
    if (req.body.username == req.body.host) {
        fs.readFile('database/rooms.json', 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                obj = JSON.parse(data); //now it an object
                var index = obj.rooms.findIndex(function (item, i) {
                    return item.host === req.body.host
                });
                obj.rooms.splice(index, 1);
                json = JSON.stringify(obj);
                fs.writeFile('database/rooms.json', json, function (err, result) {
                    if (err) console.log('error', err);
                });
                res.sendStatus(200);
            }
        });
    } else {

    };
});

function newConnection(socket){
    console.log('New connection id: ', socket.id);
    socket.on('mouse', mouseMsg);
    function mouseMsg(data) {
        socket.broadcast.emit('mouse', data);
        console.log(data);
    }
}

app.use(express.static('public'));


