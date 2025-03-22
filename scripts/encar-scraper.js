import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AutoMarket API endpoint
const AUTO_MARKET_API = 'http://0.0.0.0:5000';
// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Encar.com base URL
const ENCAR_BASE_URL = 'http://www.encar.com';

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

async function fetchEncarSearch(searchUrl) {
  try {
    console.log(`Fetching listings from: ${searchUrl}`);
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch Encar listings:', error.message);
    throw new Error('Failed to fetch car listings');
  }
}

function extractCarListings(html) {
  const $ = cheerio.load(html);
  const listings = [];

  // Target the car listing items - trying multiple possible selectors
  const carElements = $('.car_list .car_info_top, .car_listings .car_item, .search-results .car-item');
  console.log('Found elements:', carElements.length);
  
  carElements.each((index, element) => {
    try {
      const infoElement = $(element);
      console.log('Processing element:', infoElement.html());
      const titleElement = infoElement.find('a[class*="tit"], .title, .car-title');
      const title = titleElement.text().trim();
      const detailUrl = titleElement.attr('href');

      // Extract make and model from title
      const titleParts = title.split(' ');
      let make = titleParts[0] || 'BMW';  // Default to BMW if extraction fails
      const model = titleParts.slice(1, 3).join(' ');

      // Find the image
      const imageElement = $(element).parent().parent().find('.img img');
      const imageUrl = imageElement.attr('src');

      // Extract price
      const priceText = $(element).find('.val').text().trim().replace(/[^0-9]/g, '');
      const price = parseInt(priceText) || 30000; // Default price if extraction fails

      // Extract year
      const yearText = $(element).find('.detail .yr').text().trim();
      const yearMatch = yearText.match(/\d{4}/);
      const year = yearMatch ? parseInt(yearMatch[0]) : 2020; // Default year

      // Extract mileage
      const mileageText = $(element).find('.detail .km').text().trim().replace(/[^0-9]/g, '');
      const mileage = parseInt(mileageText) || 50000; // Default mileage

      // Extract fuel type
      const fuelTypeText = $(element).find('.detail .fu').text().trim();
      let fuelType = 'Gasoline';
      if (fuelTypeText.includes('디젤')) {
        fuelType = 'Diesel';
      } else if (fuelTypeText.includes('하이브리드')) {
        fuelType = 'Hybrid';
      } else if (fuelTypeText.includes('전기')) {
        fuelType = 'Electric';
      }

      listings.push({
        make,
        model,
        year,
        price: Math.round(price / 1500), // Convert KRW to EUR (approximate)
        mileage: Math.round(mileage * 1.60934), // Convert miles to km
        fuelType,
        transmission: 'Automatic', // Most BMW cars are automatic
        drivetrain: 'RWD', // Default drivetrain
        exteriorColor: 'Silver', // Default color
        interiorColor: 'Black', // Default color
        description: `Imported ${year} ${make} ${model}. This vehicle was listed on Encar.com and imported to our system.`,
        sellerName: 'Auto Import',
        sellerPhone: '+82-1234-5678',
        sellerEmail: 'import@automarket.com',
        sellerLocation: 'Seoul, South Korea',
        images: [imageUrl],
        detailUrl: detailUrl ? (detailUrl.startsWith('http') ? detailUrl : `${ENCAR_BASE_URL}${detailUrl}`) : null
      });

    } catch (err) {
      console.error(`Error processing listing ${index}:`, err.message);
    }
  });

  return listings;
}

async function downloadImage(imageUrl, index) {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const timestamp = Date.now();
    const filename = `${timestamp}-encar-import-${index}.jpg`;
    const filePath = path.join(uploadDir, filename);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(`/uploads/${filename}`));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download image: ${imageUrl}`, error.message);
    return null;
  }
}

async function createCar(carData, authToken) {
  try {
    // Download image if available
    if (carData.images && carData.images.length > 0 && carData.images[0]) {
      const localImagePath = await downloadImage(carData.images[0], Date.now());
      if (localImagePath) {
        carData.images = [localImagePath];
      } else {
        carData.images = [];
      }
    }

    // Set featured for some cars randomly
    carData.isFeatured = Math.random() > 0.8;

    const response = await axios.post(`${AUTO_MARKET_API}/api/cars`, carData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
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

async function scrapeAndImport(searchUrl) {
  try {
    // Login to get auth token
    const user = await login();
    // Check if user is authenticated and is admin
    if (!user) {
      console.error('Login failed - server response:', user);
      return;
    }

    if (!user.isAdmin) {
      console.error('User is not an admin. Please login with an admin account.');
      return;
    }

    // Fetch listings from Encar
    const html = await fetchEncarSearch(searchUrl);

    // Extract car data
    const carListings = extractCarListings(html);
    console.log(`Found ${carListings.length} car listings`);

    // Import cars
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
        console.error(`Import failed for car: ${car.year} ${car.make} ${car.model}`, error.message);
        results.failed++;
      }

      // Sleep to avoid overwhelming the server
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

// Run the script with a search URL
const searchUrl = process.argv[2] || 'http://www.encar.com/fc/fc_carsearchlist.do?carType=for#!%7B%22action%22%3A%22(And.Hidden.N._.(C.CarType.N._.(C.Manufacturer.BMW._.ModelGroup.3%EC%8B%9C%EB%A6%AC%EC%A6%88.))_.Year.range(201500..).)%22%2C%22toggle%22%3A%7B%7D%2C%22layer%22%3A%22%22%2C%22sort%22%3A%22ModifiedDate%22%2C%22page%22%3A1%2C%22limit%22%3A20%2C%22searchKey%22%3A%22%22%2C%22loginCheck%22%3Afalse%7D';

scrapeAndImport(searchUrl)
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err.message));