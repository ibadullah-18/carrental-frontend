import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import { useDarkmode } from "../stores/useDarkmode";
import { FaTiktok, FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";

const Footer = () => {
  const { isDarkmodeEnabled } = useDarkmode();
  const navigate = useNavigate();

  const socialLink =
    "https://l.instagram.com/?u=https%3A%2F%2Fwww.tiktok.com%2F%40ibadulla.huseynzade%3F_t%3D8kkTNmMYHTe%26_r%3D1%26fbclid%3DPAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnIMsV9MmWjeVqpnyclnm9tUIAQcTAWZtaLkhekJ8dCiZA7IuhJXouHgTB3g8_aem_I1o3zDBSx-8Hc8OrsFA4Rw&e=AT5LO-b61ynC8jzj1YdlrbQxhUNpJXMn0vbC_Z-fKBQ4c7FLKFMl5LtALD3HVg5CYRrtslyQ4CDb5RHreK4t69Mv5QMZh3VtvO1d-KjeIg";

  return (
    <div
      className={`w-full py-10 ${
        isDarkmodeEnabled ? "bg-[#222222] text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-[400px]">
            <h1 className="font-bold text-[20px]">About</h1>
            <p
              className={`mt-2 leading-7 ${
                isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
              }`}
            >
              We provide reliable and affordable car rental services with a wide
              range of vehicles. Our goal is to deliver a smooth and
              user-friendly experience, ensuring customer satisfaction every
              time.
            </p>

            <div className="flex mt-4">
              <h1 className="font-bold">Email:</h1>
              <p
                className={`pl-1 ${
                  isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                }`}
              >
                RentCAR@rentcar.com
              </p>
            </div>

            <div className="flex mt-2">
              <h1 className="font-bold">Phone:</h1>
              <p
                className={`pl-1 ${
                  isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                }`}
              >
                +123 456 7890
              </p>
            </div>
          </div>

          <div className="flex gap-16">
            <div>
              <h1 className="font-bold text-[20px]">Quick Links</h1>
              <ul
                className={`mt-2 ${
                  isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <li className="mt-3 cursor-pointer hover:text-red-500 transition">
                  About Us
                </li>
                <li className="mt-1 cursor-pointer hover:text-red-500 transition">
                  Services
                </li>
                <li className="mt-1 cursor-pointer hover:text-red-500 transition">
                  Contact
                </li>
                <li className="mt-1 cursor-pointer hover:text-red-500 transition">
                  Home
                </li>
              </ul>
            </div>

            <div>
              <h1 className="font-bold text-[20px]">Category</h1>
              <ul
                className={`mt-2 ${
                  isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
                }`}
              >
                <li className="mt-3">SUV</li>
                <li className="mt-1">Sedan</li>
                <li className="mt-1">Sport</li>
                <li className="mt-1">Luxury</li>
              </ul>
            </div>
          </div>
        </div>

        <div
          className={`mt-10 pt-6 border-t ${
            isDarkmodeEnabled ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div
              onClick={() => navigate("/")}
              className="flex items-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-md mr-3">
                <img
                  src={Logo}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-semibold">Zyro</h1>
              <h1 className="text-2xl text-red-500 ml-1">CAR</h1>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 hover:scale-110 ${
                  isDarkmodeEnabled
                    ? "bg-[#2f2f2f] text-gray-200 hover:bg-red-500 hover:text-white"
                    : "bg-white text-gray-700 shadow-sm hover:bg-red-500 hover:text-white"
                }`}
              >
                <FaTiktok size={15} />
              </a>

              <a
                href={socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 hover:scale-110 ${
                  isDarkmodeEnabled
                    ? "bg-[#2f2f2f] text-gray-200 hover:bg-red-500 hover:text-white"
                    : "bg-white text-gray-700 shadow-sm hover:bg-red-500 hover:text-white"
                }`}
              >
                <FaInstagram size={15} />
              </a>

              <a
                href={socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 hover:scale-110 ${
                  isDarkmodeEnabled
                    ? "bg-[#2f2f2f] text-gray-200 hover:bg-red-500 hover:text-white"
                    : "bg-white text-gray-700 shadow-sm hover:bg-red-500 hover:text-white"
                }`}
              >
                <FaTwitter size={15} />
              </a>

              <a
                href={socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition duration-300 hover:scale-110 ${
                  isDarkmodeEnabled
                    ? "bg-[#2f2f2f] text-gray-200 hover:bg-red-500 hover:text-white"
                    : "bg-white text-gray-700 shadow-sm hover:bg-red-500 hover:text-white"
                }`}
              >
                <FaFacebookF size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;