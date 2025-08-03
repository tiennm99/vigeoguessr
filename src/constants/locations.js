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
};

/**
 * Vietnamese city boundaries for the geography guessing game
 * Format: [minLongitude, minLatitude, maxLongitude, maxLatitude, deltaRadius]
 */
export const LOCATION_BOUNDS = {
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
export const LOCATION_NAMES = {
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
 * @returns {string[]} Array of location codes
 */
export function getAvailableLocations() {
  return Object.values(LOCATION_CODES);
}

/**
 * Get display name for location code
 * @param {string} locationCode - Location code
 * @returns {string} Display name or empty string if not found
 */
export function getLocationDisplayName(locationCode) {
  return LOCATION_NAMES[locationCode] || '';
}

/**
 * Get bounds for location code  
 * @param {string} locationCode - Location code
 * @returns {number[]|null} Bounds array or null if not found
 */
export function getLocationBounds(locationCode) {
  return LOCATION_BOUNDS[locationCode] || null;
}
