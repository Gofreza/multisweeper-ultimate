import SideMenu from "../menu/sideMenu";
import {useLocation} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {getCookies} from "../../miscFunctions/gameClientFunctions";
import io from "socket.io-client";

const Multi = ({isAuthenticated, isAdmin}) => {
    const location = useLocation();
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const { roomName, ranked } = location.state || {};
    const [players, setPlayers] = useState(location.state.players || []);
    const socketRef = useRef(null);
    console.log(roomName, ranked, players)

    useEffect(() => {
        const cookies = getCookies();
        setIsDataLoaded(false);

        // ================ SOCKET.IO ================
        //             Socket.io events
        // ================ SOCKET.IO ================

        // Connect to the WebSocket server
        socketRef.current = io('http://127.0.0.1:8000');

        socketRef.current.on('receive-user-data', (data) => {
            const players = data.players;
            console.log("Receive user data");
            setPlayers(players);
        })

        // ================ CONNECTION ================
        //              Connection events
        // ================ CONNECTION ================

        if (cookies['multiRoomId']) {
            console.log("Already in a multi room/Join multi room");
            // Propagate the new data to every player in the room
            socketRef.current.emit('join-room', {roomName:roomName})
            console.log("Send join-room event")
            socketRef.current.emit('propagate-user-data', {players: players, roomName: roomName})
            console.log("Send propagate-user-data event")

            setIsDataLoaded(true);
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
                    console.log(data);
                    setPlayers(data.players);
                    socketRef.current.emit('create-room', {roomName:roomName})
                    console.log("Send create-room event")
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
                    console.log("Leave multi room:", data);
                    document.cookie = "multiRoomId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                });
        }
    }, []);

    if (isDataLoaded) {
        return (
            <>
                <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>
                <section className="home">
                    <div className="text">
                        Multi : {roomName}
                    </div>
                    <div>
                        <p>
                            Players: {players.map((player, index) => {
                                return <span key={index}>{player} </span>
                            })}
                        </p>
                    </div>
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