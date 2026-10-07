import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Flame, MessageCircle, Instagram, Youtube, Facebook, MapPin, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HoopPerformance OS (v0.3.0) | Academia de Baloncesto Wild Wolves',
  description: 'Sistema Integral de Alto Rendimiento, Biomecánica 360, Sobrecarga Progresiva y Control de Roles para Baloncesto.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0a0e17] text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
        {/* Barra de Navegación Global y Redes Sociales */}
        <Navbar />

        {/* Contenido Principal */}
        <div className="flex-1">
          {children}
        </div>

        {/* Pie de Página Oficial */}
        <footer className="border-t border-[#27272a] bg-[#18181b] py-10 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-zinc-400 font-sans">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Marca */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="font-black text-white text-base tracking-tight">WILD WOLVES ACADEMY</span>
              </div>
              <p className="text-zinc-400 text-xs font-mono leading-relaxed">
                Centro de Alto Rendimiento Baloncestístico. Desarrollo biomecánico, analítica combinada, control de sobrecarga y proyección a ligas colegiales y profesionales.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <a href="https://wa.me/525522427769" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#0a0e17] hover:bg-zinc-800 text-emerald-400 transition-colors border border-[#27272a]" title="WhatsApp: 01 55 2242 7769">
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/wild_wolves_cdmx/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#0a0e17] hover:bg-zinc-800 text-pink-400 transition-colors border border-[#27272a]" title="Instagram @wild_wolves_cdmx">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.youtube.com/@WildWolvesCDMX" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#0a0e17] hover:bg-zinc-800 text-red-500 transition-colors border border-[#27272a]" title="YouTube @WildWolvesCDMX">
                  <Youtube className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61590139041471" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-[#0a0e17] hover:bg-zinc-800 text-blue-500 transition-colors border border-[#27272a]" title="Facebook Wild Wolves CDMX">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Programas Combine */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 font-mono">Programas de Combine</h4>
              <ul className="space-y-2 text-zinc-400 font-mono text-xs">
                <li>• Semillero Sub-15 &amp; Sub-18</li>
                <li>• Pro Combine &amp; Salto Vertical</li>
                <li>• Campamento Élite de Tiro y Drible</li>
                <li>• Preparación para Becas Deportivas</li>
                <li>• Acondicionamiento Físico Personalizado</li>
              </ul>
            </div>

            {/* Col 3: Sede & Contacto */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 font-mono">Sede &amp; Contacto</h4>
              <div className="space-y-2 text-zinc-400 font-mono text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <span>Cancha Principal Wild Wolves Dome, CDMX</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>01 55 2242 7769 (Atención Directa)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>coach@wildwolves.academy</span>
                </div>
              </div>
            </div>

            {/* Col 4: Estado del Sistema */}
            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 font-mono">Estado del Sistema</h4>
              <div className="p-3 bg-[#0a0e17] rounded-xl border border-[#27272a] space-y-1.5 text-[11px] font-mono">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Versión OS:</span>
                  <strong className="text-orange-400">v0.3.0 Stable</strong>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Seguridad RBAC:</span>
                  <span className="text-emerald-400 font-bold">Activo (Strict)</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Datos Médicos:</span>
                  <span className="text-sky-400 font-bold">Confidencial</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-6 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-zinc-500">
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
