"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  Sparkles,
  User,
  Users,
  Search,
  CheckCheck,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  DollarSign,
  Calendar
} from "lucide-react";
import {
  getStoredWhatsAppMessages,
  saveWhatsAppMessage,
  WhatsAppMessageRecord
} from "@/lib/crm/whatsappStorage";

interface ContactItem {
  phone: string;
  name: string;
  athleteName?: string;
  role: "tutor" | "prospect" | "student";
  lastMessage?: string;
  lastTime?: string;
}

export default function WhatsAppHubCRM() {
  const [messages, setMessages] = useState<WhatsAppMessageRecord[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [aiDrafting, setAiDrafting] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const allMsgs = await getStoredWhatsAppMessages();
      setMessages(allMsgs);

      // Extraer directorio de contactos a partir de los mensajes y perfiles conocidos
      const contactMap = new Map<string, ContactItem>();

      // Contactos base conocidos de la academia
      contactMap.set("525522427769", {
        phone: "525522427769",
        name: "Catalina López",
        athleteName: "Osmar López",
        role: "tutor",
        lastMessage: "Confirmado el entrenamiento del fin de semana.",
        lastTime: "18:20",
      });

      contactMap.set("525512345678", {
        phone: "525512345678",
        name: "Familiar de Isaac",
        athleteName: "Isaac",
        role: "student",
        lastMessage: "Pago de $50 registrado en cancha.",
        lastTime: "09:30",
      });

      contactMap.set("525587654321", {
        phone: "525587654321",
        name: "Familiar de Jesús",
        athleteName: "Jesús",
        role: "student",
        lastMessage: "Sesión matutina completada.",
        lastTime: "09:30",
      });

      // Cruce con mensajes almacenados
      allMsgs.forEach((m) => {
        const cleanP = m.contact_phone;
        const existing: ContactItem = contactMap.get(cleanP) || {
          phone: cleanP,
          name: m.contact_name || "Contacto",
          athleteName: m.metadata?.athlete_name || "",
          role: (m.sender_type === "tutor" ? "tutor" : "student") as any,
          lastMessage: "",
          lastTime: "",
        };
        existing.lastMessage = m.content;
        existing.lastTime = new Date(m.timestamp).toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        });
        contactMap.set(cleanP, existing);
      });

      const list = Array.from(contactMap.values());
      setContacts(list);

      if (!selectedPhone && list.length > 0) {
        setSelectedPhone(list[0].phone);
      }
    } catch (err) {
      console.warn("Aviso cargando CRM WhatsApp:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("crm_whatsapp_updated", handleUpdate);
    return () => window.removeEventListener("crm_whatsapp_updated", handleUpdate);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedPhone]);

  const selectedContact = contacts.find((c) => c.phone === selectedPhone) || contacts[0];
  const activeChatMessages = messages.filter((m) => m.contact_phone === selectedPhone);

  // Enviar mensaje
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch("/api/whatsapp/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPhone: selectedContact.phone,
          recipientName: selectedContact.name,
          messageText: textToSend,
          athleteName: selectedContact.athleteName,
        }),
      });

      const data = await res.json();
      
      // Intentar protocolo nativo whatsapp:// sin abrir pestañas del navegador web
      const cleanPhone = selectedContact.phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;
      const nativeWaUri = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(textToSend)}`;
      
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = nativeWaUri;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);

      await loadData();
    } catch (err: any) {
      alert("Error al enviar mensaje: " + err.message);
    } finally {
      setSending(false);
    }
  };

  // Generador de Respuestas con IA Especializada por Rol
  const generateAiReply = async (type: "recordatorio_pago" | "bienvenida_prospecto" | "confirmacion_cancha") => {
    if (!selectedContact) return;
    setAiDrafting(true);

    let prompt = "";
    if (type === "recordatorio_pago") {
      prompt = `Redacta un mensaje de WhatsApp para ${selectedContact.name} (Tutor de ${selectedContact.athleteName || "el alumno"}) recordando amablemente el abono o cuota de entrenamiento ($50 por clase o mensualidad) en Wild Wolves CDMX.`;
    } else if (type === "bienvenida_prospecto") {
      prompt = `Redacta un mensaje de bienvenida a Wild Wolves CDMX para ${selectedContact.name}. Menciona que su primera clase muestra en el Deportivo Carmen Serdán es GRATIS ($0.00).`;
    } else {
      prompt = `Redacta una confirmación de entrenamiento para ${selectedContact.name} en el Deportivo Carmen Serdán (Domingo 16:00 a 18:00 hrs). Pide llevar hidratación y calzado amarrado.`;
    }

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          userRole: "crm_whatsapp",
          customContext: {
            mode: "whatsapp",
            contactName: selectedContact.name,
            athleteName: selectedContact.athleteName,
            phone: selectedContact.phone,
          },
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setInputText(data.reply);
      }
    } catch {
      setInputText("¡Hola! Te contactamos de Wild Wolves CDMX para confirmar el entrenamiento en el Deportivo Carmen Serdán.");
    } finally {
      setAiDrafting(false);
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.athleteName && c.athleteName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full bg-[#0d1017] border-2 border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-white space-y-4">
      {/* Cabecera del Centro Omnicanal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black shadow-lg shadow-emerald-950/40">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-white">
                Centro de Comunicación WhatsApp • CRM
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                EN VIVO
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Estilo Audenti: Envía y recibe mensajes de WhatsApp centralizados en la base de datos de la academia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
            title="Refrescar mensajes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid del Chat: Lista Izquierda + Conversación Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[620px] bg-[#07090e] border border-zinc-800/80 rounded-2xl overflow-hidden">
        {/* PANEL IZQUIERDO: CONTACTOS / BANDEJA */}
        <div className="lg:col-span-4 border-r border-zinc-800 flex flex-col h-full bg-[#0a0d14]">
          <div className="p-3 border-b border-zinc-800">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar tutor, alumno o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#121724] border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50">
            {filteredContacts.map((c) => {
              const isSelected = c.phone === selectedPhone;
              return (
                <div
                  key={c.phone}
                  onClick={() => setSelectedPhone(c.phone)}
                  className={`p-3.5 transition cursor-pointer flex items-start gap-3 ${
                    isSelected ? "bg-emerald-950/30 border-l-4 border-emerald-500" : "hover:bg-[#121724]/60"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{c.name}</h4>
                      <span className="text-[10px] font-mono text-zinc-500">{c.lastTime || ""}</span>
                    </div>
                    {c.athleteName && (
                      <span className="text-[10px] text-amber-400 font-mono block">
                        Atleta: {c.athleteName}
                      </span>
                    )}
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {c.lastMessage || "Sin mensajes registrados"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL DERECHO: CONVERSACIÓN ACTIVA */}
        <div className="lg:col-span-8 flex flex-col h-full bg-[#0e121b]">
          {selectedContact ? (
            <>
              {/* Header de la conversación */}
              <div className="p-3.5 bg-[#121724] border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs">
                    WA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{selectedContact.name}</h4>
                      <span className="text-[10px] font-mono text-emerald-400">+{selectedContact.phone}</span>
                    </div>
                    {selectedContact.athleteName && (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Representa a: <b className="text-zinc-200">{selectedContact.athleteName}</b>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${selectedContact.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center gap-1.5"
                  >
                    <span>Abrir en WhatsApp</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Botones de Acción Rápida con IA Especializada */}
              <div className="px-4 py-2 bg-[#090c12] border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
                <span className="text-zinc-500 font-mono text-[10px] uppercase font-bold shrink-0">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1 text-emerald-400" /> Plantillas IA:
                </span>
                <button
                  type="button"
                  onClick={() => generateAiReply("recordatorio_pago")}
                  disabled={aiDrafting}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white shrink-0 transition"
                >
                  💵 Recordar Cuota
                </button>
                <button
                  type="button"
                  onClick={() => generateAiReply("confirmacion_cancha")}
                  disabled={aiDrafting}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white shrink-0 transition"
                >
                  🏀 Confirmar Cancha
                </button>
                <button
                  type="button"
                  onClick={() => generateAiReply("bienvenida_prospecto")}
                  disabled={aiDrafting}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white shrink-0 transition"
                >
                  🐺 Bienvenida ($0 Gratis)
                </button>
              </div>

              {/* Cuerpo del Chat / Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0a0d14]/70">
                {activeChatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                    <MessageSquare className="w-10 h-10 mb-2 text-zinc-600" />
                    <p className="text-xs font-bold text-zinc-400 uppercase">Sin mensajes previos con este contacto</p>
                    <p className="text-[11px] text-zinc-500 max-w-xs mt-1">
                      Escribe un mensaje abajo para iniciar la conversación. Quedará guardado en el CRM y se enviará al WhatsApp del tutor.
                    </p>
                  </div>
                ) : (
                  activeChatMessages.map((msg) => {
                    const isOutbound = msg.direction === "outbound" || msg.sender_type === "coach";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                            isOutbound
                              ? "bg-emerald-900/60 border border-emerald-500/40 text-emerald-100 rounded-br-sm"
                              : "bg-[#161c2b] border border-zinc-800 text-zinc-200 rounded-bl-sm"
                          }`}
                        >
                          <span className="text-[10px] font-mono font-bold block mb-1 opacity-70">
                            {isOutbound ? "Coach Ricardo (Wild Wolves)" : selectedContact.name}
                          </span>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] font-mono text-zinc-400">
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString("es-MX", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isOutbound && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input y Botón de Envío */}
              <form onSubmit={handleSendMessage} className="p-3 bg-[#121724] border-t border-zinc-800">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Escribir WhatsApp para ${selectedContact.name}...`}
                    className="flex-1 bg-[#0a0d14] border border-zinc-700 rounded-2xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-sans"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="h-11 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <span>{sending ? "Enviando..." : "Enviar"}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              Selecciona un contacto para ver el chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
