import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchRandomGameImage, GameImageData } from '@/services/game-image.service';

/**
 * React Query hook for fetching Mapillary images
 */
export function useMapillaryImage(locationCode: string): UseQueryResult<GameImageData | null, Error> {
  return useQuery({
    queryKey: ['mapillary-image', locationCode],
    queryFn: () => fetchRandomGameImage(locationCode),
    enabled: !!locationCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * @deprecated Use useMapillaryImage instead
 */
export const useGameImage = useMapillaryImage;