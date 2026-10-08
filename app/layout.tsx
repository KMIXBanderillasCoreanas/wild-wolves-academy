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
  metadataBase: new URL('https://wild-wolves-academy.vercel.app'),
  title: 'Wild Wolves CDMX | Basketball Academy & Performance OS',
  description: 'Academia formativa y de alto rendimiento en Deportivo Carmen Serdán (CDMX). Turnos matutino (9-11 hrs) y vespertino (17-19 hrs). Desde $50 MXN por clase.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Wild Wolves CDMX',
  },
  icons: {
    icon: '/logo-official.png',
    shortcut: '/logo-official.png',
    apple: '/logo-official.png',
  },
  openGraph: {
    title: 'Wild Wolves CDMX | Basketball Academy',
    description: 'Academia formativa y de alto rendimiento en Deportivo Carmen Serdán (CDMX). Turnos matutino y vespertino desde $50 MXN.',
    url: 'https://wild-wolves-academy.vercel.app',
    siteName: 'Wild Wolves CDMX',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: '/logo-official.png',
        width: 800,
        height: 800,
        alt: 'Wild Wolves CDMX Basketball Academy',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
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
