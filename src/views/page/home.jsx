import SideMenu from "../menu/sideMenu";
import styles from "/public/css/home.module.css"
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const Home = ({isAuthenticated, isAdmin}) => {
    const [row, setRow] = useState(10);
    const [col, setCol] = useState(10);

    const [roomName, setRoomName] = useState('');

    const navigate = useNavigate();

    const handleRowInput = (event) => {
        setRow(event.target.value);
    }

    const handleColInput = (event) => {
        setCol(event.target.value);
    }

    const handleRoomNameInput = (event) => {
        setRoomName(event.target.value);
    }

    useEffect(() => {
        const soloFormButton = document.getElementById('soloFormButton');
        soloFormButton.addEventListener('click', handleSoloFormButtonClick);

        const createMultiRoom = document.getElementById('createMultiRoom');
        createMultiRoom.addEventListener('click', handleCreateMultiRoomButtonClick);

        return () => {
            soloFormButton.removeEventListener('click', handleSoloFormButtonClick);
            createMultiRoom.removeEventListener('click', handleCreateMultiRoomButtonClick);
        };
    }, [row, col, roomName]); // Add row and col as dependencies

    const handleSoloFormButtonClick = (event) => {
        event.preventDefault();
        navigate('/game/solo', { state: { row: row, col: col } });
    };

    const handleCreateMultiRoomButtonClick = (event) =>  {
        event.preventDefault();
        navigate('/game/multi', { state: { roomName: roomName, ranked: document.getElementById('rankedCheckBox').checked } });
    }

  return (
    <>
        <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>
        <section className="home">
            <div className="text">
                Home
            </div>
            <div className={styles.homeContainer}>
                    <div className={styles.soloContainer}>
                        <h1>Solo</h1>
                        <form>
                            <label htmlFor="rows">Rows:</label>
                            <input type="number" id="rows" name="rows" min="5" max="100" value={row} onChange={handleRowInput} required />
                            <label htmlFor="cols">Cols:</label>
                            <input type="number" id="cols" name="cols" min="5" max="100" value={col} onChange={handleColInput} required />
                            <button id="soloFormButton">Play</button>
                        </form>
                    </div>
                    {isAuthenticated && (
                        <div className={styles.multiContainer}>
                            <h1>Multiplayer</h1>
                            <form>
                                <div className={styles.formElement}>
                                    <label htmlFor="inputCreateRoom">Room Name</label>
                                    <input type="text" id="inputCreateRoom" name="inputCreateRoom" autoComplete="off" value={roomName} onChange={handleRoomNameInput} required/>
                                </div>
                                <div className={styles.formElementCheckBox}>
                                    <label htmlFor="rankedCheckBox">Ranked</label>
                                    <input id="rankedCheckBox" type="checkbox"/>
                                </div>
                                <button id="createMultiRoom">Create Room</button>
                            </form>
                        </div>
                    )}
            </div>
            {isAuthenticated && (
                <div className={styles.roomsContainer}>
                    <div className={styles.roomsList}>
                        <button>Get Rooms</button>
                        <table>
                            <thead>
                            <tr>
                                <th>Room Name</th>
                                <th>Users</th>
                                <th>Players Number</th>
                                <th>Playing</th>
                                <th>Ranked</th>
                            </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </section>
    </>
  )
}

export default Home