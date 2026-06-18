import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Homepage from "../pages/Homepage";
import Loginpage from "../pages/Loginpage";
import Detailspage from "../pages/Detalispage";
import Registerpage from "../pages/Registerpage";
import AddCarpage from "../pages/AddCarpage";
import Profilepage from "../pages/Profilepage";
import Mycarspage from "../pages/Maycarspage";
import UpdateCarpage from "../pages/UpdateCarpage";
import Searchpage from "../pages/Searchpage";
import PageTransition from "../companents/PageTransition";
import ForgotPasswordpage from "../pages/ForgotPasswordpage";
import OwnerProfilepage from "../pages/OwnerProfilepage";
import SearchPlatepage from "../pages/SearchPlatepage";
import PaymentSuccesspage from "../pages/PaymentSuccesspage";
import PaymentFailedpage from "../pages/PaymentFailedpage";

const Navigator = () => {
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Routes location={location} key={pathname}>
      <Route
        path="/"
        element={
          <PageTransition direction="left">
            <Homepage />
          </PageTransition>
        }
      />

      <Route
        path="/login"
        element={
          <PageTransition direction="bottom">
            <Loginpage />
          </PageTransition>
        }
      />

      <Route
        path="/details/:id"
        element={
          <PageTransition direction="right">
            <Detailspage />
          </PageTransition>
        }
      />

      <Route
        path="/register"
        element={
          <PageTransition direction="bottom">
            <Registerpage />
          </PageTransition>
        }
      />

      <Route
        path="/add-car"
        element={
          <PageTransition direction="top">
            <AddCarpage />
          </PageTransition>
        }
      />

      <Route
        path="/profile"
        element={
          <PageTransition direction="top">
            <Profilepage />
          </PageTransition>
        }
      />

      <Route
        path="/my-cars"
        element={
          <PageTransition direction="left">
            <Mycarspage />
          </PageTransition>
        }
      />

      <Route
        path="/update-car/:id"
        element={
          <PageTransition direction="right">
            <UpdateCarpage />
          </PageTransition>
        }
      />

      <Route
        path="/search"
        element={
          <PageTransition direction="top">
            <Searchpage />
          </PageTransition>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PageTransition direction="bottom">
            <ForgotPasswordpage />
          </PageTransition>
        }
      />

      <Route
        path="/owner-profile/:userId"
        element={
          <PageTransition direction="bottom">
            <OwnerProfilepage />
          </PageTransition>
        }
      />

      <Route
        path="/search-plate"
        element={
          <PageTransition direction="bottom">
            <SearchPlatepage />
          </PageTransition>
        }
      />

      <Route
        path="/payment-success"
        element={
          <PageTransition direction="bottom">
            <PaymentSuccesspage />
          </PageTransition>
        }
      />

      <Route
        path="/payment-failed"
        element={
          <PageTransition direction="bottom">
            <PaymentFailedpage />
          </PageTransition>
        }
      />
    </Routes>
  );
};

export default Navigator;