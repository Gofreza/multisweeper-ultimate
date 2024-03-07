import SideMenu from "../menu/sideMenu";
import {useCallback, useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import io from "socket.io-client";
import styles from "/public/css/game.module.css"
import {
    drawBomb,
    drawGrid,
    getCookies,
    getGridCoordinates,
    redrawGrid,
    redrawGridBis
} from "../../miscFunctions/gameClientFunctions";

const DIFFICULTY_NORMAL = 0.15;

const Solo = ({isAuthenticated, isAdmin}) => {
    const location = useLocation();
    const { row, col } = location.state || {};
    const cellSize = 40;
    const [cellsMatrix, setCellsMatrix] = useState([]);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isGameWin, setIsGameWin] = useState(false); // Hold value, re-render
    const socketRef = useRef(null); // Hold value, no re-render
    const clickTimeout = useRef(null);
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

        // console.log(clientX, clientY)
        const { row, col } = getGridCoordinates(clientX, clientY, cellSize);

        if (isTouchEvent) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = setTimeout(() => {
                timeoutFinished = true;
                // console.log(`Long press detected on cell (${row}, ${col})`);
                // Perform the desired action for a long press (right-click)
                socketRef.current.emit('right-click', { row, col, roomId: getCookies()['roomId'] });
            }, 200);

            // Wait for the timeout to finish
            setTimeout(() => {
                // Perform the desired action for a quick tap (left-click)
                if (!timeoutFinished) {
                    // console.log(`Quick tap detected on cell (${row}, ${col})`);
                    socketRef.current.emit('left-click', { row, col, roomId: getCookies()['roomId'] });
                }
            }, 200);
        } else {
            // Quick tap (left-click)
            clearTimeout(clickTimeout.current);
            // console.log(`Left click on cell (${row}, ${col})`);
            socketRef.current.emit('left-click', { row, col, roomId: getCookies()['roomId'] });
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
        // console.log(`Right clicked on cell (${row}, ${col})`);
        socketRef.current.emit('right-click', {row, col, roomId: getCookies()['roomId']})
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
        console.log('Cells matrix updated:', cellsMatrix);
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
                        //setCellsMatrix(responseJson.room)
                        redrawGridBis(responseJson.room, cellSize);
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

                        //setCellsMatrix((prevData) => [...prevData, ...flattenedRes]);
                        redrawGridBis(flattenedRes, cellSize);
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
                    //setCellsMatrix(data.gridCells)
                    redrawGridBis(data.gridCells, cellSize);
                stopTimer();
                //alert('Game ended');
                setShowResultModal(true)
            } else {
                // Reveal Neighbors activated
                if (data.neighbors) {
                    //console.log("Reveal Neighbors activated")
                    if (data.isBomb) {
                        //console.log("Bomb found")
                        //setCellsMatrix(data.revealedCells)
                        redrawGridBis(data.revealedCells, cellSize);
                        setIsGameWin(false)
                        stopTimer()
                        setShowResultModal(true)
                    } else {
                        //console.log("No bomb found:", data.revealedCells)
                        //setCellsMatrix((prevData) => [...prevData, ...data.revealedCells]);
                        redrawGridBis(data.revealedCells, cellSize);
                    }
                } else {
                    //setCellsMatrix((prevData) => [...prevData, ...data]);
                    redrawGridBis(data, cellSize);
                }
            }

            //Activate useEffect
        })

        socketRef.current.on('right-click', (data) => {
            // console.log('Received right-click event:', data);

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
                    //setCellsMatrix(data.gridCells)
                    redrawGridBis(data.gridCells, cellSize);
                stopTimer();
                //alert('Game ended');
                setShowResultModal(true)
            } else {
                if (data.length > 0) {
                    console.log("Data:", data)
                    redrawGridBis(data, cellSize);
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