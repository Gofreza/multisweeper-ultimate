const Grid = require("./grid");
const _ = require('lodash');

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
    constructor(rows, cols, isMultiplayer = false, numBombs = -1, bombsCoordinates = []) {
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
        this.multiGrids = [];
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
        if (this.multiplayer) {
            this.grid = new Grid(this.rows, this.cols, null, this.numBombs, this.bombsCoordinates);
        } else {
            this.grid = null;
            this.currentGrid = new Grid(this.rows, this.cols);
        }

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

        // console.log("Bomb things:", bombNumber, flagNumber, visibleNonBombCells, "Game ended:", bombNumber === flagNumber && visibleNonBombCells === (this.rows * this.cols - bombNumber));
        return bombNumber === flagNumber && visibleNonBombCells === (this.rows * this.cols - bombNumber);

    }

    checkIfMultiGameEnded(mainGrid) {
        let bombNumber = 0;
        let flagNumber = 0;
        let visibleNonBombCells = 0;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = mainGrid.matrix[row][col];

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
                const cell = mainGrid.matrix[row][col];

                if (cell.hasBomb() && !cell.isVisible() && !cell.isFlagged()) {
                    return false; // The game hasn't ended yet
                }
            }
        }

        return bombNumber === flagNumber && visibleNonBombCells === (this.rows * this.cols - bombNumber);

    }

    checkIfAllMultiGamesEnded(numPlayers) {
        let allGamesEnded = true;

        // Check if every game has ended
        for (const grid of this.multiGrids) {
            if (!this.checkIfMultiGameEnded(grid.mainGrid)) {
                allGamesEnded = false;
                break; // Break the loop as soon as one game is not ended
            }
        }

        // Check if the number of games matches numPlayers
        const numGames = this.multiGrids.length;
        const isNumGamesMatched = numGames === numPlayers;

        return allGamesEnded && isNumGamesMatched;
    }

    getMultiResults() {
        let results = [];
        for (const grid of this.multiGrids) {
            results.push({
                username: grid.username,
                timeElapsed: grid.timeElapsed,
            });
        }
        return results;
    }

    addMultiGrid(username) {
        let userGridIndex = this.multiGrids.findIndex((grid) => grid.username === username);
        if (!this.multiGrids[userGridIndex]) {
            // If the structure for this user doesn't exist, create it
            console.log("Creating grid for user:", username);
            const newMainGrid = _.cloneDeep(this.grid);
            this.multiGrids.push({
                username: username,
                timeElapsed: 0,
                timerInterval: null,
                mainGrid: newMainGrid,
                currentGrid: new Grid(this.rows, this.cols, username)
            });
            userGridIndex = this.multiGrids.length - 1;
            this.multiGrids[userGridIndex].timerInterval = setInterval(() => {
                this.multiGrids[userGridIndex].timeElapsed++;
            }, 1000);
        }
    }

    getMultiGrid(username) {
        return this.multiGrids.find((grid) => grid.username === username);
    }

    handleLeftClick(row, col, username = null) {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.startTimer();
        }

        if (!this.firstClick) {
            this.grid = new Grid(this.rows, this.cols, null, this.numBombs, this.bombsCoordinates, row, col);
            this.firstClick = true;
        }

        if (this.grid.isFlagged(row, col)) {
            return [];
        }

        if (!this.grid.isVisible(row, col) && !this.grid.isFlagged(row, col)) {
            // console.log("Cell:",this.grid.matrix[row][col].toString());

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
                    if (username) {
                        // If the grid for this user doesn't exist, create it
                        if (!this.multiGrids.find((grid) => grid.username === username)) {
                            this.multiGrids.push(new Grid(this.rows, this.cols, username));
                        }
                        this.multiGrids.find((grid) => grid.username === username).setNumber(r.row, r.col, r.number);
                        this.multiGrids.find((grid) => grid.username === username).setVisible(r.row, r.col);
                    } else {
                        this.currentGrid.setNumber(r.row, r.col, r.number);
                        this.currentGrid.setVisible(r.row, r.col);
                    }
                })

                // console.log("Game ended:", this.checkIfGameEnded());
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
            // console.log("res:", res);

            // console.log("Game ended:", this.checkIfGameEnded());
            if (this.checkIfGameEnded()) {
                this.isGameEnded = true;
                this.isGameWin = true;
                this.stopTimer();
                return {gameEnded: true, isGameWin: true, gridCells: this.grid.revealGrid()};
            }

            res.revealedCells.map((r) => {
                if (username) {
                    // If the grid for this user doesn't exist, create it
                    if (!this.multiGrids.find((grid) => grid.username === username)) {
                        this.multiGrids.push(new Grid(this.rows, this.cols, username));
                    }
                    this.multiGrids.find((grid) => grid.username === username).setNumber(r.row, r.col, r.number);
                    this.multiGrids.find((grid) => grid.username === username).setVisible(r.row, r.col);
                } else {
                    this.currentGrid.setNumber(r.row, r.col, r.number);
                    this.currentGrid.setVisible(r.row, r.col);
                }
            })

            // console.log("Neighbors:", res);
            return res;
        }

        return {gameEnded: false, isGameWin: false};
    }

    handleMultiLeftClick(row, col, username = null) {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
        }

        this.addMultiGrid(username);

        const userGridIndex = this.multiGrids.findIndex((grid) => grid.username === username);
        const mainGrid = this.multiGrids[userGridIndex].mainGrid;
        const userGrid = this.multiGrids[userGridIndex].currentGrid;

        if (mainGrid.isFlagged(row, col)) {
            return [];
        }

        if (!mainGrid.isVisible(row, col) && !mainGrid.isFlagged(row, col)) {
            //console.log("Cell:",mainGrid.matrix[row][col].toString());

            if (mainGrid.hasBomb(row, col)) {
                if (this.multiplayer) {
                    mainGrid.setExploded(row, col);
                    this.numBombsExploded++;
                    userGrid.numbombs = userGrid.numbombs - 1;
                    const res = mainGrid.revealCell(row, col, false);
                    mainGrid.toggleFlag(row, col);
                    res.map((r) => {
                        if (username) {
                            userGrid.setNumber(r.row, r.col, r.number);
                            userGrid.toggleFlag(r.row, r.col);
                            userGrid.setVisible(r.row, r.col);
                        }
                    })

                    console.log("Game ended hasBomb:", this.checkIfMultiGameEnded(mainGrid));
                    if (this.checkIfMultiGameEnded(mainGrid)) {
                        this.isGameEnded = true;
                        this.isGameWin = true;
                        clearInterval(this.multiGrids[userGridIndex].timerInterval);
                        return {gameEnded: true, isGameWin: true, gridCells: mainGrid.revealGrid()};
                    }

                    return {isBomb: true, bomb: [{row: row, col: col, number: -1}], revealedCells: res};
                } else {
                    this.isGameEnded = true;
                    const gridCells = mainGrid.revealGrid();
                    clearInterval(this.multiGrids[userGridIndex].timerInterval);
                    return {gameEnded: true, isGameWin: false, gridCells: gridCells};
                }
            } else {
                const res = mainGrid.revealCell(row, col, false);

                res.map((r) => {
                    if (username) {
                        userGrid.setNumber(r.row, r.col, r.number);
                        userGrid.setVisible(r.row, r.col);
                    } else {
                        this.currentGrid.setNumber(r.row, r.col, r.number);
                        this.currentGrid.setVisible(r.row, r.col);
                    }
                })

                //console.log("Game ended:", this.checkIfMultiGameEnded(mainGrid));
                if (this.checkIfMultiGameEnded(mainGrid)) {
                    this.isGameEnded = true;
                    this.isGameWin = true;
                    clearInterval(this.multiGrids[userGridIndex].timerInterval);
                    return {gameEnded: true, isGameWin: true, gridCells: mainGrid.revealGrid()};
                }

                return res;
            }
        }

        if (mainGrid.isVisible(row, col) && !mainGrid.isFlagged(row, col)) {
            const res = mainGrid.revealNeighbours(row, col);

            //console.log("Game ended:", this.checkIfMultiGameEnded(mainGrid));
            if (this.checkIfMultiGameEnded(mainGrid)) {
                this.isGameEnded = true;
                this.isGameWin = true;
                clearInterval(this.multiGrids[userGridIndex].timerInterval);
                return {gameEnded: true, isGameWin: true, gridCells: mainGrid.revealGrid()};
            }
            res.revealedCells.map((r) => {
                if (username) {
                    if (r.number === -1) {
                        mainGrid.setExploded(r.row, r.col);
                        mainGrid.toggleFlag(r.row, r.col);
                        userGrid.setExploded(r.row, r.col);
                        userGrid.toggleFlag(r.row, r.col);
                        userGrid.numbombs = userGrid.numbombs - 1;
                    }
                    userGrid.setNumber(r.row, r.col, r.number);
                    userGrid.setVisible(r.row, r.col);
                } else {
                    this.currentGrid.setNumber(r.row, r.col, r.number);
                    this.currentGrid.setVisible(r.row, r.col);
                }
            })

            return res;
        }

        return {gameEnded: false, isGameWin: false};
    }

    handleRightClick(row, col, username = null) {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
            this.startTimer();
        }

        if (!this.firstClick) {
            this.grid = new Grid(this.rows, this.cols, null, this.numBombs, this.bombsCoordinates, row, col);
            this.firstClick = true;
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
            if (username) {
                // If the grid for this user doesn't exist, create it
                if (!this.multiGrids.find((grid) => grid.username === username)) {
                    this.multiGrids.push(new Grid(this.rows, this.cols, username));
                }
                this.multiGrids.find((grid) => grid.username === username).toggleFlag(row, col);
            } else {
                this.currentGrid.toggleFlag(row, col);
            }

            // console.log("Game ended:", this.checkIfGameEnded());
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

    handleMultiRightClick(row, col, username = null) {
        if (!this.isGameStarted) {
            this.isGameStarted = true;
        }

        this.addMultiGrid(username);

        const userGridIndex = this.multiGrids.findIndex((grid) => grid.username === username);
        const mainGrid = this.multiGrids[userGridIndex].mainGrid;
        const userGrid = this.multiGrids[userGridIndex].currentGrid;

        if (mainGrid.isVisible(row, col)) {
            return [];
        }

        if (!mainGrid.isVisible(row, col)) {

            // Update current bombs number
            if (mainGrid.isFlagged(row, col)) {
                this.currentBombs++;
            } else {
                if (this.currentBombs > 0)
                    this.currentBombs--;
            }

            // Flag the server cell
            mainGrid.toggleFlag(row, col);

            // Flag the client cell
            if (username) {
                if (userGrid.isFlagged(row, col)) {
                    userGrid.numbombs = userGrid.numbombs - 1;
                } else {
                    userGrid.numbombs = userGrid.numbombs + 1;
                }
                userGrid.toggleFlag(row, col);
            } else {
                this.currentGrid.toggleFlag(row, col);
            }

            //console.log("Game ended:", this.checkIfMultiGameEnded(mainGrid));
            if (this.checkIfMultiGameEnded(mainGrid)) {
                this.isGameEnded = true;
                this.isGameWin = true;
                clearInterval(this.multiGrids[userGridIndex].timerInterval);
                return {gameEnded: true, isGameWin: true, gridCells: mainGrid.revealGrid()};
            }

            return [{row: row, col: col, flagged: mainGrid.isFlagged(row, col)}];
        }

        return {gameEnded: false, isGameWin: false};
    }
}

module.exports = Game;