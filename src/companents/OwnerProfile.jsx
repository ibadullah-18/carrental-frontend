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
          headers: {
            Accept: "*/*",
          },
        })

        if (!res.ok) {
          throw new Error("Profil məlumatları yüklənmədi")
        }

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
            ? "bg-[#070707] text-white"
            : "bg-[#f4f4f4] text-black"
        }`}
      >
        <div className="text-lg font-black animate-pulse">
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
            ? "bg-[#070707] text-white"
            : "bg-[#f4f4f4] text-black"
        }`}
      >
        <div
          className={`px-5 py-4 rounded-2xl font-bold ${
            isDarkmodeEnabled
              ? "bg-red-500/10 border border-red-500/25 text-red-300"
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
      className={`min-h-screen px-3 sm:px-6 py-6 ${
        isDarkmodeEnabled
          ? "bg-[#070707] text-[#f5f5f5]"
          : "bg-[#f4f4f4] text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`rounded-[28px] p-4 sm:p-7 shadow-2xl ${
            isDarkmodeEnabled
              ? "bg-[#121212] border border-white/10 shadow-black/50"
              : "bg-white border border-black/5 shadow-black/10"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <button
              onClick={() => setIsImageOpen(true)}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg shadow-yellow-500/20 shrink-0 mx-auto md:mx-0"
            >
              <img
                src={getImageUrl(profile.profileImageUrl)}
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            </button>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-4xl font-black capitalize">
                {profile.fullName}
              </h1>

              <div
                className={`mt-3 flex items-center justify-center md:justify-start gap-2 ${
                  isDarkmodeEnabled ? "text-white/65" : "text-gray-600"
                }`}
              >
                <FaMapMarkerAlt className="text-yellow-400" />
                <span>{profile.city || "Şəhər qeyd edilməyib"}</span>
              </div>

              {profile.bio && (
                <p
                  className={`mt-4 max-w-2xl leading-relaxed ${
                    isDarkmodeEnabled ? "text-white/65" : "text-gray-600"
                  }`}
                >
                  {profile.bio}
                </p>
              )}

              {socials.length > 0 && (
                <div className="mt-5 flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  {socials.map((item) => (
                    <a
                      key={item.label}
                      href={fixUrl(item.url)}
                      target="_blank"
                      rel="noreferrer"
                      title={item.label}
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 hover:bg-yellow-400 hover:text-black ${
                        isDarkmodeEnabled
                          ? "bg-[#1f1f1f] border border-white/10 text-white"
                          : "bg-gray-100 border border-black/10 text-black"
                      }`}
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-yellow-400 text-black rounded-2xl px-5 py-4 text-center min-w-[140px] shadow-lg shadow-yellow-500/20">
              <div className="flex items-center justify-center gap-2 text-lg font-black">
                <FaCarSide />
                {profile.cars?.length || 0}
              </div>
              <div className="text-sm font-semibold">Maşın</div>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <h2 className="text-xl sm:text-2xl font-black mb-4">
            Sahibin maşınları
          </h2>

          {profile.cars?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {profile.cars.map((car) => (
                <Link
                  to={`/details/${car.id}`}
                  key={car.id}
                  className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/80 ${
                    isDarkmodeEnabled
                      ? "bg-[#121212] border border-white/10"
                      : "bg-white border border-black/5 shadow-md shadow-black/5"
                  }`}
                >
                  <div
                    className={`relative aspect-[4/3] overflow-hidden ${
                      isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-gray-100"
                    }`}
                  >
                    <img
                      src={getImageUrl(car.mainImageUrl)}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {car.isVip && (
                      <span className="absolute top-2 left-2 bg-yellow-400 text-black text-[10px] sm:text-xs font-black px-2 py-1 rounded-full">
                        VIP
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="font-black text-sm sm:text-lg line-clamp-1">
                      {car.brand} {car.model}
                    </h3>

                    <div
                      className={`mt-2 text-xs sm:text-sm space-y-1 ${
                        isDarkmodeEnabled ? "text-white/60" : "text-gray-600"
                      }`}
                    >
                      <p className="line-clamp-1">Rəng: {car.color}</p>
                      <p className="line-clamp-1">Şəhər: {car.city}</p>
                    </div>

                    {car.description && (
                      <p
                        className={`mt-2 text-[11px] sm:text-sm line-clamp-2 ${
                          isDarkmodeEnabled ? "text-white/40" : "text-gray-500"
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
              className={`rounded-2xl p-8 text-center font-semibold ${
                isDarkmodeEnabled
                  ? "bg-[#121212] border border-white/10 text-white/60"
                  : "bg-white border border-black/5 text-gray-600"
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
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            onClick={() => setIsImageOpen(false)}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-3xl text-white"
          >
            <IoClose />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[260px] h-[260px] sm:w-[420px] sm:h-[420px] rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl shadow-yellow-500/30 bg-[#111]"
          >
            <img
              src={getImageUrl(profile.profileImageUrl)}
              alt={profile.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerProfile