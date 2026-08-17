# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Instructions

**ALWAYS update this CLAUDE.md file after completing tasks that the user marks as done.** Add relevant information about new features, architectural changes, or important implementation details that future Claude instances should know about.

## Project Overview

VIGEOGUESSR is a Vietnamese geography guessing game built with Next.js 15 and React 19. Players view 360° panoramic street images from Vietnamese cities and guess the location on an interactive map. The game uses Mapillary Graph API for panoramic images and calculates distance-based scoring.

## 🛠️ Development Environment

- **Language**: TypeScript (`^5.0.0`)
- **Framework**: Next.js 15 (App Router)
- **React**: React 19
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (for generic UI components)
- **Specialized Libraries**: MapLibre GL JS + MapillaryJS (for mapping/street view)
- **Data Fetching**: React Query (TanStack) for API calls
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with `@typescript-eslint`
- **Formatting**: Prettier
- **Package Manager**: npm

## 📂 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── game/
│   └── api/                 # Server-side API routes
├── components/              # UI components (shadcn/ui + game-specific)
│   ├── features/           # Game-specific components
│   │   ├── GameMap.tsx     # MapLibre GL JS integration
│   │   ├── PanoViewer.tsx  # MapillaryJS integration
│   │   └── ResultModal.tsx # Result display with map + street view
│   └── ui/                 # shadcn/ui components
├── services/               # Service layer for external APIs and business logic
│   ├── geography.service.ts    # Coordinate validation and distance calculations
│   ├── scoring.service.ts      # Game scoring and point calculations
│   ├── mapillary.service.ts    # Mapillary API integration
│   └── game-image.service.ts   # Game image fetching logic
├── hooks/                   # Custom React hooks
│   ├── useMapillary.ts     # Image fetching with React Query
│   └── useScoring.ts       # Scoring API with React Query
├── lib/                     # Client helpers, API wrappers, utilities
├── constants/               # Game constants (cities, locations)
├── styles/                  # Tailwind customizations
├── tests/                   # Unit and integration tests
└── public/
```

## 📁 Configuration Files

Key configuration files in the project root:

- `tsconfig.json` - TypeScript configuration with strict settings and path mapping
- `tailwind.config.ts` - Tailwind CSS customization with TypeScript  
- `.eslintrc.json` - ESLint with TypeScript rules
- `postcss.config.ts` - PostCSS configuration with TypeScript
- `next.config.ts` - Next.js configuration with TypeScript
- `jest.config.ts` - Jest testing configuration with TypeScript  
- `jest.setup.ts` - Jest setup and mocks with TypeScript
- `package.json` - Dependencies and scripts
- `next-env.d.ts` - Next.js TypeScript environment types

## 📦 Installation & Setup

- Tailwind CSS with PostCSS configuration
- shadcn/ui: `npx shadcn-ui@latest init`
- React Query: `<QueryClientProvider>` in app/layout.tsx
- MapLibre GL JS: `npm install maplibre-gl`
- MapillaryJS: `npm install mapillary-js`
- TypeScript configuration with `tsconfig.json`
- ESLint with TypeScript support

## ⚙️ Development Commands

- **Dev server**: `npm run dev` - Start development server on localhost:3000
- **Build**: `npm run build` - Build for production
- **Start**: `npm start` - Start production server
- **Lint**: `npm run lint` - Run ESLint to check code quality
- **Test**: `npm test` - Run Jest + RTL tests
- **Format**: `npm run format` - Format code with Prettier

## 🧠 React Query Architecture

### API Data Fetching (Option A - Recommended)

```typescript
// hooks/useMapillary.ts
const { data: imageData, isLoading } = useQuery({
  queryKey: ["mapillary", city],
  queryFn: () =>
    fetch(`/api/mapillary?location=${city}`).then((res) => res.json()),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// hooks/useScoring.ts
const scoreMutation = useMutation({
  mutationFn: (scoreData: ScoreData) =>
    fetch("/api/scoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scoreData),
    }).then((res) => res.json()),
});
```

**Benefits:**

- Automatic caching of API responses
- Built-in loading/error states
- Retry logic for failed requests
- Server APIs unchanged

## 🎨 Styling Architecture

### Tailwind + Specialized Libraries

```typescript
// GameMap component with MapLibre GL JS
import "maplibre-gl/dist/maplibre-gl.css";

interface GameMapProps {
  choiceLocation: string;
  onLocationSelect: (coords: [number, number]) => void;
}

export default function GameMap({ choiceLocation, onLocationSelect }: GameMapProps) {
  return (
    <div className="w-full h-96 rounded-lg border border-gray-200 overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
```

**Integration Strategy:**

- Keep required CSS imports for MapLibre GL JS and MapillaryJS
- Wrap components with Tailwind utility classes
- Create custom Tailwind components for consistent styling
- Remove custom CSS in favor of Tailwind utilities

## 🧩 Component Guidelines

### shadcn/ui Integration

- **Replace**: Header, DonateModal, UsernameModal → Button, Dialog, Input components
- **Keep**: GameMap, PanoViewer, ResultModal (specialized functionality)
- **Mixing**: Game components use shadcn/ui internally for buttons, forms, etc.

### Game-Specific Components

```typescript
// PanoViewer.tsx - Keep (MapillaryJS integration)
// GameMap.tsx - Keep (MapLibre GL JS integration)
// ResultModal.tsx - Keep but use shadcn/ui Button, Dialog internally
```

## 🧪 Testing Strategy

### Jest + React Testing Library

```typescript
// tests/GameMap.test.tsx
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GameMap from "@/components/features/GameMap";

// Mock MapLibre GL JS
jest.mock("maplibre-gl", () => ({
  Map: jest.fn(() => ({
    on: jest.fn(),
    remove: jest.fn(),
  })),
}));

test("renders game map container", () => {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <GameMap choiceLocation="HN" onLocationSelect={jest.fn()} />
    </QueryClientProvider>
  );

  expect(screen.getByRole("application")).toBeInTheDocument();
});
```

### Testing Considerations

- **Mock specialized libraries**: MapLibre GL JS, MapillaryJS
- **Test React Query hooks**: Use `QueryClient` wrapper
- **Focus on user interactions**: Button clicks, form submissions
- **Skip complex map/street view rendering**: Test props and callbacks

## 📝 Code Style Standards

- **TypeScript**: Use strict typing, prefer arrow functions, annotate return types
- **Imports**: Group React → Next.js → libraries → local components
- **Components**: Always destructure props, use meaningful names, define interfaces
- **Types**: Avoid `any` type, use `unknown` or strict generics
- **Styling**: Prefer Tailwind utilities over custom CSS
- **API**: Keep server logic in `/api` routes, client logic in hooks

## 🔍 Migration Guidelines

### From Custom CSS to Tailwind

1. Replace custom CSS classes with Tailwind utilities
2. Keep required CSS imports for MapLibre/MapillaryJS
3. Use Tailwind components for consistent styling
4. Remove `globals.css` custom styles gradually

### Adding shadcn/ui Components

1. Install: `npx shadcn-ui@latest add button dialog input`
2. Replace existing UI components with shadcn/ui equivalents
3. Maintain game-specific component functionality
4. Use shadcn/ui components within specialized components

## Architecture

**Multi-Library Approach: Each Tool for Its Optimal Purpose**

This project uses a carefully chosen combination of specialized libraries rather than trying to force a single library to handle all use cases. This approach provides superior user experience, maintainability, and performance.

### Core Game Flow

**Multi-User Gameplay Experience:**

1. **User Entry**: Home page checks localStorage for cached username, displays popup if not found
2. **City Selection**: User selects from available Vietnamese cities on home page
3. **Game Initialization**: Navigate to game scene with selected city parameter
4. **Image Loading**: Server provides random panoramic image from city bounds via `src/app/api/mapillary/route.ts`
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
   - > 1km = 0 points
7. **Results**:
   - Show guess location, actual location, distance, and points
   - Enable MapillaryJS navigation around actual location
   - "Next" button continues to next round

**Technical Implementation:**

- **Image Fetching**: `src/services/game-image.service.ts` handles client-side image fetching with retry logic
- **API Integration**: `src/services/mapillary.service.ts` provides server-side Mapillary API integration
- **Display**: `src/components/features/PanoViewer.tsx` renders raw 360° images using MapillaryJS npm module
- **Interaction**: `src/components/features/GameMap.tsx` provides MapLibre GL JS-based interactive map for location guessing
- **Scoring**: `src/services/scoring.service.ts` handles point calculation with configurable thresholds
- **Geography**: `src/services/geography.service.ts` provides distance calculation with OpenStreetMap validation
- **Session Management**: Per-user session tracking for concurrent multi-player support

### Key Components

- **GameMap**: MapLibre GL JS integration with click-based location selection, automatic centering based on city choice, and native coordinate synchronization
- **PanoViewer**: MapillaryJS npm module integration with precise coordinate extraction, error handling and fallback display
- **ResultModal**: MapLibre GL JS result map showing true location (green), guess location (red), and connecting line with distance calculation
- **Game Page**: Main game orchestration with state management for loading, guessing, and results

### Data Structure

- City boundaries defined in `src/constants/locations.ts:LOCATION_BOUNDS` object with coordinates and delta values for API queries
- Location codes: HN (Hanoi), TPHCM (Ho Chi Minh City), HP (Hai Phong), ND (Nam Dinh), DN (Da Nang), DL (Dalat), DHLA (Duc Hoa)
- Constants organized with enums: `LOCATION_CODES`, `LOCATION_BOUNDS`, `LOCATION_NAMES`

### External Dependencies

- **MapLibre GL JS**: Interactive map rendering (npm module with CSS import) - provides native coordinate synchronization with MapillaryJS
- **MapillaryJS**: 360° street imagery display (npm module with CSS import)
- **Mapillary Graph API**: Street view image source with server-side access token security

### State Management

Game state managed at page level with React hooks:

- Image loading states and error handling
- Location selection and guess submission
- Distance calculation and result display

## Recent Implementation Updates

### Modern Tech Stack Migration (Latest)
- **Language**: TypeScript (`^5.7.3`) with strict typing, interfaces, and complete migration
- **Package Manager**: npm, with scripts dev, build, start, lint, format, test, type-check
- **Tailwind CSS**: Complete migration from custom CSS to Tailwind utilities with custom design tokens matching game theme  
- **shadcn/ui**: Installed and configured with utility functions, ready for UI component replacements
- **React Query**: Added TanStack Query with QueryClientProvider in layout and custom hooks (`useMapillary`, `useScoring`)
- **Testing Setup**: Configured Jest + React Testing Library with specialized mocks for MapLibre/MapillaryJS libraries
- **Project Structure**: Added modern hooks/, lib/, types/ directories following TypeScript architectural guidelines
- **Development Environment**: Updated to modern toolchain with TypeScript, ESLint, Prettier formatting and enhanced DX
- **File Migration**: All 25+ JavaScript files converted to TypeScript with proper typing
- **Type Safety**: Custom type definitions for external libraries (MapLibre GL JS, MapillaryJS)
- **Zero JavaScript**: Complete elimination of ALL `.js` files from entire project (src/ + root config files)

### Current Architecture Status
- ✅ **Framework**: Next.js 15 + React 19
- ✅ **Language**: TypeScript with strict configuration - **COMPLETE MIGRATION**
- ✅ **Styling**: Tailwind CSS with custom game design tokens
- ✅ **Data Fetching**: React Query hooks for API management
- ✅ **Testing**: Jest + RTL with TypeScript and library mocks
- ✅ **Package Management**: npm with modern scripts
- ✅ **App Router**: All app router files migrated to TypeScript (.tsx)
- ✅ **API Routes**: All API routes migrated to TypeScript (.ts)
- ✅ **Service Layer**: All service files migrated with proper TypeScript interfaces
- ✅ **Components**: All components migrated to TypeScript (GameMap, PanoViewer, ResultModal, Header, DonateModal, UsernameModal)
- ✅ **Hooks**: All hooks migrated with proper TypeScript return types
- ✅ **Lib Files**: React Query provider and utilities migrated to TypeScript
- ✅ **Constants**: Location constants migrated with TypeScript interfaces and enums
- ✅ **Type Definitions**: Custom type definitions created for MapLibre GL JS and MapillaryJS
- ✅ **Index Files**: All index files migrated and JavaScript files removed
- ✅ **Config Files**: All root configuration files migrated (next.config.ts, jest.config.ts, postcss.config.ts, tailwind.config.ts)
- 🚧 **UI Components**: Ready for shadcn/ui migration (existing components are TypeScript-ready)

**🎉 COMPLETE TYPESCRIPT MIGRATION ACHIEVED** - Zero JavaScript files remaining in entire project. All source code AND configuration files are now TypeScript-enabled with modern tooling and industry-standard development practices.

## 🏗️ Service Layer Architecture

### Service Organization

The project now uses a clean service layer architecture with specialized services:

```typescript
// Geography service for coordinate operations
import { calculateDistance, isValidCoordinate } from '@/services/geography.service';

// Scoring service for game mechanics
import { calculatePoints, getScoreDescription, formatDistance } from '@/services/scoring.service';

// Mapillary service for street view integration
import { getRandomMapillaryImage, validateMapillaryImage } from '@/services/mapillary.service';

// Game image service for client-side image fetching
import { fetchRandomGameImage } from '@/services/game-image.service';
```

### Service Benefits

- **Separation of Concerns**: Each service handles a specific domain
- **Testability**: Services can be tested in isolation
- **Reusability**: Services can be imported across components
- **Type Safety**: JSDoc documentation provides IDE autocomplete
- **Error Handling**: Consistent error patterns across services
- **Configuration**: Centralized configuration objects

### Migration from Legacy Utils

The legacy `src/utils/` directory has been completely removed. All functionality has been migrated to the service layer with improved error handling, validation, and documentation.
