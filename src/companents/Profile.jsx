import { useEffect, useMemo, useState } from "react"
import {
  Camera,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  Save,
} from "lucide-react"
import {
  FaGlobe,
  FaInstagram,
  FaTelegramPlane,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa"

import { useDarkmode } from "../stores/useDarkmode"
import { apiFetch } from "../utils/apiFetch"
import { getAccessToken, parseJwt } from "../utils/auth"
import { API_BASE_URL } from "../utils/config";

const BASE_URL = API_BASE_URL;

const Profile = () => {
  const { isDarkmodeEnabled } = useDarkmode()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [bio, setBio] = useState("")
  const [city, setCity] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [tikTokUrl, setTikTokUrl] = useState("")
  const [youTubeUrl, setYouTubeUrl] = useState("")
  const [telegramUrl, setTelegramUrl] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")

  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const [existingProfileImage, setExistingProfileImage] = useState("")

  const [newEmail, setNewEmail] = useState("")
  const [emailCode, setEmailCode] = useState("")
  const [resendCountdown, setResendCountdown] = useState(0)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const [forgotEmail, setForgotEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [resetNewPassword, setResetNewPassword] = useState("")
  const [resetConfirmPassword, setResetConfirmPassword] = useState("")

  const token = getAccessToken()

  const userId = useMemo(() => {
    const payload = parseJwt(token)
    return (
      payload?.nameid ||
      payload?.sub ||
      payload?.[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      ""
    )
  }, [token])

  const cleanBackendValue = (value) => {
    if (!value || value === "string") return ""
    return value
  }

  const getFullImageUrl = (url) => {
    if (!url || url === "string") return ""
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return `${BASE_URL}${url}`
  }

  const normalizeUrl = (value) => {
    const trimmed = value.trim()
    if (!trimmed) return ""
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed
    }
    return `https://${trimmed}`
  }

  const requestJson = async (url, body, loadingKey, successMessage) => {
    try {
      setActionLoading(loadingKey)
      setError("")
      setSuccess("")

      const response = await apiFetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.message || data?.Message || "Əməliyyat alınmadı")
      }

      setSuccess(successMessage)
      return true
    } catch (err) {
      setError(err.message || "Əməliyyat alınmadı")
      return false
    } finally {
      setActionLoading("")
    }
  }

  const shownImage =
    previewImage || getFullImageUrl(existingProfileImage) || "/default-avatar.png"

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError("")
        setSuccess("")

        if (!userId) {
          throw new Error("İstifadəçi ID tapılmadı")
        }

        const response = await apiFetch(`/api/Users/${userId}/public-profile`, {
          method: "GET",
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.Message ||
              "Profil məlumatları yüklənərkən xəta baş verdi"
          )
        }

        setFullName(cleanBackendValue(data?.fullName))
        setPhoneNumber(cleanBackendValue(data?.phoneNumber))
        setBio(cleanBackendValue(data?.bio))
        setCity(cleanBackendValue(data?.city))
        setInstagramUrl(cleanBackendValue(data?.instagramUrl))
        setTikTokUrl(cleanBackendValue(data?.tikTokUrl))
        setYouTubeUrl(cleanBackendValue(data?.youTubeUrl))
        setTelegramUrl(cleanBackendValue(data?.telegramUrl))
        setWebsiteUrl(cleanBackendValue(data?.websiteUrl))
        setExistingProfileImage(cleanBackendValue(data?.profileImageUrl))
      } catch (err) {
        setError(err.message || "Profil məlumatları yüklənərkən xəta baş verdi")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  useEffect(() => {
    if (!profileImage) {
      setPreviewImage("")
      return
    }

    const objectUrl = URL.createObjectURL(profileImage)
    setPreviewImage(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [profileImage])

  useEffect(() => {
    if (resendCountdown <= 0) return

    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [resendCountdown])

  const validateForm = () => {
    if (!fullName.trim()) return "Ad və soyad boş ola bilməz"
    if (fullName.trim().length < 3) return "Ad və soyad ən az 3 simvol olmalıdır"
    if (bio.length > 500) return "Bio maksimum 500 simvol ola bilər"

    const urls = [
      instagramUrl,
      tikTokUrl,
      youTubeUrl,
      telegramUrl,
      websiteUrl,
    ].filter((x) => x.trim())

    for (const item of urls) {
      try {
        new URL(normalizeUrl(item))
      } catch {
        return "Sosial linklərdən biri düzgün formatda deyil"
      }
    }

    return ""
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Yalnız şəkil faylı seçə bilərsiniz")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Şəkil maksimum 5MB ola bilər")
      return
    }

    setError("")
    setProfileImage(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const validationError = validateForm()
      if (validationError) throw new Error(validationError)

      const formData = new FormData()
      formData.append("FullName", fullName.trim())
      formData.append("PhoneNumber", phoneNumber.trim())
      formData.append("Bio", bio.trim())
      formData.append("City", city.trim())
      formData.append("InstagramUrl", normalizeUrl(instagramUrl))
      formData.append("TikTokUrl", normalizeUrl(tikTokUrl))
      formData.append("YouTubeUrl", normalizeUrl(youTubeUrl))
      formData.append("TelegramUrl", normalizeUrl(telegramUrl))
      formData.append("WebsiteUrl", normalizeUrl(websiteUrl))

      if (profileImage) {
        formData.append("ProfileImage", profileImage)
      }

      const response = await apiFetch("/api/Users/profile", {
        method: "PUT",
        body: formData,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.Message ||
            "Profil yenilənərkən xəta baş verdi"
        )
      }

      setSuccess("Profil uğurla yeniləndi")
      setProfileImage(null)

      if (data?.profileImageUrl) {
        setExistingProfileImage(data.profileImageUrl)
      }
    } catch (err) {
      setError(err.message || "Profil yenilənərkən xəta baş verdi")
    } finally {
      setSaving(false)
    }
  }

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim()) {
      setError("Yeni email daxil et")
      return
    }

    const ok = await requestJson(
      "/api/Auth/request-email-change",
      { newEmail: newEmail.trim() },
      "request-email",
      "Email dəyişmə kodu göndərildi"
    )

    if (ok) {
      setResendCountdown(10)
    }
  }

  const handleResendEmailCode = async () => {
    if (!newEmail.trim()) {
      setError("Email daxil et")
      return
    }

    const ok = await requestJson(
      "/api/Auth/resend-email-code",
      { email: newEmail.trim() },
      "resend-email",
      "Kod yenidən göndərildi"
    )

    if (ok) {
      setResendCountdown(10)
    }
  }

  const handleConfirmEmailChange = async () => {
    if (!newEmail.trim() || !emailCode.trim()) {
      setError("Yeni email və kod daxil edilməlidir")
      return
    }

    const ok = await requestJson(
      "/api/Auth/confirm-email-change",
      {
        newEmail: newEmail.trim(),
        code: emailCode.trim(),
      },
      "confirm-email",
      "Email uğurla dəyişdirildi"
    )

    if (ok) {
      setNewEmail("")
      setEmailCode("")
      setResendCountdown(0)
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setError("Şifrə xanalarını tam doldur")
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError("Yeni şifrə və təkrar şifrə eyni deyil")
      return
    }

    const ok = await requestJson(
      "/api/Auth/change-password",
      {
        oldPassword,
        newPassword,
        confirmNewPassword,
      },
      "change-password",
      "Şifrə uğurla yeniləndi"
    )

    if (ok) {
      setOldPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      setError("Email daxil et")
      return
    }

    await requestJson(
      "/api/Auth/forgot-password",
      { email: forgotEmail.trim() },
      "forgot-password",
      "Şifrə sıfırlama kodu emailə göndərildi"
    )
  }

  const handleResetPassword = async () => {
    if (
      !forgotEmail.trim() ||
      !resetCode.trim() ||
      !resetNewPassword ||
      !resetConfirmPassword
    ) {
      setError("Reset üçün email, kod və yeni şifrə xanalarını doldur")
      return
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setError("Yeni şifrə və təkrar şifrə eyni deyil")
      return
    }

    const ok = await requestJson(
      "/api/Auth/reset-password",
      {
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        newPassword: resetNewPassword,
        confirmNewPassword: resetConfirmPassword,
      },
      "reset-password",
      "Şifrə uğurla sıfırlandı"
    )

    if (ok) {
      setForgotEmail("")
      setResetCode("")
      setResetNewPassword("")
      setResetConfirmPassword("")
    }
  }

  const pageClass = isDarkmodeEnabled
    ? "min-h-screen bg-[#050505] text-white"
    : "min-h-screen bg-[#f8f8f8] text-zinc-950"

  const cardClass = isDarkmodeEnabled
    ? "border-white/10 bg-zinc-950/80 shadow-2xl shadow-black/40"
    : "border-zinc-200 bg-white shadow-2xl shadow-zinc-200/70"

  const inputClass = isDarkmodeEnabled
    ? "border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-500 focus:border-yellow-400 focus:bg-white/[0.07]"
    : "border-zinc-200 bg-zinc-50 text-zinc-950 placeholder:text-zinc-400 focus:border-yellow-500 focus:bg-white"

  const mutedText = isDarkmodeEnabled ? "text-zinc-400" : "text-zinc-500"
  const labelClass = isDarkmodeEnabled ? "text-zinc-300" : "text-zinc-700"

  if (loading) {
    return (
      <div className={`${pageClass} flex items-center justify-center px-4`}>
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400/10">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold">Profil yüklənir...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className={`${pageClass} px-4 py-6 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-6xl">
        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm font-medium text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`grid gap-5 rounded-[1.7rem] border p-4 sm:p-5 lg:grid-cols-[330px_1fr] ${cardClass}`}
        >
          <aside className="rounded-[1.4rem] border border-yellow-400/20 bg-yellow-400/[0.04] p-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-40 w-40 overflow-hidden rounded-[1.5rem] border-4 border-yellow-400 bg-zinc-900 shadow-2xl">
                  <img
                    src={shownImage}
                    alt="Profil şəkli"
                    className="h-full w-full object-cover"
                  />
                </div>

                <label className="absolute -bottom-3 -right-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-yellow-400 text-black shadow-lg transition hover:scale-105">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <h2 className="mt-6 text-2xl font-black">
                {fullName || "Ad Soyad"}
              </h2>

              <div className={`mt-2 flex items-center gap-2 text-sm ${mutedText}`}>
                <MapPin className="h-4 w-4 text-yellow-500" />
                {city || "Şəhər əlavə edilməyib"}
              </div>

              <p className={`mt-3 max-w-xs text-sm leading-6 ${mutedText}`}>
                {bio || "Özün haqqında qısa bio əlavə et."}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <FaInstagram className="h-5 w-5 text-yellow-500" />
                <FaTiktok className="h-5 w-5 text-yellow-500" />
                <FaYoutube className="h-5 w-5 text-yellow-500" />
                <FaTelegramPlane className="h-5 w-5 text-yellow-500" />
                <FaGlobe className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </aside>

          <section className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={`mb-2 block text-sm font-bold ${labelClass}`}>
                  Ad və soyad
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Məsələn: İbadulla Hüseynzadə"
                />
              </div>

              <div>
                <label className={`mb-2 block text-sm font-bold ${labelClass}`}>
                  Telefon nömrəsi
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-500" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full rounded-2xl border py-3 pl-12 pr-4 outline-none transition ${inputClass}`}
                    placeholder="+994 XX XXX XX XX"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={`mb-2 block text-sm font-bold ${labelClass}`}>
                  Şəhər
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-500" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full rounded-2xl border py-3 pl-12 pr-4 outline-none transition ${inputClass}`}
                    placeholder="Baku"
                  />
                </div>
              </div>

              <div>
                <label className={`mb-2 block text-sm font-bold ${labelClass}`}>
                  Website
                </label>
                <div className="relative">
                  <FaGlobe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-500" />
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className={`w-full rounded-2xl border py-3 pl-12 pr-4 outline-none transition ${inputClass}`}
                    placeholder="example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className={`block text-sm font-bold ${labelClass}`}>
                  Bio
                </label>
                <span className={`text-xs ${mutedText}`}>{bio.length}/500</span>
              </div>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                className={`w-full resize-none rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                placeholder="Özün və avtomobil zövqün haqqında qısa məlumat yaz..."
              />
            </div>

            <div className="rounded-[1.4rem] border border-yellow-400/20 p-4">
              <h3 className="text-lg font-black">Sosial linklər</h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <FaInstagram className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-500" />
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className={`w-full rounded-2xl border py-3 pl-12 pr-4 outline-none transition ${inputClass}`}
                    placeholder="instagram.com/username"
                  />
                </div>

                <div className="relative">
                  <FaTiktok className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-500" />
                  <input
                    type="text"
                    value={tikTokUrl}
                    onChange={(e) => setTikTokUrl(e.target.value)}
                    className={`w-full rounded-2xl border py-3 pl-12 pr-4 outline-none transition ${inputClass}`}
                    placeholder="tiktok.com/@username"
                  />
                </div>

                <div className="relative">
                  <FaYoutube className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-500" />
                  <input
                    type="text"
                    value={youTubeUrl}
                    onChange={(e) => setYouTubeUrl(e.target.value)}
                    className={`w-full rounded-2xl border py-3 pl-12 pr-4 outline-none transition ${inputClass}`}
                    placeholder="youtube.com/@channel"
                  />
                </div>

                <div className="relative">
                  <FaTelegramPlane className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-yellow-500" />
                  <input
                    type="text"
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    className={`w-full rounded-2xl border py-3 pl-12 pr-4 outline-none transition ${inputClass}`}
                    placeholder="t.me/username"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-yellow-400/20 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-7 py-3 font-black text-black shadow-lg shadow-yellow-400/20 transition hover:-translate-y-0.5 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Yadda saxlanılır...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Profili saxla
                  </>
                )}
              </button>
            </div>
          </section>
        </form>

        <div className={`mt-5 rounded-[1.7rem] border p-4 sm:p-5 ${cardClass}`}>
          <h2 className="text-xl font-black">Email və şifrə ayarları</h2>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="rounded-[1.4rem] border border-yellow-400/20 p-4">
              <h3 className="font-black">Email dəyiş</h3>

              <div className="mt-4 grid gap-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Yeni email"
                />

                <input
                  type="text"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Təsdiq kodu"
                />

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleRequestEmailChange}
                    disabled={actionLoading === "request-email"}
                    className="rounded-2xl border border-yellow-400/40 px-3 py-3 text-xs font-black text-yellow-500 transition hover:bg-yellow-400 hover:text-black disabled:opacity-60"
                  >
                    {actionLoading === "request-email" ? "..." : "Kod al"}
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmEmailChange}
                    disabled={actionLoading === "confirm-email"}
                    className="rounded-2xl bg-yellow-400 px-3 py-3 text-xs font-black text-black transition hover:bg-yellow-300 disabled:opacity-60"
                  >
                    {actionLoading === "confirm-email" ? "..." : "Təsdiqlə"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-yellow-400/20 p-4">
              <h3 className="font-black">Şifrəni dəyiş</h3>

              <div className="mt-4 grid gap-3">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Köhnə şifrə"
                />

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Yeni şifrə"
                />

                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Yeni şifrə təkrar"
                />

                <button
                  type="button"
                  onClick={handleChangePassword}
                  disabled={actionLoading === "change-password"}
                  className="rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300 disabled:opacity-60"
                >
                  {actionLoading === "change-password"
                    ? "Yenilənir..."
                    : "Şifrəni yenilə"}
                </button>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-yellow-400/20 p-4">
              <h3 className="font-black">Şifrəni sıfırla</h3>

              <div className="mt-4 grid gap-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Email"
                />

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={actionLoading === "forgot-password"}
                  className="rounded-2xl border border-yellow-400/40 px-4 py-3 text-sm font-black text-yellow-500 transition hover:bg-yellow-400 hover:text-black disabled:opacity-60"
                >
                  {actionLoading === "forgot-password"
                    ? "Göndərilir..."
                    : "Kod göndər"}
                </button>

                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Reset kodu"
                />

                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Yeni şifrə"
                />

                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${inputClass}`}
                  placeholder="Yeni şifrə təkrar"
                />

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={actionLoading === "reset-password"}
                  className="rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300 disabled:opacity-60"
                >
                  {actionLoading === "reset-password"
                    ? "Sıfırlanır..."
                    : "Şifrəni sıfırla"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile