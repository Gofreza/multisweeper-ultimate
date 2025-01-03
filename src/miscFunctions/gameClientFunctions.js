import {element} from "prop-types";

const getCookies = () => {

    if (!document.cookie) {
        return {};
    }

    const cookies = {};
    document.cookie.split(';').forEach(function(cookie) {
        const parts = cookie.match(/(.*?)=(.*)$/)
        cookies[ parts[1].trim() ] = (parts[2] || '').trim();
    });
    return cookies;
}

const getGridCoordinates = (clientX, clientY, cellSize) => {
    const canvas = document.getElementById('grid');
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Convert clicked coordinates to grid coordinates
    const row = Math.floor(y / (cellSize));
    const col = Math.floor(x / (cellSize));

    return { row, col };
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
};

const drawGrid = (row, col, cellSize) => {
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
const redrawGrid = (cellsMatrix, row, col, cellSize) => {
    const canvas = document.getElementById('grid');
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = "#000000"; // Set stroke color to black
    ctx.lineWidth = 1;

    ctx.clearRect(0, 0, col * cellSize, row * cellSize);

    for (let r = 0; r < row; r++) {
        for (let c = 0; c < col; c++) {
            const x = c * cellSize;
            const y = r * cellSize;

            ctx.clearRect(x, y, cellSize, cellSize);
            ctx.strokeRect(x, y, cellSize, cellSize);

            const cell = cellsMatrix.find(item => item.row === r && item.col === c);
            if (cell) {
                if (cell.flagged) {
                    // Set the background color
                    ctx.fillStyle = "#999999";
                    ctx.fillRect(x, y, cellSize, cellSize);

                    // Set flag dimensions and position
                    const flagWidth = cellSize / 2;
                    const flagHeight = cellSize / 2;
                    const flagX = x + cellSize / 4;
                    const flagY = y + cellSize / 4;

                    const xF = flagX + flagWidth / 2;
                    const yF = flagY + flagHeight / 2;
                    const radius = flagWidth / 2;
                    const offset = flagWidth / 4;

                    // Draw a flag
                    ctx.fillStyle = "#ff0000"; // Set the fill color to red
                    // Draw the flag shape
                    ctx.moveTo(xF - 2, yF + radius);
                    ctx.lineTo(xF - 3.5, yF - 1);
                    ctx.stroke();
                    ctx.moveTo(xF - 3, yF - 1);
                    ctx.lineTo(xF - radius / 2, yF - radius - offset);
                    ctx.stroke();
                    ctx.lineTo(xF + radius + offset, yF - radius / 2 - offset);
                    ctx.stroke();
                    ctx.lineTo(xF - 3, yF - 1);
                    ctx.stroke();

                    // Draw additional lines
                    ctx.moveTo(xF - 8, yF + radius);
                    ctx.lineTo(xF + 4, yF + radius);
                    ctx.stroke();

                    ctx.closePath();
                    ctx.fill();

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
                            //ctx.fillText("B", x + cellSize / 2, y + cellSize / 2);
                            drawBomb(ctx, x + cellSize / 2, y + cellSize / 2, 10, 4)
                        } else {
                            ctx.fillText(cell.number.toString(), x + cellSize / 2, y + cellSize / 2);
                        }
                    }
                }
            } else {
                // console.log("No Cell")
                // Draw the background
                ctx.fillStyle = "#999999";
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }
};

const redrawGridBis = (data, cellSize) => {
    const canvas = document.getElementById('grid');
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = "#000000"; // Set stroke color to black
    ctx.lineWidth = 1;

    data.forEach((element) => {
        const x = element.col * cellSize;
        const y = element.row * cellSize;

        if ('flagged' in element) {
            if (element.flagged) {
                // Set the background color
                ctx.fillStyle = "#999999";
                ctx.fillRect(x, y, cellSize, cellSize);

                // Set flag dimensions and position
                const flagWidth = cellSize / 2;
                const flagHeight = cellSize / 2;
                const flagX = x + cellSize / 4;
                const flagY = y + cellSize / 4;

                const xF = flagX + flagWidth / 2;
                const yF = flagY + flagHeight / 2;
                const radius = flagWidth / 2;
                const offset = flagWidth / 4;

                // Draw a flag
                ctx.fillStyle = "#ff0000"; // Set the fill color to red
                // Draw the flag shape
                /*ctx.moveTo(xF - 2, yF + radius);
                ctx.lineTo(xF - 3.5, yF - 1);
                ctx.stroke();
                ctx.moveTo(xF - 3, yF - 1);
                ctx.lineTo(xF - radius / 2, yF - radius - offset);
                ctx.stroke();
                ctx.lineTo(xF + radius + offset, yF - radius / 2 - offset);
                ctx.stroke();
                ctx.lineTo(xF - 3, yF - 1);
                ctx.stroke();

                // Draw additional lines
                ctx.moveTo(xF - 8, yF + radius);
                ctx.lineTo(xF + 4, yF + radius);
                ctx.stroke();

                ctx.closePath();
                ctx.fill();*/

                ctx.fillRect(element.col * cellSize + cellSize / 4, element.row * cellSize + cellSize / 4, cellSize / 2, cellSize / 2); // Draw a flag
            }
            else {
                // console.log("No Cell")
                // Draw the background
                ctx.fillStyle = "#999999";
                ctx.fillRect(x, y, cellSize, cellSize);
            }
        }
        else {
            // Draw the background
            ctx.fillStyle = "#f9f8f5";
            ctx.fillRect(x, y, cellSize, cellSize);

            // Determine the text color
            let textColor = "#000000"; // Set the default text color to black
            if (element.number === 1) {
                textColor = "blue"; // Change the text color to blue if the number is 1
            } else if (element.number === 2) {
                textColor = "green"; // Change the text color to green if the number is 2
            } else if (element.number === 3) {
                textColor = "red"; // Change the text color to red if the number is 3
            } else if (element.number === 4) {
                textColor = "#00008B";
            } else if (element.number === 5) {
                textColor = "#8B0000";
            } else if (element.number === 6) {
                textColor = "#00FFFF";
            } else if (element.number === 7) {
                textColor = "black";
            } else if (element.number === 8) {
                textColor = "grey";
            }

            // Draw the text
            if (element.number !== 0) {
                ctx.fillStyle = textColor; // Set the fill color to the determined text color
                ctx.font = "20px Arial"; // Set the font size and type
                ctx.textAlign = "center"; // Set the text alignment to center
                ctx.textBaseline = "middle"; // Set the text baseline to middle
                if (element.number === -1) {
                    //ctx.fillText("B", x + cellSize / 2, y + cellSize / 2);
                    drawBomb(ctx, x + cellSize / 2, y + cellSize / 2, 10, 4)
                } else {
                    ctx.fillText(element.number.toString(), x + cellSize / 2, y + cellSize / 2);
                }
            }
        }

        // Draw the borders
        ctx.strokeRect(x, y, cellSize, cellSize);
    })
};

export { getCookies, getGridCoordinates, drawBomb, drawGrid, redrawGrid, redrawGridBis};