# Roadmap y Tareas Futuras

Este documento lista las tareas pendientes y mejoras sugeridas para continuar el desarrollo del proyecto.

## ✅ Completado (Fases 1-5)
- [x] Configuración inicial (Ionic/Firebase).
- [x] Implementación de SQLite y Repositorios Locales.
- [x] Sincronización Básica y "Smart Sync".
- [x] Gamificación Básica (Medallas, Racha).
- [x] Integración de Analíticas.
- [x] Refinamiento UI (Perfil).

## 📝 Pendientes (Backlog)

### Alta Prioridad
1.  **Sincronización de Notas:**
    - Implementar lógica de notas nota, esta deben registrar el versículo o los versiculos y la nota que realizo el usuario, debe crearse una marca en el versículo para indicar que tiene una nota donde al darle click pueda ver la nota. 
    - Actualmente solo se sincronizan Marcadores y Progreso. Falta implementar `syncNotes` en `SyncService` y crear la tabla `notes` en SQLite.
2.  **Login Social (Google/Apple):**
    - Implementar el flujo real de `loginGoogle` en `ProfilePage` usando `@codetrix-studio/capacitor-google-auth` o plugin nativo similar.
3.  **Fusión de Datos (Merge Strategy):**
    - Mejorar la lógica cuando un usuario "Invitado" se loguea. Actualmente los datos locales podrían sobrescribirse o duplicarse. Se necesita una estrategia clara de "Local -> Cloud Merge", en este caso lo usuario invitado deben registrar todo localmente y si deciden registrarse se debe hacer una sincronizacion de sus datos locales con firebase para pertenencia de datos en caso de actualizar o borrar o reinstalar la aplicaicon.

### Media Prioridad
1.  **Worker de Estadísticas:**
    - Crear un Web Worker o servicio de fondo que recalcule `UserStats` periódicamente basándose en el historial completo de lectura, en lugar de cálculos al vuelo.
2.  **Optimización de Carga de Planes:**
    - Los planes de lectura grandes (365 días) se cargan completos en memoria. Implementar carga perezosa (lazy loading) por mes o semana.
3. **Crear vista para sugerir registrarse**
    - Crear una vista para que al abrir la app le salga una vista donde se le explique las vondades de registrarse y recomendarle hacerlo, esta vista deve tener la opcion de iniciar el proceso de registro, hacerlo en otro momento y una opcion de no quiero hacerlo. Si el usuario elige hacerlo en otro momento se deberia de recordar el landi cuando vuelba a usar la app, si dice no quiere hacerlo poner un creck que diga no recordar, si el usuario lo activo no se le recordara o no se le mostrar esta vista de recordatario de registrarse. 
    - Al seleccionar un versículo cambiar el botón flotante por un un set de opciones que aparezcan en la parte inferior donde le permita al usuario crear un marcador, copiar el vérselo, crear una nota y selecciónnar el color que quiere darle al versículo como marcado. 

### Mantenimiento
1.  **Limpieza de Código:**
    - `LeerPlanPage.ts` es un archivo muy grande (>1000 líneas). Refactorizar lógica de audio y renderizado a componentes o servicios separados.
    - Estandarizar tipos `any` a interfaces TypeScript estrictas (`BibleVerse`, `ReadingPlanDay`).
