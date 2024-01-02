import React from "react";
import "/public/css/chessboard-1.0.0.min.css";
import SideMenu from "../menu/sideMenu";

const Chess = ({ isAuthenticated, isAdmin }) => {
    const handleStartButtonClick = () => {
        window.location.reload(); // Refresh the page
    };

    return (
        <>
            <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
            <section className="home">
                <div className="text">
                    Chess
                </div>
                <div className="container">
                    <button onClick={handleStartButtonClick}>Start</button>
                    <div className="selectContainer">
                        <label htmlFor="search-depth">Search Depth (Black):</label>
                        <select id="search-depth" defaultValue="2">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                    <div id="myBoard" style={{ width: '400px' }}></div>
                    <div className="statusContainer">
                        <label>Status:</label>
                        <div id="status"></div>
                        <label>FEN:</label>
                        <div id="fen"></div>
                        <label>PGN:</label>
                        <div id="pgn"></div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Chess;
