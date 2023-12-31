// *******************
// *** PostgresSQL ***
// *******************

/**
 * Checks if a user with the specified username exists in the 'users' table.
 * @param pgClient - The database object.
 * @param username - The username to check for existence.
 * @returns {Promise<*|null>} A promise that resolves when the user exists
 */
async function getHashUserPG(pgClient, username) {
    try {
        const query = {
            name: 'fetch-user-hash',
            text: `SELECT password FROM users WHERE username = $1`,
            values: [username]
        };
        const res = await pgClient.query(query)
        if (res.rows.length === 0) {
            // No password found, resolve with a default value or handle the case
            return null; // You can replace null with any default value
        } else {
            return res.rows[0].password;
        }
    } catch (error) {
        console.error("Error getHashUserPG:", error.message);
    }
}

/**
 * Checks if a user with the specified username and password exists in the 'users' table.
 * @param {Object} pgClient - The database object.
 * @param {string} username - The username to check for existence.
 * @param {string} password - The password to check for existence.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the specified user exists
 *                            in the 'users' table. The promise is rejected if there is an error during the database query,
 *                            and the error is logged to the console.
 */
async function isAdminPG(pgClient, username, password) {
    try {
        const query = {
            name: 'fetch-admin-identifiers',
            text: `SELECT * FROM users WHERE username = $1 AND password = $2 AND role = 'admin'`,
            values: [username, password]
        };
        const res = await pgClient.query(query)
        return res.rows.length > 0
    } catch (error) {
        console.error("Error isAdminPG:", error.message);
    }
}

/**
 * Checks if a user with the specified username exists in the 'users' table.
 * @param {Object} pgClient - The database object.
 * @param {string} username - The username to check for existence.
 * @returns {Promise<unknown>} A promise that resolves when the user already exists.
 */
async function usernameExistsPG(pgClient, username) {
    try {
        const query = {
            name: 'username-exists',
            text: `SELECT * FROM users WHERE username = $1`,
            values: [username]
        };
        const res = await pgClient.query(query)
        return res.rows.length > 0
    } catch (error) {
        console.error("Error usernameExistsPG:", error.message);
    }
}

/**
 * Inserts a user with the specified username and password into the 'users' table.
 * @param {Object} pgClient - The database object.
 * @param {string} username - The username to insert.
 * @param {string} password - The password to insert.
 * @returns {Promise<unknown>} A promise that resolves when the user is successfully inserted.
 */
