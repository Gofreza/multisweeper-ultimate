const Cell = require("./cell");

class Grid {

    /**
     * Constructor to create a grid with specified bomb coordinates or not.
     * If not, generated bombs will be placed randomly around the clicked point.
     * @param {number} length - Number of rows
     * @param {number} width - Number of columns
     * @param {number} numBombs - Number of bombs (optional)
     * @param {Array} bombCoordinates - Array of {row, col} representing bomb coordinates (optional)
     * @param {number} clickRow - Row where the user clicked
     * @param {number} clickCol - Column where the user clicked
     */
    constructor(length, width, numBombs = 0, bombCoordinates = [], clickRow= -1, clickCol= -1) {
        this.length = length;
        this.width = width;
        this.matrix = [];
        if (numBombs === 0) {
            // Initialize matrix with cells set to 0
            for (let i = 0; i < length; i++) {
                let row = [];
                for (let j = 0; j < width; j++) {
                    let cell = new Cell();
                    row.push(cell);
                }
                this.matrix.push(row);
            }
        } else {

            this.numbombs = numBombs;

            // Initialize matrix with cells
            for (let i = 0; i < length; i++) {
                let row = [];
                for (let j = 0; j < width; j++) {
                    let cell = new Cell();
                    row.push(cell);
                }
                this.matrix.push(row);
            }

            if (bombCoordinates.length > 0) {
                // Place bombs based on specified coordinates
                this.placeBombsFromCoordinates(bombCoordinates);
            } else {
                //this.placeBombs(this.numbombs);
                if (clickRow !== -1 && clickCol !== -1) {
                    // Place bombs around the clicked point
                    this.placeBombsAroundClick(clickRow, clickCol);
                }
            }
        }
    }

    /* Method from cell */

    isVisible(row, col) {
        return this.matrix[row][col].isVisible();
    }

    setVisible(row, col) {
        this.matrix[row][col].setVisible();
    }

    isFlagged(row, col) {
        return this.matrix[row][col].isFlagged();
    }

    toggleFlag(row, col) {
        this.matrix[row][col].toggleFlag();
    }

    hasBomb(row, col) {
        return this.matrix[row][col].hasBomb();
    }

    setBomb(row, col) {
        this.matrix[row][col].setBomb();
    }

    isExploded(row, col) {
        return this.matrix[row][col].isExploded();
    }

    setExploded(row, col) {
        this.matrix[row][col].setExploded();
    }

    getNumber(row, col) {
        return this.matrix[row][col].getNumber();
    }

    setNumber(row, col, s) {
        this.matrix[row][col].setNumber(s);
    }

    isEmpty(row, col) {
        return this.matrix[row][col].isEmpty();
    }

    /* Member functions */

    /**
     * Place bombs on the grid randomly
     * @param numBombs - Number of bombs to place
     */
    placeBombs(numBombs) {
        const rowDistribution = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const colDistribution = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        let bombsToPlace = numBombs;
        while (bombsToPlace > 0) {
            let row = rowDistribution(0, this.length - 1);
            let col = colDistribution(0, this.width - 1);
            if (!this.matrix[row][col].hasBomb()) {
                this.matrix[row][col].setBomb();
                this.matrix[row][col].setNumber(-1);
                this.calculateCellWeight(row, col);
                bombsToPlace--;
            }
        }
    }

    /**
     * Place bombs on the grid based on specified coordinates
     * @param {Array} bombCoordinates - Array of {row, col} representing bomb coordinates
     */
    placeBombsFromCoordinates(bombCoordinates) {
        bombCoordinates.forEach(({ row, col }) => {
            if (row >= 0 && row < this.length && col >= 0 && col < this.width) {
                this.matrix[row][col].setBomb();
                this.calculateCellWeight(row, col);
            }
        });
    }

