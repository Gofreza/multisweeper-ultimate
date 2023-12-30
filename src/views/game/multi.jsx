import SideMenu from "../menu/sideMenu";
import {useLocation} from "react-router-dom";
import {useCallback, useEffect, useRef, useState} from "react";
import {drawBomb, drawGrid, getCookies, getGridCoordinates, redrawGrid} from "../../miscFunctions/gameClientFunctions";
import styles from "/public/css/game.module.css"
import io from "socket.io-client";

const DIFFICULTY_NORMAL = 0.15;

const Multi = ({isAuthenticated, isAdmin}) => {
    const location = useLocation();
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const { roomName, ranked } = location.state || {};
    const [players, setPlayers] = useState(location.state.players || []);
    const [cellsMatrix, setCellsMatrix] = useState([]);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showWaitingModal, setShowWaitingModal] = useState(false);
    const [results, setResults] = useState([]);
    const [isGameEnded, setIsGameEnded] = useState(false);
    const socketRef = useRef(null);
    const [rows, setRows] = useState(10);
    const [cols, setCols] = useState(10);
    const isHost = players[0] === getCookies()['username'];
    const roomId = getCookies()['multiRoomId'];
    const [numBombsJoin, setNumBombsJoin] = useState(0);
    const [timeElapsedJoin, setTimeElapsedJoin] = useState(0);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const cellSize = 40;
    const timerInterval = useRef(null);
    const canvasRef = useRef(null);
    const clickTimeout = useRef(null);
    //console.log(roomName, ranked, players)

    // ================ FUNCTIONS ================
    //              Handle functions
    // ================ FUNCTIONS ================

    const handleRowInput = (event) => {
        setRows(event.target.value);
    }

    const handleColInput = (event) => {
        setCols(event.target.value);
    }

    const startTimer = (base = 0) => {
        const timer = document.getElementById('timer');
        let time = base;
        if (base > 0)
            timer.innerHTML = time.toString();

        if (timerInterval.current === null) {
            timerInterval.current = setInterval(() => {
                time++;
                timer.innerHTML = time.toString();
            }, 1000)
            //console.log("Start timer: ", timerInterval.current);
        }
    }

    const stopTimer = () => {
        clearInterval(timerInterval.current);
        timerInterval.current = null;
    }

    const handleTouchEnd = useCallback((event) => {
        clearTimeout(clickTimeout.current);
    }, [])

    const handleCanvasLeftClick = useCallback((event) => {
        if (event.type === 'touchstart')
            event.preventDefault();

        if (timerInterval === null) {
            startTimer();
        }

        let isTouchEvent = false;
        let timeoutFinished = false;
        let clientX, clientY;

        // Check if it's a touch event
        if (event.type === 'touchstart') {
            // Use the first touch in case of multitouch
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
            isTouchEvent = true;
        } else {
            // It's a click event
            clientX = event.clientX;
            clientY = event.clientY;
        }

        console.log(clientX, clientY)
        const { row, col } = getGridCoordinates(clientX, clientY, cellSize);

        if (isTouchEvent) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = setTimeout(() => {
                timeoutFinished = true;
                console.log(`Long press detected on cell (${row}, ${col})`);
                // Perform the desired action for a long press (right-click)
                socketRef.current.emit('right-click-multi', { row, col, roomId: getCookies()['multiRoomId'], username: getCookies()['username'], roomName: roomName })
            }, 200);

            // Wait for the timeout to finish
            setTimeout(() => {
                // Perform the desired action for a quick tap (left-click)
                if (!timeoutFinished) {
                    console.log(`Quick tap detected on cell (${row}, ${col})`);
                    socketRef.current.emit('left-click-multi', { row, col, roomId: getCookies()['multiRoomId'], username: getCookies()['username'], roomName: roomName })
                }
            }, 200);
        } else {
            // Quick tap (left-click)
            clearTimeout(clickTimeout.current);
            console.log(`Left click on cell (${row}, ${col})`);
            socketRef.current.emit('left-click-multi', { row, col, roomId: getCookies()['multiRoomId'], username: getCookies()['username'], roomName: roomName })
        }
    }, []);

    const handleCanvasRightClick = useCallback((event) => {
        event.preventDefault();
        if (timerInterval === null) {
            startTimer();
        }

        let clientX, clientY;

        // It's a click event
        clientX = event.clientX;
        clientY = event.clientY;

        const { row, col } = getGridCoordinates(clientX, clientY, cellSize);
        console.log(`Right clicked on cell (${row}, ${col})`);
        socketRef.current.emit('right-click-multi', { row, col, roomId: getCookies()['multiRoomId'], username: getCookies()['username'], roomName: roomName })
    }, []);

    const addClickListeners = () => {
        const isTouchDevice = 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;
        console.log("IsTouchDevice:", isTouchDevice)
        const leftClickEvent = isTouchDevice ? 'touchstart' : 'click';
        const rightClickEvent = isTouchDevice ? 'contextmenu' : 'contextmenu';

        const canvas = document.getElementById('grid');
        if (isTouchDevice) {
            canvas.addEventListener('touchstart', handleCanvasLeftClick);
            canvas.addEventListener('touchend', handleTouchEnd);
        }
        else {
            canvas.addEventListener(leftClickEvent, handleCanvasLeftClick);
            canvas.addEventListener('contextmenu', handleCanvasRightClick);
        }

    };

    const removeClickListeners = () => {
        const isTouchDevice = 'maxTouchPoints' in navigator && navigator.maxTouchPoints > 0;
        const leftClickEvent = isTouchDevice ? 'touchstart' : 'click';
        const rightClickEvent = isTouchDevice ? 'touchend' : 'contextmenu';

        const canvas = document.getElementById('grid');
        if (isTouchDevice) {
            canvas.removeEventListener('touchstart', handleCanvasLeftClick);
            canvas.removeEventListener('touchend', handleTouchEnd);
        } else {
            canvas.removeEventListener(leftClickEvent, handleCanvasLeftClick);
            canvas.removeEventListener('contextmenu', handleCanvasRightClick);
        }
    };

    // Initialize the game
    useEffect(() => {
        document.title = "MultiSweeper - Multiplayer - " + roomName;
        const cookies = getCookies();
        setIsDataLoaded(false);
        const socketServerURL =
            process.env.NODE_ENV === 'development'
                ? 'http://127.0.0.1:8000'
                : 'https://www.multisweeper.fr/';

        // ================ SOCKET.IO ================
        //             Socket.io events
        // ================ SOCKET.IO ================

        // Connect to the WebSocket server
        socketRef.current = io(socketServerURL);

        socketRef.current.on('receive-user-data', (data) => {
            const players = data.players;
            //console.log("Receive user data:", players);
            if (players.length === 0)
                // Force a reload of the page
                window.location.reload();
            setPlayers(players);
        })

        socketRef.current.on('start-multi-game', (data) => {
            //console.log("Start multi game event received:", data.cols, "/", data.rows);
            setCols(data.cols);
            setRows(data.rows);
            setIsGameStarted(true);
        })

        socketRef.current.on('restart-multi-game', (data) => {
            //console.log("Restart multi game event received:", data.cols, "/", data.rows);
            setCols(data.cols);
            setRows(data.rows);

            setIsGameEnded(false);
            setShowResultModal(false);
            setCellsMatrix([]);
            setRefresh(false);

            setIsGameStarted(true);
        })

        socketRef.current.on('multi-game-waiting', (data) => {
            //console.log("Multi game waiting event received:", data);
            stopTimer()
            //setCellsMatrix((prevData) => [...prevData, ...data.gridCells]);
            setShowWaitingModal(true);
        })

        socketRef.current.on('multi-game-ended', (data) => {
            //console.log("Multi game ended event received:", data);
            stopTimer()
            const filteredResults = data
                .filter(result => result.timeElapsed) // Filtering out results with falsy timeElapsed (you can adjust the condition based on your requirements)
                .sort((a, b) => a.timeElapsed - b.timeElapsed);
            setResults(filteredResults)
            setShowWaitingModal(false)
            removeClickListeners();
            setIsGameEnded(true)
            setShowResultModal(true)
            if (!isHost)
                setIsGameStarted(false)
            setRefresh(!refresh)
        })

        socketRef.current.on('left-click-multi', (data) => {
            //console.log('Received left-click-multi event:', data);
            startTimer()

            if (data.gameEnded) {
                // Moved
            } else {
                const bombs = document.getElementById('bombs');
                // Reveal Neighbors activated
                if (data.neighbors) {
                    //console.log("Reveal Neighbors activated")
                    if (data.isBomb) {
                        //console.log("Bomb found neighbor, here are the problems:", data.revealedCells)
                        setCellsMatrix((prevData) => [...prevData, ...data.revealedCells]);
                        data.revealedCells.forEach(_ => {
                            bombs.innerHTML = (bombs.innerHTML - 1).toString();
                        })
                    } else {
                        //console.log("No bomb found:", data.revealedCells)
                        setCellsMatrix((prevData) => [...prevData, ...data.revealedCells]);
                    }
                } else {
                    if (data.isBomb) {
                        //console.log("Bomb found:", data.revealedCells)
                        setCellsMatrix((prevData) => [...prevData, ...data.revealedCells]);
                        bombs.innerHTML = (bombs.innerHTML - 1).toString();
                    } else {
                        setCellsMatrix((prevData) => [...prevData, ...data]);
                    }
                }
            }
        })

        socketRef.current.on('right-click-multi', (data) => {
            //console.log('Received right-click-multi event:', data);
            startTimer()

            // Update the number of bombs
            const bombs = document.getElementById('bombs');
            try {
                if (data[0].flagged) {
                    bombs.innerHTML = (bombs.innerHTML - 1).toString();
                } else {
                    bombs.innerHTML = (parseInt(bombs.innerHTML) + 1).toString();
                }
            } catch (e) {
                console.log(e)
            }

            if (data.gameEnded) {
                // Moved
            } else {
                //console.log("Data", data)

                if (data.length > 0) {
                    setCellsMatrix((prevData) => {
                        //console.log("CellsMatrix", prevData)
                        const c = prevData.find(item => item.row === data[0].row && item.col === data[0].col)
                        //console.log(c)

                        if (c) {
                            //console.log("Cell found")
                            return prevData.filter(item => !(item.row === data[0].row && item.col === data[0].col));
                        } else {
                            return [...prevData, ...data];
                        }
                    })
                }
            }
        })

        // ================ CONNECTION ================
        //              Connection events
        // ================ CONNECTION ================

        if (cookies['multiRoomId']) {
            //console.log("Already in a multi room/Join multi room");

            fetch('/api/join-multi-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: cookies['multiRoomId']
                })
            })
                .then(response => response.json())
                .then(data => {
                    //console.log("Join multi room:", data);

                    if (data.started) {
                        //console.log("Grid:", data.grid)
                        setCols(data.grid.width);
                        setRows(data.grid.length);

                        // Timer
                        setTimeElapsedJoin(data.timeElapsed);

                        // Bombs
                        setNumBombsJoin(data.grid.numbombs);

                        // Grid
                        let res = [];
                        for (let x = 0; x < rows; x++) {
                            for (let y = 0; y < cols; y++) {
                                if (data.grid.matrix[x][y].flagged) {
                                    res.push({row: x, col: y, flagged: true})
                                } else if (data.grid.matrix[x][y].number !== -5) {
                                    res.push({row: x, col: y, number: data.grid.matrix[x][y].number})
                                }
                            }
                        }
                        // Flatten the array of arrays
                        const flattenedRes = res.flat();

                        setCellsMatrix((prevData) => [...prevData, ...flattenedRes]);

                        setIsGameStarted(true);
                    } else if (data.results){
                        //console.log("Results:", data.results)
                        setIsGameEnded(true);
                        setShowResultModal(true)
                        setResults(data.results)
                    }
                    setPlayers(data.players);
                    socketRef.current.emit('join-room', {roomName:roomName})
                    socketRef.current.emit('propagate-user-data', {players: data.players, roomName: roomName})
                    //console.log("Send propagate-user-data event")
                })
                .finally(() => {
                    setIsDataLoaded(true);
                });
        }
        else {
            fetch('/api/create-multi-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomName: roomName,
                    ranked: ranked
                })
            })
                .then(response => response.json())
                .then(data => {
                    //console.log(data);
                    setPlayers(data.players);
                    socketRef.current.emit('create-room', {roomName:roomName})
                    //console.log("Send create-room event")
                    setIsDataLoaded(true);
                });
        }

        // ================ UNMOUNT ================
        //             Unmount component
        // ================ UNMOUNT ================
        return () => {
            const cookies = getCookies();
            socketRef.current.emit('leave-room', {players: players, roomName:roomName, username: cookies['username']})
            fetch('/api/leave-multi-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId: cookies['multiRoomId']
                })
            })
                .then(response => response.json())
                .then(data => {
                    //console.log("Leave multi room:", data);
                    document.cookie = "multiRoomId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                });
            // Disconnect the socket
            socketRef.current.disconnect();
        }
    }, []);

    // Start/Restart Game
    useEffect(() => {
        const startMultiGameButton = document.getElementById('startMultiGame');

        const handleClick = (event) => {
            event.preventDefault();

            if (isGameEnded) {
                setIsGameEnded(false);
                setShowResultModal(false);
                setCellsMatrix([]);
                setRefresh(false);
                setNumBombsJoin(0);
                setTimeElapsedJoin(0);

                socketRef.current.emit('restart-multi-game', {roomId: roomId, roomName: roomName, rows: rows, cols: cols });
                //console.log("Restart multi game button clicked:", rows, "/", cols);
            } else {
                setIsGameStarted(true);
                // drawGrid(rows, cols, cellSize);
                socketRef.current.emit('start-multi-game', {roomId: roomId, roomName: roomName, rows: rows, cols: cols });
                //console.log("Start multi game button clicked:", rows, "/", cols);

            }
        };

        if (startMultiGameButton) {
            //console.log("startMultiGameButton found");

            // Remove previous event listener if it exists
            startMultiGameButton.removeEventListener('click', handleClick);

            // Add a new event listener
            startMultiGameButton.addEventListener('click', handleClick);
        } else {
            //console.log("startMultiGameButton not found");
        }

        // Cleanup function to remove the event listener when the component unmounts or when dependencies change
        return () => {
            if (startMultiGameButton) {
                startMultiGameButton.removeEventListener('click', handleClick);
            }
        };
    }, [isDataLoaded, rows, cols, refresh]);

    // Draw the grid if game started
    useEffect(() => {
        console.log("isGameStarted:", isGameStarted)
        if (isGameStarted) {
            const bombsCanvas = document.getElementById('bombsCounter');
            drawBomb(bombsCanvas.getContext('2d'), 20, 20, 10, 4);
            //console.log("Cols:", cols, "Rows:", rows);
            drawGrid(rows, cols, cellSize);
            const bombs = document.getElementById('bombs');
            bombs.innerHTML = (Math.ceil(rows * cols * DIFFICULTY_NORMAL)).toString();
            canvasRef.current = document.getElementById('grid');
            addClickListeners();
        }
    }, [isGameStarted]);

    // Update board after a rejoined player
    useEffect(() => {
        if (numBombsJoin > 0) {
            const bombs = document.getElementById('bombs');
            bombs.innerHTML = ((Math.ceil(rows * cols * DIFFICULTY_NORMAL)) - numBombsJoin).toString();
            stopTimer();
            startTimer(timeElapsedJoin);
        }
    }, [numBombsJoin])

    // Redraw the grid when cellsMatrix is updated
    useEffect(() => {
        //console.log("CellsMatrix updated:", cellsMatrix)
        if (isGameStarted) {
            console.log("Redraw grid")
            redrawGrid(cellsMatrix, rows, cols, cellSize);
        }
    }, [cellsMatrix]);

    if (isDataLoaded) {
        return (
            <>
                <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>
                <section className="home">
                    <div className="text">
                        Multi : {roomName}
                    </div>
                    <div>
                        <div className={styles.multiContainer}>
                            <div className={styles.gameContainer}>
                                {isGameStarted && !isGameEnded ? (
                                    <div className={styles.canvasPage}>
                                        <div className={styles.container}>
                                            <div className={styles.canvasInfos}>
                                                <div className={styles.bombsContainer}>
                                                    <canvas id="bombsCounter" width="40" height="40" />
                                                    <div className={styles.bombs} id="bombs">0</div>
                                                </div>
                                                <div className={styles.timer} id="timer">0</div>
                                            </div>
                                            <div id="canvasContainer" className={styles.canvasContainer}>
                                                <canvas id="grid" width={cols * cellSize} height={rows * cellSize} />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {isHost ? (
                                                <div className={styles.modalContent}>
                                                    <div className={styles.modalHeader}>
                                                        {isGameEnded ? (
                                                                <h2>Game ended</h2>
                                                        ) : (
                                                                <h2>Start game</h2>
                                                        )}
                                                    </div>
                                                    <div className={styles.modalBody}>
                                                        <form>
                                                            <label htmlFor="row">Row</label>
                                                            <input type="number" id="row" name="row" min="5" max="100" value={rows} onChange={handleRowInput}/>
                                                            <label htmlFor="col">Col</label>
                                                            <input type="number" id="col" name="col" min="5" max="100" value={cols} onChange={handleColInput}/>
                                                            <button id="startMultiGame" type="submit">Start</button>
                                                        </form>
                                                    </div>
                                                    <div className={styles.modalFooter}>
                                                        {showResultModal &&
                                                            <table>
                                                                <thead>
                                                                <tr>
                                                                    <th>Rank</th>
                                                                    <th>Username</th>
                                                                    <th>Time</th>
                                                                    {ranked && <th>Points</th>}
                                                                </tr>
                                                                </thead>
                                                                <tbody>
                                                                {results.map((result, index) => {
                                                                    return <tr key={index}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{result.username}</td>
                                                                        <td>{result.timeElapsed}</td>
                                                                        {ranked && <td>{result.points}</td>}
                                                                    </tr>
                                                                })}
                                                                </tbody>
                                                            </table>
                                                        }
                                                    </div>
                                                </div>
                                        ) : showResultModal ? (
                                                <div className={styles.modalContent}>
                                                    <div className={styles.modalHeader}>
                                                        <h2>Game ended</h2>
                                                    </div>
                                                    <div className={styles.modalBody}>
                                                        Waiting for host to start the game...
                                                    </div>
                                                    <div className={styles.modalFooter}>
                                                        <table>
                                                            <thead>
                                                            <tr>
                                                                <th>Rank</th>
                                                                <th>Username</th>
                                                                <th>Time</th>
                                                                {ranked && <th>Points</th>}
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {results.map((result, index) => {
                                                                return <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{result.username}</td>
                                                                    <td>{result.timeElapsed}</td>
                                                                    {ranked && <td>{result.points}</td>}
                                                                </tr>
                                                            })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                        ) : (
                                            <div className={styles.startContainer}>
                                                Waiting for host to start the game...
                                            </div>
                                        )}
                                    </div>
                                )
                                }
                                <div className={styles.playersContainer}>
                                    Players: {players.map((player, index) => {
                                        return <div className={styles.playerInfo} key={index}>
                                            <span id={index + player}>
                                                {player} {index === 0 ? "(host)" : ""}
                                            </span>
                                            <span id={index + "bombs"}>
                                                B : 0
                                            </span>
                                            <span id={index + "time"}>
                                                00:00
                                            </span>
                                        </div>
                                    })}
                                </div>
                            </div>
                            <div className={styles.chatContainer}>
                            </div>
                        </div>
                    </div>
                    {showWaitingModal && (
                        <div className={styles.modal}>
                            <div className={styles.modalContent}>
                                <div className={styles.modalHeader}>
                                    <h2>Game ended</h2>
                                </div>
                                <div className={styles.modalBody}>
                                    Waiting for other players...
                                </div>
                                <div className={styles.modalFooter}>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </>
        )
    } else {
        return (
            <>
                <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>
                <section className="home">
                    <div className="text">
                        Loading...
                    </div>
                </section>
            </>
        )
    }
}

export default Multi;