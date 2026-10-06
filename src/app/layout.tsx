import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'HoopPerformance OS (v0.3.0) | Wild Wolves Basketball Academy',
  description: 'Secure RBAC, Social Bar & Advanced Basketball Analytics Radar Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
