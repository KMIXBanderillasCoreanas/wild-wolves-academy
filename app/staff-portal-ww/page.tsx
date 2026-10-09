"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StaffPortalPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirección inmediata al login oficial de Coaches (sin solicitud de PIN)
    router.replace("/login?role=coach");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs text-zinc-400 font-mono">Redirigiendo al portal oficial de Coaches...</p>
    </div>
  );
}
