import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LexusBg from "../assets/lexus-bg.png";
import { useDarkmode } from "../stores/useDarkmode";
import { apiFetch } from "../utils/apiFetch";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { isDarkmodeEnabled } = useDarkmode();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [countdown, setCountdown] = useState(10);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let timer;

    if (step === "reset" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [step, countdown]);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value) => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-\\/[\]=+;']/.test(value);
    const hasMinLength = value.length >= 8;

    return hasUpperCase && hasNumber && hasSymbol && hasMinLength;
  };

  const getErrorMessage = (data, fallback) => {
    if (data?.errors) {
      const firstError = Object.values(data.errors)?.flat()?.[0];
      return firstError || fallback;
    }

    return data?.message || data?.Message || data?.title || fallback;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Email daxil edin");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Düzgün email daxil edin");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/api/Auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Təsdiq kodu göndərilmədi"));
      }

      setEmail(cleanEmail);
      setSuccess("Təsdiq kodu email ünvanına göndərildi");
      setStep("reset");
      setCountdown(10);
    } catch (err) {
      setError(err.message || "Kod göndərilərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || resendLoading) return;

    setError("");
    setSuccess("");

    try {
      setResendLoading(true);

      const response = await apiFetch("/api/Auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Kod yenidən göndərilmədi"));
      }

      setSuccess("Yeni təsdiq kodu email ünvanına göndərildi");
      setCountdown(10);
    } catch (err) {
      setError(err.message || "Kod yenidən göndərilmədi");
    } finally {
      setResendLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!code.trim()) {
      setError("Təsdiq kodunu daxil edin");
      return;
    }

    if (!newPassword.trim()) {
      setError("Yeni şifrə daxil edin");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Şifrə minimum 8 simvol, 1 böyük hərf, 1 rəqəm və 1 xüsusi simvol içərməlidir"
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Şifrələr uyğun deyil");
      return;
    }

    try {
      setResetLoading(true);

      const response = await apiFetch("/api/Auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: code.trim(),
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Şifrə yenilənmədi"));
      }

      setSuccess("Şifrə uğurla yeniləndi");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Şifrə yenilənərkən xəta baş verdi");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-160px)] bg-cover bg-center bg-no-repeat flex items-center justify-center px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-14 relative"
      style={{ backgroundImage: `url(${LexusBg})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div
        className={`relative z-10 w-full max-w-[380px] sm:max-w-[450px] md:max-w-[520px]
        rounded-3xl shadow-2xl p-5 sm:p-7 md:p-9 border backdrop-blur-xl
        ${
          isDarkmodeEnabled
            ? "bg-white/10 border-white/20 text-white"
            : "bg-black/20 border-white/20 text-white"
        }`}
      >
        {step === "email" ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-center mb-2">
              Şifrəni bərpa et
            </h1>

            <p className="text-center text-gray-300 mb-7 text-sm sm:text-base">
              Email ünvanını daxil et, təsdiq kodu göndərək.
            </p>

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-sm">Email</label>
                <input
                  type="email"
                  placeholder="Email daxil edin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[50px] px-4 rounded-2xl border bg-white/10 border-white/20 text-white placeholder-gray-300 outline-none focus:border-red-500 transition"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-green-400 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden w-full bg-red-500 hover:bg-red-600 text-white h-[52px] rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1 shadow-xl disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Kod göndər"
                )}

                {!loading && (
                  <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[150%]"></span>
                )}
              </button>
            </form>

            <p className="text-center mt-5 text-sm">
              Şifrəni xatırladınız?{" "}
              <Link to="/login" className="text-red-400 hover:underline">
                Daxil ol
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-center mb-2">
              Yeni şifrə
            </h1>

            <p className="text-center text-gray-300 mb-3 text-sm sm:text-base leading-6">
              <span className="text-white font-semibold">{email}</span>{" "}
              ünvanına göndərilən təsdiq kodunu daxil edin.
            </p>

            <p className="mb-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-center text-[13px] sm:text-sm leading-6 text-yellow-200">
              Əgər kod gəlməyibsə, zəhmət olmasa{" "}
              <span className="font-bold text-yellow-300">Spam</span> və ya{" "}
              <span className="font-bold text-yellow-300">Promotions</span>{" "}
              qutusunu yoxlayın. Kod bəzən ilk göndərişdə spam qutusuna düşə bilər.
            </p>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-sm">Təsdiq kodu</label>
                <input
                  type="text"
                  placeholder="Kod"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[55px] px-5 rounded-2xl border bg-white/10 border-white/20 text-white text-center text-2xl tracking-[10px] font-bold placeholder-gray-300 outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Yeni şifrə</label>
                <input
                  type="password"
                  placeholder="Yeni şifrə daxil edin"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-[50px] px-4 rounded-2xl border bg-white/10 border-white/20 text-white placeholder-gray-300 outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Yeni şifrə təkrarı</label>
                <input
                  type="password"
                  placeholder="Yeni şifrəni təkrar daxil edin"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full h-[50px] px-4 rounded-2xl border bg-white/10 border-white/20 text-white placeholder-gray-300 outline-none focus:border-red-500 transition"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-green-400 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={resetLoading}
                className="group relative overflow-hidden w-full bg-red-500 hover:bg-red-600 text-white h-[52px] rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1 shadow-xl disabled:opacity-60"
              >
                {resetLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Şifrəni yenilə"
                )}
              </button>

              <button
                type="button"
                disabled={countdown > 0 || resendLoading}
                onClick={handleResendCode}
                className={`h-[50px] rounded-2xl border transition font-semibold ${
                  countdown > 0 || resendLoading
                    ? "border-white/10 text-gray-400 cursor-not-allowed"
                    : "border-white/20 hover:bg-white/10 text-white"
                }`}
              >
                {resendLoading
                  ? "Göndərilir..."
                  : countdown > 0
                  ? `Kodu yenidən göndər (${countdown}s)`
                  : "Kodu yenidən göndər"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setNewPassword("");
                  setConfirmNewPassword("");
                  setError("");
                  setSuccess("");
                }}
                className="text-sm text-gray-300 hover:text-red-400 transition"
              >
                Emaili dəyişmək üçün geri qayıt
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;