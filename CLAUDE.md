# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Instructions

**ALWAYS update this CLAUDE.md file after completing tasks that the user marks as done.** Add relevant information about new features, architectural changes, or important implementation details that future Claude instances should know about.

## Project Overview

VIGEOGUESSR is a Vietnamese geography guessing game built with Next.js 15 and React 19. Players view 360° panoramic street images from Vietnamese cities and guess the location on an interactive map. The game uses Mapillary Graph API for panoramic images and calculates distance-based scoring.

## 🛠️ Development Environment

- **Language**: JavaScript (with jsconfig.json for IDE support)
- **Framework**: Next.js 15 (App Router)
- **React**: React 19
- **Styling**: Tailwind CSS (migrating from custom CSS)
- **Component Library**: shadcn/ui (for generic UI components)
- **Specialized Libraries**: MapLibre GL JS + MapillaryJS (for mapping/street view)
- **Data Fetching**: React Query (TanStack) for API calls
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint
- **Package Manager**: pnpm (preferred)

## 📂 Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── layout.js
│   ├── page.js
│   ├── game/
│   └── api/                 # Server-side API routes
├── components/              # UI components (shadcn/ui + game-specific)
│   ├── GameMap.js          # MapLibre GL JS integration
│   ├── PanoViewer.js       # MapillaryJS integration
│   ├── ResultModal.js      # Result display with map + street view
│   └── ui/                 # shadcn/ui components
├── hooks/                   # Custom React hooks
│   ├── useMapillary.js     # Image fetching with React Query
│   └── useScoring.js       # Scoring API with React Query
├── lib/                     # Utilities and API wrappers
├── constants/               # Game constants (cities, locations)
├── utils/                   # Utility functions
├── styles/                  # Tailwind customizations
├── tests/                   # Test files
└── public/
```

## 📦 Installation & Setup

- Tailwind CSS with PostCSS configuration
- shadcn/ui: `npx shadcn-ui@latest init`
- React Query: `<QueryClientProvider>` in app/layout.js
- MapLibre GL JS: `pnpm add maplibre-gl`
- MapillaryJS: `pnpm add mapillary-js`

## ⚙️ Development Commands

- **Dev server**: `pnpm dev` - Start development server on localhost:3000
- **Build**: `pnpm build` - Build for production
- **Start**: `pnpm start` - Start production server
- **Lint**: `pnpm lint` - Run ESLint to check code quality
- **Test**: `pnpm test` - Run Jest + RTL tests
- **Format**: `pnpm format` - Format code with Prettier

## 🧠 React Query Architecture

### API Data Fetching (Option A - Recommended)

```javascript
// hooks/useMapillary.js
const { data: imageData, isLoading } = useQuery({
  queryKey: ["mapillary", city],
  queryFn: () =>
    fetch(`/api/mapillary?location=${city}`).then((res) => res.json()),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// hooks/useScoring.js
const scoreMutation = useMutation({
  mutationFn: (scoreData) =>
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

```javascript
// GameMap component with MapLibre GL JS
import "maplibre-gl/dist/maplibre-gl.css";

export default function GameMap() {
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

```javascript
// PanoViewer.js - Keep (MapillaryJS integration)
// GameMap.js - Keep (MapLibre GL JS integration)
// ResultModal.js - Keep but use shadcn/ui Button, Dialog internally
```

## 🧪 Testing Strategy

### Jest + React Testing Library

```javascript
// tests/GameMap.test.js
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GameMap from "@/components/GameMap";

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

- **JavaScript**: Use ES6+ features, prefer arrow functions
- **Imports**: Group React → Next.js → libraries → local components
- **Components**: Always destructure props, use meaningful names
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
   - > 1km = 0 points
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
