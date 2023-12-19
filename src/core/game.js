const Grid = require("./grid");

class Game {

    static DIFFICULTY_NORMAL = 0.15;
    static DIFFICULTY_EASY = 0.1;
    static DIFFICULTY_HARD = 0.2;

    /**
     * Constructor to create a game with specified rows, cols, number of bombs and bomb coordinates
     * @param rows - Number of rows
     * @param cols - Number of columns
     * @param numBombs - Number of bombs (optional)
     * @param bombsCoordinates - Array of {row, col} representing bomb coordinates (optional)
     * @param isMultiplayer - Boolean representing whether the game is multiplayer or not (optional)
     */
    constructor(rows, cols, numBombs = -1, bombsCoordinates = [], isMultiplayer = false) {
        //Game state
        this.isGameWin = false;
        this.isGameEnded = false;
        this.multiplayer = isMultiplayer;

        //Stats
        this.numBombsDefused = 0;
        this.numBombsExploded = 0;
        this.numFlagsPlaced = 0;
        this.numCellsRevealed = 0;

        //Timer
        this.timerInterval = null;
        this.timeElapsed = 0;
        this.isGameStarted = false;

        //Bombs
        if (numBombs === -1) {
            this.numBombs = rows*cols*Game.DIFFICULTY_NORMAL;
        } else {
            this.numBombs = numBombs;
        }

        this.bombsCoordinates = bombsCoordinates;

        //Grid
        this.grid = null;
        this.currentGrid = null;
        this.rows = rows;
        this.cols = cols;
        this.currentBombs = this.numBombs;

        //Initialize the game
        this.firstClick = false;
        this.initialize();
    }

    initialize() {
        this.isGameWin = false;
        this.isGameEnded = false;
        this.numBombsDefused = 0;
        this.numBombsExploded = 0;
        this.numFlagsPlaced = 0;
        this.numCellsRevealed = 0;
        this.timeElapsed = 0;
        this.isGameStarted = false;
        this.grid = null;
        this.currentGrid = new Grid(this.rows, this.cols);
    }

    /**
     * Start the server timer
     */
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeElapsed++;
        }, 1000);
    }

    /**
     * Stop the server timer
     */
    stopTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
    }

    /**
     * Get the time elapsed
     * @returns {number} - Time elapsed
     */
    getTimeElapsed() {
        return this.timeElapsed;
    }

    /**
     * Get the number of bombs
     * @returns {number} - Number of bombs
     */
    getNumBombs() {
        return this.numBombs;
    }

    checkIfGameEnded() {

        let bombNumber = 0;
        let flagNumber = 0;
        let visibleNonBombCells = 0;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid.matrix[row][col];

                if (cell.hasBomb()) {
                    bombNumber++;
                }

                if (cell.isFlagged()) {
                    flagNumber++;
                }

                if (cell.isVisible() && !cell.hasBomb()) {
                    visibleNonBombCells++;
                }
            }
        }

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid.matrix[row][col];

                if (cell.hasBomb() && !cell.isVisible() && !cell.isFlagged()) {
                    return false; // The game hasn't ended yet
                }
            }
        }

        return bombNumber === flagNumber && visibleNonBombCells === (this.rows * this.cols - bombNumber);

    }

    handleLeftClick(row, col) {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.startTimer();
        }

        if (!this.firstClick) {
            this.grid = new Grid(this.rows, this.cols, this.numBombs, this.bombsCoordinates, row, col);
            this.firstClick = true;
        }

        if (this.grid.isFlagged(row, col)) {
            return [];
        }

        if (!this.grid.isVisible(row, col) && !this.grid.isFlagged(row, col)) {
            console.log("Cell:",this.grid.matrix[row][col].toString());

            if (this.grid.hasBomb(row, col)) {
                if (this.multiplayer) {
                    this.grid.setExploded(row, col);
                    this.numBombsExploded++;
                    return {isBomb: true, bombsList: [{bombRow: row, bombCol: col}]};
                } else {
                    this.isGameEnded = true;
                    const gridCells = this.grid.revealGrid();
                    this.stopTimer();
                    return {gameEnded: true, isGameWin: false, gridCells: gridCells};
                }
            } else {
                const res = this.grid.revealCell(row, col, false);

                res.map((r) => {
                    this.currentGrid.setNumber(r.row, r.col, r.number);
                    this.currentGrid.setVisible(r.row, r.col);
                })

                console.log("Game ended:", this.checkIfGameEnded());
                if (this.checkIfGameEnded()) {
                    this.isGameEnded = true;
                    this.isGameWin = true;
                    this.stopTimer();
                    return {gameEnded: true, isGameWin: true, gridCells: this.grid.revealGrid()};
                }

                return res;
            }
        }

        if (this.grid.isVisible(row, col) && !this.grid.isFlagged(row, col)) {
            const res = this.grid.revealNeighbours(row, col);
            console.log("res:", res);

            console.log("Game ended:", this.checkIfGameEnded());
            if (this.checkIfGameEnded()) {
                this.isGameEnded = true;
                this.isGameWin = true;
                this.stopTimer();
                return {gameEnded: true, isGameWin: true, gridCells: this.grid.revealGrid()};
            }

            res.revealedCells.map((r) => {
                this.currentGrid.setNumber(r.row, r.col, r.number);
                this.currentGrid.setVisible(r.row, r.col);
            })

            console.log("Neighbors:", res);
            return res;
        }

        return {gameEnded: false, isGameWin: false};
    }

    handleRightClick(row, col) {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.startTimer();
        }

        if (this.grid.isVisible(row, col)) {
            return [];
        }

        if (!this.grid.isVisible(row, col)) {

            // Update current bombs number
            if (this.grid.isFlagged(row, col)) {
                this.currentBombs++;
            } else {
                if (this.currentBombs > 0)
                    this.currentBombs--;
            }

            // Flag the server cell
            this.grid.toggleFlag(row, col);

            // Flag the client cell
            this.currentGrid.toggleFlag(row, col);

            console.log("Game ended:", this.checkIfGameEnded());
            if (this.checkIfGameEnded()) {
                this.isGameEnded = true;
                this.isGameWin = true;
                this.stopTimer();
                return {gameEnded: true, isGameWin: true, gridCells: this.grid.revealGrid()};
            }

            return [{row: row, col: col, flagged: this.grid.isFlagged(row, col)}];
        }

        return {gameEnded: false, isGameWin: false};
    }
}

module.exports = Game;