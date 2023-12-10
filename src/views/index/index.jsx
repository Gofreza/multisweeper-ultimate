import * as React from "react";
import { createRoot } from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import Home from "../page/home";
import withAuthentication from "../auth/withAuthentication";
import withNotAuthentication from "../auth/withNotAuthentication";
import LoginComponent from "../auth/login";
import Profile from "../page/profile";
import ChangePassword from "../auth/changePassword";

const HomeAuth = withAuthentication(Home);
const ProfileAuth = withAuthentication(Profile);
const LoginNotAuth = withNotAuthentication(LoginComponent);
const ChangePasswordAuth = withAuthentication(ChangePassword);

// Define an async function and call it immediately
const init = async () => {
    try {
        const router = createBrowserRouter([
            {
                path: "/",
                element: <HomeAuth/>,
            },
            {
                path: "/login",
                element: <LoginNotAuth/>,
            },
            {
                path: "/profile",
                element: <ProfileAuth/>,
            },
            {
                path: "/change-password",
                element: <ChangePasswordAuth/>,
            }
        ]);

        createRoot(document.getElementById("root")).render(
            <RouterProvider router={router} />
        );
    } catch (error) {
        console.error('Error initializing the app:', error);
        // Handle initialization error
    }
};

init()
    .then(() => console.log('App initialized'))
    .catch((error) => console.error('Error initializing app:', error));