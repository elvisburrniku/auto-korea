// Unit conversion utilities

// Constant conversion rates
const MILES_TO_KM_RATIO = 1;
const USD_TO_EUR_RATIO = 0.93; // This is an approximate rate, may need adjustment

/**
 * Convert miles to kilometers
 * @param miles Distance in miles
 * @returns Distance in kilometers
 */
export function milesToKm(miles: number): number {
  return miles * MILES_TO_KM_RATIO;
}

/**
 * Convert kilometers to miles
 * @param km Distance in kilometers
 * @returns Distance in miles
 */
export function kmToMiles(km: number): number {
  return km / MILES_TO_KM_RATIO;
}

/**
 * Convert USD to EUR
 * @param usd Amount in USD
 * @returns Amount in EUR
 */
export function usdToEur(usd: number): number {
  return usd * USD_TO_EUR_RATIO;
}

/**
 * Convert EUR to USD
 * @param eur Amount in EUR
 * @returns Amount in USD
 */
export function eurToUsd(eur: number): number {
  return eur / USD_TO_EUR_RATIO;
}

/**
 * Format a price in EUR with Euro symbol and thousand separators
 * @param price Price value to format
 * @returns Formatted price string with Euro symbol
 */
export function formatEurPrice(price: number): string {
  const eurPrice = price;
  return `€${eurPrice.toLocaleString('de-DE', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

/**
 * Format distance in kilometers with unit
 * @param miles Distance in miles
 * @returns Formatted distance string with km unit
 */
export function formatKmDistance(miles: number): string {
  const km = milesToKm(miles);
  return `${Math.round(km).toLocaleString('de-DE')} km`;
}