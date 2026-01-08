import type { Metadata } from 'next'
import './globals.css'
import { WhisperProvider } from './context/WhisperContext'
import { ToastProvider } from './context/ToastContext'

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
        <ToastProvider>
          <WhisperProvider>
            {children}
          </WhisperProvider>
        </ToastProvider>
      </body>
    </html>
  )
}