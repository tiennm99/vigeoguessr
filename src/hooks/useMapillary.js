import { useQuery } from '@tanstack/react-query';
import { fetchRandomGameImage } from '@/services/game-image.service';

/**
 * React Query hook for fetching Mapillary images
 * @param {string} locationCode - Location code (e.g., 'HN', 'TPHCM')
 * @returns {Object} React Query result with image data
 */
export function useMapillaryImage(locationCode) {
  return useQuery({
    queryKey: ['mapillary-image', locationCode],
    queryFn: () => fetchRandomGameImage(locationCode),
    enabled: !!locationCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * @deprecated Use useMapillaryImage instead
 */
export const useGameImage = useMapillaryImage;