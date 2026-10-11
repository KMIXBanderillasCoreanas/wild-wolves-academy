import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dgzuttxfmrfcgsceczql.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_SYyJnZPqfIHN5cYH3I-5YQ_foTlKdNa",
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.delete({ name, ...options });
            } catch {}
          },
        },
      }
    );

    // 1. BLINDAJE DE SEGURIDAD ESTRICTO: SOLO EL HEAD COACH RICARDO
    const { data: { user } } = await supabase.auth.getUser();
    const roleCookie = cookieStore.get("user_role")?.value;
    const emailCookie = cookieStore.get("user_email")?.value;

    const effectiveEmail = (user?.email || emailCookie || "").toLowerCase().trim();
    const isMasterAuthorized = 
      effectiveEmail === "wildwolvescdmx@gmail.com" ||
      effectiveEmail === "ricardo@wildwolves.mx" ||
      effectiveEmail === "director@wildwolves.mx" ||
      roleCookie === "superadmin";

    if (!isMasterAuthorized) {
      return NextResponse.json(
        { error: "Acceso denegado. Lobo Central IA es exclusivo para el Head Coach Ricardo." },
        { status: 403 }
      );
    }

    const { messages, contextData, customContext } = await req.json();

    const groqApiKey = process.env.GROQ_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!groqApiKey && !geminiApiKey) {
      return NextResponse.json({
        reply: "🐺 *Lobo Central IA en espera:*\n\nCoach Ricardo, ingresa tu clave `GROQ_API_KEY` en tus variables de entorno para activar la respuesta LPU en tiempo real."
      });
    }

    // 2. CONTEXTO SUPREMO DEL SISTEMA WILD WOLVES CDMX
    const systemPrompt = `Eres "Lobo Central IA", el motor de inteligencia analítica del Head Coach Ricardo en la academia Wild Wolves CDMX (Deportivo Carmen Serdán).
Tienes control total sobre el universo de la academia:
- Cancha y Asistencias: Evaluar asistencia matutina/vespertina/dominical (16:00 a 18:00 hrs) y pre-fichas en cancha.
- Finanzas y Cobros: Control de caja en efectivo ($50, $150, $600 MXN) y adeudos retroactivos al concluir la clase.
- Biomecánica: Combine deportivo, 5 spots de triples perimetrales, lagartijas, saltos y radar 360°.
- Casa: Validación de rutinas, tiempos de plancha y frecuencia cardíaca biológica (BPM).
- Comunicados: Redactar mensajes para WhatsApp dirigidos a tutores y alumnos con tono enérgico, claro y profesional con emojis (*negritas*, 🐺🏀🔥).
Datos del contexto actual: ${JSON.stringify(contextData || customContext || {})}`;

    // 3. LLAMADA DE ULTRA-VELOCIDAD AL API DE GROQ (LPU LLAMA 3.3 70B)
    if (groqApiKey) {
      try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              ...(messages || []).map((m: any) => ({
                role: m.role === "assistant" || m.role === "model" ? "assistant" : "user",
                content: m.content,
              })),
            ],
            temperature: 0.3,
            max_tokens: 1024,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const reply = data.choices?.[0]?.message?.content || "Lobo Central sin respuesta.";
          return NextResponse.json({ reply });
        } else {
          const errText = await groqResponse.text();
          console.warn("Groq API error fallback notice:", errText);
        }
      } catch (groqErr) {
        console.warn("Groq request failure, checking fallback:", groqErr);
      }
    }

    // 4. FALLBACK SECUNDARIO A GEMINI
    if (geminiApiKey && geminiApiKey !== "tu_clave_secreta_aqui") {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            ...(messages || []).map((m: any) => ({
              role: m.role === "assistant" || m.role === "model" ? "model" : "user",
              parts: [{ text: m.content || "" }],
            })),
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Lobo Central en espera. No se pudo generar la respuesta.";
        return NextResponse.json({ reply: replyText });
      }
    }

    return NextResponse.json({
      reply: "⚠️ No se pudo obtener respuesta del motor de IA. Verifica tu GROQ_API_KEY en Vercel."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
