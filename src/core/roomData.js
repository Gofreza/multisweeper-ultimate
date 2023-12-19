const Game = require("./game");

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

    addMultiRoom(row, col, name, numPlayers, playerName) {
        let room = {
            id: RoomData.ID,
            name: name,
            numPlayers: numPlayers,
            players: [playerName],
            game: new Game(row, col),
            started: false,
            finished: false,
            winner: null,
        }
        RoomData.ID++;
        this.multiRooms[room.id] = room;
        return room.id;
    }

    getMultiRoom(roomId) {
        return this.multiRooms[roomId];
    }

    removeMultiRoom(roomId) {
        delete this.multiRooms[roomId];
    }

}

module.exports = RoomData;