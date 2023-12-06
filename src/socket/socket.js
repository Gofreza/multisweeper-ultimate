// Server side socket session configuration
const { Server } = require("socket.io");
const sharedSession = require('express-socket.io-session');
// Database
const {getDatabase, getClient} = require('../database/dbSetup');

let pgClient = getClient();
let db;
getDatabase().then((database) => {
    db = database;
    console.log("Database link socket.js");
})

// Export a function that takes the server instance and session middleware
module.exports = function configureSocket(server, sessionMiddleware, app) {
    const io = new Server(server, { connectionStateRecovery: {} });
    io.use(sharedSession(sessionMiddleware, {
        autoSave: true
    }));

};
