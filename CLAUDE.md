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

### Core Game Flow
1. **Image Fetching**: `src/utils/mapillary.js:getRandomMapillaryImage()` fetches random panoramic images via server-side API (`src/app/api/mapillary/route.js`) within predefined Vietnamese city boundaries
2. **Display**: `src/components/features/PanoViewer.js` renders 360° images using MapillaryJS npm module with fallback to regular images
3. **Interaction**: `src/components/features/GameMap.js` provides Leaflet-based interactive map for location guessing
4. **Scoring**: Distance calculation using haversine formula in `src/utils/distance.js:calculateDistance()`

### Key Components
- **GameMap**: Leaflet.js integration with click-based location selection, automatic centering based on city choice
- **PanoViewer**: MapillaryJS npm module integration with error handling and fallback display
- **Game Page**: Main game orchestration with state management for loading, guessing, and results

### Data Structure
- City boundaries defined in `src/constants/locations.js:boundingBoxVN` object with coordinates and delta values for API queries
- Location codes: HN (Hanoi), TPHCM (Ho Chi Minh City), HP (Hai Phong), ND (Nam Dinh), DN (Da Nang), DL (Dalat), DHLA (Duc Hoa)

### External Dependencies
- **Leaflet**: Map rendering (loaded via CDN in layout.js)
- **MapillaryJS**: 360° street imagery display (npm module with CSS import)
- **Mapillary Graph API**: Street view image source with server-side access token security

### State Management
Game state managed at page level with React hooks:
- Image loading states and error handling
- Location selection and guess submission
- Distance calculation and result display

### Important Implementation Notes
- Leaflet maps loaded via CDN, MapillaryJS loaded as npm module with CSS import
- Components use refs for DOM manipulation and cleanup
- Server-side API route (`/api/mapillary`) handles Mapillary Graph API calls with secure token storage
- Client-side utility includes retry logic for failed server requests
- Image fallback system handles panoramic vs regular image display

### Recent Changes (Completed)
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
- Project now follows Next.js 14 best practices and is ready for TypeScript migration