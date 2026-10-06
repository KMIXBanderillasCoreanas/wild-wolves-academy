# 🐺 HoopPerformance OS (v0.3.0)
### Basketball High-Performance Academy Operating System
**Wild Wolves Basketball Academy** | Biomecánica, RBAC Seguro, Barra Social & Analítica de Combine

---

## 🚀 Arquitectura y Tecnologías Principales

- **Framework Fullstack:** Next.js 14 (App Router) + React 18 + TypeScript
- **Estilos & UI:** Tailwind CSS + Lucide React + Paleta oscura temática *Wild Wolves*
- **Motor de Gráficas Biomecánicas:** Recharts (Radar / Spider Chart multinivel normalizado)
- **Seguridad RBAC:** Control de Acceso Basado en Roles (`Coach` vs `Alumno` en modo solo lectura estricto)
- **Efectos y Celebraciones:** `canvas-confetti` para récords personales (PR)
- **Backend & Database:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`) con Row Level Security (RLS)
- **Monetización & Suscripciones:** Stripe SDK (`stripe`, `@stripe/stripe-js`) y API Route Handlers
- **Despliegue:** Optimizado para Vercel (`vercel.json`)

---

## 🛡️ Control de Roles (RBAC)

El sistema implementa dos perfiles con separación estricta de privilegios:

1. **Coach (Marcus Vance):**
   - Acceso completo de escritura y evaluación deportiva.
   - Registro de nuevas pruebas biomecánicas (Salto vertical, tiro 3PT/FT, agilidad, drible, defensa).
   - Calibración y actualización en tiempo real de los vértices del radar.
   - Gestión de bitácora y notas técnicas para scouts.
2. **Alumno (Lucas Morales / Mateo Silva / Sofia Ramirez):**
   - Acceso **estrictamente de solo lectura**.
   - Consulta de su radar de habilidades y comparación con el Benchmark de la Academia.
   - Historial de pruebas físicas y récords personales (PR).
   - Bloqueo preventivo en formularios de mutación y avisos de seguridad ante intentos no autorizados.

> **Simulador RBAC:** En la barra superior (`RoleSwitchBanner`), los administradores o evaluadores pueden alternar con un clic entre el rol de *Coach* y el rol de *Alumno* para auditar los permisos en vivo.

---

## 📱 Barra Social Integral (`SocialBar`)

Acceso directo a las comunidades oficiales de la academia:
- 🟢 **WhatsApp:** Conexión directa con el cuerpo técnico para resolución de dudas e informes combine.
- 🔴 **YouTube:** Scouting de partidos, film room y transmisiones en vivo.
- 📸 **Instagram:** Cobertura de entrenamientos y highlights de la academia.
- 🎵 **TikTok:** Drills técnicos, jugadas destacadas y biomecánica en cámara rápida.
- 🔵 **Facebook:** Comunidad oficial de padres de familia y torneos.
- 📤 **Compartir Scouting:** Botón interactivo para copiar la ficha de rendimiento y enviarla a reclutadores.

---

## 📊 Analítica Deportiva & Pruebas Combine

Las pruebas se procesan y normalizan en una escala de 0 a 100 basada en percentiles competitivos (NCAA D1 / FIBA):
- **Tiro (% Shooting):** Ponderación de spot-up 3PT y Tiros Libres.
- **Manejo de Balón:** Velocidad de drible, control bimanual y retención bajo presión.
- **Salto Vertical:** Explosividad a 1 y 2 pies (en pulgadas y centímetros).
- **Agilidad & Velocidad:** Tiempo del circuito de carril (Lane Agility Drill en segundos).
- **Defensa & IQ Táctico:** Desplazamiento lateral y lecturas de juego.
- **Resistencia / Stamina:** Nivel alcanzado en Beep Test de recuperación aeróbica.

---

## 📂 Estructura del Proyecto

```text
Wild Wolves app/
├── src/
│   ├── app/
│   │   ├── api/stripe/checkout/route.ts  # Stripe Checkout Session Handler
│   │   ├── globals.css                   # Tailwind base & dark theme styles
│   │   ├── layout.tsx                    # Layout raíz con AuthProvider
│   │   └── page.tsx                      # Dashboard principal HoopPerformance OS
│   ├── components/
│   │   ├── AthleteProfileHeader.tsx      # Cabecera del atleta y selector de plantilla
│   │   ├── EvaluationHistory.tsx         # Bitácora histórica con récords (PR)
│   │   ├── PermissionDeniedModal.tsx     # Alerta RBAC para rol Alumno
│   │   ├── RadarAnalytics.tsx            # Gráfica radar Recharts con Benchmark
│   │   ├── RoleSwitchBanner.tsx          # Barra superior de auditoría y cambio de rol
│   │   ├── SocialBar.tsx                 # Barra social con enlaces y WhatsApp
│   │   ├── StripeBillingModal.tsx        # Portal de membresías de la academia
│   │   └── TestEvaluationModal.tsx       # Formulario de evaluación para Coaches
│   ├── context/
│   │   └── AuthContext.tsx               # Contexto React para RBAC
│   ├── data/
│   │   └── mockData.ts                   # Datos iniciales de atletas y benchmarks
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Cliente navegador @supabase/ssr
│   │   │   └── server.ts                 # Cliente servidor con cookies
│   │   ├── stripe.ts                     # Instancia y planes Stripe SDK
│   │   └── utils.ts                      # Clsx y Tailwind Merge (cn)
│   └── types/
│       └── basketball.ts                 # Modelos de datos TypeScript
├── supabase/
│   └── schema.sql                        # DDL de PostgreSQL + Políticas RLS
├── .env.example                          # Variables de entorno
├── next.config.mjs                       # Configuración de Next.js
├── tailwind.config.ts                    # Configuración de diseño Tailwind
├── tsconfig.json                         # Configuración TypeScript
├── vercel.json                           # Configuración de despliegue Vercel
└── package.json                          # Dependencias v0.3.0
```

---

## ⚡ Comandos para Ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en el navegador.

3. **Construir para producción:**
   ```bash
   npm run build
   ```
