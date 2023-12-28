const express = require('express');
const { verify } = require('jsonwebtoken');
const { isConnectedPG, changeUsernamePG, getHashUserPG, changePasswordPG, deleteUserPG, deleteConnectionPG} = require('../database/dbAuth');
const { getClient } = require('../database/dbSetup');
const {verifyConnection} = require("../miscFunctions/functions");
const {getStats} = require("../database/dbStats");
const {compare, hash} = require("bcrypt");
const {getTopScores} = require("../database/dbLeaderboard");
const {getInstance, reduceID} = require("../core/roomData");
const router = express.Router();

router.get('/api/check-auth', async (req, res) => {
    const token = req.cookies.token;
    if (token) {
        verify(token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                res.status(401).send({ message: 'Unauthorized' });
            } else {
                try {
                    const isConnected = await isConnectedPG(getClient(), token);
                    if (!isConnected) {
                        //console.log('Token expired');
                        res.status(401).send({ message: 'Unauthorized' });
                    } else {
                        //console.log('Token valid');
                        //console.log('Role:', req.session.role)
                        if (!req.session.username) {
                            req.session.accountUsername = decoded.username;
                        }
                        res.status(200).send({ message: 'Authorized', role: req.session.role});
                    }
                } catch (error) {
                    console.error('Error checking authentication:', error);
                    res.status(500).send({ message: 'Internal Server Error' });
                }
            }
        });
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
});

router.get('/api/check-not-auth', async (req, res) => {
    const token = req.cookies.token;

    // Check if the token exists and isConnected
    if (!token) {
        res.status(200).send({ message: 'Not log in' });
    } else {
        try {
            const isConnected = await isConnectedPG(getClient(), token);

            if (isConnected) {
                await deleteConnectionPG(getClient(), token);
                res.status(200).send({ message: 'Already log in, user disconnected' });
            } else {
                res.status(200).send({ message: 'Not log in' });
            }
        } catch (error) {
            console.error('Error checking connection:', error);
            res.status(401).send({ message: 'Unauthorized' });
        }
    }
});

