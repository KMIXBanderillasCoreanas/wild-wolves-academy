import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "workout-proofs";
const SUBSCRIPTIONS_FILE = "push_subscriptions.json";

// Registrar suscripción push desde el dispositivo del usuario
export async function POST(req: Request) {
  try {
    const subscription = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Suscripción push inválida" }, { status: 400 });
    }

    // 1. Descargar suscripciones existentes de Supabase Storage
    let subscriptions: any[] = [];
    try {
      const { data: file } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(SUBSCRIPTIONS_FILE);

      if (file) {
        const text = await file.text();
        if (text && text.trim()) subscriptions = JSON.parse(text);
      }
    } catch {}

    // 2. Agregar o actualizar sin duplicar por endpoint
    const exists = subscriptions.some((s) => s.endpoint === subscription.endpoint);
    if (!exists) {
      subscriptions.push({
        ...subscription,
        created_at: new Date().toISOString(),
      });

      const serialized = JSON.stringify(subscriptions, null, 2);
      const blob = new Blob([serialized], { type: "application/json" });
      await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(SUBSCRIPTIONS_FILE, blob, { upsert: true });
    }

    return NextResponse.json({
      success: true,
      message: "Dispositivo suscrito exitosamente al sistema de alertas push.",
      total_active_devices: subscriptions.length,
    });
  } catch (error: any) {
    console.error("Error en push/subscribe:", error);
    return NextResponse.json({ error: error?.message || "Error al suscribir" }, { status: 500 });
  }
}
