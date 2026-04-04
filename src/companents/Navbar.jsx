import { useEffect, useRef, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import Logo from "../assets/Logo.png"
import { useSearchStore } from "../stores/search"
import SearchIcon from "../assets/search-outline.png"
import Sunny from "../assets/sunny.png"
import Moon from "../assets/night-mode.png"
import { getAccessToken, clearTokens } from "../utils/auth"
import { apiFetch } from "../utils/apiFetch"

const Navbar = () => {
  const { isDarkmodeEnabled, toggleDarkmode } = useDarkmode()
  const { search, setSearch } = useSearchStore()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [token, setToken] = useState(null)
  const [profileImageUrl, setProfileImageUrl] = useState("")

  const navigate = useNavigate()
  const profileRef = useRef(null)

  const getUserIdFromToken = (jwtToken) => {
    try {
      const payload = jwtToken.split(".")[1]
      const decodedPayload = JSON.parse(atob(payload))

      return (
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || ""
      )
    } catch {
      return ""
    }
  }

  const fetchUserProfile = async (currentToken) => {
    try {
      const userId = getUserIdFromToken(currentToken)
      if (!userId) return

      const response = await apiFetch(`/api/Users/${userId}`, {
        method: "GET",
        headers: {
            Accept: "*/*",
        },
        })

      if (!response.ok) return

      const data = await response.json()
      setProfileImageUrl(data?.profileImageUrl || "")
    } catch (error) {
      console.log("User profile fetch error:", error)
    }
  }

  useEffect(() => {
    const currentToken = getAccessToken()
    setToken(currentToken)

    if (currentToken) {
      fetchUserProfile(currentToken)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    clearTokens()
    setToken(null)
    setProfileImageUrl("")
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    navigate("/")
  }

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 ${
        isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
      } shadow-md`}
    >
      <div className="max-w-[1280px] mx-auto h-[75px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-md">
            <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
          </div>

          <div className="flex items-center text-xl font-semibold">
            <span>Rent</span>
            <span className="text-red-500 ml-1">CAR</span>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className="hover:text-yellow-500 transition">Home</Link>
          <Link to={token ? "/favorite" : "/login"} className="hover:text-yellow-500 transition">Favorite</Link>
          <Link to={token ? "/basket" : "/login"} className="hover:text-yellow-500 transition">Basket</Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* SEARCH */}
          <div className="hidden md:flex items-center relative">
            <input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`p-2 pl-9 rounded outline-none w-[180px] lg:w-[220px] ${
                isDarkmodeEnabled
                  ? "bg-gray-700 text-white placeholder-gray-400"
                  : "bg-gray-200 text-black placeholder-gray-500"
              }`}
            />
            <img src={SearchIcon} alt="Search" className="absolute left-3 w-4 h-4" />
          </div>

          {/* DARK MODE */}
          <button
            className="w-11 h-7 flex items-center bg-zinc-200 rounded-full p-1 cursor-pointer"
            onClick={toggleDarkmode}
          >
            <div
              className={`flex items-center justify-center bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                isDarkmodeEnabled ? "translate-x-4" : ""
              }`}
            >
              {isDarkmodeEnabled ? (
                <img src={Moon} alt="Moon" className="w-3 h-3" />
              ) : (
                <img src={Sunny} alt="Sunny" className="w-3 h-3" />
              )}
            </div>
          </button>

          {/* PROFILE / SIGN IN DESKTOP */}
          <div className="hidden sm:block relative" ref={profileRef}>
            {token ? (
              <>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border transition-all duration-300 shadow-md hover:scale-105 ${
                    isDarkmodeEnabled
                      ? "bg-[#2a2a2a] border-gray-600 hover:bg-[#333333]"
                      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {profileImageUrl ? (
                    <img
                      src={`http://localhost:5248${profileImageUrl}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0"
                      />
                    </svg>
                  )}
                </button>

                <div
                  className={`absolute right-0 mt-3 w-52 rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
                    isProfileOpen
                      ? "opacity-100 translate-y-0 visible"
                      : "opacity-0 -translate-y-2 invisible"
                  } ${
                    isDarkmodeEnabled
                      ? "bg-[#222222] border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Link
                    to="/add-car"
                    onClick={() => setIsProfileOpen(false)}
                    className={`block px-4 py-3 transition ${
                      isDarkmodeEnabled ? "hover:bg-[#2f2f2f]" : "hover:bg-gray-100"
                    }`}
                  >
                    Add car
                  </Link>

                  <Link
                    to="/my-cars"
                    onClick={() => setIsProfileOpen(false)}
                    className={`block px-4 py-3 transition ${
                      isDarkmodeEnabled ? "hover:bg-[#2f2f2f]" : "hover:bg-gray-100"
                    }`}
                  >
                    My cars
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className={`block px-4 py-3 transition ${
                      isDarkmodeEnabled ? "hover:bg-[#2f2f2f]" : "hover:bg-gray-100"
                    }`}
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                  >
                    Log out
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="relative overflow-hidden inline-block px-4 py-2 rounded bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
              >
                <span className="relative z-10">Sign In</span>
              </Link>
            )}
          </div>

          {/* HAMBURGER */}
          <div className="lg:hidden">
  {token ? (
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border transition-all duration-300 shadow-md hover:scale-105 ${
        isDarkmodeEnabled
          ? "bg-[#2a2a2a] border-gray-600 hover:bg-[#333333]"
          : "bg-gray-100 border-gray-300 hover:bg-gray-200"
      }`}
    >
      {profileImageUrl ? (
        <img
          src={`http://localhost:5248${profileImageUrl}`}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0"
          />
        </svg>
      )}
    </button>
  ) : (
    <Link
      to="/login"
      className="lg:hidden relative overflow-hidden inline-block px-4 py-2 rounded bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
    >
      <span className="relative z-10">Sign In</span>
    </Link>
  )}
</div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        } ${isDarkmodeEnabled ? "bg-[#222222]" : "bg-gray-50"}`}
      >
        <div className="px-4 py-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to={token ? "/favorite" : "/login"} onClick={() => setIsMenuOpen(false)}>Favorite</Link>
          <Link to={token ? "/basket" : "/login"} onClick={() => setIsMenuOpen(false)}>Basket</Link>

          {token ? (
            <>
              <Link to="/add-car" onClick={() => setIsMenuOpen(false)}>Add car</Link>
              <Link to="/my-cars" onClick={() => setIsMenuOpen(false)}>My cars</Link>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Profile</Link>

              <button
                onClick={handleLogout}
                className="group relative overflow-hidden w-full bg-yellow-400 text-black font-bold rounded px-4 py-2 transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-[2px] hover:shadow-lg"
              >
                <span className="relative z-10">Log out</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="group relative overflow-hidden block w-full text-center bg-yellow-400 text-black font-bold rounded px-4 py-2 transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-[2px] hover:shadow-lg"
            >
              <span className="relative z-10">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar