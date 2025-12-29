# Guía de Desarrollo y Arquitectura

Esta guía detalla los componentes críticos del sistema implementados hasta la Fase 5.

## 1. Estrategia "Offline-First"
La aplicación prioriza la disponibilidad inmediata.
1.  **Lectura:** Los planes y textos se cargan desde JSON locales o SQLite.
2.  **Escritura:** Cualquier acción del usuario (marcar versículo, completar día) se guarda **inmediatamente** en `SQLite` (`LocalBibleRepository`).
3.  **Sincronización:** Ocurre en segundo plano.

## 2. Autenticación (AuthService)
- **Modo Invitado (Offline):** Por defecto, el usuario es un "Invitado". No se crea sesión en Firebase. Todos los datos son locales(SE ELIMINO).
- **Modo Registrado:** Si el usuario hace login (Google/Email), se obtiene un UID de Firebase.
- **Transición:** Al hacer login, los datos locales existentes *deberían* fusionarse con la nube (Lógica de fusión pendiente de refinamiento completo).

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
