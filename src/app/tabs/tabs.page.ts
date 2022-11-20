import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import {Zip} from '@ionic-native/zip/ngx';
import {File} from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
//import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { JsonPipe } from '@angular/common';
import { Platform } from '@ionic/angular';

import { AlertController } from '@ionic/angular';
import { Console } from 'console';



@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit {
  esLogin: boolean;
  zipPath;
  update;
  version;
  url;
  hash;
  darkMode: boolean = true;
  estadoDark;
  pathDiviceIosAndroid:string;

  constructor(private router: Router,
              private zip: Zip,
              public file: File,
              private storage: Storage,
              //private transfer: FileTransfer,
              private httpClient: HttpClient,
              private nativeHTTP: HTTP,
              public alertController: AlertController,
              public platform: Platform,
              public actionSheetController: ActionSheetController) {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
                this.darkMode = prefersDark.matches;
      
    }
    
    async ngOnInit() {
      this.validaUri();
      /*    Calculo de hach
      async function digestMessage(message) {
        const msgUint8 = new TextEncoder().encode(message);                           // encode as (utf-8) Uint8Array
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);             // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
        return hashHex;
      }
      const digestBuffer = await digestMessage('Asavior2');
      console.log(digestBuffer);
      */
      await this.storage.get('update').then((val) => {
        if (val != null) {
          this.update = val;
        } else {
          this.update = '0';
        }
      });

      if (this.darkMode){
        this.estadoDark = 'Desactivar ';
      } else {
        this.estadoDark = 'Activar ';
      }
      //this.unZip('audio-SLM-calidad-baja.zip','audio')
      //this.download('https://sionlecheymiel.com/file/audios/1/1.mp3','audioD.mp3')

      if (this.platform.is("android")){
        this.pathDiviceIosAndroid = "/files/Documents/"
        console.log("***ANDROID***")
      }else if (this.platform.is("ios")){
        this.pathDiviceIosAndroid = "/Documents/"
        console.log("***IOS***")
      }


    }

   validaUri() {
    if (this.router.url =="/tabs/login" ){
      this.esLogin = true;
      console.log(this.esLogin);
    } else {
      this.esLogin = false;
    }
  }

  validarUpdate(url) {
    return this.httpClient.get(url);
  }

  async updateSLM() {
    // tslint:disable-next-line: no-trailing-whitespace
    await this.validarUpdate('https://raw.githubusercontent.com/asavior2/sion-leche-y-miel/master/resources/checkUpdate.json').subscribe(data => {
      // console.log(data);
      // tslint:disable-next-line: forin
      for (const entry in data) {
        if (entry === 'url') {
          this.url = data[entry];
        } else if (entry === 'version') {
          this.version = data[entry];
        }
      }
      console.log('version: ' + this.version + ' update' + this.update);
      if (this.version !== undefined && this.version !== this.update) {                 // Si es diferente descargar
        console.log('Descargar unZip');
        this.download(this.url, this.version); // Descargar
        this.unZip(this.version + '.zip','update');
      } else {                                                                          // De lo contrario no hay actualizaciones.
        this.alertNoUpdate();
      }
    },
    (err) => {
      // console.log('Error en la descarga' + err.status );
      // console.log(err);
      this.alertError(err.status, err.statusText);

    });
  }

  async downloadAudio(calidad) {
    this.alertDownloadAudio('Descarga en proceso','La descarga quedará en segundo plano, puede seguir utilizando la aplicación')

    // tslint:disable-next-line: no-trailing-whitespace
    let url = ''
    let nombre = ''
    if(calidad == 'alta'){
      url = 'https://sionlecheymiel.com/file/audio-SLM-calidad-alta.zip'
      nombre = "audio-SLM-calidad-alta.zip" 
    }else if (calidad == 'media'){
      url = 'https://sionlecheymiel.com/file/audio-SLM-calidad-media.zip'
      nombre = "audio-SLM-calidad-media.zip" 
    }else{
      url = 'https://sionlecheymiel.com/file/audio-SLM-calidad-baja.zip'
      nombre = "audio-SLM-calidad-baja.zip" 
    }
     
    console.log('Descargar un Zip');
    await this.download(url, nombre); // Descargar
       
  }


  async unZip(nombre: string, deQuien: string) {
  /*externalRootDirectory file:///storage/emulated/0/
    dataDirectorio file:///data/user/0/io.slm.starter/files/
    externalDataDirectory file:///storage/emulated/0/Android/data/io.slm.starter/files/*/
    this.zipPath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid + nombre;
    console.log(this.zipPath);

    this.file.checkFile(this.zipPath, '').then(_ => {
      this.zip.unzip (this.zipPath,
                      this.file.applicationStorageDirectory + this.pathDiviceIosAndroid,
                      (progress) =>
                      console.log('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%')).then((result) => {
                        if (result === 0) {
                          console.log('SUCCESS');
                          if(deQuien == 'audio'){
                            this.alertDownloadAudio('Descarga Completada','Biblia Sion Leche y Miel en audio')
                            this.file.removeFile(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, nombre).then(_=> {
                              console.log("Archivo zip eliminado")
                            }).catch((err) => {
                              console.log("Como que no se pudo eliminar el archivo zip")
                              console.log(err)
                            });

                          }else {
                            this.alertUpdate(nombre);
                          }
                      }
                        if (result === -1) { 
                          console.log('FAILED'); 
                          if(deQuien == 'audio'){
                            this.alertErrorDownloadAudio('Ocuarrio un error', ' :( ')
                          }else {
                            this.alertUpdate(nombre); //aler error descarga
                          }
                        }
      });
    }).catch((err) => {
      this.alertErrorDownloadAudio(err.status, err.statusText)
    });

  }

  async download(url: string, nombre: string) {
    console.log(url + " " + nombre)
    //documentsDirectory
    const filePath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid + nombre; 
    // for iOS use this.file.documentsDirectory
    this.nativeHTTP.downloadFile(url, {}, {}, filePath).then(response => {
      // prints 200
      console.log('Archivo descargado...', response);
      
      this.file.checkDir(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, 'por-Capitulos').then(_ => {
        this.file.removeRecursively(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, 'por-Capitulos').then(_=> {
          console.log("Carpeta por-Capitulos eliminado")
          this.unZip(nombre,'audio'); 
        }).catch((err) => {
          console.log("Como que no se pudo eliminar la carpeta por-Capitulos")
          console.log(err)
        });
      }).catch((err) => {
        console.log("Carpeta por-Capitulo no existe")
        this.unZip(nombre,'audio'); 
      });
      
    }).catch(err => {
      // prints 403
      console.log('error block file ... ', err.status);
      this.alertErrorDownloadAudio("Ocurrio un problema", err.status +" " + err.error)
    })

    /* 
    const fileTransfer: FileTransferObject = this.transfer.create();
    // const url = 'https://raw.githubusercontent.com/asavior2/sion-leche-y-miel/master/ionic.config.json';
    await fileTransfer.download(url, this.file.applicationStorageDirectory + "/files/Documents/" + nombre).then((entry) => { //externalDataDirectory
      console.log('download complete: ' + entry.toURL());
    }, (error) => {
      console.log(console.error)
      console.log("An error has occurred: Code = " + error.code);
      if(error.code == 3){
        this.alertErrorDownloadAudio("Problema con la conexión", "Intentelo nuevamente.")
      }
      console.log("upload error source " + error.source);
      console.log("upload error target " + error.target);
    });
    */
  }


  async alertError(statusError: string, statusTextError: string,  ) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Error',
      subHeader: statusError + ' ' + statusTextError,
      message: '',
      buttons: ['OK'],
      mode: 'ios'
    });
    await alert.present();
  }
  async alertNoUpdate() {
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Resultado de Busqueda',
        subHeader: 'No hay actulizaciones Disponibles para la version SLM',
        message: '',
        buttons: ['OK'],
        mode: 'ios'
      });
      await alert.present();
  }
  async alertUpdate(version: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Actualización completada',
      subHeader: 'Número Actualización SLM ' + '0.0.1',
      message: '',
      buttons: ['OK'],
      mode: 'ios'
    });
    await alert.present();
}

