# Documentación: Landing Page y Despliegue (Hosting)

Este documento detalla la arquitectura de la Landing Page estática, su integración con la Web App (Ionic), y el proceso automatizado de construcción y despliegue en Firebase Hosting.

## 1. Landing Page (`/site`)

La Landing Page es un sitio web estático diseñado para ser la cara principal de "Sion: Leche y Miel". Su objetivo es presentar la visión del proyecto y ofrecer enlaces para descargar las apps móviles o usar la versión web.

*   **Ubicación:** `/site` (en la raíz del proyecto).
*   **Tecnologías:** HTML5 Semántico, CSS3 Moderno (Variables, Flexbox, Grid), Vanilla JS.
*   **Características Clave:**
    *   **Responsive:** Adaptable a móviles y escritorio.
    *   **Smart Download:** Detecta automáticamente si el usuario usa iOS o Android para ofrecer el enlace correcto a la tienda.
    *   **Estilo Premium:** Diseño consistente con la identidad visual "Sion" (Dorados, Mármol, Tipografía Serif).

## 2. Estrategia de Alojamiento (Firebase Hosting)

Utilizamos **Firebase Hosting** para servir tanto la Landing Page como la Aplicación Web Progresiva (PWA) desde el mismo dominio, pero en rutas diferentes.

*   **Raíz (`/`):** Sirve la Landing Page estática.
*   **Subdirectorio (`/app/`):** Sirve la aplicación Ionic/Angular.

### Configuración (`firebase.json`)

El archivo `firebase.json` orquesta este comportamiento mediante reglas de reescritura (**rewrites**):

```json
{
  "hosting": {
    "public": "deploy_public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/app/**",
        "destination": "/app/index.html"
      },
      {
        "source": "/lectura/**",
        "destination": "/app/index.html"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

*   **`deploy_public`**: Es la carpeta unificada que se sube a Firebase. No existe en el control de versiones; se genera al construir.
*   **Rewrites**:
    *   Cualquier tráfico a `/app/**` se redirige a `/app/index.html` (para que Angular Router maneje la navegación).
    *   Rutas profundas como `/lectura/**` también caen en la app.
    *   El resto (`**`) cae en `/index.html` (la Landing Page).

## 3. Script de Automatización (`build-deploy.sh`)

Para evitar errores manuales, se ha creado un script de bash que automatiza todo el proceso de ensamblaje.

**Ubicación:** `./build-deploy.sh` (Raíz)

**¿Qué hace el script?**
1.  **Limpieza:** Borra carpetas `www` y `deploy_public` antiguas.
2.  **Compilación Ionic:** Ejecuta `npm run build` en modo producción con una bandera crítica:
    *   `--base-href=/app/`: Esto le dice a Angular que la app ya no vive en la raíz, sino en la subcarpeta `/app/`. Esto corrige automáticamente las rutas de los activos (JS, CSS).
3.  **Ensamblaje:**
    *   Crea la carpeta `deploy_public`.
    *   Copia el contenido de `/site` a la raíz de `deploy_public`.
    *   Copia el contenido compilado de `/www` a `deploy_public/app/`.

## 4. Guía de Despliegue

### Requisitos Previos
*   Tener Firebase CLI instalado (`npm install -g firebase-tools`).
*   Haber iniciado sesión (`firebase login`).

### Pasos para Desplegar

1.  **Construir y Ensamblar:**
    Ejecuta el script desde la terminal en la raíz del proyecto:
    ```bash
    ./build-deploy.sh
    ```

2.  **Probar Localmente (Opcional pero Recomendado):**
    Antes de subir, verifica que todo funcione levantando un servidor local en la carpeta generada:
    ```bash
    cd deploy_public
    python3 -m http.server 8000
    # Abre http://localhost:8000 en tu navegador
    ```

3.  **Desplegar a Producción:**
    Si todo está bien, sube los archivos a Firebase:
    ```bash
    # firebase deploy me decidi por cloudflare
    ```
4.  **Despliegue en Cloudflare:**
    wrangler pages deploy . --project-name=slm-web-landing-app
    el . es dentro del directorio deploy_public

## Sincronizacion del R2 Clouflare
aws s3 sync . s3://slm-audios/file/audios --endpoint-url https://5277a6e7306d47f540ba4f1f826a4ea6.r2.cloudflarestorage.com --profile r2
El . es dentro del directorio donde estan todos los libros y capitulos

## 5. Solución de Problemas Comunes

*   **La Web App se ve en blanco:**
    *   Generalmente es por el `base-href`. Asegúrate de usar **siempre** `./build-deploy.sh` y no solo `ionic build`.
    *   Verifica que no tengas rutas absolutas en tu código (ej: `/assets/img/...`). Deben ser relativas (`assets/img/...`) o usar el `base-href` correctamente.

*   **Imágenes no cargan en la Web App:**
    *   Revisa que en tus archivos JSON (como `planesLectura.json`) las rutas de imagen no tengan `../../`. Deben ser limpias: `assets/imgs/nombre.jpg`.

*   **Deep Links (Enlaces Compartidos) no abren la app:**
    *   Asegúrate de que la regla `rewrites` en `firebase.json` incluya el patrón de tu deep link (ej: `/plan/**`) apuntando a `/app/index.html`.

