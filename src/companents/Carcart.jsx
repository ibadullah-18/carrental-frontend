import { Link } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import defaultImage from "../assets/download.png"
import { getAccessToken, getUserIdFromToken } from "../stores/auth"

const Carcart = ({ car }) => {
    const { isDarkmodeEnabled } = useDarkmode()

    const carId = car.id || car.carId
    const token = getAccessToken()

    const currentUserId = getUserIdFromToken()
    const ownerId = car.ownerId || car.OwnerId
    const isOwnCar = ownerId === currentUserId

    const imagePath = car.mainImageUrl || car.imageUrl || car.image
    const image = imagePath
        ? imagePath.startsWith("http")
            ? imagePath
            : `http://localhost:5248${imagePath}`
        : defaultImage

    return (
        <div
            className={`
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
            ) : (
                <Link
                    to={token ? `/rentals/${carId}` : "/login"}
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
            )}
        </div>
    )
}

export default Carcart