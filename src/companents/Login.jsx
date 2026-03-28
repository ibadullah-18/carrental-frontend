import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import { setAccessToken, setRefreshToken } from "../stores/auth"
import LexusBg from "../assets/lexus-bg.png"
import Navbar from "./Navbar"
import Footer from "./Footer"

const Login = () => {
    const { isDarkmodeEnabled } = useDarkmode()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const response = await fetch("http://localhost:5248/api/Auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            if (!response.ok) {
                throw new Error("Email ve ya sifre sehvdir")
            }

            const data = await response.json()

            const accessToken = data.accessToken || data.token
            const refreshToken = data.refreshToken

            if (!accessToken) {
                throw new Error("Access token gelmedi")
            }

            setAccessToken(accessToken)

            if (refreshToken) {
                setRefreshToken(refreshToken)
            }

            navigate("/")
            window.location.reload()
        } catch (err) {
            setError(err.message || "Login zamani xeta bas verdi")
        } finally {
            setLoading(false)
        }
    }

    return (
  <div
    className="min-h-[calc(100vh-160px)] bg-cover bg-center bg-no-repeat flex items-center justify-center px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-14 relative"
    style={{ backgroundImage: `url(${LexusBg})` }}
  >
    <div className="absolute inset-0 bg-black/50"></div>

    <div
      className={`relative z-10 w-full max-w-[340px] sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border backdrop-blur-md ${
        isDarkmodeEnabled
          ? "bg-white/10 border-white/20 text-white"
          : "bg-black/20 border-white/20 text-white"
      }`}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-5 sm:mb-6">
        Sign In
      </h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="block mb-2 text-white text-sm sm:text-base">
            Email
          </label>
          <input
            type="email"
            placeholder="Email daxil et"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 sm:p-3 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block mb-2 text-white text-sm sm:text-base">
            Password
          </label>
          <input
            type="password"
            placeholder="Sifre daxil et"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 sm:p-3 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 text-black py-2.5 sm:py-3 rounded-xl hover:bg-yellow-500 duration-200 disabled:opacity-50 font-semibold flex items-center justify-center text-sm sm:text-base"
        >
          {loading ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-center mt-4 sm:mt-5 text-white text-sm sm:text-base">
        Hesabin yoxdur?{" "}
        <Link to="/register" className="text-yellow-400 hover:underline">
          Register
        </Link>
      </p>
    </div>
  </div>
    )
}

export default Login