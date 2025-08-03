declare module 'maplibre-gl' {
  export interface LngLat {
    lng: number;
    lat: number;
  }

  export interface MapMouseEvent {
    lngLat: LngLat;
    point: { x: number; y: number };
  }

  export interface MapOptions {
    container: HTMLElement;
    style: any;
    center: [number, number];
    zoom: number;
  }

  export class Map {
    constructor(options: MapOptions);
    
    on(event: 'click', callback: (event: MapMouseEvent) => void): void;
    on(event: 'load', callback: () => void): void;
    
    flyTo(options: { center: [number, number]; zoom: number }): void;
    addSource(id: string, source: any): void;
    addLayer(layer: any): void;
    removeLayer(id: string): void;
    removeSource(id: string): void;
    getLayer(id: string): any;
    getSource(id: string): any;
    remove(): void;
  }

  export default Map;
}