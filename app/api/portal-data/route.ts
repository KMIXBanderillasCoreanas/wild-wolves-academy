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
    const isDemo = searchParams.get("demo") === "true";

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
        (p) => p.email?.toLowerCase().trim() === email || (p.role === "guardian" && !isDemo)
      );

      if (!guardianProfile) {
        guardianProfile = allProfiles?.find((p) => p.role === "guardian") || {
          id: "aa47cff6-71a1-4359-b25a-54e4f44d4ebe",
          full_name: "Catalina Lopez",
          email: "catalinalopez2450@gmail.com",
          role: "guardian",
          relationship_type: "abuelo_abuela",
          linked_student_name: "Toya Fushiguro",
          linked_student_id: "f2df3d4d-7b32-494c-9d24-b0fc27df1fac"
        };
      }

      // Si el tutor eligió ver a un alumno específico por parámetro
      let studentProfile = null;
      if (studentQuery) {
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
      if (!studentProfile) {
        studentProfile = allProfiles?.find((p) => p.full_name?.includes("Toya")) || allProfiles?.find((p) => p.role === "student");
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
        guardianProfile,
        studentProfile,
        attendanceCount,
        latestTest, // Si no tiene pruebas, vendrá null (se verá en blanco de forma limpia)
        skillsLog,
        availableStudents: allProfiles?.filter((p) => p.role === "student")
      });
    }

    // 3. Portal de Alumno (Student)
    if (role === "student") {
      let student = null;
      if (studentQuery) {
        student = allProfiles?.find((p) => p.full_name?.toLowerCase().includes(studentQuery.toLowerCase()) || p.id === studentQuery);
      }
      if (!student && email) {
        student = allProfiles?.find((p) => p.email?.toLowerCase().trim() === email);
      }
      if (!student) {
        student = allProfiles?.find((p) => p.full_name?.includes("Toya")) || allProfiles?.find((p) => p.role === "student");
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
        studentProfile: student,
        attendanceCount,
        latestTest, // Si no tiene pruebas, vendrá null para mostrar en blanco
        skillsLog,
        availableStudents: allProfiles?.filter((p) => p.role === "student")
      });
    }

    return NextResponse.json({
      success: true,
      profiles: allProfiles
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 });
  }
}
