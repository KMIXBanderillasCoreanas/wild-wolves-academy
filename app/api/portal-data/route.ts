import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "guardian";
    const email = searchParams.get("email")?.toLowerCase().trim() || "";
    const studentQuery = searchParams.get("student")?.trim() || "";

    const isOwner = email === "wildwolvescdmx@gmail.com";

    const supabase = getAdminSupabase();

    // 1. Obtener todos los perfiles de la academia
    const { data: allProfiles, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    // 2. Portal de Tutor (Guardian)
    if (role === "guardian") {
      let guardianProfile = allProfiles?.find(
        (p) => p.email?.toLowerCase().trim() === email
      );

      // Si es el dueño wildwolvescdmx@gmail.com puede consultar a cualquier tutor o por defecto a Catalina
      if (!guardianProfile && isOwner) {
        guardianProfile = allProfiles?.find((p) => p.role === "guardian");
      }

      // Si no existe perfil de tutor para este correo y no es el dueño, denegar datos ajenos
      if (!guardianProfile) {
        return NextResponse.json({
          error: "Acceso no autorizado. No eres un tutor registrado.",
          unauthorized: true
        }, { status: 403 });
      }

      // Estudiante vinculado:
      // Si es el dueño, se le permite filtrar con el selector; si es un tutor regular, SOLO puede ver a su representado
      let studentProfile = null;
      if (isOwner && studentQuery) {
        studentProfile = allProfiles?.find(p => p.full_name?.toLowerCase().includes(studentQuery.toLowerCase()) || p.id === studentQuery);
      }
      if (!studentProfile && guardianProfile.linked_student_id) {
        studentProfile = allProfiles?.find((p) => p.id === guardianProfile.linked_student_id);
      }
      if (!studentProfile && guardianProfile.linked_student_name) {
        studentProfile = allProfiles?.find((p) =>
          p.full_name?.toLowerCase().includes(guardianProfile.linked_student_name.toLowerCase())
        );
      }

      let attendanceCount = 0;
      let latestTest = null;
      let skillsLog = null;

      if (studentProfile?.id) {
        const { count } = await supabase
          .from("daily_attendance")
          .select("*", { count: "exact", head: true })
          .eq("student_id", studentProfile.id)
          .eq("status", "presente");
        attendanceCount = count || 0;

        const { data: dtr } = await supabase
          .from("detailed_test_records")
          .select("*")
          .eq("student_id", studentProfile.id)
          .order("evaluation_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        latestTest = dtr || null;

        const { data: bsl } = await supabase
          .from("basketball_skills_logs")
          .select("*")
          .eq("student_id", studentProfile.id)
          .order("test_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        skillsLog = bsl || null;
      }

      return NextResponse.json({
        success: true,
        isOwner,
        guardianProfile,
        studentProfile,
        attendanceCount,
        latestTest,
        skillsLog,
        // Solo el dueño recibe la lista de otros alumnos para inspección; un tutor común no ve alumnos ajenos
        availableStudents: isOwner ? allProfiles?.filter((p) => p.role === "student") : []
      });
    }

    // 3. Portal de Alumno (Student)
    if (role === "student") {
      let student = allProfiles?.find((p) => p.email?.toLowerCase().trim() === email);

      // Si es el dueño wildwolvescdmx@gmail.com, se le permite ver al alumno que elija por query o por defecto Toya
      if (isOwner) {
        if (studentQuery) {
          student = allProfiles?.find((p) => p.full_name?.toLowerCase().includes(studentQuery.toLowerCase()) || p.id === studentQuery);
        }
        if (!student) {
          student = allProfiles?.find((p) => p.full_name?.includes("Toya")) || allProfiles?.find((p) => p.role === "student");
        }
      }

      // Si no es el dueño y no se encuentra perfil con su correo
      if (!student) {
        return NextResponse.json({
          error: "Acceso no autorizado. No eres un alumno registrado.",
          unauthorized: true
        }, { status: 403 });
      }

      let attendanceCount = 0;
      let latestTest = null;
      let skillsLog = null;

      if (student?.id) {
        const { count } = await supabase
          .from("daily_attendance")
          .select("*", { count: "exact", head: true })
          .eq("student_id", student.id)
          .eq("status", "presente");
        attendanceCount = count || 0;

        const { data: dtr } = await supabase
          .from("detailed_test_records")
          .select("*")
          .eq("student_id", student.id)
          .order("evaluation_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        latestTest = dtr || null;

        const { data: bsl } = await supabase
          .from("basketball_skills_logs")
          .select("*")
          .eq("student_id", student.id)
          .order("test_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        skillsLog = bsl || null;
      }

      return NextResponse.json({
        success: true,
        isOwner,
        studentProfile: student,
        attendanceCount,
        latestTest,
        skillsLog,
        availableStudents: isOwner ? allProfiles?.filter((p) => p.role === "student") : []
      });
    }

    return NextResponse.json({
      success: true,
      profiles: isOwner ? allProfiles : []
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 });
  }
}
