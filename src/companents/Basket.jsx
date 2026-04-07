import { useEffect, useState } from "react"
import { useDarkmode } from "../stores/useDarkmode"
import { apiFetch } from "../utils/apiFetch"
import Carcart from "../companents/Carcart"

const Basket = () => {
    const { isDarkmodeEnabled } = useDarkmode()

    const [cartItems, setCartItems] = useState([])
    const [visibleCount, setVisibleCount] = useState(6)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [deleteLoadingId, setDeleteLoadingId] = useState(null)

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedItemId, setSelectedItemId] = useState(null)

    const getCart = async () => {
        try {
            setLoading(true)
            setError("")

            const response = await apiFetch("/api/Cart", {
                method: "GET"
            })

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.Message ||
                    "Failed to load basket cars"
                )
            }

            if (Array.isArray(data)) setCartItems(data)
            else if (Array.isArray(data?.items)) setCartItems(data.items)
            else if (Array.isArray(data?.data)) setCartItems(data.data)
            else if (Array.isArray(data?.$values)) setCartItems(data.$values)
            else setCartItems([])
        } catch (error) {
            console.log("Cart error:", error)
            setError(error.message || "Failed to load basket cars")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getCart()
    }, [])

    const openDeleteModal = (itemId) => {
        setSelectedItemId(itemId)
        setShowDeleteModal(true)
    }

    const closeDeleteModal = () => {
        if (deleteLoadingId) return
        setShowDeleteModal(false)
        setSelectedItemId(null)
    }

    const handleDeleteCartItem = async () => {
        if (!selectedItemId) return

        try {
            setDeleteLoadingId(selectedItemId)

            const response = await apiFetch(`/api/Cart/items/${selectedItemId}`, {
                method: "DELETE"
            })

            const data = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.Message ||
                    "Failed to remove the car from basket"
                )
            }

            setCartItems((prev) => prev.filter((item) => item.id !== selectedItemId))
            setShowDeleteModal(false)
            setSelectedItemId(null)
        } catch (error) {
            console.log("Delete cart item error:", error)
            setError(error.message || "Failed to remove the car from basket")
        } finally {
            setDeleteLoadingId(null)
        }
    }

    const visibleItems = cartItems.slice(0, visibleCount)

    return (
        <>
            <div
                className={`min-h-screen py-10 ${
                    isDarkmodeEnabled
                        ? "bg-[#0f0f0f] text-white"
                        : "bg-[#f5f5f5] text-black"
                }`}
            >
                <div className="max-w-[1400px] mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-8 text-center">
                        Basket Cars
                    </h1>

                    {loading && (
                        <div className="flex justify-center py-16">
                            <p className="text-lg font-semibold">Loading...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex justify-center py-10">
                            <p className="text-red-500 font-semibold">{error}</p>
                        </div>
                    )}

                    {!loading && !error && cartItems.length === 0 && (
                        <div className="flex justify-center py-10">
                            <p className="text-lg font-semibold">
                                No cars in basket
                            </p>
                        </div>
                    )}

                    {!loading && !error && cartItems.length > 0 && (
                        <>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                                {visibleItems.map((item) => (
                                    <Carcart
                                        key={item.id || item.carId}
                                        car={item}
                                        showDeleteButton={true}
                                        onDeleteClick={() => openDeleteModal(item.id)}
                                        deleteLoading={deleteLoadingId === item.id}
                                    />
                                ))}
                            </div>

                            {visibleCount < cartItems.length && (
                                <div className="flex justify-center mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setVisibleCount((prev) => prev + 6)}
                                        className="
                                            relative overflow-hidden
                                            px-6 sm:px-8 py-3 rounded-full
                                            bg-yellow-400 text-black font-bold
                                            shadow-md hover:shadow-xl
                                            hover:-translate-y-1
                                            active:translate-y-0
                                            transition-all duration-300 ease-in-out
                                            before:absolute before:top-0 before:left-[-100%]
                                            before:w-full before:h-full
                                            before:bg-white/30
                                            before:skew-x-12
                                            before:transition-all before:duration-500
                                            hover:before:left-[120%]
                                        "
                                    >
                                        <span className="relative z-10">Load More</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
                        onClick={closeDeleteModal}
                    ></div>

                    <div
                        className={`relative z-10 w-full max-w-[340px] sm:max-w-[400px] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-2xl border animate-[modalFade_0.25s_ease] ${
                            isDarkmodeEnabled
                                ? "bg-[#171717] border-[#2c2c2c] text-white"
                                : "bg-white border-[#e8e8e8] text-black"
                        }`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center ${
                                    isDarkmodeEnabled
                                        ? "bg-red-500/15"
                                        : "bg-red-100"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6 sm:w-7 sm:h-7 text-red-500"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9 3.75A2.25 2.25 0 0 1 11.25 1.5h1.5A2.25 2.25 0 0 1 15 3.75V4.5h4.125a.75.75 0 0 1 0 1.5h-.634l-.84 12.593A2.25 2.25 0 0 1 15.406 20.7H8.594a2.25 2.25 0 0 1-2.245-2.107L5.509 6H4.875a.75.75 0 0 1 0-1.5H9V3.75ZM10.5 4.5h3V3.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V4.5Zm-1.446 4.97a.75.75 0 0 1 .75.696l.5 6.75a.75.75 0 1 1-1.496.108l-.5-6.75a.75.75 0 0 1 .696-.804Zm5.892 0a.75.75 0 0 1 .696.804l-.5 6.75a.75.75 0 1 1-1.496-.108l.5-6.75a.75.75 0 0 1 .8-.696ZM12 9.375a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>

                            <div>
                                <h2 className="text-[18px] sm:text-[20px] font-bold leading-tight">
                                    Remove from Basket
                                </h2>
                                <p
                                    className={`text-[12px] sm:text-[13px] mt-1 ${
                                        isDarkmodeEnabled
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                    }`}
                                >
                                    This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <p
                            className={`text-[14px] sm:text-[15px] leading-6 mb-6 ${
                                isDarkmodeEnabled
                                    ? "text-gray-300"
                                    : "text-gray-600"
                            }`}
                        >
                            Are you sure you want to remove this car from your basket?
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={!!deleteLoadingId}
                                className={`w-full rounded-full py-3 font-semibold transition-all duration-300 ${
                                    isDarkmodeEnabled
                                        ? "bg-[#262626] text-white hover:bg-[#303030]"
                                        : "bg-[#f1f1f1] text-black hover:bg-[#e7e7e7]"
                                } ${deleteLoadingId ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteCartItem}
                                disabled={!!deleteLoadingId}
                                className={`w-full rounded-full py-3 font-semibold transition-all duration-300 bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-xl ${
                                    deleteLoadingId ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                            >
                                {deleteLoadingId ? "Removing..." : "Yes, Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    @keyframes modalFade {
                        0% {
                            opacity: 0;
                            transform: scale(0.92) translateY(10px);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }
                `}
            </style>
        </>
    )
}

export default Basket