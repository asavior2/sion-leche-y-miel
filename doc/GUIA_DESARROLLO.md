# Guía de Desarrollo y Arquitectura

Esta guía detalla los componentes críticos del sistema implementados hasta la Fase 5.

## 0. Entorno de Desarrollo (Docker)
El proyecto ha migrado a un entorno contenerizado para garantizar consistencia.
- **Docker Compose:** Orquesta el contenedor de la aplicación (`ionic-biblia`).
- **Volúmenes:** Sincronizan el código local con el contenedor en tiempo real.
- **Dependencias:** Se gestionan dentro del contenedor (`npm install --legacy-peer-deps`), aislando el sistema anfitrión de conflictos de versiones de Node.js.

## 1. Estrategia "Offline-First"
La aplicación prioriza la disponibilidad inmediata.
1.  **Lectura:** Los planes y textos se cargan desde JSON locales o SQLite.
2.  **Escritura:** Cualquier acción del usuario (marcar versículo, completar día) se guarda **inmediatamente** en `SQLite` (`LocalBibleRepository`).
3.  **Sincronización:** Ocurre en segundo plano.

## 2. Autenticación (AuthService)
- **Estado Actual:** La aplicación soporta funcionamiento completo sin autenticación (Modo "Guest").
- **Login Social:** Implementado (Google) pero opcional.
- **Nota:** La lógica estricta de "Solo Invitado" ha evolucionado a un modelo híbrido donde el usuario inicia sin cuenta y puede vincularla posteriormente para respaldar datos.

## 3. Sincronización Inteligente (SyncService)
Ubicación: `src/app/core/services/sync.service.ts`

La sincronización sigue una estrategia de **"Smart Push / Daily Pull"**:

### A. Smart Push (Envío Inmediato)
Se activa cada vez que el usuario modifica datos (ej. guarda un marcador).
- **Trigger:** Llamada a `syncAll()` desde `LeerPlanPage`.
- **Lógica:** 
    1. Verifica si hay conexión (`navigator.onLine`).
    2. Verifica si hay items sin sincronizar en local (`getUnsynced...`).
    3. Si hay cambios, los envía a Firestore **inmediatamente**.
    4. Marca los items como `synced = 1` en SQLite.

### B. Daily Pull (Recepción Diaria)
Se activa al iniciar la app o cuando se llama a `syncAll` sin cambios locales.
- **Trigger:** `AppComponent` al inicio.
- **Lógica:**
    1. Verifica si pasaron más de **24 horas** desde el último Pull (`PULL_COOLDOWN_MS`).
    2. Si es elegible, descarga datos de Firestore.
    3. Guarda los datos en SQLite (sobrescribiendo versiones anteriores).

## 4. Base de Datos Local (SQLite)
Ubicación: `src/app/core/services/database.service.ts`

- **Tablas Principales:**
    - `bookmarks`: Marcadores de versículos. Campos: `id`, `user_id`, `libro`, `capitulo`, `versiculo`, `created_at`, `is_synced`.
    - `reading_progress`: Progreso de planes.
    - `user_stats`: Estadísticas agregadas (para gamificación).

- **MockSQLite:**
    - En desarrollo web (`ionic serve`), `database.service.ts` detecta que no es Cordova y usa `MockSQLiteObject`.
    - Este mock simula las consultas SQL usando `localStorage` para persistencia básica.
    - **Nota:** No soporta consultas complejas (JOINs), solo operaciones CRUD básicas simuladas.

## 5. Analíticas (AnalyticsService)
Ubicación: `src/app/core/services/analytics.service.ts`

Wrapper sobre `AngularFireAnalytics`.
- **Eventos Rastreados:**
    - `select_content`: Lectura de capítulo.
    - `earn_virtual_currency` (bookmark): Guardado de marcador.
    - `complete_plan_day`: Finalización de día de lectura.

## 6. Depuración
En `ProfilePage` existe un **"Modo Desarrollador"**.
- Muestra un botón "Ver Datos Internos".
- Imprime en consola y pantalla un JSON con el estado actual de `user`, `stats`, y `unsyncedBookmarks` de la base de datos local. Utilísimo para verificar si SQLite está guardando datos.

## 7. Sistema de Audio (AudioPlayerService)
Ubicación: `src/app/core/services/audio-player.service.ts`

Centraliza toda la lógica de reproducción de audio, eliminando la duplicidad de código que existía entre `LeerPlanPage` y `LecturaPage`.

- **Responsabilidades:**
    - Gestión del objeto `HTMLAudioElement`.
    - Control de estado (`isPlaying$`, `currentVerse$`).
    - Mapeo de tiempos (`calculateTimeMap`): Sincroniza el tiempo de reproducción con los versículos para el resaltado automático.
    - **Robustez:** Implementa lógica de respaldo (*fallback*). Si el archivo de audio local no existe, reproduce automáticamente desde la URL remota.

- **Integración en Vistas:**
    - Las páginas (`LecturaPage`, `LeerPlanPage`) solo inyectan este servicio y se suscriben a sus Observables para actualizar la UI (resaltado de versículos, scroll automático).
    - Se ha eliminado la lógica deprecated de "reproductor" local de los componentes.
