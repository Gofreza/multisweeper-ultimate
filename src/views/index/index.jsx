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
import Leaderboard from "../page/leaderboard";
import Solo from "../game/solo";
import Multi from "../game/multi";
import Register from "../auth/register";
import Chess from "../game/chessLazy";

const HomeAuth = withAuthentication(Home);
const ProfileAuth = withAuthentication(Profile);
const LoginNotAuth = withNotAuthentication(LoginComponent);
const RegisterNotAuth = withNotAuthentication(Register);
const ChangePasswordAuth = withAuthentication(ChangePassword);
const LeaderboardAuth = withAuthentication(Leaderboard);
const SoloAuth = withAuthentication(Solo);
const MultiAuth = withAuthentication(Multi);
const ChessNotAuth = withNotAuthentication(Chess);

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
                path: "/register",
                element: <RegisterNotAuth/>,
            },
            {
                path: "/profile",
                element: <ProfileAuth/>,
            },
            {
                path: "/leaderboard",
                element: <LeaderboardAuth/>,
            },
            {
                path: "/change-password",
                element: <ChangePasswordAuth/>,
            },
            {
                path: "/game/solo",
                element: <SoloAuth/>,
            },
            {
                path: "/game/multi",
                element: <MultiAuth/>,
            },
            {
                path: "/chess",
                element: <ChessNotAuth/>,
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