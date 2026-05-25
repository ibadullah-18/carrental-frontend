import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate, useParams } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import { apiFetch } from "../utils/apiFetch"
import defaultImage from "../assets/download.png"

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

const ReportIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path
      d="M12 9v4M12 17h.01M10.3 4.6 2.9 17.4A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.6L13.7 4.6a2 2 0 0 0-3.4 0Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const InfoCard = ({ icon, label, value, dark }) => (
  <div
    className={`group rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
      dark
        ? "bg-[#181818] border-white/10 hover:bg-[#202020]"
        : "bg-white border-black/10 hover:bg-[#fafafa]"
    }`}
  >
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-yellow-400 text-black flex items-center justify-center shadow-md flex-shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs opacity-60 leading-none">
          {label}
        </p>

        <p className="font-black text-sm sm:text-base mt-1 truncate">
          {value ?? "-"}
        </p>
      </div>
    </div>
  </div>
)

const PlateBox = ({ plateNumber, dark }) => (
  <div
    className={`rounded-2xl overflow-hidden border shadow-lg ${
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

const reasonOptions = [
  { value: 1, label: "Yanlış məlumat" },
  { value: 2, label: "Saxta elan" },
  { value: 3, label: "Uyğunsuz məzmun" },
  { value: 4, label: "Dələduzluq şübhəsi" },
  { value: 5, label: "Digər" },
]

const getReasonLabel = (value) => {
  const found = reasonOptions.find((item) => Number(item.value) === Number(value))
  return found?.label || `Səbəb #${value || "-"}`
}

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.$values)) return data.$values
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.result)) return data.result
  if (Array.isArray(data?.reports)) return data.reports
  return []
}

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
  const [touchStartX, setTouchStartX] = useState(null)

  const [reasonType, setReasonType] = useState(1)
  const [reportDescription, setReportDescription] = useState("")
  const [reportLoading, setReportLoading] = useState(false)
  const [reportMessage, setReportMessage] = useState("")
  const [reportError, setReportError] = useState("")

  const [myReportsOpen, setMyReportsOpen] = useState(false)
  const [myReports, setMyReports] = useState([])
  const [myReportsLoading, setMyReportsLoading] = useState(false)
  const [myReportsError, setMyReportsError] = useState("")

  const makeUrl = (path) => {
    if (!path) return ""
    return path.startsWith("http") ? path : `https://showcarhub.com${path}`
  }

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await apiFetch(`/api/Cars/${id}`)

        if (!res.ok) throw new Error("Maşın tapılmadı")

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
    const items = normalizeArray(
      car?.media ||
        car?.medias ||
        car?.carMedia ||
        car?.carMedias ||
        car?.images ||
        car?.videos
    )

    const mapped = items
      .map((item) => {
        const mediaType = Number(item.mediaType ?? item.type)

        const fileUrl = makeUrl(
          item.fileUrl ||
            item.url ||
            item.imageUrl ||
            item.videoUrl ||
            item.path
        )

        const thumbnailUrl = makeUrl(
          item.thumbnailUrl || item.thumbUrl || item.previewUrl
        )

        return {
          id: item.id,
          type: mediaType === 2 ? "video" : "image",
          url: fileUrl,
          thumbnail: thumbnailUrl || fileUrl,
          isMain: Boolean(item.isMain),
          displayOrder: Number(item.displayOrder ?? 0),
        }
      })
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

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return

    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX - touchEndX

    if (Math.abs(diff) > 45) {
      if (diff > 0) nextMedia()
      else prevMedia()
    }

    setTouchStartX(null)
  }

  const fetchMyReports = async () => {
    try {
      setMyReportsLoading(true)
      setMyReportsError("")

      const res = await apiFetch("/api/Reports/my-reports")
      const text = await res.text()
      const data = text ? JSON.parse(text) : null

      if (!res.ok) {
        throw new Error(data?.message || "Reportlar yüklənmədi")
      }

      setMyReports(normalizeArray(data))
    } catch (err) {
      setMyReportsError(err.message || "Reportlar yüklənərkən xəta baş verdi")
    } finally {
      setMyReportsLoading(false)
    }
  }

  const toggleMyReports = async () => {
    const next = !myReportsOpen
    setMyReportsOpen(next)

    if (next) await fetchMyReports()
  }

  const submitReport = async (e) => {
    e.preventDefault()

    if (!reportDescription.trim()) {
      setReportError("Zəhmət olmasa açıqlama yaz")
      setReportMessage("")
      return
    }

    try {
      setReportLoading(true)
      setReportError("")
      setReportMessage("")

      const res = await apiFetch("/api/Reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId: car?.id || id,
          reasonType: Number(reasonType),
          description: reportDescription.trim(),
        }),
      })

      if (!res.ok) throw new Error("Report göndərilmədi")

      setReportDescription("")
      setReasonType(1)
      setReportMessage("Report uğurla göndərildi")

      if (myReportsOpen) await fetchMyReports()
    } catch (err) {
      setReportError(err.message || "Report göndərilərkən xəta baş verdi")
    } finally {
      setReportLoading(false)
    }
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
              className={`rounded-[18px] p-4 border shadow-xl ${
                isDarkmodeEnabled
                  ? "bg-[#111] border-white/10"
                  : "bg-white border-black/10"
              }`}
            >
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative h-[230px] sm:h-[330px] lg:h-[430px] rounded-[16px] overflow-hidden bg-black group"
              >
                {activeMedia?.type === "video" ? (
                  <div
                    onClick={() => setModalOpen(true)}
                    className="relative w-full h-full cursor-zoom-in"
                  >
                    <video
                      src={activeMedia.url}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover pointer-events-none"
                    />

                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 text-black flex items-center justify-center text-2xl sm:text-3xl shadow-xl">
                        ▶
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={activeMedia.url}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover cursor-zoom-in transition duration-700 group-hover:scale-105"
                    onClick={() => setModalOpen(true)}
                    draggable={false}
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
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
                      className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white text-3xl hover:bg-black transition items-center justify-center"
                    >
                      ‹
                    </button>

                    <button
                      onClick={nextMedia}
                      className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white text-3xl hover:bg-black transition items-center justify-center"
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
                      className={`relative w-24 h-16 rounded-xl flex-shrink-0 p-[2px] transition-all duration-300 ${
                        isSelected
                          ? "bg-yellow-400 opacity-100 scale-105"
                          : "bg-transparent opacity-65 hover:opacity-100 hover:scale-[1.02]"
                      }`}
                    >
                      <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-black">
                        {item.type === "video" ? (
                          <>
                            <video
                              src={item.url}
                              className="w-full h-full object-cover pointer-events-none"
                              muted
                              playsInline
                              preload="metadata"
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
              className={`rounded-[18px] p-5 sm:p-6 border shadow-xl relative overflow-hidden ${
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

                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-400 text-black font-black shadow-md">
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
                  className={`mt-5 w-full flex items-center gap-4 rounded-2xl p-3 border text-left transition duration-300 hover:-translate-y-1 ${
                    isDarkmodeEnabled
                      ? "bg-[#1b1b1b] border-white/10 hover:bg-[#222]"
                      : "bg-[#fafafa] border-black/10 hover:bg-[#f0f0f0]"
                  }`}
                >
                  <img
                    src={ownerImage || defaultImage}
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

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-4 sm:mt-5">
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
            className={`mt-4 rounded-[16px] p-4 sm:p-5 border shadow-xl ${
              isDarkmodeEnabled
                ? "bg-[#111] border-white/10"
                : "bg-white border-black/10"
            }`}
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="text-xl sm:text-2xl font-black">Açıqlama</h2>
            </div>

            <p
              className={`leading-6 text-[14px] sm:text-base ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {car.description || "Bu maşın üçün açıqlama əlavə edilməyib."}
            </p>
          </div>

          <div
            className={`mt-4 max-w-[520px] rounded-[16px] p-4 border shadow-lg ${
              isDarkmodeEnabled
                ? "bg-[#111] border-white/10"
                : "bg-white border-black/10"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center">
                  <ReportIcon />
                </div>

                <div>
                  <h3 className="font-black text-base">Elanı report et</h3>
                  <p className="text-xs opacity-60">Problem varsa bizə bildir.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleMyReports}
                className={`px-3 py-2 rounded-xl text-xs font-black border transition ${
                  isDarkmodeEnabled
                    ? "bg-[#181818] border-white/10 hover:bg-[#222]"
                    : "bg-[#fafafa] border-black/10 hover:bg-[#f1f1f1]"
                }`}
              >
                Mənim reportlarım
              </button>
            </div>

            {myReportsOpen && (
              <div
                className={`mb-3 rounded-xl border p-3 ${
                  isDarkmodeEnabled
                    ? "bg-[#181818] border-white/10"
                    : "bg-[#fafafa] border-black/10"
                }`}
              >
                {myReportsLoading ? (
                  <p className="text-sm opacity-70">Yüklənir...</p>
                ) : myReportsError ? (
                  <p className="text-sm text-red-500">{myReportsError}</p>
                ) : myReports.length === 0 ? (
                  <p className="text-sm opacity-70">Hələ report yoxdur.</p>
                ) : (
                  <div className="max-h-[180px] overflow-y-auto space-y-2">
                    {myReports.map((report, index) => (
                      <div
                        key={report.id || index}
                        className={`rounded-xl p-2 border text-sm ${
                          isDarkmodeEnabled
                            ? "bg-[#111] border-white/10"
                            : "bg-white border-black/10"
                        }`}
                      >
                        <p className="font-black text-xs">
                          {getReasonLabel(report.reasonType)}
                        </p>

                        <p className="text-xs opacity-70 mt-1">
                          {report.description || "Açıqlama yoxdur"}
                        </p>

                        {(report.createdAt || report.createdDate) && (
                          <p className="text-[10px] opacity-50 mt-1">
                            {new Date(
                              report.createdAt || report.createdDate
                            ).toLocaleString("az-AZ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={submitReport} className="space-y-2">
              <select
                value={reasonType}
                onChange={(e) => setReasonType(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-sm outline-none border ${
                  isDarkmodeEnabled
                    ? "bg-[#181818] border-white/10 text-white"
                    : "bg-[#fafafa] border-black/10 text-black"
                }`}
              >
                {reasonOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={2}
                placeholder="Qısa açıqlama yaz..."
                className={`w-full rounded-xl px-3 py-2 text-sm outline-none border resize-none ${
                  isDarkmodeEnabled
                    ? "bg-[#181818] border-white/10 text-white placeholder:text-gray-500"
                    : "bg-[#fafafa] border-black/10 text-black placeholder:text-gray-400"
                }`}
              />

              {reportError && (
                <p className="text-xs font-semibold text-red-500">
                  {reportError}
                </p>
              )}

              {reportMessage && (
                <p className="text-xs font-semibold text-green-500">
                  {reportMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={reportLoading}
                className="px-4 py-2 rounded-xl bg-yellow-400 text-black text-sm font-black hover:bg-yellow-300 transition disabled:opacity-60"
              >
                {reportLoading ? "Göndərilir..." : "Göndər"}
              </button>
            </form>
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
                  className="hidden sm:block fixed left-5 top-1/2 -translate-y-1/2 z-[1000000] text-white text-7xl hover:scale-110 transition"
                >
                  ‹
                </button>

                <button
                  onClick={nextMedia}
                  className="hidden sm:block fixed right-5 top-1/2 -translate-y-1/2 z-[1000000] text-white text-7xl hover:scale-110 transition"
                >
                  ›
                </button>
              </>
            )}

            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
            >
              {activeMedia?.type === "video" ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  playsInline
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