import { useEffect, useRef, useState } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { FiBell } from "react-icons/fi"
import { useDarkmode } from "../stores/useDarkmode"
import Logo from "../assets/Logo.jpg"
import { useSearchStore } from "../stores/search"
import SearchIcon from "../assets/search-outline.png"
import Sunny from "../assets/sunny.png"
import Moon from "../assets/night-mode.png"
import { getAccessToken, clearTokens } from "../utils/auth"
import { apiFetch, getFileUrl } from "../utils/apiFetch"

const Navbar = () => {
  const { isDarkmodeEnabled, toggleDarkmode } = useDarkmode()
  const { search, setSearch } = useSearchStore()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [token, setToken] = useState(null)
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isNavbarFading, setIsNavbarFading] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const profileRef = useRef(null)
  const notificationRef = useRef(null)
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

      const response = await apiFetch(`/api/Users/${userId}/public-profile`, {
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

  const fetchUnreadCount = async () => {
    try {
      const response = await apiFetch("/api/Notifications/unread-count", {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      })

      if (!response.ok) return

      const data = await response.json()

      if (typeof data === "number") {
        setUnreadCount(data)
      } else {
        setUnreadCount(data?.count ?? data?.unreadCount ?? 0)
      }
    } catch (error) {
      console.log("Unread notifications fetch error:", error)
    }
  }

  const fetchNotifications = async () => {
  try {
    setNotificationsLoading(true)

    const response = await apiFetch("/api/Notifications", {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    })

    if (!response.ok) {
      console.log("Notifications response error:", response.status)
      return
    }

    const data = await response.json()
    console.log("Notifications data:", data)

    const list =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data?.result)
        ? data.result
        : []

    setNotifications(list)
  } catch (error) {
    console.log("Notifications fetch error:", error)
  } finally {
    setNotificationsLoading(false)
  }
}

  const openNotifications = async () => {
    setIsProfileOpen(false)
    setIsMenuOpen(false)
    setIsNotificationOpen((prev) => !prev)

    if (!isNotificationOpen) {
      await fetchNotifications()
      await fetchUnreadCount()
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      if (!notificationId) return

      const response = await apiFetch(
        `/api/Notifications/${notificationId}/mark-as-read`,
        {
          method: "PUT",
          headers: {
            Accept: "*/*",
          },
        }
      )

      if (!response.ok) return

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId || item.notificationId === notificationId
            ? { ...item, isRead: true, read: true }
            : item
        )
      )

      setUnreadCount((prev) => Math.max(prev - 1, 0))
    } catch (error) {
      console.log("Mark notification as read error:", error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await apiFetch("/api/Notifications/mark-all-as-read", {
        method: "PUT",
        headers: {
          Accept: "*/*",
        },
      })

      if (!response.ok) return

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          read: true,
        }))
      )

      setUnreadCount(0)
    } catch (error) {
      console.log("Mark all notifications as read error:", error)
    }
  }

  useEffect(() => {
    const currentToken = getAccessToken()
    setToken(currentToken)

    if (currentToken) {
      fetchUserProfile(currentToken)
      fetchUnreadCount()
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false)
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setIsNotificationOpen(false)
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
    setIsNotificationOpen(false)
  }, [location.pathname])

  const clearSearchAndCloseMenu = () => {
    setSearch("")
    setIsMenuOpen(false)
    setIsProfileOpen(false)
    setIsNotificationOpen(false)
    setIsDesktopSearchOpen(false)
    setIsMobileSearchOpen(false)
    setIsNavbarFading(false)
  }

  const handleLogout = () => {
    clearTokens()
    setToken(null)
    setProfileImageUrl("")
    setNotifications([])
    setUnreadCount(0)
    setIsProfileOpen(false)
    setIsNotificationOpen(false)
    setIsMenuOpen(false)
    setIsDesktopSearchOpen(false)
    setIsMobileSearchOpen(false)
    setIsNavbarFading(false)
    setSearch("")
    navigate("/")
  }

  const openDesktopSearch = () => {
    setIsProfileOpen(false)
    setIsNotificationOpen(false)
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
    setIsNotificationOpen(false)
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
    setIsNotificationOpen(false)
    setIsSearchFocused(false)
  }

  const handleSearchClose = () => {
    setIsDesktopSearchOpen(false)
    setIsMobileSearchOpen(false)
    setIsNavbarFading(false)
    setIsSearchFocused(false)
  }

  const getNotificationTitle = (item) =>
    item?.title || item?.subject || "Bildiriş"

  const getNotificationMessage = (item) =>
    item?.message || item?.content || item?.text || item?.body || ""

  const getNotificationId = (item) => item?.id || item?.notificationId

  const isNotificationRead = (item) => item?.isRead === true || item?.read === true

  const navLinkClass =
    "relative inline-flex items-center text-[15px] font-medium tracking-[0.2px] transition-all duration-300 hover:text-yellow-400 after:absolute after:left-0 after:-bottom-[8px] after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-yellow-400 after:transition-transform after:duration-300 hover:after:scale-x-100"

  const mobileNavLinkClass =
    "relative w-fit text-base font-medium transition-all duration-300 hover:text-yellow-400 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-yellow-400 after:transition-transform after:duration-300 hover:after:scale-x-100"

  const desktopContentHidden = isNavbarFading || isDesktopSearchOpen
  const mobileContentHidden = isNavbarFading || isMobileSearchOpen

  const NotificationButton = ({ mobile = false }) => {
    if (!token) return null

    return (
      <div className="relative z-[130]" ref={mobile ? null : notificationRef}>
        <button
          type="button"
          onClick={openNotifications}
          className={`${
            mobile ? "w-10 h-10" : "w-11 h-11"
          } relative flex items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 ${
            isDarkmodeEnabled
              ? "bg-[#222222] border-gray-700 hover:border-yellow-400"
              : "bg-white border-gray-300 hover:border-yellow-500"
          }`}
        >
          <FiBell className={`${mobile ? "text-[18px]" : "text-[20px]"}`} />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <div
          className={`absolute right-0 top-full mt-3 z-[220] w-[320px] max-w-[calc(100vw-24px)] rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
            isNotificationOpen
              ? "opacity-100 translate-y-0 visible pointer-events-auto"
              : "opacity-0 -translate-y-2 invisible pointer-events-none"
          } ${
            isDarkmodeEnabled
              ? "bg-[#222222] border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div
            className={`px-4 py-3 flex items-center justify-between border-b ${
              isDarkmodeEnabled ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div>
              <h3 className="font-bold text-sm">Bildirişlər</h3>
              <p
                className={`text-xs ${
                  isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {unreadCount > 0
                  ? `${unreadCount} oxunmamış bildiriş`
                  : "Yeni bildiriş yoxdur"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="text-xs font-semibold text-yellow-500 hover:text-yellow-600 transition"
              >
                Hamısını oxu
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notificationsLoading ? (
              <div
                className={`px-4 py-6 text-sm text-center ${
                  isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Yüklənir...
              </div>
            ) : notifications.length === 0 ? (
              <div
                className={`px-4 py-8 text-sm text-center ${
                  isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Bildiriş yoxdur
              </div>
            ) : (
              notifications.map((item, index) => {
                const notificationId = getNotificationId(item)
                const read = isNotificationRead(item)

                return (
                  <button
                    key={notificationId || index}
                    type="button"
                    onClick={() => !read && markNotificationAsRead(notificationId)}
                    className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition ${
                      isDarkmodeEnabled
                        ? "border-gray-700 hover:bg-[#2f2f2f]"
                        : "border-gray-100 hover:bg-gray-50"
                    } ${!read ? "bg-yellow-400/10" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          !read ? "bg-yellow-400" : "bg-transparent"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold line-clamp-1">
                          {getNotificationTitle(item)}
                        </h4>

                        {getNotificationMessage(item) && (
                          <p
                            className={`mt-1 text-xs leading-5 line-clamp-2 ${
                              isDarkmodeEnabled
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {getNotificationMessage(item)}
                          </p>
                        )}

                        {(item?.createdAt || item?.date) && (
                          <p
                            className={`mt-1 text-[11px] ${
                              isDarkmodeEnabled
                                ? "text-gray-500"
                                : "text-gray-400"
                            }`}
                          >
                            {new Date(item.createdAt || item.date).toLocaleString(
                              "az-AZ"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

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
                <span>Show</span>
                <span className="text-red-500 ml-1">Car</span>
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
              <Link to="/" onClick={clearSearchAndCloseMenu} className={navLinkClass}>
                Ana səhifə
              </Link>

              <Link
                to={token ? "/my-cars" : "/login"}
                onClick={clearSearchAndCloseMenu}
                className={navLinkClass}
              >
                Mənim maşınlarım
              </Link>

              <Link
                to={token ? "/add-car" : "/login"}
                onClick={clearSearchAndCloseMenu}
                className="relative overflow-hidden inline-block px-4 py-2 rounded bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
              >
                Maşın əlavə et
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
                <img src={SearchIcon} alt="Search" className="absolute left-4 w-4 h-4 opacity-70" />

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
                      Təmizlə
                    </button>
                  )}

                  <button type="submit" className="px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition">
                    Axtar
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
              <img src={SearchIcon} alt="Search" className="w-5 h-5 opacity-80" />
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

            <NotificationButton />

            <div className="hidden sm:block relative z-[120]" ref={profileRef}>
              {token ? (
                <>
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false)
                      setIsProfileOpen(!isProfileOpen)
                    }}
                    className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border transition-all duration-300 shadow-md hover:scale-105 ${
                      isDarkmodeEnabled
                        ? "bg-[#2a2a2a] border-gray-600 hover:bg-[#333333]"
                        : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {profileImageUrl ? (
                      <img

                        src={getFileUrl(profileImageUrl)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0" />
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
                      to="/profile"
                      onClick={clearSearchAndCloseMenu}
                      className={`block px-4 py-3 transition ${
                        isDarkmodeEnabled ? "hover:bg-[#2f2f2f]" : "hover:bg-gray-100"
                      }`}
                    >
                      Profil
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                    >
                      Çıxış
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={clearSearchAndCloseMenu}
                  className="relative overflow-hidden inline-block px-4 py-2 rounded bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
                >
                  <span className="relative z-10">Giriş et</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex lg:hidden items-center gap-3 sm:gap-4 ml-auto" ref={notificationRef}>
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
                  <img src={SearchIcon} alt="Search" className="w-[18px] h-[18px] opacity-80" />
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

                <NotificationButton mobile />

                {token ? (
                  <button
                    onClick={() => {
                      setIsNotificationOpen(false)
                      setIsMenuOpen(!isMenuOpen)
                    }}
                    className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border transition-all duration-300 shadow-md hover:scale-105 ${
                      isDarkmodeEnabled
                        ? "bg-[#2a2a2a] border-gray-600 hover:bg-[#333333]"
                        : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {profileImageUrl ? (
                      <img
                        src={getFileUrl(profileImageUrl)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={clearSearchAndCloseMenu}
                    className="relative overflow-hidden inline-block px-4 py-2 rounded bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
                  >
                    <span className="relative z-10">Giriş et</span>
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
              <img src={SearchIcon} alt="Search" className="absolute left-4 w-4 h-4 opacity-70" />

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

            <button type="submit" className="px-4 h-[44px] rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition">
              Axtar
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
              Bağla
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
            Ana səhifə
          </Link>

          <Link
            to={token ? "/my-cars" : "/login"}
            onClick={clearSearchAndCloseMenu}
            className={mobileNavLinkClass}
          >
            Mənim maşınlarım
          </Link>

          <Link
            to={token ? "/add-car" : "/login"}
            onClick={clearSearchAndCloseMenu}
            className={mobileNavLinkClass}
          >
            Maşın əlavə et
          </Link>

          {token ? (
            <>
              <Link to="/profile" onClick={clearSearchAndCloseMenu} className={mobileNavLinkClass}>
                Profil
              </Link>

              <button
                onClick={handleLogout}
                className="group relative overflow-hidden w-full bg-yellow-400 text-black font-bold rounded px-4 py-2 transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-[2px] hover:shadow-lg"
              >
                <span className="relative z-10">Çıxış</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={clearSearchAndCloseMenu}
              className="group relative overflow-hidden block w-full text-center bg-yellow-400 text-black font-bold rounded px-4 py-2 transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-[2px] hover:shadow-lg"
            >
              <span className="relative z-10">Giriş et</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar