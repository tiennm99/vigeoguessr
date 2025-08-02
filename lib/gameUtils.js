export const boundingBoxVN = {
  'HN': [105.77, 20.96, 105.88, 21.05, 0.003],
  'TPHCM': [106.62, 10.71, 106.75, 10.83, 0.005],
  'HP': [106.65, 20.8, 106.75, 20.9, 0.05],
  'ND': [106, 20.35, 106.25, 20.5, 0.005],
  'DN': [108.17, 16, 108.25, 16.1, 0.005],
  'DL': [108.38, 11.89, 108.50, 12.00, 0.005],
  'DHLA': [106.35, 10.85, 106.45, 10.95, 0.005]
};

export const locationNames = {
  'HN': 'HA NOI',
  'TPHCM': 'TP. HO CHI MINH',
  'HP': 'HAI PHONG',
  'ND': 'NAM DINH',
  'DN': 'DA NANG',
  'DL': 'DALAT',
  'DHLA': 'DUC HOA'
};

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