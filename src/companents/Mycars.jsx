import { useEffect, useMemo, useState } from "react";
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
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [pageError, setPageError] = useState("");
  const [toast, setToast] = useState(null);

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const [selectedCar, setSelectedCar] = useState(null);
  const [deactivateLoadingId, setDeactivateLoadingId] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [payingCarId, setPayingCarId] = useState(null);

  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpire, setCardExpire] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const selectedPackage = useMemo(() => {
    return packages.find((item) => item.id === selectedPackageId);
  }, [packages, selectedPackageId]);

  const cardClassName = isDarkmodeEnabled
    ? "bg-[#1a1a1a] border-white/10 text-white"
    : "bg-white border-gray-200 text-black";

  const statBoxClass = isDarkmodeEnabled
    ? "bg-[#111111] border-white/10"
    : "bg-[#f7f7f7] border-gray-200";

  const inputClassName = `w-full h-[40px] px-3 rounded-lg outline-none border text-sm transition ${
    isDarkmodeEnabled
      ? "bg-[#171717] border-white/15 text-white placeholder-gray-400 focus:border-red-500"
      : "bg-white border-gray-200 text-black placeholder-gray-500 focus:border-red-500"
  }`;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const normalizeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
  };

  const getErrorMessage = (data, fallback) => {
    if (data?.errors) {
      const firstError = Object.values(data.errors)?.flat()?.[0];
      return firstError || fallback;
    }

    return data?.message || data?.Message || data?.title || fallback;
  };

  const getImageUrl = (path) => {
    if (!path) return defaultImage;
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const getCarId = (car) => car?.id || car?.carId || car?.Id;

  const formatPlateNumber = (plateNumber) => {
    if (!plateNumber) return "—";

    return plateNumber.replace(
      /^(\d{2})([A-ZƏÖÜĞÇŞIİ]{1,3})(\d{2,4})$/i,
      "$1 $2 $3"
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("az-AZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpire = (value) => {
    const clean = value.replace(/\D/g, "").slice(0, 4);
    if (clean.length <= 2) return clean;
    return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  };

  const extractId = (data, keys) => {
    for (const key of keys) {
      if (data?.[key]) return data[key];
      if (data?.data?.[key]) return data.data[key];
    }

    return "";
  };

  const getActiveInfo = (car) => {
    const isActive = car.isActive ?? car.IsActive;
    const isDeactivated = car.isDeactivated ?? car.IsDeactivated;
    const daysLeft = Number(car.daysLeft ?? car.DaysLeft ?? 0);

    if (isActive === true && daysLeft > 0) {
      return {
        text: "Aktiv",
        className: "bg-green-500 text-white",
        softClassName: "bg-green-500/10 text-green-500 border-green-500/20",
        dot: "bg-green-400",
      };
    }

    return {
      text: "Aktiv deyil",
      className: "bg-gray-600 text-white",
      softClassName: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      dot: "bg-gray-400",
    };
  };

  const getDaysLeftText = (car) => {
    const daysLeft = Number(car.daysLeft ?? car.DaysLeft ?? 0);
    if (daysLeft <= 0) return "Bitib";
    return `${daysLeft} gün`;
  };

  const canRenewPayment = (car) => {
    const isActive = car.isActive ?? car.IsActive;
    const requiresPayment =
      car.requiresPaymentToReactivate ?? car.RequiresPaymentToReactivate;
    const daysLeft = Number(car.daysLeft ?? car.DaysLeft ?? 0);

    return requiresPayment === true || isActive === false || daysLeft <= 0;
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
        throw new Error(getErrorMessage(data, "Maşınlar yüklənmədi"));
      }

      setCars(normalizeArray(data));
    } catch (error) {
      setPageError(error.message || "Maşınlar yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);

      const response = await apiFetch("/api/Packages", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Paketlər yüklənmədi"));
      }

      const activePackages = normalizeArray(data)
        .filter((item) => item.isActive !== false)
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

      setPackages(activePackages);

      if (!selectedPackageId && activePackages[0]?.id) {
        setSelectedPackageId(activePackages[0].id);
      }
    } catch (error) {
      showToast(error.message || "Paketlər yüklənmədi", "error");
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    fetchMyCars();
    fetchPackages();
  }, []);

  const openDeactivateModal = (car) => {
    setSelectedCar(car);
    setDeactivateModalOpen(true);
  };

  const closeDeactivateModal = () => {
    if (deactivateLoadingId) return;
    setSelectedCar(null);
    setDeactivateModalOpen(false);
  };

  const openDeleteModal = (car) => {
    setSelectedCar(car);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoadingId) return;
    setSelectedCar(null);
    setDeleteModalOpen(false);
  };

  const openPaymentModal = (car) => {
    setSelectedCar(car);
    setPaymentModalOpen(true);
    setCardName("");
    setCardNumber("");
    setCardExpire("");
    setCardCvv("");

    if (!packages.length) fetchPackages();
  };

  const closePaymentModal = () => {
    if (payingCarId) return;
    setPaymentModalOpen(false);
    setSelectedCar(null);
  };

  const validateCard = () => {
    const cleanCard = cardNumber.replace(/\D/g, "");

    if (!selectedPackageId) return "Paket seçin";
    if (!cardName.trim()) return "Kart sahibinin adını daxil edin";
    if (cleanCard.length !== 16) return "Kart nömrəsi 16 rəqəm olmalıdır";
    if (!/^\d{2}\/\d{2}$/.test(cardExpire)) {
      return "Bitmə tarixini MM/YY formatında daxil edin";
    }
    if (!/^\d{3,4}$/.test(cardCvv)) return "CVV düzgün deyil";

    const [month] = cardExpire.split("/").map(Number);
    if (month < 1 || month > 12) return "Ay düzgün deyil";

    return "";
  };

  const handleDeactivateCar = async () => {
    const carId = getCarId(selectedCar);
    if (!carId) return;

    try {
      setDeactivateLoadingId(carId);

      const response = await apiFetch(`/api/Cars/${carId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Maşın deaktiv edilmədi"));
      }

      setCars((prev) =>
        prev.map((car) =>
          getCarId(car) === carId
            ? {
                ...car,
                isActive: false,
                IsActive: false,
                isDeactivated: true,
                IsDeactivated: true,
                requiresPaymentToReactivate: true,
                RequiresPaymentToReactivate: true,
                daysLeft: 0,
                DaysLeft: 0,
              }
            : car
        )
      );

      showToast(
        data?.note
          ? `${data?.message || "Maşın deaktiv edildi"}. ${data.note}`
          : data?.message || "Maşın deaktiv edildi",
        "success"
      );

      closeDeactivateModal();
    } catch (error) {
      showToast(error.message || "Deaktiv etmə zamanı xəta baş verdi", "error");
    } finally {
      setDeactivateLoadingId(null);
    }
  };

  const handleHardDeleteCar = async () => {
    const carId = getCarId(selectedCar);
    if (!carId) return;

    try {
      setDeleteLoadingId(carId);

      const response = await apiFetch(`/api/Cars/${carId}/hard`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Maşın tam silinmədi"));
      }

      setCars((prev) => prev.filter((car) => getCarId(car) !== carId));
      showToast(data?.message || "Maşın tam silindi", "success");
      closeDeleteModal();
    } catch (error) {
      showToast(error.message || "Silinmə zamanı xəta baş verdi", "error");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleRenewPayment = async (e) => {
    e.preventDefault();

    const carId = getCarId(selectedCar);
    if (!carId) return;

    const cardError = validateCard();

    if (cardError) {
      showToast(cardError, "error");
      return;
    }

    try {
      setPayingCarId(carId);

      const reactivateResponse = await apiFetch(
        `/api/Cars/${carId}/reactivate?packageId=${selectedPackageId}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const reactivateData = await reactivateResponse.json().catch(() => null);

      if (!reactivateResponse.ok) {
        throw new Error(
          getErrorMessage(reactivateData, "Maşın yenidən aktivləşdirilmədi")
        );
      }

      const paymentResponse = await apiFetch("/api/Payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          carId,
        }),
      });

      const paymentData = await paymentResponse.json().catch(() => null);

      if (!paymentResponse.ok) {
        throw new Error(getErrorMessage(paymentData, "Ödəniş yaradılmadı"));
      }

      const paymentId =
        extractId(paymentData, ["id", "paymentId", "Id", "PaymentId"]) ||
        paymentData?.data?.id;

      if (!paymentId) {
        throw new Error("Ödəniş yaradıldı, amma paymentId gəlmədi");
      }

      const mockResponse = await apiFetch("/api/Payments/mock-success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          paymentId,
        }),
      });

      const mockData = await mockResponse.json().catch(() => null);

      if (!mockResponse.ok) {
        throw new Error(getErrorMessage(mockData, "Ödəniş təsdiqlənmədi"));
      }

      showToast("Ödəniş uğurla tamamlandı. Maşın yenidən aktivləşdi.", "success");
      closePaymentModal();
      await fetchMyCars();
    } catch (error) {
      showToast(error.message || "Ödəniş zamanı xəta baş verdi", "error");
    } finally {
      setPayingCarId(null);
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
      className={`min-h-screen px-3 sm:px-4 md:px-6 lg:px-8 py-5 sm:py-8 ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"
      }`}
    >
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-24px)] sm:w-auto">
          <div
            className={`px-4 sm:px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-semibold text-center ${
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
        isOpen={deactivateModalOpen}
        title="Maşını deaktiv et"
        message="Bu maşını deaktiv etsəniz saytda görünməyəcək. Yenidən aktiv etmək üçün ödəniş etməlisiniz."
        confirmText={
          deactivateLoadingId ? "Deaktiv edilir..." : "Bəli, deaktiv et"
        }
        cancelText="Xeyr"
        onConfirm={handleDeactivateCar}
        onCancel={closeDeactivateModal}
        danger
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Maşını tam sil"
        message="Bu əməliyyat maşını tam siləcək. Bu maşını geri qaytarmaq mümkün olmayacaq."
        confirmText={deleteLoadingId ? "Silinir..." : "Bəli, sil"}
        cancelText="Xeyr"
        onConfirm={handleHardDeleteCar}
        onCancel={closeDeleteModal}
        danger
      />

      {paymentModalOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm px-3 py-4 overflow-y-auto">
          <div
            className={`max-w-[860px] mx-auto rounded-[22px] border p-3 sm:p-4 ${cardClassName}`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black">
                  Ödənişi yenilə
                </h2>

                <p
                  className={`mt-1 text-xs ${
                    isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {selectedCar?.brand} {selectedCar?.model} yenidən aktiv olsun
                  deyə paket seçin və ödənişi tamamlayın.
                </p>
              </div>

              <button
                type="button"
                onClick={closePaymentModal}
                className="w-9 h-9 rounded-full bg-red-500 text-white font-black"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleRenewPayment}
              className="grid grid-cols-1 lg:grid-cols-12 gap-4"
            >
              <div className="lg:col-span-5 space-y-3">
                <div className={`rounded-2xl border p-3 ${statBoxClass}`}>
                  <p className="text-xs opacity-70">Maşın</p>
                  <h3 className="text-lg font-black mt-1">
                    {selectedCar?.brand} {selectedCar?.model}
                  </h3>

                  <p className="text-xs opacity-70 mt-2">Dövlət nömrəsi</p>
                  <h4 className="text-base font-black tracking-[3px] mt-1">
                    {formatPlateNumber(selectedCar?.plateNumber)}
                  </h4>
                </div>

                <div className={`rounded-2xl border p-3 ${statBoxClass}`}>
                  <h3 className="font-black mb-2 text-sm">Paket seç</h3>

                  {loadingPackages ? (
                    <p className="text-sm opacity-70">Paketlər yüklənir...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {packages.map((item) => {
                        const selected = selectedPackageId === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedPackageId(item.id)}
                            className={`text-left rounded-xl border p-3 transition ${
                              selected
                                ? "bg-red-500 border-red-500 text-white"
                                : isDarkmodeEnabled
                                ? "bg-[#171717] border-white/10 hover:bg-white/10"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-black text-sm line-clamp-1">
                                {item.name}
                              </h4>

                              {item.isVip && (
                                <span className="bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                  VIP
                                </span>
                              )}
                            </div>

                            <p className="text-xs opacity-80 mt-1">
                              {item.durationDays} gün
                            </p>

                            <p className="text-lg font-black mt-1">
                              {item.price} {item.currency}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-[20px] p-4 bg-gradient-to-br from-[#111] via-[#2a2a2a] to-[#8b0000] text-white shadow-2xl mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs opacity-70">MyCar ödəniş kartı</p>
                      <p className="text-lg font-black mt-1">
                        {selectedPackage?.price || 0}{" "}
                        {selectedPackage?.currency || "AZN"}
                      </p>
                    </div>

                    <div className="w-10 h-7 rounded-lg bg-white/20 border border-white/30" />
                  </div>

                  <p className="mt-6 text-lg sm:text-xl tracking-[3px] font-bold">
                    {cardNumber || "0000 0000 0000 0000"}
                  </p>

                  <div className="flex justify-between mt-5 text-xs">
                    <div>
                      <p className="opacity-60 text-[10px]">Kart sahibi</p>
                      <p className="font-bold uppercase">
                        {cardName || "AD SOYAD"}
                      </p>
                    </div>

                    <div>
                      <p className="opacity-60 text-[10px]">Tarix</p>
                      <p className="font-bold">{cardExpire || "MM/YY"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block mb-1.5 text-xs font-medium">
                      Kart sahibinin adı
                    </label>

                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="AD SOYAD"
                      className={inputClassName}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-1.5 text-xs font-medium">
                      Kart nömrəsi
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      placeholder="0000 0000 0000 0000"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-medium">
                      Bitmə tarixi
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardExpire}
                      onChange={(e) => setCardExpire(formatExpire(e.target.value))}
                      placeholder="MM/YY"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-xs font-medium">
                      CVV
                    </label>

                    <input
                      type="password"
                      inputMode="numeric"
                      value={cardCvv}
                      onChange={(e) =>
                        setCardCvv(
                          e.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                      }
                      placeholder="***"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!!payingCarId}
                  className="mt-4 w-full h-[42px] rounded-lg bg-red-500 text-white font-black hover:bg-red-600 transition disabled:opacity-60"
                >
                  {payingCarId ? "Ödəniş edilir..." : "Ödənişi tamamla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
              Mənim maşınlarım
            </h1>

            <p
              className={`mt-2 text-sm sm:text-base ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Maşınların aktivliyi, paket müddəti və baxış məlumatları.
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
            className={`rounded-3xl border px-6 py-16 text-center ${cardClassName}`}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Maşın tapılmadı
            </h2>

            <p className={isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"}>
              Hələ heç bir maşın əlavə etməmisiniz.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {cars.map((car) => {
            const carId = getCarId(car);
            const activeInfo = getActiveInfo(car);
            const imageUrl = getImageUrl(car.mainImageUrl || car.MainImageUrl);
            const renewPayment = canRenewPayment(car);

            return (
              <div
                key={carId}
                className={`group overflow-hidden rounded-[22px] sm:rounded-[28px] border shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${cardClassName}`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
                  <div
                    onClick={() => navigate(`/details/${carId}`)}
                    className="relative h-[180px] sm:h-full sm:min-h-[285px] overflow-hidden cursor-pointer bg-black"
                  >
                    <img
                      src={imageUrl}
                      alt={`${car.brand || ""} ${car.model || ""}`}
                      onError={(e) => {
                        e.currentTarget.src = defaultImage;
                      }}
                      className="w-full h-full object-contain transition duration-700 group-hover:scale-[1.03]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20"></div>

                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1.5">
                      <span
                        className={`text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1 rounded-full ${activeInfo.className}`}
                      >
                        {activeInfo.text}
                      </span>

                      {car.isVip && (
                        <span className="bg-yellow-400 text-black text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1 rounded-full">
                          VIP
                        </span>
                      )}

                      {car.isVerified && (
                        <span className="bg-blue-500 text-white text-[10px] sm:text-[11px] font-black px-2 sm:px-3 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white/75 text-xs font-semibold">
                        {car.city || "Şəhər yoxdur"}
                      </p>

                      <h2 className="text-white font-black text-xl sm:text-2xl line-clamp-1">
                        {car.brand || "Marka"} {car.model || "Model"}
                      </h2>
                    </div>
                  </div>

                  <div className="p-3 sm:p-5 flex flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-2xl font-black line-clamp-1">
                          {car.brand || "Marka"} {car.model || "Model"}
                        </h3>

                        <p
                          className={`mt-1 text-xs sm:text-sm line-clamp-1 ${
                            isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {car.color || "Rəng yoxdur"} •{" "}
                          {car.year || "İl yoxdur"} •{" "}
                          {car.city || "Şəhər yoxdur"}
                        </p>
                      </div>

                      <div
                        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${activeInfo.softClassName}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${activeInfo.dot}`}
                        ></span>

                        <span className="text-xs font-black">
                          {activeInfo.text}
                        </span>
                      </div>
                    </div>

                    <div className={`mt-3 rounded-xl border p-3 ${statBoxClass}`}>
                      <p
                        className={`text-[10px] uppercase tracking-wider ${
                          isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Dövlət nömrəsi
                      </p>

                      <h4 className="text-[18px] sm:text-[24px] font-black tracking-[2px] sm:tracking-[4px] mt-1">
                        {formatPlateNumber(car.plateNumber)}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      <div className={`rounded-xl border p-2.5 ${statBoxClass}`}>
                        <p
                          className={`text-[9px] uppercase ${
                            isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Qalıb
                        </p>

                        <h4 className="text-sm font-black text-red-500 mt-1">
                          {getDaysLeftText(car)}
                        </h4>
                      </div>

                      <div className={`rounded-xl border p-2.5 ${statBoxClass}`}>
                        <p
                          className={`text-[9px] uppercase ${
                            isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Baxış
                        </p>

                        <h4 className="text-sm font-black mt-1">
                          {car.viewCount ?? car.ViewCount ?? 0}
                        </h4>
                      </div>

                      <div className={`rounded-xl border p-2.5 ${statBoxClass}`}>
                        <p
                          className={`text-[9px] uppercase ${
                            isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Başladı
                        </p>

                        <h4 className="text-[11px] font-black mt-1">
                          {formatDate(car.activeFrom ?? car.ActiveFrom)}
                        </h4>
                      </div>

                      <div className={`rounded-xl border p-2.5 ${statBoxClass}`}>
                        <p
                          className={`text-[9px] uppercase ${
                            isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Bitir
                        </p>

                        <h4 className="text-[11px] font-black mt-1">
                          {formatDate(car.activeUntil ?? car.ActiveUntil)}
                        </h4>
                      </div>
                    </div>

                    {car.description && (
                      <p
                        className={`mt-2 sm:mt-3 text-xs sm:text-sm line-clamp-2 ${
                          isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {car.description}
                      </p>
                    )}

                    <div className="mt-auto pt-3 sm:pt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
                      <button
                        onClick={() => navigate(`/update-car/${carId}`)}
                        className="h-[38px] sm:h-[44px] rounded-lg sm:rounded-xl bg-yellow-400 text-black text-xs sm:text-sm font-black hover:bg-yellow-500 hover:-translate-y-1 transition"
                      >
                        Düzəliş et
                      </button>

                      <button
                        onClick={() => openDeleteModal(car)}
                        disabled={deleteLoadingId === carId}
                        className="h-[38px] sm:h-[44px] rounded-lg sm:rounded-xl bg-black text-white text-xs sm:text-sm font-black hover:opacity-80 hover:-translate-y-1 transition disabled:opacity-50"
                      >
                        {deleteLoadingId === carId ? "..." : "Sil"}
                      </button>

                      {renewPayment ? (
                        <button
                          onClick={() => openPaymentModal(car)}
                          disabled={payingCarId === carId}
                          className="h-[38px] sm:h-[44px] rounded-lg sm:rounded-xl bg-green-500 text-white text-xs sm:text-sm font-black hover:bg-green-600 hover:-translate-y-1 transition disabled:opacity-50"
                        >
                          Ödənişi yenilə
                        </button>
                      ) : (
                        <button
                          onClick={() => openDeactivateModal(car)}
                          disabled={deactivateLoadingId === carId}
                          className="h-[38px] sm:h-[44px] rounded-lg sm:rounded-xl bg-red-500 text-white text-xs sm:text-sm font-black hover:bg-red-600 hover:-translate-y-1 transition disabled:opacity-50"
                        >
                          {deactivateLoadingId === carId
                            ? "..."
                            : "Deaktiv et"}
                        </button>
                      )}
                    </div>

                    <p
                      className={`mt-2 text-[9px] sm:text-[10px] truncate ${
                        isDarkmodeEnabled ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      ID: {carId}
                    </p>
                  </div>
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