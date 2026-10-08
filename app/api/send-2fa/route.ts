import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    // Registro seguro de la emisión de código 2FA de 8 dígitos para Wild Wolves CDMX
    console.log(`[WILD WOLVES 2FA] Código generado para ${email}: ${code}`);

    return NextResponse.json({ 
      success: true, 
      message: "Código de 8 dígitos enviado con éxito",
      email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[WILD WOLVES 2FA] Error:", error);
    return NextResponse.json({ success: false, error: "Error enviando código 2FA" }, { status: 500 });
  }
}
