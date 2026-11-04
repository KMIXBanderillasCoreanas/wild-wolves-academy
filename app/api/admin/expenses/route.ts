import { NextResponse } from "next/server";
import { getStoredExpenses, saveExpense, deleteExpense } from "@/lib/expensesStorage";
import { evaluarSeguridadPeticion } from "@/lib/lobo-centinela-guard";

export async function GET(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const sec = await evaluarSeguridadPeticion({
      ipAddress: ip,
      actionTarget: "admin_expenses_get",
      payloadContent: ""
    });
    if (!sec.seguro) {
      return NextResponse.json({ error: sec.razon }, { status: 403 });
    }

    const expenses = await getStoredExpenses();
    return NextResponse.json({ success: true, expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al leer gastos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const body = await req.json();

    // Auditoría de Seguridad con Lobo Centinela
    const sec = await evaluarSeguridadPeticion({
      ipAddress: ip,
      actionTarget: "admin_expenses_post",
      payloadContent: body
    });
    if (!sec.seguro) {
      return NextResponse.json({ error: sec.razon, code: sec.codigoBloqueo }, { status: 403 });
    }

    const { concept, amount, category, expense_date, payment_method, notes } = body;

    if (!concept || amount === undefined) {
      return NextResponse.json({ error: "concept y amount son obligatorios" }, { status: 400 });
    }

    const saved = await saveExpense({
      concept,
      amount,
      category,
      expense_date,
      payment_method,
      notes,
    });

    return NextResponse.json({ success: true, expense: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al guardar gasto" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const body = await req.json();

    // Auditoría de Seguridad con Lobo Centinela
    const sec = await evaluarSeguridadPeticion({
      ipAddress: ip,
      actionTarget: "admin_expenses_delete",
      payloadContent: body
    });
    if (!sec.seguro) {
      return NextResponse.json({ error: sec.razon, code: sec.codigoBloqueo }, { status: 403 });
    }

    const { expense_id } = body;

    if (!expense_id) {
      return NextResponse.json({ error: "expense_id es obligatorio" }, { status: 400 });
    }

    await deleteExpense(expense_id);
    return NextResponse.json({ success: true, message: "Gasto eliminado exitosamente" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al eliminar gasto" }, { status: 500 });
  }
}
