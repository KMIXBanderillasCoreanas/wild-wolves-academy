import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import InstallPWA from '@/components/InstallPWA';

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Wild Wolves CDMX - Basketball Academy',
  description: 'Plataforma oficial de desarrollo, biomecánica 360° y métricas de básquetbol para Wild Wolves CDMX.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WildWolves',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#090d16] text-zinc-100 flex flex-col font-sans selection:bg-[#ea580c] selection:text-white antialiased">
        <InstallPWA />
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
