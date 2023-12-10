import { Link } from "react-router-dom";
import styles from "/public/css/menu.module.css";

const Menu = ({ isLogged }) => {

    // Put back isDataLoading and role is needed

    return (
        <nav className={styles.horizontalNav}>
            <ul>
                {isLogged ? (
                    <>
                        <li><a href="/logout">Log Out</a></li>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/test">Test</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Log In</Link></li>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/test">Test</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Menu;
