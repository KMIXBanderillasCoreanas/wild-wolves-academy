# INFORME DE AUDITORÍA INTEGRAL · FASE 0
## Wild Wolves Basketball Academy OS • Diagnóstico de Código, Esquema y Dependencias
### Base Técnica para la Integración de NBA Player Intelligence

> **Fecha de Emisión**: Noviembre 2026  
> **Estado**: Diagnóstico Aprobado (Solo Lectura · Sin Migraciones Destructivas)  
> **Ámbito de Aplicación**: Wild Wolves OS (Deportivo Carmen Serdán, CDMX)

---

## 1. Inventario del Repositorio

El proyecto `hoop-performance-os` (Wild Wolves OS v0.3.0) está estructurado como una aplicación monolítica moderna en Next.js con separación de responsabilidades:

```
Wild Wolves app/
├── app/                       # Next.js 14 App Router (28 rutas estáticas y dinámicas)
│   ├── actions/               # Server Actions (autenticación, membresías, báscula, biomecánica)
│   ├── api/                   # API Endpoints (asistente IA, stripe, whatsapp, visión, webhooks)
│   ├── dashboard-coach/       # Portal del Entrenador en Duela
│   ├── dashboard-guardian/    # Portal del Padre / Tutor
│   ├── dashboard-student/     # Portal del Atleta
│   ├── master-bunker-hq/      # Búnker Central SuperAdmin
│   ├── marketplace/           # Bazar Lobo (compraventa de equipo deportivo)
│   └── rules-and-court/       # Enciclopedia y Reglamento Oficial FIBA/NBA
├── components/                # Librería de 60+ componentes UI/UX modulares
│   ├── BiomechanicsProBenchmark.tsx  # Telemetría y comparador cinemático preliminar
│   ├── CourtRulesEncyclopedia.tsx    # Guía de duela y medidas
│   ├── DuelaHolografica3D.tsx        # Visualizador holográfico de cancha
│   ├── HomeTrainingCalendar.tsx      # Calendario autónomo de entrenamiento en casa
│   ├── PaywallLockCard.tsx           # Bloqueo condicional Freemium
│   └── ShotScienceDashboard.tsx      # Métricas y volumen acumulado de tiros
├── context/                   # Contextos de React (Auth, DemoMode, Carrito)
├── docs/                      # Documentación y Reference Books normativos
├── hooks/                     # Custom Hooks (useSubscriptionTier, etc.)
├── lib/                       # Motores de negocio, bus neuronal, clientes Supabase y caché
├── public/                    # Activos estáticos, iconografía PWA y media
├── scripts/                   # Utilidades de mantenimiento y comprobación
└── supabase/                  # 23 scripts SQL (esquema, RLS, triggers y migraciones históricas)
```

---

## 2. Arquitectura de Dependencias y Stack Tecnológico

| Capa | Tecnología | Versión | Rol en el Sistema |
|---|---|---|---|
| **Framework Web** | Next.js (App Router) | `14.2.14` | Renderizado híbrido SSR/SSG/Cliente, Server Actions y middleware |
| **Runtime / UI** | React / React-DOM | `18.3.1` | Motor de interfaz declarativo con Concurrent Mode |
| **Lenguaje** | TypeScript | `^5.6.2` | Tipado estricto en configuración, esquemas y adaptadores |
| **Estilos** | Tailwind CSS / PostCSS | `^3.4.13` | Diseño cibernético responsivo con paleta dark mode |
| **Persistencia** | `@supabase/ssr` / `@supabase/supabase-js` | `^2.45.4` | Conexión con PostgreSQL Supabase con RLS |
| **Gráficos** | Recharts | `^2.12.7` | Gráficos de barras, líneas y radares polares |
| **Visión / OCR** | Tesseract.js | `^7.0.0` | Ingesta y lectura óptica de capturas de báscula inteligente |
| **Pagos** | Stripe / `@stripe/stripe-js` | `^16.12.0` | Pasarela de cobro y checkout de membresías |
| **Iconografía** | Lucide-React | `^0.446.0` | Sistema de iconos coherente y liviano |

---

## 3. Esquema Real de Base de Datos (Supabase PostgreSQL)

La persistencia del proyecto está centralizada en Supabase PostgreSQL. Las tablas operativas reales son:

### A. Identidad, Roles y Autenticación
* `public.profiles`: Almacena usuarios (alumnos, entrenadores, tutores y directores). Campos clave: `id` (UUID vinculado a `auth.users`), `full_name`, `email`, `role` (`student`, `coach`, `guardian`, `superadmin`), `category`, `jersey_number`, `current_tier`, `weight_kg`, `fat_percentage`, `muscle_mass_kg`, `water_percentage`, `metabolic_age`, `created_at`.
* `public.attendance_commitments`: Pactos de entrenamiento y acuerdos de compromiso.

### B. Asistencia y Controles Financieros
* `public.daily_attendance`: Registros diarios de presencia en duela (`presente`, `falta`, `retardo`, `justificado`) con sellado de tiempo y coach responsable.
* `public.membership_payments` / `payment_transactions_history`: Historial de cuotas ($50 MXN/clase, $500 y $900 MXN mensuales), folios y comprobantes.

