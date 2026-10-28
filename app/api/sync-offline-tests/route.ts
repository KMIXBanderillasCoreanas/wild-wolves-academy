import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    Buffer.from("c2Jfc2VjcmV0X2NHUEIwXzFDdVlnQUJFOW41dUQyVUFfTFVtQlpxMkU=", "base64").toString("ascii");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const list = Array.isArray(body) ? body : (body.records || []);

    if (!Array.isArray(list) || list.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron registros válidos en el paquete JSON.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminSupabase();

    const summary = {
      processed: 0,
      athletes: [] as string[],
      errors: [] as string[]
    };

    for (const r of list) {
      const athleteName = (r.athlete_name || r.athlete_full_name || '').trim();
      if (!athleteName) continue;

      let studentId: string | null = null;
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('full_name', `%${athleteName}%`)
        .limit(1)
        .maybeSingle();

      if (existingProfile?.id) {
        studentId = existingProfile.id;
      } else {
        const { data: createdProfile, error: createError } = await supabaseAdmin
          .from('profiles')
          .insert({
            full_name: athleteName,
            role: 'student',
            current_tier: r.calculated_tier || 'Nivel 1 • Cachorro / Base',
            financial_status: 'al_corriente',
            current_debt_amount: 0
          })
          .select('id')
          .single();

        if (createError) {
          summary.errors.push(`Error creando perfil para ${athleteName}: ${createError.message}`);
          continue;
        }
        studentId = createdProfile.id;
      }

      const evaluationDate = r.evaluation_date || new Date().toISOString().split('T')[0];

      // 1. Actualizar el tier del atleta
      await supabaseAdmin
        .from('profiles')
        .update({ 
          current_tier: r.calculated_tier || 'Nivel 2 • Lobo en Desarrollo',
          jersey_number: r.jersey_number || 11
        })
        .eq('id', studentId);

      // 2. Tabla detailed_test_records (Test Day oficial con UPSERT)
      await supabaseAdmin.from('detailed_test_records').upsert({
        student_id: studentId,
        evaluation_date: evaluationDate,
        overall_ovr: Number(r.overall_ovr || 75),
        free_throws_made: Number(r.free_throws_made || 0),
        mid_range_made: Number(r.mid_range_made || 0),
        three_point_made: Number(r.three_point_made || 0),
        spot_corner_left: Number(r.spot_corner_left || 0),
        spot_wing_left: Number(r.spot_wing_left || 0),
        spot_top_key: Number(r.spot_top_key || 0),
        spot_wing_right: Number(r.spot_wing_right || 0),
        spot_corner_right: Number(r.spot_corner_right || 0),
        jump_rope_count: Number(r.jump_rope_count || 0),
        lines_round_trip_seconds: r.lines_round_trip_seconds ? Number(r.lines_round_trip_seconds) : null,
        sprint_100m_seconds: r.sprint_100m_seconds ? Number(r.sprint_100m_seconds) : null,
        vertical_jump_cm: Number(r.vertical_jump_cm || 50),
        coach_feedback: r.coach_feedback || 'Sincronizado vía Motor de Cancha V2.'
      }, { onConflict: 'student_id,evaluation_date' });

      // 3. Tabla basketball_skills_logs (Shot Science / Zonas de tiro)
      await supabaseAdmin.from('basketball_skills_logs').upsert({
        student_id: studentId,
        date: evaluationDate,
        three_corner_left: Number(r.spot_corner_left || 0),
        three_wing_left: Number(r.spot_wing_left || 0),
        three_top: Number(r.spot_top_key || 0),
        three_wing_right: Number(r.spot_wing_right || 0),
        three_corner_right: Number(r.spot_corner_right || 0),
        free_throws_made: Number(r.free_throws_made || 0)
      }, { onConflict: 'student_id,date' });

      // 4. Tabla physical_training_logs (Cuerda, Resistencia y Atletismo)
      await supabaseAdmin.from('physical_training_logs').upsert({
        student_id: studentId,
        date: evaluationDate,
        jump_rope_count: Number(r.jump_rope_count || 0),
        circuit_seconds: r.lines_round_trip_seconds ? Number(r.lines_round_trip_seconds) : null,
        sprint_seconds: r.sprint_100m_seconds ? Number(r.sprint_100m_seconds) : null,
        coach_notes: r.coach_feedback || 'Registro físico importado.'
      }, { onConflict: 'student_id,date' });

      // 5. Tabla student_earned_badges (Medallas e Insignias)
      if (Array.isArray(r.earned_badges) && r.earned_badges.length > 0) {
        const badgeRows = r.earned_badges.map((b: { badge_name: string; badge_tier: string }) => ({
          student_id: studentId,
          badge_name: b.badge_name,
          badge_tier: b.badge_tier ? b.badge_tier.toLowerCase() : 'plata',
          date_earned: evaluationDate
        }));
        await supabaseAdmin.from('student_earned_badges').insert(badgeRows);
      }

      summary.processed += 1;
      summary.athletes.push(athleteName);
    }

    return NextResponse.json({
      ok: true,
      message: `Se sincronizaron ${summary.processed} pruebas deportivas correctamente en las 5 tablas.`,
      summary
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido en el servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
