import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Homepage from "../pages/Homepage";
import Loginpage from "../pages/Loginpage";
import Rentalpage from "../pages/Rentalpage";
import Detailspage from "../pages/Detalispage";
import Registerpage from "../pages/Registerpage";
import Favoritepage from "../pages/Favoritepage";
import Basketpage from "../pages/Basketpage";
import AddCarpage from "../pages/AddCarpage";
import Profilepage from "../pages/Profilepage";
import Mycarspage from "../pages/Maycarspage";
import UpdateCarpage from "../pages/UpdateCarpage";
import OwnerCarpage from "../pages/OwnerCarpage";

const Navigator = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Loginpage />} />
      <Route path="/rentals/:id" element={<Rentalpage />} />
      <Route path="/details/:id" element={<Detailspage />} />
      <Route path="/register" element={<Registerpage />} />
      <Route path="/favorite" element={<Favoritepage />} />
      <Route path="/basket" element={<Basketpage />} />
      <Route path="/add-car" element={<AddCarpage />} />
      <Route path="/profile" element={<Profilepage />} />
      <Route path="/my-cars" element={<Mycarspage />} />
      <Route path="/update-car/:id" element={<UpdateCarpage />} />
      <Route path="/owner-cars/:ownerId" element={<OwnerCarpage />} />
    </Routes>
  );
};

export default Navigator;