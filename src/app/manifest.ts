import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EASY MANAGEMENT AI',
    short_name: 'EasyMgmt AI',
    description: 'Gestor Inteligente de Ventas y Proyectos Regionales',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1E3A8A',
    icons: [
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      }
    ],
  };
}
