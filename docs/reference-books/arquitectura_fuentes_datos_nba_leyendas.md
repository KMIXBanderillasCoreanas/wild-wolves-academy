# Arquitectura de Datos de Leyendas NBA, Benchmarking & Mapas de Tiro
## Wild Wolves Basketball Academy OS • Manual de Referencia Técnica

Este documento consolida la arquitectura oficial de múltiples proveedores (Multi-Provider Data Architecture), la estrategia de ingesta y almacenamiento, y las especificaciones visuales de los módulos de análisis comparativo (Atleta vs. Leyendas NBA) para **Wild Wolves OS**.

---

## 1. Estrategia Multi-Proveedor de Fuentes de Datos

Para garantizar alta resiliencia, evitar bloqueos por cuotas (rate limits) y contar con la mayor precisión de tiro en coordenadas y milisegundos, el sistema no depende de una sola fuente, sino de una **arquitectura desacoplada con adaptadores independientes**:

```
                         ┌────────────────────────────────────────┐
                         │   Wild Wolves Data Federation Engine   │
                         └───────────────────┬────────────────────┘
                                             │
             ┌───────────────────────────────┼───────────────────────────────┐
             │                               │                               │
             ▼                               ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
    │ 1. NBA Stats    │             │ 2. Sportradar   │             │ 3. DunkAPI      │
    │ (Oficial / Core)│             │ (Prod Comercial)│             │ (Coordenadas XY)│
    └─────────────────┘             └─────────────────┘             └─────────────────┘
             │                               │                               │
             └───────────────────────────────┼───────────────────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ 4. nba_api      │
                                    │ (ETL / Research)│
                                    └─────────────────┘
```

---

### A. NBA Stats (API Oficial / Cobertura Histórica)
* **Propósito**: Referencia principal de cobertura y verdad estadística oficial.
* **Alcance Histórico**:
  * Estadísticas tradicionales oficiales desde **1946-47**.
  * Estadísticas avanzadas (Net Rating, True Shooting %, Usage Rate, Pace) desde **1996-97**.
* **Datos Clave**:
  * Divisiones por temporada regular y situaciones de playoffs (*clutch time*).
  * Distribución de tiros por distancia (0-3 ft, 3-10 ft, 10-16 ft, 16-3PT, 3PT) y zonas de cancha.
  * Telemetría de seguimiento de jugadores según disponibilidad por temporada.
* **Estrategia en Wild Wolves**: Caché persistente en base de datos Supabase para perfiles consolidados (Curry, Jordan, LeBron, Bird, Kobe, etc.).

---

### B. Sportradar (Producción Comercial B2B)
* **Propósito**: Candidato principal para entorno de producción en vivo con acuerdos de nivel de servicio (SLA).
* **Alcance Histórico**:
  * Perfiles exhaustivos y estadísticas desde la temporada **2013-14**.
  * Proveedor oficial con licencia directa NBA desde **2017**.
* **Datos Clave**:
  * Estadísticas en tiempo real y play-by-play por posesión.
  * Métricas avanzadas de impacto por quinteto y rotación.
  * Eventos de tiro geolocalizados en duela con marca de tiempo.
* **Estrategia en Wild Wolves**: Endpoint de ingesta para actualizar promedios de temporada y situaciones de partido de atletas en activo.

---

### C. DunkAPI (Mapas de Tiro Históricos & Coordenadas Espaciales)
* **Propósito**: Motor de coordenadas espaciales $(X, Y)$ para la Duela Holográfica 3D y Mapas de Calor.
* **Alcance Histórico**:
  * Registro de lanzamientos y play-by-play detallado desde **2003-04**.
* **Datos Clave**:
  * Coordenadas $(X, Y)$ normalizadas de cada intento de tiro en cancha.
  * Distancia exacta en pies/metros desde el centro del aro.
  * Identificación de zonas: *El Callejón / La Pintura*, *Media Distancia (Mid-Range)*, *Esquinas (Corner 3)*, y *Arco Superior (Top of the Key)*.
  * Aciertos vs. Fallos desglosados por defensor cercano (*contested vs. open*).
* **Estrategia en Wild Wolves**: Proyección visual en [`DuelaHolografica3D.tsx`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/components/DuelaHolografica3D.tsx) para comparar el mapa de tiro del alumno contra el mapa histórico de Stephen Curry o LeBron James.

---

### D. `nba_api` (Python / Prototipado, ETL & Scripts Offline)
* **Propósito**: Pipeline de extracción, transformación y carga (ETL) automatizado en local.
* **Alcance**:
  * Más de 130 endpoints documentados con endpoints de `ShotChartDetail`, `PlayerCareerStats`, `LeagueDashPlayerBioStats`.
  * Generación de archivos JSON estáticos para la carpeta `lib/legendsBenchmark.ts`.
* **Consideración Legal / Técnica**: Licencia MIT de la librería, respetando los términos de uso y *rate-limiting* de NBA.com.

---

## 2. Módulos Visuales a Implementar (Blueprint de UX/UI)

Basado en las referencias de diseño de alto rendimiento:

### Módulo A: NBA Player Explorer (Ficha Cinemática de Leyenda)
* **Visual**: Tarjeta de alto contraste oscuro con render de atleta, insignia del equipo y hexágono de habilidades.
* **Métricas Principales**:
  * `Net Rating (+/-)`
  * `True Shooting % (TS%)`
  * `Usage Rate (%)`
  * `Per-36 Efficiency`
  * `Clutch Points Per Game`
  * `All-Defensive Teams & MVP Preaker`
