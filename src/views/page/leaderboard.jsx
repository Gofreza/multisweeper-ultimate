import SideMenu from "../menu/sideMenu";
import styles from "/public/css/leaderboard.module.css"
import {useEffect, useState} from "react";

const Leaderboard = ({isAuthenticated, isAdmin}) => {
    const [leaderboard, setLeaderboard] = useState([])

    useEffect(() => {
        document.title = "MultiSweeper - Leaderboard";
        const getLeaderboard = async () => {
            try {
                const response = await fetch('/api/get-leaderboard');
                const responseJson = await response.json();

                if (response.ok) {
                    console.log('Leaderboard:', responseJson.leaderboard);
                    setLeaderboard(responseJson.leaderboard);
                } else {
                    // Check for specific error cases
                    if (responseJson.errorCode === 'UNAUTHORIZED') {
                        // Handle unauthorized error, redirect to login, show a message, etc.
                        console.log('Unauthorized access to leaderboard');
                    } else {
                        // Handle other errors
                        console.log('Error getting leaderboard:', responseJson);
                    }
                }
            } catch (error) {
                console.error('Error getting leaderboard:', error);
            }
        }

        getLeaderboard();
    }, [])

    return (
        <>
            <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>
            <section className="home">
                <div className="text">
                    Leaderboard
                </div>
                <div className={styles.leaderboardPage}>
                    <div className={styles.leaderboardContainer}>
                        <div className={styles.leaderboardHeader}>
                            <h1>Leaderboard</h1>
                            <p>The leaderboard shows the top 10 players sorted by their score.</p>
                        </div>
                        <div className={styles.leaderboardBody}>
                            <ul>
                                {leaderboard.map((user, index) => (
                                    <li key={index}>
                                        <div className={styles.leaderboardRank}>
                                            <span>N°{user.position}</span>
                                        </div>
                                        <div className={styles.leaderboardInfo}>
                                            <div className={styles.leaderboardName}>
                                                <span>{user.username}</span>
                                            </div>
                                        </div>
                                        <div className={styles.leaderboardScore}>
                                            <span>{user.score} MN</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Leaderboard;