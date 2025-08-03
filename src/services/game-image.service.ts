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
} as const;

export interface GameImageData {
  id: string;
  url: string;
  lat: number;
  lng: number;
  coordinates: [number, number];
  isPano?: boolean;
}

/**
 * Fetches a random panoramic image from server-side Mapillary API
 */
export async function fetchRandomGameImage(
  locationCode: string, 
  maxRetries: number = IMAGE_CONFIG.MAX_RETRIES
): Promise<GameImageData | null> {
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
 */
function isValidImageData(imageData: unknown): imageData is GameImageData {
  if (typeof imageData !== 'object' || imageData === null) {
    return false;
  }
  
  const data = imageData as Record<string, unknown>;
  
  return typeof data.id === 'string' &&
         typeof data.url === 'string' &&
         typeof data.lat === 'number' &&
         typeof data.lng === 'number' &&
         Array.isArray(data.coordinates) &&
         data.coordinates.length === 2;
}

/**
 * Creates a delay for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}