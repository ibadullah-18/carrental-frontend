import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Homepage from "../pages/Homepage";
import Loginpage from "../pages/Loginpage";
import Rentalpage from "../pages/Rentalpage";
import Detailspage from "../pages/Detalispage";
import Registerpage from "../pages/Registerpage";
import Favoritepage from "../pages/Favoritepage";

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
    </Routes>
  );
};

export default Navigator;