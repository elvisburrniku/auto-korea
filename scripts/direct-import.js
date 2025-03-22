// A simplified version of the importer that directly adds sample BMW cars without downloading images

import axios from 'axios';

// AutoMarket API endpoint
const AUTO_MARKET_API = 'http://localhost:5000';
// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

async function login() {
  try {
    // Use axios with withCredentials to maintain session cookies
    const response = await axios.post(`${AUTO_MARKET_API}/api/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    }, {
      withCredentials: true
    });

    if (!response.data || !response.data.isAdmin) {
      throw new Error('Admin authentication required');
    }

    return response.data;
  } catch (error) {
    console.error('Failed to login:', error.response?.data || error.message);
    throw new Error('Authentication failed');
  }
}

async function createCar(carData, authToken) {
  try {
    // Just use the images directly - don't try to download
    // Set featured for some cars randomly
    carData.isFeatured = Math.random() > 0.7;

    // Use credentials to make the request with session cookies
    const response = await axios.post(`${AUTO_MARKET_API}/api/cars`, carData, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error('Failed to create car:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to create car: ${carData.make} ${carData.model}`);
  }
}

async function importSampleCars() {
  try {
    // Login to get auth token
    const user = await login();
    console.log('Logged in as admin');
    
    // Check if user is authenticated and is admin
    if (!user) {
      console.error('Login failed');
      return;
    }

    if (!user.isAdmin) {
      console.error('User is not an admin. Please login with an admin account.');
      return;
    }

    // Sample BMW cars
    const sampleCars = [
      {
        make: "BMW",
        model: "320i",
        year: 2022,
        price: 36000,
        mileage: 15000,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "RWD",
        exteriorColor: "Alpine White",
        interiorColor: "Black",
        description: "2022 BMW 320i with Sport Package. Features include sport seats, sport suspension, and BMW M Sport steering wheel. The vehicle comes with a 2.0L turbocharged engine providing excellent performance and fuel efficiency.",
        sellerName: "Import Motors",
        sellerPhone: "+82-1234-5678",
        sellerEmail: "import@automarket.com",
        sellerLocation: "Seoul, South Korea",
        images: ["https://www.bmwusa.com/content/dam/bmwusa/3Series/MY22/BMW-MY22-3Series-330e-Gallery-05.jpg"],
      },
      {
        make: "BMW",
        model: "330i xDrive",
        year: 2021,
        price: 42000,
        mileage: 22000,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "AWD",
        exteriorColor: "Black Sapphire",
        interiorColor: "Cognac",
        description: "2021 BMW 330i xDrive with Executive Package. All-wheel drive provides excellent traction in all weather conditions. Features include premium sound system, heated seats, and advanced driver assistance systems.",
        sellerName: "Import Motors",
        sellerPhone: "+82-1234-5678",
        sellerEmail: "import@automarket.com",
        sellerLocation: "Seoul, South Korea",
        images: ["https://www.bmwusa.com/content/dam/bmwusa/3Series/MY21/BMW-MY21-3Series-330i-xDRIVE-Gallery-01.jpg"],
      },
      {
        make: "BMW",
        model: "M340i",
        year: 2020,
        price: 48000,
        mileage: 35000,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "RWD",
        exteriorColor: "Portimao Blue",
        interiorColor: "Black",
        description: "2020 BMW M340i with M Sport Package. This high-performance variant of the 3 Series features a 3.0L inline-6 turbocharged engine producing 382 horsepower. Includes adaptive M suspension, M Sport differential, and M Sport brakes.",
        sellerName: "Import Motors",
        sellerPhone: "+82-1234-5678",
        sellerEmail: "import@automarket.com",
        sellerLocation: "Seoul, South Korea",
        images: ["https://www.bmwusa.com/content/dam/bmwusa/3Series/MY20/BMW-MY20-3Series-M340i-Gallery-01.jpg"],
      },
      {
        make: "BMW",
        model: "430i Coupe",
        year: 2022,
        price: 45500,
        mileage: 8000,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "RWD",
        exteriorColor: "Arctic Race Blue",
        interiorColor: "Oyster",
        description: "2022 BMW 430i Coupe with M Sport Package. This elegant two-door coupe features BMWs latest technology and premium finishes. Equipped with a 2.0L TwinPower Turbo engine and 8-speed automatic transmission.",
        sellerName: "Import Motors",
        sellerPhone: "+82-1234-5678",
        sellerEmail: "import@automarket.com",
        sellerLocation: "Seoul, South Korea",
        images: ["https://www.bmwusa.com/content/dam/bmwusa/4Series/MY22/BMW-MY22-4Series-430i-Coupe-Gallery-01.jpg"],
      },
      {
        make: "BMW",
        model: "X3 xDrive30i",
        year: 2021,
        price: 47000,
        mileage: 18000,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "AWD",
        exteriorColor: "Phytonic Blue",
        interiorColor: "Cognac",
        description: "2021 BMW X3 xDrive30i with Premium Package. This luxury compact SUV offers the perfect blend of performance and practicality. Features include panoramic sunroof, heated seats, and driver assistance systems.",
        sellerName: "Import Motors",
        sellerPhone: "+82-1234-5678",
        sellerEmail: "import@automarket.com",
        sellerLocation: "Seoul, South Korea",
        images: ["https://www.bmwusa.com/content/dam/bmwusa/X3/MY21/BMW-MY21-X3-Gallery-07.jpg"],
      },
      {
        make: "BMW",
        model: "X5 xDrive40i",
        year: 2022,
        price: 65000,
        mileage: 12000,
        fuelType: "Gasoline",
        transmission: "Automatic",
        drivetrain: "AWD",
        exteriorColor: "Mineral White",
        interiorColor: "Coffee",
        description: "2022 BMW X5 xDrive40i with Executive Package. This luxury midsize SUV offers exceptional comfort and capability. Features include 3.0L TwinPower Turbo inline-6 engine, third-row seating option, and advanced driver assistance systems.",
        sellerName: "Import Motors",
        sellerPhone: "+82-1234-5678",
        sellerEmail: "import@automarket.com",
        sellerLocation: "Seoul, South Korea",
        images: ["https://www.bmwusa.com/content/dam/bmwusa/X5/MY22/BMW-MY22-X5-Gallery-01.jpg"],
      },
      {
        make: "BMW",
        model: "i4 eDrive40",
        year: 2022,
        price: 56000,
        mileage: 5000,
        fuelType: "Electric",
        transmission: "Automatic",
        drivetrain: "RWD",
        exteriorColor: "Mineral White",
        interiorColor: "Black",
        description: "2022 BMW i4 eDrive40 Gran Coupe. This all-electric sedan offers impressive range and performance. Features include 335 horsepower electric motor, up to 301 miles of range, and BMWs latest iDrive 8 system with curved display.",
        sellerName: "Import Motors",
        sellerPhone: "+82-1234-5678",
        sellerEmail: "import@automarket.com",
        sellerLocation: "Seoul, South Korea",
        images: ["https://www.bmwusa.com/content/dam/bmwusa/i4/MY22/BMW-MY22-i4-Gallery-04.jpg"],
      },
      {
        make: "BMW",
        model: "iX xDrive50",
        year: 2022,
        price: 84000,
        mileage: 3000,
        fuelType: "Electric",
        transmission: "Automatic",
        drivetrain: "AWD",
        exteriorColor: "Sophisto Grey",
        interiorColor: "Stone Grey",
        description: "2022 BMW iX xDrive50. BMWs flagship electric SUV offers cutting-edge technology and sustainable luxury. Features include dual electric motors producing 516 horsepower, over 300 miles of range, and fast charging capability.",
        sellerName: "Import Motors",
        sellerPhone: "+82-1234-5678",
        sellerEmail: "import@automarket.com",
        sellerLocation: "Seoul, South Korea",
        images: ["https://www.bmwusa.com/content/dam/bmwusa/iX/MY22/BMW-MY22-iX-Gallery-09.jpg"],
      }
    ];

    console.log(`Ready to import ${sampleCars.length} sample BMW cars`);

    // Import cars
    const results = {
      total: sampleCars.length,
      imported: 0,
      failed: 0
    };

    for (const car of sampleCars) {
      try {
        await createCar(car, user.token);
        console.log(`Successfully imported: ${car.year} ${car.make} ${car.model}`);
        results.imported++;
      } catch (error) {
        console.error(`Import failed for car: ${car.year} ${car.make} ${car.model}`, error.message);
        results.failed++;
      }

      // Sleep to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Import complete!');
    console.log(`Total listings: ${results.total}`);
    console.log(`Successfully imported: ${results.imported}`);
    console.log(`Failed imports: ${results.failed}`);

  } catch (error) {
    console.error('Import failed:', error.message);
  }
}

// Run the import
importSampleCars()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err.message));