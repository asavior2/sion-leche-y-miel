import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import {File} from '@ionic-native/file/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { AlertController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
//import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.page.html',
  styleUrls: ['./sobre.page.scss'],
})
export class SobrePage implements OnInit {

  fontSize;
  pathDiviceIosAndroid: string;
  constructor(private storage: Storage,
    public file: File,
    private toastController: ToastController,
    private nativeHTTP: HTTP,
    public platform: Platform,
    //private fileOpener: FileOpener,
    public alertController: AlertController
    ) {
    this.storage.get('fontSize').then((val) => {
      if (val == null || val < 15) {
        this.fontSize = 20;
      } else {
        this.fontSize = val;
      }
    });
   }

  

  ngOnInit() {
    if (this.platform.is("android")){
      this.pathDiviceIosAndroid = this.file.externalRootDirectory + 'Download/'
      console.log("***ANDROID***")
    }else if (this.platform.is("ios")){
      this.pathDiviceIosAndroid = this.file.dataDirectory
      console.log("***IOS***")
    }




  }

  
  descargarLibro(formato){
    let url
    let nombre
    if(formato == 'epub'){
      window.open('http://sionlecheymiel.com/file/ESCLAVOS-DE-REBELION-A-SUBDITOS-DEL-REINO-DE-LOS-CIELOS-Pedro-Rangel.epub', '_self','location=yes');
      //url ='https://sionlecheymiel.com/file/ESCLAVOS-DE-REBELION-A-SUBDITOS-DEL-REINO-DE-LOS-CIELOS-Pedro-Rangel.epub';
      //nombre = 'ESCLAVOS-DE-REBELION-A-SUBDITOS-DEL-REINO-DE-LOS-CIELOS-Pedro-Rangel.epub'
    }else{ //pdf
      window.open('http://sionlecheymiel.com/file/ESCLAVOS-DE-REBELION-A-SUBDITOS-DEL-REINO-DE-LOS-CIELOS-Pedro-Rangel.pdf', '_self','location=yes');
      //url = 'https://sionlecheymiel.com/file/ESCLAVOS-DE-REBELION-A-SUBDITOS-DEL-REINO-DE-LOS-CIELOS-Pedro-Rangel.pdf';
      //nombre = 'ESCLAVOS-DE-REBELION-A-SUBDITOS-DEL-REINO-DE-LOS-CIELOS-Pedro-Rangel.pdf'
    }

    /*const filePath = this.file.externalRootDirectory + nombre; 
    // for iOS use this.file.documentsDirectory
    this.nativeHTTP.downloadFile(url, {}, {}, filePath).then(response => {
      // prints 200
      console.log('Archivo descargado...', response);
    }).catch(err => {
      // prints 403
      console.log('error block file ... ', err.status);
      this.alertErrorDownloadAudio("Ocurrio un problema", err.status +" " + err.error)
    })*/
  }

  /* 
  copyFile(){
    
    this.file.copyFile(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, nombre, ,).then(_=> {
      console.log("Archivo zip eliminado")
    }).catch((err) => {
      console.log("Como que no se pudo eliminar el archivo zip")
      console.log(err)
    });
  }*/

  downloadLibro(url: string,extencion) {
    console.log(url )
    this.presentToast('bottom');
    //documentsDirectory
    const filePath = this.pathDiviceIosAndroid + "ESCLAVOS-DE-REBELION-A-SUBDITOS-DEL-REINO-DE-LOS-CIELOS-Pedro-Rangel." + extencion; 
    // for iOS use this.file.documentsDirectory
    this.nativeHTTP.downloadFile(url, {}, {}, filePath).then(response => {
      console.log('Archivo descargado...', response);   
      this.abrirArchivo(filePath)
      //this.alertDownloadAudio('Archivo descargado', "Archivo descargado, en directorio Descargas")
    }).catch(err => {
      console.log('error block file ... ', err.status);
      this.alertDownloadAudio('Error de descarga', err.status +" " + err.error)
    })
  }

  
  abrirArchivo(filePath){
    /* 
    this.fileOpener.open(filePath, 'application/pdf')
        .then(() => console.log('File is opened'))
        .catch(e => console.log('Error opening file', e));
    this.fileOpener.showOpenWithDialog(filePath, 'application/pdf')
        .then(() => console.log('File is opened'))
        .catch(e => console.log('Error opening file', e));
  */
    }


  async alertDownloadAudio(header: string, statusTextError: string,  ) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      subHeader: statusTextError,
      message: '',
      buttons: ['OK'],
      mode: 'ios'
    });
    await alert.present();
  }

  async presentToast(position: 'top' | 'middle' | 'bottom') {
    const toast = await this.toastController.create({
      message: 'Iniciando descarga del libro...',
      duration: 2500,
      position: position
    });

    await toast.present();
  }


}
