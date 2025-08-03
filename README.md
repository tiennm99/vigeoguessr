# VIGEOGUESSR

A Next.js-based Vietnamese geography guessing game where players guess the location of panoramic street view images from various Vietnamese cities.

## Features

- 🗺️ Multiple Vietnamese cities: Hanoi, Ho Chi Minh City, Hai Phong, Nam Dinh, Da Lat, and Duc Hoa
- 📱 Responsive design that works on desktop and mobile
- 🎯 Interactive map for location guessing
- 📊 Distance-based scoring system
- 🖼️ 360° panoramic street view images using Photo Sphere Viewer
- ⚡ Built with Next.js 15 and TypeScript for performance and type safety

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design tokens
- **Maps**: MapLibre GL JS
- **360° Images**: MapillaryJS
- **Image API**: Mapillary Graph API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vigeoguessr
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── game/              # Game page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
│   ├── DonateModal.tsx
│   ├── GameMap.tsx
│   ├── Header.tsx
│   ├── PanoViewer.tsx
│   └── ResultModal.tsx
├── lib/                   # Utility functions
│   └── utils.ts           # Utility functions
└── public/               # Static assets
```

## Key Improvements from Original

- **Modern Framework**: Migrated from vanilla HTML/JS to Next.js with TypeScript
- **Component-Based Architecture**: Modular, reusable React components
- **Clean Code**: Well-structured TypeScript with proper type safety and organization
- **Code Deduplication**: Eliminated duplicate code and consolidated utilities
- **Performance**: Optimized with Next.js built-in optimizations
- **Maintainability**: Cleaner code structure and separation of concerns
- **Responsive Design**: Better mobile experience

## Credit

- [viguessr](https://github.com/luuvanduc1999/viguessr) - Original implementation
- [geoguessr](https://github.com/bensizelove/geoguessr) - Inspiration
