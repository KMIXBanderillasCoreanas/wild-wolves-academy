import { supabase, isSupabaseConfigured } from './supabaseClient';
import { StudentProfile, BasketballMetrics, AttendanceRecord, FinancialRecord } from './types';

/**
 * Servicio de sincronización bidireccional entre HoopPerformance OS y Supabase PostgreSQL
 * Wild Wolves Basketball Academy CDMX
 */
export const SupabaseSync = {
  /**
   * Obtiene la lista completa de atletas desde Supabase con sus finanzas, métricas y asistencias
   */
  async getStudentsFromSupabase(): Promise<StudentProfile[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      // 1. Obtener perfiles de atletas desde la tabla oficial 'profiles'
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name', { ascending: true });

      // Si no hay profiles o falló, intentar fallback a legacy 'students'
      let baseAthletes = profilesData || [];
      if (baseAthletes.length === 0) {
        const { data: legacyData } = await supabase
          .from('students')
          .select('*')
          .order('created_at', { ascending: true });
        if (legacyData && legacyData.length > 0) {
          baseAthletes = legacyData;
        }
      }

      if (baseAthletes.length === 0) {
        return [];
      }

      const cleanStudentsData = baseAthletes.filter((s: any) => {
        const em = (s.email || '').toLowerCase().trim();
        return (
          em !== 'wildwolvescdmx@gmail.com' &&
          em !== 'ricardo@wildwolves.mx' &&
          s.role !== 'superadmin' &&
          s.account_category !== 'guardian_family' &&
          s.user_type !== 'tutor'
        );
      });

      if (cleanStudentsData.length === 0) {
        return [];
      }

      // 2. Obtener evaluaciones detalladas oficiales desde 'detailed_test_records'
      const { data: detailedTestsData } = await supabase
        .from('detailed_test_records')
        .select('*')
        .order('evaluation_date', { ascending: false });

      // 3. Fallback a evaluaciones legacy
      const { data: evaluationsData } = await supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false });

      // 4. Obtener asistencias y finanzas
      const { data: financesData } = await supabase.from('finances').select('*');
      const { data: attendanceData } = await supabase.from('daily_attendance').select('*').order('date', { ascending: false });

      // Mapear al modelo StudentProfile de la app
      const students: StudentProfile[] = cleanStudentsData.map((s: any, idx: number) => {
        const studentId = s.id;
        const studentName = s.full_name || s.fullName || 'Atleta';

        // Empatar pruebas en detailed_test_records por student_id o por nombre
        const matchedDetailed = detailedTestsData?.filter((d: any) => {
          if (d.student_id === studentId) return true;
          const matchName = (d.athlete_full_name || '').toLowerCase();
          return matchName && studentName.toLowerCase().includes(matchName);
        }) || [];

        const legacyEvals = evaluationsData?.filter((e: any) => e.student_id === studentId) || [];

        // Convertir detailed_test_records al formato unificado de evaluaciones del Coach
        const officialEvals = matchedDetailed.map((d: any) => {
          const ft = Number(d.short_range_shots_made ?? d.free_throws_made ?? 7);
          const mid = Number(d.mid_range_shots_made ?? d.mid_range_made ?? 12);
          const three = Number(d.three_point_shots_made ?? d.three_point_made ?? 15);
          const rope = Number(d.jump_rope_count ?? 50);
          const vert = Number(d.vertical_jump_cm ?? 50);
          const ovr = Number(d.overall_ovr ?? 75);

          return {
            id: d.id,
            studentId: studentId,
            date: d.evaluation_date || new Date().toISOString().split('T')[0],
            coachName: 'Coach Ricardo',
            metrics: {
              freeThrow: Math.min(100, Math.round((ft / 10) * 100)),
              midRange: Math.min(100, Math.round((mid / 20) * 100)),
              threePoint: Math.min(100, Math.round((three / 25) * 100)),
              verticalJump: Math.min(100, Math.round((vert / 80) * 100)),
              sprint100m: 85,
              agilityTTest: 88,
            },
            rawStats: {
              freeThrowMade: ft,
              freeThrowTotal: 10,
              midRangePct: Math.round((mid / 20) * 100),
              threePointPct: Math.round((three / 25) * 100),
              verticalJumpCm: vert,
              sprint100mSeconds: 12.5,
              agilityTTestSeconds: 9.1,
            },
            coachNotes: d.coach_feedback || `Nivel evaluado: ${d.athletic_level_assessed || 'Formativo'}. OVR Oficial: ${ovr}.`,
            overallOvr: ovr,
            athleticLevel: d.athletic_level_assessed,
            jumpRopeCount: rope,
          };
        });

        // Combinar evaluaciones oficiales y legacy
        const allEvals = [...officialEvals, ...legacyEvals.map((e: any) => ({
          id: e.id,
          studentId: e.student_id,
          date: e.evaluation_date,
          coachName: e.coach_name || 'Coach Ricardo',
          metrics: {
            freeThrow: e.score_free_throw,
            midRange: e.score_mid_range,
            threePoint: e.score_three_point,
            verticalJump: e.score_vertical_jump,
            sprint100m: e.score_sprint_100m,
            agilityTTest: e.score_agility_t_test,
          },
          rawStats: {
            freeThrowMade: e.raw_free_throw_made,
            freeThrowTotal: e.raw_free_throw_total,
            midRangePct: e.raw_mid_range_pct,
            threePointPct: e.raw_three_point_pct,
            verticalJumpCm: e.raw_vertical_jump_cm,
            sprint100mSeconds: Number(e.raw_sprint_100m_seconds),
            agilityTTestSeconds: Number(e.raw_agility_t_test_seconds),
          },
          coachNotes: e.coach_notes || '',
        }))];

        const latestEval = allEvals[0];
        const previousEval = allEvals[1];

        const defaultMetrics: BasketballMetrics = {
          freeThrow: latestEval?.metrics?.freeThrow || 65,
          midRange: latestEval?.metrics?.midRange || 60,
          threePoint: latestEval?.metrics?.threePoint || 60,
          verticalJump: latestEval?.metrics?.verticalJump || 60,
          sprint100m: 75,
          agilityTTest: 80,
        };

        const metricsCurrent: BasketballMetrics = latestEval ? latestEval.metrics : defaultMetrics;
        const metricsPrevious: BasketballMetrics = previousEval ? previousEval.metrics : { ...metricsCurrent };

        const fin = financesData?.find((f: any) => f.student_id === studentId);
        const debt = Number(s.current_debt_amount ?? fin?.balance_due ?? 0);
        const finStatus = s.financial_status || (debt === 0 ? 'al_corriente' : 'pendiente');

        const finances: FinancialRecord = {
          costPerClass: Number(s.default_class_cost || fin?.cost_per_class || 50),
          frequency: 'al_dia',
          status: finStatus === 'al_corriente' ? 'al_corriente' : 'pendiente',
          balanceDue: debt,
          lastPaymentDate: fin?.last_payment_date || new Date().toLocaleDateString('es-MX'),
          lastPaymentAmount: Number(fin?.last_payment_amount || 50),
          paymentMethod: fin?.payment_method || 'Efectivo',
        };

        const attList = attendanceData?.filter((a: any) => a.student_id === studentId) || [];
        const attendanceHistory: AttendanceRecord[] = attList.map((a: any) => ({
          id: a.id,
          date: a.date || a.session_date,
          dayName: 'Entrenamiento',
          present: a.status === 'presente',
          topic: `Duela Carmen Serdán (${a.status})`,
        }));

        // Asignación de jersey y categoría
        const nLower = studentName.toLowerCase();
        let jersey = s.jersey_number || (nLower.includes('jesús') ? 7 : nLower.includes('isaac') ? 10 : nLower.includes('bruno') ? 11 : nLower.includes('osmar') ? 23 : 11);
        let category = s.category || (nLower.includes('bruno') ? 'U-17 Competitivo' : 'U-15 Formativo');

        return {
          id: studentId,
          fullName: studentName,
          email: s.email || '',
          phone: s.phone_number || s.phone || '55 2242 7769',
          parentPhone: s.emergency_phone || s.parent_phone || '55 2242 7769',
          gender: s.gender || 'M',
          age: s.age || (category.includes('17') ? 16 : 14),
          position: s.position || (nLower.includes('bruno') ? 'Alero (SF)' : nLower.includes('jesús') ? 'Base (PG)' : 'Escolta (SG)'),
          role: 'student',
          avatarUrl: s.avatar_url || '/logo-official.png',
          stripeStatus: 'active',
          trainingDays: s.training_days ? (Array.isArray(s.training_days) ? s.training_days : [s.training_days]) : ['Miércoles', 'Sábado'],
          totalDaysTrained: attendanceHistory.length || 1,
          attendanceHistory,
          finances,
          metricsCurrent,
          metricsPrevious,
          training: {
            ropeJumpsToday: (latestEval as any)?.jumpRopeCount || 500,
            ropeTarget: 1000,
            joggingMinutesToday: 20,
            joggingTarget: 40,
            schedule: [],
          },
          evaluations: allEvals,
          medicalNotes: {
            allergies: s.notes || 'Apto para duela Carmen Serdán',
            bloodType: 'O+',
            emergencyContact: s.parent_name || 'Tutor Registrado',
            emergencyPhone: s.emergency_phone || '55 2242 7769',
            medicalConditions: 'Sin restricciones físicas',
          },
          jerseyNumber: jersey,
          category,
          currentTier: s.current_tier || ((latestEval as any)?.overallOvr ? `OVR ${(latestEval as any).overallOvr}` : '🐺 Lobo Formativo'),
        };
      });

      return students;
    } catch (err) {
      console.error('Error fetching students from Supabase:', err);
      return null;
    }
  },

  /**
   * Registra un pago en Supabase y actualiza el balance de la cuota ($50 MXN)
   */
  async recordPayment(studentId: string, amount: number, method: string) {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { data: fin } = await supabase.from('finances').select('*').eq('student_id', studentId).single();
      if (!fin) return false;

      const currentBalance = Number(fin.balance_due) || 0;
      const newBalance = Math.max(0, currentBalance - amount);
      const newStatus = newBalance === 0 ? 'al_corriente' : 'pendiente';

      const { error } = await supabase.from('finances').update({
        balance_due: newBalance,
        status: newStatus,
        last_payment_date: new Date().toISOString().split('T')[0],
        last_payment_amount: amount,
        payment_method: method,
        updated_at: new Date().toISOString(),
      }).eq('student_id', studentId);

      // Audit inserts en membership_payments y student_payments
      const todayStr = new Date().toISOString().split('T')[0];
      try {
        await supabase.from('membership_payments').insert({
          student_id: studentId,
          amount,
          method,
          payment_date: todayStr,
          status: 'Pagado',
        });
      } catch {}

      try {
        await supabase.from('student_payments').insert({
          student_id: studentId,
          amount,
          method,
          payment_date: todayStr,
          status: 'Pagado',
        });
      } catch {}

      return !error;
    } catch (e) {
      console.error('Error recording payment in Supabase:', e);
      return false;
    }
  },

  /**
   * Guarda una nueva asistencia en Supabase y actualiza saldo si aplica
   */
  async recordAttendance(studentId: string, present: boolean, dayName: string, topic?: string) {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('attendance').upsert({
        student_id: studentId,
        session_date: today,
        day_name: dayName,
        present,
        topic: topic || 'Entrenamiento técnico',
      });

      if (present) {
        // Incrementar días entrenados
        const { data: stu } = await supabase.from('students').select('total_days_trained').eq('id', studentId).single();
        if (stu) {
          await supabase.from('students').update({
            total_days_trained: (stu.total_days_trained || 0) + 1,
          }).eq('id', studentId);
        }
      }

      return true;
    } catch (e) {
      console.error('Error recording attendance in Supabase:', e);
      return false;
    }
  },

  /**
   * Guarda registro de asistencia diaria en cancha (presente, falta, retardo) en daily_attendance
   */
  async recordDailyAttendance(studentId: string, date: string, shift: string, status: string, notes?: string) {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      await supabase.from('daily_attendance').upsert({
        student_id: studentId,
        session_date: date,
        shift,
        status,
        notes: notes || '',
      });
      return true;
    } catch (e) {
      console.warn('Supabase daily_attendance sync:', e);
      return false;
    }
  }
};
