# Versión Biblica Sion:"Leche y Miel"
Aplicación móvil para consultar y leer la versión bíblica "Sion: Leche y Miel" .

## Para pruebas con Genymotion
ng run app:ionic-cordova-build --platform=android
cordova run android --target=192.168.56.102:5555

### Para generar app
#### Andorid
https://ionicframework.com/docs/v1/guide/publishing.html
ionic cordova build --release android  	//Se genera en platforms/android/build/outputs/apk
#### IOS
ionic cordova build ios --release
cordova emulate ios

### Detalles sobreo certificado y firma de app
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
keytool -genkey -v -keystore sionLecheMiel.keystore -alias sionLecheMiel -keyalg RSA -keysize 2048 -validity 10000
//debug andorid 
keytool -exportcert -keystore ~/.android/debug.keystore -list -v -alias <alias-name>
keytool -exportcert -keystore sionLecheMiel.keystore -list -v -alias sionLecheMielmarkdownlintmarkdownlint

#### Para google play
keytool -genkeypair -alias upload -keyalg RSA -keysize 2048 -validity 9125 -keystore keystore.jks  //generar el keystore para subida 
keytool -export -rfc -alias upload -file upload_certificate.pem -keystore keystore.jks       ///calve publica para google 

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore sionLecheMiel.keystore android-release-unsigned.apk sionLecheMiel
Firmar para google play
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore keystore.jks app-release-unsigned.apk upload

#### Optimización 
/home/asavior/Android/Sdk/build-tools/28.0.3/zipalign -v 4 app-release-unsigned.apk sion-leche-y-miel-1-0-0.apk



### CONFIGURACIÓN DE NODE LUEGO DE INSTALACIÓN

mkdir ~/.npm-global
Configure npm para usar la nueva ruta del directorio:

npm config set prefix '~/.npm-global'
Abra o cree un archivo ~ / .profile  o ~/.bash_profile o ~/.zshrc y  agregue esta línea:
export PATH=~/.npm-global/bin:$PATH

De vuelta en la línea de comandos, actualice las variables de su sistema:
source ~/.profile
source ~/.bash_profile

#### Prueba: descargue un paquete globalmente sin usar sudo.

npm install -g typescript

npm install -g ionic@5.2.3   //Version de ionic que utilice

Version de node v12.14.0
