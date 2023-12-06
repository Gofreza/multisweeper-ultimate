// *******************
// *** PostgresSQL ***
// *******************

/**
 * Retrieves the number of rows and columns for a specific room from the 'roomData' table.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room to retrieve data for.
 * @returns {Promise<Object>} A promise that resolves with an object representing the number of rows and columns
 *                            for the specified room from the 'roomData' table. The promise is rejected if there is an error
 *                            during the database query, and the error is logged to the console.
 */
async function getRoomDataPG(pgClient, roomName) {
    const query = {
        name: 'fetch-roomData',
        text: `SELECT numRows, numCols FROM roomData WHERE roomName = $1`,
        values: [roomName]
    };
    try {
        const res = await pgClient.query(query)
        return res.rows[0]
    } catch (error) {
        console.error("Error getRoomDataPG:", error.message);
    }
}

/**
 * Checks if a room with the specified name exists in the 'roomData' table.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room to check for existence.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the specified room exists
 *                             in the 'roomData' table. The promise is rejected if there is an error during the database query,
 *                             and the error is logged to the console.
 */
async function checkIfRoomExistsPG(pgClient, roomName) {
    const query = {
        name: 'check-roomData-exists',
        text: `SELECT * FROM roomData WHERE roomName = $1`,
        values: [roomName]
    };
    try {
        const res = await pgClient.query(query)
        return res.rows.length !== 0
    } catch (error) {
        console.error("Error checkIfRoomExistsPG:", error.message);
    }
}

/**
 * Inserts room data into the 'roomData' table.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room to insert.
 * @param {number} rows - The number of rows for the room.
 * @param {number} cols - The number of columns for the room.
 * @returns {Promise<void>} A promise that resolves when the room data is successfully inserted into the 'roomData' table.
 *                          The promise is rejected if there is an error during the database query, and the error is logged to the console.
 */
async function setRoomDataPG(pgClient, roomName, rows, cols) {
    const query = {
        name: 'insert-roomData',
        text: `INSERT INTO roomData (roomName, numRows, numCols) VALUES ($1, $2, $3)`,
        values: [roomName, rows, cols]
    };
    try {
        await pgClient.query(query)
    } catch (error) {
        console.error("Error setRoomDataPG:", error.message);
    }
}

/**
 * Deletes room data from the 'roomData' table based on the room name.
 * @param {Object} pgClient - The database object.
 * @param {string} roomName - The name of the room to delete.
 * @returns {Promise<number>} A promise that resolves with the number of rows deleted when the room data is successfully deleted from the 'roomData' table.
 *                           The promise is rejected if there is an error during the database query, and the error is logged to the console.
 */
async function deleteRoomDataPG(pgClient, roomName) {
    console.log("deleteRoomDataPG", roomName)
    const query = {
        name: 'delete-roomData',
        text: `DELETE FROM roomData WHERE roomName = $1`,
        values: [roomName]
    };
    try {
        const res = await pgClient.query(query)
        return res.rowCount
    } catch (error) {
        console.error("Error deleteRoomDataPG:", error.message);
    }
}

/**
 * Deletes all room data from the 'roomData' table.
 * @param {Object} pgClient - The database object.
 * @returns {Promise<number>} A promise that resolves with the number of rows deleted when the room data is successfully deleted from the 'roomData' table.
 *                          The promise is rejected if there is an error during the database query, and the error is logged to the console.
 */
async function deleteAllRoomDataPG(pgClient) {
    const query = {
        name: 'delete-all-roomData',
        text: `DELETE FROM roomData`,
        values: []
    };
    try {
        const res = await pgClient.query(query)
        return res.rowCount
    } catch (error) {
        console.error("Error deleteAllRoomDataPG:", error.message);
    }
}

module.exports = {
    // PostgresSQL
    getRoomDataPG, deleteRoomDataPG, setRoomDataPG, checkIfRoomExistsPG, deleteAllRoomDataPG,
}