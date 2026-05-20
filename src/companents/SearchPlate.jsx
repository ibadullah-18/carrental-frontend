import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";
import { apiFetch } from "../utils/apiFetch";
import { API_BASE_URL } from "../utils/config";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getFileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const formatPlate = (value) => {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);
};

const plateForApi = (value) => {
  return value.replace(/\s/g, "").toUpperCase().slice(0, 10);
};

const SearchPlate = () => {
  const { isDarkmodeEnabled } = useDarkmode();

  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cars, setCars] = useState([]);
  const [profiles, setProfiles] = useState({});

  const [activeCarIndex, setActiveCarIndex] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const activeCar = cars[activeCarIndex];
  const activeProfile = activeCar ? profiles[activeCar.userId] : null;

  const media = useMemo(() => {
    return normalizeArray(activeCar?.media)
      .slice()
      .sort((a, b) => {
        if (a.isMain && !b.isMain) return -1;
        if (!a.isMain && b.isMain) return 1;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
  }, [activeCar]);

  const selectedMedia = media[activeMediaIndex];

  const fetchUserProfiles = async (carsData) => {
    const uniqueUserIds = [
      ...new Set(carsData.map((x) => x.userId).filter(Boolean)),
    ];

    const entries = await Promise.all(
      uniqueUserIds.map(async (userId) => {
        try {
          const res = await apiFetch(`/api/Users/${userId}/public-profile`, {
            method: "GET",
          });

          if (!res.ok) return [userId, null];

          const data = await res.json();
          return [userId, data];
        } catch {
          return [userId, null];
        }
      })
    );

    setProfiles(Object.fromEntries(entries));
  };

  const handleSearch = async () => {
    const apiPlate = plateForApi(plate);

    if (apiPlate.length < 1) {
      setError("Nömrə daxil et");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCars([]);
      setProfiles({});
      setActiveCarIndex(0);
      setActiveMediaIndex(0);

      const response = await apiFetch(
        `/api/Cars/search?plate=${encodeURIComponent(apiPlate)}`,
        {
          method: "GET",
        }
      );

      if (response.status === 401 || response.status === 403) {
        setError("Sənin nömrə ilə axtarış icazən yoxdur");
        return;
      }

      if (!response.ok) {
        throw new Error("Axtarış alınmadı");
      }

      const data = await response.json();
      const result = normalizeArray(data);

      setCars(result);

      if (result.length === 0) {
        setError("Bu nömrəyə uyğun maşın tapılmadı");
      } else {
        fetchUserProfiles(result);
      }
    } catch (err) {
      console.log(err);
      setError("Axtarış zamanı xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const nextCar = () => {
    if (!cars.length) return;
    setActiveCarIndex((prev) => (prev + 1) % cars.length);
    setActiveMediaIndex(0);
  };

  const prevCar = () => {
    if (!cars.length) return;
    setActiveCarIndex((prev) => (prev === 0 ? cars.length - 1 : prev - 1));
    setActiveMediaIndex(0);
  };

  const nextMedia = () => {
    if (!media.length) return;
    setActiveMediaIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    if (!media.length) return;
    setActiveMediaIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  return (
    <div
      className={`min-h-screen ${
        isDarkmodeEnabled
          ? "bg-[#070707] text-[#f5f5f5]"
          : "bg-[#f4f4f4] text-black"
      }`}
    >
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 py-5 sm:py-7">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className={`
              rounded-xl px-4 py-2.5
              text-sm font-bold
              shadow-md
              hover:-translate-y-0.5
              transition
              ${
                isDarkmodeEnabled
                  ? "bg-[#181818] text-white border border-white/10 hover:bg-[#222222]"
                  : "bg-black text-white"
              }
            `}
          >
            ← Geri
          </Link>

          <div className="text-right">
            <h1 className="text-xl sm:text-2xl font-black">ShowCar</h1>

            <p
              className={`text-xs ${
                isDarkmodeEnabled ? "text-white/45" : "text-gray-500"
              }`}
            >
              Nömrə ilə axtarış
            </p>
          </div>
        </div>

        <div className="mt-7 flex justify-center">
          <div
            className={`
              w-full max-w-[420px]
              rounded-2xl p-3
              shadow-lg
              ${
                isDarkmodeEnabled
                  ? "bg-[#121212] border border-white/10 shadow-black/40"
                  : "bg-white"
              }
            `}
          >
            <div
              className={`
                flex overflow-hidden rounded-xl border-2 bg-white
                ${isDarkmodeEnabled ? "border-yellow-400/80" : "border-black"}
              `}
            >
              <div className="flex w-[58px] shrink-0 flex-col items-center justify-center bg-[#0b5ed7] text-white">
                <span className="text-xl">🇦🇿</span>

                <span className="text-[10px] font-black">AZ</span>
              </div>

              <input
                value={plate}
                onChange={(e) => setPlate(formatPlate(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                maxLength={10}
                placeholder="77 MF 835"
                className="
                  w-full bg-white
                  px-3 py-3
                  text-center text-xl sm:text-2xl
                  font-black tracking-[0.14em]
                  text-black
                  outline-none
                  placeholder:text-gray-300
                "
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="
                mt-3 w-full
                rounded-xl bg-yellow-400
                py-3
                font-black text-black
                shadow-sm
                hover:bg-yellow-300
                active:scale-[0.98]
                disabled:opacity-60
                transition
              "
            >
              {loading ? "Axtarılır..." : "Axtar"}
            </button>

            {error && (
              <div
                className={`
                  mt-3 rounded-xl
                  px-4 py-2.5
                  text-center text-sm
                  font-bold
                  ${
                    isDarkmodeEnabled
                      ? "bg-red-500/10 text-red-300 border border-red-500/20"
                      : "bg-red-50 text-red-500"
                  }
                `}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        {activeCar && (
          <div
            className="
              mt-7
              grid grid-cols-1 lg:grid-cols-[1.45fr_.55fr]
              gap-5
              animate-[fadeUp_.35s_ease]
            "
          >
            <div className="overflow-hidden rounded-3xl bg-black shadow-2xl">
              <div
                className="
                  relative
                  flex items-center justify-center
                  h-[320px] sm:h-[520px] lg:h-[700px]
                  bg-black
                "
              >
                {selectedMedia?.fileUrl ? (
                  selectedMedia.mediaType === 2 ? (
                    <video
                      src={getFileUrl(selectedMedia.fileUrl)}
                      controls
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={getFileUrl(selectedMedia.fileUrl)}
                      alt={`${activeCar.brand || ""} ${activeCar.model || ""}`}
                      className="h-full w-full object-contain"
                    />
                  )
                ) : (
                  <div className="text-center text-white">
                    <div className="text-7xl">🚗</div>

                    <p className="mt-3 font-bold">Media yoxdur</p>
                  </div>
                )}

                {media.length > 1 && (
                  <>
                    <button
                      onClick={prevMedia}
                      className="
                        absolute left-3 top-1/2
                        h-11 w-11
                        -translate-y-1/2
                        rounded-full bg-white
                        text-3xl font-black text-black
                        shadow-xl
                      "
                    >
                      ‹
                    </button>

                    <button
                      onClick={nextMedia}
                      className="
                        absolute right-3 top-1/2
                        h-11 w-11
                        -translate-y-1/2
                        rounded-full bg-white
                        text-3xl font-black text-black
                        shadow-xl
                      "
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {media.length > 1 && (
                <div className="flex gap-2 overflow-x-auto bg-black p-3">
                  {media.map((item, index) => (
                    <button
                      key={item.id || index}
                      onClick={() => setActiveMediaIndex(index)}
                      className={`
                        h-16 w-24 shrink-0
                        overflow-hidden rounded-xl
                        border-2 transition
                        ${
                          activeMediaIndex === index
                            ? "border-yellow-400 scale-105"
                            : "border-white/20 opacity-70"
                        }
                      `}
                    >
                      {item.mediaType === 2 ? (
                        <div
                          className="
                            flex h-full w-full
                            items-center justify-center
                            bg-gray-900 text-white
                          "
                        >
                          ▶
                        </div>
                      ) : (
                        <img
                          src={getFileUrl(item.fileUrl)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`
                rounded-3xl p-5 sm:p-6
                shadow-xl h-fit
                ${
                  isDarkmodeEnabled
                    ? "bg-[#121212] border border-white/10 shadow-black/50"
                    : "bg-white"
                }
              `}
            >
              {cars.length > 1 && (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <button
                    onClick={prevCar}
                    className={`
                      rounded-xl px-4 py-2
                      text-sm font-bold
                      ${
                        isDarkmodeEnabled
                          ? "bg-[#1f1f1f] text-white border border-white/10"
                          : "bg-black text-white"
                      }
                    `}
                  >
                    ←
                  </button>

                  <span className="font-black">
                    {activeCarIndex + 1} / {cars.length}
                  </span>

                  <button
                    onClick={nextCar}
                    className={`
                      rounded-xl px-4 py-2
                      text-sm font-bold
                      ${
                        isDarkmodeEnabled
                          ? "bg-[#1f1f1f] text-white border border-white/10"
                          : "bg-black text-white"
                      }
                    `}
                  >
                    →
                  </button>
                </div>
              )}

              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                {activeCar.brand} {activeCar.model}
              </h2>

              <div className="mt-5 space-y-3">
                {[
                  ["Marka", activeCar.brand || "Yoxdur"],
                  ["Model", activeCar.model || "Yoxdur"],
                  ["Buraxılış ili", activeCar.year || "Qeyd edilməyib"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className={`
                      rounded-2xl p-4
                      ${
                        isDarkmodeEnabled
                          ? "bg-[#1a1a1a] border border-white/10"
                          : "bg-gray-100"
                      }
                    `}
                  >
                    <div
                      className={`
                        text-xs font-black uppercase
                        ${
                          isDarkmodeEnabled
                            ? "text-yellow-400/80"
                            : "text-gray-400"
                        }
                      `}
                    >
                      {label}
                    </div>

                    <div
                      className={`mt-1 text-lg font-black ${
                        isDarkmodeEnabled ? "text-white" : "text-black"
                      }`}
                    >
                      {value}
                    </div>
                  </div>
                ))}

                <div
                  className={`
                    rounded-2xl p-4
                    ${
                      isDarkmodeEnabled
                        ? "bg-[#1a1a1a] border border-white/10"
                        : "bg-gray-100"
                    }
                  `}
                >
                  <div
                    className={`
                      text-xs font-black uppercase
                      ${
                        isDarkmodeEnabled
                          ? "text-yellow-400/80"
                          : "text-gray-400"
                      }
                    `}
                  >
                    Comment
                  </div>

                  <div
                    className={`mt-1 text-sm leading-6 font-semibold ${
                      isDarkmodeEnabled ? "text-white/75" : "text-gray-700"
                    }`}
                  >
                    {activeCar.description || "Comment yoxdur"}
                  </div>
                </div>

                <div
                  className={`
                    rounded-2xl p-4
                    ${
                      isDarkmodeEnabled
                        ? "bg-yellow-400 text-black"
                        : "bg-black text-white"
                    }
                  `}
                >
                  <div
                    className={`
                      text-xs font-black uppercase
                      ${
                        isDarkmodeEnabled ? "text-black/55" : "text-white/50"
                      }
                    `}
                  >
                    Baxış sayı
                  </div>

                  <div className="mt-1 text-2xl font-black">
                    {activeCar.viewsCount || activeCar.viewCount || 0}
                  </div>
                </div>
              </div>

              <Link
                to={`/owner-profile/${activeCar.userId}`}
                className={`
                  mt-5 flex items-center gap-3
                  rounded-2xl p-3
                  shadow-lg
                  hover:-translate-y-1
                  transition
                  ${
                    isDarkmodeEnabled
                      ? "bg-[#1f1f1f] text-white border border-white/10 hover:bg-[#292929]"
                      : "bg-black text-white"
                  }
                `}
              >
                <div
                  className="
                    h-12 w-12
                    overflow-hidden rounded-full
                    bg-yellow-400
                  "
                >
                  {activeProfile?.profileImageUrl ? (
                    <img
                      src={getFileUrl(activeProfile.profileImageUrl)}
                      alt={activeProfile.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex h-full w-full
                        items-center justify-center
                        text-black
                      "
                    >
                      👤
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="truncate font-black">
                    {activeProfile?.fullName || "Profil"}
                  </div>

                  <div
                    className={`text-xs ${
                      isDarkmodeEnabled ? "text-yellow-400/70" : "text-white/60"
                    }`}
                  >
                    Profilə keç
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SearchPlate;