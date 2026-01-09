# Estrategia de Firebase y Sincronización "Smart Delta"

Este documento detalla la arquitectura de sincronización implementada para minimizar costos y maximizar la eficiencia en el uso de Firebase (facturación Spark/Blaze).

## 1. Problema a Resolver
El modelo de facturación de Firebase Firestore cobra por **Lectura, Escritura y Eliminación** de documentos.
Una estrategia de sincronización ingenua ("Bajar todo cada vez") resulta exponencialmente costosa a medida que crece la base de datos de cada usuario.

**Ejemplo de Riesgo:**
*   Usuario con 5,000 notas y marcadores.
*   Abre la app 1 vez al día.
*   Costo anual: 5,000 * 365 = 1,825,000 lecuras. (Insostenible en plan gratuito para muchos usuarios).

## 2. Solución: Arquitectura "Smart Delta"
Hemos implementado un mecanismo de semáforo basado en metadatos que garantiza un consumo mínimo de lecturas, independientemente del tamaño de la base de datos del usuario.

### Principios
1.  **Atomicidad:** Cada escritura de datos (Marcador, Nota, Progreso) actualiza simultáneamente un timestamp maestro.
2.  **Verificación Ligera:** Antes de sincronizar, verificamos solo los metadatos (1 lectura).
3.  **Descarga Diferencial:** Solo descargamos documentos creados/modificados después de la última sincronización local.

---

## 3. Implementación Técnica

### A. Estructura de Datos (Firestore)

**Colecciones de Datos:**
*   `users/{uid}/bookmarks/{id}`
*   `users/{uid}/notes/{id}`
*   `users/{uid}/reading_progress/{id}` (Inyectamos campo `updated_at` virtual para sync).

**Documento de Metadatos:**
*   `users/{uid}/metadata/sync_info`
    ```json
    {
      "bookmarks_updated_at": 1704999123000,
      "notes_updated_at": 1704999123000,
      "reading_progress_updated_at": 1704999123000
    }
    ```

### B. Flujo de Sincronización (`SyncService.ts`)

#### Paso 1: PUSH (Cliente -> Nube)
*   Identifica registros locales con `is_synced = 0`.
*   Envía los datos a Firestore usando `Batch Writes` (Escritura en Lote).
*   **Crítico:** El repositorio `FirebaseBibleRepository` inyecta automáticamente la actualización del timestamp en `sync_info` dentro del mismo lote.

#### Paso 2: SMART PULL (Nube -> Cliente)
1.  **Lectura de Semáforo:** `sync_info` (Costo: 1 Lectura).
2.  **Comparación:**
    *   `cloud.bookmarks_updated_at > local.lastSyncTime`?
    *   `cloud.notes_updated_at > local.lastSyncTime`?
3.  **Acción (Delta):**
    *   Si es afirmativo, ejecuta Query: `collection.where('updated_at', '>', lastSyncTime)`.
    *   Descarga *solo* los documentos nuevos/modificados.
    *   Si es negativo, no hace nada.

---

## 4. Análisis de Costos (Ejemplo Real)

**Escenario:** Usuario con 10,000 marcadores existentes. Abre la app en un iPad (nuevo dispositivo).

| Estrategia | Operación | Costo (Lecturas) |
| :--- | :--- | :--- |
| **Sincronización Clásica** | Descargar todo `getBookmarks()` | **10,000** |
| **Smart Delta (Día Normal)** | Verificar `sync_info` (Sin cambios) | **1** |
| **Smart Delta (Con Cambios)** | Usuario agregó 5 marcadores en iPhone | **6** (1 meta + 5 docs) |

**Ahorro:** 99.9% en el uso diario.

## 5. Mantenimiento y Futuro
*   **Limpieza:** No se requiere. Firestore escala infinitamente.
*   **Migración:** Si se cambia a VPS (MongoDB) en el futuro, la lógica de "Delta Sync" debe mantenerse en la API del servidor para mantener la eficiencia del ancho de banda y bases de datos.
