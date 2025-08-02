import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VIGEOGUESSR - Play Now',
  description: 'VIGEOGUESSR - Play a fun city guessing game. Choose your city and guess the location of the picture as accurately as possible!',
  keywords: 'GeoGuessr, city guessing game, Vietnam, Hanoi, Ho Chi Minh, Hai Phong, Nam Dinh, play online',
  authors: [{ name: 'Duc Luu Van' }],
  openGraph: {
    title: 'VIGEOGUESSR - Play Now',
    description: 'Choose your city and guess the location of the picture. Play VIGEOGUESSR now!',
    images: ['/thumbx.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIGEOGUESSR - Play Now',
    description: 'Choose your city and guess the location of the picture. Play VIGEOGUESSR now!',
    images: ['/logo.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/@photo-sphere-viewer/core@5.7.4/index.css" />
        <link rel="icon" type="image/png" href="/logo.png" />
      </head>
      <body className={inter.className}>
        {children}
        <Script 
          src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js" 
          strategy="beforeInteractive"
        />
        <Script 
          src="https://unpkg.com/three@0.152.0/build/three.min.js" 
          strategy="lazyOnload"
        />
        <Script 
          src="https://unpkg.com/@photo-sphere-viewer/core@5.7.4/index.js" 
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}