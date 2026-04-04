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
                    "Basket masinlarini yuklemek olmadi"
                )
            }

            if (Array.isArray(data)) setCartItems(data)
            else if (Array.isArray(data?.items)) setCartItems(data.items)
            else if (Array.isArray(data?.data)) setCartItems(data.data)
            else if (Array.isArray(data?.$values)) setCartItems(data.$values)
            else setCartItems([])
        } catch (error) {
            console.log("Cart xeta:", error)
            setError(error.message || "Basket masinlarini yuklemek olmadi")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getCart()
    }, [])

    const visibleItems = cartItems.slice(0, visibleCount)

    return (
        <div
            className={`min-h-screen py-10 ${
                isDarkmodeEnabled ? "bg-[#0f0f0f] text-white" : "bg-[#f5f5f5]"
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
                            Basket cars yoxdur
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
    )
}

export default Basket