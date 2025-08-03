import { Inter } from 'next/font/google'
import ReactQueryProvider from '@/lib/react-query'
import './globals.css'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
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

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={inter.className}>
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  )
}