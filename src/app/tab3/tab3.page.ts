import { Component } from '@angular/core';
import { Storage as IonicStorage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

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
