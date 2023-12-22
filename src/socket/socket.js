// Server side socket session configuration
const { Server } = require("socket.io");
const sharedSession = require('express-socket.io-session');
const {getInstance} = require("../core/roomData");
// Database


// Export a function that takes the server instance and session middleware
module.exports = function configureSocket(server, sessionMiddleware, app) {
    const io = new Server(server, { connectionStateRecovery: {} });
    io.use(sharedSession(sessionMiddleware, {
        autoSave: true
    }));

    const roomData = getInstance();

    io.on('connection', (socket) => {
        console.log('New socket connection', socket.id);

        // =========== SOLO ===========
        //          Solo socket
        // =========== SOLO ===========

        socket.on('left-click', (data) => {
            const {row, col, roomId} = data;
            const room = roomData.getSoloRoom(roomId);
            //console.log("room:", room)
            const game = room.game;
            const res = game.handleLeftClick(row, col);

            if (res.gameEnded) {
                console.log("Game ended:", res.gameEnded);
                const room = roomData.getSoloRoom(roomId);
                room.finished = true;
                room.win = res.isGameWin;
            }

            //console.log("res:", res);
            console.log('left-click', row, col, "RoomId:", roomId);
            socket.emit('left-click', res);
        })

        socket.on('right-click', (data) => {
            const {row, col, roomId} = data;
            const room = roomData.getSoloRoom(roomId);
            const game = room.game;
            const res = game.handleRightClick(row, col);

            if (res.gameEnded) {
                console.log("Game ended:", res.gameEnded);
                const room = roomData.getSoloRoom(roomId);
                room.finished = true;
                room.win = res.isGameWin;
            }

            //console.log("res:", res);
            console.log('right-click', row, col, "RoomId:", roomId);
            socket.emit('right-click', res);
        })

        // =========== MULTI ===========
        //          Multi socket
        // =========== MULTI ===========

        socket.on('create-room', (data) => {
            console.log("Socket create-room for ", data.roomName);
            socket.join(data.roomName);
        })

        socket.on('join-room', (data) => {
            console.log("Socket join-room: ", data.roomName);
            socket.join(data.roomName);
        })

        socket.on('leave-room', (data) =>{
            console.log("Socket leave-room", data.roomName);
            const players = data.players;
            const username = data.username;

            players.splice(players.indexOf(username), 1);
            socket.leave(data.roomName);
            io.to(data.roomName).emit('receive-user-data', {players:players})
        })

        socket.on('propagate-user-data', (data) => {
            const players = data.players
            //console.log("Socket propagate-user-data", players, " Room:", data.roomName);
            io.to(data.roomName).emit('receive-user-data', {players:players})
        })
    });

};
