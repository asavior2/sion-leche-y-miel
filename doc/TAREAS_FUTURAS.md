# Roadmap y Tareas Futuras

Este documento lista las tareas pendientes y mejoras sugeridas para continuar el desarrollo del proyecto.

## ✅ Completado (Fases 1-5)
- [x] Configuración inicial (Ionic/Firebase).
- [x] Implementación de SQLite y Repositorios Locales.
- [x] Sincronización Básica y "Smart Sync".
- [x] Gamificación Básica (Medallas, Racha).
- [x] Integración de Analíticas.
- [x] Refinamiento UI (Perfil).
- [x] Sincronización de Notas (UI + Sync).
- [x] Login Social (Google) - Implementado usando `cordova-plugin-googleplus`.
- [x] Data Merge Strategy (High Priority)
  - [x] Implement `mergeLocalDataWithCloud` logic <!-- id: 18 -->
  - [x] Handle Guest -> User transition <!-- id: 19 -->
- [x] Worker de Estadísticas - Implementado en `stats.worker.ts`.
- [x] Optimización de Carga de Planes - Implementado "Lazy Rendering" (+/- 15 días) en `PlanDetallePage`.

## 📝 Pendientes (Backlog)

### Alta Prioridad

3. **Crear vista para sugerir registrarse**
    - Crear una vista para que al abrir la app le salga una vista donde se le explique las vondades de registrarse y recomendarle hacerlo, esta vista deve tener la opcion de iniciar el proceso de registro, hacerlo en otro momento y una opcion de no quiero hacerlo. Si el usuario elige hacerlo en otro momento se deberia de recordar el landi cuando vuelba a usar la app, si dice no quiere hacerlo poner un creck que diga no recordar, si el usuario lo activo no se le recordara o no se le mostrar esta vista de recordatario de registrarse. 
    - Al seleccionar un versículo cambiar el botón flotante por un un set de opciones que aparezcan en la parte inferior donde le permita al usuario crear un marcador, copiar el vérselo, crear una nota y selecciónnar el color que quiere darle al versículo como marcado. 

### Mantenimiento
1.  **Limpieza de Código:**
    - [x] `LeerPlanPage.ts` es un archivo muy grande (>1000 líneas). Refactorizar lógica de audio y renderizado a componentes o servicios separados. (Completado: Lógica de audio movida a `AudioPlayerService`)
    - Estandarizar tipos `any` a interfaces TypeScript estrictas (`BibleVerse`, `ReadingPlanDay`).
