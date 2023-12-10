const express = require('express');
const {getClient} = require("../database/dbSetup");
const {getHashUserPG, addConnectionPG, isAdminPG, deleteConnectionPG, isConnectedPG, getUserRole} = require("../database/dbAuth");
const {compare} = require("bcrypt");
const jwt = require("jsonwebtoken");
const {verifyConnection, isNotConnected} = require("../miscFunctions/functions");
const router = express.Router();

router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    try {
        const pgClient = getClient()
        const hashedPassword = await getHashUserPG(pgClient, username);

        if (hashedPassword) {
            compare(password, hashedPassword, async (bcryptError, bcryptResult) => {
                if (bcryptError) {
                    console.error('Error occurred while comparing passwords:', bcryptError);
                    return res.status(500).send('Internal Server Error');
                }

                if (!bcryptResult) {
                    // Incorrect password
                    // Redirect back to the lobby
                    req.flash('error', 'Incorrect password')
                    return res.redirect('/login');
                }
                // Password is correct, proceed
                const token = jwt.sign({username: username}, process.env.SECRET_KEY, {expiresIn: '24h'});
                res.cookie('token', token, {httpOnly: true});
                res.cookie('username', username, {httpOnly: false}); //Non-sensitive data

                // Add a connection to the database
                await addConnectionPG(pgClient, token, username);
                const role = await getUserRole(pgClient, username);
                //console.log("isConnected: ", await isConnectedPG(pgClient, token));
                // Add username to the session
                req.session.accountUsername = username;
                req.session.username = username;
                req.session.role = role;

                req.flash('success', 'Logged in successfully')
                return res.redirect('/')

            });
        } else {
            // No password found
            // Redirect back to the previous page or handle as needed
            req.flash('error', 'User does not exist')
            return res.redirect('/');
        }
    } catch (hashError) {
        console.error('Error occurred while getting hashed password:', hashError);
        res.status(500).send('Internal Server Error');
    }

});

router.get('/logout', verifyConnection, async (req, res) => {
    try {
        const token = req.cookies.token;

        // Assuming that deleteConnectionPG returns a Promise, use try/catch
        try {
            console.log("Deleting connection")
            await deleteConnectionPG(getClient(), token);
        } catch (deleteConnectionError) {
            console.error('Error deleting connection:', deleteConnectionError);
            // Handle the error, perhaps by sending an error response or redirecting to an error page
            req.flash('error', 'An error occurred during logout');
            return res.redirect('/');
        }

        // Clear the 'token' cookie from the user's browser
        console.log("Clearing cookie")
        res.clearCookie('token');
        res.clearCookie('username');

        console.log("Clearing session")
        req.session.username = null;
        req.session.accountUsername = null;

        // Redirect the user to the home page
        console.log("Redirecting")
        req.flash('success', 'Logged out successfully');
        return res.redirect('/');  // Use "return" to ensure the function exits here
    } catch (logoutError) {
        console.error('Error during logout:', logoutError);
        // Handle the error, perhaps by sending an error response or redirecting to an error page
        req.flash('error', 'An unexpected error occurred during logout');
        return res.redirect('/');
    }
});


module.exports = router;