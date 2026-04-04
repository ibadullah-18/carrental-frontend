import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";
import { apiFetch } from "../utils/apiFetch";

const API_BASE = "http://localhost:5248";

const MyCars = () => {
  const navigate = useNavigate();
  const { isDarkmodeEnabled } = useDarkmode();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);

  const [uploadingCarId, setUploadingCarId] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [settingMainImageId, setSettingMainImageId] = useState(null);

  const fileInputRefs = useRef({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const getImageUrl = (path) => {
    if (!path) return "https://placehold.co/600x400?text=No+Image";

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const normalizeCars = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const fetchMyCars = async () => {
    try {
      setLoading(true);
      setPageError("");


      const response = await apiFetch("/api/Cars/my-cars", {
        method: "GET",
        headers: {
            Accept: "*/*",
        },
        });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.Message || "My cars gelmedi");
      }

      const normalizedCars = normalizeCars(data);
      setCars(normalizedCars);
    } catch (error) {
      console.log("MyCars xeta:", error);
      setPageError(error.message || "Masinlar getirilende xeta bas verdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCars();
  }, []);

  const handleCardClick = (carId) => {
    navigate(`/details/${carId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openFilePicker = (carId) => {
    if (fileInputRefs.current[carId]) {
      fileInputRefs.current[carId].click();
    }
  };

  const handleUploadImages = async (carId, files) => {
    if (!files || files.length === 0) return;

    try {
      setUploadingCarId(carId);

    const formData = new FormData();

    Array.from(files).forEach((file) => {
    formData.append("images", file);
    });

    const response = await apiFetch(`/api/Cars/${carId}/images`, {
    method: "POST",
    body: formData,
    });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.Message || "Sekil upload olmadi");
      }

      showToast("Images uploaded successfully", "success");
      await fetchMyCars();
    } catch (error) {
      console.log("Upload xeta:", error);
      showToast(error.message || "Image upload zamani xeta bas verdi", "error");
    } finally {
      setUploadingCarId(null);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      setDeletingImageId(imageId);

      const response = await apiFetch(`/api/Cars/images/${imageId}`, {
        method: "DELETE",
        headers: {
            Accept: "*/*",
        },
        });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.Message || "Sekil silinmedi");
      }

      showToast("Image deleted successfully", "success");
      await fetchMyCars();
    } catch (error) {
      console.log("Delete image xeta:", error);
      showToast(error.message || "Image silinen zaman xeta bas verdi", "error");
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      setSettingMainImageId(imageId);

        const response = await apiFetch(`/api/Cars/images/${imageId}/set-main`, {
        method: "PUT",
        headers: {
            Accept: "*/*",
        },
        });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || data?.Message || "Main image teyin olmadi");
      }

      showToast("Main image updated successfully", "success");
      await fetchMyCars();
    } catch (error) {
      console.log("Set main image xeta:", error);
      showToast(
        error.message || "Main image deyisdirilen zaman xeta bas verdi",
        "error"
      );
    } finally {
      setSettingMainImageId(null);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${
          isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading your cars...</p>
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
            className={`px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-sm sm:text-base font-semibold animate-[fadeIn_.25s_ease] ${
              toast.type === "success"
                ? "bg-green-500/90 text-white border-green-300"
                : "bg-red-500/90 text-white border-red-300"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              My Cars
            </h1>
            <p
              className={`mt-2 text-sm sm:text-base ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Here you can manage your own cars and their images.
            </p>
          </div>

          <button
            onClick={fetchMyCars}
            className="relative overflow-hidden px-4 sm:px-5 py-2.5 rounded-xl bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
          >
            Refresh
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
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No cars found</h2>
            <p
              className={`text-sm sm:text-base ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              You do not have any cars yet.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {cars.map((car) => {
            const images = Array.isArray(car.images)
              ? car.images
              : Array.isArray(car.Images)
              ? car.Images
              : Array.isArray(car?.images?.$values)
              ? car.images.$values
              : Array.isArray(car?.Images?.$values)
              ? car.Images.$values
              : [];

            const mainImage =
              images.find((img) => img.isMain || img.IsMain) ||
              images[0] ||
              null;

            return (
              <div
                key={car.id || car.Id}
                className={`rounded-[22px] overflow-hidden border shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
                  isDarkmodeEnabled
                    ? "bg-[#1a1a1a] border-white/10"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                  onClick={() => handleCardClick(car.id || car.Id)}
                >
                  <img
                    src={getImageUrl(
                      mainImage?.imageUrl ||
                        mainImage?.ImageUrl ||
                        car.mainImageUrl ||
                        car.MainImageUrl
                    )}
                    alt={`${car.brand || car.Brand} ${car.model || car.Model}`}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent"></div>

                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-white font-bold text-sm sm:text-base line-clamp-1">
                        {car.brand || car.Brand} {car.model || car.Model}
                      </h2>
                      <span className="bg-yellow-400 text-black text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                        {car.year || car.Year}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 md:p-4">
                  <div className="space-y-1 mb-3">
                    <p
                      className={`text-xs sm:text-sm ${
                        isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span className="font-semibold">Price:</span>{" "}
                      {car.pricePerDay || car.PricePerDay} AZN/day
                    </p>

                    <p
                      className={`text-xs sm:text-sm ${
                        isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span className="font-semibold">Location:</span>{" "}
                      {car.location || car.Location}
                    </p>

                    <p
                      className={`text-xs sm:text-sm ${
                        isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      <span className="font-semibold">Images:</span> {images.length}
                    </p>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    ref={(el) => {
                      fileInputRefs.current[car.id || car.Id] = el;
                    }}
                    onChange={(e) =>
                      handleUploadImages(car.id || car.Id, e.target.files)
                    }
                  />

                 <button
                    onClick={() => navigate(`/update-car/${car.id || car.Id}`)}
                    className="w-full relative overflow-hidden px-3 py-2.5 rounded-xl bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out text-xs sm:text-sm before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
                    >
                    Update
                </button>

                  {images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {images.map((image) => {
                        const imageId = image.id || image.Id;
                        const isMain = image.isMain || image.IsMain;

                        return (
                          <div
                            key={imageId}
                            className={`rounded-xl overflow-hidden border ${
                              isDarkmodeEnabled
                                ? "border-white/10 bg-[#222222]"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="relative aspect-[4/3]">
                              <img
                                src={getImageUrl(image.imageUrl || image.ImageUrl)}
                                alt="car"
                                className="w-full h-full object-cover"
                              />

                              {isMain && (
                                <span className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                                  Main
                                </span>
                              )}
                            </div>

                            <div className="p-2 flex flex-col gap-1.5">
                              <button
                                onClick={() => handleSetMainImage(imageId)}
                                disabled={isMain || settingMainImageId === imageId}
                                className={`w-full text-[10px] sm:text-xs font-semibold py-1.5 rounded-lg transition ${
                                  isMain
                                    ? "bg-green-500 text-white cursor-default"
                                    : "bg-blue-500 text-white hover:opacity-90 disabled:opacity-60"
                                }`}
                              >
                                {settingMainImageId === imageId
                                  ? "Loading..."
                                  : isMain
                                  ? "Main Image"
                                  : "Set Main"}
                              </button>

                              <button
                                onClick={() => handleDeleteImage(imageId)}
                                disabled={deletingImageId === imageId}
                                className="w-full text-[10px] sm:text-xs font-semibold py-1.5 rounded-lg bg-red-500 text-white hover:opacity-90 transition disabled:opacity-60"
                              >
                                {deletingImageId === imageId
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={() => handleCardClick(car.id || car.Id)}
                    className={`w-full mt-3 px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                      isDarkmodeEnabled
                        ? "bg-white/10 hover:bg-white/20 text-white"
                        : "bg-black text-white hover:opacity-90"
                    }`}
                  >
                    View Details
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