* **Integración**: Componente modal o tarjeta expandible en el Reporte de Brecha del Alumno y el Tutor.

---

### Módulo B: Player Career Timeline (Línea de Tiempo Histórica)
* **Visual**: Gráfica cronológica que muestra la evolución año tras año del atleta profesional.
* **Capas de Información**:
  1. **Ataque (Offence)**: Puntos por partido, % triples, % tiros de campo, % tiros libres a lo largo de los años.
  2. **Defensa (Diffence)**: Bloqueos, robos de balón, rebotes defensivos y faltas acumuladas por temporada.
  3. **Volumen de Tiro por Franquicia**: Comparativa de conversión según la camiseta defendida (ej. LeBron en Cavaliers vs. Heat vs. Lakers).

---

### Módulo C: Mapa de Cancha Interactivo (KINEXON Shot Load Style)
* **Visual**: Vista cenital de media cancha interactiva con dispersión de tiros.
* **Clasificación por Carga de Tiro (Shot Load)**:
  * **Baja Carga / Calentamiento (Low Shot Load)**: Tiros libres y bandejas sin oposición.
  * **Media Carga (Medium Shot Load)**: Tiros en suspensión tras drible o recepción en transición.
  * **Alta Carga (High Shot Load)**: Tiros bajo fatiga extrema o con marca defensiva encima en el último cuarto.
* **Indicadores**: Puntos verdes hexagonales (aciertos) y círculos rojos translúcidos (fallos) con porcentaje por sector.

---

### Módulo D: Student vs. NBA Comparison Radar (Radar 360 Multieje)
* **Visual**: Gráfico de telaraña radial polar de 8 ejes que superpone al alumno contra las leyendas seleccionadas:
  1. `FG%` (Porcentaje de tiros de campo)
  2. `FG3%` (Porcentaje de tiros de tres puntos)
  3. `FT%` (Porcentaje de tiros libres)
  4. `PTS / Eficiencia` (Puntos convertidos o volumen de entrenamiento)
  5. `REB` (Rebotes / Salto vertical en Apex)
  6. `AST` (Asistencias / Visión de cancha 360°)
  7. `STL` (Robos / Velocidad de reacción neuromuscular)
  8. `BLK` (Bloqueos / Postura defensiva y centro de gravedad)
* **Contexto Formativo**: Ponderación por edad y categoría (U-12, U-15, U-17, Mayor) respecto a la escala profesional.

---

## 3. Modelo de Interfaces TypeScript para Adaptadores

```typescript
// interfaces/nbaDataProviders.ts

export interface ShotCoordinate {
  x: number;               // -250 a 250 (escala NBA/FIBA)
  y: number;               // -47.5 a 422.5
  distanceFeet: number;
  isMade: boolean;
  shotType: 'jump_shot' | 'layup' | 'dunk' | 'stepback' | 'hook';
  zone: 'paint' | 'mid_range' | 'corner_3' | 'top_3';
  shotClockSecondsRemaining?: number;
}

export interface PlayerCareerSeason {
  seasonYear: string;
  teamAbbr: string;
  pointsPerGame: number;
  assistsPerGame: number;
  reboundsPerGame: number;
  stealsPerGame: number;
  blocksPerGame: number;
  fieldGoalPct: number;
  threePointPct: number;
  freeThrowPct: number;
  trueShootingPct: number;
  usageRatePct: number;
}

export interface LegendRadarComparison {
  legendId: string;
  legendName: string;
  studentId: string;
  studentName: string;
  axes: {
    axisName: string;
    studentScoreNormalized: number; // 0 - 100
    legendScoreNormalized: number;  // 0 - 100
    studentRawValue: string;
    legendRawValue: string;
  }[];
}

export interface NBADataProviderAdapter {
  providerName: 'nba_stats' | 'sportradar' | 'dunk_api' | 'nba_api_local';
  getPlayerProfile(legendId: string): Promise<any>;
  getShotCoordinates(legendId: string, season?: string): Promise<ShotCoordinate[]>;
  getCareerTimeline(legendId: string): Promise<PlayerCareerSeason[]>;
  getRadarBenchmark(legendId: string, studentMetrics: any): Promise<LegendRadarComparison>;
}
```

---

## 4. Estado de Implementación en Wild Wolves OS

* [x] **Base de Datos Parametrizada**: [`lib/legendsBenchmark.ts`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/lib/legendsBenchmark.ts) con perfiles completos de Stephen Curry, Michael Jordan, LeBron James, Larry Bird y Estándar Pro NBA.
* [x] **Selector Interactivo en Vivo**: Integrado en [`components/BiomechanicsProBenchmark.tsx`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/components/BiomechanicsProBenchmark.tsx) con cálculo dinámico de milisegundos y PPP.
* [x] **Duela Holográfica 3D**: Operativa en [`components/DuelaHolografica3D.tsx`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/components/DuelaHolografica3D.tsx) lista para recibir coordenadas XY de DunkAPI/KINEXON.
* [x] **Reglas y Enciclopedia Oficial**: En [`components/CourtRulesEncyclopedia.tsx`](file:///d:/Antigravity%202027/Wild%20Wolves%20app/components/CourtRulesEncyclopedia.tsx) y ruta pública `/rules-and-court`.
* [ ] **Próxima Fase**: Conectar el adaptador de coordenadas de tiros $(X, Y)$ de DunkAPI e implementar la vista de línea de tiempo cronológica (*Career Timeline*).
