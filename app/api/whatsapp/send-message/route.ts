import { NextResponse } from "next/server";
import { saveWhatsAppMessage } from "@/lib/crm/whatsappStorage";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipientPhone, recipientName, messageText, athleteName, studentId } = body;

    if (!recipientPhone || !messageText) {
      return NextResponse.json(
        { error: "recipientPhone y messageText son requeridos." },
        { status: 400 }
      );
    }

    const cleanPhone = String(recipientPhone).replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;

    // 1. Intentar envío vía WhatsApp Cloud API si existe token oficial configurado
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    let dispatchedViaCloud = false;

    if (accessToken && phoneNumberId) {
      try {
        const cloudRes = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "text",
            text: { body: messageText },
          }),
        });

        if (cloudRes.ok) {
          dispatchedViaCloud = true;
        } else {
          console.warn("Fallo Cloud API WhatsApp, guardando y generando enlace directo:", await cloudRes.text());
        }
      } catch (err) {
        console.warn("Error contactando Meta Graph API:", err);
      }
    }

    // 2. Guardar el mensaje saliente en el historial del CRM
    const saved = await saveWhatsAppMessage({
      contact_phone: formattedPhone,
      contact_name: recipientName || "Tutor / Atleta",
      sender_type: "coach",
      content: messageText,
      direction: "outbound",
      channel: dispatchedViaCloud ? "whatsapp_cloud" : "whatsapp_direct",
      metadata: {
        athlete_name: athleteName,
        student_id: studentId,
        status: dispatchedViaCloud ? "delivered" : "sent",
      },
    });

    // 3. Generar enlace universal wa.me
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageText)}`;

    return NextResponse.json({
      success: true,
      message_id: saved.id,
      dispatched_via_cloud: dispatchedViaCloud,
      wa_url: waUrl,
    });
  } catch (error: any) {
    console.error("Error en send-message:", error);
    return NextResponse.json(
      { error: error?.message || "Error al despachar mensaje WhatsApp." },
      { status: 500 }
    );
  }
}
