import Menu from "../menu/menu";

const Home = ({isAuthenticated}) => {
  return (
    <>
        <Menu isLogged={isAuthenticated} />
        <h1>Home</h1>
    </>
  )
}

export default Home