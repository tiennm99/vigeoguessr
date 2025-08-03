import { useQuery } from '@tanstack/react-query';

export function useMapillaryImage(city) {
  return useQuery({
    queryKey: ['mapillary', city],
    queryFn: async () => {
      const response = await fetch(`/api/mapillary?location=${city}`);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      return response.json();
    },
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}