import type { Metadata, Viewport } from 'next'
import './globals.css'

import InstallPrompt from '../components/InstallPrompt'

export const metadata: Metadata = {
  title: 'EASY MANAGEMENT AI',
  description: 'Herramienta estratégica de ventas y control',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased font-sans overflow-x-hidden w-full relative">
         {children}
         <InstallPrompt />
      </body>
    </html>
  )
}
