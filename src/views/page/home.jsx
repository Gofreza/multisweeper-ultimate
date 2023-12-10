import SideMenu from "../menu/sideMenu";
import styles from "/public/css/home.module.css"

const Home = ({isAuthenticated, isAdmin}) => {
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
                        <form action="/createGrid" method="POST">
                            <label htmlFor="rows">Rows:</label>
                            <input type="number" id="rows" name="rows" min="5" max="100" value="10" required />
                            <label htmlFor="cols">Cols:</label>
                            <input type="number" id="cols" name="cols" min="5" max="100" value="10" required />
                            <button type="submit">Play</button>
                        </form>
                    </div>
                    {isAuthenticated && (
                        <div className={styles.multiContainer}>
                            <h1>Multiplayer</h1>
                            <form id="createRoom" action="">
                                <div className={styles.formElement}>
                                    <label htmlFor="inputCreateRoom">Room Name</label>
                                    <input type="text" id="inputCreateRoom" autoComplete="off" />
                                </div>
                                <div className={styles.formElement}>
                                    <label htmlFor="inputNameCreateRoom">Name</label>
                                    <input id="inputNameCreateRoom" autoComplete="off"/>
                                </div>
                                <div className={styles.formElementCheckBox}>
                                    <label htmlFor="rankedCheckBox">Ranked</label>
                                    <input id="rankedCheckBox" type="checkbox"/>
                                </div>
                                <button>Create Room</button>
                            </form>
                        </div>
                    )}
            </div>
            {isAuthenticated && (
                <div className={styles.roomsContainer}>
                    <div className={styles.roomsList}>
                        <button onClick="getRooms()">Get Rooms</button>
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