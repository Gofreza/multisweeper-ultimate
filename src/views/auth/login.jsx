import * as React from "react";
import { useNavigate } from "react-router-dom";
import styles from "/public/css/login.module.css";
import SideMenu from "../menu/sideMenu";

const Login = ({ isAuthenticated }) => {
    const navigate = useNavigate();

    // Redirect if isAuthenticated is true
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    return (
        <>
            <SideMenu isAuthenticated={isAuthenticated} />
            <section className="home">
                <div className="text">
                    Login
                </div>
                <div className={styles.loginForm}>
                    <h1>Login</h1>
                    <form action="/login" method="POST">
                        <input type="text" name="username" placeholder="Username" autoFocus/>
                        <input type="password" name="password" placeholder="Password" />
                        <input type="submit" value="Login" />
                    </form>
                </div>
            </section>

        </>
    );
};

export default Login;
