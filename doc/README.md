# Sion Leche y Miel (SLM) 2.0 - Documentación del Proyecto

## 📖 Descripción General
**Sion Leche y Miel 2.0** es una aplicación móvil híbrida desarrollada con **Ionic 7+** y **Angular**, diseñada para ofrecer una experiencia de lectura de planes bíblicos robusta y centrada en el usuario.

La característica principal de la arquitectura es su filosofía **"Offline-First"** (Primero sin conexión). Esto significa que la aplicación es totalmente funcional sin conexión a internet, almacenando todos los datos localmente en **SQLite** (en dispositivos móviles) y sincronizándose de manera inteligente con la nube (**Firebase**) cuando hay conexión disponible.

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Framework:** Ionic 7 / Angular 16+
- **Lenguaje:** TypeScript
- **Base de Datos Local:** 
  - **Móvil (iOS/Android):** SQLite (plugin nativo `cordova-sqlite-storage`).
  - **Web/Desarrollo:** `MockSQLite` sobre `localStorage` (para pruebas rápidas en navegador con `ionic serve`).
- **Nube (Backend as a Service):** Firebase
  - **Authentication:** Gestión de usuarios (Google Auth, Email).
  - **Firestore:** Base de datos NoSQL para respaldo y sincronización.
  - **Analytics:** Seguimiento de eventos de uso.

### Patrones de Diseño Clave
1.  **Repository Pattern:** Se utilizan "Repositorios" para abstraer la fuente de datos.
    - `LocalBibleRepository`: Maneja todas las operaciones CRUD contra SQLite.
    - `FirebaseBibleRepository`: Maneja todas las operaciones contra Firestore.
2.  **Service Layer:** Los componentes (páginas) nunca acceden a los repositorios directamente, sino a través de Servicios.
    - `BibliaService`: Lógica de negocio de lectura.
    - `SyncService`: Orquestador de sincronización entre Local y Cloud.
    - `AuthService`: Gestión de sesión.
    - `GamificationService`: Lógica de medallas y estadísticas.

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js (v18+ recomendado)
- Ionic CLI (`npm install -g @ionic/cli`)

### Comandos Comunes
```bash
# Instalar dependencias
npm install

# Ejecutar en navegador (Modo Desarrollo)
# Nota: Usa MockSQLite, los datos persisten en localStorage del navegador.
ionic serve

# Compilar para producción
npm run build
```

## 📂 Estructura de Directorios Clave
- `src/app/core/repositories`: Lógica de acceso a datos (Local/Cloud).
- `src/app/core/services`: Servicios de negocio (Sync, Auth, Analytics).
- `src/app/core/interfaces`: Modelos de datos TypeScript.
- `src/app/pages`: Vistas de la aplicación (Profile, Login, etc.).
- `src/app/leer-plan`: Página principal de lectura (Lógica compleja de renderizado).

---
# La imagenes de play store y apple store entan en:
https://www.figma.com/
---
*Documentación generada automáticamente por Antigravity AI - Diciembre 2025*