    /**
     * Calculate the weight of a cell based on its neighbors
     * @param row - Row of the cell
     * @param col - Column of the cell
     */
    calculateCellWeight(row, col) {
        if (row - 1 >= 0 && row - 1 < this.length) {
            if (col - 1 >= 0 && col - 1 < this.width && !this.matrix[row - 1][col - 1].hasBomb()) {
                this.matrix[row - 1][col - 1].setNumber(this.matrix[row - 1][col - 1].getNumber() + 1);
            }
            if (col >= 0 && col < this.width && !this.matrix[row - 1][col].hasBomb()) {
                this.matrix[row - 1][col].setNumber(this.matrix[row - 1][col].getNumber() + 1);
            }
            if (col + 1 >= 0 && col + 1 < this.width && !this.matrix[row - 1][col + 1].hasBomb()) {
                this.matrix[row - 1][col + 1].setNumber(this.matrix[row - 1][col + 1].getNumber() + 1);
            }
        }

        if (row >= 0 && row < this.length) {
            if (col - 1 >= 0 && col - 1 < this.width && !this.matrix[row][col - 1].hasBomb()) {
                this.matrix[row][col - 1].setNumber(this.matrix[row][col - 1].getNumber() + 1);
            }
            if (col + 1 >= 0 && col + 1 < this.width && !this.matrix[row][col + 1].hasBomb()) {
                this.matrix[row][col + 1].setNumber(this.matrix[row][col + 1].getNumber() + 1);
            }
        }

        if (row + 1 >= 0 && row + 1 < this.length) {
            if (col - 1 >= 0 && col - 1 < this.width && !this.matrix[row + 1][col - 1].hasBomb()) {
                this.matrix[row + 1][col - 1].setNumber(this.matrix[row + 1][col - 1].getNumber() + 1);
            }
            if (col >= 0 && col < this.width && !this.matrix[row + 1][col].hasBomb()) {
                this.matrix[row + 1][col].setNumber(this.matrix[row + 1][col].getNumber() + 1);
            }
            if (col + 1 >= 0 && col + 1 < this.width && !this.matrix[row + 1][col + 1].hasBomb()) {
                this.matrix[row + 1][col + 1].setNumber(this.matrix[row + 1][col + 1].getNumber() + 1);
            }
        }
    }

