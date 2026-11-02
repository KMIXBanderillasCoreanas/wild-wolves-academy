# WILD WOLVES — NBA PLAYER INTELLIGENCE
## ARQUITECTURA MAESTRA · COBERTURA HISTÓRICA · DATOS · LICENCIAS · IMPLEMENTACIÓN

> **Estado**: Documento Rector Aprobado  
> **Alcance Definido**: NBA Completa y Ampliable  
> **Profundidad**: Máxima Disponible  
> **Fase Activa**: Fase 0 (Auditoría Integral sin Modificación Destructiva de Base de Datos)  
> **Fecha de Registro**: Noviembre 2026  
> **Sede / Organización**: Wild Wolves Basketball Academy (Deportivo Carmen Serdán, CDMX)

---

### Principios Fundamentales del Sistema

1. **Escalabilidad Universal**: El sistema comienza con Michael Jordan, LeBron James y Stephen Curry, pero está diseñado para incorporar a cualquier jugador de la NBA (histórico o actual) sin rediseñar el modelo ni los componentes.
2. **Máxima Fidelidad y Veracidad**: Prioridad absoluta al dato verificable (temporadas, partidos, métricas avanzadas, tiros individuales, zonas de anotación y evolución).
3. **Manejo Estricto de Datos Ausentes**: Cuando una métrica no exista para una temporada determinada, la plataforma **mostrará explícitamente «Dato no disponible»**. Jamás se inventará ni se rellenará con estimaciones presentadas como datos oficiales.
4. **Condición Esencial de No-Regresión**: Fase 0 es diagnóstica. **No se modificará la base de datos existente ni los módulos funcionales en producción** durante la auditoría. Las entidades y relaciones propuestas constituyen la arquitectura objetivo, no migraciones autorizadas inmediatas.

---

## 1. Fuentes de Datos: Selección y Arquitectura Multi-Proveedor

No depender de una sola fuente. Arquitectura desacoplada de múltiples proveedores con un adaptador independiente para cada uno:

| Fuente | Rol / Necesidad | Cobertura Documentada | Consideración Técnica y de Licencias |
|---|---|---|---|
| **A. NBA Stats** | Historia estadística NBA oficial | Estadísticas básicas desde **1946-47**.<br>Avanzadas desde **1996-97**. | Tiros por distancia, zonas, situaciones de juego. Requiere caché local y autorización para bases extensas. |
| **B. Sportradar** | Integración comercial licenciada | Desde **2013-14**.<br>Oficial NBA desde **2017**. | Play-by-play, seguimiento de eventos, rotaciones, SLAs comerciales garantizados. |
| **C. DunkAPI** | Coordenadas de tiros espaciales | Play-by-play desde **2003-04**. | Coordenadas $(X, Y)$ de lanzamientos, distancias, aciertos/intentos. Servicio independiente no oficial. |
| **D. nba_api** | Pruebas, exploración técnica y ETL | Más de 130 endpoints documentados. | Biblioteca Python (MIT). Datos sujetos a condiciones de NBA.com. Ideal para pipelines offline. |

> **Regla de Negocio**: No contratar un proveedor comercial sin conocer el costo exacto de los datos requeridos y sus derechos de visualización y retención para academias privadas.

---

## 2. Cobertura Histórica: Disponibilidad Real Verificable

### Línea Temporal de Disponibilidad Estadística Oficial

| Tipo de Información | Inicio Histórico Documentado |
|---|---|
| Estadísticas básicas y box scores | **1946-47** |
| Rebotes totales | **1950-51** |
| Minutos jugados | **1951-52** |
| Titularidades (Games Started) | **1970-71** |
| Robos y tapones | **1973-74** |
| Rebotes ofensivos y defensivos | **1973-74** |
| Pérdidas de balón | **1977-78** |
| Tiros de 3 puntos | **1979-80** |
| Estadísticas avanzadas ($eFG\%, TS\%, USG\%, ORtg, DRtg$) | **1996-97** |
| Datos de alineaciones en pista | **2008** |
| Seguimiento óptico en todos los estadios (SportVU / Second Spectrum) | **2013-14** |

