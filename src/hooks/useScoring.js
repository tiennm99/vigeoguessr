import { useMutation } from '@tanstack/react-query';

export function useScoring() {
  return useMutation({
    mutationFn: async (scoreData) => {
      const response = await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
      
      return response.json();
    },
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}