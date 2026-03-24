import { Link } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import defaultImage from "../assets/download.png"

const Carcart = ({ car }) => {
    const { isDarkmodeEnabled } = useDarkmode()

    const carId = car.id || car.carId
   const imagePath = car.mainImageUrl || car.imageUrl || car.image  
    const image = imagePath
        ? imagePath.startsWith("http")
            ? imagePath
            : `http://localhost:5248${imagePath}`
        : defaultImage

    return (
        <div
            className={`
                w-full max-w-[360px] rounded-[28px] p-3 border transition duration-300
                hover:-translate-y-1 hover:shadow-2xl
                ${isDarkmodeEnabled
                    ? "bg-[#111111] border-[#2a2a2a] text-white"
                    : "bg-[#f7f7f7] border-[#e5e5e5] text-black"
                }
            `}
        >
            <Link to={`/details/${carId}`} className="block">
                <div className="w-full h-[230px] rounded-[22px] overflow-hidden bg-gray-200">
                    <img
                        src={image}
                        alt={`${car.brand || ""} ${car.model || ""}`}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="px-3 pt-5">
                    <h2 className="text-[20px] font-semibold leading-7">
                        {car.brand} {car.model} {car.year}
                    </h2>

                    <div className="mt-4 flex items-end gap-1">
                        <span className="text-[44px] leading-none font-bold tracking-tight">
                            {car.pricePerDay ?? 78.9}
                        </span>
                        <span
                            className={`text-[18px] mb-1 ${
                                isDarkmodeEnabled ? "text-gray-300" : "text-gray-500"
                            }`}
                        >
                            /day
                        </span>
                    </div>

                    <div
                        className={`
                            mt-5 grid grid-cols-4 gap-2 rounded-[20px] p-3
                            ${isDarkmodeEnabled ? "bg-[#1a1a1a]" : "bg-[#ececec]"}
                        `}
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[18px]">◔</span>
                            <span className={`mt-2 text-[14px] ${isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}`}>
                                {car.mileage ?? "4,000"}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[18px]">⚙</span>
                            <span className={`mt-2 text-[14px] ${isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}`}>
                                {car.transmission || "Auto"}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[18px]">📍</span>
                            <span className={`mt-2 text-[14px] ${isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}`}>
                                {car.location || "Baku"}
                            </span>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-[18px]">▣</span>
                            <span className={`mt-2 text-[14px] ${isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}`}>
                                {car.fuelType || "Electric"}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>

            <Link
                to={`/details/${carId}`}
                className="
                    mt-5 block w-full rounded-full py-3 text-[18px] font-medium text-center
                    bg-yellow-400 text-black
                    hover:bg-yellow-500 hover:shadow-md
                    transition-all duration-300
                "
            >
                Rent Now
            </Link>
        </div>
    )
}

export default Carcart