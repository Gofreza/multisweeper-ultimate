/**
 * Updates the stats for a user in the database.
 * @param pgClient - The database client
 * @param username - The username of the user
 * @param stats - The stats to update in json format
 * @returns {Promise<void>} - A promise that resolves when the stats have been updated
 */
async function updateStats(pgClient, username, stats) {
    try {
        // Retrieve the existing stats from the database
        const existingStatsQuery = {
            name: "get-existing-stats",
            text: `
            SELECT numGamesPlayed, numGamesWon, numGamesLost, numBombsDefused, numBombsExploded, numFlagsPlaced, numCellsRevealed, averageTime, fastestTime, longestTime
            FROM stats
            INNER JOIN users ON stats.user = users.id
            WHERE users.username = $1 AND stats.gameMode = $2`,
            values: [username, stats.gameMode]
        };

        const existingStatsResult = await pgClient.query(existingStatsQuery);
        const existingStats = existingStatsResult.rows[0];

        // If there are existing stats, add the new values to them
        if (existingStats) {
            stats.numGamesPlayed += existingStats.numgamesplayed || 0;
            stats.numGamesWon += existingStats.numgameswon || 0;
            stats.numGamesLost += existingStats.numgameslost || 0;
            stats.numBombsDefused += existingStats.numbombsdefused || 0;
            stats.numBombsExploded += existingStats.numbombsexploded || 0;
            stats.numFlagsPlaced += existingStats.numflagsplaced || 0;
            stats.numCellsRevealed += existingStats.numcellsrevealed || 0;

            // Handle time-related statistics
            // TODO: Handle average time properly
            // Doesn't need to pass three time, only one is enough
            // Just need to do the math after
            stats.fastestTime = Math.min(stats.fastestTime, existingStats.fastesttime);
            stats.longestTime = Math.max(stats.longestTime, existingStats.longesttime);

            if (stats.isGameWin) {
                stats.averageTime = ((stats.averageTime + existingStats.averagetime) / stats.numGamesPlayed).toFixed(1);
            }
        }

        // Update the stats in the database
        const updateQuery = {
            name: "update-stats",
            text: `UPDATE stats SET numGamesPlayed = $3, numGamesWon = $4, numGamesLost = $5, numBombsDefused = $6, numBombsExploded = $7, numFlagsPlaced = $8, numCellsRevealed = $9, averageTime = $10, fastestTime = $11, longestTime = $12 
             WHERE "user" = (SELECT id FROM users WHERE username = $1) 
               AND gameMode = $2`,
            values: [
                username, stats.gameMode,
                stats.numGamesPlayed, stats.numGamesWon, stats.numGamesLost,
                stats.numBombsDefused, stats.numBombsExploded, stats.numFlagsPlaced,
                stats.numCellsRevealed, stats.averageTime, stats.fastestTime, stats.longestTime
            ]
        };

        await pgClient.query(updateQuery);
    } catch (error) {
        console.error('Error occurred while updating stats:', error);
    }
}

/**
 * Gets the stats for a user from the database.
 * @param pgClient - The database client
 * @param username - The username of the user
 * @returns {Promise<*>} - A promise that resolves with the stats
 */
async function getStats(pgClient, username) {
    try {
        const query = {
            name: "get-stats",
            text: `
            SELECT stats.*
            FROM stats
            INNER JOIN users ON stats.user = users.id
            WHERE users.username = $1`,
            values: [username]
        };

        const result = await pgClient.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error occurred while getting stats:', error);
    }
}

/**
 * Updates the winning stats for a user in the database.
 * @param pgClient - The database client
 * @param scoreUpdates - An array of score updates in json format
 *       => {username: string, gameMode: string, numGamesWon: number, numGamesLost: number}
 *                numGamesWon and numGamesLost are the only stats that are updated
 * @returns {Promise<void>} - A promise that resolves when the stats have been updated
 */
async function updateWinningStats(pgClient, scoreUpdates) {
    try {
        const queries = scoreUpdates.map((update) => {
            const query =  {
                name: "update-winning-stats",
                text: `
                    UPDATE stats 
                    SET numgameswon = numgameswon + $1, numgameslost = numgameslost + $2 
                    WHERE "user" = (SELECT id FROM users WHERE username = $3) 
                    AND gamemode = $4`,
                values: [update.numGamesWon, update.numGamesLost, update.username, update.gameMode],
            };
            return pgClient.query(query);
        });

        for (const queryPromise of queries) {
            await queryPromise;
        }
    } catch (error) {
        console.error('Error occurred while updating winning stats:', error);
    }
}

module.exports = {
    updateStats, getStats, updateWinningStats,
}