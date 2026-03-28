import BmwLogo from "../assets/bmw_logo_icon_145840 1.png";
import MercedesLogo from "../assets/mercedes.png";
import HyundaiLogo from "../assets/Hyundai.png";
import AudiLogo from "../assets/audi.png";
import ToyotaLogo from "../assets/toyota.png";
import KiaLogo from "../assets/kia.png";

import SedanImg from "../assets/sedan.png";
import SuvImg from "../assets/suv.png";
import CoupeImg from "../assets/coupe.png";
import CrossoverImg from "../assets/crossover.png";
import ConvertibleImg from "../assets/convertible.png";
import WagonImg from "../assets/wagon.png";

const brands = [
  { name: "BMW", image: BmwLogo },
  { name: "Mercedes", image: MercedesLogo },
  { name: "Hyundai", image: HyundaiLogo },
  { name: "Audi", image: AudiLogo },
  { name: "Toyota", image: ToyotaLogo },
  { name: "Kia", image: KiaLogo },
];

const bodyTypes = [
  { name: "Sedan", image: SedanImg },
  { name: "SUV", image: SuvImg },
  { name: "Coupe", image: CoupeImg },
  { name: "Crossover", image: CrossoverImg },
  { name: "Convertible", image: ConvertibleImg },
  { name: "Wagon", image: WagonImg },
];

const Filter = ({
  selectedBrand,
  selectedBodyType,
  setSelectedBrand,
  setSelectedBodyType,
  clearFilters,
}) => {
  return (
    <div className="w-full mt-10 sm:mt-12">
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="rounded-[28px] p-4 sm:p-6 md:p-8 shadow-sm bg-[#f7f7f7] text-black">

        {/* BRAND */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-2xl font-bold">Rent by Brands</h2>
          <button
            type="button"
            onClick={() => setSelectedBrand("")}
            className="text-sm sm:text-base text-gray-500 hover:text-black transition"
          >
            View all →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {brands.map((brand) => (
            <button
              type="button"
              key={brand.name}
              onClick={() => setSelectedBrand(brand.name)}
              className={`rounded-2xl p-4 min-h-[110px] border transition-all duration-300 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-lg ${
                selectedBrand === brand.name
                  ? "bg-gray-200 text-black border-black shadow-md scale-[1.03]"
                  : "bg-white text-black border-gray-200"
              }`}
            >
              <img
                src={brand.image}
                alt={brand.name}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
              <span className="text-sm font-semibold">{brand.name}</span>
            </button>
          ))}
        </div>

        {/* BODY TYPE */}
        <div className="flex items-center justify-between mt-8 mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-2xl font-bold">Rent by Body Type</h2>
          <button
            type="button"
            onClick={() => setSelectedBodyType("")}
            className="text-sm sm:text-base text-gray-500 hover:text-black transition"
          >
            View all →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {bodyTypes.map((type) => (
            <button
              type="button"
              key={type.name}
              onClick={() => setSelectedBodyType(type.name)}
              className={`rounded-2xl p-4 min-h-[110px] border transition-all duration-300 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 hover:shadow-lg ${
                selectedBodyType === type.name
                  ? "bg-gray-200 text-black border-black shadow-md scale-[1.03]"
                  : "bg-white text-black border-gray-200"
              }`}
            >
              <img
                src={type.image}
                alt={type.name}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
              />
              <span className="text-sm font-semibold">{type.name}</span>
            </button>
          ))}
        </div>

        {/* CLEAR BUTTON */}
        {(selectedBrand || selectedBodyType) && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-3 rounded-full bg-yellow-400 text-black font-semibold hover:scale-105 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

export default Filter;