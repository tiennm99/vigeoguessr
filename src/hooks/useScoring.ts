import { useMutation, UseMutationResult } from '@tanstack/react-query';

/**
 * Scoring data type definition  
 */
export interface ScoreSubmission {
  username: string;
  guessLat: number;
  guessLng: number;
  trueLat: number;
  trueLng: number;
  imageId: string;
}

/**
 * Score submission response type
 */
export interface ScoreResponse {
  sessionId: string;
  distance: number;
  points: number;
  username: string;
}

/**
 * React Query mutation hook for submitting game scores
 */
export function useScoring(): UseMutationResult<ScoreResponse, Error, ScoreSubmission> {
  return useMutation({
    mutationFn: async (scoreData: ScoreSubmission): Promise<ScoreResponse> => {
      // Validate score data before sending
      if (!isValidScoreData(scoreData)) {
        throw new Error('Invalid score data provided');
      }
      
      const response = await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit score');
      }
      
      return response.json();
    },
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Validates score submission data
 */
function isValidScoreData(scoreData: unknown): scoreData is ScoreSubmission {
  if (typeof scoreData !== 'object' || scoreData === null) {
    return false;
  }
  
  const data = scoreData as Record<string, unknown>;
  
  return typeof data.username === 'string' &&
         data.username.trim().length > 0 &&
         typeof data.guessLat === 'number' &&
         typeof data.guessLng === 'number' &&
         typeof data.trueLat === 'number' &&
         typeof data.trueLng === 'number' &&
         typeof data.imageId === 'string' &&
         data.imageId.trim().length > 0;
}