import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useDarkmode } from "../stores/useDarkmode"
import { getAccessToken } from "../stores/auth"
import defaultImage from "../assets/download.png"

const CAR_API_BASE = "http://localhost:5248/api/Cars"
const FAVORITE_API = "http://localhost:5248/api/Favorites"
const CART_API = "http://localhost:5248/api/Cart/items"

const Details = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isDarkmodeEnabled } = useDarkmode()

    const [car, setCar] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    const [favoriteLoading, setFavoriteLoading] = useState(false)
    const [basketLoading, setBasketLoading] = useState(false)

    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success"
    })

    const toastTimeoutRef = useRef(null)

    const token = getAccessToken()

    const showToast = (message, type = "success") => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current)
        }

        setToast({
            show: true,
            message,
            type
        })

        toastTimeoutRef.current = setTimeout(() => {
            setToast({
                show: false,
                message: "",
                type: "success"
            })
        }, 2500)
    }

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const getCarById = async () => {
            try {
                setLoading(true)
                setError("")

                const response = await fetch(`${CAR_API_BASE}/${id}`)

                if (!response.ok) {
                    throw new Error("Masin tapilmadi")
                }

                const data = await response.json()
                console.log("Details data:", data)

                setCar(data)
                setSelectedImageIndex(0)
            } catch (err) {
                setError(err.message || "Xeta bas verdi")
            } finally {
                setLoading(false)
            }
        }

        getCarById()
    }, [id])

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

    const carImages = useMemo(() => {
        const images =
            car?.carImages?.length > 0
                ? car.carImages.map(normalizeImage).filter(Boolean)
                : car?.images?.length > 0
                ? car.images.map(normalizeImage).filter(Boolean)
                : [
                      normalizeImage(car?.mainImageUrl),
                      normalizeImage(car?.imageUrl),
                      normalizeImage(car?.image)
                  ].filter(Boolean)

        return images.length > 0 ? images : [defaultImage]
    }, [car])

    const selectedImage = carImages[selectedImageIndex] || defaultImage

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) =>
            prev === 0 ? carImages.length - 1 : prev - 1
        )
    }

    const handleNextImage = () => {
        setSelectedImageIndex((prev) =>
            prev === carImages.length - 1 ? 0 : prev + 1
        )
    }

    const handleGoRental = () => {
        if (!token) {
            navigate("/login")
            return
        }

        navigate(`/rentals/${id}`)
    }

    const handleAddFavorite = async () => {
        if (!token) {
            navigate("/login")
            return
        }

        try {
            setFavoriteLoading(true)

            const response = await fetch(FAVORITE_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ carId: id })
            })

            if (!response.ok) {
                let errorMessage = ""

                try {
                    const errorData = await response.json()
                    errorMessage = errorData?.Message || errorData?.message || ""
                } catch {
                    errorMessage = await response.text()
                }

                const lowerMessage = errorMessage.toLowerCase()

                if (
                    lowerMessage.includes("favori") ||
                    lowerMessage.includes("favorite") ||
                    lowerMessage.includes("already")
                ) {
                    showToast("This car is already in favorites", "error")
                    return
                }

                showToast("Could not add to favorites", "error")
                return
            }

            showToast("Added to favorites successfully", "success")
        } catch (err) {
            showToast("Could not add to favorites", "error")
        } finally {
            setFavoriteLoading(false)
        }
    }

    const handleAddBasket = async () => {
        if (!token) {
            navigate("/login")
            return
        }

        if (!startDate || !endDate) {
            showToast("Please select start and end date", "error")
            return
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            showToast("Invalid date", "error")
            return
        }

        if (end <= start) {
            showToast("End date must be greater than start date", "error")
            return
        }

        try {
            setBasketLoading(true)

            const response = await fetch(CART_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    carId: id,
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                })
            })

            if (!response.ok) {
                let errorMessage = ""

                try {
                    const errorData = await response.json()
                    errorMessage = errorData?.Message || errorData?.message || ""
                } catch {
                    errorMessage = await response.text()
                }

                const lowerMessage = errorMessage.toLowerCase()

                if (
                    lowerMessage.includes("səbətdədir") ||
                    lowerMessage.includes("sebetdedir") ||
                    lowerMessage.includes("already") ||
                    lowerMessage.includes("cart")
                ) {
                    showToast("This car is already in basket", "error")
                    return
                }

                showToast("Could not add to basket", "error")
                return
            }

            showToast("Added to basket successfully", "success")
        } catch (err) {
            showToast("Could not add to basket", "error")
        } finally {
            setBasketLoading(false)
        }
    }

    if (loading) {
        return (
            <div className={`min-h-screen ${isDarkmodeEnabled ? "bg-[#0d0d0d] text-white" : "bg-white text-black"}`}>
                <Navbar />
                <div className="flex items-center justify-center py-24 text-xl">
                    Yuklenir...
                </div>
                <Footer />
            </div>
        )
    }

    if (error || !car) {
        return (
            <div className={`min-h-screen ${isDarkmodeEnabled ? "bg-[#0d0d0d] text-white" : "bg-white text-black"}`}>
                <Navbar />
                <div className="flex items-center justify-center py-24 text-xl text-red-500 px-4 text-center">
                    {error || "Melumat tapilmadi"}
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${isDarkmodeEnabled ? "bg-[#0d0d0d] text-white" : "bg-[#fafafa] text-black"}`}>
            {toast.show && (
                <div className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-md">
                    <div
                        className={`rounded-2xl px-5 py-4 shadow-2xl border backdrop-blur-md text-sm sm:text-base font-medium animate-bounce ${
                            toast.type === "success"
                                ? "bg-green-500/95 text-white border-green-300"
                                : "bg-red-500/95 text-white border-red-300"
                        }`}
                    >
                        {toast.message}
                    </div>
                </div>
            )}

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-10">

                    <div
                        className={`rounded-3xl border p-4 sm:p-5 lg:p-6 shadow-lg ${
                            isDarkmodeEnabled
                                ? "bg-[#111111] border-[#2a2a2a]"
                                : "bg-white border-[#e7e7e7]"
                        }`}
                    >
                        <div className="relative w-full h-[240px] sm:h-[360px] lg:h-[460px] rounded-3xl overflow-hidden bg-gray-200">
                            <img
                                src={selectedImage}
                                alt={`${car?.brand || ""} ${car?.model || ""}`}
                                className="w-full h-full object-cover"
                            />

                            {carImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrevImage}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 text-white text-2xl hover:bg-black/70 transition"
                                    >
                                        ‹
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleNextImage}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 text-white text-2xl hover:bg-black/70 transition"
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>

                        {carImages.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {carImages.map((img, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`w-24 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                                            selectedImageIndex === index
                                                ? "border-yellow-400 scale-105"
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
                    </div>

                    <div
                        className={`rounded-3xl border p-5 sm:p-6 lg:p-8 shadow-lg ${
                            isDarkmodeEnabled
                                ? "bg-[#111111] border-[#2a2a2a]"
                                : "bg-white border-[#e7e7e7]"
                        }`}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm uppercase tracking-[3px] text-yellow-500 font-semibold">
                                        Premium Car Details
                                    </p>

                                    <h1 className="text-3xl sm:text-4xl font-bold mt-2 leading-tight">
                                        {car?.brand} {car?.model} {car?.year}
                                    </h1>
                                </div>

                                <div className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
                                    isDarkmodeEnabled
                                        ? "bg-yellow-400 text-black"
                                        : "bg-black text-white"
                                }`}>
                                    {car?.pricePerDay} AZN / gun
                                </div>
                            </div>

                            <p className={`text-sm sm:text-base leading-7 ${
                                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                            }`}>
                                {car?.description || "Bu masin ucun description elave edilmeyib."}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-2">
                                <div className={`rounded-2xl p-4 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f6f6f6]"}`}>
                                    <p className="text-xs sm:text-sm opacity-70">Brand</p>
                                    <p className="font-semibold mt-1">{car?.brand || "-"}</p>
                                </div>

                                <div className={`rounded-2xl p-4 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f6f6f6]"}`}>
                                    <p className="text-xs sm:text-sm opacity-70">Model</p>
                                    <p className="font-semibold mt-1">{car?.model || "-"}</p>
                                </div>

                                <div className={`rounded-2xl p-4 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f6f6f6]"}`}>
                                    <p className="text-xs sm:text-sm opacity-70">Year</p>
                                    <p className="font-semibold mt-1">{car?.year || "-"}</p>
                                </div>

                                <div className={`rounded-2xl p-4 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f6f6f6]"}`}>
                                    <p className="text-xs sm:text-sm opacity-70">Fuel</p>
                                    <p className="font-semibold mt-1">{car?.fuelType || "-"}</p>
                                </div>

                                <div className={`rounded-2xl p-4 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f6f6f6]"}`}>
                                    <p className="text-xs sm:text-sm opacity-70">Transmission</p>
                                    <p className="font-semibold mt-1">{car?.transmission || "-"}</p>
                                </div>

                                <div className={`rounded-2xl p-4 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f6f6f6]"}`}>
                                    <p className="text-xs sm:text-sm opacity-70">Mileage</p>
                                    <p className="font-semibold mt-1">{car?.mileage || "-"} km</p>
                                </div>

                                <div className={`rounded-2xl p-4 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f6f6f6]"}`}>
                                    <p className="text-xs sm:text-sm opacity-70">Color</p>
                                    <p className="font-semibold mt-1">{car?.color || "-"}</p>
                                </div>

                                <div className={`rounded-2xl p-4 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f6f6f6]"}`}>
                                    <p className="text-xs sm:text-sm opacity-70">Location</p>
                                    <p className="font-semibold mt-1">{car?.location || "-"}</p>
                                </div>

                                <div className={`rounded-2xl p-4 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f6f6f6]"}`}>
                                    <p className="text-xs sm:text-sm opacity-70">Body Type</p>
                                    <p className="font-semibold mt-1">{car?.bodyType || "-"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block mb-2 text-sm sm:text-base font-medium">
                                        Start Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className={`w-full p-3 rounded-2xl outline-none border ${
                                            isDarkmodeEnabled
                                                ? "bg-[#1a1a1a] border-white/10 text-white"
                                                : "bg-[#f6f6f6] border-black/10 text-black"
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm sm:text-base font-medium">
                                        End Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className={`w-full p-3 rounded-2xl outline-none border ${
                                            isDarkmodeEnabled
                                                ? "bg-[#1a1a1a] border-white/10 text-white"
                                                : "bg-[#f6f6f6] border-black/10 text-black"
                                        }`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={handleGoRental}
                                    className="
                                        group relative overflow-hidden
                                        w-full bg-yellow-400 text-black py-3.5 rounded-2xl
                                        hover:bg-yellow-500 duration-200
                                        font-semibold flex items-center justify-center
                                        shadow-md hover:shadow-xl
                                        hover:-translate-y-1 active:translate-y-0
                                        transition-all duration-300 ease-in-out
                                    "
                                >
                                    <span className="relative z-10">Rental Now</span>
                                    <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAddFavorite}
                                    disabled={favoriteLoading}
                                    className="
                                        group relative overflow-hidden
                                        w-full bg-red-500 text-white py-3.5 rounded-2xl
                                        hover:bg-red-600 duration-200 disabled:opacity-60
                                        font-semibold flex items-center justify-center
                                        shadow-md hover:shadow-xl
                                        hover:-translate-y-1 active:translate-y-0
                                        transition-all duration-300 ease-in-out
                                    "
                                >
                                    <span className="relative z-10">
                                        {favoriteLoading ? "Loading..." : "Favorite"}
                                    </span>
                                    <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleAddBasket}
                                    disabled={basketLoading}
                                    className="
                                        group relative overflow-hidden
                                        w-full bg-black text-white py-3.5 rounded-2xl
                                        hover:bg-[#222] duration-200 disabled:opacity-60
                                        font-semibold flex items-center justify-center
                                        shadow-md hover:shadow-xl
                                        hover:-translate-y-1 active:translate-y-0
                                        transition-all duration-300 ease-in-out
                                    "
                                >
                                    <span className="relative z-10">
                                        {basketLoading ? "Loading..." : "Add Basket"}
                                    </span>
                                    <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className={`mt-8 sm:mt-10 rounded-3xl border p-5 sm:p-6 lg:p-8 ${
                        isDarkmodeEnabled
                            ? "bg-[#111111] border-[#2a2a2a]"
                            : "bg-white border-[#e7e7e7]"
                    }`}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold mb-5">
                        More About This Car
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        <div className={`rounded-2xl p-5 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f8f8f8]"}`}>
                            <h3 className="text-lg font-semibold mb-3">Why choose this car?</h3>
                            <p className={`leading-7 text-sm sm:text-base ${
                                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                            }`}>
                                {car?.description || "Bu masin ucun description elave edilmeyib."}
                            </p>
                        </div>

                        <div className={`rounded-2xl p-5 ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#f8f8f8]"}`}>
                            <h3 className="text-lg font-semibold mb-3">Rental info</h3>
                            <p className={`leading-7 text-sm sm:text-base ${
                                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                            }`}>
                                Masini goturmek ucun login olmaq lazimdir. Tarixleri sec, sonra Add Basket ile sebete elave et,
                                ya da birbasa Rental Now duymesine basib davam et.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Details