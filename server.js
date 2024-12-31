const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash')
const cors = require("cors");
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

// Redirect middleware
app.use((req, res, next) => {
    const host = req.get('host');
    const isMultisweeperFr = host === 'multisweeper.fr';

    if (isMultisweeperFr) {
        const wwwUrl = `https://www.${host}${req.originalUrl}`;
        return res.redirect(301, wwwUrl);
    }

    next();
});

// Allow CORS
/*if (process.env.NODE_ENV === 'development') {
    app.use(cors({
        origin: 'http://localhost:8000',
        methods: 'GET,HEAD,POST',
        credentials: false,
    }));
}
else {
    app.use(cors({
        origin: 'https://www.multisweeper.fr/',
        methods: 'GET,HEAD,POST',
        credentials: true,
    }));
}*/

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '/public')));
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/build')));
}
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// **********************
// *** Session config ***
// **********************

const sessionMiddleware = session({
    secret: process.env.SECRET_KEY,
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
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
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