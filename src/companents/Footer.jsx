import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import { useDarkmode } from "../stores/useDarkmode";
import { FaTiktok, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const { isDarkmodeEnabled } = useDarkmode();
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);

  const instagramLink =
    "https://www.instagram.com/ibadulla.huseynzade";
  const tiktokLink =
    "https://www.tiktok.com/@ibadulla.huseynzade?_r=1&_t=ZS-96DQuZdjV3t";

  const textColor = isDarkmodeEnabled ? "text-gray-300" : "text-gray-600";

  const goHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/");
      setTimeout(() => {
        const target = document.getElementById(id);
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  };

  return (
    <footer
      className={`w-full py-10 ${
        isDarkmodeEnabled ? "bg-[#222222] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-[460px]">
            <h2 className="font-bold text-[20px]">Haqqımızda</h2>

            <p className={`mt-3 leading-7 ${textColor}`}>
              MyCar istifadəçilərin öz maşınlarını platformada rahat şəkildə
              göstərməsi üçün yaradılmış müasir onlayn xidmətdir. Saytda
              istifadəçilər maşın məlumatlarını əlavə edə, uyğun paket seçə və
              elanlarını digər istifadəçilərə görünən edə bilərlər.
            </p>

            <p className={`mt-3 leading-7 ${textColor}`}>
              Məqsədimiz maşınların daha rahat təqdim olunmasını, istifadəçilərin
              isə istədikləri avtomobillərə daha sürətli baxmasını təmin etməkdir.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">
            <div>
              <h2 className="font-bold text-[20px]">Keçidlər</h2>

              <ul className={`mt-3 ${textColor}`}>
                <li
                  onClick={() => scrollToSection("about")}
                  className="mt-3 cursor-pointer hover:text-red-500 transition"
                >
                  Haqqımızda
                </li>

                <li
                  onClick={() => scrollToSection("services")}
                  className="mt-2 cursor-pointer hover:text-red-500 transition"
                >
                  Xidmətlər
                </li>

                <li
                  onClick={goHome}
                  className="mt-2 cursor-pointer hover:text-red-500 transition"
                >
                  Əsas səhifə
                </li>

                <li
                  onClick={() => setShowContact((prev) => !prev)}
                  className="mt-2 cursor-pointer hover:text-red-500 transition"
                >
                  Əlaqə
                </li>
              </ul>
            </div>

            {showContact && (
              <div>
                <h2 className="font-bold text-[20px]">Əlaqə məlumatları</h2>

                <div className={`mt-3 space-y-2 ${textColor}`}>
                  <p>
                    <span className="font-semibold text-current">Email:</span>{" "}
                    <a
                      href="mailto:wallaxbaku@gmail.com"
                      className="hover:text-red-500 transition break-all"
                    >
                      wallaxbaku@gmail.com
                    </a>
                  </p>

                  <p>
                    <span className="font-semibold text-current">
                      Yaradıcı:
                    </span>{" "}
                    <a
                      href="mailto:huseynzadeibadullah@gmail.com"
                      className="hover:text-red-500 transition break-all"
                    >
                      huseynzadeibadullah@gmail.com
                    </a>
                  </p>

                  <p>
                    <span className="font-semibold text-current">Nömrə:</span>{" "}
                    <a
                      href="tel:+994506151345"
                      className="hover:text-red-500 transition"
                    >
                      +994 (50) 615 13 45
                    </a>
                  </p>

                  <p>
                    <span className="font-semibold text-current">Nömrə:</span>{" "}
                    <a
                      href="tel:+994556151345"
                      className="hover:text-red-500 transition"
                    >
                      +994 (55) 615 13 45
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`mt-10 pt-6 border-t ${
            isDarkmodeEnabled ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div
              onClick={goHome}
              className="flex items-center cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-md mr-3 bg-white">
                <img
                  src={Logo}
                  alt="MyCar loqosu"
                  className="w-full h-full object-cover"
                />
              </div>

              <h1 className="text-2xl font-semibold">My</h1>
              <h1 className="text-2xl text-red-500 ml-1 font-semibold">
                Car
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 hover:scale-110 ${
                  isDarkmodeEnabled
                    ? "bg-[#2f2f2f] text-gray-200 hover:bg-red-500 hover:text-white"
                    : "bg-white text-gray-700 shadow-sm hover:bg-red-500 hover:text-white"
                }`}
              >
                <FaInstagram size={15} />
              </a>

              <a
                href={tiktokLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 hover:scale-110 ${
                  isDarkmodeEnabled
                    ? "bg-[#2f2f2f] text-gray-200 hover:bg-red-500 hover:text-white"
                    : "bg-white text-gray-700 shadow-sm hover:bg-red-500 hover:text-white"
                }`}
              >
                <FaTiktok size={15} />
              </a>
            </div>
          </div>

          <p className={`text-center mt-5 text-sm ${textColor}`}>
            © {new Date().getFullYear()} MyCar. Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;