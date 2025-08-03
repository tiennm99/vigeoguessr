/**
 * Calculates straight-line distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters, rounded to 1 decimal place
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return parseFloat(distance.toFixed(1));
}

/**
 * Validates coordinates using OpenStreetMap Nominatim API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<boolean>} True if coordinates are valid and on land
 */
async function validateCoordinatesWithOSM(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=0`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VIGEOGUESSR/1.0 (https://vigeoguessr.com)'
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    
    // Check if we got a valid response (not water or empty)
    return data && data.display_name && !data.error;
    
  } catch (error) {
    console.warn('OSM validation failed:', error);
    return true; // Assume valid if validation fails
  }
}

/**
 * Calculates straight-line distance between two geographic coordinates
 * Uses OpenStreetMap for coordinate validation and Haversine formula for distance
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {Promise<number>} Distance in meters, rounded to 1 decimal place
 */
export async function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  // Validate input coordinates
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    throw new Error('Invalid coordinates provided');
  }
  
  try {
    // Validate coordinates with OpenStreetMap (parallel requests)
    const [valid1, valid2] = await Promise.all([
      validateCoordinatesWithOSM(lat1, lon1),
      validateCoordinatesWithOSM(lat2, lon2)
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

/**
 * Validates if coordinates are within valid ranges
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if coordinates are valid
 */
function isValidCoordinate(lat, lon) {
  return typeof lat === 'number' && typeof lon === 'number' &&
         lat >= -90 && lat <= 90 &&
         lon >= -180 && lon <= 180 &&
         !isNaN(lat) && !isNaN(lon);
}

/**
 * Calculates points based on distance (in meters)
 * @param {number} distanceMeters - Distance in meters
 * @returns {number} Points (1-5 scale)
 */
export function calculatePoints(distanceMeters) {
  const distanceKm = distanceMeters / 1000;
  
  if (distanceKm > 1) return 0;
  if (distanceKm > 0.5) return 1;  
  if (distanceKm > 0.2) return 2;
  if (distanceKm > 0.1) return 3;
  if (distanceKm > 0.05) return 4;
  return 5;
}