router.get('/api/get-stats', verifyConnection, async (req, res) => {
    try {
        //console.log('AccountUsername:', req.session.accountUsername);
        const stats = await getStats(getClient(), req.session.accountUsername);
        res.status(200).send({stats: stats});
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

router.get('/api/get-leaderboard', async (req, res) => {
    try {
        const leaderboard = await getTopScores(getClient());
        res.status(200).send({leaderboard: leaderboard});
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).send({message: 'Internal Server Error'});
    }
})

/* =============
    Profile API
   ============= */

router.post('/api/change-username', verifyConnection, async (req, res) => {
    try {
        if (req.session.accountUsername !== req.body.username) {
            await changeUsernamePG(getClient(), req.session.accountUsername, req.body.username);
            req.session.accountUsername = req.body.username;
            res.cookie('username', req.body.username, {httpOnly: false}); //Non-sensitive data
            res.status(200).send({ message: 'Username changed' });
        } else {
            res.status(200).send({ message: 'Username is the same' });
        }

    } catch (error) {
        console.error('Error changing username:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

router.post('/api/change-password', async (req, res) => {
    try {
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        if (newPassword !== confirmPassword) {
            res.status(400).send({ message: 'Passwords do not match' });
        } else {
            const pgClient = getClient();
            const hashedPassword = await getHashUserPG(pgClient, req.session.accountUsername);
            compare(currentPassword, hashedPassword, async (bcryptError, bcryptResult) => {
                if (bcryptError) {
                    console.error('Error occurred while comparing passwords:', bcryptError);
                    return res.status(500).send('Internal Server Error');
                }

                if (!bcryptResult) {
                    // Incorrect password
                    res.status(400).send({ message: 'Incorrect password' });
                } else {
                    // Password is correct, proceed
                    const hashedNewPassword = await hash(newPassword, 10)
                    console.log("Hashed new password:", hashedNewPassword)
                    await changePasswordPG(pgClient, req.session.accountUsername, hashedNewPassword);
                    res.status(200).send({ message: 'Password changed' });
                }
            });
        }

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

router.post('/api/delete-account', verifyConnection, async (req, res) => {
    try {
        await deleteUserPG(getClient(), req.session.accountUsername);
        await deleteConnectionPG(getClient(), req.cookies.token);
        //console.log("Clearing cookie")
        res.clearCookie('token');
        res.clearCookie('username');

        //console.log("Clearing session")
        req.session.username = null;
        req.session.accountUsername = null;
        res.status(200).send({ message: 'Account deleted' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

/* ===============
    Solo Room API
   =============== */

const roomData = getInstance();

router.post('/api/create-solo-room', (req, res) => {
    try {
        const {rows, cols} = req.body;
        const username = req.session.accountUsername;
        const roomId = roomData.addSoloRoom(rows, cols, username);
        //console.log("Create Room:", roomData.getSoloRoom(roomId));
        res.cookie('roomId', roomId, {httpOnly: false})
        res.status(200).send({roomId: roomId});
    } catch (error) {
        console.error('Error creating solo game (api):', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

router.post('/api/join-solo-room', (req, res) => {
    try {
        const roomId = req.body.roomId;
        const username = req.session.accountUsername || "Anonymous";
        const roomIdJoined = roomData.joinSoloRoom(roomId, username);
        const room = roomData.getSoloRoom(roomIdJoined);
        const currentGrid = room.game.currentGrid;

        if (room.finished) {
            const grid = room.game.grid.revealGrid();
            res.status(200).send({ roomId: roomIdJoined, room: grid, isFinished: true, isGameWin: room.win, numBombs: 0 });
        } else {
            // Set all the non-visible cells to -1
            // Tell the client only where are the cells that he discovered
            for (let i = 0; i < currentGrid.length; i++) {
                for (let j = 0; j < currentGrid.width; j++) {
                    if (!currentGrid.matrix[i][j].isVisible() && !currentGrid.matrix[i][j].isFlagged()) {
                        currentGrid.matrix[i][j].setNumber(-1);
                    }
                }
            }

            //console.log("Join Room:", room.game.currentGrid);
            console.log("Join Room:", room.game.currentBombs)
            res.status(200).send({ roomId: roomIdJoined, room: currentGrid, numBombs: room.game.currentBombs });
        }
    } catch (error) {
        console.error('Error joining solo game (api):', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

router.post('/api/leave-solo-room', (req, res) => {
    try {
        const roomId = req.body.roomId;
        roomData.removeSoloRoom(roomId);
        res.status(200).send({ message: 'Solo room deleted' });
    } catch (error) {
        console.error('Error leaving solo game (api):', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

/* ================
    Multi Room API
   ================ */

router.get('/api/get-multi-rooms', (req, res) => {
    const allRooms = roomData.getAllMultiRooms();
    console.log("Get Rooms:", allRooms);
    res.status(200).send({ allRooms });
})

router.post('/api/create-multi-room', (req, res) => {
    try {
        const {roomName, ranked} = req.body;
        const username = req.session.accountUsername;
        const roomId = roomData.addMultiRoom(roomName, 1, username, ranked)
        console.log("Create Room:", roomData.getMultiRoom(roomId));
        res.cookie('multiRoomId', roomId, {httpOnly: false})
        res.status(200).send({multiRoomId: roomId, players: [username]});
    } catch (error) {
        console.error('Error creating multi game (api):', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

router.post('/api/join-multi-room', (req, res) => {
    try {
        const roomId = req.body.roomId;
        const username = req.session.accountUsername;
        const roomIdJoined = roomData.joinMultiRoom(roomId, username);
        const room = roomData.getMultiRoom(roomIdJoined);
        console.log("Room:", room)

        if (room.finished) {
            //@TODO: Return the results
            const results = room.game.getMultiResults();
            res.status(200).send({ roomId: roomIdJoined, roomName: room.name, players: room.players, ranked: room.ranked, results: results });
        } else if (room.started) {
            const game = room.game;
            const grid = game.getMultiGrid(username);
            const currentGrid = grid.currentGrid;
            const timeElapsed = grid.timeElapsed;
            const numBombs = grid.currentGrid.numBombs;

            // TODO Maybe do something for the exploded bombs
            // TODO They are transformed into flag for now
            // Set all the non-visible cells to -1
            // Tell the client only where are the cells that he discovered
            for (let i = 0; i < currentGrid.length; i++) {
                for (let j = 0; j < currentGrid.width; j++) {
                    if (!currentGrid.matrix[i][j].isVisible() && !currentGrid.matrix[i][j].isFlagged()) {
                        currentGrid.matrix[i][j].setNumber(-5);
                    }
                }
            }

            res.status(200).send({ roomId: roomIdJoined, roomName: room.name, players: room.players, ranked: room.ranked, started: true, grid: currentGrid, numBombs:numBombs, timeElapsed: timeElapsed });
        } else {

            // Check if the user is already in the room
            if (req.cookies.multiRoomId) {
                // Already in a room
                console.log("Join Room:", room.name)
                console.log("Already in a room (api):", req.cookies.multiRoomId)
                res.status(200).send({ roomId: roomIdJoined, roomName: room.name, ranked: room.ranked, players: room.players });
            } else {
                // Just join the room
                // Do +1 to the number of players
                console.log("Join Room (api):", room.name)
                room.numPlayers++;
                res.cookie('multiRoomId', roomIdJoined, {httpOnly: false})
                res.status(200).send({ roomId: roomIdJoined, roomName: room.name, ranked: room.ranked, players: room.players });
            }

        }
    } catch (error) {
        console.error('Error joining multi game (api):', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

router.post('/api/leave-multi-room', (req, res) => {
    try {
        const roomId = req.body.roomId;
        console.log("RoomId:", roomId)
        const room = roomData.getMultiRoom(roomId);

        if (!room) {
            res.status(400).send({ message: 'Room does not exist' });
        } else {
            // Reduce the number of players
            room.numPlayers--;

            // Delete the room
            if (room.numPlayers <= 0) {
                roomData.removeMultiRoom(roomId);
                res.status(200).send({ message: 'Multi room deleted' });
            }
            // Leave the room
            else {
                // Remove user from players array
                const username = req.session.accountUsername;
                room.players = room.players.filter(player => player !== username);
                res.status(200).send({ message: 'Multi room left' });
            }
            console.log("Leave Room (api):", room.name)
        }

    } catch (error) {
        console.error('Error leaving multi game (api):', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

module.exports = router;