### Implicaciones para las Tres Leyendas Clave

```
[1984] ──────── Michael Jordan (1984 - 2003) ──────── [2003]
        • Box scores completos
        • Avanzadas solo 1996-2003
        • Mapas de tiro DunkAPI: NO disponibles (inician 2003-04)

                               [2003] ──────── LeBron James (2003 - Presente) ────────>
                                       • Cobertura avanzada completa
                                       • Mapas de tiro y coordenadas XY completos
                                       • Tracking moderno según temporada

                                              [2009] ── Stephen Curry (2009 - Pres.) ──>
                                                      • Cobertura avanzada y tiros completa
                                                      • Shot charts de alta densidad
                                                      • Telemetría de movimiento
```

* **Michael Jordan**: Historial tradicional exhaustivo. Avanzadas desde 1996-97. **No prometer mapas de tiro detallados de coordenadas XY para toda su carrera** (DunkAPI inicia en 2003-04).
* **LeBron James & Stephen Curry**: Cobertura espacial, coordenadas de tiro y métricas avanzadas completas. La interfaz debe reflejar claramente estas discrepancias temporales con etiquetas de «Dato no disponible».

---

## 3. Catálogo de Estadísticas en Diez Grupos

1. **Anotación**: Puntos totales (PTS), Puntos Por Partido (PPG), puntos por minuto, puntos por posesión.
2. **Tiro**: FGM, FGA, FG%, 3PM, 3PA, 3P%, FTM, FTA, FT%.
3. **Zonas en Duela**: El Callejón / La Pintura, media distancia, triples frontales y triples de esquina (corners).
4. **Creación de Juego**: Asistencias (AST), ratio asistencias/pérdidas (AST/TO), pases totales, asistencias potenciales.
5. **Defensa**: Robos (STL), tapones (BLK), faltas personales, defensa por zona de tiro cuando esté disponible.
6. **Rebote**: Rebotes ofensivos (ORB), defensivos (DRB), totales (REB), porcentajes de rebote disponible.
7. **Eficiencia**: eFG%, True Shooting % ($TS\%$), PER, PIE, USG%, Offensive Rating ($ORtg$), Defensive Rating ($DRtg$).
8. **Situaciones de Partido**: Cuartos (Q1-Q4), momentos decisivos (*clutch*), local / visitante, victorias / derrotas.
9. **Movimiento & Tracking**: Velocidad promedio, distancia recorrida, aceleraciones y telemetría óptica licenciada.
10. **Evolución Histórica**: Progresión año a año por temporada, edad, partidos disputados, minutos y trayectoria por franquicia.

---

## 4. Diseño de la Arquitectura en 5 Capas

```
┌────────────────────────────────────────────────────────────────────────┐
│               CAPA 1 · EXTERNAL DATA PROVIDERS                         │
│               NBA Stats · Sportradar · DunkAPI · nba_api               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│               CAPA 2 · PROVIDER ADAPTERS                               │
│  Conectores independientes, autenticación, cuotas, licencias y salud   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│               CAPA 3 · DATA NORMALIZATION ENGINE                       │
│  IDs universales, temporadas, unidades, procedencia y validación QA    │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │                                        │
┌───────────────▼──────────────┐         ┌───────────────▼───────────────┐
│        NBA DATA STORE        │         │      WILD WOLVES DATA         │
│ (Jugadores, Tiros, Partidos, │         │ (Alumnos, Evaluaciones, Duela │
│         Estadísticas)        │         │  y Rendimiento Deportivo)     │
└───────────────┬──────────────┘         └───────────────┬───────────────┘
                │                                        │
                └───────────────────┬────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│               CAPA 4 · COMPARISON ENGINE                               │
│  Normalización por 100 posesiones, percentiles, contexto formativo     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│               CAPA 5 · WILD WOLVES PERFORMANCE AI                      │
│ Player DNA · NBA Benchmark · Shot Map · Progress Tracker · AI Reports  │
└────────────────────────────────────────────────────────────────────────┘
```

