import type { Metadata } from 'next'
import './globals.css'

import InstallPrompt from '../components/InstallPrompt'

export const metadata: Metadata = {
  title: 'EASY MANAGEMENT AI',
  description: 'Herramienta estratégica de ventas y control',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased font-sans">
         {children}
         <InstallPrompt />
      </body>
    </html>
  )
}
