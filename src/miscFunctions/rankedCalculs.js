const {getPositionsOfPlayers, insertLeaderboardScore, updatePosition} = require( "../database/dbLeaderboard");
const {getClient} = require("../database/dbSetup");

const getPlayersArrayFromGameResults = (gameResults) => {
    const playersArray = [];
    for (const player of gameResults) {
        playersArray.push(player.username);
    }
    return playersArray;
}

const calculateRankedPoints = async (results) => {
    const basePoints = 10;
    const bonusPoints = 30;
    const winnerMultiplier = 0.3;
    const loserMultiplier = 0.1;
    const usersArray = getPlayersArrayFromGameResults(results);
    const playersPosition = await getPositionsOfPlayers(getClient(), usersArray);
    console.log("Players Position:", playersPosition, results);
    // If player is not in the leaderboard, position = 0
    // So add him
    try {
        for (const player of playersPosition) {
            if (player.position === 0) {
                await insertLeaderboardScore(getClient(), player.username, 0);
            }
        }
    } catch (error) {
        console.error("Error while inserting player:", error);
    }

    // Calculate points
    const playersPoints = [];

    // Sort results by timeElapsed
    const sortedResults = results.sort((a, b) => a.timeElapsed - b.timeElapsed);
    const resultsWithPosition = sortedResults.map((result, index) => ({
        ...result,
        position: index + 1 // Adding 1 to make positions start from 1 instead of 0
    }));
    console.log("Sorted Results:", resultsWithPosition);

    for (const player of playersPosition) {
        const correspondingResult = resultsWithPosition.find(result => result.username === player.username);

        if (correspondingResult && player.position === correspondingResult.position) {
            // If position match, get base points
            console.log(`${player.username}'s position matches: ${player.position}. Gain ${basePoints} points`);
            await insertLeaderboardScore(getClient(), player.username, basePoints);
            playersPoints.push({username: player.username, points: basePoints}
            );
        } else {
            // If positions don't match, check if it's better or worse
            console.log(`${player.username}'s position does not match`);
            if (correspondingResult) {
                // If player is in the results, check if he's better or worse
                const positionDifference = Math.abs(player.position - correspondingResult.position);
                const isPerformance = positionDifference >= 2; // Adjust the threshold as needed
                console.log(`${player.username}'s position is ${correspondingResult.position}. He should be ${player.position}. Position difference: ${positionDifference}. Is performance: ${isPerformance}`);
                if (player.position > correspondingResult.position) {
                    // If player is better, get base points + X% of the difference
                    const additionalPoints = isPerformance ? Math.round(winnerMultiplier * bonusPoints * positionDifference) : 0;
                    const totalPoints = basePoints + additionalPoints;
                    console.log(`${player.username} is better. Gain ${totalPoints} points`);
                    await insertLeaderboardScore(getClient(), player.username, totalPoints);
                    playersPoints.push({username: player.username, points: totalPoints});
                } else {
                    // If player is worse, get base points / 2
                    const penaltyPoints = isPerformance ? Math.round(loserMultiplier * bonusPoints * positionDifference) : 0;
                    const totalPoints = basePoints / 2 - penaltyPoints;
                    console.log(`${player.username} is worse. Gain ${totalPoints} points`);
                    await insertLeaderboardScore(getClient(), player.username, totalPoints);
                    playersPoints.push({username: player.username, points: totalPoints});
                }
            } else {
                // If player is not in the results, get base points / 2
                console.log(`${player.username} is not in the results. Gain ${basePoints / 2} points`);
                await insertLeaderboardScore(getClient(), player.username, basePoints / 2);
                playersPoints.push({username: player.username, points: basePoints / 2});
            }
        }
    }

    // Update leaderboard
    await updatePosition(getClient());
    return playersPoints;
}

module.exports = {
    calculateRankedPoints, getPlayersArrayFromGameResults,
}