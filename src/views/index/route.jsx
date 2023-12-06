// routes.js
import React from "react";
import Home from "../page/home";
import withAuthentication from "../auth/withAuthentification";

const routes = () => [
    {
        path: "/",
        element: withAuthentication(<Home/>) ,
    }
];

export default routes;
