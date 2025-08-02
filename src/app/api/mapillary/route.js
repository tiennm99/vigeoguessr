import { NextResponse } from 'next/server';
import { boundingBoxVN } from '@/constants/locations';

/**
 * API route to fetch random Mapillary panoramic images
 * Keeps the API key secure on the server side
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  
  if (!location || !boundingBoxVN[location]) {
    return NextResponse.json(
      { error: 'Invalid location parameter' },
      { status: 400 }
    );
  }

  const accessToken = process.env.MAPILLARY_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Mapillary access token not configured' },
      { status: 500 }
    );
  }

  try {
    const [minLong, minLat, maxLong, maxLat, delta] = boundingBoxVN[location];
    
    const randomLat = Math.random() * (maxLat - minLat) + minLat;
    const randomLng = Math.random() * (maxLong - minLong) + minLong;
    const bbox = [
      (randomLng - delta).toFixed(4),
      (randomLat - delta).toFixed(4),
      (randomLng + delta).toFixed(4),
      (randomLat + delta).toFixed(4)
    ].join(',');
    
    const apiUrl = `https://graph.mapillary.com/images?access_token=${accessToken}&fields=id,thumb_original_url,geometry,is_pano&limit=3&bbox=${bbox}&is_pano=true`;
    
    console.log("Fetching panoramic image from server...");
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const panoImages = data.data.filter((image) => image.is_pano);
      const selectedImage = panoImages.length > 0 
        ? panoImages[Math.floor(Math.random() * panoImages.length)] 
        : data.data[0];
      
      console.log("Image fetched successfully from server");
      return NextResponse.json({
        lat: selectedImage.geometry.coordinates[1],
        lng: selectedImage.geometry.coordinates[0],
        url: selectedImage.thumb_original_url,
        id: selectedImage.id,
        isPano: selectedImage.is_pano || false
      });
    } else {
      console.log("No images found, server will retry logic handled by client");
      return NextResponse.json(
        { error: 'No images found for this location' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Server error fetching image:", error);
    return NextResponse.json(
      { error: 'Failed to fetch image data' },
      { status: 500 }
    );
  }
}