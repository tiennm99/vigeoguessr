/**
 * Calculates the distance between two geographic coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters, rounded to 1 decimal place
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + 
             Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) {
    dist = 1;
  }
  
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1609.34; // Convert to meters
  
  return parseFloat(dist.toFixed(1));
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