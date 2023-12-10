const express = require('express');
const { verify } = require('jsonwebtoken');
const { isConnectedPG, changeUsernamePG, getHashUserPG, changePasswordPG, deleteUserPG, deleteConnectionPG} = require('../database/dbAuth');
const { getClient } = require('../database/dbSetup');
const {verifyConnection} = require("../miscFunctions/functions");
const {getStats} = require("../database/dbStats");
const {compare, hash} = require("bcrypt");
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
                res.status(401).send({ message: 'Already log in' });
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

module.exports = router;
