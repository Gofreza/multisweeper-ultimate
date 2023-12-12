import SideMenu from "../menu/sideMenu";

const Multi = ({isAuthenticated, isAdmin}) => {
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