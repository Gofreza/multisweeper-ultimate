const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();
let port = process.env.PORT_DEV || 8080;

const http = require('http');
const {connectDatabase, getClient, disconnectDatabase} = require("./src/database/dbSetup");
const {fillDb} = require("./src/database/dbFill");
const {deleteAllRoomDataPG} = require("./src/database/dbRoomData");
const server = http.createServer(app); // Use http.createServer to create a server

// *************************
// *** Middleware config ***
// *************************

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '/public')));
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/dist')));
}
//app.use(express.static(path.join(__dirname, '/dist'))); /* For production */
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// **********************
// *** Session config ***
// **********************

const sessionMiddleware = session({
    secret: '%Mb~nGw+Ql2W6KJS)zr=x@{fl4V3h?YuhGUJX4XJ9{"vnZn&+km^9]z3+}\'UQtV',
    resave: true,
    saveUninitialized: true
});
app.use(sessionMiddleware);
app.use(cookieParser());

app.use(flash());

// ********************
// *** Route config ***
// ********************

const authRoutes = require('./src/routes/auth');
const apiRoutes = require('./src/api/api');
app.use(authRoutes, apiRoutes);

// *********************
// *** React Routing ***
// *********************

app.get('*', (req, res) => {
    if (process.env.NODE_ENV === 'development') {
        res.sendFile(path.join(__dirname, 'public/html', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
})


// ***********************
// *** Database Set Up ***
// ***********************

connectDatabase()
    .then(() => {
        console.log("Connected to postgres database");
        return fillDb();
    })
    .then(() => {
        console.log("Database filled");
        const pgClient = getClient();
        return deleteAllRoomDataPG(pgClient);
    })
    .then(() => {
        // *********************
        // *** Socket config ***
        // *********************

        const configureSocket = require('./src/socket/socket');
        configureSocket(server, sessionMiddleware, app);

        // ********************
        // *** Start server ***
        // ********************

        server.listen(port, () => {
            console.log(`Server running at http://127.0.0.1:${port}/`);
        });
    })
    .catch(error => {
        console.error("Error connectdb:", error.message);
    });

process.on("exit", function () {
    disconnectDatabase()
})