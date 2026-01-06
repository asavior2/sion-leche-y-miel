# Sion: Leche y Miel (SLM)

> **Versión Bíblica Sion: "Leche y Miel"**
> Aplicación móvil híbrida para consultar, leer y estudiar las escrituras de la versión bíblica "Sion: Leche y Miel".

![Ionic](https://img.shields.io/badge/Ionic-7.x-blue) ![Angular](https://img.shields.io/badge/Angular-18.x-red) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Tabla de Contenidos
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [🚀 Uso con Docker (Recomendado)](#-uso-con-docker-recomendado)
- [🛠️ Instalación y Uso Local](#️-instalación-y-uso-local)
- [📱 Construcción y Despliegue (Notas Legacy)](#-construcción-y-despliegue-notas-legacy)

---

## ✨ Características

*   **Lectura Offline**: Acceso completo a los libros y capítulos sin conexión a internet.
*   **Concordancia**: Búsqueda avanzada de palabras y versículos.
*   **Planes de Lectura**: Seguimiento de planes anuales y temáticos (ej. Año Bíblico).
*   **Audio**: Reproducción de capítulos (requiere conexión inicial para descarga o streaming).
*   **Personalización**:
    *   Modo Oscuro / Claro.
    *   Ajuste de tamaño de fuente.
    *   Resaltado y marcado de versículos favoritos.
*   **Navegación Intuitiva**: Interfaz basada en pestañas (*tabs*) para acceso rápido.

---

## 💻 Tecnologías

Este proyecto está construido con tecnologías web modernas adaptadas para móviles:

*   **Framework**: [Ionic 7](https://ionicframework.com/)
*   **Core**: [Angular 18](https://angular.io/)
*   **Lenguaje**: TypeScript 5.4
*   **Estilos**: SCSS (Sass)
*   **Empaquetado Móvil**: Cordova (con plugins legacy y soporte nativo).
*   **Dependencias Clave**:
    *   `swiper` (Sliders/Carruseles)
    *   `rxjs` (Programación Reactiva)
    *   `@ionic/storage` (Persistencia de datos local)

---

## ⚙️ Requisitos Previos

*   **Node.js**: v18+ (Recomendado para Angular 18)
*   **NPM**: v10+
*   **Ionic CLI**: `npm install -g @ionic/cli`
*   **Docker Desktop** (Opcional, pero recomendado para desarrollo aislado).

---

## 🚀 Uso con Docker (Recomendado)

El proyecto incluye configuración de Docker para garantizar un entorno de desarrollo consistente sin ensuciar tu sistema local.

### Comandos Comunes

**1. Iniciar la aplicación**
Levanta el servidor de desarrollo. La app estará disponible en `http://localhost:8100`.
```bash
docker-compose up
```
*Nota: La primera vez tomará unos minutos mientras instala las dependencias.*

**2. Reconstruir el contenedor**
Si cambias el `Dockerfile` o necesitas una instalación limpia de `node_modules`.
```bash
docker-compose up --build
```

**3. Ejecutar comandos de Ionic/NPM dentro del contenedor**
Para instalar paquetes o ejecutar scripts sin tener Node instalado en tu PC.
```bash
# Ejemplo: Construir la app para producción
docker-compose run --rm app npm run build

# Ejemplo: Verificar la compilación de Ionic
docker-compose run --rm app ionic build

# Ejemplo: Instalar una nueva dependencia
docker-compose run --rm app npm install nombre-paquete --legacy-peer-deps
```

**4. Detener el contenedor**
```bash
docker-compose down
```

---

## 🛠️ Instalación y Uso Local

Si prefieres ejecutarlo directamente en tu máquina:

1.  **Clonar el repositorio**:
    ```bash
    git clone <url-del-repo>
    cd ionicBibliaSLM2
    ```

2.  **Instalar dependencias**:
    > **IMPORTANTE**: Debido a algunas dependencias de Cordova antiguas, es necesario usar el flag `--legacy-peer-deps`.
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Ejecutar en el navegador**:
    ```bash
    ionic serve
    ```

---
# Desarrollo pruebas en dispocitivos 
```bash
ionic cordova run android --target=emulator-5554
```

---
## 🏗️ Construcción y Despliegue (Actual 2025)
Este proyecto utiliza **Cordova** con **Angular 18**. Debido a la mezcla de tecnologías modernas y plugins legacy, el proceso de construcción tiene requisitos específicos.

### 1. Preparación del Entorno
*   **JDK**: Requiere JDK 11 o 16 (dependiendo de la versión de Gradle de Cordova).
*   **Android SDK**: API Level 33+ recomendado.
*   **Node.js**: v18.x

### 2. Comandos de Construcción
**Instalación Limpia:**
Es CRÍTICO usar el flag `--legacy-peer-deps` para evitar conflictos de dependencias entre Ionic 7 y plugins antiguos.
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Generar APK de Producción:**
```bash
# Construye el bundle de Angular optimizado y prepara la plataforma Android
ionic cordova build android --prod --release
```
_El APK no firmado se generará en: `platforms/android/app/build/outputs/apk/release/`_

**Generar App Bundle (.aab) para Play Store:**
```bash
ionic cordova build android --prod --release -- -- --packageType=bundle
```

---

## 🏛️ Construcción y Despliegue (Referencia Legacy)
> *Esta sección contiene notas originales del proyecto (2020-2023) sobre compilación manual, keystores y firma. Aún son válidas como referencia para el proceso de firma.*

### Pruebas con Genymotion / Emulador

```bash
# Construir para Android
ng run app:ionic-cordova-build --platform=android

# Correr en un dispositivo específico (ej. Genymotion)
cordova run android --target=192.168.56.102:5555
```

### Generación de APK/IPA

#### Android
```bash
# Documentación oficial: https://ionicframework.com/docs/v1/guide/publishing.html

# Generar APK release (Output: platforms/android/build/outputs/apk)
ionic cordova build --release android
```

#### iOS
```bash
ionic cordova build ios --release
cordova emulate ios
```

### Certificados y Firma (Android)

Comandos para gestión de Keystores y firma manual de APKs.

**Generar Keystores:**
```bash
# Generar keystore de release genérico
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

# Generar keystore específico para Sion Leche y Miel
keytool -genkey -v -keystore sionLecheMiel.keystore -alias sionLecheMiel -keyalg RSA -keysize 2048 -validity 10000
```

**Exportar Certificados (Hash):**
```bash
# Debug Android
keytool -exportcert -keystore ~/.android/debug.keystore -list -v -alias <alias-name>

# Release App
keytool -exportcert -keystore sionLecheMiel.keystore -list -v -alias sionLecheMiel
```

**Firma para Google Play (App Bundle / Upload Key):**
```bash
# 1. Generar keystore de subida (Upload Key)
keytool -genkeypair -alias upload -keyalg RSA -keysize 2048 -validity 9125 -keystore keystore.jks 

# 2. Exportar clave pública (PEM)
keytool -export -rfc -alias upload -file upload_certificate.pem -keystore keystore.jks

# 3. Firmar APK con keystore de la app
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore sionLecheMiel.keystore android-release-unsigned.apk sionLecheMiel

# 4. Firmar para subida a Play Store
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore keystore.jks app-release-unsigned.apk upload
```

#### Optimización final (Zipalign)
```bash
# Ajusta la ruta a tu versión de Android SDK build-tools
/home/asavior/Android/Sdk/build-tools/28.0.3/zipalign -v 4 app-release-unsigned.apk sion-leche-y-miel-1-0-0.apk
```

> **Nota Adicional**: Tener en cuenta que hay algunos archivos "assets" (como audios o JSONs específicos) que podrían no estar en el repositorio por temas de peso. Asegúrate de tenerlos en la carpeta `src/assets` para que la aplicación funcione correctamente.
