import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-3xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-3xl font-black text-[#f66018] shadow-lg mb-6">
        🐺
      </div>
      <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-widest px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-3">
        Error 404 • Fuera de la Cancha
      </span>
      <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mb-2">
        Jugada no Encontrada
      </h1>
      <p className="text-sm text-zinc-400 max-w-md mb-8">
        La ruta táctica que buscas no existe en el sistema de Wild Wolves Basketball Academy CDMX o ha sido reubicada.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-orange-950/40"
      >
        Regresar al Tablero Principal
      </Link>
    </div>
  );
}
