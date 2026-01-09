# Estrategia de Analítica y Sincronización (Smart Delta)

## Resumen
La estrategia combina analítica de alto nivel para UX con una sincronización de datos ultra-eficiente ("Smart Delta") para minimizar costos operativos en Firebase.

## 1. Analítica (Firebase Analytics)
**Enfoque:** Compromiso general y segmentación.
*   **Screen Tracking:** Vistas principales (`Lectura`, `Planes`, etc.) mediante `logScreenView`.
*   **User Segmentation:** Propiedad `user_type` (`guest` vs `registered`).
*   **Eventos:** Se eliminó el rastreo granular (capítulo por capítulo) para reducir ruido y costos.

---

## 2. Estrategia de Sincronización "Smart Delta" (Costo Casi Cero)
Para evitar lecturas masivas en Firebase (que tienen costo y límites diarios), se implementó un sistema de "Semáforo" inteligente.

### Problema Anterior (Full Pull)
*   Cada vez que la app sincronizaba, descargaba **TODA** la colección de marcadores/notas.
*   Si un usuario tenía 1,000 marcadores, consumía **1,000 lecturas** cada día.
*   Riesgo: Agotar la cuota gratuita (50k/día) con pocos usuarios.

### Solución Implementada (Smart Delta)
**Costo Diario Garantizado: 1 Lectura.**

#### A. Metadatos de Sincronización (`sync_info`)
Se creó un documento único `users/{uid}/metadata/sync_info` que almacena timestamps:
```json
{
  "bookmarks_updated_at": 1704812345678,
  "notes_updated_at": 1704812345999,
  "reading_progress_updated_at": 1704812349999
}
```

#### B. Flujo "Traffic Light"
1.  **Check (1 Lectura):** La app lee *solo* el documento `sync_info`.
2.  **Compare:** Compara los timestamps de la nube con `lastSyncTime` local.
3.  **Action:**
    *   **Iguales (Verde):** No hay cambios. **FIN.** (Gasto Total: 1 lectura).
    *   **Nube es Mayor (Rojo):** Hay datos nuevos. Se ejecuta una query incremental: `where('updated_at', '>', lastSyncTime)`. Se descargan *solo* los 2 o 3 items nuevos.

### Detalles Técnicos
*   **Atomic Writes:** Al guardar un marcador (Push), se usa un `batch` para guardar el dato Y actualizar `sync_info` atómicamente.
*   **Local Persistence:** SQLite sigue siendo la fuente de la verdad para funcionamiento offline.
