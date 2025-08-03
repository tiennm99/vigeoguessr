import { useMutation } from '@tanstack/react-query';

/**
 * Scoring data type definition  
 * @typedef {Object} ScoreSubmission
 * @property {string} username - Player username
 * @property {number} guessLat - Guessed latitude
 * @property {number} guessLng - Guessed longitude
 * @property {number} trueLat - Actual latitude
 * @property {number} trueLng - Actual longitude
 * @property {string} imageId - Mapillary image ID
 */

/**
 * React Query mutation hook for submitting game scores
 * @returns {Object} Mutation object with mutate function and status
 */
export function useScoring() {
  return useMutation({
    mutationFn: async (scoreData) => {
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
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

/**
 * Validates score submission data
 * @param {Object} scoreData - Score data to validate
 * @returns {boolean} True if data is valid
 */
function isValidScoreData(scoreData) {
  return scoreData &&
         typeof scoreData.username === 'string' &&
         scoreData.username.trim().length > 0 &&
         typeof scoreData.guessLat === 'number' &&
         typeof scoreData.guessLng === 'number' &&
         typeof scoreData.trueLat === 'number' &&
         typeof scoreData.trueLng === 'number' &&
         typeof scoreData.imageId === 'string' &&
         scoreData.imageId.trim().length > 0;
}