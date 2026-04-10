import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import { apiFetch } from "../utils/apiFetch"
import { getAccessToken } from "../utils/auth"

const MyCarRentals = () => {
  const { isDarkmodeEnabled } = useDarkmode()
  const navigate = useNavigate()

  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("All")
  const [completingId, setCompletingId] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const hasToken = !!getAccessToken()

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)

    return new Intl.DateTimeFormat("az-AZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatPrice = (value) => {
    if (value === null || value === undefined) return "-"
    return `${Number(value).toFixed(0)} ₼`
  }

  const normalizeBodyType = (bodyType) => {
    if (!bodyType && bodyType !== 0) return "Unknown"

    const raw = String(bodyType).trim()

    const map = {
      "0": "Unknown",
      "1": "Sedan",
      "2": "Suv",
      "3": "Hatchback",
      "4": "Coupe",
      "5": "Pickup",
      "6": "Universal",
      "7": "Minivan",
      "8": "Convertible",
    }

    return map[raw] || raw
  }

  const getVisualStatus = (rental) => {
    const status = (rental?.status || "").toLowerCase()
    const now = new Date()
    const endDate = rental?.endDate ? new Date(rental.endDate) : null

    if (status === "completed") return "Completed"
    if (status === "cancelled") return "Cancelled"

    if (status === "active") {
      if (endDate && endDate < now) return "Overdue"
      return "Active"
    }

    return rental?.status || "Unknown"
  }

  const canCompleteRental = (rental) => {
    const status = (rental?.status || "").toLowerCase()
    const endDate = rental?.endDate ? new Date(rental.endDate) : null
    const now = new Date()

    return status === "active" && endDate && endDate <= now
  }

  const getStatusClasses = (visualStatus) => {
    switch (visualStatus) {
      case "Active":
        return "bg-green-100 text-green-700 border border-green-300"
      case "Overdue":
        return "bg-red-100 text-red-700 border border-red-300"
      case "Completed":
        return "bg-blue-100 text-blue-700 border border-blue-300"
      case "Cancelled":
        return "bg-gray-200 text-gray-700 border border-gray-300"
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    }
  }

  const fetchOwnerRentals = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccessMessage("")

      const response = await apiFetch("/api/Rentals/owner-rentals", {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.Message ||
            "Kirayeleri yuklemek olmadi"
        )
      }

      setRentals(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || "Xeta bash verdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hasToken) {
      navigate("/login")
      return
    }

    fetchOwnerRentals()
  }, [])

  const handleCompleteRental = async (rentalId) => {
    try {
      setCompletingId(rentalId)
      setError("")
      setSuccessMessage("")

      const response = await apiFetch(`/api/Rentals/${rentalId}/complete`, {
        method: "PUT",
        headers: {
          Accept: "*/*",
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.Message ||
            "Rental tamamlanmadi"
        )
      }

      setRentals((prev) =>
        prev.map((item) =>
          item.rentalId === rentalId
            ? { ...item, status: "Completed" }
            : item
        )
      )

      setSuccessMessage("Rental ugurla tamamlandi")
    } catch (err) {
      setError(err.message || "Rental tamamlanarken xeta bash verdi")
    } finally {
      setCompletingId("")
    }
  }

  const filteredRentals = useMemo(() => {
    if (filter === "All") return rentals

    return rentals.filter((item) => getVisualStatus(item) === filter)
  }, [rentals, filter])

  const summary = useMemo(() => {
    const total = rentals.length
    const active = rentals.filter((x) => getVisualStatus(x) === "Active").length
    const overdue = rentals.filter((x) => getVisualStatus(x) === "Overdue").length
    const completed = rentals.filter((x) => getVisualStatus(x) === "Completed").length

    return { total, active, overdue, completed }
  }, [rentals])

  return (
    <div
      className={`min-h-screen pt-28 pb-12 px-4 sm:px-6 lg:px-8 ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-gray-50 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">My Car Rentals</h1>
            <p
              className={`mt-2 text-sm sm:text-base ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Follow and manage all the leases made to your cars here.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {["All", "Active", "Overdue", "Completed"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === item
                    ? "bg-yellow-400 text-black shadow-lg"
                    : isDarkmodeEnabled
                    ? "bg-[#1d1d1d] text-white border border-gray-700 hover:border-yellow-400"
                    : "bg-white text-black border border-gray-300 hover:border-yellow-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div
            className={`rounded-2xl p-4 shadow-md border ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <p className="text-sm opacity-70">Total</p>
            <h2 className="text-2xl font-bold mt-2">{summary.total}</h2>
          </div>

          <div
            className={`rounded-2xl p-4 shadow-md border ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <p className="text-sm opacity-70">Active</p>
            <h2 className="text-2xl font-bold mt-2">{summary.active}</h2>
          </div>

          <div
            className={`rounded-2xl p-4 shadow-md border ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <p className="text-sm opacity-70">Overdue</p>
            <h2 className="text-2xl font-bold mt-2">{summary.overdue}</h2>
          </div>

          <div
            className={`rounded-2xl p-4 shadow-md border ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <p className="text-sm opacity-70">Completed</p>
            <h2 className="text-2xl font-bold mt-2">{summary.completed}</h2>
          </div>
        </div>

        {successMessage && (
          <div className="mb-5 rounded-2xl border border-green-300 bg-green-100 text-green-700 px-4 py-3">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-300 bg-red-100 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`rounded-3xl p-5 animate-pulse border ${
                  isDarkmodeEnabled
                    ? "bg-[#1a1a1a] border-gray-800"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="h-6 w-40 rounded bg-gray-400/30 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 rounded bg-gray-400/30"></div>
                  <div className="h-4 rounded bg-gray-400/30"></div>
                  <div className="h-4 rounded bg-gray-400/30"></div>
                  <div className="h-10 w-36 rounded-xl bg-gray-400/30 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRentals.length === 0 ? (
          <div
            className={`rounded-3xl border p-10 text-center ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <h3 className="text-2xl font-bold mb-2">Rental tapilmadi</h3>
            <p className={isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}>
              Bu filtere uygun her hansi rental yoxdur.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredRentals.map((rental) => {
              const visualStatus = getVisualStatus(rental)

              return (
                <div
                  key={rental.rentalId}
                  className={`rounded-3xl border shadow-md p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isDarkmodeEnabled
                      ? "bg-[#1a1a1a] border-gray-800"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold break-words">
                        {rental.carName || "Car"}
                      </h2>
                      <p
                        className={`mt-1 text-sm ${
                          isDarkmodeEnabled ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Body type: {normalizeBodyType(rental.carBodyType)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusClasses(
                        visualStatus
                      )}`}
                    >
                      {visualStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div
                      className={`rounded-2xl p-4 ${
                        isDarkmodeEnabled ? "bg-[#202020]" : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm opacity-70 mb-1">Renter</p>
                      <p className="font-semibold break-words">
                        {rental.renterFullName || "-"}
                      </p>
                      <p className="text-sm opacity-80 break-words">
                        {rental.renterEmail || "-"}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl p-4 ${
                        isDarkmodeEnabled ? "bg-[#202020]" : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm opacity-70 mb-1">Total price</p>
                      <p className="font-semibold text-lg">
                        {formatPrice(rental.totalPrice)}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl p-4 ${
                        isDarkmodeEnabled ? "bg-[#202020]" : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm opacity-70 mb-1">Start date</p>
                      <p className="font-semibold">{formatDate(rental.startDate)}</p>
                    </div>

                    <div
                      className={`rounded-2xl p-4 ${
                        isDarkmodeEnabled ? "bg-[#202020]" : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm opacity-70 mb-1">End date</p>
                      <p className="font-semibold">{formatDate(rental.endDate)}</p>
                    </div>

                    <div
                      className={`rounded-2xl p-4 ${
                        isDarkmodeEnabled ? "bg-[#202020]" : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm opacity-70 mb-1">Pick up</p>
                      <p className="font-semibold break-words">
                        {rental.pickupLocation || "-"}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl p-4 ${
                        isDarkmodeEnabled ? "bg-[#202020]" : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm opacity-70 mb-1">Return</p>
                      <p className="font-semibold break-words">
                        {rental.returnLocation || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/details/${rental.carId}`)}
                      className="relative overflow-hidden px-5 py-3 rounded-xl bg-white text-black font-bold border border-gray-300 shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-black/10 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
                    >
                      <span className="relative z-10">View car</span>
                    </button>

                    {canCompleteRental(rental) && (
                      <button
                        onClick={() => handleCompleteRental(rental.rentalId)}
                        disabled={completingId === rental.rentalId}
                        className="relative overflow-hidden px-5 py-3 rounded-xl bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
                      >
                        <span className="relative z-10">
                          {completingId === rental.rentalId
                            ? "Completing..."
                            : "Complete rental"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCarRentals