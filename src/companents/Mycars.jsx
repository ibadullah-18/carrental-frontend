import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";
import { apiFetch } from "../utils/apiFetch";

const API_BASE = "http://localhost:5248";

const ACTIONS = {
  DEACTIVATE: "deactivate",
  ACTIVATE: "activate",
  HARD_DELETE: "hard-delete",
};

const MyCars = () => {
  const navigate = useNavigate();
  const { isDarkmodeEnabled } = useDarkmode();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [actionLoadingCarId, setActionLoadingCarId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
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
        throw new Error(data?.message || data?.Message || "My cars could not be loaded");
      }

      setCars(normalizeCars(data));
    } catch (error) {
      console.log("MyCars error:", error);
      setPageError(error.message || "An error occurred while loading cars");
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

  const getStatusKey = (statusValue) => {
    return String(statusValue || "").trim().toLowerCase();
  };

  const isAvailableStatus = (statusValue) => {
    const status = getStatusKey(statusValue);
    return status === "available" || status === "active";
  };

  const isPassiveStatus = (statusValue) => {
    const status = getStatusKey(statusValue);
    return status === "passive" || status === "inactive";
  };

  const isRentedStatus = (statusValue) => {
    const status = getStatusKey(statusValue);
    return status === "rented";
  };

  const getStatusInfo = (statusValue) => {
    const status = getStatusKey(statusValue);

    if (status === "available" || status === "active") {
      return {
        text: "Available",
        className: "bg-green-500 text-white border-green-300/40",
      };
    }

    if (status === "passive" || status === "inactive") {
      return {
        text: "Passive",
        className: "bg-gray-500 text-white border-gray-300/40",
      };
    }

    if (status === "rented") {
      return {
        text: "Rented",
        className: "bg-red-500 text-white border-red-300/40",
      };
    }

    return {
      text: statusValue || "Unknown",
      className: isDarkmodeEnabled
        ? "bg-white/10 text-white border-white/10"
        : "bg-gray-200 text-black border-gray-300",
    };
  };

  const openActionModal = (car, action) => {
    setSelectedCar(car);
    setSelectedAction(action);
    setActionModalOpen(true);
  };

  const closeActionModal = () => {
    if (actionLoadingCarId) return;
    setActionModalOpen(false);
    setSelectedCar(null);
    setSelectedAction(null);
  };

  const getActionModalContent = () => {
    if (selectedAction === ACTIONS.DEACTIVATE) {
      return {
        title: "Deactivate Car",
        message: "Are you sure you want to deactivate this car?",
        confirmText: "Yes, Deactivate",
        confirmClass:
          "bg-orange-500 text-white shadow-md hover:shadow-xl hover:-translate-y-1",
      };
    }

    if (selectedAction === ACTIONS.ACTIVATE) {
      return {
        title: "Activate Car",
        message: "Are you sure you want to activate this car?",
        confirmText: "Yes, Activate",
        confirmClass:
          "bg-green-500 text-white shadow-md hover:shadow-xl hover:-translate-y-1",
      };
    }

    return {
      title: "Delete Permanently",
      message: "Are you sure you want to permanently delete this car?",
      confirmText: "Yes, Delete",
      confirmClass:
        "bg-red-500 text-white shadow-md hover:shadow-xl hover:-translate-y-1",
    };
  };

  const handleConfirmAction = async () => {
    const carId = selectedCar?.id || selectedCar?.Id;
    const statusValue = selectedCar?.status || selectedCar?.Status;

    if (!carId || !selectedAction) return;

    try {
      setActionLoadingCarId(carId);

      let endpoint = "";
      let method = "DELETE";
      let successMessage = "";

      if (selectedAction === ACTIONS.DEACTIVATE) {
        if (!isAvailableStatus(statusValue)) {
          throw new Error("Only available cars can be deactivated");
        }
        endpoint = `/api/Cars/${carId}`;
        method = "DELETE";
        successMessage = "Car deactivated successfully";
      }

      if (selectedAction === ACTIONS.ACTIVATE) {
        if (!isPassiveStatus(statusValue)) {
          throw new Error("Only passive cars can be activated");
        }
        endpoint = `/api/Cars/${carId}/activate`;
        method = "PUT";
        successMessage = "Car activated successfully";
      }

      if (selectedAction === ACTIONS.HARD_DELETE) {
        if (!(isAvailableStatus(statusValue) || isPassiveStatus(statusValue))) {
          throw new Error("Only available or passive cars can be permanently deleted");
        }
        endpoint = `/api/Cars/${carId}/hard-delete`;
        method = "DELETE";
        successMessage = "Car permanently deleted";
      }

      const response = await apiFetch(endpoint, {
        method,
        headers: {
          Accept: "*/*",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.Message || "Action could not be completed"
        );
      }

      if (selectedAction === ACTIONS.HARD_DELETE) {
        setCars((prev) => prev.filter((car) => (car.id || car.Id) !== carId));
      } else if (selectedAction === ACTIONS.DEACTIVATE) {
        setCars((prev) =>
          prev.map((car) =>
            (car.id || car.Id) === carId
              ? { ...car, status: "Passive", Status: "Passive" }
              : car
          )
        );
      } else if (selectedAction === ACTIONS.ACTIVATE) {
        setCars((prev) =>
          prev.map((car) =>
            (car.id || car.Id) === carId
              ? { ...car, status: "Available", Status: "Available" }
              : car
          )
        );
      }

      showToast(successMessage, "success");
      setActionModalOpen(false);
      setSelectedCar(null);
      setSelectedAction(null);
    } catch (error) {
      console.log("Action error:", error);
      showToast(error.message || "An error occurred", "error");
    } finally {
      setActionLoadingCarId(null);
    }
  };

  const renderActionButtons = (car) => {
    const carId = car.id || car.Id;
    const statusValue = car.status || car.Status;
    const loadingThisCard = actionLoadingCarId === carId;

    if (isRentedStatus(statusValue)) {
      return (
        <div
          className={`mt-3 rounded-2xl border px-4 py-4 text-center ${
            isDarkmodeEnabled
              ? "bg-[#111111] border-white/10 text-gray-300"
              : "bg-gray-100 border-gray-200 text-gray-600"
          }`}
        >
          <div className="text-sm font-semibold">Unavailable for actions</div>
          <div className="text-xs mt-1 opacity-80">
            This car is currently rented
          </div>
        </div>
      );
    }

    if (isAvailableStatus(statusValue)) {
      return (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openActionModal(car, ACTIONS.DEACTIVATE)}
              disabled={loadingThisCard}
              className="group relative overflow-hidden px-3 py-2.5 rounded-xl bg-orange-500 text-white font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Deactivate</span>
              <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
            </button>

            <button
              onClick={() => openActionModal(car, ACTIONS.HARD_DELETE)}
              disabled={loadingThisCard}
              className="group relative overflow-hidden px-3 py-2.5 rounded-xl bg-red-500 text-white font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Delete Permanently</span>
              <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
            </button>
          </div>

          <button
            onClick={() => navigate(`/update-car/${carId}`)}
            disabled={loadingThisCard}
            className="relative overflow-hidden w-full px-3 py-2.5 rounded-xl bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
          >
            Update
          </button>
        </div>
      );
    }

    if (isPassiveStatus(statusValue)) {
      return (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openActionModal(car, ACTIONS.ACTIVATE)}
              disabled={loadingThisCard}
              className="group relative overflow-hidden px-3 py-2.5 rounded-xl bg-green-500 text-white font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Activate</span>
              <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
            </button>

            <button
              onClick={() => openActionModal(car, ACTIONS.HARD_DELETE)}
              disabled={loadingThisCard}
              className="group relative overflow-hidden px-3 py-2.5 rounded-xl bg-red-500 text-white font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">Delete Permanently</span>
              <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
            </button>
          </div>

          <button
            onClick={() => navigate(`/update-car/${carId}`)}
            disabled={loadingThisCard}
            className="relative overflow-hidden w-full px-3 py-2.5 rounded-xl bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
          >
            Update
          </button>
        </div>
      );
    }

    return (
      <div
        className={`mt-3 rounded-2xl border px-4 py-4 text-center ${
          isDarkmodeEnabled
            ? "bg-[#111111] border-white/10 text-gray-300"
            : "bg-gray-100 border-gray-200 text-gray-600"
        }`}
      >
        <div className="text-sm font-semibold">No actions available</div>
      </div>
    );
  };

  const modalContent = getActionModalContent();

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
            className={`px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md border text-sm sm:text-base font-semibold ${
              toast.type === "success"
                ? "bg-green-500/90 text-white border-green-300"
                : "bg-red-500/90 text-white border-red-300"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {actionModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={closeActionModal}
          ></div>

          <div
            className={`relative z-10 w-full max-w-md rounded-3xl border shadow-2xl p-5 sm:p-6 ${
              isDarkmodeEnabled
                ? "bg-[#181818] border-white/10 text-white"
                : "bg-white border-gray-200 text-black"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-3">
              {modalContent.title}
            </h2>

            <p
              className={`text-sm sm:text-base leading-6 ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {modalContent.message}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={closeActionModal}
                disabled={actionLoadingCarId === (selectedCar?.id || selectedCar?.Id)}
                className={`flex-1 rounded-2xl py-3 font-bold transition ${
                  isDarkmodeEnabled
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-gray-200 text-black hover:bg-gray-300"
                }`}
              >
                No
              </button>

              <button
                onClick={handleConfirmAction}
                disabled={actionLoadingCarId === (selectedCar?.id || selectedCar?.Id)}
                className={`group relative overflow-hidden flex-1 rounded-2xl py-3 font-bold active:translate-y-0 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed ${modalContent.confirmClass}`}
              >
                <span className="relative z-10">
                  {actionLoadingCarId === (selectedCar?.id || selectedCar?.Id)
                    ? "Processing..."
                    : modalContent.confirmText}
                </span>
                <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/20 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
              </button>
            </div>
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
              Here you can manage your cars.
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

            const carId = car.id || car.Id;
            const statusInfo = getStatusInfo(car.status || car.Status);

            return (
              <div
                key={carId}
                className={`rounded-[22px] overflow-hidden border shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
                  isDarkmodeEnabled
                    ? "bg-[#1a1a1a] border-white/10"
                    : "bg-white border-gray-200"
                }`}
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                  onClick={() => handleCardClick(carId)}
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

                  <div className="absolute top-2 left-2">
                    <span
                      className={`border text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${statusInfo.className}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>

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
                  <div className="space-y-1">
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
                      <span className="font-semibold">Status:</span>{" "}
                      {statusInfo.text}
                    </p>
                  </div>

                  {renderActionButtons(car)}
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