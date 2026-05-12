import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useParams } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import { apiFetch } from "../utils/apiFetch"
import defaultImage from "../assets/download.png"

const API_BASE_URL = "https://localhost:52247"

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path
      d="M2.5 12S5.8 5.5 12 5.5 21.5 12 21.5 12 18.2 18.5 12 18.5 2.5 12 2.5 12Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path
      d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path
      d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
)

const PaintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path
      d="M12 3C7 3 3 6.6 3 11c0 3.3 2.5 6 5.8 6H10a1.5 1.5 0 0 1 1.5 1.5A2.5 2.5 0 0 0 14 21c4 0 7-4 7-9 0-5-4-9-9-9Z"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M7.5 10h.01M10 7.5h.01M14 7.5h.01M16.5 10h.01"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

const InfoCard = ({ icon, label, value, dark }) => (
  <div
    className={`group rounded-3xl p-4 border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
      dark
        ? "bg-[#181818] border-white/10 hover:bg-[#202020]"
        : "bg-white border-black/10 hover:bg-[#fafafa]"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-yellow-400 text-black flex items-center justify-center shadow-md">
        {icon}
      </div>

      <div>
        <p className="text-xs opacity-60">{label}</p>
        <p className="font-black text-base mt-0.5">{value ?? "-"}</p>
      </div>
    </div>
  </div>
)

const PlateBox = ({ plateNumber, dark }) => (
  <div
    className={`rounded-3xl overflow-hidden border shadow-lg ${
      dark ? "bg-[#181818] border-white/10" : "bg-white border-black/10"
    }`}
  >
    <div className="flex items-stretch h-16">
      <div className="w-14 bg-[#1f5eff] text-white flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold leading-none">AZ</span>
        <span className="text-lg leading-none">🇦🇿</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <p className="text-2xl sm:text-3xl font-black tracking-[3px]">
          {plateNumber || "--"}
        </p>
      </div>
    </div>
  </div>
)

const Details = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDarkmodeEnabled } = useDarkmode()

  const [car, setCar] = useState(null)
  const [owner, setOwner] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ownerLoading, setOwnerLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const makeUrl = (path) => {
    if (!path) return null
    if (path.startsWith("http")) return path
    return `${API_BASE_URL}${path}`
  }

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await apiFetch(`/api/Cars/${id}`)

        if (!res.ok) {
          throw new Error("Maşın tapılmadı")
        }

        const data = await res.json()
        setCar(data)
        setActiveIndex(0)
      } catch (err) {
        setError(err.message || "Xəta baş verdi")
      } finally {
        setLoading(false)
      }
    }

    fetchCar()
  }, [id])

  useEffect(() => {
    const fetchOwner = async () => {
      if (!car?.userId) return

      try {
        setOwnerLoading(true)

        const res = await apiFetch(`/api/Users/${car.userId}/public-profile`)

        if (!res.ok) {
          setOwner(null)
          return
        }

        const data = await res.json()
        setOwner(data)
      } catch {
        setOwner(null)
      } finally {
        setOwnerLoading(false)
      }
    }

    fetchOwner()
  }, [car])

  useEffect(() => {
    if (!modalOpen) return

    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const closeOnEscape = (e) => {
      if (e.key === "Escape") setModalOpen(false)
    }

    window.addEventListener("keydown", closeOnEscape)

    return () => {
      document.body.style.overflow = oldOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [modalOpen])

  const media = useMemo(() => {
    const items = Array.isArray(car?.media) ? car.media : []

    const mapped = items
      .map((item) => ({
        id: item.id,
        type: item.mediaType === 2 ? "video" : "image",
        url: makeUrl(item.fileUrl),
        thumbnail: makeUrl(item.thumbnailUrl) || makeUrl(item.fileUrl),
        isMain: item.isMain,
        displayOrder: item.displayOrder || 0,
      }))
      .filter((item) => item.url)

    const sorted = mapped.sort((a, b) => {
      if (a.isMain && !b.isMain) return -1
      if (!a.isMain && b.isMain) return 1
      return a.displayOrder - b.displayOrder
    })

    return sorted.length
      ? sorted
      : [{ type: "image", url: defaultImage, thumbnail: defaultImage }]
  }, [car])

  const activeMedia = media[activeIndex] || media[0]

  const nextMedia = () => {
    setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))
  }

  const prevMedia = () => {
    setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))
  }

  const ownerName =
    owner?.fullName ||
    owner?.name ||
    owner?.userName ||
    car?.ownerName ||
    "İstifadəçi"

  const ownerImage =
    makeUrl(owner?.profileImageUrl) || makeUrl(owner?.imageUrl) || defaultImage

  const goOwnerProfile = () => {
    if (!car?.userId) return
    navigate(`/owner-profile/${car.userId}`)
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkmodeEnabled ? "bg-[#0d0d0d] text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-xl font-semibold animate-pulse">Yüklənir...</div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${
          isDarkmodeEnabled ? "bg-[#0d0d0d] text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-red-500 text-xl text-center">
          {error || "Məlumat tapılmadı"}
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className={`min-h-screen py-5 px-4 sm:px-5 lg:px-6 ${
          isDarkmodeEnabled
            ? "bg-[#0d0d0d] text-white"
            : "bg-[#f4f4f4] text-black"
        }`}
      >
        <div className="max-w-[1250px] mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-[1.18fr_0.82fr] gap-5">
            <div
              className={`rounded-[34px] p-4 border shadow-xl ${
                isDarkmodeEnabled
                  ? "bg-[#111] border-white/10"
                  : "bg-white border-black/10"
              }`}
            >
              <div className="relative h-[230px] sm:h-[330px] lg:h-[430px] rounded-[28px] overflow-hidden bg-black group">
                {activeMedia?.type === "video" ? (
                  <video
                    src={activeMedia.url}
                    controls
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setModalOpen(true)}
                  />
                ) : (
                  <img
                    src={activeMedia.url}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover cursor-zoom-in transition duration-700 group-hover:scale-105"
                    onClick={() => setModalOpen(true)}
                    draggable={false}
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex flex-wrap items-center gap-2">
                    {car.isVip && (
                      <span className="px-3 py-1.5 rounded-full bg-yellow-400 text-black text-xs font-black">
                        VIP elan
                      </span>
                    )}

                    {activeMedia?.type === "video" && (
                      <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur">
                        Video
                      </span>
                    )}
                  </div>
                </div>

                {media.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/55 text-white text-3xl hover:bg-black transition"
                    >
                      ‹
                    </button>

                    <button
                      onClick={nextMedia}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/55 text-white text-3xl hover:bg-black transition"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-3 overflow-x-auto pb-2 px-1">
                {media.map((item, index) => {
                  const isSelected = activeIndex === index

                  return (
                    <button
                      key={item.id || index}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`
                        relative w-24 h-16 rounded-2xl flex-shrink-0 p-[2px]
                        transition-all duration-300
                        ${
                          isSelected
                            ? "bg-yellow-400 opacity-100 scale-105"
                            : "bg-transparent opacity-65 hover:opacity-100 hover:scale-[1.02]"
                        }
                      `}
                    >
                      <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-black">
                        {item.type === "video" ? (
                          <>
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              muted
                            />

                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-black text-sm shadow-lg">
                                ▶
                              </div>
                            </div>
                          </>
                        ) : (
                          <img
                            src={item.thumbnail}
                            alt="car media"
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              className={`rounded-[34px] p-5 sm:p-6 border shadow-xl relative overflow-hidden ${
                isDarkmodeEnabled
                  ? "bg-[#111] border-white/10"
                  : "bg-white border-black/10"
              }`}
            >
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-yellow-400/20 rounded-full blur-3xl" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="uppercase tracking-[4px] text-yellow-500 font-black text-xs">
                      Premium Details
                    </p>

                    <h1 className="mt-2 text-3xl sm:text-4xl font-black leading-tight">
                      {car.brand} {car.model}
                    </h1>

                    <p
                      className={`mt-2 text-base ${
                        isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {car.year} • {car.city} • {car.color}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-yellow-400 text-black font-black shadow-md">
                    <EyeIcon />
                    <span>{car.viewCount ?? 0}</span>
                  </div>
                </div>

                <div className="mt-5">
                  <PlateBox
                    plateNumber={car.plateNumber}
                    dark={isDarkmodeEnabled}
                  />
                </div>

                <button
                  onClick={goOwnerProfile}
                  className={`mt-5 w-full flex items-center gap-4 rounded-3xl p-3 border text-left transition duration-300 hover:-translate-y-1 ${
                    isDarkmodeEnabled
                      ? "bg-[#1b1b1b] border-white/10 hover:bg-[#222]"
                      : "bg-[#fafafa] border-black/10 hover:bg-[#f0f0f0]"
                  }`}
                >
                  <img
                    src={ownerImage}
                    alt={ownerName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400"
                  />

                  <div className="flex-1">
                    <p className="text-xs opacity-60">Elanın sahibi</p>
                    <p className="font-black">
                      {ownerLoading ? "Yüklənir..." : ownerName}
                    </p>
                  </div>

                  <span className="text-2xl opacity-50">›</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  <InfoCard
                    icon={<CalendarIcon />}
                    label="Buraxılış ili"
                    value={car.year}
                    dark={isDarkmodeEnabled}
                  />

                  <InfoCard
                    icon={<PaintIcon />}
                    label="Rəng"
                    value={car.color}
                    dark={isDarkmodeEnabled}
                  />

                  <InfoCard
                    icon={<LocationIcon />}
                    label="Şəhər"
                    value={car.city}
                    dark={isDarkmodeEnabled}
                  />

                  <InfoCard
                    icon={<EyeIcon />}
                    label="Baxış sayı"
                    value={car.viewCount ?? 0}
                    dark={isDarkmodeEnabled}
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`mt-5 rounded-[34px] p-5 sm:p-6 border shadow-xl ${
              isDarkmodeEnabled
                ? "bg-[#111] border-white/10"
                : "bg-white border-black/10"
            }`}
          >
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-black">Açıqlama</h2>

              <span className="px-4 py-2 rounded-full text-xs font-black bg-yellow-400 text-black">
                {media.length} media
              </span>
            </div>

            <p
              className={`leading-7 text-sm sm:text-base ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {car.description || "Bu maşın üçün açıqlama əlavə edilməyib."}
            </p>
          </div>
        </div>
      </div>

      {modalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center overflow-hidden">
            <button
              onClick={() => setModalOpen(false)}
              className="fixed top-4 right-5 z-[1000000] text-white text-5xl hover:scale-110 transition"
            >
              ×
            </button>

            {media.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="fixed left-5 top-1/2 -translate-y-1/2 z-[1000000] text-white text-7xl hover:scale-110 transition"
                >
                  ‹
                </button>

                <button
                  onClick={nextMedia}
                  className="fixed right-5 top-1/2 -translate-y-1/2 z-[1000000] text-white text-7xl hover:scale-110 transition"
                >
                  ›
                </button>
              </>
            )}

            <div className="fixed inset-0 flex items-center justify-center p-6">
              {activeMedia?.type === "video" ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="max-w-[96vw] max-h-[92vh] object-contain"
                />
              ) : (
                <img
                  src={activeMedia.url}
                  alt="preview"
                  className="max-w-[96vw] max-h-[92vh] object-contain"
                  draggable={false}
                />
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default Details