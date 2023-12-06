import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
const Menu = ({ isLogged }) => {
    const [role, setRole] = useState("none");

    // Put back isDataLoading is needed

    return (
        <nav className="horizontal-nav">
            <ul>
                {isLogged ? (
                    <>
                        <li><a href="/logout">Log Out</a></li>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to={"/citations"}>Citations</Link></li>
                        <li><Link to={"/favorite"}>Favorite</Link></li>
                        <li><Link to={"/add"}>Ajouter</Link></li>
                        {role === "admin" &&
                            <li><Link to={"/admin"}>Admin</Link></li>
                        }
                    </>
                ) : (
                    <>
                        <li><a href="/discord">Log In</a></li>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to={"/citations"}>Citations</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Menu;
