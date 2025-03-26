/**
 * This file contains utility functions for unit conversion and formatting.
 * We're using the European unit system (kilometers and euros).
 */

/**
 * Convert miles to kilometers
 * @param miles Distance in miles
 * @returns Distance in kilometers
 */
export function milesToKm(miles: number): number {
  return miles * 1.60934;
}

/**
 * Convert kilometers to miles
 * @param km Distance in kilometers
 * @returns Distance in miles
 */
export function kmToMiles(km: number): number {
  return km / 1.60934;
}

/**
 * Convert USD to EUR
 * @param usd Amount in USD
 * @returns Amount in EUR
 */
export function usdToEur(usd: number): number {
  // Using a fixed conversion rate for simplicity
  // In a real application, this would use current exchange rates
  return usd * 0.85;
}

/**
 * Convert EUR to USD
 * @param eur Amount in EUR
 * @returns Amount in USD
 */
export function eurToUsd(eur: number): number {
  // Using a fixed conversion rate for simplicity
  return eur / 0.85;
}

/**
 * Format a price in EUR with Euro symbol and thousand separators
 * @param price Price value to format
 * @returns Formatted price string with Euro symbol
 */
export function formatEurPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(price).replace(/\./g, ',');
}

/**
 * Format distance in kilometers with unit
 * @param km Distance in kilometers
 * @returns Formatted distance string with km unit
 */
export function formatKmDistance(km: number): string {
  return `${km.toLocaleString('de-DE')} km`;
}

/**
 * Format year for display
 * @param year The year to format
 * @returns Formatted year string
 */
export function formatYear(year: number): string {
  return year.toString();
}

/**
 * Format fuel efficiency for display (liters per 100 km)
 * @param mpg Fuel efficiency in miles per gallon
 * @returns Formatted fuel efficiency in L/100km
 */
export function formatFuelEfficiency(mpg: number): string {
  // Convert MPG to L/100km
  const litersPer100Km = 235.214 / mpg;
  return `${litersPer100Km.toFixed(1)} L/100km`;
}

/**
 * Determine if a car is electric based on fuel type
 * @param fuelType The fuel type string
 * @returns Boolean indicating if the car is electric
 */
export function isElectric(fuelType: string): boolean {
  return fuelType.toLowerCase() === 'electric';
}

/**
 * Format battery range for display (for electric vehicles)
 * @param range Range in miles
 * @returns Formatted range in kilometers
 */
export function formatBatteryRange(range: number): string {
  const rangeKm = milesToKm(range);
  return `${Math.round(rangeKm)} km`;
}