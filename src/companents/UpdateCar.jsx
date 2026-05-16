import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";
import { apiFetch } from "../utils/apiFetch";
import { REGION_OPTIONS } from "../data/regions";
import { CAR_BRANDS, COLOR_OPTIONS, YEAR_OPTIONS } from "../data/carOptions";
import SmartSelect from "../companents/SmartSelect";
import { API_BASE_URL } from "../utils/config";

const API_BASE = API_BASE_URL;

const UpdateCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkmodeEnabled } = useDarkmode();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");

  const [existingMedia, setExistingMedia] = useState([]);
  const [newMediaFiles, setNewMediaFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [deletingMediaId, setDeletingMediaId] = useState(null);
  const [settingMainMediaId, setSettingMainMediaId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const brandOptions = useMemo(() => CAR_BRANDS.map((item) => item.brand), []);

  const modelOptions = useMemo(() => {
    const selectedBrand = CAR_BRANDS.find(
      (item) => item.brand.toLowerCase() === brand.toLowerCase()
    );

    return selectedBrand?.models || [];
  }, [brand]);

  const getMediaType = (media) => {
    const fileType = media?.type || "";
    const mediaType = Number(media?.mediaType);
    const url = String(media?.fileUrl || media?.url || "").toLowerCase();

    if (mediaType === 2 || fileType.startsWith("video/")) return "video";
    if (mediaType === 1 || fileType.startsWith("image/")) return "image";

    if (/\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(url)) return "video";
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

  const getMediaUrl = (path) => {
    if (!path) return "https://placehold.co/600x400?text=No+Media";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const normalizeMedia = (carData) => {
    const media = carData?.media || carData?.Media;

    if (Array.isArray(media)) {
      return [...media].sort(
        (a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
      );
    }

    if (Array.isArray(media?.$values)) {
      return [...media.$values].sort(
        (a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)
      );
    }

    return [];
  };

  const fillForm = (carData) => {
    setBrand(carData.brand || "");
    setModel(carData.model || "");
    setYear(String(carData.year || ""));
    setColor(carData.color || "");
    setCity(carData.city || "");
    setDescription(carData.description || "");
    setExistingMedia(normalizeMedia(carData));
  };

  const getErrorMessage = (data, fallback) => {
    if (data?.errors) {
      const firstError = Object.values(data.errors)?.flat()?.[0];
      return firstError || fallback;
    }

    return data?.message || data?.Message || data?.title || fallback;
  };

  const fetchCar = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(`/api/Cars/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Maşın məlumatları yüklənmədi"));
      }

      fillForm(data?.data || data);
    } catch (err) {
      setError(err.message || "Maşın məlumatları yüklənmədi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCar();
  }, [id]);

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

  const handleDeleteMedia = async (mediaId) => {
    if (!mediaId) return;

    try {
      setDeletingMediaId(mediaId);
      setError("");
      setSuccess("");

      const response = await apiFetch(`/api/Cars/media/${mediaId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Media silinmədi"));
      }

      setExistingMedia((prev) => prev.filter((item) => item.id !== mediaId));
      setSuccess("Media uğurla silindi");
    } catch (err) {
      setError(err.message || "Media silinərkən xəta baş verdi");
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleSetMainMedia = async (mediaId) => {
    if (!mediaId) return;

    try {
      setSettingMainMediaId(mediaId);
      setError("");
      setSuccess("");

      const response = await apiFetch(`/api/Cars/media/${mediaId}/set-main`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Əsas şəkil dəyişdirilmədi"));
      }

      setSuccess("Əsas şəkil yeniləndi");
      await fetchCar();
    } catch (err) {
      setError(err.message || "Əsas şəkil yenilənərkən xəta baş verdi");
    } finally {
      setSettingMainMediaId(null);
    }
  };

  const uploadNewMedia = async () => {
    if (newMediaFiles.length === 0) return;

    const formData = new FormData();
    formData.append("Purpose", "1");

    newMediaFiles.forEach((file) => {
      formData.append("Files", file);
    });

    const response = await apiFetch(`/api/Cars/${id}/media`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Yeni media əlavə olunmadı"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!brand.trim()) return setError("Marka daxil edin");
    if (!model.trim()) return setError("Model daxil edin");
    if (!year.trim()) return setError("İl seçin və ya daxil edin");
    if (!color.trim()) return setError("Rəng seçin və ya daxil edin");
    if (!city.trim()) return setError("Şəhər seçin və ya daxil edin");
    if (!description.trim()) return setError("Açıqlama daxil edin");

    try {
      setSubmitting(true);

      const response = await apiFetch(`/api/Cars/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          year: String(year).trim(),
          color: color.trim(),
          city: city.trim(),
          description: description.trim(),
          isProfileVisible: true,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Maşın yenilənmədi"));
      }

      await uploadNewMedia();

      setSuccess("Maşın məlumatları uğurla yeniləndi");
      setNewMediaFiles([]);
      await fetchCar();
    } catch (err) {
      setError(err.message || "Yeniləmə zamanı xəta baş verdi");
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-red-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="font-semibold text-lg">Maşın məlumatları yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-screen ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className={`rounded-[26px] border p-5 sm:p-7 ${cardClassName}`}>
          <h1 className="text-[26px] sm:text-[34px] lg:text-[42px] font-black text-center">
            Maşını yenilə
          </h1>
          <p
            className={`text-center mt-3 text-sm sm:text-base ${
              isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Buradan maşının məlumatlarını, şəkillərini və videolarını idarə edə bilərsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
          <div className="xl:col-span-5 space-y-6">
            <div className={`rounded-[26px] border p-4 sm:p-6 ${cardClassName}`}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Mövcud media
              </h2>

              {existingMedia.length === 0 ? (
                <p className={isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"}>
                  Media tapılmadı
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {existingMedia.map((media, index) => {
                    const mediaId = media.id;
                    const isMain = media.isMain;
                    const mediaUrl = media.fileUrl;
                    const mediaType = getMediaType(media);

                    return (
                      <div
                        key={mediaId}
                        className={`rounded-[20px] overflow-hidden border ${
                          isDarkmodeEnabled
                            ? "border-white/10 bg-[#171717]"
                            : "border-gray-200 bg-[#f7f7f7]"
                        }`}
                      >
                        <div className="relative">
                          {mediaType === "video" ? (
                            <video
                              src={getMediaUrl(mediaUrl)}
                              className="w-full h-[150px] sm:h-[185px] object-cover"
                              controls
                              muted
                            />
                          ) : (
                            <img
                              src={getMediaUrl(mediaUrl)}
                              alt={`car-${index}`}
                              className="w-full h-[150px] sm:h-[185px] object-cover"
                            />
                          )}

                          {isMain && mediaType === "image" && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                              Əsas
                            </span>
                          )}

                          {mediaType === "video" && (
                            <span className="absolute top-2 left-2 bg-purple-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                              Video
                            </span>
                          )}
                        </div>

                        <div className="p-3 space-y-2">
                          <p className="text-sm font-semibold">
                            {mediaType === "video"
                              ? `Video ${index + 1}`
                              : isMain
                              ? "Əsas şəkil"
                              : `Şəkil ${index + 1}`}
                          </p>

                          {mediaType === "image" && (
                            <button
                              type="button"
                              onClick={() => handleSetMainMedia(mediaId)}
                              disabled={isMain || settingMainMediaId === mediaId}
                              className={`w-full py-2 rounded-xl text-sm font-bold transition ${
                                isMain
                                  ? "bg-green-500 text-white cursor-default"
                                  : "bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-60"
                              }`}
                            >
                              {isMain
                                ? "Əsas şəkildir"
                                : settingMainMediaId === mediaId
                                ? "Yenilənir..."
                                : "Əsas et"}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(mediaId)}
                            disabled={deletingMediaId === mediaId}
                            className="w-full py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition"
                          >
                            {deletingMediaId === mediaId ? "Silinir..." : "Sil"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={`rounded-[26px] border p-4 sm:p-6 ${cardClassName}`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">
                  Yeni media əlavə et
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
                Şəkil və video əlavə edə bilərsiniz. Əsas media yalnız şəkil ola bilər.
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
                        <p className="text-xs truncate mb-2">{item.file.name}</p>

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
          </div>

          <div className="xl:col-span-7">
            <div className={`rounded-[26px] border p-4 sm:p-6 ${cardClassName}`}>
              <h2 className="text-xl sm:text-2xl font-bold mb-6">
                Maşın məlumatları
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
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

                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl px-4 py-3 text-sm bg-green-500/10 text-green-400 border border-green-500/20">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative overflow-hidden w-full bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 disabled:opacity-60 font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {submitting ? "Yenilənir..." : "Maşını yenilə"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/my-cars")}
                    className={`w-full py-3 rounded-xl font-bold transition ${
                      isDarkmodeEnabled
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-black text-white hover:opacity-90"
                    }`}
                  >
                    Geri qayıt
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCar;