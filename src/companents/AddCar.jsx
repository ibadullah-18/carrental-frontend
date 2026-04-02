import { useEffect, useMemo, useState } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useDarkmode } from "../stores/useDarkmode"
import { getAccessToken } from "../stores/auth"
import { REGION_OPTIONS } from "../data/regions"
import {
    BODY_TYPE_OPTIONS,
    CAR_BRANDS,
    COLOR_OPTIONS,
    FUEL_OPTIONS,
    TRANSMISSION_OPTIONS,
    YEAR_OPTIONS
} from "../data/carOptions"

const AddCar = () => {
    const { isDarkmodeEnabled } = useDarkmode()
    const token = getAccessToken()

    const [brand, setBrand] = useState("")
    const [model, setModel] = useState("")
    const [year, setYear] = useState("")
    const [pricePerDay, setPricePerDay] = useState("")
    const [fuelType, setFuelType] = useState("")
    const [transmission, setTransmission] = useState("")
    const [mileage, setMileage] = useState("")
    const [description, setDescription] = useState("")
    const [location, setLocation] = useState("")
    const [color, setColor] = useState("")
    const [bodyType, setBodyType] = useState("")
    const [images, setImages] = useState([])

    const [visibleBrandCount, setVisibleBrandCount] = useState(6)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const availableModels = useMemo(() => {
        const selectedBrand = CAR_BRANDS.find((item) => item.brand === brand)
        return selectedBrand ? selectedBrand.models : []
    }, [brand])

    useEffect(() => {
        setModel("")
    }, [brand])

    const handleImageChange = (e) => {
        const selectedFiles = Array.from(e.target.files || [])
        setImages(selectedFiles)
    }

    const imagePreviewUrls = useMemo(() => {
        return images.map((file) => ({
            file,
            url: URL.createObjectURL(file)
        }))
    }, [images])

    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach((item) => URL.revokeObjectURL(item.url))
        }
    }, [imagePreviewUrls])

    const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!token) {
        setError("You must be logged in")
        return
    }

    if (
        !brand ||
        !model ||
        !year ||
        !pricePerDay ||
        !fuelType ||
        !transmission ||
        !mileage ||
        !description ||
        !location ||
        !color ||
        !bodyType
    ) {
        setError("Please fill in all fields")
        return
    }

    try {
        setSubmitting(true)

        const carPayload = {
            brand,
            model,
            year: Number(year),
            pricePerDay: Number(pricePerDay),
            fuelType,
            transmission,
            mileage: Number(mileage),
            description,
            location,
            color,
            bodyType: Number(bodyType)
        }

        const createCarResponse = await fetch("http://localhost:5248/api/Cars", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(carPayload)
        })

        if (!createCarResponse.ok) {
            const errorText = await createCarResponse.text()
            throw new Error(errorText || "Car could not be created")
        }

        let carId = null
        const contentType = createCarResponse.headers.get("content-type") || ""

        if (contentType.includes("application/json")) {
            const createdCar = await createCarResponse.json()
            console.log("Created car response:", createdCar)

            carId =
                createdCar?.id ||
                createdCar?.carId ||
                createdCar?.Id ||
                createdCar?.data?.id ||
                createdCar?.data?.carId ||
                null
        } else {
            const responseText = await createCarResponse.text()
            console.log("Create car text response:", responseText)

            // Eger backend plain text qaytarirsa burda ID olmaya biler
            // Location header-dan id goturmeye calisiriq
            const locationHeader = createCarResponse.headers.get("location")
            console.log("Location header:", locationHeader)

            if (locationHeader) {
                const parts = locationHeader.split("/")
                carId = parts[parts.length - 1]
            }
        }

        if (!carId) {
            setSuccess("Car created successfully, but image upload requires returned car id")
        } else if (images.length > 0) {
            for (const image of images) {
                let imageUploaded = false

                // 1-ci variant
                try {
                    const formData = new FormData()
                    formData.append("file", image)

                    const imageResponse = await fetch(`http://localhost:5248/api/Cars/${carId}/images`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        body: formData
                    })

                    if (imageResponse.ok) {
                        imageUploaded = true
                    } else {
                        const imageErrorText = await imageResponse.text()
                        console.log("Upload with 'file' failed:", imageErrorText)
                    }
                } catch (err) {
                    console.log("Upload error with 'file':", err)
                }

                // 2-ci variant
                if (!imageUploaded) {
                    try {
                        const formData = new FormData()
                        formData.append("image", image)

                        const imageResponse = await fetch(`http://localhost:5248/api/Cars/${carId}/images`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                            body: formData
                        })

                        if (imageResponse.ok) {
                            imageUploaded = true
                        } else {
                            const imageErrorText = await imageResponse.text()
                            console.log("Upload with 'image' failed:", imageErrorText)
                        }
                    } catch (err) {
                        console.log("Upload error with 'image':", err)
                    }
                }

                // 3-cu variant
                if (!imageUploaded) {
                    try {
                        const formData = new FormData()
                        formData.append("images", image)

                        const imageResponse = await fetch(`http://localhost:5248/api/Cars/${carId}/images`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                            body: formData
                        })

                        if (imageResponse.ok) {
                            imageUploaded = true
                        } else {
                            const imageErrorText = await imageResponse.text()
                            console.log("Upload with 'images' failed:", imageErrorText)
                        }
                    } catch (err) {
                        console.log("Upload error with 'images':", err)
                    }
                }

                if (!imageUploaded) {
                    throw new Error("Car created, but image upload failed")
                }
            }

            setSuccess("Car created successfully with images")
        } else {
            setSuccess("Car created successfully")
        }

        setBrand("")
        setModel("")
        setYear("")
        setPricePerDay("")
        setFuelType("")
        setTransmission("")
        setMileage("")
        setDescription("")
        setLocation("")
        setColor("")
        setBodyType("")
        setImages([])
        setVisibleBrandCount(6)
    } catch (err) {
        console.log(err)
        setError(err.message || "Something went wrong")
    } finally {
        setSubmitting(false)
    }
}

    const visibleBrands = CAR_BRANDS.slice(0, visibleBrandCount)

    const inputClassName = `w-full p-3 rounded-xl outline-none border ${
        isDarkmodeEnabled
            ? "bg-white/10 border-white/20 text-white placeholder-gray-300"
            : "bg-black/5 border-black/10 text-black placeholder-gray-500"
    }`

    const cardClassName = isDarkmodeEnabled
        ? "bg-[#111111] border-[#2a2a2a] text-white"
        : "bg-[#f7f7f7] border-[#e5e5e5] text-black"

    return (
        <div className={`w-full min-h-screen ${isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>

            <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
                <div className={`rounded-[24px] sm:rounded-[28px] border p-5 sm:p-7 ${cardClassName}`}>
                    <h1 className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-center">
                        Add New Car
                    </h1>
                    <p className={`text-center mt-3 text-sm sm:text-base ${isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"}`}>
                        Fill in the details and publish your car
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
                    <div className="xl:col-span-5">
                        <div className={`rounded-[24px] sm:rounded-[28px] border p-4 sm:p-6 ${cardClassName}`}>
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <h2 className="text-xl sm:text-2xl font-bold">
                                    Select Brand
                                </h2>
                                <div className={`text-sm ${isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"}`}>
                                    {brand || "No brand selected"}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {visibleBrands.map((item) => {
                                    const isSelected = brand === item.brand

                                    return (
                                        <button
                                            key={item.brand}
                                            type="button"
                                            onClick={() => setBrand(item.brand)}
                                            className={`
                                                rounded-[18px] border p-4 text-center font-semibold transition-all duration-300
                                                hover:-translate-y-1 hover:shadow-xl
                                                ${
                                                    isSelected
                                                        ? "bg-yellow-400 text-black border-yellow-400"
                                                        : isDarkmodeEnabled
                                                        ? "bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#202020]"
                                                        : "bg-white border-[#dddddd] text-black hover:bg-[#fafafa]"
                                                }
                                            `}
                                        >
                                            <div className="text-base sm:text-lg">{item.brand}</div>
                                        </button>
                                    )
                                })}
                            </div>

                            {visibleBrandCount < CAR_BRANDS.length && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setVisibleBrandCount((prev) => prev + 6)}
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
                        </div>

                        <div className={`rounded-[24px] sm:rounded-[28px] border p-4 sm:p-6 mt-6 ${cardClassName}`}>
                            <h2 className="text-xl sm:text-2xl font-bold mb-4">
                                Upload Images
                            </h2>

                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className={inputClassName}
                            />

                            {imagePreviewUrls.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                                    {imagePreviewUrls.map((item, index) => (
                                        <div
                                            key={`${item.file.name}-${index}`}
                                            className={`rounded-[18px] overflow-hidden border ${
                                                isDarkmodeEnabled
                                                    ? "border-[#2a2a2a] bg-[#1a1a1a]"
                                                    : "border-[#e5e5e5] bg-white"
                                            }`}
                                        >
                                            <img
                                                src={item.url}
                                                alt={`preview-${index}`}
                                                className="w-full h-[140px] sm:h-[180px] object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="xl:col-span-7">
                        <div className={`rounded-[24px] sm:rounded-[28px] border p-4 sm:p-6 ${cardClassName}`}>
                            <h2 className="text-xl sm:text-2xl font-bold mb-6">
                                Car Details
                            </h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Brand
                                        </label>
                                        <input
                                            type="text"
                                            value={brand}
                                            readOnly
                                            placeholder="Select a brand from the left"
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Model
                                        </label>
                                        <select
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                            className={inputClassName}
                                            disabled={!brand}
                                        >
                                            <option value="">
                                                {brand ? "Select model" : "Select brand first"}
                                            </option>
                                            {availableModels.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Year
                                        </label>
                                        <select
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            className={inputClassName}
                                        >
                                            <option value="">Select year</option>
                                            {YEAR_OPTIONS.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Fuel Type
                                        </label>
                                        <select
                                            value={fuelType}
                                            onChange={(e) => setFuelType(e.target.value)}
                                            className={inputClassName}
                                        >
                                            <option value="">Select fuel type</option>
                                            {FUEL_OPTIONS.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Transmission
                                        </label>
                                        <select
                                            value={transmission}
                                            onChange={(e) => setTransmission(e.target.value)}
                                            className={inputClassName}
                                        >
                                            <option value="">Select transmission</option>
                                            {TRANSMISSION_OPTIONS.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Color
                                        </label>
                                        <select
                                            value={color}
                                            onChange={(e) => setColor(e.target.value)}
                                            className={inputClassName}
                                        >
                                            <option value="">Select color</option>
                                            {COLOR_OPTIONS.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Region
                                        </label>
                                        <select
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className={inputClassName}
                                        >
                                            <option value="">Select region</option>
                                            {REGION_OPTIONS.map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Body Type
                                        </label>
                                        <select
                                            value={bodyType}
                                            onChange={(e) => setBodyType(e.target.value)}
                                            className={inputClassName}
                                        >
                                            <option value="">Select body type</option>
                                            {BODY_TYPE_OPTIONS.map((item) => (
                                                <option key={item.value} value={item.value}>
                                                    {item.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Price Per Day
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={pricePerDay}
                                            onChange={(e) => setPricePerDay(e.target.value)}
                                            placeholder="Enter daily price"
                                            className={inputClassName}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-sm sm:text-base">
                                            Mileage
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={mileage}
                                            onChange={(e) => setMileage(e.target.value)}
                                            placeholder="Enter mileage"
                                            className={inputClassName}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm sm:text-base">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write a short description"
                                        rows={6}
                                        className={`${inputClassName} resize-none`}
                                    />
                                </div>

                                {error && (
                                    <div className={`rounded-xl px-4 py-3 text-sm ${
                                        isDarkmodeEnabled
                                            ? "bg-red-500/10 text-red-300 border border-red-500/20"
                                            : "bg-red-50 text-red-600 border border-red-200"
                                    }`}>
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className={`rounded-xl px-4 py-3 text-sm ${
                                        isDarkmodeEnabled
                                            ? "bg-green-500/10 text-green-300 border border-green-500/20"
                                            : "bg-green-50 text-green-600 border border-green-200"
                                    }`}>
                                        {success}
                                    </div>
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
                                        {submitting ? "Processing..." : "Create Car"}
                                    </span>
                                    <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default AddCar