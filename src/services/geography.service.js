/**
 * Geography service for coordinate validation and distance calculations
 */

/**
 * Earth's radius in meters (WGS84)
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * OpenStreetMap Nominatim API configuration
 */
const OSM_CONFIG = {
  BASE_URL: 'https://nominatim.openstreetmap.org',
  USER_AGENT: 'VIGEOGUESSR/1.0 (https://vigeoguessr.com)',
  TIMEOUT: 5000
};

/**
 * Validates if coordinates are within valid ranges
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {boolean} True if coordinates are valid
 */
export function isValidCoordinate(latitude, longitude) {
  return typeof latitude === 'number' && 
         typeof longitude === 'number' &&
         latitude >= -90 && latitude <= 90 &&
         longitude >= -180 && longitude <= 180 &&
         !isNaN(latitude) && !isNaN(longitude);
}

/**
 * Calculates straight-line distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point  
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters, rounded to 1 decimal place
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_METERS * c;
  return parseFloat(distance.toFixed(1));
}

/**
 * Validates coordinates using OpenStreetMap Nominatim API
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Promise<boolean>} True if coordinates are valid and on land
 */
export async function validateCoordinateWithOSM(latitude, longitude) {
  try {
    const url = `${OSM_CONFIG.BASE_URL}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=0`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OSM_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': OSM_CONFIG.USER_AGENT
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data && data.display_name && !data.error;
    
  } catch (error) {
    console.warn('OSM validation failed:', error);
    return true; // Assume valid if validation fails
  }
}

/**
 * Calculates distance between two geographic coordinates with validation
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point  
 * @param {number} lon2 - Longitude of second point
 * @returns {Promise<number>} Distance in meters, rounded to 1 decimal place
 */
export async function calculateDistance(lat1, lon1, lat2, lon2) {
  // Validate input coordinates
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    throw new Error('Invalid coordinates provided');
  }
  
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  try {
    // Validate coordinates with OpenStreetMap (parallel requests)
    const [valid1, valid2] = await Promise.all([
      validateCoordinateWithOSM(lat1, lon1),
      validateCoordinateWithOSM(lat2, lon2)
    ]);
    
    if (!valid1 || !valid2) {
      console.warn('One or both coordinates may be invalid (water/empty area)');
    }
    
  } catch (error) {
    console.warn('OSM validation failed, proceeding with calculation:', error);
  }
  
  // Calculate straight-line distance using Haversine formula
  return calculateHaversineDistance(lat1, lon1, lat2, lon2);
}