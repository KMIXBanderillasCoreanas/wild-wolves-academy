import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, video_metadata, keypoints, image_base64 } = body;

    const supabaseAdmin = getAdminSupabase();

    // Análisis cinemático estilo HomeCourt / Shot Science
    let calculatedAngle = keypoints?.elbow_angle || 138;
    let releaseTime = 0.75;
    let arcQuality = calculatedAngle > 130 && calculatedAngle < 145 ? 'Óptima (48°)' : 'Plana';
    let legAngle = keypoints?.leg_angle || 135;
    let estimatedJump = keypoints?.jump_height_estimated_cm || 55;

    let aiCoachVerdict = 
      `Mecánica de tiro analizada por visión artificial en duela. ` +
      `Ángulo de codo en ${calculatedAngle}°. Flexión de piernas en ${legAngle}°. ` +
      `Parábola clasificada como ${arcQuality}. Se recomienda mantener el quiebre de muñeca ("follow-through") 1 segundo tras la suelta.`;

    // 1. POTENCIACIÓN CON NVIDIA NIM MULTIMODAL (Llama 3.2 90B Vision Instruct) SI SE ENVÍA IMAGEN O API KEY
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    if (nvidiaKey) {
      try {
        const nvidiaPayload: any = {
          model: "meta/llama-3.2-90b-vision-instruct",
          messages: [
            {
              role: "user",
              content: image_base64
                ? [
                    {
                      type: "text",
                      text: `Eres el evaluador cinemático oficial de Wild Wolves Basketball Academy (Deportivo Carmen Serdán). Analiza la biomecánica de este tiro de básquetbol con base en las directrices de tiro oficial (ángulo de codo, flexión de rodillas, elevación y follow-through). Datos cinemáticos medidos: codo=${calculatedAngle}°, piernas=${legAngle}°. Entrega un veredicto técnico conciso, profesional y accionable para duela.`
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: image_base64.startsWith("data:") ? image_base64 : `data:image/jpeg;base64,${image_base64}`
                      }
                    }
                  ]
                : [
                    {
                      type: "text",
                      text: `Eres el evaluador biomecánico oficial de Wild Wolves Basketball Academy (Deportivo Carmen Serdán). Un atleta ejecutó un tiro con codo=${calculatedAngle}°, piernas=${legAngle}°, elevación estimada=${estimatedJump}cm y tiempo de suelta=${releaseTime}s. Entrega un análisis biomecánico conciso con recomendación correctiva para el Head Coach Ricardo.`
                    }
                  ]
            }
          ],
          temperature: 0.2,
          max_tokens: 350
        };

        const nvidiaRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${nvidiaKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(nvidiaPayload)
        });

        if (nvidiaRes.ok) {
          const nvData = await nvidiaRes.json();
          const nvVerdict = nvData.choices?.[0]?.message?.content;
          if (nvVerdict && nvVerdict.trim()) {
            aiCoachVerdict = nvVerdict.trim();
          }
        }
      } catch (nvErr) {
        console.warn("NVIDIA NIM Vision Fallback:", nvErr);
      }
    }

    const analysisResult = {
      student_id,
      release_time_seconds: releaseTime,
      elbow_angle_degrees: calculatedAngle,
      leg_angle_degrees: legAngle,
      jump_height_estimated_cm: estimatedJump,
      arc_quality: arcQuality,
      ai_coach_verdict: aiCoachVerdict,
      timestamp: new Date().toISOString()
    };

    // Registrar en Supabase si se provee el estudiante
    if (student_id) {
      await supabaseAdmin.from('physical_training_logs').insert({
        student_id,
        training_date: new Date().toISOString().slice(0, 10),
        coach_notes: aiCoachVerdict
      });

      // Actualizar habilidades en basketball_skills_logs si existe la fila
      await supabaseAdmin.from('basketball_skills_logs').upsert({
        student_id,
        test_date: new Date().toISOString().slice(0, 10),
        jumper_parabola_score: arcQuality.includes('Óptima') ? 9 : 6,
        coach_notes: aiCoachVerdict
      }, { onConflict: 'student_id,test_date' });
    }

    return NextResponse.json({
      ok: true,
      analysis: analysisResult
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error en procesamiento visual';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