### C. Evaluaciones Deportivas y Biomecánicas
* `public.detailed_test_records`: Batería de pruebas de Test Day (salto de cuerda, 100m sprint, salto vertical en cm, tiros libres, media distancia y triples).
* `public.basketball_skills_logs`: Telemetría de spots en duela (`three_corner_left`, `three_wing_left`, `three_top`, `three_wing_right`, `three_corner_right`).
* `public.student_initial_baseline`: Registro del Día 1 de ingreso para comparación histórica de progreso.
* `public.physical_training_logs`: Registro de trabajo autónomo en casa (saltos de cuerda, cardio, plancha isométrica y flexiones).
* `public.student_earned_badges`: Medallero oficial conquistado en cancha.

### D. Gobernanza de IA y Suscripciones
* `public.ai_usage_limits`: Monitoreo de consultas mensuales al Asistente IA / Lobo Táctico (5 consultas en Free, 50 en Lobo Pro $99, 100 en Pack Familiar $149).
* `public.activation_codes`: Folios de 30 días generados para canje en efectivo o transferencia.
* `public.video_library_items` / `video_favorites`: Catálogo de lecciones tácticas.

---

## 4. Modelos de Alumnos, Evaluaciones y Partidos

* **Modelo Alumno**: Unificado en `profiles` con atributos antropométricos y nivel competitivo (`category`, `current_tier`).
* **Modelo Evaluación**: Modelo dual tolerante en `detailed_test_records` y `basketball_skills_logs`.
* **Modelo Partidos / Duela**: La academia registra partidos formativos mediante asistencias y bitácoras de coach; la integración de box scores profesionales de la NBA se acoplará a este nivel mediante una **capa de lectura desacoplada**.

---

## 5. Mecanismos de Autenticación y Permisos (RBAC & RLS)

* **Autenticación**: Supabase Auth con soporte para OAuth (Google) y clave maestra de acceso de emergencia para SuperAdmin en `/master-bunker-hq`.
* **Políticas RLS (Row Level Security)**:
  * Políticas activas para aislar los perfiles de tutores y alumnos.
  * Restricción estricta: los alumnos solo pueden leer su propio expediente (`auth.uid() = id`).
  * Los tutores solo pueden consultar a los alumnos vinculados mediante `guardian_id` o `student_id`.
  * Los coaches y superadmins cuentan con permisos de lectura/escritura en evaluaciones y asistencias.

---

## 6. Componentes Visuales Existentes & Reutilización

* [`BiomechanicsProBenchmark.tsx`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/components/BiomechanicsProBenchmark.tsx): Implementa el selector interactivo de leyendas y el cálculo de deltas cinemáticos.
* [`DuelaHolografica3D.tsx`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/components/DuelaHolografica3D.tsx): Render cibernético de duela con spots de tiro. Listo para extenderse con el mapa de tiros de coordenadas $(X, Y)$ estilo KINEXON / DunkAPI.
* [`CourtRulesEncyclopedia.tsx`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/components/CourtRulesEncyclopedia.tsx): Enciclopedia formativa de duela y medidas oficiales.
* [`ShotScienceDashboard.tsx`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/components/ShotScienceDashboard.tsx): Gráficas de volumen histórico y porcentajes de acierto.
* [`PaywallLockCard.tsx`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/components/PaywallLockCard.tsx): Tarjeta de protección comercial Freemium con botón a WhatsApp de Coach Ricardo.

---

## 7. Integraciones Externas Activas

1. **Supabase Cloud**: Backend PostgreSQL, Storage para fotos de comprobantes/báscula y Auth.
2. **Stripe**: Pasarela de pagos en línea.
3. **WhatsApp CRM API**: Generador de enlaces `wa.me` con plantillas preformateadas para reportes y folios.
4. **Google OAuth**: Proveedor de acceso seguro para el staff técnico.

---

## 8. Estrategia de Respaldo y Copias de Seguridad

* La plataforma cuenta con scripts de respaldo automatizados en `app/api/admin/backup/route.ts` y gestor de respaldos en `/master-bunker-hq`.
* Respaldos en formato JSON descargables con metadatos de fecha y firma de integridad.
* Repositorios de código sincronizados en GitHub (`origin` y `wildwolves`).

---

## 9. Análisis de Riesgos para la Integración de NBA Player Intelligence

| Riesgo Identificado | Nivel | Mitigación Arquitectónica |
|---|:---:|---|
| **Contaminación de datos de menores con datos NBA** | **Alto** | Tablas de la NBA (`professional_*`) aisladas en esquemas separados. Adaptadores desacoplados de solo lectura. |
| **Inyección de SQL o saturación por agentes de IA** | **Medio** | La IA solo consume contratos tipados en TypeScript y funciones RPC controladas, nunca ejecuta SQL directo. |
| **Agotamiento de cuotas / Rate Limiting de APIs externas** | **Medio** | Almacenamiento en caché persistente en Supabase y archivos estáticos JSON para benchmarks históricos. |
| **Discrepancia en temporadas históricas (Métricas inexistentes)** | **Bajo** | Regla de visualización estricta: Mostrar «Dato no disponible», cero invención de datos. |

---

## 10. Plan de Integración Aditivo (Cero Regresiones)

1. **Aislamiento**: Crear la capa de datos NBA en un módulo independiente (`lib/nba-intelligence/`), sin alterar ninguna tabla existente de alumnos, finanzas o asistencias.
2. **Capa Puente de Lectura**: Un comparador (`ComparisonEngine`) consumirá en modo solo lectura las evaluaciones existentes (`detailed_test_records`, `basketball_skills_logs`) para calcular las diferencias contra el banco de leyendas de la NBA.
3. **Validación Continua**: Ejecución de `npx tsc --noEmit` y `npm run build` en cada fase para asegurar que las 28 rutas de producción sigan compilando al 100%.
