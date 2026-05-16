import { useEffect } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import Navigator from "./companents/Navigator"
import Navbar from "./companents/Navbar"
import { useDarkmode } from "./stores/useDarkmode"
import MyAdminCar from "./MyAdminCar"
import MySuperAdminCar from "./pages/MySuperAdminCar"

const App = () => {
  const { isDarkmodeEnabled } = useDarkmode()
  const location = useLocation()

  const isAdminRoute =
  location.pathname.startsWith("/MyAdminCar") ||
  location.pathname.startsWith("/MySuperAdminCar")

  useEffect(() => {
    const bg = isAdminRoute ? "#f3f4f6" : isDarkmodeEnabled ? "#111111" : "#f8f8f8"

    document.documentElement.style.backgroundColor = bg
    document.body.style.backgroundColor = bg
    document.getElementById("root").style.backgroundColor = bg
  }, [isDarkmodeEnabled, isAdminRoute])

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/MyAdminCar" element={<MyAdminCar />} />
        <Route path="/MySuperAdminCar" element={<MySuperAdminCar />} />
      </Routes>
    )
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"
      }`}
    >
      <Navbar />
      <div className="pt-[75px] min-h-[calc(100vh-75px)]">
        <Navigator />
      </div>
    </div>
  )
}

export default App