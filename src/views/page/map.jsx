import SideMenu from "../menu/sideMenu";
import Draggable from 'react-draggable';
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

const InteractiveMap = ({isAuthenticated, isAdmin}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const mapRef = useRef(null);
    const overlayTimeout = useRef(null);
    const isLongPress = useRef(false);
    const [isDragging, setIsDragging] = useState(false);

    const { row, col } = { row: 50, col: 50 };
    const cellSize = 40;
    const [cellsMatrix, setCellsMatrix] = useState([]);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isGameWin, setIsGameWin] = useState(false); // Hold value, re-render
    const socketRef = useRef(null); // Hold value, no re-render
    const clickTimeout = useRef(null);
    const timerInterval = useRef(null);
    const canvasWidth = useRef(0);
    const canvasHeight = useRef(0);

    // ========================
    // Timer functions
    // ========================

    const startTimer = () => {
        const timer = document.getElementById('timer');
        let time = 0;
        timerInterval.current = setInterval(() => {
            time++;
            timer.innerHTML = time.toString();
        }, 1000);
    }

    const stopTimer = () => {
        clearInterval(timerInterval.current);
    }

    // ========================
    // Mouse event handlers
    // ========================

    const handleOnClick = (event) => {
        if (isLongPress.current) {
            console.log('Is long press - not continuing.');
            return;
        }

        if (timerInterval.current === null) {
            startTimer();
        }

        let clientX, clientY;
        clientX = event.clientX;
        clientY = event.clientY;
        const canvas = document.getElementById('grid');
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left - position.x);
        const y = (clientY - rect.top - position.y);

        // Convert clicked coordinates to grid coordinates
        const row = Math.floor(y / (cellSize * scale));
        const col = Math.floor(x / (cellSize * scale));

        console.log(`Left click on cell (${row}, ${col})`);
        socketRef.current.emit('left-click', { row, col, roomId: getCookies()['roomId'], username: getCookies()['username'] });
    }

    const handleContextMenu = (event) => {
        event.preventDefault();

        if (timerInterval.current === null) {
            startTimer();
        }

        let clientX, clientY;
        clientX = event.clientX;
        clientY = event.clientY;
        const canvas = document.getElementById('grid');
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left - position.x);
        const y = (clientY - rect.top - position.y);

        // Convert clicked coordinates to grid coordinates
        const row = Math.floor(y / (cellSize * scale));
        const col = Math.floor(x / (cellSize * scale));

        console.log(`Right click on cell (${row}, ${col})`);
        socketRef.current.emit('right-click', { row, col, roomId: getCookies()['roomId'], username: getCookies()['username'] });
    }

    const handleMouseDown = (e) => {
        startPressTimer();
    }

    const handleMouseUp = (event) => {
        clearTimeout(overlayTimeout.current);
        setIsDragging(false)
    }

    const onMouseMove = (e) => {
        const canvasContainer = document.getElementById('container');
        canvasContainer.style.transformOrigin = `${e.clientX}px ${e.clientY}px`;
    }

    // ========================
    // Touch event handlers
    // ========================

    const handleTouchStart = (event) => {
        event.preventDefault();

        if (timerInterval.current === null) {
            startTimer();
        }

        let clientX, clientY;
        let timeoutFinished = false;

        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;

        const canvas = document.getElementById('grid');
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left - position.x);
        const y = (clientY - rect.top - position.y);

        // Convert clicked coordinates to grid coordinates
        const row = Math.floor(y / (cellSize * scale));
        const col = Math.floor(x / (cellSize * scale));

        clearTimeout(clickTimeout.current);
        clickTimeout.current = setTimeout(() => {
            timeoutFinished = true;
            // console.log(`Long press detected on cell (${row}, ${col})`);
            // Perform the desired action for a long press (right-click)
            socketRef.current.emit('right-click', { row, col, roomId: getCookies()['roomId'], username: getCookies()['username'] });
        }, 200);

        // Wait for the timeout to finish
        setTimeout(() => {
            // Perform the desired action for a quick tap (left-click)
            if (!timeoutFinished) {
                // console.log(`Quick tap detected on cell (${row}, ${col})`);
                socketRef.current.emit('left-click', { row, col, roomId: getCookies()['roomId'], username: getCookies()['username'] });
            }
        }, 200);
    }

    const handleTouchEnd = (event) => {
        clearTimeout(clickTimeout.current);
        clearTimeout(overlayTimeout.current);
    };

    // ========================
    // Grid drawing functions
    // ========================

    useEffect(() => {
        // Only use when the page is reload
        // This code will run after setCellsMatrix has completed and the component has re-rendered
        // console.log('Cells matrix updated:', cellsMatrix);
        redrawGrid(cellsMatrix, row, col, cellSize);
    }, [cellsMatrix]);

    // ========================
    // Room functions
    // ========================

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

    // ========================
    // Component lifecycle
    // ========================

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
            //addClickListeners()
            drawBomb(bombsCanvas.getContext('2d'), 20, 20, 10, 4);
        })

        socketRef.current.on('left-click', (data) => {
            //console.log('Received left-click event:', data);
            if (data.gameEnded) {
                if (data.isGameWin) {
                    setIsGameWin(true)
                }
                //removeClickListeners();
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
                //removeClickListeners();
                if (data.gridCells)
                    //setCellsMatrix(data.gridCells)
                    redrawGridBis(data.gridCells, cellSize);
                stopTimer();
                //alert('Game ended');
                setShowResultModal(true)
            } else {
                if (data.length > 0) {
                    //console.log("Data:", data)
                    redrawGridBis(data, cellSize);
                }
            }

        });

        const canvas = document.getElementById('grid');
        const home = document.querySelector('.home');
        const canvasInfos = document.querySelector(`.${styles.canvasInfos}`);
        const canvasContainer = document.querySelector(`.${styles.canvasContainer}`);

        // Set the width of canvasInfos and canvasContainer based on the width of the grid canvas
        if (canvas) {
            const canvasWidth = canvas.width;
            canvasWidth.current = canvasWidth;
            canvasHeight.current = canvas.height;

            home.style.width = `${canvasWidth}px`;
            home.style.height = `${canvas.height}px`;

            canvasInfos.style.width = `${canvasWidth+20}px`;
            canvasContainer.style.width = `${canvasWidth+cellSize}px`;
        }

        // Don't forget to disconnect when the component unmounts
        return () => {
            socketRef.current.disconnect();
            leaveRoom();
            //document.cookie = "roomId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        };
    }, []);

    // ========================
    // Drag and zoom handlers
    // ========================

    const startPressTimer = () => {
        isLongPress.current = false;
        overlayTimeout.current = setTimeout(() => {
            console.log("Long press detected");
            isLongPress.current = true;
        }, 100);
    }

    useEffect(() => {
        const map = mapRef.current;

        const handleWheel = (e) => {
            console.log('Wheel event:', e.clientX, e.clientY);
            const canvasContainer = document.getElementById('container');

            // Define zoom increments
            const zoomIncrements = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

            // Calculate current scale index
            let currentScaleIndex = zoomIncrements.indexOf(scale);
            if (currentScaleIndex === -1) {
                // If the current scale is not in the predefined increments, find the closest one
                const closestIndex = zoomIncrements.findIndex((increment) => increment > scale);
                if (closestIndex !== -1) {
                    currentScaleIndex = closestIndex;
                } else {
                    currentScaleIndex = zoomIncrements.length - 1; // Default to the maximum scale
                }
            }

            // Calculate next scale index based on scroll direction
            const delta = e.deltaY > 0 ? 1 : -1;
            const nextScaleIndex = Math.max(0, Math.min(zoomIncrements.length - 1, currentScaleIndex + delta));

            // Update scale
            const newScale = zoomIncrements[nextScaleIndex];
            setScale(newScale);

            // Apply scale and transform origin
            canvasContainer.style.transform = `scale(${newScale})`;

            // Prevent the default scroll behavior
            e.preventDefault();
        };


        // Attach event listeners
        map.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            // Clean up event listeners
            map.removeEventListener('wheel', handleWheel);
        };
    }, [scale]);

    return (
        <>
            <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>
            <section className="home">
                <div className="text">
                    Solo
                </div>
                <div className={styles.canvasPage}>
                    <div
                        ref={mapRef}
                        style={{
                            width: '100vw',
                            height: '100vh',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <Draggable>
                            <div
                                style={{
                                cursor: 'grab',
                                height: canvasHeight.current,
                                width: canvasWidth.current,
                                display: 'flex',
                                flexWrap: 'wrap',
                            }}>
                                <div id="container" className={styles.container}>
                                    <div className={styles.canvasInfos}>
                                        <div className={styles.bombsContainer}>
                                            <canvas id="bombsCounter" width="40" height="40"/>
                                            <div className={styles.bombs} id="bombs">0</div>
                                        </div>
                                        <div className={styles.timer} id="timer">0</div>
                                    </div>
                                    <div id="canvasContainer" className={styles.canvasContainer}
                                         onClick={handleOnClick} // left click
                                         onContextMenu={handleContextMenu} // right click
                                         onMouseDown={handleMouseDown} // for drag
                                         onMouseUp={handleMouseUp} // for drag release
                                         onTouchStart={handleTouchStart}
                                         onTouchEnd={handleTouchEnd}
                                    >
                                        <canvas id="grid" width={col * cellSize} height={row * cellSize} />
                                        {isDragging && (
                                            <div className={styles.overlay}>
                                            </div>
                                        )}
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
                                </div>
                            </div>
                        </Draggable>
                    </div>
                </div>
            </section>
        </>
    );
};

export default InteractiveMap;
