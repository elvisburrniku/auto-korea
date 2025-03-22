/**
 * Test script to debug Encar.com fetching
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Encar.com URL with BMW 3 Series
const searchUrl = 'http://www.encar.com/fc/fc_carsearchlist.do?carType=for&Page=1&searchType=model&MakeName=BMW&ModelName=3%EC%8B%9C%EB%A6%AC%EC%A6%88&FlagHot=0&Order=Date';

// Alternative URL format
const alternativeUrl = 'http://www.encar.com/search/car/list/premium?sort=ModifiedDate&count=20&q=(And.Hidden.N._.Manufacturer.BMW._.ModelGroup.3%EC%8B%9C%EB%A6%AC%EC%A6%88.)';

// Direct listing URL
const directListingUrl = 'http://www.encar.com/dc/dc_carsearchlist.do?carType=kor#!%7B%22action%22%3A%22(And.Hidden.N._.(C.CarType.Y._.(C.Manufacturer.BMW._.ModelGroup.3%EC%8B%9C%EB%A6%AC%EC%A6%88.)))%22%2C%22toggle%22%3A%7B%7D%2C%22layer%22%3A%22%22%2C%22sort%22%3A%22ModifiedDate%22%2C%22page%22%3A1%2C%22limit%22%3A20%2C%22searchKey%22%3A%22----%22%7D';

// API URL that might return JSON directly
const apiUrl = 'https://api.encar.com/search/car/list/premium?count=20&q=(And.Hidden.N._.Manufacturer.BMW._.ModelGroup.3%EC%8B%9C%EB%A6%AC%EC%A6%88.)';

async function testFetch() {
  console.log('Testing Encar.com fetching...');
  
  try {
    // Attempt with the original URL
    console.log('Trying simple URL...');
    const response1 = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Response status:', response1.status);
    console.log('Response size:', response1.data.length);
    fs.writeFileSync(path.join(__dirname, 'encar-simple.html'), response1.data);
    console.log('Saved response to encar-simple.html');
    
    // Check if content has car listings using various selectors
    checkForSelectors(response1.data, 'simple URL response');
    
    // Try with alternative URL format
    console.log('\nTrying alternative URL...');
    const response2 = await axios.get(alternativeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8'
      }
    });
    
    console.log('Response status:', response2.status);
    console.log('Response size:', response2.data.length);
    fs.writeFileSync(path.join(__dirname, 'encar-alternative.html'), response2.data);
    console.log('Saved response to encar-alternative.html');
    
    // Check for selectors
    checkForSelectors(response2.data, 'alternative URL response');
    
    // Try with direct listing URL
    console.log('\nTrying direct listing URL...');
    const response3 = await axios.get(directListingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8'
      }
    });
    
    console.log('Response status:', response3.status);
    console.log('Response size:', response3.data.length);
    fs.writeFileSync(path.join(__dirname, 'encar-direct.html'), response3.data);
    console.log('Saved response to encar-direct.html');
    
    // Check for selectors
    checkForSelectors(response3.data, 'direct listing URL response');
    
    // Try API URL for JSON
    try {
      console.log('\nTrying API URL for JSON data...');
      const response4 = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.encar.com',
          'Referer': 'https://www.encar.com/'
        }
      });
      
      console.log('API Response status:', response4.status);
      if (typeof response4.data === 'object') {
        console.log('Received JSON data!');
        console.log(`JSON contains ${response4.data.Count || 0} items`);
        fs.writeFileSync(path.join(__dirname, 'encar-api.json'), JSON.stringify(response4.data, null, 2));
        console.log('Saved JSON data to encar-api.json');
      } else {
        console.log('API did not return JSON data');
        fs.writeFileSync(path.join(__dirname, 'encar-api-response.txt'), response4.data);
        console.log('Saved API response to encar-api-response.txt');
      }
    } catch (apiError) {
      console.error('Error with API URL:', apiError.message);
    }
    
  } catch (error) {
    console.error('Error fetching data:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response headers:', JSON.stringify(error.response.headers, null, 2));
    }
  }
}

function checkForSelectors(html, source) {
  // Most common selectors for car listings
  const selectors = [
    'car_info_top', 'car_list', 'carList', 'list_item', 'car-item', 
    'listItem', 'search-item', 'lst_pr', 'lst-item', 'list-in', 'item-image',
    'section-list', 'vehicle-item', 'car_box', 'carBox', 'car-box'
  ];
  
  console.log(`\nChecking selectors in ${source}...`);
  
  for (const selector of selectors) {
    if (html.includes(selector)) {
      console.log(`Found selector: ${selector}`);
      const matches = html.match(new RegExp(selector, 'g'));
      console.log(`  ${matches ? matches.length : 0} instances found`);
    }
  }
  
  // Check for JSON data embedded in the HTML
  const jsonPatterns = [
    /var\s+json\s*=\s*(\{.*?\});/s,
    /window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s,
    /window\.__PRELOADED_STATE__\s*=\s*(\{.*?\});/s,
    /dataLayer\s*=\s*(\[.*?\]);/s,
    /<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s
  ];
  
  for (const pattern of jsonPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      console.log('Found potential JSON data with pattern:', pattern.toString().slice(0, 30) + '...');
      try {
        const jsonData = JSON.parse(match[1]);
        console.log('Successfully parsed JSON data');
        
        // Look for car data in the parsed JSON
        const jsonStr = JSON.stringify(jsonData);
        if (jsonStr.includes('BMW') || jsonStr.includes('3시리즈')) {
          console.log('JSON contains relevant car data!');
          fs.writeFileSync(path.join(__dirname, `encar-embedded-json-${Date.now()}.json`), JSON.stringify(jsonData, null, 2));
          console.log('Saved JSON data to file');
        }
      } catch (e) {
        console.log('Failed to parse JSON:', e.message);
      }
    }
  }
}

testFetch()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err.message));