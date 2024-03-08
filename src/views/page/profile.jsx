import SideMenu from "../menu/sideMenu";
import styles from "/public/css/profile.module.css"
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

const Profile = ({isAuthenticated, isAdmin}) => {
    const [stats, setStats] = useState([])
    const [username, setUsername] = useState('')
    const [showDeleteAccount, setShowDeleteAccount] = useState(false)
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        setUsername(event.target.value);
    }

    const handleDeleteAccount = () => {
        console.log('Delete account');
        fetch('/api/delete-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: username})
        })
            .then(response => response.json())
            .then(responseJson => {
                console.log('Account deleted:', responseJson.message);
                navigate('/');
            })
            .catch(error => {
                console.error('Error deleting account:', error);
            })
    }

    const handleToggleChangePassword = () => {
        navigate('/change-password');
    };

    const handleToggleDeleteAccount = () => {
        setShowDeleteAccount(!showDeleteAccount);
    }

    useEffect(() => {
        document.title = "MultiSweeper - Profile";
        const getStats = async () => {
            try {
                const response = await fetch('/api/get-stats');
                const responseJson = await response.json();

                if (response.ok) {
                    //console.log('Stats:', responseJson.stats);
                    setStats(responseJson.stats);
                } else {
                    // Check for specific error cases
                    if (responseJson.errorCode === 'UNAUTHORIZED') {
                        // Handle unauthorized error, redirect to login, show a message, etc.
                        console.log('Unauthorized access to stats');
                    } else {
                        // Handle other errors
                        console.log('Error getting stats:', responseJson);
                    }
                }
            } catch (error) {
                // Handle network or unexpected errors
                console.error('Error fetching stats:', error);
            }
        };
        getStats();

        try {
            const storedUsername = document.cookie
                .split('; ')
                .find(row => row.startsWith('username='))
                .split('=')[1];

            setUsername(storedUsername);
        } catch (error) {
            console.error('Error getting username:', error);
        }

        const changeUsernameIcon = document.getElementById('changeUsername');
        const usernameInput = document.getElementById('usernameInput');

        changeUsernameIcon.addEventListener('click', () => {
            usernameInput.disabled = !usernameInput.disabled;

            if (changeUsernameIcon.className === 'bx bx-pencil icon') {
                changeUsernameIcon.className = 'bx bx-check icon';
            } else {
                changeUsernameIcon.className = 'bx bx-pencil icon';
                //Change the username in the database
                fetch('/api/change-username', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({username: usernameInput.value})
                })
                    .then(response => response.json())
                    .then(responseJson => {
                        console.log('Username changed:', responseJson.message);
                    })
                    .catch(error => {
                        console.error('Error changing username:', error);
                    })
            }

            if (!usernameInput.disabled) {
                usernameInput.focus();
            }
        })

    }, [])

    return (
        <>
            <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>
            <section className="home">
                <div className="text">
                    Profile
                </div>
                <div className={styles.profilePage}>
                    <div className={styles.profileBanner}>
                        <div className={styles.profilePicture}>
                            <img src="/assets/golden-logo-template-free-png.webp" alt="alt"/>
                        </div>
                    </div>
                    <div className={styles.profileContainer}>
                        <div>
                            <p>Profile Information</p>
                            <div className={styles.profileData}>
                                <table>
                                    <tbody>
                                    <tr>
                                        <td>Username: </td>
                                        <td><input id="usernameInput" value={username} onChange={handleInputChange} disabled/></td>
                                        <td><i id="changeUsername" className='bx bx-pencil icon'></i></td>
                                    </tr>
                                    <tr>
                                        <td>Password: </td>
                                        <td><button onClick={handleToggleChangePassword}>Change password</button></td>
                                    </tr>
                                    <tr>
                                        <td>Account: </td>
                                        <td><button onClick={handleToggleDeleteAccount}>Delete account</button></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <p>Stats</p>
                            <div className={styles.profileStats}>
                                {stats.map((stat, index) => (
                                    <table key={index}>
                                        <tbody>
                                        <tr>
                                            <td>Game mode:</td>
                                            <td>{stat.gamemode === 'multi' ? 'Multiplayer' : 'Solo' }</td>
                                        </tr>
                                        <tr>
                                            <td>NumGamePlayed:</td>
                                            <td>{stat.numgamesplayed}</td>
                                        </tr>
                                        <tr>
                                            <td>NumGameWon:</td>
                                            <td>{stat.numgameswon}</td>
                                        </tr>
                                        <tr>
                                            <td>NumGameLost:</td>
                                            <td>{stat.numgameslost}</td>
                                        </tr>
                                        <tr>
                                            <td>NumBombsDefused:</td>
                                            <td>{stat.numbombsdefused}</td>
                                        </tr>
                                        <tr>
                                            <td>NumBombsExploded:</td>
                                            <td>{stat.numbombsexploded}</td>
                                        </tr>
                                        <tr>
                                            <td>NumFlagsPlaced:</td>
                                            <td>{stat.numflagsplaced}</td>
                                        </tr>
                                        <tr>
                                            <td>NumCellRevealed:</td>
                                            <td>{stat.numcellsrevealed}</td>
                                        </tr>
                                        <tr>
                                            <td>Average Time:</td>
                                            <td>{stat.averagetime}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                ))}
                            </div>
                        </div>
                        {showDeleteAccount && (
                            <div className={styles.overlay}>
                                <div className={styles.deleteAccount}>
                                    <p>Are you sure you want to delete your account?</p>
                                    <button onClick={handleDeleteAccount}>Yes</button>
                                    <button onClick={handleToggleDeleteAccount}>No</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Profile