async alertDownloadAudio(header: string, subHeader:string) {
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class',
    header: header,
    subHeader: subHeader,
    message: '',
    buttons: ['OK'],
    mode: 'ios'
  });
  await alert.present();
}

async alertErrorDownloadAudio(statusError: string, statusTextError: string,  ) {
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class',
    header: 'Error de descarga',
    subHeader: statusError + ' ' + statusTextError,
    message: '',
    buttons: ['OK'],
    mode: 'ios'
  });
  await alert.present();
}

  changeDark() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark');
    if (this.darkMode){
      this.estadoDark = 'Desactivar ';
    } else {
      this.estadoDark = 'Activar ';
    }
  }

  async presentActionSheet() {
    if (this.router.url != '/tabs/  ') {
      const actionSheet = await this.actionSheetController.create({
        header: 'Sion:Leche y Miel',
        mode: 'ios',
        buttons: [
          /*{
            text: 'Desconectarse',
            role: 'destructive',
            icon: 'log-out',
            handler: () => {
              this.onLogout();
            }
          }, {
            text: 'Buscar Actualizacion SLM',
            role: 'destructive',
            icon: 'sync',
            handler: () => {
              this.updateSLM();
            }
          },*/
          {
            text: 'Descargar Biblia en audio, en:',
            role: 'destructive',
            icon: 'musical-notes',
          },
          {
            text: 'Alta calidad 1.1GB',
            role: '',
            icon: 'cloud-download',
            handler: () => {
              this.downloadAudio('alta');
            }
          },
          {
            text: 'Media calidad 824MB',
            icon: 'cloud-download',
            handler: () => {
              this.downloadAudio('media');
            }
          },
          {
            text: 'Baja calidad 550MB',
            icon: 'cloud-download',
            handler: () => {
              this.downloadAudio('baja');
            }
          },
          {
            text: this.estadoDark + ' modo nocturno',
            icon: 'moon',
            handler: () => {
              this.changeDark();
            }
          },
          {
            text: 'Contacto',
            icon: 'person-circle-outline',
            handler: () => {
              this.router.navigate(['/tabs/tab3']);
            }
          },
          {
            text: 'Sobre Sion:Leche y Miel(SLM)',
            role: '',
            icon: 'information-circle-outline',
            handler: () => {
              this.router.navigate(['/tabs/tab4']);
            }
          }/*,
          {
            text: 'Contacto',
            icon: 'ios-contact',
            handler: () => {
              this.router.navigate(['/tabs/contacto']);
            }
          }*/
        ]
        });
        await actionSheet.present();
      }
    }

}
