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
};

/**
 * Calculates points based on distance in meters
 * @param {number} distanceMeters - Distance in meters
 * @returns {number} Points (0-5 scale)
 */
export function calculatePoints(distanceMeters) {
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
 * @param {number} points - Points earned (0-5)
 * @returns {string} Score description
 */
export function getScoreDescription(points) {
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
 * @param {number} distanceMeters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(distanceMeters) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(distanceMeters)} m`;
}