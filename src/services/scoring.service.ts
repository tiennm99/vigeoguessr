/**
 * Scoring service for game mechanics
 */

/**
 * Game scoring configuration
 */
export const SCORING_CONFIG = {
  DISTANCE_THRESHOLDS: {
    PERFECT: 0.05,    // 50m
    EXCELLENT: 0.1,   // 100m  
    GOOD: 0.2,        // 200m
    FAIR: 0.5,        // 500m
    POOR: 1.0         // 1km
  },
  POINTS: {
    PERFECT: 5,
    EXCELLENT: 4,
    GOOD: 3,
    FAIR: 2,
    POOR: 1,
    NONE: 0
  }
} as const;

/**
 * Calculates points based on distance in meters
 */
export function calculatePoints(distanceMeters: number): number {
  const distanceKm = distanceMeters / 1000;
  const { DISTANCE_THRESHOLDS, POINTS } = SCORING_CONFIG;
  
  if (distanceKm <= DISTANCE_THRESHOLDS.PERFECT) return POINTS.PERFECT;
  if (distanceKm <= DISTANCE_THRESHOLDS.EXCELLENT) return POINTS.EXCELLENT;
  if (distanceKm <= DISTANCE_THRESHOLDS.GOOD) return POINTS.GOOD;
  if (distanceKm <= DISTANCE_THRESHOLDS.FAIR) return POINTS.FAIR;
  if (distanceKm <= DISTANCE_THRESHOLDS.POOR) return POINTS.POOR;
  
  return POINTS.NONE;
}

/**
 * Gets score description based on points
 */
export function getScoreDescription(points: number): string {
  const { POINTS } = SCORING_CONFIG;
  
  switch (points) {
    case POINTS.PERFECT: return 'Perfect!';
    case POINTS.EXCELLENT: return 'Excellent!';
    case POINTS.GOOD: return 'Good!';
    case POINTS.FAIR: return 'Fair';
    case POINTS.POOR: return 'Poor';
    default: return 'Try again';
  }
}

/**
 * Formats distance for display
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(distanceMeters)} m`;
}