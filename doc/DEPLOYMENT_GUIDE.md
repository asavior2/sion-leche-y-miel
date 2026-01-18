# Guía de Despliegue y Publicación (Sion: Leche y Miel)

Esta guía detalla los pasos para generar las versiones de producción para **Google Play Store (Android)** y **Apple App Store (iOS)**.

> **Nota:** Este proyecto utiliza **Corvdova**. Asegúrate de tener las herramientas de plataforma instaladas (Android Studio, Xcode).

---

## 1. Preparación General

Antes de compilar, asegúrate de incrementar la versión en `config.xml` y `package.json` para evitar conflictos de subida.

**Archivo:** `config.xml`
```xml
<widget id="io.slm.starter" version="1.2.7" ...> <!-- Incrementar version -->
```

## 2. Android (Google Play)

Google Play ahora requiere **Android App Bundles (.aab)** en lugar de APKs para nuevas aplicaciones o actualizaciones.

### Paso 2.1: Generar Keystore (Solo si no tienes uno)
Si es la primera vez que firmas la app, necesitas un Keystore. **¡Guárdalo en un lugar seguro y no pierdas la contraseña!** Si lo pierdes, no podrás actualizar la app nunca más.

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias sion_alias -keyalg RSA -keysize 2048 -validity 10000
```

### Paso 2.2: Compilar Release (AAB)
Ejecuta el siguiente comando para crear el App Bundle optimizado:

```bash
ionic cordova build android --prod --release -- --packageType=bundle
```

Esto generará el archivo en:
`platforms/android/app/build/outputs/bundle/release/app-release.aab`

### Paso 2.3: Firmar el AAB
Necesitas `jarsigner` (incluido en el JDK).

```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/app/build/outputs/bundle/release/app-release.aab sion_alias
```

> Te pedirá la contraseña que creaste en el paso 2.1.

### Paso 2.4: Subir a Google Play Console
1.  Ve a [Google Play Console](https://play.google.com/console).
2.  Selecciona tu app -> **Producción** (o "Pruebas internas" primero).
3.  Crea una nueva versión.
4.  Sube el archivo `app-release.aab` firmado.
5.  Completa la ficha de la tienda, clasificación de contenido, etc.

---

## 3. iOS (App Store)

Necesitas una Mac con Xcode instalado.

### Paso 3.1: Compilar Proyecto
Genera el proyecto de Xcode desde Ionic:

```bash
ionic cordova build ios --prod --release
```

### Paso 3.2: Configurar en Xcode
1.  Abre el archivo del espacio de trabajo:
    ```bash
    open platforms/ios/Biblia\ SLM.xcworkspace
    ```
2.  En Xcode, selecciona el proyecto (root) en el navegador izquierdo.
3.  Ve a la pestaña **Signing & Capabilities**.
4.  Asegúrate de tener tu **Team** seleccionado (Tu cuenta de Apple Developer).
5.  Verifica que el **Bundle Identifier** coincida con el registrado en Apple Developer (`io.slm.starter`).

### Paso 3.3: Archivar y Subir
1.  Selecciona **Any iOS Device (arm64)** en el selector de dispositivos (arriba a la izquierda).
2.  Ve al menú **Product** -> **Archive**.
3.  Espera a que termine la compilación. Se abrirá la ventana "Organizer".
4.  Haz clic en **Distribute App**.
5.  Selecciona **App Store Connect** -> **Upload**.
6.  Sigue los pasos del asistente (Apple validará tu app).

### Paso 3.4: App Store Connect
1.  Ve a [App Store Connect](https://appstoreconnect.apple.com/).
2.  En "Mis Apps", selecciona tu app.
3.  En "TestFlight", deberías ver la versión procesándose (tarda unos minutos).
4.  Una vez procesada, puedes enviarla a revisión para producción.

---

## 4. Checklist Final antes de Publicar

- [ ] **Iconos y Splash:** ¿Se ven bien en todos los dispositivos?
- [ ] **Permisos:** ¿Pides solo los permisos necesarios? (Revisar `config.xml` y plugins).
- [ ] **URLs:** ¿Las URLs de la API y Audio apuntan a producción (`https`), no a localhost?
- [ ] **Limpieza:** ¿Has quitado los `console.log` innecesarios? (El flag `--prod` ayuda, pero es mejor limpiar).
- [ ] **Testing:** ¿Has probado la versión `release` en un dispositivo físico real? (A veces el modo release falla donde debug funciona por minificación de código).
