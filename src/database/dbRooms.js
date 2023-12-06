// *******************
// *** PostgresSQL ***
// *******************

/**
 * Adds a user score entry to the 'users' table in the database.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room to associate the user with.
 * @param {string} username - The username of the user.
 * @param {number} score - The score to be added for the user.
 * @param {string} accountUsername - The username of the account associated with the user.
 * @returns {Promise<void>} A promise that resolves when the user score is successfully added.
 *                          The promise is rejected if there is an error during the insertion process.
 */
async function addUserScorePG(pgClient, roomName, username, score, accountUsername) {
    try {
        const query = {
            name: 'insert-user-score',
            text: `INSERT INTO rooms (roomName, username, score, accountUsername) VALUES ($1, $2, $3, $4)`,
            values: [roomName, username, score, accountUsername]
        };
        await pgClient.query(query)
        console.log("addUserScorePG: " + roomName + " " + username + " " + score);
    } catch (error) {
        console.error("Error addUserScorePG:", error.message);
    }
}

/**
 * Deletes a user score entry from the 'users' table in the database.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room associated with the user score.
 * @param {string} username - The username of the user whose score needs to be deleted.
 * @returns {Promise<void>} A promise that resolves when the user score is successfully deleted.
 *                          The promise is not rejected even if there is an error during the deletion process.
 *                          Errors are logged to the console.
 */
async function deleteUserScorePG(pgClient, roomName, username) {
    try {
        const query = {
            name: 'delete-user-score',
            text: `DELETE FROM rooms WHERE roomName = $1 AND username = $2`,
            values: [roomName, username]
        };
        await pgClient.query(query)
    } catch (error) {
        console.error("Error deleteUserScorePG:", error.message);
    }
}

/**
 * Deletes all user score entries from the 'users' table in the database for a given room.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room associated with the user scores.
 * @returns {Promise<unknown>} A promise that resolves when the user scores are successfully deleted.
 */
async function deleteAllUserScoresPG(pgClient, roomName) {
    try {
        const query = {
            name: 'delete-all-user-scores',
            text: `DELETE FROM rooms WHERE roomName = $1`,
            values: [roomName]
        };
        await pgClient.query(query)
    } catch (error) {
        console.error("Error deleteAllUserScoresPG:", error.message);
    }
}

/**
 * Retrieves the results from the 'users' table for a specific room.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room to retrieve results for.
 * @returns {Promise<Object>} A promise that resolves with an object representing the results from the 'users' table
 *                            for the specified room. The promise is rejected if there is an error during the database
 *                            query, and the error is logged to the console.
 */
async function getResultsFromRoomNamePG(pgClient, roomName) {
    try {
        const query = {
            name: 'fetch-results-from-room-name',
            text: `SELECT * FROM rooms WHERE roomName = $1`,
            values: [roomName]
        };
        const res = await pgClient.query(query)
        return res.rows
    } catch (error) {
        console.error("Error getResultsFromRoomNamePG:", error.message);
    }
}

/**
 * Checks if the number of user entries in the 'users' table for a given room matches the specified player number.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room to check for results.
 * @param {number} playerNumber - The expected number of players in the room.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the number of user entries
 *                            matches the specified player number. The promise is rejected if there is an error
 *                            during the database query, and the error is logged to the console.
 */
async function checkResultsPG(pgClient, roomName, playerNumber) {
    try {
        const query = {
            name: 'fetch-results',
            text: `SELECT COUNT(*) FROM rooms WHERE roomName = $1`,
            values: [roomName]
        };
        const res = await pgClient.query(query)
        const rowCount = parseInt(res.rows[0].count, 10);
        return rowCount === playerNumber;
    } catch (error) {
        console.error("Error checkResultsPG:", error.message);
    }
}

/**
 * Retrieves the user with the highest score from the 'users' table for a specific room.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room to retrieve the highest score for.
 * @returns {Promise<Object>} A promise that resolves with an object representing the user with the highest score
 *                            from the 'users' table for the specified room. The promise is rejected if there is an error
 *                            during the database query, and the error is logged to the console.
 */
async function getHighestScoreFromRoomNamePG(pgClient, roomName) {
    try {
        const query = {
            name: 'fetch-highest-score',
            text: `SELECT username, score FROM rooms WHERE roomName = $1 ORDER BY score ASC LIMIT 1`,
            values: [roomName]
        };
        const res = await pgClient.query(query)
        return res.rows[0]
    } catch (error) {
        console.error("Error getHighestScoreFromRoomNamePG:", error.message);
    }
}

module.exports = {
    // PostgresSQL
    addUserScorePG, deleteUserScorePG, deleteAllUserScoresPG, getResultsFromRoomNamePG, checkResultsPG, getHighestScoreFromRoomNamePG,
}