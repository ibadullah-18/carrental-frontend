import { useEffect, useState } from "react";

const Homepage = () => {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState("");

  const getCars = async () => {
    try {
      const response = await fetch("http://localhost:5248/api/Cars");

      if (!response.ok) {
        throw new Error("Serverden melumat gelmedi");
      }

      const data = await response.json();
      console.log("Gelen data:", data);

      setCars(data);
    } catch (err) {
      console.log("Xeta:", err);
      setError("Masinlari getirerken xeta bas verdi");
    }
  };

  useEffect(() => {
    getCars();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-10">
        Welcome to Car Rental Service
      </h1>

      {error && (
        <p className="text-red-500 text-center mb-6">{error}</p>
      )}

      {cars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car, index) => (
            <div
              key={car.id || index}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition"
            >
              {car.mainImageUrl || car.imageUrl ? (
                <img
                  src={car.mainImageUrl || car.imageUrl}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-52 object-cover"
                />
              ) : (
                <div className="w-full h-52 bg-gray-300 flex items-center justify-center text-gray-600 text-lg font-semibold">
                  No Image
                </div>
              )}

              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">
                  {car.brand} {car.model}
                </h2>

                <div className="space-y-1 text-gray-700 text-sm">
                  <p><span className="font-semibold">Year:</span> {car.year}</p>
                  <p><span className="font-semibold">Color:</span> {car.color}</p>
                  <p><span className="font-semibold">Fuel:</span> {car.fuelType}</p>
                  <p><span className="font-semibold">Transmission:</span> {car.transmission}</p>
                  <p><span className="font-semibold">Location:</span> {car.location}</p>
                  <p><span className="font-semibold">Mileage:</span> {car.mileage}</p>
                  <p><span className="font-semibold">Description:</span> {car.description}</p>
                </div>

                <p className="text-green-600 font-bold text-lg mt-4">
                  ${car.pricePerDay} / day
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xl">Hec bir masin tapilmadi</p>
      )}
    </div>
  );
};

export default Homepage;