import SideMenu from "../menu/sideMenu";
import {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import io from "socket.io-client";
import styles from "/public/css/game.module.css"

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

    const getCookies = () => {
        const cookies = {};
        document.cookie.split(';').forEach(function(cookie) {
            const parts = cookie.match(/(.*?)=(.*)$/)
            cookies[ parts[1].trim() ] = (parts[2] || '').trim();
        });
        return cookies;
    }

    const getGridCoordinates = (clientX, clientY) => {
        const canvas = document.getElementById('grid');
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // Convert clicked coordinates to grid coordinates
        const row = Math.floor(y / (cellSize));
        const col = Math.floor(x / (cellSize));

        return { row, col };
    };

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
        const { row, col } = getGridCoordinates(event.clientX, event.clientY);
        console.log(`Left clicked on cell (${row}, ${col})`);

        socketRef.current.emit('left-click', { row, col, roomId: getCookies()['roomId'] })
    }

    const handleCanvasRightClick = (event) => {
        event.preventDefault();
        if (timerInterval === null) {
            startTimer();
        }
        const { row, col } = getGridCoordinates(event.clientX, event.clientY);
        console.log(`Right clicked on cell (${row}, ${col})`);

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

    const drawGrid = () => {
        const canvas = document.getElementById('grid');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#999999";
        ctx.fillRect(0, 0, col * cellSize, row * cellSize);

        ctx.strokeStyle = "#000000"; // Set stroke color to black
        ctx.lineWidth = 1;

        for (let r = 0; r < row; r++) {
            for (let c = 0; c < col; c++) {
                const x = c * cellSize;
                const y = r * cellSize;

                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
    };

    // Redraw the grid based on the array
    const redrawGrid = (cellsMatrix) => {
        const canvas = document.getElementById('grid');
        const ctx = canvas.getContext('2d');

        ctx.strokeStyle = "#000000"; // Set stroke color to black
        ctx.lineWidth = 1;

        for (let r = 0; r < row; r++) {
            for (let c = 0; c < col; c++) {
                const x = c * cellSize;
                const y = r * cellSize;
                const radius = cellSize / 4;
                const offset = 4;

                ctx.clearRect(x, y, cellSize, cellSize);
                ctx.strokeRect(x, y, cellSize, cellSize);

                const cell = cellsMatrix.find(item => item.row === r && item.col === c);

                if (cell) {
                    if (cell.flagged) {
                        // Draw a flag
                        ctx.fillStyle = "#ff0000"; // Set the fill color to red

                        // Set flag dimensions and position
                        const flagWidth = cellSize / 2;
                        const flagHeight = cellSize / 2;
                        const flagX = x + cellSize / 4;
                        const flagY = y + cellSize / 4;

                        // Draw the flag
                        ctx.fillRect(flagX, flagY, flagWidth, flagHeight);

                        //ctx.fillRect(col * cellSize + cellSize / 4, row * cellSize + cellSize / 4, cellSize / 2, cellSize / 2); // Draw a flag
                    } else {
                        // Draw the background
                        ctx.fillStyle = "#f9f8f5";
                        ctx.fillRect(x, y, cellSize, cellSize);

                        // Determine the text color
                        let textColor = "#000000"; // Set the default text color to black
                        if (cell.number === 1) {
                            textColor = "blue"; // Change the text color to blue if the number is 1
                        } else if (cell.number === 2) {
                            textColor = "green"; // Change the text color to green if the number is 2
                        } else if (cell.number === 3) {
                            textColor = "red"; // Change the text color to red if the number is 3
                        } else if (cell.number === 4) {
                            textColor = "#00008B";
                        } else if (cell.number === 5) {
                            textColor = "#8B0000";
                        } else if (cell.number === 6) {
                            textColor = "#00FFFF";
                        } else if (cell.number === 7) {
                            textColor = "black";
                        } else if (cell.number === 8) {
                            textColor = "grey";
                        }

                        // Draw the text
                        if (cell.number !== 0) {
                            ctx.fillStyle = textColor; // Set the fill color to the determined text color
                            ctx.font = "20px Arial"; // Set the font size and type
                            ctx.textAlign = "center"; // Set the text alignment to center
                            ctx.textBaseline = "middle"; // Set the text baseline to middle
                            if (cell.number === -1) {
                                ctx.fillText("B", x + cellSize / 2, y + cellSize / 2);
                            } else {
                                ctx.fillText(cell.number.toString(), x + cellSize / 2, y + cellSize / 2);
                            }
                        }
                    }
                } else {
                    // Draw the background
                    ctx.fillStyle = "#999999";
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
    };

    const drawBomb = (ctx, x, y, radius, offset) => {
        // Draw a black circle for bombs
        ctx.fillStyle = "black"; // Set the fill color to red
        ctx.beginPath();
        //ctx.arc(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2, cellSize / 2.5, 0, 2 * Math.PI);
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        ctx.lineWidth = 4;
        // Draw the vertical line
        ctx.beginPath();
        ctx.moveTo(x, y - radius - offset);
        ctx.lineTo(x, y + radius + offset);
        ctx.stroke();
        ctx.closePath();

        // Draw the horizontal line
        ctx.beginPath();
        ctx.moveTo(x - radius - offset, y);
        ctx.lineTo(x + radius + offset, y);
        ctx.stroke();
        ctx.closePath();

        // Draw diagonal lines
        ctx.beginPath();
        ctx.moveTo(x - radius / 1.5 - offset, y - radius / 1.5 - offset);
        ctx.lineTo(x + radius / 1.5 + offset, y + radius / 1.5 + offset);
        ctx.stroke();
        ctx.closePath();

        //Draw diagonal lines
        ctx.beginPath();
        ctx.moveTo(x + radius / 1.5 + offset, y - radius / 1.5 - offset);
        ctx.lineTo(x - radius / 1.5 - offset, y + radius / 1.5 + offset);
        ctx.stroke();
        ctx.closePath();

        ctx.lineWidth = 1;

        // Draw a grey gradient circle for bombs
        const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius/2, y + radius/2);
        gradient.addColorStop(0, "grey"); // Starting color at the top left
        gradient.addColorStop(1, "black"); // Ending color at the middle bottom right
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius - 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        // Draw a black little circle
        ctx.fillStyle = "black"; // Set the fill color to red
        ctx.beginPath();
        //ctx.arc(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2, cellSize / 2.5, 0, 2 * Math.PI);
        ctx.arc(x, y, radius / 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

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
                console.log(responseJson.message);
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
                console.log('Room created N°', responseJson.roomId);
                drawGrid();
                // Create the 'roomId' cookie
            })
            .catch(error => {
                console.error('Error creating room:', error);
            })

        window.location.reload();
    }

    useEffect(() => {
        // This code will run after setCellsMatrix has completed and the component has re-rendered
        //console.log('Cells matrix updated:', cellsMatrix);
        redrawGrid(cellsMatrix);
    }, [cellsMatrix]);

    useEffect(() => {
        const cookies = getCookies();

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
                    console.log('Room joined N°', responseJson.roomId/*, 'in ', responseJson.room.matrix*/);
                    let res = [];
                    for (let x = 0; x < row; x++) {
                        for (let y = 0; y < col; y++) {
                            //console.log(responseJson.room.matrix[x][y])
                            if (responseJson.room.matrix[x][y].number !== -1) {
                                res.push({row: x, col: y, number: responseJson.room.matrix[x][y].number})
                            }
                            //console.log(res)
                        }
                    }
                    // Flatten the array of arrays
                    const flattenedRes = res.flat();

                    setCellsMatrix((prevData) => [...prevData, ...flattenedRes]);
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
                    console.log('Room created N°', responseJson.roomId);
                    drawGrid();
                    // Create the 'roomId' cookie
                })
                .catch(error => {
                    console.error('Error creating room:', error);
                })
        }
        // Connect to the WebSocket server
        socketRef.current = io('http://127.0.0.1:8000');

        // Listen for events
        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
            const bombsCanvas = document.getElementById('bombsCounter');
            const bombs = document.getElementById('bombs');
            // Add event listener to the canvas
            addClickListeners()
            drawBomb(bombsCanvas.getContext('2d'), 20, 20, 10, 4);
            bombs.innerHTML = (row * col * DIFFICULTY_NORMAL).toString();
        });

        socketRef.current.on('left-click', (data) => {
            console.log('Received left-click event:', data);

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
                    console.log("Reveal Neighbors activated")
                    if (data.isBomb) {
                        console.log("Bomb found")
                    } else {
                        console.log("No bomb found:", data.revealedCells)
                        setCellsMatrix((prevData) => [...prevData, ...data.revealedCells]);
                    }
                } else {
                    setCellsMatrix((prevData) => [...prevData, ...data]);
                }
            }

            //Activate useEffect
        })

        socketRef.current.on('right-click', (data) => {
            console.log('Received right-click event:', data);

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
                //console.log("Data", data, data[0], data[0].row)

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
            const bombs = document.getElementById('bombs');
            bombs.innerHTML = (bombs.innerHTML - 1).toString();
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