### Reglas de Aislamiento y Seguridad:
* Los proveedores externos **nunca acceden a las tablas de alumnos**.
* Los datos profesionales se almacenan **físicamente separados de los datos personales** de atletas menores.
* La IA consulta servicios tipados y contratos de API, **nunca ejecuta SQL directo**.
* Cada dato importado conserva su **fuente, fecha de consulta y temporada**.
* Cada métrica indica si es **oficial, derivada o estimada**.
* Desacoplamiento total: cambiar un proveedor no exige reconstruir la aplicación.

---

## 5. Modelo de Datos Lógico Objetivo (15 Entidades)

```
ProfessionalPlayers ────────< ProfessionalPlayerAliases
        │
        ├──────< ProfessionalPlayerSeasonStats >────── ProfessionalSeasons
        ├──────< ProfessionalPlayerGameStats   >────── ProfessionalTeams
        ├──────< ProfessionalShotEvents (Coordenadas X, Y)
        ├──────< ProfessionalPlayEvents
        ├──────< ProfessionalAdvancedStats
        └──────< ProfessionalTrackingStats

Infraestructura & Gobierno de Datos:
DataProviderRegistry
DataCoverageRegistry
DataLicenseRegistry
DataImportJobs
DataQualityReports
BenchmarkProfiles
StudentComparisonReports (Puente de lectura con Wild Wolves)
```

> **Aviso de Integridad**: La integración con las estadísticas de los atletas de Wild Wolves se realizará mediante una **capa de solo lectura de los datos deportivos existentes**. No se creará una segunda ficha de alumnos ni se duplicarán evaluaciones.

---

## 6. Gobernanza Legal y Licenciamiento Comercial

| Proveedor | Marco de Uso | Acción Obligatoria Previa a Producción |
|---|---|---|
| **NBA Stats / NBA.com** | Fines informativos o privados no comerciales. | Requiere autorización expresa para bases estadísticas comerciales extensas. |
| **nba_api** | Código MIT; datos sujetos a NBA.com. | Uso estricto en pipelines internos de investigación y desarrollo. |
| **Sportradar** | Contrato comercial B2B con SLA. | Solicitar cotización formal para uso en aplicación privada de academia formativa. Confirmar derechos de caché, datos derivados y visualización a tutores/alumnos. |
| **DunkAPI** | Servicio independiente no afiliado a NBA. | Auditoría de términos de servicio y derechos de redistribución de coordenadas. |

---

## 7. Comparación entre Alumno y Jugador NBA: Contexto Formativo

No se realizarán rankings que desmotiven ni comparaciones brutas entre un adolescente y un atleta élite de 25 años.

### Cuatro Niveles de Comparación:
1. **Nivel 1 — Individual**: Alumno contra su propio historial (progreso, constancia, sobrecarga).
2. **Nivel 2 — Categoría**: Alumno contra atletas de su misma edad, posición y nivel competitivo.
3. **Nivel 3 — Referencia Profesional**: Comparativa de habilidades específicas (milisegundos de liberación, postura defensiva, acoplamiento).
4. **Nivel 4 — Perfil de Juego (Player DNA)**: Clasificación de arquetipo (tirador, creador, finalizador en el callejón, defensor perimetral).

### Normalización Científica de Datos:
* Porcentaje de acierto real ($eFG\%, TS\%$).
* Intentos por minuto y **proyección por 100 posesiones**.
* Distribución de tiros por zona (proporción, no volumen absoluto).
* Contexto por edad biológica, categoría (U-12 a Mayor) y tamaño muestral.

---

