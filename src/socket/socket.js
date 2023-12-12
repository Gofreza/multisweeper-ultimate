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

        socket.on('left-click', (data) => {
            const {row, col, roomId} = data;
            const room = roomData.getSoloRoom(roomId);
            //console.log("room:", room)
            const game = room.game;
            const res = game.handleLeftClick(row, col);
            //console.log("res:", res);
            console.log('left-click', row, col, "RoomId:", roomId);
            socket.emit('left-click', res);
        })

        socket.on('right-click', (data) => {
            const {row, col, roomId} = data;
            const room = roomData.getSoloRoom(roomId);
            const game = room.game;
            const res = game.handleRightClick(row, col);
            console.log("res:", res);
            console.log('right-click', row, col, "RoomId:", roomId);
            socket.emit('right-click', res);
        })
    });

};
