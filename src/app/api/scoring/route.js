import { NextResponse } from 'next/server';
import { calculateDistance } from '@/utils/distance';

const userSessions = new Map();

function calculatePoints(distanceKm) {
  if (distanceKm > 1) return 0;
  if (distanceKm > 0.5) return 1;  
  if (distanceKm > 0.2) return 2;
  if (distanceKm > 0.1) return 3;
  if (distanceKm > 0.05) return 4;
  return 5;
}

export async function POST(request) {
  try {
    const { username, guessLat, guessLng, trueLat, trueLng, imageId } = await request.json();
    
    if (!username || !guessLat || !guessLng || !trueLat || !trueLng || !imageId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const sessionId = `${username}_${Date.now()}`;
    const distance = await calculateDistance(guessLat, guessLng, trueLat, trueLng);
    const points = calculatePoints(distance / 1000); // Convert to km for points calculation
    
    const sessionData = {
      username,
      imageId,
      guessLocation: [guessLat, guessLng],
      trueLocation: [trueLat, trueLng],
      distance,
      points,
      timestamp: new Date().toISOString()
    };

    userSessions.set(sessionId, sessionData);

    console.log(`Score calculated for ${username}: ${distance.toFixed(2)}km = ${points} points`);

    return NextResponse.json({
      sessionId,
      distance,
      points,
      username
    });

  } catch (error) {
    console.error('Error calculating score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (sessionId && userSessions.has(sessionId)) {
    return NextResponse.json(userSessions.get(sessionId));
  }
  
  return NextResponse.json(
    { error: 'Session not found' },
    { status: 404 }
  );
}