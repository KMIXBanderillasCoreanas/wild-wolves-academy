import { NextResponse } from "next/server";
import { saveWhatsAppMessage } from "@/lib/crm/whatsappStorage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Verificación del Webhook (Meta Developers / WhatsApp Cloud API)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "wildwolves_secure_webhook_token_2026";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Token de verificación de webhook inválido" }, { status: 403 });
}

// Recepción y Almacenamiento en CRM de todos los WhatsApp entrantes
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. WhatsApp Cloud API (Meta Oficial)
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messageData = value?.messages?.[0];

    // 2. Formato Pasarela OpenWA / Baileys
    const isOpenWA = Boolean(
      body.event === "message.received" ||
      body.event === "message" ||
      body.event === "onMessage" ||
      (body.sessionId && (body.data?.body || body.message?.body || body.data?.text)) ||
      body.chatId
    );

    // 3. Formato Pasarela QR (Evolution API / Z-API)
    const qrData = body.data;
    const isQrGateway = Boolean(qrData?.key);

    let senderPhone = "";
    let senderMessage = "";
    let senderName = "Tutor / Contacto WhatsApp";
    let channel: "whatsapp_cloud" | "whatsapp_openwa" | "whatsapp_direct" = "whatsapp_cloud";

    if (isOpenWA) {
      const openwaMsg = body.data || body.message || body;
      if (openwaMsg.fromMe || body.fromMe) {
        return NextResponse.json({ success: true, status: "ignored_own_openwa_message" }, { status: 200 });
      }
      const rawFrom = openwaMsg.from || openwaMsg.chatId || openwaMsg.sender?.id || body.chatId || "";
      senderPhone = String(rawFrom).replace(/@.*$/, "").replace(/^521/, "52");
      senderMessage = String(openwaMsg.body || openwaMsg.text || openwaMsg.content || "").trim();
      senderName = openwaMsg.sender?.pushname || openwaMsg.sender?.name || openwaMsg.pushName || "Tutor WhatsApp";
      channel = "whatsapp_openwa";
    } else if (messageData) {
      senderPhone = messageData.from || "";
      senderMessage = messageData.text?.body || "";
      senderName = value?.contacts?.[0]?.profile?.name || "Tutor WhatsApp";
      channel = "whatsapp_cloud";
    } else if (isQrGateway) {
      if (qrData?.key?.fromMe) {
        return NextResponse.json({ success: true, status: "ignored_own_qr_message" }, { status: 200 });
      }
      const remoteJid = qrData?.key?.remoteJid || "";
      senderPhone = remoteJid.replace(/@.*$/, "").replace(/^521/, "52");
      senderMessage = qrData?.message?.conversation || qrData?.message?.extendedTextMessage?.text || "";
      senderName = qrData?.pushName || "Tutor WhatsApp";
      channel = "whatsapp_openwa";
    } else if (body.phone && body.message) {
      // Inserción directa / simulada desde el CRM Web
      senderPhone = body.phone;
      senderMessage = body.message;
      senderName = body.name || "Contacto";
      channel = "whatsapp_direct";
    }

    if (!senderMessage || !senderPhone) {
      return NextResponse.json({ success: true, status: "no_message_to_process" }, { status: 200 });
    }

    // Almacenar el mensaje en el historial unificado del CRM
    const savedRecord = await saveWhatsAppMessage({
      contact_phone: senderPhone,
      contact_name: senderName,
      sender_type: "tutor",
      content: senderMessage,
      direction: "inbound",
      channel,
      metadata: {
        status: "received",
      },
    });

    console.log(`[CRM WhatsApp Inbound] Mensaje recibido de ${senderName} (${senderPhone}):`, senderMessage);

    // SISTEMA NERVIOSO: Despertar dispositivos con Alerta Push en segundo plano (incluso con app cerrada)
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      fetch(`${siteUrl}/api/push/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `💬 WhatsApp: ${senderName}`,
          body: senderMessage.length > 90 ? `${senderMessage.slice(0, 90)}...` : senderMessage,
          url: "/master-bunker-hq?tab=whatsapp",
          tag: `wa_${senderPhone}`,
        }),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({
      success: true,
      message_id: savedRecord.id,
      status: "received_and_stored_in_crm",
    });
  } catch (error: any) {
    console.error("Error en webhook de WhatsApp:", error);
    return NextResponse.json(
      { error: error?.message || "Fallo procesando WhatsApp entrante." },
      { status: 500 }
    );
  }
}
