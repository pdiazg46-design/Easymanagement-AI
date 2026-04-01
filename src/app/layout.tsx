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
      <body className="bg-slate-900 sm:bg-slate-800 text-slate-800 sm:py-8 min-h-[100dvh] overflow-x-hidden flex justify-center items-start sm:items-center">
        {/* Contenedor estricto de emulación móvil */}
        <div className="w-full max-w-md sm:h-[850px] sm:max-h-[95vh] bg-slate-100 flex flex-col relative sm:rounded-[40px] shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:ring-[12px] ring-black overflow-hidden mx-auto">
          {children}
        </div>
      </body>
    </html>
  )
}
