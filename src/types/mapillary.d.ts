declare module 'mapillary-js' {
  export interface ViewerOptions {
    accessToken: string;
    container: HTMLElement;
    imageId: string;
    component?: {
      attribution?: boolean;
      bearing?: boolean;
      cache?: boolean;
      cover?: boolean;
      direction?: boolean;
      image?: boolean;
      keyboard?: boolean;
      loading?: boolean;
      marker?: boolean;
      mouse?: boolean;
      pointer?: boolean;
      popup?: boolean;
      sequence?: boolean;
      spatial?: boolean;
      tag?: boolean;
      zoom?: boolean;
    };
  }

  export interface Position {
    lat: number;
    lng: number;
  }

  export class Viewer {
    constructor(options: ViewerOptions);
    
    isNavigable: boolean;
    
    on(event: 'image', callback: (image: { id: string }) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    
    moveTo(imageId: string): Promise<void>;
    getPosition(): Promise<Position>;
    remove(): void;
  }
}