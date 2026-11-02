# Informe Técnico de Arquitectura y Estado de Desarrollo
## Wild Wolves Basketball Academy OS & AI Ecosystem
* **Fecha de corte:** Noviembre 2026
* **Sede Central:** Deportivo Carmen Serdán, CDMX
* **Head Coach:** Ricardo
* **Entorno de Trabajo:** `D:\Antigravity 2027\Wild Wolves app` & `F:\IA 2026 - 2027`

---

## 1. Arquitectura y Stack Tecnológico

El proyecto opera bajo una arquitectura híbrida de alto rendimiento: una Progressive Web App (PWA) construida sobre Next.js (App Router), respaldada por PostgreSQL/Supabase en la nube con capacidad de operación offline-first en duela, y vinculada a un clúster local de enrutamiento de modelos de inteligencia artificial en la unidad `F:`.

### 1.1. Dependencias Principales (`package.json`)
* **Framework:** Next.js `14.2.14` (App Router).
* **Núcleo de Interfaz:** React `18.3.1`, React-DOM `18.3.1`, TypeScript `5.6.2`.
* **Estilizado & Renderizado:** Tailwind CSS `3.4.13`, PostCSS `8.4.47`, Autoprefixer `10.4.20`, `clsx`, `tailwind-merge`.
* **Visualización & Gráficos:** `recharts` `2.12.7`, `canvas-confetti` `1.9.3`, `react-qr-code` `2.2.0`, `lucide-react` `0.446.0`.
* **Base de Datos & Auth:** `@supabase/supabase-js` `2.45.4`, `@supabase/ssr` `0.5.1`.
* **Pagos & Notificaciones:** `stripe` `16.12.0`, `@stripe/stripe-js` `4.1.0`, `web-push` `3.6.7`.

---

## 2. Inventario de Módulos, Pantallas y Flujos de Usuario

### 2.1. Pantallas y Vistas Principales (`/app`)
1. **Landing Page Pública (`/app/page.tsx`)**:
   * Presentación oficial de la academia (Deportivo Carmen Serdán, horarios matutinos 9:00–11:00 y vespertinos 17:00–19:00).
   * Precios transparentes (desde $50 MXN por clase, paquetes de $500 y $900 MXN).
   * Componente interactivo de progresión de niveles (`TierProgressionBar`), conmutador de roles demo (`DemoRoleSwitcher`) y visualizador del staff técnico.
2. **Dashboard del Coach (`/app/dashboard-coach/page.tsx`)**:
   * **Pase de Lista Táctico:** Registro masivo de asistencia diaria en duela matutino/vespertino.
   * **Evaluador de Test Day:** Registro de marcas físicas (salto vertical, velocidad sprint, push-ups, resistencia, tiro de campo).
   * **Heatmap de Duela:** Mapa de calor de zonas de tiro y tiros libres.
   * **Sincronizador Offline:** Almacenamiento local en IndexedDB y carga diferida cuando se recupera conectividad.
3. **Portal de Tutores / Guardianes (`/app/dashboard-guardian/page.tsx`)**:
   * Estado de colegiaturas y comprobantes de pago.
   * Asistencia confirmada en tiempo real de sus hijos.
   * Integración directa con WhatsApp para reportes y confirmación de transporte.
4. **Dashboard del Alumno / Atleta (`/app/dashboard-student/page.tsx`)**:
   * HUD de rendimiento biológico y rangos: *Cachorro*, *Lobo Joven*, *Lobo Alfa*, *Titán*.
   * Duela holográfica 3D (`DuelaHolografica3D.tsx`) con gráficos polares de habilidades.
   * Módulo de prevención de lesiones y prehab (`PrehabRecoveryCard.tsx`).
   * Vitrina de insignias deportivas ganadas (`student_earned_badges`).
5. **Búnker Maestro SuperAdmin (`/app/master-bunker-hq/page.tsx`)**:
   * Estación de control exclusiva de Coach Ricardo.
   * Libro mayor financiero (ingresos, cobros, gastos operativos).
   * Generación y descarga de respaldos JSON criptográficos (`SecurityBackupManager.tsx`).
   * Auditoría de seguridad perimetral Centinela (Groq DeepSeek).
6. **Portal de Reclutamiento de Coaches (`/app/apply-coach-ww/page.tsx`)**:
   * Cuestionario técnico, experiencia formativa y validación de filosofía.
7. **Autenticación y Registro (`/app/login/page.tsx` & `/app/auth/callback/route.ts`)**:
   * Inicio de sesión con correo y contraseña o enlace mágico mediante Supabase Auth.
   * Validación automática de perfil y redirección por rol.

### 2.2. Catálogo de Componentes Especializados (`/components` y `/src/components`)
* `AttendanceTracker.tsx` / `CourtAttendanceCommand.tsx`: Control de asistencia en duela con validación de pagos al vuelo.
* `DualCoachCommand.tsx`: Doble comando de evaluación técnica y física para parejas de entrenadores.
* `TestDayEvaluator.tsx`: Panel de captura de pruebas biológicas, antropométricas y funcionales.
* `SuperAdminOmniManager.tsx`: Gestión omnicanal de usuarios, credenciales y estados de cuenta.
* `DuelaHolografica3D.tsx` / `HolographicDuelaChart.tsx`: Visualización 3D y radar polar de habilidades técnicas en duela.
* `CourtHeatmapPro.tsx` / `BasketballCourtHeatmap.tsx`: Mapeo de coordenadas (x,y) de efectividad de tiros de campo.
* `SecurityBackupManager.tsx`: Respaldo, restauración y auditoría de integridad de base de datos.
* `WhatsAppHubCRM.tsx` / `WhatsAppAIEngine.tsx`: Automatización de mensajería y reportes personalizados a tutores.
* `BiomechanicsProBenchmark.tsx`: Análisis de biomecánica de tiro, flexión y ángulos articulares.
* `AIModelAdvisorBanner.tsx`: Enrutador táctico contextual para selección de modelos de IA en Antigravity.

