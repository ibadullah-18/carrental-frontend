import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LexusBg from "../assets/lexus-bg.png";
import { useDarkmode } from "../stores/useDarkmode";
import { apiFetch } from "../utils/apiFetch";

const Register = () => {
  const navigate = useNavigate();
  const { isDarkmodeEnabled } = useDarkmode();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-\\/[\]=+;']/.test(password);
  const hasMinLength = password.length >= 8;

  return hasUpperCase && hasNumber && hasSymbol && hasMinLength;
};

const handleRegister = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (!fullName.trim()) {
    setError("Full name cannot be empty");
    return;
  }

  if (!email.trim()) {
    setError("Email cannot be empty");
    return;
  }

  if (!validateEmail(email)) {
    setError("Please enter a valid email address");
    return;
  }

  if (!phone.trim()) {
    setError("Phone number cannot be empty");
    return;
  }

  if (!driverLicenseNumber.trim()) {
    setError("Driver license number cannot be empty");
    return;
  }

  if (!password.trim()) {
    setError("Password cannot be empty");
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters");
    return;
  }

  if (!/[A-Z]/.test(password)) {
    setError("Password must contain at least 1 uppercase letter");
    return;
  }

  if (!/\d/.test(password)) {
    setError("Password must contain at least 1 number");
    return;
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-\\/[\]=+;']/.test(password)) {
    setError("Password must contain at least 1 special character");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("FullName", fullName.trim());
    formData.append("Email", email.trim());
    formData.append("Phone", phone.trim());
    formData.append("Password", password);
    formData.append("DriverLicenseNumber", driverLicenseNumber.trim());

    const response = await apiFetch("/api/Auth/register", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);
    console.log("Register response:", data);

    if (!response.ok) {
      if (data?.errors) {
        const firstError = Object.values(data.errors)?.flat()?.[0];
        throw new Error(firstError || "Validation failed");
      }

      throw new Error(
        data?.message ||
          data?.Message ||
          data?.title ||
          "Registration failed"
      );
    }

    setSuccess("Registration successful");

    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setDriverLicenseNumber("");

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  } catch (err) {
    console.log("Register error:", err);
    setError(err.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};

  return (
  <div
    className="min-h-[calc(100vh-160px)] bg-cover bg-center bg-no-repeat flex items-center justify-center px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-14 relative"
    style={{ backgroundImage: `url(${LexusBg})` }}
  >
    <div className="absolute inset-0 bg-black/50"></div>

    <div
      className={`relative z-10 w-full max-w-[360px] sm:max-w-[430px] md:max-w-[500px] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border backdrop-blur-md ${
        isDarkmodeEnabled
          ? "bg-white/10 border-white/20 text-white"
          : "bg-black/20 border-white/20 text-white"
      }`}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-5 sm:mb-6">
        Register
      </h1>

      <form
        onSubmit={handleRegister}
        className="flex flex-col gap-4 w-full max-w-[420px] mx-auto"
      >
        <div>
          <label className="block mb-2 text-white text-sm sm:text-base">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block mb-2 text-white text-sm sm:text-base">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block mb-2 text-white text-sm sm:text-base">
            Phone
          </label>
          <input
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block mb-2 text-white text-sm sm:text-base">
            Driver License Number
          </label>
          <input
            type="text"
            placeholder="Enter your driver license number"
            value={driverLicenseNumber}
            onChange={(e) => setDriverLicenseNumber(e.target.value)}
            className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block mb-2 text-white text-sm sm:text-base">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-[44px] sm:h-[48px] px-3 sm:px-4 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="
            group relative overflow-hidden
            w-full bg-yellow-400 text-black h-[46px] sm:h-[50px] rounded-xl
            hover:bg-yellow-500 duration-200 disabled:opacity-50
            font-semibold flex items-center justify-center
            shadow-md hover:shadow-xl
            hover:-translate-y-1 active:translate-y-0
            transition-all duration-300 ease-in-out
          "
        >
          <span className="relative z-10 flex items-center justify-center">
            {loading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Register"
            )}
          </span>

          {!loading && (
            <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
          )}
        </button>
      </form>

      <p className="text-center mt-4 sm:mt-5 text-white text-sm sm:text-base">
        Already have an account?{" "}
        <Link to="/login" className="text-yellow-400 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  </div>
);
};

export default Register;