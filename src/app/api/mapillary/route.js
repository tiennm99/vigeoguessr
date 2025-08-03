import { NextResponse } from 'next/server';
import { LOCATION_BOUNDS } from '@/constants/locations';
import { getRandomMapillaryImage } from '@/services/mapillary.service';

/**
 * API route to fetch random Mapillary panoramic images
 * Keeps the API key secure on the server side
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    
    if (!location || !LOCATION_BOUNDS[location]) {
      return NextResponse.json(
        { error: 'Invalid location parameter' },
        { status: 400 }
      );
    }

    // Convert location bounds to service format
    const [minLong, minLat, maxLong, maxLat, delta] = LOCATION_BOUNDS[location];
    
    // Generate random point within bounds
    const randomLat = Math.random() * (maxLat - minLat) + minLat;
    const randomLng = Math.random() * (maxLong - minLong) + minLong;
    
    const bounds = {
      north: randomLat + delta,
      south: randomLat - delta,
      east: randomLng + delta,
      west: randomLng - delta
    };
    
    console.log(`Fetching panoramic image for location: ${location}`);
    const imageData = await getRandomMapillaryImage(bounds, 10);
    
    if (!imageData) {
      console.log("No images found for this location");
      return NextResponse.json(
        { error: 'No images found for this location' },
        { status: 404 }
      );
    }
    
    console.log("Image fetched successfully from server");
    return NextResponse.json({
      lat: imageData.lat,
      lng: imageData.lng,
      url: imageData.url,
      id: imageData.id,
      coordinates: imageData.coordinates,
      isPano: true // Service filters for panoramic images
    });
    
  } catch (error) {
    console.error("Server error fetching image:", error);
    return NextResponse.json(
      { error: 'Failed to fetch image data' },
      { status: 500 }
    );
  }
}