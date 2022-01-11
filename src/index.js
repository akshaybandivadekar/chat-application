const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

//socket.emit => event to specific client
//io.emit => event to every connected client
//socket.broadcast.emit => event to every connected client except current client

//io.to.emit => event to every connected client in same room
//socket.broadcast.io.emit => event every connected client except current client in same room 

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', ({username, room}) => {
        socket.join(room);

        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`));
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.emit('message', generateMessage(message));
        callback();
    });

    socket.on('sendLocation', (locationObj, callback) => {
        const {latitude, longitude} = locationObj;
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left!'));
    });
});

server.listen(port, () => {
    console.log(`Server is up on PORT : ${port}`);
});