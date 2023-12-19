import SideMenu from "../menu/sideMenu";
import {useLocation} from "react-router-dom";

const Multi = ({isAuthenticated, isAdmin}) => {
    const location = useLocation();
    const { roomName, ranked } = location.state || {};
    console.log(roomName, ranked)



    return (
        <>
            <SideMenu isAuthenticated={isAuthenticated} isAdmin={isAdmin}/>
            <section className="home">
                <div className="text">
                    Multi
                </div>
            </section>
        </>
    )
}

export default Multi;