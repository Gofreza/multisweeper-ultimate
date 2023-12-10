const {isConnectedPG} = require("../database/dbAuth");
const {getClient} = require("../database/dbSetup");
const {verify} = require("jsonwebtoken");

function generateBombCoordinates(length, width, numBombs) {
    const bombCoordinates = [];

    while (bombCoordinates.length < numBombs) {
        const newRow = Math.floor(Math.random() * length);
        const newCol = Math.floor(Math.random() * width);

        // Ensure the generated coordinate is unique
        if (!bombCoordinates.some(coord => coord.row === newRow && coord.col === newCol)) {
            bombCoordinates.push({ row: newRow, col: newCol });
        }
    }

    return bombCoordinates;
}

async function isNotConnected(req, res, next) {
    const token = req.cookies.token;

    // Check if the token exists and isConnected
    if (!token) {
        return next();
    }

    try {
        const isConnected = await isConnectedPG(getClient(), token);

        if (isConnected) {
            return res.redirect('/');
        }

        // Verify the token
        verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return next();
            }
            // Token is valid, redirect to '/'
            return res.redirect('/');
        });

    } catch (error) {
        console.error('Error checking connection:', error);
        return next();
    }
}

async function verifyConnection(req, res, next) {
    const token = req.cookies.token;

    // Check if the token exists and isConnected
    if (!token) {
        return res.redirect('/');
    }

    try {
        const isConnected = await isConnectedPG(getClient(), token);

        if (!isConnected) {
            req.cookies.token = null;
            return res.redirect('/');
        }

        // Verify the token
        verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                // Token is invalid, redirect to '/'
                return res.redirect('/');
            }
            // Token is valid, continue to the next middleware
            //console.log('Decoded token data:', decoded);
            next();
        });

    } catch (error) {
        console.error('Error checking connection:', error);
        return res.redirect('/');
    }
}


module.exports = {
    generateBombCoordinates, verifyConnection, isNotConnected,
}