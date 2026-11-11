import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Familiar y Tutores | Wild Wolves Basketball Academy",
  description: "Acceso exclusivo para padres y tutores: estado de cuenta, reportes oficiales y calendario de entrenamientos.",
};

export default function GuardianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-white">
      {children}
    </div>
  );
}
