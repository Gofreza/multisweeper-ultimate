import * as React from "react";
import { createRoot } from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import Home from "../page/home";
import withAuthentication from "../auth/withAuthentification";
const HomeAuth = withAuthentication(Home);

// Define an async function and call it immediately
const init = async () => {
    try {
        const router = createBrowserRouter([
            {
                path: "/",
                element: <HomeAuth/>,
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