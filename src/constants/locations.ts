/**
 * Game location constants for Vietnamese cities
 */

/**
 * Location codes enum
 */
export const LOCATION_CODES = {
  HANOI: 'HN',
  HO_CHI_MINH: 'TPHCM', 
  HAI_PHONG: 'HP',
  NAM_DINH: 'ND',
  DA_NANG: 'DN',
  DALAT: 'DL',
  DUC_HOA: 'DHLA'
} as const;

/**
 * Location code types
 */
export type LocationCode = typeof LOCATION_CODES[keyof typeof LOCATION_CODES];

/**
 * Location bounds format: [minLongitude, minLatitude, maxLongitude, maxLatitude, deltaRadius]
 */
export type LocationBounds = [number, number, number, number, number];

/**
 * Vietnamese city boundaries for the geography guessing game
 * Format: [minLongitude, minLatitude, maxLongitude, maxLatitude, deltaRadius]
 */
export const LOCATION_BOUNDS: Record<LocationCode, LocationBounds> = {
  [LOCATION_CODES.HANOI]: [105.77, 20.96, 105.88, 21.05, 0.003],
  [LOCATION_CODES.HO_CHI_MINH]: [106.62, 10.71, 106.75, 10.83, 0.005],
  [LOCATION_CODES.HAI_PHONG]: [106.65, 20.8, 106.75, 20.9, 0.05],
  [LOCATION_CODES.NAM_DINH]: [106, 20.35, 106.25, 20.5, 0.005],
  [LOCATION_CODES.DA_NANG]: [108.17, 16, 108.25, 16.1, 0.005],
  [LOCATION_CODES.DALAT]: [108.38, 11.89, 108.50, 12.00, 0.005],
  [LOCATION_CODES.DUC_HOA]: [106.35, 10.85, 106.45, 10.95, 0.005]
};

/**
 * Display names for Vietnamese cities
 */
export const LOCATION_NAMES: Record<LocationCode, string> = {
  [LOCATION_CODES.HANOI]: 'HA NOI',
  [LOCATION_CODES.HO_CHI_MINH]: 'TP. HO CHI MINH',
  [LOCATION_CODES.HAI_PHONG]: 'HAI PHONG',
  [LOCATION_CODES.NAM_DINH]: 'NAM DINH',
  [LOCATION_CODES.DA_NANG]: 'DA NANG',
  [LOCATION_CODES.DALAT]: 'DALAT',
  [LOCATION_CODES.DUC_HOA]: 'DUC HOA'
};

/**
 * Get all available location codes
 */
export function getAvailableLocations(): LocationCode[] {
  return Object.values(LOCATION_CODES);
}

/**
 * Get display name for location code
 */
export function getLocationDisplayName(locationCode: string): string {
  return LOCATION_NAMES[locationCode as LocationCode] || '';
}

/**
 * Get bounds for location code  
 */
export function getLocationBounds(locationCode: string): LocationBounds | null {
  return LOCATION_BOUNDS[locationCode as LocationCode] || null;
}