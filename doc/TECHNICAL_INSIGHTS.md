# Insights Técnicos y Mantenimiento (v2.0)

Este documento recopila las soluciones técnicas complejas implementadas en la versión 2.0. Léelo antes de realizar cambios en el motor de lectura o configuración de build.

## 1. Motor de Lectura y Scroll (`lectura.page.ts`)

### El Problema de la "Pantalla Negra" (iOS)
**Síntoma:** Al hacer scroll o cambiar de capítulo, la pantalla quedaba negra o mal renderizada hasta tocarla.
**Causa:** WebKit (iOS) a veces entra en bloqueo de renderizado cuando se manipula el DOM masivamente dentro de `ion-content` sin dar tiempo al reflow.
**Solución:**
*   Se implementó un "Reflow Hack" en `mostrarTextoMetodo`: `document.body.offsetHeight;` (fuerza al navegador a repintar).
*   Se usa `NgZone.run()` para asegurar que Angular detecte los cambios.

### Scroll: Audio vs. Navegación
**Conflicto:** El reproductor de audio y la navegación por concordancia usan la misma función de scroll. Esto causaba que el audio "ensuciara" la variable `this.versiculo`, haciendo que la navegación futura fallara ("Sticky Verse").
**Solución (`scrollToVerse`):**
*   **Modo Audio (`isAudio=true`):** Mueve el scroll pero **NO** toca `this.versiculo` y **NO** usa temporizador de desmarcado (el resaltado es persistente).
*   **Modo Navegación (`isAudio=false`):** Mueve el scroll, resalta por 3 segundos y **LIMPIA** `this.versiculo = null` al finalizar.
*   **Importante:** Nunca usar `scrollIntoView` nativo en móviles. Usar siempre `this.ionContent.scrollToPoint(0, y - offset)`.

## 2. Compatibilidad Android (16KB Page Size)

**Problema:** Dispositivos Android 15 (Pixel 9) requieren alineación de memoria de 16KB.
**Solución:**
*   **Manifest:** `android:extractNativeLibs="true"` en `AndroidManifest.xml`.
*   **Gradle Hook:** Script `scripts/fix_android_page_size.js` que inyecta configuraciones de `jniLibs.useLegacyPackaging`.
*   **Plugin:** Se actualizó `cordova-sqlite-storage` a v7+ para binarios compatibles.

## 3. Deep Links (Enlaces Profundos)

**Arquitectura:**
*   **Web:** Usa `AssetLinks.json` y `apple-app-site-association` en la carpeta `site/.well-known/`.
*   **App:** Monitoriza `ionViewWillEnter` en `LecturaPage` para capturar `queryParams` (libro, capítulo, versículo).
*   **Nota:** La suscripción a queryParams debe limpiarse en `ionViewWillLeave` para evitar disparos múltiples (bug "One-Time").

## 4. Compilación iOS (Simulador)

**Problema:** `ionic cordova build ios` por defecto busca "iPhone 12" y falla si no existe.
**Solución:**
*   Usar script: `sh scripts/build_ios_sim.sh`
*   Este script apunta al UUID específico de tu simulador instalado (actualmente iPhone 15).
*   Para **Producción/TestFlight**: Usar siempre Xcode > Archive (Any iOS Device).

## 5. Diseño y Marca

*   Consultar `doc/BRAND_GUIDE.md` para códigos de color hexadecimales exactos al crear assets de tienda.
