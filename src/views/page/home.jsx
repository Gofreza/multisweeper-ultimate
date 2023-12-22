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

    const handleJoinButtonClick = (event) => {
        event.preventDefault();
        const roomId = event.target.value;
        fetch('/api/join-multi-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomId: roomId
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Join multi room:", data);
                //document.cookie = "multiRoomId=" + roomId + "; path=/;";
                navigate('/game/multi', { state: { roomName: data.roomName, ranked: data.ranked, players: data.players } });
            });

    }

    useEffect(() => {
        const soloFormButton = document.getElementById('soloFormButton');
        soloFormButton.addEventListener('click', handleSoloFormButtonClick);

        const createMultiRoom = document.getElementById('createMultiRoom');
        const getRooms = document.getElementById('getRooms');
        if (isAuthenticated) {
            createMultiRoom.addEventListener('click', handleCreateMultiRoomButtonClick);

            getRooms.addEventListener('click', () => {
                fetch('/api/get-multi-rooms')
                    .then(response => response.json())
                    .then(data => {
                        const tbody = document.querySelector('tbody');
                        tbody.innerHTML = '';
                        console.log("GET Multi Room:",data.allRooms);

                        // Use Object.values() to convert the object values to an array
                        Object.values(data.allRooms).forEach(room => {
                            const roomId = room.id;
                            const tr = document.createElement('tr');
                            const tdName = document.createElement('td');
                            tdName.innerText = room.name;
                            const tdUsers = document.createElement('td');
                            tdUsers.innerText = room.numPlayers; // Adjust the property name if needed
                            const tdPlayers = document.createElement('td');
                            tdPlayers.innerText = room.players;
                            const tdPlaying = document.createElement('td');
                            tdPlaying.innerText = room.started;
                            const tdRanked = document.createElement('td');
                            tdRanked.innerText = room.ranked;
                            const tdJoin = document.createElement('td');
                            const joinButton = document.createElement('button');
                            joinButton.innerText = 'Join';
                            joinButton.value = roomId;
                            joinButton.addEventListener('click', handleJoinButtonClick);
                            tr.appendChild(tdName);
                            tr.appendChild(tdUsers);
                            tr.appendChild(tdPlayers);
                            tr.appendChild(tdPlaying);
                            tr.appendChild(tdRanked);
                            tr.appendChild(tdJoin);
                            tdJoin.appendChild(joinButton);
                            tbody.appendChild(tr);
                        });
                    });
            });

        }

        return () => {
            soloFormButton.removeEventListener('click', handleSoloFormButtonClick);
            if (isAuthenticated)
                createMultiRoom.removeEventListener('click', handleCreateMultiRoomButtonClick);
        };
    }, [row, col, roomName]); // Add row and col as dependencies

    const handleSoloFormButtonClick = (event) => {
        event.preventDefault();
        navigate('/game/solo', { state: { row: row, col: col } });
    };

    const handleCreateMultiRoomButtonClick = (event) =>  {
        event.preventDefault();
        if (roomName !== "") {
            navigate('/game/multi', {
                state: {
                    roomName: roomName,
                    ranked: document.getElementById('rankedCheckBox').checked
                }
            });
        } else {
            const createRoomErrorMessage = document.getElementById("roomNameError")
            createRoomErrorMessage.innerText = "RoomName can't be empty !"
            //alert("RoomName can't be empty !");
        }
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
                                    <label className={styles.error} id="roomNameError"></label>
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
                        <button id="getRooms">Get Rooms</button>
                        <table>
                            <thead>
                            <tr>
                                <th>Room Name</th>
                                <th>Users</th>
                                <th>Players Number</th>
                                <th>Playing</th>
                                <th>Ranked</th>
                                <th>Join</th>
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