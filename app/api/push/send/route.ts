import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabase } from "@/lib/supabaseClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "workout-proofs";
const SUBSCRIPTIONS_FILE = "push_subscriptions.json";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BGNKhKhZ-77c2TmCwC9TvelCOLDVMK16h2tAHzKxbJOT9pv21yEJwAa84P_ACk4rq-mlve38iA_hEb-w9mkgw28";
const privateKey = process.env.VAPID_PRIVATE_KEY || "Z4perr5gESfXKcUDBZUKSVRcBOp743SAKTu9loSaJG4";
const subject = process.env.VAPID_SUBJECT || "mailto:wildwolvescdmx@gmail.com";

webpush.setVapidDetails(subject, publicKey, privateKey);

export async function POST(req: Request) {
  try {
    const { title, body, url, tag } = await req.json();

    const payload = JSON.stringify({
      title: title || "🐺 Wild Wolves CDMX",
      body: body || "Nuevo mensaje recibido",
      icon: "/logo-official.png",
      badge: "/logo-official.png",
      url: url || "/master-bunker-hq?tab=whatsapp",
      tag: tag || "ww-alert",
    });

    // 1. Obtener todas las suscripciones activas
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

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: "No hay dispositivos suscritos aún.",
      });
    }

    let sentCount = 0;
    const remainingSubs: any[] = [];

    // 2. Disparar a todos los dispositivos (Android, iOS, PC, Mac, Linux)
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        sentCount++;
        remainingSubs.push(sub);
      } catch (err: any) {
        // Si el endpoint expiró o fue revocado por el navegador (404/410), se descarta
        if (err.statusCode !== 404 && err.statusCode !== 410) {
          remainingSubs.push(sub);
        }
      }
    }

    // 3. Actualizar lista limpia si se depuraron suscripciones inactivas
    if (remainingSubs.length !== subscriptions.length) {
      const serialized = JSON.stringify(remainingSubs, null, 2);
      const blob = new Blob([serialized], { type: "application/json" });
      await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(SUBSCRIPTIONS_FILE, blob, { upsert: true });
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total_devices: remainingSubs.length,
    });
  } catch (error: any) {
    console.error("Error en push/send:", error);
    return NextResponse.json({ error: error?.message || "Error al emitir push" }, { status: 500 });
  }
}
