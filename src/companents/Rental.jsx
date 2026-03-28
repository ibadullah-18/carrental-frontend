import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useDarkmode } from "../stores/useDarkmode"
import { getAccessToken } from "../stores/auth"
import defaultImage from "../assets/download.png"

const Rental = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isDarkmodeEnabled } = useDarkmode()

    const [car, setCar] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [pickupLocation, setPickupLocation] = useState("")
    const [returnLocation, setReturnLocation] = useState("")
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    const token = getAccessToken()

    useEffect(() => {
        if (!token) {
            navigate("/login")
            return
        }

        const getCarById = async () => {
            try {
                setLoading(true)
                setError("")

                const response = await fetch(`http://localhost:5248/api/Cars/${id}`)

                if (!response.ok) {
                    throw new Error("Masin tapilmadi")
                }

                const data = await response.json()
                console.log("Car details:", data)

                setCar(data)
                setPickupLocation(data.location || "")
                setReturnLocation(data.location || "")
                setSelectedImageIndex(0)
            } catch (err) {
                setError(err.message || "Xeta bas verdi")
            } finally {
                setLoading(false)
            }
        }

        getCarById()
    }, [id, token, navigate])

    const totalDays = useMemo(() => {
        if (!startDate || !endDate) return 0

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0

        const diff = end.getTime() - start.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

        return days > 0 ? days : 0
    }, [startDate, endDate])

    const totalPrice = useMemo(() => {
        if (!car?.pricePerDay || totalDays <= 0) return 0
        return car.pricePerDay * totalDays
    }, [car, totalDays])

    const handleRental = async (e) => {
        e.preventDefault()

        setError("")
        setSuccess("")

        if (!startDate || !endDate || !pickupLocation || !returnLocation) {
            setError("Butun xanalari doldur")
            return
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (end <= start) {
            setError("Bitme tarixi baslama tarixinden boyuk olmalidir")
            return
        }

        try {
            setSubmitting(true)

            const rentalData = {
                carId: id,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                pickupLocation,
                returnLocation
            }

            const response = await fetch("http://localhost:5248/api/Rentals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(rentalData)
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || "Rental yaratmaq olmadi")
            }

            setSuccess("Rental ugurla yaradildi")

            setTimeout(() => {
                navigate("/")
            }, 1200)
        } catch (err) {
            setError(err.message || "Xeta bas verdi")
        } finally {
            setSubmitting(false)
        }
    }

    const normalizeImage = (img) => {
        if (!img) return null

        let imagePath = null

        if (typeof img === "string") {
            imagePath = img
        } else {
            imagePath =
                img.imageUrl ||
                img.url ||
                img.path ||
                img.mainImageUrl
        }

        if (!imagePath) return null

        return imagePath.startsWith("http")
            ? imagePath
            : `http://localhost:5248${imagePath}`
    }

    const carImages =
        car?.carImages?.length > 0
            ? car.carImages.map(normalizeImage).filter(Boolean)
            : car?.images?.length > 0
            ? car.images.map(normalizeImage).filter(Boolean)
            : [
                  normalizeImage(car?.mainImageUrl),
                  normalizeImage(car?.imageUrl),
                  normalizeImage(car?.image)
              ].filter(Boolean)

    const imagesToShow = carImages.length > 0 ? carImages : [defaultImage]
    const selectedImage = imagesToShow[selectedImageIndex] || defaultImage

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) =>
            prev === 0 ? imagesToShow.length - 1 : prev - 1
        )
    }

    const handleNextImage = () => {
        setSelectedImageIndex((prev) =>
            prev === imagesToShow.length - 1 ? 0 : prev + 1
        )
    }

    if (loading) {
        return (
            <div className={`w-full min-h-screen ${isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
                <Navbar />
                <div className="flex justify-center items-center mt-20 text-xl">
                    Yuklenir...
                </div>
                <Footer />
            </div>
        )
    }

    if (error && !car) {
        return (
            <div className={`w-full min-h-screen ${isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
                <Navbar />
                <div className="flex justify-center items-center mt-20 text-red-500 text-xl px-4 text-center">
                    {error}
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className={`w-full min-h-screen ${isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    <div
                        className={`rounded-3xl p-4 sm:p-6 border ${
                            isDarkmodeEnabled
                                ? "bg-[#111111] border-[#2a2a2a]"
                                : "bg-[#f7f7f7] border-[#e5e5e5]"
                        }`}
                    >
                        <div className="relative w-full h-[220px] sm:h-[320px] rounded-2xl overflow-hidden bg-gray-200">
                            <img
                                src={selectedImage}
                                alt={`${car?.brand || ""} ${car?.model || ""}`}
                                className="w-full h-full object-cover"
                            />

                            {imagesToShow.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl hover:bg-black/70 transition"
                                    >
                                        ‹
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleNextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl hover:bg-black/70 transition"
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>

                        {imagesToShow.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {imagesToShow.map((img, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                                            selectedImageIndex === index
                                                ? "border-yellow-400"
                                                : "border-transparent"
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`car-${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        <h1 className="text-2xl sm:text-3xl font-bold mt-5">
                            {car?.brand} {car?.model} {car?.year}
                        </h1>

                        <p className="mt-3 text-lg">
                            <span className="font-bold">{car?.pricePerDay}</span> AZN / day
                        </p>

                        <div className="mt-4 space-y-2">
                            <p><span className="font-semibold">Fuel:</span> {car?.fuelType}</p>
                            <p><span className="font-semibold">Transmission:</span> {car?.transmission}</p>
                            <p><span className="font-semibold">Mileage:</span> {car?.mileage}</p>
                            <p><span className="font-semibold">Location:</span> {car?.location}</p>
                            <p><span className="font-semibold">Color:</span> {car?.color}</p>
                        </div>

                        <div
                            className={`mt-6 rounded-2xl p-4 ${
                                isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#ececec]"
                            }`}
                        >
                            <p className="text-base sm:text-lg">
                                <span className="font-semibold">Days:</span> {totalDays || 0}
                            </p>
                            <p className="text-base sm:text-lg mt-2">
                                <span className="font-semibold">Total Price:</span> {totalPrice || 0} AZN
                            </p>
                        </div>
                    </div>

                    <div
                        className={`rounded-3xl p-4 sm:p-6 border ${
                            isDarkmodeEnabled
                                ? "bg-[#111111] border-[#2a2a2a]"
                                : "bg-[#f7f7f7] border-[#e5e5e5]"
                        }`}
                    >
                        <h2 className="text-2xl font-bold mb-6">Rental Details</h2>

                        <form onSubmit={handleRental} className="flex flex-col gap-4">
                            <div>
                                <label className="block mb-2 text-sm sm:text-base">
                                    Start Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className={`w-full p-3 rounded-xl outline-none border ${
                                        isDarkmodeEnabled
                                            ? "bg-white/10 border-white/20 text-white placeholder-gray-300"
                                            : "bg-black/5 border-black/10 text-black placeholder-gray-500"
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm sm:text-base">
                                    End Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className={`w-full p-3 rounded-xl outline-none border ${
                                        isDarkmodeEnabled
                                            ? "bg-white/10 border-white/20 text-white placeholder-gray-300"
                                            : "bg-black/5 border-black/10 text-black placeholder-gray-500"
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm sm:text-base">
                                    Pickup Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="Pickup location"
                                    value={pickupLocation}
                                    onChange={(e) => setPickupLocation(e.target.value)}
                                    className={`w-full p-3 rounded-xl outline-none border ${
                                        isDarkmodeEnabled
                                            ? "bg-white/10 border-white/20 text-white placeholder-gray-300"
                                            : "bg-black/5 border-black/10 text-black placeholder-gray-500"
                                    }`}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm sm:text-base">
                                    Return Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="Return location"
                                    value={returnLocation}
                                    onChange={(e) => setReturnLocation(e.target.value)}
                                    className={`w-full p-3 rounded-xl outline-none border ${
                                        isDarkmodeEnabled
                                            ? "bg-white/10 border-white/20 text-white placeholder-gray-300"
                                            : "bg-black/5 border-black/10 text-black placeholder-gray-500"
                                    }`}
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm">{error}</p>
                            )}

                            {success && (
                                <p className="text-green-400 text-sm">{success}</p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="
                                    group relative overflow-hidden
                                    w-full bg-yellow-400 text-black py-3 rounded-xl
                                    hover:bg-yellow-500 duration-200 disabled:opacity-50
                                    font-semibold flex items-center justify-center
                                    shadow-md hover:shadow-xl
                                    hover:-translate-y-1 active:translate-y-0
                                    transition-all duration-300 ease-in-out
                                "
                            >
                                <span className="relative z-10">
                                    {submitting ? "Processing..." : "Confirm Rental"}
                                </span>
                                <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Rental