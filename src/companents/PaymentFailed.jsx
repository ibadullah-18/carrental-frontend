import { useNavigate } from "react-router-dom";
import { useDarkmode } from "../stores/useDarkmode";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const { isDarkmodeEnabled } = useDarkmode();

  const cardClassName = isDarkmodeEnabled
    ? "bg-[#111111] border-[#2a2a2a] text-white"
    : "bg-white border-gray-200 text-black";

  return (
    <div
      className={`w-full min-h-screen ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"
      }`}
    >
      <div className="max-w-[900px] mx-auto px-4 py-10">
        <div
          className={`rounded-[26px] border p-6 sm:p-10 text-center ${cardClassName}`}
        >
          <div className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center mx-auto text-4xl font-black">
            !
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mt-6">
            Ödəniş tamamlanmadı
          </h1>

          <p
            className={`mt-3 max-w-[650px] mx-auto leading-7 ${
              isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Ödəniş uğursuz oldu və ya ləğv edildi. Yenidən cəhd edə bilərsiniz.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7 max-w-[520px] mx-auto">
            <button
              type="button"
              onClick={() => navigate("/add-car")}
              className="py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition"
            >
              Yenidən cəhd et
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className={`py-3 rounded-xl font-bold transition ${
                isDarkmodeEnabled
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-black text-white hover:opacity-90"
              }`}
            >
              Ana səhifə
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;