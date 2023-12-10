import * as React from "react";
import styles from "/public/css/login.module.css";
import SideMenu from "../menu/sideMenu";
import {useNavigate} from "react-router-dom";

const ChangePassword = ({ isAuthenticated, isAdmin}) => {

    const navigate = useNavigate();

    const handleChangePassword = async (event) => {
        event.preventDefault();

        const currentPassword = event.target.currentPassword.value;
        const newPassword = event.target.newPassword.value;
        const confirmPassword = event.target.confirmPassword.value;

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });
            const responseJson = await response.json();

            if (response.ok) {
                //console.log('Password changed');
                alert('Password changed');
                navigate('/profile');
            } else {
                // Check for specific error cases
                if (responseJson.errorCode === 'UNAUTHORIZED') {
                    // Handle unauthorized error, redirect to login, show a message, etc.
                    console.log('Unauthorized access to change password');
                    navigate('/login');
                } else {
                    // Handle other errors
                    console.log('Error changing password:', responseJson);
                }
            }
        } catch (error) {
            // Handle network or unexpected errors
            console.error('Error changing password:', error);
        }
    }

    return (
        <>
            <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
            <section className="home">
                <div className="text">
                    Change Password
                </div>
                <div className={styles.loginForm}>
                    <h1>Change Password</h1>
                    <form onSubmit={handleChangePassword} method="POST">
                        <input type="password" name="currentPassword" placeholder="Current Password" autoFocus/>
                        <input type="password" name="newPassword" placeholder="Password" />
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" />
                        <input type="submit" value="Login" />
                    </form>
                </div>
            </section>
        </>
    );
};

export default ChangePassword;
