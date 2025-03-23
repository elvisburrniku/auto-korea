import axios from "axios";

const AUTO_MARKET_API = "http://localhost:5000";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

const ENCAR_API_URL =
  "https://api.encar.com/search/car/list/general?count=true&q=(And.(And.Hidden.N._.(C.CarType.N._.(C.Manufacturer.BMW._.ModelGroup.5%EC%8B%9C%EB%A6%AC%EC%A6%88.)))_.AdType.A.)&sr=%7CModifiedDate%7C0%7C8";

async function login() {
  try {
    const response = await axios.post(
      `${AUTO_MARKET_API}/api/auth/login`,
      {
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      },
      {
        withCredentials: true,
      },
    );

    if (!response.data || !response.data.isAdmin) {
      throw new Error("Admin authentication required");
    }

    return response.data;
  } catch (error) {
    console.error("Failed to login:", error.response?.data || error.message);
    throw error;
  }
}

async function fetchEncarCars() {
  try {
    const response = await axios.get(ENCAR_API_URL);
    return response.data.SearchResults;
  } catch (error) {
    console.error("Failed to fetch data from Encar:", error.message);
    throw error;
  }
}

async function createCar(carData) {
  try {
    carData.isFeatured = Math.random() > 0.7;

    const response = await axios.post(`${AUTO_MARKET_API}/api/cars`, carData, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error(
      `Failed to create car: ${carData.make} ${carData.model}`,
      error.message,
    );
    if (error.response) console.error("Response data:", error.response.data);
    throw error;
  }
}

function transformEncarCar(encarCar) {
  const images = (encarCar.Photos || []).map(
    (p) => `https://image.encar.com${p.location}`,
  );
  const year = parseInt(encarCar.FormYear);
  const price = parseInt(encarCar.Price * 10000); // convert 만원 to 원
  const mileage = parseInt(encarCar.Mileage);

  return {
    make: encarCar.Manufacturer || "BMW",
    model: encarCar.Badge || encarCar.Model || "Unknown",
    year,
    price,
    mileage,
    fuelType:
      encarCar.FuelType === "가솔린"
        ? "Gasoline"
        : encarCar.FuelType === "디젤"
          ? "Diesel"
          : encarCar.FuelType,
    transmission: "Automatic",
    drivetrain: "RWD", // guessing default, no info in API
    exteriorColor: "Unknown",
    interiorColor: "Unknown",
    description: `Imported from Encar. Trim: ${encarCar.Badge || "N/A"}, Service: ${encarCar.ServiceMark?.join(", ") || "N/A"}, Condition: ${encarCar.Condition?.join(", ") || "N/A"}`,
    sellerName: "Import Motors",
    sellerPhone: "+82-1234-5678",
    sellerEmail: "import@automarket.com",
    sellerLocation: encarCar.OfficeCityState || "Korea",
    images,
  };
}

async function importEncarCars() {
  try {
    const user = await login();
    const encarCars = await fetchEncarCars();

    console.log(`Fetched ${encarCars.length} Encar cars`);

    let imported = 0,
      failed = 0;

    for (const encarCar of encarCars) {
      const carData = transformEncarCar(encarCar);
      try {
        await createCar(carData);
        console.log(
          `✅ Imported: ${carData.year} ${carData.make} ${carData.model}`,
        );
        imported++;
      } catch (err) {
        console.log(
          `❌ Failed: ${carData.year} ${carData.make} ${carData.model}`,
        );
        failed++;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("🚗 Import complete!");
    console.log(
      `Total: ${encarCars.length}, Imported: ${imported}, Failed: ${failed}`,
    );
  } catch (err) {
    console.error("Import failed:", err.message);
  }
}

importEncarCars()
  .then(() => console.log("Script completed"))
  .catch((err) => console.error("Script error:", err.message));
