import { useEffect, useState } from "react";
import { useDarkmode } from "../stores/useDarkmode";
import Navbar from "../companents/Navbar";
import Carcart from "../companents/Carcart";
import Loading from "../companents/Loading";
import Footer from "../companents/Footer";

const Homepage = () => {
    const [cars, setCars] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(
    window.innerWidth >= 1024 ? 6 : 4
);

    const { isDarkmodeEnabled } = useDarkmode();

    const getCars = async () => {
        try {
            const response = await fetch("http://localhost:5248/api/Cars");

            if (!response.ok) {
                throw new Error("Serverden melumat gelmedi");
            }

            const data = await response.json();
            console.log("Gelen data:", data);

            if (Array.isArray(data)) {
                setCars(data);
            } else if (Array.isArray(data.$values)) {
                setCars(data.$values);
            } else if (Array.isArray(data.items)) {
                setCars(data.items);
            } else if (Array.isArray(data.data)) {
                setCars(data.data);
            } else {
                setCars([]);
            }
        } catch (err) {
            console.log("Xeta:", err);
            setError("Masinlari getirerken xeta bas verdi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCars();
    }, []);

const handleLoadMore = () => {
    if (window.innerWidth >= 1024) {
        setVisibleCount((prev) => prev + 6);
    } else {
        setVisibleCount((prev) => prev + 4);
    }
};

if (loading) return <Loading />;

if (error) {
    return (
        <div className={`w-full min-h-screen ${isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
            <Navbar />
            <div className="flex justify-center items-center mt-16 sm:mt-20 text-red-500 text-base sm:text-xl px-4 text-center">
                {error}
            </div>
        </div>
    );
}

return (
    <div className={`w-full min-h-screen ${isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
        <Navbar />

        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-5 justify-items-center">
                {cars.slice(0, visibleCount).map((car) => (
                    <Carcart
                        key={car.id || car.carId}
                        car={car}
                    />
                ))}
            </div>

            {visibleCount < cars.length && (
                <div className="flex justify-center mt-8 sm:mt-10">
                    <button
                        onClick={handleLoadMore}
                        className="
                            relative overflow-hidden
                            px-6 sm:px-8 py-2.5 sm:py-3 rounded-full
                            bg-yellow-400 text-black font-semibold
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
        </div>

        <div className="mt-14 sm:mt-16 lg:mt-20">
            <Footer />
        </div>
    </div>
);
};

export default Homepage;