import { Route, Routes } from "react-router-dom";
import Homepage from "../pages/Homepage";
import Loginpage from "../pages/Loginpage";
import Rentalpage from "../pages/Rentalpage";
import Detailspage from "../pages/Detalispage";

const Navigator = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Loginpage />} />
      <Route path="/rentals/:id" element={<Rentalpage />} />
      <Route path="/details/:id" element={<Detailspage />} />
    </Routes>
  )
}

export default Navigator