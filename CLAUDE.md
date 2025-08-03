# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Instructions

**ALWAYS update this CLAUDE.md file after completing tasks that the user marks as done.** Add relevant information about new features, architectural changes, or important implementation details that future Claude instances should know about.

## Project Overview

VIGEOGUESSR is a Vietnamese geography guessing game built with Next.js 14. Players view 360° panoramic street images from Vietnamese cities and guess the location on an interactive map. The game uses Mapillary Graph API for panoramic images and calculates distance-based scoring.

## Development Commands

- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Structure (Standard Next.js)

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # Server-side API routes
│   │   └── mapillary/     # Mapillary API endpoint
│   ├── game/              # Game page
│   ├── globals.css        # Global styles  
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   │   ├── Header.js     # Navigation header
│   │   ├── DonateModal.js # Donation modal
│   │   └── index.js      # Component exports
│   └── features/         # Game-specific components
│       ├── GameMap.js    # Interactive Leaflet map
│       ├── PanoViewer.js # 360° image viewer
│       ├── ResultModal.js # Game result display
│       └── index.js      # Component exports
├── constants/            # Application constants
│   └── locations.js      # Vietnamese city data
├── utils/                # Utility functions
│   ├── mapillary.js     # Mapillary API integration
│   ├── distance.js      # Distance calculations
│   └── index.js         # Utility exports
└── types/               # TypeScript definitions (ready for TS migration)
```

## Architecture

### Architectural Design Philosophy

**Multi-Library Approach: Each Tool for Its Optimal Purpose**

This project uses a carefully chosen combination of specialized libraries rather than trying to force a single library to handle all use cases. This approach provides superior user experience, maintainability, and performance.

### Core Game Flow

**Multi-User Gameplay Experience:**
1. **User Entry**: Home page checks localStorage for cached username, displays popup if not found
2. **City Selection**: User selects from available Vietnamese cities on home page
3. **Game Initialization**: Navigate to game scene with selected city parameter
4. **Image Loading**: Server provides random panoramic image from city bounds via `src/app/api/mapillary/route.js`
5. **Gameplay**: 
   - Display raw panoramic image without location metadata
   - Show city overview map for location guessing
   - User submits guess location with username
6. **Scoring System**: Server calculates distance-based points (0-5 scale) per user session:
   - 0-50m = 5 points
   - 50m-100m = 4 points
   - 100m-200m = 3 points
   - 200m-500m = 2 points
   - 500m-1km = 1 point
   - >1km = 0 points
7. **Results**: 
   - Show guess location, actual location, distance, and points
   - Enable MapillaryJS navigation around actual location
   - "Next" button continues to next round

**Technical Implementation:**
- **Image Fetching**: `src/utils/mapillary.js:getRandomMapillaryImage()` fetches random panoramic images via server-side API
- **Display**: `src/components/features/PanoViewer.js` renders raw 360° images using MapillaryJS npm module  
- **Interaction**: `src/components/features/GameMap.js` provides MapLibre GL JS-based interactive map for location guessing
- **Scoring**: Enhanced distance calculation with point system in `src/utils/distance.js:calculateDistance()`
- **Session Management**: Per-user session tracking for concurrent multi-player support

### Key Components
- **GameMap**: MapLibre GL JS integration with click-based location selection, automatic centering based on city choice, and native coordinate synchronization
- **PanoViewer**: MapillaryJS npm module integration with precise coordinate extraction, error handling and fallback display
- **ResultModal**: MapLibre GL JS result map showing true location (green), guess location (red), and connecting line with distance calculation
- **Game Page**: Main game orchestration with state management for loading, guessing, and results

### Data Structure
- City boundaries defined in `src/constants/locations.js:boundingBoxVN` object with coordinates and delta values for API queries
- Location codes: HN (Hanoi), TPHCM (Ho Chi Minh City), HP (Hai Phong), ND (Nam Dinh), DN (Da Nang), DL (Dalat), DHLA (Duc Hoa)

### External Dependencies
- **MapLibre GL JS**: Interactive map rendering (npm module with CSS import) - provides native coordinate synchronization with MapillaryJS
- **MapillaryJS**: 360° street imagery display (npm module with CSS import)
- **Mapillary Graph API**: Street view image source with server-side access token security

### State Management
Game state managed at page level with React hooks:
- Image loading states and error handling
- Location selection and guess submission
- Distance calculation and result display

### Why This Architecture: Decision Rationale

#### **1. MapLibre GL JS for Geographic Selection (NOT Leaflet or MapillaryJS Earth Mode)**

**Decision**: Use MapLibre GL JS for the guessing map interface

**Why MapLibre GL JS?**
- ✅ **Native MapillaryJS Coordination**: Built-in coordinate synchronization with MapillaryJS for precise coordinate matching
- ✅ **No API Keys Required**: Fully open source, no licensing restrictions
- ✅ **WebGL Performance**: Hardware-accelerated rendering for smooth interactions
- ✅ **Precise Coordinate System**: Uses same coordinate system as MapillaryJS, eliminating mismatches
- ✅ **Familiar UX**: Traditional map interface users expect for location guessing
- ✅ **Complete Geographic Coverage**: Full city-wide map coverage with various tile sources

**Why NOT Leaflet?**
- ❌ **Coordinate Mismatches**: Different coordinate systems cause precision issues with MapillaryJS
- ❌ **No Native Sync**: Lacks built-in coordinate synchronization with MapillaryJS
- ❌ **Limited Performance**: Canvas-based rendering vs WebGL acceleration

**Why NOT MapillaryJS Earth Mode?**
- ❌ **Limited Coverage**: Earth mode only works where street imagery exists, not city-wide
- ❌ **Complex UX**: Bird's eye view is designed for navigation around imagery, not geographic selection

#### **2. MapillaryJS for Street Imagery (NOT Generic Image Viewers)**

**Decision**: Use MapillaryJS for 360° street imagery display

**Why MapillaryJS?**
- ✅ **Native Integration**: Built specifically for Mapillary's street imagery ecosystem
- ✅ **WebGL Performance**: Hardware-accelerated rendering for smooth 360° interaction
- ✅ **Built-in Controls**: Native pan, zoom, and navigation controls
- ✅ **Future Extensibility**: Supports advanced features like spatial data visualization

**Why NOT Photo Sphere Viewer or alternatives?**
- ❌ **Generic Solution**: Not optimized for street imagery data format
- ❌ **Performance**: Less efficient rendering without Mapillary-specific optimizations
- ❌ **Limited Features**: Lacks integration with Mapillary's advanced capabilities

#### **3. Server-Side API (NOT Client-Side MapillaryJS Data Provider)**

**Decision**: Use server-side API for geographic image discovery

**Why Server-Side API?**
- ✅ **Security**: API keys remain server-side, preventing exposure
- ✅ **Geographic Discovery**: MapillaryJS is designed for navigation between known IDs, not location-based discovery
- ✅ **Controlled Access**: Server can implement rate limiting and caching
- ✅ **Separation of Concerns**: Clean separation between data fetching and display

**Why NOT MapillaryJS Data Provider?**
- ❌ **Wrong Use Case**: MapillaryJS data providers are for navigation, not geographic bounds queries
- ❌ **Security Risk**: Would require exposing API keys client-side
- ❌ **Complex Implementation**: Would require understanding internal cell systems

### Important Implementation Notes
- **MapLibre GL JS + MapillaryJS integration solves coordinate precision**: Native coordinate synchronization eliminates mismatches
- **Precise coordinate flow**: MapillaryJS `getPosition()` provides exact coordinates, MapLibre GL JS uses same coordinate system
- **Coordinate synchronization**: PanoViewer extracts precise coordinates via `onPreciseLocationLoad` callback
- Components use refs for DOM manipulation and cleanup
- Server-side API route (`/api/mapillary`) handles Mapillary Graph API calls for geographic image discovery with secure token storage
- Client-side utility includes retry logic for failed server requests
- Once image ID is obtained, MapillaryJS handles the 360° street imagery display with precise coordinate extraction
- Image fallback system handles panoramic vs regular image display

### Recent Changes (Completed)

**Multi-User Gameplay Implementation (Latest):**
- **Username System**: Added localStorage-cached username with popup modal for first-time users
- **City Selection Interface**: Enhanced home page with username-aware city selection
- **Per-User Scoring API**: Created `/api/scoring` endpoint with session tracking for concurrent multi-player support
- **Distance-Based Point System**: Implemented 0-5 point scale based on accuracy (0-50m=5pts, 50m-100m=4pts, 100m-200m=3pts, 200m-500m=2pts, 500m-1km=1pt, >1km=0pts)
- **Raw Image Display**: Modified PanoViewer to disable navigation controls during gameplay, preventing location information exposure
- **Enhanced Result Modal**: Added points display, side-by-side map/street view layout, and enabled MapillaryJS navigation in result phase
- **Game Flow Integration**: Updated game page to handle username parameters, server-side scoring, and fallback error handling

### Recent Changes (Previous)
- **Structure**: Migrated to standard Next.js `src/` directory structure
- **Code Organization**: Separated utilities (`src/utils/`), constants (`src/constants/`), UI components (`src/components/ui/`), and feature components (`src/components/features/`)
- **Import Optimization**: Updated all import paths and added index files for cleaner imports
- **Configuration**: Updated `jsconfig.json` path aliases to work with new src structure
- **Cleanup**: Removed 16 unused assets and redundant npm dependencies
- **MapillaryJS Migration & Security Enhancement**: Complete refactor from Photo Sphere Viewer to MapillaryJS npm module with server-side API
  - Installed MapillaryJS v4.1.2 as npm dependency and removed photo-sphere-viewer/three.js dependencies
  - Created server-side API route `src/app/api/mapillary/route.js` for secure Mapillary Graph API calls
  - Moved API key to environment variables (`MAPILLARY_ACCESS_TOKEN`, `NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN`)
  - Refactored `src/components/features/PanoViewer.js` to use imported MapillaryJS module with CSS import
  - Updated `src/utils/mapillary.js` to call server API instead of direct external API calls
  - Removed CDN imports from `src/app/layout.js` in favor of npm module
  - Enhanced error handling and retry logic for server-side requests
  - Maintained fallback image display for error handling
- **MapLibre GL JS Migration**: Replaced Leaflet with MapLibre GL JS for native MapillaryJS coordinate synchronization
  - Installed MapLibre GL JS v5.6.1 as npm dependency and removed Leaflet dependencies
  - Removed Leaflet CDN imports from `src/app/layout.js`
  - Completely refactored `src/components/features/GameMap.js` to use MapLibre GL JS with WebGL rendering
  - Implemented precise coordinate synchronization using MapillaryJS `getPosition()` method
  - Enhanced `src/components/features/PanoViewer.js` with `onPreciseLocationLoad` callback for coordinate extraction
  - Updated game page to use precise MapillaryJS coordinates instead of server-provided coordinates
  - Migrated `src/components/features/ResultModal.js` from Leaflet to MapLibre GL JS with GeoJSON markers and styling
  - Solved coordinate mismatch issues between street imagery and map interface
  - Fixed empty result page issue by ensuring all map components use MapLibre GL JS
- Project now follows Next.js 14 best practices, uses native MapillaryJS coordination, and is ready for TypeScript migration