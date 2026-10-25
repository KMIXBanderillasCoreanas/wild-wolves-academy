// lib/crm/whatsappStorage.ts
import { supabase } from "@/lib/supabaseClient";

export interface WhatsAppMessageRecord {
  id: string;
  contact_phone: string;
  contact_name: string;
  sender_type: "coach" | "tutor" | "prospect" | "system" | "ai";
  content: string;
  direction: "inbound" | "outbound";
  timestamp: string;
  channel: "whatsapp_cloud" | "whatsapp_openwa" | "whatsapp_direct";
  metadata?: {
    athlete_name?: string;
    student_id?: string;
    status?: "sent" | "delivered" | "received" | "read";
    amount?: number;
    concept?: string;
  };
}

const LOCAL_STORAGE_KEY = "ww_crm_whatsapp_conversations";
const STORAGE_BUCKET = "workout-proofs";
const STORAGE_FILE_PATH = "crm_whatsapp_hub.json";

// Generar ID único
export const generateMsgUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// 1. Obtener todos los mensajes almacenados
export async function getStoredWhatsAppMessages(): Promise<WhatsAppMessageRecord[]> {
  let localMsgs: WhatsAppMessageRecord[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) localMsgs = JSON.parse(raw);
    } catch (e) {
      console.warn("Fallo leyendo WhatsApp local:", e);
    }
  }

  // Si estamos en cliente, intentar traer snapshot de nube
  try {
    const { data: file, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(STORAGE_FILE_PATH);

    if (file && !error) {
      const text = await file.text();
      if (text && text.trim()) {
        const cloudMsgs: WhatsAppMessageRecord[] = JSON.parse(text);
        // Unificar evitando duplicados por ID
        const map = new Map<string, WhatsAppMessageRecord>();
        localMsgs.forEach((m) => map.set(m.id, m));
        cloudMsgs.forEach((m) => map.set(m.id, m));
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        }
        return merged;
      }
    }
  } catch (err) {
    // Fallback silencioso a local
  }

  return localMsgs;
}

// 2. Guardar un nuevo mensaje (Entrante o Saliente)
export async function saveWhatsAppMessage(
  msg: Omit<WhatsAppMessageRecord, "id" | "timestamp"> & { id?: string; timestamp?: string }
): Promise<WhatsAppMessageRecord> {
  const newMsg: WhatsAppMessageRecord = {
    id: msg.id || generateMsgUUID(),
    timestamp: msg.timestamp || new Date().toISOString(),
    contact_phone: msg.contact_phone.replace(/\D/g, ""),
    contact_name: msg.contact_name,
    sender_type: msg.sender_type,
    content: msg.content,
    direction: msg.direction,
    channel: msg.channel || "whatsapp_direct",
    metadata: msg.metadata || {},
  };

  // 1. Actualizar LocalStorage
  let allMsgs: WhatsAppMessageRecord[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) allMsgs = JSON.parse(raw);
      allMsgs.push(newMsg);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allMsgs));
      window.dispatchEvent(
        new CustomEvent("crm_whatsapp_updated", { detail: { newMsg, count: allMsgs.length } })
      );
    } catch (e) {
      console.warn("Fallo guardando WhatsApp localmente:", e);
    }
  }

  // 2. Persistir en Supabase Storage de manera asíncrona
  try {
    const serialized = JSON.stringify(allMsgs, null, 2);
    const blob = new Blob([serialized], { type: "application/json" });
    await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(STORAGE_FILE_PATH, blob, { upsert: true });
  } catch (err) {
    console.warn("Aviso guardando snapshot WhatsApp en nube:", err);
  }

  return newMsg;
}
