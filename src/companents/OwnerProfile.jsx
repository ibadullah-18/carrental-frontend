import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import { apiFetch, getFileUrl } from "../utils/apiFetch"
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaTelegramPlane,
  FaGlobe,
  FaMapMarkerAlt,
  FaCarSide,
} from "react-icons/fa"
import { IoClose } from "react-icons/io5"

const OwnerProfile = () => {
  const { userId } = useParams()
  const { isDarkmodeEnabled } = useDarkmode()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isImageOpen, setIsImageOpen] = useState(false)

  const getImageUrl = (url) => getFileUrl(url, "/default-user.png")

  const fixUrl = (url) => {
    if (!url) return ""
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return `https://${url}`
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await apiFetch(`/api/Users/${userId}/public-profile`, {
          method: "GET",
          headers: { Accept: "*/*" },
        })

        if (!res.ok) throw new Error("Profil məlumatları yüklənmədi")

        const data = await res.json()
        setProfile(data)
      } catch (err) {
        setError(err.message || "Xəta baş verdi")
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkmodeEnabled
            ? "bg-[#080808] text-white"
            : "bg-[#f7f5ef] text-black"
        }`}
      >
        <div className="px-5 py-3 rounded-full text-sm font-bold animate-pulse bg-yellow-400/15 text-yellow-500 border border-yellow-400/25">
          Profil yüklənir...
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${
          isDarkmodeEnabled
            ? "bg-[#080808] text-white"
            : "bg-[#f7f5ef] text-black"
        }`}
      >
        <div
          className={`px-5 py-4 rounded-3xl text-sm font-bold ${
            isDarkmodeEnabled
              ? "bg-red-500/10 border border-red-500/20 text-red-300"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}
        >
          {error || "Profil tapılmadı"}
        </div>
      </div>
    )
  }

  const socials = [
    { url: profile.instagramUrl, icon: <FaInstagram />, label: "Instagram" },
    { url: profile.tikTokUrl, icon: <FaTiktok />, label: "TikTok" },
    { url: profile.youTubeUrl, icon: <FaYoutube />, label: "YouTube" },
    { url: profile.telegramUrl, icon: <FaTelegramPlane />, label: "Telegram" },
    { url: profile.websiteUrl, icon: <FaGlobe />, label: "Website" },
  ].filter((item) => item.url && item.url !== "string")

  return (
    <div
      className={`min-h-screen px-3 sm:px-6 py-5 sm:py-8 overflow-hidden ${
        isDarkmodeEnabled
          ? "bg-[#080808] text-[#f6f6f6]"
          : "bg-[#f7f5ef] text-[#171717]"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div
          className={`relative overflow-hidden rounded-[26px] sm:rounded-[34px] p-4 sm:p-7 transition-all duration-500 animate-[fadeUp_.45s_ease-out] ${
            isDarkmodeEnabled
              ? "bg-[#121212]/90 border border-white/10 shadow-2xl shadow-black/40"
              : "bg-white/85 border border-white shadow-xl shadow-black/5"
          }`}
        >
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-yellow-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 w-52 h-52 rounded-full bg-yellow-300/10 blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <button
              onClick={() => setIsImageOpen(true)}
              className="group w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-2 ring-yellow-400/70 ring-offset-4 ring-offset-transparent shadow-lg shadow-yellow-500/10 shrink-0 mx-auto sm:mx-0 transition-all duration-500 hover:scale-105"
            >
              <img
                src={getImageUrl(profile.profileImageUrl)}
                alt={profile.fullName}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </button>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-[22px] sm:text-4xl font-black capitalize tracking-tight leading-tight">
                  {profile.fullName}
                </h1>

                <div
                  className={`mx-auto sm:mx-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
                    isDarkmodeEnabled
                      ? "bg-yellow-400/12 text-yellow-300 border border-yellow-400/20"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  <FaCarSide className="text-[12px]" />
                  {profile.cars?.length || 0} maşın
                </div>
              </div>

              <div
                className={`mt-2 flex items-center justify-center sm:justify-start gap-2 text-sm ${
                  isDarkmodeEnabled ? "text-white/60" : "text-gray-500"
                }`}
              >
                <FaMapMarkerAlt className="text-yellow-400 text-sm" />
                <span>{profile.city || "Şəhər qeyd edilməyib"}</span>
              </div>

              {profile.bio && (
                <p
                  className={`mt-3 max-w-2xl text-sm sm:text-[15px] leading-relaxed ${
                    isDarkmodeEnabled ? "text-white/58" : "text-gray-600"
                  }`}
                >
                  {profile.bio}
                </p>
              )}

              {socials.length > 0 && (
                <div className="mt-4 flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  {socials.map((item) => (
                    <a
                      key={item.label}
                      href={fixUrl(item.url)}
                      target="_blank"
                      rel="noreferrer"
                      title={item.label}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-400 hover:text-black hover:shadow-lg hover:shadow-yellow-400/25 ${
                        isDarkmodeEnabled
                          ? "bg-white/5 border border-white/10 text-white/85"
                          : "bg-black/[0.03] border border-black/5 text-black/80"
                      }`}
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-7 sm:mt-9 animate-[fadeUp_.6s_ease-out]">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-yellow-500 text-xs font-black tracking-[0.2em] uppercase">
                Garage
              </p>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Sahibin maşınları
              </h2>
            </div>
          </div>

          {profile.cars?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {profile.cars.map((car, index) => (
                <Link
                  to={`/details/${car.id}`}
                  key={car.id}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className={`group rounded-[20px] sm:rounded-[26px] overflow-hidden transition-all duration-500 hover:-translate-y-1.5 animate-[fadeUp_.5s_ease-out_both] ${
                    isDarkmodeEnabled
                      ? "bg-[#121212]/90 border border-white/10 hover:border-yellow-400/35 hover:shadow-2xl hover:shadow-black/40"
                      : "bg-white/90 border border-white hover:border-yellow-300/80 shadow-md shadow-black/[0.04] hover:shadow-xl hover:shadow-black/10"
                  }`}
                >
                  <div
                    className={`relative aspect-[4/3] overflow-hidden ${
                      isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#eee9df]"
                    }`}
                  >
                    <img
                      src={getImageUrl(car.mainImageUrl)}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-70" />

                    {car.isVip && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-black text-[9px] sm:text-[11px] font-black px-2 py-1 rounded-full shadow-md shadow-yellow-400/20">
                        VIP
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="font-black text-[13px] sm:text-lg line-clamp-1 tracking-tight">
                      {car.brand} {car.model}
                    </h3>

                    <div
                      className={`mt-1.5 text-[11px] sm:text-sm space-y-0.5 ${
                        isDarkmodeEnabled ? "text-white/55" : "text-gray-500"
                      }`}
                    >
                      <p className="line-clamp-1">Rəng: {car.color || "-"}</p>
                      <p className="line-clamp-1">Şəhər: {car.city || "-"}</p>
                    </div>

                    {car.description && (
                      <p
                        className={`mt-2 text-[10.5px] sm:text-[13px] leading-relaxed line-clamp-2 ${
                          isDarkmodeEnabled ? "text-white/35" : "text-gray-400"
                        }`}
                      >
                        {car.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className={`rounded-[26px] p-8 text-center text-sm font-semibold ${
                isDarkmodeEnabled
                  ? "bg-[#121212] border border-white/10 text-white/55"
                  : "bg-white border border-white text-gray-500 shadow-md shadow-black/5"
              }`}
            >
              Bu istifadəçinin hələ maşını yoxdur.
            </div>
          )}
        </div>
      </div>

      {isImageOpen && (
  <div
    onClick={() => setIsImageOpen(false)}
    className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-[fadeIn_.25s_ease-out]"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100vw",
      height: "100dvh",
    }}
  >
    <button
      onClick={() => setIsImageOpen(false)}
      className="fixed top-4 right-4 z-[100000] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-2xl text-white transition-all duration-300 hover:rotate-90"
    >
      <IoClose />
    </button>

    <div
      onClick={(e) => e.stopPropagation()}
      className="relative z-[100000] w-[240px] h-[240px] sm:w-[420px] sm:h-[420px] rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl shadow-yellow-500/25 bg-[#111] animate-[zoomIn_.3s_ease-out]"
    >
      <img
        src={getImageUrl(profile.profileImageUrl)}
        alt={profile.fullName}
        className="w-full h-full object-cover"
      />
    </div>
  </div>
)}

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default OwnerProfile