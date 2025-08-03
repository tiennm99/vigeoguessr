import '@testing-library/jest-dom'

// Mock MapLibre GL JS
jest.mock('maplibre-gl', () => ({
  Map: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
    addSource: jest.fn(),
    addLayer: jest.fn(),
    fitBounds: jest.fn(),
    getCanvas: jest.fn(() => ({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  })),
  LngLatBounds: jest.fn(() => ({
    extend: jest.fn(),
  })),
}))

// Mock MapillaryJS
jest.mock('mapillary-js', () => ({
  Viewer: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    remove: jest.fn(),
    getPosition: jest.fn(() => Promise.resolve({ lat: 0, lng: 0 })),
  })),
}))

// Mock CSS imports
jest.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}))
jest.mock('mapillary-js/dist/mapillary.css', () => ({}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})