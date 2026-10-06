import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Flame, MessageCircle, Instagram, Youtube, Facebook, MapPin, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HoopPerformance OS (v0.3.0) | Wild Wolves Basketball Academy',
  description: 'Sistema Integral de Alto Rendimiento, Biomecánica 360, Sobrecarga Progresiva y RBAC Seguro para Baloncesto.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
        {/* Global Navbar with Branding and Social Bar */}
        <Navbar />

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>

        {/* Global Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="font-black text-white text-base tracking-tight">WILD WOLVES ACADEMY</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Centro de Alto Rendimiento Baloncestístico. Desarrollo biomecánico, analítica combinada, control de sobrecarga y proyección a ligas colegiales y profesionales.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="https://wa.me/5215500000000" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/wildwolvesbasketball" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-pink-400 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://youtube.com/@wildwolvesacademy" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-500 transition-colors">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="https://facebook.com/wildwolvesacademy" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-500 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Programas Combine */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Programas Formativos</h4>
              <ul className="space-y-2 text-slate-400">
                <li>• Semillero Sub-15 &amp; Sub-18</li>
                <li>• Pro Combine &amp; Salto Vertical</li>
                <li>• Campamento Élite de Tiro y Drible</li>
                <li>• Preparación para Becas NCAA / FIBA</li>
                <li>• Acondicionamiento Físico Personalizado</li>
              </ul>
            </div>

            {/* Col 3: Ubicación y Contacto */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Sede &amp; Instalaciones</h4>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>Cancha Principal Wild Wolves Dome, CDMX / Área Metropolitana</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>+52 1 55 0000 0000</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>coach@wildwolves.academy</span>
                </div>
              </div>
            </div>

            {/* Col 4: Seguridad & Certificación */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Arquitectura del Sistema</h4>
              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Versión OS:</span>
                  <strong className="text-orange-400 font-mono">v0.3.0 Stable</strong>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Seguridad RBAC:</span>
                  <span className="text-emerald-400 font-bold">Activo (Strict Guard)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Datos Médicos:</span>
                  <span className="text-sky-400 font-bold">Cifrado Confidencial</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              &copy; {new Date().getFullYear()} Wild Wolves Basketball Academy. Todos los derechos reservados.
            </div>
            <div>
              HoopPerformance OS — Diseñado para atletas con mentalidad de manada.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
