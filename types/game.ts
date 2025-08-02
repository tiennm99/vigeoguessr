export interface BoundingBox {
  [key: string]: [number, number, number, number, number]; // [minLng, minLat, maxLng, maxLat, delta]
}

export interface ImageData {
  lat: number;
  lng: number;
  url: string;
  id: string;
  isPano: boolean;
}

export interface GameState {
  choiceLocation: string;
  trueLocation: [number, number];
  guessCoordinates: [number, number];
  distanceFromGuess: number;
  accumulatedDistance: number;
  currentName: string;
  checkCount: number;
}

export type LocationKey = 'HN' | 'TPHCM' | 'HP' | 'ND' | 'DN' | 'DL' | 'DHLA';