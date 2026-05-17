import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";
import { apiFetch } from "../utils/apiFetch";
import { REGION_OPTIONS } from "../data/regions";
import { CAR_BRANDS, COLOR_OPTIONS, YEAR_OPTIONS } from "../data/carOptions";
import SmartSelect from "../companents/SmartSelect";

const AddCar = () => {
  const navigate = useNavigate();
  const { isDarkmodeEnabled } = useDarkmode();

  const [step, setStep] = useState("form");

  const [plateNumber, setPlateNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [packageId, setPackageId] = useState("");
  const [acceptOwnershipDeclaration, setAcceptOwnershipDeclaration] =
    useState(false);

  const [packages, setPackages] = useState([]);
  const [newMediaFiles, setNewMediaFiles] = useState([]);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpire, setCardExpire] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [createdCarId, setCreatedCarId] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const [loadingPackages, setLoadingPackages] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const brandOptions = useMemo(() => CAR_BRANDS.map((item) => item.brand), []);

  const modelOptions = useMemo(() => {
    const selectedBrand = CAR_BRANDS.find(
      (item) => item.brand.toLowerCase() === brand.toLowerCase()
    );

    return selectedBrand?.models || [];
  }, [brand]);

  const selectedPackage = useMemo(() => {
    return packages.find((item) => item.id === packageId);
  }, [packages, packageId]);

  const getMediaType = (file) => {
    if (file?.type?.startsWith("video/")) return "video";
    return "image";
  };

  const mediaPreviewUrls = useMemo(() => {
    return newMediaFiles.map((file) => ({
      file,
      type: getMediaType(file),
      url: URL.createObjectURL(file),
    }));
  }, [newMediaFiles]);

  useEffect(() => {
    return () => {
      mediaPreviewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [mediaPreviewUrls]);

  const getErrorMessage = (data, fallback) => {
    if (data?.errors) {
      const firstError = Object.values(data.errors)?.flat()?.[0];
      return firstError || fallback;
    }

    return data?.message || data?.Message || data?.title || fallback;
  };

  const normalizePackages = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.$values)) return data.$values;
    return [];
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

      const activePackages = normalizePackages(data)
        .filter((item) => item.isActive !== false)
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

      setPackages(activePackages);
    } catch (err) {
      setError(err.message || "Paketlər yüklənmədi");
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const formatPlateNumber = (value) => {
    return value
      .toUpperCase()
      .replace(/[^0-9A-ZƏÖÜĞÇŞIİ]/g, "")
      .slice(0, 9);
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

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);

    const allowedFiles = files.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    setNewMediaFiles((prev) => [...prev, ...allowedFiles]);
    e.target.value = "";
  };

  const handleRemoveNewMedia = (index) => {
    setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateCarForm = () => {
    if (!plateNumber.trim()) return "Dövlət nömrəsini daxil edin";
    if (!brand.trim()) return "Marka daxil edin";
    if (!model.trim()) return "Model daxil edin";
    if (!year.trim()) return "İl seçin və ya daxil edin";
    if (!color.trim()) return "Rəng seçin və ya daxil edin";
    if (!city.trim()) return "Şəhər seçin və ya daxil edin";
    if (!description.trim()) return "Açıqlama daxil edin";
    if (!packageId) return "Paket seçin";
    if (!acceptOwnershipDeclaration) {
      return "Avtomobil məlumatlarını yerləşdirmək hüququnuz olduğunu təsdiqləyin";
    }

    return "";
  };

  const validateCard = () => {
    const cleanCard = cardNumber.replace(/\D/g, "");

    if (!cardName.trim()) return "Kart sahibinin adını daxil edin";
    if (cleanCard.length !== 16) return "Kart nömrəsi 16 rəqəm olmalıdır";
    if (!/^\d{2}\/\d{2}$/.test(cardExpire)) return "Bitmə tarixini MM/YY formatında daxil edin";
    if (!/^\d{3,4}$/.test(cardCvv)) return "CVV düzgün deyil";

    const [month] = cardExpire.split("/").map(Number);
    if (month < 1 || month > 12) return "Ay düzgün deyil";

    return "";
  };

  const goToPayment = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateCarForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadMedia = async (carId) => {
    if (newMediaFiles.length === 0) return;

    const formData = new FormData();
    formData.append("Purpose", "1");

    newMediaFiles.forEach((file) => {
      formData.append("Files", file);
    });

    const response = await apiFetch(`/api/Cars/${carId}/media`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Media əlavə olunmadı"));
    }
  };

  const extractId = (data, keys) => {
    for (const key of keys) {
      if (data?.[key]) return data[key];
      if (data?.data?.[key]) return data.data[key];
    }

    return "";
  };

  const handlePaymentAndCreateCar = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cardError = validateCard();

    if (cardError) {
      setError(cardError);
      return;
    }

    try {
      setPaying(true);
      setSubmitting(true);

      const carResponse = await apiFetch("/api/Cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          plateNumber: plateNumber.trim(),
          brand: brand.trim(),
          model: model.trim(),
          year: String(year).trim(),
          color: color.trim(),
          city: city.trim(),
          description: description.trim(),
          packageId,
          acceptOwnershipDeclaration,
        }),
      });

      const carData = await carResponse.json().catch(() => null);

      if (!carResponse.ok) {
        throw new Error(getErrorMessage(carData, "Maşın əlavə olunmadı"));
      }

      const carId =
        extractId(carData, ["id", "carId", "Id", "CarId"]) ||
        carData?.data?.id;

      if (!carId) {
        throw new Error("Maşın yaradıldı, amma carId gəlmədi");
      }

      setCreatedCarId(carId);

      await uploadMedia(carId);

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

      const newPaymentId =
        extractId(paymentData, ["id", "paymentId", "Id", "PaymentId"]) ||
        paymentData?.data?.id;

      if (!newPaymentId) {
        throw new Error("Ödəniş yaradıldı, amma paymentId gəlmədi");
      }

      setPaymentId(newPaymentId);

      const mockResponse = await apiFetch("/api/Payments/mock-success", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          paymentId: newPaymentId,
        }),
      });

      const mockData = await mockResponse.json().catch(() => null);

      if (!mockResponse.ok) {
        throw new Error(getErrorMessage(mockData, "Ödəniş təsdiqlənmədi"));
      }

      setSuccess("Ödəniş uğurla tamamlandı. Maşın platformaya əlavə olundu.");
      setStep("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Əməliyyat zamanı xəta baş verdi");
    } finally {
      setPaying(false);
      setSubmitting(false);
    }
  };

  const downloadReceipt = async () => {
  if (!paymentId) return;

  try {
    setError("");

    const response = await apiFetch(`/api/Payments/${paymentId}/receipt`, {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(getErrorMessage(data, "Çek endirilmədi"));
    }

    const contentType = response.headers.get("content-type") || "";

    let blob;
    let fileName = `MyCar-payment-${paymentId}`;

    if (contentType.includes("application/pdf")) {
      blob = await response.blob();
      fileName += ".pdf";
    } else if (contentType.includes("text/html")) {
      blob = await response.blob();
      fileName += ".html";
    } else if (contentType.includes("application/json")) {
      const data = await response.json();

      const receiptText = `
MyCar Ödəniş Çeki

Ödəniş ID: ${paymentId}
Status: ${data?.status || data?.paymentStatus || "Uğurlu"}
Məbləğ: ${data?.amount || selectedPackage?.price || ""} ${
        data?.currency || selectedPackage?.currency || "AZN"
      }
Paket: ${selectedPackage?.name || ""}
Maşın: ${brand} ${model}
Dövlət nömrəsi: ${plateNumber}
Tarix: ${new Date().toLocaleString("az-AZ")}

MyCar platformasından istifadə etdiyiniz üçün təşəkkür edirik.
      `.trim();

      blob = new Blob([receiptText], {
        type: "text/plain;charset=utf-8",
      });

      fileName += ".txt";
    } else {
      blob = await response.blob();
      fileName += ".txt";
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    setError(err.message || "Çek endirilərkən xəta baş verdi");
  }
};
  const inputClassName = `w-full h-[48px] px-4 rounded-xl outline-none border transition ${
    isDarkmodeEnabled
      ? "bg-[#171717] border-white/15 text-white placeholder-gray-400 focus:border-red-500"
      : "bg-white border-gray-200 text-black placeholder-gray-500 focus:border-red-500"
  }`;

  const cardClassName = isDarkmodeEnabled
    ? "bg-[#111111] border-[#2a2a2a] text-white"
    : "bg-white border-gray-200 text-black";

  return (
    <div
      className={`w-full min-h-screen ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className={`rounded-[26px] border p-5 sm:p-7 ${cardClassName}`}>
          <h1 className="text-[26px] sm:text-[34px] lg:text-[42px] font-black text-center">
            Maşın əlavə et
          </h1>

          <p
            className={`text-center mt-3 text-sm sm:text-base ${
              isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Maşın məlumatlarını daxil edin, paket seçin və ödənişdən sonra elan
            platformada görünsün.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl px-4 py-3 text-sm bg-red-500/10 text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl px-4 py-3 text-sm bg-green-500/10 text-green-400 border border-green-500/20">
            {success}
          </div>
        )}

        {step === "form" && (
          <form onSubmit={goToPayment}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
              <div className="xl:col-span-5 space-y-6">
                <div
                  className={`rounded-[26px] border p-4 sm:p-6 ${cardClassName}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      Media əlavə et
                    </h2>

                    <span
                      className={`text-sm ${
                        isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {newMediaFiles.length} fayl seçilib
                    </span>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaChange}
                    className={inputClassName}
                  />

                  <p
                    className={`mt-2 text-xs ${
                      isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Şəkil və video əlavə edə bilərsiniz. Əsas media yalnız şəkil
                    ola bilər.
                  </p>

                  {mediaPreviewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                      {mediaPreviewUrls.map((item, index) => (
                        <div
                          key={`${item.file.name}-${index}`}
                          className={`rounded-[20px] overflow-hidden border ${
                            isDarkmodeEnabled
                              ? "border-white/10 bg-[#171717]"
                              : "border-gray-200 bg-[#f7f7f7]"
                          }`}
                        >
                          {item.type === "video" ? (
                            <video
                              src={item.url}
                              className="w-full h-[150px] sm:h-[185px] object-cover"
                              controls
                              muted
                            />
                          ) : (
                            <img
                              src={item.url}
                              alt={item.file.name}
                              className="w-full h-[150px] sm:h-[185px] object-cover"
                            />
                          )}

                          <div className="p-3">
                            <p className="text-xs truncate mb-2">
                              {item.file.name}
                            </p>

                            <button
                              type="button"
                              onClick={() => handleRemoveNewMedia(index)}
                              className="w-full py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`rounded-[26px] border p-4 sm:p-6 ${cardClassName}`}
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">
                    Paket seç
                  </h2>

                  {loadingPackages ? (
                    <div className="py-8 text-center">
                      <div className="w-9 h-9 rounded-full border-4 border-red-500 border-t-transparent animate-spin mx-auto mb-3" />
                      <p className="text-sm opacity-80">Paketlər yüklənir...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {packages.map((item) => {
                        const selected = packageId === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPackageId(item.id)}
                            className={`text-left rounded-2xl border p-4 transition hover:-translate-y-1 ${
                              selected
                                ? "bg-red-500 border-red-500 text-white shadow-xl"
                                : isDarkmodeEnabled
                                ? "bg-[#171717] border-white/10 hover:bg-white/10"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-black">{item.name}</h3>

                              {item.isVip && (
                                <span className="bg-yellow-400 text-black text-[11px] font-black px-2 py-1 rounded-full">
                                  VIP
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm opacity-80">
                              {item.durationDays} gün
                            </p>

                            <p className="mt-3 text-2xl font-black">
                              {item.price} {item.currency}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="xl:col-span-7">
                <div
                  className={`rounded-[26px] border p-4 sm:p-6 ${cardClassName}`}
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-6">
                    Maşın məlumatları
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm sm:text-base font-medium">
                        Dövlət nömrəsi
                      </label>

                      <input
                        type="text"
                        value={plateNumber}
                        onChange={(e) =>
                          setPlateNumber(formatPlateNumber(e.target.value))
                        }
                        placeholder="Məsələn: 77MF835"
                        className={inputClassName}
                      />
                    </div>

                    <SmartSelect
                      label="Marka"
                      value={brand}
                      onChange={(value) => {
                        setBrand(value);
                        setModel("");
                      }}
                      options={brandOptions}
                      placeholder="Marka seçin və ya yazın"
                      isDarkmodeEnabled={isDarkmodeEnabled}
                    />

                    <SmartSelect
                      label="Model"
                      value={model}
                      onChange={setModel}
                      options={modelOptions}
                      placeholder={
                        brand ? "Model seçin və ya yazın" : "Əvvəl marka seçin"
                      }
                      disabled={!brand}
                      isDarkmodeEnabled={isDarkmodeEnabled}
                    />

                    <SmartSelect
                      label="İl"
                      value={year}
                      onChange={setYear}
                      options={YEAR_OPTIONS.map(String)}
                      placeholder="İl seçin və ya yazın"
                      isDarkmodeEnabled={isDarkmodeEnabled}
                    />

                    <SmartSelect
                      label="Rəng"
                      value={color}
                      onChange={setColor}
                      options={COLOR_OPTIONS}
                      placeholder="Rəng seçin və ya yazın"
                      isDarkmodeEnabled={isDarkmodeEnabled}
                    />

                    <SmartSelect
                      label="Şəhər"
                      value={city}
                      onChange={setCity}
                      options={REGION_OPTIONS}
                      placeholder="Şəhər seçin və ya yazın"
                      isDarkmodeEnabled={isDarkmodeEnabled}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block mb-2 text-sm sm:text-base font-medium">
                      Açıqlama
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                      placeholder="Maşın haqqında məlumat yazın"
                      className={`${inputClassName} h-auto py-3 resize-none`}
                    />
                  </div>

                  <label className="mt-4 flex items-start gap-3 text-sm leading-6 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptOwnershipDeclaration}
                      onChange={(e) =>
                        setAcceptOwnershipDeclaration(e.target.checked)
                      }
                      className="mt-1 w-4 h-4 accent-red-500 shrink-0"
                    />

                    <span>
                      Bu avtomobil haqqında məlumatları platformada yerləşdirmək
                      hüququm olduğunu və daxil etdiyim məlumatların düzgünlüyünə
                      görə məsuliyyət daşıdığımı təsdiq edirəm.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-5 group relative overflow-hidden w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 disabled:opacity-60 font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    Ödənişə keç
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {step === "payment" && (
          <form onSubmit={handlePaymentAndCreateCar}>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
              <div className="xl:col-span-5">
                <div
                  className={`rounded-[26px] border p-5 sm:p-6 ${cardClassName}`}
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">
                    Ödəniş xülasəsi
                  </h2>

                  <div
                    className={`rounded-2xl p-4 border ${
                      isDarkmodeEnabled
                        ? "bg-[#171717] border-white/10"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <p className="text-sm opacity-70">Maşın</p>
                    <p className="text-xl font-black mt-1">
                      {brand} {model}
                    </p>

                    <p className="text-sm opacity-70 mt-4">Dövlət nömrəsi</p>
                    <p className="text-lg font-bold tracking-[3px] mt-1">
                      {plateNumber}
                    </p>

                    <p className="text-sm opacity-70 mt-4">Paket</p>
                    <p className="text-lg font-bold mt-1">
                      {selectedPackage?.name}
                    </p>

                    <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
                      <span className="font-semibold">Ödəniləcək məbləğ</span>
                      <span className="text-3xl font-black text-red-500">
                        {selectedPackage?.price} {selectedPackage?.currency}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className={`mt-4 w-full py-3 rounded-xl font-bold transition ${
                      isDarkmodeEnabled
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-black text-white hover:opacity-90"
                    }`}
                  >
                    Geri qayıt
                  </button>
                </div>
              </div>

              <div className="xl:col-span-7">
                <div
                  className={`rounded-[26px] border p-5 sm:p-6 ${cardClassName}`}
                >
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">
                    Kart məlumatları
                  </h2>

                  <p
                    className={`mb-5 text-sm ${
                      isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Bu hissə hazırda test ödəniş üçündür. Real ödəniş üçün
                    BirBank inteqrasiyası qoşulanda eyni dizayn saxlanıla bilər.
                  </p>

                  <div className="rounded-[28px] p-5 sm:p-6 bg-gradient-to-br from-[#111] via-[#2a2a2a] to-[#8b0000] text-white shadow-2xl mb-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs opacity-70">MyCar kart ödənişi</p>
                        <p className="text-xl font-black mt-1">
                          {selectedPackage?.price} {selectedPackage?.currency}
                        </p>
                      </div>

                      <div className="w-12 h-8 rounded-lg bg-white/20 border border-white/30" />
                    </div>

                    <p className="mt-8 text-2xl tracking-[4px] font-bold">
                      {cardNumber || "0000 0000 0000 0000"}
                    </p>

                    <div className="flex justify-between mt-6 text-sm">
                      <div>
                        <p className="opacity-60 text-xs">Kart sahibi</p>
                        <p className="font-bold uppercase">
                          {cardName || "AD SOYAD"}
                        </p>
                      </div>

                      <div>
                        <p className="opacity-60 text-xs">Tarix</p>
                        <p className="font-bold">{cardExpire || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium">
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

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium">
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
                      <label className="block mb-2 text-sm font-medium">
                        Bitmə tarixi
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpire}
                        onChange={(e) =>
                          setCardExpire(formatExpire(e.target.value))
                        }
                        placeholder="MM/YY"
                        className={inputClassName}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        CVV
                      </label>
                      <input
                        type="password"
                        inputMode="numeric"
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        placeholder="***"
                        className={inputClassName}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={paying}
                    className="mt-5 group relative overflow-hidden w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 disabled:opacity-60 font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {paying ? "Ödəniş edilir..." : "Ödənişi tamamla"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {step === "success" && (
          <div
            className={`mt-6 rounded-[26px] border p-6 sm:p-10 text-center ${cardClassName}`}
          >
            <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto text-4xl font-black">
              ✓
            </div>

            <h2 className="text-3xl sm:text-4xl font-black mt-6">
              Ödəniş uğurludur
            </h2>

            <p
              className={`mt-3 max-w-[650px] mx-auto leading-7 ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Maşınınız MyCar platformasına əlavə olundu. İstəsəniz ödəniş çekini
              endirə və ya maşınlarım bölməsinə keçə bilərsiniz.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7 max-w-[760px] mx-auto">
              <button
                type="button"
                onClick={downloadReceipt}
                className="py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition"
              >
                Çeki endir
              </button>

              <button
                type="button"
                onClick={() => navigate(`/details/${createdCarId}`)}
                className={`py-3 rounded-xl font-bold transition ${
                  isDarkmodeEnabled
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-black text-white hover:opacity-90"
                }`}
              >
                Elana bax
              </button>

              <button
                type="button"
                onClick={() => navigate("/my-cars")}
                className={`py-3 rounded-xl font-bold transition ${
                  isDarkmodeEnabled
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Maşınlarım
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCar;