import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";
import { apiFetch } from "../utils/apiFetch";
import ConfirmModal from "../companents/ConfirmModal";
import defaultImage from "../assets/download.png";

const API_BASE = "https://localhost:52247";

const MyCars = () => {
  const navigate = useNavigate();
  const { isDarkmodeEnabled } = useDarkmode();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const normalizeCars = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const getImageUrl = (path) => {
    if (!path) return defaultImage;
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const getCarId = (car) => car?.id || car?.carId || car?.Id;

  const formatPlateNumber = (plateNumber) => {
    if (!plateNumber) return "—";
    return plateNumber.replace(/^(\d{2})([A-ZƏÖÜĞÇŞIİ]{1,3})(\d{2,4})$/i, "$1 $2 $3");
  };

  const getStatusInfo = (status) => {
    const value = Number(status);

    if (value === 1) {
      return { text: "Aktiv", className: "bg-green-500 text-white" };
    }

    if (value === 2) {
      return { text: "Gözləmədə", className: "bg-yellow-400 text-black" };
    }

    if (value === 3) {
      return { text: "Rədd edilib", className: "bg-red-500 text-white" };
    }

    if (value === 4) {
      return { text: "Passiv", className: "bg-gray-500 text-white" };
    }

    return { text: "Naməlum", className: "bg-gray-400 text-white" };
  };

  const fetchMyCars = async () => {
    try {
      setLoading(true);
      setPageError("");

      const response = await apiFetch("/api/Cars/my-cars", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.Message || "Maşınlar yüklənmədi"
        );
      }

      setCars(normalizeCars(data));
    } catch (error) {
      setPageError(error.message || "Maşınlar yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCars();
  }, []);

  const openDeleteModal = (car) => {
    setSelectedCar(car);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoadingId) return;
    setSelectedCar(null);
    setDeleteModalOpen(false);
  };

  const handleDeleteCar = async () => {
    const carId = getCarId(selectedCar);
    if (!carId) return;

    try {
      setDeleteLoadingId(carId);

      const response = await apiFetch(`/api/Cars/${carId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.Message || "Maşın silinmədi"
        );
      }

      setCars((prev) => prev.filter((car) => getCarId(car) !== carId));
      showToast("Maşın uğurla silindi", "success");
      closeDeleteModal();
    } catch (error) {
      showToast(error.message || "Silinmə zamanı xəta baş verdi", "error");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-red-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Maşınlar yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"
      }`}
    >
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999]">
          <div
            className={`px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Maşını sil"
        message="Bu maşını silmək istədiyinizə əminsiniz?"
        confirmText={deleteLoadingId ? "Silinir..." : "Bəli, sil"}
        cancelText="Xeyr"
        onConfirm={handleDeleteCar}
        onCancel={closeDeleteModal}
        danger
      />

      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Mənim maşınlarım
            </h1>
            <p
              className={`mt-2 text-sm sm:text-base ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Əlavə etdiyiniz maşınları buradan idarə edə bilərsiniz.
            </p>
          </div>

          <button
            onClick={fetchMyCars}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition"
          >
            Yenilə
          </button>
        </div>

        {pageError && (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-500/10 text-red-500 px-4 py-3 font-medium">
            {pageError}
          </div>
        )}

        {!pageError && cars.length === 0 && (
          <div
            className={`rounded-3xl border px-6 py-16 text-center ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-white/10"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Maşın tapılmadı
            </h2>
            <p className={isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}>
              Hələ heç bir maşın əlavə etməmisiniz.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {cars.map((car) => {
            const carId = getCarId(car);
            const statusInfo = getStatusInfo(car.status || car.Status);
            const imageUrl = getImageUrl(car.mainImageUrl || car.MainImageUrl);

            return (
              <div
                key={carId}
                className={`group rounded-[24px] overflow-hidden border shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
                  isDarkmodeEnabled
                    ? "bg-[#1a1a1a] border-white/10"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  onClick={() => navigate(`/details/${carId}`)}
                  className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                >
                  <img
                    src={imageUrl}
                    alt={`${car.brand || ""} ${car.model || ""}`}
                    onError={(e) => {
                      e.currentTarget.src = defaultImage;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>

                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full ${statusInfo.className}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>

                  {car.isVip && (
                    <div className="absolute top-3 right-3 bg-yellow-400 text-black text-[11px] font-black px-3 py-1 rounded-full">
                      VIP
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="text-white font-bold text-xl line-clamp-1">
                      {car.brand || "Marka"} {car.model || "Model"}
                    </h2>
                    <p className="text-white/85 text-sm mt-1">
                      {car.city || "Şəhər qeyd olunmayıb"}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <div
                    className={`rounded-2xl border px-4 py-3 ${
                      isDarkmodeEnabled
                        ? "bg-[#111111] border-white/10"
                        : "bg-[#f7f7f7] border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p
                          className={`text-[11px] uppercase tracking-wider ${
                            isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Dövlət nömrəsi
                        </p>
                        <h3 className="text-[18px] font-black tracking-[3px] mt-1">
                          {formatPlateNumber(car.plateNumber)}
                        </h3>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-[11px] uppercase tracking-wider ${
                            isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          İl
                        </p>
                        <h3 className="text-[18px] font-bold text-red-500 mt-1">
                          {car.year || "—"}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/update-car/${carId}`)}
                      className="h-[44px] rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-500 hover:-translate-y-1 transition"
                    >
                      Yenilə
                    </button>

                    <button
                      onClick={() => openDeleteModal(car)}
                      disabled={deleteLoadingId === carId}
                      className="h-[44px] rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 hover:-translate-y-1 transition disabled:opacity-60"
                    >
                      Sil
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/details/${carId}`)}
                    className={`mt-2 w-full h-[42px] rounded-xl border font-semibold transition ${
                      isDarkmodeEnabled
                        ? "border-white/10 hover:bg-white/10"
                        : "border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Ətraflı bax
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyCars;