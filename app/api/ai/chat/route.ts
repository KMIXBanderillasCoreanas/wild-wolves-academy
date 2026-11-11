import { NextResponse } from 'next/server';
import { LOBO_BOT_SYSTEM_PROMPT } from '@/lib/ai/system-prompts';
import { evaluarSeguridadPeticion } from '@/lib/lobo-centinela-guard';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const body = await req.json();

    // Blindaje de Seguridad Lobo Centinela contra Prompt Injection y Exploits
    const sec = await evaluarSeguridadPeticion({
      ipAddress: ip,
      actionTarget: "ai_chat",
      payloadContent: body
    });
    if (!sec.seguro) {
      return NextResponse.json({ error: sec.razon, code: sec.codigoBloqueo }, { status: 403 });
    }

    const { messages, userRole = 'student' } = body;

    const rawKey = process.env.GROQ_API_KEY || '';
    const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();

    // Inyectar LOBO_BOT_SYSTEM_PROMPT como primer mensaje de rol 'system'
    const formattedMessages = [
      {
        role: 'system',
        content: LOBO_BOT_SYSTEM_PROMPT
      },
      ...(messages || []).map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
        content: m.content || ''
      }))
    ];

    const activeModels = [
      'llama-3.3-70b-versatile',
      'qwen/qwen3.8-27b',
      'openai/gpt-oss-120b',
      'llama-3.1-8b-instant'
    ];

    let reply = '';

    if (apiKey) {
      for (const model of activeModels) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model,
              messages: formattedMessages,
              temperature: 0.5,
              max_tokens: 800
            })
          });

          if (res.ok) {
            const data = await res.json();
            reply = data.choices?.[0]?.message?.content || '';
            if (reply) break;
          }
        } catch (err) {
          console.warn(`Fallback de modelo ${model} falló, intentando siguiente...`, err);
        }
      }
    }

    if (!reply) {
      // Respuesta de contingencia si no hay API Key o falla de red
      reply =
        '🐺 **LoboBot en guardia:** Recuerda mantener tu hidratación constante con agua natural o electrolitos caseros, y enfocar tus entrenamientos en los fundamentos del tiro y la fuerza isométrica en la duela del Deportivo Carmen Serdán.';
    }

    return NextResponse.json({
      success: true,
      reply,
      agent: 'LoboBot',
      role: userRole
    });
  } catch (error: any) {
    console.error('Error en /api/ai/chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Error interno al procesar consulta con LoboBot'
      },
      { status: 500 }
    );
  }
}