    toString() {
        let output = "";
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.width; j++) {
                output += "| " + this.matrix[i][j].toString() + " |";
            }
            output += "\n";
            for (let j = 0; j < this.width; j++) {
                output += "-----";
            }
            output += "\n";
        }
        return output;
    }

    /**
     * Reveal a cell on the grid
     * @param row - Row of the cell
     * @param col - Column of the cell
     * @param isRightClick - Whether the cell was right-clicked or not
     * @returns {Array} - Returns an array of {row, col} representing the list of revealed cells
     */
    revealCell(row, col, isRightClick) {
        const revealedCells = [];

        if (isRightClick) {
            // Toggle flag on right-click
            if (!this.matrix[row][col].isVisible() && !this.matrix[row][col].isExploded()) {
                this.matrix[row][col].toggleFlag();
            }
            return revealedCells;
        }

        // If cell is flagged, don't reveal
        if (this.matrix[row][col].isFlagged()) {
            return revealedCells;
        }

        if (this.matrix[row][col].isVisible()) {
            // Cell already visible, do nothing
            return revealedCells;
        }

        this.matrix[row][col].setVisible(); // Set the cell as visible
        revealedCells.push({ row, col, number: this.matrix[row][col].getNumber()}); // Add the current cell to the list of revealed cells

        if (this.matrix[row][col].getNumber() === 0 && !this.matrix[row][col].hasBomb()) {
            // Implement flood fill to reveal neighboring cells if the clicked cell is a 0
            const directions = [
                [-1, 0], [1, 0], [0, -1], [0, 1], // Up, Down, Left, Right
                [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
            ];

            for (let [dx, dy] of directions) {
                let newRow = row + dx;
                let newCol = col + dy;

                if (
                    newRow >= 0 && newRow < this.length &&
                    newCol >= 0 && newCol < this.width
                ) {
                    if (!this.matrix[newRow][newCol].isVisible()) {
                        const recursiveRevealedCells = this.revealCell(newRow, newCol, isRightClick);
                        revealedCells.push(...recursiveRevealedCells);
                    }
                }
            }
        }

        return revealedCells;
    }

    /**
     * Reveal any non-visible cells adjacent to the cell at the specified coordinates if the number of flags around it is equal to the number on the cell
     * @param row - Row of the cell
     * @param col - Column of the cell
     * @returns {{bombsList: *[], isBomb: boolean}} - Returns an object containing whether the cell was a bomb or not and the list of bomb coordinates
     */
    revealNeighbours(row, col) {
        let isBomb = false;
        let bombs = [];
        let revealedCells = [];

        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // Up, Down, Left, Right
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
        ];

        const number = this.matrix[row][col].getNumber();
        let flaggedCount = 0;

        for (let [dx, dy] of directions) {
            let newRow = row + dx;
            let newCol = col + dy;

            if (
                newRow >= 0 && newRow < this.length &&
                newCol >= 0 && newCol < this.width
            ) {
                if (this.matrix[newRow][newCol].isFlagged()) {
                    flaggedCount++;
                }
            }
        }

        if (flaggedCount >= number) {
            for (let [dx, dy] of directions) {
                let newRow = row + dx;
                let newCol = col + dy;

                if (
                    newRow >= 0 && newRow < this.length &&
                    newCol >= 0 && newCol < this.width
                ) {
                    if (!this.matrix[newRow][newCol].isVisible() && !this.matrix[newRow][newCol].isFlagged()) {
                        const cells = this.revealCell(newRow, newCol, false);
                        revealedCells.push(...cells);

                        if (this.matrix[newRow][newCol].hasBomb()) {
                            isBomb = true;
                            const bombRow = newRow;
                            const bombCol = newCol;
                            bombs.push({ bombRow, bombCol });
                        }
                    }
                }
            }
        }

        return { neighbors: true, isBomb: isBomb, bombsList: bombs, revealedCells: revealedCells };
    }

    /**
     * Reveal the full grid
     * @returns {*[]} - Returns an array containing whether the game has ended and whether the user has won
     */
    revealGrid() {
        let cells = [];
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.matrix[i][j].isFlagged()) {
                    cells.push({row: i, col: j, flagged: true});
                } else {
                    this.matrix[i][j].setVisible();
                    cells.push({row: i, col: j, number: this.matrix[i][j].getNumber()});
                }
            }
        }
        return cells;
    }

    /**
     * Place bombs around the clicked point with decreasing chance for adjacent cells to be 0.
     * @param {number} clickRow - Row where the user clicked
     * @param {number} clickCol - Column where the user clicked
     */
    placeBombsAroundClick(clickRow, clickCol) {
        this.matrix[clickRow][clickCol].setNumber(-2);

        const placeZerosRecursive = (row, col, chancePercentage) => {
            if (
                row >= 0 && row < this.length &&
                col >= 0 && col < this.width &&
                chancePercentage > 0
            ) {
                // Set the current cell as 0
                this.matrix[row][col].setNumber(-2);

                // Define directions for neighboring cells
                const directions = [
                    [-1, 0], [1, 0], [0, -1], [0, 1], // Up, Down, Left, Right
                    [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
                ];

                // Recursively call placeZerosRecursive for neighboring cells
                for (let [dx, dy] of directions) {
                    let newRow = row + dx;
                    let newCol = col + dy;

                    // Decrease the chancePercentage with each recursion
                    const newChance = Math.floor(Math.random() * (100 - 1) + 1);
                    placeZerosRecursive(newRow, newCol, newChance <= chancePercentage ? chancePercentage / 2 : 0);
                }
            }
        };

        // Example: place zeros around the cell at (2, 2) with a starting chance of 50%
        placeZerosRecursive(clickRow, clickCol, 10);

        // Place bombs
        this.placeBombsBis(this.numbombs);

        // Pass the -2 to 0
        for (let i = 0; i < this.length; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.matrix[i][j].getNumber() === -2) {
                    this.matrix[i][j].setNumber(0);
                }
            }
        }
    }

    /**
     * Place bombs around the clicked point with decreasing chance for adjacent cells to be 0.
     * @param numBombs - Number of bombs to place
     */
    placeBombsBis(numBombs) {
        const rowDistribution = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const colDistribution = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        let bombsToPlace = numBombs;
        while (bombsToPlace > 0) {
            let row = rowDistribution(0, this.length - 1);
            let col = colDistribution(0, this.width - 1);

            // Check if the current cell or any neighboring cell has -2 (indicating a cell set as 0)
            const hasZeroNeighbor = this.hasZeroNeighbor(row, col);

            if (!this.matrix[row][col].hasBomb() && !hasZeroNeighbor) {
                this.matrix[row][col].setBomb();
                this.matrix[row][col].setNumber(-1);
                this.calculateCellWeight(row, col);
                bombsToPlace--;
            }
        }
    }

    /**
     * Check if the current cell or any neighboring cell has -2 (indicating a cell set as 0)
     * @param row - Row of the cell
     * @param col - Column of the cell
     * @returns {boolean} - Returns true if the current cell or any neighboring cell has -2, false otherwise
     */
    hasZeroNeighbor(row, col) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // Up, Down, Left, Right
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
        ];

        for (let [dx, dy] of directions) {
            let newRow = row + dx;
            let newCol = col + dy;

            if (
                newRow >= 0 && newRow < this.length &&
                newCol >= 0 && newCol < this.width &&
                this.matrix[newRow][newCol].getNumber() === -2
            ) {
                return true; // Found a neighboring cell with -2
            }
        }

        return false; // No neighboring cell with -2
    }


}

module.exports = Grid;