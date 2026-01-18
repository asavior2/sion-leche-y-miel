# Infraestructura y Despliegue - Sion: Leche y Miel

Este documento detalla la infraestructura tecnológica utilizada para el despliegue de la aplicación web y el alojamiento de los archivos de audio (Biblia dramatizada).

## 1. Landing Page y Web App (Cloudflare Pages)

La aplicación web ("Sion: Leche y Miel") está alojada en **Cloudflare Pages**, lo que garantiza alta velocidad, seguridad y distribución global.

### Despliegue Manual
Para desplegar manualmente la aplicación (por ejemplo, actualizando la landing page), utilizamos `wrangler`.

**Comando:**
```bash
wrangler pages deploy . --project-name=slm-web-landing-app
```

> **Nota:** Este comando debe ejecutarse desde el directorio raíz del proyecto o donde se encuentre el contenido estático compilado (`www` o `dist`), dependiendo de la configuración de `wrangler.toml`.

---

## 2. Almacenamiento de Audios (Cloudflare R2)

Los archivos de audio de la Biblia se almacenan en **Cloudflare R2**, un almacenamiento de objetos compatible con S3. Esto permite evitar los costos de egreso de AWS S3 y aprovechar la red global de Cloudflare.

### Estructura de Archivos
Actualmente manejamos dos versiones de estructura de audios:

#### Versión 2 (Actual - `v2`)
*   **Ruta Base:** `https://media.sionlecheymiel.com/audios_v2/`
*   **Estructura:** `/audios_v2/{LIBRO}/{CAPITULO}.mp3`
    *   Ejemplo: `/audios_v2/1/1.mp3` (Génesis 1)
*   **Archivo Zip:** `https://media.sionlecheymiel.com/descargas/biblia_audio_v2.zip`
    *   Utilizado para la descarga offline en la App Móvil.

#### Versión 1 (Legacy)
*   **Ruta Base:** `.../file/audios/{LIBRO}/{CAPITULO}.mp3`
*   Compatibilidad mantenida para versiones antiguas de la app que no han actualizado.

### Sincronización de Audios (AWS CLI)
Para subir o sincronizar los audios locales con el bucket R2, utilizamos la AWS CLI configurada con las credenciales de Cloudflare R2.

**Comando de Sincronización:**
```bash
aws s3 sync . s3://slm-audios/audios_v2/ \
  --endpoint-url https://5277a6e7306d47f540ba4f1f826a4ea6.r2.cloudflarestorage.com \
  --profile r2
```

**Explicación del comando:**
*   `sync .`: Sincroniza el directorio actual (local).
*   `s3://slm-audios/audios_v2/`: Destino en el bucket R2.
*   `--endpoint-url`: URL específica del endpoint de Cloudflare R2 (reemplazando al de AWS estándar).
*   `--profile r2`: Utiliza el perfil de credenciales `r2` configurado en `~/.aws/credentials` o `~/.aws/config`.

---

## 3. Estrategia de Versionado de Audio (App Móvil)

Para gestionar las actualizaciones de los archivos de audio en los dispositivos de los usuarios, hemos implementado una estrategia de "Cache Busting" basada en un archivo bandera.

1.  **Archivo Bandera:** `audio_version_v2.txt`
2.  **Lógica:**
    *   Al iniciar la app (`LecturaPage` o `ProfilePage`), el sistema verifica si existe la carpeta de audios (`por-Capitulos`).
    *   Si la carpeta existe pero **NO** contiene el archivo `audio_version_v2.txt`, se asume que son audios legacy (v1).
    *   **Acción:** La carpeta antigua se borra automáticamente, forzando al usuario a descargar la nueva versión (v2) si desea escuchar offline.
    *   Al completar una descarga exitosa de la v2, la app crea el archivo `audio_version_v2.txt` para marcar la instalación como actualizada.

---

## 4. Notas Adicionales

*   **Dominio de Medios:** `media.sionlecheymiel.com` está configurado en Cloudflare para apuntar al bucket R2 (o a través de un Worker si se requiere lógica adicional).
*   **Ionic/Cordova:** La app móvil utiliza el plugin `cordova-plugin-file` para la gestión local de estos archivos.
