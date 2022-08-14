import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import {File} from '@ionic-native/file/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-sobre',
  templateUrl: './sobre.page.html',
  styleUrls: ['./sobre.page.scss'],
})
export class SobrePage implements OnInit {

  fontSize;
  constructor(private storage: Storage,
    public file: File,
    private nativeHTTP: HTTP,
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

}
