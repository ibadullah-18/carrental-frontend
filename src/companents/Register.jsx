import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LexusBg from "../assets/lexus-bg.png";
import { useDarkmode } from "../stores/useDarkmode";
import { apiFetch } from "../utils/apiFetch";

const Register = () => {
  const navigate = useNavigate();
  const { isDarkmodeEnabled } = useDarkmode();

  const [step, setStep] = useState("register");
  const [activePolicy, setActivePolicy] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [verificationCode, setVerificationCode] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptContentPolicy, setAcceptContentPolicy] = useState(false);
  const [acceptElectronic, setAcceptElectronic] = useState(false);

  const [countdown, setCountdown] = useState(10);

  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const policies = {
    terms: {
      title: "İstifadə Şərtləri",
      content: `
MyCar istifadəçilərin öz avtomobillərini platformada göstərməsi üçün yaradılmış onlayn xidmətdir.

İstifadəçi platformaya yerləşdirdiyi bütün məlumatların düzgünlüyünə görə özü məsuliyyət daşıyır. MyCar istifadəçinin yerləşdirdiyi avtomobil, şəkil, dövlət nömrəsi, açıqlama və digər məlumatların həqiqiliyinə zəmanət vermir.

Platformada saxta, qanunsuz, başqasına məxsus, aldadıcı, təhqiredici və üçüncü şəxslərin hüquqlarını pozan məlumat yerləşdirmək qadağandır.

MyCar qaydaları pozan elanları yoxlamaq, gizlətmək, silmək, istifadəçi hesabını məhdudlaşdırmaq və ya bloklamaq hüququnu saxlayır.

Ödəniş edilmiş paket yalnız avtomobil məlumatının platformada göstərilməsi xidməti üçündür. MyCar avtomobilin satışı, alışı, dəyişdirilməsi, icarəsi və ya istifadəçilər arasında yaranan hər hansı razılaşmanın nəticəsinə görə məsuliyyət daşımır.

İstifadəçi platformadan istifadə etməklə bu şərtləri oxuduğunu, başa düşdüyünü və qəbul etdiyini təsdiq edir.
      `,
    },
    privacy: {
      title: "Məxfilik Siyasəti",
      content: `
MyCar istifadəçinin ad, soyad, email, avtomobil məlumatları, şəkillər, IP ünvanı və texniki istifadə məlumatlarını platformanın işləməsi üçün toplaya və emal edə bilər.

Bu məlumatlar hesabın yaradılması, email təsdiqi, elanların göstərilməsi, ödənişlərin idarə olunması, təhlükəsizlik, istifadəçi dəstəyi və qanuni tələblərin icrası üçün istifadə olunur.

Şəxsi məlumatlar üçüncü şəxslərə satılmır. Məlumatlar yalnız ödəniş, hosting, təhlükəsizlik, texniki xidmət və qanuni tələblərin icrası üçün zəruri hallarda paylaşılır.

İstifadəçi öz məlumatlarının yenilənməsini, silinməsini və ya emalın dayandırılmasını tələb edə bilər. Bəzi məlumatlar qanuni öhdəliklərə görə müəyyən müddət saxlanıla bilər.

İstifadəçi bu siyasəti qəbul etməklə şəxsi məlumatlarının MyCar tərəfindən emalına razılıq verir.
      `,
    },
    content: {
      title: "Kontent Qaydaları",
      content: `
İstifadəçi yalnız özünə məxsus və ya yerləşdirməyə hüququ olan avtomobil məlumatlarını paylaşmalıdır.

Platformada aşağıdakılar qadağandır:
- Saxta avtomobil məlumatı yerləşdirmək
- Başqasına məxsus avtomobil və ya şəkillərdən icazəsiz istifadə etmək
- Təhqir, nalayiq ifadə və ya qanunsuz məzmun paylaşmaq
- Yanlış əlaqə və ya avtomobil məlumatı yazmaq
- Platformadan dələduzluq və ya istifadəçiləri aldatmaq üçün istifadə etmək
- Üçüncü şəxslərin hüquqlarını pozan kontent yerləşdirmək

MyCar qaydaları pozan elanları xəbərdarlıq etmədən silə, gizlədə və ya istifadəçi hesabını məhdudlaşdıra bilər.

İstifadəçi paylaşdığı kontentin bütün hüquqi nəticələrinə görə özü məsuliyyət daşıyır.
      `,
    },
    electronic: {
      title: "Elektron Razılıq",
      content: `
İstifadəçi qeydiyyat zamanı checkbox-ları işarələməklə MyCar şərtlərini elektron formada qəbul etdiyini təsdiq edir.

Elektron razılıq istifadəçinin platformadan istifadə qaydalarını qəbul etdiyini göstərir.

MyCar istifadəçiyə email, sistem bildirişi və digər elektron vasitələrlə məlumat göndərə bilər.

İstifadəçi email təsdiq kodunu daxil etməklə hesabın ona məxsus olduğunu və qeydiyyatı tamamlamaq istədiyini təsdiq edir.

İstifadəçi elektron formada verdiyi razılığın hüquqi nəticələrini başa düşdüyünü qəbul edir.
      `,
    },
  };

  useEffect(() => {
    let timer;

    if (step === "verify" && countdown > 0) {
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

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFullName) {
      setError("Ad və soyad daxil edin");
      return;
    }

    if (!cleanEmail) {
      setError("Email daxil edin");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Düzgün email daxil edin");
      return;
    }

    if (!password.trim()) {
      setError("Şifrə daxil edin");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Şifrə minimum 8 simvol, 1 böyük hərf, 1 rəqəm və 1 xüsusi simvol içərməlidir"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifrələr uyğun deyil");
      return;
    }

    if (
      !acceptTerms ||
      !acceptPrivacy ||
      !acceptContentPolicy ||
      !acceptElectronic
    ) {
      setError("Qeydiyyat üçün bütün şərtləri qəbul etməlisiniz");
      return;
    }

    try {
      setLoading(true);

      const response = await apiFetch("/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: cleanFullName,
          email: cleanEmail,
          password,
          confirmPassword,
          acceptTerms,
          acceptPrivacy,
          acceptContentPolicy,
          acceptElectronic,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Qeydiyyat alınmadı"));
      }

      setEmail(cleanEmail);
      setSuccess("Email ünvanına təsdiq kodu göndərildi");
      setStep("verify");
      setCountdown(10);
    } catch (err) {
      setError(err.message || "Qeydiyyat zamanı xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanCode = verificationCode.trim();

    if (!cleanCode) {
      setError("Təsdiq kodunu daxil edin");
      return;
    }

    try {
      setVerifyLoading(true);

      const response = await apiFetch("/api/Auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: cleanCode,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Təsdiq kodu yanlışdır"));
      }

      setSuccess("Qeydiyyat uğurla tamamlandı");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Email təsdiqi uğursuz oldu");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || resendLoading) return;

    setError("");
    setSuccess("");

    try {
      setResendLoading(true);

      const response = await apiFetch("/api/Auth/resend-email-code", {
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

  const checkboxItems = [
    {
      key: "terms",
      checked: acceptTerms,
      setChecked: setAcceptTerms,
      label: "İstifadə şərtlərini qəbul edirəm",
    },
    {
      key: "privacy",
      checked: acceptPrivacy,
      setChecked: setAcceptPrivacy,
      label: "Məxfilik siyasətini qəbul edirəm",
    },
    {
      key: "content",
      checked: acceptContentPolicy,
      setChecked: setAcceptContentPolicy,
      label: "Kontent qaydalarını qəbul edirəm",
    },
    {
      key: "electronic",
      checked: acceptElectronic,
      setChecked: setAcceptElectronic,
      label: "Elektron razılığı qəbul edirəm",
    },
  ];

  return (
    <div
      className="min-h-[calc(100vh-160px)] bg-cover bg-center bg-no-repeat flex items-center justify-center px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-14 relative"
      style={{ backgroundImage: `url(${LexusBg})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div
        className={`relative z-10 w-full max-w-[380px] sm:max-w-[450px] md:max-w-[520px]
        rounded-3xl shadow-2xl p-5 sm:p-7 md:p-9 border backdrop-blur-xl
        animate-[fadeIn_.5s_ease]
        ${
          isDarkmodeEnabled
            ? "bg-white/10 border-white/20 text-white"
            : "bg-black/20 border-white/20 text-white"
        }`}
      >
        {step === "register" ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-center mb-2">
              Qeydiyyat
            </h1>

            <p className="text-center text-gray-300 mb-7 text-sm sm:text-base">
              MyCar platformasına qoşul
            </p>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-sm">Ad və Soyad</label>
                <input
                  type="text"
                  placeholder="Ad və soyad daxil edin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-[50px] px-4 rounded-2xl border bg-white/10 border-white/20 text-white placeholder-gray-300 outline-none focus:border-red-500 transition"
                />
              </div>

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

              <div>
                <label className="block mb-2 text-sm">Şifrə</label>
                <input
                  type="password"
                  placeholder="Şifrə daxil edin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[50px] px-4 rounded-2xl border bg-white/10 border-white/20 text-white placeholder-gray-300 outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Şifrə təkrarı</label>
                <input
                  type="password"
                  placeholder="Şifrəni təkrar daxil edin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[50px] px-4 rounded-2xl border bg-white/10 border-white/20 text-white placeholder-gray-300 outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="space-y-3 mt-1">
                {checkboxItems.map((item) => (
                  <div key={item.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.setChecked(e.target.checked)}
                      className="w-4 h-4 accent-red-500 cursor-pointer shrink-0"
                    />

                    <button
                      type="button"
                      onClick={() => setActivePolicy(item.key)}
                      className="text-left hover:text-red-400 hover:underline transition"
                    >
                      {item.label}
                    </button>
                  </div>
                ))}
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-green-400 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden w-full bg-red-500 hover:bg-red-600 text-white h-[52px] rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1 shadow-xl mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Qeydiyyatdan keç"
                )}

                {!loading && (
                  <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[150%]"></span>
                )}
              </button>
            </form>

            <p className="text-center mt-5 text-sm">
              Hesabın var?{" "}
              <Link to="/login" className="text-red-400 hover:underline">
                Daxil ol
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-black text-center mb-2">
              Email təsdiqi
            </h1>

            <p className="text-center text-gray-300 mb-7 text-sm sm:text-base leading-6">
              <span className="text-white font-semibold">{email}</span>{" "}
              ünvanına göndərilən təsdiq kodunu daxil edin
            </p>
            <p className="mt-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-center text-[13px] sm:text-sm leading-6 text-yellow-200">
              Əgər təsdiq kodu gəlməyibsə, zəhmət olmasa{" "}
              <span className="font-bold text-yellow-300">Spam</span> və ya{" "}
              <span className="font-bold text-yellow-300">Promotions</span> qutusunu yoxlayın.
              Kod bəzən ilk göndərişdə spam qutusuna düşə bilər.
            </p>
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-sm">Təsdiq kodu</label>
                <input
                  type="text"
                  placeholder="Kod"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full h-[55px] px-5 rounded-2xl border bg-white/10 border-white/20 text-white text-center text-2xl tracking-[10px] font-bold placeholder-gray-300 outline-none focus:border-red-500 transition"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-green-400 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={verifyLoading}
                className="group relative overflow-hidden w-full bg-red-500 hover:bg-red-600 text-white h-[52px] rounded-2xl font-bold transition-all duration-300 hover:-translate-y-1 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {verifyLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Təsdiqlə"
                )}

                {!verifyLoading && (
                  <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[150%]"></span>
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
                  ? `Yenidən göndər (${countdown}s)`
                  : "Kodu yenidən göndər"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("register");
                  setVerificationCode("");
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

      {activePolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setActivePolicy(null)}
          />

          <div className="relative w-full max-w-[680px] max-h-[82vh] overflow-hidden rounded-3xl bg-[#111111] border border-white/15 text-white shadow-2xl animate-[fadeIn_.25s_ease]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold">
                {policies[activePolicy].title}
              </h2>

              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500 transition flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh] text-sm leading-7 text-gray-300 whitespace-pre-line">
              {policies[activePolicy].content}
            </div>

            <div className="p-5 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="w-full h-[48px] rounded-2xl bg-red-500 hover:bg-red-600 transition font-bold"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;