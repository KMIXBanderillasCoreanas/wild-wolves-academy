import { NextResponse } from "next/server";
import { getStoredExpenses, saveExpense, deleteExpense } from "@/lib/expensesStorage";

export async function GET() {
  try {
    const expenses = await getStoredExpenses();
    return NextResponse.json({ success: true, expenses });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Error al leer gastos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
    const body = await req.json();
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
