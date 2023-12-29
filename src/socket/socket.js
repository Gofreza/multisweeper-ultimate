// Server side socket session configuration
const { Server } = require("socket.io");
const sharedSession = require('express-socket.io-session');
const {getInstance} = require("../core/roomData");
const {calculateRankedPoints} = require("../miscFunctions/rankedCalculs");
const {getPlayersArrayFromGameResults} = require("../miscFunctions/rankedCalculs");

// Export a function that takes the server instance and session middleware
module.exports = function configureSocket(server, sessionMiddleware, app) {
    const io = new Server(server, { connectionStateRecovery: {} });
    io.use(sharedSession(sessionMiddleware, {
        autoSave: true
    }));

    const roomData = getInstance();

    io.on('connection', (socket) => {
        console.log('New socket connection', socket.id);

        // Handle connection errors
        socket.on('error', (error) => {
            console.error('Socket connection error:', error);
        });

        //TODO Refactor the two left and right click functions

        // =========== SOLO ===========
        //          Solo socket
        // =========== SOLO ===========

        socket.on('left-click', (data) => {
            const {row, col, roomId} = data;
            const room = roomData.getSoloRoom(roomId);
            console.log("room:", room)
            const game = room.game;
            const res = game.handleLeftClick(row, col);

            if (res.gameEnded) {
                console.log("Solo Game ended:", res.gameEnded);
                const room = roomData.getSoloRoom(roomId);
                room.finished = true;
                room.win = res.isGameWin;
            }

            //console.log("res:", res);
            //console.log('left-click', row, col, "RoomId:", roomId);
            socket.emit('left-click', res);
        })

        socket.on('right-click', (data) => {
            const {row, col, roomId} = data;
            const room = roomData.getSoloRoom(roomId);
            const game = room.game;
            const res = game.handleRightClick(row, col);

            if (res.gameEnded) {
                console.log("Solo Game ended:", res.gameEnded);
                const room = roomData.getSoloRoom(roomId);
                room.finished = true;
                room.win = res.isGameWin;
            }

            //console.log("res:", res);
            //console.log('right-click', row, col, "RoomId:", roomId);
            socket.emit('right-click', res);
        })

        // =========== MULTI ===========
        //          Multi socket
        // =========== MULTI ===========

        socket.on('left-click-multi', (data) => {
            const {row, col, roomId, username} = data;
            const room = roomData.getMultiRoom(roomId);
            //console.log("Handle left click multi:", row, col, roomId, username)
            const game = room.game;
            const res = game.handleMultiLeftClick(row, col, username);

            if (res.gameEnded) {
                console.log("Game ended:", res.gameEnded, "RoomId:", roomId);
                const room = roomData.getMultiRoom(roomId);
                //console.log("Room:", room)
                console.log("Check if all multi games ended:", game.checkIfAllMultiGamesEnded(room.numPlayers), room.numPlayers)
                if (game.checkIfAllMultiGamesEnded(room.numPlayers)) {
                    room.finished = true;
                    room.winner = username;
                    room.started = false;
                    const results = game.getMultiResults();

                    if (room.ranked && room.numPlayers > 1) {
                        console.log("Ranked game, calculating points")
                        calculateRankedPoints(results)
                            .then(() => {
                                console.log("Ranked points calculated")
                            })
                    }

                    io.to(data.roomName).emit('multi-game-ended', results);
                }
                else {
                    socket.emit('multi-game-waiting', res);
                }
            } else {
                //console.log("res:", res);
                //console.log('left-click-multi', row, col, "RoomId:", roomId);
                //console.log("Res:", res)
                socket.emit('left-click-multi', res);
            }
        })

        socket.on('right-click-multi', (data) => {
            const {row, col, roomId, username} = data;
            const room = roomData.getMultiRoom(roomId);
            const game = room.game;
            const res = game.handleMultiRightClick(row, col, username);

            if (res.gameEnded) {
                console.log("Game ended:", res.gameEnded, "RoomId:", roomId);
                const room = roomData.getMultiRoom(roomId);
                //console.log("Room:", room)
                console.log("Check if all multi games ended:", game.checkIfAllMultiGamesEnded(room.numPlayers), room.numPlayers)
                if (game.checkIfAllMultiGamesEnded(room.numPlayers)) {
                    room.finished = true;
                    room.winner = username;
                    room.started = false;
                    const results = game.getMultiResults();

                    if (room.ranked && room.numPlayers > 1) {
                        console.log("Ranked game, calculating points")
                        calculateRankedPoints(results)
                            .then(() => {
                                console.log("Ranked points calculated")
                        })
                    }

                    io.to(data.roomName).emit('multi-game-ended', results);
                }
                else {
                    socket.emit('multi-game-waiting', res);
                }
            } else {
                //console.log("res:", res);
                //console.log('right-click-multi', row, col, "RoomId:", roomId);
                //console.log("Res:", res)
                socket.emit('right-click-multi', res);
            }
        })

        socket.on('create-room', (data) => {
            console.log("Socket create-room: ", data.roomName);
            socket.join(data.roomName);
        })

        socket.on('join-room', (data) => {
            console.log("Socket join-room: ", data.roomName);
            socket.join(data.roomName);
        })

        socket.on('leave-room', (data) =>{
            //TODO: Check if all players have finished when someone leaves
            console.log("Socket leave-room", data.roomName, data.players);
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

        socket.on('start-multi-game', (data) => {
            console.log("Socket start-game", data.roomName, "Data:", data);
            const roomId = data.roomId;
            const rows = data.rows;
            const cols = data.cols;
            roomData.launchMultiRoom(roomId, rows, cols);
            io.to(data.roomName).emit('start-multi-game', {cols:data.cols, rows:data.rows})
        })

        socket.on('restart-multi-game', (data) => {
            console.log("Socket restart-game", data.roomName, "Data:", data);
            const roomId = data.roomId;
            const rows = data.rows;
            const cols = data.cols;
            roomData.restartMultiRoom(roomId, rows, cols);
            io.to(data.roomName).emit('restart-multi-game', {cols:data.cols, rows:data.rows})
        })
    });

    // Handle server-level socket errors
    io.on('error', (error) => {
        console.error('Server socket error:', error);
    });

};
