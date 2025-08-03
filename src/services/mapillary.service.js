/**
 * Mapillary service for street view image operations
 */

/**
 * Mapillary API configuration
 */
const MAPILLARY_CONFIG = {
  BASE_URL: 'https://graph.mapillary.com',
  DEFAULT_ACCESS_TOKEN: 'MLY|24113623194974280|5bf83fa202912f1cc3210b2cf968fb65',
  IMAGE_SIZE: 2048,
  TIMEOUT: 10000
};

/**
 * Gets Mapillary access token from environment or default
 * @returns {string} Access token
 */
function getAccessToken() {
  return process.env.MAPILLARY_ACCESS_TOKEN || 
         process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN || 
         MAPILLARY_CONFIG.DEFAULT_ACCESS_TOKEN;
}

/**
 * Fetches random Mapillary image within specified bounds
 * @param {Object} bounds - Geographic bounds {north, south, east, west}
 * @param {number} [limit=50] - Maximum number of images to fetch
 * @returns {Promise<Object|null>} Random image data or null if none found
 */
export async function getRandomMapillaryImage(bounds, limit = 50) {
  try {
    const accessToken = getAccessToken();
    const { north, south, east, west } = bounds;
    
    // Construct Mapillary Graph API URL for images
    const url = new URL(`${MAPILLARY_CONFIG.BASE_URL}/images`);
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('bbox', `${west},${south},${east},${north}`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('fields', 'id,thumb_2048_url,geometry,computed_geometry');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAPILLARY_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Mapillary API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.warn('No Mapillary images found in bounds:', bounds);
      return null;
    }
    
    // Select random image
    const randomImage = data.data[Math.floor(Math.random() * data.data.length)];
    
    // Extract coordinates - prefer computed_geometry, fallback to geometry
    const geometry = randomImage.computed_geometry || randomImage.geometry;
    const [lng, lat] = geometry.coordinates;
    
    return {
      id: randomImage.id,
      url: randomImage.thumb_2048_url,
      lat: lat,
      lng: lng,
      coordinates: [lat, lng]
    };
    
  } catch (error) {
    console.error('Error fetching Mapillary image:', error);
    throw new Error(`Failed to fetch street view image: ${error.message}`);
  }
}

/**
 * Validates Mapillary image exists and is accessible
 * @param {string} imageId - Mapillary image ID
 * @returns {Promise<boolean>} True if image is valid and accessible
 */
export async function validateMapillaryImage(imageId) {
  try {
    const accessToken = getAccessToken();
    const url = `${MAPILLARY_CONFIG.BASE_URL}/${imageId}?access_token=${accessToken}&fields=id`;
    
    const response = await fetch(url);
    return response.ok;
    
  } catch (error) {
    console.warn('Mapillary image validation failed:', error);
    return false;
  }
}