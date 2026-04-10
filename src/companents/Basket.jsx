import { useEffect, useState } from "react"
import { useDarkmode } from "../stores/useDarkmode"
import { apiFetch } from "../utils/apiFetch"
import Carcart from "../companents/Carcart"
import ConfirmModal from "../companents/ConfirmModal"

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

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Remove from Basket"
                message="Are you sure you want to remove this car from your basket?"
                confirmText={deleteLoadingId ? "Removing..." : "Yes, Remove"}
                cancelText="Cancel"
                onConfirm={handleDeleteCartItem}
                onCancel={closeDeleteModal}
                danger={true}
            />
        </>
    )
}

export default Basket