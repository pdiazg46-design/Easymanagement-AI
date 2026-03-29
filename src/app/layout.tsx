import type { Metadata } from 'next'
import './globals.css'

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
      <body>{children}</body>
    </html>
  )
}
