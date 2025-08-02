/**
 * Fetches a random panoramic image from server-side Mapillary API
 * @param {string} choiceLocation - The location code (e.g., 'HN', 'TPHCM')
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise<Object|null>} Image data with coordinates, URL, and ID for MapillaryJS, or null if failed
 */
export async function getRandomMapillaryImage(choiceLocation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching panoramic image (attempt ${attempt}/${maxRetries})...`);
      
      const response = await fetch(`/api/mapillary?location=${choiceLocation}`);
      
      if (!response.ok) {
        if (response.status === 404 && attempt < maxRetries) {
          console.log("No images found, retrying...");
          continue;
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const imageData = await response.json();
      console.log("Image fetched successfully from server");
      return imageData;
      
    } catch (error) {
      console.error(`Error fetching image (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        console.error("Max retries reached, returning null");
        return null;
      }
    }
  }
  
  return null;
}