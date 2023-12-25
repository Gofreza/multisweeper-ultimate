const Game = require("./game");

const DIFFICULTY_NORMAL = 0.15;

class RoomData {

    // Singleton ID of rooms
    static ID = 0;

    static instance = null;

    constructor() {
        if (!RoomData.instance) {
            this.soloRooms = {};
            this.multiRooms = {};
            RoomData.instance = this;
        }

        return RoomData.instance;
    }

    static getInstance() {
        if (!RoomData.instance) {
            RoomData.instance = new RoomData();
        }
        return RoomData.instance;
    }

    /* ===========
        Solo Room
       =========== */


    addSoloRoom(row, col, playerName) {
        let room = {
            id: RoomData.ID,
            name: "Solo Game N°" + RoomData.ID.toString() + " - " + playerName,
            numPlayers: 1,
            players: [playerName],
            game: new Game(row, col),
            started: false,
            finished: false,
            win: false,
        }
        RoomData.ID++;
        this.soloRooms[room.id] = room;
        return room.id;
    }

    joinSoloRoom(roomId, playerName) {
        if (!this.soloRooms[roomId].players.includes(playerName)) {
            this.soloRooms[roomId].players.push(playerName);
        }
        return roomId;
    }

    getSoloRoom(roomId) {
        return this.soloRooms[roomId];
    }

    removeSoloRoom(roomId) {
        delete this.soloRooms[roomId];
    }

    /* ============
        Multi Room
       ============ */

    addMultiRoom(name, numPlayers, playerName, ranked) {
        let room = {
            id: RoomData.ID,
            name: name,
            numPlayers: numPlayers,
            players: [playerName],
            game: null,
            ranked: ranked,
            started: false,
            finished: false,
            winner: null,
        }
        RoomData.ID++;
        this.multiRooms[room.id] = room;
        console.log("Room " + room.id + " created by " + playerName);
        return room.id;
    }

    launchMultiRoom(roomId, row, col) {
        //TODO: Add ready check here or before
        console.log("Launching game in room " + roomId)
        const numBombs = Math.floor(row * col * DIFFICULTY_NORMAL);
        this.multiRooms[roomId].game = new Game(row, col, true, numBombs);
        this.multiRooms[roomId].started = true;
    }

    restartMultiRoom(roomId, row, col) {
        console.log("Restarting game in room " + roomId)
        const numBombs = Math.floor(row * col * DIFFICULTY_NORMAL);
        this.multiRooms[roomId].game = new Game(row, col, true, numBombs);
        this.multiRooms[roomId].started = true;
        this.multiRooms[roomId].finished = false;
        this.multiRooms[roomId].winner = null;
    }

    joinMultiRoom(roomId, playerName) {
        if (!this.multiRooms[roomId].players.includes(playerName)) {
            this.multiRooms[roomId].players.push(playerName);
        }
        console.log(playerName + " joined room " + roomId);
        return roomId;
    }

    getMultiRoom(roomId) {
        return this.multiRooms[roomId];
    }

    getAllMultiRooms() {
        return this.multiRooms;
    }

    removeMultiRoom(roomId) {
        delete this.multiRooms[roomId];
    }

}

module.exports = RoomData;