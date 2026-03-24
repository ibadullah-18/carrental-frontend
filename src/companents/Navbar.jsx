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
        <div className={`w-full h-fit ${isDarkmodeEnabled ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
            <div className='w-full h-[100px] flex flex-row items-center gap-10 px-5'>
                
               <div className="flex items-center gap-3">
    
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
                    <img
                        src={Logo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex items-center text-2xl font-semibold">
                    <span>Rent</span>
                    <span className="text-red-500 ml-1">CAR</span>
                </div>

                </div>

                <div className='px-10 flex flex-row items-center justify-center gap-10'>
                    <Link to="/" className='hover:text-yellow-500'>Home</Link>

                    <Link
                        to={token ? "/add-car" : "/login"}
                        className="hover:text-yellow-500">
                        Add car
                    </Link>

                    <Link to="/my-cars" className="hover:text-yellow-500">My cars</Link>
                    <Link  to={token ? "/favorite" : "/login"} className='hover:text-yellow-500'>Favorite</Link>
                    <Link  to={token ? "/basket" : "/login"} className='hover:text-yellow-500'>Basket</Link>
                </div>

                <div className='flex flex-row items-center gap-6 ml-auto mr-1'>

                    {/* SEARCH */}
                    <div className='flex flex-row items-center relative'>
                        <input
                            type="search"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`p-1 pl-8 rounded outline-none
                            ${isDarkmodeEnabled
                                    ? "bg-gray-700 text-white placeholder-gray-400"
                                    : "bg-gray-300 text-black"}
                            `}
                        />
                        <img src={SearchIcon} className='absolute left-2' />
                    </div>

                    {/* DARK MODE */}
                    <button
                        className="w-11 h-7 flex items-center bg-zinc-200 rounded-full p-1 cursor-pointer"
                        onClick={toggleDarkmode}
                    >
                        <div className={`flex items-center justify-center bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${isDarkmodeEnabled ? "translate-x-4" : ""}`}>
                            {isDarkmodeEnabled ? <img src={Moon} /> : <img src={Sunny} />}
                        </div>
                    </button>

                    {/* AUTH BUTTON */}
                    {token ? (
                        <button
                            onClick={handleLogout}
                            className="bg-yellow-400 text-black font-bold rounded px-4 py-2 hover:bg-yellow-500"
                        >
                            Log Out
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-yellow-400 text-black font-bold rounded px-4 py-2 hover:bg-yellow-500"
                        >
                            Sign In
                        </Link>
                    )}

                </div>
            </div>
        </div>
    )
}

export default Navbar