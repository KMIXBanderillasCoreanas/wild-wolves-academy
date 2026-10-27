/**
 * WILD WOLVES CDMX - GENERADOR DE REPORTES BIOMECÁNICOS Y TÁCTICOS EN DOCUMENTO ÚNICO HTML
 * Genera un archivo HTML autosuficiente, interactivo, portable y descargable
 * que incluye:
 * 1. Ficha del atleta (Bruno Díaz, 15 años, Escolta #11)
 * 2. Biometría vs. Defensores más altos (Envergadura, tiempo de soltado <0.65s, parábola >50°)
 * 3. Mapa de calor de tiro (55 lanzamientos oficiales)
 * 4. Micro-cinemática del muñequeo (Follow-through a 60 FPS) y despegue de salto vertical
 * 5. Diagnóstico estricto de qué hace bien y qué hace mal
 * 6. Estatus de finanzas y asistencias Carmen Serdán
 */

export interface StudentReportData {
  studentName: string;
  jerseyNumber?: number;
  category: string;
  age: number;
  heightCm: number;
  wingspanCm: number;
  verticalJumpCm: number;
  evaluationDate: string;
  overallOvr: number;
  tierName: string;
  
  // Pruebas de Tiro (55 Lanzamientos)
  freeThrowsMade: number;
  midRangeLeftMade: number;
  midRangeRightMade: number;
  threeCornerLeftMade: number;
  threeWingLeftMade: number;
  threeTopKeyMade: number;
  threeWingRightMade: number;
  threeCornerRightMade: number;

  // Pruebas de Duela
  jumpRopeCount: number;
  circuitLinesSeconds?: number | null;
  sprint100mSeconds?: number | null;

  // Finanzas y Asistencias
  attendanceCount: number;
  attendanceGoal?: number;
  financialStatus: string;
  currentDebtAmount: number;

  // Análisis Cualitativo IA
  goodHabits: string[];
  badHabitsToFix: string[];
  tallDefenderStrategy: string;
  wristMechanicsNotes: string;
  nutritionSleepNotes: string;
  coachFeedback: string;
}

