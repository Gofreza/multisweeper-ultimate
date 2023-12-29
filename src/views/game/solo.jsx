import SideMenu from "../menu/sideMenu";
import {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import io from "socket.io-client";
import styles from "/public/css/game.module.css"
import {drawBomb, drawGrid, getCookies, getGridCoordinates, redrawGrid} from "../../miscFunctions/gameClientFunctions";

const DIFFICULTY_NORMAL = 0.15;

const Solo = ({isAuthenticated, isAdmin}) => {
    const location = useLocation();
    const { row, col } = location.state || {};
    const cellSize = 40;
    const [cellsMatrix, setCellsMatrix] = useState([]);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isGameWin, setIsGameWin] = useState(false);
    const socketRef = useRef(null);
    let timerInterval = null;

    const startTimer = () => {
        const timer = document.getElementById('timer');
        let time = 0;
        timerInterval = setInterval(() => {
            time++;
            timer.innerHTML = time.toString();
        }, 1000);
    }

    const stopTimer = () => {
        clearInterval(timerInterval);
    }

    const handleCanvasLeftClick = (event) => {
        if (timerInterval === null) {
            startTimer();
        }
        const { row, col } = getGridCoordinates(event.clientX, event.clientY, cellSize);
        //console.log(`Left clicked on cell (${row}, ${col})`);

        socketRef.current.emit('left-click', { row, col, roomId: getCookies()['roomId'] })
    }

    const handleCanvasRightClick = (event) => {
        event.preventDefault();
        if (timerInterval === null) {
            startTimer();
        }
        const { row, col } = getGridCoordinates(event.clientX, event.clientY, cellSize);
        //console.log(`Right clicked on cell (${row}, ${col})`);

        socketRef.current.emit('right-click', { row, col, roomId: getCookies()['roomId'] })
    }

    const addClickListeners = () => {
        const isTouchDevice = 'ontouchstart' in document.documentElement;
        const leftClickEvent = isTouchDevice ? 'touchstart' : 'click';
        const rightClickEvent = isTouchDevice ? 'touchend' : 'contextmenu';

        const canvas = document.getElementById('grid');
        canvas.addEventListener(leftClickEvent, handleCanvasLeftClick);
        canvas.addEventListener(rightClickEvent, handleCanvasRightClick);
    };

    const removeClickListeners = () => {
        const canvas = document.getElementById('grid');
        canvas.removeEventListener('click', handleCanvasLeftClick);
        canvas.removeEventListener('contextmenu', handleCanvasRightClick);
    };

    const leaveRoom = () => {
        fetch('/api/leave-solo-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roomId: getCookies()['roomId'] })
        })
            .then(response => response.json())
            .then(responseJson => {
                //console.log(responseJson.message);
            })

        document.cookie = "roomId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    const retry = () => {
        leaveRoom();

        fetch('/api/create-solo-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rows: row, cols: col })
        })
            .then(response => response.json())
            .then(responseJson => {
                //console.log('Room created N°', responseJson.roomId);
                drawGrid(row, col, cellSize);
                // Create the 'roomId' cookie
            })
            .catch(error => {
                //console.error('Error creating room:', error);
            })

        window.location.reload();
    }

    useEffect(() => {
        // This code will run after setCellsMatrix has completed and the component has re-rendered
        //console.log('Cells matrix updated:', cellsMatrix);
        redrawGrid(cellsMatrix, row, col, cellSize);
    }, [cellsMatrix]);

    useEffect(() => {
        document.title = "MultiSweeper - Solo";
        const cookies = getCookies();

        const socketServerURL =
            process.env.NODE_ENV === 'development'
                ? 'http://127.0.0.1:8000'
                : 'https://www.multisweeper.fr/';

        if (cookies['roomId']) {
            fetch('/api/join-solo-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomId: cookies['roomId'] })
            })
                .then(response => response.json())
                .then(responseJson => {
                    //console.log('Room joined N°', responseJson.roomId/*, 'in ', responseJson.room.matrix*/);

                    if (responseJson.isFinished) {
                        setShowResultModal(true)
                        setIsGameWin(responseJson.isGameWin)
                        setCellsMatrix(responseJson.room)
                    } else {
                        let res = [];
                        for (let x = 0; x < row; x++) {
                            for (let y = 0; y < col; y++) {
                                //console.log(responseJson.room.matrix[x][y])

                                if (responseJson.room.matrix[x][y].flagged) {
                                    res.push({row: x, col: y, flagged: true})
                                } else if (responseJson.room.matrix[x][y].number !== -1) {
                                    res.push({row: x, col: y, number: responseJson.room.matrix[x][y].number})
                                }

                                //console.log(res)
                            }
                        }

                        // Get the number of bombs
                        const bombs = document.getElementById('bombs');
                        bombs.innerHTML = responseJson.numBombs.toString();

                        // Flatten the array of arrays
                        const flattenedRes = res.flat();

                        setCellsMatrix((prevData) => [...prevData, ...flattenedRes]);
                    }
                })

        } else {
            // Create the room
            fetch('/api/create-solo-room', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rows: row, cols: col })
            })
                .then(response => response.json())
                .then(responseJson => {
                    //console.log('Room created N°', responseJson.roomId);
                    drawGrid(row, col, cellSize);
                    const bombs = document.getElementById('bombs');
                    bombs.innerHTML = (Math.ceil(row * col * DIFFICULTY_NORMAL)).toString();
                    // Create the 'roomId' cookie
                })
                .catch(error => {
                    //console.error('Error creating room:', error);
                })
        }
        // Connect to the WebSocket server
        socketRef.current = io(socketServerURL);

        // Listen for events
        socketRef.current.on('connect', () => {
            //console.log('Connected to socket server');
            const bombsCanvas = document.getElementById('bombsCounter');
            // Add event listener to the canvas
            addClickListeners()
            drawBomb(bombsCanvas.getContext('2d'), 20, 20, 10, 4);
        })

        socketRef.current.on('left-click', (data) => {
            //console.log('Received left-click event:', data);

            if (data.gameEnded) {
                if (data.isGameWin) {
                    setIsGameWin(true)
                }
                removeClickListeners();
                if (data.gridCells)
                    setCellsMatrix(data.gridCells)
                stopTimer();
                //alert('Game ended');
                setShowResultModal(true)
            } else {
                // Reveal Neighbors activated
                if (data.neighbors) {
                    //console.log("Reveal Neighbors activated")
                    if (data.isBomb) {
                        //console.log("Bomb found")
                        setCellsMatrix(data.revealedCells)
                        setIsGameWin(false)
                        stopTimer()
                        setShowResultModal(true)
                    } else {
                        //console.log("No bomb found:", data.revealedCells)
                        setCellsMatrix((prevData) => [...prevData, ...data.revealedCells]);
                    }
                } else {
                    setCellsMatrix((prevData) => [...prevData, ...data]);
                }
            }

            //Activate useEffect
        })

        socketRef.current.on('right-click', (data) => {
            //console.log('Received right-click event:', data);

            // Update the number of bombs
            const bombs = document.getElementById('bombs');
            try {
                if (data[0].flagged) {
                    bombs.innerHTML = (bombs.innerHTML - 1).toString();
                } else {
                    bombs.innerHTML = (parseInt(bombs.innerHTML) + 1).toString();
                }
            } catch (e) {
                //console.log(e)
            }

            if (data.gameEnded) {
                if (data.isGameWin)
                    setIsGameWin(true)
                removeClickListeners();
                if (data.gridCells)
                    setCellsMatrix(data.gridCells)
                stopTimer();
                //alert('Game ended');
                setShowResultModal(true)
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

        });

        // Don't forget to disconnect when the component unmounts
        return () => {
            socketRef.current.disconnect();
            leaveRoom();
            //document.cookie = "roomId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        };
    }, []);

    return (
        <>
            <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>
            <section className="home">
                <div className="text">
                    Solo
                </div>
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
                            <canvas id="grid" width={col * cellSize} height={row * cellSize} />
                        </div>
                    </div>
                </div>
                {showResultModal && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h2>Game ended</h2>
                            </div>
                            <div className={styles.modalBody}>
                                {isGameWin ? (
                                    <p>You win!</p>
                                ) : (
                                    <p>You lose!</p>
                                )}
                            </div>
                            <div className={styles.modalFooter}>
                                <button onClick={retry}>Retry</button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    )
}

export default Solo;