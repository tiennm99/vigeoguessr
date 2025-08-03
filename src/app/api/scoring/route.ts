import { NextResponse, NextRequest } from 'next/server';
import { calculateDistance } from '@/services/geography.service';
import { calculatePoints } from '@/services/scoring.service';

interface ScoreRequest {
  username: string;
  guessLat: number;
  guessLng: number;
  trueLat: number;
  trueLng: number;
  imageId: string;
}

interface SessionData {
  username: string;
  imageId: string;
  guessLocation: [number, number];
  trueLocation: [number, number];
  distance: number;
  points: number;
  timestamp: string;
}

const userSessions = new Map<string, SessionData>();

export async function POST(request: NextRequest) {
  try {
    const { username, guessLat, guessLng, trueLat, trueLng, imageId }: ScoreRequest = await request.json();
    
    if (!username || !guessLat || !guessLng || !trueLat || !trueLng || !imageId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const sessionId = `${username}_${Date.now()}`;
    const distance = await calculateDistance(guessLat, guessLng, trueLat, trueLng);
    const points = calculatePoints(distance); // Service expects meters
    
    const sessionData: SessionData = {
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

export async function GET(request: NextRequest) {
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