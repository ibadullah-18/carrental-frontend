import { useEffect, useMemo, useState } from "react"
import { useDarkmode } from "../stores/useDarkmode"
import { getAccessToken, getUserIdFromToken } from "../stores/auth"
import Carcart from "../companents/Carcart"

const Basket = () => {
    const { isDarkmodeEnabled } = useDarkmode()

    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [visibleCount, setVisibleCount] = useState(6)
    const [deleteLoadingId, setDeleteLoadingId] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [selectedDeleteItem, setSelectedDeleteItem] = useState(null)

    const token = getAccessToken()
    const currentUserId = getUserIdFromToken()

    const getCart = async () => {
        try {
            setLoading(true)
            setError("")

            const response = await fetch("http://localhost:5248/api/Cart", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error("Sebet melumatlari getirile bilmedi")
            }

            const data = await response.json()
            console.log("Cart data:", data)

            let items = []

            if (Array.isArray(data)) {
                items = data
            } else if (Array.isArray(data?.items)) {
                items = data.items
            } else if (Array.isArray(data?.data)) {
                items = data.data
            } else if (Array.isArray(data?.$values)) {
                items = data.$values
            } else if (Array.isArray(data?.cartItems)) {
                items = data.cartItems
            } else if (Array.isArray(data?.cart?.items)) {
                items = data.cart.items
            }

            // User oz masini sebete elave ede bilmir
            // her ehtimala qarsi frontde de filter edirik
            const filteredItems = items.filter((item) => {
                const ownerId = item.ownerId || item.OwnerId
                return ownerId !== currentUserId
            })

            setCartItems(filteredItems)
        } catch (err) {
            console.log(err)
            setError("Sebeti yuklemek olmadi")
        } finally {
            setLoading(false)
        }
    }

    const askDeleteItem = (itemId) => {
        setSelectedDeleteItem(itemId)
        setConfirmOpen(true)
    }

    const closeConfirm = () => {
        setConfirmOpen(false)
        setSelectedDeleteItem(null)
    }

    const removeCartItem = async () => {
        if (!selectedDeleteItem) return

        try {
            setDeleteLoadingId(selectedDeleteItem)

            const response = await fetch(
                `http://localhost:5248/api/Cart/items/${selectedDeleteItem}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (!response.ok) {
                throw new Error("Sebetden silmek olmadi")
            }

            setCartItems((prev) =>
                prev.filter((item) => (item.id || item.itemId) !== selectedDeleteItem)
            )

            closeConfirm()
        } catch (err) {
            console.log(err)
            setError("Sebetden silerken xeta bas verdi")
        } finally {
            setDeleteLoadingId(null)
        }
    }

    useEffect(() => {
        getCart()
    }, [])

    const visibleItems = useMemo(() => {
        return cartItems.slice(0, visibleCount)
    }, [cartItems, visibleCount])

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
                        Basket Cars
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

                {!loading && !error && cartItems.length === 0 && (
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
                        <div className="text-[34px] mb-3">🛒</div>
                        <h2 className="text-[20px] sm:text-[26px] font-semibold">
                            Sebet bosdur
                        </h2>
                        <p
                            className={`mt-2 text-[13px] sm:text-[15px] ${
                                isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                            }`}
                        >
                            Sebete elave etdiyin masinlar burada gorsenecek
                        </p>
                    </div>
                )}

                {!loading && !error && cartItems.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 justify-items-center">
                            {visibleItems.map((item) => (
                                <Carcart
                                    key={item.id || item.itemId || item.carId}
                                    car={item}
                                    showDeleteButton={true}
                                    deleteLoading={deleteLoadingId === (item.id || item.itemId)}
                                    onDeleteClick={() => askDeleteItem(item.id || item.itemId)}
                                    hideRentButton={false}
                                />
                            ))}
                        </div>

                        {visibleCount < cartItems.length && (
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

            {confirmOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4">
                    <div
                        className={`w-full max-w-[420px] rounded-[28px] border p-6 sm:p-7 shadow-2xl ${
                            isDarkmodeEnabled
                                ? "bg-[#151515] border-[#2b2b2b] text-white"
                                : "bg-white border-[#e7e7e7] text-black"
                        }`}
                    >
                        <div className="text-center">
                            <div className="text-[34px] mb-3">🗑️</div>
                            <h3 className="text-[22px] sm:text-[24px] font-bold">
                               Do you really want to delete it?
                            </h3>
                            <p
                                className={`mt-2 text-[14px] sm:text-[15px] ${
                                    isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                                }`}
                            >
                               This car will be removed from the cart.
                            </p>
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={closeConfirm}
                                className={`flex-1 rounded-full py-3 font-semibold transition ${
                                    isDarkmodeEnabled
                                        ? "bg-[#262626] text-white hover:bg-[#313131]"
                                        : "bg-gray-200 text-black hover:bg-gray-300"
                                }`}
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={removeCartItem}
                                disabled={!!deleteLoadingId}
                                className="flex-1 rounded-full py-3 font-semibold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60"
                            >
                                {deleteLoadingId ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Basket