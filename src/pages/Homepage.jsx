import { useEffect, useState } from "react";
import { useDarkmode } from "../stores/useDarkmode";
import Navbar from "../companents/Navbar";
import Carcart from "../companents/Carcart";
import Loading from "../companents/Loading";

const Homepage = () => {
    const [cars, setCars] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(9);

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
        setVisibleCount((prev) => prev + 9);
    };

    if (loading) return <Loading />;

    if (error) {
        return (
            <div className={`w-full min-h-screen ${isDarkmodeEnabled ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
                <Navbar />
                <div className="flex justify-center items-center mt-20 text-red-500 text-xl">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full min-h-screen ${isDarkmodeEnabled ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
            <Navbar />

        <div className="max-w-[1250px] mx-auto px-6 pt-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {cars.slice(0, visibleCount).map((car) => (
                    <Carcart
                        key={car.id || car.carId}
                        car={car}
                    />
                ))}
            </div>

            {visibleCount < cars.length && (
                <div className="flex justify-center mt-10">
                    <button
                        onClick={handleLoadMore}
                        className="px-8 py-3 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>

            <div className="mt-20">
                {/* <Footer /> */}
            </div>
        </div>
    );
};

export default Homepage;