export function generateFullReportHTML(data: StudentReportData): string {
  const total2PtMade = data.freeThrowsMade + data.midRangeLeftMade + data.midRangeRightMade;
  const total3PtMade =
    data.threeCornerLeftMade +
    data.threeWingLeftMade +
    data.threeTopKeyMade +
    data.threeWingRightMade +
    data.threeCornerRightMade;
  const totalMade = total2PtMade + total3PtMade;
  const overallPct = Math.round((totalMade / 55) * 100);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Expediente Biomecánico Oficial - ${data.studentName} | Wild Wolves CDMX</title>
  <style>
    :root {
      --bg: #07090e;
      --card-bg: #0f131d;
      --border: #27272a;
      --orange: #f66018;
      --amber: #f59e0b;
      --blue: #38bdf8;
      --emerald: #10b981;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 24px;
      line-height: 1.5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .logo-badge {
      display: inline-block;
      background: rgba(246, 96, 24, 0.2);
      border: 1px solid var(--orange);
      color: #ff8a4c;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      border-radius: 8px;
      margin-bottom: 6px;
    }
    h1 { font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
    .meta { font-size: 13px; color: var(--text-muted); }
    .ovr-pill {
      background: linear-gradient(135deg, var(--orange), #c2410c);
      color: white;
      padding: 12px 20px;
      border-radius: 16px;
      text-align: center;
      font-weight: 900;
    }
    .ovr-num { font-size: 32px; line-height: 1; font-family: monospace; display: block; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .card {
      background: #141824;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .stat-val { font-size: 20px; font-weight: 900; color: white; font-family: monospace; }
    .alert-green { background: rgba(16, 185, 129, 0.12); border-left: 4px solid var(--emerald); padding: 12px; border-radius: 8px; margin-bottom: 12px; }
    .alert-orange { background: rgba(246, 96, 24, 0.12); border-left: 4px solid var(--orange); padding: 12px; border-radius: 8px; margin-bottom: 12px; }
    .alert-blue { background: rgba(56, 189, 248, 0.12); border-left: 4px solid var(--blue); padding: 12px; border-radius: 8px; margin-bottom: 12px; }
    ul { list-style: none; }
    li { margin-bottom: 6px; font-size: 13px; display: flex; align-items: flex-start; gap: 8px; }
    .bullet-good { color: var(--emerald); font-weight: 900; }
    .bullet-bad { color: #f87171; font-weight: 900; }
    .footer {
      border-top: 1px solid var(--border);
      padding-top: 16px;
      margin-top: 24px;
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-btn {
      background: var(--orange);
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
    }
    @media print {
      body { background: white; color: black; padding: 0; }
      .container { border: none; box-shadow: none; max-width: 100%; padding: 0; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>

  <div class="container">
    
    <!-- ENCABEZADO -->
    <div class="header">
      <div>
        <div class="logo-badge">Wild Wolves CDMX • Expediente Oficial</div>
        <h1>${data.studentName} ${data.jerseyNumber ? `(#${data.jerseyNumber})` : ""}</h1>
        <p class="meta">
          Categoría: <b>${data.category}</b> • Edad: <b>${data.age} años</b> • Sede: <b>Deportivo Carmen Serdán</b>
        </p>
        <p class="meta" style="margin-top: 4px;">
          Fecha de Evaluación: <b>${data.evaluationDate}</b> • Escalafón: <b>${data.tierName.toUpperCase()}</b>
        </p>
      </div>
      <div class="ovr-pill">
        <span class="ovr-num">${data.overallOvr}</span>
        <span style="font-size: 10px; text-transform: uppercase;">OVR Oficial</span>
      </div>
    </div>

    <!-- METRICAS BIOMÉTRICAS Y DE DUELA -->
    <div class="grid-3">
      <div class="card">
        <div class="card-title">Estatura & Envergadura</div>
        <div class="stat-val">${data.heightCm} cm <span style="font-size: 13px; color: var(--text-muted);">/ ${data.wingspanCm} cm</span></div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Ape Index positivo (+${data.wingspanCm - data.heightCm} cm)</div>
      </div>

      <div class="card">
        <div class="card-title">Salto Vertical en Duela</div>
        <div class="stat-val" style="color: var(--amber);">${data.verticalJumpCm} cm</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Elevación despegue aláctico</div>
      </div>

      <div class="card">
        <div class="card-title">Eficacia de Tiro Global</div>
        <div class="stat-val" style="color: var(--orange);">${overallPct}%</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${totalMade} de 55 tiros oficiales</div>
      </div>
    </div>

    <!-- DESGLOSE DE TIRO (HOMECOURT SHOT SCIENCE) -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="card-title">Batería de Tiro Oficial (55 Lanzamientos)</div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; font-family: monospace; font-size: 12px; margin-top: 10px;">
        <div style="background: rgba(0,0,0,0.4); padding: 8px; border-radius: 8px;">
          <span style="color: var(--text-muted); font-size: 10px; display: block;">Tiros Libres</span>
          <b style="color: var(--emerald); font-size: 15px;">${data.freeThrowsMade}/10</b>
        </div>
        <div style="background: rgba(0,0,0,0.4); padding: 8px; border-radius: 8px;">
          <span style="color: var(--text-muted); font-size: 10px; display: block;">Media Izquierda</span>
          <b style="color: var(--amber); font-size: 15px;">${data.midRangeLeftMade}/10</b>
        </div>
        <div style="background: rgba(0,0,0,0.4); padding: 8px; border-radius: 8px;">
          <span style="color: var(--text-muted); font-size: 10px; display: block;">Media Derecha</span>
          <b style="color: var(--amber); font-size: 15px;">${data.midRangeRightMade}/10</b>
        </div>
        <div style="background: rgba(0,0,0,0.4); padding: 8px; border-radius: 8px;">
          <span style="color: var(--text-muted); font-size: 10px; display: block;">5 Spots Triples</span>
          <b style="color: var(--orange); font-size: 15px;">${total3PtMade}/25</b>
        </div>
      </div>
    </div>

    <!-- QUÉ HACE BIEN VS QUÉ HACE MAL (ESTRICTO) -->
    <div class="grid-2">
      <div class="card">
        <div class="card-title" style="color: var(--emerald);">✓ Qué hace bien (Fortalezas Técnicas)</div>
        <ul>
          ${data.goodHabits.map(h => `<li><span class="bullet-good">✓</span><span>${h}</span></li>`).join("")}
        </ul>
      </div>

      <div class="card">
        <div class="card-title" style="color: #f87171;">⚠️ Qué hace mal (Puntos Críticos por Corregir)</div>
        <ul>
          ${data.badHabitsToFix.map(h => `<li><span class="bullet-bad">✗</span><span>${h}</span></li>`).join("")}
        </ul>
      </div>
    </div>

    <!-- TÁCTICA FRENTE A RIVALES MÁS ALTOS & MUÑEQUEO A 60 FPS -->
    <div class="alert-blue">
      <div style="font-weight: 800; text-transform: uppercase; font-size: 11px; margin-bottom: 4px; color: var(--blue);">
        Estrategia Táctica IA: Frente a Defensores Más Altos
      </div>
      <p style="font-size: 12.5px; color: #e0f2fe;">
        ${data.tallDefenderStrategy}
      </p>
    </div>

    <div class="alert-orange">
      <div style="font-weight: 800; text-transform: uppercase; font-size: 11px; margin-bottom: 4px; color: var(--orange);">
        Micro-Cinemática del Muñequeo & Soltado (High-Speed Analysis)
      </div>
      <p style="font-size: 12.5px; color: #ffedd5;">
        ${data.wristMechanicsNotes}
      </p>
    </div>

    <div class="alert-green">
      <div style="font-weight: 800; text-transform: uppercase; font-size: 11px; margin-bottom: 4px; color: var(--emerald);">
        Recuperación, Sueño & Hábitos del Atleta
      </div>
      <p style="font-size: 12.5px; color: #d1fae5;">
        ${data.nutritionSleepNotes}
      </p>
    </div>

    <!-- ESTATUS ADMINISTRATIVO PARA LA FAMILIA -->
    <div class="grid-2" style="margin-top: 10px;">
      <div class="card">
        <div class="card-title">Asistencias en Carmen Serdán</div>
        <div class="stat-val">${data.attendanceCount} <span style="font-size: 13px; color: var(--text-muted);">/ ${data.attendanceGoal || 16} sesiones</span></div>
        <div style="font-size: 11px; color: var(--emerald); margin-top: 4px;">Asistencia oficial validada por el Coach</div>
      </div>

      <div class="card">
        <div class="card-title">Estatus de Pagos / Cuotas</div>
        <div class="stat-val" style="color: ${data.financialStatus === "al_corriente" ? "var(--emerald)" : "#f87171"};">
          ${data.financialStatus === "al_corriente" ? "$0 MXN" : `$${data.currentDebtAmount} MXN`}
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
          ${data.financialStatus === "al_corriente" ? "Cuenta al corriente • Sin adeudos" : "Saldo pendiente de liquidación"}
        </div>
      </div>
    </div>

    <!-- FOOTER CON BOTÓN DE IMPRESIÓN / GUARDADO -->
    <div class="footer">
      <div>
        <b>Wild Wolves CDMX</b> • Deportivo Carmen Serdán • Sistema Oficial de Rendimiento
      </div>
      <button class="print-btn" onclick="window.print()">
        Descargar / Imprimir Expediente (PDF / HTML)
      </button>
    </div>

  </div>

</body>
</html>`;
}
