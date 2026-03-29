import { useEffect, useState } from "react"
import { useDarkmode } from "../stores/useDarkmode"
import { getAccessToken } from "../stores/auth"
import Carcart from "../companents/Carcart"

const Favorite = () => {
    const { isDarkmodeEnabled } = useDarkmode()

    const [favoriteCars, setFavoriteCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [visibleCount, setVisibleCount] = useState(6)
    const [deleteLoadingId, setDeleteLoadingId] = useState(null)

    const token = getAccessToken()

    const getFavorites = async () => {
        try {
            setLoading(true)
            setError("")

            const response = await fetch("http://localhost:5248/api/Favorites", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error("Favori masinlar getirile bilmedi")
            }

            const data = await response.json()
            console.log("Favorite cars:", data)

            if (Array.isArray(data)) {
                setFavoriteCars(data)
            } else if (Array.isArray(data?.data)) {
                setFavoriteCars(data.data)
            } else if (Array.isArray(data?.items)) {
                setFavoriteCars(data.items)
            } else if (Array.isArray(data?.$values)) {
                setFavoriteCars(data.$values)
            } else {
                setFavoriteCars([])
            }
        } catch (err) {
            console.log(err)
            setError("Favori masinlari yuklemek olmadi")
        } finally {
            setLoading(false)
        }
    }

    const removeFavorite = async (carId) => {
        try {
            setDeleteLoadingId(carId)

            const response = await fetch(`http://localhost:5248/api/Favorites/${carId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error("Favoriden silmek olmadi")
            }

            setFavoriteCars((prev) =>
                prev.filter((item) => (item.carId || item.id) !== carId)
            )
        } catch (err) {
            console.log(err)
            setError("Favoriden silerken xeta bas verdi")
        } finally {
            setDeleteLoadingId(null)
        }
    }

    useEffect(() => {
        getFavorites()
    }, [])

    const visibleCars = favoriteCars.slice(0, visibleCount)

    return (
        <div
            className={`min-h-screen w-full py-8 sm:py-10 md:py-12 ${
                isDarkmodeEnabled
                    ? "bg-[#0f0f0f] text-white"
                    : "bg-[#f5f5f5] text-black"
            }`}
        >
            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div
                    className={`
                        w-full rounded-[24px] sm:rounded-[28px] mb-8 sm:mb-10
                        px-5 sm:px-8 py-6 sm:py-8 text-center border
                        ${
                            isDarkmodeEnabled
                                ? "bg-[#161616] border-[#2a2a2a]"
                                : "bg-white border-[#e7e7e7]"
                        }
                    `}
                >
                    <h1 className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold tracking-wide">
                        Favorite Cars
                    </h1>
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div
                            className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin ${
                                isDarkmodeEnabled ? "border-white" : "border-black"
                            }`}
                        ></div>
                    </div>
                )}

                {!loading && error && (
                    <div
                        className={`
                            w-full rounded-[20px] text-center py-10 text-[14px] sm:text-[16px]
                            ${
                                isDarkmodeEnabled
                                    ? "bg-red-500/10 text-red-300 border border-red-500/20"
                                    : "bg-red-50 text-red-600 border border-red-200"
                            }
                        `}
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && favoriteCars.length === 0 && (
                    <div
                        className={`
                            w-full rounded-[24px] text-center py-16 px-4
                            ${
                                isDarkmodeEnabled
                                    ? "bg-[#161616] border border-[#2a2a2a]"
                                    : "bg-white border border-[#e7e7e7]"
                            }
                        `}
                    >
                        <div className="text-[34px] mb-3">♡</div>
                        <h2 className="text-[20px] sm:text-[26px] font-semibold">
                            Favori masin yoxdur
                        </h2>
                        <p
                            className={`mt-2 text-[13px] sm:text-[15px] ${
                                isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            Masinlari favoriye elave et, burada gorsenecek
                        </p>
                    </div>
                )}

                {!loading && !error && favoriteCars.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 justify-items-center">
                            {visibleCars.map((car) => (
                                <Carcart
                                    key={car.id || car.carId}
                                    car={car}
                                    showFavoriteButton={true}
                                    isFavorite={true}
                                    favoriteLoading={deleteLoadingId === (car.carId || car.id)}
                                    onFavoriteClick={removeFavorite}
                                />
                            ))}
                        </div>

                        {visibleCount < favoriteCars.length && (
                            <div className="flex justify-center mt-8 sm:mt-10">
                                <button
                                    type="button"
                                    onClick={() => setVisibleCount((prev) => prev + 6)}
                                    className="
                                        group relative overflow-hidden
                                        px-6 sm:px-8 py-3 rounded-full font-semibold
                                        bg-yellow-400 text-black
                                        shadow-md hover:shadow-xl
                                        hover:bg-yellow-500 hover:-translate-y-1
                                        active:translate-y-0
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

export default Favorite