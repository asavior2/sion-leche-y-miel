# Configuración de Servidor para Deep Links (Enlaces Profundos)

Para que los enlaces (ej. `https://sionlecheymiel.com/app/bible/...`) abran la aplicación en lugar del navegador, debes alojar dos archivos específicos en tu servidor web.

**Ruta requerida:** Los archivos deben estar en una carpeta llamada `.well-known` en la raíz de tu dominio.
*   `https://sionlecheymiel.com/.well-known/apple-app-site-association` (Sin extensión)
*   `https://sionlecheymiel.com/.well-known/assetlinks.json`

---

## 1. iOS: `apple-app-site-association`
**Importante:** Este archivo **NO** debe tener extensión `.json`. Debe llamarse exactamente `apple-app-site-association`.

He extraído tu **Team ID** (`7H86C9Z5FF`) y tu **Bundle ID** (`io.slm.starter`) de la configuración de tu proyecto. Este contenido está listo para usar:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "7H86C9Z5FF.io.slm.starter",
        "paths": [
          "/app/bible/*",
          "/app/*",
          "*"
        ]
      }
    ]
  }
}
```

---

## 2. Android: `assetlinks.json`
Este archivo verifica la firma de tu aplicación en Android.

Debes reemplazar `[TU_SHA256_FINGERPRINT]` con el código real de tu llave de firma (Keystore) de producción.

**Contenido del archivo:**
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "io.slm.starter",
      "sha256_cert_fingerprints": [
        "56:2B:D3:AB:2A:DC:3D:66:49:E4:9A:96:FC:DB:14:6C:CE:EA:E2:EA:E2:57:92:C8:93:0D:52:1F:EE:4A:10:EE"
      ]
    }
  }
]
```

### ¿Cómo obtener el SHA256?

**CASO 1: Usas Google Play App Signing (Lo más común)**  
Si Google administra tus llaves (como mencionas), **NO** uses la llave de tu computadora (upload key) para producción, porque Google resignará la app.
1.  Entra a **Google Play Console**.
2.  Ve a tu aplicación -> **Varios** (o Configuración) -> **Firma de aplicaciones (App Integrity/App signing)**.
3.  Busca la sección **"Certificado de firma de la aplicación" (App signing key certificate)**.
4.  Copia la **Huella digital SHA-256**.

**CASO 2: Para Pruebas Locales (Opcional pero recomendado)**
Puedes agregar *ambas* huellas (la de producción de Google y la de tu 'upload key' local) para que los links funcionen tanto si instalas desde la tienda como si instalas desde tu cable USB.

**Ejemplo con AMBAS llaves (Producción y Local):**
```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "io.slm.starter",
      "sha256_cert_fingerprints": [
        "PEGAR_AQUI_SHA256_DE_GOOGLE_PLAY_CONSOLE",
        "PEGAR_AQUI_SHA256_DE_TU_PC_LOCAL"
      ]
    }
  }
]
```

*Nota: Es seguro tener ambas. Así podrás probar los deep links mientras desarrollas sin tener que subir a la tienda.*

---

## Verificación
Una vez subidos los archivos:
1.  Visita `https://sionlecheymiel.com/.well-known/apple-app-site-association` en tu navegador. **No** debe descargar el archivo, debe mostrarse (o descargarse si es forzado, pero el servidor debe servirlo como `application/json` o `text/plain`).
2.  Desinstala y reinstala la app en el dispositivo para forzar la re-verificación de los enlaces.
