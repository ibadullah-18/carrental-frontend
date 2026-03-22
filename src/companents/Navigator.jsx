import { Route, Routes } from "react-router-dom";
import Homepage from "../pages/Homepage";
import Loginpage from "../pages/Loginpage";

const Navigator = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Loginpage />} />
    </Routes>
  )
}

export default Navigator