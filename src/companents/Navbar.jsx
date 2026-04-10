import { useEffect, useRef, useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
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
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isNavbarFading, setIsNavbarFading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const profileRef = useRef(null)
  const desktopSearchInputRef = useRef(null)
  const mobileSearchInputRef = useRef(null)

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

  useEffect(() => {
    if (isDesktopSearchOpen && desktopSearchInputRef.current) {
      desktopSearchInputRef.current.focus()
    }
  }, [isDesktopSearchOpen])

  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
  }, [isMobileSearchOpen])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
  }, [location.pathname])

  const clearSearchAndCloseMenu = () => {
    setSearch("")
    setIsMenuOpen(false)
    setIsProfileOpen(false)
    setIsDesktopSearchOpen(false)
    setIsMobileSearchOpen(false)
    setIsNavbarFading(false)
  }

  const handleLogout = () => {
    clearTokens()
    setToken(null)
    setProfileImageUrl("")
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    setIsDesktopSearchOpen(false)
    setIsMobileSearchOpen(false)
    setIsNavbarFading(false)
    setSearch("")
    navigate("/")
  }

  const openDesktopSearch = () => {
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    setIsNavbarFading(true)

    setTimeout(() => {
      setIsDesktopSearchOpen(true)
      if (location.pathname !== "/search") {
        navigate("/search")
      }
    }, 260)
  }

  const openMobileSearch = () => {
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    setIsNavbarFading(true)

    setTimeout(() => {
      setIsMobileSearchOpen(true)
      if (location.pathname !== "/search") {
        navigate("/search")
      }
    }, 260)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)

    if (location.pathname !== "/search") {
      navigate("/search")
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()

    const trimmed = search.trim()
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search")

    setIsDesktopSearchOpen(false)
    setIsMobileSearchOpen(false)
    setIsNavbarFading(false)
    setIsMenuOpen(false)
    setIsProfileOpen(false)
    setIsSearchFocused(false)
  }

  const handleSearchClose = () => {
    setIsDesktopSearchOpen(false)
    setIsMobileSearchOpen(false)
    setIsNavbarFading(false)
    setIsSearchFocused(false)
  }

  const navLinkClass =
    "relative inline-flex items-center text-[15px] font-medium tracking-[0.2px] transition-all duration-300 hover:text-yellow-400 after:absolute after:left-0 after:-bottom-[8px] after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-yellow-400 after:transition-transform after:duration-300 hover:after:scale-x-100"

  const mobileNavLinkClass =
    "relative w-fit text-base font-medium transition-all duration-300 hover:text-yellow-400 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-yellow-400 after:transition-transform after:duration-300 hover:after:scale-x-100"

  const desktopContentHidden = isNavbarFading || isDesktopSearchOpen
  const mobileContentHidden = isNavbarFading || isMobileSearchOpen

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 ${
        isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
      } shadow-md`}
    >
      <div className="max-w-[1280px] mx-auto h-[75px] px-4 sm:px-6 lg:px-8 relative overflow-visible">
        <div className="h-full flex items-center justify-between gap-4">
          <div
            className={`transition-all duration-300 ${
              desktopContentHidden
                ? "opacity-0 -translate-x-6 pointer-events-none"
                : "opacity-100 translate-x-0"
            }`}
          >
            <Link
              to="/"
              onClick={clearSearchAndCloseMenu}
              className="flex items-center gap-3 shrink-0"
            >
              <div className="w-13 h-13 rounded-full overflow-hidden shadow-md">
                <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center text-xl font-semibold">
                <span>Zyro</span>
                <span className="text-red-500 ml-1">CAR</span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center relative">
            <div
              className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-8 transition-all duration-300 ${
                desktopContentHidden
                  ? "opacity-0 translate-y-2 pointer-events-none"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <Link
                to="/"
                onClick={clearSearchAndCloseMenu}
                className={navLinkClass}
              >
                Home
              </Link>

              <Link
                to={token ? "/favorite" : "/login"}
                onClick={clearSearchAndCloseMenu}
                className={navLinkClass}
              >
                Favorite
              </Link>

              <Link
                to={token ? "/basket" : "/login"}
                onClick={clearSearchAndCloseMenu}
                className={navLinkClass}
              >
                Basket
              </Link>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className={`absolute right-0 w-full flex justify-end transition-all duration-500 ${
                isDesktopSearchOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <div
                className={`relative flex items-center rounded-full border shadow-sm overflow-hidden transition-all duration-500 ease-out ${
                  isSearchFocused
                    ? "border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.18)]"
                    : isDarkmodeEnabled
                    ? "border-gray-700"
                    : "border-gray-300"
                } ${isDarkmodeEnabled ? "bg-[#222222]" : "bg-white"} ${
                  isDesktopSearchOpen
                    ? "w-full max-w-[980px]"
                    : "w-[48px] max-w-[48px]"
                }`}
              >
                <img
                  src={SearchIcon}
                  alt="Search"
                  className="absolute left-4 w-4 h-4 opacity-70"
                />

                <input
                  ref={desktopSearchInputRef}
                  type="search"
                  placeholder="Search cars..."
                  value={search}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={`w-full h-[48px] pl-11 pr-[120px] rounded-full outline-none bg-transparent transition-all duration-300 ${
                    isDarkmodeEnabled
                      ? "text-white placeholder:text-gray-400"
                      : "text-black placeholder:text-gray-500"
                  }`}
                />

                <div
                  className={`absolute right-2 flex items-center gap-2 transition-all duration-300 ${
                    isDesktopSearchOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4 pointer-events-none"
                  }`}
                >
                  {search.trim() && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className={`px-3 py-2 rounded-full text-sm transition ${
                        isDarkmodeEnabled
                          ? "hover:bg-[#333333] text-gray-300"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      Clear
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                  >
                    Enter
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div
            className={`hidden lg:flex items-center gap-3 sm:gap-4 transition-all duration-300 ${
              desktopContentHidden
                ? "opacity-0 translate-x-6 pointer-events-none"
                : "opacity-100 translate-x-0"
            }`}
          >
            <button
              type="button"
              onClick={openDesktopSearch}
              className={`hidden md:flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-300 hover:scale-105 ${
                isDarkmodeEnabled
                  ? "bg-[#222222] border-gray-700 hover:border-yellow-400"
                  : "bg-white border-gray-300 hover:border-yellow-500"
              }`}
            >
              <img
                src={SearchIcon}
                alt="Search"
                className="w-5 h-5 opacity-80"
              />
            </button>

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

            <div className="hidden sm:block relative z-[120]" ref={profileRef}>
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
                    className={`absolute right-0 top-full mt-3 z-[200] w-52 rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
                      isProfileOpen
                        ? "opacity-100 translate-y-0 visible pointer-events-auto"
                        : "opacity-0 -translate-y-2 invisible pointer-events-none"
                    } ${
                      isDarkmodeEnabled
                        ? "bg-[#222222] border-gray-700"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <Link
                      to="/add-car"
                      onClick={clearSearchAndCloseMenu}
                      className={`block px-4 py-3 transition ${
                        isDarkmodeEnabled ? "hover:bg-[#2f2f2f]" : "hover:bg-gray-100"
                      }`}
                    >
                      Add car
                    </Link>

                    <Link
                      to="/my-cars"
                      onClick={clearSearchAndCloseMenu}
                      className={`block px-4 py-3 transition ${
                        isDarkmodeEnabled ? "hover:bg-[#2f2f2f]" : "hover:bg-gray-100"
                      }`}
                    >
                      My cars
                    </Link>

                    <Link
                      to="/my-car-rentals"
                      onClick={clearSearchAndCloseMenu}
                      className={`block px-4 py-3 transition ${
                        isDarkmodeEnabled ? "hover:bg-[#2f2f2f]" : "hover:bg-gray-100"
                      }`}
                    >
                      My Rentals
                    </Link>

                    <Link
                      to="/profile"
                      onClick={clearSearchAndCloseMenu}
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
                  onClick={clearSearchAndCloseMenu}
                  className="relative overflow-hidden inline-block px-4 py-2 rounded bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
                >
                  <span className="relative z-10">Sign In</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex lg:hidden items-center gap-3 sm:gap-4 ml-auto">
            {!mobileContentHidden && (
              <>
                <button
                  type="button"
                  onClick={openMobileSearch}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 hover:scale-105 ${
                    isDarkmodeEnabled
                      ? "bg-[#222222] border-gray-700 hover:border-yellow-400"
                      : "bg-white border-gray-300 hover:border-yellow-500"
                  }`}
                >
                  <img
                    src={SearchIcon}
                    alt="Search"
                    className="w-[18px] h-[18px] opacity-80"
                  />
                </button>

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
                    onClick={clearSearchAndCloseMenu}
                    className="relative overflow-hidden inline-block px-4 py-2 rounded bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
                  >
                    <span className="relative z-10">Sign In</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          isMobileSearchOpen ? "max-h-[120px] opacity-100" : "max-h-0 opacity-0"
        } ${isDarkmodeEnabled ? "bg-[#222222]" : "bg-gray-50"}`}
      >
        <div className="px-4 py-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div
              className={`relative flex-1 flex items-center rounded-full border shadow-sm overflow-hidden transition-all duration-500 ease-out ${
                isSearchFocused
                  ? "border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.18)]"
                  : isDarkmodeEnabled
                  ? "border-gray-700"
                  : "border-gray-300"
              } ${isDarkmodeEnabled ? "bg-[#181818]" : "bg-white"} ${
                isMobileSearchOpen ? "w-full" : "w-[48px]"
              }`}
            >
              <img
                src={SearchIcon}
                alt="Search"
                className="absolute left-4 w-4 h-4 opacity-70"
              />

              <input
                ref={mobileSearchInputRef}
                type="search"
                placeholder="Search cars..."
                value={search}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full h-[44px] pl-11 pr-4 rounded-full outline-none bg-transparent ${
                  isDarkmodeEnabled
                    ? "text-white placeholder:text-gray-400"
                    : "text-black placeholder:text-gray-500"
                }`}
              />
            </div>

            <button
              type="submit"
              className="px-4 h-[44px] rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
            >
              Enter
            </button>

            <button
              type="button"
              onClick={handleSearchClose}
              className={`px-4 h-[44px] rounded-full transition ${
                isDarkmodeEnabled
                  ? "bg-[#333333] text-white hover:bg-[#3d3d3d]"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              Close
            </button>
          </form>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen && !isMobileSearchOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0"
        } ${isDarkmodeEnabled ? "bg-[#222222]" : "bg-gray-50"}`}
      >
        <div className="px-4 py-4 flex flex-col gap-4">
          <Link to="/" onClick={clearSearchAndCloseMenu} className={mobileNavLinkClass}>
            Home
          </Link>

          <Link
            to={token ? "/favorite" : "/login"}
            onClick={clearSearchAndCloseMenu}
            className={mobileNavLinkClass}
          >
            Favorite
          </Link>

          <Link
            to={token ? "/basket" : "/login"}
            onClick={clearSearchAndCloseMenu}
            className={mobileNavLinkClass}
          >
            Basket
          </Link>

          {token ? (
            <>
              <Link to="/add-car" onClick={clearSearchAndCloseMenu} className={mobileNavLinkClass}>
                Add car
              </Link>

              <Link to="/my-cars" onClick={clearSearchAndCloseMenu} className={mobileNavLinkClass}>
                My cars
              </Link>

              <Link
                to="/my-car-rentals"
                onClick={clearSearchAndCloseMenu}
                className={mobileNavLinkClass}
              >
                My Rentals
              </Link>

              <Link to="/profile" onClick={clearSearchAndCloseMenu} className={mobileNavLinkClass}>
                Profile
              </Link>

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
              onClick={clearSearchAndCloseMenu}
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