---

## 3. Rutas de API y Esquema de Base de Datos (Supabase)

### 3.1. Endpoints de API (`/app/api/*`)
* `POST /api/admin/attendance-finance-manage`: Conciliación masiva de asistencias vs. pagos registrados.
* `GET /api/admin/backup`: Exportación de snapshot criptográfico de tablas maestras en formato JSON.
* `POST /api/admin/expenses`: Registro y deducción de egresos operativos (balones, silbatos, canchas).
* `POST /api/admin/security-audit`: Análisis de vulnerabilidades y verificación de políticas RLS vía IA Centinela.
* `POST /api/ai/generate-report`: Generación de informes narrativos de desempeño deportivo mediante LLM.
* `POST /api/checkout/stripe-session`: Creación de pasarela de pago seguro en Stripe para mensualidades y clínicas.
* `POST /api/push/subscribe` & `POST /api/push/send`: Gestión de notificaciones push PWA para alertas de entrenamiento.
* `POST /api/sync-offline-tests`: Recepción y resolución de conflictos de pruebas capturadas sin internet en la duela.
* `POST /api/vision/analyze-shot`: Endpoint de visión por computadora para detección de trayectoria de balón.
* `POST /api/webhook/whatsapp` & `/api/whatsapp/send-message`: Notificaciones automatizadas de estados de cuenta y citas.

### 3.2. Tablas Principales de Supabase (PostgreSQL)
1. `profiles`: Perfiles de usuario vinculados a `auth.users(id)` con roles (`student`, `coach`, `coach_pending`, `superadmin`).
2. `attendance_commitments`: Compromiso de entrenamiento (días seleccionados, turnos `matutino_9_11` / `vespertino_5_7`, sede).
3. `daily_attendance`: Registros diarios de pase de lista por fecha, turno y estado (`present`, `absent`, `justified`).
4. `payment_transactions_history`: Transacciones, montos, comprobantes y método de pago (efectivo / Stripe / transferencia).
5. `student_initial_baseline`: Medición basal antropométrica inicial de cada alumno.
6. `detailed_test_records`: Evaluaciones periódicas de salto, sprint, tiro y resistencia aeróbica.
7. `physical_training_logs` & `basketball_skills_logs`: Telemetría deportiva por ejercicio y fundamento técnico.
8. `student_earned_badges`: Insignias de superación, lealtad y maestría técnica.
9. `operational_expenses`: Registro de egresos administrativos de la academia.
10. `injury_prevention_protocols`: Protocolos preventivos y seguimiento de molestias musculares/articulares.

---

## 4. Estado de los Scripts y Despliegue en la Unidad F:

La unidad `F:` aloja la infraestructura de inferencia local, gestión de paquetes y agentes de IA para evitar saturar el disco `C:` del sistema:

* **Lanzador de Servicios (`F:\IA 2026 - 2027\iniciar_ias.bat`)**:
  * **OmniRoute** en Puerto `20128` (Enrutador omnicanal de modelos).
  * **9Router** en Puerto `20129` (Gateway de alta velocidad).
  * **FreeLLMAPI** en Puerto `3001` (Inferencia local).
  * Aislamiento de caché y paquetes (`npm-global` y `npm-cache` dirigidos a `F:`).
* **Elephant-Goldfish Swarm (`F:\IA 2026 - 2027\elephant-goldfish`)**:
  * Núcleo del plugin EGM enlazado simbólicamente con Antigravity para revisiones multi-lente (`egm-design`, `egm-zoom-out`, `egm-bootstrap`, `egm-brainstorm`).
* **Estudio Creativo (`F:\IA 2026 - 2027\Higgsfield 2027`)**:
  * Herramientas de generación visual para clips deportivos y análisis de juego.

---

## 5. Puntos Críticos y Hoja de Ruta para la Siguiente Fase

1. **Marketplace de Compraventa (Wallapop Deportivo)**:
   * Requerimiento entrante para intercambio y venta de tenis, uniformes, rodilleras y equipo deportivo entre padres de familia de la academia.
2. **Endurecimiento de RLS en Tablas de Visión y Biomecánica**:
   * Consolidar las políticas RLS en `basketball_skills_logs` y `detailed_test_records` para asegurar aislamiento estricto por alumno.
3. **Optimización del Bundle de Duela**:
   * Los componentes `CourtAttendanceCommand.tsx` y `DualCoachCommand.tsx` superan las 80k líneas acumuladas; modularizar subcomponentes para acelerar el Hot Module Reloading (HMR).
4. **Pipeline Automatizado de Respaldo hacia `F:`**:
   * Programar un cron job o script en PowerShell que descargue el snapshot de Supabase (`/api/admin/backup`) y lo guarde automáticamente en `F:\IA 2026 - 2027\backups`.
