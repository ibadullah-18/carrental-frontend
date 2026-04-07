import { Link } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import defaultImage from "../assets/download.png"
import { getAccessToken, getUserIdFromToken } from "../stores/auth"

const Carcart = ({
    car,
    showFavoriteButton = false,
    isFavorite = false,
    onFavoriteClick = null,
    favoriteLoading = false,

    showDeleteButton = false,
    onDeleteClick = null,
    deleteLoading = false,

    hideRentButton = false
}) => {
    const { isDarkmodeEnabled } = useDarkmode()

    const token = getAccessToken()
    const currentUserId = getUserIdFromToken()

    const carId = car.carId || car.id
    const ownerId = car.ownerId || car.OwnerId
    const isOwnCar = ownerId === currentUserId

    const rentalPrefill = {
        startDate: car.startDate || car.StartDate || "",
        endDate: car.endDate || car.EndDate || "",
        pickupLocation: car.pickupLocation || car.PickupLocation || "",
        returnLocation: car.returnLocation || car.ReturnLocation || ""
    }

    const imagePath = car.mainImageUrl || car.imageUrl || car.image
    const image = imagePath
        ? imagePath.startsWith("http")
            ? imagePath
            : `http://localhost:5248${imagePath}`
        : defaultImage

    return (
        <div
            className={`
                relative
                w-full max-w-[170px] sm:max-w-[260px] lg:max-w-[360px]
                rounded-[20px] sm:rounded-[24px] lg:rounded-[28px]
                p-2 sm:p-3 border transition duration-300
                hover:-translate-y-1 hover:shadow-2xl
                ${
                    isDarkmodeEnabled
                        ? "bg-[#111111] border-[#2a2a2a] text-white"
                        : "bg-[#f7f7f7] border-[#e5e5e5] text-black"
                }
            `}
        >
            <style>
                {`
                    @keyframes softHeartBeat {
                        0% { transform: scale(1); }
                        25% { transform: scale(1.08); }
                        50% { transform: scale(1.16); }
                        75% { transform: scale(1.08); }
                        100% { transform: scale(1); }
                    }

                    @keyframes trashShake {
                        0% { transform: rotate(0deg) scale(1); }
                        20% { transform: rotate(-10deg) scale(1.08); }
                        40% { transform: rotate(10deg) scale(1.12); }
                        60% { transform: rotate(-8deg) scale(1.12); }
                        80% { transform: rotate(8deg) scale(1.08); }
                        100% { transform: rotate(0deg) scale(1); }
                    }
                `}
            </style>

            {showFavoriteButton && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (onFavoriteClick) {
                            onFavoriteClick(car.carId || carId)
                        }
                    }}
                    disabled={favoriteLoading}
                    className={`
                        group absolute top-4 right-4 z-20
                        w-11 h-11 sm:w-12 sm:h-12
                        rounded-full flex items-center justify-center
                        backdrop-blur-md shadow-md border transition-all duration-300
                        hover:-translate-y-1
                        ${
                            isDarkmodeEnabled
                                ? "bg-[#111111]/80 border-white/10 hover:bg-[#1b1b1b]"
                                : "bg-white/90 border-black/10 hover:bg-white"
                        }
                        ${favoriteLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                    `}
                >
                    <span className="absolute inset-0 rounded-full bg-red-500/10 scale-0 group-hover:scale-100 transition duration-300"></span>

                    <svg
                        viewBox="0 0 24 24"
                        className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-red-500 transition duration-300 group-hover:animate-[softHeartBeat_0.9s_ease-in-out_infinite]"
                        fill="currentColor"
                    >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </button>
            )}

            {showDeleteButton && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (onDeleteClick) {
                            onDeleteClick()
                        }
                    }}
                    disabled={deleteLoading}
                    title="Remove from basket"
                    className={`
                        group absolute top-4 right-4 z-20
                        w-11 h-11 sm:w-12 sm:h-12
                        rounded-full flex items-center justify-center
                        backdrop-blur-md shadow-md border transition-all duration-300
                        hover:-translate-y-1 hover:scale-105
                        ${
                            isDarkmodeEnabled
                                ? "bg-[#111111]/80 border-white/10 hover:bg-[#1b1b1b]"
                                : "bg-white/90 border-black/10 hover:bg-white"
                        }
                        ${deleteLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                    `}
                >
                    <span className="absolute inset-0 rounded-full bg-red-500/10 scale-0 group-hover:scale-100 transition duration-300"></span>

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-red-500 transition duration-300 ${
                            deleteLoading
                                ? "animate-pulse"
                                : "group-hover:animate-[trashShake_0.5s_ease-in-out]"
                        }`}
                    >
                        <path
                            fillRule="evenodd"
                            d="M9 3.75A2.25 2.25 0 0 1 11.25 1.5h1.5A2.25 2.25 0 0 1 15 3.75V4.5h4.125a.75.75 0 0 1 0 1.5h-.634l-.84 12.593A2.25 2.25 0 0 1 15.406 20.7H8.594a2.25 2.25 0 0 1-2.245-2.107L5.509 6H4.875a.75.75 0 0 1 0-1.5H9V3.75ZM10.5 4.5h3V3.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V4.5Zm-1.446 4.97a.75.75 0 0 1 .75.696l.5 6.75a.75.75 0 1 1-1.496.108l-.5-6.75a.75.75 0 0 1 .696-.804Zm5.892 0a.75.75 0 0 1 .696.804l-.5 6.75a.75.75 0 1 1-1.496-.108l.5-6.75a.75.75 0 0 1 .8-.696ZM12 9.375a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            )}

            <Link to={`/details/${carId}`} className="block">
                <div className="w-full h-[120px] sm:h-[180px] lg:h-[230px] rounded-[16px] sm:rounded-[20px] lg:rounded-[22px] overflow-hidden bg-gray-200">
                    <img
                        src={image}
                        alt={`${car.brand || ""} ${car.model || ""}`}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="px-1 sm:px-3 pt-3 sm:pt-5">
                    <h2 className="text-[13px] sm:text-[17px] lg:text-[20px] font-semibold leading-5 sm:leading-7">
                        {car.brand} {car.model} {car.year}
                    </h2>

                    <div className="mt-3 sm:mt-4 flex items-end gap-1">
                        <span className="text-[22px] sm:text-[32px] lg:text-[44px] leading-none font-bold tracking-tight">
                            {car.pricePerDay ?? 78.9}
                        </span>
                        <span
                            className={`text-[11px] sm:text-[15px] lg:text-[18px] mb-1 ${
                                isDarkmodeEnabled ? "text-gray-300" : "text-gray-500"
                            }`}
                        >
                            /day
                        </span>
                    </div>

                    <div
                        className={`
                            mt-3 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-[14px] sm:rounded-[18px] lg:rounded-[20px] p-2 sm:p-3
                            ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#ececec]"}
                        `}
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[14px] sm:text-[18px]">◔</span>
                            <span className={`mt-1 sm:mt-2 text-[10px] sm:text-[13px] lg:text-[14px] ${isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}`}>
                                {car.mileage ?? "4,000"}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[14px] sm:text-[18px]">⚙</span>
                            <span className={`mt-1 sm:mt-2 text-[10px] sm:text-[13px] lg:text-[14px] ${isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}`}>
                                {car.transmission || "Auto"}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[14px] sm:text-[18px]">📍</span>
                            <span className={`mt-1 sm:mt-2 text-[10px] sm:text-[13px] lg:text-[14px] ${isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}`}>
                                {car.location || "Baku"}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[14px] sm:text-[18px]">▣</span>
                            <span className={`mt-1 sm:mt-2 text-[10px] sm:text-[13px] lg:text-[14px] ${isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}`}>
                                {car.fuelType || "Electric"}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>

            {isOwnCar ? (
                <div
                    className={`
                        mt-4 sm:mt-5 block w-full rounded-full py-2 sm:py-3
                        text-[13px] sm:text-[16px] lg:text-[18px]
                        font-medium text-center
                        ${
                            isDarkmodeEnabled
                                ? "bg-[#2a2a2a] text-gray-300"
                                : "bg-gray-300 text-gray-700"
                        }
                    `}
                >
                    My Car
                </div>
            ) : !hideRentButton ? (
                <Link
                    to={token ? `/rentals/${carId}` : "/login"}
                    state={token ? { rentalPrefill } : undefined}
                    className="
                        group relative overflow-hidden
                        mt-4 sm:mt-5 block w-full rounded-full py-2 sm:py-3
                        text-[13px] sm:text-[16px] lg:text-[18px]
                        font-medium text-center
                        bg-yellow-400 text-black
                        shadow-md hover:shadow-xl
                        hover:bg-yellow-500 hover:-translate-y-1
                        active:translate-y-0
                        transition-all duration-300 ease-in-out
                    "
                >
                    <span className="relative z-10">Rent Now</span>
                    <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
                </Link>
            ) : null}
        </div>
    )
}

export default Carcart