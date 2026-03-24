import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import { setAccessToken, setRefreshToken } from "../stores/auth"
import LexusBg from "../assets/lexus-bg.png"
import Navbar from "./Navbar"

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
      <>
      <Navbar/>
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 relative"
            style={{ backgroundImage: `url(${LexusBg})` }}
        >
            <div className="absolute inset-0 bg-black/50"></div>

            <div
                className={`relative z-10 w-full max-w-md rounded-3xl shadow-2xl p-8 border backdrop-blur-md ${
                    isDarkmodeEnabled
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-black/20 border-white/20 text-white"
                }`}
            >
                <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-2 text-white">Email</label>
                        <input
                            type="email"
                            placeholder="Email daxil et"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-white">Password</label>
                        <input
                            type="password"
                            placeholder="Sifre daxil et"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-400 text-black py-3 rounded-xl hover:bg-yellow-500 duration-200 disabled:opacity-50 font-semibold flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>

                <p className="text-center mt-5 text-white">
                    Hesabin yoxdur?{" "}
                    <Link to="/register" className="text-yellow-400 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
        </>
    )
}

export default Login