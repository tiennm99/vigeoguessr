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
} as const;

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface Geometry {
  coordinates: [number, number];
}

interface MapillaryImage {
  id: string;
  thumb_2048_url: string;
  geometry: Geometry;
  computed_geometry?: Geometry;
}

interface MapillaryResponse {
  data: MapillaryImage[];
}

export interface MapillaryImageData {
  id: string;
  url: string;
  lat: number;
  lng: number;
  coordinates: [number, number];
}

/**
 * Gets Mapillary access token from environment or default
 */
function getAccessToken(): string {
  return process.env.MAPILLARY_ACCESS_TOKEN || 
         process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN || 
         MAPILLARY_CONFIG.DEFAULT_ACCESS_TOKEN;
}

/**
 * Fetches random Mapillary image within specified bounds
 */
export async function getRandomMapillaryImage(
  bounds: Bounds, 
  limit: number = 50
): Promise<MapillaryImageData | null> {
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
    
    const data: MapillaryResponse = await response.json();
    
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
    throw new Error(`Failed to fetch street view image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates Mapillary image exists and is accessible
 */
export async function validateMapillaryImage(imageId: string): Promise<boolean> {
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