## 8. Módulos de Pantalla (Especificación de UI)

* **A. NBA Player Explorer**: Búsqueda universal, filtros por franquicia, temporada, posición y ficha visual con radar.
* **B. Player Career Timeline**: Línea de tiempo interactiva con barras de volumen ofensivo, curvas defensivas y etapas por franquicia.
* **C. Advanced Shot Intelligence**: Duela interactiva con puntos hexagonales de acierto y círculos de fallo categorizados por carga (*Low, Medium, High Shot Load*).
* **D. Student vs. NBA Comparison Radar**: Telaraña polar de 8 ejes (FG%, 3PT%, FT%, PTS, REB, AST, STL, BLK) superponiendo al atleta contra leyendas seleccionadas.

---

## 9. Plan de Implementación por 11 Fases

| Fase | Título | Entregable Clave | Estado |
|---|---|---|---|
| **Fase 0** | **Auditoría Integral** | **Inventario, dependencias, esquema real PostgreSQL/Prisma, análisis de riesgos y plan aditivo sin regresiones.** | 🟡 **EN EJECUCIÓN** |
| **Fase 1** | Estudio de Licencias y Proveedores | Definición formal de derechos y fuentes autorizadas. | Pendiente |
| **Fase 2** | Prueba Técnica de Cobertura | Verificación exhaustiva de Jordan, LeBron y Curry. | Pendiente |
| **Fase 3** | Arquitectura de Integración | Adaptadores tipados y motor de normalización. | Pendiente |
| **Fase 4** | Persistencia Independiente | Módulo aislado de almacenamiento NBA. | Pendiente |
| **Fase 5** | Explorador y Perfiles | Fichas de jugadores, temporadas y partidos. | Pendiente |
| **Fase 6** | Shot Intelligence | Mapas de tiro espaciales por zonas. | Pendiente |
| **Fase 7** | Integración Wild Wolves | Capa de solo lectura de atletas formativos. | Pendiente |
| **Fase 8** | Comparador Alumno vs. NBA | Comparación justa contextualizada por edad y volumen. | Pendiente |
| **Fase 9** | IA Deportiva (Lobo Táctico) | Informes biomecánicos y prescripción de objetivos. | Pendiente |
| **Fase 10** | Seguridad, QA & Lanzamiento | Pruebas de estrés, auditoría de permisos y despliegue. | Pendiente |

---

## 10. Seguridad y Protección de Datos

* **Defensa en Profundidad**: Credenciales y tokens de API residen exclusivamente en variables de entorno del servidor.
* **Separación de PII**: Aislamiento estricto entre telemetría deportiva profesional y datos personales de menores de edad.
* **Gobierno de IA**: Los agentes inteligentes consumen contratos tipados; prohibido el SQL dinámico en tiempo de ejecución.
* **Auditoría de Ingesta**: Registro histórico de cada trabajo de sincronización (*job*), logs de anomalías y validación de esquemas.

---

## 11. Criterios de Aceptación del Proyecto

1. Consulta fluida de jugadores históricos y contemporáneos.
2. Selección dinámica de cualquier temporada disponible en archivo.
3. Desglose detallado por partido (box scores).
4. Filtro discriminado entre Temporada Regular y Playoffs.
5. Cobertura de tiros por zona donde exista telemetría espacial real.
6. Métricas avanzadas con fórmulas y definiciones explícitas.
7. Identificación clara de datos no disponibles (cero invenciones).
8. Atribución visible de la procedencia de cada estadística.
9. Comparación justa contextualizada por edad y ritmo de juego.
10. Prescripción de objetivos de entrenamiento revisables por el Coach Ricardo.
11. Permisos RBAC validados para `superadmin`, `coach`, `guardian` y `student`.
12. Protección y privacidad total de expedientes de menores.
13. Cumplimiento legal de licencias para el uso en la academia.
14. Cero regresiones en la base de datos y módulos de Wild Wolves OS.
