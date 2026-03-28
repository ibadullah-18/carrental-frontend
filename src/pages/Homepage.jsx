import { useEffect, useState } from "react";
import { useDarkmode } from "../stores/useDarkmode";
import Navbar from "../companents/Navbar";
import Carcart from "../companents/Carcart";
import Loading from "../companents/Loading";
import Footer from "../companents/Footer";
import Filter from "../companents/Filter";
import BMW from "../assets/BMW.png";


const Homepage = () => {
  const [cars, setCars] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");

  const [visibleCount, setVisibleCount] = useState(
    window.innerWidth >= 1024 ? 6 : 4
  );

  const { isDarkmodeEnabled } = useDarkmode();

  const getCars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5248/api/Cars");

      if (!response.ok) {
        throw new Error("Serverden melumat gelmedi");
      }

      const data = await response.json();
      console.log("Gelen data:", data);

      let carsData = [];

      if (Array.isArray(data)) {
        carsData = data;
      } else if (Array.isArray(data.$values)) {
        carsData = data.$values;
      } else if (Array.isArray(data.items)) {
        carsData = data.items;
      } else if (Array.isArray(data.data)) {
        carsData = data.data;
      } else {
        carsData = [];
      }

      setAllCars(carsData);
      setCars(carsData);
    } catch (err) {
      console.log("Xeta:", err);
      setError("Masinlari getirerken xeta bas verdi");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCars = async () => {
  try {
    setFilterLoading(true);
    setError("");

    const params = new URLSearchParams();

    if (selectedBrand) {
      params.append("Brand", selectedBrand);
    }

    if (selectedBodyType) {
      params.append("BodyType", selectedBodyType);
    }

    const url = `http://localhost:5248/api/Cars/filter?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    });

    if (!response.ok) {
      throw new Error("Filterlenmis masinlar getirilmedi");
    }

    const data = await response.json();
    console.log("Filter gelen data:", data);

    let carsData = [];

    if (Array.isArray(data)) {
      carsData = data;
    } else if (Array.isArray(data.$values)) {
      carsData = data.$values;
    } else if (Array.isArray(data.items)) {
      carsData = data.items;
    } else if (Array.isArray(data.data)) {
      carsData = data.data;
    } else {
      carsData = [];
    }

    setCars(carsData);
    setVisibleCount(window.innerWidth >= 1024 ? 6 : 4);
  } catch (err) {
    console.log("Filter xetasi:", err);
    setError("Filter zamani xeta bas verdi");
  } finally {
    setFilterLoading(false);
  }
};

  useEffect(() => {
    getCars();
  }, []);

  useEffect(() => {
    if (!selectedBrand && !selectedBodyType) {
      setCars(allCars);
      return;
    }

    getFilteredCars();
  }, [selectedBrand, selectedBodyType]);

  const handleLoadMore = () => {
    if (window.innerWidth >= 1024) {
      setVisibleCount((prev) => prev + 6);
    } else {
      setVisibleCount((prev) => prev + 4);
    }
  };

  const clearFilters = () => {
    setSelectedBrand("");
    setSelectedBodyType("");
    setCars(allCars);
    setVisibleCount(window.innerWidth >= 1024 ? 6 : 4);
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div
        className={`w-full min-h-screen ${
          isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
        }`}
      >
        <Navbar />
        <div className="flex justify-center items-center mt-16 sm:mt-20 text-red-500 text-base sm:text-xl px-4 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-screen ${
        isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
      }`}
    >
      <Navbar />

      {/* HERO SECTION */}
      <section className="w-full bg-black overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10">
          <div className="rounded-[30px] sm:rounded-[40px] bg-black text-white relative overflow-hidden px-4 sm:px-8 lg:px-12 pt-10 sm:pt-14 lg:pt-16">
            <div className="max-w-[850px] mx-auto text-center">
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold leading-tight">
                Discover the world on wheels
                <br className="hidden sm:block" />
                with our car rental service
              </h1>
            </div>

            <div className="mt-8 sm:mt-10 lg:mt-12 flex justify-center">
              <img
                src={BMW}
                alt="BMW"
                className="w-full max-w-[1100px] object-contain"
              />
            </div>

           
          </div>
        </div>
      </section>

      {/* FILTER */}
      <Filter
        selectedBrand={selectedBrand}
        selectedBodyType={selectedBodyType}
        setSelectedBrand={setSelectedBrand}
        setSelectedBodyType={setSelectedBodyType}
        clearFilters={clearFilters}
      />

      {/* CARS */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-12">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-3xl font-bold">Available Cars</h2>
          <p className="text-sm sm:text-base text-gray-500">{cars.length} result</p>
        </div>

        {cars.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-lg font-medium">
            Masin tapilmadi
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-5 justify-items-center">
            {cars.slice(0, visibleCount).map((car) => (
              <Carcart key={car.id || car.carId} car={car} />
            ))}
          </div>
        )}

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