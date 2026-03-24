import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";
import bgImage from "../assets/lexus-bg.png";

const Login = () => {
  const { isDarkmodeEnabled } = useDarkmode()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://localhost:5248/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      alert("Login uğurludur");

      // məsələn token qaytarırsa:
      // localStorage.setItem("token", data.token);

      setEmail("");
      setPassword("");
      navigate("/"); // login sonrası yönləndirmə
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



   const inputClass = `
    w-full h-15 p-4 mb-3 text-lg rounded outline-none transition
    ${isDarkmodeEnabled
      ? "bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:border-yellow-400"
      : "bg-white text-black placeholder-gray-500 border border-gray-300 focus:border-yellow-400"
    }`

  return (
<div className="min-h-screen flex items-center justify-center bg-white text-black">
  <form onSubmit={handleSubmit} className="w-[700px]">
    
    <h2 className="text-4xl font-poppins font-semibold mb-6 text-center">
      Login
    </h2>

    <input
      type="email"
      placeholder="Enter your email"
      className={inputClass}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />

    <input
      type="password"
      placeholder="Enter your password"
      className={inputClass}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />

    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

    <Link
      to="/register"
      className="mb-4 inline-block text-sm text-blue-600 hover:underline"
    >
      Don't have an account? Register
    </Link>

    <button
      type="submit"
      className="w-full h-15 mt-2 rounded text-lg font-poppins font-semibold transition flex items-center justify-center bg-yellow-400 text-black hover:bg-yellow-500"
    >
      Login
    </button>

  </form>
</div>
  );
};

export default Login;