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

module.exports = {
    generateBombCoordinates,
}