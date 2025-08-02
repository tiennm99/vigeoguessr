import { boundingBoxVN } from '@/constants/locations';

/**
 * Fetches a random panoramic image from Mapillary API within the specified Vietnamese city bounds
 * @param {string} choiceLocation - The location code (e.g., 'HN', 'TPHCM')
 * @returns {Promise<Object|null>} Image data with coordinates, URL, and ID for MapillaryJS, or null if failed
 */
export async function getRandomMapillaryImage(choiceLocation) {
  const [minLong, minLat, maxLong, maxLat, delta] = boundingBoxVN[choiceLocation];
  
  const randomLat = Math.random() * (maxLat - minLat) + minLat;
  const randomLng = Math.random() * (maxLong - minLong) + minLong;
  const bbox = [
    (randomLng - delta).toFixed(4),
    (randomLat - delta).toFixed(4),
    (randomLng + delta).toFixed(4),
    (randomLat + delta).toFixed(4)
  ].join(',');
  
  const apiUrl = `https://graph.mapillary.com/images?access_token=MLY|24113623194974280|5bf83fa202912f1cc3210b2cf968fb65&fields=id,thumb_original_url,geometry,is_pano&limit=3&bbox=${bbox}&is_pano=true`;
  
  try {
    console.log("Fetching panoramic image...");
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const panoImages = data.data.filter((image) => image.is_pano);
      const selectedImage = panoImages.length > 0 
        ? panoImages[Math.floor(Math.random() * panoImages.length)] 
        : data.data[0];
      
      console.log("Image fetched successfully");
      return {
        lat: selectedImage.geometry.coordinates[1],
        lng: selectedImage.geometry.coordinates[0],
        url: selectedImage.thumb_original_url,
        id: selectedImage.id,
        isPano: selectedImage.is_pano || false
      };
    } else {
      console.log("No images found, retrying...");
      return getRandomMapillaryImage(choiceLocation);
    }
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}