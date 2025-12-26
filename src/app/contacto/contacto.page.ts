import { Component } from '@angular/core';
import { Storage as IonicStorage } from '@ionic/storage-angular';

@Component({
  selector: 'app-contacto',
  templateUrl: 'contacto.page.html',
  styleUrls: ['contacto.page.scss']
})
export class ContactoPage {

  fontSize;

  constructor(private storage: IonicStorage) {
    this.storage.get('fontSize').then((val) => {
      if (val == null) {
        this.fontSize = 22;
      } else {
        this.fontSize = val;
      }
    });
  }


}
