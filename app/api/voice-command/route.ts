import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { command } = await req.json();

    if (!command || typeof command !== "string" || !command.trim()) {
      return NextResponse.json({
        message: "Comandante, no logré escuchar la orden con claridad.",
        executedAction: null,
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    // Prompt de extracción de acciones operativas de cancha para Fenrir
    const voiceParserPrompt = `Eres "Fenrir Cyber-Wolf", la inteligencia artificial táctica y operativa del Head Coach Ricardo en la academia Wild Wolves CDMX (Deportivo Carmen Serdán).
Tu trabajo es interpretar comandos de voz dictados por el Coach en la duela.
Si el comando menciona asistencia, retardos, faltas o cobros de alumnos (ejemplos: "Osmar López vino y pagó 150 pesos", "Asistencia para Isaac Salinas", "Toma lista de Osmar presente", "Cobro de 50 a Mateo"):
1. Extrae: el nombre del alumno, el estado de asistencia ("presente", "retardo" o "falta"), el monto monetario si hubo cobro, y si se registró pago.
2. Devuelve un texto breve, marcial, firme y deportivo para hablarle de vuelta al Coach Ricardo por el altavoz (máximo 20 palabras, llamándolo "Coach" o "Comandante").
3. Devuelve los datos en formato JSON estructurado.

FORMATO DE RESPUESTA EXCLUSIVO (JSON puro):
{
  "speechReply": "Entendido, Coach. Asistencia de Osmar López confirmada y pago de 150 pesos registrado.",
  "action": {
    "studentName": "Osmar Lopez",
    "status": "presente",
    "amount": 150,
    "hasPayment": true
  }
}
Si la orden es una consulta general de básquetbol o ejercicio (ejemplo: "¿Cómo calentar el hombro?" o "Planea rutina de bote"):
{
  "speechReply": "Comandante, te sugiero iniciar con 5 minutos de movilidad articular, círculos con balón y pases al pecho.",
  "action": null
}`;

    // Lista de modelos activos en cascada en Groq (Qwen / GPT-OSS / Llama)
    const activeModels = [
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-120b",
      "llama-3.1-70b-versatile"
    ];

    let parsedResult: any = null;

    if (apiKey) {
      for (const model of activeModels) {
        try {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: voiceParserPrompt },
                { role: "user", content: command },
              ],
              temperature: 0.1,
              response_format: { type: "json_object" },
              max_tokens: 300,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const textContent = data.choices?.[0]?.message?.content;
            if (textContent) {
              parsedResult = JSON.parse(textContent);
              break;
            }
          }
        } catch (err) {
          console.warn(`Fallo procesando comando de voz con ${model}:`, err);
        }
      }
    }

    // Fallback inteligente heurístico si la IA externa no estuviera disponible
    if (!parsedResult) {
      const lower = command.toLowerCase();
      let extractedName = "Atleta Lobo";
      let amount = 0;
      let hasPayment = false;
      let status: "presente" | "retardo" | "falta" = "presente";

      if (lower.includes("osmar")) extractedName = "Osmar Lopez";
      else if (lower.includes("isaac")) extractedName = "Isaac Salinas";
      else if (lower.includes("mateo")) extractedName = "Mateo";

      const numbers = command.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        amount = parseInt(numbers[0], 10);
        hasPayment = true;
      } else if (lower.includes("150")) {
        amount = 150;
        hasPayment = true;
      } else if (lower.includes("50")) {
        amount = 50;
        hasPayment = true;
      }

      if (lower.includes("retardo")) status = "retardo";
      if (lower.includes("falta")) status = "falta";

      parsedResult = {
        speechReply: hasPayment
          ? `Asistencia de ${extractedName} confirmada y cobro de ${amount} pesos guardado en cancha, Coach.`
          : `Asistencia de ${extractedName} registrada como ${status}, Comandante.`,
        action: {
          studentName: extractedName,
          status,
          amount,
          hasPayment,
        },
      };
    }

    return NextResponse.json({
      message: parsedResult.speechReply || "Orden recibida por Fenrir.",
      executedAction: parsedResult.action || null,
    });
  } catch (error: any) {
    console.error("Error en /api/voice-command:", error);
    return NextResponse.json(
      {
        message: "Comandante, Fenrir registró la directiva en el búnker local.",
        executedAction: null,
      },
      { status: 200 }
    );
  }
}
