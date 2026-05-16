import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";
import Carcart from "../companents/Carcart";
import Loading from "../companents/Loading";
import Footer from "../companents/Footer";
import BMW from "../assets/BMW.png";
import Info from "../companents/Info";
import { apiFetch } from "../utils/apiFetch";

const Homepage = () => {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [canSearchByPlate, setCanSearchByPlate] = useState(false);

  const [visibleCount, setVisibleCount] = useState(
    window.innerWidth >= 1024 ? 6 : 4
  );

  const { isDarkmodeEnabled } = useDarkmode();

  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.$values)) return data.$values;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const isLoggedIn = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("accessToken");

    return !!token;
  };

  const isVipCar = (car) => {
    return Boolean(
      car?.isVip ||
        car?.isVIP ||
        car?.vip ||
        car?.isFeatured ||
        car?.featured ||
        car?.packageType === "VIP" ||
        car?.packageName === "VIP" ||
        car?.package?.name === "VIP" ||
        car?.package?.type === "VIP"
    );
  };

  const getViewCount = (car) => {
    return Number(
      car?.viewCount ??
        car?.viewsCount ??
        car?.views ??
        car?.view ??
        car?.baxisSayi ??
        car?.baxishSayi ??
        0
    );
  };

  const sortedCars = useMemo(() => {
    return [...cars].sort((a, b) => {
      const vipA = isVipCar(a) ? 1 : 0;
      const vipB = isVipCar(b) ? 1 : 0;

      if (vipA !== vipB) return vipB - vipA;

      return getViewCount(b) - getViewCount(a);
    });
  }, [cars]);

  const getCars = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/Cars", { method: "GET" });

      if (!response.ok) {
        throw new Error("Serverdən məlumat gəlmədi");
      }

      const data = await response.json();
      setCars(normalizeArray(data));
    } catch (err) {
      console.log(err);
      setError("Maşınları gətirərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const checkPlateSearchPermission = async () => {
    if (!isLoggedIn()) {
      setCanSearchByPlate(false);
      return;
    }

    try {
      const response = await apiFetch("/api/Cars/search?plate=0000000", {
        method: "GET",
      });

      if (response.status === 401 || response.status === 403) {
        setCanSearchByPlate(false);
        return;
      }

      setCanSearchByPlate(response.ok);
    } catch {
      setCanSearchByPlate(false);
    }
  };

  useEffect(() => {
    getCars();
    checkPlateSearchPermission();
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + (window.innerWidth >= 1024 ? 6 : 4));
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div
        className={`w-full min-h-screen ${
          isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
        }`}
      >
        <div className="flex justify-center items-center mt-20 text-red-500 text-xl">
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
      <section className="w-full bg-black overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10">
          <div className="rounded-[18px] sm:rounded-[22px] bg-black text-white overflow-hidden px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10 lg:pt-12">
            <div className="max-w-[850px] mx-auto text-center">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                Öz maşınını paylaş,
                <br className="hidden sm:block" />
                hər kəsə göstər
              </h1>

              <p className="mt-4 text-sm sm:text-base lg:text-lg text-gray-300 max-w-[700px] mx-auto leading-7">
                İstifadəçilər öz maşınlarını əlavə edir, digər insanlar isə
                maşınlara baxıb onları kəşf edir.
              </p>
            </div>

            <div className="mt-3 sm:mt-5 flex justify-center">
              <img
                src={BMW}
                alt="BMW"
                className="w-full max-w-[1100px] h-[170px] sm:h-[250px] lg:h-[320px] object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 sm:mb-6">
          <h2 className="text-xl sm:text-3xl font-bold">Mövcud maşınlar</h2>

          {canSearchByPlate && (
            <Link
              to="/search-plate"
              className="
                group inline-flex items-center gap-3
                rounded-2xl bg-black px-4 py-3
                text-white shadow-lg
                hover:-translate-y-1 hover:shadow-2xl
                active:scale-95 transition-all duration-300
              "
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-black text-lg">
                🇦🇿
              </span>

              <span className="text-left">
                <span className="block text-sm font-bold leading-none">
                  Nömrə ilə axtar
                </span>
                <span className="block mt-1 text-xs text-white/60">
                  10 AA 010
                </span>
              </span>

              <span className="text-xl transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          )}
        </div>

        {sortedCars.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-lg font-medium">
            Maşın tapılmadı
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-5 justify-items-center">
            {sortedCars.slice(0, visibleCount).map((car) => (
              <Carcart key={car.id || car.carId} car={car} />
            ))}
          </div>
        )}

        {visibleCount < sortedCars.length && (
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
              "
            >
              Daha çox göstər
            </button>
          </div>
        )}
      </div>

      <Info />
      <Footer />
    </div>
  );
};

export default Homepage;