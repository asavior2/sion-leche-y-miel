import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import {Zip} from '@ionic-native/zip/ngx';
import {File} from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';

import { AlertController } from '@ionic/angular';



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

  constructor(private router: Router,
              private zip: Zip,
              public file: File,
              private storage: Storage,
              private transfer: FileTransfer,
              private httpClient: HttpClient,
              public alertController: AlertController,
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


    }

   validaUri() {
    if (this.router.url =="/tabs/login" ){
      this.esLogin = true;
      console.log(this.esLogin);
    } else {
      this.esLogin = false;
    }
  }

  validarUpdate() {
    return this.httpClient.get('https://raw.githubusercontent.com/asavior2/sion-leche-y-miel/master/resources/checkUpdate.json');
  }

  async updateSLM() {
    // tslint:disable-next-line: no-trailing-whitespace
    await this.validarUpdate().subscribe(data => {
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
        this.unZip(this.version + '.zip');
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
  async unZip(version: string) {
  /*externalRootDirectory file:///storage/emulated/0/
    dataDirectorio file:///data/user/0/io.slm.starter/files/
    externalDataDirectory file:///storage/emulated/0/Android/data/io.slm.starter/files/*/
    this.zipPath = this.file.externalDataDirectory + version + '.zip';
    console.log(this.zipPath);

    this.file.checkFile(this.zipPath, '').then(_ => {
      this.zip.unzip (this.zipPath,
                      this.file.externalDataDirectory,
                      (progress) =>
                      console.log('Unzipping, ' + Math.round((progress.loaded / progress.total) * 100) + '%')).then((result) => {
                        if (result === 0) {
                          console.log('SUCCESS');
                          this.storage.set('update', version);
                          this.alertUpdate(version);
                      }
                        if (result === -1) { console.log('FAILED'); }
      });
    }).catch(err => console.log('file doesn\'t exist'));


  }

  download(url: string, version: string) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    // const url = 'https://raw.githubusercontent.com/asavior2/sion-leche-y-miel/master/ionic.config.json';
    fileTransfer.download(url, this.file.externalDataDirectory + version).then((entry) => {
      console.log('download complete: ' + entry.toURL());
    }, (error) => console.log(console.error));
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
    if (this.router.url != '/tabs/login') {
      const actionSheet = await this.actionSheetController.create({
        header: 'Opciones',
        mode: 'ios',
        buttons: [
          /*{
            text: 'Desconectarse',
            role: 'destructive',
            icon: 'log-out',
            handler: () => {
              this.onLogout();
            }
          },*/ {
            text: 'Buscar Actualizacion SLM',
            role: 'destructive',
            icon: 'md-sync',
            handler: () => {
              this.updateSLM();
            }
          },
          {
            text: 'Sobre Sion:Leche y Miel (SLM)',
            icon: 'ios-information-circle-outline',
            handler: () => {
              this.router.navigate(['/tabs/tab4']);
            }
          },
          {
            text: 'Contacto',
            icon: 'ios-contact',
            handler: () => {
              this.router.navigate(['/tabs/tab3']);
            }
          },
          {
            text: this.estadoDark + ' modo nocturno',
            icon: 'moon',
            handler: () => {
              this.changeDark();
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
