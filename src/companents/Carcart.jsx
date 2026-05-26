import { Link } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";
import defaultImage from "../assets/download.png";

const Carcart = ({ car }) => {
  const { isDarkmodeEnabled } = useDarkmode();

  const carId = car?.id || car?.carId;

  const image = car?.mainImageUrl
    ? car.mainImageUrl.startsWith("http")
      ? car.mainImageUrl
      : `https://showcarhub.com${car.mainImageUrl}`
    : defaultImage;

  const brand = car?.brand || "Marka";
  const model = car?.model || "Model";
  const city = car?.city || car?.location || "Şəhər qeyd olunmayıb";
  const viewCount = car?.viewCount || 0;

  const plateNumber = (car?.plateNumber || "—")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/^(\d{2})([A-Z]{2})(\d{3})$/, "$1 $2 $3");

  return (
    <Link
      to={`/details/${carId}`}
      className={`
        group relative overflow-hidden block
        w-full max-w-[175px] sm:max-w-[270px] lg:max-w-[360px]
        rounded-[18px] sm:rounded-[22px]
        border transition-all duration-500
        hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.18)]
        ${
          isDarkmodeEnabled
            ? "bg-[#111111] border-[#2a2a2a] text-white"
            : "bg-white border-[#eeeeee] text-black"
        }
      `}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-black/20 rounded-full blur-3xl" />
      </div>

      {car?.isVip && (
        <div className="absolute top-3 left-3 z-20 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          VIP
        </div>
      )}

      <div
        className={`
          absolute top-3 right-3 z-20 backdrop-blur-md
          px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold
          ${
            isDarkmodeEnabled
              ? "bg-black/45 text-white"
              : "bg-white/75 text-black"
          }
        `}
      >
        {viewCount} baxış
      </div>

      <div className="relative w-full h-[135px] sm:h-[195px] lg:h-[245px] overflow-hidden">
        <img
          src={image}
          alt={`${brand} ${model}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = defaultImage;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />

        <div className="absolute bottom-3 left-3 right-3">
          <h2 className="text-white text-[15px] sm:text-[20px] lg:text-[24px] font-bold leading-tight line-clamp-1">
            {brand} {model}
          </h2>

          <div className="mt-1 flex items-center gap-1.5 text-white/90 text-[11px] sm:text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.724 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.862-4.947 3.862-8.827a8.15 8.15 0 10-16.3 0c0 3.88 1.918 6.837 3.862 8.827a19.58 19.58 0 002.683 2.282c.407.28.798.532 1.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="line-clamp-1">{city}</span>
          </div>
        </div>
      </div>

      <div className="relative p-3 sm:p-4 lg:p-5">
        <div
          className={`
            flex items-center justify-between
            rounded-2xl px-3 sm:px-4 py-3
            border
            ${
              isDarkmodeEnabled
                ? "bg-[#171717] border-[#2a2a2a]"
                : "bg-[#f7f7f7] border-[#ececec]"
            }
          `}
        >
          <div className="min-w-0 flex-1">
            <p
              className={`text-[10px] sm:text-xs uppercase tracking-wider ${
                isDarkmodeEnabled ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Dövlət nömrəsi
            </p>

            <h2 className="text-[14px] xs:text-[15px] sm:text-[20px] lg:text-[22px] font-black tracking-[1.8px] sm:tracking-[3px] mt-1 whitespace-nowrap overflow-hidden">
              {plateNumber}
            </h2>
          </div>

          <div className="hidden sm:block text-right shrink-0 ml-3">
            <p
              className={`text-xs uppercase tracking-wider ${
                isDarkmodeEnabled ? "text-gray-500" : "text-gray-400"
              }`}
            >
              İl
            </p>

            <h3 className="text-[18px] font-bold mt-1 text-red-500">
              {car?.year || "—"}
            </h3>
          </div>
        </div>

        <div
          className={`
            mt-4 flex items-center justify-between
            border-t pt-3
            ${isDarkmodeEnabled ? "border-[#2a2a2a]" : "border-[#eeeeee]"}
          `}
        >
          <div>
            <p
              className={`text-[11px] sm:text-xs ${
                isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Platformada göstərilir
            </p>

            <p className="text-[13px] sm:text-[15px] font-bold text-red-500">
              Ətraflı bax
            </p>
          </div>

          <div className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center transition duration-300 group-hover:translate-x-1 group-hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M16.28 11.47a.75.75 0 010 1.06l-5.25 5.25a.75.75 0 11-1.06-1.06L14.69 12 9.97 7.28a.75.75 0 111.06-1.06l5.25 5.25z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Carcart;