async function insertUserPG(pgClient, username, password) {
    try {
        const queries = [
            {
                name: 'insert-user-pg',
                text: `INSERT INTO users (username, password, role) VALUES ($1, $2, 'user')`,
                values: [username, password]
            },
            {
                name: 'insert-stats-solo-pg',
                text: `INSERT INTO stats ("user", gameMode, numGamesPlayed, numGamesWon, numGamesLost, numBombsDefused, numBombsExploded, numFlagsPlaced, numCellsRevealed, averageTime, fastestTime, longestTime)
                       VALUES ((SELECT id FROM users WHERE username = $1), 'solo', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
                values: [username]
            },
            {
                name: 'insert-stats-multi-pg',
                text: `INSERT INTO stats ("user", gameMode, numGamesPlayed, numGamesWon, numGamesLost, numBombsDefused, numBombsExploded, numFlagsPlaced, numCellsRevealed, averageTime, fastestTime, longestTime)
                       VALUES ((SELECT id FROM users WHERE username = $1), 'multi', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
                values: [username]
            }
        ];
        for (const query of queries) {
            await pgClient.query(query);
        }
    } catch (error) {
        console.error("Error insertUserPG:", error.message);
    }
}

/**
 * Deletes a user with the specified username from the 'users' table.
 * @param pgClient - The database object.
 * @param username - The username to delete.
 * @returns {Promise<void>} A promise that resolves when the user is successfully deleted.
 */
async function deleteUserPG(pgClient, username) {
    try {
        const queries = [
            {
                name: 'delete-solo-stats-pg',
                text: `DELETE FROM stats WHERE "user" = (SELECT id FROM users WHERE username = $1) AND gameMode = 'solo'`,
                values: [username]
            },
            {
                name: 'delete-multi-stats-pg',
                text: `DELETE FROM stats WHERE "user" = (SELECT id FROM users WHERE username = $1) AND gameMode = 'multi'`,
                values: [username]
            },
            {
                name: 'delete-user-pg',
                text: `DELETE FROM users WHERE username = $1`,
                values: [username]
            }
        ]

        for (const query of queries) {
            await pgClient.query(query);
        }
    } catch (error) {
        console.error("Error deleteUserPG:", error.message);
    }
}

/**
 * Inserts a connection with the specified token and username into the 'connection' table.
 * @param {Object} pgClient - The database object.
 * @param {string} token - The token to insert.
 * @param {string} username - The username to insert.
 * @returns {Promise<unknown>} A promise that resolves when the connection is successfully inserted.
 */
async function addConnectionPG(pgClient, token, username) {
    try {
        const query = {
            name: 'add-connection',
            text: `INSERT INTO connection (token, username) VALUES ($1, $2)`,
            values: [token, username]
        };
        await pgClient.query(query)
    } catch (error) {
        console.error("Error addConnectionPG:", error.message);
    }
}

/**
 * Deletes a connection with the specified token from the 'connection' table.
 * @param {Object} pgClient - The database object.
 * @param {string} token - The token to delete.
 * @returns {Promise<unknown>} A promise that resolves when the connection is successfully deleted.
 */
async function deleteConnectionPG(pgClient, token) {
    try {
        const query = {
            name: 'delete-connection',
            text: `DELETE FROM connection WHERE token = $1`,
            values: [token]
        };
        await pgClient.query(query)
    } catch (error) {
        console.error("Error deleteConnectionPG:", error.message);
    }

}

/**
 * Check if a connection with the specified token exists in the 'connection' table.
 * @param {Object} pgClient - The database object.
 * @param {string} token - The token to check.
 * @returns {Promise<unknown>} A promise that resolves if the connection exists.
 */
async function isConnectedPG(pgClient, token) {
    try {
        const query = {
            name: 'check-isConnectedPG',
            text: `SELECT * FROM connection WHERE token = $1`,
            values: [token]
        };
        const res = await pgClient.query(query)
        return res.rows.length === 1;
    } catch (error) {
        console.error("Error isConnectedPG:", error.message);
    }
}

/**
 * Changes the password of the specified user.
 * @param {Object} pgClient - The database object.
 * @param {string} username - The username to change.
 * @param {string} newPassword - The new password.
 * @returns {Promise<unknown>} A promise that resolves if the password is successfully changed.
 */
async function changePasswordPG(pgClient, username, newPassword) {
    try {
        const query = {
            name: 'change-password',
            text: `UPDATE users SET password = $1 WHERE username = $2`,
            values: [newPassword, username]
        };
        await pgClient.query(query)
    } catch (error) {
        console.error("Error changePasswordPG:", error.message);
    }
}

/**
 * Changes the username of the specified user.
 * @param {Object} pgClient - The database object.
 * @param {string} username - The username to change.
 * @param {string} newUsername - The new username.
 * @returns {Promise<unknown>} A promise that resolves if the username is successfully changed.
 */
async function changeUsernamePG(pgClient, username, newUsername) {
    try {
        const query = {
            name: 'change-username',
            text: `UPDATE users SET username = $1 WHERE username = $2`,
            values: [newUsername, username]
        };
        await pgClient.query(query)
    } catch (error) {
        console.error("Error changeUsernamePG:", error.message);
    }
}

/**
 * Gets the role of the specified user.
 * @param {Object} pgClient - The database object.
 * @param {string} username - The username to check.
 * @returns {Promise<unknown>} A promise that resolves with the role of the specified user.
 */
async function getUserRole(pgClient, username) {
    try {
        const query = {
            name: 'get-user-role',
            text: `SELECT role FROM users WHERE username = $1`,
            values: [username]
        };
        const res = await pgClient.query(query)
        return res.rows[0].role;
    } catch (error) {
        console.error("Error getUserRole:", error.message);
    }
}

module.exports = {
    // PostgresSQL
    isAdminPG, getHashUserPG, usernameExistsPG, insertUserPG, deleteUserPG,
    addConnectionPG, deleteConnectionPG, isConnectedPG, changePasswordPG, changeUsernamePG, getUserRole,
}