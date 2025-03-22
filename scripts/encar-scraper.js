import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AutoMarket API endpoint
const AUTO_MARKET_API = 'http://localhost:5000';
// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Encar.com base URL
const ENCAR_BASE_URL = 'http://www.encar.com';

// Simpler URL format for BMW 3 Series
const SIMPLE_URL = 'http://www.encar.com/fc/fc_carsearchlist.do?carType=for&Page=1&searchType=model&MakeName=BMW&ModelName=3%EC%8B%9C%EB%A6%AC%EC%A6%88&FlagHot=0&Order=Date';

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
  console.log("Parsing HTML...");
  
  // Save HTML for debugging
  const debugDir = path.join(__dirname, 'debug');
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }
  fs.writeFileSync(path.join(debugDir, 'encar-response.html'), html);
  console.log("Saved HTML response for debugging");
  
  // Try different selectors that might match car listings
  const selectors = [
    // Original selector
    '.everytime > li',
    // Try the search results container
    '.list_cars .thum',
    // Car list items
    '.car_list > li',
    // Product card elements
    '.product_card',
    // Additional selectors for various layouts
    '.listCont > ul > li',
    '.carList li',
    '.car_item',
    '.carinfoin',
    '.modelInSection',
    // Simple list items if they contain car info
    '.list_area li'
  ];
  
  // Try each selector
  for (const selector of selectors) {
    console.log(`Trying selector: ${selector}`);
    const elements = $(selector);
    console.log(`Found ${elements.length} elements with selector ${selector}`);
    
    if (elements.length > 0) {
      console.log(`Using selector: ${selector} with ${elements.length} elements`);
      
      elements.each((index, element) => {
        try {
          const el = $(element);
          
          // Different ways to extract title
          let title = '';
          let titleElement = el.find('.model').first();
          if (titleElement.length === 0) titleElement = el.find('.inf a').first();
          if (titleElement.length === 0) titleElement = el.find('h3').first();
          if (titleElement.length === 0) titleElement = el.find('.tit').first();
          if (titleElement.length === 0) titleElement = el.find('strong').first();
          
          if (titleElement.length > 0) {
            title = titleElement.text().trim();
          }
          
          // Get detail URL
          let detailUrl = '';
          let detailElement = el.find('a').first();
          if (detailElement.length > 0) {
            detailUrl = detailElement.attr('href') || '';
          }
          
          // For BMW 3 Series specific search
          const make = 'BMW';
          const model = title ? title.replace(/BMW|비엠더블유|BMW 뉴/gi, '').trim() : '3 Series';
          
          // Extract image URL
          let imageUrl = '';
          let imageElement = el.find('img').first();
          if (imageElement.length > 0) {
            imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || '';
          }
          
          // Extract price
          let price = 30000; // Default price in KRW
          let priceElement = el.find('.price').first();
          if (priceElement.length === 0) priceElement = el.find('.val').first();
          if (priceElement.length === 0) priceElement = el.find('.cost').first();
          if (priceElement.length > 0) {
            const priceText = priceElement.text().trim().replace(/[^0-9]/g, '');
            if (priceText) {
              price = parseInt(priceText) || price;
            }
          }
          
          // Extract year
          let year = 2020; // Default year
          let infoText = el.text(); // Get all text in the element
          
          const yearMatch = infoText.match(/\d{4}년|\d{4}\s*식|\d{4}\s*model/i);
          if (yearMatch) {
            const yearStr = yearMatch[0].match(/\d{4}/)[0];
            year = parseInt(yearStr) || year;
          }
          
          // Extract mileage
          let mileage = 50000; // Default mileage
          const mileageMatch = infoText.match(/(\d{1,3}(,\d{3})*)\s*km/);
          if (mileageMatch) {
            const mileageStr = mileageMatch[1].replace(/,/g, '');
            mileage = parseInt(mileageStr) || mileage;
          }
          
          // Extract fuel type
          let fuelType = 'Gasoline'; // Default fuel type
          if (infoText.includes('디젤')) {
            fuelType = 'Diesel';
          } else if (infoText.includes('하이브리드')) {
            fuelType = 'Hybrid';
          } else if (infoText.includes('전기')) {
            fuelType = 'Electric';
          }
          
          console.log(`Found car: ${make} ${model} (${year})`);
          
          listings.push({
            make,
            model,
            year,
            price: Math.round(price / 1500), // Convert KRW to EUR (approximate)
            mileage,
            fuelType,
            transmission: 'Automatic', // Most BMW cars are automatic
            drivetrain: 'RWD', // Default drivetrain
            exteriorColor: 'Silver', // Default color
            interiorColor: 'Black', // Default color
            description: `${year} ${make} ${model}. This vehicle was imported from Encar.com, a popular Korean car marketplace.`,
            sellerName: 'Auto Import',
            sellerPhone: '+82-1234-5678',
            sellerEmail: 'import@automarket.com',
            sellerLocation: 'Seoul, South Korea',
            images: imageUrl ? [imageUrl] : [],
            detailUrl: detailUrl ? (detailUrl.startsWith('http') ? detailUrl : `${ENCAR_BASE_URL}${detailUrl}`) : null
          });
        } catch (err) {
          console.error(`Error processing element ${index} with selector ${selector}:`, err.message);
        }
      });
      
      // If we found any cars, stop trying other selectors
      if (listings.length > 0) {
        console.log(`Successfully extracted ${listings.length} cars using selector ${selector}`);
        break;
      }
    }
  }
  
  // If we couldn't find any cars with any selector, throw an error
  if (listings.length === 0) {
    console.error("Could not extract any cars from the Encar.com webpage.");
    throw new Error("Failed to extract car listings from the provided URL. The website structure may have changed or the URL is invalid.");
  }
  
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
const searchUrl = process.argv[2] || SIMPLE_URL;

scrapeAndImport(searchUrl)
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err.message));