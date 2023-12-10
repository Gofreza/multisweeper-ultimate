import {useEffect} from "react";
import PropTypes from 'prop-types';
import "/public/css/sidebar.css"
import {Link} from "react-router-dom";

const sideMenu = ({isAuthenticated, isAdmin}) => {

    useEffect(() => {
        const body = document.querySelector("body"),
            sidebar = body.querySelector(".sidebar"),
            toggle = body.querySelector(".toggle"),
            searchBtn = body.querySelector(".search-box"),
            modeSwitch = body.querySelector(".mode"),
            modeText = body.querySelector(".mode-text");

        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("close");
        })

        searchBtn.addEventListener("click", () => {
            sidebar.classList.remove("close");
        })

        modeSwitch.addEventListener("click", () => {
            body.classList.toggle("dark");

            if (body.classList.contains("dark")) {
                modeText.textContent = "Light Mode";
            } else {
                modeText.textContent = "Dark Mode";
            }
        })

    } ,[]);

    return (
        <>
            <nav className="sidebar close">
                <header>
                    <div className="image-text">
                        <span className="image">
                            <img src="/assets/golden-logo-template-free-png.webp" alt="logo"/>
                        </span>

                        <div className="text header-text">
                            <span className="name">Multisweeper</span>
                            <span className="profession">The game</span>
                        </div>
                    </div>

                    <i className='bx bx-chevron-right toggle'></i>
                </header>

                <div className="menu-bar">
                    <div className="menu">
                        <li className="search-box">
                            <i className='bx bx-search icon'></i>
                            <input type="search" placeholder="Search here ..."/>
                        </li>
                        <ul className="menu-links">
                            <li className="nav-links">
                                <Link to="/">
                                    <i className='bx bx-home-alt icon'></i>
                                    <span className="text nav-text">Home</span>
                                </Link>
                            </li>
                            {isAuthenticated ? (
                                <li className="nav-links">
                                    <Link to="/profile">
                                        <i className='bx bx-user-circle icon'></i>
                                        <span className="text nav-text">Profile</span>
                                    </Link>
                                </li>
                            ) : (
                                <></>
                            )}
                            <li className="nav-links">
                                <a href="#">
                                    <i className='bx bx-bar-chart-alt-2 icon'></i>
                                    <span className="text nav-text">Leaderboard</span>
                                </a>
                            </li>
                            <li className="nav-links">
                                <a href="#">
                                    <i className='bx bxl-github icon'></i>
                                    <span className="text nav-text">GitHub</span>
                                </a>
                            </li>
                            {isAdmin ? (
                                <li className="nav-links">
                                    <a href="#">
                                        <i className='bx bx-check-shield icon'></i>
                                        <span className="text nav-text">Admin</span>
                                    </a>
                                </li>
                            ) : (
                                <></>
                            )}
                        </ul>
                    </div>

                    <div className="bottom-content">
                        {isAuthenticated ? (
                            <li className="">
                                <a href="/logout">
                                    <i className='bx bx-log-out icon'></i>
                                    <span className="text nav-text">Logout</span>
                                </a>
                            </li>
                        ) : (
                            <li className="nav-links">
                                <Link to="/login">
                                    <i className='bx bx-log-in icon'></i>
                                    <span className="text nav-text">Log In</span>
                                </Link>
                            </li>
                        )}

                        <li className="mode">
                            <div className="moon-sun">
                                <i className='bx bx-moon icon moon'></i>
                                <i className='bx bx-sun icon sun'></i>
                            </div>
                            <span className="text mode-text">Dark Mode</span>

                            <div className="toggle-switch">
                                <span className="switch"></span>
                            </div>
                        </li>
                    </div>
                </div>
            </nav>
        </>
    )
}

sideMenu.prototype = {
    isAuthenticated: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired
}

export default sideMenu;