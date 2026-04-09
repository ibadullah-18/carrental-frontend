import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import Navbar from "../companents/Navbar"
import Footer from "../companents/Footer"
import Carcart from "../companents/Carcart"
import { useDarkmode } from "../stores/useDarkmode"
import { apiFetch } from "../utils/apiFetch"
import defaultImage from "../assets/download.png"

const OwnerCar = () => {
    const { ownerId } = useParams()
    const { isDarkmodeEnabled } = useDarkmode()

    const [owner, setOwner] = useState(null)
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [visibleCount, setVisibleCount] = useState(6)

    const normalizeImage = (img) => {
        if (!img) return null

        const imagePath =
            img.profileImageUrl ||
            img.mainImageUrl ||
            img.imageUrl ||
            img.image ||
            img.url ||
            img.path

        if (!imagePath) return null

        return imagePath.startsWith("http")
            ? imagePath
            : `http://localhost:5248${imagePath}`
    }

    useEffect(() => {
        const getOwnerAndCars = async () => {
            try {
                setLoading(true)
                setError("")

                const [ownerResponse, carsResponse] = await Promise.all([
                    apiFetch(`/api/Users/${ownerId}`, { method: "GET" }),
                    apiFetch(`/api/Cars/owner/${ownerId}`, { method: "GET" })
                ])

                if (!carsResponse.ok) {
                    throw new Error("Owner masinlari yuklenmedi")
                }

                const carsData = await carsResponse.json()
                setCars(Array.isArray(carsData) ? carsData : [])

                if (ownerResponse.ok) {
                    const ownerData = await ownerResponse.json()
                    setOwner(ownerData)
                } else {
                    setOwner(null)
                }
            } catch (err) {
                setError(err.message || "Xeta bas verdi")
            } finally {
                setLoading(false)
            }
        }

        if (ownerId) {
            getOwnerAndCars()
        }
    }, [ownerId])

    const visibleCars = useMemo(() => {
        return cars.slice(0, visibleCount)
    }, [cars, visibleCount])

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6)
    }

    const ownerName =
        owner?.fullName ||
        owner?.name ||
        owner?.userName ||
        "Istifadeci"

    const ownerImage =
        normalizeImage(owner) || defaultImage

    if (loading) {
        return (
            <div className={`min-h-screen ${isDarkmodeEnabled ? "bg-[#0d0d0d] text-white" : "bg-white text-black"}`}>
                <div className="flex items-center justify-center py-24 text-xl">
                    Yuklenir...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`min-h-screen ${isDarkmodeEnabled ? "bg-[#0d0d0d] text-white" : "bg-white text-black"}`}>
                <div className="flex items-center justify-center py-24 text-xl text-red-500 px-4 text-center">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen ${isDarkmodeEnabled ? "bg-[#0d0d0d] text-white" : "bg-[#fafafa] text-black"}`}>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div
                    className={`rounded-3xl border p-5 sm:p-6 lg:p-8 shadow-lg mb-8 ${
                        isDarkmodeEnabled
                            ? "bg-[#111111] border-[#2a2a2a]"
                            : "bg-white border-[#e7e7e7]"
                    }`}
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5">
                        <img
                            src={ownerImage}
                            alt={ownerName}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
                        />

                        <div className="text-center sm:text-left">
                            <p className="text-sm uppercase tracking-[3px] text-yellow-500 font-semibold">
                                Owner Profile
                            </p>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-2">
                                {ownerName}
                            </h1>
                            <p className={`${isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"} mt-2 text-sm sm:text-base`}>
                                All of this user's cars are shown below.
                            </p>
                        </div>
                    </div>
                </div>

                {cars.length === 0 ? (
                    <div
                        className={`rounded-3xl border p-8 text-center ${
                            isDarkmodeEnabled
                                ? "bg-[#111111] border-[#2a2a2a]"
                                : "bg-white border-[#e7e7e7]"
                        }`}
                    >
                        This user's car was not found.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
                            {visibleCars.map((car) => (
                                <Carcart
                                    key={car.id || car.carId}
                                    car={car}
                                />
                            ))}
                        </div>

                        {visibleCount < cars.length && (
                            <div className="flex justify-center mt-10">
                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    className="
                                        group relative overflow-hidden
                                        bg-yellow-400 text-black px-8 py-3.5 rounded-full
                                        hover:bg-yellow-500 duration-200
                                        font-semibold
                                        shadow-md hover:shadow-xl
                                        hover:-translate-y-1 active:translate-y-0
                                        transition-all duration-300 ease-in-out
                                    "
                                >
                                    <span className="relative z-10">Load More</span>
                                    <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default OwnerCar