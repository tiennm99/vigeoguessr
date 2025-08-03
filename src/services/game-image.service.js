/**
 * Game image service for fetching panoramic images
 */

/**
 * Image fetching configuration
 */
const IMAGE_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 10000
};

/**
 * Fetches a random panoramic image from server-side Mapillary API
 * @param {string} locationCode - The location code (e.g., 'HN', 'TPHCM')
 * @param {number} [maxRetries=3] - Maximum number of retry attempts
 * @returns {Promise<Object|null>} Image data with coordinates, URL, and ID, or null if failed
 */
export async function fetchRandomGameImage(locationCode, maxRetries = IMAGE_CONFIG.MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching panoramic image for ${locationCode} (attempt ${attempt}/${maxRetries})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), IMAGE_CONFIG.TIMEOUT);
      
      const response = await fetch(`/api/mapillary?location=${locationCode}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 404 && attempt < maxRetries) {
          console.log("No images found, retrying...");
          await delay(IMAGE_CONFIG.RETRY_DELAY);
          continue;
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const imageData = await response.json();
      console.log("Image fetched successfully from server");
      
      // Validate image data structure
      if (!isValidImageData(imageData)) {
        throw new Error('Invalid image data received from server');
      }
      
      return imageData;
      
    } catch (error) {
      console.error(`Error fetching image (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        console.error("Max retries reached, returning null");
        return null;
      }
      
      // Wait before retrying
      if (attempt < maxRetries) {
        await delay(IMAGE_CONFIG.RETRY_DELAY * attempt); // Exponential backoff
      }
    }
  }
  
  return null;
}

/**
 * Validates image data structure
 * @param {Object} imageData - Image data to validate
 * @returns {boolean} True if image data is valid
 */
function isValidImageData(imageData) {
  return imageData &&
         typeof imageData.id === 'string' &&
         typeof imageData.url === 'string' &&
         typeof imageData.lat === 'number' &&
         typeof imageData.lng === 'number' &&
         Array.isArray(imageData.coordinates) &&
         imageData.coordinates.length === 2;
}

/**
 * Creates a delay for retry logic
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}