import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTO_MARKET_API = 'http://localhost:5000';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

async function login() {
  try {
    const response = await axios.post(`${AUTO_MARKET_API}/api/auth/login`, {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
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

async function fetchEncarAPI(searchUrl) {
  try {
    console.log(`Fetching listings from API: ${searchUrl}`);
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch Encar API:', error.message);
    throw new Error('Failed to fetch car listings');
  }
}

function processAPIData(apiData) {
  if (!apiData || !apiData.SearchResults) {
    throw new Error('Invalid API response format');
  }

  return apiData.SearchResults.map(car => ({
    make: car.Manufacturer || 'BMW',
    model: car.Model || '5 Series',
    year: Math.floor(car.Year) || 2020,
    price: Math.round(car.Price * 800) || 30000, // Convert from Korean 10000s to EUR
    mileage: car.Mileage || 50000,
    fuelType: car.FuelType === '디젤' ? 'Diesel' : 'Gasoline',
    transmission: 'Automatic',
    drivetrain: 'RWD',
    exteriorColor: 'Silver',
    interiorColor: 'Black',
    description: `${car.Year} ${car.Manufacturer} ${car.Model}. Imported from Encar.com.`,
    sellerName: 'Auto Import',
    sellerPhone: '+82-1234-5678',
    sellerEmail: 'import@automarket.com',
    sellerLocation: car.OfficeCityState || 'South Korea',
    images: car.Photos ? car.Photos.map(photo => `https://ci.encar.com${photo.location}`) : []
  }));
}

async function createCar(carData, authToken) {
  try {
    const response = await axios.post(`${AUTO_MARKET_API}/api/cars`, carData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to create car:', error.message);
    throw new Error(`Failed to create car: ${carData.make} ${carData.model}`);
  }
}

async function scrapeAndImport(searchUrl) {
  try {
    const user = await login();
    console.log('Logged in successfully');

    const apiData = await fetchEncarAPI(searchUrl);
    console.log(`Found ${apiData.Count || 0} listings`);

    const carListings = processAPIData(apiData);
    console.log(`Processed ${carListings.length} car listings`);

    const results = {
      total: carListings.length,
      imported: 0,
      failed: 0
    };

    for (const car of carListings) {
      try {
        await createCar(car, user.token);
        console.log(`Successfully imported: ${car.year} ${car.make} ${car.model}`);
        results.imported++;
      } catch (error) {
        console.error(`Import failed for car:`, error.message);
        results.failed++;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Import complete!');
    console.log(`Total listings: ${results.total}`);
    console.log(`Successfully imported: ${results.imported}`);
    console.log(`Failed imports: ${results.failed}`);

  } catch (error) {
    console.error('Scraping failed:', error.message);
  }
}

// Get the URL from command line or use default
const searchUrl = process.argv[2] || 'https://api.encar.com/search/car/list/premium?count=true&q=(And.Hidden.N._.(C.CarType.N._.(C.Manufacturer.BMW._.ModelGroup.5%EC%8B%9C%EB%A6%AC%EC%A6%88.)))';

scrapeAndImport(searchUrl)
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err.message));