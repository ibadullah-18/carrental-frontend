import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import Logo from '../assets/Logo.png'
import { useSearchStore } from "../stores/search"
import SearchIcon from '../assets/search-outline.png'
import Sunny from '../assets/sunny.png'
import Moon from '../assets/night-mode.png'

import { getAccessToken, clearTokens } from "../stores/auth"

const Navbar = () => {
    const { isDarkmodeEnabled, toggleDarkmode } = useDarkmode()
    const { search, setSearch } = useSearchStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate()

    // ✅ token state
    const [token, setToken] = useState(null)

    // ✅ component yuklenende token yoxla
    useEffect(() => {
        const currentToken = getAccessToken()
        setToken(currentToken)
    }, [])

    // ✅ logout
    const handleLogout = () => {
        clearTokens()
        setToken(null) // vacib
        navigate("/")
    }

    return (
 <div
        className={`w-full ${
            isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
        } shadow-md`}
    >
        <div className="max-w-[1280px] mx-auto h-[100px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">

            {/* LOGO */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
                    <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
                </div>

                <div className="flex items-center text-2xl font-semibold">
                    <span>Rent</span>
                    <span className="text-red-500 ml-1">CAR</span>
                </div>
            </div>

            {/* DESKTOP MENU */}
            <div className="hidden lg:flex items-center gap-8">
                <Link to="/" className="hover:text-yellow-500 transition">Home</Link>
                <Link to={token ? "/add-car" : "/login"} className="hover:text-yellow-500 transition">Add car</Link>
                <Link to="/my-cars" className="hover:text-yellow-500 transition">My cars</Link>
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
                        className={`p-2 pl-9 rounded outline-none w-[180px] lg:w-[220px]
                        ${
                            isDarkmodeEnabled
                                ? "bg-gray-700 text-white placeholder-gray-400"
                                : "bg-gray-200 text-black placeholder-gray-500"
                        }`}
                    />
                    <img src={SearchIcon} className="absolute left-3 w-4 h-4" />
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
                        {isDarkmodeEnabled ? <img src={Moon} className="w-3 h-3" /> : <img src={Sunny} className="w-3 h-3" />}
                    </div>
                </button>

                {/* AUTH BUTTON DESKTOP */}
              <div className="hidden sm:block">
                    {token ? (
                        <button
                            onClick={handleLogout}
                            className="
                                relative overflow-hidden
                                px-4 py-2 rounded
                                bg-yellow-400 text-black font-bold
                                shadow-md hover:shadow-xl
                                hover:-translate-y-1
                                active:translate-y-0
                                transition-all duration-300 ease-in-out
                                before:absolute before:top-0 before:left-[-100%]
                                before:w-full before:h-full
                                before:bg-white/30
                                before:skew-x-12
                                before:transition-all before:duration-500
                                hover:before:left-[120%]
                            "
                        >
                            <span className="relative z-10">Log Out</span>
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="
                                relative overflow-hidden
                                inline-block px-4 py-2 rounded
                                bg-yellow-400 text-black font-bold
                                shadow-md hover:shadow-xl
                                hover:-translate-y-1
                                active:translate-y-0
                                transition-all duration-300 ease-in-out
                                before:absolute before:top-0 before:left-[-100%]
                                before:w-full before:h-full
                                before:bg-white/30
                                before:skew-x-12
                                before:transition-all before:duration-500
                                hover:before:left-[120%]
                            "
                        >
                            <span className="relative z-10">Sign In</span>
                        </Link>
                    )}
                </div>

                {/* HAMBURGER */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden flex flex-col items-center justify-center gap-1 w-10 h-10"
                >
                    <span className={`block h-[2px] w-6 transition ${isMenuOpen ? "rotate-45 translate-y-[6px]" : ""} ${isDarkmodeEnabled ? "bg-white" : "bg-black"}`}></span>
                    <span className={`block h-[2px] w-6 transition ${isMenuOpen ? "opacity-0" : ""} ${isDarkmodeEnabled ? "bg-white" : "bg-black"}`}></span>
                    <span className={`block h-[2px] w-6 transition ${isMenuOpen ? "-rotate-45 -translate-y-[6px]" : ""} ${isDarkmodeEnabled ? "bg-white" : "bg-black"}`}></span>
                </button>
            </div>
        </div>

        {/* MOBILE MENU */}
        <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
                isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            } ${
                isDarkmodeEnabled ? "bg-[#222222]" : "bg-gray-50"
            }`}
        >
            <div className="px-4 py-4 flex flex-col gap-4">

                <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to={token ? "/add-car" : "/login"} onClick={() => setIsMenuOpen(false)}>Add car</Link>
                <Link to="/my-cars" onClick={() => setIsMenuOpen(false)}>My cars</Link>
                <Link to={token ? "/favorite" : "/login"} onClick={() => setIsMenuOpen(false)}>Favorite</Link>
                <Link to={token ? "/basket" : "/login"} onClick={() => setIsMenuOpen(false)}>Basket</Link>

                {/* AUTH BUTTON MOBILE */}
                <div className="pt-2">
                    {token ? (
                        <button
                            onClick={handleLogout}
                            className="group relative overflow-hidden w-full bg-yellow-400 text-black font-bold rounded px-4 py-2 transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-[2px] hover:shadow-lg"
                        >
                            <span className="relative z-10">Log Out</span>
                            <span className="absolute left-1/2 bottom-1 h-[2px] w-0 -translate-x-1/2 bg-black transition-all duration-300 group-hover:w-[70%]"></span>
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="group relative overflow-hidden block w-full text-center bg-yellow-400 text-black font-bold rounded px-4 py-2 transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-[2px] hover:shadow-lg"
                        >
                            <span className="relative z-10">Sign In</span>
                            <span className="absolute left-1/2 bottom-1 h-[2px] w-0 -translate-x-1/2 bg-black transition-all duration-300 group-hover:w-[70%]"></span>
                        </Link>
                    )}
                </div>

            </div>
        </div>
    </div>
    )
}

export default Navbar