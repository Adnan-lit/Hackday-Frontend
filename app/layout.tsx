import type { Metadata } from 'next'
import './globals.css'
import { WhisperProvider } from './context/WhisperContext'

export const metadata: Metadata = {
  title: 'Whisper - Wordless Social Media',
  description: 'Share emotions without words',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <WhisperProvider>
          {children}
        </WhisperProvider>
      </body>
    </html>
  )
}