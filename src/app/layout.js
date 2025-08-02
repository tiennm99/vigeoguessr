import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'VIGEOGUESSR - Play Now',
  description: 'VIGEOGUESSR - Play a fun city guessing game. Choose your city and guess the location of the picture as accurately as possible!',
  keywords: 'GeoGuessr, city guessing game, Vietnam, Hanoi, Ho Chi Minh, play online',
  authors: [{ name: 'Duc Luu Van' }],
  openGraph: {
    title: 'VIGEOGUESSR - Play Now',
    description: 'Choose your city and guess the location of the picture. Play VIGEOGUESSR now!',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VIGEOGUESSR - Play Now',
    description: 'Choose your city and guess the location of the picture. Play VIGEOGUESSR now!'
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      </head>
      <body className={inter.className}>
        {children}
        <Script
          src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  )
}
