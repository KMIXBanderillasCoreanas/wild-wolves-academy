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
      // 1. Obtener atletas
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: true });

      if (studentsError || !studentsData || studentsData.length === 0) {
        return null;
      }

      // 2. Obtener finanzas
      const { data: financesData } = await supabase.from('finances').select('*');
      
      // 3. Obtener evaluaciones
      const { data: evaluationsData } = await supabase.from('evaluations').select('*').order('created_at', { ascending: false });

      // 4. Obtener sobrecarga progresiva
      const { data: overloadData } = await supabase.from('training_overload').select('*');

      // 5. Obtener asistencias
      const { data: attendanceData } = await supabase.from('attendance').select('*').order('session_date', { ascending: false });

      // Mapear al modelo StudentProfile de la app
      const students: StudentProfile[] = studentsData.map((s: any) => {
        const fin = financesData?.find((f: any) => f.student_id === s.id);
        const evals = evaluationsData?.filter((e: any) => e.student_id === s.id) || [];
        const overload = overloadData?.find((o: any) => o.student_id === s.id);
        const attList = attendanceData?.filter((a: any) => a.student_id === s.id) || [];

        const latestEval = evals[0];
        const previousEval = evals[1];

        const defaultMetrics: BasketballMetrics = {
          freeThrow: 75,
          midRange: 75,
          threePoint: 75,
          verticalJump: 75,
          sprint100m: 75,
          agilityTTest: 75,
        };

        const metricsCurrent: BasketballMetrics = latestEval
          ? {
              freeThrow: latestEval.score_free_throw,
              midRange: latestEval.score_mid_range,
              threePoint: latestEval.score_three_point,
              verticalJump: latestEval.score_vertical_jump,
              sprint100m: latestEval.score_sprint_100m,
              agilityTTest: latestEval.score_agility_t_test,
            }
          : defaultMetrics;

        const metricsPrevious: BasketballMetrics = previousEval
          ? {
              freeThrow: previousEval.score_free_throw,
              midRange: previousEval.score_mid_range,
              threePoint: previousEval.score_three_point,
              verticalJump: previousEval.score_vertical_jump,
              sprint100m: previousEval.score_sprint_100m,
              agilityTTest: previousEval.score_agility_t_test,
            }
          : { ...metricsCurrent };

        const finances: FinancialRecord = fin
          ? {
              costPerClass: Number(fin.cost_per_class) || 50,
              frequency: fin.frequency || 'al_dia',
              status: fin.status || 'al_corriente',
              balanceDue: Number(fin.balance_due) || 0,
              lastPaymentDate: fin.last_payment_date || new Date().toLocaleDateString('es-MX'),
              lastPaymentAmount: Number(fin.last_payment_amount) || 50,
              paymentMethod: fin.payment_method || 'Efectivo',
            }
          : {
              costPerClass: 50,
              frequency: 'al_dia',
              status: 'al_corriente',
              balanceDue: 0,
              lastPaymentDate: new Date().toLocaleDateString('es-MX'),
              lastPaymentAmount: 50,
              paymentMethod: 'Efectivo',
            };

        const attendanceHistory: AttendanceRecord[] = attList.map((a: any) => ({
          id: a.id,
          date: a.session_date,
          dayName: a.day_name,
          present: a.present,
          topic: a.topic || 'Entrenamiento técnico-táctico',
        }));

        return {
          id: s.id,
          fullName: s.full_name,
          email: s.email,
          phone: s.phone,
          parentPhone: s.parent_phone,
          gender: s.gender,
          age: s.age,
          position: s.position,
          role: 'student',
          avatarUrl: s.avatar_url || `https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&auto=format&fit=crop&q=80`,
          stripeStatus: s.stripe_status || 'active',
          trainingDays: s.training_days || ['Lunes', 'Miércoles', 'Viernes'],
          totalDaysTrained: s.total_days_trained || 0,
          attendanceHistory,
          finances,
          metricsCurrent,
          metricsPrevious,
          training: {
            ropeJumpsToday: overload?.rope_jumps_today || 400,
            ropeTarget: overload?.rope_target || 1000,
            joggingMinutesToday: overload?.jogging_minutes_today || 25,
            joggingTarget: overload?.jogging_target || 60,
            schedule: overload?.schedule_json || [],
          },
          evaluations: evals.map((e: any) => ({
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
          })),
          medicalNotes: {
            allergies: s.allergies || 'Ninguna conocida',
            bloodType: s.blood_type || 'O+',
            emergencyContact: s.emergency_contact,
            emergencyPhone: s.emergency_phone,
            medicalConditions: s.medical_conditions || 'Apto para actividad física',
          },
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
